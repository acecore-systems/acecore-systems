import { execFileSync } from "node:child_process";
import {
  appendFileSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { hashText } from "./openai-translation-batch.mjs";

export const recovery = Object.freeze({
  repository: "acecore-systems/acecore-systems",
  batchId: "batch_6af507b520cc81908cd77c5a125eae27",
  sourceHash:
    "1c5558eb6049330f86d8cd800b863a8a7a11fbbe72c94e4db4efd8d07a86a8b5",
  originalCount: 64,
  maxRequests: 20,
  workflowPath:
    ".github/workflows/recover-openai-translation-batch-20261112.yml",
  // This one-off trigger expires long before the 90-day intent artifact does.
  notAfter: "2026-11-14T00:00:00Z",
  artifactName:
    "openai-translation-recovery-attempt-batch_6af507b520cc81908cd77c5a125eae27",
});

export function assertRecoveryIntroduction(
  { eventName, ref, event },
  git = (args) =>
    execFileSync("git", args, {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    }).trim(),
) {
  if (
    eventName !== "push" ||
    ref !== "refs/heads/main" ||
    !/^[a-f0-9]{40}$/u.test(event?.before ?? "") ||
    /^0+$/u.test(event.before)
  )
    throw new Error("Recovery must be the initial workflow addition on main");
  git(["cat-file", "-e", `${event.before}^{commit}`]);
  git(["merge-base", "--is-ancestor", event.before, "HEAD"]);
  if (
    git(["ls-tree", "--name-only", event.before, "--", recovery.workflowPath])
  )
    throw new Error(
      "Recovery workflow already existed before this push; no new Batch allowed",
    );
}

export function shouldSubmitRecovery(
  plan,
  { now = Date.now(), runAttempt = process.env.GITHUB_RUN_ATTEMPT } = {},
) {
  if (
    plan?.version !== 1 ||
    plan.repository !== recovery.repository ||
    plan.batchId !== recovery.batchId ||
    plan.sourceHash !== recovery.sourceHash ||
    !/^[a-f0-9]{40}$/u.test(plan.sourceCommit ?? "")
  )
    throw new Error("Recovery plan does not match the fixed parent/source");
  if (plan.state === "existing_retry") {
    if (
      !/^batch_[A-Za-z0-9_-]{1,100}$/u.test(plan.retryBatchId ?? "") ||
      plan.retryBatchId === recovery.batchId ||
      ![
        "validating",
        "in_progress",
        "finalizing",
        "cancelling",
        "completed",
      ].includes(plan.retryStatus)
    )
      throw new Error("Existing retry report is invalid");
    return false;
  }
  if (
    plan.originalCount !== recovery.originalCount ||
    !Number.isSafeInteger(plan.invalidCount) ||
    plan.invalidCount < 0 ||
    plan.retainedCount !== plan.originalCount - plan.invalidCount ||
    !Array.isArray(plan.identities) ||
    plan.identities.length !== plan.invalidCount ||
    !plan.identities.every((identity) => typeof identity === "string") ||
    new Set(plan.identities).size !== plan.identities.length ||
    plan.identitiesHash !==
      hashText(JSON.stringify([...plan.identities].sort()))
  )
    throw new Error("Recovery plan counts or identities are invalid");
  if (plan.state === "no_retry_needed" && plan.invalidCount === 0) return false;
  if (
    plan.state !== "planned" ||
    plan.invalidCount < 1 ||
    plan.invalidCount > recovery.maxRequests
  )
    throw new Error("Recovery is limited to 1 through 20 invalid requests");
  if (String(runAttempt) !== "1")
    throw new Error("A rerun cannot submit a new recovery Batch");
  if (!Number.isFinite(now) || now >= Date.parse(recovery.notAfter))
    throw new Error("The one-off recovery submission window has expired");
  return true;
}

export async function findPreviousRecoveryAttempt(get) {
  const seenPages = new Set();
  for (let page = 1; ; page += 1) {
    const result = await get(`/actions/artifacts?per_page=100&page=${page}`);
    if (!Array.isArray(result?.artifacts))
      throw new Error("Could not verify prior recovery attempts");
    const previous = result.artifacts.find(
      (artifact) => artifact.name === recovery.artifactName,
    );
    if (previous) return previous;
    if (result.artifacts.length < 100) return null;
    const fingerprint = JSON.stringify(
      result.artifacts.map((artifact) => artifact.id),
    );
    if (seenPages.has(fingerprint))
      throw new Error("Recovery artifact pagination repeated");
    seenPages.add(fingerprint);
  }
}

async function githubGet(resource) {
  const token = process.env.GITHUB_TOKEN;
  if (!token || process.env.GITHUB_REPOSITORY !== recovery.repository)
    throw new Error(
      "Recovery requires the fixed repository and its GitHub token",
    );
  const response = await fetch(
    `https://api.github.com/repos/${recovery.repository}${resource}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
      },
    },
  );
  if (!response.ok)
    throw new Error(`Recovery GitHub verification failed: ${response.status}`);
  return response.json();
}

async function main() {
  const [mode, planPath, intentPath] = process.argv.slice(2);
  if (
    !["prepare", "verify"].includes(mode) ||
    !planPath ||
    (mode === "prepare" && !intentPath)
  )
    throw new Error(
      "Usage: guard-openai-translation-recovery.mjs <prepare|verify> <plan> [intent]",
    );
  const plan = JSON.parse(readFileSync(planPath, "utf8"));
  const submit = shouldSubmitRecovery(plan);
  if (submit) {
    if (!process.env.GITHUB_EVENT_PATH)
      throw new Error("GITHUB_EVENT_PATH is required");
    assertRecoveryIntroduction({
      eventName: process.env.GITHUB_EVENT_NAME,
      ref: process.env.GITHUB_REF,
      event: JSON.parse(readFileSync(process.env.GITHUB_EVENT_PATH, "utf8")),
    });
  }
  if (mode === "verify") {
    if (!submit) throw new Error("Recovery plan no longer requests submission");
    return;
  }
  if (submit) {
    const main = await githubGet("/git/ref/heads/main");
    if (main?.object?.sha !== plan.sourceCommit)
      throw new Error("Current main does not match the recovery plan");
    if (await findPreviousRecoveryAttempt(githubGet))
      throw new Error(
        "A prior recovery attempt exists; review its receipt instead of resending",
      );
    mkdirSync(path.dirname(intentPath), { recursive: true });
    writeFileSync(
      intentPath,
      `${JSON.stringify(
        {
          version: 1,
          state: "intent",
          repository: recovery.repository,
          batchId: recovery.batchId,
          sourceHash: plan.sourceHash,
          sourceCommit: plan.sourceCommit,
          identitiesHash: plan.identitiesHash,
          requestCount: plan.invalidCount,
          retainedCount: plan.retainedCount,
          runId: process.env.GITHUB_RUN_ID,
          runAttempt: process.env.GITHUB_RUN_ATTEMPT,
          notAfter: recovery.notAfter,
        },
        null,
        2,
      )}\n`,
      { flag: "wx" },
    );
  }
  if (!process.env.GITHUB_OUTPUT) throw new Error("GITHUB_OUTPUT is required");
  appendFileSync(
    process.env.GITHUB_OUTPUT,
    `submit=${submit}\nartifact_name=${recovery.artifactName}\n`,
  );
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
)
  await main();
