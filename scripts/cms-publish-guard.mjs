import { readFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";

export const CMS_PUBLISH_BRANCH = "cms/systems/publish";
export const CMS_REPOSITORY = "acecore-systems/acecore-systems";
export const DEFAULT_BRANCH = "main";

const API_VERSION = "2022-11-28";
const DEFAULT_POLL_ATTEMPTS = 60;
const DEFAULT_POLL_INTERVAL_MS = 10_000;
const DEFAULT_MERGEABILITY_ATTEMPTS = 10;
const DEFAULT_MERGEABILITY_INTERVAL_MS = 1_000;
const DEFAULT_API_RETRY_ATTEMPTS = 3;
const DEFAULT_API_RETRY_BASE_MS = 1_000;
const SUCCESSFUL_CONCLUSIONS = new Set(["success", "neutral", "skipped"]);
const SUPPORTED_ACTIONS = new Set([
  "opened",
  "reopened",
  "synchronize",
  "closed",
]);
const REQUIRED_CHECKS = [
  { appId: 15368, name: "Build and Format" },
  { appId: 85455, name: "Cloudflare Pages" },
];

export async function runCmsPublishGuard({
  apiRetryAttempts = DEFAULT_API_RETRY_ATTEMPTS,
  apiRetryBaseMs = DEFAULT_API_RETRY_BASE_MS,
  event,
  fetchImpl = globalThis.fetch,
  logger = console,
  maxPollAttempts = DEFAULT_POLL_ATTEMPTS,
  mergeabilityAttempts = DEFAULT_MERGEABILITY_ATTEMPTS,
  mergeabilityIntervalMs = DEFAULT_MERGEABILITY_INTERVAL_MS,
  pollIntervalMs = DEFAULT_POLL_INTERVAL_MS,
  sleep = (duration) => new Promise((resolve) => setTimeout(resolve, duration)),
  token,
} = {}) {
  const target = getCmsPullRequestTarget(event);

  if (!target.allowed) {
    logger.log(`CMS publish guard skipped: ${target.reason}`);
    return { outcome: "skipped", reason: target.reason };
  }

  if (typeof token !== "string" || token.length === 0) {
    throw new Error("GITHUB_TOKEN is required");
  }

  if (typeof fetchImpl !== "function") {
    throw new TypeError("fetchImpl must be a function");
  }

  const api = createGitHubApi({
    fetchImpl,
    maxRetryAttempts: apiRetryAttempts,
    retryBaseMs: apiRetryBaseMs,
    sleep,
    token,
  });

  if (target.action === "closed") {
    await deleteCmsBranch(api, target.headSha);
    logger.log("Deleted the closed CMS publication branch");
    return { outcome: "branch-deleted" };
  }

  let pullRequest = await getPullRequest(api, target.number);

  if (pullRequest.head?.sha !== target.headSha) {
    logger.log("A newer CMS publication commit is already being evaluated");
    return { outcome: "stale" };
  }

  assertPullRequestMatches(pullRequest, target);

  if (pullRequest.state !== "open") {
    await deleteCmsBranch(api, target.headSha);
    logger.log("The CMS publication pull request is no longer open");
    return { outcome: "closed" };
  }

  const checks = await waitForRequiredChecks({
    api,
    headSha: target.headSha,
    maxPollAttempts,
    pollIntervalMs,
    sleep,
  });

  if (!checks.ok) {
    await closeAndDeleteCmsPullRequest(api, pullRequest, checks.reason);
    throw new Error(checks.reason);
  }

  const mergeability = await waitForMergeability({
    api,
    attempts: mergeabilityAttempts,
    intervalMs: mergeabilityIntervalMs,
    number: target.number,
    sleep,
    target,
  });

  pullRequest = mergeability.pullRequest;

  if (mergeability.kind === "stale") {
    logger.log("A newer CMS publication commit is already being evaluated");
    return { outcome: "stale" };
  }

  if (mergeability.kind !== "current") {
    const reason =
      mergeability.kind === "conflict"
        ? "CMS publication pull request has a merge conflict"
        : "CMS publication pull request mergeability could not be confirmed";
    await closeAndDeleteCmsPullRequest(api, pullRequest, reason);
    throw new Error(reason);
  }

  const relation = await getBranchRelation(api, pullRequest);

  if (relation.kind === "needs-update") {
    const reason =
      "CMS publication branch is behind current main; reload CMS and save again";
    await closeAndDeleteCmsPullRequest(api, pullRequest, reason);
    throw new Error(reason);
  }

  if (relation.kind !== "current") {
    const reason = "CMS publication branch is not ahead of current main";
    await closeAndDeleteCmsPullRequest(api, pullRequest, reason);
    throw new Error(reason);
  }

  let result;

  try {
    result = await mergePullRequest(api, pullRequest);
  } catch (error) {
    return recoverMergeResult({
      api,
      error,
      logger,
      pullRequest,
      target,
    });
  }

  await deleteCmsBranch(api, pullRequest.head.sha);
  logger.log(
    `CMS publication pull request merged as squash commit ${result.sha}`,
  );
  return result;
}

export function getCmsPullRequestTarget(event) {
  if (!event || typeof event !== "object") {
    return { allowed: false, reason: "event payload is missing" };
  }

  if (!SUPPORTED_ACTIONS.has(event.action)) {
    return { allowed: false, reason: "event action is not supported" };
  }

  const pullRequest = event.pull_request;
  const repository = event.repository;
  const repositoryName = repository?.full_name;
  const baseRepository = pullRequest?.base?.repo?.full_name;
  const headRepository = pullRequest?.head?.repo?.full_name;
  const number = pullRequest?.number ?? event.number;
  const headSha = pullRequest?.head?.sha;

  if (repositoryName !== CMS_REPOSITORY || baseRepository !== CMS_REPOSITORY) {
    return { allowed: false, reason: "repository is not allowed" };
  }

  if (
    pullRequest?.head?.repo?.fork === true ||
    headRepository !== CMS_REPOSITORY
  ) {
    return { allowed: false, reason: "fork pull requests are not allowed" };
  }

  if (pullRequest?.base?.ref !== DEFAULT_BRANCH) {
    return { allowed: false, reason: "base branch is not main" };
  }

  if (pullRequest?.head?.ref !== CMS_PUBLISH_BRANCH) {
    return { allowed: false, reason: "head branch is not the CMS branch" };
  }

  if (!Number.isInteger(number) || number <= 0) {
    return { allowed: false, reason: "pull request number is invalid" };
  }

  if (!isGitOid(headSha)) {
    return { allowed: false, reason: "head SHA is invalid" };
  }

  if (
    event.action !== "closed" &&
    (typeof pullRequest.node_id !== "string" ||
      pullRequest.node_id.length === 0)
  ) {
    return { allowed: false, reason: "pull request node ID is invalid" };
  }

  return {
    action: event.action,
    allowed: true,
    headSha,
    nodeId: pullRequest.node_id,
    number,
  };
}

async function waitForRequiredChecks({
  api,
  headSha,
  maxPollAttempts,
  pollIntervalMs,
  sleep,
}) {
  if (!Number.isInteger(maxPollAttempts) || maxPollAttempts < 1) {
    throw new RangeError("maxPollAttempts must be a positive integer");
  }

  for (let attempt = 1; attempt <= maxPollAttempts; attempt += 1) {
    const response = await api.request(
      `/repos/${CMS_REPOSITORY}/commits/${headSha}/check-runs?per_page=100`,
    );
    const checkRuns = response.data?.check_runs;

    if (!Array.isArray(checkRuns)) {
      throw new Error("GitHub check-runs response is invalid");
    }

    const states = REQUIRED_CHECKS.map((required) =>
      getRequiredCheckState(checkRuns, required),
    );
    const failed = states.find(({ state }) => state === "failed");

    if (failed) {
      return {
        ok: false,
        reason: `${failed.name} failed with conclusion ${failed.conclusion}`,
      };
    }

    if (states.every(({ state }) => state === "successful")) {
      return { ok: true };
    }

    if (attempt < maxPollAttempts) {
      await sleep(pollIntervalMs);
    }
  }

  return {
    ok: false,
    reason: "Timed out waiting for required CMS publication checks",
  };
}

function getRequiredCheckState(checkRuns, required) {
  const candidates = checkRuns
    .filter(
      (checkRun) =>
        checkRun?.name === required.name &&
        checkRun?.app?.id === required.appId,
    )
    .sort((left, right) => Number(right.id ?? 0) - Number(left.id ?? 0));
  const latest = candidates[0];

  if (!latest || latest.status !== "completed" || latest.conclusion === null) {
    return { name: required.name, state: "pending" };
  }

  if (SUCCESSFUL_CONCLUSIONS.has(latest.conclusion)) {
    return { name: required.name, state: "successful" };
  }

  return {
    conclusion: String(latest.conclusion),
    name: required.name,
    state: "failed",
  };
}

async function waitForMergeability({
  api,
  attempts,
  intervalMs,
  number,
  sleep,
  target,
}) {
  if (!Number.isInteger(attempts) || attempts < 1) {
    throw new RangeError("mergeabilityAttempts must be a positive integer");
  }

  let pullRequest;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    pullRequest = await getPullRequest(api, number);

    if (pullRequest.head?.sha !== target.headSha) {
      return { kind: "stale", pullRequest };
    }

    assertPullRequestMatches(pullRequest, target);

    if (pullRequest.state !== "open") {
      return { kind: "conflict", pullRequest };
    }

    if (
      pullRequest.mergeable_state === "dirty" ||
      pullRequest.mergeable === false ||
      pullRequest.draft === true
    ) {
      return { kind: "conflict", pullRequest };
    }

    if (pullRequest.mergeable_state === "behind") {
      return { kind: "behind", pullRequest };
    }

    if (
      pullRequest.mergeable === true &&
      !["unknown", null, undefined].includes(pullRequest.mergeable_state)
    ) {
      return { kind: "current", pullRequest };
    }

    if (attempt < attempts) {
      await sleep(intervalMs);
    }
  }

  return {
    kind: "unknown",
    pullRequest,
  };
}

