import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, extname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { insightSlugs } from "../src/lib/insight-links.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (relativePath) => readFileSync(join(root, relativePath), "utf8");
const readJson = (relativePath) => JSON.parse(read(relativePath));
const count = (source, value) => source.split(value).length - 1;

const siteOrigin = "https://systems.acecore.net";
const advisorRoute = "/services/it-advisor/";
const developmentRoute = "/services/development/";
const advisorPagePath = "dist/services/it-advisor/index.html";
const developmentPagePath = "dist/services/development/index.html";
const advisorData = readJson("src/data/it-advisor.json");
const developmentData = readJson("src/data/service-details/development.json");
const focusedServices = [
  {
    route: "/services/site-functions/",
    pagePath: "dist/services/site-functions/index.html",
    data: readJson("src/data/service-details/site-functions.json"),
  },
  {
    route: "/services/site-quality/",
    pagePath: "dist/services/site-quality/index.html",
    data: readJson("src/data/service-details/site-quality.json"),
  },
  {
    route: "/services/operations/",
    pagePath: "dist/services/operations/index.html",
    data: readJson("src/data/service-details/operations.json"),
  },
];
const guideData = readJson("src/data/guide.json");
const worksData = readJson("src/data/works.json");
const workDetailData = readJson(
  "src/data/work-details/acecore-site-platform.json",
);
const pricingData = readJson("src/data/pricing.json");
const pricingByKey = new Map(pricingData.items.map((item) => [item.key, item]));

for (const pagePath of [
  advisorPagePath,
  developmentPagePath,
  ...focusedServices.map((service) => service.pagePath),
  "dist/guide/index.html",
  "dist/insights/index.html",
  "dist/works/index.html",
  "dist/works/acecore-site-platform/index.html",
]) {
  assert.equal(existsSync(join(root, pagePath)), true, `${pagePath} missing`);
}

const advisorPage = read(advisorPagePath);
const developmentPage = read(developmentPagePath);
const home = read("dist/index.html");
const services = read("dist/services/index.html");
const pricing = read("dist/pricing/index.html");
const contact = read("dist/contact/index.html");
const guidePage = read("dist/guide/index.html");
const worksPage = read("dist/works/index.html");
const workDetailPage = read("dist/works/acecore-site-platform/index.html");

function validateServicePage({
  data,
  html,
  route,
  serviceEntitySuffix,
  requiresFaq = false,
}) {
  const expectedUrl = `${siteOrigin}${route}`;

  assert.equal(
    html.includes(`<title>${data.title} | Acecore Systems</title>`),
    true,
    `${route}: title does not match source data`,
  );
  assert.equal(
    html.includes(`<meta name="description" content="${data.description}">`),
    true,
    `${route}: description does not match source data`,
  );
  assert.match(
    html,
    new RegExp(
      `<link rel="canonical" href="${expectedUrl.replaceAll("/", "\\/")}">`,
    ),
    `${route}: canonical missing`,
  );
  assert.equal(
    (html.match(/<h1(?:\s[^>]*)?>/g) || []).length,
    1,
    `${route}: exactly one h1 is required`,
  );

  const jsonLdMatch = html.match(
    /<script type="application\/ld\+json">([\s\S]*?)<\/script>/,
  );
  assert.ok(jsonLdMatch, `${route}: JSON-LD missing`);
  const jsonLd = JSON.parse(jsonLdMatch[1]);
  const nodes = Array.isArray(jsonLd) ? jsonLd : [jsonLd];
  const service = nodes.find(
    (node) =>
      node["@type"] === "Service" &&
      node["@id"] === `${expectedUrl}${serviceEntitySuffix}`,
  );
  const siteService = nodes.find(
    (node) =>
      node["@type"] === "Service" && node["@id"] === `${siteOrigin}/#service`,
  );
  const breadcrumb = nodes.find((node) => node["@type"] === "BreadcrumbList");

  assert.ok(service, `${route}: page-specific Service JSON-LD missing`);
  assert.equal(service.url, expectedUrl, `${route}: Service URL mismatch`);
  assert.equal(service.name, data.title, `${route}: Service name mismatch`);
  assert.equal(
    service.description,
    data.description,
    `${route}: Service description mismatch`,
  );
  assert.ok(siteService, `${route}: site-wide Service JSON-LD missing`);
  assert.equal(
    siteService.url,
    `${siteOrigin}/services/`,
    `${route}: site-wide Service URL must target the service index`,
  );
  assert.ok(breadcrumb, `${route}: BreadcrumbList missing`);
  assert.equal(
    breadcrumb.itemListElement.at(-1).item,
    expectedUrl,
    `${route}: breadcrumb URL mismatch`,
  );

  if (requiresFaq) {
    const faq = nodes.find((node) => node["@type"] === "FAQPage");
    assert.ok(faq, `${route}: FAQPage missing`);
    assert.equal(
      faq.mainEntity.length,
      data.faqs.length,
      `${route}: FAQPage item count mismatch`,
    );
  }
}

