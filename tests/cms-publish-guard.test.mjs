import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

import {
  CMS_PUBLISH_BRANCH,
  CMS_REPOSITORY,
  runCmsPublishGuard,
} from "../scripts/cms-publish-guard.mjs";

const baseSha = "b".repeat(40);
const headSha = "a".repeat(40);
const mergeSha = "c".repeat(40);
const nodeId = "PR_kwDOCmsPublish";
const pullNumber = 42;
const token = "github-actions-token";

test("必須checkとmain current確認後にhead SHA固定でsquash mergeする", async () => {
  const scenario = createScenario();

  const result = await runScenario(scenario);

  assert.deepEqual(result, {
    outcome: "merged",
    pullRequest: pullNumber,
    sha: mergeSha,
  });
  assert.deepEqual(scenario.state.mergeBody, {
    merge_method: "squash",
    sha: headSha,
  });
  assert.equal(scenario.state.pullReads, 2);
  assert.equal(scenario.state.merged, true);
  assert.equal(scenario.state.deleted, true);
});

test("pending checkを待ってから両方の成功を確認する", async () => {
  const scenario = createScenario({
    checkResponses: [
      jsonResponse({ check_runs: pendingCheckRuns() }),
      jsonResponse({ check_runs: successfulCheckRuns() }),
    ],
  });
  const delays = [];

  const result = await runScenario(scenario, {
    sleep: async (delay) => delays.push(delay),
  });

  assert.equal(result.outcome, "merged");
  assert.equal(scenario.state.checkReads, 2);
  assert.deepEqual(delays, [10_000]);
});

test("check-runsの一時的な429・5xxを限定回数リトライする", async () => {
  const scenario = createScenario({
    checkResponses: [
      jsonResponse({ message: "Rate limited" }, 429, { "Retry-After": "0" }),
      jsonResponse({ message: "Service unavailable" }, 503),
      jsonResponse({ check_runs: successfulCheckRuns() }),
    ],
  });
  const delays = [];

  const result = await runScenario(scenario, {
    apiRetryBaseMs: 1,
    sleep: async (delay) => delays.push(delay),
  });

  assert.equal(result.outcome, "merged");
  assert.equal(scenario.state.checkReads, 3);
  assert.deepEqual(delays, [0, 2]);
});

test("merge後のbranch DELETEも一時的な5xxを冪等retryする", async () => {
  const scenario = createScenario({
    deleteResponses: [
      jsonResponse({ message: "Service unavailable" }, 503),
      emptyResponse(204),
    ],
  });
  const delays = [];

  const result = await runScenario(scenario, {
    apiRetryBaseMs: 1,
    sleep: async (delay) => delays.push(delay),
  });

  assert.equal(result.outcome, "merged");
  assert.equal(scenario.state.deleteCalls, 2);
  assert.equal(scenario.state.deleted, true);
  assert.deepEqual(delays, [1]);
});

test("DELETE 503後に同名branchが別SHAで再作成されたら再DELETEしない", async () => {
  const replacementSha = "e".repeat(40);
  let replaced = false;
  const scenario = createScenario({
    branchRefResponse: () => branchRef(replaced ? replacementSha : headSha),
    deleteResponses: [
      jsonResponse({ message: "Response lost" }, 503),
      emptyResponse(204),
    ],
    onDeleteAttempt: () => {
      replaced = true;
    },
    pullResponse: (readCount) =>
      readCount >= 3 ? mergedPullRequest() : pullRequest(),
  });

  await assert.rejects(
    runScenario(scenario),
    /different CMS publication branch/,
  );

  assert.equal(scenario.state.deleteCalls, 1);
  assert.equal(scenario.state.deleted, false);
});

test("必須check失敗時はPRを閉じて同じSHAのCMS branchを削除する", async () => {
  const scenario = createScenario({
    checkResponses: [
      jsonResponse({
        check_runs: [
          checkRun({
            appId: 15368,
            conclusion: "failure",
            id: 1,
            name: "Build and Format",
          }),
          checkRun({
            appId: 85455,
            conclusion: "success",
            id: 2,
            name: "Cloudflare Pages",
          }),
        ],
      }),
    ],
  });

  await assert.rejects(
    runScenario(scenario),
    /Build and Format failed with conclusion failure/,
  );

  assert.equal(scenario.state.closed, true);
  assert.equal(scenario.state.deleted, true);
  assert.equal(scenario.state.merged, false);
});

