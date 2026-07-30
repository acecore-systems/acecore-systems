import { defaultLocale, intlLocaleMap, locales, type Locale } from "./config";

const localeSet = new Set<string>(locales);

export function isLocale(value: string | undefined): value is Locale {
  return Boolean(value && localeSet.has(value));
}

export function getLocaleFromUrl(url: URL | string): Locale {
  const pathname = typeof url === "string" ? url : url.pathname;
  const first = pathname.split("/").filter(Boolean)[0];
  return first && first !== defaultLocale && isLocale(first)
    ? first
    : defaultLocale;
}

export function getLocalizedUrl(path: string, locale: Locale): string {
  const parsed = new URL(path, "https://systems.acecore.net");
  const segments = parsed.pathname.split("/").filter(Boolean);
  if (segments[0] && segments[0] !== defaultLocale && isLocale(segments[0])) {
    segments.shift();
  }

  const trailingSlash = parsed.pathname.endsWith("/");
  const basePath = `/${segments.join("/")}`;
  const normalized =
    basePath === "/" ? "/" : trailingSlash ? `${basePath}/` : basePath;
  const localized =
    locale === defaultLocale
      ? normalized
      : `/${locale}${normalized === "/" ? "/" : normalized}`;

  return `${localized}${parsed.search}${parsed.hash}`;
}

export function getAlternateUrls(path: string, siteUrl: string) {
  return locales.map((locale) => ({
    locale,
    url: new URL(getLocalizedUrl(path, locale), siteUrl).href,
  }));
}

export function formatDate(date: Date, locale: Locale): string {
  return new Intl.DateTimeFormat(intlLocaleMap[locale], {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}
