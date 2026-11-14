import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { createInsightRequest, decodeMetadata, prepareBatchTranslations } from "./openai-translation-batch.mjs";
import { protectTranslationText, restoreTranslationText } from "./translation-protected-text.mjs";
import { calculateTranslationSourceHash } from "./i18n-source-hash.mjs";
import { hashText } from "./stage-seo-translation.mjs";

const fixed = Object.freeze({
  repository: "acecore-systems/acecore-systems",
  ref: "refs/heads/codex/seo-article-batch-20261114",
  batch: "batch_6af819d0bc7881909439e79931536a0e",
  inputFile: "file-KAQpLi3Hzpigf16VP31xXH",
  sourceCommit: "022dafb3b8f1bdfec68a2cb501d6eee2697c8649",
  sourcePath: "src/content/insights/astro-i18n-blog-translation.md",
  articleHash: "96ac1ae6255d853d737d39f41440ac084a2e8290e4b616cd98c81fd53298adfa",
  sourceHash: "1c5558eb6049330f86d8cd800b863a8a7a11fbbe72c94e4db4efd8d07a86a8b5",
});
const locales = ["en", "zh-cn", "es", "pt", "fr", "ko", "de", "ru"];
const numericPattern = /\d+(?:[.,]\d+)*/gu;
const knownReasons = ["numeric value changed", "protected token is missing or changed", "unknown or duplicated protected token", "ambiguous formatting around protected token", "fenced code changed", "fenced code delimiters", "inline code changed", "Markdown link destinations", "URL changed", "placeholder changed", "Batch contains a failed request", "Responses output text is missing"];

function checkSource() {
  const source = readFileSync(fixed.sourcePath, "utf8");
  assert.equal(hashText(source), fixed.articleHash, "article hash mismatch");
  assert.equal(calculateTranslationSourceHash(process.cwd()), fixed.sourceHash, "source hash mismatch");
  return source;
}
function identitySet(rows, expectedIds) {
  assert.equal(rows.length, locales.length, "row count mismatch");
  const seen = new Set();
  for (const row of rows) {
    assert.ok(typeof row?.custom_id === "string" && expectedIds.has(row.custom_id), "unexpected identity");
    assert.ok(!seen.has(row.custom_id), "duplicate identity");
    const item = decodeMetadata(row.custom_id);
    assert.equal(item.sourceHash, fixed.sourceHash);
    assert.equal(item.sourcePath, fixed.sourcePath);
    assert.equal(item.kind, "insight");
    assert.equal(item.protectionVersion, 1);
    assert.ok(locales.includes(item.locale));
    seen.add(row.custom_id);
  }
}
function responseMarkdown(row) {
  const body = row?.response?.body;
  const text = typeof body?.output_text === "string" ? body.output_text : (body?.output ?? []).flatMap((item) => item?.content ?? []).map((item) => item?.text).filter((item) => typeof item === "string").join("");
  const parsed = JSON.parse(text);
  assert.equal(typeof parsed.markdown, "string");
  return parsed.markdown;
}
function numberCounts(text) {
  const counts = new Map();
  for (const value of text.match(numericPattern) ?? []) counts.set(value, (counts.get(value) ?? 0) + 1);
  return counts;
}
function numberDifference(source, translated) {
  const original = numberCounts(source), result = numberCounts(translated);
  const all = [...new Set([...original.keys(), ...result.keys()])].sort();
  const missing = [], extra = [];
  for (const value of all) {
    const delta = (result.get(value) ?? 0) - (original.get(value) ?? 0);
    if (delta < 0) missing.push({value, count: -delta});
    if (delta > 0) extra.push({value, count: delta});
  }
  const snippets = (text, entries) => entries.flatMap(({value}) => text.split(/\r?\n/u).map((line, index) => ({line:index + 1, text:line.trim()})).filter(({text:line}) => (line.match(numericPattern) ?? []).includes(value)).slice(0, 3).map(({line,text}) => ({token:value,line,text:text.slice(0,160)}))).slice(0,12);
  return {missing, extra, sourceLines:snippets(source,missing), translatedLines:snippets(translated,extra)};
}
function inspectRows(rows, source) {
  const failures = []; let succeeded = 0;
  for (const row of rows) {
    const locale = decodeMetadata(row.custom_id).locale;
    try { prepareBatchTranslations([row], fixed.sourceHash); succeeded++; }
    catch (error) {
      const reason = knownReasons.find((value) => String(error.message).includes(value)) ?? "other validation error";
      const detail = { locale, reason };
      if (reason === "numeric value changed") {
        try { detail.numbers = numberDifference(source, restoreTranslationText(source, responseMarkdown(row))); }
        catch { detail.numericDetails = "unavailable"; }
      }
      failures.push(detail);
    }
  }
  return {succeeded, failed:failures.length, failures};
}

