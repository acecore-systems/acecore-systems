import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { createHash } from "node:crypto";
import { dirname, extname, join } from "node:path";
import { fileURLToPath } from "node:url";

import {
  getLocalizedInsightHref,
  insightSlugs,
} from "../src/lib/insight-links.mjs";
import { contactFormCopy } from "../src/i18n/contact-form.ts";
import { ui } from "../src/i18n/ui.ts";
import { calculateTranslationSourceHash } from "./i18n-source-hash.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const siteOrigin = "https://systems.acecore.net";
const acecoreOrigin = "https://acecore.net";
const localizedExternalOrigins = new Set([
  acecoreOrigin,
  "https://asv.acecore.net",
]);
const locales = ["ja", "en", "zh-cn", "es", "pt", "fr", "ko", "de", "ru"];
const translatedLocales = locales.slice(1);
const htmlLanguages = {
  ja: "ja",
  en: "en",
  "zh-cn": "zh-CN",
  es: "es",
  pt: "pt",
  fr: "fr",
  ko: "ko",
  de: "de",
  ru: "ru",
};
const ogLocales = {
  ja: "ja_JP",
  en: "en_US",
  "zh-cn": "zh_CN",
  es: "es_ES",
  pt: "pt_BR",
  fr: "fr_FR",
  ko: "ko_KR",
  de: "de_DE",
  ru: "ru_RU",
};
const fixedRoutes = [
  "/",
  "/services/",
  "/services/development/",
  "/services/it-advisor/",
  "/services/operations/",
  "/services/site-functions/",
  "/services/site-quality/",
  "/pricing/",
  "/guide/",
  "/works/",
  "/works/acecore-site-platform/",
  "/contact/",
  "/contact/thanks/",
  "/privacy/",
];
const sourceFiles = {
  contact: "src/data/contact.json",
  guide: "src/data/guide.json",
  home: "src/data/home.json",
  itAdvisor: "src/data/it-advisor.json",
  pricing: "src/data/pricing.json",
  privacy: "src/data/privacy.json",
  serviceDetails: {
    development: "src/data/service-details/development.json",
    operations: "src/data/service-details/operations.json",
    siteFunctions: "src/data/service-details/site-functions.json",
    siteQuality: "src/data/service-details/site-quality.json",
  },
  services: "src/data/services.json",
  site: "src/data/site.json",
  workDetail: "src/data/work-details/acecore-site-platform.json",
  works: "src/data/works.json",
};
const stableKeys = new Set([
  "accent",
  "contactFormAction",
  "detailUrl",
  "email",
  "externalUrl",
  "ga4Id",
  "href",
  "icon",
  "id",
  "image",
  "key",
  "name",
  "number",
  "phone",
  "pricingKey",
  "pricingKeys",
  "primaryCtaHref",
  "secondaryCtaHref",
  "src",
  "turnstileSiteKey",
  "uploadedImage",
]);
const japaneseText = /[\p{Script=Hiragana}\p{Script=Katakana}々〆〤]/u;
const japaneseOrHanText =
  /[\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Han}々〆〤]/u;
const protectedTerms = [
  "Acecore",
  "Astro",
  "Cloudflare",
  "Cloudflare Pages",
  "GitHub",
  "GitHub Actions",
  "Pagefind",
  "Sveltia CMS",
  "Turnstile",
  "AI",
  "API",
  "CMS",
  "CRM",
  "CSV",
  "D1",
  "ERP",
  "JSON-LD",
  "R2",
  "SEO",
];

const read = (relativePath) => readFileSync(join(root, relativePath), "utf8");
const readJson = (relativePath) => JSON.parse(read(relativePath));
const normalizeArray = (values) => [...values].sort();
const occurrences = (source, value) => source.split(value).length - 1;
const extractMatches = (source, expression) =>
  Array.from(source.matchAll(expression), (match) => match[0]);

function parseLocalizedNumber(value) {
  const compact = value.replace(/[\s\u00a0\u202f]/gu, "");
  if (/^\d{1,3}(?:[.,]\d{3})+$/u.test(compact)) {
    return Number(compact.replace(/[.,]/gu, ""));
  }
  if (compact.includes(".") && compact.includes(",")) {
    const decimalSeparator =
      compact.lastIndexOf(".") > compact.lastIndexOf(",") ? "." : ",";
    const groupingSeparator = decimalSeparator === "." ? "," : ".";
    return Number(
      compact.replaceAll(groupingSeparator, "").replace(decimalSeparator, "."),
    );
  }
  return Number(compact.replace(",", "."));
}

