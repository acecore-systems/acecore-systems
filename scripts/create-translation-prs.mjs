import { appendFileSync, readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join } from "node:path";

import {
  calculateTranslationSourceHash,
  translatedLocales,
} from "./i18n-source-hash.mjs";

const ZERO_SHA = "0000000000000000000000000000000000000000";
const COPILOT_API_BASE = "https://api.githubcopilot.com";
const COPILOT_API_VERSION = "2026-01-09";
const COPILOT_INTEGRATION_ID = "acecore-systems-translation-prs";
const fullCommitSha = /^[0-9a-f]{40}$/iu;

function parseArgs(argv) {
  const options = {
    base:
      process.env.INPUT_BASE_SHA?.trim() ||
      process.env.GITHUB_EVENT_BEFORE ||
      null,
    head:
      process.env.INPUT_HEAD_SHA?.trim() || process.env.GITHUB_SHA || "HEAD",
    changedFiles: process.env.INPUT_CHANGED_FILES?.trim()
      ? process.env.INPUT_CHANGED_FILES.split(",")
          .map((value) => value.trim())
          .filter(Boolean)
      : null,
    dryRun: process.env.INPUT_DRY_RUN === "true",
  };

  for (const argument of argv) {
    if (argument === "--dry-run") {
      options.dryRun = true;
    } else if (argument.startsWith("--base=")) {
      options.base = argument.slice("--base=".length) || null;
    } else if (argument.startsWith("--head=")) {
      options.head = argument.slice("--head=".length) || "HEAD";
    } else if (argument.startsWith("--changed-files=")) {
      options.changedFiles = argument
        .slice("--changed-files=".length)
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean);
    } else {
      throw new Error(`Unknown argument: ${argument}`);
    }
  }

  if (options.base === ZERO_SHA) options.base = null;
  for (const path of options.changedFiles ?? []) {
    if (/[\u0000-\u001f\u007f]/u.test(path)) {
      throw new Error("changed file paths must not contain control characters");
    }
  }
  return options;
}

function runGit(arguments_) {
  return execFileSync("git", arguments_, { encoding: "utf8" }).trim();
}

function resolveCommit(value, label) {
  if (value !== "HEAD" && !fullCommitSha.test(value)) {
    throw new Error(`${label} must be HEAD or a full 40-character commit SHA`);
  }
  let resolved;
  try {
    resolved = runGit(["rev-parse", "--verify", `${value}^{commit}`]);
  } catch {
    throw new Error(`${label} is not a commit in this repository`);
  }
  if (!fullCommitSha.test(resolved)) {
    throw new Error(`${label} did not resolve to a full commit SHA`);
  }
  if (value !== "HEAD" && resolved.toLowerCase() !== value.toLowerCase()) {
    throw new Error(`${label} does not resolve to the requested commit`);
  }
  return resolved.toLowerCase();
}

function validateCommits(options) {
  options.head = resolveCommit(options.head, "head");
  if (!options.base) return;
  options.base = resolveCommit(options.base, "base");
  try {
    execFileSync("git", [
      "merge-base",
      "--is-ancestor",
      options.base,
      options.head,
    ]);
  } catch {
    throw new Error("base must be an ancestor of head");
  }
}

function listChangedFiles(options) {
  if (options.changedFiles) return options.changedFiles;
  const range = options.base
    ? `${options.base}..${options.head}`
    : options.head;
  return runGit(["diff-tree", "--no-commit-id", "--name-only", "-r", range])
    .split(/\r?\n/u)
    .filter(Boolean);
}

function isJapaneseSourcePath(path) {
  return (
    /^src\/data\/(?:[^/]+|service-details\/[^/]+|work-details\/[^/]+)\.json$/u.test(
      path,
    ) ||
    /^src\/content\/insights\/[^/]+\.md$/u.test(path) ||
    path === "src/i18n/contact-form.ts" ||
    path === "src/i18n/ui.ts"
  );
}

function translationStateIsCurrent() {
  let state;
  try {
    state = JSON.parse(
      readFileSync(
        join(process.cwd(), "src/i18n/translation-state.json"),
        "utf8",
      ),
    );
  } catch {
    return false;
  }
  return (
    state.sourceHash === calculateTranslationSourceHash(process.cwd()) &&
    Array.isArray(state.locales) &&
    [...state.locales].sort().join("\0") ===
      [...translatedLocales].sort().join("\0")
  );
}

function getRepository() {
  const repository = process.env.GITHUB_REPOSITORY?.trim();
  if (!repository?.includes("/")) {
    throw new Error("GITHUB_REPOSITORY must use owner/repository format");
  }
  const [owner, repo] = repository.split("/");
  return { owner, repo, repository };
}

