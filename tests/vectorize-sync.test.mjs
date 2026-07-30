import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import {
  EMBEDDING_MODEL,
  MAX_SOURCE_PAGES,
  MAX_VECTOR_COUNT,
  SEARCH_NAMESPACE,
  SITE_ORIGIN,
  VECTOR_DIMENSIONS,
  VECTOR_METRIC,
} from "../scripts/build-search-corpus.mjs";
import {
  extractEmbeddingData,
  syncVectorize,
  validateCorpus,
} from "../scripts/sync-vectorize.mjs";

const PREVIEW_INDEX = "acecore-systems-search-preview";
const temporaryDirectories = [];
const quietLogger = { log() {} };

test.afterEach(async () => {
  await Promise.all(
    temporaryDirectories
      .splice(0)
      .map((directory) => rm(directory, { recursive: true, force: true })),
  );
});

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function makeVector(index) {
  const text = `検索対象の本文 ${index}`;
  const url = `/page/${index}/`;
  const digest = sha256([SEARCH_NAMESPACE, url, "0", text].join("\u001f"));
  return {
    id: `v1-${digest.slice(0, 48)}`,
    text,
    metadata: {
      namespace: SEARCH_NAMESPACE,
      locale: SEARCH_NAMESPACE,
      url,
      title: `ページ ${index}`,
      section: `ページ ${index}`,
      excerpt: text,
      sourcePath: `page/${index}/index.html`,
      contentType: "page",
      chunkIndex: 0,
      contentHash: digest,
    },
  };
}

function makeCorpus(vectorCount = 5) {
  const vectors = Array.from({ length: vectorCount }, (_, index) =>
    makeVector(index),
  );
  const version = sha256(
    vectors
      .map(({ id, metadata }) => `${id}:${metadata.contentHash}`)
      .sort()
      .join("\n"),
  ).slice(0, 20);

  return {
    schemaVersion: 1,
    generatedAt: "2026-07-30T00:00:00.000Z",
    origin: SITE_ORIGIN,
    namespace: SEARCH_NAMESPACE,
    version,
    embedding: {
      model: EMBEDDING_MODEL,
      dimensions: VECTOR_DIMENSIONS,
      metric: VECTOR_METRIC,
    },
    limits: {
      maxSourcePages: MAX_SOURCE_PAGES,
      maxVectors: MAX_VECTOR_COUNT,
    },
    sourcePageCount: Math.max(1, Math.min(vectorCount, MAX_SOURCE_PAGES)),
    vectorCount,
    localeCounts: {
      [SEARCH_NAMESPACE]: vectorCount,
    },
    vectors,
  };
}

async function writeCorpus(corpus) {
  const directory = await mkdtemp(path.join(os.tmpdir(), "systems-sync-"));
  temporaryDirectories.push(directory);
  const corpusFile = path.join(directory, "corpus.json");
  await writeFile(corpusFile, JSON.stringify(corpus), "utf8");
  return corpusFile;
}

function jsonResponse(payload, { status = 200, headers } = {}) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  });
}

function indexResponse() {
  return jsonResponse({
    success: true,
    result: {
      name: PREVIEW_INDEX,
      config: {
        dimensions: VECTOR_DIMENSIONS,
        metric: VECTOR_METRIC,
      },
    },
  });
}

function listResponse(ids) {
  return jsonResponse({
    success: true,
    result: {
      vectors: ids.map((id) => ({ id })),
      isTruncated: false,
    },
  });
}

function commonOptions(corpusFile, fetchImpl) {
  return {
    accountId: "account-id",
    apiToken: "token",
    indexName: PREVIEW_INDEX,
    corpusFile,
    fetchImpl,
    retryBaseDelayMs: 1,
    sleepImpl: async () => {},
    logger: quietLogger,
  };
}

