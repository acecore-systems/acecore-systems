---
title: "Minecraft-Lag untersuchen: unauffällige Messung und gemeinsame Speicherpfade"
description: "Von der leisen Erfassung von TPS/MSPT bis zum Abgleich von JFR und I/O-Beobachtungen des Betriebssystems. Der Beitrag trennt die abgeschlossene Ursachensuche von noch nicht geprüften Leistungsverbesserungen."
date: "2026-10-06T01:10:00+09:00"
lastUpdated: "2026-10-06T08:52:00+09:00"
author: gui
image: /images/insights/covers/minecraft-latency-investigation-cover-v1.webp
tags: ["Minecraft", "Monitoring", "Performance"]
callout:
  type: note
  title: "Ursachensuche und Verbesserungsergebnisse getrennt betrachten"
  text: "Die kontinuierliche Messung und die Untersuchung der Wartezeiten beim Speichern sind abgeschlossen. Ein Wechsel des Speichers und ein Leistungsvergleich wurden nicht durchgeführt. Die Untersuchung belegt weder einen Komponentenausfall noch, dass alle Spieler keine Verzögerungen mehr erleben."
---

Minecraft-Lag kann verschiedene Ursachen haben: Tick-Verarbeitung des Servers, kurze Speicherwartezeiten, Netzwerk oder Rendering auf dem Client. Wir beschreiben anonym eine Untersuchung auf mehreren Paper-Servern, ohne interne Hostnamen oder Konfiguration offenzulegen.

## Durchschnittswerte und kurze Aussetzer getrennt messen

Erfassen Sie TPS, den durchschnittlichen, maximalen und p95-MSPT-Wert sowie die kumulierte Zahl langsamer Ticks. Ein guter Durchschnitt kann kurze Aussetzer verbergen. Die CPU-Auslastung des gesamten Hosts unterscheidet keine Arbeit auf einem einzelnen Thread von I/O-Wartezeit.

## Leise erfassen und fehlende Daten kenntlich machen

In diesem Fall schrieb ein kleines Plugin Messwerte aus der öffentlichen Paper-API in lokales JSON; ein Collector fasste sie zu Monitoring-Zeitreihen zusammen. Datei-I/O lief außerhalb des Game-Main-Threads. Der Austausch einer temporären Datei verhinderte, dass Leser einen unvollständigen Stand sahen. Normale Konsolenmeldungen wurden dadurch nicht unterdrückt.

Prüfen Sie außerdem Zeitstempel und den Erfolg der Erfassung. Ein alter Wert eines gestoppten Collectors ist kein Gesundheitsnachweis; fehlende Daten werden nicht durch null TPS ersetzt.

## Begrenzte JVM-, Betriebssystem- und Speicherbeobachtungen abgleichen

Während sich das Problem reproduzieren ließ, wurden JFR, Betriebssystem-Wartezeiten und Block-I/O in getrennten, zeitlich begrenzten Fenstern erfasst. Die Beobachtungen wurden mit der kontinuierlichen MSPT-Reihe und periodischem I/O-Druck abgeglichen, um GC-Aktivität von Wartezeiten bei synchronen Speicherungen zu unterscheiden. Die Aufnahmen fanden nicht alle gleichzeitig statt. Als allgemeinen Einstieg für Paper bietet sich der [offizielle spark-Profiling-Leitfaden](https://docs.papermc.io/paper/profiling/) an. Hier kamen JFR und Betriebssystembeobachtungen hinzu, um Wartezeiten beim Speichern zu untersuchen.

In einem normalen Beobachtungsfenster von 240 Sekunden und einem stockenden Fenster von 220 Sekunden lagen die sekündlichen write-await-Medianwerte bei 1,60 ms und 43,71 ms; die Maximalwerte bei 6,00 ms und 123,57 ms. Das sind zwei Beobachtungsfenster, keine Vorher-nachher-Ergebnisse und kein allgemeiner Benchmark.

Neben Wartezeiten bei synchronen Speicherungen und im Dateisystem-Journal traten Verzögerungen auch bei Geräteanforderungen mehrerer Anwendungen auf. Damit ließ sich der Kandidat auf den gemeinsamen Speicherpfad eingrenzen. Ein Abschlussereignis eines [Linux-Block-Tracepoints](https://www.kernel.org/doc/html/latest/core-api/tracepoint.html) kann nur einen Teil einer Anforderung darstellen. Nicht zugeordnete Anforderungen wurden daher nicht in eine Statistik für sämtliche I/O gemischt. Erfassungsdauer und -umfang waren begrenzt; auch der Messaufwand wurde berücksichtigt.

<figure class="article-diagram" data-layout="compare" data-tone="green" data-count="2" aria-labelledby="diagram-minecraft-latency-investigation">
  <figcaption>
    <strong id="diagram-minecraft-latency-investigation">Beobachtungen und Hypothesen trennen</strong>
    <span>Dauerwerte und begrenzte Stichproben stammen aus verschiedenen Zeitfenstern. Die Wirkung einer Speichermigration wurde nicht getestet.</span>
  </figcaption>
  <ol class="article-diagram__nodes">
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">1</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M4 19V5M4 19h16"/><path d="m7 15 4-5 3 2 5-7"/></svg></span>
      <strong>Leise laufende Messung</strong>
      <span>TPS/MSPT und fehlende Daten erfassen, ohne die übliche Konsolenausgabe zu erhöhen.</span>
    </li>
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">2</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="12" cy="12" r="4"/><path d="M6 8h.01M18 16h.01"/></svg></span>
      <strong>Begrenzte Ursachenanalyse</strong>
      <span>JFR, Betriebssystem und Block-I/O getrennt erfassen und abgleichen. Gemeinsamer Speicher ist eine mögliche Ursache, kein bestätigter Defekt.</span>
    </li>
  </ol>
</figure>

## Den nächsten Schritt separat testen

Nach der Untersuchung wurde das begrenzte Tracing beendet und die normale kontinuierliche Erfassung bestätigt. Ein Vergleich über mehrere Zyklen bei ähnlicher Nutzung nach einem Speicherwechsel steht noch aus. Diese Dokumentation bereitet die nächsten Maßnahmen mit Backup-, Wiederherstellungs- und Rücksetzplan vor. Sie senkt nicht die Speicherdauerhaftigkeit und macht GC oder ein bestimmtes Plugin nicht ohne Beleg verantwortlich.

Zur Unterscheidung von Monitoring-Signalen und Diagnose siehe [OpenClaw-Monitoring und Störungsuntersuchung](/insights/openclaw-monitoring-investigation/); zur Wiederherstellung [R2- und restic-Backup-Monitoring](/insights/restic-r2-backup-verification/).
