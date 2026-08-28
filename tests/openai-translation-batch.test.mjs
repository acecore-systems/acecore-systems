import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  decodeMetadata,
  findCompletedPendingBatch,
  getSourceHashFromPullRequestBody,
  getSourceMarker,
  hashText,
  isTranslationPullRequestCurrent,
  parseJsonResponse,
  replaceLocaleObject,
} from "../scripts/openai-translation-batch.mjs";

test("sourceHashは改行コード差を同じ版として扱う", () => {
  assert.equal(hashText("更新\r\n本文\r\n"), hashText("更新\n本文\n"));
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

test("queuedの新しいBatchを飛ばして完了済みBatchを回収する", async () => {
  const requested = [];
  const completed = await findCompletedPendingBatch(
    ["new-queued", "old-completed", "already-processed"],
    new Set(["already-processed"]),
    async ({ request_id: requestId }) => {
      requested.push(requestId);
      return requestId === "old-completed"
        ? { responses: [], status: "complete" }
        : { status: "queued" };
    },
  );

  assert.deepEqual(requested, ["new-queued", "old-completed"]);
  assert.equal(completed?.batchId, "old-completed");
});

test("Batchの部分完了・refusal・複数choiceを翻訳へ適用しない", () => {
  assert.deepEqual(
    parseJsonResponse({
      choices: [
        {
          index: 0,
          finish_reason: "stop",
          message: { content: '{"translated":true}', refusal: null },
        },
      ],
    }),
    { translated: true },
  );
  for (const response of [
    {
      choices: [
        {
          index: 0,
          finish_reason: "length",
          message: { content: '{"partial":true}' },
        },
      ],
    },
    {
      choices: [
        {
          index: 0,
          finish_reason: "stop",
          message: { content: "{}", refusal: "blocked" },
        },
      ],
    },
    { choices: [] },
  ]) {
    assert.throws(() => parseJsonResponse(response));
  }
});

test("WorkflowはGLM 5.3 Flash/highをWorkers AI Batchへ投入し、回収後にBot PRを作る", async () => {
  const [submit, collect, script] = await Promise.all([
    readFile(".github/workflows/submit-openai-translation-batch.yml", "utf8"),
    readFile(".github/workflows/collect-openai-translation-batch.yml", "utf8"),
    readFile("scripts/openai-translation-batch.mjs", "utf8"),
  ]);

  assert.match(submit, /sleep 900/u);
  assert.match(submit, /CLOUDFLARE_WORKERS_AI_API_TOKEN/u);
  assert.match(submit, /CLOUDFLARE_ACCOUNT_ID/u);
  assert.match(submit, /workers-ai-translation-pending-/u);
  assert.match(submit, /openai-translation-batch\.mjs submit/u);
  assert.match(collect, /translation\/workers-ai\//u);
  assert.match(collect, /workers-ai-translation-processed-/u);
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
  assert.match(script, /@cf\/zai-org\/glm-5\.3-flash/u);
  assert.match(script, /BATCH_REASONING_EFFORT = "high"/u);
  assert.match(script, /api\.cloudflare\.com\/client\/v4/u);
  assert.doesNotMatch(script, /api\.openai\.com/u);
});
