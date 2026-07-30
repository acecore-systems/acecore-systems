import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { validateSystemsContentFiles } from '../src/lib/systems-content-validation.ts'
import { insightSlugs, resolveInsightHref } from '../src/lib/insight-links.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const readText = (relativePath) =>
  readFileSync(join(root, relativePath), 'utf8')
const readJson = (relativePath) => JSON.parse(readText(relativePath))
const requireText = (value, label) =>
  assert.equal(
    typeof value === 'string' && value.trim().length > 0,
    true,
    `${label} is required`,
  )
const validateHandoff = (handoff, label) => {
  assert.ok(handoff && typeof handoff === 'object', `${label} is required`)
  for (const field of ['eyebrow', 'title', 'body', 'label', 'href']) {
    requireText(handoff[field], `${label}: ${field}`)
  }
  assert.equal(
    handoff.href.startsWith('/services/'),
    true,
    `${label}: href must target a service route`,
  )
}
const validateImageAsset = (src, label) => {
  requireText(src, `${label}: src`)
  const normalizedSrc = typeof src === 'string' ? src : ''
  assert.match(
    normalizedSrc,
    /^\/(?:images|uploads)\/.+\.(?:avif|jpe?g|png|webp)$/i,
    `${label}: src must reference a public image asset`,
  )
  assert.equal(
    existsSync(join(root, 'public', normalizedSrc.slice(1))),
    true,
    `${label}: ${normalizedSrc} missing`,
  )
}
const validateVisual = (visual, label) => {
  assert.ok(visual && typeof visual === 'object', `${label} is required`)
  for (const field of ['alt', 'caption']) {
    requireText(visual[field], `${label}: ${field}`)
  }
  validateImageAsset(visual.src, label)
}
const validateSectionVisuals = (sectionVisuals, label) => {
  assert.ok(
    sectionVisuals && typeof sectionVisuals === 'object',
    `${label} is required`,
  )
  for (const key of ['scope', 'process']) {
    validateVisual(sectionVisuals[key], `${label}: ${key}`)
  }
}

const expectedCmsFiles = [
  'src/data/site.json',
  'src/data/home.json',
  'src/data/services.json',
  'src/data/it-advisor.json',
  'src/data/pricing.json',
  'src/data/guide.json',
  'src/data/works.json',
  'src/data/contact.json',
  'src/data/privacy.json',
]
const expectedCmsFolders = ['src/data/service-details', 'src/data/work-details']
const cmsJsonPaths = [
  ...expectedCmsFiles,
  'src/data/privacy.json',
  'src/data/service-details/development.json',
  'src/data/service-details/site-functions.json',
  'src/data/service-details/site-quality.json',
  'src/data/service-details/operations.json',
  'src/data/work-details/acecore-site-platform.json',
]

