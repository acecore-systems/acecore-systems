---
title: "Öffentliche Register als Quelle für CRM-Vorschläge nutzen"
description: "So dokumentieren Sie Originaldateien und Abrufzeitpunkte, damit Fachleute doppelte, geänderte und fehlende Einträge vor der Übernahme prüfen können."
date: "2026-11-17T12:00:00+09:00"
author: gui
image: /images/insights/covers/private-dashboard-access-and-aggregation-cover-v1.webp
tags: ["Daten", "CRM", "Betrieb"]
---

Namensgleiche Einrichtungen in einem öffentlichen Register können zu unterschiedlichen Unternehmen gehören. Wer aus solchen Registern Vorschläge für ein CRM erstellt, sollte Herkunft und Änderungen sichtbar machen. Damit kann eine zuständige Person prüfen, ob ein geänderter oder fehlender Eintrag Folgen für vorhandene Unternehmensdaten hat.

<figure class="article-diagram" data-layout="flow" data-tone="blue" data-count="3" aria-labelledby="diagram-public-register-snapshot-review">
  <figcaption><strong id="diagram-public-register-snapshot-review">Vom Register zum geprüften CRM-Vorschlag</strong><span>Originaldatei, Beobachtung und Entscheidung festhalten.</span></figcaption>
  <ol class="article-diagram__nodes">
    <li><strong>Original sichern</strong><span>Quelle, Stichtag und Abrufzeit erfassen.</span></li>
    <li><strong>Änderungen prüfen</strong><span>Identische Dateien wiederverwenden und Namenskonflikte zurückstellen.</span></li>
    <li><strong>Fachlich entscheiden</strong><span>Vorschläge abgleichen und bei Bedarf ins CRM übernehmen.</span></li>
  </ol>
</figure>

## Originaldateien und Beobachtungen getrennt erfassen

Halten Sie die Quelladresse, Nutzungsbedingungen, den angegebenen Stichtag und den Abrufzeitpunkt fest. Eine Datei kann mit der vorherigen identisch sein, während sich der Zeitpunkt der erneuten Prüfung oder die Erläuterung der Quelle unterscheidet. Speichern Sie deshalb den Dateiinhalt und die Prüfung getrennt. So können Sie dieselbe Datei wiederverwenden und den Verlauf der Prüfungen nachvollziehen.

Im [Datenkatalog der Stadt Funabashi](https://www.city.funabashi.lg.jp/shisei/toukei/002/opendata.html) können Sie beispielsweise öffentliche Daten und ihre Nutzungsbedingungen einsehen. Prüfen Sie für den jeweiligen Datensatz die Bedingungen, den Aktualisierungsstand und den Geltungsbereich. Klären Sie die geplante Abrufmethode und Verwendung anhand dieser Angaben.

## Änderungen und fehlende Einträge zur Prüfung anzeigen

Beim internen Abgleich haben wir alle Zeilen vor und nach der Aktualisierung verglichen. Bei eindeutig zuordenbaren Namen zeigten wir Änderungen der Felder an. Mehrfach vorkommende Namen blieben bis zur Prüfung zurückgestellt. Ein fehlender Eintrag ist eine Beobachtung zur Datenquelle. Eine Betriebsschließung oder Löschung im CRM erfordert eigene Belege. Adressen und Telefonnummern in bestehenden Unternehmensdaten blieben bis zur Entscheidung erhalten.

Mit synthetischen Daten prüften wir die Wiederverwendung unveränderter Originale, geänderte und fehlende Felder, mehrdeutige Namen und die Wiederaufnahme nach Teilfehlern. Der Test deckt diese Fälle mit den verwendeten Daten ab. Prüfen Sie bei anderen Quellen die jeweiligen Aktualisierungsverfahren, Kennungen und Nutzungsbedingungen.

## So beginnen Sie mit einem Test

Erstellen Sie eine kleine synthetische CSV-Datei in 2 Versionen. Fügen Sie einen unveränderten, einen geänderten, einen fehlenden Eintrag und 2 gleichnamige Zeilen hinzu. Speichern Sie Original und Beobachtungszeitpunkt und prüfen Sie, ob nur Vorschläge erscheinen und bestehende Daten zunächst erhalten bleiben. Halten Sie bei Abruffehlern oder neuen Nutzungsbedingungen an und lassen Sie vor der Wiederaufnahme die Quelle prüfen. Legen Sie vor dem Betrieb auch Aufbewahrungsdauer und Löschverfahren fest. Stand: 2026-11-17.
