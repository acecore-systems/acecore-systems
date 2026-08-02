import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { runMergeAutomation } from "../scripts/merge-openai-translation-pr.mjs";

test("古いsourceHashのPRはmergeせずclosedにする", async () => {
  const requests = [];
  const request = async (pathname, options) => {
    requests.push({ pathname, options });
    if (!options?.method) {
      return {
        number: 42,
        state: "open",
        base: { ref: "main" },
        head: {
          ref: "translation/openai/batch_stale",
          sha: "a".repeat(40),
          repo: { full_name: "acecore-systems/acecore-systems" },
        },
        title: "[translation] OpenAI Batch batch_stale",
        body: "<!-- openai-translation-source:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa -->",
      };
    }
    if (options.method === "PATCH") return {};
    throw new Error(`Unexpected request: ${pathname}`);
  };

  await runMergeAutomation(["--pr=42"], {
    request,
    repository: "acecore-systems/acecore-systems",
    getCurrentSourceHash: () => "b".repeat(64),
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

test("成功したCI後だけ現在版のOpenAI翻訳PRをマージする", async () => {
  const [workflow, script] = await Promise.all([
    readFile(".github/workflows/merge-openai-translation-pr.yml", "utf8"),
    readFile("scripts/merge-openai-translation-pr.mjs", "utf8"),
  ]);

  assert.match(workflow, /workflow_run:/u);
  assert.match(workflow, /workflows:\s*\n\s*- CI/u);
  assert.match(workflow, /conclusion == 'success'/u);
  assert.match(workflow, /--expected-sha=/u);
  assert.match(script, /isTranslationPullRequestCurrent/u);
  assert.match(script, /state: "closed"/u);
  assert.match(script, /merge_method: "squash"/u);
});