function validateCmsConfig() {
  const config = readText('public/admin/config.yml')
  const graphql = readText('functions/admin/api/graphql.ts')
  const policy = readText('functions/admin/api/_cms-policy.ts')
  const oauth = readText('functions/admin/api/_github-oauth.ts')
  const appOAuth = readText('functions/admin/api/_github-app-oauth.ts')
  const githubApi = readText('functions/admin/api/_github-api.ts')
  const configFunction = readText('functions/admin/config.yml.ts')
  const adminIndex = readText('public/admin/index.html')
  const adminInit = readText('public/admin/init.js')
  const cmsFiles = Array.from(
    config.matchAll(/^\s*file:\s*([^,\s]+),?\s*$/gm),
    (match) => match[1],
  )
  const cmsFolders = Array.from(
    config.matchAll(/^\s*folder:\s*([^,\s]+),?\s*$/gm),
    (match) => match[1],
  )

  assert.match(
    config,
    /backend:\s*[\s\S]*?\n\s+repo:\s+acecore-systems\/acecore-systems\b/,
    'CMS backend repository must be acecore-systems/acecore-systems',
  )
  assert.match(
    config,
    /backend:\s*[\s\S]*?\n\s+branch:\s+main\b/,
    'CMS backend branch must be main',
  )
  assert.equal(
    /^publish_mode:\s*editorial_workflow\b/m.test(config),
    false,
    'Sveltia CMS does not implement editorial_workflow; use the validated proxy',
  )
  assert.match(
    config,
    /^\s+base_url:\s+https:\/\/systems\.acecore\.net\/admin\/api$/m,
    'CMS must use the same-origin GitHub App authenticator',
  )
  assert.match(
    config,
    /^\s+auth_endpoint:\s+auth$/m,
    'CMS must use the same-origin GitHub App auth endpoint',
  )
  assert.match(
    config,
    /^\s+api_root:\s+\/admin\/api\/github$/m,
    'CMS must use the same-origin GitHub REST proxy',
  )
  assert.match(
    config,
    /^\s+graphql_api_root:\s+\/admin\/api\/graphql$/m,
    'CMS must use the same-origin GitHub GraphQL proxy',
  )
  assert.equal(
    graphql.includes('createCommitOnBranch') &&
      graphql.includes('branchName: CMS_REPOSITORY.branch') &&
      graphql.includes('expectedHeadOid: mainSha') &&
      graphql.includes('CMS-Operation:') &&
      graphql.includes('verifyCmsOperationCommit') &&
      graphql.includes('getGitBlobOid') &&
      graphql.includes('getGitHubAppToken(env, { forceRefresh: true })') &&
      graphql.includes('token: commitToken') &&
      githubApi.includes('CMS_GITHUB_APP_PRIVATE_KEY') &&
      githubApi.includes('repositories: [CMS_REPOSITORY.name]') &&
      githubApi.includes('contents: "write"') &&
      githubApi.includes('hasExpectedInstallationScope') &&
      graphql.includes('mode: "direct"') &&
      !graphql.includes('/pulls'),
    true,
    'CMS writes must use a repository-scoped App token, publish one direct commit, and reconcile ambiguous responses by marker, paths, and blobs',
  )
  assert.equal(
    oauth.includes('repository.permissions.push !== true') &&
      oauth.includes('path: "/user"') &&
      oauth.includes('token.startsWith("ghu_")') &&
      oauth.includes('CMS_PRODUCTION_HOSTNAME') &&
      policy.includes('CMS_PRODUCTION_HOSTNAME = "systems.acecore.net"') &&
      configFunction.includes(
        'new URL(request.url).hostname !== CMS_PRODUCTION_HOSTNAME',
      ),
    true,
    'CMS proxy must be production-only and validate repository write access',
  )
  assert.equal(
    appOAuth.includes('data.access_token.startsWith("ghu_")') &&
      appOAuth.includes('data.scope === ""') &&
      appOAuth.includes('url.searchParams.set("code_challenge"') &&
      appOAuth.includes('code_verifier: codeVerifier') &&
      appOAuth.includes('repository_id: String(GITHUB_REPOSITORY_ID)') &&
      appOAuth.includes('/user/installations/${installationId}/repositories') &&
      appOAuth.includes('event.origin !== openerOrigin') &&
      !appOAuth.includes('postMessage(probe, "*")'),
    true,
    'CMS auth must require an expiring GitHub App token and exact opener origin',
  )
  assert.equal(
    configFunction.includes('$1${origin}/admin/api/github') &&
      configFunction.includes('$1${origin}/admin/api/graphql'),
    true,
    'CMS runtime config must use the deployment origin proxy',
  )
  assert.equal(
    adminIndex.includes('src="/admin/runtime-config.js"') &&
      adminIndex.includes('src="/admin/init.js"') &&
      adminIndex.includes('href="/admin/cms-notice.css"') &&
      adminInit.includes('保存すると自動で公開されます') &&
      adminInit.includes('保存後、Cloudflare Pagesに反映されます') &&
      adminInit.includes('画像の削除は参照確認を伴うPull Request') &&
      adminInit.includes('公開方法の案内を閉じる'),
    true,
    'CMS manual initialization and publish notice are required',
  )
  assert.deepEqual(
    cmsFiles,
    expectedCmsFiles,
    'CMS fixed-file allowlist changed unexpectedly',
  )
  assert.deepEqual(
    cmsFolders,
    expectedCmsFolders,
    'CMS folder allowlist changed unexpectedly',
  )

  for (const contentPath of [...cmsFiles, ...cmsFolders]) {
    assert.equal(
      existsSync(join(root, contentPath)),
      true,
      `${contentPath}: CMS content path missing`,
    )
  }
}

