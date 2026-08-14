import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { contactFormCopy } from "../src/i18n/contact-form.ts";
import { ui } from "../src/i18n/ui.ts";
import {
  calculateTranslationSourceHash,
  translatedLocales,
  translationSourcePaths,
} from "./i18n-source-hash.mjs";

const API_BASE_URL = "https://api.openai.com/v1";
const BATCH_ENDPOINT = "/v1/responses";
const BATCH_MODEL = "gpt-5.6-luna";
const BATCH_METADATA_KEY = "translation_system";
const BATCH_METADATA_VALUE = "acecore-systems-v1";
const CUSTOM_ID_PREFIX = "acecore-systems:";
const SOURCE_MARKER_PREFIX = "<!-- openai-translation-source:";
const SOURCE_MARKER_SUFFIX = " -->";
const BATCH_MARKER_PREFIX = "<!-- openai-translation-batch:";
const BATCH_MARKER_SUFFIX = " -->";
const ZERO_SHA = "0000000000000000000000000000000000000000";

const sourceTargetPaths = new Map([
  ["src/data/contact.json", ["contact"]],
  ["src/data/guide.json", ["guide"]],
  ["src/data/home.json", ["home"]],
  ["src/data/it-advisor.json", ["itAdvisor"]],
  ["src/data/pricing.json", ["pricing"]],
  ["src/data/privacy.json", ["privacy"]],
  [
    "src/data/service-details/development.json",
    ["serviceDetails", "development"],
  ],
  [
    "src/data/service-details/operations.json",
    ["serviceDetails", "operations"],
  ],
  [
    "src/data/service-details/site-functions.json",
    ["serviceDetails", "siteFunctions"],
  ],
  [
    "src/data/service-details/site-quality.json",
    ["serviceDetails", "siteQuality"],
  ],
  ["src/data/services.json", ["services"]],
  ["src/data/site.json", ["site"]],
  ["src/data/work-details/acecore-site-platform.json", ["workDetail"]],
  ["src/data/works.json", ["works"]],
]);

const stableKeys = new Set([
  "accent",
  "contactFormAction",
  "consultationTrack",
  "detailUrl",
  "email",
  "externalUrl",
  "ga4Id",
  "href",
  "icon",
  "id",
  "image",
  "key",
  "name",
  "number",
  "phone",
  "pricingKey",
  "pricingKeys",
  "primaryCtaHref",
  "secondaryCtaHref",
  "src",
  "turnstileSiteKey",
  "track",
  "uploadedImage",
]);

const textResponseSchema = {
  type: "object",
  additionalProperties: false,
  required: ["translations"],
  properties: {
    translations: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["id", "text"],
        properties: {
          id: { type: "string" },
          text: { type: "string" },
        },
      },
    },
  },
};

const markdownResponseSchema = {
  type: "object",
  additionalProperties: false,
  required: ["markdown"],
  properties: {
    markdown: { type: "string" },
  },
};

function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function normalizeText(value) {
  return value.replace(/\r\n/gu, "\n");
}

export function hashText(value) {
  return createHash("sha256").update(normalizeText(value)).digest("hex");
}

function runGit(args) {
  return execFileSync("git", args, { encoding: "utf8" }).trim();
}

function tryRunGit(args) {
  try {
    return runGit(args);
  } catch {
    return null;
  }
}

function resolveRevision(value, label) {
  if (!value || value === "HEAD") return "HEAD";
  if (!/^[0-9a-f]{40}$/iu.test(value)) {
    throw new Error(`${label} must be HEAD or a full commit SHA`);
  }
  return value;
}

function parseArgs(argv) {
  const command = argv[0];
  if (!["submit", "collect"].includes(command)) {
    throw new Error(
      "Usage: openai-translation-batch.mjs <submit|collect> [options]",
    );
  }

  const options = {
    command,
    base: null,
    head: "HEAD",
    processedBatches: new Set(),
  };
  for (const argument of argv.slice(1)) {
    if (argument.startsWith("--base=")) {
      options.base = argument.slice("--base=".length) || null;
    } else if (argument.startsWith("--head=")) {
      options.head = argument.slice("--head=".length) || "HEAD";
    } else if (argument.startsWith("--processed-batches=")) {
      options.processedBatches = new Set(
        argument
          .slice("--processed-batches=".length)
          .split(",")
          .map((value) => value.trim())
          .filter(Boolean),
      );
    } else {
      throw new Error(`Unknown argument: ${argument}`);
    }
  }

  options.head = resolveRevision(options.head, "head");
  if (options.base === ZERO_SHA) options.base = null;
  if (options.base) options.base = resolveRevision(options.base, "base");
  return options;
}

