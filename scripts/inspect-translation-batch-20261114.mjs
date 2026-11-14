import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const fromMain = (file) => import(pathToFileURL(resolve("scripts", file)).href);
const {
  applyBatchTranslations,
  assertRetryBatch,
  decodeMetadata,
  mergeBatchRetry,
  planBatchRetry,
  prepareBatchTranslations,
} = await fromMain("openai-translation-batch.mjs");
const { calculateTranslationSourceHash } = await fromMain("i18n-source-hash.mjs");

const repository = "acecore-systems/acecore-systems";
const parentId = "batch_6af507b520cc81908cd77c5a125eae27";
const childId = "batch_6af6cbe85e408190a398542c939daaf9";
const expectedHash = "1c5558eb6049330f86d8cd800b863a8a7a11fbbe72c94e4db4efd8d07a86a8b5";
const sourceHash = calculateTranslationSourceHash(process.cwd());
const apiKey = process.env.OPENAI_TRANSLATION_API_KEY;

function check(condition, message) {
  if (!condition) throw new Error(message);
}

function safeCode(value) {
  return typeof value === "string" && /^[a-z][a-z0-9_.-]{0,59}$/iu.test(value)
    ? value
    : null;
}

function summarizeError(error) {
  return {
    code: safeCode(error?.code),
    type: safeCode(error?.type),
  };
}

function validationReason(error) {
  const message = String(error?.message ?? "");
  const known = [
    "protected token is missing or changed",
    "unknown or duplicated protected token",
    "ambiguous formatting around protected token",
    "numeric value changed",
    "Markdown link destinations",
    "fenced code changed",
    "fenced code delimiters",
    "inline code changed",
    "URL changed",
    "placeholder changed",
    "unexpected entry count",
    "invalid entry",
    "Missing translation",
    "has no output text",
    "Batch contains a failed request",
  ];
  return known.find((reason) => message.includes(reason)) ?? "other_validation_error";
}

async function get(resource) {
  const response = await fetch("https://api.openai.com/v1/" + resource, {
    method: "GET",
    headers: { Authorization: "Bearer " + apiKey },
    redirect: "error",
    signal: AbortSignal.timeout(30000),
  });
  check(response.ok, "OpenAI GET failed with HTTP " + response.status);
  return response;
}

async function batch(id, retryOf) {
  const result = await (await get("batches/" + id)).json();
  check(
    result.id === id &&
      result.metadata?.translation_system === "acecore-systems-v1" &&
      result.metadata?.repository === repository &&
      result.metadata?.source_hash === sourceHash &&
      (result.metadata?.retry_of ?? null) === retryOf,
    "Unexpected Batch metadata",
  );
  return result;
}

async function fileRows(id, expectedRows) {
  if (!id) return [];
  check(/^file[-_][A-Za-z0-9_-]{1,100}$/u.test(id), "Unexpected file ID");
  const body = await (await get("files/" + id + "/content")).text();
  const lines = body.split(/\r?\n/u).filter(Boolean);
  check(lines.length <= expectedRows + 1, "Unexpected file row count");
  try {
    return lines.map((line) => JSON.parse(line));
  } catch {
    throw new Error("Invalid JSONL in a Batch file");
  }
}

function identity(row) {
  const { sourcePath, locale, kind, sourceHash: rowHash } = decodeMetadata(row.custom_id);
  check(rowHash === sourceHash, "Unexpected row source hash");
  return JSON.stringify([kind, locale, sourcePath]);
}

check(process.env.GITHUB_REPOSITORY === repository, "Wrong repository");
check(process.env.GITHUB_REF === "refs/heads/codex/translation-batch-20261114-inspect", "Wrong ref");
check(sourceHash === expectedHash, "Japanese source changed");
check(apiKey, "The repository translation credential is unavailable");

const [parent, child] = await Promise.all([batch(parentId, null), batch(childId, parentId)]);
console.log(JSON.stringify({
  sourceHash,
  child: {
    id: child.id,
    status: safeCode(child.status),
    total: child.request_counts?.total,
    completed: child.request_counts?.completed,
    failed: child.request_counts?.failed,
    completedAt: child.completed_at,
    expiredAt: child.expired_at,
    hasOutputFile: Boolean(child.output_file_id),
    hasErrorFile: Boolean(child.error_file_id),
  },
  parent: {
    id: parent.id,
    status: safeCode(parent.status),
    total: parent.request_counts?.total,
    completed: parent.request_counts?.completed,
    failed: parent.request_counts?.failed,
  },
}));
assertRetryBatch(parent, sourceHash, { repository });
check(parent.request_counts.total === 64, "Unexpected original request count");
check(child.request_counts?.total === 16 && child.metadata.retry_request_count === "16", "Unexpected retry request count");

