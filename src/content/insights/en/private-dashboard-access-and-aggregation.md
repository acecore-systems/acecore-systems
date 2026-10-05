---
title: "Building an Access-Protected Operations Dashboard with Cloudflare Pages and D1"
description: "An anonymized design for protecting the entry point with Cloudflare Access and reading operational aggregates from D1 through Pages Functions. It separates verified production delivery, authenticated UI, and database-index use from items not tested."
date: "2026-10-06T01:10:00+09:00"
lastUpdated: "2026-10-06T01:10:00+09:00"
author: gui
image: "/images/insights/private-dashboard-access-and-aggregation.webp"
tags: ["Cloudflare Pages", "Cloudflare D1", "Security"]
callout:
  type: note
  title: "Separate implementation, production UI, and index verification"
  text: "This anonymized case implements an Access-protected Pages interface and read-only D1 aggregates. GitHub-connected production delivery, the authenticated UI, and index use by a production query were verified. Large-scale load and multi-organization performance were not tested."
---

When operational information is scattered across logs and databases, it can be hard for staff to check the current state safely. This anonymized dashboard example explains how to verify access, aggregation, and delivery. It omits domain names, accounts, post content, and live operational figures.

## Put the page and API behind the access boundary

Hiding a static Cloudflare Pages screen is not enough if its data API can still be called directly. Include both the interface and API in the Cloudflare Access boundary, so only operators can read the data. As a verification procedure, test the page and data API before and after authentication. In this case, production checks confirmed the page’s authentication boundary and that data appeared in the UI after dedicated sign-in. A direct unauthenticated request to the API endpoint is not confirmed in the available record and remains a separate acceptance check. Do not put authentication secrets in browser code.

## Separate writes from read-only aggregation

A GET endpoint in Pages Functions queries D1 and combines hourly counts, recent processing state, and execution mode in one response. Limit the dashboard API itself to read-only use; do not rely on hiding a button in the interface. Define the time range, time zone, and meaning of confirmed versus pending states so that unlike counts are not combined. Show missing or unresolved values separately instead of treating them as successful actions or zero.

## Verify D1 indexes against the aggregation query

Operations screens repeatedly filter recent time ranges, so their appearance alone cannot prove that an index is useful. After adding an index for the actual aggregation conditions, inspect the query plan in production D1 and confirm that the intended index is used. Creating an index and confirming that a query uses it are separate checks. Both were verified in this case, but no benchmark established a response-time improvement or resilience under large workloads.

## Check authentication and rendering after production delivery

Deploy Pages to production through GitHub integration, then verify deployment success for the intended commit and that the custom domain is active. Afterward, check that the page is protected before authentication and that the dashboard data renders after sign-in. CI or a successful deployment alone does not prove that an authenticated operator can see the production UI.

This anonymized case verified the access boundary, production screen, and use of an index by the D1 aggregation query in one operations environment. It did not test permissions across multiple organizations, load at higher user volumes, or penetration scenarios across all authentication settings. For the broader Pages site architecture, see [Cloudflare Pages site architecture](/insights/astro-cloudflare-site-architecture/).