function isStableKey(key) {
  return stableKeys.has(key) || /(?:Href|Url)$/u.test(key);
}

function isJapaneseSourcePath(filePath) {
  return (
    sourceTargetPaths.has(filePath) ||
    /^src\/content\/insights\/[^/]+\.md$/u.test(filePath) ||
    filePath === "src/i18n/ui.ts" ||
    filePath === "src/i18n/contact-form.ts"
  );
}

function listChangedSourcePaths(base, head) {
  const args = base
    ? [
        "diff",
        "--name-only",
        base,
        head,
        "--",
        ...translationSourcePaths,
        "src/i18n/ui.ts",
        "src/i18n/contact-form.ts",
      ]
    : [
        "diff-tree",
        "--no-commit-id",
        "--name-only",
        "-r",
        head,
        "--",
        ...translationSourcePaths,
        "src/i18n/ui.ts",
        "src/i18n/contact-form.ts",
      ];
  const output = tryRunGit(args);
  if (!output) return [];
  return [
    ...new Set(output.split(/\r?\n/gu).filter(isJapaneseSourcePath)),
  ].sort();
}

function toJsonPointer(segments) {
  return `/${segments
    .map((segment) => segment.replaceAll("~", "~0").replaceAll("/", "~1"))
    .join("/")}`;
}

function listTextEntries(value, segments = [], { omitStable = false } = {}) {
  const key = segments.at(-1) ?? "";
  if (omitStable && isStableKey(key)) return [];
  if (typeof value === "string") {
    return [{ id: toJsonPointer(segments), source: value }];
  }
  if (value === null || typeof value !== "object") return [];
  if (Array.isArray(value)) {
    return value.flatMap((child, index) =>
      listTextEntries(child, [...segments, String(index)], { omitStable }),
    );
  }
  return Object.entries(value).flatMap(([key, child]) =>
    listTextEntries(child, [...segments, key], { omitStable }),
  );
}

function getSourceValue(sourcePath) {
  if (sourceTargetPaths.has(sourcePath)) {
    return JSON.parse(readFileSync(sourcePath, "utf8"));
  }
  if (sourcePath === "src/i18n/ui.ts") return ui.ja;
  if (sourcePath === "src/i18n/contact-form.ts") return contactFormCopy.ja;
  throw new Error(`Unsupported structured translation source: ${sourcePath}`);
}

function createResponseFormat(name, schema) {
  return { type: "json_schema", name, strict: true, schema };
}

function encodeMetadata(metadata) {
  return `${CUSTOM_ID_PREFIX}${Buffer.from(JSON.stringify(metadata)).toString("base64url")}`;
}

export function decodeMetadata(customId) {
  if (!customId.startsWith(CUSTOM_ID_PREFIX)) {
    throw new Error("Unexpected OpenAI Batch custom_id");
  }
  const parsed = JSON.parse(
    Buffer.from(customId.slice(CUSTOM_ID_PREFIX.length), "base64url").toString(
      "utf8",
    ),
  );
  if (
    !isRecord(parsed) ||
    parsed.version !== 1 ||
    !["content", "ui", "contact", "insight"].includes(parsed.kind) ||
    typeof parsed.locale !== "string" ||
    typeof parsed.sourcePath !== "string" ||
    !/^[a-f0-9]{64}$/u.test(parsed.sourceHash)
  ) {
    throw new Error("OpenAI Batch custom_id metadata is invalid");
  }
  return parsed;
}

function createStructuredRequest(metadata, source) {
  const entries = listTextEntries(source, [], {
    omitStable: metadata.kind === "content",
  });
  if (entries.length === 0) return null;
  return {
    custom_id: encodeMetadata(metadata),
    method: "POST",
    url: BATCH_ENDPOINT,
    body: {
      model: BATCH_MODEL,
      reasoning: { effort: "max" },
      instructions: [
        "Translate Japanese Acecore Systems website copy into the requested target locale.",
        "Return one translation for every supplied id.",
        "Do not change placeholders, URLs, inline code, numeric values, product names, or code-like tokens.",
        "Use natural professional website language. Return only the requested JSON object.",
      ].join("\n"),
      input: JSON.stringify({
        targetLocale: metadata.locale,
        sourcePath: metadata.sourcePath,
        entries,
      }),
      text: {
        format: createResponseFormat("translation_entries", textResponseSchema),
      },
    },
  };
}

