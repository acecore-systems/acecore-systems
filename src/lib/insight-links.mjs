export const insightSlugs = Object.freeze([
  "acecore-systems-site-renewal",
  "ai-chat-markdown-link-safety",
  "ai-monkey-testing-methodology",
  "astro-accessibility-guide",
  "astro-ai-contact-chat",
  "astro-cloudflare-site-architecture",
  "astro-i18n-blog-translation",
  "astro-performance-tuning",
  "astro-seo-and-structured-data",
  "astro-ux-and-code-quality",
  "cloudflare-only-blog-comments",
  "cloudflare-pages-security",
  "cloudflare-ssl-advanced-certificate-manager",
  "cloudflare-vectorize-implementation-guide",
  "cloudflare-vectorize-safe-implementation",
  "cms-selection-and-turnstile",
  "copilot-translation-pipeline",
  "hatt-homepage-launch",
  "homepage-production-cost-guide",
  "service-cta-contact-prefill",
  "tax-return-with-copilot",
  "vitepress-to-starlight-migration",
  "website-improvement-batches",
  "website-improvement-final-batch",
  "zoho-to-kagoya-mail-migration",
]);

const insightSlugSet = new Set(insightSlugs);
const supportedLocales = Object.freeze([
  "ja",
  "en",
  "zh-cn",
  "es",
  "pt",
  "fr",
  "ko",
  "de",
  "ru",
]);
const nonDefaultLocaleSet = new Set(supportedLocales.slice(1));
const localizedContentId = /^(en|zh-cn|es|pt|fr|ko|de|ru)\/([^/]+?)(?:\.md)?$/;
const insightUrl =
  /^(?:(https:\/\/(?:www\.)?(?:acecore\.net|systems\.acecore\.net))?)\/(?:(ja|en|zh-cn|es|pt|fr|ko|de|ru)\/)?(?:blog|insights)\/([^/?#]+)\/?([?#].*)?$/;
const systemsOrigin = "https://systems.acecore.net";
const systemsPagePath =
  /^\/(?:services(?:\/(?:development|it-advisor|operations|site-functions|site-quality))?|pricing|guide|works(?:\/acecore-site-platform)?|contact(?:\/thanks)?|privacy)\/?$/u;

export function getInsightSlug(id) {
  const normalized = id.replace(/\.md$/i, "");
  return normalized.match(localizedContentId)?.[2] ?? normalized;
}

export function getInsightLocale(id) {
  return id.replace(/\.md$/i, "").match(localizedContentId)?.[1] ?? "ja";
}

export function isInsightForLocale(entry, locale) {
  return getInsightLocale(entry.id) === locale;
}

export function getLocalizedInsightHref(slug, locale, suffix = "") {
  const prefix = locale === "ja" ? "" : `/${locale}`;
  return `${prefix}/insights/${slug}/${suffix}`;
}

export function resolveInsightHref(href, locale = "ja") {
  const match = href.match(insightUrl);
  if (match) {
    const [, origin = "", sourceLocale = "", slug, suffix = ""] = match;
    if (insightSlugSet.has(slug)) {
      return getLocalizedInsightHref(slug, locale, suffix);
    }

    if (origin.includes("systems.acecore.net")) return href;

    const legacyPrefix =
      sourceLocale &&
      sourceLocale !== "ja" &&
      nonDefaultLocaleSet.has(sourceLocale)
        ? `/${sourceLocale}`
        : "";
    return `https://acecore.net${legacyPrefix}/blog/${slug}/${suffix}`;
  }

  const isAbsoluteSystemsUrl = href.startsWith(`${systemsOrigin}/`);
  if (!isAbsoluteSystemsUrl && !href.startsWith("/")) return href;

  const url = new URL(href, systemsOrigin);
  if (url.origin !== systemsOrigin) return href;

  const segments = url.pathname.split("/").filter(Boolean);
  if (segments[0] && nonDefaultLocaleSet.has(segments[0])) {
    segments.shift();
  } else if (segments[0] === "ja") {
    segments.shift();
  }

  const unprefixedPath = `/${segments.join("/")}${
    url.pathname.endsWith("/") && segments.length > 0 ? "/" : ""
  }`;
  if (unprefixedPath !== "/" && !systemsPagePath.test(unprefixedPath)) {
    return href;
  }

  if (unprefixedPath === "/services/" && url.hash === "#web") {
    url.hash = "#web-app";
  }

  const prefix = locale === "ja" ? "" : `/${locale}`;
  const localizedPath =
    unprefixedPath === "/" ? `${prefix}/` || "/" : `${prefix}${unprefixedPath}`;
  return `${localizedPath}${url.search}${url.hash}`;
}

function getLocaleFromFileUrl(fileURL) {
  if (!fileURL) return "ja";
  const path = decodeURIComponent(fileURL.pathname).replaceAll("\\", "/");
  const match = path.match(
    /\/src\/content\/insights\/(en|zh-cn|es|pt|fr|ko|de|ru)\//,
  );
  return match?.[1] ?? "ja";
}

export const insightLinksPlugin = Object.freeze({
  name: "resolve-insight-links",
  link(node, context) {
    if (typeof node.url !== "string") return;

    const resolvedUrl = resolveInsightHref(
      node.url,
      getLocaleFromFileUrl(context.fileURL),
    );
    if (resolvedUrl === node.url) return;

    context.replaceNode(node, { ...node, url: resolvedUrl });
  },
});