function numericValues(source) {
  const magnitude = { 万: 10_000, 億: 100_000_000 };
  const expanded = source
    .replace(
      /(\d+(?:[.,]\d+)?)\s*[〜～–—-]\s*(\d+(?:[.,]\d+)?)\s*([万億])/gu,
      (_, start, end, unit) =>
        `${parseLocalizedNumber(start) * magnitude[unit]}〜${
          parseLocalizedNumber(end) * magnitude[unit]
        }`,
    )
    .replace(
      /(\d+(?:[.,]\d+)?)\s*([万億])/gu,
      (_, value, unit) => `${parseLocalizedNumber(value) * magnitude[unit]} `,
    );
  return extractMatches(
    expanded,
    /\d+(?:(?:[.,\s\u00a0\u202f]\d{3})+)?(?:[.,]\d+)?/gu,
  )
    .map(parseLocalizedNumber)
    .map(String)
    .sort();
}

function readSourceTree(value) {
  if (typeof value === "string") return readJson(value);
  return Object.fromEntries(
    Object.entries(value).map(([key, child]) => [key, readSourceTree(child)]),
  );
}

function isStableKey(key) {
  return stableKeys.has(key) || /(?:Href|Url)$/u.test(key);
}

function assertProtectedTokens(source, translated, label) {
  for (const term of protectedTerms) {
    assert.equal(
      occurrences(translated, term),
      occurrences(source, term),
      `${label}: protected term changed: ${term}`,
    );
  }

  for (const [name, expression] of [
    ["placeholder", /\{[A-Za-z0-9_.-]+\}/gu],
    ["inline code", /`[^`\r\n]+`/gu],
    ["URL", /https:\/\/[^\s<>"')\]]+/gu],
  ]) {
    assert.deepEqual(
      normalizeArray(extractMatches(translated, expression)),
      normalizeArray(extractMatches(source, expression)),
      `${label}: ${name} tokens changed`,
    );
  }
  assert.deepEqual(
    numericValues(translated),
    numericValues(source),
    `${label}: numeric values changed`,
  );
}

function validateOverlayNode(source, translated, label, key = "", locale) {
  if (isStableKey(key)) {
    assert.equal(
      translated,
      undefined,
      `${label}: stable field must inherit from Japanese source`,
    );
    return;
  }

  if (typeof source === "string") {
    assert.equal(typeof translated, "string", `${label}: translation missing`);
    if (source.length > 0) {
      assert.notEqual(translated.trim(), "", `${label}: translation is empty`);
    }
    const forbiddenJapanese =
      locale === "zh-cn" ? japaneseText : japaneseOrHanText;
    assert.equal(
      forbiddenJapanese.test(translated),
      false,
      `${label}: Japanese residue remains`,
    );
    const sourceNeedsTranslation =
      locale === "zh-cn"
        ? japaneseText.test(source)
        : japaneseOrHanText.test(source);
    if (sourceNeedsTranslation && source.trim()) {
      assert.notEqual(
        translated,
        source,
        `${label}: source text was copied without translation`,
      );
    }
    assertProtectedTokens(source, translated, label);
    return;
  }

  if (Array.isArray(source)) {
    assert.equal(Array.isArray(translated), true, `${label}: array missing`);
    assert.equal(
      translated.length,
      source.length,
      `${label}: array length differs from Japanese source`,
    );
    source.forEach((child, index) =>
      validateOverlayNode(
        child,
        translated[index],
        `${label}[${index}]`,
        "",
        locale,
      ),
    );
    return;
  }

  if (source && typeof source === "object") {
    assert.ok(
      translated &&
        typeof translated === "object" &&
        !Array.isArray(translated),
      `${label}: object missing`,
    );
    for (const translatedKey of Object.keys(translated)) {
      assert.equal(
        Object.hasOwn(source, translatedKey),
        true,
        `${label}.${translatedKey}: unknown translation key`,
      );
    }
    for (const [childKey, child] of Object.entries(source)) {
      validateOverlayNode(
        child,
        translated[childKey],
        `${label}.${childKey}`,
        childKey,
        locale,
      );
    }
  }
}

function validateInterfaceNode(source, translated, label, locale) {
  if (typeof source === "string") {
    assert.equal(typeof translated, "string", `${label}: translation missing`);
    if (source.length > 0) {
      assert.notEqual(translated.trim(), "", `${label}: translation is empty`);
    }
    const forbiddenJapanese =
      locale === "zh-cn" ? japaneseText : japaneseOrHanText;
    assert.equal(
      forbiddenJapanese.test(translated),
      false,
      `${label}: Japanese residue remains`,
    );
    const sourceNeedsTranslation =
      locale === "zh-cn"
        ? japaneseText.test(source)
        : japaneseOrHanText.test(source);
    if (sourceNeedsTranslation && source.trim()) {
      assert.notEqual(
        translated,
        source,
        `${label}: source text was copied without translation`,
      );
    }
    assert.deepEqual(
      normalizeArray(extractMatches(translated, /\{[A-Za-z0-9_.-]+\}/gu)),
      normalizeArray(extractMatches(source, /\{[A-Za-z0-9_.-]+\}/gu)),
      `${label}: placeholders changed`,
    );
    return;
  }

  if (Array.isArray(source)) {
    assert.equal(Array.isArray(translated), true, `${label}: array missing`);
    assert.equal(
      translated.length,
      source.length,
      `${label}: array length differs from Japanese source`,
    );
    source.forEach((child, index) =>
      validateInterfaceNode(
        child,
        translated[index],
        `${label}[${index}]`,
        locale,
      ),
    );
    return;
  }

  if (source && typeof source === "object") {
    assert.ok(
      translated &&
        typeof translated === "object" &&
        !Array.isArray(translated),
      `${label}: object missing`,
    );
    assert.deepEqual(
      Object.keys(translated).sort(),
      Object.keys(source).sort(),
      `${label}: key set differs from Japanese source`,
    );
    for (const [key, child] of Object.entries(source)) {
      validateInterfaceNode(child, translated[key], `${label}.${key}`, locale);
    }
    return;
  }

  assert.equal(translated, source, `${label}: stable value changed`);
}

function getFrontmatter(markdown) {
  return markdown.split(/^---\s*$/mu)[1] ?? "";
}

function getScalar(frontmatter, key) {
  const match = frontmatter.match(new RegExp(`^${key}:\\s*(.*?)\\s*$`, "mu"));
  if (!match) return null;
  return match[1].replace(/^(['"])(.*)\1$/u, "$2");
}

function proseWithoutCode(markdown) {
  return markdown
    .replace(/^---\s*$[\s\S]*?^---\s*$/mu, "")
    .replace(/```[\s\S]*?```/gu, "")
    .replace(/`[^`\r\n]*`/gu, "")
    .replace(/!\[([^\]]*)\]\([^)]+\)/gu, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/gu, "$1")
    .replace(/<[^>]+>/gu, "")
    .replaceAll("〇〇", "")
    .replaceAll("一式", "");
}

