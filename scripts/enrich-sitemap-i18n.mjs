import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getAvailableRouteLocales } from "../src/lib/insight-links.mjs";

const root = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const distDir = path.join(root, "dist");

function attributeValue(tag, name) {
  const match = tag.match(
    new RegExp(
      `(?:^|\\s)${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`,
      "iu",
    ),
  );
  return match ? (match[1] ?? match[2] ?? match[3]) : null;
}

function addXDefaultAlternates(xml, file, publishedUrls) {
  let changed = false;
  const enriched = xml.replace(/<url>([\s\S]*?)<\/url>/gu, (originalBlock) => {
    const block = originalBlock.replace(/<xhtml:link\b[^>]*\/>/giu, (tag) => {
      if (publishedUrls.has(attributeValue(tag, "href"))) return tag;
      changed = true;
      return "";
    });
    if (/\bhreflang=(?:"x-default"|'x-default')/iu.test(block)) {
      return block;
    }

    const japaneseAlternate = [...block.matchAll(/<xhtml:link\b[^>]*\/>/giu)]
      .map((match) => match[0])
      .find((tag) => attributeValue(tag, "hreflang") === "ja");
    const href = japaneseAlternate
      ? attributeValue(japaneseAlternate, "href")
      : block.match(/<loc>([^<]+)<\/loc>/u)?.[1];
    if (!href) {
      throw new Error(
        `${file}: Japanese alternate is missing from a URL entry`,
      );
    }
    if (!japaneseAlternate) {
      const pathname = new URL(href).pathname;
      if (
        !/^\/insights\/[^/]+\/$/u.test(pathname) ||
        getAvailableRouteLocales(pathname).join(",") !== "ja"
      ) {
        throw new Error(
          `${file}: Japanese alternate is missing from a translated URL entry`,
        );
      }
    }

    changed = true;
    const xDefault = `<xhtml:link rel="alternate" hreflang="x-default" href="${href}"/>`;
    const japanese = japaneseAlternate
      ? ""
      : `<xhtml:link rel="alternate" hreflang="ja" href="${href}"/>`;
    return block.replace("</url>", `${japanese}${xDefault}</url>`);
  });

  return { changed, xml: enriched };
}

const sitemapFiles = (await readdir(distDir))
  .filter((file) => /^sitemap-\d+\.xml$/u.test(file))
  .sort();

if (sitemapFiles.length === 0) {
  throw new Error("Generated sitemap URL files are missing.");
}

let updatedFiles = 0;
const sources = await Promise.all(
  sitemapFiles.map((file) => readFile(path.join(distDir, file), "utf8")),
);
const publishedUrls = new Set(
  sources.flatMap((source) =>
    [...source.matchAll(/<loc>([^<]+)<\/loc>/gu)].map((match) => match[1]),
  ),
);
for (const file of sitemapFiles) {
  const filePath = path.join(distDir, file);
  const source = await readFile(filePath, "utf8");
  const result = addXDefaultAlternates(source, file, publishedUrls);
  if (!result.changed) continue;
  await writeFile(filePath, result.xml, "utf8");
  updatedFiles += 1;
}

console.log(
  `Kept published language alternates and added x-default in ${updatedFiles} generated sitemap file(s).`,
);
