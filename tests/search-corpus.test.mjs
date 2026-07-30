import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import {
  EMBEDDING_MODEL,
  MAX_SOURCE_PAGES,
  MAX_VECTOR_COUNT,
  SEARCH_NAMESPACE,
  SITE_ORIGIN,
  VECTOR_DIMENSIONS,
  VECTOR_METRIC,
  buildSearchCorpus,
} from "../scripts/build-search-corpus.mjs";

const temporaryDirectories = [];

test.afterEach(async () => {
  await Promise.all(
    temporaryDirectories
      .splice(0)
      .map((directory) => rm(directory, { recursive: true, force: true })),
  );
});

async function createFixture() {
  const root = await mkdtemp(path.join(os.tmpdir(), "systems-corpus-"));
  temporaryDirectories.push(root);
  return {
    root,
    distDirectory: path.join(root, "dist"),
    outputPath: path.join(root, ".vectorize", "corpus.json"),
  };
}

async function writePage(distDirectory, relativePath, body) {
  const filePath = path.join(distDirectory, relativePath);
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, body, "utf8");
}

function html({
  title = "検索対象",
  canonical,
  lang = "ja",
  robots,
  body = "公開されている本文です。",
}) {
  return `<!doctype html>
<html${lang ? ` lang="${lang}"` : ""}>
  <head>
    <title>${title} | Acecore Systems</title>
    ${canonical ? `<link rel="canonical" href="${canonical}">` : ""}
    ${robots ? `<meta name="robots" content="${robots}">` : ""}
    <meta name="description" content="検索用の説明">
  </head>
  <body>
    <nav>ナビゲーションのノイズ</nav>
    <main><h1>${title}</h1><p>${body}</p><p data-pagefind-ignore>除外語句XYZ</p></main>
    <footer>フッターのノイズ</footer>
  </body>
</html>`;
}