function createInsightRequest(metadata, markdown) {
  return {
    custom_id: encodeMetadata(metadata),
    method: "POST",
    url: BATCH_ENDPOINT,
    body: {
      model: BATCH_MODEL,
      reasoning: { effort: "max" },
      instructions: [
        "Translate this Japanese Acecore Systems Insight article into the requested target locale.",
        "Return the entire Markdown document including YAML frontmatter.",
        "Keep frontmatter keys, author, date, lastUpdated, image, uploadedImage, URLs, image destinations, placeholders, inline code, and fenced code unchanged.",
        "Translate all user-visible prose, including visible frontmatter strings, headings, labels, lists, tables, callouts, FAQs, and image alt text.",
        "Return only the requested JSON object.",
      ].join("\n"),
      input: JSON.stringify({
        targetLocale: metadata.locale,
        sourcePath: metadata.sourcePath,
        markdown: normalizeText(markdown),
      }),
      text: {
        format: createResponseFormat(
          "translated_insight",
          markdownResponseSchema,
        ),
      },
    },
  };
}

function requireApiKey() {
  const key = process.env.OPENAI_TRANSLATION_API_KEY?.trim();
  if (!key) throw new Error("OPENAI_TRANSLATION_API_KEY is required");
  return key;
}

async function openAiFetch(pathname, init = {}) {
  const response = await fetch(`${API_BASE_URL}${pathname}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${requireApiKey()}`,
      ...(init.headers ?? {}),
    },
  });
  if (!response.ok) {
    throw new Error(
      `OpenAI API ${init.method ?? "GET"} ${pathname} failed: ${response.status} ${await response.text()}`,
    );
  }
  return response;
}

async function openAiJson(pathname, init = {}) {
  return (await openAiFetch(pathname, init)).json();
}

async function listBatches() {
  const result = await openAiJson("/batches?limit=100");
  return Array.isArray(result.data) ? result.data : [];
}

function isOurBatch(batch) {
  return batch?.metadata?.[BATCH_METADATA_KEY] === BATCH_METADATA_VALUE;
}

function isReusableBatch(batch, sourceHash) {
  return (
    isOurBatch(batch) &&
    batch.metadata?.source_hash === sourceHash &&
    !["failed", "expired", "cancelled"].includes(batch.status)
  );
}

async function uploadBatchInput(input) {
  const form = new FormData();
  form.set("purpose", "batch");
  form.set(
    "file",
    new Blob([input], { type: "application/jsonl" }),
    "acecore-systems-translation.jsonl",
  );
  return (await openAiFetch("/files", { method: "POST", body: form })).json();
}

async function createBatch(inputFileId, sourceHash, sourceCommit) {
  return openAiJson("/batches", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      input_file_id: inputFileId,
      endpoint: BATCH_ENDPOINT,
      completion_window: "24h",
      metadata: {
        [BATCH_METADATA_KEY]: BATCH_METADATA_VALUE,
        repository:
          process.env.GITHUB_REPOSITORY ?? "acecore-systems/acecore-systems",
        source_hash: sourceHash,
        source_commit: sourceCommit,
      },
    }),
  });
}

function githubHeaders() {
  const token = process.env.GITHUB_TOKEN?.trim();
  if (!token) return null;
  return {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${token}`,
    "X-GitHub-Api-Version": "2022-11-28",
  };
}

async function githubRequest(pathname, init = {}) {
  const repository = process.env.GITHUB_REPOSITORY?.trim();
  const headers = githubHeaders();
  if (!repository || !headers) return null;
  const response = await fetch(
    `https://api.github.com/repos/${repository}${pathname}`,
    {
      ...init,
      headers: { ...headers, ...(init.headers ?? {}) },
    },
  );
  if (!response.ok) {
    throw new Error(
      `GitHub API ${init.method ?? "GET"} ${pathname} failed: ${response.status} ${await response.text()}`,
    );
  }
  return response.status === 204 ? null : response.json();
}

