import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { load } from "cheerio";

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

export async function validateSearchBuild(
  distDirectory = path.resolve("dist"),
) {
  const htmlFiles = await listHtmlFiles(distDirectory);
  const errors = [];
  let localizedPageCount = 0;
  let japanesePageCount = 0;
  let translatedPageCount = 0;

  for (const htmlFile of htmlFiles) {
    const relativePath = path
      .relative(distDirectory, htmlFile)
      .split(path.sep)
      .join("/");
    const $ = load(await readFile(htmlFile, "utf8"));
    const main = $("main#main");

    if (main.length === 0) continue;

    localizedPageCount += 1;
    const language = ($("html").attr("lang") || "").trim().toLowerCase();
    const searchDialogCount = $("#site-search-dialog").length;
    const searchTriggerCount = $("[data-search-open]").length;
    const pagefindBodyCount = main.filter("[data-pagefind-body]").length;
    const pagefindIgnoreCount = main.filter("[data-pagefind-ignore]").length;
    const isNoIndex = /\bnoindex\b/u.test(
      ($('meta[name="robots"]').attr("content") || "").toLowerCase(),
    );

    if (!language) {
      errors.push(`${relativePath}: html lang is required`);
      continue;
    }

    if (language === "ja" || language.startsWith("ja-")) {
      japanesePageCount += 1;
      if (searchDialogCount !== 1) {
        errors.push(
          `${relativePath}: Japanese page must contain one search dialog`,
        );
      }
      if (searchTriggerCount === 0) {
        errors.push(`${relativePath}: Japanese page has no search trigger`);
      }
      if (isNoIndex) {
        if (pagefindBodyCount !== 0 || pagefindIgnoreCount !== 1) {
          errors.push(
            `${relativePath}: noindex page must be excluded from Pagefind`,
          );
        }
      } else if (pagefindBodyCount !== 1 || pagefindIgnoreCount !== 0) {
        errors.push(
          `${relativePath}: public Japanese page must be included in Pagefind`,
        );
      }
    } else {
      translatedPageCount += 1;
      if (searchDialogCount !== 0 || searchTriggerCount !== 0) {
        errors.push(
          `${relativePath}: non-Japanese page must not contain Japanese search UI`,
        );
      }
      if (pagefindBodyCount !== 0 || pagefindIgnoreCount !== 1) {
        errors.push(
          `${relativePath}: non-Japanese page must be excluded from Pagefind`,
        );
      }
    }
  }

  if (localizedPageCount === 0) {
    errors.push("No localized Astro HTML pages were found");
  }
  if (japanesePageCount === 0) {
    errors.push("No Japanese Astro HTML pages were found");
  }
  if (translatedPageCount === 0) {
    errors.push("No translated Astro HTML pages were found");
  }

  if (errors.length > 0) {
    throw new Error(
      `Search build validation failed:\n- ${errors.join("\n- ")}`,
    );
  }

  return { localizedPageCount, japanesePageCount, translatedPageCount };
}

async function main() {
  const result = await validateSearchBuild();
  console.log(
    `Validated search UI boundaries across ${result.localizedPageCount} pages (${result.japanesePageCount} ja, ${result.translatedPageCount} translated).`,
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