async function getBranchRelation(api, pullRequest) {
  const mainRef = await api.request(
    `/repos/${CMS_REPOSITORY}/git/ref/heads/${DEFAULT_BRANCH}`,
  );
  const baseSha = mainRef.data?.object?.sha;

  if (
    mainRef.data?.ref !== `refs/heads/${DEFAULT_BRANCH}` ||
    mainRef.data?.object?.type !== "commit" ||
    !isGitOid(baseSha)
  ) {
    throw new Error("GitHub main ref response is invalid");
  }

  const headSha = pullRequest.head.sha;
  const comparison = await api.request(
    `/repos/${CMS_REPOSITORY}/compare/${baseSha}...${headSha}`,
  );
  const result = comparison.data;
  const aheadBy = result?.ahead_by;
  const behindBy = result?.behind_by;
  const commits = result?.commits;
  const mergeBaseSha = result?.merge_base_commit?.sha;

  if (
    result?.base_commit?.sha !== baseSha ||
    !isGitOid(mergeBaseSha) ||
    !Number.isInteger(aheadBy) ||
    aheadBy < 0 ||
    !Number.isInteger(behindBy) ||
    behindBy < 0 ||
    !Array.isArray(commits)
  ) {
    throw new Error("GitHub compare response is invalid");
  }

  if (
    result.status === "ahead" &&
    aheadBy > 0 &&
    behindBy === 0 &&
    commits.at(-1)?.sha === headSha
  ) {
    return { baseSha, headSha, kind: "current" };
  }

  if (
    result.status === "diverged" &&
    aheadBy > 0 &&
    behindBy > 0 &&
    commits.at(-1)?.sha === headSha
  ) {
    return { baseSha, headSha, kind: "needs-update" };
  }

  if (
    result.status === "behind" &&
    aheadBy === 0 &&
    behindBy > 0 &&
    mergeBaseSha === headSha
  ) {
    return { baseSha, headSha, kind: "needs-update" };
  }

  if (
    result.status === "identical" &&
    aheadBy === 0 &&
    behindBy === 0 &&
    baseSha === headSha &&
    mergeBaseSha === headSha
  ) {
    return { baseSha, headSha, kind: "no-change" };
  }

  throw new Error("GitHub compare response does not match the CMS branch");
}

