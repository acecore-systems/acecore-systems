---
title: "Benutzer-CSS und öffentliche Themes sicher verwalten"
description: "Ein allgemeiner Leitfaden zur Profilbearbeitung mit grafischen Steuerelementen und selbst geschriebenem CSS. Behandelt werden erlaubte CSS-Regeln, Entwürfe und veröffentlichte Fassungen, unveränderliche Theme-Versionen sowie Auslistung und betriebliche Sperre."
date: "2026-10-06T01:10:00+09:00"
author: gui
image: /images/insights/user-css-versioned-theme-safety.webp
tags: ["CSS", "Security", "Web"]
callout:
  type: note
  title: "Implementierungsprüfungen sind keine vollständige Abnahme durch Nutzer"
  text: "Dieser anonymisierte Fall umfasst die Implementierung, eine Datenbankänderung, die Bereitstellung in Produktion und die Darstellung mit Testdaten. Zum Prüfzeitpunkt gab es keine öffentlichen Themes. Ein vollständiger Ablauf mit Einreichung und Anwendung durch echte Nutzer sowie kostenpflichtige Verkäufe wurde nicht nachgewiesen."
---

Ein Profil-Editor, in dem sich Farben und Abstände über eine grafische Oberfläche anpassen und optional begrenzte CSS-Syntax selbst schreiben lassen, muss sowohl die Bedienbarkeit als auch die Sicherheit des auf öffentlichen Seiten angezeigten Codes berücksichtigen. Dieser anonymisierte Implementierungsfall zeigt, wie sich Bearbeitung und Verteilung trennen lassen.

## CSS durch eine kleine Grammatik begrenzen

Füge nicht beliebiges CSS direkt in eine öffentliche Seite ein. Analysiere die Syntax und lasse nur unterstützte Komponenten, Eigenschaften und Werte zu. Die aktuelle Implementierung beschränkt sich bewusst auf eine kleine Grammatik; eine freiere CSS-Bearbeitung ist eine noch offene Zusatzanforderung. Dieser Ansatz erlaubt ausgewählte Klassen und eine begrenzte Menge an Pseudoklassen und weist externe URLs, At-Rules, uneingeschränkte Attributselektoren, HTML-Trennzeichen und übermäßig viele Regeln zurück.

Beschränke akzeptiertes CSS auf einen festgelegten Profilbereich, generiere es neu und prüfe es vor der Veröffentlichung erneut. Bewahre GUI-Einstellungen und den handgeschriebenen Quelltext zur Bearbeitung auf, fixiere im öffentlichen Snapshot aber nur geprüftes CSS. Ein begrenzter Geltungsbereich allein macht beliebiges CSS nicht sicher. Die [W3C-Selectors-Spezifikation](https://www.w3.org/TR/selectors-4/) erläutert die Konzepte von Selektoren.

## Vorschau, Entwurf und Veröffentlichung trennen

Das Ausprobieren oder Anwenden eines Themes ändert einen Entwurf. Die öffentliche Seite ändert sich erst, wenn die verantwortliche Person sie veröffentlicht. Dass sich handgeschriebenes CSS erneut bearbeiten lässt, bedeutet auch nicht, dass dieser Quelltext an Besucher gesendet wird. Erkenne Speicherkonflikte und gestalte Wiederholungen idempotent, damit derselbe Vorgang eine Version oder einen Entwurf nicht doppelt aktualisiert.

## Aktive Designs nicht durch Aktualisierungen anderer Autoren verändern

Trenne veränderliche Einträge im Theme-Verzeichnis von unveränderlichen Versionen. Nutzer importieren eine bestimmte Versions-ID; eine neue Version des Autors ändert daher weder einen bestehenden Entwurf noch ein veröffentlichtes Design stillschweigend. Bewahre Quelle, Version und Lizenzangabe auch nach der Bearbeitung auf. Wird ein öffentliches Profil privat, dürfen Name oder Bild aus dem Entwurf des Autors nicht in das verteilte Theme gelangen.

## Auslistung und betriebliche Sperre unterscheiden

Ein Autor kann ein Theme auslisten und damit neue Auffindbarkeit und Anwendung verhindern, ohne eine bereits fixierte Version zwangsläufig sofort zu widerrufen. Bei der betrieblichen Sperre eines gefährlichen Themes gilt eine andere Grenze: Stelle dessen CSS nicht mehr bereit, auch nicht aus bestehenden Snapshots, und kehre zur Standarddarstellung zurück. Prüfe nach dem Zurücksetzen auf einen älteren Snapshot den aktuellen Sperrstatus, damit CSS von vor der Sperre nicht wieder erscheint.

## Was vor der Veröffentlichung zu prüfen ist

Prüfe nicht unterstützte Selektoren, externe Anfragen, Eingabegrößen, Speicherkonflikte, Wiederholungen, die Umstellung des Autorenprofils auf privat, Auslistung, betriebliche Sperre und Zurücksetzen. Code, Bereitstellung und Darstellung von Testdaten wurden geprüft. Das ist jedoch kein Ende-zu-Ende-Test, bei dem eine echte Person ein Theme einreicht und eine andere es anwendet. Lizenzbedingungen können außerdem nicht garantieren, dass an den Browser geliefertes CSS niemals kopiert wird.

Zur Eingabe bei der Bearbeitung siehe [Grenzen von Profilimporten als Entwurf](/de/insights/profile-import-draft-boundaries/); zum CMS-Betrieb siehe den [Sveltia-CMS-Leitfaden](/de/insights/cms-selection-and-turnstile/).
