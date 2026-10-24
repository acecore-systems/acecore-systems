import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { contactFormCopy } from "../src/i18n/contact-form.ts";
import { ui } from "../src/i18n/ui.ts";
import { insightSlugs } from "../src/lib/insight-links.mjs";

export const translatedLocales = [
  "en",
  "zh-cn",
  "es",
  "pt",
  "fr",
  "ko",
  "de",
  "ru",
];

export const structuredTranslationTargets = new Map([
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
  ["src/data/service-details/security.json", ["serviceDetails", "security"]],
  ["src/data/service-details/website.json", ["serviceDetails", "website"]],
  ["src/data/services.json", ["services"]],
  ["src/data/site.json", ["site"]],
  ["src/data/work-details/acecore-site-platform.json", ["workDetail"]],
  ["src/data/works.json", ["works"]],
]);

export const translationSourcePaths = [
  "src/data/contact.json",
  "src/data/guide.json",
  "src/data/home.json",
  "src/data/it-advisor.json",
  "src/data/pricing.json",
  "src/data/privacy.json",
  "src/data/service-details/development.json",
  "src/data/service-details/operations.json",
  "src/data/service-details/security.json",
  "src/data/service-details/site-functions.json",
  "src/data/service-details/site-quality.json",
  "src/data/service-details/website.json",
  "src/data/services.json",
  "src/data/site.json",
  "src/data/work-details/acecore-site-platform.json",
  "src/data/works.json",
  ...insightSlugs.map((slug) => `src/content/insights/${slug}.md`),
].sort();

export function calculateTranslationSourceHash(
  repositoryRoot,
  { excludedInsightSlugs = [], sourceOverrides = new Map() } = {},
) {
  const excludedPaths = new Set(
    excludedInsightSlugs.map((slug) => `src/content/insights/${slug}.md`),
  );
  const hash = createHash("sha256");
  for (const relativePath of translationSourcePaths) {
    if (excludedPaths.has(relativePath)) continue;
    hash.update(relativePath);
    hash.update("\0");
    hash.update(
      (
        sourceOverrides.get(relativePath) ??
        readFileSync(join(repositoryRoot, relativePath), "utf8")
      ).replace(/\r\n/gu, "\n"),
    );
    hash.update("\0");
  }
  for (const [logicalPath, value] of [
    ["src/i18n/ui.ts#ja", ui.ja],
    ["src/i18n/contact-form.ts#ja", contactFormCopy.ja],
  ]) {
    hash.update(logicalPath);
    hash.update("\0");
    hash.update(JSON.stringify(value));
    hash.update("\0");
  }
  return hash.digest("hex");
}
