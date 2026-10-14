---
title: "How to Run a Multilingual Blog with Sveltia CMS"
description: "Publish eight static translations from Japanese source. Covers OpenAI Batch protection for numbers, URLs and code, validating all results before writing, translation PRs, CI and GitHub-connected publication."
date: 2026-06-07T17:00
lastUpdated: "2026-10-15T00:00:00+09:00"
author: gui
tags: ["Technology", "GitHub Copilot", "i18n", "CMS", "SEO"]
image: "/images/insights/covers/copilot-translation-pipeline-cover-v2.webp"
callout:
  type: tip
  title: UI translation is not the same as multilingual publishing
  text: "Browser translation and translation widgets can help readers, but they do not automatically create localized URLs, titles, descriptions, internal links, RSS feeds, sitemaps, or hreflang clusters. If search engines need to see each language as a real page, publish translated static HTML."
processFigure:
  eyebrow: Translation Workflow
  title: "From Japanese source to a validated translation PR"
  description: "Restore protected numbers, URLs and code; validate all results before writing."
  variant: inline
  steps:
    - title: "Edit Japanese source"
      description: "Use current main and group consecutive edits."
      icon: i-lucide-file-pen-line
      accent: brand
    - title: "Protect and submit Batch"
      description: "Tokenize numbers, URLs, placeholders and code."
      icon: i-lucide-shield-check
      accent: amber
    - title: "Validate all, then write"
      description: "Check sourceHash, tokens and content; record failures and stop."
      icon: i-lucide-languages
      accent: emerald
    - title: "PR, CI and publication"
      description: "Publish through GitHub integration and review the content."
      icon: i-lucide-check-check
      accent: slate
compareTable:
  title: UI translation vs. localized static pages
  before:
    label: UI translation
    items:
      - "A browser or widget translates text after the page loads"
      - "URL, title, description, and OGP usually stay in the source language"
      - "hreflang, RSS, and sitemap entries are hard to manage per language"
      - "Shared URLs and search snippets tend to point back to the source language"
  after:
    label: Localized static pages
    items:
      - "Each language gets a URL such as `/{locale}/blog/{slug}/`"
      - "Title, description, body, FAQ, and structured data can be localized"
      - "hreflang can connect language variants for search engines"
      - "RSS, sitemap, internal links, and Search Console checks become language-aware"
checklist:
  title: Decisions to make first
  items:
    - text: "Treat Japanese articles as the source of truth"
      checked: true
    - text: "Keep translated slugs aligned with the Japanese source"
      checked: true
    - text: "Trigger translation from Japanese source updates on main"
      checked: true
    - text: "Preserve URLs, image paths, code blocks, and tag IDs during translation"
      checked: true
    - text: "Verify hreflang, canonical, RSS, and sitemap output in the build"
      checked: true
linkCards:
  - href: /en/blog/cms-selection-and-turnstile/
    title: Sveltia CMS Setup Guide
    description: How we added Sveltia CMS to an Astro static site.
    icon: i-lucide-badge-check
  - href: /en/blog/astro-i18n-blog-translation/
    title: Astro Multilingual Architecture
    description: The routing, fallback, hreflang, RSS, and sitemap foundation behind this site.
    icon: i-lucide-globe-2
  - href: /en/blog/astro-seo-and-structured-data/
    title: SEO Implementation for Astro
    description: Canonicals, OGP, structured data, and sitemap basics.
    icon: i-lucide-search-check
faq:
  title: FAQ
  items:
    - question: Is UI translation enough?
      answer: "It is useful for readers, but it is not enough when you want localized URLs, metadata, structured data, internal links, and RSS or sitemap output to be visible as language-specific assets."
    - question: Is AI-translated content bad for SEO?
      answer: "Using AI is not the core issue. The risk is publishing lots of low-value pages without review. Review terminology, facts, links, and naturalness so each localized page is useful to its readers."
    - question: Are translated pages duplicate content?
      answer: "Google says localized pages are only duplicates when the main content remains untranslated. Keep each language page translated and connect variants with hreflang."
