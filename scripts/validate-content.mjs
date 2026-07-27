import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const readText = (relativePath) =>
  readFileSync(join(root, relativePath), "utf8");
const readJson = (relativePath) => JSON.parse(readText(relativePath));
const requireText = (value, label) =>
  assert.equal(
    typeof value === "string" && value.trim().length > 0,
    true,
    `${label} is required`,
  );

const expectedCmsFiles = [
  "src/data/site.json",
  "src/data/home.json",
  "src/data/services.json",
  "src/data/pricing.json",
  "src/data/guide.json",
  "src/data/works.json",
  "src/data/contact.json",
  "src/data/privacy.json",
];
const expectedCmsFolders = [
  "src/data/service-details",
  "src/data/work-details",
];

function validateCmsConfig() {
  const config = readText("public/admin/config.yml");
  const graphql = readText("functions/admin/api/graphql.ts");
  const oauth = readText("functions/admin/api/_github-oauth.ts");
  const appOAuth = readText("functions/admin/api/_github-app-oauth.ts");
  const configFunction = readText("functions/admin/config.yml.ts");
  const adminIndex = readText("public/admin/index.html");
  const adminInit = readText("public/admin/init.js");
  const cmsFiles = Array.from(
    config.matchAll(/^\s*file:\s*([^,\s]+),?\s*$/gm),
    (match) => match[1],
  );
  const cmsFolders = Array.from(
    config.matchAll(/^\s*folder:\s*([^,\s]+),?\s*$/gm),
    (match) => match[1],
  );

  assert.match(
    config,
    /backend:\s*[\s\S]*?\n\s+repo:\s+acecore-systems\/acecore-systems\b/,
    "CMS backend repository must be acecore-systems/acecore-systems",
  );
  assert.match(
    config,
    /backend:\s*[\s\S]*?\n\s+branch:\s+main\b/,
    "CMS backend branch must be main",
  );
  assert.equal(
    /^publish_mode:\s*editorial_workflow\b/m.test(config),
    false,
    "Sveltia CMS does not implement editorial_workflow; use the PR proxy",
  );
  assert.match(
    config,
    /^\s+base_url:\s+https:\/\/systems\.acecore\.net\/admin\/api$/m,
    "CMS must use the same-origin GitHub App authenticator",
  );
  assert.match(
    config,
    /^\s+auth_endpoint:\s+auth$/m,
    "CMS must use the same-origin GitHub App auth endpoint",
  );
  assert.match(
    config,
    /^\s+api_root:\s+\/admin\/api\/github$/m,
    "CMS must use the same-origin GitHub REST proxy",
  );
  assert.match(
    config,
    /^\s+graphql_api_root:\s+\/admin\/api\/graphql$/m,
    "CMS must use the same-origin GitHub GraphQL proxy",
  );
  assert.equal(
    graphql.includes("createCmsBranch") &&
      graphql.includes("cms/systems/") &&
      graphql.includes("/pulls"),
    true,
    "CMS writes must create a scoped cms/systems work branch and PR",
  );
  assert.equal(
    oauth.includes("repository.permissions.push !== true") &&
      oauth.includes('path: "/user"') &&
      oauth.includes('token.startsWith("ghu_")') &&
      oauth.includes('CMS_PRODUCTION_HOSTNAME = "systems.acecore.net"'),
    true,
    "CMS proxy must be production-only and validate repository write access",
  );
  assert.equal(
    appOAuth.includes('data.access_token.startsWith("ghu_")') &&
      appOAuth.includes('data.scope === ""') &&
      appOAuth.includes('url.searchParams.set("code_challenge"') &&
      appOAuth.includes("code_verifier: codeVerifier") &&
      appOAuth.includes("repository_id: String(GITHUB_REPOSITORY_ID)") &&
      appOAuth.includes("/user/installations/${installationId}/repositories") &&
      appOAuth.includes("event.origin !== openerOrigin") &&
      !appOAuth.includes('postMessage(probe, "*")'),
    true,
    "CMS auth must require an expiring GitHub App token and exact opener origin",
  );
  assert.equal(
    configFunction.includes("$1${origin}/admin/api/github") &&
      configFunction.includes("$1${origin}/admin/api/graphql"),
    true,
    "CMS runtime config must use the deployment origin proxy",
  );
  assert.equal(
    adminIndex.includes('src="/admin/runtime-config.js"') &&
      adminIndex.includes('src="/admin/init.js"') &&
      adminIndex.includes('href="/admin/cms-notice.css"') &&
      adminInit.includes("保存は公開ではありません") &&
      adminInit.includes("公開方法の案内を閉じる"),
    true,
    "CMS manual initialization and publish notice are required",
  );
  assert.deepEqual(
    cmsFiles,
    expectedCmsFiles,
    "CMS fixed-file allowlist changed unexpectedly",
  );
  assert.deepEqual(
    cmsFolders,
    expectedCmsFolders,
    "CMS folder allowlist changed unexpectedly",
  );

  for (const contentPath of [...cmsFiles, ...cmsFolders]) {
    assert.equal(
      existsSync(join(root, contentPath)),
      true,
      `${contentPath}: CMS content path missing`,
    );
  }
}

validateCmsConfig();

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
  `content validation passed: ${serviceSources.length} services, ${workSources.length} work`,
);
