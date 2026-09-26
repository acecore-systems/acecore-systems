---
title: "Aufgabenverteilung in Codex gestalten: das öffentliche Task-Routing-Plugin"
description: "Codex Task Routing als Beispiel für unveränderte Elterneinstellungen, nachvollziehbare Richtlinienversionen, begrenzte Übergaben und Prüfung der tatsächlichen Ausführung."
date: "2026-09-26T18:30:00+09:00"
author: gui
image: /images/insights/codex-task-routing-design.webp
tags: ["Technologie", "KI", "Entwicklung"]
callout:
  type: note
  title: "Geprüfter Umfang"
  text: "Geprüft wurden öffentlicher Code, zusammengeführte PRs, CI auf drei Betriebssystemen und die Installation in einer isolierten Umgebung. Dieser Artikel behauptet weder gemessene Qualitäts- oder Nutzungsverbesserungen noch einen verifizierten Kindmodell-Lauf mit einem realen Konto."
---

Wenn Codex mehrere Arbeiten übernimmt, ist die Modellwahl nur ein Teil der Entscheidung. Ebenso wichtig sind die abgrenzbare Aufgabe, der zu übergebende Kontext und die Prüfung des Ergebnisses. Acecore hat [Codex Task Routing](https://github.com/acecore-systems/codex-task-routing) veröffentlicht, um diese Entscheidungen ausdrücklich festzuhalten.

## Routinearbeit bleibt beim übergeordneten Agenten

Der übergeordnete Agent bearbeitet gewöhnliche Recherche, Implementierung und Prüfung. Nur wenn eine Übergabe konkreten Mehrwert bringt, erhält ein Spezialist einen begrenzten Schritt. Das Plugin bewahrt das vom Nutzer gewählte Modell und die Reasoning-Einstellungen des übergeordneten Agenten. Es vermeidet Übergaben nur an eine weitere Instanz desselben Modells und Parallelisierung ohne unabhängige Arbeit für den übergeordneten Agenten.

Eine Übergabe benötigt mehr als „schreibe einen Artikel“: Primärquellen, Umfang, verfügbare Werkzeuge, Abnahmekriterien und Bedingungen für die Rückgabe offener Fragen. Der übergeordnete Agent prüft wichtige Änderungen und Belege, nicht nur das Fazit.

## Richtlinie und tatsächliche Ausführung unterscheiden

Zu Beginn zeigt das Plugin die wirksame Richtlinie und ihren Hash an. Individuelle Einstellungen ändern nicht heimlich die Elterneinstellungen. Der Hook selbst ruft kein Modell auf und sendet keine Netzwerkanfrage.

Ein Modellname in der Konfiguration beweist keinen tatsächlichen Modelllauf. Verbindung, Ausführung und Ergebnis müssen getrennt geprüft werden; nicht verfügbare Nutzungsdaten bleiben als fehlend markiert. Die Route zu normalem Chat ist optional und stoppt bei ungeklärter Verfügbarkeit oder Berechtigung.

## Was die Prüfungen belegen

Der [PR zur Richtlinienaktualisierung](https://github.com/acecore-systems/codex-task-routing/pull/13) dokumentiert 134 Unit-Tests, CI auf Windows, Ubuntu und macOS sowie Installation, Hooks, Neuinstallation und Entfernung in einem isolierten Codex-Home. Ein [früherer PR](https://github.com/acecore-systems/codex-task-routing/pull/12) verbesserte Windows-Diagnosen und Paketprüfungen.

Diese Prüfungen betreffen Paket und Konfigurationsweg. Sie belegen keinen Kindmodell-Lauf mit realem Konto, keinen gemessenen Qualitäts- oder Nutzungsvorteil und kein Chat-Verhalten auf allen Hosts. Anforderungen und Anleitung stehen im [öffentlichen README](https://github.com/acecore-systems/codex-task-routing#readme).
