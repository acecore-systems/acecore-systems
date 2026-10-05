---
title: "Anmeldefristen über Dienste hinweg abstimmen: Erneuerung und erneute Authentifizierung"
description: "Allgemeiner Entwurf konsistenter Anmeldefristen mit getrennten Regeln für Anmeldung, Server, Cookies und Identitätsanbieter."
date: "2026-09-30T13:37:47+00:00"
lastUpdated: "2026-10-06T01:10:00+09:00"
author: gui
image: /images/insights/multi-service-session-lifecycle.webp
tags: ["Authentication", "Session", "Web"]
callout:
  type: note
  title: "Verallgemeinerter interner Fall"
  text: "Grundlage sind Richtlinienänderungen und Produktivbereitstellungen. Konkrete Fristen und interne Einstellungen bleiben unveröffentlicht; langfristiges Verhalten aller Nutzer und umfassende Sicherheit sind nicht belegt."
---

Ein gemeinsames Konto macht die Sitzungen der Anwendungen und des Identitätsanbieters nicht identisch. Der Fall gleicht Regeln ab, ohne Zielsysteme oder Fristen zu veröffentlichen.

## Jede Laufzeit bestimmen

Anbietersitzung, Anwendungssitzung und Browser-Cookie getrennt erfassen. Absolute Frist, Inaktivitätsfrist und Kennungswechsel sind unterschiedliche Maßnahmen. Ein Kennungswechsel muss die Laufzeit nicht verlängern.

## Explizite Anmeldung und normalen Zugriff trennen

Im Fall wird der geltende Zeitraum nach erfolgreicher expliziter Anmeldung erneuert, nicht durch Seitenaufrufe, Hintergrundverkehr, automatisches Token-Refresh oder Kennungswechsel; dabei bleibt die ursprüngliche Frist erhalten. Ein Klick oder Callback-Aufruf ist kein Authentifizierungsnachweis: Ergebnis prüfen. Ist eine frische Authentifizierung nötig, muss separat geprüft werden, ob die bestehende Anbietersitzung genügt.

## Fristen auch serverseitig durchsetzen

Ein langlebigeres Cookie bestimmt nicht die Akzeptanz des Servers. Ablauf, Widerruf, Cookie und Anbietergrenzen gemeinsam prüfen. Einheitliche Regeln bedeuten weder gemeinsame Cookies noch sofortige Abmeldung von allen Diensten.

Authentifizierungszeit und Ablauf der Instanz prüfen und die Anwendungssitzungen darauf begrenzen. Der gemeinsame Vertrag prüft Sitzungen; Geschäftsberechtigungen bleiben bei jeder Anwendung. Ein Gateway mit eigenem Cookie hat eine weitere zu erfassende und zu prüfende Ablaufgrenze.

## Konfiguration und Verhalten trennen

Code- und Konfigurationsprüfung von Tests für Anmeldung, Ablaufgrenzen, erneute Anmeldung und Abmeldung trennen. Übergang bestehender Sitzungen und Verhalten von Seiten sowie APIs prüfen. Entscheidungen und Zeitpunkte protokollieren, keine Sitzungswerte oder Zugangsdaten.

## Bestätigter Umfang

Der Verlauf belegt Änderungen, Produktivbereitstellung und Werkzeuge für Differenzprüfungen. Anmeldung echter Nutzer und Warten bis zum tatsächlichen Ablauf wurden in diesen Prüfungen nicht getestet. Er belegt weder Zeitablauftests auf allen Geräten noch umfassende Sicherheit sämtlicher Widerrufs- und Neuanmelderegeln. Fristen und zusätzliche Prüfungen nach Daten und Vorgängen festlegen.

Siehe [OWASP-Sitzungsverwaltung](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html) und [Authentifizierung](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html). Für eine weitere Ebene siehe [Cloudflare-Sitzungsverwaltung](https://developers.cloudflare.com/cloudflare-one/access-controls/access-settings/session-management/). Die Empfehlungen behaupten nicht, dass alle Prüfungen im Fall durchgeführt wurden.

## Ergänzung vom 6. Oktober 2026: Fortsetzung der Authentifizierung und Anwendungsberechtigungen

Im anonymisierten Änderungsprotokoll zur Authentifizierung wurden das Eintreffen am OIDC-Callback, die Token-Prüfung, die Fortsetzung der ursprünglichen Authentifizierungsanfrage und die Nutzungsrechte der Anwendung getrennt betrachtet. Fehlt der für die Fortsetzung benötigte Kontext, wird dies nicht als erfolgreiche Anmeldung behandelt, sondern als sicherer Fehler, von dem aus der Ablauf wiederaufgenommen werden kann. Auch das Rücksprungziel wird geprüft; die Anmeldung am gemeinsamen Konto gewährt nicht automatisch Geschäftsberechtigungen in jeder Anwendung.

Derselbe Vertrag wird bei Anmeldung und Registrierung, beim Hinzufügen und Entfernen von Authentifizierungsanbietern sowie bei Wiederherstellungswegen geprüft. Änderungs- und Bereitstellungsprotokolle belegen weder, dass sich alle Personen über alle Anbieter anmelden können, noch dass der Erhalt des letzten Wiederherstellungswegs durchgängig getestet wurde.

Die Aktivierung eines zweiten Faktors, die Anmeldung bei der Identitätsplattform, das Passieren des Zugriffstors und ein geschützter Schreibvorgang in der Anwendung werden ebenfalls getrennt geprüft. Ein begrenzter Schreibtest ersetzt weder die Prüfung aller regulären OIDC-Abläufe noch den Nachweis, dass ein deaktiviertes Konto abgewiesen wird. Registrierung, Ersteinrichtung, Änderungsansichten und API greifen auf dieselben Eingaberegeln zurück; die Tests prüfen gemeinsam, welche Grenzwerte abgewiesen und welche zugelassen werden. Eine bestimmte Zeichenlänge wird nicht als allgemeiner Standard dargestellt.

Auch Anmelde- und Registrierungshinweise auf den Bildschirmen und im Callback werden getrennt behandelt. Eine Anzeige oder eine Zustandsprüfung belegt nicht die tatsächliche Einrichtung eines externen Kontos oder die Zustimmung. Beim Entfernen eines Anbieters werden Schaltfläche, Callback, Konfiguration, Hinweise und Tests gemeinsam überprüft; anschließend wird nach verbleibenden Zugangswegen gesucht.