test("close応答がraceによるmerge済みPRならbranchを削除しない", async () => {
  const scenario = createScenario({
    checkResponses: [
      jsonResponse({
        check_runs: [
          checkRun({
            appId: 15368,
            conclusion: "failure",
            id: 1,
            name: "Build and Format",
          }),
        ],
      }),
    ],
    closeResponses: [
      jsonResponse({
        ...closedPullRequest(),
        merge_commit_sha: mergeSha,
        merged: true,
        merged_at: "2026-07-28T02:00:00Z",
      }),
    ],
  });

  await assert.rejects(
    runScenario(scenario),
    /Failed to close CMS publication PR/,
  );

  assert.equal(scenario.state.deleted, false);
});

test("close PATCHの応答喪失後にclosed・unmergedを確認してbranchを削除する", async () => {
  let closed = false;
  const scenario = createScenario({
    checkResponses: [failedCheckResponse()],
    closeResponses: [new TypeError("connection reset")],
    onCloseAttempt: () => {
      closed = true;
    },
    pullResponse: (readCount) =>
      closed && readCount >= 3 ? closedPullRequest() : pullRequest(),
  });

  await assert.rejects(runScenario(scenario), /Build and Format failed/);

  assert.equal(scenario.state.patchCalls, 1);
  assert.equal(scenario.state.deleted, true);
});

test("close PATCH 503後もopenなら再検証してPATCHを再試行する", async () => {
  const scenario = createScenario({
    checkResponses: [failedCheckResponse()],
    closeResponses: [
      jsonResponse({ message: "Service unavailable" }, 503),
      jsonResponse(closedPullRequest()),
    ],
  });

  await assert.rejects(runScenario(scenario), /Build and Format failed/);

  assert.equal(scenario.state.patchCalls, 2);
  assert.equal(scenario.state.pullReads, 3);
  assert.equal(scenario.state.deleted, true);
});

test("close PATCHの曖昧応答後にmergedを検出したらbranchを削除しない", async () => {
  let merged = false;
  const scenario = createScenario({
    checkResponses: [failedCheckResponse()],
    closeResponses: [jsonResponse({ message: "Response unavailable" }, 503)],
    onCloseAttempt: () => {
      merged = true;
    },
    pullResponse: (readCount) =>
      merged && readCount >= 3 ? mergedPullRequest() : pullRequest(),
  });

  await assert.rejects(
    runScenario(scenario),
    /merged or non-open CMS publication PR/,
  );

  assert.equal(scenario.state.patchCalls, 1);
  assert.equal(scenario.state.deleted, false);
});

test("必須checkの待機timeoutでもPRとCMS branchを残さない", async () => {
  const scenario = createScenario({
    checkResponses: [jsonResponse({ check_runs: [] })],
  });

  await assert.rejects(
    runScenario(scenario, { maxPollAttempts: 1 }),
    /Timed out waiting/,
  );

  assert.equal(scenario.state.closed, true);
  assert.equal(scenario.state.deleted, true);
});

for (const status of ["behind", "diverged"]) {
  test(`mergeable_stateが再計算前でもcompare ${status}なら閉じて再保存可能にする`, async () => {
    const scenario = createScenario({
      compareStatus: status,
      pullResponse: () =>
        pullRequest({ mergeable: true, mergeableState: "blocked" }),
    });

    await assert.rejects(runScenario(scenario), /behind current main/);

    assert.equal(scenario.state.closed, true);
    assert.equal(scenario.state.deleted, true);
    assert.equal(scenario.state.merged, false);
  });
}

test("merge conflictはPRを閉じてCMS branchを削除する", async () => {
  const scenario = createScenario({
    pullResponse: (readCount) =>
      pullRequest({
        mergeable: readCount === 1,
        mergeableState: readCount === 1 ? "clean" : "dirty",
      }),
  });

  await assert.rejects(runScenario(scenario), /merge conflict/);

  assert.equal(scenario.state.closed, true);
  assert.equal(scenario.state.deleted, true);
  assert.equal(scenario.state.compared, false);
});

