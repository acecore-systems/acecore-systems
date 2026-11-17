---
title: "Artikel mit Search Console verbessern: Recherche, Review und Bewertung der jeweils 28 Tage davor und danach"
description: "So wählen Sie anhand von Suchdaten Artikel zur Verbesserung aus, prüfen die Belege, begutachten Änderungen in einem Draft PR und vergleichen die jeweils 28 Tage vor und nach der Veröffentlichung. Dazu erläutern wir Hinweise zur Interpretation."
date: "2026-11-17T12:00:00+09:00"
author: gui
image: /images/insights/covers/astro-seo-and-structured-data-cover-v2.webp
tags: ["Technik", "SEO", "Betrieb"]
callout:
  type: note
  title: "Vergleich und Kausalität sind nicht dasselbe"
  text: "Die Zahlen vor und nach der Veröffentlichung dienen dazu, Veränderungen zu beobachten. Da auch die Suchnachfrage und zeitgleiche Überarbeitungen Einfluss haben, belegt das Beispiel in diesem Artikel keine Verbesserung des Suchzugriffs."
---

Auch wenn sich anhand der Impressionen und Klicks in Search Console Kandidaten für Verbesserungen finden lassen, zeigen die Zahlen allein nicht, ob Leserinnen und Leser die benötigten Antworten erhalten haben. Dieser Artikel beschreibt, wie Sie Seiten und Suchabsichten untersuchen, öffentliche Informationen mit dem Artikeltext abgleichen, Überarbeitungsvorschläge prüfen und nach der Veröffentlichung Zeiträume unter denselben Bedingungen vergleichen.

<figure class="article-diagram" data-layout="flow" data-tone="violet" data-count="3" aria-labelledby="diagram-search-editorial">
  <figcaption>
    <strong id="diagram-search-editorial">Suchdaten mit Redaktion und Bewertung verbinden</strong>
    <span>Kandidatenfindung, Inhaltsprüfung und Beobachtung nach der Veröffentlichung werden getrennt.</span>
  </figcaption>
  <ol class="article-diagram__nodes">
    <li><strong>Recherche</strong><span>Seite und Suchabsicht prüfen und Hypothesen dokumentieren.</span></li>
    <li><strong>Überarbeitung und Review</strong><span>Primärquellen abgleichen und Änderungen im Draft PR prüfen.</span></li>
    <li><strong>Bewertung nach der Veröffentlichung</strong><span>Zeiträume unter gleichen Bedingungen vergleichen und Einschränkungen festhalten.</span></li>
  </ol>
</figure>

## 1. Verbesserungskandidaten anhand von Zahlen und Text auswählen

Legen Sie im Bericht zur Suchleistung Seite, Suchtyp und Zeitraum fest und prüfen Sie Impressionen, Klicks, CTR und durchschnittliche Position. Betrachten Sie bei Bedarf auch Suchanfragen, Länder und Geräte. Seiten mit Impressionen, deren Text die Antwort jedoch schwer auffindbar macht, kommen für eine Untersuchung infrage. Eine niedrige CTR allein entscheidet jedoch nicht darüber, ob der Titel geändert werden muss.

