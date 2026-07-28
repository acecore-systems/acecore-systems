import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, test } from "node:test";

import {
  CMS_REPOSITORY,
  isAllowedCmsDeletePath,
  isAllowedCmsDirectoryPath,
  isAllowedCmsWritePath,
} from "../functions/admin/api/_cms-policy.ts";
import { validateCmsAddition } from "../functions/admin/api/_content-validation.ts";
import { clearGitHubEditorCacheForTests } from "../functions/admin/api/_github-oauth.ts";
import { onRequestGet as handleCmsConfig } from "../functions/admin/config.yml.ts";
import { onRequestPost as handleGraphqlRequest } from "../functions/admin/api/graphql.ts";
import { onRequest as handleGithubRest } from "../functions/admin/api/github/[[path]].ts";

const originalFetch = globalThis.fetch;
const originalConsoleError = console.error;
const mainSha = "a".repeat(40);
const topicSha = "b".repeat(40);
const oauthToken = "ghu_test-oauth-token";
const cmsOrigin = "https://systems.acecore.net";
const installationId = 987654321;
const cmsEnv = {
  CMS_GITHUB_APP_INSTALLATION_ID: String(installationId),
};
const repositoryApi = `https://api.github.com/repos/${CMS_REPOSITORY.owner}/${CMS_REPOSITORY.name}`;
const contentPath = "src/data/home.json";
const validContentBase64 = (
  await readFile(new URL(`../${contentPath}`, import.meta.url))
).toString("base64");
const validPngBase64 = Buffer.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d, 0x49,
  0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, 0x08, 0x02,
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45,
  0x4e, 0x44, 0x00, 0x00, 0x00, 0x00,
]).toString("base64");
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

const handleGraphql = (context) =>
  handleGraphqlRequest({ env: cmsEnv, ...context });

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
  assert.equal(isAllowedCmsDeletePath("public/uploads/example.png"), false);
  assert.equal(isAllowedCmsDeletePath(contentPath), false);
  assert.equal(isAllowedCmsWritePath("public/uploads/example.svg"), false);
  assert.equal(isAllowedCmsWritePath("public/uploads/example.pdf"), false);
  assert.equal(isAllowedCmsWritePath(rejectedPath), false);
  assert.equal(isAllowedCmsWritePath(unlistedContentPath), false);
  assert.equal(isAllowedCmsWritePath("README.md"), false);
  assert.equal(isAllowedCmsWritePath("../README.md"), false);
  assert.equal(isAllowedCmsWritePath(`${contentPath}\nREADME.md`), false);
});

test("CMSの公開案内で画像削除をPull Requestへ案内する", async () => {
  const adminInit = await readFile(
    new URL("../public/admin/init.js", import.meta.url),
    "utf8",
  );

  assert.match(adminInit, /画像の削除は参照確認を伴うPull Request/);
});

test("現行mainの全CMS対象ファイルを同期validatorが受理する", async () => {
  const contentPaths = [contentPath, ...collectionWritePaths];
  const uploadRoot = new URL("../public/uploads/", import.meta.url);
  const repositoryRoot = fileURLToPath(new URL("../", import.meta.url));
  const uploads = await readdir(uploadRoot, {
    recursive: true,
    withFileTypes: true,
  }).catch((error) => {
    if (error?.code === "ENOENT") return [];
    throw error;
  });

  for (const path of contentPaths) {
    const bytes = await readFile(new URL(`../${path}`, import.meta.url));
    const validation = validateCmsAddition(path, bytes.toString("base64"));

    assert.equal(validation.ok, true, path);
  }

  for (const entry of uploads) {
    if (!entry.isFile()) continue;
    const absolutePath = `${entry.parentPath}/${entry.name}`;
    const relativePath = path
      .relative(repositoryRoot, absolutePath)
      .replaceAll("\\", "/");

    if (!isAllowedCmsWritePath(relativePath)) continue;

    const bytes = await readFile(absolutePath);
    const validation = validateCmsAddition(
      relativePath,
      bytes.toString("base64"),
    );

    assert.equal(validation.ok, true, relativePath);
  }
});