test("同名checkでもwrong app IDなら成功扱いせずtimeout cleanupする", async () => {
  const scenario = createScenario({
    checkResponses: [
      jsonResponse({
        check_runs: [
          checkRun({
            appId: 99999,
            conclusion: "success",
            id: 1,
            name: "Build and Format",
          }),
          checkRun({
            appId: 99998,
            conclusion: "success",
            id: 2,
            name: "Cloudflare Pages",
          }),
        ],
      }),
    ],
  });

  await assert.rejects(
    runScenario(scenario, { maxPollAttempts: 1 }),
    /Timed out waiting/,
  );

  assert.equal(scenario.state.closed, true);
  assert.equal(scenario.state.deleted, true);
});

test("固定CMS branch以外とfork PRはGitHub APIへ送らない", async () => {
  let called = false;
  const fetchImpl = async () => {
    called = true;
    throw new Error("GitHub must not be called");
  };

  const wrongBranch = await runCmsPublishGuard({
    event: cmsEvent({ branch: "cms/systems/other" }),
    fetchImpl,
    token,
  });
  const fork = await runCmsPublishGuard({
    event: cmsEvent({
      fork: true,
      headRepository: "outside/fork",
    }),
    fetchImpl,
    token,
  });

  assert.equal(wrongBranch.outcome, "skipped");
  assert.match(wrongBranch.reason, /head branch/);
  assert.equal(fork.outcome, "skipped");
  assert.match(fork.reason, /fork/);
  assert.equal(called, false);
});

for (const status of [405, 409]) {
  test(`merge API ${status}でlive PRがopenならclose・deleteする`, async () => {
    const scenario = createScenario({
      mergeResponse: jsonResponse(
        { merged: false, message: "Merge blocked", sha: null },
        status,
      ),
    });

    await assert.rejects(
      runScenario(scenario),
      new RegExp(`GitHub API request failed \\(${status}`),
    );

    assert.equal(scenario.state.closed, true);
    assert.equal(scenario.state.deleted, true);
  });
}

test("merge応答が不正でlive PRがopenなら閉じてbranchを削除する", async () => {
  const scenario = createScenario({
    mergeResponse: { merged: true, message: "merged", sha: "invalid" },
  });

  await assert.rejects(
    runScenario(scenario),
    /GitHub squash merge response is invalid/,
  );

  assert.equal(scenario.state.pullReads, 4);
  assert.equal(scenario.state.closed, true);
  assert.equal(scenario.state.deleted, true);
});

test("merge応答が不明でもlive PRのmerged状態から成功へ復旧する", async () => {
  const scenario = createScenario({
    mergeResponse: { message: "response truncated" },
    pullResponse: (readCount) =>
      readCount >= 3 ? mergedPullRequest() : pullRequest(),
  });

  const result = await runScenario(scenario);

  assert.deepEqual(result, {
    outcome: "merged",
    pullRequest: pullNumber,
    sha: mergeSha,
  });
  assert.equal(scenario.state.deleted, true);
});

test("closed eventはイベントと同じSHAのCMS branchだけを削除する", async () => {
  const scenario = createScenario();

  const result = await runScenario(scenario, {
    event: cmsEvent({ action: "closed" }),
  });

  assert.deepEqual(result, { outcome: "branch-deleted" });
  assert.equal(scenario.state.deleted, true);
  assert.equal(scenario.state.pullReads, 0);
});

test("closed eventでもexpected SHAと異なる再作成branchは削除しない", async () => {
  const replacementSha = "e".repeat(40);
  const scenario = createScenario({
    branchRefResponse: () => branchRef(replacementSha),
  });

  await assert.rejects(
    runScenario(scenario, {
      event: cmsEvent({ action: "closed" }),
    }),
    /different CMS publication branch/,
  );

  assert.equal(scenario.state.deleteCalls, 0);
  assert.equal(scenario.state.deleted, false);
});

test("workflowはtrusted mainだけをcheckoutするpull_request_target guardに限定する", async () => {
  const workflow = await readFile(
    new URL("../.github/workflows/cms-publish-guard.yml", import.meta.url),
    "utf8",
  );

  assert.match(workflow, /pull_request_target:/);
  assert.doesNotMatch(workflow, /^\s*push:/m);
  assert.match(workflow, /name:\s*CMS Publish Guard/);
  assert.match(workflow, /ref:\s*refs\/heads\/main/);
  assert.match(workflow, /persist-credentials:\s*false/);
  assert.doesNotMatch(workflow, /actions\/github-script/);
});

