---
title: "SEO Improvement Guide: Implementing Structured Data and OGP on Your Astro Site"
description: "A step-by-step guide to properly implementing JSON-LD structured data, OGP, sitemaps, and RSS on an Astro + Cloudflare Pages site. Covers everything from Google rich result support to RSS feed optimization with practical SEO improvements."
date: 2026-03-25T11:00
author: gui
tags: ["Technology", "Astro", "SEO"]
lastUpdated: "2026-09-26T19:21:24+09:00"
image: /uploads/acecore-generated/blog-astro-seo-and-structured-data.webp
callout:
  type: tip
  title: Who This Article Is For
  text: "For those looking to systematically improve their Astro site's SEO. Covers the types and implementation patterns of structured data, OGP configuration, sitemap optimization, and more — all with practical, ready-to-apply steps."
processFigure:
  title: SEO Improvement Workflow
  steps:
    - title: Meta Tags
      description: Set title, description, canonical, and OGP on every page.
      icon: i-lucide-file-text
    - title: Structured Data
      description: Communicate page meaning to Google using JSON-LD.
      icon: i-lucide-braces
    - title: Sitemap
      description: "Include canonical URLs and verify dates of substantial changes."
      icon: i-lucide-map
    - title: RSS
      description: Deliver high-quality feeds with author and category information.
      icon: i-lucide-rss
insightGrid:
  title: Implemented Structured Data
  items:
    - title: Organization
      description: Display company name, URL, logo, and contact info in search results.
      icon: i-lucide-building
    - title: BlogPosting
      description: Enable rich results for articles with author, publish date, update date, and images.
      icon: i-lucide-pen-line
    - title: BreadcrumbList
      description: Output the hierarchical structure of all pages as breadcrumb lists.
      icon: i-lucide-chevrons-right
    - title: FAQPage
      description: "Make FAQ content machine readable; Google rarely shows FAQ rich results for general sites."
      icon: i-lucide-help-circle
    - title: WebPage / ContactPage
      description: Assign dedicated types to the top page and contact page.
      icon: i-lucide-layout
    - title: SearchAction
      description: "Google retired the sitelinks search box in 2024; provide site search within your site."
      icon: i-lucide-search
faq:
  title: Frequently Asked Questions
  items:
    - question: Will search results change immediately after adding structured data?
      answer: 'No. It takes days to weeks for Google to crawl and re-index. You can check the reflection status in the "Rich results" report in Google Search Console.'
    - question: What is the recommended OGP image size?
      answer: "1200×630px is recommended. This ratio is optimal for X (Twitter) when using summary_large_image."
    - question: Does sitemap priority affect SEO?
      answer: "Google ignores `priority` and `changefreq`. There is no SEO benefit in inventing values for them."
---