function translatableFrontmatter(frontmatter) {
  return frontmatter.replace(
    /^(?:author|date|lastUpdated|image|uploadedImage):.*$/gmu,
    "",
  );
}

function validateSourceTranslations({
  articlesOnly = false,
  onlyLocale = null,
} = {}) {
  const localesToValidate = onlyLocale ? [onlyLocale] : translatedLocales;
  const sourceTree = readSourceTree(sourceFiles);
  if (!articlesOnly) {
    for (const locale of localesToValidate) {
      validateInterfaceNode(
        ui.ja,
        ui[locale],
        `src/i18n/ui.ts:${locale}`,
        locale,
      );
      validateInterfaceNode(
        contactFormCopy.ja,
        contactFormCopy[locale],
        `src/i18n/contact-form.ts:${locale}`,
        locale,
      );
    }
    const overlayHashes = new Map();
    for (const locale of localesToValidate) {
      const overlayPath = `src/i18n/content/${locale}.json`;
      const overlaySource = read(overlayPath);
      const overlayHash = createHash("sha256")
        .update(overlaySource)
        .digest("hex");
      assert.equal(
        overlayHashes.has(overlayHash),
        false,
        `${overlayPath}: byte-identical to ${overlayHashes.get(overlayHash)}`,
      );
      overlayHashes.set(overlayHash, overlayPath);
      validateOverlayNode(
        sourceTree,
        JSON.parse(overlaySource),
        overlayPath,
        "",
        locale,
      );
    }
  }

  const rootArticleNames = readdirSync(join(root, "src/content/insights"), {
    withFileTypes: true,
  })
    .filter((entry) => entry.isFile() && extname(entry.name) === ".md")
    .map((entry) => entry.name.replace(/\.md$/u, ""))
    .sort();
  assert.deepEqual(
    rootArticleNames,
    [...insightSlugs].sort(),
    "Japanese Insights set differs from the canonical slug list",
  );

  for (const locale of localesToValidate) {
    const translatedNames = readdirSync(
      join(root, "src/content/insights", locale),
      { withFileTypes: true },
    )
      .filter((entry) => entry.isFile() && extname(entry.name) === ".md")
      .map((entry) => entry.name.replace(/\.md$/u, ""))
      .sort();
    assert.deepEqual(
      translatedNames,
      [...insightSlugs].sort(),
      `${locale}: Insights set differs from Japanese`,
    );

    for (const slug of insightSlugs) {
      const sourcePath = `src/content/insights/${slug}.md`;
      const translatedPath = `src/content/insights/${locale}/${slug}.md`;
      const source = read(sourcePath);
      const translated = read(translatedPath);
      const sourceFrontmatter = getFrontmatter(source);
      const translatedFrontmatter = getFrontmatter(translated);

      for (const field of ["author", "image", "uploadedImage"]) {
        assert.equal(
          getScalar(translatedFrontmatter, field),
          getScalar(sourceFrontmatter, field),
          `${translatedPath}: ${field} differs from Japanese source`,
        );
      }
      for (const field of ["date", "lastUpdated"]) {
        assert.equal(
          getScalar(translatedFrontmatter, field),
          getScalar(sourceFrontmatter, field),
          `${translatedPath}: ${field} differs from Japanese source`,
        );
      }
      const forbiddenJapanese =
        locale === "zh-cn" ? japaneseText : japaneseOrHanText;
      assert.equal(
        forbiddenJapanese.test(translatableFrontmatter(translatedFrontmatter)),
        false,
        `${translatedPath}: Japanese frontmatter remains outside stable metadata`,
      );
      for (const field of ["title", "description"]) {
        const value = getScalar(translatedFrontmatter, field);
        assert.ok(value, `${translatedPath}: ${field} missing`);
        assert.equal(
          forbiddenJapanese.test(value),
          false,
          `${translatedPath}: Japanese ${field} remains`,
        );
      }
      assert.equal(
        forbiddenJapanese.test(proseWithoutCode(translated)),
        false,
        `${translatedPath}: Japanese prose remains outside code`,
      );
      const translatedImages = extractMatches(
        translated,
        /!\[[^\]]*\]\((\/(?:images|uploads)\/[^)\s]+)\)/gu,
      ).map((value) => value.replace(/^!\[[^\]]*\]\(/u, "").slice(0, -1));
      for (const image of translatedImages) {
        assert.equal(
          existsSync(join(root, "public", image.slice(1))),
          true,
          `${translatedPath}: Markdown image ${image} is missing`,
        );
      }
      assert.equal(
        occurrences(translated, "```") % 2,
        0,
        `${translatedPath}: unbalanced code fence`,
      );
      if (
        slug === "homepage-production-cost-guide" ||
        slug === "service-cta-contact-prefill"
      ) {
        assert.deepEqual(
          normalizeArray(extractMatches(translated, /\{[A-Za-z0-9_.-]+\}/gu)),
          normalizeArray(extractMatches(source, /\{[A-Za-z0-9_.-]+\}/gu)),
          `${translatedPath}: placeholders differ from Japanese source`,
        );
        assert.deepEqual(
          normalizeArray(translatedImages),
          normalizeArray(
            extractMatches(
              source,
              /!\[[^\]]*\]\((\/(?:images|uploads)\/[^)\s]+)\)/gu,
            ).map((value) => value.replace(/^!\[[^\]]*\]\(/u, "").slice(0, -1)),
          ),
          `${translatedPath}: new translation Markdown images differ`,
        );
      }
    }
  }

  if (articlesOnly) {
    console.log(
      `i18n article validation passed: ${localesToValidate.length + 1} locales, ${insightSlugs.length} Insights each`,
    );
    return;
  }

  if (onlyLocale) {
    console.log(
      `i18n source validation passed for ${onlyLocale}: fixed content and ${insightSlugs.length} Insights`,
    );
    return;
  }

  const state = readJson("src/i18n/translation-state.json");
  const sourceHash = calculateTranslationSourceHash(root);
  assert.equal(
    state.sourceHash,
    sourceHash,
    "translation-state sourceHash is stale",
  );
  assert.deepEqual(
    [...state.locales].sort(),
    [...translatedLocales].sort(),
    "translation-state locale set is incomplete",
  );

  const cmsConfig = read("public/admin/config.yml");
  const cmsPolicy = read("functions/admin/api/_cms-policy.ts");
  for (const protectedPath of [
    "src/i18n/content",
    "src/i18n/translation-state.json",
    ...translatedLocales.map((locale) => `src/content/insights/${locale}`),
  ]) {
    assert.equal(
      cmsConfig.includes(protectedPath) || cmsPolicy.includes(protectedPath),
      false,
      `${protectedPath}: translations must remain outside the direct CMS boundary`,
    );
  }
  assert.equal(
    existsSync(join(root, ".github/workflows/create-translation-prs.yml")),
    true,
    "translation task workflow missing",
  );

  console.log(
    `i18n source validation passed: ${locales.length} locales, ${insightSlugs.length} Insights each`,
  );
}

