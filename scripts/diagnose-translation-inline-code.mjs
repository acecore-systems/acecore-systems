import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import path from "node:path";
import { calculateTranslationSourceHash, translatedLocales, translationSourcePaths, structuredTranslationTargets } from "./i18n-source-hash.mjs";
import { decodeMetadata, prepareBatchTranslations } from "./openai-translation-batch.mjs";
import { protectTranslationText, restoreTranslationText } from "./translation-protected-text.mjs";

// Temporary diagnostic for this existing, completed batch. No API mutation or
// content/state application is permitted by this script.
const batchId = "batch_6ad87126f5588190b4cf9d3dc644ded0";
const sourceHash = "7ab9b9a44486cb7a9c6a6e5df189f23e3c87fc9d5574b8937f81802c2b872bc3";
const sourcePath = "src/content/insights/service-cta-contact-prefill.md";
async function main() {
const key = process.env.OPENAI_TRANSLATION_API_KEY?.trim();
if (!key || !process.env.RUNNER_TEMP) throw new Error("Diagnostic runner configuration is missing");
if (calculateTranslationSourceHash(process.cwd()) !== sourceHash) throw new Error("Source hash changed");
async function get(resource) {
  const response = await fetch(`https://api.openai.com/v1${resource}`, {
    method: "GET",
    headers: { Authorization: `Bearer ${key}` },
  });
  if (!response.ok) throw new Error(`Diagnostic GET failed: ${response.status}`);
  return response;
}
const batch = await (await get(`/batches/${batchId}`)).json();
if (batch.id !== batchId || batch.status !== "completed" ||
    batch.metadata?.source_hash !== sourceHash ||
    batch.metadata?.translation_system !== "acecore-systems-v1" ||
    batch.metadata?.repository !== "acecore-systems/acecore-systems" ||
    !/^file-[A-Za-z0-9_-]+$/u.test(batch.output_file_id)) {
  throw new Error("Unexpected diagnostic batch metadata");
}
const outputs = (await (await get(`/files/${batch.output_file_id}/content`)).text())
  .split(/\r?\n/u).filter(Boolean).map((line) => JSON.parse(line));
const source = readFileSync(sourcePath, "utf8");
const code = (value) => value.match(/`[^`\r\n]+`/gu) ?? [];
const knownCode = new Set(code(source));
const knownMarkers = protectTranslationText(source).tokens;
const category = (error) => ["inline code changed", "fenced code changed", "numeric value changed", "URL changed", "placeholder changed", "protected token is missing or changed", "unknown or duplicated protected token"]
  .find((value) => error.message.includes(value)) ?? "other validation failure";
// Never persist API response prose, unknown code strings, or response bodies.
// Only source-owned public tokens and formatting around opaque markers leave
// the runner. Unknown output is represented by its SHA-256 and character count.
const describeCode = (value) => knownCode.has(value) ? { sourceCode: value } : {
  unknownSha256: createHash("sha256").update(value).digest("hex"), length: value.length,
};
const scaffold = (value) => value.split("\n").flatMap((line, index) =>
  /ACECORE_KEEP|`/u.test(line) ? [{ line: index + 1, format: line
    .replace(/\{ACECORE_KEEP_[^{}\r\n]*\}|`+|[^`{]+|[{}]/gu, (part) =>
      knownMarkers.has(part) || part.startsWith("`") ? part : "[text]") }] : []);
const failures = [];
const targets = [];
for (const output of outputs) {
  const metadata = decodeMetadata(output.custom_id);
  const allowedPath = metadata.kind === "insight" ? translationSourcePaths.includes(metadata.sourcePath) && metadata.sourcePath.startsWith("src/content/insights/") :
    metadata.kind === "content" ? structuredTranslationTargets.has(metadata.sourcePath) :
      metadata.kind === "ui" ? metadata.sourcePath === "src/i18n/ui.ts" :
      metadata.kind === "contact" && metadata.sourcePath === "src/i18n/contact-form.ts";
  if (metadata.sourceHash !== sourceHash || !translatedLocales.includes(metadata.locale) || !allowedPath) {
    throw new Error("Unexpected diagnostic request identity");
  }
  const identity = { kind: metadata.kind, locale: metadata.locale, sourcePath: metadata.sourcePath, protectionVersion: metadata.protectionVersion ?? null };
  try { prepareBatchTranslations([output], sourceHash); }
  catch (error) { failures.push({ ...identity, category: category(error) }); }
  if (metadata.sourcePath !== sourcePath || metadata.kind !== "insight") continue;
  const body = output.response?.body;
  const text = typeof body?.output_text === "string" ? body.output_text :
    (body?.output ?? []).flatMap((item) => item.content ?? []).map((item) => item.text ?? "").join("");
  const translated = JSON.parse(text).markdown;
  let restored = null;
  let restorationError = null;
  try { restored = metadata.protectionVersion === 1 ? restoreTranslationText(source, translated) : translated; }
  catch (error) { restorationError = category(error); }
  targets.push({ metadata: identity, protectedScaffold: scaffold(translated),
    restoredScaffold: restored === null ? null : scaffold(restored), restorationError,
    inlineCode: restored === null ? null : code(restored).map(describeCode) });
}
if (!targets.some((target) => target.metadata.locale === "en")) throw new Error("Target English result is missing");
const directory = path.join(process.env.RUNNER_TEMP, "translation-inline-code-diagnostic");
mkdirSync(directory, { recursive: true });
writeFileSync(path.join(directory, "diagnostic.json"), JSON.stringify({
  batchId, sourceHash, requestCounts: batch.request_counts, outputCount: outputs.length,
  sourcePath,
  tokens: [...protectTranslationText(source).tokens], sourceInlineCode: code(source), targets, failures,
}, null, 2));
console.log(`Read-only diagnostic saved: ${targets.length} public article translations, ${failures.length} failing results; no content or batch state changed.`);
}
main().catch(() => {
  console.error("Read-only translation diagnostic failed; response contents are intentionally omitted.");
  process.exitCode = 1;
});
