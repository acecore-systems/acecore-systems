import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const readJson = (relativePath) =>
  JSON.parse(readFileSync(join(root, relativePath), "utf8"));
const requireText = (value, label) =>
  assert.equal(
    typeof value === "string" && value.trim().length > 0,
    true,
    `${label} is required`,
  );

const serviceSources = [
  {
    route: "/services/site-functions/",
    page: "src/pages/services/site-functions.astro",
    data: "src/data/service-details/site-functions.json",
  },
  {
    route: "/services/site-quality/",
    page: "src/pages/services/site-quality.astro",
    data: "src/data/service-details/site-quality.json",
  },
  {
    route: "/services/operations/",
    page: "src/pages/services/operations.astro",
    data: "src/data/service-details/operations.json",
  },
];
const advisorSource = {
  route: "/services/it-advisor/",
  page: "src/pages/services/it-advisor.astro",
  data: "src/data/it-advisor.json",
};
const workSources = [
  {
    route: "/works/acecore-site-platform/",
    page: "src/pages/works/acecore-site-platform.astro",
    data: "src/data/work-details/acecore-site-platform.json",
  },
];
const migratedTechnicalArticles = [
  "https://acecore.net/blog/astro-ai-contact-chat/",
  "https://acecore.net/blog/cloudflare-only-blog-comments/",
  "https://acecore.net/blog/cms-selection-and-turnstile/",
  "https://acecore.net/blog/astro-i18n-blog-translation/",
  "https://acecore.net/blog/copilot-translation-pipeline/",
  "https://acecore.net/blog/astro-seo-and-structured-data/",
  "https://acecore.net/blog/astro-ux-and-code-quality/",
  "https://acecore.net/blog/astro-performance-tuning/",
  "https://acecore.net/blog/astro-accessibility-guide/",
  "https://acecore.net/blog/cloudflare-pages-security/",
  "https://acecore.net/blog/service-cta-contact-prefill/",
];
const pricing = readJson("src/data/pricing.json");
const pricingKeys = new Map();

for (const item of pricing.items) {
  requireText(item.key, "src/data/pricing.json: item key");
  requireText(item.label, `src/data/pricing.json: ${item.key} label`);
  requireText(item.price, `src/data/pricing.json: ${item.key} price`);
  assert.equal(
    pricingKeys.has(item.key),
    false,
    `src/data/pricing.json: duplicate pricing key ${item.key}`,
  );
  pricingKeys.set(item.key, item);
}

const serviceAnchors = new Map();
const technicalResources = new Set();

for (const source of serviceSources) {
  assert.equal(
    existsSync(join(root, source.page)),
    true,
    `${source.page} missing`,
  );
  const data = readJson(source.data);
  requireText(data.title, `${source.data}: title`);
  requireText(data.description, `${source.data}: description`);
  assert.equal(data.challenges.length > 0, true, `${source.data}: challenges`);
  assert.equal(data.offerings.length > 0, true, `${source.data}: offerings`);
  assert.equal(data.process.length > 0, true, `${source.data}: process`);
  assert.equal(data.resources.length > 0, true, `${source.data}: resources`);

  const ids = data.offerings.map((offering) => offering.id);
  assert.equal(
    new Set(ids).size,
    ids.length,
    `${source.data}: duplicate offering id`,
  );
  serviceAnchors.set(source.route, new Set(ids));

  for (const offering of data.offerings) {
    assert.equal(
      Array.isArray(offering.pricingKeys) && offering.pricingKeys.length > 0,
      true,
      `${source.data}: ${offering.id} requires pricingKeys`,
    );
    assert.equal(
      new Set(offering.pricingKeys).size,
      offering.pricingKeys.length,
      `${source.data}: ${offering.id} has duplicate pricingKeys`,
    );
    for (const key of offering.pricingKeys) {
      assert.equal(
        pricingKeys.has(key),
        true,
        `${source.data}: ${offering.id} references unknown pricing key ${key}`,
      );
    }
  }

  for (const resource of data.resources) {
    const url = new URL(resource.href);
    assert.equal(url.protocol, "https:", `${resource.href}: HTTPS required`);
    technicalResources.add(url.href);
  }
}

assert.equal(
  existsSync(join(root, advisorSource.page)),
  true,
  `${advisorSource.page} missing`,
);
const advisor = readJson(advisorSource.data);
requireText(advisor.title, `${advisorSource.data}: title`);
requireText(advisor.description, `${advisorSource.data}: description`);
requireText(advisor.indexSummary, `${advisorSource.data}: indexSummary`);
assert.equal(
  advisor.indexTopics.length > 0,
  true,
  `${advisorSource.data}: indexTopics`,
);
assert.equal(
  advisor.challenges.length > 0,
  true,
  `${advisorSource.data}: challenges`,
);
assert.equal(
  advisor.supportAreas.length > 0,
  true,
  `${advisorSource.data}: supportAreas`,
);
assert.equal(
  advisor.useCases.length > 0,
  true,
  `${advisorSource.data}: useCases`,
);
assert.equal(
  advisor.packages.length > 0,
  true,
  `${advisorSource.data}: packages`,
);
assert.equal(advisor.plans.length > 0, true, `${advisorSource.data}: plans`);
assert.equal(
  advisor.process.length > 0,
  true,
  `${advisorSource.data}: process`,
);
assert.equal(
  advisor.governance.length > 0,
  true,
  `${advisorSource.data}: governance`,
);
assert.equal(
  advisor.excluded.length > 0,
  true,
  `${advisorSource.data}: excluded`,
);
assert.equal(advisor.faqs.length > 0, true, `${advisorSource.data}: faqs`);

