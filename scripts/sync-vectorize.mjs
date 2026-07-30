import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  EMBEDDING_MODEL,
  MAX_SOURCE_PAGES,
  MAX_VECTOR_COUNT,
  SEARCH_NAMESPACE,
  SITE_ORIGIN,
  VECTOR_DIMENSIONS,
  VECTOR_METRIC,
} from "./build-search-corpus.mjs";

const API_BASE_URL = "https://api.cloudflare.com/client/v4";
const DEFAULT_CORPUS_FILE = path.resolve(".vectorize/corpus.json");
const EMBEDDING_BATCH_SIZE = 32;
const UPSERT_BATCH_SIZE = 200;
const DELETE_BATCH_SIZE = 100;
const LIST_BATCH_SIZE = 1_000;
const MUTATION_WAIT_TIMEOUT_MS = 180_000;
const MUTATION_POLL_INTERVAL_MS = 5_000;
const REQUEST_TIMEOUT_MS = 30_000;
const MAX_REQUEST_RETRIES = 5;
const RETRY_BASE_DELAY_MS = 500;
const MAX_LIST_CURSOR_RESTARTS = 3;
const MAX_DELETE_RATIO = 0.2;
const MIN_SOURCE_PAGE_COUNT = 1;
const MIN_VECTOR_COUNT = 1;
const MANAGED_VECTOR_ID_PATTERN = /^v1-[0-9a-f]{48}$/u;
const CONTENT_HASH_PATTERN = /^[0-9a-f]{64}$/u;
const VERSION_PATTERN = /^[0-9a-f]{20}$/u;
const CONTENT_TYPE_PATTERN = /^[a-z0-9][a-z0-9_-]{0,39}$/u;
const PRIVATE_PATH_SEGMENTS = new Set(["admin", "api"]);

export const ALLOWED_INDEX_NAMES = new Set([
  "acecore-systems-search-preview",
  "acecore-systems-search-production",
]);

class CloudflareApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "CloudflareApiError";
    this.status = status;
  }
}

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function calculateVectorIdentity(vector) {
  return sha256(
    [
      SEARCH_NAMESPACE,
      vector.metadata.url,
      String(vector.metadata.chunkIndex),
      vector.text,
    ].join("\u001f"),
  );
}

function calculateCorpusVersion(vectors) {
  return sha256(
    vectors
      .map(({ id, metadata }) => `${id}:${metadata.contentHash}`)
      .sort()
      .join("\n"),
  ).slice(0, 20);
}

function isSafeMetadataText(value, maxLength) {
  return (
    typeof value === "string" &&
    value.trim() === value &&
    value.length > 0 &&
    [...value].length <= maxLength &&
    !/[\u0000-\u001f\u007f]/u.test(value) &&
    !/[\ud800-\udfff]/u.test(value)
  );
}

function isSafePublicPath(value) {
  if (
    typeof value !== "string" ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.includes("\\") ||
    value.includes("?") ||
    value.includes("#") ||
    /\s/u.test(value) ||
    /[\u0000-\u001f\u007f]/u.test(value) ||
    /[\ud800-\udfff]/u.test(value) ||
    [...value].length > 500
  ) {
    return false;
  }

  try {
    const resolved = new URL(value, SITE_ORIGIN);
    let decodedPath = resolved.pathname;
    for (let index = 0; index < value.length; index += 1) {
      const nextPath = decodeURIComponent(decodedPath);
      if (nextPath === decodedPath) break;
      decodedPath = nextPath;
    }

    if (
      !decodedPath.startsWith("/") ||
      decodedPath.startsWith("//") ||
      decodedPath.includes("\\") ||
      decodedPath.includes("?") ||
      decodedPath.includes("#") ||
      /\s/u.test(decodedPath) ||
      /[\u0000-\u001f\u007f]/u.test(decodedPath)
    ) {
      return false;
    }

    const canonicalPath = new URL(decodedPath, SITE_ORIGIN).pathname;
    const firstPathSegment = decodedPath.split("/")[1]?.toLowerCase();
    return (
      resolved.origin === SITE_ORIGIN &&
      !resolved.search &&
      !resolved.hash &&
      resolved.pathname === value &&
      canonicalPath === resolved.pathname &&
      !PRIVATE_PATH_SEGMENTS.has(firstPathSegment)
    );
  } catch {
    return false;
  }
}

