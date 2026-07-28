import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { afterEach, test } from "node:test";

import {
  CMS_REPOSITORY,
  isAllowedCmsDeletePath,
  isAllowedCmsDirectoryPath,
  isAllowedCmsWritePath,
} from "../functions/admin/api/_cms-policy.ts";
import { clearGitHubEditorCacheForTests } from "../functions/admin/api/_github-oauth.ts";
import { onRequestPost as handleGraphql } from "../functions/admin/api/graphql.ts";
import { onRequest as handleGithubRest } from "../functions/admin/api/github/[[path]].ts";

const originalFetch = globalThis.fetch;
const originalConsoleError = console.error;
const mainSha = "a".repeat(40);
const topicSha = "b".repeat(40);
const oauthToken = "ghu_test-oauth-token";
const cmsOrigin = "https://systems.acecore.net";
const repositoryApi = `https://api.github.com/repos/${CMS_REPOSITORY.owner}/${CMS_REPOSITORY.name}`;
const branchPrefix = "cms/systems/";
const publishBranch = `${branchPrefix}publish`;
const contentPath = "src/data/home.json";
const pullRequestNodeId = "PR_kwDOExample";
const rejectedPath = "src/pages/index.astro";
const collectionWritePaths = [
  "src/data/site.json",
  "src/data/services.json",
  "src/data/it-advisor.json",
  "src/data/pricing.json",
  "src/data/guide.json",
  "src/data/works.json",
  "src/data/contact.json",
  "src/data/privacy.json",
  "src/data/service-details/site-functions.json",
  "src/data/service-details/site-quality.json",
  "src/data/service-details/operations.json",
  "src/data/work-details/acecore-site-platform.json",
];
const unlistedContentPath = "src/data/service-details/unlisted.json";

const editor = {
  avatar_url: "https://avatars.githubusercontent.com/u/1",
  email: null,
  html_url: "https://github.com/editor",
  id: 1,
  login: "editor",
  name: "Editor",
  type: "User",
};

afterEach(() => {
  globalThis.fetch = originalFetch;
  console.error = originalConsoleError;
  clearGitHubEditorCacheForTests();
});

test("CMS対象pathだけを許可する", () => {
  assert.equal(isAllowedCmsWritePath(contentPath), true);
  for (const path of collectionWritePaths) {
    assert.equal(isAllowedCmsWritePath(path), true);
  }
  assert.equal(isAllowedCmsWritePath("public/uploads/example.png"), true);
  assert.equal(isAllowedCmsDeletePath("public/uploads/example.png"), true);
  assert.equal(isAllowedCmsDeletePath(contentPath), false);
  assert.equal(isAllowedCmsWritePath("public/uploads/example.svg"), false);
  assert.equal(isAllowedCmsWritePath("public/uploads/example.pdf"), false);
  assert.equal(isAllowedCmsWritePath(rejectedPath), false);
  assert.equal(isAllowedCmsWritePath(unlistedContentPath), false);
  assert.equal(isAllowedCmsWritePath("README.md"), false);
  assert.equal(isAllowedCmsWritePath("../README.md"), false);
  assert.equal(isAllowedCmsWritePath(`${contentPath}\nREADME.md`), false);
});

test("CMS設定で公開したfolderとfileがproxyの許可範囲に収まる", async () => {
  const config = await readFile(
    new URL("../public/admin/config.yml", import.meta.url),
    "utf8",
  );
  const folders = Array.from(
    config.matchAll(/^\s*folder:\s*([^,\s]+),?\s*$/gm),
    (match) => match[1],
  );
  const files = Array.from(
    config.matchAll(/^\s*file:\s*([^,\s]+),?\s*$/gm),
    (match) => match[1],
  );

  assert.ok(folders.length > 0);
  assert.ok(files.length > 0);

  for (const path of folders) {
    assert.equal(isAllowedCmsDirectoryPath(path), true, path);
  }

  for (const path of files) {
    assert.equal(isAllowedCmsWritePath(path), true, path);
  }
});