const advisorAnchors = [
  ...advisor.supportAreas.map((item) => item.id),
  ...advisor.packages.map((item) => item.id),
  ...advisor.plans.map((item) => item.id),
];
assert.equal(
  new Set(advisorAnchors).size,
  advisorAnchors.length,
  `${advisorSource.data}: duplicate anchor id`,
);
serviceAnchors.set(advisorSource.route, new Set(advisorAnchors));

for (const [index, item] of advisor.supportAreas.entries()) {
  requireText(item.id, `${advisorSource.data}: supportAreas[${index}].id`);
  requireText(
    item.title,
    `${advisorSource.data}: supportAreas[${index}].title`,
  );
  requireText(item.body, `${advisorSource.data}: supportAreas[${index}].body`);
  assert.equal(
    item.includes.length > 0,
    true,
    `${advisorSource.data}: supportAreas[${index}].includes`,
  );
}
for (const [index, item] of advisor.plans.entries()) {
  requireText(item.title, `${advisorSource.data}: plans[${index}].title`);
  requireText(item.boundary, `${advisorSource.data}: plans[${index}].boundary`);
  assert.equal(
    item.includes.length > 0,
    true,
    `${advisorSource.data}: plans[${index}].includes`,
  );
}
for (const [index, faq] of advisor.faqs.entries()) {
  requireText(faq.question, `${advisorSource.data}: faqs[${index}].question`);
  requireText(faq.answer, `${advisorSource.data}: faqs[${index}].answer`);
}

const advisorPricingKeys = [
  advisor.startingPriceKey,
  ...advisor.packages.map((item) => item.pricingKey),
  ...advisor.plans.map((item) => item.pricingKey),
];
for (const key of advisorPricingKeys) {
  assert.equal(
    pricingKeys.has(key),
    true,
    `${advisorSource.data}: unknown pricing key ${key}`,
  );
}
const cmsConfig = readFileSync(join(root, "public/admin/config.yml"), "utf8");
assert.equal(
  cmsConfig.includes("file: src/data/it-advisor.json"),
  true,
  "public/admin/config.yml: IT advisor data file missing",
);

for (const article of migratedTechnicalArticles) {
  assert.equal(
    technicalResources.has(article),
    true,
    `${article}: missing from service technical resources`,
  );
}

for (const source of workSources) {
  assert.equal(
    existsSync(join(root, source.page)),
    true,
    `${source.page} missing`,
  );
  const data = readJson(source.data);
  requireText(data.title, `${source.data}: title`);
  requireText(data.description, `${source.data}: description`);
  assert.equal(data.story.length > 0, true, `${source.data}: story`);
  assert.equal(data.outcomes.length > 0, true, `${source.data}: outcomes`);
  for (const [index, outcome] of data.outcomes.entries()) {
    requireText(outcome.label, `${source.data}: outcomes[${index}].label`);
    requireText(outcome.body, `${source.data}: outcomes[${index}].body`);
  }
  assert.equal(data.scope.length > 0, true, `${source.data}: scope`);
  assert.equal(data.resources.length > 0, true, `${source.data}: resources`);
}

const knownRoutes = new Set([
  advisorSource.route,
  ...serviceSources.map((source) => source.route),
  ...workSources.map((source) => source.route),
]);
const services = readJson("src/data/services.json");
const works = readJson("src/data/works.json");

for (const item of [...services.services, ...works.cases]) {
  if (item.detailUrl) {
    assert.equal(
      knownRoutes.has(item.detailUrl),
      true,
      `${item.detailUrl}: unknown detail route`,
    );
  }
}

for (const [index, work] of works.cases.entries()) {
  if (!work.externalUrl) continue;
  requireText(
    work.externalLabel,
    `src/data/works.json: cases[${index}].externalLabel`,
  );
  const externalUrl = new URL(work.externalUrl);
  assert.equal(
    externalUrl.protocol,
    "https:",
    `${work.externalUrl}: HTTPS required`,
  );
}

for (const item of pricing.items) {
  if (!item.detailUrl?.startsWith("/services/")) continue;
  const url = new URL(item.detailUrl, "https://systems.acecore.net");
  const anchors = serviceAnchors.get(url.pathname);
  assert.ok(anchors, `${item.detailUrl}: unknown service route`);
  assert.equal(
    anchors.has(url.hash.slice(1)),
    true,
    `${item.detailUrl}: unknown offering anchor`,
  );
}

console.log(
  `content validation passed: ${serviceSources.length + 1} services, ${workSources.length} work`,
);
