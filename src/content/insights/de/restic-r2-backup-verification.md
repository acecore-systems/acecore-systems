---
title: "restic-Backups auf R2 überwachen: von Speicherung zu geprüfter Wiederherstellung"
description: "Snapshot-Aktualität, Integrität und Wiederherstellung getrennt prüfen und noch ungeprüfte Anwendungswiederherstellung benennen."
date: "2026-09-30T20:53:00+09:00"
author: gui
image: /images/insights/restic-r2-backup-verification.webp
tags: ["Cloudflare R2", "restic", "Backup"]
callout:
  type: note
  title: "Vollständige Wiederherstellung separat prüfen"
  text: "Regelmäßige Backups, Überwachung, Aufbewahrung und Extraktion/Integritätsprüfung ausgewählter Daten wurden durchgeführt. Start aller Anwendungen und Katastrophenwiederherstellung mit getrennten Zugangsdaten sind nicht belegt."
---

Ein beendeter Backup-Job beweist keine Wiederherstellbarkeit. Dieser verallgemeinerte interne Fall bewertet Speicherung, Integrität, Wiederherstellung und Dienstbetrieb getrennt. Er dokumentiert keine abgeschlossene Migration von einem anderen Dienst.

## Quelle und Erfolg definieren

Die Lösung nutzt restic-Verschlüsselung und Deduplizierung mit R2s S3-kompatibler API. Prüfen Sie benötigte Operationen in der [Kompatibilitätstabelle](https://developers.cloudflare.com/r2/api/s3/api/). Für laufende Datenbanken planen Sie konsistente Erfassung per Dump oder geeigneter Anwendungspause.

## Aktualität getrennt überwachen

Verfolgen Sie letzten erfolgreichen Snapshot, Verspätungen, Fehler und Integritäts-/Wiederherstellungsergebnisse getrennt. Jobstart ist kein Erfolg. Benachrichtigungsfehler und Backup-Fehler sind ebenfalls verschieden.

## Integrität und Extraktion prüfen

Standard-`restic check` und datenlesende Prüfungen haben unterschiedliche Umfänge. `--read-data` liest sämtliche Daten; Teilprüfungen müssen ihren Umfang dokumentieren. Kombinieren Sie [Repository-Prüfungen](https://restic.readthedocs.io/en/stable/045_working_with_repos.html), [Wiederherstellung](https://restic.readthedocs.io/en/stable/050_restore.html) an isoliertem Ort und Inhalts-/Hashvergleiche. Dateiextraktion prüft keinen Anwendungsstart.

## Aufbewahrung mit restic

Wählen Sie Snapshots per Aufbewahrungsrichtlinie und verwenden Sie `forget`, `prune`, `check`; prüfen Sie vorher, was erhalten bleibt. Altersbasierte pauschale Objektlöschung auf R2 kann gemeinsam genutzte Daten erhaltener Snapshots zerstören. Folgen Sie der [Aufbewahrungsdokumentation](https://restic.readthedocs.io/en/stable/060_forget.html); Bildauslieferungsobjekte sind ein anderer Fall.

## Offene Wiederherstellungsprüfungen

Regelbetrieb, Monitoring/Meldungen, Aufbewahrung und Extraktion/Integrität ausgewählter Daten wurden durchgeführt. Start aller Anwendungen, Konfigurationen und Abhängigkeiten sowie Zugriff auf getrennte Zugangsdaten brauchen noch Ende-zu-Ende-Prüfung. Wiederherstellungszeit und akzeptabler Datenverlust müssen gemessen werden. Vollständige Notfallwiederherstellung oder belegte Einsparungen werden nicht behauptet.
