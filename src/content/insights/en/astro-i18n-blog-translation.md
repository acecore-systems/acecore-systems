---
title: "How to Make an Astro Blog Available in 9 Languages: Translation, URLs, and hreflang"
description: "An implementation record of making an Astro blog available in 9 languages. It covers URL design with prefixDefaultLocale, translation file placement, conditions that prevent article URLs, sitemaps, and hreflang from being generated for untranslated locales, display switching with View components, and considerations for OG images, CMS, and RSS. It separates the configuration as of 2026-7 from subsequent changes to help readers evaluate a similar setup."
date: 2026-03-25T10:00
lastUpdated: "2026-10-25T06:10:55Z"
author: gui
tags: ["Technology", "Astro", "i18n", "Websites"]
image: "/images/insights/covers/astro-i18n-blog-translation-cover-v2.webp"
processFigure:
  title: Multilingual implementation process
  steps:
    - title: Set up the i18n foundation
      description: Configure Astro's built-in i18n routing and translation utilities.
      icon: i-lucide-globe
    - title: Translate UI text
      description: Translate visible text in the header, footer, and all components.
      icon: i-lucide-languages
    - title: Translate blog articles
      description: Generate 21 articles × 8 languages = 168 translation files during the initial rollout.
      icon: i-lucide-file-text
    - title: Verify CMS and builds
      description: Add multilingual support to Pages CMS and verify builds for all pages.
      icon: i-lucide-check-circle
compareTable:
  title: Before and after multilingual support
  before:
    label: Japanese only
    items:
      - Japanese only (1 language)
      - 23 blog articles
      - 523 pages generated (after UI localization)
      - 1 blog collection in Pages CMS
      - Tags and author data in Japanese only
      - 1 RSS feed
  after:
    label: 9 languages supported (initial rollout)
    items:
      - Japanese + 8 languages (en, zh-cn, es, pt, fr, ko, de, ru)
      - 23 blog articles + 168 translations = 191 articles
      - 621 pages generated (initial rollout)
      - 9 language-specific collections in Pages CMS
      - 25 tags and author data translated into each language
      - Multilingual RSS feeds (9 languages)
callout:
  type: info
  title: Supported languages
  text: "The site supports 9 languages: Japanese (default), English, Simplified Chinese, Spanish, Portuguese, French, Korean, German, and Russian."
statBar:
  items:
    - value: "9"
      label: Supported languages
    - value: "208"
      label: Translated articles (as of 2026-7-29)
    - value: "652"
      label: Generated pages (as of 2026-7-29)
faq:
  title: Frequently asked questions
  items:
    - question: Why did you choose 9 languages?
      answer: "To maximize global reach, we covered the world's major language markets. English, Chinese, Spanish, and Portuguese cover a large portion of the internet population, while French, German, Russian, and Korean cover the remaining major markets."
    - question: How do you ensure translation quality?
      answer: "We used AI translation with GitHub Copilot. We created an English version as an intermediate language and translated from it into each target language to reduce variation in quality. We kept frontmatter tag values in Japanese and left URLs, code blocks, and image paths unchanged. This was the approach as of 2026-7. Translation generation now uses OpenAI Batch."
    - question: What happens if a translated article does not exist?
      answer: "No article URL is generated for a locale without a translation file. The Japanese version remains available at its original URL, and the language switcher takes users to the target locale's blog listing."
    - question: Do new articles also need translations?
      answer: "Translations are not required to publish the Japanese version. To add a translation, place a Markdown file with the same name in the corresponding language directory. The article URL, sitemap, and hreflang for that language will then be eligible for generation."
---