function patchGerman(rows, source) {
  const before = inspectRows(rows, source);
  assert.equal(before.succeeded, 7);
  assert.equal(before.failed, 1);
  assert.equal(before.failures[0].locale, "de");
  assert.equal(before.failures[0].reason, "numeric value changed");
  const numbers = before.failures[0].numbers;
  assert.deepEqual(numbers.extra, [{value:"26.9.2026",count:1},{value:"29.7.2026",count:3},{value:"6.10.2026",count:1}]);
  assert.deepEqual(numbers.missing, [{value:"10",count:1},{value:"2026",count:5},{value:"26",count:1},{value:"29",count:3},{value:"6",count:1},{value:"7",count:3},{value:"9",count:1}]);
  const result = rows.map((row) => row);
  const index = rows.findIndex((row) => decodeMetadata(row.custom_id).locale === "de");
  assert.ok(index >= 0);
  const row = structuredClone(rows[index]);
  const body = row.response.body;
  const texts = typeof body.output_text === "string" ? [{object:body,key:"output_text"}] : (body.output ?? []).flatMap((item) => item.content ?? []).filter((item) => typeof item.text === "string").map((item) => ({object:item,key:"text"}));
  assert.equal(texts.length, 1);
  const parsed = JSON.parse(texts[0].object[texts[0].key]);
  assert.equal(typeof parsed.markdown, "string");
  const tokens = protectTranslationText(source).tokens;
  const expected = new Map([["26.9.2026",1],["29.7.2026",3],["6.10.2026",1]]);
  const counts = new Map();
  const marker = "\\{ACECORE_KEEP_[^{}\\r\\n]+\\}";
  const pattern = new RegExp(`(${marker})\\.(${marker})\\.(${marker})`, "gu");
  parsed.markdown = parsed.markdown.replace(pattern, (match, first, second, third) => {
    const date = [first, second, third].map((token) => tokens.get(token)).join(".");
    if (!expected.has(date)) return match;
    counts.set(date, (counts.get(date) ?? 0) + 1);
    return `${first}. ${second}. ${third}`;
  });
  const actualCounts = [...expected.keys()].map((date) => ({date,count:counts.get(date) ?? 0}));
  if (actualCounts.some(({date,count}) => count !== expected.get(date))) {
    console.log(JSON.stringify({error:"date_marker_shape_mismatch", shape:"NUMBER.NUMBER.NUMBER", counts:actualCounts}));
    throw new Error("unexpected date marker count");
  }
  texts[0].object[texts[0].key] = JSON.stringify(parsed);
  result[index] = row;
  return result;
}