test("壊れたJSONと拡張子を偽装した画像を同期validatorが拒否する", () => {
  assert.equal(
    validateCmsAddition(contentPath, Buffer.from('{"hero":').toString("base64"))
      .ok,
    false,
  );
  assert.equal(
    validateCmsAddition(
      "public/uploads/spoofed.png",
      Buffer.from('<svg onload="alert(1)"/>').toString("base64"),
    ).ok,
    false,
  );
});

test("CMS由来のlink・form action・画像URLを安全なpathまたはHTTPSに限定する", async () => {
  for (const dangerousUrl of [
    "javascript:alert(1)",
    "java&#x09;script:alert(1)",
    "java&#13;script:alert(1)",
    "java&Tab;script:alert(1)",
    "java&NewLine;script:alert(1)",
  ]) {
    const homeValue = JSON.parse(
      Buffer.from(validContentBase64, "base64").toString("utf8"),
    );
    homeValue.primaryCtaHref = dangerousUrl;

    assert.equal(
      validateCmsAddition(
        contentPath,
        Buffer.from(JSON.stringify(homeValue)).toString("base64"),
      ).ok,
      false,
      dangerousUrl,
    );
  }

  const siteValue = JSON.parse(
    await readFile(new URL("../src/data/site.json", import.meta.url), "utf8"),
  );
  siteValue.contactFormAction = "http://example.com/contact";

  assert.equal(
    validateCmsAddition(
      "src/data/site.json",
      Buffer.from(JSON.stringify(siteValue)).toString("base64"),
    ).ok,
    false,
  );
});

test("CIと共有するsemantic ruleで必須配列・未知key・不正な相互参照を拒否する", async () => {
  const operationsPath = "src/data/service-details/operations.json";
  const operations = JSON.parse(
    await readFile(new URL(`../${operationsPath}`, import.meta.url), "utf8"),
  );
  const invalidValues = [
    { ...operations, challenges: [] },
    { ...operations, layout: "../../secret" },
    {
      ...operations,
      offerings: [
        {
          ...operations.offerings[0],
          pricingKeys: ["unknown-pricing-key"],
        },
        ...operations.offerings.slice(1),
      ],
    },
  ];

  for (const value of invalidValues) {
    assert.equal(
      validateCmsAddition(
        operationsPath,
        Buffer.from(JSON.stringify(value)).toString("base64"),
      ).ok,
      false,
      JSON.stringify(value),
    );
  }
});

test("複数JSONの協調更新を1つのprojected stateとして直接保存する", async () => {
  const operationsPath = "src/data/service-details/operations.json";
  const pricingPath = "src/data/pricing.json";
  const operations = JSON.parse(
    await readFile(new URL(`../${operationsPath}`, import.meta.url), "utf8"),
  );
  const pricing = JSON.parse(
    await readFile(new URL(`../${pricingPath}`, import.meta.url), "utf8"),
  );
  const newPricingKey = "cms-combined-test";
  const updatedOperations = structuredClone(operations);
  const updatedPricing = structuredClone(pricing);

  updatedOperations.offerings[0].pricingKeys = [newPricingKey];
  updatedPricing.items.push({
    ...updatedPricing.items.find(({ detailUrl }) => detailUrl === ""),
    key: newPricingKey,
  });

  mockGitHub(async (url, _init, body) => {
    if (url.endsWith("/git/ref/heads/main")) {
      return jsonResponse({ object: { sha: mainSha } });
    }

    if (url.endsWith("/graphql") && body.query.includes("mutation CmsCommit")) {
      assert.deepEqual(
        body.variables.input.fileChanges.additions.map(({ path }) => path),
        [operationsPath, pricingPath],
      );

      return jsonResponse({
        data: {
          createCommitOnBranch: {
            commit: { oid: topicSha },
          },
        },
      });
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
                path: operationsPath,
                contents: Buffer.from(
                  JSON.stringify(updatedOperations),
                ).toString("base64"),
              },
              {
                path: pricingPath,
                contents: Buffer.from(JSON.stringify(updatedPricing)).toString(
                  "base64",
                ),
              },
            ],
            deletions: [],
          },
          message: { headline: "cms: coordinated content update" },
        },
      },
    }),
  });

  assert.equal(response.status, 200);
});

