import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { calculateTranslationSourceHash } from "./i18n-source-hash.mjs";
import { isTranslationPullRequestCurrent } from "./openai-translation-batch.mjs";

const FULL_SHA_PATTERN = /^[a-f0-9]{40}$/iu;
const TRANSLATION_BOT_LOGIN = "acecore-translation-bot[bot]";
const TRANSLATION_TITLE_PREFIX = "[translation] OpenAI Batch ";
const TRANSLATION_LOCALES = "(?:en|zh-cn|es|pt|fr|ko|de|ru)";
const TRANSLATION_CONTENT_PATH_PATTERN = new RegExp(
  `^src/i18n/content/${TRANSLATION_LOCALES}\\.json$`,
  "u",
);
const TRANSLATION_INSIGHT_PATH_PATTERN = new RegExp(
  `^src/content/insights/${TRANSLATION_LOCALES}/.+\\.md$`,
  "u",
);
const TRANSLATION_SHARED_PATHS = new Set([
  "src/i18n/ui.ts",
  "src/i18n/contact-form.ts",
  "src/i18n/translation-state.json",
]);

export function parseArgs(argv) {
  const options = { prNumber: null, expectedSha: null };
  for (const argument of argv) {
    if (argument.startsWith("--pr=")) {
      const value = Number(argument.slice("--pr=".length));
      if (!Number.isSafeInteger(value) || value <= 0) {
        throw new Error("--pr must be a positive pull request number");
      }
      options.prNumber = value;
    } else if (argument.startsWith("--expected-sha=")) {
      const value = argument.slice("--expected-sha=".length);
      if (!FULL_SHA_PATTERN.test(value)) {
        throw new Error("--expected-sha must be a full commit SHA");
      }
      options.expectedSha = value;
    } else {
      throw new Error(`Unknown argument: ${argument}`);
    }
  }
  return options;
}

function getRepository() {
  const repository = process.env.GITHUB_REPOSITORY?.trim();
  if (!repository || !/^[^/\s]+\/[^/\s]+$/u.test(repository)) {
    throw new Error("GITHUB_REPOSITORY is required");
  }
  return repository;
}

function getToken() {
  const token = process.env.GITHUB_TOKEN?.trim();
  if (!token) throw new Error("GITHUB_TOKEN is required");
  return token;
}

async function githubRequest(pathname, init = {}) {
  const response = await fetch(
    `https://api.github.com/repos/${getRepository()}${pathname}`,
    {
      ...init,
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${getToken()}`,
        "X-GitHub-Api-Version": "2022-11-28",
        ...(init.headers ?? {}),
      },
    },
  );
  if (!response.ok) {
    throw new Error(
      `GitHub API ${init.method ?? "GET"} ${pathname} failed: ${response.status} ${await response.text()}`,
    );
  }
  return response.status === 204 ? null : response.json();
}

async function githubGraphql(query, variables = {}) {
  const response = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${getToken()}`,
      "Content-Type": "application/json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    body: JSON.stringify({ query, variables }),
  });
  const payload = await response.json();
  if (
    !response.ok ||
    (Array.isArray(payload?.errors) && payload.errors.length)
  ) {
    throw new Error(
      `GitHub GraphQL failed: ${response.status} ${JSON.stringify(payload?.errors ?? payload)}`,
    );
  }
  return payload?.data;
}

export function isEligiblePullRequest(
  pullRequest,
  repository = getRepository(),
) {
  return (
    pullRequest?.state === "open" &&
    pullRequest?.base?.ref === "main" &&
    pullRequest?.user?.login === TRANSLATION_BOT_LOGIN &&
    typeof pullRequest?.head?.ref === "string" &&
    pullRequest.head.ref.startsWith("translation/openai/") &&
    typeof pullRequest?.head?.repo?.full_name === "string" &&
    pullRequest.head.repo.full_name.toLowerCase() ===
      repository.toLowerCase() &&
    typeof pullRequest?.title === "string" &&
    pullRequest.title.startsWith(TRANSLATION_TITLE_PREFIX)
  );
}

function isAllowedTranslationFile(filename) {
  return (
    TRANSLATION_CONTENT_PATH_PATTERN.test(filename) ||
    TRANSLATION_INSIGHT_PATH_PATTERN.test(filename) ||
    TRANSLATION_SHARED_PATHS.has(filename)
  );
}