function isSafeSourcePath(value) {
  return (
    typeof value === "string" &&
    value.length > 0 &&
    value.length <= 500 &&
    !value.startsWith("/") &&
    !value.includes("\\") &&
    !value.includes(":") &&
    !value.split("/").includes(".") &&
    !value.split("/").includes("..") &&
    value.endsWith(".html") &&
    !/[?#\u0000-\u001f\u007f]/u.test(value) &&
    !/[\ud800-\udfff]/u.test(value)
  );
}

export function validateCorpus(corpus) {
  if (
    corpus?.schemaVersion !== 1 ||
    corpus?.origin !== SITE_ORIGIN ||
    corpus?.namespace !== SEARCH_NAMESPACE
  ) {
    throw new Error(
      `Corpus must use schema version 1, origin ${SITE_ORIGIN}, and namespace ${SEARCH_NAMESPACE}.`,
    );
  }
  if (
    corpus?.embedding?.model !== EMBEDDING_MODEL ||
    corpus?.embedding?.dimensions !== VECTOR_DIMENSIONS ||
    corpus?.embedding?.metric !== VECTOR_METRIC
  ) {
    throw new Error(
      `Corpus embedding configuration must be ${EMBEDDING_MODEL}, ${VECTOR_DIMENSIONS} dimensions, ${VECTOR_METRIC}.`,
    );
  }
  if (
    !Number.isInteger(corpus.sourcePageCount) ||
    corpus.sourcePageCount < MIN_SOURCE_PAGE_COUNT ||
    corpus.sourcePageCount > MAX_SOURCE_PAGES
  ) {
    throw new Error(
      `Corpus source page count must be between ${MIN_SOURCE_PAGE_COUNT} and ${MAX_SOURCE_PAGES}.`,
    );
  }
  if (
    !Array.isArray(corpus.vectors) ||
    !Number.isInteger(corpus.vectorCount) ||
    corpus.vectorCount !== corpus.vectors.length ||
    corpus.vectorCount < MIN_VECTOR_COUNT ||
    corpus.vectorCount > MAX_VECTOR_COUNT
  ) {
    throw new Error(
      `Corpus vector count must be between ${MIN_VECTOR_COUNT} and ${MAX_VECTOR_COUNT} and match the vectors array.`,
    );
  }

  const localeKeys = Object.keys(corpus.localeCounts || {});
  if (
    localeKeys.length !== 1 ||
    localeKeys[0] !== SEARCH_NAMESPACE ||
    corpus.localeCounts[SEARCH_NAMESPACE] !== corpus.vectorCount
  ) {
    throw new Error(
      `Corpus localeCounts must contain only ${SEARCH_NAMESPACE} and match vectorCount.`,
    );
  }
  if (
    corpus?.limits?.maxSourcePages !== MAX_SOURCE_PAGES ||
    corpus?.limits?.maxVectors !== MAX_VECTOR_COUNT
  ) {
    throw new Error("Corpus safety limits do not match the sync tooling.");
  }

  const ids = new Set();
  for (const vector of corpus.vectors) {
    const metadata = vector?.metadata;

    if (
      typeof vector?.id !== "string" ||
      !MANAGED_VECTOR_ID_PATTERN.test(vector.id) ||
      typeof vector.text !== "string" ||
      !vector.text.trim() ||
      metadata?.namespace !== SEARCH_NAMESPACE ||
      metadata?.locale !== SEARCH_NAMESPACE ||
      !isSafePublicPath(metadata?.url) ||
      !isSafeMetadataText(metadata?.title, 240) ||
      !isSafeMetadataText(metadata?.section, 240) ||
      !isSafeMetadataText(metadata?.excerpt, 500) ||
      typeof metadata?.contentType !== "string" ||
      !CONTENT_TYPE_PATTERN.test(metadata.contentType) ||
      !isSafeSourcePath(metadata?.sourcePath) ||
      !Number.isInteger(metadata?.chunkIndex) ||
      metadata.chunkIndex < 0 ||
      typeof metadata?.contentHash !== "string" ||
      !CONTENT_HASH_PATTERN.test(metadata.contentHash)
    ) {
      throw new Error("Corpus contains an invalid vector.");
    }
    if (ids.has(vector.id)) {
      throw new Error(`Duplicate vector id: ${vector.id}`);
    }

    const digest = calculateVectorIdentity(vector);
    if (
      metadata.contentHash !== digest ||
      vector.id !== `v1-${digest.slice(0, 48)}`
    ) {
      throw new Error(`Vector ${vector.id} does not match its content hash.`);
    }
    ids.add(vector.id);
  }

  if (
    typeof corpus.version !== "string" ||
    !VERSION_PATTERN.test(corpus.version) ||
    corpus.version !== calculateCorpusVersion(corpus.vectors)
  ) {
    throw new Error("Corpus version does not match its vectors.");
  }
}

function validateIndexName(indexName, { required }) {
  if (!indexName && !required) return;
  if (!ALLOWED_INDEX_NAMES.has(indexName)) {
    throw new Error(
      `VECTORIZE_INDEX_NAME must be one of: ${[...ALLOWED_INDEX_NAMES].join(", ")}.`,
    );
  }
}

function validateExistingVectorIds(ids, indexName) {
  const unmanagedIds = [...ids].filter(
    (id) => !MANAGED_VECTOR_ID_PATTERN.test(id),
  );
  if (unmanagedIds.length === 0) return;

  throw new Error(
    `Vectorize index ${indexName} contains ${unmanagedIds.length} unmanaged vector id(s); refusing to mutate it.`,
  );
}

function validateDeletePlan({ currentCount, deleteCount, allowLargeDelete }) {
  if (
    deleteCount === 0 ||
    currentCount === 0 ||
    deleteCount / currentCount <= MAX_DELETE_RATIO ||
    allowLargeDelete
  ) {
    return;
  }

  const percentage = ((deleteCount / currentCount) * 100).toFixed(1);
  throw new Error(
    `Refusing to delete ${deleteCount}/${currentCount} vectors (${percentage}%); pass --allow-large-delete to override the ${MAX_DELETE_RATIO * 100}% safety limit.`,
  );
}

export function extractEmbeddingData(payload, expectedCount) {
  const result = payload?.result ?? payload;
  const data = result?.data;

  if (!Array.isArray(data) || data.length !== expectedCount) {
    throw new Error(
      `Workers AI returned ${Array.isArray(data) ? data.length : 0} embeddings; expected ${expectedCount}.`,
    );
  }

  for (const values of data) {
    if (
      !Array.isArray(values) ||
      values.length !== VECTOR_DIMENSIONS ||
      values.some((value) => !Number.isFinite(value))
    ) {
      throw new Error(
        `Workers AI embedding must contain ${VECTOR_DIMENSIONS} finite values.`,
      );
    }
  }

  return data;
}

function createCloudflareClient({
  accountId,
  apiToken,
  fetchImpl,
  requestTimeoutMs,
  retryBaseDelayMs,
  sleepImpl,
  randomImpl,
}) {
  const accountBase = `${API_BASE_URL}/accounts/${encodeURIComponent(accountId)}`;

  return {
    async request(requestPath, init = {}) {
      const headers = new Headers(init.headers);
      headers.set("Authorization", `Bearer ${apiToken}`);
      headers.set("Accept", "application/json");

      for (let attempt = 0; attempt <= MAX_REQUEST_RETRIES; attempt += 1) {
        const timeoutController = new AbortController();
        const timeout = setTimeout(
          () => timeoutController.abort(new Error("Request timed out.")),
          requestTimeoutMs,
        );

        try {
          const response = await fetchImpl(`${accountBase}${requestPath}`, {
            ...init,
            headers,
            signal: timeoutController.signal,
          });

          if (
            isRetryableStatus(response.status) &&
            attempt < MAX_REQUEST_RETRIES
          ) {
            await response.body?.cancel().catch(() => {});
            await sleepImpl(
              getRetryDelay({
                attempt,
                retryAfter: response.headers.get("Retry-After"),
                retryBaseDelayMs,
                randomImpl,
              }),
            );
            continue;
          }

          const payload = await readJsonResponse(response);
          if (!response.ok || payload?.success === false) {
            const message =
              payload?.errors
                ?.map((error) => error?.message)
                .filter(Boolean)
                .join("; ") ||
              `Cloudflare API request failed with ${response.status}.`;
            throw new CloudflareApiError(message, response.status);
          }

          return payload;
        } catch (error) {
          if (
            attempt >= MAX_REQUEST_RETRIES ||
            !isRetryableNetworkError(error, timeoutController.signal.aborted)
          ) {
            throw error;
          }

          await sleepImpl(
            getRetryDelay({
              attempt,
              retryBaseDelayMs,
              randomImpl,
            }),
          );
        } finally {
          clearTimeout(timeout);
        }
      }

      throw new Error("Cloudflare API request exhausted all retries.");
    },
  };
}

function isRetryableStatus(status) {
  return status === 429 || status >= 500;
}

function isRetryableNetworkError(error, timedOut) {
  return (
    timedOut ||
    error instanceof TypeError ||
    error?.name === "AbortError" ||
    error?.name === "TimeoutError"
  );
}

function getRetryDelay({ attempt, retryAfter, retryBaseDelayMs, randomImpl }) {
  const exponentialDelay = retryBaseDelayMs * 2 ** attempt;
  const jitter = randomImpl() * retryBaseDelayMs;
  const retryAfterDelay = parseRetryAfter(retryAfter);
  return Math.max(exponentialDelay + jitter, retryAfterDelay);
}

function parseRetryAfter(value) {
  if (!value) return 0;

  const seconds = Number(value);
  if (Number.isFinite(seconds) && seconds >= 0) return seconds * 1_000;

  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? Math.max(0, timestamp - Date.now()) : 0;
}

function sleep(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function ensureIndex(client, indexName) {
  const encodedName = encodeURIComponent(indexName);
  try {
    const payload = await client.request(
      `/vectorize/v2/indexes/${encodedName}`,
    );
    return payload.result;
  } catch (error) {
    if (!(error instanceof CloudflareApiError) || error.status !== 404) {
      throw error;
    }
  }

  const payload = await client.request("/vectorize/v2/indexes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: indexName,
      description: "Acecore Systems semantic search (BGE-M3)",
      config: {
        dimensions: VECTOR_DIMENSIONS,
        metric: VECTOR_METRIC,
      },
    }),
  });
  return payload.result;
}

