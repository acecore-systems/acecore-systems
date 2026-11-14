import assert from "node:assert/strict";
import { readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import {
  createInsightRequest,
  createBatch,
  decodeMetadata,
} from "./openai-translation-batch.mjs";
import {
  calculateTranslationSourceHash,
  translatedLocales,
} from "./i18n-source-hash.mjs";
import {
  loadPending,
  hashText,
  pendingSourceOverrides,
} from "./stage-seo-translation.mjs";

const config = Object.freeze({
  repo: "acecore-systems/acecore-systems",
  branch: "refs/heads/codex/seo-article-batch-20261114",
  sourceCommit: "022dafb3b8f1bdfec68a2cb501d6eee2697c8649",
  source: "src/content/insights/astro-i18n-blog-translation.md",
  articleHash:
    "96ac1ae6255d853d737d39f41440ac084a2e8290e4b616cd98c81fd53298adfa",
  sourceHash:
    "1c5558eb6049330f86d8cd800b863a8a7a11fbbe72c94e4db4efd8d07a86a8b5",
  artifact: "seo-article-eight-locale-batch-intent-20261114-v1",
});
const locales = ["en", "zh-cn", "es", "pt", "fr", "ko", "de", "ru"];
const active = new Set([
  "validating",
  "in_progress",
  "finalizing",
  "cancelling",
]);
const terminal = new Set(["completed", "failed", "expired", "cancelled"]);
const idPattern = /^batch_[A-Za-z0-9_-]{1,100}$/u;

function buildRequests(root) {
  assert.deepEqual(translatedLocales, locales);
  const source = readFileSync(join(root, config.source), "utf8");
  assert.equal(hashText(source), config.articleHash, "article hash mismatch");
  assert.equal(
    calculateTranslationSourceHash(root),
    config.sourceHash,
    "source hash mismatch",
  );
  const pending = loadPending(root)[config.source];
  assert.ok(
    pending && pending.sourceHash === config.articleHash,
    "pending article missing",
  );
  for (const locale of locales) {
    const file = config.source.replace(/\/([^/]+)$/u, `/${locale}/$1`);
    assert.equal(
      hashText(readFileSync(join(root, file), "utf8")),
      pending.translations[locale],
      "translation changed",
    );
  }
  assert.equal(
    pendingSourceOverrides(root).get(config.source),
    pending.previousSource,
    "pending baseline mismatch",
  );
  return locales.map((locale) =>
    createInsightRequest(
      {
        version: 1,
        kind: "insight",
        locale,
        sourcePath: config.source,
        sourceHash: config.sourceHash,
      },
      source,
    ),
  );
}

function classifyInput(batch, rows) {
  assert.ok(Array.isArray(rows) && rows.length > 0, "empty batch input");
  assert.ok(
    active.has(batch.status) || terminal.has(batch.status),
    "unknown batch status",
  );
  const ids = rows.map((row) => decodeMetadata(row.custom_id));
  assert.ok(
    ids.every((m) => m.sourceHash === config.sourceHash),
    "batch input source mismatch",
  );
  const matching = ids.filter(
    (m) =>
      m.kind === "insight" &&
      m.sourcePath === config.source &&
      locales.includes(m.locale),
  );
  const overlap = [...new Set(matching.map((m) => m.locale))].sort();
  assert.equal(overlap.length, matching.length, "duplicate identities");
  return {
    classification: overlap.length ? "overlap" : "other_scope",
    overlap,
  };
}
let stage = "initialization";

async function safeFetch(url, options = {}) {
  let response;
  try {
    response = await fetch(url, {
      ...options,
      redirect: "error",
      signal: AbortSignal.timeout(30000),
    });
  } catch {
    throw new Error("Remote verification failed");
  }
  if (!response.ok) {
    const error = new Error("Remote verification failed");
    error.httpStatus = response.status;
    throw error;
  }
  return response;
}
const gh = async (path) =>
  (
    await safeFetch(`https://api.github.com/repos/${config.repo}${path}`, {
      headers: {
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        Accept: "application/vnd.github+json",
      },
    })
  ).json();
const ai = async (path) =>
  safeFetch(`https://api.openai.com/v1${path}`, {
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_TRANSLATION_API_KEY}`,
    },
  });
async function verifyMain() {
  const main = await gh("/git/ref/heads/main");
  assert.equal(main?.object?.sha, config.sourceCommit, "main changed");
}
async function artifacts() {
  const all = [];
  const seen = new Set();
  for (let page = 1; page <= 100; page++) {
    const data = await gh(
      `/actions/artifacts?name=${encodeURIComponent(config.artifact)}&per_page=100&page=${page}`,
    );
    assert.ok(Array.isArray(data?.artifacts), "artifact list invalid");
    for (const item of data.artifacts)
      if (item.name === config.artifact) all.push(item);
    if (data.artifacts.length < 100) return all;
    const fingerprint = JSON.stringify(data.artifacts.map((item) => item.id));
    assert.ok(!seen.has(fingerprint), "artifact pagination repeated");
    seen.add(fingerprint);
  }
  throw new Error("artifact pagination limit");
}
async function verifyBatches() {
  let after = "";
  const seen = new Set();
  for (let page = 0; page < 100; page++) {
    const listing = await (
      await ai(
        `/batches?limit=100${after ? `&after=${encodeURIComponent(after)}` : ""}`,
      )
    ).json();
    assert.ok(
      Array.isArray(listing?.data) && typeof listing.has_more === "boolean",
      "batch list invalid",
    );
    for (const batch of listing.data) {
      if (
        batch?.metadata?.translation_system !== "acecore-systems-v1" ||
        batch.metadata.repository !== config.repo ||
        batch.metadata.source_hash !== config.sourceHash
      )
        continue;
      assert.ok(
        idPattern.test(batch.id) &&
          /^file[-_][A-Za-z0-9_-]{1,100}$/u.test(batch.input_file_id ?? ""),
        "batch metadata invalid",
      );
      const text = await (
        await ai(`/files/${encodeURIComponent(batch.input_file_id)}/content`)
      ).text();
      const rows = text
        .split(/\r?\n/u)
        .filter(Boolean)
        .map((line) => JSON.parse(line));
      assert.ok(
        Number.isSafeInteger(batch.request_counts?.total) &&
          (batch.request_counts.total === rows.length ||
            (active.has(batch.status) && batch.request_counts.total === 0)),
        "batch input count mismatch",
      );
      const { classification, overlap } = classifyInput(batch, rows);
      if (classification !== "other_scope") {
        console.log(
          JSON.stringify({
            existingBatch: batch.id,
            status: batch.status,
            createdAt: batch.created_at,
            classification,
            overlap,
          }),
        );
        throw new Error("Potential duplicate or active batch; no submission");
      }
    }
    if (!listing.has_more) return;
    after = listing.last_id ?? listing.data.at(-1)?.id;
    assert.ok(
      idPattern.test(after ?? "") && !seen.has(after),
      "batch pagination invalid",
    );
    seen.add(after);
  }
  throw new Error("batch pagination limit");
}
function verifyEnvironment() {
  assert.equal(process.env.GITHUB_REPOSITORY, config.repo);
  assert.equal(process.env.GITHUB_REF, config.branch);
  assert.equal(process.env.GITHUB_EVENT_NAME, "workflow_dispatch");
  assert.equal(process.env.GITHUB_RUN_ATTEMPT, "1");
  assert.match(process.env.GITHUB_RUN_ID ?? "", /^\d+$/u);
  assert.ok(
    process.env.GITHUB_TOKEN && process.env.OPENAI_TRANSLATION_API_KEY,
    "credentials unavailable",
  );
}
async function main() {
  const mode = process.argv[2];
  const root = resolve(process.argv[3] ?? ".");
  const requests = buildRequests(root);
  assert.equal(requests.length, 8);
  assert.deepEqual(
    requests.map((r) => decodeMetadata(r.custom_id).locale),
    locales,
  );
  if (mode === "dry-run") {
    console.log(
      JSON.stringify({
        mode,
        source: config.source,
        articleHash: config.articleHash,
        sourceHash: config.sourceHash,
        count: requests.length,
        locales,
        identities: requests.map((r) => decodeMetadata(r.custom_id)),
      }),
    );
    return;
  }
  if (mode === "self-test") {
    const rows = requests.map((r) => ({ custom_id: r.custom_id }));
    const other = {
      custom_id: createInsightRequest(
        {
          version: 1,
          kind: "insight",
          locale: "en",
          sourcePath: "src/content/insights/other.md",
          sourceHash: config.sourceHash,
        },
        "fixture",
      ).custom_id,
    };
    assert.equal(
      classifyInput({ status: "completed" }, rows).overlap.length,
      8,
    );
    assert.equal(
      classifyInput({ status: "completed" }, rows.slice(0, 7)).overlap.length,
      7,
    );
    assert.equal(
      classifyInput({ status: "completed" }, [...rows, other]).overlap.length,
      8,
    );
    assert.equal(
      classifyInput({ status: "in_progress" }, [other]).classification,
      "other_scope",
    );
    assert.equal(
      classifyInput({ status: "in_progress" }, rows.slice(0, 1)).overlap.length,
      1,
    );
    assert.throws(() =>
      classifyInput({ status: "completed" }, [...rows, rows[0]]),
    );
    assert.throws(() => classifyInput({ status: "unknown" }, rows));
    const realFetch = globalThis.fetch;
    const originalKey = process.env.OPENAI_TRANSLATION_API_KEY;
    process.env.OPENAI_TRANSLATION_API_KEY = "offline-fixture";
    try {
      globalThis.fetch = async (_url, init) => {
        assert.notEqual(init?.method, "POST");
        return new Response("sensitive body must not be logged", {
          status: 401,
        });
      };
      await assert.rejects(verifyBatches(), { httpStatus: 401 });
      globalThis.fetch = async () => new Response("not JSON", { status: 200 });
      await assert.rejects(verifyBatches());
      const batch = {
        id: "batch_fixture",
        status: "completed",
        input_file_id: "file_fixture",
        request_counts: { total: 8 },
        metadata: {
          translation_system: "acecore-systems-v1",
          repository: config.repo,
          source_hash: config.sourceHash,
        },
      };
      globalThis.fetch = async (url, init) => {
        assert.notEqual(init?.method, "POST");
        if (String(url).includes("/batches?"))
          return Response.json({ data: [batch], has_more: false });
        return new Response(rows.map((row) => JSON.stringify(row)).join("\n"));
      };
      await assert.rejects(verifyBatches(), /Potential duplicate/);
      batch.status = "in_progress";
      await assert.rejects(verifyBatches(), /Potential duplicate/);
      batch.request_counts.total = 0;
      globalThis.fetch = async (url) =>
        String(url).includes("/batches?")
          ? Response.json({ data: [batch], has_more: false })
          : new Response(JSON.stringify(other));
      await verifyBatches();
      globalThis.fetch = async (url) =>
        String(url).includes("/batches?")
          ? Response.json({ data: [batch], has_more: false })
          : new Response(JSON.stringify(rows[0]));
      await assert.rejects(verifyBatches(), /Potential duplicate/);
    } finally {
      globalThis.fetch = realFetch;
      if (originalKey === undefined)
        delete process.env.OPENAI_TRANSLATION_API_KEY;
      else process.env.OPENAI_TRANSLATION_API_KEY = originalKey;
    }
    console.log("offline guard tests passed");
    return;
  }
  assert.ok(mode === "prepare" || mode === "submit", "invalid mode");
  verifyEnvironment();
  stage = "main_verification";
  await verifyMain();
  stage = "intent_lookup";
  const previous = await artifacts();
  if (mode === "prepare") {
    stage = "batch_lookup";
    await verifyBatches();
    stage = "intent_creation";
    assert.equal(previous.length, 0, "prior intent exists; no submission");
    writeFileSync(
      process.env.INTENT_PATH,
      JSON.stringify({
        version: 1,
        sourceHash: config.sourceHash,
        articleHash: config.articleHash,
        sourceCommit: config.sourceCommit,
        runId: process.env.GITHUB_RUN_ID,
        scope: config.source,
        locales,
      }) + "\n",
      { flag: "wx" },
    );
    return;
  }
  assert.equal(
    process.env.INTENT_UPLOADED,
    "success",
    "intent upload not confirmed",
  );
  assert.equal(previous.length, 1, "intent state ambiguous");
  assert.equal(
    String(previous[0]?.workflow_run?.id),
    process.env.GITHUB_RUN_ID,
    "intent does not belong to this run",
  );
  const intent = JSON.parse(readFileSync(process.env.INTENT_PATH, "utf8"));
  assert.equal(intent.runId, process.env.GITHUB_RUN_ID);
  assert.equal(intent.sourceHash, config.sourceHash);
  assert.equal(intent.articleHash, config.articleHash);
  stage = "batch_lookup";
  await verifyBatches();
  stage = "main_verification";
  await verifyMain();
  const body = new FormData();
  body.set("purpose", "batch");
  body.set(
    "file",
    new Blob([requests.map((r) => JSON.stringify(r)).join("\n") + "\n"], {
      type: "application/jsonl",
    }),
    "translation.jsonl",
  );
  stage = "file_upload";
  const file = await (
    await safeFetch("https://api.openai.com/v1/files", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_TRANSLATION_API_KEY}`,
      },
      body,
    })
  ).json();
  assert.match(file?.id ?? "", /^file[-_][A-Za-z0-9_-]{1,100}$/u);
  console.log(
    JSON.stringify({ event: "input_file_accepted", fileId: file.id }),
  );
  stage = "batch_create";
  let batch;
  try {
    batch = await createBatch(file.id, config.sourceHash, config.sourceCommit, {
      article_slug: "astro-i18n-blog-translation",
      article_hash: config.articleHash,
    });
  } catch (cause) {
    const error = new Error("Batch POST outcome unconfirmed; do not retry");
    const match = /^OpenAI API POST \/batches failed: (\d{3}) /u.exec(
      String(cause?.message ?? ""),
    );
    if (match) error.httpStatus = Number(match[1]);
    throw error;
  }
  assert.ok(
    idPattern.test(batch?.id ?? ""),
    "Batch receipt invalid; do not retry",
  );
  console.log(
    JSON.stringify({
      event: "batch_post_accepted",
      batchId: batch.id,
      fileId: file.id,
    }),
  );
  stage = "batch_receipt_verification";
  const verified = await (
    await ai(`/batches/${encodeURIComponent(batch.id)}`)
  ).json();
  assert.equal(verified.id, batch.id);
  assert.equal(verified.input_file_id, file.id);
  assert.equal(verified.metadata?.source_hash, config.sourceHash);
  assert.equal(verified.metadata?.repository, config.repo);
  assert.equal(verified.metadata?.translation_system, "acecore-systems-v1");
  assert.equal(verified.metadata?.article_slug, "astro-i18n-blog-translation");
  assert.equal(verified.metadata?.article_hash, config.articleHash);
  assert.ok(
    Number.isSafeInteger(verified.created_at) && verified.created_at > 0,
  );
  assert.ok(active.has(verified.status) || terminal.has(verified.status));
  const requestCounts = verified.request_counts;
  assert.ok(
    requestCounts &&
      ["total", "completed", "failed"].every(
        (key) =>
          Number.isSafeInteger(requestCounts[key]) && requestCounts[key] >= 0,
      ),
  );
  console.log(
    JSON.stringify({
      event: "batch_verified",
      batchId: verified.id,
      createdAt: verified.created_at,
      status: verified.status,
      requestCounts: {
        total: requestCounts.total,
        completed: requestCounts.completed,
        failed: requestCounts.failed,
      },
    }),
  );
}
main().catch((error) => {
  const httpStatus =
    Number.isInteger(error?.httpStatus) &&
    error.httpStatus >= 100 &&
    error.httpStatus <= 599
      ? error.httpStatus
      : undefined;
  console.error(
    JSON.stringify({
      error: "preparation_or_verification_failed",
      stage,
      httpStatus,
    }),
  );
  process.exitCode = 1;
});
