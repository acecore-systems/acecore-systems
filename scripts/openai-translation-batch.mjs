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
  structuredTranslationTargets,
} from "./i18n-source-hash.mjs";
import {
  fencedCodeBlocks,
  protectTranslationText,
  restoreTranslationText,
} from "./translation-protected-text.mjs";

import { getPendingContentSourcePaths } from "./pending-content.mjs";

const API_BASE_URL = "https://api.openai.com/v1";
const BATCH_ENDPOINT = "/v1/responses";
const BATCH_MODEL = "gpt-6-luna";
const BATCH_METADATA_KEY = "translation_system";
const BATCH_METADATA_VALUE = "acecore-systems-v1";
const CUSTOM_ID_PREFIX = "acecore-systems:";
const SOURCE_MARKER_PREFIX = "<!-- openai-translation-source:";
const SOURCE_MARKER_SUFFIX = " -->";
const BATCH_MARKER_PREFIX = "<!-- openai-translation-batch:";
const BATCH_MARKER_SUFFIX = " -->";
const ZERO_SHA = "0000000000000000000000000000000000000000";

const sourceTargetPaths = structuredTranslationTargets;

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

export function parseArgs(argv) {
  const command = argv[0];
  if (!["submit", "collect", "retry"].includes(command)) {
    throw new Error(
      "Usage: openai-translation-batch.mjs <submit|collect|retry> [options]",
    );
  }

  const options = {
    command,
    base: null,
    head: "HEAD",
    processedBatches: new Set(),
    batchId: null,
    dryRun: false,
  };
  for (const argument of argv.slice(1)) {
    if (argument === "--dry-run") {
      options.dryRun = true;
    } else if (argument.startsWith("--batch-id=")) {
      options.batchId = argument.slice("--batch-id=".length);
      if (!/^batch_[A-Za-z0-9_-]{1,100}$/u.test(options.batchId)) {
        throw new Error("batch-id must be an OpenAI Batch ID");
      }
    } else if (argument.startsWith("--base=")) {
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
  if (command === "retry" && !options.batchId) {
    throw new Error("retry requires an explicit --batch-id");
  }
  if (command !== "retry" && options.batchId) {
    throw new Error("batch-id is only supported for an explicit retry");
  }
  if (command !== "retry" && options.dryRun)
    throw new Error("dry-run is only supported for an explicit retry");
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
    !/^[a-f0-9]{64}$/u.test(parsed.sourceHash) ||
    (parsed.protectionVersion !== undefined && parsed.protectionVersion !== 1)
  ) {
    throw new Error("OpenAI Batch custom_id metadata is invalid");
  }
  return parsed;
}

export function createStructuredRequest(metadata, source) {
  const entries = listTextEntries(source, [], {
    omitStable: metadata.kind === "content",
  });
  if (entries.length === 0) return null;
  return {
    custom_id: encodeMetadata({ ...metadata, protectionVersion: 1 }),
    method: "POST",
    url: BATCH_ENDPOINT,
    body: {
      model: BATCH_MODEL,
      reasoning: { effort: "max" },
      instructions: [
        "Translate Japanese Acecore Systems website copy into the requested target locale.",
        "Return one translation for every supplied id.",
        "Do not change placeholders, URLs, inline code, numeric values, product names, or code-like tokens.",
        "Copy each {ACECORE_KEEP_...} token exactly once, unchanged. These tokens represent immutable source text and will be restored locally. Do not add formatting around them or replace them with words.",
        "Use natural professional website language. Return only the requested JSON object.",
      ].join("\n"),
      input: JSON.stringify({
        targetLocale: metadata.locale,
        sourcePath: metadata.sourcePath,
        entries: entries.map((entry) => ({
          ...entry,
          source: protectTranslationText(entry.source).text,
        })),
      }),
      text: {
        format: createResponseFormat("translation_entries", textResponseSchema),
      },
    },
  };
}

export function createInsightRequest(metadata, markdown) {
  return {
    custom_id: encodeMetadata({ ...metadata, protectionVersion: 1 }),
    method: "POST",
    url: BATCH_ENDPOINT,
    body: {
      model: BATCH_MODEL,
      reasoning: { effort: "max" },
      instructions: [
        "Translate this Japanese Acecore Systems Insight article into the requested target locale.",
        "Return the entire Markdown document including YAML frontmatter.",
        "Keep frontmatter keys, author, date, lastUpdated, image, uploadedImage, URLs, image destinations, placeholders, inline code, and fenced code unchanged.",
        "Preserve every numeric token exactly, including prose and visible frontmatter. Do not spell digits out as words or omit counts when paraphrasing; retain 0 rather than zero or no users.",
        "After JSON decoding, fenced code must be identical to the source, including comments, indentation, and literal backslashes. Do not escape code a second time.",
        "Copy each {ACECORE_KEEP_...} token exactly once, unchanged. These tokens represent immutable source text and will be restored locally. Do not add formatting around them or replace them with words. A standalone CODE token represents an entire fenced code block; do not wrap it in another code block.",
        "Translate all user-visible prose, including visible frontmatter strings, headings, labels, lists, tables, callouts, FAQs, and image alt text.",
        "Return only the requested JSON object.",
      ].join("\n"),
      input: JSON.stringify({
        targetLocale: metadata.locale,
        sourcePath: metadata.sourcePath,
        markdown: protectTranslationText(markdown).text,
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

function areTranslationsCurrent(sourceHash) {
  const statePath = "src/i18n/translation-state.json";
  if (!existsSync(statePath)) return false;
  const state = JSON.parse(readFileSync(statePath, "utf8"));
  return (
    Object.keys(state.pendingContent ?? {}).length === 0 &&
    state.sourceHash === sourceHash &&
    Array.isArray(state.locales) &&
    translatedLocales.every((locale) => state.locales.includes(locale))
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

async function createBatch(
  inputFileId,
  sourceHash,
  sourceCommit,
  metadata = {},
) {
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
        ...metadata,
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
  if (!Array.isArray(pulls)) return [];
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
  return pulls;
}

async function submitBatch(options) {
  const eventBase = options.base ?? process.env.GITHUB_EVENT_BEFORE ?? null;
  const base = eventBase === ZERO_SHA ? null : eventBase;
  const state = JSON.parse(
    readFileSync("src/i18n/translation-state.json", "utf8"),
  );
  const sourcePaths = [
    ...new Set([
      ...listChangedSourcePaths(base, options.head),
      ...getPendingContentSourcePaths(state),
    ]),
  ].sort();
  if (sourcePaths.length === 0) {
    console.log("No Japanese Systems source changes detected.");
    return;
  }

  const sourceHash = calculateTranslationSourceHash(process.cwd());
  await closeStalePullRequests(sourceHash);
  if (areTranslationsCurrent(sourceHash)) {
    console.log("Translations are already current; no Batch is needed.");
    return;
  }
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

function parseTranslationMap(
  response,
  source,
  { omitStable = false, protectionVersion } = {},
) {
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
  const entries = listTextEntries(source, [], { omitStable });
  const expected = new Set(entries.map((entry) => entry.id));
  if (translations.size !== expected.size) {
    throw new Error("Translation response has an unexpected entry count");
  }
  for (const id of expected) {
    if (!translations.has(id)) throw new Error(`Missing translation for ${id}`);
  }
  if (protectionVersion === 1) {
    for (const entry of entries) {
      translations.set(
        entry.id,
        restoreTranslationText(
          entry.source,
          translations.get(entry.id),
          `Translation ${entry.id}`,
        ),
      );
    }
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

function prepareContentTranslation(metadata, response, pendingFiles, readers) {
  const source = readers.getSourceValue(metadata.sourcePath);
  const translations = parseTranslationMap(response, source, {
    omitStable: true,
    protectionVersion: metadata.protectionVersion,
  });
  const translated = buildTranslatedValue(source, translations, [], {
    omitStable: true,
  });
  const targetPath = sourceTargetPaths.get(metadata.sourcePath);
  if (!targetPath)
    throw new Error(`Unknown content source: ${metadata.sourcePath}`);
  const filePath = `src/i18n/content/${metadata.locale}.json`;
  const target = JSON.parse(
    pendingFiles.get(filePath) ?? readers.readFile(filePath, "utf8"),
  );
  setAtPath(target, targetPath, translated);
  pendingFiles.set(filePath, `${JSON.stringify(target, null, 2)}\n`);
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

function prepareInterfaceTranslation(
  metadata,
  response,
  pendingFiles,
  readers,
) {
  const source = readers.getSourceValue(metadata.sourcePath);
  const translations = parseTranslationMap(response, source, {
    protectionVersion: metadata.protectionVersion,
  });
  const translated = buildTranslatedValue(source, translations);
  const current =
    pendingFiles.get(metadata.sourcePath) ??
    readers.readFile(metadata.sourcePath, "utf8");
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

export function validateInsightTranslation(
  source,
  translated,
  label = "Translated Insight",
) {
  source = normalizeText(source);
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
  if (
    JSON.stringify(fencedCodeBlocks(source)) !==
    JSON.stringify(fencedCodeBlocks(output))
  ) {
    throw new Error(`${label}: fenced code changed`);
  }
  assertProtectedTokens(source, output, label);
  if (
    JSON.stringify(markdownLinkTargets(source)) !==
    JSON.stringify(markdownLinkTargets(output))
  ) {
    throw new Error("Translated Insight changed Markdown link destinations");
  }
  return output.endsWith("\n") ? output : `${output}\n`;
}

function prepareInsightTranslation(metadata, response, pendingFiles, readers) {
  if (typeof response.markdown !== "string") {
    throw new Error("Insight response.markdown must be a string");
  }
  const source = readers.readFile(metadata.sourcePath, "utf8");
  const label = `Translated Insight (${metadata.locale}: ${metadata.sourcePath})`;
  const translated = validateInsightTranslation(
    source,
    metadata.protectionVersion === 1
      ? restoreTranslationText(source, response.markdown, label)
      : response.markdown,
    label,
  );
  const slug = path.basename(metadata.sourcePath);
  pendingFiles.set(
    path.join("src/content/insights", metadata.locale, slug),
    translated,
  );
}

export function prepareBatchTranslations(
  outputLines,
  currentSourceHash,
  readers = { getSourceValue, readFile: readFileSync },
) {
  const pendingFiles = new Map();
  const seen = new Set();
  for (const output of outputLines) {
    if (!output.response || output.response.status_code !== 200) {
      throw new Error("Batch contains a failed request");
    }
    const metadata = decodeMetadata(output.custom_id);
    const label = `${metadata.locale}: ${metadata.sourcePath}`;
    try {
      if (metadata.sourceHash !== currentSourceHash) {
        throw new Error("Batch contains an old sourceHash");
      }
      const identity = JSON.stringify([
        metadata.kind,
        metadata.locale,
        metadata.sourcePath,
      ]);
      if (seen.has(identity))
        throw new Error("Batch contains a duplicate result");
      seen.add(identity);
      const response = parseJsonResponse(output.response.body);
      if (metadata.kind === "content") {
        prepareContentTranslation(metadata, response, pendingFiles, readers);
      } else if (metadata.kind === "insight") {
        prepareInsightTranslation(metadata, response, pendingFiles, readers);
      } else {
        prepareInterfaceTranslation(metadata, response, pendingFiles, readers);
      }
    } catch (error) {
      throw new Error(`${label}: ${error.message}`, { cause: error });
    }
  }
  return pendingFiles;
}

export function applyBatchTranslations(
  outputLines,
  currentSourceHash,
  {
    getSourceValue: readSource = getSourceValue,
    readFile = readFileSync,
    writeFile = writeFileIfChanged,
  } = {},
) {
  const pendingFiles = prepareBatchTranslations(
    outputLines,
    currentSourceHash,
    {
      getSourceValue: readSource,
      readFile,
    },
  );
  let hasChanges = false;
  for (const [filePath, content] of pendingFiles) {
    hasChanges = writeFile(filePath, content) || hasChanges;
  }
  return hasChanges;
}

function parseOutputLines(value) {
  return value
    .split(/\r?\n/gu)
    .filter(Boolean)
    .map((line) => JSON.parse(line));
}

function translationIdentity(metadata) {
  return JSON.stringify([metadata.kind, metadata.locale, metadata.sourcePath]);
}

function assertRetryIdentity(metadata, sourceHash) {
  const expectedKind = /^src\/content\/insights\/[^/]+\.md$/u.test(
    metadata.sourcePath,
  )
    ? "insight"
    : metadata.sourcePath === "src/i18n/ui.ts"
      ? "ui"
      : metadata.sourcePath === "src/i18n/contact-form.ts"
        ? "contact"
        : "content";
  if (
    metadata.sourceHash !== sourceHash ||
    metadata.kind !== expectedKind ||
    !translatedLocales.includes(metadata.locale) ||
    !isJapaneseSourcePath(metadata.sourcePath) ||
    (metadata.kind === "insight" &&
      !translationSourcePaths.includes(metadata.sourcePath))
  ) {
    throw new Error("Retry contains an unexpected source identity");
  }
}

// Revalidate every original result. Valid responses remain in the parent output
// file; only invalid request identities can be regenerated by an explicit retry.
export function planBatchRetry(
  outputLines,
  sourceHash,
  readers = { getSourceValue, readFile: readFileSync },
) {
  const seen = new Set();
  const requests = [];
  for (const output of outputLines) {
    const metadata = decodeMetadata(output.custom_id);
    assertRetryIdentity(metadata, sourceHash);
    const identity = translationIdentity(metadata);
    if (seen.has(identity))
      throw new Error("Retry parent contains a duplicate result");
    seen.add(identity);
    try {
      prepareBatchTranslations([output], sourceHash, readers);
    } catch {
      const source =
        metadata.kind === "insight"
          ? readers.readFile(metadata.sourcePath, "utf8")
          : readers.getSourceValue(metadata.sourcePath);
      const request =
        metadata.kind === "insight"
          ? createInsightRequest(metadata, source)
          : createStructuredRequest(metadata, source);
      if (!request) throw new Error("Retry source has no translatable strings");
      request.body.instructions +=
        "\nA prior response failed immutable-token validation. Preserve every supplied token exactly once, including list and heading numbers. Never surround tokens with backticks or spell numbers out. Do not add digits outside the supplied tokens.";
      requests.push(request);
    }
  }
  const identities = requests
    .map((request) => translationIdentity(decodeMetadata(request.custom_id)))
    .sort();
  return {
    requests,
    identities,
    identitiesHash: hashText(JSON.stringify(identities)),
    originalCount: outputLines.length,
    retainedCount: outputLines.length - requests.length,
  };
}

export function mergeBatchRetry(
  parentOutputs,
  retryOutputs,
  sourceHash,
  expectedIdentitiesHash,
  readers,
) {
  const plan = planBatchRetry(parentOutputs, sourceHash, readers);
  if (
    plan.identitiesHash !== expectedIdentitiesHash ||
    retryOutputs.length !== plan.identities.length
  ) {
    throw new Error(
      "Retry result set does not match the original invalid requests",
    );
  }
  const expected = new Set(plan.identities);
  const replacements = new Map();
  for (const output of retryOutputs) {
    const metadata = decodeMetadata(output.custom_id);
    assertRetryIdentity(metadata, sourceHash);
    const identity = translationIdentity(metadata);
    if (!expected.has(identity) || replacements.has(identity))
      throw new Error("Retry contains an unexpected or duplicate result");
    replacements.set(identity, output);
  }
  const combined = parentOutputs.map(
    (output) =>
      replacements.get(translationIdentity(decodeMetadata(output.custom_id))) ??
      output,
  );
  // This is still a read-only preparation. Nothing is written unless the entire
  // combined original batch passes the existing strict validators.
  prepareBatchTranslations(combined, sourceHash, readers);
  return combined;
}

export function assertRetryBatch(
  batch,
  sourceHash,
  { parentId = null, repository = "acecore-systems/acecore-systems" } = {},
) {
  const counts = batch?.request_counts;
  if (
    !isOurBatch(batch) ||
    batch.metadata?.repository !== repository ||
    batch.metadata?.source_hash !== sourceHash ||
    batch.status !== "completed" ||
    !/^batch_[A-Za-z0-9_-]{1,100}$/u.test(batch.id ?? "") ||
    !counts ||
    !Number.isSafeInteger(counts.total) ||
    counts.total <= 0 ||
    counts.completed !== counts.total ||
    counts.failed !== 0 ||
    (parentId
      ? batch.id === parentId || batch.metadata?.retry_of !== parentId
      : Boolean(batch.metadata?.retry_of))
  ) {
    throw new Error(
      "Retry batch metadata, completion, or parent relationship is invalid",
    );
  }
  if (parentId && !/^batch_[A-Za-z0-9_-]{1,100}$/u.test(parentId))
    throw new Error("Retry parent ID is invalid");
}

export function findExistingRetry(
  batches,
  parentId,
  sourceHash,
  repository = "acecore-systems/acecore-systems",
) {
  return (
    batches.find(
      (batch) =>
        isOurBatch(batch) &&
        batch.id !== parentId &&
        batch.metadata?.repository === repository &&
        batch.metadata?.source_hash === sourceHash &&
        batch.metadata?.retry_of === parentId,
    ) ?? null
  );
}

function assertRetryLink(batch) {
  if (
    !/^batch_[A-Za-z0-9_-]{1,100}$/u.test(batch.id ?? "") ||
    !/^batch_[A-Za-z0-9_-]{1,100}$/u.test(batch.metadata?.retry_of ?? "") ||
    batch.id === batch.metadata.retry_of ||
    !/^[a-f0-9]{64}$/u.test(batch.metadata.retry_identities_hash ?? "") ||
    !/^(?:[1-9]|10)$/u.test(batch.metadata.retry_request_count ?? "")
  ) {
    throw new Error(
      "Translation retry metadata is invalid; recovery needs attention",
    );
  }
  if (["failed", "expired", "cancelled"].includes(batch.status)) {
    throw new Error(
      `Translation retry ${batch.id} is ${batch.status}; recovery needs attention`,
    );
  }
  if (
    ![
      "validating",
      "in_progress",
      "finalizing",
      "cancelling",
      "completed",
    ].includes(batch.status)
  )
    throw new Error(
      "Translation retry status is invalid; recovery needs attention",
    );
}

export async function retryBatch(options) {
  const sourceHash = calculateTranslationSourceHash(process.cwd());
  const repository =
    process.env.GITHUB_REPOSITORY ?? "acecore-systems/acecore-systems";
  const parent = await openAiJson(
    `/batches/${encodeURIComponent(options.batchId)}`,
  );
  if (parent.id !== options.batchId)
    throw new Error("Retry parent ID does not match the requested batch");
  assertRetryBatch(parent, sourceHash, { repository });
  const existing = findExistingRetry(
    await listBatches(),
    parent.id,
    sourceHash,
    repository,
  );
  if (existing) {
    assertRetryLink(existing);
    console.log(
      `Retry for ${parent.id} already exists: ${existing.id} (${existing.status}); no new requests submitted.`,
    );
    return;
  }
  const outputs = await getBatchOutput(parent);
  if (outputs.length !== parent.request_counts.total)
    throw new Error("Retry parent output count is incomplete");
  const plan = planBatchRetry(outputs, sourceHash);
  if (plan.requests.length === 0) {
    console.log(
      "The original batch now passes validation; no retry is needed.",
    );
    return;
  }
  console.log(
    `Retry plan for ${parent.id}: ${plan.requests.length} invalid requests; ${plan.retainedCount} original results retained.`,
  );
  if (options.dryRun) {
    console.log("Dry run only; no input file uploaded or new Batch created.");
    return;
  }
  if (plan.requests.length > 10)
    throw new Error(
      "Explicit retry is limited to 10 invalid requests; no new batch submitted",
    );
  const inputFile = await uploadBatchInput(
    `${plan.requests.map((request) => JSON.stringify(request)).join("\n")}\n`,
  );
  const retry = await createBatch(
    inputFile.id,
    sourceHash,
    runGit(["rev-parse", "HEAD"]),
    {
      retry_of: parent.id,
      retry_identities_hash: plan.identitiesHash,
      retry_request_count: String(plan.requests.length),
    },
  );
  console.log(
    `Submitted retry ${retry.id}: ${plan.requests.length} invalid requests; ${plan.retainedCount} original results retained from ${parent.id}.`,
  );
  writeOutput("batch_id", retry.id);
}

async function getBatchOutput(batch) {
  if (!batch.output_file_id) throw new Error(`Batch ${batch.id} has no output`);
  const response = await openAiFetch(
    `/files/${encodeURIComponent(batch.output_file_id)}/content`,
  );
  return parseOutputLines(await response.text());
}

export function selectCompletedBatch(
  batches,
  processedBatches,
  {
    currentSourceHash,
    translationsCurrent = true,
    publishedBatchIds = new Set(),
    repository = "acecore-systems/acecore-systems",
  } = {},
) {
  const superseded = new Set();
  for (const batch of batches) {
    if (
      !isOurBatch(batch) ||
      batch.metadata?.repository !== repository ||
      batch.metadata?.source_hash !== currentSourceHash ||
      !batch.metadata?.retry_of
    )
      continue;
    assertRetryLink(batch);
    const parent = batches.find(
      (candidate) => candidate.id === batch.metadata.retry_of,
    );
    if (parent?.metadata?.retry_of)
      throw new Error("Nested translation retry is not supported");
    superseded.add(batch.metadata.retry_of);
  }
  return (
    [...batches]
      .filter((batch) => {
        const counts = batch.request_counts;
        const previouslyStaleResult =
          !translationsCurrent &&
          batch.metadata?.source_hash === currentSourceHash &&
          counts?.total > 0 &&
          counts.completed === counts.total &&
          counts.failed === 0;
        return (
          isOurBatch(batch) &&
          batch.status === "completed" &&
          !superseded.has(batch.id) &&
          !publishedBatchIds.has(batch.id) &&
          (!processedBatches.has(batch.id) || previouslyStaleResult)
        );
      })
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
    "- OpenAI Batch（gpt-6-luna / reasoning max）で最新の日本語 source を翻訳しました。",
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
  const currentSourceHash = calculateTranslationSourceHash(process.cwd());
  const translationsCurrent = areTranslationsCurrent(currentSourceHash);
  const pulls = await closeStalePullRequests(currentSourceHash);
  const publishedBatchIds = new Set(
    pulls
      .filter((pull) =>
        isTranslationPullRequestCurrent(pull.body, currentSourceHash),
      )
      .map(
        (pull) => pull?.head?.ref?.match(/^translation\/openai\/(.+)$/u)?.[1],
      )
      .filter(Boolean),
  );
  const batch = selectCompletedBatch(
    await listBatches(),
    options.processedBatches,
    { currentSourceHash, translationsCurrent, publishedBatchIds },
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

  if (translationsCurrent) {
    console.log(
      `Skipped OpenAI translation batch ${batch.id}; translations are already current.`,
    );
    writeCollectedOutputs({
      batchId: batch.id,
      hasChanges: false,
      bodyPath: null,
      processed: true,
    });
    return;
  }
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

  if (options.processedBatches.has(batch.id)) {
    const owner = (process.env.GITHUB_REPOSITORY ?? "").split("/")[0];
    const head = encodeURIComponent(`${owner}:translation/openai/${batch.id}`);
    const previousPulls = await githubRequest(
      `/pulls?state=all&head=${head}&per_page=100`,
    );
    if (!Array.isArray(previousPulls)) {
      throw new Error(
        "Cannot verify whether the processed Batch already has a translation PR",
      );
    }
    if (
      previousPulls.some(
        (pull) =>
          pull?.head?.ref === `translation/openai/${batch.id}` &&
          isTranslationPullRequestCurrent(pull.body, currentSourceHash),
      )
    ) {
      console.log(
        `Skipped processed Batch ${batch.id}; its translation PR already exists.`,
      );
      writeCollectedOutputs({
        batchId: batch.id,
        hasChanges: false,
        bodyPath: null,
        processed: true,
      });
      return;
    }
  }

  let outputLines = await getBatchOutput(batch);
  const counts = batch.request_counts;
  if (
    !counts ||
    counts.failed !== 0 ||
    counts.completed !== counts.total ||
    outputLines.length !== counts.total
  ) {
    if (batch.metadata?.retry_of)
      throw new Error("Retry output is incomplete or contains failed requests");
    console.log(`Discarded incomplete OpenAI translation batch ${batch.id}.`);
    writeCollectedOutputs({
      batchId: batch.id,
      hasChanges: false,
      bodyPath: null,
      processed: true,
    });
    return;
  }

  let hasChanges;
  try {
    if (batch.metadata?.retry_of) {
      const repository =
        process.env.GITHUB_REPOSITORY ?? "acecore-systems/acecore-systems";
      const parentId = batch.metadata.retry_of;
      assertRetryBatch(batch, currentSourceHash, { parentId, repository });
      const parent = await openAiJson(
        `/batches/${encodeURIComponent(parentId)}`,
      );
      if (parent.id !== parentId)
        throw new Error("Retry parent ID does not match its link");
      assertRetryBatch(parent, currentSourceHash, { repository });
      const parentOutputs = await getBatchOutput(parent);
      if (
        parentOutputs.length !== parent.request_counts.total ||
        String(outputLines.length) !== batch.metadata.retry_request_count
      ) {
        throw new Error("Retry or parent output count is incomplete");
      }
      outputLines = mergeBatchRetry(
        parentOutputs,
        outputLines,
        currentSourceHash,
        batch.metadata.retry_identities_hash,
      );
    }
    hasChanges = applyBatchTranslations(outputLines, currentSourceHash);
  } catch (error) {
    const directory = process.env.RUNNER_TEMP ?? ".tmp";
    mkdirSync(directory, { recursive: true });
    const reportPath = path.join(
      directory,
      `openai-translation-validation-${batch.id}.json`,
    );
    writeFileSync(
      reportPath,
      `${JSON.stringify({ batchId: batch.id, sourceHash: currentSourceHash, error: error.message }, null, 2)}\n`,
    );
    writeOutput("validation_report_path", reportPath);
    throw error;
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
  if (options.command === "retry") return retryBatch(options);
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
