import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, extname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (relativePath) => readFileSync(join(root, relativePath), "utf8");
const route = "/services/it-advisor/";
const pagePath = "dist/services/it-advisor/index.html";
const expectedUrl = `https://systems.acecore.net${route}`;
const advisorData = JSON.parse(read("src/data/it-advisor.json"));

assert.equal(existsSync(join(root, pagePath)), true, `${pagePath} missing`);

const page = read(pagePath);
const home = read("dist/index.html");
const services = read("dist/services/index.html");
const pricing = read("dist/pricing/index.html");
const contact = read("dist/contact/index.html");

assert.equal(
  page.includes(`<title>${advisorData.title} | Acecore Systems</title>`),
  true,
  "IT advisor title does not match source data",
);
assert.equal(
  page.includes(
    `<meta name="description" content="${advisorData.description}">`,
  ),
  true,
  "IT advisor description does not match source data",
);
assert.match(
  page,
  new RegExp(
    `<link rel="canonical" href="${expectedUrl.replaceAll("/", "\\/")}">`,
  ),
  "IT advisor canonical missing",
);
assert.equal(
  (page.match(/<h1(?:\s[^>]*)?>/g) || []).length,
  1,
  "IT advisor page requires exactly one h1",
);

const jsonLdMatch = page.match(
  /<script type="application\/ld\+json">([\s\S]*?)<\/script>/,
);
assert.ok(jsonLdMatch, "IT advisor JSON-LD missing");
const jsonLd = JSON.parse(jsonLdMatch[1]);
const nodes = Array.isArray(jsonLd) ? jsonLd : [jsonLd];
const service = nodes.find(
  (node) =>
    node["@type"] === "Service" && node["@id"] === `${expectedUrl}#service`,
);
const faq = nodes.find((node) => node["@type"] === "FAQPage");
const breadcrumb = nodes.find((node) => node["@type"] === "BreadcrumbList");

assert.ok(service, "page-specific Service JSON-LD missing");
assert.equal(service.url, expectedUrl, "Service JSON-LD URL mismatch");
assert.equal(service.name, advisorData.title, "Service JSON-LD name mismatch");
assert.equal(
  service.description,
  advisorData.description,
  "Service JSON-LD description mismatch",
);
assert.ok(faq, "FAQPage JSON-LD missing");
assert.equal(
  faq.mainEntity.length,
  advisorData.faqs.length,
  "FAQPage item count mismatch",
);
assert.ok(breadcrumb, "BreadcrumbList JSON-LD missing");
assert.equal(
  breadcrumb.itemListElement.at(-1).item,
  expectedUrl,
  "BreadcrumbList URL mismatch",
);

for (const [label, html] of [
  ["home", home],
  ["services", services],
]) {
  assert.equal(
    html.includes('href="/services/it-advisor/"'),
    true,
    `${label} route to IT advisor missing`,
  );
}

for (const id of [
  ...advisorData.plans.map((item) => item.pricingKey),
  ...advisorData.packages.map((item) => item.pricingKey),
]) {
  assert.equal(
    pricing.includes(`id="${id}"`),
    true,
    `pricing anchor ${id} missing`,
  );
}

assert.equal(
  contact.includes("IT顧問・AI導入・デプロイについて"),
  true,
  "IT advisor contact category missing",
);
assert.equal(
  page.replaceAll("&amp;", "&").includes("service=it-advisor"),
  true,
  "IT advisor contact CTA query missing",
);

const collectXml = (directory) =>
  readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return collectXml(path);
    return extname(entry.name) === ".xml" ? [readFileSync(path, "utf8")] : [];
  });
const sitemapXml = collectXml(join(root, "dist")).join("\n");
assert.equal(
  sitemapXml.split(expectedUrl).length - 1,
  1,
  "IT advisor route must appear once in sitemap output",
);

console.log(
  "SEO validation passed: IT advisor route, metadata, JSON-LD, links",
);