async function mergePullRequest(api, pullRequest) {
  const response = await api.request(
    `/repos/${CMS_REPOSITORY}/pulls/${pullRequest.number}/merge`,
    {
      body: {
        merge_method: "squash",
        sha: pullRequest.head.sha,
      },
      method: "PUT",
    },
  );
  const result = response.data;

  if (
    result?.merged !== true ||
    !isGitOid(result.sha) ||
    typeof result.message !== "string" ||
    result.message.length === 0
  ) {
    throw new Error("GitHub squash merge response is invalid");
  }

  return {
    outcome: "merged",
    pullRequest: pullRequest.number,
    sha: result.sha,
  };
}

async function recoverMergeResult({ api, error, logger, pullRequest, target }) {
  logger.error("Failed to confirm squash merge; checking live PR state");

  let live;

  try {
    live = await getPullRequest(api, pullRequest.number);
    assertPullRequestMatches(live, target);
  } catch {
    throw error;
  }

  if (
    live.state === "closed" &&
    live.merged === true &&
    typeof live.merged_at === "string" &&
    live.merged_at.length > 0 &&
    isGitOid(live.merge_commit_sha)
  ) {
    await deleteCmsBranch(api, target.headSha);
    return {
      outcome: "merged",
      pullRequest: live.number,
      sha: live.merge_commit_sha,
    };
  }

  if (live.state === "open") {
    await closeAndDeleteCmsPullRequest(
      api,
      live,
      "Squash merge could not be confirmed",
    );
  } else {
    await deleteCmsBranch(api, target.headSha);
  }

  throw error;
}