test("builds a deterministic Japanese corpus from eligible public HTML", async () => {
  const fixture = await createFixture();
  await writePage(
    fixture.distDirectory,
    "index.html",
    html({
      title: "IT顧問エンジニア",
      canonical: `${SITE_ORIGIN}/`,
      body: "運用と改善を継続して支援します。",
    }),
  );
  await writePage(
    fixture.distDirectory,
    path.join("services", "index.html"),
    html({
      title: "サービス",
      canonical: `${SITE_ORIGIN}/services/`,
      body: "Web運用、クラウド、AI活用の相談窓口です。",
    }),
  );
  await writePage(
    fixture.distDirectory,
    path.join("admin", "index.html"),
    html({ canonical: `${SITE_ORIGIN}/admin/` }),
  );
  await writePage(
    fixture.distDirectory,
    path.join("api", "index.html"),
    html({ canonical: `${SITE_ORIGIN}/api/` }),
  );
  await writePage(
    fixture.distDirectory,
    path.join("contact", "thanks", "index.html"),
    html({ canonical: `${SITE_ORIGIN}/contact/thanks/` }),
  );
  await writePage(
    fixture.distDirectory,
    path.join("private", "index.html"),
    html({ canonical: `${SITE_ORIGIN}/private/`, robots: "noindex,follow" }),
  );
  await writePage(
    fixture.distDirectory,
    path.join("en", "index.html"),
    html({ canonical: `${SITE_ORIGIN}/en/`, lang: "en" }),
  );
  await writePage(
    fixture.distDirectory,
    path.join("missing-lang", "index.html"),
    html({ canonical: `${SITE_ORIGIN}/missing-lang/`, lang: "" }),
  );
  await writePage(
    fixture.distDirectory,
    path.join("external", "index.html"),
    html({ canonical: "https://example.com/external/" }),
  );

  const first = await buildSearchCorpus(fixture);
  const persisted = JSON.parse(await readFile(fixture.outputPath, "utf8"));
  const second = await buildSearchCorpus(fixture);

  assert.equal(first.origin, SITE_ORIGIN);
  assert.equal(first.namespace, SEARCH_NAMESPACE);
  assert.equal(first.sourcePageCount, 2);
  assert.equal(first.vectorCount, first.vectors.length);
  assert.equal(first.localeCounts.ja, first.vectorCount);
  assert.deepEqual(Object.keys(first.localeCounts), ["ja"]);
  assert.deepEqual(first.embedding, {
    model: EMBEDDING_MODEL,
    dimensions: VECTOR_DIMENSIONS,
    metric: VECTOR_METRIC,
  });
  assert.deepEqual(first.limits, {
    maxSourcePages: MAX_SOURCE_PAGES,
    maxVectors: MAX_VECTOR_COUNT,
  });
  assert.equal(first.version, second.version);
  assert.equal(persisted.version, first.version);
  assert.match(first.version, /^[0-9a-f]{20}$/u);

  const combinedText = first.vectors.map(({ text }) => text).join("\n");
  assert.doesNotMatch(combinedText, /除外語句XYZ/u);
  assert.doesNotMatch(combinedText, /ナビゲーションのノイズ/u);
  assert.doesNotMatch(combinedText, /フッターのノイズ/u);

  for (const vector of first.vectors) {
    assert.match(vector.id, /^v1-[0-9a-f]{48}$/u);
    assert.equal(vector.metadata.namespace, SEARCH_NAMESPACE);
    assert.equal(vector.metadata.locale, SEARCH_NAMESPACE);
    assert.match(vector.metadata.url, /^\/(?:$|[^/])/u);
    assert.doesNotMatch(vector.metadata.url, /^\/\//u);
    assert.equal(new URL(vector.metadata.url, SITE_ORIGIN).origin, SITE_ORIGIN);
    assert.ok(vector.metadata.title);
    assert.ok(vector.metadata.section);
    assert.ok(vector.metadata.excerpt);
    assert.match(vector.metadata.contentType, /^[a-z0-9][a-z0-9_-]{0,39}$/u);
    assert.match(vector.metadata.sourcePath, /\.html$/u);
    assert.ok(vector.text.length <= 1_200);
  }
});

test("content changes produce a new content-hash id and corpus version", async () => {
  const fixture = await createFixture();
  const relativePath = path.join("services", "index.html");
  await writePage(
    fixture.distDirectory,
    relativePath,
    html({
      canonical: `${SITE_ORIGIN}/services/`,
      body: "変更前の本文です。",
    }),
  );
  const before = await buildSearchCorpus(fixture);

  await writePage(
    fixture.distDirectory,
    relativePath,
    html({
      canonical: `${SITE_ORIGIN}/services/`,
      body: "変更後の本文です。",
    }),
  );
  const after = await buildSearchCorpus(fixture);

  assert.notEqual(after.version, before.version);
  assert.notEqual(after.vectors[0].id, before.vectors[0].id);
});

test("truncated metadata remains single-line and has no edge whitespace", async () => {
  const fixture = await createFixture();
  await writePage(
    fixture.distDirectory,
    "index.html",
    html({
      canonical: `${SITE_ORIGIN}/`,
      body: "検索対象 ".repeat(400),
    }),
  );

  const corpus = await buildSearchCorpus(fixture);
  for (const vector of corpus.vectors) {
    assert.equal(vector.metadata.excerpt.trim(), vector.metadata.excerpt);
    assert.doesNotMatch(vector.metadata.excerpt, /[\u0000-\u001f\u007f]/u);
    assert.ok([...vector.metadata.excerpt].length <= 500);
  }
});

test("fails closed when no eligible public page remains", async () => {
  const fixture = await createFixture();
  await writePage(
    fixture.distDirectory,
    path.join("admin", "index.html"),
    html({ canonical: `${SITE_ORIGIN}/admin/` }),
  );

  await assert.rejects(
    buildSearchCorpus(fixture),
    /no eligible public Japanese pages/u,
  );
});

test("enforces the small-site source-page upper bound", async () => {
  const fixture = await createFixture();
  for (let index = 0; index <= MAX_SOURCE_PAGES; index += 1) {
    await writePage(
      fixture.distDirectory,
      path.join("page", String(index), "index.html"),
      html({ canonical: `${SITE_ORIGIN}/page/${index}/` }),
    );
  }

  await assert.rejects(
    buildSearchCorpus(fixture),
    new RegExp(`maximum is ${MAX_SOURCE_PAGES}`, "u"),
  );
});