export function hasOnlyAllowedTranslationFiles(filenames) {
  return (
    Array.isArray(filenames) &&
    filenames.length > 0 &&
    filenames.every(isAllowedTranslationFile)
  );
}

async function getPullRequestFiles(pullRequest, request) {
  const filenames = [];
  for (let page = 1; page <= 30; page += 1) {
    const files = await request(
      `/pulls/${pullRequest.number}/files?per_page=100&page=${page}`,
    );
    if (!Array.isArray(files)) {
      throw new Error("GitHub pull request files response must be an array");
    }
    for (const file of files) {
      if (typeof file?.filename !== "string" || !file.filename) {
        throw new Error("GitHub pull request file is missing filename");
      }
      filenames.push(file.filename);
    }
    if (files.length < 100) return filenames;
  }
  throw new Error("Translation pull request exceeds the 3000-file API limit");
}

async function getCheckRuns(headSha, request) {
  const response = await request(
    `/commits/${encodeURIComponent(headSha)}/check-runs?per_page=100`,
  );
  if (!Array.isArray(response?.check_runs)) {
    throw new Error("GitHub check runs response is invalid");
  }
  return response.check_runs;
}

async function isPullRequestBehindMain(pullRequest, request) {
  const comparison = await request(
    `/compare/main...${encodeURIComponent(pullRequest.head.sha)}`,
  );
  if (
    !Number.isSafeInteger(comparison?.behind_by) ||
    comparison.behind_by < 0
  ) {
    throw new Error("GitHub comparison response is invalid");
  }
  return comparison.behind_by > 0;
}

export function hasSuccessfulBuildAndFormat(checkRuns) {
  return checkRuns.some(
    (checkRun) =>
      checkRun?.name === "Build and Format" &&
      checkRun?.conclusion === "success",
  );
}

async function closePullRequest(pullRequest, request) {
  await request(`/pulls/${pullRequest.number}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ state: "closed" }),
  });
  console.log(`Closed stale OpenAI translation PR #${pullRequest.number}.`);
}

export async function updatePullRequestBranch(pullRequest, request) {
  const result = await request(`/pulls/${pullRequest.number}/update-branch`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ expected_head_sha: pullRequest.head.sha }),
  });
  if (typeof result?.message !== "string") {
    throw new Error(
      `GitHub did not confirm updating translation PR #${pullRequest.number}`,
    );
  }
  console.log(
    `Updated OpenAI translation PR #${pullRequest.number} with main.`,
  );
}

export async function markPullRequestReadyForReview(pullRequest, graphql) {
  if (!pullRequest.draft) return;
  if (typeof pullRequest.node_id !== "string" || !pullRequest.node_id) {
    throw new Error(`PR #${pullRequest.number} has no node_id`);
  }
  const data = await graphql(
    `
      mutation MarkPullRequestReadyForReview($pullRequestId: ID!) {
        markPullRequestReadyForReview(
          input: { pullRequestId: $pullRequestId }
        ) {
          pullRequest {
            number
            isDraft
          }
        }
      }
    `,
    { pullRequestId: pullRequest.node_id },
  );
  const result = data?.markPullRequestReadyForReview?.pullRequest;
  if (result?.number !== pullRequest.number || result?.isDraft !== false) {
    throw new Error(`GitHub did not mark PR #${pullRequest.number} ready`);
  }
  console.log(`Marked OpenAI translation PR #${pullRequest.number} ready.`);
}

export async function mergePullRequest(pullRequest, graphql) {
  if (typeof pullRequest.node_id !== "string" || !pullRequest.node_id) {
    throw new Error(`PR #${pullRequest.number} has no node_id`);
  }
  const data = await graphql(
    `
      mutation MergePullRequest(
        $pullRequestId: ID!
        $expectedHeadOid: GitObjectID!
        $commitHeadline: String!
      ) {
        mergePullRequest(
          input: {
            pullRequestId: $pullRequestId
            expectedHeadOid: $expectedHeadOid
            mergeMethod: SQUASH
            commitHeadline: $commitHeadline
          }
        ) {
          pullRequest {
            number
            merged
          }
        }
      }
    `,
    {
      pullRequestId: pullRequest.node_id,
      expectedHeadOid: pullRequest.head.sha,
      commitHeadline: pullRequest.title,
    },
  );
  const result = data?.mergePullRequest?.pullRequest;
  if (result?.number !== pullRequest.number || result?.merged !== true) {
    throw new Error(`GitHub did not merge PR #${pullRequest.number}`);
  }
  console.log(`Squash-merged OpenAI translation PR #${pullRequest.number}.`);
}

