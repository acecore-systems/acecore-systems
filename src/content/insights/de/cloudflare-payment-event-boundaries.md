---
title: "Zahlungs- und Erstattungs-Webhooks sicher verarbeiten: Statusabgleich in Workers"
description: "Ein Implementierungsbeispiel, das Signaturprüfung, doppelte und verspätete Ereignisse, Erstattungsstatus und Antworten externer APIs trennt. Außerdem wird gezeigt, wie Berechtigungen vor Verwaltungsaktionen erneut geprüft werden."
date: "2026-10-06T01:10:00+09:00"
lastUpdated: "2026-10-06T01:10:00+09:00"
author: gui
image: "/images/insights/cloudflare-payment-event-boundaries.webp"
tags: ["Cloudflare Workers", "Stripe", "Security"]
callout:
  type: note
  title: "Implementierungsnachweise von echten Transaktionen trennen"
  text: "In diesem anonymisierten Fall wurden Implementierung, Tests, Produktivbereitstellung und der schreibgeschützte Abgleich mit externen APIs bestätigt. Für Tests wurden keine Kundenerstattungen, Stornierungen oder Punkteanpassungen ausgeführt. Eine vollständige Ende-zu-Ende-Prüfung aller Zahlungswege wird nicht behauptet."
---

Der Empfang eines Ereignisses vom Zahlungsanbieter schließt weder eine Bestellung noch eine Erstattung automatisch ab. Dieses anonymisierte Beispiel zeigt, wie ein Verwaltungsablauf auf Workers den Anbieterstatus mit lokalen Datensätzen abgleicht. Kundendaten, echte Transaktionskennungen und interne Benachrichtigungsziele werden nicht veröffentlicht.

## Signatur prüfen und doppelte Verarbeitung am Eingang verhindern

Prüfen Sie die Signatur anhand des unveränderten Request-Bodys und kontrollieren Sie den erwarteten Live- oder Testmodus des Ereignisses. Protokollieren Sie die Verarbeitung und beanspruchen Sie eine Verarbeitungssperre, damit eine erneute Zustellung desselben Ereignisses keine Geschäftsaktion wiederholt. Eine Zustellreihenfolge ist damit nicht garantiert. Siehe den [offiziellen Stripe-Leitfaden zu Webhooks](https://docs.stripe.com/webhooks).

## Bei verspäteten Erstattungsereignissen den aktuellen Anbieterstatus abrufen

Diese Implementierung behandelt `refund.created`, `refund.updated` und `refund.failed`. Bei einer verwalteten Erstattung wird das aktuelle Stripe-Objekt erneut abgerufen, damit ein spätes Ereignis den lokalen Datensatz nicht auf einen älteren Stand zurücksetzt. Vor der Entscheidung, ob eine Bestellung vollständig erstattet ist, werden erfolgreiche und noch ausstehende Beträge getrennt.

Geprüft werden Betrag, Währung, PaymentIntent, Metadaten zur Zuordnung von Bestellung und Vorgang sowie bereits gespeicherte Kennungen. Zahlungs-IDs können mit `py_`, Erstattungs-IDs mit `pyr_` beginnen. Die Implementierung wurde so angepasst, dass ein abweichendes bekanntes Präfix eine gültige Antwort nicht verwirft. Ein zusätzlich unterstütztes Präfix lockert nicht die Prüfungen von Betrag und Identität. Unbekannte Werte werden nicht als null gezählt.

## Erstattung, Punkte und Benachrichtigungen getrennt behandeln

Prüfen Sie Guthaben und Berechtigung vor einer Erstattungsanfrage und nach dem Abruf des externen Status unmittelbar vor dem Schreiben erneut. Verwenden Sie einen vorgangsspezifischen Idempotenzschlüssel und eine Verarbeitungssperre. Ist das externe Ergebnis unklar, gleichen Sie den aktuellen Status ab, statt die Erstattung blind erneut auszulösen.

Eine erfolgreiche Erstattung und eine erfolgreiche Punkteanpassung sind verschiedene Zustände. Ein späterer Fehler darf die Erstattung nicht erneut auslösen; nötige Abgleiche oder Reparaturen werden protokolliert. Benachrichtigungskonfiguration, tatsächlicher Empfang und Nachverfolgung durch Mitarbeitende sind eigene Abnahmepunkte außerhalb der Zahlungsereignisverarbeitung. Dieser Artikel behauptet nicht, dass Benachrichtigungen betriebsbereit sind.

## Antworten in Node und in der Workers-Laufzeit prüfen

Ein externer Fetch, der nur in Node getestet wird, kann Unterschiede in Workers übersehen. In diesem Fall wurde ein Kompatibilitätsproblem mit `redirect: 'error'` reproduziert und die Anfrage auf `redirect: 'manual'` mit expliziter HTTP-Statusprüfung umgestellt. 3xx-Antworten und Fehlerseiten dürfen nicht als normales JSON behandelt werden; folgen Sie Weiterleitungen nicht automatisch mit Berechtigungsdaten an einen anderen Host. Siehe die [Workers-Request-API](https://developers.cloudflare.com/workers/runtime-apis/request/).

## Grenzen von Bereitstellung und Abnahme festhalten

Datenbankänderungen, abhängige Verarbeitung und Verwaltungsoberfläche wurden nacheinander bereitgestellt. Tests, CI, schreibgeschützte Produktivansichten und der Abgleich mit Anbieter-API-Abfragen wurden geprüft. Für Tests wurde keine Geldtransaktion eines Kunden ausgeführt. Beim CSV-Export werden Zellen, die als Formeln interpretiert werden könnten, als Text behandelt; unbekannte Gebühren werden nicht durch null ersetzt.

Zum Anmeldebereich der Verwaltung siehe [Sitzungsdesign für mehrere Dienste](/insights/multi-service-session-lifecycle/).
