---
title: "Edge-Caching öffentlicher Bilder von API-Ratenbegrenzungen trennen"
description: "Ein Fall, in dem Inhalts-API und Bildanfragen beim wiederholten Aufrufen dasselbe Limit teilten. Behandelt werden die Wiederverwendung öffentlicher Bilder, die Prüfung erfolgreicher Antworten, die Grenzen zwischen WAF und Anwendung sowie Produktionsprüfungen."
date: "2026-10-06T02:20:00+09:00"
author: gui
image: /images/insights/public-image-cache-and-api-rate-limits.webp
tags: ["Cloudflare", "Performance", "Web"]
callout:
  type: note
  title: "Cache und Ratenbegrenzung getrennt prüfen"
  text: "Dieser Fall bestätigt die Implementierung, CI, die Produktionsauslieferung über die GitHub-Integration und den Abgleich repräsentativer Bildinhalte mit dem Cache-Status. Er misst weder die Cache-Trefferrate an allen Rechenzentrumsstandorten noch Leistungsgewinne unter hoher Last."
---

Bei Tagebüchern und Katalogen mit Bildern löst jeder Wechsel von Datum oder Seite Anfragen an die Inhalts-API und an die Bilder aus. Wir beschreiben einen Fall, in dem Bilder beim wiederholten Aufrufen nicht mehr geladen wurden, ohne Betriebs-URLs, interne Routen oder Grenzwerte offenzulegen.

## Inhalt und Bilder teilten dasselbe Ratenlimit

In diesem Fall wurden Anfragen an eine dynamische API und GET-Anfragen für öffentliche Bilder von derselben WAF-Ratenbegrenzungsregel gezählt. Schon normale Seitenwechsel konnten mehrere Anfragen gleichzeitig auslösen: Der Inhalt wurde geladen, die Bilder konnten jedoch begrenzt werden.

Ein Edge-Cache für Bilder hilft Anfragen nicht, die von der WAF blockiert werden, bevor sie ihn erreichen. Wir haben die Last am Ursprung und die Anfragetypen, die innerhalb desselben Limits gezählt werden, getrennt geändert. Bestehende Anwendungslimits und Quoten für die Generierung bleiben für ihre jeweiligen Zwecke bestehen.

## Nur teilbare öffentliche Bilder wiederverwenden

Die hier behandelten Bilder sind unveränderlich: Dieselbe öffentliche Asset-ID liefert immer denselben Inhalt. Wir validieren das Format der Asset-ID, die Anfragengrenze und die Konfiguration des Service Bindings, bevor wir einen Cache-Eintrag für denselben Host und dieselbe Asset-ID abrufen. Auch bei einem warmen Cache überspringen wir diese Eingangsprüfungen nicht.

Query-Strings ohne Einfluss auf den Inhalt und Anfrage-Header des Endnutzers erzeugen keine getrennten Cache-Einträge für dasselbe Bild. Das ist nur möglich, weil es sich um unveränderliche öffentliche Bilder handelt. Auf private Bilder, deren Inhalt je nach Benutzer oder Organisation variiert, lässt sich dies nicht unverändert übertragen.

## Nur geprüfte 200-Antworten speichern

Bei einem Cache-Miss wird das Bild über ein privates Service Binding abgerufen. Wir prüfen HTTP-Status, Content-Type des Bildes, Content-Length und Antwort-Body und speichern nur eine 200-Antwort, die diese Bedingungen erfüllt. Teilantworten, leere Bodys, ungültige Metadaten und Fehlerantworten werden nicht gespeichert.

Das Speichern des Bildinhalts ist etwas anderes als eine 304-Antwort bei übereinstimmendem ETag. Cache-Schreibvorgänge werden mit waitUntil eingeplant. Fehler beim Lesen oder Schreiben des Caches dürfen die Rückgabe eines gültigen, vom Ursprung abgerufenen Bildes nicht verhindern. Kann eine spätere Anfrage den Cache verwenden, entfällt der Abruf über das Service Binding.

Die [Cloudflare Cache API](https://developers.cloudflare.com/workers/runtime-apis/cache/) beschreibt bedingte Anfragen mit ETag und die Cache-Eigenschaften je Rechenzentrum. Ein HIT an einem Standort bedeutet nicht, dass alle Standorte einen HIT haben. Antwort-Header von Pages Functions lassen sich nicht ausschließlich über die [_headers für statische Dateien](https://developers.cloudflare.com/pages/configuration/headers/) festlegen; sie müssen in der Function verwaltet werden.

## Limits für dynamische APIs unabhängig behandeln

Der Schutz der dynamischen API ist eine andere Anforderung als das Caching von Bildern. In diesem Fall haben wir GET-Anfragen öffentlicher Bilder von der WAF-Zählung ausgenommen und nach der Anwendung die betroffenen dynamischen APIs, den Limitzeitraum, die Aktion und den Aktivierungsstatus erneut ausgelesen. Die vorherige Konfiguration wurde außerdem für einen Rollback gespeichert.

Wähle Grenzwerte anhand der Anfragen, die beim normalen Aufrufen entstehen, und der Last des zu schützenden Vorgangs. Auch die planabhängigen Bedingungen der [Cloudflare-Ratenbegrenzung](https://developers.cloudflare.com/waf/rate-limiting-rules/) müssen geprüft werden. Ein Wert in einer Betriebsnotiz im Repository beweist nicht, dass eine Produktionsregel aktiviert ist.

## Bildinhalte in der Produktion prüfen

Unit-Tests prüften die Wiederverwendung desselben öffentlichen Bildes, die Trennung nach Host und Asset-ID, die Prüfung der Grenze vor der Cache-Nutzung, 304-Antworten, Cache-Fehler und Antworten, die nicht gespeichert werden dürfen. Nach CI bestätigten wir das Produktionsdeployment über einen GitHub-Push und die Custom Domain. Anschließend verglichen wir das HTTP-Ergebnis repräsentativer Bilder, den von der Anwendung angezeigten HIT- oder MISS-Status und den Hash der abgerufenen Bytes.

In der Produktion riefen wir außerdem den Inhalt und mehrere Bilder nacheinander ab und bestätigten, dass die Anfragen unter dieser Testbedingung für normales Browsen nicht begrenzt wurden. Dies war die Prüfung eines begrenzten Anfragemusters, kein Test der Grenze unter hoher Last.

Eine Anzeige des Cache-Status allein beweist nicht, dass das richtige Bild zurückgegeben wurde. Wir prüfen das Abrufen des Inhalts, der Bilder, die WAF-Konfiguration und das Anzeigeergebnis in der UI getrennt. Dieser Bericht bestätigt die Auslieferung repräsentativer Bilder; er belegt weder kontinuierliches Aufrufen durch alle Benutzer und an allen Standorten noch Leistungsgewinne unter hoher Last.

Zur Aufteilung statischer und dynamischer Bereiche der Website siehe [das Gesamtdesign von Astro und Cloudflare](/insights/astro-cloudflare-site-architecture/). Zur Optimierung der Auslieferung von Bildern, CSS und anderen Ressourcen siehe [Astro-Performance-Tuning](/insights/astro-performance-tuning/).
