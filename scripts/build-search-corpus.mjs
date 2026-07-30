import { createHash } from "node:crypto";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { load } from "cheerio";

export const SITE_ORIGIN = "https://systems.acecore.net";
export const SEARCH_NAMESPACE = "ja";
export const EMBEDDING_MODEL = "@cf/baai/bge-m3";
export const VECTOR_DIMENSIONS = 1024;
export const VECTOR_METRIC = "cosine";
export const MAX_SOURCE_PAGES = 64;
export const MAX_VECTOR_COUNT = 512;

const TARGET_CHUNK_LENGTH = 850;
const MAX_CHUNK_LENGTH = 1_200;
const CHUNK_OVERLAP = 120;
const VECTOR_ID_PREFIX = "v1-";
const DEFAULT_OUTPUT = path.join(".vectorize", "corpus.json");

const EXCLUDED_PATHS = [
  /^\/404(?:\.html)?\/?$/u,
  /^\/admin(?:\/|$)/u,
  /^\/api(?:\/|$)/u,
  /^\/contact\/thanks(?:\/|$)/u,
];

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function normalizeWhitespace(value) {
  return value
    .replace(/\u00a0/gu, " ")
    .replace(/\r\n?/gu, "\n")
    .replace(/[ \t]+/gu, " ")
    .replace(/\n[ \t]+/gu, "\n")
    .replace(/[ \t]+\n/gu, "\n")
    .replace(/\n{3,}/gu, "\n\n")
    .trim();
}

function truncateCodePoints(value, maxLength) {
  const singleLine = normalizeWhitespace(value).replace(/\s+/gu, " ").trim();
  return [...singleLine].slice(0, maxLength).join("").trim();
}

function pathFromHtmlFile(relativePath) {
  const normalized = relativePath.split(path.sep).join("/");
  if (normalized === "index.html") return "/";
  if (normalized.endsWith("/index.html")) {
    return `/${normalized.slice(0, -"/index.html".length)}/`;
  }
  return `/${normalized.replace(/\.html$/u, "")}`;
}

function normalizeUrlPath(pathname) {
  if (pathname === "/") return "/";
  const cleaned = pathname.replace(/\/{2,}/gu, "/");
  if (path.extname(cleaned)) return cleaned;
  return cleaned.endsWith("/") ? cleaned : `${cleaned}/`;
}

function isExcludedPath(pathname) {
  return EXCLUDED_PATHS.some((pattern) => pattern.test(pathname));
}

async function listHtmlFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await listHtmlFiles(absolutePath)));
    } else if (entry.isFile() && entry.name.endsWith(".html")) {
      files.push(absolutePath);
    }
  }

  return files.sort((left, right) => left.localeCompare(right, "en"));
}

function trimTitle(value) {
  return normalizeWhitespace(value)
    .replace(/\s*[|｜]\s*Acecore Systems\s*$/iu, "")
    .trim();
}

function chooseBreakPoint(text, start, desiredEnd, hardEnd) {
  if (hardEnd >= text.length) return text.length;

  const searchStart = Math.max(start + 1, desiredEnd - 160);
  const searchEnd = Math.min(hardEnd, desiredEnd + 160);
  const window = text.slice(searchStart, searchEnd);
  let selected = -1;

  for (const separator of ["\n\n", "。", "！", "？", ". ", "\n", " "]) {
    const index = window.lastIndexOf(separator);
    if (index >= 0) {
      selected = searchStart + index + separator.length;
      break;
    }
  }

  return selected > start ? selected : hardEnd;
}

export function splitIntoChunks(text) {
  const normalized = normalizeWhitespace(text);
  if (!normalized) return [];
  if (normalized.length <= MAX_CHUNK_LENGTH) return [normalized];

  const chunks = [];
  let start = 0;

  while (start < normalized.length) {
    const desiredEnd = Math.min(normalized.length, start + TARGET_CHUNK_LENGTH);
    const hardEnd = Math.min(normalized.length, start + MAX_CHUNK_LENGTH);
    const end = chooseBreakPoint(normalized, start, desiredEnd, hardEnd);
    const chunk = normalized.slice(start, end).trim();
    if (chunk) chunks.push(chunk);
    if (end >= normalized.length) break;

    const nextStart = Math.max(start + 1, end - CHUNK_OVERLAP);
    start = nextStart;
  }

  return chunks;
}

function classifyContent(pathname) {
  if (pathname === "/") return "home";
  if (pathname.startsWith("/insights/")) return "insight";
  if (pathname.startsWith("/services/")) return "service";
  return "page";
}

function canonicalForPage($, relativePath) {
  const fallbackPath = pathFromHtmlFile(relativePath);
  const canonicalHref = $('link[rel~="canonical"]').first().attr("href");

  let canonical;
  try {
    canonical = new URL(canonicalHref || fallbackPath, SITE_ORIGIN);
  } catch {
    return null;
  }

  if (canonical.origin !== SITE_ORIGIN) return null;
  canonical.hash = "";
  canonical.search = "";
  canonical.pathname = normalizeUrlPath(canonical.pathname);
  return canonical;
}

