import contact from "../data/contact.json";
import guide from "../data/guide.json";
import home from "../data/home.json";
import itAdvisor from "../data/it-advisor.json";
import pricing from "../data/pricing.json";
import privacy from "../data/privacy.json";
import development from "../data/service-details/development.json";
import operations from "../data/service-details/operations.json";
import security from "../data/service-details/security.json";
import siteFunctions from "../data/service-details/site-functions.json";
import siteQuality from "../data/service-details/site-quality.json";
import website from "../data/service-details/website.json";
import translationState from "./translation-state.json";
import { isContentUnavailable } from "../lib/pending-content.mjs";
import services from "../data/services.json";
import site from "../data/site.json";
import workDetail from "../data/work-details/acecore-site-platform.json";
import works from "../data/works.json";
import de from "./content/de.json";
import en from "./content/en.json";
import es from "./content/es.json";
import fr from "./content/fr.json";
import ko from "./content/ko.json";
import pt from "./content/pt.json";
import ru from "./content/ru.json";
import zhCn from "./content/zh-cn.json";
import type { Locale } from "./config";
const pendingContent =
  (
    translationState as {
      pendingContent?: Record<string, { locales: string[] }>;
    }
  ).pendingContent ?? {};

const japaneseContent = {
  contact,
  guide,
  home,
  itAdvisor,
  pricing,
  privacy,
  serviceDetails: {
    development,
    operations,
    security,
    siteFunctions,
    siteQuality,
    website,
  },
  services,
  site,
  workDetail,
  works,
};

export type LocalizedContent = typeof japaneseContent;
type DeepPartial<T> = T extends readonly (infer U)[]
  ? readonly DeepPartial<U>[]
  : T extends Record<string, unknown>
    ? { [K in keyof T]?: DeepPartial<T[K]> }
    : T;

const translatedContent: Record<
  Exclude<Locale, "ja">,
  DeepPartial<LocalizedContent>
> = {
  en,
  "zh-cn": zhCn,
  es,
  pt,
  fr,
  ko,
  de,
  ru,
};

function mergeContent<T>(
  base: T,
  translated: DeepPartial<T>,
  locale: Locale,
  pointer = "",
): T {
  if (Array.isArray(base)) {
    if (!Array.isArray(translated)) return base;

    return base.flatMap((value, index) => {
      const childPointer = `${pointer}/${index}`;
      if (isContentUnavailable(childPointer, locale, pendingContent)) return [];
      return [
        index < translated.length
          ? mergeContent(
              value,
              translated[index] as DeepPartial<typeof value>,
              locale,
              childPointer,
            )
          : value,
      ];
    }) as T;
  }
  if (
    base &&
    translated &&
    typeof base === "object" &&
    typeof translated === "object"
  ) {
    return Object.fromEntries(
      Object.entries(base)
        .filter(
          ([key]) =>
            !isContentUnavailable(`${pointer}/${key}`, locale, pendingContent),
        )
        .map(([key, value]) => [
          key,
          key in translated
            ? mergeContent(
                value,
                (translated as Record<string, unknown>)[key] as DeepPartial<
                  typeof value
                >,
                locale,
                `${pointer}/${key}`,
              )
            : value,
        ]),
    ) as T;
  }
  return (translated ?? base) as T;
}

export function getLocalizedContent(locale: Locale): LocalizedContent {
  return locale === "ja"
    ? japaneseContent
    : mergeContent(japaneseContent, translatedContent[locale], locale);
}
