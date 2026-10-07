import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { reviewInsightTranslation } from "../scripts/insight-translation-review.mjs";

const input = {
  source: "管理者が公開するまで下書きは非公開です。",
  translation: "Drafts remain private until an administrator publishes them.",
  locale: "en",
};
const apiKey = "fixture-secret-not-to-be-logged";
const answer = (choice) => ({
  answers: [{ name: "translation_acceptance", type: "choice", choice }],
});

test("意味審査は専用endpointへ有限選択を送り、本文や任意JSONを生成しない", async () => {
  const requests = [];
  const result = await reviewInsightTranslation(input, {
    apiKey,
    fetchImpl: async (url, options) => {
      requests.push({ url, options });
      return Response.json(answer("accept"));
    },
  });
  assert.deepEqual(result, { status: "pass", reason: "faithful" });
  assert.equal(requests.length, 1);
  assert.equal(requests[0].url, "https://api.openai.com/v1/decisions");
  assert.equal(requests[0].options.method, "POST");
  assert.ok(requests[0].options.signal instanceof AbortSignal);
  const body = JSON.parse(requests[0].options.body);
  assert.equal(body.model, "gpt-6-luna");
  assert.deepEqual(JSON.parse(body.input), {
    source: input.source,
    translation: input.translation,
    targetLocale: "en",
  });
  assert.equal(body.questions.length, 1);
  assert.deepEqual(
    body.questions[0].choices.map(({ value }) => value),
    ["accept", "review"],
  );
  assert.doesNotMatch(
    requests[0].options.body,
    /fixture-secret-not-to-be-logged/u,
  );
});

test("意味に問題がある判定は人の確認へ渡す", async () => {
  assert.deepEqual(
    await reviewInsightTranslation(input, {
      apiKey,
      fetchImpl: async () => Response.json(answer("review")),
    }),
    { status: "review", reason: "meaning_review" },
  );
});

for (const [name, payload] of [
  ["回答なし", {}],
  ["空配列", { answers: [] }],
  [
    "回答重複",
    { answers: [...answer("accept").answers, ...answer("review").answers] },
  ],
  ["拒否", { answers: [{ name: "translation_acceptance", type: "refusal" }] }],
  ["未知の選択", answer("publish")],
  [
    "違う設問",
    { answers: [{ name: "other", type: "choice", choice: "accept" }] },
  ],
  [
    "違う型",
    {
      answers: [
        { name: "translation_acceptance", type: "predicate", choice: "accept" },
      ],
    },
  ],
  ["不正JSON", "not-json"],
  ["応答上限超過", "x".repeat(64_001)],
]) {
  test(`${name}を合格として扱わない`, async () => {
    let calls = 0;
    const result = await reviewInsightTranslation(input, {
      apiKey,
      fetchImpl: async () => {
        calls++;
        return typeof payload === "string"
          ? new Response(payload)
          : Response.json(payload);
      },
    });
    assert.deepEqual(result, {
      status: "unavailable",
      reason: "invalid_response",
    });
    assert.equal(calls, 1);
  });
}

test("HTTPエラーや通信失敗は情報を漏らさず保留し、別の生成APIへfallbackしない", async () => {
  for (const fetchImpl of [
    async () => new Response(apiKey, { status: 503 }),
    async () => {
      throw new Error(`provider error ${apiKey}`);
    },
  ]) {
    assert.deepEqual(
      await reviewInsightTranslation(input, { apiKey, fetchImpl }),
      { status: "unavailable", reason: "api_unavailable" },
    );
  }
});

test("不正入力・対象外言語・過大入力・キーなしは送信しない", async () => {
  const fetchImpl = async () => {
    throw new Error("Must not send a request");
  };
  for (const candidate of [
    { ...input, source: " " },
    { ...input, translation: null },
    { ...input, locale: "ja" },
  ]) {
    assert.deepEqual(
      await reviewInsightTranslation(candidate, { apiKey, fetchImpl }),
      { status: "unavailable", reason: "invalid_input" },
    );
  }
  assert.deepEqual(
    await reviewInsightTranslation(
      { ...input, source: "x".repeat(48_001) },
      { apiKey, fetchImpl },
    ),
    { status: "unavailable", reason: "input_limit" },
  );
  assert.deepEqual(
    await reviewInsightTranslation(input, { apiKey: " ", fetchImpl }),
    { status: "unavailable", reason: "api_unavailable" },
  );
});

test("実モデル評価例は8言語の正訳・否定反転・条件脱落を含む独立ラベルを持つ", async () => {
  const fixtures = JSON.parse(
    await readFile(
      new URL("./fixtures/insight-translation-review.json", import.meta.url),
      "utf8",
    ),
  );
  assert.equal(new Set(fixtures.map(({ id }) => id)).size, fixtures.length);
  for (const locale of ["en", "zh-cn", "es", "pt", "fr", "ko", "de", "ru"]) {
    const cases = fixtures.filter((fixture) => fixture.locale === locale);
    assert.ok(cases.some(({ expected }) => expected === "pass"));
    assert.ok(cases.some(({ expected }) => expected === "review"));
  }
  assert.ok(
    fixtures.every(
      ({ source, translation, expected }) =>
        typeof source === "string" &&
        source.trim() &&
        typeof translation === "string" &&
        translation.trim() &&
        ["pass", "review"].includes(expected),
    ),
  );
});
