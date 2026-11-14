import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import {
  applyBatchTranslations,
  assertRetryBatch,
  createBatch,
  collectBatch,
  createInsightRequest,
  createStructuredRequest,
  decodeMetadata,
  getSourceHashFromPullRequestBody,
  getSourceMarker,
  hashText,
  findExistingRetry,
  isTranslationPullRequestCurrent,
  replaceLocaleObject,
  mergeBatchRetry,
  planBatchRetry,
  parseArgs,
  retryBatch,
  selectCompletedBatch,
  validateInsightTranslation,
} from "../scripts/openai-translation-batch.mjs";
import {
  protectTranslationText,
  restoreTranslationText,
} from "../scripts/translation-protected-text.mjs";
import {
  calculateTranslationSourceHash,
  translatedLocales,
} from "../scripts/i18n-source-hash.mjs";
import {
  assertRecoveryIntroduction,
  findPreviousRecoveryAttempt,
  recovery,
  shouldSubmitRecovery,
} from "../scripts/guard-openai-translation-recovery.mjs";

const insightFixture = [
  "---",
  'title: "確認"',
  'date: "2026-10-08T13:35:00+09:00"',
  "author: gui",
  "---",
  "利用者が0のとき、1台ずつ3つの条件を確認する。",
  "```bash",
  "# 改行を出力する",
  "printf '%s\\n' ok",
  "```",
  "",
].join("\n");

const sourceHash = "a".repeat(64);
const metadata = {
  version: 1,
  kind: "insight",
  locale: "en",
  sourcePath: "src/content/insights/protected-token-fixture.md",
  sourceHash,
};

function batchResult(request, response) {
  return {
    custom_id: request.custom_id,
    response: {
      status_code: 200,
      body: { output_text: JSON.stringify(response) },
    },
  };
}

test("新規の両形式は Terra medium の Responses Batch を使う", async () => {
  const structured = createStructuredRequest(
    { ...metadata, kind: "content" },
    { title: "新しい説明" },
  );
  const markdown = createInsightRequest(metadata, insightFixture);
  for (const request of [structured, markdown]) {
    assert.equal(request.method, "POST");
    assert.equal(request.url, "/v1/responses");
    assert.equal(request.body.model, "gpt-6.1-terra");
    assert.deepEqual(request.body.reasoning, { effort: "medium" });
  }
  const originalFetch = globalThis.fetch;
  const originalKey = process.env.OPENAI_TRANSLATION_API_KEY;
  process.env.OPENAI_TRANSLATION_API_KEY = "fixture-key";
  try {
    globalThis.fetch = async (url, init) => {
      assert.equal(url, "https://api.openai.com/v1/batches");
      const body = JSON.parse(init.body);
      assert.equal(body.endpoint, "/v1/responses");
      assert.equal(body.completion_window, "24h");
      assert.equal(body.metadata.requested_model, "gpt-6.1-terra");
      assert.equal(body.metadata.requested_effort, "medium");
      return Response.json({ id: "batch_fixture" });
    };
    assert.deepEqual(
      await createBatch("file-fixture", sourceHash, "a".repeat(40)),
      { id: "batch_fixture" },
    );
  } finally {
    globalThis.fetch = originalFetch;
    if (originalKey === undefined)
      delete process.env.OPENAI_TRANSLATION_API_KEY;
    else process.env.OPENAI_TRANSLATION_API_KEY = originalKey;
  }
});

test("翻訳へ渡す数値・URL・placeholder・コードを保護し、JSON往復後に原文から復元する", () => {
  const source = `${insightFixture}価格は1,500円、15秒。\n{count}と\`init=/bin/bash\`を確認する。\nhttps://example.com/v26?q=0\n`;
  const { text, tokens } = protectTranslationText(source);
  assert.doesNotMatch(text, /printf|%s\\n|https:\/\/example|init=\/bin/u);
  assert.ok([...tokens.values()].includes("0"));
  assert.ok([...tokens.values()].includes("1,500"));
  const transported = JSON.parse(JSON.stringify({ markdown: text })).markdown;
  const translated = transported.replace("確認する", "Check");
  assert.equal(
    restoreTranslationText(source, translated),
    source.replace("確認する", "Check"),
  );
  validateInsightTranslation(
    source,
    restoreTranslationText(source, translated),
  );
});

test("保護tokenの省略・複製・改変・追加を拒否する", () => {
  const { text, tokens } = protectTranslationText(insightFixture);
  const token = tokens.keys().next().value;
  for (const invalid of [
    text.replace(token, "zero"),
    `${text}\n${token}`,
    text.replace(token, token.replace("KEEP", "CHANGED")),
    `${text}\n{ACECORE_KEEP_unknown}`,
  ]) {
    assert.throws(
      () => restoreTranslationText(insightFixture, invalid, "en: fixture"),
      /en: fixture: (unknown or duplicated|protected token is missing or changed)/u,
    );
  }
});

