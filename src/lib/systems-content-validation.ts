const SERVICE_PATHS = [
  'src/data/service-details/development.json',
  'src/data/service-details/site-functions.json',
  'src/data/service-details/site-quality.json',
  'src/data/service-details/operations.json',
] as const

const WORK_PATHS = ['src/data/work-details/acecore-site-platform.json'] as const

const ADVISOR_PATH = 'src/data/it-advisor.json'
const PRICING_PATH = 'src/data/pricing.json'
const SERVICES_PATH = 'src/data/services.json'
const WORKS_PATH = 'src/data/works.json'
const GUIDE_PATH = 'src/data/guide.json'

const SERVICE_ROUTES = new Map([
  [SERVICE_PATHS[0], '/services/development/'],
  [SERVICE_PATHS[1], '/services/site-functions/'],
  [SERVICE_PATHS[2], '/services/site-quality/'],
  [SERVICE_PATHS[3], '/services/operations/'],
  [ADVISOR_PATH, '/services/it-advisor/'],
])

const WORK_ROUTES = new Map([[WORK_PATHS[0], '/works/acecore-site-platform/']])

const MIGRATED_TECHNICAL_ARTICLES = new Set([
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
])

export function validateSystemsContentFiles(
  files: ReadonlyMap<string, unknown>,
) {
  const errors: string[] = []
  const pricingKeys = new Set<string>()
  const pricingItems = getArray(files.get(PRICING_PATH), 'items')

  if (!pricingItems) {
    errors.push(`${PRICING_PATH}.items: 配列が必要です。`)
  } else {
    pricingItems.forEach((value, index) => {
      const scope = `${PRICING_PATH}.items[${index}]`
      const item = asRecord(value)

      if (!item) {
        errors.push(`${scope}: objectが必要です。`)
        return
      }

      const key = requireText(item.key, `${scope}.key`, errors)
      requireText(item.label, `${scope}.label`, errors)
      requireText(item.price, `${scope}.price`, errors)

      if (key) {
        if (pricingKeys.has(key)) {
          errors.push(`${scope}.key: 重複しています。`)
        }
        pricingKeys.add(key)
      }
    })
  }

  const routeAnchors = new Map<string, Set<string>>()
  const technicalResources = new Set<string>()

  for (const path of SERVICE_PATHS) {
    const data = asRecord(files.get(path))

    if (!data) {
      errors.push(`${path}: objectが必要です。`)
      continue
    }

    requireText(data.title, `${path}.title`, errors)
    requireText(data.description, `${path}.description`, errors)
    const challenges = requireNonEmptyArray(
      data.challenges,
      `${path}.challenges`,
      errors,
    )
    const offerings = requireNonEmptyArray(
      data.offerings,
      `${path}.offerings`,
      errors,
    )
    requireNonEmptyArray(data.process, `${path}.process`, errors)
    const resources = requireNonEmptyArray(
      data.resources,
      `${path}.resources`,
      errors,
    )
    void challenges

    validateVisual(data.visual, `${path}.visual`, errors)
    validateSectionVisuals(
      data.sectionVisuals,
      `${path}.sectionVisuals`,
      errors,
    )

    const anchors = new Set<string>()

    for (const [index, value] of offerings.entries()) {
      const scope = `${path}.offerings[${index}]`
      const offering = asRecord(value)

      if (!offering) {
        errors.push(`${scope}: objectが必要です。`)
        continue
      }

      const id = requireText(offering.id, `${scope}.id`, errors)

      if (id) {
        if (anchors.has(id)) errors.push(`${scope}.id: 重複しています。`)
        anchors.add(id)
      }

      const keys = requireNonEmptyArray(
        offering.pricingKeys,
        `${scope}.pricingKeys`,
        errors,
      )
      const localKeys = new Set<string>()

      for (const [keyIndex, key] of keys.entries()) {
        if (typeof key !== 'string' || key.trim() === '') {
          errors.push(`${scope}.pricingKeys[${keyIndex}]: 文字列が必要です。`)
          continue
        }

        if (localKeys.has(key)) {
          errors.push(`${scope}.pricingKeys[${keyIndex}]: 重複しています。`)
        }
        localKeys.add(key)

        if (!pricingKeys.has(key)) {
          errors.push(`${scope}.pricingKeys[${keyIndex}]: 未知の料金keyです。`)
        }
      }
    }

    const route = SERVICE_ROUTES.get(path)
    if (route) routeAnchors.set(route, anchors)

    for (const [index, value] of resources.entries()) {
      const resource = asRecord(value)
      const scope = `${path}.resources[${index}].href`
      const href = resource ? requireText(resource.href, scope, errors) : null

      if (href && MIGRATED_TECHNICAL_ARTICLES.has(href)) {
        technicalResources.add(href)
      } else if (href) {
        errors.push(`${scope}: 移管済みInsights URLが必要です。`)
      }
    }
  }

  validateAdvisor(files.get(ADVISOR_PATH), pricingKeys, routeAnchors, errors)

  for (const article of MIGRATED_TECHNICAL_ARTICLES) {
    if (!technicalResources.has(article)) {
      errors.push(`service resources: ${article} が必要です。`)
    }
  }

  for (const path of WORK_PATHS) {
    const data = asRecord(files.get(path))

    if (!data) {
      errors.push(`${path}: objectが必要です。`)
      continue
    }

    requireText(data.title, `${path}.title`, errors)
    requireText(data.description, `${path}.description`, errors)
    for (const field of ['visual', 'outcomesVisual', 'scopeVisual'] as const) {
      validateVisual(data[field], `${path}.${field}`, errors)
    }
    requireNonEmptyArray(data.story, `${path}.story`, errors)
    const outcomes = requireNonEmptyArray(
      data.outcomes,
      `${path}.outcomes`,
      errors,
    )
    requireNonEmptyArray(data.scope, `${path}.scope`, errors)
    const resources = requireNonEmptyArray(
      data.resources,
      `${path}.resources`,
      errors,
    )

    outcomes.forEach((value, index) => {
      const outcome = asRecord(value)
      const scope = `${path}.outcomes[${index}]`

      if (!outcome) {
        errors.push(`${scope}: objectが必要です。`)
        return
      }

      requireText(outcome.label, `${scope}.label`, errors)
      requireText(outcome.body, `${scope}.body`, errors)
    })

    resources.forEach((value, index) => {
      const resource = asRecord(value)
      const href = resource
        ? requireText(resource.href, `${path}.resources[${index}].href`, errors)
        : null

      if (href && !MIGRATED_TECHNICAL_ARTICLES.has(href)) {
        errors.push(
          `${path}.resources[${index}].href: 移管済みInsights URLが必要です。`,
        )
      }
    })
  }

  validateGuide(files.get(GUIDE_PATH), errors)
  validateIndexLinks(files, routeAnchors, pricingItems ?? [], errors)

  return errors
}

