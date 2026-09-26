---
title: "Was war die frühere kostenpflichtige SSL-Option von Cloudflare? Von Dedicated SSL zu Advanced Certificate Manager"
description: "Die früher kostenpflichtige Cloudflare-Option „Dedicated SSL Certificates“ wurde 2021 in „Advanced Certificate Manager (ACM)“ umbenannt und erweitert. Dieser Artikel erklärt die Unterschiede zu Universal SSL und wann ACM erforderlich ist."
date: 2026-03-31T00:00
author: gui
tags: ["Technologie", "Cloudflare", "Sicherheit", "Infrastruktur"]
image: /uploads/acecore-generated/blog-cloudflare-ssl-advanced-certificate-manager.webp
lastUpdated: "2026-09-26T18:45:00+09:00"
---

Cloudflare entwickelte **Dedicated SSL Certificates** 2021 zum **Advanced Certificate Manager (ACM)** weiter. Prüfen Sie vor der Zertifikatswahl die Hostnamen und die DNS-Einrichtung.

## Reichweite von Universal SSL

Bei einem **vollständigen DNS-Setup** deckt das kostenlose Universal SSL normalerweise die Root-Domain und Subdomains der ersten Ebene ab. `*.example.com` umfasst `www.example.com`, aber nicht `api.staging.example.com`. Bei einem **CNAME-Setup (teilweise)** stellt Cloudflare für jeden über den Proxy geleiteten Hostnamen unabhängig von seiner Tiefe ein Universal-Zertifikat aus. Eine tiefere Subdomain erfordert daher nicht immer ACM.

Cloudflare bezeichnet Universal-Zertifikate heute als kostenlos und nicht geteilt. Die alte Aussage, sie würden zwischen Websites geteilt, ist überholt.

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
