export const insightSlugs = Object.freeze([
  'ai-chat-markdown-link-safety',
  'ai-monkey-testing-methodology',
  'astro-accessibility-guide',
  'astro-ai-contact-chat',
  'astro-cloudflare-site-architecture',
  'astro-i18n-blog-translation',
  'astro-performance-tuning',
  'astro-seo-and-structured-data',
  'astro-ux-and-code-quality',
  'cloudflare-only-blog-comments',
  'cloudflare-pages-security',
  'cloudflare-ssl-advanced-certificate-manager',
  'cms-selection-and-turnstile',
  'copilot-translation-pipeline',
  'hatt-homepage-launch',
  'homepage-production-cost-guide',
  'service-cta-contact-prefill',
  'tax-return-with-copilot',
  'vitepress-to-starlight-migration',
  'website-improvement-batches',
  'website-improvement-final-batch',
  'zoho-to-kagoya-mail-migration',
])

const insightSlugSet = new Set(insightSlugs)
const legacyBlogUrl =
  /^(?:https:\/\/acecore\.net)?\/blog\/([^/?#]+)\/?([?#].*)?$/

export function getInsightSlug(id) {
  return id.replace(/\.md$/i, '')
}

export function resolveInsightHref(href) {
  const match = href.match(legacyBlogUrl)
  if (!match) return href

  const [, slug, suffix = ''] = match
  return insightSlugSet.has(slug)
    ? `/insights/${slug}/${suffix}`
    : `https://acecore.net/blog/${slug}/${suffix}`
}

export const insightLinksPlugin = Object.freeze({
  name: 'resolve-insight-links',
  link(node, context) {
    if (typeof node.url !== 'string') return

    const resolvedUrl = resolveInsightHref(node.url)
    if (resolvedUrl === node.url) return

    context.replaceNode(node, { ...node, url: resolvedUrl })
  },
})
