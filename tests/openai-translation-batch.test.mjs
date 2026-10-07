import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  decodeMetadata,
  applyInsightTranslation,
  closeStalePullRequests,
  makePullRequestBody,
  needsTranslationReview,
  getSourceHashFromPullRequestBody,
  getSourceMarker,
  hashText,
  isTranslationPullRequestCurrent,
  replaceLocaleObject,
} from "../scripts/openai-translation-batch.mjs";

test("sourceHashは改行コード差を同じ版として扱う", () => {
  assert.equal(hashText("更新\r\n本文\r\n"), hashText("更新\n本文\n"));
});

test("投入・回収の古いPR整理でもDraftの生成結果をcloseしない", async () => {
  const calls = [];
  await closeStalePullRequests("b".repeat(64), async (pathname, options) => {
    calls.push({ pathname, options });
    if (pathname === "/pulls?state=open&per_page=100")
      return [
        {
          number: 41,
          draft: true,
          body: getSourceMarker("a".repeat(64)),
          head: { ref: "translation/openai/held" },
        },
        {
          number: 42,
          draft: false,
          body: getSourceMarker("a".repeat(64)),
          head: { ref: "translation/openai/stale" },
        },
      ];
    if (pathname === "/pulls/42" && options.method === "PATCH") return {};
    throw new Error("Draft must not be closed");
  });
  assert.equal(calls.length, 2);
  assert.equal(calls[1].pathname, "/pulls/42");
  assert.deepEqual(JSON.parse(calls[1].options.body), { state: "closed" });
});

const insightSource =
  '---\ntitle: "公開手順"\nauthor: gui\ndate: 2026-10-01\nimage: "/images/example.webp"\n---\n管理者が公開するまで下書きは非公開です。\n';
const insightTranslation =
  '---\ntitle: "Publishing"\nauthor: gui\ndate: 2026-10-01\nimage: "/images/example.webp"\n---\nDrafts are public until an administrator hides them.\n';
const insightMetadata = {
  sourcePath: "src/content/insights/example.md",
  locale: "en",
};

test("意味審査が要確認・利用不能でも生成結果を保持してDraft条件にする", async () => {
  for (const status of ["pass", "review", "unavailable"]) {
    const writes = [];
    const result = await applyInsightTranslation(
      insightMetadata,
      { markdown: insightTranslation },
      {
        readSource: () => insightSource,
        writeTranslation: (filePath, content) => {
          writes.push({ filePath, content });
          return true;
        },
        review: async (input) => {
          assert.equal(writes.length, 1);
          assert.equal(input.source, insightSource);
          return { status, reason: "fixture" };
        },
      },
    );
    assert.equal(result.changed, true);
    assert.equal(writes[0].content, insightTranslation);
    assert.equal(needsTranslationReview([result.review]), status !== "pass");
    const body = makePullRequestBody("batch_fixture", "a".repeat(64), [
      result.review,
    ]);
    assert.match(body, /openai-translation-source:aaaaaaaa/u);
    assert.match(body, new RegExp(status));
    assert.equal(body.includes("Draftで保留"), status !== "pass");
  }
  assert.equal(needsTranslationReview([]), false);
  assert.equal(
    needsTranslationReview([{ status: "pass" }, { status: "review" }]),
    true,
  );
  assert.equal(needsTranslationReview([{}]), true);
});

test("保護されたInsight metadata違反は書込み・モデル審査より先に止める", async () => {
  await assert.rejects(
    applyInsightTranslation(
      insightMetadata,
      { markdown: insightTranslation.replace("author: gui", "author: other") },
      {
        readSource: () => insightSource,
        writeTranslation: () => {
          throw new Error("Must not write");
        },
        review: () => {
          throw new Error("Must not call review API");
        },
      },
    ),
    /changed stable author/u,
  );
});

test("変更のないInsight翻訳は追加審査を呼ばない", async () => {
  assert.deepEqual(
    await applyInsightTranslation(
      insightMetadata,
      { markdown: insightTranslation },
      {
        readSource: () => insightSource,
        writeTranslation: () => false,
        review: () => {
          throw new Error("Must not call review API");
        },
      },
    ),
    { changed: false, review: null },
  );
});

test("Batch custom_idはlocaleとsourceHashを復元できる", () => {
  const sourceHash = "a".repeat(64);
  const customId = `acecore-systems:${Buffer.from(
    JSON.stringify({
      version: 1,
      kind: "content",
      locale: "en",
      sourcePath: "src/data/home.json",
      sourceHash,
    }),
  ).toString("base64url")}`;

  assert.deepEqual(decodeMetadata(customId), {
    version: 1,
    kind: "content",
    locale: "en",
    sourcePath: "src/data/home.json",
    sourceHash,
  });
});

test("PRのsourceHashが現在の日本語sourceと異なる場合は古い版として扱う", () => {
  const current = "b".repeat(64);
  const body = `${getSourceMarker("a".repeat(64))}\ntranslation`;

  assert.equal(getSourceHashFromPullRequestBody(body), "a".repeat(64));
  assert.equal(isTranslationPullRequestCurrent(body, current), false);
  assert.equal(
    isTranslationPullRequestCurrent(getSourceMarker(current), current),
    true,
  );
  assert.equal(isTranslationPullRequestCurrent(null, current), false);
  assert.equal(isTranslationPullRequestCurrent("markerなし", current), false);
});

test("UIとフォームのlocale objectは対象localeだけを置き換える", () => {
  const source = [
    "export const copy = {",
    '  ja: { label: "日本語" },',
    '  "zh-cn": { label: "旧翻译" },',
    "};",
  ].join("\n");

  const translated = replaceLocaleObject(source, "zh-cn", {
    label: "新翻译",
  });

  assert.match(translated, /ja: \{ label: "日本語" \}/u);
  assert.match(translated, /"zh-cn": \{\n  "label": "新翻译"\n\}/u);
});

test("WorkflowはLuna/maxをBatchへ投入し、回収後にBot PRを作る", async () => {
  const [submit, collect, script] = await Promise.all([
    readFile(".github/workflows/submit-openai-translation-batch.yml", "utf8"),
    readFile(".github/workflows/collect-openai-translation-batch.yml", "utf8"),
    readFile("scripts/openai-translation-batch.mjs", "utf8"),
  ]);

  assert.match(submit, /sleep 900/u);
  assert.match(submit, /OPENAI_TRANSLATION_API_KEY/u);
  assert.match(submit, /openai-translation-batch\.mjs submit/u);
  assert.match(collect, /translation\/openai\//u);
  assert.match(collect, /actions\/create-github-app-token@v3/u);
  assert.match(
    collect,
    /client-id:\s+\$\{\{ secrets\.TRANSLATION_BOT_CLIENT_ID \}\}/u,
  );
  assert.doesNotMatch(collect, /TRANSLATION_BOT_APP_ID/u);
  assert.doesNotMatch(collect, /^\s+app-id:/mu);
  assert.match(collect, /openai-translation-processed-/u);
  assert.match(collect, /Format collected translation files/u);
  assert.match(collect, /git diff --name-only --diff-filter=ACMRT -z/u);
  assert.match(collect, /npx prettier --write --/u);
  assert.match(script, /gpt-6-luna/u);
  assert.match(script, /reasoning: \{ effort: "max" \}/u);
});
