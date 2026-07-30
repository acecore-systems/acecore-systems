import type { CollectionEntry } from "astro:content";

import site from "../data/site.json";
import { getLocalizedUrl, htmlLangMap, type Locale } from "../i18n";
import { getUi } from "../i18n/ui";
import {
  getInsightLocale,
  getInsightSlug,
  getLocalizedInsightHref,
} from "./insight-links.mjs";

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export function renderInsightsRss(
  entries: CollectionEntry<"insights">[],
  locale: Locale,
) {
  const text = getUi(locale);
  const feedPath = getLocalizedUrl("/rss.xml", locale);
  const feedUrl = new URL(feedPath, site.siteUrl).href;
  const indexUrl = new URL(getLocalizedUrl("/insights/", locale), site.siteUrl)
    .href;
  const items = entries
    .filter((entry) => getInsightLocale(entry.id) === locale)
    .sort((a, b) => b.data.date.getTime() - a.data.date.getTime())
    .map((entry) => {
      const itemUrl = new URL(
        getLocalizedInsightHref(getInsightSlug(entry.id), locale),
        site.siteUrl,
      ).href;
      return `<item>
        <title>${escapeXml(entry.data.title)}</title>
        <link>${escapeXml(itemUrl)}</link>
        <guid isPermaLink="true">${escapeXml(itemUrl)}</guid>
        <description>${escapeXml(entry.data.description)}</description>
        <pubDate>${entry.data.date.toUTCString()}</pubDate>
      </item>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(`${site.name} — ${text.insights}`)}</title>
    <link>${escapeXml(indexUrl)}</link>
    <description>${escapeXml(text.insightsLead)}</description>
    <language>${escapeXml(htmlLangMap[locale])}</language>
    <atom:link href="${escapeXml(feedUrl)}" rel="self" type="application/rss+xml" />
    ${items}
  </channel>
</rss>`;
}