validateServicePage({
  data: advisorData,
  html: advisorPage,
  route: advisorRoute,
  serviceEntitySuffix: "#service",
  requiresFaq: true,
});
validateServicePage({
  data: developmentData,
  html: developmentPage,
  route: developmentRoute,
  serviceEntitySuffix: "#service",
});
for (const service of focusedServices) {
  service.html = read(service.pagePath);
  validateServicePage({
    data: service.data,
    html: service.html,
    route: service.route,
    serviceEntitySuffix: "#service",
  });
}

const insightsIndex = read("dist/insights/index.html");
const insightsIndexUrl = `${siteOrigin}/insights/`;
assert.equal(
  insightsIndex.includes("<title>技術解説 | Acecore Systems</title>"),
  true,
  "insights: title missing",
);
assert.equal(
  insightsIndex.includes(`<link rel="canonical" href="${insightsIndexUrl}">`),
  true,
  "insights: canonical missing",
);
const insightsIndexJsonLdMatch = insightsIndex.match(
  /<script type="application\/ld\+json">([\s\S]*?)<\/script>/,
);
assert.ok(insightsIndexJsonLdMatch, "insights: JSON-LD missing");
const insightsIndexJsonLd = JSON.parse(insightsIndexJsonLdMatch[1]);
const insightsIndexNodes = Array.isArray(insightsIndexJsonLd)
  ? insightsIndexJsonLd
  : [insightsIndexJsonLd];
const insightsCollection = insightsIndexNodes.find(
  (node) =>
    node["@type"] === "CollectionPage" &&
    node["@id"] === `${insightsIndexUrl}#collection`,
);
const insightsItemList = insightsIndexNodes.find(
  (node) =>
    node["@type"] === "ItemList" &&
    node["@id"] === `${insightsIndexUrl}#item-list`,
);
assert.ok(insightsCollection, "insights: CollectionPage missing");
assert.ok(insightsItemList, "insights: ItemList missing");
assert.equal(
  insightsItemList.itemListElement.length,
  insightSlugs.length,
  "insights: ItemList must include every migrated article",
);

const insightPages = [];
for (const slug of insightSlugs) {
  const route = `/insights/${slug}/`;
  const pagePath = `dist/insights/${slug}/index.html`;
  const pageUrl = `${siteOrigin}${route}`;
  assert.equal(existsSync(join(root, pagePath)), true, `${pagePath} missing`);

  const html = read(pagePath);
  insightPages.push({ route, pagePath, html });
  assert.equal(
    html.includes(`<link rel="canonical" href="${pageUrl}">`),
    true,
    `${route}: canonical missing`,
  );
  assert.equal(
    (html.match(/<h1(?:\s[^>]*)?>/g) || []).length,
    1,
    `${route}: exactly one h1 is required`,
  );
  assert.equal(
    html.includes('<meta property="og:type" content="article">'),
    true,
    `${route}: article OGP type missing`,
  );
  assert.equal(
    html.includes('<meta property="article:published_time"'),
    true,
    `${route}: published time missing`,
  );
  assert.equal(
    /href="\/blog\//.test(html),
    false,
    `${route}: unresolved relative legacy blog link remains`,
  );

  const jsonLdMatch = html.match(
    /<script type="application\/ld\+json">([\s\S]*?)<\/script>/,
  );
  assert.ok(jsonLdMatch, `${route}: JSON-LD missing`);
  const jsonLd = JSON.parse(jsonLdMatch[1]);
  const nodes = Array.isArray(jsonLd) ? jsonLd : [jsonLd];
  const article = nodes.find(
    (node) =>
      node["@type"] === "TechArticle" && node["@id"] === `${pageUrl}#article`,
  );
  const breadcrumb = nodes.find((node) => node["@type"] === "BreadcrumbList");
  assert.ok(article, `${route}: TechArticle missing`);
  assert.deepEqual(
    article.mainEntityOfPage,
    { "@id": `${pageUrl}#webpage` },
    `${route}: mainEntityOfPage mismatch`,
  );
  assert.deepEqual(
    article.about,
    { "@id": `${siteOrigin}/#service` },
    `${route}: Systems service relationship missing`,
  );
  assert.equal(
    article.publisher?.["@id"],
    "https://acecore.net/#organization",
    `${route}: publisher mismatch`,
  );
  assert.equal(
    typeof article.image === "string" && article.image.startsWith("https://"),
    true,
    `${route}: absolute article image missing`,
  );
  assert.ok(breadcrumb, `${route}: BreadcrumbList missing`);
  assert.equal(
    breadcrumb.itemListElement.at(-1).item,
    pageUrl,
    `${route}: breadcrumb URL mismatch`,
  );

  const ogImage = html.match(/<meta property="og:image" content="([^"]+)">/);
  assert.equal(
    ogImage?.[1],
    article.image.replaceAll("&", "&amp;"),
    `${route}: OGP and TechArticle images must match`,
  );
  assert.equal(
    html.includes(`class="insight-article__cover"`),
    true,
    `${route}: visible article cover missing`,
  );
}