test("複数JSONの最終projected stateに未知料金keyが残る保存を拒否する", async () => {
  const operationsPath = "src/data/service-details/operations.json";
  const pricingPath = "src/data/pricing.json";
  const operations = JSON.parse(
    await readFile(new URL(`../${operationsPath}`, import.meta.url), "utf8"),
  );
  const pricing = JSON.parse(
    await readFile(new URL(`../${pricingPath}`, import.meta.url), "utf8"),
  );
  let cmsOperationCalled = false;

  operations.offerings[0].pricingKeys = ["cms-missing-pricing-key"];
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
                path: operationsPath,
                contents: Buffer.from(JSON.stringify(operations)).toString(
                  "base64",
                ),
              },
              {
                path: pricingPath,
                contents: Buffer.from(JSON.stringify(pricing)).toString(
                  "base64",
                ),
              },
            ],
            deletions: [],
          },
          message: { headline: "cms: invalid coordinated content update" },
        },
      },
    }),
  });

  assert.equal(response.status, 403);
  assert.equal(cmsOperationCalled, false);
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

test("previewではCMS設定を配信しない", async () => {
  let nextCalled = false;
  const response = await handleCmsConfig({
    request: new Request("https://cms-preview.pages.dev/admin/config.yml"),
    next: async () => {
      nextCalled = true;
      return new Response("backend:\n  name: github\n");
    },
  });

  assert.equal(response.status, 404);
  assert.equal(nextCalled, false);
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

test("保存直前にPull requests writeを持つGitHub Appを拒否する", async () => {
  mockGitHub(
    async () => {
      throw new Error("CMS mutation must not continue");
    },
    true,
    {
      contents: "write",
      metadata: "read",
      pull_requests: "write",
    },
  );

  const response = await handleGraphql({
    request: graphqlRequest(),
  });

  assert.equal(response.status, 503);
  assert.match(
    (await response.json()).message,
    /Contents write以外のwrite権限/,
  );
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

test("画像と本文をmainの1 commitへ保存して直接公開する", async () => {
  const calls = [];

  mockGitHub(async (url, init, body) => {
    calls.push({ url, init, body });

    if (url.endsWith("/git/ref/heads/main")) {
      return jsonResponse({ object: { sha: mainSha } });
    }

    if (url.endsWith("/graphql") && body.query.includes("mutation CmsCommit")) {
      assert.match(body.query, /mutation CmsCommit/);
      assert.equal(
        body.variables.input.branch.repositoryNameWithOwner,
        `${CMS_REPOSITORY.owner}/${CMS_REPOSITORY.name}`,
      );
      assert.equal(body.variables.input.branch.branchName, "main");
      assert.equal(body.variables.input.expectedHeadOid, mainSha);
      assert.match(
        body.variables.input.message.body,
        /Acecore Systems CMSから検証済みコンテンツを直接公開しました。/,
      );
      assert.match(body.variables.input.message.body, /Editor: @editor/);
      assert.match(
        body.variables.input.message.body,
        /^CMS-Operation: [0-9a-f-]{36}$/m,
      );
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
                contents: validPngBase64,
              },
              {
                path: contentPath,
                contents: validContentBase64,
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
  assert.deepEqual(result.extensions.cms, {
    branch: "main",
    commit_oid: topicSha,
    mode: "direct",
  });
  assert.equal(calls.length, 2);
  assert.equal(
    calls.some(({ url }) => url.endsWith("/git/refs")),
    false,
  );
  assert.equal(
    calls.some(({ url }) => url.endsWith("/pulls")),
    false,
  );
});

test("direct保存の応答喪失後にmarker・親SHA・path・blob SHAを照合して復旧する", async () => {
  const expectedContents = validContentBase64;
  const expectedBlobSha = gitBlobOid(expectedContents);
  let mainRefReads = 0;
  let operationMarker = "";

  mockGitHub(async (url, _init, body) => {
    if (url.endsWith("/git/ref/heads/main")) {
      mainRefReads += 1;
      return jsonResponse({
        object: { sha: mainRefReads === 1 ? mainSha : topicSha },
      });
    }

    if (url.endsWith("/graphql") && body.query.includes("mutation CmsCommit")) {
      operationMarker = getOperationMarker(body.variables.input.message.body);
      throw new TypeError("upstream response was lost");
    }

    if (url.includes("/commits?sha=main&per_page=100")) {
      return jsonResponse([
        operationCommit({ marker: operationMarker, sha: topicSha }),
      ]);
    }

    if (url.endsWith(`/commits/${topicSha}?per_page=100`)) {
      return jsonResponse({
        sha: topicSha,
        files: [{ filename: contentPath, status: "modified" }],
      });
    }

    if (url.includes(`/git/trees/${topicSha}?recursive=1`)) {
      return jsonResponse({
        sha: "c".repeat(40),
        truncated: false,
        tree: [
          {
            mode: "100644",
            path: contentPath,
            sha: expectedBlobSha,
            size: 7,
            type: "blob",
          },
        ],
      });
    }

    throw new Error(`Unexpected GitHub request: ${url}`);
  });

  const response = await handleGraphql({ request: graphqlRequest() });
  const result = await response.json();

  assert.equal(response.status, 200);
  assert.equal(result.data.createCommitOnBranch.commit.oid, topicSha);
  assert.deepEqual(result.extensions.cms, {
    branch: "main",
    commit_oid: topicSha,
    mode: "direct",
  });
  assert.equal(mainRefReads, 2);
});

test("参照確認できない画像削除をGitHubへ送らない", async () => {
  const deletedPath = "public/uploads/unused.png";
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
            deletions: [{ path: deletedPath }],
          },
          message: { headline: "cms: delete unused image" },
        },
      },
    }),
  });
  assert.equal(response.status, 403);
  assert.equal(cmsOperationCalled, false);
});

