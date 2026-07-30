import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { validateCorpus } from "./sync-vectorize.mjs";

const DEFAULT_CORPUS_FILE = path.resolve(".vectorize/corpus.json");
const DEFAULT_OUTPUT_FILE = path.resolve("dist/.well-known/acecore-build.json");

export async function writeBuildMetadata({
  commit = process.env.CF_PAGES_COMMIT_SHA ||
    process.env.GITHUB_SHA ||
    process.env.COMMIT_SHA ||
    "local",
  corpusFile = DEFAULT_CORPUS_FILE,
  outputFile = DEFAULT_OUTPUT_FILE,
} = {}) {
  const corpus = JSON.parse(await readFile(corpusFile, "utf8"));
  validateCorpus(corpus);

  const metadata = {
    commit,
    searchCorpusVersion: corpus.version,
  };
  await mkdir(path.dirname(outputFile), { recursive: true });
  await writeFile(outputFile, `${JSON.stringify(metadata)}\n`, "utf8");
  return metadata;
}

function isDirectExecution() {
  if (!process.argv[1]) return false;
  return (
    path.resolve(process.argv[1]).toLowerCase() ===
    fileURLToPath(import.meta.url).toLowerCase()
  );
}

if (isDirectExecution()) {
  writeBuildMetadata().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
