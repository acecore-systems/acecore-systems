import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import { satteri } from "@astrojs/markdown-satteri";
import { fileURLToPath } from "node:url";
import { insightLinksPlugin } from "./src/lib/insight-links.mjs";

// Keep the build config self-contained. Importing application TypeScript from
// here makes Astro's content-type runner evaluate CommonJS dependencies as ESM
// on Windows.
const defaultLocale = "ja";
const locales = ["ja", "en", "zh-cn", "es", "pt", "fr", "ko", "de", "ru"];
const htmlLangMap = {
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

const astroPrerenderEntry = fileURLToPath(
  import.meta.resolve("astro/entrypoints/prerender"),
);
const picomatchEntry = fileURLToPath(
  new URL("./src/lib/picomatch-esm.mjs", import.meta.url),
);

export default defineConfig({
  output: "static",
  site: "https://systems.acecore.net",
  i18n: {
    defaultLocale,
    locales: [...locales],
    routing: {
      prefixDefaultLocale: false,
      redirectToDefaultLocale: false,
    },
  },
  integrations: [
    sitemap({
      i18n: {
        defaultLocale,
        locales: Object.fromEntries(
          locales.map((locale) => [locale, htmlLangMap[locale]]),
        ),
      },
      filter(page) {
        const pathname = new URL(page).pathname;
        return pathname !== "/404" && !/\/contact\/thanks\/?$/u.test(pathname);
      },
      serialize(item) {
        if (
          /^https:\/\/systems\.acecore\.net\/(?:[a-z]{2}(?:-[a-z]{2})?\/)?$/u.test(
            item.url,
          )
        ) {
          item.changefreq = "weekly";
          item.priority = 1.0;
        } else {
          item.changefreq = "monthly";
          item.priority = 0.7;
        }
        return item;
      },
    }),
  ],
  markdown: {
    processor: satteri({
      mdastPlugins: [insightLinksPlugin],
    }),
  },
  vite: {
    resolve: {
      alias: {
        "astro/entrypoints/prerender": astroPrerenderEntry,
        picomatch: picomatchEntry,
      },
    },
  },
});
