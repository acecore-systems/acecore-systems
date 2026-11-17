---
title: "Improving Articles with Search Console: Research, Review, and Evaluation over 28 Days Before and After Publication"
description: "How to select articles for improvement using search data, verify evidence, review changes in a Draft PR, and compare the 28 days before and after publication, with cautions on interpretation."
date: "2026-11-17T12:00:00+09:00"
author: gui
image: /images/insights/covers/astro-seo-and-structured-data-cover-v2.webp
tags: ["Technology", "SEO", "Operations"]
callout:
  type: note
  title: "Comparison is not causation"
  text: "Before-and-after figures help observe changes. Search demand and other revisions made around the same time can also have an effect, so the example in this article does not demonstrate an improvement in traffic."
---

Even when Search Console impressions and clicks reveal candidates for improvement, numbers alone cannot tell you whether readers found the answers they needed. This article describes how to examine pages and search intent, review proposed revisions against public sources and the existing content, and compare periods under the same conditions after publication.

<figure class="article-diagram" data-layout="flow" data-tone="violet" data-count="3" aria-labelledby="diagram-search-editorial">
  <figcaption>
    <strong id="diagram-search-editorial">Connecting search data to editing and evaluation</strong>
    <span>Separate candidate discovery, content verification, and post-publication observation.</span>
  </figcaption>
  <ol class="article-diagram__nodes">
    <li><strong>Research</strong><span>Examine the page and search intent, and record hypotheses.</span></li>
    <li><strong>Revision and review</strong><span>Check primary sources and review changes in a Draft PR.</span></li>
    <li><strong>Post-publication evaluation</strong><span>Compare periods under the same conditions and document limitations.</span></li>
  </ol>
</figure>

## 1. Select candidates using metrics and content

In Search Performance, fix the page, search type, and period, then check impressions, clicks, CTR, and average position. Examine queries, countries, and devices as needed. Pages that receive impressions but make answers hard to find in the content are candidates for investigation, but a low CTR alone does not establish that the title needs changing.

Open the page and write down what searchers want to know and which explanations are missing from the current content. It is also important not to treat queries that are not shown or rows that were not retrieved as evidence that no searches occurred. Google's [guide to investigating drops in search traffic](https://developers.google.com/search/docs/monitor-debug/debugging-search-traffic-drops) can help you examine changes by period, page, and query.

## 2. Verify evidence and make changes readers can use

Check official sources and the actual published page, then add concrete examples, procedures, conditions of applicability, and reference links. Distinguish measured results, hypothetical examples used for illustration, and unverified points, and do not claim effects that have not been measured as outcomes. Align the title and description with what the content actually answers. [Google's helpful content self-assessment](https://developers.google.com/search/docs/fundamentals/creating-helpful-content) is also useful for review.

Put the proposed revisions in a Draft PR and check the changes and sources, whether the publication date and URL have been preserved, and whether any translations are pending. Review, merging, deployment, and appearance in search are separate states. Completion of the content review alone does not mean the article is available to read in production.

## 3. Fix the publication date and comparison conditions

As an example, compare the 28 days before publication with the 28 days after it, excluding the publication day. Keep the target URL and language, search type, country, device, date boundaries, and data finalization status consistent across both periods. If the deployment time varies during the publication day, excluding that day can make the comparison conditions clearer. 28 days is a practical observation window, not a guarantee of the optimal period for every article.

| Item to record                                 | Reason to check                                      |
| ---------------------------------------------- | ---------------------------------------------------- |
| Publication date and time, and target URL      | Fix the comparison periods and target                |
| Clicks, impressions, CTR, and average position | Observe changes under the same conditions            |
| Language, search type, country, and device     | Avoid confusion caused by differences in aggregation |
| Other revisions, demand, and insufficient data | Document limitations needed to interpret changes     |

## Example: A before-and-after comparison alone cannot establish the effect of a revision

For the Aceserver Portal [guide to WIKI and Alpha-kun](https://asv.acecore.net/stories/wiki-alpha-guide/), we added example questions and guidance on checking the original text, and published the revised version on 2026-10-10. Using Search Console date boundaries and excluding the publication day, the evaluation windows were 9/12–10/9 and 10/11–11/7, in month/day format.

The earlier period also includes the initial publication date and another revision made immediately before the one discussed here. Because multiple changes were made at the same time and fluctuations can also result from search demand and small counts, the before-and-after difference cannot be interpreted as the effect of this revision or the reference links alone. An improvement in traffic had not been demonstrated at the time of the investigation. When recording observations, distinguish the data that was available from what could not be obtained.

Start with one article: record readers' questions, the published content, the sources checked, and your revision hypothesis, then create a set of changes that can be reviewed. Use the post-publication comparison to help choose the next investigation, and treat changes in metrics separately from their causes. Checked on: 2026-11-17.