This implementation record is for people who want to make a Japanese Astro blog multilingual while keeping translated article URLs, language switching, sitemaps, and hreflang working correctly. Start with a representative article, aligning its body, metadata, and language switcher, and verify that users are not directed to untranslated pages. Use [Astro: Internationalization Routing](https://docs.astro.build/en/guides/internationalization/) as the basis for URL design, and expand UI and article translations separately in stages. The counts and old CMS configuration below are examples from the initial rollout.

> **Update 2026-9-26:** The Astro 7.1.3 version, article counts, and Copilot translation described below reflect the state as of 2026-7. The [current dependency declarations](https://github.com/acecore-systems/acecore-net/blob/main/package.json) specify Astro ^7.3.3 and Tailwind CSS 4.3.3; the translation workflow update is covered in [the article on OpenAI Batch](/insights/copilot-translation-pipeline/). Check the current source and published pages before using the implementation examples or figures below as current settings.

## Implementation record as of 2026-7

We upgraded the official Acecore website from Japanese-only to support for 9 languages. During the initial rollout, we translated 21 blog articles into 8 languages, producing 168 translations. As of 2026-7-29, there were 29 Japanese articles and 208 translations, for a total of 237 articles, and the build produced 652 pages. Article URLs are not generated for locales without translations, so only existing language versions are published.

## Multilingual strategy and URL design

We addressed the following 3 areas in stages:

1. **i18n foundation**: Astro's built-in i18n routing configuration, translation utilities, and translation JSON files for 9 languages
2. **UI text translation**: Component text in the header, footer, sidebar, and all pages
3. **Blog article translation**: During the initial rollout, translated 21 articles into 8 languages (generating 168 files)

### URL design

We use Astro's `prefixDefaultLocale: false` to serve Japanese directly under the root (`/blog/...`) and other languages with prefixes (`/en/blog/...`, `/zh-cn/blog/...`, etc.).

```
# 日本語（デフォルト）
/blog/astro-performance-tuning/

# 英語
/en/blog/astro-performance-tuning/

# 簡体字中国語
/zh-cn/blog/astro-performance-tuning/
```

Using the same slug for every language makes URL mapping simple when switching languages.

Copilot automation for maintaining the translation workflow is covered in [How to Run a Multilingual Blog with Sveltia CMS](/insights/copilot-translation-pipeline/).

## Set up Astro's i18n foundation

### Astro i18n configuration

Configure i18n routing in `astro.config.mjs`.

```javascript
// astro.config.mjs
export default defineConfig({
  i18n: {
    defaultLocale: "ja",
    locales: ["ja", "en", "zh-cn", "es", "pt", "fr", "ko", "de", "ru"],
    routing: {
      prefixDefaultLocale: false,
    },
  },
});
```

### Translation utilities

We consolidated configuration files, utility functions, and translation JSON in `src/i18n/`.

```typescript
// src/i18n/utils.ts
export function t(locale: Locale, key: string): string {
  return translations[locale]?.[key] ?? translations[defaultLocale][key] ?? key;
}
```

Translation files for each language are stored in JSON format in `src/i18n/locales/`. They manage approximately 100 keys for navigation, the footer, blog UI, metadata, and more.

### View component pattern

Page implementations use the **View component pattern**. Layout and logic are consolidated in `src/views/`, while route files (`src/pages/`) are thin wrappers that only pass the locale.

```astro
---
// src/pages/[locale]/about.astro（ルートファイル）
import AboutPage from "../../views/AboutPage.astro";
const { locale } = Astro.params;
---

<AboutPage locale={locale} />
```

This design eliminates duplicated logic between the Japanese route (`/about`) and multilingual routes (`/en/about`).

## Translate blog articles in language-specific directories

### Directory structure

Translated articles are placed in subdirectories named by language code. Astro's glob loader automatically discovers them recursively using the `**/*.md` pattern. Astro's [Content Loader API](https://docs.astro.build/en/reference/content-loader-reference/) explains that a globstar such as `**/*.md` can be specified in the `pattern` of the `glob()` loader to load Markdown and other files from directories.

```
src/content/blog/
  astro-performance-tuning.md          # 日本語（ベース）
  website-renewal.md
  en/
    astro-performance-tuning.md        # 英語版
    website-renewal.md
  zh-cn/
    astro-performance-tuning.md        # 簡体字中国語版
    website-renewal.md
  es/
    ...
```

### Content resolution utilities

We implemented 3 functions in `src/utils/blog-i18n.ts`.

```typescript
// ベース記事かどうかを判定（IDにスラッシュが無い = ベース）
export function isBasePost(post: CollectionEntry<"blog">): boolean {
  return !post.id.includes("/");
}

// IDからロケールプレフィックスを除去してベーススラッグを取得
export function getBaseSlug(postId: string): string {
  const idx = postId.indexOf("/");
  return idx !== -1 ? postId.slice(idx + 1) : postId;
}

// ベース記事のローカライズ版を取得（無ければ原文にフォールバック）
export function localizePost(
  post: CollectionEntry<"blog">,
  allPosts: CollectionEntry<"blog">[],
  locale: Locale,
): CollectionEntry<"blog"> {
  if (locale === defaultLocale) return post;
  return allPosts.find((p) => p.id === `${locale}/${post.id}`) ?? post;
}
```

`localizePost()` itself returns the original text as a safeguard, but public routes and listings use `isPostAvailableInLocale()` and filters to include only translations that exist, so article URLs are not generated for untranslated locales.

The key is **not changing the existing content collection schema**. Astro's glob loader automatically recognizes files in subdirectories with IDs such as `en/astro-performance-tuning`, so no configuration changes were needed.

### Translation file rules

We generated translation files according to these rules:

- Keep **frontmatter keys** in English (`title`, `description`, `date`, etc.)
- Keep **tag values** in Japanese (`['技術', 'Astro']`, etc.)
- Leave **URLs, image paths, code blocks, and HTML** unchanged
- Leave **dates and authors** unchanged
- Translate **body text and frontmatter text values** (title, description, callout, FAQ, etc.)

### Translation workflow

The translation process was as follows:

1. **Create an English version as an intermediate language**: Translate the Japanese source into English
2. **Translate from English into each language**: Use English to produce versions in 7 languages
3. **Batch processing**: Process 5–6 articles at a time with GitHub Copilot

The 2-stage Japanese → English → target-language process reduces variation in translation quality. Using English as an intermediate language produced more consistent quality than translating directly from Japanese into each language.

<figure class="article-diagram" data-layout="branches" data-tone="teal" data-count="3" aria-labelledby="diagram-astro-i18n-blog-translation">
  <figcaption>
    <strong id="diagram-astro-i18n-blog-translation">Check translations against the latest Japanese source before publishing</strong>
    <span>Public URLs and search references match the translation files that exist.</span>
  </figcaption>
  <ol class="article-diagram__nodes">
    <li>
      <span class="article-diagram__symbol">
        <span aria-hidden="true">1</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M6 3h8l4 4v14H6z M14 3v5h5 M9 12h6 M9 16h6"/></svg>
      </span>
      <strong>Update the Japanese source</strong>
      <span>Review changes to the Japanese source and first identify the affected language versions and articles that need to be checked again.</span>
    </li>
    <li>
      <span class="article-diagram__symbol">
        <span aria-hidden="true">2</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z M3 12h18 M12 3a14 14 0 0 1 0 18 M12 3a14 14 0 0 0 0 18"/></svg>
      </span>
      <strong>Check translations for each locale</strong>
      <span>Review the title, description, and body, and generate locale URLs only for translation files that exist.</span>
    </li>
    <li>
      <span class="article-diagram__symbol">
        <span aria-hidden="true">3</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M6 3h8l4 4v14H6z M14 3v5h5 M8 16l8-8"/></svg>
      </span>
      <strong>When no translation file exists</strong>
      <span>Do not create a URL, sitemap entry, or hreflang for that locale. Untranslated pages are not published automatically.</span>
    </li>
  </ol>
</figure>

## Multilingual support in View components

### BlogPostPage implementation

On blog article pages, we use `localizePost()` to retrieve localized content and assign it to template variables.

```astro
---
// src/views/BlogPostPage.astro
const localizedPost = localizePost(basePost, allPosts, locale);
const post = localizedPost; // テンプレートの既存参照がそのまま動く
---
```

This approach enabled multilingual support without changing any references to `post.data.title` or `post.body` in the template.

### Listing pages

On blog, tag, author, and archive listing pages, we use `isBasePost()` to filter for base articles only, then replace them with translated versions at display time using `localizePost()`.

```astro
---
const allPosts = await getCollection("blog");
const basePosts = allPosts.filter(isBasePost);
const displayPosts = basePosts.map((p) => localizePost(p, allPosts, locale));
---
```

## YAML and OG image issues during builds

### Escaping YAML frontmatter

In French translations, apostrophes (such as `l'atelier` and `qu'on`) conflicted with YAML single quotes.

```yaml
# NG：YAML パースエラー
title: 'Le métavers est plus proche qu'on ne le pense'

# OK：ダブルクォートに変更
title: "Le métavers est plus proche qu'on ne le pense"
```

We fixed all files in bulk with a Node.js script. English expressions such as `Acecore's` cause the same issue, so the choice of quotes requires attention when generating translation files.

### Filtering OG image routes

`/blog/og/[slug].png.ts` also picked up translated article slugs (such as `en/aceserver-hijacked`), causing parameter errors. We resolved this by filtering with `isBasePost()`.

```typescript
export const getStaticPaths: GetStaticPaths = async () => {
  const allPosts = await getCollection("blog");
  const posts = allPosts.filter(isBasePost);
  return posts.map((post) => ({
    params: { slug: post.id },
    props: { title: post.data.title },
  }));
};
```

## Multilingual support in Pages CMS

Because Pages CMS (`.pages.yml`) only targets files directly inside the directory specified by `path`, we registered translation subdirectories as separate collections.

```yaml
content:
  - name: blog
    label: ブログ（日本語）
    path: src/content/blog
  - name: blog-en
    label: Blog（English）
    path: src/content/blog/en
  - name: blog-zh-cn
    label: 博客（简体中文）
    path: src/content/blog/zh-cn
  # ... 各言語ごとに設定
```

By writing labels in each language, we make it clear at a glance which language each CMS collection represents.

## Language switcher UI

We added a `LanguageSwitcher` component to the header and implemented a language switcher UI for both desktop and mobile. Switching languages navigates to the corresponding locale of the same page, while on a first visit the browser's `navigator.language` is detected for an automatic redirect.

## Multilingual tag display

Article tags retain their Japanese slugs in URLs, and **only the display names are translated**. This avoids complicating routing while displaying tags in the user's language.

Tag definitions are consolidated in `src/content/tags/{tagId}.json`, with each tag having `i18n.name`. This makes the tag collection, rather than the translation JSON, the source of truth for tag translations.

```json
{
  "id": "technology",
  "name": "技術",
  "i18n": {
    "en": { "name": "Technology" },
    "fr": { "name": "Technologie" }
  }
}
```

Article cards, sidebars, tag listings, and article details reference the tags collection to switch display names, keeping all tag displays consistent with the locale.

## Multilingual author data

We also introduced locale-specific author names, bios, and skill lists. A `i18n` field was added to `src/content/authors/{authorId}.json` to hold translations for each language.

```json
{
  "id": "hatt",
  "name": "ハット",
  "bio": "代表取締役。Web制作・サーバー運用…",
  "skills": ["TypeScript", "Astro", "..."],
  "i18n": {
    "en": {
      "name": "Hatt",
      "bio": "CEO and representative director. Web development...",
      "skills": ["TypeScript", "Astro", "..."]
    }
  }
}
```

The `getLocalizedAuthor()` utility retrieves author information for the locale.

```typescript
// src/utils/blog-i18n.ts
export function getLocalizedAuthor(author: Author, locale: Locale) {
  const localized = author.i18n?.[locale];
  return localized ? { ...author, ...localized } : author;
}
```

## Implementing multilingual SEO

To maximize the SEO benefits of multilingual support, we put mechanisms in place to help search engines correctly recognize and index each language version.

### hreflang support in the sitemap

We configured the `i18n` option in `@astrojs/sitemap` and a filter that checks whether translation files exist. The sitemap lists only existing language versions and automatically outputs the corresponding `xhtml:link rel="alternate"` tags.

```javascript
// astro.config.mjs
sitemap({
  filter(page) {
    return !isMissingLocalizedBlogPost(page);
  },
  i18n: {
    defaultLocale: "ja",
    locales: {
      ja: "ja",
      en: "en",
      "zh-cn": "zh-CN",
      es: "es",
      pt: "pt",
      fr: "fr",
      ko: "ko",
      de: "de",
      ru: "ru",
    },
  },
});
```

Articles available in all 9 languages receive hreflang output for 9 languages. For articles without translations, only the Japanese URL is listed; nonexistent language versions are excluded from the sitemap and hreflang.

### Language support in JSON-LD structured data

We added the `inLanguage` field to blog articles' `BlogPosting` structured data to tell search engines which language each article is written in.

```javascript
// BlogPostPage.astro（JSON-LD 抜粋）
{
  "@type": "BlogPosting",
  "inLanguage": htmlLangMap[locale],  // "ja", "en", "zh-CN" など
  "headline": post.data.title,
  // ...
}
```

### Multilingual RSS feeds

In addition to the Japanese `/rss.xml`, we generate RSS feeds for each language (`/en/rss.xml`, `/zh-cn/rss.xml`, etc.). Feed titles and descriptions are also translated, and the `<language>` tag outputs a BCP47-compliant language code.

```typescript
// src/pages/[locale]/rss.xml.ts
export const getStaticPaths = () =>
  locales
    .filter((l) => l !== defaultLocale)
    .map((l) => ({ params: { locale: l } }));
```

The `<link rel="alternate" type="application/rss+xml">` in `BaseLayout.astro` also automatically sets the RSS URL for the locale.

## Summary

In the implementation as of 2026-7, Astro 7.1.3's built-in i18n features enabled multilingual support even for a static site.

- **i18n foundation**: Japanese has no prefix with Astro's `prefixDefaultLocale: false`
- **UI translation**: The View component pattern eliminates duplicated logic
- **Content translation**: The subdirectory approach requires no changes to the existing schema
- **Tag translation**: URLs retain Japanese slugs; only display names are translated
- **Author data translation**: Bios and skills change by language
- **SEO**: Sitemap hreflang, JSON-LD `inLanguage`, and multilingual RSS feeds
- **Untranslated locales**: No article URL is generated; the Japanese version remains published at its original URL
- **CMS support**: Articles in each language can be edited separately in Pages CMS

Going forward, translation files will be added gradually as new articles are published. Until translations are complete, only the Japanese version is published; article URLs, sitemap entries, and hreflang are enabled for each locale as its translation file is added.

## Update 2026-10-6: Authentication screen language and errors

In addition to translating published articles, authentication screens need consistent language selection. In an anonymized update, we selected a supported language in order from `ui_locales`, `Accept-Language`, and the default language, with a safe fallback for unsupported values. Known OIDC errors are converted into common display messages, and raw internal messages are not displayed even for unknown errors.

We check page labels, errors delivered through the API, and guidance after registration together. Supporting 9 blog languages alone does not mean acceptance testing is complete for every authentication screen or actual registration path.

The language is carried through login, account management, consent, and one-time codes, preserving OIDC locale and state during navigation. The scope checked for URLs, Content-Language, and display on narrow screens is distinguished from user acceptance across all languages.
