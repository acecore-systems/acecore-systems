import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { calculateTranslationSourceHash } from "./i18n-source-hash.mjs";
import { isTranslationPullRequestCurrent } from "./openai-translation-batch.mjs";

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
      if (!/^[a-f0-9]{40}$/iu.test(value)) {
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

export function isEligiblePullRequest(
  pullRequest,
  repository = getRepository(),
) {
  return (
    pullRequest?.state === "open" &&
    pullRequest?.base?.ref === "main" &&
    typeof pullRequest?.head?.ref === "string" &&
    pullRequest.head.ref.startsWith("translation/openai/") &&
    typeof pullRequest?.title === "string" &&
    pullRequest.title.startsWith("[translation] OpenAI Batch ") &&
    pullRequest?.head?.repo?.full_name === repository
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

function deleteHeadBranch(pullRequest, request) {
  const ref = pullRequest.head.ref.split("/").map(encodeURIComponent).join("/");
  return request(`/git/refs/heads/${ref}`, { method: "DELETE" });
}

async function mergePullRequest(pullRequest, request) {
  const result = await request(`/pulls/${pullRequest.number}/merge`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      merge_method: "squash",
      commit_title: pullRequest.title,
      sha: pullRequest.head.sha,
    }),
  });
  if (!result?.merged) {
    throw new Error(
      `GitHub did not merge PR #${pullRequest.number}: ${result?.message ?? "unknown reason"}`,
    );
  }
  console.log(`Merged OpenAI translation PR #${pullRequest.number}.`);
  try {
    await deleteHeadBranch(pullRequest, request);
  } catch (error) {
    console.warn(
      `Merged PR branch could not be deleted: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

export async function runMergeAutomation(
  argv,
  {
    request = githubRequest,
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
  await mergePullRequest(pullRequest, request);
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
