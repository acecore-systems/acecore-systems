import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  getSafeInternalUrl,
  getSafeNetworkUrl,
  normalizeNetworkResults,
} from "../src/scripts/search-modal.ts";
import { isStrictUuid } from "../src/scripts/search-response-safety.ts";

const searchModal = await readFile(
  new URL("../src/components/SearchModal.astro", import.meta.url),
  "utf8",
);
const searchScript = await readFile(
  new URL("../src/scripts/search-modal.ts", import.meta.url),
  "utf8",
);

test("Vectorizeの自サイト結果を先に置き、Pagefindをフォールバックに限定する", () => {
  const semanticPosition = searchModal.indexOf("data-semantic-section");
  const pagefindPosition = searchModal.indexOf("data-pagefind-section");
  const networkPosition = searchModal.indexOf("data-network-section");

  assert.ok(semanticPosition >= 0);
  assert.ok(pagefindPosition > semanticPosition);
  assert.ok(networkPosition > pagefindPosition);
  assert.match(searchModal, /Cloudflare Vectorize[\s\S]*サイト内検索/u);
  assert.match(searchModal, /Pagefind \/ フォールバック[\s\S]*キーワード検索/u);

  const semanticSearchPosition = searchScript.indexOf(
    "const semanticOutcome = await runSemanticSearch",
  );
  const fallbackPosition = searchScript.indexOf(
    'if (semanticOutcome !== "results")',
  );
  const pagefindSearchPosition = searchScript.indexOf(
    "await runPagefindSearch",
    fallbackPosition,
  );
  const networkSearchPosition = searchScript.indexOf(
    "void runNetworkSearch",
    pagefindSearchPosition,
  );

  assert.ok(semanticSearchPosition >= 0);
  assert.ok(fallbackPosition > semanticSearchPosition);
  assert.ok(pagefindSearchPosition > fallbackPosition);
  assert.ok(networkSearchPosition > pagefindSearchPosition);
  assert.match(
    searchScript,
    /input\.addEventListener\("input", \(\) => \{[\s\S]*?clearSearchState\(\);[\s\S]*?\}\);/u,
  );
});

