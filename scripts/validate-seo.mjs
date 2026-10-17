import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, extname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { load as loadHtml } from "cheerio";

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
    route: "/services/website/",
    pagePath: "dist/services/website/index.html",
    data: readJson("src/data/service-details/website.json"),
  },
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
  {
    route: "/services/security/",
    pagePath: "dist/services/security/index.html",
    data: readJson("src/data/service-details/security.json"),
  },
];
const guideData = readJson("src/data/guide.json");
const worksData = readJson("src/data/works.json");
const workDetailData = readJson(
  "src/data/work-details/acecore-site-platform.json",
);
const serviceIndexData = readJson("src/data/services.json");
const pricingData = readJson("src/data/pricing.json");
const pricingByKey = new Map(pricingData.items.map((item) => [item.key, item]));
const designService = serviceIndexData.services.find(
  (item) => item.id === "design",
);
const designPricing = pricingByKey.get("design");

assert.ok(designService, "design service source missing");
assert.ok(designPricing, "design pricing source missing");

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
  assert.equal(
    siteService.serviceType.includes(designService.title),
    true,
    `${route}: site-wide Service JSON-LD must include design and creative`,
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
    requiresFaq: Boolean(service.data.faqs?.length),
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
}
assert.equal(
  services.includes(`href="${developmentRoute}"`),
  true,
  "services: route to development missing",
);
const homeNeeds = loadHtml(home)(".purpose-needs a.purpose-need");
assert.deepEqual(
  homeNeeds.map((_, link) => loadHtml(link)("a").attr("href")).get(),
  ["/services/#web", "/services/#work", advisorRoute],
  "home: the three purpose routes must lead to the matching category or advisor",
);
assert.equal(
  loadHtml(home)("#philosophy").length,
  1,
  "home: philosophy destination must remain available",
);
const homeCases = loadHtml(home)(".purpose-case-card");
assert.equal(
  homeCases.length,
  3,
  "home: three concrete case studies must be selectable",
);
for (const card of homeCases.toArray()) {
  const element = loadHtml(card);
  const href = element("h3 a").attr("href");
  const work = worksData.cases.find((work) => href === `/works/#${work.id}`);
  assert.ok(work, "home: case must reference a published case study");
  assert.equal(
    element("dd").text().trim(),
    work.result,
    "home: case result must match the existing evidence",
  );
}

const catalogRoutes = new Set([
  ...serviceIndexData.entryPoints.map((entry) => entry.href),
  ...focusedServices.map((service) => service.route),
]);
const serviceRows = loadHtml(services)(
  ".purpose-catalog a.purpose-service-row",
);
assert.equal(
  serviceRows.length,
  catalogRoutes.size,
  "services: every distinct service needs a dedicated catalog row",
);
for (const route of catalogRoutes)
  assert.equal(
    serviceRows.filter(`[href="${route}"]`).length,
    1,
    `services: ${route} must be independently selectable`,
  );
assert.equal(
  services.includes(`id="${designService.id}"`),
  true,
  "services: design service anchor missing",
);
assert.equal(
  services.includes(designService.title) &&
    services.includes(designService.body) &&
    designService.examples.every((example) => services.includes(example)),
  true,
  "services: design service content missing",
);
assert.equal(
  pricing.includes(`id="${designPricing.key}"`) &&
    pricing.includes(designPricing.label) &&
    pricing.includes(designPricing.price) &&
    pricing.includes(designPricing.note) &&
    pricing.includes(`href="${designPricing.detailUrl}"`),
  true,
  "pricing: design service price and service anchor link missing",
);
assert.equal(
  contact.includes("デザイン・クリエイティブについて"),
  true,
  "contact: design service category missing",
);

for (const item of pricingData.items.filter(
  (item) => item.track === "website",
)) {
  assert.equal(
    pricing.includes(`href="${item.detailUrl}"`) &&
      pricing.includes(item.price),
    true,
    `pricing: ${item.key} must link to its website plan`,
  );
}
assert.equal(
  home.includes('href="/services/#web"'),
  true,
  "home: website entry missing",
);
assert.equal(
  contact.includes(
    '<option value="ホームページ制作・更新について">ホームページ制作・更新サポート</option>',
  ),
  true,
  "contact: website category missing",
);