validateCmsConfig()
assert.deepEqual(
  validateSystemsContentFiles(
    new Map(
      cmsJsonPaths.map((contentPath) => [contentPath, readJson(contentPath)]),
    ),
  ),
  [],
  'CMS direct publish validator and CI content rules must agree',
)

const serviceSources = [
  {
    route: '/services/development/',
    page: 'src/pages/services/development.astro',
    data: 'src/data/service-details/development.json',
  },
  {
    route: '/services/site-functions/',
    page: 'src/pages/services/site-functions.astro',
    data: 'src/data/service-details/site-functions.json',
  },
  {
    route: '/services/site-quality/',
    page: 'src/pages/services/site-quality.astro',
    data: 'src/data/service-details/site-quality.json',
  },
  {
    route: '/services/operations/',
    page: 'src/pages/services/operations.astro',
    data: 'src/data/service-details/operations.json',
  },
]
const advisorSource = {
  route: '/services/it-advisor/',
  page: 'src/pages/services/it-advisor.astro',
  data: 'src/data/it-advisor.json',
}
const workSources = [
  {
    route: '/works/acecore-site-platform/',
    page: 'src/pages/works/acecore-site-platform.astro',
    data: 'src/data/work-details/acecore-site-platform.json',
  },
]
const migratedTechnicalArticles = insightSlugs.map(
  (slug) => `/insights/${slug}/`,
)
const requiredServiceTechnicalArticles = [
  '/insights/astro-accessibility-guide/',
  '/insights/astro-ai-contact-chat/',
  '/insights/astro-cloudflare-site-architecture/',
  '/insights/astro-i18n-blog-translation/',
  '/insights/astro-performance-tuning/',
  '/insights/astro-seo-and-structured-data/',
  '/insights/astro-ux-and-code-quality/',
  '/insights/cloudflare-only-blog-comments/',
  '/insights/cloudflare-pages-security/',
  '/insights/cms-selection-and-turnstile/',
  '/insights/copilot-translation-pipeline/',
  '/insights/service-cta-contact-prefill/',
]
const pricing = readJson('src/data/pricing.json')
const pricingKeys = new Map()

for (const item of pricing.items) {
  requireText(item.key, 'src/data/pricing.json: item key')
  requireText(item.label, `src/data/pricing.json: ${item.key} label`)
  requireText(item.price, `src/data/pricing.json: ${item.key} price`)
  assert.equal(
    pricingKeys.has(item.key),
    false,
    `src/data/pricing.json: duplicate pricing key ${item.key}`,
  )
  pricingKeys.set(item.key, item)
}

const serviceAnchors = new Map()
const serviceDataByRoute = new Map()
const technicalResources = new Set()

for (const source of serviceSources) {
  assert.equal(
    existsSync(join(root, source.page)),
    true,
    `${source.page} missing`,
  )
  const data = readJson(source.data)
  serviceDataByRoute.set(source.route, data)
  requireText(data.title, `${source.data}: title`)
  requireText(data.description, `${source.data}: description`)
  assert.equal(data.challenges.length > 0, true, `${source.data}: challenges`)
  assert.equal(data.offerings.length > 0, true, `${source.data}: offerings`)
  assert.equal(data.process.length > 0, true, `${source.data}: process`)
  assert.equal(data.resources.length > 0, true, `${source.data}: resources`)
  validateVisual(data.visual, `${source.data}: visual`)
  validateSectionVisuals(data.sectionVisuals, `${source.data}: sectionVisuals`)
  if (data.handoff) {
    validateHandoff(data.handoff, `${source.data}: handoff`)
  }

  const ids = data.offerings.map((offering) => offering.id)
  assert.equal(
    new Set(ids).size,
    ids.length,
    `${source.data}: duplicate offering id`,
  )
  serviceAnchors.set(source.route, new Set(ids))

  for (const offering of data.offerings) {
    assert.equal(
      Array.isArray(offering.pricingKeys) && offering.pricingKeys.length > 0,
      true,
      `${source.data}: ${offering.id} requires pricingKeys`,
    )
    assert.equal(
      new Set(offering.pricingKeys).size,
      offering.pricingKeys.length,
      `${source.data}: ${offering.id} has duplicate pricingKeys`,
    )
    for (const key of offering.pricingKeys) {
      assert.equal(
        pricingKeys.has(key),
        true,
        `${source.data}: ${offering.id} references unknown pricing key ${key}`,
      )
    }
    if (source.route === '/services/development/') {
      assert.deepEqual(
        offering.pricingKeys,
        [offering.id],
        `${source.data}: ${offering.id} must map to one matching use-case price`,
      )
    }
  }

  for (const resource of data.resources) {
    assert.match(
      resource.href,
      /^\/insights\/[a-z0-9-]+\/$/,
      `${resource.href}: technical resources must use a canonical Insights route`,
    )
    assert.equal(
      migratedTechnicalArticles.includes(resource.href),
      true,
      `${resource.href}: technical resource has no migrated article`,
    )
    technicalResources.add(resource.href)
  }
}

