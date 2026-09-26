---
title: "Cloudflare Advanced Certificate Manager (ACM)"
description: 'Cloudflare’s former paid option "Dedicated SSL Certificates" was renamed and expanded in 2021 as "Advanced Certificate Manager (ACM)." This article explains the differences from free Universal SSL and when ACM is needed.'
date: 2026-03-31T00:00
author: gui
tags: ["Technology", "Cloudflare", "Security", "Infrastructure"]
image: /uploads/acecore-generated/blog-cloudflare-ssl-advanced-certificate-manager.webp
lastUpdated: "2026-09-26T18:45:00+09:00"
---

Cloudflare upgraded the former **Dedicated SSL Certificates** offering to **Advanced Certificate Manager (ACM)** in 2021. Choose a certificate after checking the hostnames and DNS setup involved.

## Where Universal SSL is enough

On a **full DNS setup**, free Universal SSL normally covers the apex and first-level subdomains. `*.example.com` covers `www.example.com`, but not `api.staging.example.com`. On a **CNAME (partial) setup**, Cloudflare provisions a Universal certificate for each proxied hostname regardless of depth. A deep subdomain therefore does not always require ACM.

Cloudflare now describes Universal certificates as free and unshared. The old claim that they are shared across unrelated sites is outdated.

## When to consider ACM

ACM is a paid add-on. It lets you select the CA, validation method, validity period, and covered hostnames. One advanced certificate can contain up to 50 hostnames, including the zone apex. Available validity periods depend on the CA and plan; **one year is limited to Enterprise customers using SSL.com**. Not every plan can freely choose any period from 14 to 365 days.

For automatic coverage of deeper proxied hostnames on a full DNS setup, consider **Total TLS**. For selected hostnames, an advanced or custom certificate may suffice. Total TLS requires a full DNS setup and excludes hostnames used with some other Cloudflare products, including Tunnel.

**Advanced certificates do not apply to Cloudflare Pages or R2 custom domains.** Those products use a different certificate path. Buying ACM for a Pages website will not apply its advanced certificate to the Pages hostname.

## Check before purchasing

1. List the hostnames and identify whether the zone uses full DNS or CNAME setup.
2. Check actual Universal SSL coverage.
3. Confirm the CA, validity, and Total TLS conditions you need.
4. Check current pricing and purchase terms in the Cloudflare dashboard for your plan.

Do not buy solely for how the certificate common name appears; verify that the required hostnames are covered by its SAN entries.

## Official sources

- [Universal SSL limitations](https://developers.cloudflare.com/ssl/edge-certificates/universal-ssl/limitations/)
- [Advanced certificates](https://developers.cloudflare.com/ssl/edge-certificates/advanced-certificate-manager/)
- [Validity periods and renewal](https://developers.cloudflare.com/ssl/reference/certificate-validity-periods/)
- [Total TLS](https://developers.cloudflare.com/ssl/edge-certificates/additional-options/total-tls/)