export function getSourceMarker(sourceHash) {
  return `${SOURCE_MARKER_PREFIX}${sourceHash}${SOURCE_MARKER_SUFFIX}`;
}

export function getSourceHashFromPullRequestBody(body) {
  if (typeof body !== "string") return null;
  const match = body.match(
    /<!-- openai-translation-source:([a-f0-9]{64}) -->/u,
  );
  return match?.[1] ?? null;
}

export function isTranslationPullRequestCurrent(body, currentSourceHash) {
  return getSourceHashFromPullRequestBody(body) === currentSourceHash;
}

async function closeStalePullRequests(currentSourceHash) {
  const pulls = await githubRequest("/pulls?state=open&per_page=100");
  if (!Array.isArray(pulls)) return;
  for (const pull of pulls) {
    const marker = getSourceHashFromPullRequestBody(pull.body);
    if (
      typeof pull?.head?.ref !== "string" ||
      !pull.head.ref.startsWith("translation/openai/") ||
      !marker ||
      marker === currentSourceHash
    ) {
      continue;
    }
    await githubRequest(`/pulls/${pull.number}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ state: "closed" }),
    });
    console.log(`Closed stale OpenAI translation PR #${pull.number}.`);
  }
}

async function submitBatch(options) {
  const eventBase = options.base ?? process.env.GITHUB_EVENT_BEFORE ?? null;
  const base = eventBase === ZERO_SHA ? null : eventBase;
  const sourcePaths = listChangedSourcePaths(base, options.head);
  if (sourcePaths.length === 0) {
    console.log("No Japanese Systems source changes detected.");
    return;
  }

  const sourceHash = calculateTranslationSourceHash(process.cwd());
  await closeStalePullRequests(sourceHash);
  const existing = (await listBatches()).find((batch) =>
    isReusableBatch(batch, sourceHash),
  );
  if (existing) {
    console.log(
      `A Batch for current sourceHash already exists: ${existing.id} (${existing.status}).`,
    );
    return;
  }

  const requests = [];
  for (const sourcePath of sourcePaths) {
    const insight = /^src\/content\/insights\/([^/]+)\.md$/u.test(sourcePath);
    const source = insight
      ? readFileSync(sourcePath, "utf8")
      : getSourceValue(sourcePath);
    for (const locale of translatedLocales) {
      const metadata = {
        version: 1,
        kind: insight
          ? "insight"
          : sourcePath === "src/i18n/ui.ts"
            ? "ui"
            : sourcePath === "src/i18n/contact-form.ts"
              ? "contact"
              : "content",
        locale,
        sourcePath,
        sourceHash,
      };
      const request = insight
        ? createInsightRequest(metadata, source)
        : createStructuredRequest(metadata, source);
      if (request) requests.push(request);
    }
  }

  if (requests.length === 0) {
    console.log("No translatable source strings were found.");
    return;
  }
  const inputFile = await uploadBatchInput(
    `${requests.map((request) => JSON.stringify(request)).join("\n")}\n`,
  );
  const sourceCommit = runGit(["rev-parse", "HEAD"]);
  const batch = await createBatch(inputFile.id, sourceHash, sourceCommit);
  console.log(
    `Submitted OpenAI translation batch ${batch.id} (${requests.length} requests).`,
  );
  writeOutput("batch_id", batch.id);
}

function getResponseText(body) {
  if (typeof body?.output_text === "string") return body.output_text;
  const texts = [];
  for (const item of body?.output ?? []) {
    for (const content of item?.content ?? []) {
      if (typeof content?.text === "string") texts.push(content.text);
    }
  }
  if (texts.length === 0) throw new Error("Responses output text is missing");
  return texts.join("");
}

function parseJsonResponse(body) {
  const parsed = JSON.parse(getResponseText(body));
  if (!isRecord(parsed))
    throw new Error("Translation response must be an object");
  return parsed;
}

function parseTranslationMap(response, source, { omitStable = false } = {}) {
  if (!Array.isArray(response.translations)) {
    throw new Error("Translation response.translations must be an array");
  }
  const translations = new Map();
  for (const value of response.translations) {
    if (
      !isRecord(value) ||
      typeof value.id !== "string" ||
      typeof value.text !== "string" ||
      translations.has(value.id)
    ) {
      throw new Error("Translation response contains an invalid entry");
    }
    translations.set(value.id, value.text);
  }
  const expected = new Set(
    listTextEntries(source, [], { omitStable }).map((entry) => entry.id),
  );
  if (translations.size !== expected.size) {
    throw new Error("Translation response has an unexpected entry count");
  }
  for (const id of expected) {
    if (!translations.has(id)) throw new Error(`Missing translation for ${id}`);
  }
  return translations;
}

function matches(value, expression) {
  return [...value.matchAll(expression)].map((match) => match[0]).sort();
}

function assertProtectedTokens(source, translated, label) {
  for (const [name, expression] of [
    ["placeholder", /\{[A-Za-z0-9_.-]+\}/gu],
    ["inline code", /`[^`\r\n]+`/gu],
    ["URL", /https:\/\/[^\s<>"')\]]+/gu],
    ["numeric value", /\d+(?:[.,]\d+)*/gu],
  ]) {
    if (
      JSON.stringify(matches(source, expression)) !==
      JSON.stringify(matches(translated, expression))
    ) {
      throw new Error(`${label}: ${name} changed`);
    }
  }
}

const OMIT = Symbol("omit");

function buildTranslatedValue(
  value,
  translations,
  segments = [],
  options = {},
) {
  const key = segments.at(-1) ?? "";
  if (options.omitStable && isStableKey(key)) return OMIT;
  if (typeof value === "string") {
    const id = toJsonPointer(segments);
    const translated = translations.get(id);
    if (typeof translated !== "string") {
      throw new Error(`Missing translated value for ${id}`);
    }
    assertProtectedTokens(value, translated, `Translation ${id}`);
    return translated;
  }
  if (value === null || typeof value !== "object") return value;
  if (Array.isArray(value)) {
    return value.map((child, index) => {
      const translated = buildTranslatedValue(
        child,
        translations,
        [...segments, String(index)],
        options,
      );
      if (translated === OMIT) {
        throw new Error("Stable values cannot be array entries");
      }
      return translated;
    });
  }
  const result = {};
  for (const [key, child] of Object.entries(value)) {
    const translated = buildTranslatedValue(
      child,
      translations,
      [...segments, key],
      options,
    );
    if (translated !== OMIT) result[key] = translated;
  }
  return result;
}

function setAtPath(root, segments, value) {
  let cursor = root;
  for (const [index, segment] of segments.entries()) {
    if (index === segments.length - 1) {
      cursor[segment] = value;
      return;
    }
    if (!isRecord(cursor[segment])) cursor[segment] = {};
    cursor = cursor[segment];
  }
}

function writeFileIfChanged(filePath, content) {
  const previous = existsSync(filePath) ? readFileSync(filePath, "utf8") : null;
  if (previous === content) return false;
  mkdirSync(path.dirname(filePath), { recursive: true });
  writeFileSync(filePath, content);
  return true;
}

function applyContentTranslation(metadata, response) {
  const source = getSourceValue(metadata.sourcePath);
  const translations = parseTranslationMap(response, source, {
    omitStable: true,
  });
  const translated = buildTranslatedValue(source, translations, [], {
    omitStable: true,
  });
  const targetPath = sourceTargetPaths.get(metadata.sourcePath);
  if (!targetPath)
    throw new Error(`Unknown content source: ${metadata.sourcePath}`);
  const filePath = `src/i18n/content/${metadata.locale}.json`;
  const target = JSON.parse(readFileSync(filePath, "utf8"));
  setAtPath(target, targetPath, translated);
  return writeFileIfChanged(filePath, `${JSON.stringify(target, null, 2)}\n`);
}

function findMatchingBrace(source, openingIndex) {
  let depth = 0;
  let quote = null;
  for (let index = openingIndex; index < source.length; index += 1) {
    const character = source[index];
    if (quote) {
      if (character === "\\") {
        index += 1;
      } else if (character === quote) {
        quote = null;
      }
      continue;
    }
    if (character === '"' || character === "'" || character === "`") {
      quote = character;
    } else if (character === "{") {
      depth += 1;
    } else if (character === "}") {
      depth -= 1;
      if (depth === 0) return index;
    }
  }
  throw new Error("Could not find a matching locale object brace");
}

export function replaceLocaleObject(source, locale, value) {
  const escapedLocale = locale.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
  const expression = new RegExp(
    `^\\s*(?:${escapedLocale}|["']${escapedLocale}["'])\\s*:\\s*\\{`,
    "mu",
  );
  const match = expression.exec(source);
  if (!match || match.index === undefined) {
    throw new Error(`Could not locate ${locale} locale object`);
  }
  const opening = source.indexOf("{", match.index);
  const closing = findMatchingBrace(source, opening);
  return `${source.slice(0, opening)}${JSON.stringify(value, null, 2)}${source.slice(closing + 1)}`;
}

function applyInterfaceTranslation(metadata, response, pendingFiles) {
  const source = getSourceValue(metadata.sourcePath);
  const translations = parseTranslationMap(response, source);
  const translated = buildTranslatedValue(source, translations);
  const current =
    pendingFiles.get(metadata.sourcePath) ??
    readFileSync(metadata.sourcePath, "utf8");
  pendingFiles.set(
    metadata.sourcePath,
    replaceLocaleObject(current, metadata.locale, translated),
  );
}

function getScalar(markdown, key) {
  const frontmatter = markdown.split(/^---\s*$/mu)[1] ?? "";
  const match = frontmatter.match(new RegExp(`^${key}:\\s*(.*?)\\s*$`, "mu"));
  return match?.[1]?.replace(/^(['"])(.*)\1$/u, "$2") ?? null;
}

function markdownLinkTargets(markdown) {
  return matches(markdown, /\]\(([^)\s]+)(?:\s+[^)]*)?\)/gu).sort();
}

function validateInsightTranslation(source, translated) {
  const output = normalizeText(translated);
  if (!output.startsWith("---\n")) {
    throw new Error("Translated Insight must include YAML frontmatter");
  }
  for (const field of [
    "author",
    "date",
    "lastUpdated",
    "image",
    "uploadedImage",
  ]) {
    if (getScalar(source, field) !== getScalar(output, field)) {
      throw new Error(`Translated Insight changed stable ${field}`);
    }
  }
  if (
    (source.match(/```/gu)?.length ?? 0) !==
    (output.match(/```/gu)?.length ?? 0)
  ) {
    throw new Error("Translated Insight changed fenced code delimiters");
  }
  assertProtectedTokens(source, output, "Translated Insight");
  if (
    JSON.stringify(markdownLinkTargets(source)) !==
    JSON.stringify(markdownLinkTargets(output))
  ) {
    throw new Error("Translated Insight changed Markdown link destinations");
  }
  return output.endsWith("\n") ? output : `${output}\n`;
}

function applyInsightTranslation(metadata, response) {
  if (typeof response.markdown !== "string") {
    throw new Error("Insight response.markdown must be a string");
  }
  const source = readFileSync(metadata.sourcePath, "utf8");
  const translated = validateInsightTranslation(source, response.markdown);
  const slug = path.basename(metadata.sourcePath);
  return writeFileIfChanged(
    path.join("src/content/insights", metadata.locale, slug),
    translated,
  );
}

function parseOutputLines(value) {
  return value
    .split(/\r?\n/gu)
    .filter(Boolean)
    .map((line) => JSON.parse(line));
}

async function getBatchOutput(batch) {
  if (!batch.output_file_id) throw new Error(`Batch ${batch.id} has no output`);
  const response = await openAiFetch(
    `/files/${encodeURIComponent(batch.output_file_id)}/content`,
  );
  return parseOutputLines(await response.text());
}

function selectCompletedBatch(batches, processedBatches) {
  return (
    [...batches]
      .filter(
        (batch) =>
          isOurBatch(batch) &&
          batch.status === "completed" &&
          !processedBatches.has(batch.id),
      )
      .sort(
        (left, right) => (left.created_at ?? 0) - (right.created_at ?? 0),
      )[0] ?? null
  );
}

function makePullRequestBody(batchId, sourceHash) {
  return [
    `${BATCH_MARKER_PREFIX}${batchId}${BATCH_MARKER_SUFFIX}`,
    getSourceMarker(sourceHash),
    "",
    "## 概要",
    "- OpenAI Batch（gpt-5.6-luna / reasoning max）で最新の日本語 source を翻訳しました。",
    "- sourceHash が現在の source と一致する結果だけを含めています。",
    "",
    "## 確認",
    "- CI と必須checkが成功すると、squashで自動マージされます。",
  ].join("\n");
}

function writeOutput(key, value) {
  if (process.env.GITHUB_OUTPUT) {
    writeFileSync(process.env.GITHUB_OUTPUT, `${key}=${value}\n`, {
      flag: "a",
    });
  }
}

function writeMarker(batchId) {
  const directory = process.env.RUNNER_TEMP ?? ".tmp";
  mkdirSync(directory, { recursive: true });
  const markerPath = path.join(
    directory,
    `openai-translation-processed-${batchId}.txt`,
  );
  writeFileSync(markerPath, `${batchId}\n`);
  return markerPath;
}

function writeCollectedOutputs({ batchId, hasChanges, bodyPath, processed }) {
  writeOutput("batch_id", batchId ?? "");
  writeOutput("has_changes", hasChanges ? "true" : "false");
  writeOutput("body_path", bodyPath ?? "");
  writeOutput("processed_batch_id", processed ? batchId : "");
  if (processed && batchId) writeOutput("marker_path", writeMarker(batchId));
}

async function collectBatch(options) {
  const batch = selectCompletedBatch(
    await listBatches(),
    options.processedBatches,
  );
  if (!batch) {
    console.log("No unprocessed completed OpenAI translation batches found.");
    writeCollectedOutputs({
      batchId: null,
      hasChanges: false,
      bodyPath: null,
      processed: false,
    });
    return;
  }

  const currentSourceHash = calculateTranslationSourceHash(process.cwd());
  await closeStalePullRequests(currentSourceHash);
  if (batch.metadata?.source_hash !== currentSourceHash) {
    console.log(`Discarded stale OpenAI translation batch ${batch.id}.`);
    writeCollectedOutputs({
      batchId: batch.id,
      hasChanges: false,
      bodyPath: null,
      processed: true,
    });
    return;
  }

  const outputLines = await getBatchOutput(batch);
  const counts = batch.request_counts;
  if (
    !counts ||
    counts.failed !== 0 ||
    counts.completed !== counts.total ||
    outputLines.length !== counts.total
  ) {
    console.log(`Discarded incomplete OpenAI translation batch ${batch.id}.`);
    writeCollectedOutputs({
      batchId: batch.id,
      hasChanges: false,
      bodyPath: null,
      processed: true,
    });
    return;
  }

  let hasChanges = false;
  const pendingInterfaceFiles = new Map();
  for (const output of outputLines) {
    if (!output.response || output.response.status_code !== 200) {
      throw new Error(`Batch ${batch.id} contains a failed request`);
    }
    const metadata = decodeMetadata(output.custom_id);
    if (metadata.sourceHash !== currentSourceHash) {
      throw new Error(`Batch ${batch.id} contains an old sourceHash`);
    }
    const response = parseJsonResponse(output.response.body);
    if (metadata.kind === "content") {
      hasChanges = applyContentTranslation(metadata, response) || hasChanges;
    } else if (metadata.kind === "insight") {
      hasChanges = applyInsightTranslation(metadata, response) || hasChanges;
    } else {
      applyInterfaceTranslation(metadata, response, pendingInterfaceFiles);
    }
  }
  for (const [filePath, content] of pendingInterfaceFiles) {
    hasChanges = writeFileIfChanged(filePath, content) || hasChanges;
  }

  const bodyPath = hasChanges
    ? path.join(
        process.env.RUNNER_TEMP ?? ".tmp",
        `openai-translation-${batch.id}.md`,
      )
    : null;
  if (bodyPath) {
    mkdirSync(path.dirname(bodyPath), { recursive: true });
    writeFileSync(bodyPath, makePullRequestBody(batch.id, currentSourceHash));
  }
  writeCollectedOutputs({
    batchId: batch.id,
    hasChanges,
    bodyPath,
    processed: true,
  });
  console.log(
    hasChanges
      ? `Applied current results from ${batch.id}.`
      : `No file changes from ${batch.id}.`,
  );
}

async function main(argv) {
  const options = parseArgs(argv);
  if (options.command === "submit") return submitBatch(options);
  return collectBatch(options);
}

function isDirectExecution() {
  return (
    process.argv[1] &&
    path.resolve(process.argv[1]).toLowerCase() ===
      fileURLToPath(import.meta.url).toLowerCase()
  );
}

if (isDirectExecution()) {
  await main(process.argv.slice(2));
}
