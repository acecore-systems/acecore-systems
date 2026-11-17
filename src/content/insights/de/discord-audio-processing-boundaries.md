---
title: "Discord-Besprechungen verarbeiten: Aufzeichnung, Transkription und Abschluss"
description: "So planen Sie den Ablauf vom Audioempfang bis zur Transkription sowie Einwilligung, Aufbewahrung und Abschlussprüfung."
date: "2026-11-17T12:00:00+09:00"
author: gui
image: /images/insights/covers/nextcloud-talk-operations-notifications-cover-v1.webp
tags: ["Discord", "Audio", "Betrieb"]
---

Wer aus Besprechungen Protokolle erstellt, muss neben dem Audioempfang auch die Information der Teilnehmenden, die Übermittlung und den Abschluss laufender Aufträge planen. Die folgenden Beispiele stammen aus Funktionstests mit künstlichen Audiodaten.

<figure class="article-diagram" data-layout="flow" data-tone="blue" data-count="3" aria-labelledby="diagram-discord-audio-processing-boundaries">
  <figcaption><strong id="diagram-discord-audio-processing-boundaries">Vom Empfang bis zum Abschluss</strong><span>Die Schritte für Einwilligung, Verarbeitung und Abschlussprüfung.</span></figcaption>
  <ol class="article-diagram__nodes">
    <li><strong>Vor der Teilnahme</strong><span>Über Aufzeichnung, Übermittlung und Aufbewahrung informieren.</span></li>
    <li><strong>Empfangen und aufteilen</strong><span>Audio in Abschnitte teilen und laufende Aufträge verfolgen.</span></li>
    <li><strong>Beenden</strong><span>Die Annahme schließen und laufende Abschnitte abwarten.</span></li>
  </ol>
</figure>

## Aufzeichnung und Transkription planen

Informieren Sie die Teilnehmenden vor Beginn über Aufzeichnung, Empfänger, Aufbewahrungsdauer und Zweck. Legen Sie fest, wie Sie mit Personen umgehen, die der Teilnahme oder der Aufzeichnung widersprechen. Die Hinweise müssen auch beim späteren Beitritt oder bei der Wiederaufnahme sichtbar sein. Audio und Transkripte können personenbezogene Daten enthalten. Definieren Sie deshalb im Voraus die Zugriffsrechte, das Löschverfahren und die Inhalte von Protokolldateien.

Verbindungsaufbau, Audioempfang, Aufteilung, Transkription und Erstellung des Besprechungsprotokolls sind eigene Verarbeitungsschritte. Prüfen Sie die Voraussetzungen in der [Discord-Dokumentation für Sprachverbindungen](https://docs.discord.com/developers/topics/voice-connections) und gleichen Sie sie mit den Bedingungen der verwendeten Bibliothek und des Anbieters ab.

## Fertige Aufträge freigeben und laufende Aufträge abwarten

Unser Discord-Bot in Rust teilt das Audio etwa alle 15 Sekunden oder bei Stille auf und begrenzt die Zahl der gleichzeitigen Transkriptionen. Die Anzeige ausstehender Arbeit enthielt zuvor auch bereits beendete Aufträge. Deshalb verfolgt der Bot nun nur laufende Aufträge. Beim Beenden verarbeitet er das bereits empfangene Audio, schließt die Annahme und wartet die laufenden Abschnitte ab.

Im Regressionstest kehrte die Anzahl der verfolgten Aufträge nach 16 aufeinanderfolgenden Abschnitten auf null zurück. Beim Beenden speicherte der Bot zudem den letzten laufenden Abschnitt, bevor er den Vorgang abschloss. Der Test prüfte die Ablaufsteuerung. Speicherverbrauch bei langen Besprechungen und die Audioqualität aller Teilnehmenden stehen noch zur Prüfung aus.

## Mit künstlichem Audio testen

Nutzen Sie kurze künstliche Aufnahmen, um Stille, fortlaufende Sprache, ausgeschöpfte Kapazität und einen Abschnitt unmittelbar vor dem Beenden zu testen. Prüfen Sie für Empfang, Konvertierung, Übermittlung und Speicherung jeweils, ob der Schritt abgeschlossen wurde. Legen Sie fest, wie Sie Fehler erneut verarbeiten und Daten löschen. Klären Sie vor dem Einsatz in einer echten Besprechung die Information und Einwilligung der Teilnehmenden, die Zugriffsrechte und die Aufbewahrungsfristen. Stand: 2026-11-17.