async function closeAndDeleteCmsPullRequest(api, pullRequest, reason) {
  for (let attempt = 1; attempt <= api.maxRetryAttempts; attempt += 1) {
    const live = await getPullRequest(api, pullRequest.number);

    if (!isSameCmsPullRequest(live, pullRequest)) {
      throw new Error(
        `Refusing to close a changed CMS publication PR: ${reason}`,
      );
    }

    if (live.state === "closed" && live.merged === false) {
      await deleteCmsBranch(api, pullRequest.head.sha);
      return;
    }

    if (live.state !== "open" || live.merged === true) {
      throw new Error(
        `Refusing to close a merged or non-open CMS publication PR: ${reason}`,
      );
    }

    const response = await api.request(
      `/repos/${CMS_REPOSITORY}/pulls/${pullRequest.number}`,
      {
        allowTransientFailure: true,
        body: { state: "closed" },
        method: "PATCH",
      },
    );

    if (
      !response.transient &&
      isSameCmsPullRequest(response.data, pullRequest) &&
      response.data.state === "closed" &&
      response.data.merged !== true
    ) {
      await deleteCmsBranch(api, pullRequest.head.sha);
      return;
    }

    if (
      !response.transient &&
      (response.data?.merged === true ||
        (hasPullRequestIdentity(response.data) &&
          !isSameCmsPullRequest(response.data, pullRequest)))
    ) {
      throw new Error(`Failed to close CMS publication PR safely: ${reason}`);
    }

    if (attempt < api.maxRetryAttempts) {
      await api.sleep(getRetryDelay(response, attempt, api.retryBaseMs));
    }
  }

  const final = await getPullRequest(api, pullRequest.number);

  if (!isSameCmsPullRequest(final, pullRequest)) {
    throw new Error(
      `Refusing to recover a changed CMS publication PR: ${reason}`,
    );
  }

  if (final.state === "closed" && final.merged === false) {
    await deleteCmsBranch(api, pullRequest.head.sha);
    return;
  }

  if (final.merged === true || final.state !== "open") {
    throw new Error(
      `Refusing to recover a merged or non-open CMS publication PR: ${reason}`,
    );
  }

  throw new Error(`Failed to close CMS publication PR: ${reason}`);
}