test("編集開始後にmain HEADが変わっていればmutation前に保存を拒否する", async () => {
  let mutationCalled = false;

  mockGitHub(async (url) => {
    if (url.endsWith("/git/ref/heads/main")) {
      return jsonResponse({ object: { sha: "f".repeat(40) } });
    }

    if (url.endsWith("/graphql")) {
      mutationCalled = true;
    }

    throw new Error(`Unexpected GitHub request: ${url}`);
  });

  const response = await handleGraphql({ request: graphqlRequest() });
  const result = await response.json();

  assert.equal(response.status, 409);
  assert.match(result.message, /mainが更新されています/);
  assert.equal(mutationCalled, false);
});

test("mutation中に別commitがmainへ入った場合は上書きせず409にする", async () => {
  const advancedSha = "f".repeat(40);
  let mainRefReads = 0;

  mockGitHub(async (url, _init, body) => {
    if (url.endsWith("/git/ref/heads/main")) {
      mainRefReads += 1;
      return jsonResponse({
        object: { sha: mainRefReads === 1 ? mainSha : advancedSha },
      });
    }

    if (url.endsWith("/graphql") && body.query.includes("mutation CmsCommit")) {
      return jsonResponse({
        errors: [{ message: "Expected branch head did not match" }],
      });
    }

    if (url.includes("/commits?sha=main&per_page=100")) {
      return jsonResponse([
        operationCommit({
          marker: "CMS-Operation: another-operation",
          sha: advancedSha,
        }),
      ]);
    }

    throw new Error(`Unexpected GitHub request: ${url}`);
  });

  const response = await handleGraphql({ request: graphqlRequest() });
  const result = await response.json();

  assert.equal(response.status, 409);
  assert.match(result.message, /mainが更新されています/);
  assert.equal(mainRefReads, 2);
});

