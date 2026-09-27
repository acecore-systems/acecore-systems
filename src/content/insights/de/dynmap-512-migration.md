---
title: "So prüften wir Dynmaps Umstellung auf 512px und entfernten alte R2-Bilder"
description: "Betriebsbericht über die Umstellung von 89 Karten auf acht Servern auf 512px-Bilder und die Prüfung der öffentlichen Anzeige und alten R2-Daten."
date: "2026-09-27T22:40:00+09:00"
author: gui
image: /images/insights/dynmap-512-migration.webp
tags: ["Technologie", "Cloudflare"]
callout:
  type: note
  title: "Geprüfter Umfang"
  text: "Eine Produktionsprüfung am 11. September 2026 bestätigte die Umstellung und Löschung alter Bilder. Rechnungsbetrag und Kostensenkung im Normalbetrieb sind nicht verifiziert."
---

Wir änderten das Bildformat einer Dynmap-Installation, die Karten über Cloudflare R2 ausliefert, und räumten alte Daten auf. Betroffen waren acht Server und 89 Karten. Entscheidend war die Reihenfolge: erst die neuen Bilder öffentlich prüfen, dann die alten löschen.

## Schrittweise Umstellung mit begrenztem Renderbereich

Die produktiven Karten wurden auf 512px-Kacheln vereinheitlicht. Bei 21 Karten mit zusätzlichem Renderbedarf begrenzten wir den Bereich auf einen Radius von 2.000 Blöcken um das öffentliche Zentrum. Wir warteten nicht auf eine vollständige Darstellung der ganzen Welt; normale Aktualisierungen liefen während der Umstellung weiter.

Außerdem verbesserten wir Wiederholungsversuche nach R2-Verbindungsfehlern, das Behalten ausstehender Aktualisierungen nach Schreibfehlern und die Unterscheidung zwischen einer fehlenden Zoom-Kachel und einem Lesefehler. [Dynmap-Fork-PR #9](https://github.com/acecore-systems/dynmap/pull/9) dokumentiert die Wiederaufnahme der Zoom-Aktualisierung nach einem Neustart. Störungen bei Cloudflare selbst werden dadurch nicht ausgeschlossen.

## Öffentliche Darstellung und Speicher getrennt prüfen

Nach der Umstellung prüften wir für jede der 89 veröffentlichten Karten eine normale und eine Zoom-Kachel, insgesamt 178 Bilder. Neben der Größe von 512px kontrollierten wir Webdateien und Live-JSON-Aktualisierungen. In R2 glichen wir die Speicherpfade mit den 89 produktiven Kartenpräfixen ab und bestätigten, dass 192 alte Präfixe für normale und Tagesbilder leer waren.

Erst danach löschten wir 11.707.356 alte Bild- und Hash-Objekte, rund 51,71 GB. Für den Inhalt der alten Bilder gibt es keine Sicherung; bei Bedarf müssen sie aus den Welten neu gerendert werden. Aktuelle Bilder, Welten sowie Konfigurations- und JAR-Sicherungen blieben erhalten. Eine abschließende Prüfung bestätigte, dass keine alten Bilder, Übergangsdaten oder Hash-Dateien übrig waren; der erfolgreiche Abschluss des Löschprozesses allein reichte nicht.

## Speicheränderung nicht mit der Rechnung gleichsetzen

In zwei aufeinanderfolgenden 24-Stunden-Zeiträumen mit Migrationsarbeiten sanken erfolgreiche PutObject-Aufrufe von 240.835 auf 90.423. Beide Zeiträume enthalten die Umstellung und belegen daher weder eine Verringerung im Normalbetrieb noch eine monatliche Kostenersparnis. Der Rechnungsbetrag wurde nicht geprüft.

Bei ähnlichen Umstellungen sollten [R2-Metriken zu Vorgängen und Speicher](https://developers.cloudflare.com/r2/platform/metrics-analytics/) getrennt betrachtet und öffentliche Anzeige, aktuelle Bilder und alte Daten nacheinander geprüft werden. Löschumfang und Wiederherstellungsweg müssen vorab feststehen.
