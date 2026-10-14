---
title: "restic-Backups auf R2 überwachen: von Speicherung zu geprüfter Wiederherstellung"
description: "Snapshot-Aktualität, Integrität und Wiederherstellung mit R2/restic trennen: PostgreSQL-Version nach OS-Updates, isolierte Samba-Runtime, DB/LDAP-Prüfung und offene Gesamtrettung."
date: "2026-09-30T20:53:00+09:00"
lastUpdated: "2026-10-15T00:00:00+09:00"
author: gui
image: /images/insights/covers/restic-r2-backup-verification-cover-v1.webp
tags: ["Cloudflare R2", "restic", "Backup"]
callout:
  type: note
  title: "Vollständige Wiederherstellung separat prüfen"
  text: "Regelmäßige Backups, Überwachung, Aufbewahrung und Extraktion/Integritätsprüfung ausgewählter Daten wurden durchgeführt. Start aller Anwendungen und Katastrophenwiederherstellung mit getrennten Zugangsdaten sind nicht belegt."
---

Ein beendeter Backup-Job beweist keine Wiederherstellbarkeit. Dieser verallgemeinerte interne Fall bewertet Speicherung, Integrität, Wiederherstellung und Dienstbetrieb getrennt. Er dokumentiert keine abgeschlossene Migration von einem anderen Dienst.

## Snapshot-ID und ein Wiederherstellungsziel festlegen

Notieren Sie die ID und stellen Sie benötigte Dateien in einem leeren, isolierten Ziel wieder her. Prüfen Sie Konfigurationsverweise und Rechte oder laden Sie die Datenbank isoliert. Erfassen Sie die Dauer. Wiederholen Sie dieselben Kontrollen regelmäßig, um Aktualität und Wiederherstellungsumfang zu vergleichen.