function localizedRoute(route, locale) {
  return locale === "ja" ? route : `/${locale}${route}`;
}

function distPath(route) {
  const pathname = new URL(route, siteOrigin).pathname;
  if (extname(pathname)) return join(root, "dist", pathname.slice(1));
  return join(root, "dist", pathname.slice(1), "index.html");
}

function getJsonLd(html, label) {
  const match = html.match(
    /<script type="application\/ld\+json">([\s\S]*?)<\/script>/u,
  );
  assert.ok(match, `${label}: JSON-LD missing`);
  const value = JSON.parse(match[1]);
  return Array.isArray(value) ? value : [value];
}

function validateAlternateLinks(html, route, locale) {
  const alternates = Array.from(
    html.matchAll(/<link rel="alternate" hreflang="([^"]+)" href="([^"]+)">/gu),
    (match) => ({ language: match[1], href: match[2] }),
  );
  assert.equal(alternates.length, locales.length + 1, `${route}: hreflang set`);
  for (const targetLocale of locales) {
    assert.equal(
      alternates.some(
        (item) =>
          item.language === htmlLanguages[targetLocale] &&
          item.href ===
            new URL(localizedRoute(route, targetLocale), siteOrigin).href,
      ),
      true,
      `${route}: ${targetLocale} alternate missing`,
    );
  }
  assert.equal(
    alternates.some(
      (item) =>
        item.language === "x-default" &&
        item.href === new URL(route, siteOrigin).href,
    ),
    true,
    `${route}: x-default missing`,
  );
  assert.equal(
    html.includes(`<html lang="${htmlLanguages[locale]}">`),
    true,
    `${route}: html lang mismatch`,
  );
  assert.equal(
    html.includes(`<meta property="og:locale" content="${ogLocales[locale]}">`),
    true,
    `${route}: OGP locale mismatch`,
  );
}

