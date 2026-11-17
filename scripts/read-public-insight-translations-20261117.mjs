import assert from "node:assert/strict";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import {
  calculateTranslationSourceHash,
  translatedLocales,
} from "./i18n-source-hash.mjs";
import {
  assertRetryBatch,
  decodeMetadata,
  getBatchOutput,
  openAiJson,
  planBatchRetry,
  prepareBatchTranslations,
  translationIdentity,
} from "./openai-translation-batch.mjs";

const repository = "acecore-systems/acecore-systems";
const sourceCommit = "73c6eca0ba56096bb91675a2eaee33b2a28e91df";
const parentId = "batch_6afbe5a531e08190adea61100fd3d67e";
const retryId = "batch_6afbe87344b081908ddebc56522eded8";
const slugs = [
  "alpha-lore-evidence-review",
  "commerce-state-readback",
  "desktop-automation-shared-lock",
  "discord-audio-processing-boundaries",
  "git-dvc-creative-restore",
  "gradle-cache-ci-measurement",
  "public-register-snapshot-review",
];
const outputDirectory = process.argv[2];
assert.equal(process.env.GITHUB_REPOSITORY, repository);
assert.ok(outputDirectory && path.isAbsolute(outputDirectory));

const sourceHash = calculateTranslationSourceHash(process.cwd());
const state = JSON.parse(
  readFileSync("src/i18n/translation-state.json", "utf8"),
);
assert.deepEqual(Object.keys(state.pendingInsights).sort(), slugs);

const [parent, retry] = await Promise.all([
  openAiJson(`/batches/${parentId}`),
  openAiJson(`/batches/${retryId}`),
]);
assert.equal(parent.id, parentId);
assert.equal(retry.id, retryId);
assert.equal(parent.metadata.source_commit, sourceCommit);
assert.equal(retry.metadata.source_commit, sourceCommit);
assertRetryBatch(parent, sourceHash, { repository });
assertRetryBatch(retry, sourceHash, { repository, parentId });

const [originalResults, retryResults] = await Promise.all([
  getBatchOutput(parent),
  getBatchOutput(retry),
]);
assert.equal(originalResults.length, 56);
assert.equal(retryResults.length, 10);
assert.equal(parent.request_counts.total, originalResults.length);
assert.equal(retry.request_counts.total, retryResults.length);

const plan = planBatchRetry(originalResults, sourceHash);
assert.equal(plan.identitiesHash, retry.metadata.retry_identities_hash);
const replacementByIdentity = new Map(
  retryResults.map((item) => [
    translationIdentity(decodeMetadata(item.custom_id)),
    item,
  ]),
);
assert.deepEqual([...replacementByIdentity.keys()].sort(), plan.identities);

const destinations = new Set();
const accepted = [];
const manual = [];
for (const original of originalResults) {
  const meta = decodeMetadata(original.custom_id);
  const slug = path.basename(meta.sourcePath, ".md");
  assert.equal(meta.kind, "insight");
  assert.equal(meta.sourceHash, sourceHash);
  assert.ok(slugs.includes(slug) && translatedLocales.includes(meta.locale));
  assert.equal(meta.sourcePath, `src/content/insights/${slug}.md`);
  const destination = `src/content/insights/${meta.locale}/${slug}.md`;
  assert.ok(!destinations.has(destination));
  destinations.add(destination);
  const item = replacementByIdentity.get(translationIdentity(meta)) ?? original;
  try {
    const files = prepareBatchTranslations([item], sourceHash);
    assert.equal(files.size, 1);
    const markdown = files.get(path.normalize(destination));
    assert.equal(typeof markdown, "string");
    accepted.push({ destination, markdown });
  } catch (error) {
    manual.push({ locale: meta.locale, slug, reason: error.message });
  }
}
assert.equal(destinations.size, slugs.length * translatedLocales.length);

for (const { destination, markdown } of accepted) {
  const file = path.join(outputDirectory, destination);
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, markdown, { flag: "wx" });
}
writeFileSync(
  path.join(outputDirectory, "manifest.json"),
  JSON.stringify(
    {
      sourceCommit,
      sourceHash,
      parentId,
      retryId,
      accepted: accepted.map(({ destination }) => destination).sort(),
      manual,
    },
    null,
    2,
  ) + "\n",
  { flag: "wx" },
);
console.log(
  `Accepted drafts: ${accepted.length}. Manual translation needed: ${manual.length}.`,
);
