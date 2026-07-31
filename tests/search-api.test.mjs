import assert from "node:assert/strict";
import { test } from "node:test";

import { onRequestPost } from "../functions/api/search.ts";

const SITE_ORIGIN = "https://systems.acecore.net";
const CLIENT_ID = "018f7e5a-7b4d-7c6a-8e9f-0123456789ab";
const queryVector = Array.from({ length: 1536 }, () => 0.01);
const originalFetch = globalThis.fetch;

test.after(() => {
  globalThis.fetch = originalFetch;
});

test("同一originの日本語検索をja namespaceで実行し、公開URLだけを返す", async () => {
  let aiInput;
  let aiOptions;
  let queryOptions;
  const env = createEnv({
    matches: [
      searchMatch("one", 0.81, "/services/../services/", "ja"),
      searchMatch("duplicate-url", 0.8, "/services/", "ja"),
      searchMatch("query-url", 0.79, "/support/?from=search", "ja"),
      searchMatch("hash-url", 0.78, "/about/#profile", "ja"),
      searchMatch("api-url", 0.77, "/api/private/", "ja"),
      searchMatch("admin-url", 0.76, "/admin/", "ja"),
      searchMatch(
        "encoded-admin-url",
        0.75,
        "/%2525252e%2525252e%2525252fadmin/",
        "ja",
      ),
      searchMatch("cross-origin", 0.74, "https://example.com/", "ja"),
      searchMatch("wrong-locale", 0.73, "/company/", "en"),
      searchMatch("two", 0.72, "/support/", "ja"),
      searchMatch("three", 0.71, "/about/", "ja"),
      searchMatch("four", 0.7, "/company/", "ja"),
      searchMatch("five", 0.69, "/contact/", "ja"),
      searchMatch("six", 0.68, "/privacy/", "ja"),
      searchMatch("too-low", 0.49, "/terms/", "ja"),
    ],
    onAiRun(_url, init) {
      aiInput = JSON.parse(init.body);
      aiOptions = init;
    },
    onQuery(_values, options) {
      queryOptions = options;
    },
  });

  const response = await onRequestPost({
    request: searchRequest({
      query: "  Webサイトの   運用相談  ",
      locale: "JA",
    }),
    env,
  });
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(response.headers.get("Cache-Control"), "no-store");
  assert.equal(
    response.headers.get("Cross-Origin-Resource-Policy"),
    "same-origin",
  );
  assert.equal(response.headers.get("Referrer-Policy"), "no-referrer");
  assert.equal(response.headers.get("X-Content-Type-Options"), "nosniff");
  assert.equal(response.headers.get("X-Frame-Options"), "DENY");
  assert.match(response.headers.get("Server-Timing"), /^search;dur=/);
  assert.equal(body.ok, true);
  assert.equal(body.results.length, 5);
  assert.deepEqual(
    body.results.map(({ id, url, rank }) => ({ id, url, rank })),
    [
      { id: "one", url: "/services/", rank: 1 },
      { id: "two", url: "/support/", rank: 2 },
      { id: "three", url: "/about/", rank: 3 },
      { id: "four", url: "/company/", rank: 4 },
      { id: "five", url: "/contact/", rank: 5 },
    ],
  );
  assert.deepEqual(aiInput, {
    model: "text-embedding-3-large",
    input: ["Webサイトの 運用相談"],
    dimensions: 1536,
    encoding_format: "float",
  });
  assert.equal(aiOptions.signal instanceof AbortSignal, true);
  assert.deepEqual(queryOptions, {
    namespace: "ja",
    topK: 15,
    returnMetadata: "all",
    returnValues: false,
  });
});

test("Originなし・別OriginのrequestをOpenAIの前で403にする", async () => {
  let aiCalls = 0;
  const env = createEnv({
    onAiRun() {
      aiCalls += 1;
    },
  });
  const noOrigin = new Request(`${SITE_ORIGIN}/api/search`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: "検索", locale: "ja" }),
  });
  const crossOrigin = searchRequest(
    { query: "検索", locale: "ja" },
    { Origin: "https://example.com" },
  );

  await assertError(
    onRequestPost({ request: noOrigin, env }),
    403,
    "forbidden",
  );
  await assertError(
    onRequestPost({ request: crossOrigin, env }),
    403,
    "forbidden",
  );
  assert.equal(aiCalls, 0);
});