function validateInternalLinks(html, route, locale) {
  for (const match of html.matchAll(/<a\b[^>]*\bhref="([^"]+)"[^>]*>/gu)) {
    const anchor = match[0];
    const href = match[1].replaceAll("&amp;", "&");
    if (
      href.startsWith("#") ||
      href.startsWith("mailto:") ||
      href.startsWith("tel:") ||
      href.startsWith("javascript:")
    ) {
      continue;
    }

    const url = new URL(href, siteOrigin);
    if (localizedExternalOrigins.has(url.origin)) {
      if (
        !["/api/", "/cdn-cgi/", "/uploads/", "/.well-known/"].some((prefix) =>
          url.pathname.startsWith(prefix),
        )
      ) {
        if (locale === "ja") {
          assert.equal(
            translatedLocales.some(
              (candidate) =>
                url.pathname === `/${candidate}/` ||
                url.pathname.startsWith(`/${candidate}/`),
            ),
            false,
            `${route}: Japanese page links to localized external route: ${href}`,
          );
        } else {
          assert.equal(
            url.pathname === `/${locale}/` ||
              url.pathname.startsWith(`/${locale}/`),
            true,
            `${route}: cross-locale external link: ${href}`,
          );
        }
      }
      continue;
    }
    if (url.origin !== siteOrigin) continue;
    assert.equal(
      url.pathname.includes("/blog/"),
      false,
      `${route}: legacy blog link remains: ${href}`,
    );
    const hreflang = anchor.match(/\bhreflang="([^"]+)"/u)?.[1] ?? null;
    if (hreflang) {
      const alternateLocale = locales.find(
        (candidate) => htmlLanguages[candidate] === hreflang,
      );
      assert.ok(
        alternateLocale,
        `${route}: unsupported anchor hreflang: ${hreflang}`,
      );
      const baseRoute =
        locale === "ja" ? route : route.slice(`/${locale}`.length);
      assert.equal(
        url.pathname,
        localizedRoute(baseRoute, alternateLocale),
        `${route}: language alternate points to a different route: ${href}`,
      );
    } else if (locale !== "ja") {
      assert.equal(
        url.pathname === `/${locale}/` ||
          url.pathname.startsWith(`/${locale}/`),
        true,
        `${route}: cross-locale internal link: ${href}`,
      );
    } else {
      assert.equal(
        translatedLocales.some(
          (candidate) =>
            url.pathname === `/${candidate}/` ||
            url.pathname.startsWith(`/${candidate}/`),
        ),
        false,
        `${route}: Japanese page links to localized route: ${href}`,
      );
    }

    const targetPath = distPath(url.pathname);
    assert.equal(existsSync(targetPath), true, `${route}: ${href} is missing`);
    if (url.hash) {
      const targetHtml = readFileSync(targetPath, "utf8");
      const id = decodeURIComponent(url.hash.slice(1));
      assert.equal(
        targetHtml.includes(`id="${id}"`),
        true,
        `${route}: ${href} fragment target is missing`,
      );
    }
  }
}