---

To start a multilingual blog workflow, generate localized HTML from a representative article’s translations and check body, title, description and internal links. Associate only existing language versions using [Google: Localized Versions](https://developers.google.com/search/docs/specialty/international/localized-versions), accepting translation-service success separately from completed public pages.

> **Checked on 14 October 2026:** Current translation generation uses OpenAI Batch. The Copilot steps below remain as the June 2026 rollout record. The current diagrams and workflow now cover source protection and validation of every result before writing.

## Current workflow: protection, validation and PRs

On Systems, updates to Japanese articles or UI source on main wait 15 minutes before the [submission workflow](https://github.com/acecore-systems/acecore-systems/blob/main/.github/workflows/submit-openai-translation-batch.yml) uses current main. The [collection workflow](https://github.com/acecore-systems/acecore-systems/blob/main/.github/workflows/collect-openai-translation-batch.yml) is scheduled at minutes 2, 17, 32 and 47 each hour, checks the current sourceHash and creates a translation PR. The [merge workflow](https://github.com/acecore-systems/acecore-systems/blob/main/.github/workflows/merge-openai-translation-pr.yml) advances qualifying PRs through CI and the existing GitHub-connected publication path. Scheduled time, Batch completion, merge and production publication are separate states.

Before sending, replace numbers, URLs, existing placeholders, inline code and fenced code with unique tokens. Restore the original text from the matching Japanese source during collection; reject missing, duplicated, altered or added tokens. This protects source details from model changes while retaining post-restoration validation and content review.

The [OpenAI Batch documentation](https://developers.openai.com/api/docs/guides/batch) says output order may differ from input order, so use `custom_id` to match locale, source path and sourceHash. The [protection and collection change](https://github.com/acecore-systems/acecore-systems/pull/131) validates every result in the Batch before starting writes. A later invalid, duplicate or stale-source result cannot leave earlier translations applied. Failures record locale, source path, Batch ID and cause in an artifact. This is not a filesystem transaction guarantee against a disk failure during writing.

The change checked 27 automation tests and an offline protection/restoration round trip for 55 Japanese sources × 8 locales, or 440 results. This was not a fresh full translation through the model API. Existing translated articles are revised with Japanese in the same PR, then the formatted source hash is updated. Never update only the hash while leaving translated content unchanged.

<figure class="article-diagram" data-layout="flow" data-tone="green" data-count="3" aria-labelledby="diagram-copilot-translation-pipeline">
  <figcaption>
    <strong id="diagram-copilot-translation-pipeline">Match protected source and validate every result</strong>
    <span>Validation failure must not update only some locales. Batch completion is not publication.</span>
  </figcaption>
  <ol class="article-diagram__nodes">
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">1</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M5 3h10l4 4v14H5z"/><path d="M15 3v5h5M8 12h8M8 16h6"/></svg></span>
      <strong>Protect the source</strong>
      <span>Unique tokens for numbers, URLs and code.</span>
    </li>
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">2</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5M8 10l2 2 3-4"/></svg></span>
      <strong>Validate current source and all results</strong>
      <span>Match custom_id, sourceHash and tokens, then restore.</span>
    </li>
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">3</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/></svg></span>
      <strong>Send the PR through publication</strong>
      <span>Write after validation, then CI and content review.</span>
    </li>
  </ol>
</figure>

## June 2026 rollout record

Once a site has Sveltia CMS, an AI contact chat, and service-to-contact flows, the next operational question is multilingual publishing.

This site is edited primarily in Japanese, but the public blog is available in nine languages. The important distinction is that translating text in the UI and publishing real localized pages are different things.

Browser translation, extensions, and translation widgets are helpful when a reader wants to understand the current page. They do not automatically create localized URLs, localized metadata, RSS feeds, sitemap entries, hreflang clusters, or locale-aware internal links.

This article describes a practical workflow: edit the Japanese source in Sveltia CMS, create translation pull requests with GitHub Actions and GitHub Copilot, and publish static localized HTML that search engines can crawl directly.

## The Short Version

If multilingual content is part of your search strategy, treat translation as **content generation before publishing**, not as a display-time UI feature.

The site uses this structure:

- Japanese source: `src/content/blog/{slug}.md`
- Translated content: `src/content/blog/{locale}/{slug}.md`
- Public URLs: `/blog/{slug}/`, `/en/blog/{slug}/`, `/zh-cn/blog/{slug}/`, and so on
- Source of truth: Japanese Markdown
- Translation work: GitHub Copilot PRs
- Publishing gate: Astro build and review

Sveltia CMS is the editing surface for the Japanese source. Translation is handled in GitHub so every localized change is reviewable.

## Where UI Translation Works

UI translation is not wrong. It is enough for many cases:

- Internal reading
- One-off browsing by overseas users
- Admin or help screens
- Pages that do not target search traffic
- Content where translation quality is not part of the publishing workflow

In that model, translation happens in the reader's environment. The site owner does not store translated files.

That is lightweight, but it does not create multilingual content assets.

## Where UI Translation Falls Short

For blog articles and service pages, search engines and social previews mostly work with URLs and HTML.

If only the Japanese page exists and English is produced by a browser translator, the indexable URL, title, description, structured data, RSS item, and sitemap entry still point to the Japanese page.

The reader may understand the page, but the site has not published an English page.

With static localized pages, each language has its own route:

```txt
/blog/copilot-translation-pipeline/
/en/blog/copilot-translation-pipeline/
/zh-cn/blog/copilot-translation-pipeline/
/es/blog/copilot-translation-pipeline/
/pt/blog/copilot-translation-pipeline/
/fr/blog/copilot-translation-pipeline/
/ko/blog/copilot-translation-pipeline/
/de/blog/copilot-translation-pipeline/
/ru/blog/copilot-translation-pipeline/
```

Those pages can each carry localized titles, descriptions, body text, FAQ content, JSON-LD, and internal links.

## Search Benefits

The core benefit is not that static translation is more fashionable. It is that the signals sent to crawlers are clearer.

### 1. Crawlers Can Fetch Each Language URL

Google can process JavaScript, but Google Search Central still documents limitations around JavaScript and recommends server-side rendering, static rendering, or hydration over dynamic rendering workarounds.

Other crawlers, RSS readers, link preview tools, and search integrations may be less capable than Googlebot. Putting translated text in the initial HTML is the robust option.

### 2. Metadata Can Be Localized

Search snippets and social previews depend on more than body text.

With localized Markdown, the frontmatter can be translated too:

```yaml
title: "How to Run a Multilingual Blog with Sveltia CMS"
description: "A workflow for editing Japanese source articles and publishing localized static pages."
```

That affects search results, OGP previews, related cards, and RSS.

### 3. hreflang Can Connect Language Variants

Google recommends using `hreflang` when different URLs serve different languages or regions.

This site outputs alternate URLs from the layout and sitemap:

```html
<link
  rel="alternate"
  hreflang="en"
  href="https://acecore.net/en/blog/copilot-translation-pipeline/"
/>
```

With UI-only translation, there is no English URL to connect.

### 4. RSS and Sitemaps Become Language-Aware

Static translated files allow the site to publish feeds such as `/en/rss.xml` and `/fr/rss.xml`, and to include localized URLs in the sitemap.

That is useful not only for Google, but also for feed readers, search indexes, and external services.

### 5. Internal Links Stay in the Reader's Locale

Multilingual sites often break when a translated article links back to the source language.

Translation PRs should preserve the user's locale where possible:

- `/blog/foo/` becomes `/en/blog/foo/` in the English article
- External URLs stay unchanged
- Image paths stay unchanged
- Tag IDs stay unchanged
- Code blocks are not casually rewritten

## What Sveltia CMS Owns

Sveltia CMS is not the translation engine in this workflow. It owns the Japanese source editing experience.

Use it for:

- Japanese blog articles
- Authors
- Tags
- Japanese source JSON
- Uploaded images
- Frontmatter such as date, FAQ, related links, and descriptions

The CMS setup itself is covered in [Sveltia CMS Setup Guide](/en/blog/cms-selection-and-turnstile/). This article focuses on what happens after that: translation PRs.

## Why Translation Belongs in Pull Requests

Putting every language into the CMS can work if editors actively maintain every locale. For a small team that writes in Japanese, it makes the CMS heavy and easy to misuse.

Acecore splits responsibilities:

- Sveltia CMS updates the Japanese source
- GitHub Actions detects CMS commits or changed paths
- GitHub Copilot creates translation PRs
- Pull requests make translation diffs reviewable
- Astro build catches broken routes, frontmatter, and links

That gives you history, review, rollback, and CI around translation work.

## Commit Subjects as Workflow Contracts

The translation workflow should not run for every Markdown change.

Date-only fixes, tag tweaks, and link corrections should not necessarily create eight translation PRs. Use commit subjects as an explicit contract:

```txt
cms: create blog "new-article-slug"
cms: update blog "copilot-translation-pipeline"
```

This makes it clear when translation automation should run.

## Rules Passed to Copilot

Do not ask the agent to "just translate the article." The task needs explicit constraints:

```md
Translate the Japanese source article into the target locale.

Keep:

- slug
- image path
- author id
- tag ids
- internal code tokens
- external URLs
- code blocks unless comments are natural language

Localize:

- title
- description
- callout
- FAQ
- link card title and description
- body text
- internal blog URLs when locale-specific URLs exist
```

The distinction matters because Markdown mixes prose, frontmatter, URLs, images, tags, and code in one file.

## Lessons From the Recent PRs

There were a few practical lessons worth documenting.

### Old CMS Names Linger

The implementation moved to Sveltia CMS, but older articles still mentioned Pages CMS. When a content tool changes, update the related articles, screenshots, alt text, and internal link labels together.

### Date Controls Blog Visibility

The article can be rewritten completely and still not appear on the blog top if `date` remains old. In this site, blog lists sort by `date`, while `lastUpdated` is only update metadata.

### Slugs Must Stay Stable

Translated files should share the base slug:

```txt
src/content/blog/copilot-translation-pipeline.md
src/content/blog/en/copilot-translation-pipeline.md
src/content/blog/fr/copilot-translation-pipeline.md
```

That keeps locale resolution simple.

### Generated Content Still Needs Review

Google's spam policies focus on manipulative or low-value mass generation. AI translation is useful, but each localized article should still be reviewed for terminology, links, facts, and usefulness.

## References

- [Google Search Central: Localized Versions of your Pages](https://developers.google.com/search/docs/advanced/crawling/localized-versions?hl=en&rd=1&visit_id=638856769088389068-716743185)
- [Google Search Central: Managing Multi-Regional and Multilingual Sites](https://developers.google.com/search/docs/advanced/crawling/managing-multi-regional-sites)
- [Google Search Central: JavaScript SEO Basics](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics)
- [Google Search Central: Dynamic Rendering](https://developers.google.com/search/docs/crawling-indexing/javascript/dynamic-rendering)
- [Google Search Central: Spam Policies](https://developers.google.com/search/docs/essentials/spam-policies)
- [Sveltia CMS Setup Guide](/en/blog/cms-selection-and-turnstile/)
- [Astro Multilingual Architecture](/en/blog/astro-i18n-blog-translation/)

## Summary

UI translation helps readers understand a page.

Localized static pages help the site publish language-specific URLs, metadata, internal links, RSS feeds, sitemaps, and hreflang relationships.

For a small team, the clean split is: edit Japanese in Sveltia CMS, generate translations through GitHub Copilot PRs, and only publish translated files after build and review.

The real work is not just translation. It is deciding how translated content lives inside the site architecture.