test("GitHub OAuth認証がないrequestを拒否する", async () => {
  let called = false;
  globalThis.fetch = async () => {
    called = true;
    throw new Error("GitHub must not be called");
  };

  const response = await handleGraphql({
    request: graphqlRequest({ authorization: null }),
  });

  assert.equal(response.status, 401);
  assert.equal(called, false);
});

test("GitHub App user token以外をGitHubへの通信前に拒否する", async () => {
  let called = false;
  globalThis.fetch = async () => {
    called = true;
    throw new Error("GitHub must not be called");
  };

  const response = await handleGraphql({
    request: graphqlRequest({
      authorization: "Bearer github_pat_broad-token",
    }),
  });

  assert.equal(response.status, 401);
  assert.equal(called, false);
});

test("previewのCMS APIをGitHubへの通信前に拒否する", async () => {
  let called = false;
  globalThis.fetch = async () => {
    called = true;
    throw new Error("GitHub must not be called");
  };

  const response = await handleGraphql({
    request: graphqlRequest({
      origin: "https://preview.pages.dev",
    }),
  });

  assert.equal(response.status, 403);
  assert.equal(called, false);
});

test("repositoryへのpush権限がないGitHub userを拒否する", async () => {
  mockGitHub(async () => {
    throw new Error("CMS operation must not continue");
  }, false);

  const response = await handleGraphql({
    request: graphqlRequest(),
  });

  assert.equal(response.status, 403);
  assert.match((await response.json()).message, /write権限/);
});

test("Sveltia CMS 0.172のlast-commit queryを許可する", async () => {
  mockGitHub(async (url, _init, body) => {
    assert.match(url, /\/graphql$/);
    assert.match(body.query, /ref\(qualifiedName: \$branch\)/);

    return jsonResponse({
      data: {
        repository: {
          ref: {
            target: {
              history: { nodes: [{ oid: mainSha, message: "latest" }] },
            },
          },
        },
      },
    });
  });

  const response = await handleGraphql({
    request: graphqlReadRequest(
      `
        query($owner: String!, $repo: String!, $branch: String!) {
          repository(owner: $owner, name: $repo) {
            ref(qualifiedName: $branch) {
              target {
                ... on Commit {
                  history(first: 1) { nodes { oid message } }
                }
              }
            }
          }
        }
      `,
      {
        owner: CMS_REPOSITORY.owner,
        repo: CMS_REPOSITORY.name,
        branch: "main",
      },
    ),
  });

  assert.equal(response.status, 200);
});

test("Sveltia CMS 0.172のcontent queryをCMS対象blobだけ許可する", async () => {
  const blobSha = "b".repeat(40);

  mockGitHub(async (url, _init, body) => {
    if (url.includes("/git/trees/main?recursive=1")) {
      return jsonResponse({
        sha: mainSha,
        truncated: false,
        tree: [
          {
            mode: "100644",
            path: contentPath,
            sha: blobSha,
            size: 12,
            type: "blob",
          },
        ],
      });
    }

    assert.match(url, /\/graphql$/);
    assert.match(body.query, /content_0:\s*object/);
    assert.match(body.query, /commit_0:\s*ref/);

    return jsonResponse({ data: { repository: {} } });
  });

  const response = await handleGraphql({
    request: graphqlReadRequest(
      `
        query($owner: String!, $repo: String!, $branch: String!) {
          repository(owner: $owner, name: $repo) {
            content_0: object(oid: "${blobSha}") {
              ... on Blob { text }
            }
            commit_0: ref(qualifiedName: $branch) {
              target {
                ... on Commit {
                  history(first: 1, path: "${contentPath}") {
                    nodes {
                      author {
                        name
                        email
                        user { id: databaseId login }
                      }
                      committedDate
                    }
                  }
                }
              }
            }
          }
        }
      `,
      {
        owner: CMS_REPOSITORY.owner,
        repo: CMS_REPOSITORY.name,
        branch: "main",
      },
    ),
  });

  assert.equal(response.status, 200);
});

