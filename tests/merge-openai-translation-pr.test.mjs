import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  hasOnlyAllowedTranslationFiles,
  isEligiblePullRequest,
  runMergeAutomation,
} from "../scripts/merge-openai-translation-pr.mjs";

const REPOSITORY = "acecore-systems/acecore-systems";
const HEAD_SHA = "a".repeat(40);
const SOURCE_HASH = "b".repeat(64);

function createPullRequest({
  authorLogin = "acecore-translation-bot[bot]",
  headRepository = REPOSITORY,
  body = `<!-- openai-translation-source:${SOURCE_HASH} -->`,
  mergeableState = "clean",
  draft = false,
  autoMerge = null,
} = {}) {
  return {
    number: 42,
    state: "open",
    base: { ref: "main" },
    head: {
      ref: "translation/workers-ai/batch_example",
      sha: HEAD_SHA,
      repo: { full_name: headRepository },
    },
    user: { login: authorLogin },
    title: "[translation] Workers AI Batch batch_example",
    body,
    draft,
    mergeable_state: mergeableState,
    auto_merge: autoMerge,
    node_id: "PR_kwDORlSgas123",
  };
}

test("古いsourceHashのPRはmergeせずclosedにする", async () => {
  const requests = [];
  const request = async (pathname, options) => {
    requests.push({ pathname, options });
    if (!options?.method) {
      return createPullRequest({
        body: "<!-- openai-translation-source:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa -->",
      });
    }
    if (options.method === "PATCH") return {};
    throw new Error(`Unexpected request: ${pathname}`);
  };

  await runMergeAutomation(["--pr=42"], {
    request,
    graphql: async () => {
      throw new Error("GraphQL must not be called for a stale PR");
    },
    repository: REPOSITORY,
    getCurrentSourceHash: () => SOURCE_HASH,
  });

  assert.deepEqual(requests, [
    { pathname: "/pulls/42", options: undefined },
    {
      pathname: "/pulls/42",
      options: {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ state: "closed" }),
      },
    },
  ]);
});

test("専用Botと同一repositoryの翻訳PRだけを対象にする", () => {
  assert.equal(isEligiblePullRequest(createPullRequest(), REPOSITORY), true);
  assert.equal(
    isEligiblePullRequest(
      createPullRequest({ authorLogin: "untrusted-user" }),
      REPOSITORY,
    ),
    false,
  );
  assert.equal(
    isEligiblePullRequest(
      createPullRequest({ headRepository: "untrusted/acecore-systems" }),
      REPOSITORY,
    ),
    false,
  );
});

test("翻訳PRは所定の翻訳ファイルだけを変更できる", () => {
  assert.equal(
    hasOnlyAllowedTranslationFiles([
      "src/i18n/content/en.json",
      "src/content/insights/fr/example.md",
      "src/i18n/ui.ts",
      "src/i18n/contact-form.ts",
      "src/i18n/translation-state.json",
    ]),
    true,
  );
  assert.equal(hasOnlyAllowedTranslationFiles([]), false);
  assert.equal(
    hasOnlyAllowedTranslationFiles(["src/i18n/content/ja.json"]),
    false,
  );
  assert.equal(
    hasOnlyAllowedTranslationFiles([".github/workflows/ci.yml"]),
    false,
  );
});

test("mergeable判定が未確定でもbehindの翻訳PRをmainへ追従させる", async () => {
  const requests = [];
  const request = async (pathname, options) => {
    requests.push({ pathname, options });
    if (pathname === "/pulls/42") {
      return createPullRequest({ mergeableState: "unknown" });
    }
    if (pathname === "/pulls/42/files?per_page=100&page=1") {
      return [{ filename: "src/i18n/content/en.json" }];
    }
    if (pathname === `/compare/main...${HEAD_SHA}`) {
      return { status: "diverged", ahead_by: 1, behind_by: 3 };
    }
    if (pathname === "/pulls/42/update-branch") {
      return { message: "Updating pull request branch." };
    }
    throw new Error(`Unexpected request: ${pathname}`);
  };

  await runMergeAutomation(["--pr=42"], {
    request,
    graphql: async () => {
      throw new Error("GraphQL must not be called while updating a branch");
    },
    repository: REPOSITORY,
    getCurrentSourceHash: () => SOURCE_HASH,
  });

  assert.deepEqual(requests.at(-1), {
    pathname: "/pulls/42/update-branch",
    options: {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ expected_head_sha: HEAD_SHA }),
    },
  });
});

test("成功したBuild and Format後に検証済みSHAでsquash Auto-mergeを予約する", async () => {
  const graphqlCalls = [];
  const request = async (pathname) => {
    if (pathname === "/pulls/42") {
      return createPullRequest({ mergeableState: "blocked" });
    }
    if (pathname === "/pulls/42/files?per_page=100&page=1") {
      return [{ filename: "src/i18n/content/en.json" }];
    }
    if (pathname === `/compare/main...${HEAD_SHA}`) {
      return { status: "ahead", ahead_by: 1, behind_by: 0 };
    }
    if (pathname === `/commits/${HEAD_SHA}/check-runs?per_page=100`) {
      return {
        check_runs: [{ name: "Build and Format", conclusion: "success" }],
      };
    }
    throw new Error(`Unexpected request: ${pathname}`);
  };
  const graphql = async (query, variables) => {
    graphqlCalls.push({ query, variables });
    return {
      enablePullRequestAutoMerge: {
        pullRequest: {
          number: 42,
          merged: false,
          autoMergeRequest: { mergeMethod: "SQUASH" },
        },
      },
    };
  };

  await runMergeAutomation([`--pr=42`, `--expected-sha=${HEAD_SHA}`], {
    request,
    graphql,
    repository: REPOSITORY,
    getCurrentSourceHash: () => SOURCE_HASH,
  });

  assert.equal(graphqlCalls.length, 1);
  assert.match(graphqlCalls[0].query, /mergeMethod: SQUASH/u);
  assert.deepEqual(graphqlCalls[0].variables, {
    pullRequestId: "PR_kwDORlSgas123",
    expectedHeadOid: HEAD_SHA,
    commitHeadline: "[translation] Workers AI Batch batch_example",
  });
});