async function get(path) {
  let response;
  try { response = await fetch(`https://api.openai.com/v1${path}`, {headers:{Authorization:`Bearer ${process.env.OPENAI_TRANSLATION_API_KEY}`}, redirect:"error", signal:AbortSignal.timeout(30000)}); }
  catch { throw new Error("OpenAI GET unavailable"); }
  if (!response.ok) throw new Error(`OpenAI GET HTTP ${response.status}`);
  return response;
}
function parseRows(text) { return text.split(/\r?\n/u).filter(Boolean).map((line) => JSON.parse(line)); }
async function inspect(source, expectedIds) {
  assert.equal(process.env.GITHUB_REPOSITORY, fixed.repository);
  assert.equal(process.env.GITHUB_REF, fixed.ref);
  assert.ok(process.env.OPENAI_TRANSLATION_API_KEY, "credential unavailable");
  assert.equal(execFileSync("git", ["rev-parse", "HEAD"], {encoding:"utf8"}).trim(), fixed.sourceCommit, "source checkout mismatch");
  const batch = await (await get(`/batches/${fixed.batch}`)).json();
  assert.equal(batch.id, fixed.batch);
  assert.equal(batch.status, "completed");
  assert.equal(batch.input_file_id, fixed.inputFile);
  assert.equal(batch.metadata?.translation_system, "acecore-systems-v1");
  assert.equal(batch.metadata?.repository, fixed.repository);
  assert.equal(batch.metadata?.source_hash, fixed.sourceHash);
  assert.equal(batch.metadata?.source_commit, fixed.sourceCommit);
  assert.equal(batch.metadata?.article_hash, fixed.articleHash);
  assert.equal(batch.metadata?.article_slug, "astro-i18n-blog-translation");
  assert.equal(batch.request_counts?.total, 8);
  assert.equal(batch.request_counts?.completed, 8);
  assert.equal(batch.request_counts?.failed, 0);
  assert.match(batch.output_file_id ?? "", /^file[-_][A-Za-z0-9_-]{1,100}$/u);
  const input = parseRows(await (await get(`/files/${fixed.inputFile}/content`)).text());
  identitySet(input, expectedIds);
  const output = parseRows(await (await get(`/files/${encodeURIComponent(batch.output_file_id)}/content`)).text());
  identitySet(output, expectedIds);
  assert.ok(Number.isSafeInteger(batch.completed_at) && batch.completed_at > 0);
  return {batch, output};
}
async function main() {
  const mode = process.argv[2];
  const source = checkSource();
  const requests = locales.map((locale) => createInsightRequest({version:1,kind:"insight",locale,sourcePath:fixed.sourcePath,sourceHash:fixed.sourceHash},source));
  const ids = new Set(requests.map((request) => request.custom_id));
  assert.equal(ids.size, 8);
  if (mode === "dry-check") { console.log(JSON.stringify({mode,count:ids.size,locales,sourceHash:fixed.sourceHash,articleHash:fixed.articleHash})); return; }
  if (mode === "self-test") {
    const rows = requests.map((request) => ({custom_id:request.custom_id,response:{status_code:200,body:{output_text:JSON.stringify({markdown:JSON.parse(request.body.input).markdown})}}}));
    identitySet(rows,ids);
    assert.equal(inspectRows(rows,source).succeeded,8);
    const bad = structuredClone(rows);
    const data=JSON.parse(bad[6].response.body.output_text); data.markdown += "\n Extra 987654321.\n"; bad[6].response.body.output_text=JSON.stringify(data);
    const report=inspectRows(bad,source);
    assert.equal(report.succeeded,7); assert.equal(report.failed,1); assert.equal(report.failures[0].locale,"de"); assert.deepEqual(report.failures[0].numbers.extra,[{value:"987654321",count:1}]);
    const damaged = structuredClone(rows);
    const translated = JSON.parse(damaged[6].response.body.output_text);
    const tokenMap = protectTranslationText(source).tokens;
    const japaneseDate = /(\{ACECORE_KEEP_[^{}\r\n]+\})年(\{ACECORE_KEEP_[^{}\r\n]+\})月(\{ACECORE_KEEP_[^{}\r\n]+\})日/gu;
    translated.markdown = translated.markdown.replace(japaneseDate, (match, year, month, day) => {
      const date = [day,month,year].map((token) => tokenMap.get(token)).join(".");
      return ["26.9.2026","29.7.2026","6.10.2026"].includes(date) ? `${day}.${month}.${year}` : match;
    });
    damaged[6].response.body.output_text = JSON.stringify(translated);
    const repaired = patchGerman(damaged, source);
    assert.equal(prepareBatchTranslations(repaired, fixed.sourceHash).size, 8);
    for (let i=0;i<8;i++) if(i!==6) assert.equal(repaired[i],damaged[i]);
    const fewer = structuredClone(damaged);
    const fewerData = JSON.parse(fewer[6].response.body.output_text);
    let fixedOne = false;
    fewerData.markdown = fewerData.markdown.replace(/(\{ACECORE_KEEP_[^{}\r\n]+\})\.(\{ACECORE_KEEP_[^{}\r\n]+\})\.(\{ACECORE_KEEP_[^{}\r\n]+\})/gu,(match,a,b,c)=>{ if (!fixedOne && [a,b,c].map((token)=>tokenMap.get(token)).join(".")==="29.7.2026") {fixedOne=true;return `${a}. ${b}. ${c}`;} return match;});
    assert.ok(fixedOne);
    fewer[6].response.body.output_text = JSON.stringify(fewerData);
    assert.throws(()=>patchGerman(fewer,source));
    assert.throws(()=>identitySet([...rows.slice(0,7),rows[0]],ids));
    assert.throws(()=>identitySet(rows.slice(0,7),ids));
    console.log("offline validation passed"); return;
  }
  assert.ok(mode === "inspect" || mode === "assemble", "unsupported mode");
  const {batch,output} = await inspect(source,ids);
  if (mode === "inspect") { console.log(JSON.stringify(inspectRows(output,source))); return; }
  const patched = patchGerman(output,source);
  const prepared = prepareBatchTranslations(patched,fixed.sourceHash);
  const expectedPaths = new Set(locales.map((locale) => `src/content/insights/${locale}/astro-i18n-blog-translation.md`.replaceAll("/", process.platform === "win32" ? "\\" : "/")));
  assert.equal(prepared.size, 8);
  for (const path of prepared.keys()) assert.ok(expectedPaths.has(path));
  for (const [path,content] of prepared) writeFileSync(path,content,"utf8");
  console.log(JSON.stringify({batchId:batch.id,acceptedDate:batch.created_at,completedAt:batch.completed_at,status:batch.status,count:batch.request_counts.total,retained:7,patched:1,occurrences:5,locale:"de"}));
}
main().catch((error) => {
  const message=String(error?.message ?? "");
  const reason=/^OpenAI GET HTTP \d{3}$/u.test(message) ? message : "identity, source, response or validation check failed";
  console.error(JSON.stringify({error:reason})); process.exitCode=1;
});