async function runScenario(scenario, options = {}) {
  return runCmsPublishGuard({
    event: options.event ?? cmsEvent(),
    fetchImpl: scenario.fetchImpl,
    logger: { error() {}, log() {} },
    sleep: async () => {},
    token,
    ...options,
  });
}

function createScenario({
  branchRefResponse = () => branchRef(),
  checkResponses = [jsonResponse({ check_runs: successfulCheckRuns() })],
  closeResponses = [jsonResponse(closedPullRequest())],
  compareStatus = "ahead",
  deleteResponses = [emptyResponse(204)],
  mergeResponse = {
    merged: true,
    message: "Pull Request successfully merged",
    sha: mergeSha,
  },
  onCloseAttempt = () => {},
  onDeleteAttempt = () => {},
  pullResponse = () => pullRequest(),
} = {}) {
  const state = {
    branchReads: 0,
    checkReads: 0,
    closed: false,
    compared: false,
    deleteCalls: 0,
    deleted: false,
    mergeBody: null,
    merged: false,
    patchCalls: 0,
    pullReads: 0,
  };
  const fetchImpl = createFetch(async ({ body, method, path }) => {
    if (path === pullPath()) {
      if (method === "PATCH") {
        assert.deepEqual(body, { state: "closed" });
        state.closed = true;
        const response =
          closeResponses[Math.min(state.patchCalls, closeResponses.length - 1)];
        state.patchCalls += 1;
        onCloseAttempt(state.patchCalls);

        if (response instanceof Error) {
          throw response;
        }

        return response;
      }

      state.pullReads += 1;
      return jsonResponse(pullResponse(state.pullReads));
    }

    if (path === checkRunsPath()) {
      const response =
        checkResponses[Math.min(state.checkReads, checkResponses.length - 1)];
      state.checkReads += 1;
      return response;
    }

    if (path === mainRefPath()) {
      return jsonResponse(mainRef());
    }

    if (path === comparePath()) {
      state.compared = true;
      return jsonResponse(compareResponse(compareStatus));
    }

    if (path === mergePath() && method === "PUT") {
      state.mergeBody = body;
      state.merged = true;
      return mergeResponse instanceof Response
        ? mergeResponse
        : jsonResponse(mergeResponse);
    }

    if (path === branchRefPath() && method === "GET") {
      state.branchReads += 1;
      const response = branchRefResponse(state.branchReads);
      return response instanceof Response ? response : jsonResponse(response);
    }

    if (path === branchRefsPath() && method === "DELETE") {
      const response =
        deleteResponses[
          Math.min(state.deleteCalls, deleteResponses.length - 1)
        ];
      state.deleteCalls += 1;
      onDeleteAttempt(state.deleteCalls);
      state.deleted = [204, 404].includes(response.status);
      return response;
    }

    throw new Error(`Unexpected request: ${method} ${path}`);
  });

  return { fetchImpl, state };
}

function cmsEvent({
  action = "opened",
  branch = CMS_PUBLISH_BRANCH,
  fork = false,
  headRepository = CMS_REPOSITORY,
} = {}) {
  return {
    action,
    number: pullNumber,
    pull_request: {
      base: {
        ref: "main",
        repo: { full_name: CMS_REPOSITORY },
      },
      head: {
        ref: branch,
        repo: { fork, full_name: headRepository },
        sha: headSha,
      },
      node_id: nodeId,
      number: pullNumber,
    },
    repository: { full_name: CMS_REPOSITORY },
  };
}

function pullRequest({ mergeable = true, mergeableState = "clean" } = {}) {
  return {
    base: {
      ref: "main",
      repo: { full_name: CMS_REPOSITORY },
    },
    draft: false,
    head: {
      ref: CMS_PUBLISH_BRANCH,
      repo: { full_name: CMS_REPOSITORY },
      sha: headSha,
    },
    merge_commit_sha: null,
    mergeable,
    mergeable_state: mergeableState,
    merged: false,
    merged_at: null,
    node_id: nodeId,
    number: pullNumber,
    state: "open",
  };
}

