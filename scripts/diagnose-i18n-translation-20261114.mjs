import { readFileSync, writeFileSync, unlinkSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const validatorPath = resolve("scripts/validate-i18n.mjs");
const temporaryPath = resolve("scripts/.translation-diagnostic-20261114.mjs");
const validator = readFileSync(validatorPath, "utf8");
const boundary = 'const localeArgument = process.argv.find';
const entry = validator.indexOf(boundary);
if (entry < 0) throw new Error("Unexpected i18n validator entry");
const helpers = validator.slice(0, entry);
const diagnostic = `
function diagnoseOverlayStrings() {
  const tree = readSourceTree(sourceFiles);
  const issues = [];
  for (const locale of translatedLocales) {
    const overlay = readJson("src/i18n/content/" + locale + ".json");
    const visit = (source, translated, parts = []) => {
      const key = parts.at(-1) ?? "";
      if (isStableKey(key)) return;
      if (typeof source === "string") {
        try {
          validateOverlayNode(source, translated, "translation", key, locale);
        } catch (error) {
          const message = error.message;
          const term = protectedTerms.find((name) => message === "translation: protected term changed: " + name);
          const reason = term ? "protected term" : ["numeric values", "Japanese residue", "placeholder", "inline code", "URL", "translation missing", "translation is empty"].find((item) => message.includes(item)) ?? "other";
          issues.push({ locale, parts, reason, ...(term ? { term, expected: error.expected, actual: error.actual } : {}) });
        }
      } else if (source && typeof source === "object") {
        for (const [childKey, child] of Object.entries(source)) {
          visit(child, translated?.[childKey], [...parts, childKey]);
        }
      }
    };
    visit(tree, overlay);
  }
  console.log(JSON.stringify({ structuredIssues: issues }));
}
diagnoseOverlayStrings();
`;
try {
  writeFileSync(temporaryPath, helpers + diagnostic, { flag: "wx" });
  await import(pathToFileURL(temporaryPath).href);
} finally {
  unlinkSync(temporaryPath);
}