test("画像と本文を固定branchの1 commit・1 PRへ保存して自動公開を待機する", async () => {
  const calls = [];
  let cmsBranch = "";

  mockGitHub(async (url, init, body) => {
    calls.push({ url, init, body });

    if (url.endsWith("/git/ref/heads/main")) {
      return jsonResponse({ object: { sha: mainSha } });
    }

    if (url.endsWith("/git/refs")) {
      cmsBranch = body.ref.replace("refs/heads/", "");
      assert.equal(cmsBranch, publishBranch);
      assert.equal(body.sha, mainSha);

      return jsonResponse({ ref: body.ref, object: { sha: mainSha } }, 201);
    }

    if (url.endsWith("/graphql") && body.query.includes("mutation CmsCommit")) {
      assert.match(body.query, /mutation CmsCommit/);
      assert.equal(
        body.variables.input.branch.repositoryNameWithOwner,
        `${CMS_REPOSITORY.owner}/${CMS_REPOSITORY.name}`,
      );
      assert.equal(body.variables.input.branch.branchName, cmsBranch);
      assert.equal(body.variables.input.expectedHeadOid, mainSha);
      assert.deepEqual(
        body.variables.input.fileChanges.additions.map(({ path }) => path),
        ["public/uploads/example.png", contentPath],
      );

      return jsonResponse({
        data: {
          createCommitOnBranch: {
            commit: {
              oid: topicSha,
              committedDate: "2026-07-20T00:00:00Z",
              file_0: { oid: "c".repeat(40) },
              file_1: { oid: "d".repeat(40) },
            },
          },
        },
      });
    }

    if (url.endsWith("/pulls")) {
      assert.equal(body.head, cmsBranch);
      assert.equal(body.base, "main");
      assert.match(body.body, /GitHub user: @editor/);
      assert.match(body.body, new RegExp(contentPath.replaceAll("/", "\\/")));

      return jsonResponse(
        pullRequestResponse({
          branch: cmsBranch,
          headSha: topicSha,
          nodeId: pullRequestNodeId,
          number: 91,
        }),
        201,
      );
    }

    throw new Error(`Unexpected GitHub request: ${url}`);
  });

  const response = await handleGraphql({
    request: graphqlRequest({
      variables: {
        input: {
          branch: {
            repositoryNameWithOwner: `${CMS_REPOSITORY.owner}/${CMS_REPOSITORY.name}`,
            branchName: "main",
          },
          expectedHeadOid: mainSha,
          fileChanges: {
            additions: [
              {
                path: "public/uploads/example.png",
                contents: Buffer.from("image").toString("base64"),
              },
              {
                path: contentPath,
                contents: Buffer.from("content").toString("base64"),
              },
            ],
            deletions: [],
          },
          message: { headline: "cms: update example" },
        },
      },
    }),
  });
  const result = await response.json();

  assert.equal(response.status, 200);
  assert.equal(result.extensions.cms.branch, cmsBranch);
  assert.equal(result.extensions.cms.pull_request.number, 91);
  assert.deepEqual(result.extensions.cms.publication, {
    queued: true,
    merge_method: "SQUASH",
    publisher: "CMS Publish Guard",
  });
  assert.equal(calls.length, 4);
});

test("PR作成応答が不明でも同じheadのopen PRから成功応答へ復旧する", async () => {
  let cmsBranch = "";
  let deleted = false;

  mockGitHub(async (url, init, body) => {
    if (url.endsWith("/git/ref/heads/main")) {
      return jsonResponse({ object: { sha: mainSha } });
    }

    if (url.endsWith("/git/refs")) {
      cmsBranch = body.ref.replace("refs/heads/", "");
      return jsonResponse({ ref: body.ref, object: { sha: mainSha } }, 201);
    }

    if (url.endsWith("/graphql") && body.query.includes("mutation CmsCommit")) {
      return commitResponse();
    }

    if (url.endsWith("/pulls") && init.method === "POST") {
      return jsonResponse({}, 201);
    }

    if (url.includes("/pulls?") && init.method === "GET") {
      assertPullRequestLookup(url, cmsBranch);

      return jsonResponse([
        {
          number: 92,
          node_id: pullRequestNodeId,
          html_url:
            "https://github.com/acecore-systems/acecore-systems/pull/92",
          state: "open",
          head: {
            ref: cmsBranch,
            sha: topicSha,
            repo: {
              full_name: `${CMS_REPOSITORY.owner}/${CMS_REPOSITORY.name}`,
            },
          },
          base: {
            ref: CMS_REPOSITORY.branch,
            repo: {
              full_name: `${CMS_REPOSITORY.owner}/${CMS_REPOSITORY.name}`,
            },
          },
        },
      ]);
    }

    if (init.method === "DELETE") {
      deleted = true;
      return new Response(null, { status: 204 });
    }

    throw new Error(`Unexpected GitHub request: ${url}`);
  });

  const response = await handleGraphql({ request: graphqlRequest() });
  const result = await response.json();

  assert.equal(response.status, 200);
  assert.equal(result.extensions.cms.branch, cmsBranch);
  assert.equal(result.extensions.cms.pull_request.number, 92);
  assert.equal(deleted, false);
});