assert.equal(
  existsSync(join(root, advisorSource.page)),
  true,
  `${advisorSource.page} missing`,
)
const advisor = readJson(advisorSource.data)
requireText(advisor.title, `${advisorSource.data}: title`)
requireText(advisor.description, `${advisorSource.data}: description`)
validateVisual(advisor.visual, `${advisorSource.data}: visual`)
validateSectionVisuals(
  advisor.sectionVisuals,
  `${advisorSource.data}: sectionVisuals`,
)
requireText(advisor.indexSummary, `${advisorSource.data}: indexSummary`)
assert.equal(
  advisor.indexTopics.length > 0,
  true,
  `${advisorSource.data}: indexTopics`,
)
assert.equal(
  advisor.challenges.length > 0,
  true,
  `${advisorSource.data}: challenges`,
)
assert.equal(
  advisor.supportAreas.length > 0,
  true,
  `${advisorSource.data}: supportAreas`,
)
assert.equal(
  advisor.useCases.length > 0,
  true,
  `${advisorSource.data}: useCases`,
)
assert.equal(
  advisor.pricingSummaries.length === 2,
  true,
  `${advisorSource.data}: pricingSummaries must contain retainer and spot`,
)
assert.equal(advisor.plans.length > 0, true, `${advisorSource.data}: plans`)
assert.equal(advisor.process.length > 0, true, `${advisorSource.data}: process`)
assert.equal(
  advisor.governance.length > 0,
  true,
  `${advisorSource.data}: governance`,
)
assert.equal(
  advisor.excluded.length > 0,
  true,
  `${advisorSource.data}: excluded`,
)
assert.equal(advisor.faqs.length > 0, true, `${advisorSource.data}: faqs`)
validateHandoff(advisor.handoff, `${advisorSource.data}: handoff`)

assert.deepEqual(
  new Set(advisor.pricingSummaries.map((item) => item.id)),
  new Set(['retainer', 'spot']),
  `${advisorSource.data}: pricingSummaries must use retainer and spot`,
)
for (const [index, item] of advisor.pricingSummaries.entries()) {
  requireText(
    item.label,
    `${advisorSource.data}: pricingSummaries[${index}].label`,
  )
  requireText(
    item.pricingKey,
    `${advisorSource.data}: pricingSummaries[${index}].pricingKey`,
  )
  requireText(
    item.note,
    `${advisorSource.data}: pricingSummaries[${index}].note`,
  )
}
assert.deepEqual(
  new Set(advisor.plans.map((item) => item.id)),
  new Set(['retainer', 'spot']),
  `${advisorSource.data}: plans must use retainer and spot`,
)

const advisorAnchors = [
  ...advisor.supportAreas.map((item) => item.id),
  ...advisor.plans.map((item) => item.id),
]
assert.equal(
  new Set(advisorAnchors).size,
  advisorAnchors.length,
  `${advisorSource.data}: duplicate anchor id`,
)
serviceAnchors.set(advisorSource.route, new Set(advisorAnchors))

for (const [index, item] of advisor.supportAreas.entries()) {
  requireText(item.id, `${advisorSource.data}: supportAreas[${index}].id`)
  requireText(item.title, `${advisorSource.data}: supportAreas[${index}].title`)
  requireText(item.body, `${advisorSource.data}: supportAreas[${index}].body`)
  assert.equal(
    item.includes.length > 0,
    true,
    `${advisorSource.data}: supportAreas[${index}].includes`,
  )
}
for (const [index, item] of advisor.plans.entries()) {
  requireText(item.title, `${advisorSource.data}: plans[${index}].title`)
  requireText(item.boundary, `${advisorSource.data}: plans[${index}].boundary`)
  assert.equal(
    item.includes.length > 0,
    true,
    `${advisorSource.data}: plans[${index}].includes`,
  )
}
for (const [index, faq] of advisor.faqs.entries()) {
  requireText(faq.question, `${advisorSource.data}: faqs[${index}].question`)
  requireText(faq.answer, `${advisorSource.data}: faqs[${index}].answer`)
}