function buildPayload(sourcePaths, head, repository) {
  const marker = `translation-source:${head}`;
  const title = "[translation] Systemsの日本語source更新を8言語へ反映";
  const problemStatement = [
    `<!-- ${marker} -->`,
    "You are handling an automated translation task for Acecore Systems.",
    "Create or update the translation pull request only. Do not create an Issue.",
    "",
    "## Source",
    `- Repository: ${repository}`,
    `- Japanese source commit: ${head}`,
    ...sourcePaths.map((path) => `- ${path}`),
    "",
    "## Target locales",
    ...translatedLocales.map((locale) => `- ${locale}`),
    "",
    "## Required changes",
    "- Treat the changed Japanese files as the only source of truth.",
    "- For every JSON source change, including `src/data/site.json`, update the matching visible description, navigation, and page text in `src/i18n/content/{locale}.json` for all target locales.",
    "- For Japanese UI changes in `src/i18n/ui.ts` or `src/i18n/contact-form.ts`, update the corresponding entry for every target locale without changing stable form values.",
    "- Translation overlays must keep the same object and array structure. Do not copy stable fields such as href, URL, image, src, key, id, pricingKey, or pricingKeys; those inherit from Japanese source.",
    "- Preserve every price and numeric value, placeholder, URL, route, product name, and code-like token exactly while translating surrounding prose.",
    "- For Japanese Insights changes, update `src/content/insights/{locale}/{slug}.md` for all target locales. Preserve schema keys and stable author/date/image/link/code values, but translate every user-visible title, description, heading, body, tag, callout, checklist, comparison, link-card, and FAQ string.",
    "- Keep Systems internal links in the target locale. Do not invent locale variants for external sites.",
    "- Do not use an external translation service.",
    "- After every translation is complete, run `npm run update:i18n-state`.",
    "",
    "## Verification",
    "- Run `npm run validate:i18n`.",
    "- Run `npm run build`.",
    "- Use `main` as the base branch and mark the pull request ready only after both commands pass.",
    `- Use this pull request title: ${title}`,
    `- Include this exact marker in the body: \`<!-- ${marker} -->\`.`,
  ].join("\n");

  return { title, marker, problemStatement };
}

function writeSummary(message) {
  const summaryPath = process.env.GITHUB_STEP_SUMMARY;
  if (summaryPath) appendFileSync(summaryPath, `${message}\n`);
}

async function githubRequest(path, token) {
  const response = await fetch(`https://api.github.com${path}`, {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": COPILOT_INTEGRATION_ID,
    },
  });
  if (!response.ok) {
    throw new Error(
      `GitHub API failed: ${response.status} ${await response.text()}`,
    );
  }
  return response.json();
}

async function hasMatchingPullRequest(owner, repo, payload) {
  const token = process.env.GITHUB_TOKEN?.trim();
  if (!token) return false;
  const pulls = await githubRequest(
    `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/pulls?state=open&per_page=100`,
    token,
  );
  return pulls.some(
    (pull) =>
      pull.title === payload.title || pull.body?.includes(payload.marker),
  );
}

async function createCopilotTask(owner, repo, payload, token) {
  const response = await fetch(
    `${COPILOT_API_BASE}/agents/swe/v1/jobs/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "Copilot-Integration-Id": COPILOT_INTEGRATION_ID,
        "X-Github-Api-Version": COPILOT_API_VERSION,
        "User-Agent": COPILOT_INTEGRATION_ID,
      },
      body: JSON.stringify({
        title: payload.title,
        problem_statement: payload.problemStatement,
        event_type: "translation-pr",
      }),
    },
  );
  const body = await response.text();
  if (!response.ok) {
    throw new Error(
      `Copilot agent API failed: ${response.status} ${response.statusText}: ${body}`,
    );
  }
  return body ? JSON.parse(body) : {};
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  validateCommits(options);
  const changedFiles = listChangedFiles(options);
  const sourcePaths = changedFiles.filter(isJapaneseSourcePath).sort();
  if (sourcePaths.length === 0) {
    console.log("No Japanese Systems source changes detected.");
    return;
  }
  if (translationStateIsCurrent()) {
    console.log("Translations are already current; no task needed.");
    return;
  }

  const repository = getRepository();
  const payload = buildPayload(
    sourcePaths,
    options.head,
    repository.repository,
  );
  if (options.dryRun) {
    console.log(JSON.stringify({ sourcePaths, ...payload }, null, 2));
    return;
  }

  const agentToken = process.env.COPILOT_AGENT_TOKEN?.trim();
  if (!agentToken) {
    const message =
      "Translation task skipped: repository secret COPILOT_AGENT_TOKEN is not configured. CI sourceHash validation will keep deployment gated until translations are updated.";
    console.log(`::warning::${message}`);
    writeSummary(`### Translation task not created\n\n${message}`);
    return;
  }
  if (
    await hasMatchingPullRequest(repository.owner, repository.repo, payload)
  ) {
    console.log("A matching translation pull request is already open.");
    return;
  }

  const job = await createCopilotTask(
    repository.owner,
    repository.repo,
    payload,
    agentToken,
  );
  console.log(
    `Started Copilot translation task ${job.id ?? job.job_id ?? "unknown"}.`,
  );
}

await main();