async function deleteCmsBranch(api, expectedHeadSha) {
  const refPath = `/repos/${CMS_REPOSITORY}/git/ref/heads/${CMS_PUBLISH_BRANCH}`;

  for (let attempt = 1; attempt <= api.maxRetryAttempts; attempt += 1) {
    const current = await api.request(refPath, {
      expectedStatuses: [200, 404],
    });

    if (current.status === 404) {
      return;
    }

    if (
      current.data?.ref !== `refs/heads/${CMS_PUBLISH_BRANCH}` ||
      current.data?.object?.type !== "commit" ||
      current.data?.object?.sha !== expectedHeadSha
    ) {
      throw new Error("Refusing to delete a different CMS publication branch");
    }

    const deletion = await api.request(
      `/repos/${CMS_REPOSITORY}/git/refs/heads/${CMS_PUBLISH_BRANCH}`,
      {
        allowTransientFailure: true,
        expectedStatuses: [204, 404],
        method: "DELETE",
      },
    );

    if ([204, 404].includes(deletion.status)) {
      return;
    }

    if (attempt < api.maxRetryAttempts) {
      await api.sleep(getRetryDelay(deletion, attempt, api.retryBaseMs));
    }
  }

  const final = await api.request(refPath, {
    expectedStatuses: [200, 404],
  });

  if (final.status === 404) {
    return;
  }

  if (
    final.data?.ref !== `refs/heads/${CMS_PUBLISH_BRANCH}` ||
    final.data?.object?.type !== "commit" ||
    final.data?.object?.sha !== expectedHeadSha
  ) {
    throw new Error("Refusing to recover a different CMS publication branch");
  }

  throw new Error("Failed to delete the CMS publication branch");
}

function isSameCmsPullRequest(candidate, expected) {
  return (
    candidate?.number === expected.number &&
    candidate?.node_id === expected.node_id &&
    candidate?.base?.ref === DEFAULT_BRANCH &&
    candidate?.base?.repo?.full_name === CMS_REPOSITORY &&
    candidate?.head?.ref === CMS_PUBLISH_BRANCH &&
    candidate?.head?.repo?.full_name === CMS_REPOSITORY &&
    candidate?.head?.sha === expected.head.sha
  );
}

function hasPullRequestIdentity(candidate) {
  return Boolean(
    candidate &&
    typeof candidate === "object" &&
    (candidate.number !== undefined ||
      candidate.node_id !== undefined ||
      candidate.base !== undefined ||
      candidate.head !== undefined),
  );
}

async function getPullRequest(api, number) {
  const response = await api.request(
    `/repos/${CMS_REPOSITORY}/pulls/${number}`,
  );

  if (!response.data || typeof response.data !== "object") {
    throw new Error("GitHub pull request response is invalid");
  }

  return response.data;
}