test("先行するCMS公開用PRがある間は新しい保存を開始しない", async () => {
  const pendingBranch = `${branchPrefix}pending`;
  let branchCreated = false;
  let mainRequested = false;

  mockGitHub(
    async (url) => {
      if (url.endsWith("/git/ref/heads/main")) {
        mainRequested = true;
        return jsonResponse({ object: { sha: mainSha } });
      }

      if (url.endsWith("/git/refs")) {
        branchCreated = true;
      }

      throw new Error(`Unexpected GitHub request: ${url}`);
    },
    {
      pendingPullRequests: [
        pullRequestResponse({
          branch: pendingBranch,
          headSha: topicSha,
          nodeId: pullRequestNodeId,
          number: 93,
        }),
      ],
    },
  );

  const response = await handleGraphql({ request: graphqlRequest() });
  const result = await response.json();

  assert.equal(response.status, 409);
  assert.match(result.message, /前のCMS保存を公開中/);
  assert.equal(result.pull_request.number, 93);
  assert.equal(branchCreated, false);
  assert.equal(mainRequested, false);
});

test("repositoryのsquash merge設定が不足していればbranch作成前に拒否する", async () => {
  let branchCreated = false;

  mockGitHub(
    async (url) => {
      if (url.endsWith("/git/ref/heads/main")) {
        return jsonResponse({ object: { sha: mainSha } });
      }

      if (url.endsWith("/git/refs")) {
        branchCreated = true;
      }

      throw new Error(`Unexpected GitHub request: ${url}`);
    },
    {
      repositorySettings: {
        allow_squash_merge: false,
      },
    },
  );

  const response = await handleGraphql({ request: graphqlRequest() });
  const result = await response.json();

  assert.equal(response.status, 503);
  assert.match(result.message, /自動公開のsquash merge設定/);
  assert.equal(branchCreated, false);
});

test("固定CMS branchを原子的lockとして同時保存を拒否する", async () => {
  let commitCalled = false;

  mockGitHub(async (url, init, body) => {
    if (url.endsWith("/git/ref/heads/main")) {
      return jsonResponse({ object: { sha: mainSha } });
    }

    if (url.endsWith("/git/refs")) {
      assert.equal(body.ref, `refs/heads/${publishBranch}`);
      return jsonResponse({ message: "Reference already exists" }, 422);
    }

    if (url.endsWith("/graphql")) {
      commitCalled = true;
    }

    throw new Error(`Unexpected GitHub request: ${url}`);
  });

  const response = await handleGraphql({ request: graphqlRequest() });
  const result = await response.json();

  assert.equal(response.status, 409);
  assert.match(result.message, /前のCMS保存を公開中/);
  assert.equal(commitCalled, false);
});

test("公開lock取得直前のmain HEADが変わっていれば保存を拒否する", async () => {
  let branchCreated = false;

  mockGitHub(async (url) => {
    if (url.endsWith("/git/ref/heads/main")) {
      return jsonResponse({ object: { sha: "f".repeat(40) } });
    }

    if (url.endsWith("/git/refs")) {
      branchCreated = true;
    }

    throw new Error(`Unexpected GitHub request: ${url}`);
  });

  const response = await handleGraphql({ request: graphqlRequest() });
  const result = await response.json();

  assert.equal(response.status, 409);
  assert.match(result.message, /mainが更新されています/);
  assert.equal(branchCreated, false);
});