test("横断検索はsiteを送らず、厳格に検証した公式HTTPS URLだけを表示する", () => {
  assert.match(
    searchScript,
    /const NETWORK_SEARCH_ENDPOINT = "https:\/\/acecore\.net\/api\/network-search";/u,
  );
  assert.match(
    searchScript,
    /credentials: "omit"[\s\S]*?body: JSON\.stringify\(\{ query, locale: "ja" \}\)/u,
  );
  assert.doesNotMatch(searchScript, /site:\s*["']systems["']/u);
  assert.match(searchScript, /payload\.ok !== true/u);
  assert.match(searchScript, /isStrictUuid\(payload\.requestId\)/u);
  assert.match(searchScript, /function getSafeNetworkUrl/u);
  assert.match(searchScript, /url\.protocol !== "https:"/u);
  assert.match(searchScript, /url\.origin !== expectedOrigin/u);
  assert.match(searchScript, /rawUrl\.includes\("\?"\)/u);
  assert.match(searchScript, /rawUrl\.includes\("#"\)/u);
  assert.match(searchScript, /source === "wiki"/u);
  assert.match(
    searchScript,
    /sourceLabel !== NETWORK_SOURCE_SETTINGS\[result\.source\]\.sourceLabel/u,
  );
  assert.match(searchScript, /link\.target = "_blank"/u);

  const sourceSettings = searchScript.slice(
    searchScript.indexOf("const NETWORK_SOURCE_SETTINGS"),
    searchScript.indexOf("type NetworkSource"),
  );
  assert.doesNotMatch(sourceSettings, /\bsystems\s*:/u);
  assert.match(searchScript, /getSafeInternalPath\(value, origin\)/u);
  assert.match(searchScript, /rank > NETWORK_RESULT_LIMIT/u);
  assert.match(searchScript, /result\.source === "systems"/u);
});

test("横断検索URLはpercent-encoded・multi-encodedのroot管理pathを拒否する", () => {
  for (const [source, url] of [
    ["acecore", "https://acecore.net/%61dmin/"],
    ["schools", "https://schools.acecore.net/%61pi/search"],
    ["world-foundation", "https://world-foundation.acecore.net/%252561dmin/"],
    ["portal", "https://asv.acecore.net/%252561pi/search"],
    ["acecore", "https://acecore.net/%EF%BC%85%36%31dmin/"],
    ["acecore", "https://acecore.net/safe/../services/"],
    ["acecore", "https://acecore.net/safe%252fprivate/"],
    ["acecore", "https://acecore.net/safe\\private/"],
    ["acecore", "https://acecore.net/safe/\tprivate/"],
    ["acecore", "https://acecore.net/safe/\u0001private/"],
  ]) {
    assert.equal(getSafeNetworkUrl(url, source), null, url);
  }

  assert.equal(
    getSafeNetworkUrl(
      "https://world-foundation.acecore.net/admin/",
      "world-foundation",
    ),
    null,
  );
  assert.equal(getSafeNetworkUrl("https://acecore.net/%ZZ", "acecore"), null);
  assert.equal(
    getSafeNetworkUrl("https://acecore.net/%252525252561dmin/", "acecore"),
    null,
  );
});

test("ローカル検索とPagefindのURLは正規化後の公開pathだけを許可する", () => {
  const origin = "https://systems.acecore.net";
  assert.equal(getSafeInternalUrl("/services/", origin), "/services/");

  for (const url of [
    "/admin/",
    "/api/search",
    "/%61dmin/",
    "/%61pi/search",
    "/safe/../services/",
    "/safe/%2e%2e/services/",
    "/safe/%2fprivate/",
    "/safe/%5cprivate/",
    "/safe%252fprivate/",
    "/safe\\private/",
    "\t/services/",
    "/services/\t",
    "/safe/\u0001private/",
    "/services/?query=1",
    "/services/#hash",
    "/%3Fquery",
    "/%23hash",
    "/%EF%BC%85%36%31dmin/",
    "/%EF%BC%85%36%31pi/search",
  ]) {
    assert.equal(getSafeInternalUrl(url, origin), null, url);
  }
});

test("横断検索はrank 1から3だけを許可し、自サイト結果を除外する", () => {
  const requestId = "018f0c49-10a4-4d8e-a1c0-112233445566";
  const result = {
    title: "Acecore",
    section: "概要",
    excerpt: "公開情報",
    url: "https://acecore.net/about/",
    source: "acecore",
    sourceLabel: "Acecore",
    rank: 3,
  };

  assert.deepEqual(
    normalizeNetworkResults({ ok: true, requestId, results: [result] }),
    [result],
  );
  for (const invalidRequestId of [
    ` ${requestId}`,
    `${requestId}\t`,
    requestId.replace(/-/gu, "－"),
  ]) {
    assert.equal(
      normalizeNetworkResults({
        ok: true,
        requestId: invalidRequestId,
        results: [result],
      }),
      null,
    );
  }
  assert.deepEqual(
    normalizeNetworkResults({
      ok: true,
      requestId,
      results: [{ ...result, rank: 4 }],
    }),
    [],
  );
  assert.deepEqual(
    normalizeNetworkResults({
      ok: true,
      requestId,
      results: [
        {
          ...result,
          source: "systems",
          sourceLabel: "Acecore Systems",
          rank: 1,
        },
      ],
    }),
    [],
  );
});

test("requestIdは正規化・trimせず生のUUIDだけを許可する", () => {
  const requestId = "018f0c49-10a4-4d8e-a1c0-112233445566";
  assert.equal(isStrictUuid(requestId), true);

  for (const invalidRequestId of [
    `\t${requestId}`,
    `${requestId} `,
    requestId.replace(/-/gu, "－"),
  ]) {
    assert.equal(isStrictUuid(invalidRequestId), false, invalidRequestId);
  }
});
