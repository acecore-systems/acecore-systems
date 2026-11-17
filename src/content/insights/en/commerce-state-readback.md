---
title: "Reading Back and Reconciling Commerce Integration States: Separating Products, Shipments, and Ad Review"
description: "Learn how to check the store DB, manufacturer, and Merchant Center separately, without confusing submission acceptance with publication, shipment, or ad placement."
date: "2026-11-17T12:00:00+09:00"
author: gui
image: /images/insights/covers/cloudflare-payment-event-boundaries-cover-v1.webp
tags: ["E-commerce", "API", "Operations"]
---

In e-commerce, product registration, orders to manufacturers, delivery, and external product data submissions proceed separately. A record of success in one system alone cannot establish the current state of another. This article outlines how to reconcile these states through readback.

<figure class="article-diagram" data-layout="flow" data-tone="blue" data-count="3" aria-labelledby="diagram-commerce-state-readback">
  <figcaption><strong id="diagram-commerce-state-readback">Reading Back and Reconciling Commerce Integration States: Separating Products, Shipments, and Ad Review</strong><span>Learn how to check the store DB, manufacturer, and Merchant Center separately, without confusing submission acceptance with publication, shipment, or ad placement.</span></figcaption>
  <ol class="article-diagram__nodes">
    <li><strong>Store</strong><span>Read product and order records.</span></li>
    <li><strong>Manufacturing and shipping</strong><span>Reconcile the manufacturer's order and shipment states.</span></li>
    <li><strong>Product review</strong><span>Distinguish submission acceptance from the state after processing.</span></li>
  </ol>
</figure>

## Check each state separately

| Where to check  | What to examine                                   | What that alone cannot tell you                                                  |
| --------------- | ------------------------------------------------- | -------------------------------------------------------------------------------- |
| Store           | Publication settings and product and order states | Manufacturer processing or delivery completion                                   |
| Manufacturer    | Order, manufacturing, and shipment states         | Store display or ad placement                                                    |
| Merchant Center | Product states and issues after submission        | Whether the product can be purchased in the store or an ad is actually displayed |

Use identifiers and versions that refer to the same item for reconciliation, and record retrieval times and failures. If data cannot be retrieved, leave the state unconfirmed rather than treating an old success as the current state. [Cloudflare D1 queries](https://developers.cloudflare.com/d1/best-practices/query-d1/) and the [Printful API documentation](https://developers.printful.com/docs/edm/) are starting points for checking data and manufacturer information, respectively.

## Submission acceptance and readback after processing

In our internal Merchant integration, we check whether the version accepted for submission matches the version and attributes of the product information read back later. We encountered cases where they did not match despite acceptance, so we added diagnostics that record fixed reasons, such as the item not existing, a version mismatch, or an attribute mismatch. Product attribute values and credentials are not included in diagnostic logs.

Acceptance does not guarantee a match after processing or ad placement. The [Google Merchant API product management documentation](https://developers.google.com/merchant/api/guides/products/overview) explains how submitted products and processed information are handled. Product publication in the store and external product review and ad display also require separate checks.

## Do not repeat writes when the result is unknown

If a response to a creation or submission request is lost, assuming it failed and resending it may cause duplicates. First, reconcile the state by reading the item and checking its history; if the result cannot be determined, hold off. When reconciling shipments, do not expose real orders or tracking information containing personal data in public logs; only the relevant personnel should check them. First, test 4 cases with fictitious orders: normal, delayed, not retrieved, and mismatched. Checked on: 2026-11-17.
