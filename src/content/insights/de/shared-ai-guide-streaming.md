---
title: "KI-Hilfen mehrerer Websites verbinden und Antworten schrittweise anzeigen"
description: "Ein Bericht über gemeinsame Verarbeitung für KI-Hilfen öffentlicher Websites und die schrittweise Anzeige ihrer Antworten."
date: 2026-09-25T12:00
author: gui
image: https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=400&fit=crop&q=80
tags: ["Technology", "AI", "Cloudflare", "Websites"]
---

## Eigene Einstiege, gemeinsame Verarbeitung

Auf öffentlichen Acecore-Websites helfen KI-Assistenten beim Finden geeigneter Seiten und Kontaktwege. Im August 2026 wurden die Assistenten von Acecore und den Fachseiten auf gemeinsame serverseitige Verarbeitung ausgerichtet. Jede Seite behält passende Fragen und Ziele; eine API derselben Herkunft leitet Anfragen an einen gemeinsamen Worker weiter. Alpha von Aceserver verwendet einen anderen gemeinsamen Dienst für Portal und Wiki.

## Vorläufigen Text von der endgültigen Antwort trennen

Per SSE erscheint eingehender Text schrittweise in derselben Nachricht. Während der Generierung bleibt er reiner Text; geprüfte Links werden erst nach Abschluss dargestellt. Unvollständige Modellausgaben gelten damit nicht als vertrauenswürdiges HTML. Die bisherige JSON-Antwort bleibt kompatibel.

## Auf verbindliche Informationen verweisen

Auf der öffentlichen Systems-Seite haben wir den Assistenten und eine Antwort mit Kontaktlink geprüft. Die Oberfläche warnt davor, persönliche oder vertrauliche Daten einzugeben. Preise und Verträge sind auf offiziellen Seiten und mit dem Team zu bestätigen. Der [frühere Entwurfsartikel](/insights/astro-ai-contact-chat/) beschreibt Juni 2026; spätere Änderungen dokumentieren [Acecore](https://github.com/acecore-systems/acecore-net/pull/240), [Systems](https://github.com/acecore-systems/acecore-systems/pull/58), [Portal](https://github.com/acecore-systems/aceserver-portal/pull/111) und [Wiki](https://github.com/acecore-systems/aceserver-wiki/pull/81).