test("validates only a non-empty ja corpus with matching content hashes", () => {
  const corpus = makeCorpus(1);
  assert.doesNotThrow(() => validateCorpus(corpus));

  const empty = makeCorpus(0);
  assert.throws(() => validateCorpus(empty), /vector count must be between 1/u);

  const changed = structuredClone(corpus);
  changed.vectors[0].text = "改ざんされた本文";
  assert.throws(() => validateCorpus(changed), /content hash/u);

  const extraNamespace = structuredClone(corpus);
  extraNamespace.localeCounts.en = 0;
  assert.throws(() => validateCorpus(extraNamespace), /only ja/u);

  const absoluteUrl = structuredClone(corpus);
  absoluteUrl.vectors[0].metadata.url = `${SITE_ORIGIN}/page/0/`;
  assert.throws(() => validateCorpus(absoluteUrl), /invalid vector/u);

  const encodedPrivateUrl = structuredClone(corpus);
  encodedPrivateUrl.vectors[0].metadata.url = "/%61dmin/";
  assert.throws(() => validateCorpus(encodedPrivateUrl), /invalid vector/u);

  const unsafeSourcePath = structuredClone(corpus);
  unsafeSourcePath.vectors[0].metadata.sourcePath = "../private/index.html";
  assert.throws(() => validateCorpus(unsafeSourcePath), /invalid vector/u);

  for (const requiredField of [
    "locale",
    "title",
    "section",
    "excerpt",
    "contentType",
  ]) {
    const missingMetadata = structuredClone(corpus);
    delete missingMetadata.vectors[0].metadata[requiredField];
    assert.throws(() => validateCorpus(missingMetadata), /invalid vector/u);
  }
});

test("enforces the small-site vector upper bound", () => {
  const corpus = makeCorpus(MAX_VECTOR_COUNT + 1);
  assert.throws(
    () => validateCorpus(corpus),
    new RegExp(`between 1 and ${MAX_VECTOR_COUNT}`, "u"),
  );
});

test("dry-run validates corpus and index allowlist without network access", async () => {
  const corpus = makeCorpus(2);
  const corpusFile = await writeCorpus(corpus);
  let requested = false;

  const result = await syncVectorize({
    corpusFile,
    dryRun: true,
    indexName: PREVIEW_INDEX,
    fetchImpl: async () => {
      requested = true;
      throw new Error("network should not be used");
    },
    logger: quietLogger,
  });

  assert.equal(requested, false);
  assert.equal(result.corpusVersion, corpus.version);
  assert.equal(result.vectors, 2);

  await assert.rejects(
    syncVectorize({
      corpusFile,
      dryRun: true,
      indexName: "unapproved-index",
      logger: quietLogger,
    }),
    /must be one of/u,
  );
});

test("upserts missing content, waits, then safely deletes stale content", async () => {
  const corpus = makeCorpus(5);
  const corpusFile = await writeCorpus(corpus);
  const staleId = `v1-${"f".repeat(48)}`;
  const currentIds = [
    corpus.vectors[0].id,
    corpus.vectors[1].id,
    corpus.vectors[2].id,
    corpus.vectors[3].id,
    staleId,
  ];
  const events = [];
  let infoCount = 0;

  const fetchImpl = async (input, init = {}) => {
    const url = new URL(input);
    if (url.pathname.endsWith(`/indexes/${PREVIEW_INDEX}`)) {
      events.push("index");
      return indexResponse();
    }
    if (url.pathname.endsWith("/list")) {
      events.push("list");
      return listResponse(currentIds);
    }
    if (url.pathname.includes("/ai/run/")) {
      events.push("embed");
      const request = JSON.parse(init.body);
      return jsonResponse({
        success: true,
        result: {
          data: request.text.map(() => Array(VECTOR_DIMENSIONS).fill(0.25)),
        },
      });
    }
    if (url.pathname.endsWith("/upsert")) {
      events.push("upsert");
      const file = init.body.get("vectors");
      const record = JSON.parse((await file.text()).trim());
      assert.equal(record.id, corpus.vectors[4].id);
      assert.equal(record.metadata.namespace, SEARCH_NAMESPACE);
      assert.equal(record.metadata.locale, SEARCH_NAMESPACE);
      assert.equal(record.metadata.url, "/page/4/");
      assert.equal(record.metadata.section, "ページ 4");
      assert.equal(record.metadata.excerpt, "検索対象の本文 4");
      assert.equal("namespace" in record, false);
      return jsonResponse({
        success: true,
        result: { mutationId: "upsert-mutation" },
      });
    }
    if (url.pathname.endsWith("/delete_by_ids")) {
      events.push("delete");
      assert.deepEqual(JSON.parse(init.body), { ids: [staleId] });
      return jsonResponse({
        success: true,
        result: { mutationId: "delete-mutation" },
      });
    }
    if (url.pathname.endsWith("/info")) {
      infoCount += 1;
      events.push(infoCount === 1 ? "wait-upsert" : "wait-delete");
      return jsonResponse({
        success: true,
        result: {
          processedUpToMutation:
            infoCount === 1 ? "upsert-mutation" : "delete-mutation",
        },
      });
    }
    throw new Error(`Unexpected request: ${url}`);
  };

  const result = await syncVectorize({
    ...commonOptions(corpusFile, fetchImpl),
    mutationPollIntervalMs: 1,
  });

  assert.deepEqual(events, [
    "index",
    "list",
    "embed",
    "upsert",
    "wait-upsert",
    "delete",
    "wait-delete",
  ]);
  assert.equal(result.upserted, 1);
  assert.equal(result.deleted, 1);
});

