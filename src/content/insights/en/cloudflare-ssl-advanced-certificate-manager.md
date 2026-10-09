---
title: "Cloudflare Universal SSL vs ACM: When You Need Paid Certificates"
description: 'Cloudflare’s former paid option "Dedicated SSL Certificates" was renamed and expanded in 2021 as "Advanced Certificate Manager (ACM)." This article explains the differences from free Universal SSL and when ACM is needed.'
date: 2026-03-31T00:00
author: gui
tags: ["Technology", "Cloudflare", "Security", "Infrastructure"]
image: "/images/insights/covers/cloudflare-ssl-advanced-certificate-manager-cover-v2.webp"
lastUpdated: "2026-10-09T15:00:00+09:00"
---

Start comparing Universal SSL and ACM by matching required hostnames to the certificate actually served before purchasing. Check the limitations in [Cloudflare: Advanced Certificates](https://developers.cloudflare.com/ssl/edge-certificates/advanced-certificate-manager/); for Pages or R2 custom domains, evaluate the certificate route provided by that product.

Cloudflare upgraded the former **Dedicated SSL Certificates** offering to **Advanced Certificate Manager (ACM)** in 2021. Choose a certificate after checking the hostnames and DNS setup involved.

## Where Universal SSL is enough

On a **full DNS setup**, free Universal SSL normally covers the apex and first-level subdomains. `*.example.com` covers `www.example.com`, but not `api.staging.example.com`. On a **CNAME (partial) setup**, Cloudflare provisions a Universal certificate for each proxied hostname regardless of depth. A deep subdomain therefore does not always require ACM.

Cloudflare now describes Universal certificates as free and unshared. The old claim that they are shared across unrelated sites is outdated.

<figure class="article-diagram" data-layout="compare" data-tone="amber" data-count="2" aria-labelledby="diagram-cloudflare-ssl-advanced-certificate-manager">
  <figcaption>
    <strong id="diagram-cloudflare-ssl-advanced-certificate-manager">Universal SSL coverage depends on the DNS setup</strong>
    <span>Coverage differs by DNS mode; subdomain depth alone does not determine whether ACM is needed.</span>
  </figcaption>
  <ol class="article-diagram__nodes">
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">1</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M12 3 19 6v5c0 4.5-3 7.5-7 10-4-2.5-7-5.5-7-10V6z"/><path d="M9 12h6"/></svg></span>
      <strong>Full DNS setup</strong>
      <span>Typically covers the apex and one subdomain level; deeper names fall outside that wildcard.</span>
    </li>
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">2</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18"/></svg></span>
      <strong>CNAME / partial setup</strong>
      <span>Issued per proxied hostname, regardless of subdomain depth.</span>
    </li>
  </ol>
</figure>

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
