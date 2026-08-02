import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { load } from "cheerio";

const API_URL = "/api/ai-chat";
const EXPECTED_LANGUAGES = new Set([
  "de",
  "en",
  "es",
  "fr",
  "ja",
  "ko",
  "pt",
  "ru",
  "zh-cn",
]);

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

export async function validateAiGuideBuild(
  distDirectory = path.resolve("dist"),
) {
  const htmlFiles = await listHtmlFiles(distDirectory);
  const errors = [];
  const languages = new Set();
  let pageCount = 0;

  for (const htmlFile of htmlFiles) {
    const relativePath = path
      .relative(distDirectory, htmlFile)
      .split(path.sep)
      .join("/");
    const $ = load(await readFile(htmlFile, "utf8"));
    if ($("main#main").length === 0) continue;

    pageCount += 1;
    const language = ($("html").attr("lang") || "").trim().toLowerCase();
    const widget = $("#systems-ai-guide-chat");
    const panel = $("#systems-ai-guide-panel");
    const toggle = widget.find("[data-ai-guide-toggle]");
    const input = widget.find("[data-ai-guide-input]");

    languages.add(language);

    if (widget.length !== 1) {
      errors.push(`${relativePath}: one AI guide widget is required`);
      continue;
    }
    if (panel.length !== 1 || panel.attr("role") !== "dialog") {
      errors.push(`${relativePath}: AI guide dialog is missing`);
    }
    if (
      toggle.length !== 1 ||
      toggle.attr("aria-controls") !== "systems-ai-guide-panel"
    ) {
      errors.push(`${relativePath}: AI guide toggle is not wired to the panel`);
    }
    if (widget.attr("data-api-url") !== API_URL) {
      errors.push(`${relativePath}: AI guide must use the shared API`);
    }
    if ((widget.attr("data-locale") || "").toLowerCase() !== language) {
      errors.push(`${relativePath}: AI guide locale does not match html lang`);
    }
    if (input.attr("maxlength") !== "800") {
      errors.push(`${relativePath}: AI guide question limit must be 800`);
    }
    if (widget.find("[data-ai-guide-messages][role='log']").length !== 1) {
      errors.push(`${relativePath}: AI guide live message log is missing`);
    }
  }

  for (const language of EXPECTED_LANGUAGES) {
    if (!languages.has(language)) {
      errors.push(`No AI guide page was found for ${language}`);
    }
  }
  if (pageCount === 0) errors.push("No Astro HTML pages were found");

  if (errors.length > 0) {
    throw new Error(
      `AI guide build validation failed:\n- ${errors.join("\n- ")}`,
    );
  }

  return { languages: [...languages].sort(), pageCount };
}

async function main() {
  const result = await validateAiGuideBuild();
  console.log(
    `Validated the Systems AI guide across ${result.pageCount} pages and ${result.languages.length} languages.`,
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