const advisorPricingKeys = [
  ...advisor.pricingSummaries.map((item) => item.pricingKey),
  ...advisor.plans.map((item) => item.pricingKey),
]
for (const key of advisorPricingKeys) {
  assert.equal(
    pricingKeys.has(key),
    true,
    `${advisorSource.data}: unknown pricing key ${key}`,
  )
}
const cmsConfig = readFileSync(join(root, 'public/admin/config.yml'), 'utf8')
assert.equal(
  cmsConfig.includes('file: src/data/it-advisor.json'),
  true,
  'public/admin/config.yml: IT advisor data file missing',
)

const author = readJson('src/content/authors/gui.json')
assert.equal(author.id, 'gui', 'Insights author id must remain gui')
requireText(author.name, 'src/content/authors/gui.json: name')

for (const article of migratedTechnicalArticles) {
  const slug = article.split('/').filter(Boolean).at(-1)
  const sourcePath = `src/content/insights/${slug}.md`
  assert.equal(
    existsSync(join(root, sourcePath)),
    true,
    `${sourcePath} missing`,
  )
  const source = readText(sourcePath)
  assert.match(
    source,
    /^author:\s*gui\s*$/m,
    `${sourcePath}: original author must remain gui`,
  )
  assert.equal(
    resolveInsightHref(`/blog/${slug}/`),
    article,
    `${sourcePath}: legacy relative URL must resolve to Insights`,
  )
  assert.equal(
    resolveInsightHref(`https://acecore.net/blog/${slug}/`),
    article,
    `${sourcePath}: legacy absolute URL must resolve to Insights`,
  )

  const frontmatter = source.split(/^---\s*$/m)[1] ?? ''
  for (const match of frontmatter.matchAll(
    /^(?:image|uploadedImage):\s*(.+?)\s*$/gm,
  )) {
    const image = match[1].replace(/^(['"])(.*)\1$/, '$2')
    if (/^https:\/\//i.test(image)) {
      assert.equal(
        new URL(image).protocol,
        'https:',
        `${sourcePath}: article image must use HTTPS`,
      )
    } else {
      validateImageAsset(image, `${sourcePath}: article image`)
    }
  }

  for (const match of source.matchAll(
    /!\[[^\]]*\]\((\/(?:images|uploads)\/[^)\s]+)\)/g,
  )) {
    validateImageAsset(match[1], `${sourcePath}: Markdown image`)
  }

  const legacyLinks = [
    ...source.matchAll(/\]\(((?:https:\/\/acecore\.net)?\/blog\/[^)\s]+)\)/g),
    ...frontmatter.matchAll(
      /^\s*-\s+href:\s*((?:https:\/\/acecore\.net)?\/blog\/\S+)\s*$/gm,
    ),
  ]
  for (const match of legacyLinks) {
    const resolved = resolveInsightHref(match[1])
    assert.match(
      resolved,
      /^(?:\/insights\/|https:\/\/acecore\.net\/blog\/)/,
      `${sourcePath}: ${match[1]} cannot be resolved`,
    )
  }
}

for (const article of requiredServiceTechnicalArticles) {
  assert.equal(
    technicalResources.has(article),
    true,
    `${article}: missing from service technical resources`,
  )
}