> September 2026 update: Google ended the sitelinks search box in November 2024. FAQ rich results are generally limited to authoritative government and health sites, and Google ignores sitemap `changefreq` and `priority`. Read this March 2026 implementation record alongside the [search box change](https://developers.google.com/search/blog/2024/10/sitelinks-search-box), [FAQ change](https://developers.google.com/search/blog/2023/08/howto-faq-changes), and [sitemap guidance](https://developers.google.com/search/blog/2023/06/sitemaps-lastmod-ping).

## Introduction

When people think of SEO, they might imagine "keyword stuffing," but modern SEO is fundamentally about **accurately conveying your site's structure and content to search engines**.

This article explains SEO measures to implement on an Astro site, divided into four categories. Each one provides ongoing benefits once configured.

---

## Setting Up OGP and Meta Tags

OGP and meta tags handle the appearance when shared on social media and the delivery of information to search engines.

### Basic Meta Tags

In your Astro layout component, output the following for each page:

- `og:title` / `og:description` / `og:image` — Title, description, and image when shared on social media
- `twitter:card` = `summary_large_image` — Display a large image card on X (Twitter)
- `rel="canonical"` — Specify the canonical URL for duplicate pages
- `rel="prev"` / `rel="next"` — Indicate pagination relationships

### Blog Post Meta Tags

Set the following additional tags on article pages:

- `article:published_time` / `article:modified_time` — Publish and update dates
- `article:tag` — Article tag information
- `article:section` — Content category

### Implementation Tips

By accepting `title` / `description` / `image` as props in the layout component and passing them from each page, you can ensure consistent meta tag output across all pages. For the homepage `og:title`, use a specific title that includes the site name and tagline rather than just "Home."

---

## Implementing Structured Data (JSON-LD)

Structured data is a mechanism that allows search engines to mechanically understand page content. When implemented correctly, rich results (FAQs, breadcrumbs, author information, etc.) may appear in search results.

### Organization

Convey company information to Google. It may appear in the Knowledge Panel.

```json
{
  "@type": "Organization",
  "name": "Acecore",
  "url": "https://acecore.net",
  "logo": "https://acecore.net/logo.png",
  "contactPoint": { "@type": "ContactPoint", "telephone": "..." }
}
```

You can also add a `knowsAbout` field to the about page to specify business domains.

### BlogPosting

Set `BlogPosting` for blog articles. Including author, publish date, update date, and featured image enables author information display in Google Discover and search results.

### BreadcrumbList

Breadcrumb structured data should be set on all pages. An important implementation note: verify that intermediate paths (like listing pages such as `/blog/tags/`) actually exist, and don't output the `item` property for non-existent paths.

### FAQPage

If your page includes FAQs, you can output matching `FAQPage` data. Google generally limits FAQ rich results to authoritative government and health sites, so general sites should not expect that display.

### WebSite + SearchAction

Google retired the sitelinks search box in November 2024. Existing `SearchAction` markup does not by itself cause a Search error. Search tools such as Pagefind remain useful for visitors within your site.

---

## Sitemap Optimization

You can auto-generate a sitemap using Astro's `@astrojs/sitemap` plugin, but the default settings are insufficient.

### Per-Page-Type Configuration

The `serialize()` setup below emitted `changefreq` and `priority` by URL type at the time. The table is an implementation record. Google ignores both fields, so do not configure them for ranking gains.

| Page Type  | changefreq | priority |
| ---------- | ---------- | -------- |
| Homepage   | daily      | 1.0      |
| Blog Posts | weekly     | 0.8      |
| Other      | monthly    | 0.6      |

### Setting lastmod

Use `lastmod` for the date of a real, substantial page change. Avoid putting the build timestamp on every unchanged page; for articles, align it with publication or `lastUpdated` dates.

---

## Enhancing the RSS Feed

RSS tends to be a "set it and forget it" task, but improving feed quality enhances display in RSS readers and improves the subscriber experience.

### Information to Add

- **author**: Include the per-article author name
- **categories**: Add tag information as categories to improve classification in RSS readers

```typescript
items: posts.map((post) => ({
  title: post.data.title,
  description: post.data.description,
  link: `/blog/${post.id}/`,
  pubDate: post.data.date,
  author: post.data.author,
  categories: post.data.tags,
}));
```

---

## SEO Improvement Checklist

Finally, here's a summary of the key points to verify for Astro site SEO improvement:

1. **Is a canonical URL set on every page?**
2. **Is a unique OGP image prepared for each page?**
3. **Structured data validation**: Check with [Google Rich Results Test](https://search.google.com/test/rich-results)
4. **Do intermediate paths in breadcrumb lists point to actual URLs?**
5. **Does the sitemap exclude unnecessary pages (like 404)?**
6. **Does the RSS feed include author and categories?**
7. **Does robots.txt exclude search indexes (like `/pagefind/`) from crawling?**

Once you've configured all these, your SEO foundation is in place. From there, search rankings are determined by content quality and update frequency.

---

## Series This Article Belongs To

This article is part of the "[Astro Site Quality Improvement Guide](/blog/website-improvement-batches/)" series. Separate articles cover performance, accessibility, and UX improvements.