const [parentRows, childRows, errorRows] = await Promise.all([
  fileRows(parent.output_file_id, 64),
  fileRows(child.output_file_id, 16),
  fileRows(child.error_file_id, 16),
]);
check(parentRows.length === 64, "Parent output count changed");
let plan;
try {
  plan = planBatchRetry(parentRows, sourceHash);
} catch (error) {
  throw new Error("Parent validation failed: " + validationReason(error));
}
check(plan.retainedCount === 48 && plan.identities.length === 16, "Original validation outcome changed");
check(plan.identitiesHash === child.metadata.retry_identities_hash, "Retry identity hash differs");
const plannedIdentities = new Set(plan.identities);
const valid = new Set();
const seen = new Set();
const rejected = [];
for (const [file, rows] of [["output", childRows], ["error", errorRows]]) {
  for (const row of rows) {
    const item = identity(row);
    check(plannedIdentities.has(item) && !seen.has(item), "Unexpected or duplicate retry identity");
    seen.add(item);
    const status = row.response?.status_code;
    if (file === "output" && status === 200 && !row.error) {
      try {
        prepareBatchTranslations([row], sourceHash);
        valid.add(item);
        continue;
      } catch (error) {
        rejected.push({
          identity: JSON.parse(item),
          reason: validationReason(error),
          responseStatus: safeCode(row.response?.body?.status),
          incompleteReason: safeCode(row.response?.body?.incomplete_details?.reason),
        });
        continue;
      }
    }
    rejected.push({
      identity: JSON.parse(item),
      file,
      httpStatus: Number.isInteger(status) ? status : null,
      ...summarizeError(row.error ?? row.response?.body?.error),
    });
  }
}

console.log(JSON.stringify({
  parentPassed: plan.retainedCount,
  childOutputRows: childRows.length,
  childErrorRows: errorRows.length,
  childPassed: valid.size,
  rejected,
  missing: plan.identities.filter((item) => !seen.has(item)).map((item) => JSON.parse(item)),
}));
if (valid.size === 16) {
  mergeBatchRetry(parentRows, childRows, sourceHash, plan.identitiesHash);
  console.log("All 64 translations pass the existing validators.");
}

const assemble = process.argv[2] === "--assemble";
if (assemble) {
  const repairs = JSON.parse(readFileSync(new URL("./translation-repairs-20261114.json", import.meta.url), "utf8"));
  const canonical = new Map(plan.requests.map((request) => [identity(request), request.custom_id]));
  const expectedRepairIdentities = new Set(rejected.map((row) => JSON.stringify(row.identity)));
  check(
    child.status === "completed" &&
      child.request_counts.completed === 14 &&
      child.request_counts.failed === 2 &&
      childRows.length === 14 &&
      errorRows.length === 2 &&
      seen.size === 16 &&
      valid.size === 10 &&
      expectedRepairIdentities.size === 6 &&
      repairs.length === 6,
    "Recovery evidence changed; inspect the original results",
  );

  const replacementRows = repairs.map(({kind, locale, sourcePath, result}) => {
    const item = JSON.stringify([kind, locale, sourcePath]);
    check(expectedRepairIdentities.delete(item), "Unexpected or duplicate repair");
    const customId = canonical.get(item);
    check(customId, "Repair lacks an original request identity");
    return {
      custom_id: customId,
      response: { status_code: 200, body: { output_text: JSON.stringify(result) } },
    };
  });
  const acceptedChild = childRows.filter((row) => valid.has(identity(row)));
  const combined = mergeBatchRetry(
    parentRows,
    [...acceptedChild, ...replacementRows],
    sourceHash,
    child.metadata.retry_identities_hash,
  );
  check(combined.length === 64, "Combined validation did not cover 64 results");
  check(applyBatchTranslations(combined, sourceHash), "Recovery produced no changes");
  console.log(JSON.stringify({
    validated: combined.length,
    reusedParent: plan.retainedCount,
    reusedChild: acceptedChild.length,
    localRepairs: replacementRows.length,
    sourceHash,
  }));
}