test("markerと親SHAが一致しても変更pathが異なるcommitを成功扱いにしない", async () => {
  let mainRefReads = 0;
  let operationMarker = "";
  let treeRequested = false;

  mockGitHub(async (url, _init, body) => {
    if (url.endsWith("/git/ref/heads/main")) {
      mainRefReads += 1;
      return jsonResponse({
        object: { sha: mainRefReads === 1 ? mainSha : topicSha },
      });
    }

    if (url.endsWith("/graphql") && body.query.includes("mutation CmsCommit")) {
      operationMarker = getOperationMarker(body.variables.input.message.body);
      throw new TypeError("upstream response was lost");
    }

    if (url.includes("/commits?sha=main&per_page=100")) {
      return jsonResponse([
        operationCommit({ marker: operationMarker, sha: topicSha }),
      ]);
    }

    if (url.endsWith(`/commits/${topicSha}?per_page=100`)) {
      return jsonResponse({
        sha: topicSha,
        files: [
          { filename: contentPath, status: "modified" },
          { filename: "README.md", status: "modified" },
        ],
      });
    }

    if (url.includes("/git/trees/")) {
      treeRequested = true;
    }

    throw new Error(`Unexpected GitHub request: ${url}`);
  });

  const response = await handleGraphql({ request: graphqlRequest() });
  const result = await response.json();

  assert.equal(response.status, 409);
  assert.match(result.message, /mainが更新されています/);
  assert.equal(treeRequested, false);
});

test("marker・親SHA・pathが一致してもblob SHAが異なるcommitを成功扱いにしない", async () => {
  let mainRefReads = 0;
  let operationMarker = "";

  mockGitHub(async (url, _init, body) => {
    if (url.endsWith("/git/ref/heads/main")) {
      mainRefReads += 1;
      return jsonResponse({
        object: { sha: mainRefReads === 1 ? mainSha : topicSha },
      });
    }

    if (url.endsWith("/graphql") && body.query.includes("mutation CmsCommit")) {
      operationMarker = getOperationMarker(body.variables.input.message.body);
      throw new TypeError("upstream response was lost");
    }

    if (url.includes("/commits?sha=main&per_page=100")) {
      return jsonResponse([
        operationCommit({ marker: operationMarker, sha: topicSha }),
      ]);
    }

    if (url.endsWith(`/commits/${topicSha}?per_page=100`)) {
      return jsonResponse({
        sha: topicSha,
        files: [{ filename: contentPath, status: "modified" }],
      });
    }

    if (url.includes(`/git/trees/${topicSha}?recursive=1`)) {
      return jsonResponse({
        sha: "c".repeat(40),
        truncated: false,
        tree: [
          {
            mode: "100644",
            path: contentPath,
            sha: "f".repeat(40),
            size: 7,
            type: "blob",
          },
        ],
      });
    }

    throw new Error(`Unexpected GitHub request: ${url}`);
  });

  const response = await handleGraphql({ request: graphqlRequest() });
  const result = await response.json();

  assert.equal(response.status, 409);
  assert.match(result.message, /mainが更新されています/);
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

function mockGitHub(
  handler,
  push = true,
  installationPermissions = { contents: "write", metadata: "read" },
) {
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
        permissions: { push },
      });
    }

    if (url === `https://api.github.com/user/installations/${installationId}`) {
      return jsonResponse({
        permissions: installationPermissions,
      });
    }

    if (
      url ===
      `https://api.github.com/user/installations/${installationId}/repositories?per_page=100`
    ) {
      return jsonResponse({
        repositories: [
          {
            full_name: `${CMS_REPOSITORY.owner}/${CMS_REPOSITORY.name}`,
            id: 1268097850,
            permissions: { push: true },
          },
        ],
        total_count: 1,
      });
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
            contents: validContentBase64,
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

function operationCommit({ marker, sha }) {
  return {
    sha,
    parents: [{ sha: mainSha }],
    commit: {
      message: `cms: update ${contentPath}\n\n${marker}`,
      committer: { date: "2026-07-28T00:00:00Z" },
    },
  };
}

function getOperationMarker(message) {
  const marker = message
    .split(/\r?\n/)
    .find((line) => line.startsWith("CMS-Operation: "));

  assert.match(marker ?? "", /^CMS-Operation: [0-9a-f-]{36}$/);
  return marker;
}

function gitBlobOid(contents) {
  const bytes = Buffer.from(contents, "base64");

  return createHash("sha1")
    .update(`blob ${bytes.byteLength}\0`)
    .update(bytes)
    .digest("hex");
}