function extractPage(html, relativePath) {
  const $ = load(html);
  const languageAttribute = $("html").attr("lang");
  if (!languageAttribute) return null;

  const language = languageAttribute.trim().toLowerCase();
  if (
    language !== SEARCH_NAMESPACE &&
    !language.startsWith(`${SEARCH_NAMESPACE}-`)
  ) {
    return null;
  }

  const robots = $('meta[name="robots"], meta[name="googlebot"]')
    .map((_, element) => $(element).attr("content") || "")
    .get()
    .join(",");
  if (/\bnoindex\b/iu.test(robots)) return null;

  const canonical = canonicalForPage($, relativePath);
  if (!canonical || isExcludedPath(canonical.pathname)) return null;

  $(
    [
      "script",
      "style",
      "noscript",
      "template",
      "svg",
      "nav",
      "footer",
      "form",
      "[data-pagefind-ignore]",
      "[data-vectorize-ignore]",
      '[aria-hidden="true"]',
    ].join(","),
  ).remove();

  const title = trimTitle($("h1").first().text() || $("title").first().text());
  const description = normalizeWhitespace(
    $('meta[name="description"]').first().attr("content") || "",
  );
  const contentRoot = $("main").first().length
    ? $("main").first()
    : $("article").first().length
      ? $("article").first()
      : $("body").first();
  const content = normalizeWhitespace(contentRoot.text());
  const searchableText = normalizeWhitespace(
    [title, description, content].filter(Boolean).join("\n\n"),
  );

  if (!title || !searchableText) return null;

  return {
    title,
    description,
    text: searchableText,
    url: canonical.pathname,
    pathname: canonical.pathname,
    sourcePath: relativePath.split(path.sep).join("/"),
    contentType: classifyContent(canonical.pathname),
  };
}

function vectorForChunk(page, text, chunkIndex) {
  const identity = [SEARCH_NAMESPACE, page.url, String(chunkIndex), text].join(
    "\u001f",
  );
  const digest = sha256(identity);
  const metadataTitle = truncateCodePoints(page.title, 240);

  return {
    id: `${VECTOR_ID_PREFIX}${digest.slice(0, 48)}`,
    text,
    metadata: {
      namespace: SEARCH_NAMESPACE,
      locale: SEARCH_NAMESPACE,
      url: page.url,
      title: metadataTitle,
      section: metadataTitle,
      excerpt: truncateCodePoints(text, 500),
      sourcePath: page.sourcePath,
      contentType: page.contentType,
      chunkIndex,
      contentHash: digest,
    },
  };
}

function corpusVersion(vectors) {
  const stable = vectors
    .map(({ id, metadata }) => `${id}:${metadata.contentHash}`)
    .sort()
    .join("\n");
  return sha256(stable).slice(0, 20);
}

function parseArguments(argv) {
  const options = {
    distDirectory: path.resolve("dist"),
    outputPath: path.resolve(DEFAULT_OUTPUT),
  };

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--dist") {
      options.distDirectory = path.resolve(argv[++index]);
    } else if (argument === "--output") {
      options.outputPath = path.resolve(argv[++index]);
    } else {
      throw new Error(`Unknown argument: ${argument}`);
    }
  }

  return options;
}

export async function buildSearchCorpus({
  distDirectory,
  outputPath = path.resolve(DEFAULT_OUTPUT),
}) {
  const htmlFiles = await listHtmlFiles(distDirectory);
  const pages = [];

  for (const htmlFile of htmlFiles) {
    const relativePath = path.relative(distDirectory, htmlFile);
    const page = extractPage(await readFile(htmlFile, "utf8"), relativePath);
    if (page) pages.push(page);
  }

  pages.sort((left, right) => left.url.localeCompare(right.url, "ja"));

  if (pages.length === 0) {
    throw new Error("Search corpus has no eligible public Japanese pages.");
  }
  if (pages.length > MAX_SOURCE_PAGES) {
    throw new Error(
      `Search corpus has ${pages.length} source pages; maximum is ${MAX_SOURCE_PAGES}.`,
    );
  }

  const vectors = pages.flatMap((page) =>
    splitIntoChunks(page.text).map((text, chunkIndex) =>
      vectorForChunk(page, text, chunkIndex),
    ),
  );

  if (vectors.length === 0) {
    throw new Error("Search corpus has no vector chunks.");
  }
  if (vectors.length > MAX_VECTOR_COUNT) {
    throw new Error(
      `Search corpus has ${vectors.length} vectors; maximum is ${MAX_VECTOR_COUNT}.`,
    );
  }

  const corpus = {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    origin: SITE_ORIGIN,
    namespace: SEARCH_NAMESPACE,
    version: corpusVersion(vectors),
    embedding: {
      model: EMBEDDING_MODEL,
      dimensions: VECTOR_DIMENSIONS,
      metric: VECTOR_METRIC,
    },
    limits: {
      maxSourcePages: MAX_SOURCE_PAGES,
      maxVectors: MAX_VECTOR_COUNT,
    },
    sourcePageCount: pages.length,
    vectorCount: vectors.length,
    localeCounts: {
      [SEARCH_NAMESPACE]: vectors.length,
    },
    vectors,
  };

  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(corpus, null, 2)}\n`, "utf8");
  return corpus;
}

async function main() {
  const options = parseArguments(process.argv.slice(2));
  const corpus = await buildSearchCorpus(options);
  console.log(
    `Built ${corpus.vectorCount} vectors from ${corpus.sourcePageCount} pages (${corpus.version}).`,
  );
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href
) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
