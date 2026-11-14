import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const fromMain = (file) => import(pathToFileURL(resolve("scripts", file)).href);
const { calculateTranslationSourceHash, translatedLocales } = await fromMain("i18n-source-hash.mjs");
const { validateInsightTranslation } = await fromMain("openai-translation-batch.mjs");
const { hasOnlyAllowedTranslationFiles } = await fromMain("merge-openai-translation-pr.mjs");
const read = (file) => readFileSync(file, "utf8");
const hash = "1c5558eb6049330f86d8cd800b863a8a7a11fbbe72c94e4db4efd8d07a86a8b5";
const sourcePath = "src/content/insights";
const articles = ["ai-chat-markdown-link-safety", "astro-ai-contact-chat"];

const files = execFileSync("git", ["diff", "--name-only", "-z", "--"], { encoding: "utf8" })
  .split("\0")
  .filter(Boolean);
const expected = new Set([
  "src/i18n/translation-state.json",
  ...translatedLocales.flatMap((locale) => [
    "src/i18n/content/" + locale + ".json",
    ...articles.map((slug) => sourcePath + "/" + locale + "/" + slug + ".md"),
  ]),
]);
if (!hasOnlyAllowedTranslationFiles(files) || !files.includes("src/i18n/translation-state.json") ||
    files.some((file) => !expected.has(file)) ||
    execFileSync("git", ["ls-files", "--others", "--exclude-standard"], { encoding: "utf8" }).trim()) {
  throw new Error("Unexpected publication files");
}
const state = JSON.parse(read("src/i18n/translation-state.json"));
if (calculateTranslationSourceHash(process.cwd()) !== hash || state.sourceHash !== hash ||
    Object.keys(state.pendingContent ?? {}).length !== 0 ||
    Object.keys(state.pendingInsights ?? {}).length !== 0 ||
    state.locales.length !== translatedLocales.length ||
    translatedLocales.some((locale) => !state.locales.includes(locale))) {
  throw new Error("Translation state does not match the current Japanese source");
}

for (const slug of articles) {
  const source = read(sourcePath + "/" + slug + ".md");
  for (const locale of translatedLocales) {
    const target = read(sourcePath + "/" + locale + "/" + slug + ".md");
    validateInsightTranslation(source, target, slug + " (" + locale + ")");
  }
}

console.log("Verified the formatted files, exact sourceHash, translation state and Markdown invariants for both articles in all 8 locales.");