test("JSON以外を415、kill switchとbinding不足を503にする", async () => {
  const invalidType = searchRequest(
    { query: "検索", locale: "ja" },
    { "Content-Type": "application/jsonp" },
  );
  await assertError(
    onRequestPost({ request: invalidType, env: createEnv() }),
    415,
    "unsupported_media_type",
  );

  const disabledEnv = createEnv();
  disabledEnv.SEARCH_ENABLED = "false";
  await assertError(
    onRequestPost({
      request: searchRequest({ query: "検索", locale: "ja" }),
      env: disabledEnv,
    }),
    503,
    "unavailable",
  );

  const missingBindingEnv = createEnv();
  delete missingBindingEnv.SEARCH_INDEX;
  await assertError(
    onRequestPost({
      request: searchRequest({ query: "検索", locale: "ja" }),
      env: missingBindingEnv,
    }),
    503,
    "unavailable",
  );
});

test("不正JSON、object以外、query長、日本語以外のlocaleを400にする", async () => {
  const invalidJson = new Request(`${SITE_ORIGIN}/api/search`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      Origin: SITE_ORIGIN,
    },
    body: "{",
  });
  await assertError(
    onRequestPost({ request: invalidJson, env: createEnv() }),
    400,
    "invalid_json",
  );

  for (const body of [
    null,
    "search",
    { query: "a", locale: "ja" },
    { query: "a".repeat(161), locale: "ja" },
    { query: "search", locale: "en" },
    { query: "search" },
    { query: "\ud800x", locale: "ja" },
  ]) {
    await assertError(
      onRequestPost({ request: searchRequest(body), env: createEnv() }),
      400,
      "invalid_request",
    );
  }
});

test("検証できないrequestはD1 rate-limit枠を消費しない", async () => {
  const consumed = [];
  const env = createEnv({
    onRateLimit(entry) {
      consumed.push(entry);
    },
  });
  const invalidJson = new Request(`${SITE_ORIGIN}/api/search`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: SITE_ORIGIN,
    },
    body: "{",
  });

  await assertError(
    onRequestPost({ request: invalidJson, env }),
    400,
    "invalid_json",
  );
  await assertError(
    onRequestPost({
      request: searchRequest({ query: "search", locale: "en" }),
      env,
    }),
    400,
    "invalid_request",
  );

  assert.deepEqual(consumed, []);
});

test("Content-Lengthが2KiBを超えるbodyを読まず413にする", async () => {
  const request = new Request(`${SITE_ORIGIN}/api/search`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": "2049",
      Origin: SITE_ORIGIN,
    },
    body: JSON.stringify({ query: "検索", locale: "ja" }),
  });

  await assertError(
    onRequestPost({ request, env: createEnv() }),
    413,
    "request_too_large",
  );
  assert.equal(request.bodyUsed, false);
});

test("Content-Lengthなしでも2KiBを超えた時点でstreamを止める", async () => {
  let pulls = 0;
  const chunk = new Uint8Array(1024);
  const body = new ReadableStream({
    pull(controller) {
      pulls += 1;
      controller.enqueue(chunk);
      if (pulls >= 10) controller.close();
    },
  });
  const request = new Request(`${SITE_ORIGIN}/api/search`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: SITE_ORIGIN,
    },
    body,
    duplex: "half",
  });

  await assertError(
    onRequestPost({ request, env: createEnv() }),
    413,
    "request_too_large",
  );
  assert.ok(pulls <= 4);
});

test("client 20/minを先に、global 300/minを次にD1へ渡す", async () => {
  const consumed = [];
  const env = createEnv({
    onRateLimit(entry) {
      consumed.push(entry);
    },
  });

  const response = await onRequestPost({
    request: searchRequest({ query: "サイト運用", locale: "ja" }),
    env,
  });

  assert.equal(response.status, 200);
  assert.equal(consumed.length, 2);
  assert.match(consumed[0].key, /^client:[0-9a-f]{64}$/);
  assert.equal(consumed[0].limit, 20);
  assert.equal(consumed[1].key, "global");
  assert.equal(consumed[1].limit, 300);
});

