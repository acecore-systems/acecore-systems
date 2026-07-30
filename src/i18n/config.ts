export const defaultLocale = "ja" as const;

export const locales = [
  "ja",
  "en",
  "zh-cn",
  "es",
  "pt",
  "fr",
  "ko",
  "de",
  "ru",
] as const;

export type Locale = (typeof locales)[number];

export const localeLabels: Record<Locale, string> = {
  ja: "日本語",
  en: "English",
  "zh-cn": "简体中文",
  es: "Español",
  pt: "Português",
  fr: "Français",
  ko: "한국어",
  de: "Deutsch",
  ru: "Русский",
};

export const htmlLangMap: Record<Locale, string> = {
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

export const ogLocaleMap: Record<Locale, string> = {
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

export const intlLocaleMap: Record<Locale, string> = {
  ja: "ja-JP",
  en: "en-US",
  "zh-cn": "zh-CN",
  es: "es-ES",
  pt: "pt-BR",
  fr: "fr-FR",
  ko: "ko-KR",
  de: "de-DE",
  ru: "ru-RU",
};