const pricingJsonLdMatch = pricing.match(
  /<script type="application\/ld\+json">([\s\S]*?)<\/script>/,
);
assert.ok(pricingJsonLdMatch, "pricing: JSON-LD missing");
const pricingJsonLd = JSON.parse(pricingJsonLdMatch[1]);
const pricingJsonLdNodes = Array.isArray(pricingJsonLd)
  ? pricingJsonLd
  : [pricingJsonLd];
const pricingItemList = pricingJsonLdNodes.find(
  (node) => node["@type"] === "ItemList",
);
assert.ok(pricingItemList, "pricing: ItemList JSON-LD missing");
assert.equal(
  pricingItemList.itemListElement.some(
    (item) =>
      item.name === designPricing.label &&
      item.url === `${siteOrigin}${designPricing.detailUrl}`,
  ),
  true,
  "pricing: design service JSON-LD item missing",
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

function validateImageAlts(html, label) {
  assert.doesNotMatch(
    html,
    /<img\b(?![^>]*\balt\s*=)[^>]*>/u,
    `${label}: every rendered image must include an alt attribute`,
  );
  const $ = loadHtml(html);
  const decorativeDeviceSources = new Set([
    "/images/works/cherry-device-frame.webp",
    "/images/works/cherry-mobile.jpg",
  ]);
  for (const image of $("img").toArray()) {
    const element = $(image);
    if (element.attr("alt")?.trim()) continue;
    assert.equal(
      element.attr("aria-hidden"),
      "true",
      `${label}: an empty alt is allowed only for an explicitly decorative image`,
    );
    assert.ok(
      decorativeDeviceSources.has(element.attr("src")),
      `${label}: content images must retain a non-empty alt attribute`,
    );
  }
}

function validateServiceVisual(html, visual, label, expectedCount = 1) {
  assert.equal(
    [...html.matchAll(/<img\b[^>]*>/gu)].filter(
      ([tag]) =>
        tag.includes(`src="${visual.src}"`) &&
        tag.includes(`alt="${visual.alt}"`),
    ).length,
    expectedCount,
    `${label}: matching service visual and alt must appear ${expectedCount} time(s)`,
  );
  assert.equal(
    html.includes(`alt="${visual.alt}"`),
    true,
    `${label}: service visual alt text missing`,
  );
}

validateHandoff(advisorPage, developmentRoute, "IT advisor");
validateHandoff(developmentPage, advisorRoute, "development");
for (const [label, html] of [
  ["home", home],
  ["services", services],
  ["pricing", pricing],
  ["contact", contact],
  ["guide", guidePage],
  ["works", worksPage],
  ["work detail", workDetailPage],
  ["IT advisor", advisorPage],
  ["development", developmentPage],
]) {
  validateImageAlts(html, label);
}
// Generic artwork is optional; concrete case evidence is verified below.
for (const service of focusedServices) {
  validateImageAlts(service.html, service.route);
  const serviceCard = loadHtml(services)(
    `.purpose-catalog a.purpose-service-row[href="${service.route}"]`,
  );
  assert.equal(
    serviceCard.length,
    1,
    `services ${service.route}: exactly one catalog row is required`,
  );
  assert.equal(
    serviceCard.find("h3").text().trim(),
    service.data.title,
    `services ${service.route}: service title missing`,
  );
  assert.equal(
    serviceCard.find(".purpose-service-row__summary").text().trim(),
    service.data.indexSummary,
    `services ${service.route}: service description missing`,
  );
}

validateServiceVisual(guidePage, guideData.visual, "guide visual");
for (const route of guideData.routes) {
  assert.equal(
    guidePage.includes(`href="${route.href}"`),
    true,
    `guide: link to canonical service ${route.href} missing`,
  );
}
const redirects = read("public/_redirects");
for (const locale of ["", "en", "zh-cn", "es", "pt", "fr", "ko", "de", "ru"]) {
  const prefix = locale ? `/${locale}` : "";
  for (const route of guideData.routes) {
    const oldPath = `${prefix}/guide/${route.id}/`;
    const targetPath = `${prefix}${route.href}`;
    assert.equal(
      redirects.includes(`${oldPath} ${targetPath} 301`),
      true,
      `${oldPath}: permanent redirect to service missing`,
    );
    assert.equal(
      existsSync(join(root, `dist${oldPath}index.html`)),
      false,
      `${oldPath}: duplicate guide page should not be generated`,
    );
  }
}
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
const featuredWork = worksData.cases.find(
  (work) => work.id === "case-cherry-homepage",
);
assert.ok(featuredWork, "the selected homepage case study must exist");
for (const [label, html] of [
  ["home", home],
  [
    "website",
    focusedServices.find((service) => service.route === "/services/website/")
      .html,
  ],
]) {
  validateServiceVisual(
    html,
    { src: featuredWork.image, alt: featuredWork.imageAlt },
    `${label} selected work ${featuredWork.id}`,
    1,
  );
  assert.equal(
    loadHtml(html)(`.purpose-work a[href="/works/#${featuredWork.id}"]`)
      .length > 0,
    true,
    `${label}: case study must link to the actual work`,
  );
}
for (const field of ["visual", "outcomesVisual", "scopeVisual"]) {
  validateServiceVisual(
    workDetailPage,
    workDetailData[field],
    `work detail ${field}`,
  );
}

for (const plan of advisorData.plans) {
  const block = loadHtml(advisorPage)(`.selection-offering#${plan.id}`);
  const item = pricingByKey.get(plan.pricingKey);
  assert.ok(item, `unknown advisor pricing key ${plan.pricingKey}`);
  assert.equal(
    block.length,
    1,
    `IT advisor ${plan.id}: unique scope and price block missing`,
  );
  for (const required of [
    item.price,
    item.note,
    plan.summary,
    plan.boundary,
    ...plan.includes,
  ])
    assert.ok(
      block.text().includes(required),
      `IT advisor ${plan.id}: a fee or contract condition is missing`,
    );
  assert.equal(
    pricing.includes(`id="${plan.pricingKey}"`),
    true,
    `pricing anchor ${plan.pricingKey} missing`,
  );
}
for (const service of [
  { data: developmentData, html: developmentPage, route: developmentRoute },
  ...focusedServices,
]) {
  const $ = loadHtml(service.html);
  for (const offering of service.data.offerings) {
    const block = $(`.selection-offering#${offering.id}`);
    assert.equal(
      block.length,
      1,
      `${service.route} ${offering.id}: unique offering is required`,
    );
    for (const required of [
      offering.body,
      ...offering.includes,
      ...(offering.priceNote ? [offering.priceNote] : []),
    ])
      assert.ok(
        block.text().includes(required),
        `${service.route} ${offering.id}: scope or conditions missing`,
      );
    for (const key of offering.pricingKeys) {
      const item = pricingByKey.get(key);
      assert.ok(item, `unknown pricing key ${key}`);
      assert.ok(
        block.text().includes(item.price) && block.text().includes(item.note),
        `${service.route} ${offering.id}: price and its conditions must stay together`,
      );
    }
  }
  for (const term of service.data.terms ?? [])
    assert.ok(
      $.text().includes(term.body),
      `${service.route}: contract term missing`,
    );
}
for (const item of pricingData.items) {
  const target = new URL(item.detailUrl, siteOrigin);
  const $ = loadHtml(read(`dist${target.pathname}index.html`));
  assert.equal(
    $("[id]").filter((_, node) => $(node).attr("id") === target.hash.slice(1))
      .length,
    1,
    `pricing ${item.key}: detail anchor must resolve uniquely`,
  );
  assert.ok(
    pricing.includes(item.price) && pricing.includes(item.note),
    `pricing ${item.key}: price conditions missing`,
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
      `<article[^>]*class="selection-offering"[^>]*id="${offering.id}"[^>]*>([\\s\\S]*?)<\\/article>`,
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
assert.doesNotMatch(
  sitemapXml,
  /<loc>https:\/\/systems\.acecore\.net\/(?:[a-z]{2}(?:-[a-z]{2})?\/)?guide\/(?:development|it-advisor)\/<\/loc>/u,
  "duplicate guide detail pages must not be in the sitemap",
);
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

for (const service of [
  { data: advisorData, html: advisorPage, route: advisorRoute },
  { data: developmentData, html: developmentPage, route: developmentRoute },
  ...focusedServices,
]) {
  const rendered = loadHtml(service.html)("main").text();
  assert.ok(
    rendered.includes(service.data.sectionVisuals.process.caption),
    `${service.route}: published handover/verification summary missing`,
  );
}

// Published descriptions, contract conditions and fragment links are compatibility boundaries.
const homeData = readJson("src/data/home.json");
for (const scope of serviceIndexData.services) {
  const destination = scope.detailUrl ?? "/services/";
  const rendered = loadHtml(read(`dist${destination}index.html`))(
    "main",
  ).text();
  for (const field of [scope.body, ...scope.examples])
    assert.ok(
      rendered.includes(field),
      `${destination}: published ${scope.id} scope/example is no longer readable`,
    );
}
for (const situation of homeData.consultationSituations) {
  const destination = new URL(situation.href, siteOrigin).pathname;
  const rendered = loadHtml(read(`dist${destination}index.html`))(
    "main",
  ).text();
  for (const field of [situation.title, situation.body])
    assert.ok(
      rendered.includes(field),
      `${destination}: published consultation example is missing`,
    );
}
for (const work of worksData.cases) {
  const $ = loadHtml(worksPage);
  const card = $(`[id="${work.id}"]`);
  assert.equal(card.length, 1, `works: ${work.id} must remain addressable`);
  for (const field of [
    work.title,
    work.summary,
    work.challenge,
    work.proposal,
    work.result,
  ])
    assert.ok(
      card.text().includes(field),
      `works: ${work.id} published case content is missing`,
    );
  for (const field of [work.detailUrl, work.externalUrl].filter(Boolean))
    assert.ok(
      card
        .find("a")
        .toArray()
        .some((node) => $(node).attr("href") === field),
      `works: ${work.id} published destination is missing`,
    );
}
const guideText = loadHtml(guidePage)("main").text();
for (const tip of guideData.tips)
  for (const field of [tip.title, tip.body, ...tip.points])
    assert.ok(
      guideText.includes(field),
      `guide: preparation content missing: ${tip.title}`,
    );
for (const faq of guideData.faqs)
  for (const field of [faq.question, faq.answer])
    assert.ok(guideText.includes(field), "guide: published FAQ missing");
const websiteData = focusedServices.find(
  (service) => service.route === "/services/website/",
).data;
assert.ok(
  loadHtml(read("dist/services/website/index.html"))("main")
    .text()
    .includes(websiteData.offeringsLead),
  "website: separate monthly contract, tax and estimate conditions must remain explicit",
);
for (const summary of advisorData.pricingSummaries)
  assert.ok(
    loadHtml(advisorPage)("main").text().includes(summary.note),
    `advisor: ${summary.id} engagement note missing`,
  );
const legacyFragments = {
  "/": [
    "layer-model-title",
    "domain-title",
    "customer-touchpoints",
    "operations",
    "it-foundation",
    "consultation-title",
    "home-cta-title",
  ],
  "/services/": [
    "service-entry-title",
    "service-entry-development",
    "service-entry-it-advisor",
    "service-entry-website",
    "service-domains-title",
    "service-detail-index-title",
    "service-detail-primary-title",
    "service-detail-supporting-title",
    "service-cta-title",
  ],
  "/services/it-advisor/": [
    "advisor-introduction-title",
    "advisor-use-cases-title",
    "advisor-plans-title",
    "advisor-process-title",
    "advisor-boundaries-title",
    "advisor-faq-title",
    "advisor-related-title",
    "advisor-cta-title",
  ],
  "/services/website/": [
    "website-cost-title",
    "website-terms-title",
    "website-faq-title",
  ],
};
for (const [route, ids] of Object.entries(legacyFragments)) {
  const $ = loadHtml(read(`dist${route}index.html`));
  for (const id of ids)
    assert.equal(
      $(`[id="${id}"]`).length,
      1,
      `${route}#${id}: published fragment must resolve uniquely`,
    );
}

console.log(
  "SEO validation passed: service routes, pricing placement, metadata, structured data, and visual coverage",
);