test("client拒否後はglobal枠を消費せず429を返す", async () => {
  const consumed = [];
  const env = createEnv({
    clientRateLimitSuccess: false,
    onRateLimit(entry) {
      consumed.push(entry);
    },
  });

  await assertError(
    onRequestPost({
      request: searchRequest({ query: "サイト運用", locale: "ja" }),
      env,
    }),
    429,
    "rate_limited",
    { "Retry-After": "60" },
  );

  assert.equal(consumed.length, 1);
  assert.match(consumed[0].key, /^client:[0-9a-f]{64}$/);
  assert.equal(consumed[0].limit, 20);
});

test("global拒否を429、D1障害を503としてfail closedにする", async () => {
  const globalEnv = createEnv({ globalRateLimitSuccess: false });
  await assertError(
    onRequestPost({
      request: searchRequest({ query: "サイト運用", locale: "ja" }),
      env: globalEnv,
    }),
    429,
    "rate_limited",
  );

  const storageEnv = createEnv({ rateLimitError: new Error("D1 down") });
  await assertError(
    onRequestPost({
      request: searchRequest({ query: "サイト運用", locale: "ja" }),
      env: storageEnv,
    }),
    503,
    "unavailable",
  );
});

test("Cloudflare接続IPをhashしたclient keyを自己申告UUIDより優先する", async () => {
  const firstKeys = [];
  const firstRequest = searchRequest({ query: "サイト運用", locale: "ja" });
  firstRequest.headers.set("CF-Connecting-IP", "203.0.113.9");
  await onRequestPost({
    request: firstRequest,
    env: createEnv({
      onRateLimit({ key }) {
        if (key !== "global") firstKeys.push(key);
      },
    }),
  });

  const secondKeys = [];
  const secondRequest = searchRequest({ query: "サイト運用", locale: "ja" });
  secondRequest.headers.set("CF-Connecting-IP", "198.51.100.4");
  await onRequestPost({
    request: secondRequest,
    env: createEnv({
      onRateLimit({ key }) {
        if (key !== "global") secondKeys.push(key);
      },
    }),
  });

  assert.equal(firstKeys.length, 1);
  assert.equal(secondKeys.length, 1);
  assert.match(firstKeys[0], /^client:[0-9a-f]{64}$/);
  assert.notEqual(firstKeys[0], secondKeys[0]);
  assert.doesNotMatch(firstKeys[0], /203\.0\.113\.9/);
  assert.doesNotMatch(secondKeys[0], /198\.51\.100\.4/);
});

test("request中止をOpenAIへ伝播し、Vectorizeを呼ばない", async () => {
  const controller = new AbortController();
  let aiSignal;
  let vectorCalls = 0;
  const env = createEnv({
    onAiRun(_url, init) {
      aiSignal = init.signal;
      controller.abort();
    },
    onQuery() {
      vectorCalls += 1;
    },
  });
  const request = searchRequest(
    { query: "サイト運用", locale: "ja" },
    {},
    controller.signal,
  );

  await assertError(onRequestPost({ request, env }), 499, "request_cancelled");
  assert.equal(aiSignal instanceof AbortSignal, true);
  assert.equal(aiSignal.aborted, true);
  assert.equal(vectorCalls, 0);
});

test("provider障害を502にし、query本文をlogへ残さない", async () => {
  const originalError = console.error;
  const logs = [];
  console.error = (value) => logs.push(String(value));

  try {
    const invalidEmbeddingEnv = createEnv({ embedding: [0.1] });
    await assertError(
      onRequestPost({
        request: searchRequest({
          query: "秘密を含む検索テキスト",
          locale: "ja",
        }),
        env: invalidEmbeddingEnv,
      }),
      502,
      "provider_error",
    );

    const vectorErrorEnv = createEnv({
      vectorError: new Error("provider failed"),
    });
    await assertError(
      onRequestPost({
        request: searchRequest({
          query: "別の秘密を含む検索テキスト",
          locale: "ja",
        }),
        env: vectorErrorEnv,
      }),
      502,
      "provider_error",
    );

    const invalidMatchesEnv = createEnv({ queryResult: { count: 1 } });
    await assertError(
      onRequestPost({
        request: searchRequest({
          query: "三つ目の秘密を含む検索テキスト",
          locale: "ja",
        }),
        env: invalidMatchesEnv,
      }),
      502,
      "provider_error",
    );

    assert.ok(logs.length >= 3);
    for (const log of logs) {
      assert.doesNotMatch(log, /秘密を含む検索テキスト/);
    }
  } finally {
    console.error = originalError;
  }
});

