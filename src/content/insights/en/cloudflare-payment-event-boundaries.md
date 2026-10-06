---
title: "Handling Payment and Refund Webhooks Safely: State Reconciliation in Workers"
description: "An implementation example that separates signature checks, duplicate and delayed events, refund state, and external API responses. It also explains rechecking authorization before administrative actions."
date: "2026-10-06T01:10:00+09:00"
lastUpdated: "2026-10-06T08:52:00+09:00"
author: gui
image: /images/insights/covers/cloudflare-payment-event-boundaries-cover-v1.webp
tags: ["Cloudflare Workers", "Stripe", "Security"]
callout:
  type: note
  title: "Separate implementation evidence from real transaction actions"
  text: "Implementation, tests, production deployment, and read-only reconciliation with external APIs were verified in this anonymized case. No customer refund, cancellation, or point adjustment was performed for testing, and the article does not claim end-to-end verification of every payment path."
---

Receiving a payment-provider event does not by itself complete an order or refund. This anonymized example shows how an operations flow on Workers reconciles provider state with local records. It omits customer details, live transaction identifiers, and internal notification destinations.

## Verify the signature and deduplicate at the entry point

Validate the signature against the unmodified request body and check whether the event is for the expected live or test mode. Record event processing and claim a processing lease so that redelivery of the same event does not repeat a business action. This does not guarantee events arrive in order. See the [official Stripe webhook guide](https://docs.stripe.com/webhooks).

## Use current provider state when a refund event is stale

This implementation handles `refund.created`, `refund.updated`, and `refund.failed`. For a refund under management, it retrieves the current Stripe object so a late event does not move the local record back to an older state. It distinguishes succeeded and pending refund amounts before deciding whether an order is fully refunded.

It checks amount, currency, PaymentIntent, metadata linking the order and operation, and identifiers already stored. Payment IDs can use the `py_` prefix and refund IDs the `pyr_` prefix; the implementation was adjusted so that a single known prefix does not reject a valid response. Supporting another prefix does not relax the amount and identity checks. Unknown values are not counted as zero.

## Keep refund, points, and notification outcomes separate

Check the balance and authorization before requesting a refund, then check authorization and operation expiry again after retrieving external state and immediately before the write. Use an operation-specific idempotency key and claim. If the external result is uncertain, reconcile current state instead of blindly issuing the refund again.

A successful refund and a successful points adjustment are different states. A later failure must not trigger the refund a second time; record any reconciliation or repair needed. Notification configuration, actual receipt, and staff follow-up are separate acceptance items from payment-event processing. This article makes no claim about notification operating status.

<figure class="article-diagram" data-layout="flow" data-tone="amber" data-count="3" aria-labelledby="diagram-cloudflare-payment-event-boundaries">
  <figcaption>
    <strong id="diagram-cloudflare-payment-event-boundaries">From webhook to separate outcomes</strong>
    <span>Check current state before recording completion. No customer refund or points operation was performed.</span>
  </figcaption>
  <ol class="article-diagram__nodes">
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">1</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M4 5h16v14H4z"/><path d="M8 9h8M8 12h5M8 15h3"/></svg></span>
      <strong>Verify at entry</strong>
      <span>Check the raw body, mode, and event ID; identify retries and in-progress work.</span>
    </li>
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">2</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5M8 10h5"/></svg></span>
      <strong>Reconcile current state</strong>
      <span>Do not roll records back for a stale event; compare amount, currency, and order.</span>
    </li>
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">3</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="4" y="5" width="6" height="14" rx="1"/><rect x="14" y="5" width="6" height="14" rx="1"/><path d="M11 12h2"/></svg></span>
      <strong>Record outcomes separately</strong>
      <span>Refunds, points, and notifications have separate states. Reconcile an unknown result instead of retrying the operation.</span>
    </li>
  </ol>
</figure>

## Check responses in both Node and the Workers runtime

Testing an external fetch only in Node can miss behavior in Workers. In this case, a `redirect: 'error'` compatibility issue was reproduced, then requests were changed to `redirect: 'manual'` with explicit HTTP status checks. Do not parse a 3xx response or error page as normal JSON, and do not automatically follow a redirect to another host with authorization attached. See the [Workers Request API](https://developers.cloudflare.com/workers/runtime-apis/request/).

## Record deployment and acceptance boundaries

Database changes, dependent processing, and the management UI were rolled out in sequence. Tests, CI, read-only production screens, and consistency with provider API reads were checked. No customer money operation was run as a test. CSV exports also treat cells that could be interpreted as formulas as text, and do not replace unknown fees with zero.

For the management login boundary, see [Session design across multiple services](/insights/multi-service-session-lifecycle/).
