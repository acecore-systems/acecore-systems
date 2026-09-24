---
title: "How We Moved Semantic Search Across Our Sites to Cloudflare Workers AI"
description: "A practical account of migrating the embeddings used by Acecore's public site search to BGE-M3, including rollout and evaluation."
date: 2026-09-25T12:00
author: gui
tags: ["Technology", "Cloudflare", "Vectorize", "Site search"]
image: /images/insights/vectorize-rag-hero.webp
---

Several Acecore public sites use Cloudflare Vectorize to find related pages even when a question does not use the same words as a heading. In August 2026, we moved the embedding model for queries and published pages to BGE-M3 on Cloudflare Workers AI, one site at a time.

## Prepare a separate index

Changing the model also changes the vector dimensions. We created new indexes instead of reusing the old ones, synchronized the search data built from published pages, and checked that vector IDs matched. We tested real queries before switching traffic and kept the previous indexes for recovery.

## Test with actual questions

On Acecore Systems, we evaluated 12 representative queries. The expected page ranked first for 10 queries and appeared in the top five for all 12. Four unrelated queries were suppressed by the threshold used at the time. This was a small rollout evaluation, not a guarantee for every future query.

## Update what visitors see

We updated search and privacy notices to reflect where processing actually occurs. Ordinary keyword search remains available alongside semantic search. We continue to check relevance, response time, and whether the index contains only public information.
