import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync, unlinkSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const validatorPath = resolve("scripts/validate-i18n.mjs");
const temporaryPath = resolve("scripts/.translation-diagnostic-20261114.mjs");
const validator = readFileSync(validatorPath, "utf8");
const entry = validator.indexOf("const localeArgument = process.argv.find");
if (entry < 0) throw new Error("Unexpected i18n validator entry");

const expected = [["en",["home","philosophyLead"]],["en",["pricing","items","2","price"]],["en",["pricing","items","3","price"]],["en",["pricing","items","4","price"]],["en",["pricing","items","5","price"]],["en",["pricing","items","6","price"]],["en",["pricing","items","7","price"]],["en",["pricing","items","8","price"]],["en",["pricing","items","8","note"]],["en",["pricing","items","9","price"]],["en",["pricing","items","10","price"]],["en",["pricing","items","11","price"]],["en",["pricing","items","12","price"]],["en",["pricing","items","13","price"]],["en",["pricing","items","14","price"]],["en",["pricing","items","15","price"]],["en",["pricing","items","16","price"]],["en",["pricing","items","17","price"]],["en",["pricing","items","18","price"]],["en",["pricing","items","19","price"]],["en",["pricing","items","20","price"]],["en",["pricing","items","21","price"]],["es",["contact","description"]],["es",["home","description"]],["es",["home","consultationSituations","0","title"]],["es",["pricing","description"]],["es",["pricing","items","0","note"]],["es",["pricing","items","2","price"]],["es",["pricing","items","3","label"]],["es",["pricing","items","3","price"]],["es",["pricing","items","3","note"]],["es",["pricing","items","4","label"]],["es",["pricing","items","4","price"]],["es",["pricing","items","5","price"]],["es",["pricing","items","6","price"]],["es",["pricing","items","7","price"]],["es",["pricing","items","8","price"]],["es",["pricing","items","8","note"]],["es",["pricing","items","9","label"]],["es",["pricing","items","9","price"]],["es",["pricing","items","9","note"]],["es",["pricing","items","10","price"]],["es",["pricing","items","11","price"]],["es",["pricing","items","12","price"]],["es",["pricing","items","13","price"]],["es",["pricing","items","14","price"]],["es",["pricing","items","15","price"]],["es",["pricing","items","16","price"]],["es",["pricing","items","17","price"]],["es",["pricing","items","18","price"]],["es",["pricing","items","19","price"]],["es",["pricing","items","20","price"]],["es",["pricing","items","21","price"]],["es",["services","description"]],["es",["services","entryPoints","1","title"]],["es",["services","services","0","body"]],["es",["services","services","0","examples","0"]],["es",["services","services","0","examples","1"]],["es",["services","services","4","title"]],["es",["services","services","4","body"]],["es",["services","services","4","examples","1"]],["es",["services","services","7","examples","0"]],["es",["site","description"]],["es",["site","footerImageDisclosure"]],["pt",["contact","description"]],["pt",["home","description"]],["pt",["home","consultationSituations","0","title"]],["pt",["pricing","items","2","price"]],["pt",["pricing","items","3","price"]],["pt",["pricing","items","4","price"]],["pt",["pricing","items","5","price"]],["pt",["pricing","items","6","price"]],["pt",["pricing","items","7","price"]],["pt",["pricing","items","8","price"]],["pt",["pricing","items","8","note"]],["pt",["pricing","items","9","price"]],["pt",["pricing","items","10","price"]],["pt",["pricing","items","11","price"]],["pt",["pricing","items","12","price"]],["pt",["pricing","items","13","price"]],["pt",["pricing","items","14","price"]],["pt",["pricing","items","15","price"]],["pt",["pricing","items","16","price"]],["pt",["pricing","items","17","price"]],["pt",["pricing","items","18","price"]],["pt",["pricing","items","19","price"]],["pt",["pricing","items","20","price"]],["pt",["pricing","items","21","price"]],["pt",["services","description"]],["pt",["services","entryPoints","1","title"]],["pt",["services","services","0","body"]],["pt",["services","services","0","examples","0"]],["pt",["services","services","0","examples","1"]],["pt",["services","services","4","title"]],["pt",["services","services","4","body"]],["pt",["services","services","4","examples","1"]],["pt",["services","services","7","examples","0"]],["pt",["site","description"]],["pt",["site","footerImageDisclosure"]],["fr",["contact","description"]],["fr",["home","description"]],["fr",["home","consultationSituations","0","title"]],["fr",["pricing","description"]],["fr",["pricing","items","0","note"]],["fr",["pricing","items","2","price"]],["fr",["pricing","items","3","label"]],["fr",["pricing","items","3","price"]],["fr",["pricing","items","3","note"]],["fr",["pricing","items","4","label"]],["fr",["pricing","items","4","price"]],["fr",["pricing","items","5","price"]],["fr",["pricing","items","6","price"]],["fr",["pricing","items","7","price"]],["fr",["pricing","items","8","price"]],["fr",["pricing","items","8","note"]],["fr",["pricing","items","9","label"]],["fr",["pricing","items","9","price"]],["fr",["pricing","items","9","note"]],["fr",["pricing","items","10","price"]],["fr",["pricing","items","11","price"]],["fr",["pricing","items","12","price"]],["fr",["pricing","items","13","price"]],["fr",["pricing","items","14","price"]],["fr",["pricing","items","15","price"]],["fr",["pricing","items","16","price"]],["fr",["pricing","items","17","price"]],["fr",["pricing","items","18","price"]],["fr",["pricing","items","19","price"]],["fr",["pricing","items","20","price"]],["fr",["pricing","items","21","price"]],["fr",["serviceDetails","website","offerings","0","includes","3"]],["fr",["serviceDetails","website","faqs","3","answer"]],["fr",["serviceDetails","website","faqs","4","question"]],["fr",["serviceDetails","website","faqs","4","answer"]],["fr",["services","description"]],["fr",["services","entryPoints","1","title"]],["fr",["services","services","0","body"]],["fr",["services","services","0","examples","0"]],["fr",["services","services","0","examples","1"]],["fr",["services","services","4","title"]],["fr",["services","services","4","body"]],["fr",["services","services","4","examples","1"]],["fr",["services","services","7","examples","0"]],["fr",["site","description"]],["fr",["site","footerImageDisclosure"]],["ko",["pricing","items","2","price"]],["ko",["pricing","items","3","price"]],["ko",["pricing","items","4","price"]],["ko",["pricing","items","5","price"]],["ko",["pricing","items","6","price"]],["ko",["pricing","items","7","price"]],["ko",["pricing","items","8","price"]],["ko",["pricing","items","8","note"]],["ko",["pricing","items","9","price"]],["ko",["pricing","items","10","price"]],["ko",["pricing","items","11","price"]],["ko",["pricing","items","12","price"]],["ko",["pricing","items","13","price"]],["ko",["pricing","items","14","price"]],["ko",["pricing","items","15","price"]],["ko",["pricing","items","16","price"]],["ko",["pricing","items","17","price"]],["ko",["pricing","items","18","price"]],["ko",["pricing","items","19","price"]],["ko",["pricing","items","20","price"]],["ko",["pricing","items","21","price"]],["de",["contact","description"]],["de",["home","description"]],["de",["home","consultationSituations","0","title"]],["de",["pricing","items","2","price"]],["de",["pricing","items","3","price"]],["de",["pricing","items","4","price"]],["de",["pricing","items","5","price"]],["de",["pricing","items","6","price"]],["de",["pricing","items","7","price"]],["de",["pricing","items","8","price"]],["de",["pricing","items","8","note"]],["de",["pricing","items","9","price"]],["de",["pricing","items","10","price"]],["de",["pricing","items","11","price"]],["de",["pricing","items","12","price"]],["de",["pricing","items","13","price"]],["de",["pricing","items","14","price"]],["de",["pricing","items","15","price"]],["de",["pricing","items","16","price"]],["de",["pricing","items","17","price"]],["de",["pricing","items","18","price"]],["de",["pricing","items","19","price"]],["de",["pricing","items","20","price"]],["de",["pricing","items","21","price"]],["de",["services","description"]],["de",["services","entryPoints","1","title"]],["de",["services","services","0","body"]],["de",["services","services","0","examples","0"]],["de",["services","services","0","examples","1"]],["de",["services","services","4","title"]],["de",["services","services","4","body"]],["de",["services","services","4","examples","1"]],["de",["services","services","7","examples","0"]],["de",["services","designContextNote"]],["de",["site","description"]],["de",["site","footerImageDisclosure"]],["ru",["contact","description"]],["ru",["home","description"]],["ru",["home","consultationSituations","0","title"]],["ru",["pricing","items","2","price"]],["ru",["pricing","items","3","price"]],["ru",["pricing","items","4","price"]],["ru",["pricing","items","5","price"]],["ru",["pricing","items","6","price"]],["ru",["pricing","items","7","price"]],["ru",["pricing","items","8","price"]],["ru",["pricing","items","8","note"]],["ru",["pricing","items","9","price"]],["ru",["pricing","items","10","price"]],["ru",["pricing","items","11","price"]],["ru",["pricing","items","12","price"]],["ru",["pricing","items","13","price"]],["ru",["pricing","items","14","price"]],["ru",["pricing","items","15","price"]],["ru",["pricing","items","16","price"]],["ru",["pricing","items","17","price"]],["ru",["pricing","items","18","price"]],["ru",["pricing","items","19","price"]],["ru",["pricing","items","20","price"]],["ru",["pricing","items","21","price"]],["ru",["services","description"]],["ru",["services","entryPoints","1","title"]],["ru",["services","services","0","body"]],["ru",["services","services","0","examples","0"]],["ru",["services","services","0","examples","1"]],["ru",["services","services","4","title"]],["ru",["services","services","4","body"]],["ru",["services","services","4","examples","1"]],["ru",["services","services","7","examples","0"]],["ru",["services","designContextNote"]],["ru",["site","description"]],["ru",["site","footerImageDisclosure"]]];
const baseline = Object.fromEntries(
  [...new Set(expected.map(([locale]) => locale))].map((locale) => [
    locale,
    JSON.parse(execFileSync("git", ["show", "HEAD:src/i18n/content/" + locale + ".json"], {
      encoding: "utf8",
    })),
  ]),
);