for (const { route, html } of insightPages) {
  for (const match of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const value = match[1].replaceAll("&amp;", "&");
    if (!value.startsWith("/")) continue;

    const pathname = new URL(value, siteOrigin).pathname;
    const target = extname(pathname)
      ? join(root, "dist", pathname.slice(1))
      : join(root, "dist", pathname.slice(1), "index.html");
    assert.equal(
      existsSync(target),
      true,
      `${route}: local target ${pathname} missing`,
    );
  }
}

for (const [label, html] of [
  ["home", home],
  ["services", services],
]) {
  assert.equal(
    html.includes(`href="${advisorRoute}"`),
    true,
    `${label}: route to IT advisor missing`,
  );
  assert.equal(
    html.includes(`href="${developmentRoute}"`),
    true,
    `${label}: route to development missing`,
  );
}

for (const expectedHref of [
  "/services/development/#small-automation",
  "/services/development/",
  "/services/development/#integrated-system",
]) {
  assert.equal(
    home.includes(`href="${expectedHref}"`),
    true,
    `home: direct development route ${expectedHref} missing`,
  );
}
assert.equal(
  /href="\/services\/#[^"]+"/.test(home),
  false,
  "home: legacy service-index anchors must not remain",
);

assert.equal(
  count(services, 'class="service-entry-point"'),
  2,
  "services: development and IT advisor entry points are required",
);

function validateHandoff(html, expectedHref, label) {
  const match = html.match(
    /<aside class="service-handoff" data-service-handoff>([\s\S]*?)<\/aside>/,
  );
  assert.ok(match, `${label}: service handoff missing`);
  assert.equal(
    match[1].includes(`href="${expectedHref}"`),
    true,
    `${label}: handoff target mismatch`,
  );
}

function validateServiceVisual(html, visual, label) {
  assert.equal(
    count(html, `src="${visual.src}"`),
    1,
    `${label}: service visual must appear exactly once`,
  );
  assert.equal(
    html.includes(`alt="${visual.alt}"`),
    true,
    `${label}: service visual alt text missing`,
  );
}

validateHandoff(advisorPage, developmentRoute, "IT advisor");
validateHandoff(developmentPage, advisorRoute, "development");
validateServiceVisual(advisorPage, advisorData.visual, "IT advisor");
validateServiceVisual(developmentPage, developmentData.visual, "development");
for (const [key, visual] of Object.entries(advisorData.sectionVisuals)) {
  validateServiceVisual(advisorPage, visual, `IT advisor ${key} visual`);
}
for (const [key, visual] of Object.entries(developmentData.sectionVisuals)) {
  validateServiceVisual(developmentPage, visual, `development ${key} visual`);
}
validateServiceVisual(services, advisorData.visual, "services IT advisor card");
validateServiceVisual(
  services,
  developmentData.visual,
  "services development card",
);
for (const service of focusedServices) {
  validateServiceVisual(
    service.html,
    service.data.visual,
    `${service.route} overview visual`,
  );
  for (const [key, visual] of Object.entries(service.data.sectionVisuals)) {
    validateServiceVisual(
      service.html,
      visual,
      `${service.route} ${key} visual`,
    );
  }
  validateServiceVisual(
    services,
    service.data.visual,
    `services ${service.route} card`,
  );
}