function searchMatch(id, score, url, locale) {
  return {
    id,
    score,
    metadata: {
      url,
      title: `Title ${id}`,
      section: `Section ${id}`,
      excerpt: `Excerpt ${id}`,
      contentType: "page",
      locale,
    },
  };
}

function searchRequest(body, headers = {}, signal) {
  return new Request(`${SITE_ORIGIN}/api/search`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      Origin: SITE_ORIGIN,
      "X-Acecore-Search-Client": CLIENT_ID,
      ...headers,
    },
    body: JSON.stringify(body),
    signal,
  });
}

function createEnv({
  matches = [],
  queryResult,
  embedding = queryVector,
  searchMinScore = "0.50",
  clientRateLimitSuccess = true,
  globalRateLimitSuccess = true,
  rateLimitError,
  vectorError,
  onAiRun = () => {},
  onQuery = () => {},
  onRateLimit = () => {},
} = {}) {
  globalThis.fetch = async (url, init = {}) => {
    onAiRun(url, init);
    assert.equal(url, "https://api.openai.com/v1/embeddings");
    assert.equal(init.method, "POST");
    assert.equal(init.headers.Authorization, "Bearer sk-test-openai-key");
    return Response.json({
      object: "list",
      model: "text-embedding-3-large",
      data: [{ object: "embedding", index: 0, embedding }],
    });
  };

  return {
    SEARCH_ENABLED: "true",
    SEARCH_MIN_SCORE: searchMinScore,
    OPENAI_API_KEY: "sk-test-openai-key",
    OPENAI_EMBEDDING_MODEL: "text-embedding-3-large",
    OPENAI_EMBEDDING_DIMENSIONS: "1536",
    SEARCH_RATE_LIMIT_DB: createRateLimitDatabase({
      clientRateLimitSuccess,
      globalRateLimitSuccess,
      rateLimitError,
      onRateLimit,
    }),
    SEARCH_INDEX: {
      async query(values, options) {
        if (vectorError) throw vectorError;
        assert.equal(values.length, 1536);
        onQuery(values, options);
        return queryResult ?? { count: matches.length, matches };
      },
    },
  };
}

function createRateLimitDatabase({
  clientRateLimitSuccess,
  globalRateLimitSuccess,
  rateLimitError,
  onRateLimit,
}) {
  return {
    prepare(query) {
      if (rateLimitError) throw rateLimitError;

      if (query.startsWith("DELETE")) {
        return {
          bind() {
            return {
              async run() {
                return { success: true };
              },
            };
          },
        };
      }

      assert.match(query, /INSERT INTO semantic_search_rate_limits/);
      return {
        bind(key, _windowStart, _expiresAt, limit) {
          return {
            async first() {
              onRateLimit({ key, limit });
              const success =
                key === "global"
                  ? globalRateLimitSuccess
                  : clientRateLimitSuccess;
              return success ? { request_count: 1 } : null;
            },
          };
        },
      };
    },
  };
}

async function assertError(
  responsePromise,
  status,
  code,
  expectedHeaders = {},
) {
  const response = await responsePromise;
  const body = await response.json();

  assert.equal(response.status, status);
  assert.equal(body.ok, false);
  assert.equal(body.error.code, code);
  assert.equal(response.headers.get("Cache-Control"), "no-store");
  assert.equal(response.headers.get("X-Content-Type-Options"), "nosniff");
  assert.ok(body.requestId);
  for (const [name, value] of Object.entries(expectedHeaders)) {
    assert.equal(response.headers.get(name), value);
  }
}