function validateIndexConfiguration(index, indexName) {
  if (
    index?.config?.dimensions !== VECTOR_DIMENSIONS ||
    index?.config?.metric !== VECTOR_METRIC
  ) {
    throw new Error(
      `Vectorize index ${indexName} must use ${VECTOR_DIMENSIONS} dimensions and ${VECTOR_METRIC}.`,
    );
  }
}

async function listVectorIds(
  client,
  indexName,
  { logger, sleepImpl, retryBaseDelayMs },
) {
  for (let restart = 0; restart <= MAX_LIST_CURSOR_RESTARTS; restart += 1) {
    try {
      return await listVectorIdsOnce(client, indexName);
    } catch (error) {
      if (
        restart >= MAX_LIST_CURSOR_RESTARTS ||
        !(error instanceof CloudflareApiError) ||
        error.status !== 400 ||
        !/cursor/iu.test(error.message)
      ) {
        throw error;
      }

      logger.log(
        JSON.stringify({
          event: "vectorize_list_cursor_restart",
          indexName,
          restart: restart + 1,
        }),
      );
      await sleepImpl(retryBaseDelayMs * 2 ** restart);
    }
  }

  throw new Error("Vectorize list pagination exhausted all cursor restarts.");
}

async function listVectorIdsOnce(client, indexName) {
  const ids = new Set();
  let cursor = "";

  do {
    const query = new URLSearchParams({ count: String(LIST_BATCH_SIZE) });
    if (cursor) query.set("cursor", cursor);
    const payload = await client.request(
      `/vectorize/v2/indexes/${encodeURIComponent(indexName)}/list?${query}`,
    );
    const result = payload.result || {};

    for (const vector of result.vectors || []) {
      if (typeof vector?.id !== "string") {
        throw new Error(
          `Vectorize index ${indexName} returned a vector without a valid id; refusing to mutate it.`,
        );
      }
      ids.add(vector.id);
    }

    cursor =
      result.isTruncated && typeof result.nextCursor === "string"
        ? result.nextCursor
        : "";
  } while (cursor);

  return ids;
}