function assertPullRequestMatches(pullRequest, target) {
  if (
    pullRequest.number !== target.number ||
    pullRequest.node_id !== target.nodeId ||
    pullRequest.base?.ref !== DEFAULT_BRANCH ||
    pullRequest.base?.repo?.full_name !== CMS_REPOSITORY ||
    pullRequest.head?.ref !== CMS_PUBLISH_BRANCH ||
    pullRequest.head?.repo?.full_name !== CMS_REPOSITORY
  ) {
    throw new Error("GitHub pull request does not match the CMS target");
  }

  if (
    !isGitOid(pullRequest.head?.sha) ||
    pullRequest.head.sha !== target.headSha
  ) {
    throw new Error("GitHub pull request head SHA is invalid");
  }
}

function createGitHubApi({
  fetchImpl,
  maxRetryAttempts,
  retryBaseMs,
  sleep,
  token,
}) {
  if (!Number.isInteger(maxRetryAttempts) || maxRetryAttempts < 1) {
    throw new RangeError("apiRetryAttempts must be a positive integer");
  }

  if (!Number.isFinite(retryBaseMs) || retryBaseMs < 0) {
    throw new RangeError("apiRetryBaseMs must be a non-negative number");
  }

  return {
    maxRetryAttempts,
    retryBaseMs,
    sleep,
    async request(
      path,
      {
        allowTransientFailure = false,
        body,
        expectedStatuses,
        method = "GET",
      } = {},
    ) {
      for (let attempt = 1; attempt <= maxRetryAttempts; attempt += 1) {
        let response;

        try {
          response = await fetchImpl(`https://api.github.com${path}`, {
            body: body === undefined ? undefined : JSON.stringify(body),
            headers: {
              Accept: "application/vnd.github+json",
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
              "X-GitHub-Api-Version": API_VERSION,
            },
            method,
          });
        } catch (error) {
          if (allowTransientFailure) {
            return {
              data: null,
              error,
              headers: new Headers(),
              status: null,
              transient: true,
            };
          }

          throw error;
        }

        const text = await response.text();
        const transient =
          response.status === 429 ||
          (response.status >= 500 && response.status <= 599);

        if (method === "GET" && transient && attempt < maxRetryAttempts) {
          await sleep(getRetryDelay(response, attempt, retryBaseMs));
          continue;
        }

        let data = null;

        if (text.length > 0) {
          try {
            data = JSON.parse(text);
          } catch {
            if (allowTransientFailure && transient) {
              return {
                data: null,
                headers: response.headers,
                status: response.status,
                transient: true,
              };
            }

            throw new Error(
              `GitHub returned invalid JSON (${response.status})`,
            );
          }
        }

        const statuses = expectedStatuses ?? [200];

        if (allowTransientFailure && transient) {
          return {
            data,
            headers: response.headers,
            status: response.status,
            transient: true,
          };
        }

        if (!statuses.includes(response.status)) {
          throw new Error(
            `GitHub API request failed (${response.status} ${method} ${path})`,
          );
        }

        return {
          data,
          headers: response.headers,
          status: response.status,
          transient: false,
        };
      }

      throw new Error(`GitHub API retry loop ended unexpectedly (${path})`);
    },
  };
}

function getRetryDelay(response, attempt, retryBaseMs) {
  const retryAfterHeader = response.headers.get("Retry-After");
  const retryAfter =
    retryAfterHeader === null ? Number.NaN : Number(retryAfterHeader);

  if (Number.isFinite(retryAfter) && retryAfter >= 0) {
    return Math.min(retryAfter * 1_000, 30_000);
  }

  return Math.min(retryBaseMs * 2 ** (attempt - 1), 30_000);
}

function isGitOid(value) {
  return typeof value === "string" && /^[a-f0-9]{40}$/i.test(value);
}

async function main() {
  const eventPath = process.env.GITHUB_EVENT_PATH;

  if (!eventPath) {
    throw new Error("GITHUB_EVENT_PATH is required");
  }

  const event = JSON.parse(await readFile(eventPath, "utf8"));
  await runCmsPublishGuard({
    event,
    token: process.env.GITHUB_TOKEN,
  });
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
}
