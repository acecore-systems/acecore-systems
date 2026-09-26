---
title: "Sicherheitsheader für statische Dateien und Functions von Cloudflare Pages"
description: "Unterscheiden Sie statische Pages-Antworten von Functions und prüfen Sie _headers, CSP und die aktuelle Konfiguration."
date: 2026-03-15T00:00
author: gui
tags: ["Technologie", "Cloudflare", "Sicherheit"]
image: /uploads/acecore-generated/blog-cloudflare-pages-security.webp
lastUpdated: "2026-09-26T19:12:47+09:00"
---

Dieser Artikel dokumentierte im März 2026 den Wechsel von einem Worker-Kontaktformular zu einem externen Dienst und zurück zur statischen Auslieferung mit Cloudflare Pages. Seitdem hat sich die Architektur geändert. **Im September 2026 nutzt die Unternehmenswebsite von Acecore neben statischen Seiten auch Pages Functions** für Kontakt, Kommentare, Suche, KI-Hilfe und CMS-APIs. Die frühere Entscheidung ist historischer Kontext.

## Statische Antworten und Functions unterscheiden

`public/_headers` gilt für **Antworten statischer Dateien**, die Pages ausliefert. Cloudflare stellt klar, dass diese Regeln nicht für von Pages Functions erzeugte Antworten gelten, selbst wenn das URL-Muster passt. Nötige CORS-, Cache- und Sicherheitsheader müssen in der `Response` der Function gesetzt werden.

Gehen Sie nicht davon aus, dass `_headers` alle Seiten und APIs schützt. Prüfen Sie die tatsächlichen Header von statischem HTML und `/api/*` getrennt.

## Aktuelle Konfiguration prüfen

Die [aktuelle `_headers`-Datei](https://github.com/acecore-systems/acecore-net/blob/main/public/_headers) lässt HTML neu validieren und speichert gehashte `_astro/`-Dateien länger zwischen. Das CMS hat eine eigene CSP; `X-Frame-Options` ist `SAMEORIGIN`. Übernehmen Sie `form-action https://ssgform.com`, eine Stunde HTML-Cache oder `DENY` aus dem alten Artikel nicht als aktuelle Werte.

Dynamische Routen stehen im [Pages-Functions-Code](https://github.com/acecore-systems/acecore-net/tree/main/functions). Stimmen Sie CSP-Quellen auf tatsächlich genutzte Skripte, Bilder, Frames und Verbindungen Ihrer eigenen Website ab, statt Acecores Richtlinie ungeprüft zu kopieren.

## Deployment und Prüfung

Die Website veröffentlicht `main` über mit GitHub verbundene Cloudflare Pages. Die aktuelle Node-Version steht in [`.node-version`](https://github.com/acecore-systems/acecore-net/blob/main/.node-version); CI führt `npm run build` aus `package.json` aus. Die Tabelle vom März 2026 mit „Node.js 22 / npx astro build“ ist historisch.

Prüfen Sie PR-Vorschau, main-Build, Pages-Produktionsdeployment und öffentliche URL separat. Beachten Sie die [Cloudflare-Dokumentation zu Pages-Headern](https://developers.cloudflare.com/pages/configuration/headers/).