function validateLocalReferences(html, route) {
  for (const match of html.matchAll(
    /<(?:a|iframe|img|link|script|source)\b[^>]*\b(?:href|src)="([^"]+)"/gu,
  )) {
    const value = match[1].replaceAll("&amp;", "&");
    if (
      value.startsWith("#") ||
      value.startsWith("data:") ||
      value.startsWith("mailto:") ||
      value.startsWith("tel:") ||
      value.startsWith("javascript:")
    ) {
      continue;
    }

    const url = new URL(value, siteOrigin);
    if (url.origin !== siteOrigin) continue;
    assert.equal(
      existsSync(distPath(url.pathname)),
      true,
      `${route}: local reference is missing: ${value}`,
    );
  }
}

function validateBuiltSite() {
  const indexableRoutes = [
    ...fixedRoutes.filter((route) => route !== "/contact/thanks/"),
    "/insights/",
    ...insightSlugs.map((slug) => `/insights/${slug}/`),
  ];

  for (const locale of locales) {
    for (const baseRoute of [
      ...fixedRoutes,
      "/insights/",
      ...insightSlugs.map((slug) => `/insights/${slug}/`),
    ]) {
      const route = localizedRoute(baseRoute, locale);
      const path = distPath(route);
      assert.equal(existsSync(path), true, `${route}: generated page missing`);
      const html = readFileSync(path, "utf8");
      validateInternalLinks(html, route, locale);
      validateLocalReferences(html, route);

      if (baseRoute === "/contact/thanks/") {
        assert.equal(
          html.includes(`<html lang="${htmlLanguages[locale]}">`),
          true,
          `${route}: thank-you page language mismatch`,
        );
        assert.equal(
          html.includes('<meta name="robots" content="noindex, nofollow">'),
          true,
          `${route}: thank-you page must be noindex, nofollow`,
        );
        assert.equal(
          /<link rel="canonical"/u.test(html),
          false,
          `${route}: thank-you page must not be canonical`,
        );
        continue;
      }

      const canonical = new URL(route, siteOrigin).href;
      assert.equal(
        html.includes(`<link rel="canonical" href="${canonical}">`),
        true,
        `${route}: canonical mismatch`,
      );
      validateAlternateLinks(html, baseRoute, locale);
      const nodes = getJsonLd(html, route);
      const siteService = nodes.find(
        (node) =>
          node["@type"] === "Service" &&
          node["@id"] ===
            `${new URL(localizedRoute("/", locale), siteOrigin).href}#service`,
      );
      const website = nodes.find((node) => node["@type"] === "WebSite");
      const webpage = nodes.find((node) => node["@type"] === "WebPage");
      assert.ok(siteService, `${route}: localized Service missing`);
      assert.equal(
        siteService.inLanguage,
        htmlLanguages[locale],
        `${route}: Service language mismatch`,
      );
      assert.equal(
        website?.inLanguage,
        htmlLanguages[locale],
        `${route}: WebSite language mismatch`,
      );
      assert.equal(
        webpage?.inLanguage,
        htmlLanguages[locale],
        `${route}: WebPage language mismatch`,
      );
      if (locale !== "ja") {
        assert.equal(
          siteService.serviceType.some((value) => japaneseText.test(value)),
          false,
          `${route}: Japanese Service JSON-LD remains`,
        );
      }

      if (baseRoute.startsWith("/insights/") && baseRoute !== "/insights/") {
        const articleUrl = new URL(route, siteOrigin).href;
        const article = nodes.find((node) => node["@type"] === "TechArticle");
        assert.ok(article, `${route}: TechArticle missing`);
        assert.equal(
          article.inLanguage,
          htmlLanguages[locale],
          `${route}: article language mismatch`,
        );
        assert.deepEqual(
          article.about,
          {
            "@id": `${new URL(localizedRoute("/", locale), siteOrigin).href}#service`,
          },
          `${route}: article Service relationship mismatch`,
        );
        assert.equal(
          article["@id"],
          `${articleUrl}#article`,
          `${route}: article ID mismatch`,
        );
      }
    }

    const rssRoute = localizedRoute("/rss.xml", locale);
    const rssPath = distPath(rssRoute);
    assert.equal(existsSync(rssPath), true, `${rssRoute}: RSS missing`);
    const rss = readFileSync(rssPath, "utf8");
    assert.equal(
      insightSlugs.every((slug) =>
        rss.includes(
          new URL(getLocalizedInsightHref(slug, locale), siteOrigin).href,
        ),
      ),
      true,
      `${rssRoute}: RSS article set incomplete`,
    );
  }

  const sitemap = readdirSync(join(root, "dist"), { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.startsWith("sitemap"))
    .map((entry) => readFileSync(join(root, "dist", entry.name), "utf8"))
    .join("\n");
  const sitemapEntries = [...sitemap.matchAll(/<url>([\s\S]*?)<\/url>/gu)].map(
    (match) => match[1],
  );
  assert.ok(sitemapEntries.length > 0, "sitemap URL entries are missing");
  for (const entry of sitemapEntries) {
    const japaneseAlternate = entry.match(
      /<xhtml:link\b[^>]*\bhreflang="ja"[^>]*\bhref="([^"]+)"[^>]*\/>/u,
    )?.[1];
    const xDefault = entry.match(
      /<xhtml:link\b[^>]*\bhreflang="x-default"[^>]*\bhref="([^"]+)"[^>]*\/>/u,
    )?.[1];
    assert.ok(japaneseAlternate, "sitemap Japanese alternate is missing");
    assert.equal(
      xDefault,
      japaneseAlternate,
      "sitemap x-default must match the Japanese alternate",
    );
  }
  for (const locale of locales) {
    for (const route of indexableRoutes) {
      const url = new URL(localizedRoute(route, locale), siteOrigin).href;
      assert.equal(
        occurrences(sitemap, `<loc>${url}</loc>`),
        1,
        `${url}: sitemap entry missing or duplicated`,
      );
    }
  }
  for (const locale of locales) {
    const thanksUrl = new URL(
      localizedRoute("/contact/thanks/", locale),
      siteOrigin,
    ).href;
    assert.equal(
      sitemap.includes(`<loc>${thanksUrl}</loc>`),
      false,
      `${thanksUrl}: thank-you page must be excluded from sitemap`,
    );
  }

  console.log(
    `i18n dist validation passed: ${locales.length} locales, ${fixedRoutes.length} fixed routes, ${insightSlugs.length} Insights`,
  );
}

const localeArgument = process.argv.find((argument) =>
  argument.startsWith("--locale="),
);
const onlyLocale = localeArgument?.slice("--locale=".length) ?? null;
if (onlyLocale && !translatedLocales.includes(onlyLocale)) {
  throw new Error(`--locale must be one of: ${translatedLocales.join(", ")}`);
}

if (process.argv.includes("--dist")) {
  if (onlyLocale) {
    throw new Error("--locale cannot be combined with --dist");
  }
  validateBuiltSite();
} else {
  validateSourceTranslations({
    articlesOnly: process.argv.includes("--articles-only"),
    onlyLocale,
  });
}