export async function enablePullRequestAutoMerge(pullRequest, graphql) {
  if (pullRequest.auto_merge && typeof pullRequest.auto_merge === "object") {
    console.log(`Auto-merge is already enabled for PR #${pullRequest.number}.`);
    return;
  }
  if (typeof pullRequest.node_id !== "string" || !pullRequest.node_id) {
    throw new Error(`PR #${pullRequest.number} has no node_id`);
  }
  const data = await graphql(
    `
      mutation EnablePullRequestAutoMerge(
        $pullRequestId: ID!
        $expectedHeadOid: GitObjectID!
        $commitHeadline: String!
      ) {
        enablePullRequestAutoMerge(
          input: {
            pullRequestId: $pullRequestId
            expectedHeadOid: $expectedHeadOid
            mergeMethod: SQUASH
            commitHeadline: $commitHeadline
          }
        ) {
          pullRequest {
            number
            merged
            autoMergeRequest {
              mergeMethod
            }
          }
        }
      }
    `,
    {
      pullRequestId: pullRequest.node_id,
      expectedHeadOid: pullRequest.head.sha,
      commitHeadline: pullRequest.title,
    },
  );
  const result = data?.enablePullRequestAutoMerge?.pullRequest;
  if (
    result?.number !== pullRequest.number ||
    (result?.merged !== true && !result?.autoMergeRequest)
  ) {
    throw new Error(
      `GitHub did not enable auto-merge for PR #${pullRequest.number}`,
    );
  }
  console.log(`Enabled squash auto-merge for PR #${pullRequest.number}.`);
}

export async function runMergeAutomation(
  argv,
  {
    request = githubRequest,
    graphql = githubGraphql,
    repository = getRepository(),
    getCurrentSourceHash = () => calculateTranslationSourceHash(process.cwd()),
  } = {},
) {
  const { prNumber, expectedSha } = parseArgs(argv);
  if (!prNumber) {
    console.log("No pull request number provided. Skipping merge automation.");
    return;
  }

  const pullRequest = await request(`/pulls/${prNumber}`);
  if (!isEligiblePullRequest(pullRequest, repository)) {
    console.log(`PR #${prNumber} is not an eligible OpenAI translation PR.`);
    return;
  }
  if (expectedSha && pullRequest.head.sha !== expectedSha) {
    console.log(
      `PR #${prNumber} changed after the successful CI run. Skipping.`,
    );
    return;
  }
  if (
    !isTranslationPullRequestCurrent(pullRequest.body, getCurrentSourceHash())
  ) {
    await closePullRequest(pullRequest, request);
    return;
  }

  const filenames = await getPullRequestFiles(pullRequest, request);
  if (!hasOnlyAllowedTranslationFiles(filenames)) {
    throw new Error(
      `PR #${prNumber} changes files outside the translation allowlist`,
    );
  }
  if (pullRequest.mergeable_state === "dirty") {
    throw new Error(`PR #${prNumber} has merge conflicts`);
  }
  if (await isPullRequestBehindMain(pullRequest, request)) {
    await updatePullRequestBranch(pullRequest, request);
    return;
  }

  const checkRuns = await getCheckRuns(pullRequest.head.sha, request);
  if (!hasSuccessfulBuildAndFormat(checkRuns)) {
    console.log(`PR #${prNumber} has no successful Build and Format check.`);
    return;
  }

  await markPullRequestReadyForReview(pullRequest, graphql);
  if (pullRequest.mergeable_state === "clean") {
    await mergePullRequest(pullRequest, graphql);
    return;
  }
  await enablePullRequestAutoMerge(pullRequest, graphql);
}

function isDirectExecution() {
  return (
    process.argv[1] &&
    resolve(process.argv[1]).toLowerCase() ===
      fileURLToPath(import.meta.url).toLowerCase()
  );
}

if (isDirectExecution()) {
  await runMergeAutomation(process.argv.slice(2));
}