validateServiceVisual(guidePage, guideData.visual, "guide visual");
assert.equal(
  guideData.journey.length,
  4,
  "guide: four journey steps are required",
);
for (const step of guideData.journey) {
  assert.equal(
    guidePage.includes(step.title),
    true,
    `guide: journey step ${step.title} missing`,
  );
}

for (const work of worksData.cases) {
  validateServiceVisual(
    worksPage,
    { src: work.image, alt: work.imageAlt },
    `works ${work.id}`,
  );
}
for (const work of worksData.cases.slice(0, 2)) {
  validateServiceVisual(
    home,
    { src: work.image, alt: work.imageAlt },
    `home selected work ${work.id}`,
  );
}
for (const field of ["visual", "outcomesVisual", "scopeVisual"]) {
  validateServiceVisual(
    workDetailPage,
    workDetailData[field],
    `work detail ${field}`,
  );
}

assert.equal(
  count(advisorPage, "data-advisor-pricing-summary"),
  2,
  "IT advisor pricing must appear in exactly two summary blocks",
);
for (const summary of advisorData.pricingSummaries) {
  const pricingItem = pricingByKey.get(summary.pricingKey);
  assert.ok(pricingItem, `unknown advisor pricing key ${summary.pricingKey}`);
  assert.equal(
    count(advisorPage, `data-pricing-kind="${summary.id}"`),
    2,
    `IT advisor ${summary.id} price must appear at the beginning and end`,
  );
  assert.equal(
    count(advisorPage, pricingItem.price),
    2,
    `IT advisor ${summary.id} numeric price must appear exactly twice`,
  );
  assert.equal(
    pricing.includes(`id="${summary.pricingKey}"`),
    true,
    `pricing anchor ${summary.pricingKey} missing`,
  );
}

for (const hiddenPricingKey of [
  "it-advisor-standard",
  "ai-improvement-starter",
  "ai-system-implementation",
]) {
  const item = pricingByKey.get(hiddenPricingKey);
  assert.ok(item, `unknown hidden advisor pricing key ${hiddenPricingKey}`);
  assert.equal(
    advisorPage.includes(item.price),
    false,
    `IT advisor must not show the ${hiddenPricingKey} numeric price mid-page`,
  );
}

for (const offering of developmentData.offerings) {
  assert.deepEqual(
    offering.pricingKeys,
    [offering.id],
    `development use case ${offering.id} must use its matching price`,
  );
  const pricingItem = pricingByKey.get(offering.id);
  assert.ok(pricingItem, `unknown development pricing key ${offering.id}`);
  const offeringMatch = developmentPage.match(
    new RegExp(
      `<article[^>]*class="detail-offering"[^>]*id="${offering.id}"[^>]*>([\\s\\S]*?)<\\/article>`,
    ),
  );
  assert.ok(offeringMatch, `development use case ${offering.id} missing`);
  assert.equal(
    offeringMatch[1].includes(pricingItem.price),
    true,
    `development use case ${offering.id} price missing`,
  );
  assert.equal(
    pricing.includes(`id="${offering.id}"`),
    true,
    `pricing anchor ${offering.id} missing`,
  );
}

assert.equal(
  contact.includes("IT顧問・AI導入・デプロイについて"),
  true,
  "IT advisor contact category missing",
);
assert.equal(
  contact.includes("業務システム開発について"),
  true,
  "development contact category missing",
);
assert.equal(
  advisorPage.replaceAll("&amp;", "&").includes("service=it-advisor"),
  true,
  "IT advisor contact CTA query missing",
);
assert.equal(
  developmentPage.replaceAll("&amp;", "&").includes("service=business-system"),
  true,
  "development contact CTA query missing",
);

const collectXml = (directory) =>
  readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return collectXml(path);
    return extname(entry.name) === ".xml" ? [readFileSync(path, "utf8")] : [];
  });
const sitemapXml = collectXml(join(root, "dist")).join("\n");
for (const route of [
  advisorRoute,
  developmentRoute,
  ...focusedServices.map((service) => service.route),
  "/guide/",
  "/insights/",
  ...insightSlugs.map((slug) => `/insights/${slug}/`),
  "/works/",
  "/works/acecore-site-platform/",
]) {
  const expectedUrl = `${siteOrigin}${route}`;
  assert.equal(
    count(sitemapXml, `<loc>${expectedUrl}</loc>`),
    1,
    `${route}: route must appear once in sitemap output`,
  );
}

console.log(
  "SEO validation passed: service routes, pricing placement, metadata, structured data, and visual coverage",
);
