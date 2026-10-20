---
title: "Cloudflare Pages: Sicherheitsheader mit _headers und Functions konfigurieren"
description: "So prüfen Sie, warum Sicherheitsheader in Cloudflare Pages fehlen:
  die Zuständigkeit von _headers für statische Assets, Functions-Responses,
  aktuelle Einstellungen und Prüfungen nach dem Deployment."
date: 2026-03-15T00:00
author: gui
tags: ["Technologie", "Cloudflare", "Sicherheit"]
image: "/images/insights/covers/cloudflare-pages-security-cover-v2.webp"
lastUpdated: "2026-10-20T09:59:18Z"
---

Wenn CSP- oder Cache-Einstellungen in Cloudflare Pages nicht greifen, prüfen Sie zuerst, ob die Antwort von einem statischen Asset oder einer Pages Function stammt. Dieser Artikel erklärt, wo `_headers` und die `Response` einer Function gelten, wo Sie die aktuelle Konfiguration finden und was nach der Veröffentlichung zu prüfen ist. Prüfen Sie die Header sowohl erfolgreicher Antworten als auch von Fehlerantworten, um fehlende Konfigurationen nach dem Hinzufügen einer API leichter zu erkennen.

Der Artikel dokumentiert den Ablauf im März 2026: Der Kontakt wurde auf ein externes Formular umgestellt und die Website wieder statisch mit Cloudflare Pages ausgeliefert. Seitdem hat sich die Architektur geändert. **Im September 2026 nutzt die offizielle Website von Acecore neben statischen Seiten auch Pages Functions** für Kontakt, Kommentare, Suche, KI-Hilfe und CMS-APIs. Im Folgenden werden die damaligen Entscheidungsgründe und die weiterhin relevante Grenze der Header-Konfiguration erläutert.

## Wie unterscheiden sich Header für statische Antworten und Functions in Cloudflare Pages?

`public/_headers` gilt für **Antworten statischer Assets**, die Pages ausliefert. Die [veröffentlichte Quelldatei der Cloudflare-Dokumentation zu Headers](https://github.com/cloudflare/cloudflare-docs/blob/production/src/content/docs/pages/configuration/headers.mdx) erklärt, dass die Regeln in `_headers` auf Antworten statischer Assets angewendet werden. Die Dokumentation [Cloudflare Pages: Headers](https://developers.cloudflare.com/pages/configuration/headers/) weist außerdem darauf hin, dass die Regeln nicht für von Pages Functions erzeugte Antworten gelten, selbst wenn ein URL-Muster übereinstimmt. Erforderliche CORS-, Cache- und Sicherheitsheader für API-Antworten müssen in der `Response` der Function gesetzt werden.

Gehen Sie daher nicht davon aus, dass eine einzige `_headers`-Datei für alle Seiten und APIs gilt. Prüfen Sie die tatsächlichen Antwortheader für statisches HTML und `/api/*` getrennt.

<figure class="article-diagram" data-layout="boundary" data-tone="teal" data-count="2" aria-labelledby="diagram-cloudflare-pages-security">
  <figcaption>
    <strong id="diagram-cloudflare-pages-security">Konfigurationsgrenze zwischen statischen und Function-Antworten</strong>
    <span>Statische Dateien und APIs erhalten ihre Header an unterschiedlichen Stellen. Prüfen Sie nach der Veröffentlichung beide Antworten einzeln.</span>
  </figcaption>
  <ol class="article-diagram__nodes">
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">1</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M5 3h10l4 4v14H5z"/><path d="M15 3v5h5M8 12h8M8 16h8"/></svg></span>
      <strong>Antwort statischer Dateien</strong>
      <span>Mit _headers konfigurieren und die von Pages gelieferte Antwort prüfen.</span>
    </li>
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">2</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M8 9h8M8 12h4M8 16h8"/></svg></span>
      <strong>API-Antwort einer Function</strong>
      <span>Header in der Response der Function setzen und die API-Antwort separat prüfen.</span>
    </li>
  </ol>
</figure>

## Wo finden Sie die aktuelle Header-Konfiguration?

Die [aktuelle `_headers`-Datei](https://github.com/acecore-systems/acecore-net/blob/main/public/_headers) lässt HTML neu validieren und sieht für gehashte `_astro/`-Assets eine langfristige Zwischenspeicherung vor. Für das CMS ist eine eigene CSP angegeben; `X-Frame-Options` steht auf `SAMEORIGIN`. Übernehmen Sie die im älteren Artikel genannten Werte `form-action https://ssgform.com`, eine Stunde HTML-Cache oder `DENY` nicht als aktuelle Konfiguration.

Dynamische Routen finden Sie im [Code der Pages Functions](https://github.com/acecore-systems/acecore-net/tree/main/functions). Stimmen Sie die in der CSP erlaubten externen Domains auf die Skripte, Bilder, Frames und Verbindungsziele ab, die tatsächlich geladen werden. Übernehmen Sie die veröffentlichte Konfiguration nicht ungeprüft für eine andere Website.

## Was sollten Sie nach dem Deployment prüfen?

Die offizielle Website wird über mit GitHub verbundene Cloudflare Pages aus dem Branch `main` veröffentlicht. Die [aktuelle Node-Version](https://github.com/acecore-systems/acecore-net/blob/main/.node-version) steht in `.node-version`; die Build-Schritte sind in `package.json` festgelegt. CI prüft mit `npm run build`. Die Tabelle aus März 2026 mit „Node.js 22 / npx astro build“ beschreibt nicht den aktuellen Veröffentlichungsablauf.

Prüfen Sie die PR-Vorschau, den Build von `main`, das Pages-Produktionsdeployment sowie Header und Inhalt der veröffentlichten URL jeweils getrennt. Die [offizielle Cloudflare-Dokumentation zu Pages-Headers](https://developers.cloudflare.com/pages/configuration/headers/) beschreibt die Konfiguration mit `_headers`.