function validateGuide(value: unknown, errors: string[]) {
  const data = asRecord(value)

  if (!data) {
    errors.push(`${GUIDE_PATH}: objectが必要です。`)
    return
  }

  validateVisual(data.visual, `${GUIDE_PATH}.visual`, errors)
  requireText(data.journeyTitle, `${GUIDE_PATH}.journeyTitle`, errors)
  requireText(data.journeyLead, `${GUIDE_PATH}.journeyLead`, errors)
  const journey = requireNonEmptyArray(
    data.journey,
    `${GUIDE_PATH}.journey`,
    errors,
  )

  if (journey.length !== 4) {
    errors.push(`${GUIDE_PATH}.journey: 4件必要です。`)
  }

  journey.forEach((value, index) => {
    const step = asRecord(value)
    const scope = `${GUIDE_PATH}.journey[${index}]`

    if (!step) {
      errors.push(`${scope}: objectが必要です。`)
      return
    }

    requireText(step.title, `${scope}.title`, errors)
    requireText(step.body, `${scope}.body`, errors)
  })
}

function validateAdvisor(
  value: unknown,
  pricingKeys: ReadonlySet<string>,
  routeAnchors: Map<string, Set<string>>,
  errors: string[],
) {
  const data = asRecord(value)

  if (!data) {
    errors.push(`${ADVISOR_PATH}: objectが必要です。`)
    return
  }

  for (const key of ['title', 'description', 'indexSummary'] as const) {
    requireText(data[key], `${ADVISOR_PATH}.${key}`, errors)
  }
  validateVisual(data.visual, `${ADVISOR_PATH}.visual`, errors)
  validateSectionVisuals(
    data.sectionVisuals,
    `${ADVISOR_PATH}.sectionVisuals`,
    errors,
  )

  const requiredArrays = [
    'indexTopics',
    'challenges',
    'supportAreas',
    'useCases',
    'pricingSummaries',
    'plans',
    'process',
    'governance',
    'excluded',
    'faqs',
  ] as const
  const arrays = new Map<string, unknown[]>()

  for (const key of requiredArrays) {
    arrays.set(
      key,
      requireNonEmptyArray(data[key], `${ADVISOR_PATH}.${key}`, errors),
    )
  }

  const anchors = new Set<string>()

  for (const key of ['supportAreas', 'plans'] as const) {
    arrays.get(key)?.forEach((entry, index) => {
      const item = asRecord(entry)
      const id =
        item && typeof item.id === 'string' && item.id.trim() !== ''
          ? item.id
          : null

      if (key === 'supportAreas' && !id) {
        errors.push(`${ADVISOR_PATH}.${key}[${index}].id: 必須です。`)
      }

      if (id) {
        if (anchors.has(id)) {
          errors.push(`${ADVISOR_PATH}.${key}[${index}].id: 重複しています。`)
        }
        anchors.add(id)
      }
    })
  }

  routeAnchors.set('/services/it-advisor/', anchors)

  arrays.get('supportAreas')?.forEach((entry, index) => {
    const item = asRecord(entry)
    const scope = `${ADVISOR_PATH}.supportAreas[${index}]`

    if (!item) return
    requireText(item.title, `${scope}.title`, errors)
    requireText(item.body, `${scope}.body`, errors)
    requireNonEmptyArray(item.includes, `${scope}.includes`, errors)
  })

  arrays.get('plans')?.forEach((entry, index) => {
    const item = asRecord(entry)
    const scope = `${ADVISOR_PATH}.plans[${index}]`

    if (!item) return
    requireText(item.title, `${scope}.title`, errors)
    requireText(item.boundary, `${scope}.boundary`, errors)
    requireNonEmptyArray(item.includes, `${scope}.includes`, errors)
  })

  arrays.get('pricingSummaries')?.forEach((entry, index) => {
    const item = asRecord(entry)
    const scope = `${ADVISOR_PATH}.pricingSummaries[${index}]`

    if (!item) return
    requireText(item.id, `${scope}.id`, errors)
    requireText(item.label, `${scope}.label`, errors)
    requireText(item.note, `${scope}.note`, errors)
  })

  arrays.get('faqs')?.forEach((entry, index) => {
    const item = asRecord(entry)
    const scope = `${ADVISOR_PATH}.faqs[${index}]`

    if (!item) return
    requireText(item.question, `${scope}.question`, errors)
    requireText(item.answer, `${scope}.answer`, errors)
  })

  const advisorPricingKeys = [
    ...(arrays.get('pricingSummaries') ?? []).map(
      (entry) => asRecord(entry)?.pricingKey,
    ),
    ...(arrays.get('plans') ?? []).map((entry) => asRecord(entry)?.pricingKey),
  ]

  advisorPricingKeys.forEach((key, index) => {
    if (typeof key !== 'string' || !pricingKeys.has(key)) {
      errors.push(
        `${ADVISOR_PATH}.pricingReferences[${index}]: 未知の料金keyです。`,
      )
    }
  })
}