[restic：Wiederherstellung in ein isoliertes Ziel](https://restic.readthedocs.io/en/stable/050_restore.html)

## Quelle und Erfolg definieren

Die Lösung nutzt restic-Verschlüsselung und Deduplizierung mit R2s S3-kompatibler API. Prüfen Sie benötigte Operationen in der [Kompatibilitätstabelle](https://developers.cloudflare.com/r2/api/s3/api/). Für laufende Datenbanken planen Sie konsistente Erfassung per Dump oder geeigneter Anwendungspause.

## Aktualität getrennt überwachen

Verfolgen Sie letzten erfolgreichen Snapshot, Verspätungen, Fehler und Integritäts-/Wiederherstellungsergebnisse getrennt. Jobstart ist kein Erfolg. Benachrichtigungsfehler und Backup-Fehler sind ebenfalls verschieden.

## Integrität und Extraktion prüfen

Standard-`restic check` und datenlesende Prüfungen haben unterschiedliche Umfänge. `--read-data` liest sämtliche Daten; Teilprüfungen müssen ihren Umfang dokumentieren. Kombinieren Sie [Repository-Prüfungen](https://restic.readthedocs.io/en/stable/045_working_with_repos.html), [Wiederherstellung](https://restic.readthedocs.io/en/stable/050_restore.html) an isoliertem Ort und Inhalts-/Hashvergleiche. Dateiextraktion prüft keinen Anwendungsstart.

## Aufbewahrung mit restic

Wählen Sie Snapshots per Aufbewahrungsrichtlinie und verwenden Sie `forget`, `prune`, `check`; prüfen Sie vorher, was erhalten bleibt. Altersbasierte pauschale Objektlöschung auf R2 kann gemeinsam genutzte Daten erhaltener Snapshots zerstören. Folgen Sie der [Aufbewahrungsdokumentation](https://restic.readthedocs.io/en/stable/060_forget.html); Bildauslieferungsobjekte sind ein anderer Fall.

## Nach OS-Updates auch PostgreSQL der Wiederherstellung prüfen

Nach einem OS-Update scheiterte der Test am festen Pfad einer alten PostgreSQL-Hauptversion. Die Änderung wählt die numerisch neueste installierte Hauptversion mit vollständigen ausführbaren Serverwerkzeugen und verwendet sie für Initialisierung, Start, Restore, Prüfung und Ende. Ohne vollständigen Satz wird abgebrochen, statt eine laufende Datenbank zu verbinden und Erfolg zu behaupten.

Dump-Format und Zielkompatibilität anhand der [PostgreSQL-Dokumentation zu SQL-Dump und Restore](https://www.postgresql.org/docs/current/backup-dump.html) prüfen. Automatische Versionswahl garantiert nicht jeden Dump. Tests und CI belegen die Auswahländerung; die reale R2-Datenbankwiederherstellung bleibt eine eigene Abnahme.

## Runtime im isolierten Samba nachbilden

Eine lesbare Datenbank genügte nicht: Ohne Runtime für interne Sockets startete der isolierte DC nicht. Netzwerk-, PID- und Mount-Namespaces trennen, Isolation prüfen und nur darin privates `/run`-tmpfs und `/run/samba` erstellen. Generierte isolierte Konfiguration und Restore-Pfade verhindern Vermischung mit produktiver Runtime und Listenern.

Mit [offiziellem samba-tool domain backup restore und dbcheck](https://www.samba.org/samba/docs/current/man-html/samba-tool.8.html) wurden Datenbank, DC-Start und LDAP-Bereitschaft geprüft. Dieser Samba-Pfad nutzte ein echtes R2-Backup. Wiederherstellung aller Anmeldungen, Dienstverbindungen und separat gelagerter Zugangsdaten erfordert weitere Tests. Geprüft am 14. Oktober 2026.

<figure class="article-diagram" data-layout="layers" data-tone="amber" data-count="3" aria-labelledby="diagram-restic-r2-backup-verification">
  <figcaption>
    <strong id="diagram-restic-r2-backup-verification">Vom Snapshot zur Dienstwiederherstellung und Gesamtrettung</strong>
    <span>Samba-DC, DB und LDAP mit echtem R2 geprüft; reale PostgreSQL-Abnahme und Gesamtrettung bleiben getrennt.</span>
  </figcaption>
  <ol class="article-diagram__nodes">
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">1</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M5 3h10l4 4v14H5z"/><path d="M15 3v5h5M8 12h8M8 16h6"/></svg></span>
      <strong>Erfolgreicher Snapshot und Aktualität</strong>
      <span>Echten Erfolg und Prüfumfang dokumentieren.</span>
    </li>
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">2</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5M8 10l2 2 3-4"/></svg></span>
      <strong>Isolation nachbilden</strong>
      <span>DB-Version, Netzwerk/PID/Mount und Runtime prüfen.</span>
    </li>
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">3</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/></svg></span>
      <strong>Dienststart testen</strong>
      <span>Samba DB und LDAP prüfen; alle Anwendungen bleiben unbelegt.</span>
    </li>
  </ol>
</figure>

## Offene Wiederherstellungsprüfungen

Regelbetrieb, Monitoring/Meldungen, Aufbewahrung und Extraktion/Integrität ausgewählter Daten wurden durchgeführt. Start aller Anwendungen, Konfigurationen und Abhängigkeiten sowie Zugriff auf getrennte Zugangsdaten brauchen noch Ende-zu-Ende-Prüfung. Wiederherstellungszeit und akzeptabler Datenverlust müssen gemessen werden. Vollständige Notfallwiederherstellung oder belegte Einsparungen werden nicht behauptet.

## Ergänzung vom 6. Oktober 2026: Veraltete Sperren und Parallelität bei Wiederherstellungstests

Eine zusätzliche Änderung prüft die Prozessaktivität auf demselben Host, bevor die normale Entsperrung von restic ausgeführt wird, die nur veraltete Sperren behandelt. Die Option, sämtliche Sperren einschließlich derer aktiver Vorgänge zu entfernen, wird nicht verwendet. Bei Konflikten gibt es begrenzte Wiederholungen mit <code>--retry-lock</code>; Wiederherstellungstests und prune starten den Prozess bei Fehlern nicht unbegrenzt neu. Eine Prüfung der Aktivität auf einem Host beweist nicht, dass kein paralleler Vorgang von einem anderen Host aus läuft.

Die Daten werden mit <code>restore --verify</code> in ein isoliertes temporäres Verzeichnis extrahiert. Nach der Prüfung der benötigten Dateien und ihrer Integrität wird die Zuordnung zwischen dem geprüften Snapshot und der Konfiguration dokumentiert. Zuerst wird die Wiederherstellung der Zieldaten bestätigt, danach wird vor prune geprüft, was aufbewahrt werden muss. Die Aktualität des Backups wird anhand eines tatsächlich erfolgreich erstellten Snapshots bewertet, nicht anhand des Prozessstarts oder seiner Wiederholungen.

Die bestätigte Wiederherstellung der Zieldaten ist weiterhin von einer vollständigen Wiederherstellung einschließlich des Starts aller Anwendungen und der Wiederherstellung ihrer Zugangsdaten zu unterscheiden. Zum Umgang mit Wartungsfenstern und Erfassungsfehlern siehe auch [Überwachung und Vorfallanalyse](/insights/openclaw-monitoring-investigation/).