test("PR作成失敗後の照会が成功してopen PRがなければbranchを削除する", async () => {
  let cmsBranch = "";
  let deletedBranch = "";

  mockGitHub(async (url, init, body) => {
    if (url.endsWith("/git/ref/heads/main")) {
      return jsonResponse({ object: { sha: mainSha } });
    }

    if (url.endsWith("/git/refs")) {
      cmsBranch = body.ref.replace("refs/heads/", "");
      return jsonResponse({ ref: body.ref, object: { sha: mainSha } }, 201);
    }

    if (url.endsWith("/graphql")) {
      return commitResponse();
    }

    if (url.endsWith("/pulls") && init.method === "POST") {
      return jsonResponse({ message: "PR creation failed" }, 502);
    }

    if (url.includes("/pulls?") && init.method === "GET") {
      assertPullRequestLookup(url, cmsBranch);
      return jsonResponse([]);
    }

    if (init.method === "DELETE") {
      deletedBranch = url;
      return new Response(null, { status: 204 });
    }

    throw new Error(`Unexpected GitHub request: ${url}`);
  });

  const response = await handleGraphql({ request: graphqlRequest() });
  const result = await response.json();

  assert.equal(response.status, 502);
  assert.equal(result.message, "PR creation failed");
  assert.match(deletedBranch, /\/git\/refs\/heads\/cms\/systems\//);
});

test("PR作成失敗後の照会にも失敗した場合はbranchを残して元のエラーを返す", async () => {
  let cmsBranch = "";
  let deleted = false;
  const errors = [];
  console.error = (...args) => errors.push(args.join(" "));

  mockGitHub(async (url, init, body) => {
    if (url.endsWith("/git/ref/heads/main")) {
      return jsonResponse({ object: { sha: mainSha } });
    }

    if (url.endsWith("/git/refs")) {
      cmsBranch = body.ref.replace("refs/heads/", "");
      return jsonResponse({ ref: body.ref, object: { sha: mainSha } }, 201);
    }

    if (url.endsWith("/graphql")) {
      return commitResponse();
    }

    if (url.endsWith("/pulls") && init.method === "POST") {
      return jsonResponse({ message: "Original PR error" }, 422);
    }

    if (url.includes("/pulls?") && init.method === "GET") {
      assertPullRequestLookup(url, cmsBranch);
      return jsonResponse({ message: "Lookup unavailable" }, 503);
    }

    if (init.method === "DELETE") {
      deleted = true;
      return new Response(null, { status: 204 });
    }

    throw new Error(`Unexpected GitHub request: ${url}`);
  });

  const response = await handleGraphql({ request: graphqlRequest() });
  const result = await response.json();

  assert.equal(response.status, 422);
  assert.equal(result.message, "Original PR error");
  assert.equal(deleted, false);
  assert.match(errors.join("\n"), /Failed to recover CMS pull request/);
});

test("commit処理のunknown errorでも作成済みbranchの削除を試行する", async () => {
  let cmsBranch = "";
  let deletedBranch = "";
  const errors = [];
  console.error = (...args) => errors.push(args.join(" "));

  mockGitHub(async (url, init, body) => {
    if (url.endsWith("/git/ref/heads/main")) {
      return jsonResponse({ object: { sha: mainSha } });
    }

    if (url.endsWith("/git/refs")) {
      cmsBranch = body.ref.replace("refs/heads/", "");
      return jsonResponse({ ref: body.ref, object: { sha: mainSha } }, 201);
    }

    if (url.endsWith("/graphql")) {
      throw new Error("Commit transport failed");
    }

    if (init.method === "DELETE") {
      deletedBranch = url;
      return new Response(null, { status: 204 });
    }

    throw new Error(`Unexpected GitHub request: ${url}`);
  });

  const response = await handleGraphql({ request: graphqlRequest() });

  assert.equal(response.status, 500);
  assert.match(deletedBranch, /\/git\/refs\/heads\/cms\/systems\//);
  assert.ok(deletedBranch.endsWith(cmsBranch));
  assert.match(errors.join("\n"), /CMS GraphQL proxy failed/);
});

test("CMS管理対象外の保存をGitHubへ送らない", async () => {
  let cmsOperationCalled = false;

  mockGitHub(async () => {
    cmsOperationCalled = true;
    throw new Error("CMS operation must not continue");
  });

  const response = await handleGraphql({
    request: graphqlRequest({
      variables: {
        input: {
          branch: {
            repositoryNameWithOwner: `${CMS_REPOSITORY.owner}/${CMS_REPOSITORY.name}`,
            branchName: "main",
          },
          expectedHeadOid: mainSha,
          fileChanges: {
            additions: [
              {
                path: "README.md",
                contents: Buffer.from("blocked").toString("base64"),
              },
            ],
            deletions: [],
          },
          message: { headline: "cms: update blocked" },
        },
      },
    }),
  });

  assert.equal(response.status, 403);
  assert.equal(cmsOperationCalled, false);
});

test("必須JSONの削除をGitHubへ送らない", async () => {
  let cmsOperationCalled = false;

  mockGitHub(async () => {
    cmsOperationCalled = true;
    throw new Error("CMS operation must not continue");
  });

  const response = await handleGraphql({
    request: graphqlRequest({
      variables: {
        input: {
          branch: {
            repositoryNameWithOwner: `${CMS_REPOSITORY.owner}/${CMS_REPOSITORY.name}`,
            branchName: "main",
          },
          expectedHeadOid: mainSha,
          fileChanges: {
            additions: [],
            deletions: [{ path: contentPath }],
          },
          message: { headline: "cms: delete blocked" },
        },
      },
    }),
  });

  assert.equal(response.status, 403);
  assert.equal(cmsOperationCalled, false);
});

test("main以外を指定した保存を拒否する", async () => {
  let cmsOperationCalled = false;

  mockGitHub(async () => {
    cmsOperationCalled = true;
    throw new Error("CMS operation must not continue");
  });

  const response = await handleGraphql({
    request: graphqlRequest({
      variables: {
        input: {
          branch: {
            repositoryNameWithOwner: `${CMS_REPOSITORY.owner}/${CMS_REPOSITORY.name}`,
            branchName: "preview",
          },
          expectedHeadOid: mainSha,
          fileChanges: {
            additions: [
              {
                path: contentPath,
                contents: Buffer.from("blocked").toString("base64"),
              },
            ],
            deletions: [],
          },
          message: { headline: "cms: update blocked" },
        },
      },
    }),
  });

  assert.equal(response.status, 403);
  assert.equal(cmsOperationCalled, false);
});

test("Git tree responseからCMS対象外pathを除外する", async () => {
  mockGitHub(async (url) => {
    assert.match(url, /\/git\/trees\/main\?recursive=1$/);

    return jsonResponse({
      sha: mainSha,
      truncated: false,
      tree: [
        { mode: "040000", path: "src", sha: "1".repeat(40), type: "tree" },
        {
          mode: "100644",
          path: contentPath,
          sha: "2".repeat(40),
          size: 12,
          type: "blob",
        },
        {
          mode: "100644",
          path: "README.md",
          sha: "3".repeat(40),
          size: 12,
          type: "blob",
        },
      ],
    });
  });

  const response = await handleGithubRest({
    request: new Request(
      `${cmsOrigin}/admin/api/github/api/v3/repos/${CMS_REPOSITORY.owner}/${CMS_REPOSITORY.name}/git/trees/main?recursive=1`,
      { headers: authorizationHeaders() },
    ),
  });
  const result = await response.json();

  assert.equal(response.status, 200);
  assert.deepEqual(
    result.tree.filter(({ type }) => type === "blob").map(({ path }) => path),
    [contentPath],
  );
});

test("REST writeを認証前に拒否する", async () => {
  let called = false;
  globalThis.fetch = async () => {
    called = true;
    throw new Error("GitHub must not be called");
  };

  const response = await handleGithubRest({
    request: new Request(`${cmsOrigin}/admin/api/github/user`, {
      method: "POST",
      headers: authorizationHeaders(),
    }),
  });

  assert.equal(response.status, 405);
  assert.equal(called, false);
});

function mockGitHub(handler, options = {}) {
  const {
    pendingPullRequests = [],
    push = true,
    repositorySettings = {},
  } = typeof options === "boolean" ? { push: options } : options;

  globalThis.fetch = async (input, init = {}) => {
    const url = String(input);
    const body = typeof init.body === "string" ? JSON.parse(init.body) : null;

    if (url === "https://api.github.com/user") {
      assert.equal(
        new Headers(init.headers).get("Authorization"),
        `Bearer ${oauthToken}`,
      );
      return jsonResponse(editor);
    }

    if (url === repositoryApi) {
      return jsonResponse({
        allow_squash_merge: true,
        permissions: { push },
        ...repositorySettings,
      });
    }

    if (
      url ===
      `${repositoryApi}/pulls?state=open&base=${CMS_REPOSITORY.branch}&per_page=100`
    ) {
      return jsonResponse(pendingPullRequests);
    }

    return handler(url, init, body);
  };
}

function graphqlRequest({
  authorization = `Bearer ${oauthToken}`,
  origin = cmsOrigin,
  variables = {
    input: {
      branch: {
        repositoryNameWithOwner: `${CMS_REPOSITORY.owner}/${CMS_REPOSITORY.name}`,
        branchName: "main",
      },
      expectedHeadOid: mainSha,
      fileChanges: {
        additions: [
          {
            path: contentPath,
            contents: Buffer.from("content").toString("base64"),
          },
        ],
        deletions: [],
      },
      message: { headline: "cms: update example" },
    },
  },
} = {}) {
  const headers = new Headers({ "Content-Type": "application/json" });

  if (authorization) headers.set("Authorization", authorization);

  return new Request(`${origin}/admin/api/graphql`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      query: `
        mutation($input: CreateCommitOnBranchInput!) {
          createCommitOnBranch(input: $input) {
            commit { oid committedDate }
          }
        }
      `,
      variables,
    }),
  });
}