function validateIndexLinks(
  files: ReadonlyMap<string, unknown>,
  routeAnchors: ReadonlyMap<string, Set<string>>,
  pricingItems: unknown[],
  errors: string[],
) {
  const knownRoutes = new Set([
    ...SERVICE_ROUTES.values(),
    ...WORK_ROUTES.values(),
  ])
  const services = getArray(files.get(SERVICES_PATH), 'services') ?? []
  const works = getArray(files.get(WORKS_PATH), 'cases') ?? []

  for (const [index, value] of [...services, ...works].entries()) {
    const item = asRecord(value)
    if (!item || item.detailUrl === undefined || item.detailUrl === '') continue

    if (
      typeof item.detailUrl !== 'string' ||
      !knownRoutes.has(item.detailUrl)
    ) {
      errors.push(`indexItems[${index}].detailUrl: 未知のrouteです。`)
    }
  }

  works.forEach((value, index) => {
    const item = asRecord(value)
    if (!item) return

    const image = requireText(
      item.image,
      `${WORKS_PATH}.cases[${index}].image`,
      errors,
    )
    requireText(item.imageAlt, `${WORKS_PATH}.cases[${index}].imageAlt`, errors)
    if (
      image &&
      !/^\/(?:images\/works|uploads)\/.+\.(?:avif|jpe?g|png|webp)$/iu.test(
        image,
      )
    ) {
      errors.push(
        `${WORKS_PATH}.cases[${index}].image: public image pathが必要です。`,
      )
    }

    if (!item.externalUrl) return

    requireText(
      item.externalLabel,
      `${WORKS_PATH}.cases[${index}].externalLabel`,
      errors,
    )

    if (
      typeof item.externalUrl !== 'string' ||
      (item.externalUrl !== '/insights/' && !isHttpsUrl(item.externalUrl))
    ) {
      errors.push(
        `${WORKS_PATH}.cases[${index}].externalUrl: HTTPSまたはInsights URLが必要です。`,
      )
    }
  })

  pricingItems.forEach((value, index) => {
    const item = asRecord(value)
    if (
      !item ||
      typeof item.detailUrl !== 'string' ||
      !item.detailUrl.startsWith('/services/')
    ) {
      return
    }

    let url: URL

    try {
      url = new URL(item.detailUrl, 'https://systems.acecore.net')
    } catch {
      errors.push(`${PRICING_PATH}.items[${index}].detailUrl: URLが不正です。`)
      return
    }

    const anchors = routeAnchors.get(url.pathname)

    if (!anchors || !anchors.has(url.hash.slice(1))) {
      errors.push(
        `${PRICING_PATH}.items[${index}].detailUrl: 未知のservice anchorです。`,
      )
    }
  })
}