test("refuses unmanaged ids before making any mutation", async () => {
  const corpus = makeCorpus(1);
  const corpusFile = await writeCorpus(corpus);
  let mutationRequested = false;

  const fetchImpl = async (input) => {
    const url = new URL(input);
    if (url.pathname.endsWith(`/indexes/${PREVIEW_INDEX}`)) {
      return indexResponse();
    }
    if (url.pathname.endsWith("/list")) {
      return listResponse(["legacy-vector-id"]);
    }
    mutationRequested = true;
    throw new Error(`Unexpected mutation: ${url}`);
  };

  await assert.rejects(
    syncVectorize(commonOptions(corpusFile, fetchImpl)),
    /unmanaged vector id/u,
  );
  assert.equal(mutationRequested, false);
});

test("requires an explicit override when deletes exceed 20 percent", async () => {
  const corpus = makeCorpus(1);
  const corpusFile = await writeCorpus(corpus);
  const currentIds = [
    corpus.vectors[0].id,
    ...Array.from(
      { length: 4 },
      (_, index) => `v1-${String(index + 10).padStart(48, "a")}`,
    ),
  ];
  let deleteRequests = 0;

  const fetchImpl = async (input) => {
    const url = new URL(input);
    if (url.pathname.endsWith(`/indexes/${PREVIEW_INDEX}`)) {
      return indexResponse();
    }
    if (url.pathname.endsWith("/list")) return listResponse(currentIds);
    if (url.pathname.endsWith("/delete_by_ids")) {
      deleteRequests += 1;
      return jsonResponse({
        success: true,
        result: { mutationId: "delete-mutation" },
      });
    }
    throw new Error(`Unexpected request: ${url}`);
  };

  await assert.rejects(
    syncVectorize(commonOptions(corpusFile, fetchImpl)),
    /pass --allow-large-delete/u,
  );
  assert.equal(deleteRequests, 0);

  const result = await syncVectorize({
    ...commonOptions(corpusFile, fetchImpl),
    allowLargeDelete: true,
    waitForMutations: false,
  });
  assert.equal(result.deleted, 4);
  assert.equal(deleteRequests, 1);
});