function authorizationHeaders() {
  return { Authorization: `Bearer ${oauthToken}` };
}

function graphqlReadRequest(query, variables) {
  return new Request(`${cmsOrigin}/admin/api/graphql`, {
    method: "POST",
    headers: {
      ...authorizationHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, variables }),
  });
}

function jsonResponse(value, status = 200) {
  return new Response(JSON.stringify(value), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function commitResponse() {
  return jsonResponse({
    data: {
      createCommitOnBranch: {
        commit: {
          oid: topicSha,
          committedDate: "2026-07-20T00:00:00Z",
        },
      },
    },
  });
}

function pullRequestResponse({
  branch,
  headSha,
  nodeId,
  number,
  state = "open",
}) {
  const repository = `${CMS_REPOSITORY.owner}/${CMS_REPOSITORY.name}`;

  return {
    number,
    node_id: nodeId,
    html_url: `https://github.com/${repository}/pull/${number}`,
    state,
    head: {
      ref: branch,
      sha: headSha,
      repo: { full_name: repository },
    },
    base: {
      ref: CMS_REPOSITORY.branch,
      repo: { full_name: repository },
    },
  };
}

function assertPullRequestLookup(url, branch) {
  const repository = `${CMS_REPOSITORY.owner}/${CMS_REPOSITORY.name}`;
  const parsed = new URL(url);

  assert.equal(parsed.pathname, `/repos/${repository}/pulls`);
  assert.equal(parsed.searchParams.get("state"), "open");
  assert.equal(
    parsed.searchParams.get("head"),
    `${CMS_REPOSITORY.owner}:${branch}`,
  );
  assert.equal(parsed.searchParams.get("base"), CMS_REPOSITORY.branch);
  assert.ok(
    url.includes(
      `head=${encodeURIComponent(`${CMS_REPOSITORY.owner}:${branch}`)}`,
    ),
  );
}