async function createEmbeddings(client, vectors) {
  const payload = await client.request(`/ai/run/${EMBEDDING_MODEL}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      text: vectors.map(({ text }) => text),
      truncate_inputs: true,
    }),
  });
  return extractEmbeddingData(payload, vectors.length);
}

async function upsertVectors(client, indexName, vectors) {
  const ndjson = vectors.map((vector) => JSON.stringify(vector)).join("\n");
  const form = new FormData();
  form.set(
    "vectors",
    new Blob([`${ndjson}\n`], { type: "application/x-ndjson" }),
    "vectors.ndjson",
  );
  const payload = await client.request(
    `/vectorize/v2/indexes/${encodeURIComponent(indexName)}/upsert`,
    {
      method: "POST",
      body: form,
    },
  );
  return getMutationId(payload);
}

async function deleteVectors(client, indexName, ids) {
  const payload = await client.request(
    `/vectorize/v2/indexes/${encodeURIComponent(indexName)}/delete_by_ids`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids }),
    },
  );
  return getMutationId(payload);
}

function getMutationId(payload) {
  const value = payload?.result?.mutationId ?? payload?.mutationId;
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(
      "Cloudflare Vectorize mutation response did not include a valid mutationId.",
    );
  }
  return value;
}

async function waitForMutation(
  client,
  indexName,
  mutationId,
  { timeoutMs, pollIntervalMs, sleepImpl, nowImpl },
) {
  const deadline = nowImpl() + timeoutMs;

  while (nowImpl() < deadline) {
    const payload = await client.request(
      `/vectorize/v2/indexes/${encodeURIComponent(indexName)}/info`,
    );
    if (payload?.result?.processedUpToMutation === mutationId) return;
    await sleepImpl(pollIntervalMs);
  }

  throw new Error(
    `Vectorize mutation ${mutationId} was not queryable in time.`,
  );
}

async function readJsonResponse(response) {
  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    throw new Error(
      `Cloudflare API returned a non-JSON response with ${response.status}.`,
    );
  }
}

function batches(items, size) {
  const result = [];
  for (let index = 0; index < items.length; index += size) {
    result.push(items.slice(index, index + size));
  }
  return result;
}

export async function syncVectorize({
  accountId = process.env.CLOUDFLARE_ACCOUNT_ID,
  apiToken = process.env.CLOUDFLARE_API_TOKEN,
  indexName = process.env.VECTORIZE_INDEX_NAME,
  corpusFile = DEFAULT_CORPUS_FILE,
  dryRun = false,
  allowLargeDelete = false,
  waitForMutations = true,
  fetchImpl = globalThis.fetch,
  requestTimeoutMs = REQUEST_TIMEOUT_MS,
  retryBaseDelayMs = RETRY_BASE_DELAY_MS,
  mutationWaitTimeoutMs = MUTATION_WAIT_TIMEOUT_MS,
  mutationPollIntervalMs = MUTATION_POLL_INTERVAL_MS,
  sleepImpl = sleep,
  nowImpl = Date.now,
  randomImpl = Math.random,
  logger = console,
} = {}) {
  const corpus = JSON.parse(await readFile(corpusFile, "utf8"));
  validateCorpus(corpus);

  if (!dryRun && (!accountId || !apiToken || !indexName)) {
    throw new Error(
      "CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_API_TOKEN, and VECTORIZE_INDEX_NAME are required.",
    );
  }
  validateIndexName(indexName, { required: !dryRun });

  if (dryRun) {
    const result = {
      dryRun: true,
      indexName: indexName || null,
      corpusVersion: corpus.version,
      vectors: corpus.vectorCount,
      locales: corpus.localeCounts,
    };
    logger.log(JSON.stringify({ event: "vectorize_sync_dry_run", ...result }));
    return result;
  }

  const client = createCloudflareClient({
    accountId,
    apiToken,
    fetchImpl,
    requestTimeoutMs,
    retryBaseDelayMs,
    sleepImpl,
    randomImpl,
  });
  const index = await ensureIndex(client, indexName);
  validateIndexConfiguration(index, indexName);

  const currentIds = await listVectorIds(client, indexName, {
    logger,
    sleepImpl,
    retryBaseDelayMs,
  });
  validateExistingVectorIds(currentIds, indexName);

  const expectedIds = new Set(corpus.vectors.map(({ id }) => id));
  const vectorsToUpsert = corpus.vectors.filter(
    ({ id }) => !currentIds.has(id),
  );
  const idsToDelete = [...currentIds].filter((id) => !expectedIds.has(id));
  validateDeletePlan({
    currentCount: currentIds.size,
    deleteCount: idsToDelete.length,
    allowLargeDelete,
  });

  logger.log(
    JSON.stringify({
      event: "vectorize_sync_plan",
      indexName,
      corpusVersion: corpus.version,
      current: currentIds.size,
      expected: expectedIds.size,
      upsert: vectorsToUpsert.length,
      delete: idsToDelete.length,
    }),
  );

  const waitOptions = {
    timeoutMs: mutationWaitTimeoutMs,
    pollIntervalMs: mutationPollIntervalMs,
    sleepImpl,
    nowImpl,
  };
  const upsertMutationIds = [];

  for (const embeddingBatch of batches(vectorsToUpsert, EMBEDDING_BATCH_SIZE)) {
    const embeddings = await createEmbeddings(client, embeddingBatch);
    const records = embeddingBatch.map((vector, indexInBatch) => ({
      id: vector.id,
      values: embeddings[indexInBatch],
      metadata: vector.metadata,
    }));

    for (const vectorBatch of batches(records, UPSERT_BATCH_SIZE)) {
      upsertMutationIds.push(
        await upsertVectors(client, indexName, vectorBatch),
      );
    }
  }

  const lastUpsertMutationId = upsertMutationIds.at(-1);
  if (waitForMutations && lastUpsertMutationId) {
    await waitForMutation(client, indexName, lastUpsertMutationId, waitOptions);
  }

  const deleteMutationIds = [];
  for (const idBatch of batches(idsToDelete, DELETE_BATCH_SIZE)) {
    deleteMutationIds.push(await deleteVectors(client, indexName, idBatch));
  }

  const lastDeleteMutationId = deleteMutationIds.at(-1);
  if (waitForMutations && lastDeleteMutationId) {
    await waitForMutation(client, indexName, lastDeleteMutationId, waitOptions);
  }

  const result = {
    dryRun: false,
    indexName,
    corpusVersion: corpus.version,
    existing: currentIds.size,
    upserted: vectorsToUpsert.length,
    deleted: idsToDelete.length,
    upsertMutationId: lastUpsertMutationId || null,
    deleteMutationId: lastDeleteMutationId || null,
  };
  logger.log(JSON.stringify({ event: "vectorize_sync_complete", ...result }));
  return result;
}

function parseArguments(argv) {
  const options = {
    dryRun: false,
    allowLargeDelete: false,
    indexName: process.env.VECTORIZE_INDEX_NAME,
    corpusFile: DEFAULT_CORPUS_FILE,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--dry-run") {
      options.dryRun = true;
    } else if (argument === "--allow-large-delete") {
      options.allowLargeDelete = true;
    } else if (argument === "--index") {
      options.indexName = argv[++index];
    } else if (argument === "--corpus") {
      options.corpusFile = path.resolve(argv[++index]);
    } else {
      throw new Error(`Unknown argument: ${argument}`);
    }
  }

  return options;
}

function isDirectExecution() {
  if (!process.argv[1]) return false;
  return (
    path.resolve(process.argv[1]).toLowerCase() ===
    fileURLToPath(import.meta.url).toLowerCase()
  );
}

if (isDirectExecution()) {
  syncVectorize(parseArguments(process.argv.slice(2))).catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