function requireNonEmptyArray(value: unknown, scope: string, errors: string[]) {
  if (!Array.isArray(value) || value.length === 0) {
    errors.push(`${scope}: 1件以上必要です。`)
    return []
  }

  return value
}

function requireText(value: unknown, scope: string, errors: string[]) {
  if (typeof value !== 'string' || value.trim() === '') {
    errors.push(`${scope}: 空でない文字列が必要です。`)
    return null
  }

  return value
}

function validateVisual(value: unknown, scope: string, errors: string[]) {
  const visual = asRecord(value)

  if (!visual) {
    errors.push(`${scope}: objectが必要です。`)
    return
  }

  const src = requireText(visual.src, `${scope}.src`, errors)
  requireText(visual.alt, `${scope}.alt`, errors)
  requireText(visual.caption, `${scope}.caption`, errors)

  if (
    src &&
    !/^\/(?:images|uploads)\/.+\.(?:avif|jpe?g|png|webp)$/iu.test(src)
  ) {
    errors.push(`${scope}.src: 公開画像pathが必要です。`)
  }
}

function validateSectionVisuals(
  value: unknown,
  scope: string,
  errors: string[],
) {
  const sectionVisuals = asRecord(value)

  if (!sectionVisuals) {
    errors.push(`${scope}: objectが必要です。`)
    return
  }

  for (const key of ['scope', 'process'] as const) {
    validateVisual(sectionVisuals[key], `${scope}.${key}`, errors)
  }
}

function getArray(value: unknown, key: string) {
  const record = asRecord(value)
  return record && Array.isArray(record[key]) ? record[key] : null
}

function isHttpsUrl(value: string) {
  try {
    const url = new URL(value)
    return url.protocol === 'https:'
  } catch {
    return false
  }
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null
}