test("retries a bounded 429 response and honors Retry-After", async () => {
  const corpus = makeCorpus(1);
  const corpusFile = await writeCorpus(corpus);
  const delays = [];
  let requestCount = 0;

  const fetchImpl = async (input) => {
    requestCount += 1;
    const url = new URL(input);
    if (requestCount === 1) {
      return jsonResponse(
        { success: false, errors: [{ message: "rate limited" }] },
        { status: 429, headers: { "Retry-After": "2" } },
      );
    }
    if (url.pathname.endsWith(`/indexes/${PREVIEW_INDEX}`)) {
      return indexResponse();
    }
    if (url.pathname.endsWith("/list")) {
      return listResponse([corpus.vectors[0].id]);
    }
    throw new Error(`Unexpected request: ${url}`);
  };

  const result = await syncVectorize({
    ...commonOptions(corpusFile, fetchImpl),
    sleepImpl: async (milliseconds) => delays.push(milliseconds),
    randomImpl: () => 0,
  });

  assert.equal(result.upserted, 0);
  assert.equal(requestCount, 3);
  assert.deepEqual(delays, [2_000]);
});

test("fails closed on incompatible index configuration", async () => {
  const corpusFile = await writeCorpus(makeCorpus(1));
  const fetchImpl = async () =>
    jsonResponse({
      success: true,
      result: {
        name: PREVIEW_INDEX,
        config: { dimensions: 768, metric: VECTOR_METRIC },
      },
    });

  await assert.rejects(
    syncVectorize(commonOptions(corpusFile, fetchImpl)),
    /must use 1024 dimensions and cosine/u,
  );
});

test("requires a mutation id from every Vectorize write", async () => {
  const corpus = makeCorpus(1);
  const corpusFile = await writeCorpus(corpus);

  const fetchImpl = async (input, init = {}) => {
    const url = new URL(input);
    if (url.pathname.endsWith(`/indexes/${PREVIEW_INDEX}`)) {
      return indexResponse();
    }
    if (url.pathname.endsWith("/list")) return listResponse([]);
    if (url.pathname.includes("/ai/run/")) {
      return jsonResponse({
        success: true,
        result: { data: [Array(VECTOR_DIMENSIONS).fill(0)] },
      });
    }
    if (url.pathname.endsWith("/upsert")) {
      assert.ok(init.body instanceof FormData);
      return jsonResponse({ success: true, result: {} });
    }
    throw new Error(`Unexpected request: ${url}`);
  };

  await assert.rejects(
    syncVectorize(commonOptions(corpusFile, fetchImpl)),
    /did not include a valid mutationId/u,
  );
});

test("bounds mutation polling and does not delete after an upsert wait timeout", async () => {
  const corpus = makeCorpus(1);
  const corpusFile = await writeCorpus(corpus);
  let now = 0;
  let deleteRequested = false;

  const fetchImpl = async (input) => {
    const url = new URL(input);
    if (url.pathname.endsWith(`/indexes/${PREVIEW_INDEX}`)) {
      return indexResponse();
    }
    if (url.pathname.endsWith("/list")) {
      return listResponse([`v1-${"f".repeat(48)}`]);
    }
    if (url.pathname.includes("/ai/run/")) {
      return jsonResponse({
        success: true,
        result: { data: [Array(VECTOR_DIMENSIONS).fill(0)] },
      });
    }
    if (url.pathname.endsWith("/upsert")) {
      return jsonResponse({
        success: true,
        result: { mutationId: "upsert-mutation" },
      });
    }
    if (url.pathname.endsWith("/info")) {
      return jsonResponse({
        success: true,
        result: { processedUpToMutation: "older-mutation" },
      });
    }
    if (url.pathname.endsWith("/delete_by_ids")) {
      deleteRequested = true;
    }
    throw new Error(`Unexpected request: ${url}`);
  };

  await assert.rejects(
    syncVectorize({
      ...commonOptions(corpusFile, fetchImpl),
      allowLargeDelete: true,
      mutationWaitTimeoutMs: 25,
      mutationPollIntervalMs: 1,
      nowImpl: () => {
        now += 10;
        return now;
      },
    }),
    /was not queryable in time/u,
  );
  assert.equal(deleteRequested, false);
});

test("rejects malformed Workers AI embeddings", () => {
  assert.throws(
    () => extractEmbeddingData({ result: { data: [[0, 1]] } }, 1),
    /must contain 1024 finite values/u,
  );
  assert.throws(
    () => extractEmbeddingData({ result: { data: [] } }, 1),
    /returned 0 embeddings; expected 1/u,
  );
});
