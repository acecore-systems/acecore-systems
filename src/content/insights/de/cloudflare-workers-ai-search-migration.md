---
title: "So haben wir die semantische Suche mehrerer Websites zu Cloudflare Workers AI migriert"
description: "Ein Praxisbericht über die Migration der Such-Embeddings öffentlicher Acecore-Websites zu BGE-M3 und deren Bewertung."
date: 2026-09-25T00:00
author: gui
tags: ["Technik", "Cloudflare", "Vectorize", "Website-Suche"]
image: /images/insights/vectorize-rag-hero.webp
---

Mehrere öffentliche Acecore-Websites nutzen Cloudflare Vectorize, um passende Seiten auch dann zu finden, wenn eine Frage andere Wörter als die Überschrift verwendet. Im August 2026 haben wir das Embedding-Modell für Suchanfragen und veröffentlichte Seiten schrittweise auf BGE-M3 in Cloudflare Workers AI umgestellt.

## Einen neuen Index vorbereiten

Mit dem Modell ändern sich auch die Vektordimensionen. Wir legten neue Indizes an, statt die bisherigen weiterzuverwenden, synchronisierten Suchdaten aus veröffentlichten Seiten und prüften die IDs. Vor der Umstellung testeten wir echte Anfragen und behielten die alten Indizes für eine mögliche Wiederherstellung.

## Mit echten Fragen bewerten

Bei Acecore Systems bewerteten wir 12 repräsentative Anfragen. Die erwartete Seite stand bei 10 Anfragen an erster Stelle und bei allen 12 unter den ersten fünf. Vier unpassende Anfragen wurden durch den damals geltenden Schwellenwert ausgeschlossen. Das war eine kleine Bewertung während der Migration, keine Garantie für jede künftige Anfrage.

## Hinweise für Besucher aktualisieren

Wir passten die Suchoberfläche und Datenschutzhinweise an den tatsächlichen Verarbeitungsort an. Die normale Stichwortsuche bleibt neben der semantischen Suche verfügbar. Wir prüfen weiterhin Relevanz, Antwortzeit und ob der Index ausschließlich öffentliche Informationen enthält.