const diagnostics = `
export function repairOverlayStrings(expected, baseline) {
  const tree = readSourceTree(sourceFiles);
  const allowed = new Set(expected.map((item) => JSON.stringify(item)));
  const pending = new Map();
  const repaired = [];
  for (const locale of translatedLocales) {
    const file = "src/i18n/content/" + locale + ".json";
    const overlay = readJson(file);
    const visit = (source, translated, parts = []) => {
      const key = parts.at(-1) ?? "";
      if (isStableKey(key)) return;
      if (typeof source === "string") {
        try {
          validateOverlayNode(source, translated, "translation", key, locale);
          return;
        } catch {
          if (!allowed.delete(JSON.stringify([locale, parts]))) {
            throw new Error("Unexpected i18n issue at " + locale + ":" + parts.join("/"));
          }
        }
        const original = parts.reduce((node, part) => node?.[part], baseline[locale]);
        validateOverlayNode(source, original, "current main translation", key, locale);
        const parent = parts.slice(0, -1).reduce((node, part) => node[part], overlay);
        parent[key] = original;
        repaired.push([locale, parts]);
      } else if (source && typeof source === "object") {
        for (const [childKey, child] of Object.entries(source)) {
          visit(child, translated?.[childKey], [...parts, childKey]);
        }
      }
    };
    visit(tree, overlay);
    if (baseline[locale]) pending.set(file, overlay);
  }
  if (allowed.size || repaired.length !== expected.length) {
    throw new Error("The set of identified i18n issues changed");
  }
  return { pending, repaired };
}
`;

try {
  writeFileSync(temporaryPath, validator.slice(0, entry) + diagnostics, { flag: "wx" });
  const { repairOverlayStrings } = await import(pathToFileURL(temporaryPath).href);
  const { pending, repaired } = repairOverlayStrings(expected, baseline);
  for (const [file, overlay] of pending) {
    writeFileSync(file, JSON.stringify(overlay, null, 2) + "\n");
  }
  console.log(JSON.stringify({ retainedValidatedBaselineFields: repaired.length }));
} finally {
  unlinkSync(temporaryPath);
}
