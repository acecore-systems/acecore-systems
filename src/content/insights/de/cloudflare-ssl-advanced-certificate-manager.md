---
title: "Was war die frühere kostenpflichtige SSL-Option von Cloudflare? Von Dedicated SSL zu Advanced Certificate Manager"
description: "Die früher kostenpflichtige Cloudflare-Option „Dedicated SSL Certificates“ wurde 2021 in „Advanced Certificate Manager (ACM)“ umbenannt und erweitert. Dieser Artikel erklärt die Unterschiede zu Universal SSL und wann ACM erforderlich ist."
date: 2026-03-31T00:00
author: gui
tags: ["Technologie", "Cloudflare", "Sicherheit", "Infrastruktur"]
image: "/images/insights/covers/cloudflare-ssl-advanced-certificate-manager-cover-v2.webp"
lastUpdated: "2026-10-06T13:58:01+09:00"
---

Cloudflare entwickelte **Dedicated SSL Certificates** 2021 zum **Advanced Certificate Manager (ACM)** weiter. Prüfen Sie vor der Zertifikatswahl die Hostnamen und die DNS-Einrichtung.

## Reichweite von Universal SSL

Bei einem **vollständigen DNS-Setup** deckt das kostenlose Universal SSL normalerweise die Root-Domain und Subdomains der ersten Ebene ab. `*.example.com` umfasst `www.example.com`, aber nicht `api.staging.example.com`. Bei einem **CNAME-Setup (teilweise)** stellt Cloudflare für jeden über den Proxy geleiteten Hostnamen unabhängig von seiner Tiefe ein Universal-Zertifikat aus. Eine tiefere Subdomain erfordert daher nicht immer ACM.

Cloudflare bezeichnet Universal-Zertifikate heute als kostenlos und nicht geteilt. Die alte Aussage, sie würden zwischen Websites geteilt, ist überholt.

<figure class="article-diagram" data-layout="compare" data-tone="amber" data-count="2" aria-labelledby="diagram-cloudflare-ssl-advanced-certificate-manager">
  <figcaption>
    <strong id="diagram-cloudflare-ssl-advanced-certificate-manager">Der Umfang von Universal SSL hängt vom DNS-Modus ab</strong>
    <span>Der Umfang variiert je nach DNS-Modus; die Subdomain-Tiefe allein entscheidet nicht über ACM.</span>
  </figcaption>
  <ol class="article-diagram__nodes">
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">1</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M12 3 19 6v5c0 4.5-3 7.5-7 10-4-2.5-7-5.5-7-10V6z"/><path d="M9 12h6"/></svg></span>
      <strong>Full DNS setup</strong>
      <span>Deckt üblicherweise Apex und eine Subdomain-Ebene ab; tiefere Namen liegen außerhalb dieses Wildcards.</span>
    </li>
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">2</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18"/></svg></span>
      <strong>CNAME / partial setup</strong>
      <span>Wird je proxied Hostname ausgestellt, unabhängig von der Subdomain-Tiefe.</span>
    </li>
  </ol>
</figure>

## Wann ACM sinnvoll ist

ACM ist ein kostenpflichtiges Add-on. Sie können CA, Validierungsmethode, Gültigkeitsdauer und Hostnamen auswählen. Ein Advanced-Zertifikat umfasst bis zu 50 Hostnamen einschließlich der Root-Domain. Verfügbare Laufzeiten hängen von CA und Tarif ab; **ein Jahr ist Enterprise-Kunden mit SSL.com vorbehalten**. Nicht jeder Tarif erlaubt jede Dauer zwischen 14 und 365 Tagen.

Für die automatische Absicherung tieferer Proxy-Subdomains im vollständigen DNS-Setup kommt **Total TLS** infrage. Für einzelne Namen kann ein Advanced- oder eigenes Zertifikat genügen. Total TLS setzt ein vollständiges DNS-Setup voraus und schließt Hostnamen einiger anderer Produkte, etwa Cloudflare Tunnel, aus.

**Advanced-Zertifikate gelten nicht für benutzerdefinierte Domains von Cloudflare Pages oder R2.** Diese Produkte nutzen einen anderen Zertifikatspfad. Ein ACM-Kauf für eine Pages-Website weist dem Pages-Hostnamen kein Advanced-Zertifikat zu.

## Vor dem Kauf prüfen

1. Hostnamen auflisten und vollständiges DNS- oder CNAME-Setup feststellen.
2. Die tatsächliche Abdeckung durch Universal SSL prüfen.
3. Benötigte CA, Laufzeit und Total-TLS-Voraussetzungen prüfen.
4. Aktuelle Preise und Konditionen im Cloudflare-Dashboard des eigenen Tarifs prüfen.

Kaufen Sie nicht allein wegen des angezeigten Common Name (CN); prüfen Sie, ob alle nötigen Hostnamen in den SAN-Einträgen stehen.

## Official sources

- [Universal SSL limitations](https://developers.cloudflare.com/ssl/edge-certificates/universal-ssl/limitations/)
- [Advanced certificates](https://developers.cloudflare.com/ssl/edge-certificates/advanced-certificate-manager/)
- [Validity periods and renewal](https://developers.cloudflare.com/ssl/reference/certificate-validity-periods/)
- [Total TLS](https://developers.cloudflare.com/ssl/edge-certificates/additional-options/total-tls/)