function closedPullRequest() {
  return {
    ...pullRequest(),
    mergeable: null,
    mergeable_state: "unknown",
    state: "closed",
  };
}

function mergedPullRequest() {
  return {
    ...closedPullRequest(),
    merge_commit_sha: mergeSha,
    merged: true,
    merged_at: "2026-07-28T02:00:00Z",
  };
}

function successfulCheckRuns() {
  return [
    checkRun({
      appId: 15368,
      conclusion: "success",
      id: 1,
      name: "Build and Format",
    }),
    checkRun({
      appId: 85455,
      conclusion: "success",
      id: 2,
      name: "Cloudflare Pages",
    }),
  ];
}

function pendingCheckRuns() {
  return [
    checkRun({
      appId: 15368,
      conclusion: null,
      id: 1,
      name: "Build and Format",
      status: "in_progress",
    }),
    checkRun({
      appId: 85455,
      conclusion: "success",
      id: 2,
      name: "Cloudflare Pages",
    }),
  ];
}

function failedCheckResponse() {
  return jsonResponse({
    check_runs: [
      checkRun({
        appId: 15368,
        conclusion: "failure",
        id: 1,
        name: "Build and Format",
      }),
    ],
  });
}

function checkRun({ appId, conclusion, id, name, status = "completed" }) {
  return { app: { id: appId }, conclusion, id, name, status };
}

function mainRef() {
  return {
    object: { sha: baseSha, type: "commit" },
    ref: "refs/heads/main",
  };
}

function compareResponse(status) {
  if (status === "ahead") {
    return {
      ahead_by: 1,
      base_commit: { sha: baseSha },
      behind_by: 0,
      commits: [{ sha: headSha }],
      merge_base_commit: { sha: baseSha },
      status,
    };
  }

  if (status === "diverged") {
    return {
      ahead_by: 1,
      base_commit: { sha: baseSha },
      behind_by: 1,
      commits: [{ sha: headSha }],
      merge_base_commit: { sha: "d".repeat(40) },
      status,
    };
  }

  if (status === "behind") {
    return {
      ahead_by: 0,
      base_commit: { sha: baseSha },
      behind_by: 1,
      commits: [],
      merge_base_commit: { sha: headSha },
      status,
    };
  }

  throw new Error(`Unsupported comparison status: ${status}`);
}

function branchRef(sha = headSha) {
  return {
    object: { sha, type: "commit" },
    ref: `refs/heads/${CMS_PUBLISH_BRANCH}`,
  };
}

function pullPath() {
  return `/repos/${CMS_REPOSITORY}/pulls/${pullNumber}`;
}

function mergePath() {
  return `${pullPath()}/merge`;
}

function checkRunsPath() {
  return `/repos/${CMS_REPOSITORY}/commits/${headSha}/check-runs?per_page=100`;
}

function mainRefPath() {
  return `/repos/${CMS_REPOSITORY}/git/ref/heads/main`;
}

function comparePath() {
  return `/repos/${CMS_REPOSITORY}/compare/${baseSha}...${headSha}`;
}

function branchRefPath() {
  return `/repos/${CMS_REPOSITORY}/git/ref/heads/${CMS_PUBLISH_BRANCH}`;
}

function branchRefsPath() {
  return `/repos/${CMS_REPOSITORY}/git/refs/heads/${CMS_PUBLISH_BRANCH}`;
}

function createFetch(handler) {
  return async (input, init = {}) => {
    const url = new URL(String(input));
    const body =
      typeof init.body === "string" ? JSON.parse(init.body) : undefined;
    const authorization = new Headers(init.headers).get("Authorization");

    assert.equal(url.origin, "https://api.github.com");
    assert.equal(authorization, `Bearer ${token}`);

    return handler({
      body,
      method: init.method ?? "GET",
      path: `${url.pathname}${url.search}`,
    });
  };
}

function jsonResponse(value, status = 200, headers = {}) {
  return new Response(JSON.stringify(value), {
    headers: { "Content-Type": "application/json", ...headers },
    status,
  });
}

function emptyResponse(status) {
  return new Response(null, { status });
}