Öffnen Sie die Seite und halten Sie fest, was Suchende wissen möchten und welche Erklärungen im aktuellen Text fehlen. Wichtig ist auch, nicht angezeigte Suchanfragen oder nicht abgerufene Zeilen nicht als Beleg dafür zu behandeln, dass es keine Suchanfragen gab. Googles [Anleitung zur Untersuchung von Rückgängen des Suchtraffics](https://developers.google.com/search/docs/monitor-debug/debugging-search-traffic-drops) hilft dabei, Veränderungen nach Zeitraum, Seite und Suchanfrage zu untersuchen.

## 2. Belege abgleichen und für Leserinnen und Leser nutzbare Änderungen erstellen

Prüfen Sie offizielle Dokumentation und die tatsächlich veröffentlichten Seiten und ergänzen Sie konkrete Beispiele, Anleitungen, Anwendungsbedingungen und weiterführende Links. Unterscheiden Sie gemessene Werte, fiktive Beispiele zur Veranschaulichung und ungeprüfte Punkte. Stellen Sie Wirkungen, für die keine Daten erhoben wurden, nicht als Ergebnisse dar. Stimmen Sie auch Titel und description auf das ab, was der Text tatsächlich beantwortet. Googles [Selbstbewertung für hilfreiche Inhalte](https://developers.google.com/search/docs/fundamentals/creating-helpful-content) kann ebenfalls beim Review helfen.

Fassen Sie den Überarbeitungsvorschlag in einem Draft PR zusammen und prüfen Sie die Änderungen und Quellen, ob Veröffentlichungsdatum und URL beibehalten wurden und ob noch Übersetzungen ausstehen. Review, Integration, Auslieferung und Übernahme in die Suche sind jeweils getrennte Zustände. Ein abgeschlossenes Text-Review allein bedeutet nicht, dass der Artikel bereits in der Produktionsumgebung lesbar ist.

## 3. Veröffentlichungsdatum und Vergleichsbedingungen festlegen

Vergleichen Sie beispielsweise die 28 Tage vor und die 28 Tage nach der Veröffentlichung, wobei der Veröffentlichungstag ausgeschlossen wird. Stimmen Sie Ziel-URL und Sprache, Suchtyp, Land, Gerät, Datumsgrenzen und den Finalisierungsstatus der Daten für beide Zeiträume ab. Wenn am Veröffentlichungstag Inhalte zu unterschiedlichen Uhrzeiten ausgeliefert wurden, lassen sich die Vergleichsbedingungen durch Ausschluss dieses Tages klären. 28 Tage sind ein praktisches Beobachtungsfenster und garantieren nicht für jeden Artikel den optimalen Zeitraum.

| Zu dokumentierender Punkt                                | Grund für die Prüfung                                                      |
| -------------------------------------------------------- | -------------------------------------------------------------------------- |
| Veröffentlichungsdatum und -uhrzeit sowie Ziel-URL       | Vergleichszeiträume und Ziel festlegen                                     |
| Klicks, Impressionen, CTR und durchschnittliche Position | Veränderungen unter gleichen Bedingungen beobachten                        |
| Sprache, Suchtyp, Land und Gerät                         | Verwechslungen durch unterschiedliche Aggregationen vermeiden              |
| Andere Überarbeitungen, Nachfrage und fehlende Daten     | Für die Interpretation der Veränderungen nötige Einschränkungen festhalten |

## Praxisbeispiel: Ein Vorher-nachher-Vergleich allein belegt nicht die Wirkung der Überarbeitung

Im Aceserver Portal wurden im [Informationsartikel zu WIKI und Alpha-kun](https://asv.acecore.net/de/stories/wiki-alpha-guide/) Beispielfragen und Hinweise zur Prüfung des Originaltexts ergänzt. Die überarbeitete Fassung wurde am 10. 10. 2026 veröffentlicht. Die Bewertungsfenster reichen gemäß den Datumsgrenzen von Search Console unter Ausschluss des Veröffentlichungstags vom 12. 9. bis zum 9. 10. und vom 11. 10. bis zum 7. 11.

Der Vorher-Zeitraum umfasst auch den Tag der Erstveröffentlichung und eine weitere, kurz zuvor vorgenommene Überarbeitung. Da mehrere Änderungen gleichzeitig vorgenommen wurden und zudem Schwankungen durch die Suchnachfrage und geringe Fallzahlen möglich sind, lässt sich die Vorher-nachher-Differenz weder allein auf diese Überarbeitung noch allein auf die weiterführenden Links zurückführen. Zum Zeitpunkt der Untersuchung war eine Verbesserung des Suchzugriffs nicht belegt. Unterscheiden Sie bei der Dokumentation der Beobachtungswerte zwischen verfügbaren und nicht verfügbaren Daten.

Halten Sie zunächst für einen Artikel die Fragen der Leserinnen und Leser, den veröffentlichten Text, die geprüften Quellen und Ihre Überarbeitungshypothese fest und erstellen Sie überprüfbare Änderungen. Nutzen Sie den Vergleich nach der Veröffentlichung als Grundlage für die Auswahl der nächsten Untersuchung und behandeln Sie Zahlenänderungen und ihre Ursachen getrennt. Stand der Prüfung: 17. 11. 2026.