for (const source of workSources) {
  assert.equal(
    existsSync(join(root, source.page)),
    true,
    `${source.page} missing`,
  )
  const data = readJson(source.data)
  requireText(data.title, `${source.data}: title`)
  requireText(data.description, `${source.data}: description`)
  assert.equal(data.story.length > 0, true, `${source.data}: story`)
  assert.equal(data.outcomes.length > 0, true, `${source.data}: outcomes`)
  for (const field of ['visual', 'outcomesVisual', 'scopeVisual']) {
    validateVisual(data[field], `${source.data}: ${field}`)
  }
  for (const [index, outcome] of data.outcomes.entries()) {
    requireText(outcome.label, `${source.data}: outcomes[${index}].label`)
    requireText(outcome.body, `${source.data}: outcomes[${index}].body`)
  }
  assert.equal(data.scope.length > 0, true, `${source.data}: scope`)
  assert.equal(data.resources.length > 0, true, `${source.data}: resources`)
  for (const [index, resource] of data.resources.entries()) {
    requireText(resource.title, `${source.data}: resources[${index}].title`)
    assert.equal(
      migratedTechnicalArticles.includes(resource.href),
      true,
      `${source.data}: ${resource.href} has no migrated article`,
    )
  }
}

const knownRoutes = new Set([
  advisorSource.route,
  ...serviceSources.map((source) => source.route),
  ...workSources.map((source) => source.route),
])
const services = readJson('src/data/services.json')
const works = readJson('src/data/works.json')
const guide = readJson('src/data/guide.json')
validateVisual(guide.visual, 'src/data/guide.json: visual')
requireText(guide.journeyTitle, 'src/data/guide.json: journeyTitle')
requireText(guide.journeyLead, 'src/data/guide.json: journeyLead')
assert.equal(
  Array.isArray(guide.journey),
  true,
  'src/data/guide.json: journey must be an array',
)
const guideJourney = Array.isArray(guide.journey) ? guide.journey : []
assert.equal(
  guideJourney.length,
  4,
  'src/data/guide.json: journey must contain four steps',
)
for (const [index, step] of guideJourney.entries()) {
  requireText(step.title, `src/data/guide.json: journey[${index}].title`)
  requireText(step.body, `src/data/guide.json: journey[${index}].body`)
}
assert.deepEqual(
  new Set(services.entryPoints.map((item) => item.id)),
  new Set(['development', 'it-advisor']),
  'src/data/services.json: entryPoints must separate development and IT advisor',
)
for (const [index, entryPoint] of services.entryPoints.entries()) {
  for (const field of ['eyebrow', 'title', 'body', 'href', 'label']) {
    requireText(
      entryPoint[field],
      `src/data/services.json: entryPoints[${index}].${field}`,
    )
  }
  assert.equal(
    knownRoutes.has(entryPoint.href),
    true,
    `src/data/services.json: unknown entry point ${entryPoint.href}`,
  )
}

const development = serviceDataByRoute.get('/services/development/')
assert.ok(development, 'development service data missing')
assert.equal(
  development.handoff.href,
  advisorSource.route,
  'development handoff must target IT advisor',
)
assert.equal(
  advisor.handoff.href,
  '/services/development/',
  'IT advisor handoff must target development',
)

for (const item of [...services.services, ...works.cases]) {
  if (item.detailUrl) {
    assert.equal(
      knownRoutes.has(item.detailUrl),
      true,
      `${item.detailUrl}: unknown detail route`,
    )
  }
}

for (const [index, work] of works.cases.entries()) {
  validateImageAsset(work.image, `src/data/works.json: cases[${index}].image`)
  requireText(work.imageAlt, `src/data/works.json: cases[${index}].imageAlt`)
  if (!work.externalUrl) continue
  requireText(
    work.externalLabel,
    `src/data/works.json: cases[${index}].externalLabel`,
  )
  if (work.externalUrl.startsWith('/')) {
    assert.equal(
      work.externalUrl,
      '/insights/',
      `${work.externalUrl}: unknown internal work link`,
    )
    continue
  }
  const externalUrl = new URL(work.externalUrl)
  assert.equal(
    externalUrl.protocol,
    'https:',
    `${work.externalUrl}: HTTPS required`,
  )
}

for (const item of pricing.items) {
  if (!item.detailUrl?.startsWith('/services/')) continue
  const url = new URL(item.detailUrl, 'https://systems.acecore.net')
  const anchors = serviceAnchors.get(url.pathname)
  assert.ok(anchors, `${item.detailUrl}: unknown service route`)
  assert.equal(
    anchors.has(url.hash.slice(1)),
    true,
    `${item.detailUrl}: unknown offering anchor`,
  )
}

console.log(
  `content validation passed: ${serviceSources.length + 1} services, ${workSources.length} work`,
)