test("実バッチで追加された既知inline CODE tokenのbacktickだけを除いて復元する", () => {
  // service-cta-contact-prefill.md の実失敗は、同じ行のこれら3 tokenに
  // backtickを追加し、復元後にinline code間の本文までcodeとして検出した。
  const source = `${insightFixture}URLには \`Webサイト制作・運用について\` ではなく \`web\` や \`server\` を使う。\n`;
  const { text, tokens } = protectTranslationText(source);
  let translated = text;
  for (const [token, original] of tokens) {
    if (/^`[^`\r\n]+`$/u.test(original))
      translated = translated.replace(token, `\u0060${token}\u0060`);
  }
  assert.equal(restoreTranslationText(source, translated), source);
  validateInsightTranslation(
    source,
    restoreTranslationText(source, translated),
  );
  const doubleDelimited = `${insightFixture}Use \`\`literal\`\` here.\n`;
  assert.equal(
    restoreTranslationText(
      doubleDelimited,
      protectTranslationText(doubleDelimited).text,
    ),
    doubleDelimited,
  );
});

test("複数tokenを囲むcodeや数値tokenのcode化・fence追加は曖昧なまま拒否する", () => {
  const source = `${insightFixture}Use \`web\` and \`server\`.\n`;
  const { text, tokens } = protectTranslationText(source);
  const inline = [...tokens]
    .filter(([, value]) => /^`[^`\r\n]+`$/u.test(value))
    .map(([token]) => token);
  const number = [...tokens].find(([, value]) => value === "0")[0];
  const fence = [...tokens].find(([, value]) => value.startsWith("```"))[0];
  for (const invalid of [
    text.replace(
      `${inline[0]} and ${inline[1]}`,
      `\u0060${inline[0]} and ${inline[1]}\u0060`,
    ),
    text.replace(number, `\u0060${number}\u0060`),
    text.replace(fence, `\u0060\u0060\u0060\n${fence}\n\u0060\u0060\u0060`),
  ]) {
    assert.throws(
      () =>
        validateInsightTranslation(
          source,
          restoreTranslationText(source, invalid),
        ),
      /inline code changed|fenced code|ambiguous formatting/u,
    );
  }
});

const retryMetadata = {
  ...metadata,
  sourcePath: "src/content/insights/service-cta-contact-prefill.md",
};
test("再試行は明示batch IDだけを受け付け、dry-runを通常投入へ混ぜない", () => {
  assert.equal(
    parseArgs(["retry", "--batch-id=batch_parent", "--dry-run"]).dryRun,
    true,
  );
  for (const args of [
    ["retry"],
    ["retry", "--batch-id=batch_x;echo_unsafe"],
    ["collect", "--batch-id=batch_parent"],
    ["submit", "--dry-run"],
  ]) {
    assert.throws(() => parseArgs(args), /batch|dry-run/u);
  }
});

test("dry-run・既存retry・件数上限ではAPI GETだけを行いupload/createを呼ばない", async () => {
  const currentHash = calculateTranslationSourceHash(process.cwd());
  const requests = translatedLocales.map((locale) =>
    createInsightRequest(
      { ...retryMetadata, sourceHash: currentHash, locale },
      insightFixture,
    ),
  );
  const outputs = requests.map((request) =>
    batchResult(request, { markdown: "invalid" }),
  );
  for (const locale of ["en", "fr", "es"]) {
    outputs.push(
      batchResult(
        createStructuredRequest(
          {
            ...retryMetadata,
            kind: "content",
            sourcePath: "src/data/pricing.json",
            sourceHash: currentHash,
            locale,
          },
          { label: "確認" },
        ),
        {},
      ),
    );
  }
  const parent = {
    id: "batch_parent",
    status: "completed",
    output_file_id: "file-parent",
    request_counts: { total: 11, completed: 11, failed: 0 },
    metadata: {
      translation_system: "acecore-systems-v1",
      repository: "acecore-systems/acecore-systems",
      source_hash: currentHash,
    },
  };
  const originalFetch = globalThis.fetch;
  const originalKey = process.env.OPENAI_TRANSLATION_API_KEY;
  const originalRepository = process.env.GITHUB_REPOSITORY;
  const methods = [];
  let batches = [parent];
  let allowSubmission = false;
  globalThis.fetch = async (url, init = {}) => {
    const method = init.method ?? "GET";
    methods.push(method);
    if (allowSubmission && method === "POST") {
      if (url.endsWith("/files")) return Response.json({ id: "file-retry" });
      if (url.endsWith("/batches")) {
        const payload = JSON.parse(init.body);
        assert.equal(payload.metadata.retry_request_count, "11");
        assert.equal(payload.metadata.retry_of, parent.id);
        return Response.json({
          id: "batch_retry",
          status: "validating",
          input_file_id: payload.input_file_id,
          metadata: payload.metadata,
        });
      }
    }
    assert.equal(
      method,
      "GET",
      "dry-run must not upload a file or create a Batch",
    );
    if (url.endsWith("/batches/batch_parent")) return Response.json(parent);
    if (url.endsWith("/batches?limit=100"))
      return Response.json({ data: batches });
    if (url.endsWith("/files/file-parent/content"))
      return new Response(
        outputs.map((output) => JSON.stringify(output)).join("\n"),
      );
    throw new Error("Unexpected mock request");
  };
  process.env.OPENAI_TRANSLATION_API_KEY = "test-key-not-a-credential";
  process.env.GITHUB_REPOSITORY = "acecore-systems/acecore-systems";
  try {
    await retryBatch({ batchId: parent.id, dryRun: true });
    await assert.rejects(
      () => retryBatch({ batchId: parent.id, dryRun: false }),
      /limited to 10/u,
    );
    allowSubmission = true;
    await retryBatch({
      batchId: parent.id,
      dryRun: false,
      maxRetryRequests: 11,
    });
    assert.equal(methods.filter((method) => method === "POST").length, 2);
    methods.length = 0;
    allowSubmission = false;
    batches = [
      parent,
      {
        ...parent,
        id: "batch_child",
        status: "in_progress",
        metadata: {
          ...parent.metadata,
          retry_of: parent.id,
          retry_identities_hash: "a".repeat(64),
          retry_request_count: "17",
        },
      },
    ];
    await retryBatch({ batchId: parent.id, dryRun: false });
    assert.ok(methods.length > 0);
    assert.deepEqual([...new Set(methods)], ["GET"]);
  } finally {
    globalThis.fetch = originalFetch;
    if (originalKey === undefined)
      delete process.env.OPENAI_TRANSLATION_API_KEY;
    else process.env.OPENAI_TRANSLATION_API_KEY = originalKey;
    if (originalRepository === undefined) delete process.env.GITHUB_REPOSITORY;
    else process.env.GITHUB_REPOSITORY = originalRepository;
  }
});
test("再試行上限は既定10、明示指定のみ1〜20で、API呼出し前に不正値を拒否する", async () => {
  assert.equal(
    parseArgs(["retry", "--batch-id=batch_parent"]).maxRetryRequests,
    10,
  );
  assert.equal(
    parseArgs(["retry", "--batch-id=batch_parent", "--max-retry-requests=17"])
      .maxRetryRequests,
    17,
  );
  for (const value of ["0", "21", "1.5", "01", "NaN", "Infinity", ""]) {
    assert.throws(
      () =>
        parseArgs([
          "retry",
          "--batch-id=batch_parent",
          `--max-retry-requests=${value}`,
        ]),
      /max-retry-requests/u,
    );
  }
  assert.throws(
    () => parseArgs(["submit", "--max-retry-requests=17"]),
    /max-retry-requests/u,
  );
  for (const value of [0, 21, 1.5, NaN, Infinity, "17"]) {
    await assert.rejects(
      () => retryBatch({ batchId: "batch_parent", maxRetryRequests: value }),
      /max-retry-requests/u,
    );
  }
});

test("保存planとreceiptのCLI引数はretryの正しい段階だけで使用する", () => {
  assert.equal(
    parseArgs([
      "retry",
      "--batch-id=batch_parent",
      "--dry-run",
      "--plan-path=/tmp/plan.json",
    ]).planPath,
    "/tmp/plan.json",
  );
  assert.equal(
    parseArgs([
      "retry",
      "--batch-id=batch_parent",
      "--expected-plan-path=/tmp/plan.json",
      "--receipt-path=/tmp/receipt.json",
    ]).expectedPlanPath,
    "/tmp/plan.json",
  );
  for (const args of [
    ["collect", "--plan-path=/tmp/plan.json"],
    ["retry", "--batch-id=batch_parent", "--plan-path=/tmp/plan.json"],
    ["retry", "--batch-id=batch_parent", "--expected-plan-path=/tmp/plan.json"],
    [
      "retry",
      "--batch-id=batch_parent",
      "--dry-run",
      "--receipt-path=/tmp/receipt.json",
    ],
    ["retry", "--batch-id=batch_parent", "--dry-run", "--plan-path="],
  ])
    assert.throws(() => parseArgs(args), /retry|path|dry-run/u);
});

test("保存したdry-run計画と現在mainを照合して不正分のみ送り、曖昧なPOSTはreceiptで再送を止める", async () => {
  const directory = await mkdtemp(join(tmpdir(), "systems-retry-receipt-"));
  const planPath = join(directory, "plan.json");
  const receiptPath = join(directory, "receipt.json");
  const currentHash = calculateTranslationSourceHash(process.cwd());
  const currentCommit = execFileSync("git", ["rev-parse", "HEAD"], {
    encoding: "utf8",
  }).trim();
  const source = await readFile(retryMetadata.sourcePath, "utf8");
  const requests = ["en", "fr"].map((locale) =>
    createInsightRequest(
      { ...retryMetadata, sourceHash: currentHash, locale },
      source,
    ),
  );
  const outputs = [
    batchResult(requests[0], {
      markdown: JSON.parse(requests[0].body.input).markdown,
    }),
    batchResult(requests[1], { markdown: "invalid" }),
  ];
  const parent = {
    id: "batch_parent",
    status: "completed",
    output_file_id: "file-parent",
    request_counts: { total: 2, completed: 2, failed: 0 },
    metadata: {
      translation_system: "acecore-systems-v1",
      repository: recovery.repository,
      source_hash: currentHash,
    },
  };
  const originalFetch = globalThis.fetch;
  const originalEnv = Object.fromEntries(
    ["OPENAI_TRANSLATION_API_KEY", "GITHUB_TOKEN", "GITHUB_REPOSITORY"].map(
      (key) => [key, process.env[key]],
    ),
  );
  Object.assign(process.env, {
    OPENAI_TRANSLATION_API_KEY: "test-key",
    GITHUB_TOKEN: "test-github-token",
    GITHUB_REPOSITORY: recovery.repository,
  });
  const posts = [];
  let mode = "success";
  let mainCommit = currentCommit;
  let existing = null;
  let pageTwo = false;
  globalThis.fetch = async (url, init = {}) => {
    if ((init.method ?? "GET") === "GET") {
      if (url.endsWith("/batches/batch_parent")) return Response.json(parent);
      if (url.endsWith("/batches?limit=100"))
        return Response.json(
          pageTwo
            ? {
                data: Array.from({ length: 100 }, (_, index) => ({
                  id: `batch_other${index}`,
                })),
                has_more: true,
                last_id: "batch_other99",
              }
            : { data: existing ? [parent, existing] : [parent] },
        );
      if (url.endsWith("/batches?limit=100&after=batch_other99"))
        return Response.json({ data: [existing], has_more: false });
      if (url.endsWith("/files/file-parent/content"))
        return new Response(
          outputs.map((output) => JSON.stringify(output)).join("\n"),
        );
      if (url.endsWith("/git/ref/heads/main"))
        return Response.json({ object: { sha: mainCommit } });
      throw new Error("Unexpected mock GET");
    }
    assert.equal(
      JSON.parse(await readFile(receiptPath, "utf8")).state,
      "attempting",
      "persist the receipt before any POST",
    );
    posts.push(url);
    if (url.endsWith("/files")) {
      const lines = (await init.body.get("file").text())
        .trim()
        .split("\n")
        .map(JSON.parse);
      assert.equal(lines.length, 1);
      assert.equal(decodeMetadata(lines[0].custom_id).locale, "fr");
      assert.equal(lines[0].url, "/v1/responses");
      assert.equal(lines[0].body.model, "gpt-6.1-terra");
      assert.deepEqual(lines[0].body.reasoning, { effort: "medium" });
      if (mode === "upload_lost") throw new Error("Upload response lost");
      return Response.json({ id: "file-retry" });
    }
    if (url.endsWith("/batches")) {
      if (mode === "create_lost")
        throw new Error("Batch accepted but response lost");
      const payload = JSON.parse(init.body);
      assert.equal(payload.endpoint, "/v1/responses");
      assert.equal(payload.completion_window, "24h");
      assert.equal(payload.metadata.requested_model, "gpt-6.1-terra");
      assert.equal(payload.metadata.requested_effort, "medium");
      return Response.json({
        id: "batch_retry",
        status: "validating",
        input_file_id: payload.input_file_id,
        metadata: {
          ...payload.metadata,
          retry_of:
            mode === "bad_receipt" ? "batch_wrong" : payload.metadata.retry_of,
          request_payload_sha256:
            mode === "bad_payload_receipt"
              ? "b".repeat(64)
              : payload.metadata.request_payload_sha256,
        },
      });
    }
    throw new Error("Unexpected mock POST");
  };
  try {
    const plan = await retryBatch({
      batchId: parent.id,
      dryRun: true,
      planPath,
    });
    assert.equal(plan.invalidCount, 1);
    assert.equal(plan.retainedCount, 1);
    assert.equal(plan.failures.length, 1);
    assert.match(plan.failures[0].identity, /"fr"/u);
    assert.deepEqual(posts, []);
    for (const changed of [
      { sourceHash: "b".repeat(64) },
      { sourceCommit: "b".repeat(40) },
      { outputFileId: "file-other" },
      { invalidCount: 2 },
      { identities: [plan.identities[0].replace('"fr"', '"en"')] },
      { requestPayloadHash: "c".repeat(64) },
      { requestPayloadHash: undefined },
    ]) {
      await writeFile(planPath, JSON.stringify({ ...plan, ...changed }));
      await assert.rejects(
        () =>
          retryBatch({
            batchId: parent.id,
            expectedPlanPath: planPath,
            receiptPath,
          }),
        /plan.*changed/u,
      );
      assert.deepEqual(posts, []);
    }
    await writeFile(planPath, JSON.stringify(plan));
    mainCommit = "b".repeat(40);
    await assert.rejects(
      () =>
        retryBatch({
          batchId: parent.id,
          expectedPlanPath: planPath,
          receiptPath,
        }),
      /Current main/u,
    );
    assert.deepEqual(posts, []);
    mainCommit = currentCommit;
    const receipt = await retryBatch({
      batchId: parent.id,
      expectedPlanPath: planPath,
      receiptPath,
    });
    assert.equal(receipt.state, "submitted");
    assert.equal(receipt.requestCount, 1);
    assert.equal(receipt.retainedCount, 1);
    assert.equal(receipt.retryBatchId, "batch_retry");
    assert.equal(posts.length, 2);
    for (const failure of [
      "upload_lost",
      "create_lost",
      "bad_receipt",
      "bad_payload_receipt",
    ]) {
      await rm(receiptPath);
      mode = failure;
      posts.length = 0;
      await assert.rejects(
        () =>
          retryBatch({
            batchId: parent.id,
            expectedPlanPath: planPath,
            receiptPath,
          }),
        /do not resend automatically/u,
      );
      const uncertain = JSON.parse(await readFile(receiptPath, "utf8"));
      assert.equal(uncertain.state, "unknown");
      assert.equal(uncertain.error, "submission_response_unconfirmed");
      assert.equal(
        uncertain.phase,
        failure === "upload_lost" ? "before_upload" : "before_batch_create",
      );
      const count = posts.length;
      await assert.rejects(
        () =>
          retryBatch({
            batchId: parent.id,
            expectedPlanPath: planPath,
            receiptPath,
          }),
        /receipt already exists/u,
      );
      assert.equal(posts.length, count, "do not replay an uncertain POST");
    }
    await rm(receiptPath);
    posts.length = 0;
    existing = {
      ...parent,
      id: "batch_child",
      status: "in_progress",
      metadata: {
        ...parent.metadata,
        retry_of: parent.id,
        retry_identities_hash: plan.identitiesHash,
        retry_request_count: "1",
      },
    };
    pageTwo = true;
    const noOp = await retryBatch({
      batchId: parent.id,
      expectedPlanPath: planPath,
      receiptPath,
    });
    assert.equal(noOp.state, "existing_retry");
    assert.equal(noOp.retryBatchId, "batch_child");
    assert.deepEqual(
      posts,
      [],
      "a child beyond the first 100 results still blocks submission",
    );
  } finally {
    globalThis.fetch = originalFetch;
    for (const [key, value] of Object.entries(originalEnv)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
    await rm(directory, { recursive: true, force: true });
  }
});

test("限定recoveryは固定64件の1〜20不正分だけを期限内の初回に送信できる", () => {
  const identities = [
    '["insight","en","src/content/insights/astro-ai-contact-chat.md"]',
  ];
  const plan = {
    version: 1,
    state: "planned",
    repository: recovery.repository,
    batchId: recovery.batchId,
    sourceHash: recovery.sourceHash,
    sourceCommit: "a".repeat(40),
    originalCount: 64,
    invalidCount: 1,
    retainedCount: 63,
    identities,
    identitiesHash: hashText(JSON.stringify(identities)),
  };
  const beforeDeadline = {
    now: Date.parse("2026-11-13T12:00:00Z"),
    runAttempt: "1",
  };
  assert.equal(shouldSubmitRecovery(plan, beforeDeadline), true);
  for (const changed of [
    { batchId: "batch_other" },
    { sourceHash: "b".repeat(64) },
    { originalCount: 65 },
    { invalidCount: 0 },
    { invalidCount: 21, retainedCount: 43 },
    { identitiesHash: "b".repeat(64) },
  ])
    assert.throws(
      () => shouldSubmitRecovery({ ...plan, ...changed }, beforeDeadline),
      /Recovery/u,
    );
  assert.throws(
    () => shouldSubmitRecovery(plan, { ...beforeDeadline, runAttempt: "2" }),
    /rerun/u,
  );
  assert.throws(
    () =>
      shouldSubmitRecovery(plan, {
        ...beforeDeadline,
        now: Date.parse(recovery.notAfter),
      }),
    /expired/u,
  );
  assert.equal(
    shouldSubmitRecovery(
      {
        ...plan,
        state: "no_retry_needed",
        invalidCount: 0,
        retainedCount: 64,
        identities: [],
        identitiesHash: hashText("[]"),
      },
      { now: Infinity, runAttempt: "2" },
    ),
    false,
  );
  assert.equal(
    shouldSubmitRecovery(
      {
        ...plan,
        state: "existing_retry",
        retryBatchId: "batch_existing",
        retryStatus: "completed",
      },
      { now: Infinity, runAttempt: "2" },
    ),
    false,
  );
});

test("recovery workflowの初回追加だけを許可し、後続pushや存在しないbeforeを拒否する", async () => {
  const directory = await mkdtemp(
    join(tmpdir(), "systems-recovery-introduction-"),
  );
  const git = (args) =>
    execFileSync("git", args, {
      cwd: directory,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    }).trim();
  const commit = () =>
    git([
      "-c",
      "user.name=Test",
      "-c",
      "user.email=test@example.invalid",
      "commit",
      "-m",
      "fixture",
    ]);
  try {
    git(["init", "--initial-branch=main"]);
    await writeFile(join(directory, "README.md"), "fixture\n");
    git(["add", "README.md"]);
    commit();
    const before = git(["rev-parse", "HEAD"]);
    await mkdir(join(directory, ".github/workflows"), { recursive: true });
    await writeFile(join(directory, recovery.workflowPath), "name: fixture\n");
    git(["add", recovery.workflowPath]);
    commit();
    const event = {
      eventName: "push",
      ref: "refs/heads/main",
      event: { before },
    };
    assertRecoveryIntroduction(event, git);
    assert.throws(
      () =>
        assertRecoveryIntroduction(
          { ...event, event: { before: git(["rev-parse", "HEAD"]) } },
          git,
        ),
      /already existed/u,
    );
    assert.throws(() =>
      assertRecoveryIntroduction(
        { ...event, event: { before: "f".repeat(40) } },
        git,
      ),
    );
    assert.throws(
      () =>
        assertRecoveryIntroduction(
          { ...event, event: { before: "0".repeat(40) } },
          git,
        ),
      /initial workflow/u,
    );
    assert.throws(
      () =>
        assertRecoveryIntroduction(
          { ...event, eventName: "workflow_dispatch" },
          git,
        ),
      /initial workflow/u,
    );
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test("過去intentを全pageで照会し、期限切れartifact・API異常・反復pageも送信許可にしない", async () => {
  const first = {
    artifacts: Array.from({ length: 100 }, (_, index) => ({
      id: index,
      name: `other-${index}`,
    })),
  };
  let count = 0;
  const prior = { id: 101, name: recovery.artifactName, expired: true };
  assert.equal(
    await findPreviousRecoveryAttempt(async () =>
      ++count === 1 ? first : { artifacts: [prior] },
    ),
    prior,
  );
  assert.equal(count, 2);
  await assert.rejects(
    () =>
      findPreviousRecoveryAttempt(async () => {
        throw new Error("403");
      }),
    /403/u,
  );
  await assert.rejects(
    () => findPreviousRecoveryAttempt(async () => ({})),
    /verify/u,
  );
  await assert.rejects(
    () => findPreviousRecoveryAttempt(async () => first),
    /pagination repeated/u,
  );
  assert.equal(
    await findPreviousRecoveryAttempt(async () => ({ artifacts: [] })),
    null,
  );
});

test("recovery workflowは永続intent upload成功後だけ既存CLIを起動する", async () => {
  const workflow = await readFile(
    ".github/workflows/recover-openai-translation-batch-20261112.yml",
    "utf8",
  );
  assert.match(
    workflow,
    /group: recovery-batch_6af507b520cc81908cd77c5a125eae27/u,
  );
  assert.match(workflow, /group: openai-translation-batch-submit/u);
  assert.match(
    workflow,
    /steps\.guard\.outputs\.submit == 'true' && steps\.intent\.outcome == 'success'/u,
  );
  assert.match(
    workflow,
    /--expected-plan-path="\$RETRY_PLAN_PATH" --receipt-path="\$RETRY_RECEIPT_PATH"/u,
  );
  assert.ok(
    workflow.indexOf("Persist intent before any provider POST") <
      workflow.indexOf("Retry only the verified invalid identities"),
  );
  assert.equal((workflow.match(/if-no-files-found: error/gu) ?? []).length, 3);
  assert.doesNotMatch(
    workflow,
    /workflow_dispatch|schedule:|continue-on-error|overwrite: true/u,
  );
});
function retryFixture() {
  const goodRequest = createInsightRequest(retryMetadata, insightFixture);
  const badRequest = createInsightRequest(
    { ...retryMetadata, locale: "fr" },
    insightFixture,
  );
  const masked = JSON.parse(badRequest.body.input).markdown;
  const good = batchResult(goodRequest, { markdown: masked });
  const bad = batchResult(badRequest, {
    markdown: masked.replace(/\{ACECORE_KEEP_[^}]+\}/u, ""),
  });
  const readers = { readFile: () => insightFixture };
  return { good, bad, badRequest, masked, readers };
}

test("再試行は正常結果を保持して不正identityだけを作り、全件一致と厳格検証後に結合する", () => {
  const { good, bad, badRequest, masked, readers } = retryFixture();
  good.response.body.model = "gpt-6-luna";
  bad.response.body.model = "gpt-6-luna";
  const plan = planBatchRetry([good, bad], sourceHash, readers);
  assert.equal(plan.requests.length, 1);
  assert.equal(plan.retainedCount, 1);
  assert.equal(decodeMetadata(plan.requests[0].custom_id).locale, "fr");
  const repaired = batchResult(badRequest, { markdown: masked });
  const combined = mergeBatchRetry(
    [good, bad],
    [repaired],
    sourceHash,
    plan.identitiesHash,
    readers,
  );
  assert.equal(combined[0], good);
  assert.equal(combined[1], repaired);
  const writes = [];
  applyBatchTranslations(combined, sourceHash, {
    ...readers,
    writeFile: (...args) => writes.push(args),
  });
  assert.equal(writes.length, 2);
  for (const [outputs, expectedHash] of [
    [[], plan.identitiesHash],
    [[repaired, repaired], plan.identitiesHash],
    [[good], plan.identitiesHash],
    [[bad], plan.identitiesHash],
    [[repaired], "b".repeat(64)],
  ])
    assert.throws(
      () =>
        mergeBatchRetry(
          [good, bad],
          outputs,
          sourceHash,
          expectedHash,
          readers,
        ),
      /Retry|protected token/u,
    );
  assert.throws(
    () => planBatchRetry([good, good], sourceHash, readers),
    /duplicate/u,
  );
  assert.throws(
    () => planBatchRetry([good], "b".repeat(64), readers),
    /source identity/u,
  );
});

test("再試行親子はrepo・sourceHash・完了件数を固定し、循環・多段と他repoを拒否する", () => {
  const parent = {
    id: "batch_parent",
    status: "completed",
    request_counts: { total: 48, completed: 48, failed: 0 },
    metadata: {
      translation_system: "acecore-systems-v1",
      repository: "acecore-systems/acecore-systems",
      source_hash: sourceHash,
    },
  };
  assertRetryBatch(parent, sourceHash);
  const child = {
    ...parent,
    id: "batch_child",
    request_counts: { total: 1, completed: 1, failed: 0 },
    metadata: {
      ...parent.metadata,
      retry_of: parent.id,
      retry_identities_hash: "a".repeat(64),
      retry_request_count: "1",
    },
  };
  assertRetryBatch(child, sourceHash, { parentId: parent.id });
  for (const invalid of [
    { ...parent, status: "in_progress" },
    { ...parent, request_counts: { total: 48, completed: 47, failed: 1 } },
    { ...parent, metadata: { ...parent.metadata, repository: "other/repo" } },
    {
      ...parent,
      metadata: { ...parent.metadata, source_hash: "b".repeat(64) },
    },
    child,
  ])
    assert.throws(() => assertRetryBatch(invalid, sourceHash), /Retry batch/u);
  assert.throws(
    () => assertRetryBatch(child, sourceHash, { parentId: child.id }),
    /Retry batch/u,
  );
  assert.equal(
    findExistingRetry(
      [{ ...child, status: "in_progress" }],
      parent.id,
      sourceHash,
    ).id,
    child.id,
  );
  assert.equal(findExistingRetry([child], parent.id, "b".repeat(64)), null);
  assert.equal(
    selectCompletedBatch([parent, child], new Set(), {
      currentSourceHash: sourceHash,
      translationsCurrent: false,
    }).id,
    child.id,
  );
  assert.equal(
    selectCompletedBatch([parent, child], new Set([child.id]), {
      currentSourceHash: sourceHash,
      translationsCurrent: true,
    }),
    null,
    "after the combined translation is published, cron must not collect the invalid parent again",
  );
  assert.equal(
    selectCompletedBatch(
      [parent, { ...child, status: "in_progress" }],
      new Set(),
      { currentSourceHash: sourceHash, translationsCurrent: false },
    ),
    null,
  );
  assert.equal(
    selectCompletedBatch(
      [
        parent,
        {
          ...child,
          metadata: { ...child.metadata, source_hash: "b".repeat(64) },
        },
      ],
      new Set(),
      { currentSourceHash: sourceHash, translationsCurrent: false },
    ).id,
    parent.id,
  );
  for (const status of ["failed", "expired", "cancelled"]) {
    assert.throws(
      () =>
        selectCompletedBatch([parent, { ...child, status }], new Set(), {
          currentSourceHash: sourceHash,
          translationsCurrent: false,
        }),
      /needs attention/u,
    );
  }
  assert.throws(
    () =>
      selectCompletedBatch(
        [
          parent,
          {
            ...child,
            metadata: { ...child.metadata, retry_request_count: "99" },
          },
        ],
        new Set(),
        { currentSourceHash: sourceHash, translationsCurrent: false },
      ),
    /metadata is invalid/u,
  );
  assert.equal(
    selectCompletedBatch(
      [
        parent,
        { ...child, metadata: { ...child.metadata, repository: "other/repo" } },
      ],
      new Set(),
      { currentSourceHash: sourceHash, translationsCurrent: false },
    ).id,
    parent.id,
  );
});

test("長いbacktick fenceとtilde fenceも一括保護し、内部の3連backtickをコードのまま保つ", () => {
  const source = `${insightFixture}\n\`\`\`\`text\n\`\`\`bash\nprintf '%s\\n' 0\n\`\`\`\n\`\`\`\`\`\n~~~sh\n# 日本語コメント\nprintf '%s\\n' 15\n~~~\n`;
  const { text, tokens } = protectTranslationText(source);
  assert.doesNotMatch(text, /```|~~~|printf|日本語コメント/u);
  assert.equal(
    [...tokens.values()].filter((value) => value.includes("printf")).length,
    3,
  );
  const restored = restoreTranslationText(source, text);
  assert.equal(restored, source);
  validateInsightTranslation(source, restored);
  assert.throws(
    () =>
      validateInsightTranslation(
        source,
        source.replace("# 日本語コメント", "# Comment"),
      ),
    /fenced code changed/u,
  );
});

test("新方式のInsight結果を復元して適用し、旧方式は従来の厳格検証を続ける", () => {
  const request = createInsightRequest(metadata, insightFixture);
  assert.equal(decodeMetadata(request.custom_id).protectionVersion, 1);
  const masked = JSON.parse(request.body.input).markdown;
  const writes = new Map();
  const readers = {
    readFile: () => insightFixture,
    writeFile: (filePath, content) => {
      writes.set(filePath, content);
      return true;
    },
  };
  assert.equal(
    applyBatchTranslations(
      [batchResult(request, { markdown: masked.replace("確認する", "Check") })],
      sourceHash,
      readers,
    ),
    true,
  );
  assert.equal(writes.size, 1);
  const content = [...writes.values()][0];
  assert.equal(content, insightFixture.replace("確認する", "Check"));
  assert.doesNotMatch(content, /ACECORE_KEEP/u);

  const legacy = {
    ...request,
    custom_id: `acecore-systems:${Buffer.from(JSON.stringify(metadata)).toString("base64url")}`,
  };
  writes.clear();
  applyBatchTranslations(
    [batchResult(legacy, { markdown: insightFixture })],
    sourceHash,
    readers,
  );
  assert.equal(writes.size, 1);
  writes.clear();
  assert.throws(
    () =>
      applyBatchTranslations(
        [
          batchResult(legacy, {
            markdown: insightFixture.replace("利用者が0", "利用者がzero"),
          }),
        ],
        sourceHash,
        readers,
      ),
    /numeric value changed/u,
  );
  assert.equal(writes.size, 0);
});

test("Batch後半の不正結果やduplicate・旧source hashでは、前半の正常結果も書き込まない", () => {
  const request = createInsightRequest(metadata, insightFixture);
  const markdown = JSON.parse(request.body.input).markdown;
  const valid = batchResult(request, { markdown });
  const second = createInsightRequest(
    { ...metadata, locale: "es" },
    insightFixture,
  );
  const invalid = batchResult(second, {
    markdown: markdown.replace(/\{ACECORE_KEEP_[^}]+\}/u, "zero"),
  });
  const stale = createInsightRequest(
    { ...metadata, locale: "es", sourceHash: "b".repeat(64) },
    insightFixture,
  );
  const writes = [];
  for (const results of [
    [valid, invalid],
    [valid, valid],
    [valid, batchResult(stale, { markdown })],
  ]) {
    assert.throws(
      () =>
        applyBatchTranslations(results, sourceHash, {
          readFile: () => insightFixture,
          writeFile: (...args) => writes.push(args),
        }),
      /protected token|duplicate result|old sourceHash/u,
    );
    assert.deepEqual(writes, []);
  }
});

test("構造化copyでも数値・inline codeを復元し、同一localeの複数sourceを一括で反映する", () => {
  const sources = new Map([
    ["src/data/home.json", { id: "stable-home", heading: "利用者は0人。" }],
    ["src/data/site.json", { label: "15秒後に`list`を確認する。" }],
  ]);
  const results = [...sources].map(([sourcePath, source]) => {
    const request = createStructuredRequest(
      { ...metadata, kind: "content", sourcePath },
      source,
    );
    const entries = JSON.parse(request.body.input).entries;
    assert.equal(decodeMetadata(request.custom_id).protectionVersion, 1);
    assert.equal(
      entries.some((entry) => entry.id === "/id"),
      false,
    );
    return batchResult(request, {
      translations: entries.map((entry) => ({
        id: entry.id,
        text: entry.source.replace("確認する", "Check"),
      })),
    });
  });
  const writes = [];
  applyBatchTranslations(results, sourceHash, {
    getSourceValue: (sourcePath) => sources.get(sourcePath),
    readFile: () => JSON.stringify({ keep: "existing", home: {}, site: {} }),
    writeFile: (filePath, value) => {
      writes.push([filePath, JSON.parse(value)]);
      return true;
    },
  });
  assert.equal(writes.length, 1);
  assert.equal(writes[0][0], "src/i18n/content/en.json");
  assert.deepEqual(writes[0][1], {
    keep: "existing",
    home: { heading: "利用者は0人。" },
    site: { label: "15秒後に`list`をCheck。" },
  });
});

test("未知の保護方式を黙って旧方式として適用しない", () => {
  const customId = `acecore-systems:${Buffer.from(JSON.stringify({ ...metadata, protectionVersion: 2 })).toString("base64url")}`;
  assert.throws(() => decodeMetadata(customId), /metadata is invalid/u);
});

test("Insightの数値は本文でも桁を保ち、単語化や省略を拒否する", () => {
  const translated = insightFixture.replace(
    "利用者が0のとき、1台ずつ3つの条件を確認する。",
    "With 0 users, check 3 conditions on 1 server at a time.",
  );
  assert.equal(
    validateInsightTranslation(insightFixture, translated),
    translated,
  );
  for (const invalid of [
    translated.replace("0 users", "zero users"),
    translated.replace("1 server", "one server"),
    translated.replace("3 conditions", "conditions"),
    translated.replace("0 users", "2 users"),
  ]) {
    assert.throws(
      () =>
        validateInsightTranslation(insightFixture, invalid, "en: example.md"),
      /en: example\.md: numeric value changed/u,
    );
  }
});

test("Insightのコード内のバックスラッシュとコメントの変更を拒否する", () => {
  for (const invalid of [
    insightFixture.replace("%s\\n", "%s\\\\n"),
    insightFixture.replace("# 改行を出力する", "# Print a newline"),
  ]) {
    assert.throws(
      () => validateInsightTranslation(insightFixture, invalid),
      /fenced code changed/u,
    );
  }
  assert.equal(
    validateInsightTranslation(
      insightFixture.replaceAll("\n", "\r\n"),
      insightFixture,
    ),
    insightFixture,
  );
});

test("実記事の壊れたMarkdownコード例をまたぐ本文翻訳はリンク変更と誤判定しない", async () => {
  const source = await readFile(
    "src/content/insights/ai-chat-markdown-link-safety.md",
    "utf8",
  );
  const request = createInsightRequest(metadata, source);
  const translated = JSON.parse(request.body.input).markdown.replace(
    "テキストとして表示する",
    "Display as text",
  );
  const writes = new Map();
  applyBatchTranslations(
    [batchResult(request, { markdown: translated })],
    sourceHash,
    {
      readFile: () => source,
      writeFile: (filePath, content) => {
        writes.set(filePath, content);
        return true;
      },
    },
  );
  assert.deepEqual(
    [...writes.values()],
    [source.replace("テキストとして表示する", "Display as text")],
  );
  assert.throws(
    () =>
      validateInsightTranslation(
        source,
        source.replace("[壊れたリンク](/services/`", "[壊れたリンク](/other/`"),
      ),
    /inline code changed/u,
  );
});

test("実際のMarkdownリンクは表示文とtitleを翻訳してもURLを維持する", () => {
  for (const link of [
    '[案内](/services/ "案内")',
    "[案内]( /services/ '案内' )",
    '[案内](</services/> "案内")',
    '[案内](/services/(guide)/ "案内")',
    '[案内](/services/\\(guide\\)/ "案内")',
    "[案内](/services/\n(案内)\n)",
    '[案内](\n/services/ "案内\n説明"\n)',
    "![案内](/services/)",
  ]) {
    const source = `${insightFixture}${link}\n`;
    const translated = source
      .replaceAll("案内", "Guide")
      .replace("説明", "Description");
    assert.equal(validateInsightTranslation(source, translated), translated);
    assert.throws(
      () =>
        validateInsightTranslation(
          source,
          translated.replace("/services/", "/other/"),
        ),
      /Markdown link destinations: expected .*services.*; actual .*other/u,
    );
  }
});

test("Markdownリンク先の追加・削除・重複数の変更も拒否する", () => {
  const source = `${insightFixture}[案内](/services/)\n[連絡](/contact/)\n`;
  for (const translated of [
    `${source}[追加](/services/)\n`,
    source.replace("[連絡](/contact/)", "Contact"),
    source.replace("/contact/", "/services/"),
    source.replace("[案内](/services/)", "[Guide](/services/"),
  ]) {
    assert.throws(
      () => validateInsightTranslation(source, translated),
      /Markdown link destinations/u,
    );
  }
});

test("sourceHashは改行コード差を同じ版として扱う", () => {
  assert.equal(hashText("更新\r\n本文\r\n"), hashText("更新\n本文\n"));
});

test("Batch custom_idはlocaleとsourceHashを復元できる", () => {
  const sourceHash = "a".repeat(64);
  const customId = `acecore-systems:${Buffer.from(
    JSON.stringify({
      version: 1,
      kind: "content",
      locale: "en",
      sourcePath: "src/data/home.json",
      sourceHash,
    }),
  ).toString("base64url")}`;

  assert.deepEqual(decodeMetadata(customId), {
    version: 1,
    kind: "content",
    locale: "en",
    sourcePath: "src/data/home.json",
    sourceHash,
  });
});

test("PRのsourceHashが現在の日本語sourceと異なる場合は古い版として扱う", () => {
  const current = "b".repeat(64);
  const body = `${getSourceMarker("a".repeat(64))}\ntranslation`;

  assert.equal(getSourceHashFromPullRequestBody(body), "a".repeat(64));
  assert.equal(isTranslationPullRequestCurrent(body, current), false);
  assert.equal(
    isTranslationPullRequestCurrent(getSourceMarker(current), current),
    true,
  );
  assert.equal(isTranslationPullRequestCurrent(null, current), false);
  assert.equal(isTranslationPullRequestCurrent("markerなし", current), false);
});

test("UIとフォームのlocale objectは対象localeだけを置き換える", () => {
  const source = [
    "export const copy = {",
    '  ja: { label: "日本語" },',
    '  "zh-cn": { label: "旧翻译" },',
    "};",
  ].join("\n");

  const translated = replaceLocaleObject(source, "zh-cn", {
    label: "新翻译",
  });

  assert.match(translated, /ja: \{ label: "日本語" \}/u);
  assert.match(translated, /"zh-cn": \{\n  "label": "新翻译"\n\}/u);
});

test("feature branchの結果をstaleとして処理した後も、mainが同じsourceになれば再回収できる", () => {
  const currentSourceHash = "b".repeat(64);
  const batch = {
    id: "batch_premerged",
    status: "completed",
    metadata: {
      translation_system: "acecore-systems-v1",
      source_hash: currentSourceHash,
    },
    request_counts: { total: 8, completed: 8, failed: 0 },
  };
  const processed = new Set([batch.id]);
  const options = { currentSourceHash, translationsCurrent: false };
  assert.equal(selectCompletedBatch([batch], processed, options), batch);
  for (const rejected of [
    { ...batch, metadata: { ...batch.metadata, source_hash: "a".repeat(64) } },
    { ...batch, request_counts: { total: 8, completed: 7, failed: 1 } },
    { ...batch, request_counts: { total: 8, completed: 7, failed: 0 } },
    { ...batch, request_counts: { total: 0, completed: 0, failed: 0 } },
    { ...batch, status: "in_progress" },
  ]) {
    assert.equal(selectCompletedBatch([rejected], processed, options), null);
  }
  assert.equal(
    selectCompletedBatch([batch], processed, {
      ...options,
      translationsCurrent: true,
    }),
    null,
  );
  assert.equal(
    selectCompletedBatch([batch], processed, {
      ...options,
      publishedBatchIds: new Set([batch.id]),
    }),
    null,
  );
  assert.equal(selectCompletedBatch([batch], processed), null);
});

test("WorkflowはTerra/mediumをBatchへ投入し、回収後にBot PRを作る", async () => {
  const [submit, collect, script] = await Promise.all([
    readFile(".github/workflows/submit-openai-translation-batch.yml", "utf8"),
    readFile(".github/workflows/collect-openai-translation-batch.yml", "utf8"),
    readFile("scripts/openai-translation-batch.mjs", "utf8"),
  ]);

  assert.match(submit, /sleep 900/u);
  assert.match(submit, /OPENAI_TRANSLATION_API_KEY/u);
  assert.match(submit, /openai-translation-batch\.mjs submit/u);
  assert.match(submit, /RETRY_BATCH_ID: \$\{\{ inputs\.retry_batch_id \}\}/u);
  assert.match(
    submit,
    /retry_args=\(--batch-id="\$RETRY_BATCH_ID" --max-retry-requests="\$\{RETRY_MAX_REQUESTS:-10\}"\)/u,
  );
  assert.match(submit, /retry_dry_run:[\s\S]*default: true/u);
  assert.match(collect, /translation\/openai\//u);
  assert.match(collect, /actions\/create-github-app-token@v3/u);
  assert.match(
    collect,
    /client-id:\s+\$\{\{ secrets\.TRANSLATION_BOT_CLIENT_ID \}\}/u,
  );
  assert.doesNotMatch(collect, /TRANSLATION_BOT_APP_ID/u);
  assert.doesNotMatch(collect, /^\s+app-id:/mu);
  assert.match(collect, /openai-translation-processed-/u);
  assert.match(collect, /push:\s+branches:\s+- main\s+paths:/u);
  assert.match(collect, /- scripts\/openai-translation-batch\.mjs/u);
  assert.match(collect, /group: openai-translation-collector/u);
  assert.match(collect, /cancel-in-progress: false/u);
  assert.match(collect, /Format collected translation files/u);
  assert.match(collect, /git diff --name-only --diff-filter=ACMRT -z/u);
  assert.match(collect, /npx prettier --write --/u);
  assert.match(collect, /Preserve translation validation failure/u);
  assert.match(
    collect,
    /failure\(\) && steps\.collector\.outputs\.validation_report_path/u,
  );
  assert.match(script, /gpt-6\.1-terra/u);
  assert.match(script, /const BATCH_EFFORT = "medium"/u);
});

test("セキュリティサービスのBatch翻訳を専用の入れ子へ反映し、既存サービスを保つ", () => {
  const sourcePath = "src/data/service-details/security.json";
  const source = {
    title: "安全性を確認する",
    offerings: [
      { id: "review", pricingKeys: ["security-review"], title: "確認する" },
    ],
  };
  const request = createStructuredRequest(
    { ...metadata, kind: "content", sourcePath },
    source,
  );
  const entries = JSON.parse(request.body.input).entries;
  const writes = new Map();
  const previous = {
    serviceDetails: { operations: { title: "Existing operations" } },
  };
  applyBatchTranslations(
    [
      batchResult(request, {
        translations: entries.map((entry) => ({
          id: entry.id,
          text: entry.source
            .replace("安全性を確認する", "Check security")
            .replace("確認する", "Review"),
        })),
      }),
    ],
    sourceHash,
    {
      getSourceValue: () => source,
      readFile: () => JSON.stringify(previous),
      writeFile: (filePath, value) => {
        writes.set(filePath, JSON.parse(value));
        return true;
      },
    },
  );
  assert.deepEqual(writes.get("src/i18n/content/en.json"), {
    serviceDetails: {
      operations: previous.serviceDetails.operations,
      security: {
        title: "Check security",
        offerings: [{ title: "Review" }],
      },
    },
  });
});

test("回収前に同じBatch・sourceのmain向けマージ済みPRを確認した場合だけ既存結果とする", async () => {
  const originalFetch = globalThis.fetch;
  const names = [
    "GITHUB_REPOSITORY",
    "GITHUB_TOKEN",
    "OPENAI_TRANSLATION_API_KEY",
    "RUNNER_TEMP",
    "GITHUB_OUTPUT",
  ];
  const env = Object.fromEntries(names.map((key) => [key, process.env[key]]));
  const dir = await mkdtemp(join(tmpdir(), "systems-merged-batch-"));
  const hash = calculateTranslationSourceHash(process.cwd());
  const batch = {
    id: "batch_child",
    status: "completed",
    output_file_id: "file_child",
    request_counts: { total: 16, completed: 14, failed: 2 },
    metadata: {
      translation_system: "acecore-systems-v1",
      repository: "acecore-systems/acecore-systems",
      source_hash: hash,
      retry_of: "batch_parent",
      retry_identities_hash: "b".repeat(64),
      retry_request_count: "16",
    },
  };
  const pull = {
    state: "closed",
    merged_at: "2026-11-14T00:00:00Z",
    body: getSourceMarker(hash),
    head: {
      ref: "translation/openai/batch_child",
      repo: { full_name: "acecore-systems/acecore-systems" },
    },
    base: { ref: "main" },
  };
  try {
    process.env.GITHUB_REPOSITORY = "acecore-systems/acecore-systems";
    process.env.GITHUB_TOKEN = "fixture";
    process.env.OPENAI_TRANSLATION_API_KEY = "fixture";
    process.env.RUNNER_TEMP = dir;
    process.env.GITHUB_OUTPUT = join(dir, "output");
    for (const [candidate, accepted] of [
      [pull, true],
      [{ ...pull, merged_at: null }, false],
      [{ ...pull, body: getSourceMarker("c".repeat(64)) }, false],
      [{ ...pull, state: "open" }, false],
      [
        {
          ...pull,
          head: { ...pull.head, ref: "translation/openai/batch_other" },
        },
        false,
      ],
      [
        { ...pull, head: { ...pull.head, repo: { full_name: "other/repo" } } },
        false,
      ],
      [{ ...pull, base: { ref: "other" } }, false],
    ]) {
      const calls = [];
      globalThis.fetch = async (url) => {
        calls.push(url);
        if (url.includes("/pulls?state=open")) return Response.json([]);
        if (url.includes("/batches?limit=100"))
          return Response.json({ data: [batch], has_more: false });
        if (url.includes("/pulls?state=all")) return Response.json([candidate]);
        if (url.includes("/files/file_child/content"))
          return new Response("", { status: 200 });
        throw new Error(`unexpected ${url}`);
      };
      await rm(join(dir, "openai-translation-processed-batch_child.txt"), {
        force: true,
      });
      if (accepted) {
        await collectBatch({ processedBatches: new Set() });
        assert.equal(
          await readFile(
            join(dir, "openai-translation-processed-batch_child.txt"),
            "utf8",
          ),
          "batch_child\n",
        );
        assert.equal(
          calls.some((url) => url.includes("/files/")),
          false,
        );
      } else {
        await assert.rejects(
          collectBatch({ processedBatches: new Set() }),
          /Retry output is incomplete/,
        );
        await assert.rejects(
          readFile(join(dir, "openai-translation-processed-batch_child.txt")),
          { code: "ENOENT" },
        );
        assert.equal(
          calls.some((url) => url.includes("/files/")),
          true,
        );
      }
    }
  } finally {
    globalThis.fetch = originalFetch;
    for (const key of names) {
      if (env[key] === undefined) delete process.env[key];
      else process.env[key] = env[key];
    }
    await rm(dir, { recursive: true, force: true });
  }
});
