import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  applyBatchTranslations,
  assertRetryBatch,
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
  globalThis.fetch = async (url, init = {}) => {
    const method = init.method ?? "GET";
    methods.push(method);
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
          retry_request_count: "10",
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

test("WorkflowはLuna/maxをBatchへ投入し、回収後にBot PRを作る", async () => {
  const [submit, collect, script] = await Promise.all([
    readFile(".github/workflows/submit-openai-translation-batch.yml", "utf8"),
    readFile(".github/workflows/collect-openai-translation-batch.yml", "utf8"),
    readFile("scripts/openai-translation-batch.mjs", "utf8"),
  ]);

  assert.match(submit, /sleep 900/u);
  assert.match(submit, /OPENAI_TRANSLATION_API_KEY/u);
  assert.match(submit, /openai-translation-batch\.mjs submit/u);
  assert.match(submit, /RETRY_BATCH_ID: \$\{\{ inputs\.retry_batch_id \}\}/u);
  assert.match(submit, /retry_args=\(--batch-id="\$RETRY_BATCH_ID"\)/u);
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
  assert.match(collect, /Format collected translation files/u);
  assert.match(collect, /git diff --name-only --diff-filter=ACMRT -z/u);
  assert.match(collect, /npx prettier --write --/u);
  assert.match(collect, /Preserve translation validation failure/u);
  assert.match(
    collect,
    /failure\(\) && steps\.collector\.outputs\.validation_report_path/u,
  );
  assert.match(script, /gpt-6-luna/u);
  assert.match(script, /reasoning: \{ effort: "max" \}/u);
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