test("必須checkが揃ったcleanのPRは検証済みSHAでsquash mergeする", async () => {
  const graphqlCalls = [];
  const request = async (pathname) => {
    if (pathname === "/pulls/42") return createPullRequest();
    if (pathname === "/pulls/42/files?per_page=100&page=1") {
      return [{ filename: "src/i18n/content/en.json" }];
    }
    if (pathname === `/compare/main...${HEAD_SHA}`) {
      return { status: "ahead", ahead_by: 1, behind_by: 0 };
    }
    if (pathname === `/commits/${HEAD_SHA}/check-runs?per_page=100`) {
      return {
        check_runs: [{ name: "Build and Format", conclusion: "success" }],
      };
    }
    throw new Error(`Unexpected request: ${pathname}`);
  };
  const graphql = async (query, variables) => {
    graphqlCalls.push({ query, variables });
    return {
      mergePullRequest: {
        pullRequest: { number: 42, merged: true },
      },
    };
  };

  await runMergeAutomation([`--pr=42`, `--expected-sha=${HEAD_SHA}`], {
    request,
    graphql,
    repository: REPOSITORY,
    getCurrentSourceHash: () => SOURCE_HASH,
  });

  assert.equal(graphqlCalls.length, 1);
  assert.match(graphqlCalls[0].query, /mergePullRequest/u);
  assert.match(graphqlCalls[0].query, /mergeMethod: SQUASH/u);
  assert.deepEqual(graphqlCalls[0].variables, {
    pullRequestId: "PR_kwDORlSgas123",
    expectedHeadOid: HEAD_SHA,
    commitHeadline: "[translation] Workers AI Batch batch_example",
  });
});

test("Build and Formatが成功していないHEADではAuto-mergeを予約しない", async () => {
  const request = async (pathname) => {
    if (pathname === "/pulls/42") return createPullRequest();
    if (pathname === "/pulls/42/files?per_page=100&page=1") {
      return [{ filename: "src/i18n/content/en.json" }];
    }
    if (pathname === `/compare/main...${HEAD_SHA}`) {
      return { status: "ahead", ahead_by: 1, behind_by: 0 };
    }
    if (pathname === `/commits/${HEAD_SHA}/check-runs?per_page=100`) {
      return {
        check_runs: [{ name: "Build and Format", conclusion: "failure" }],
      };
    }
    throw new Error(`Unexpected request: ${pathname}`);
  };

  await runMergeAutomation(["--pr=42"], {
    request,
    graphql: async () => {
      throw new Error("GraphQL must not be called after a failed check");
    },
    repository: REPOSITORY,
    getCurrentSourceHash: () => SOURCE_HASH,
  });
});

test("CI成功とmain更新の両方で安全なAuto-merge経路を再評価する", async () => {
  const [workflow, ciWorkflow, script] = await Promise.all([
    readFile(".github/workflows/merge-openai-translation-pr.yml", "utf8"),
    readFile(".github/workflows/ci.yml", "utf8"),
    readFile("scripts/merge-openai-translation-pr.mjs", "utf8"),
  ]);

  assert.match(workflow, /workflow_run:/u);
  assert.match(workflow, /workflows:\s*\n\s*- CI/u);
  assert.match(workflow, /push:\s+branches:\s+- main/u);
  assert.match(workflow, /contents:\s+read/u);
  assert.match(workflow, /pull-requests:\s+read/u);
  assert.match(workflow, /actions\/create-github-app-token@v3/u);
  assert.match(
    workflow,
    /client-id:\s+\$\{\{ secrets\.TRANSLATION_BOT_CLIENT_ID \}\}/u,
  );
  assert.doesNotMatch(workflow, /TRANSLATION_BOT_APP_ID/u);
  assert.doesNotMatch(workflow, /^\s+app-id:/mu);
  assert.match(
    workflow,
    /GITHUB_TOKEN: \$\{\{ steps\.app-token\.outputs\.token \}\}/u,
  );
  assert.match(
    workflow,
    /PR_NUMBERS: \$\{\{ steps\.pr\.outputs\.numbers \}\}/u,
  );
  assert.match(workflow, /--expected-sha=/u);
  assert.match(ciWorkflow, /npm run test:openai-translation/u);
  assert.match(script, /isTranslationPullRequestCurrent/u);
  assert.match(script, /hasOnlyAllowedTranslationFiles/u);
  assert.match(script, /update-branch/u);
  assert.match(script, /mergePullRequest/u);
  assert.match(script, /enablePullRequestAutoMerge/u);
  assert.doesNotMatch(script, /\/pulls\/\$\{pullRequest\.number\}\/merge/u);
});
