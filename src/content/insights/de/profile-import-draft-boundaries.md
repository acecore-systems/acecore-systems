---
title: "Profildaten als Entwurf importieren: prüfen, ersetzen und gezielt veröffentlichen"
description: "Eine verallgemeinerte Implementierung zum Import von Profildaten aus Text, CSV und statischem HTML. Sie erläutert den Vergleich mit aktuellen Werten, die Auswahl und Ersetzung von Feldern, die Grenzen zwischen Speichern und Veröffentlichen sowie nicht unterstützte Eingaben."
date: "2026-10-06T01:10:00+09:00"
author: gui
image: /images/insights/profile-import-draft-boundaries.webp
tags: ["Web", "Import", "Security"]
callout:
  type: note
  title: "Umfang der Implementierung in Stufe 1"
  text: "Implementierung, Integration und Produktivsetzung des Imports von Text, CSV und statischem HTML wurden bestätigt. Die vollständige Abnahme in einem echten Konto vom Import bis zum Speichern und Veröffentlichen steht noch aus; direktes Abrufen per URL sowie die Migration von Bildern oder Audio gehören nicht zu dieser Lieferung."
---

Beim Übertragen eines bestehenden Profils in einen anderen Editor sollten Sie zuerst den aktuellen Wert mit dem Importvorschlag vergleichen und dann über eine Ersetzung entscheiden. Dieser verallgemeinerte Bericht zur Implementierung in Stufe 1 zeigt die Grenzen zwischen Import und Veröffentlichung.

## Zuerst die unterstützten Eingabeformate festlegen

Diese Stufe unterstützt Text, CSV und statisches HTML. Eingefügten Inhalt oder eine Datei zu analysieren ist etwas anderes, als eine URL aufzurufen und dort Inhalte abzurufen. JSON, Bilder, Audio, dynamische Seiten und APIs externer Dienste sind nicht Teil der abgeschlossenen Implementierung.

Behandeln Sie HTML ausschließlich als Eingabedaten: Führen Sie keine Skripte aus und geben Sie das importierte HTML nicht selbst auf der öffentlichen Seite aus. Begrenzen Sie Textlänge, Felder, Links und Eingabeformate und wandeln Sie die Quelle anschließend in die für ein Profil benötigten Textvorschläge um.

## Prüfung der Vorschläge und Profilbearbeitung trennen

Veröffentlichen Sie analysierte Ergebnisse nicht sofort, sondern vergleichen Sie zuerst die aktuellen Werte mit den Vorschlägen. Die profilverantwortliche Person wählt die Felder einzeln aus und kann Vorschlagswerte bearbeiten, bevor sie sie in den Editor übernimmt. Jedes ausgewählte Feld ersetzt den aktuellen Wert; prüfen Sie deshalb bei jedem Import die Unterschiede. Vor dem Speichern lässt sich die Änderung rückgängig machen. Das bedeutet jedoch nicht, dass automatischer Schutz manueller Änderungen oder eine Konfliktzusammenführung fertiggestellt wäre.

## Aus importiertem Text keine Qualifikationen oder Rechte ableiten

Formulierungen in einer Biografie oder auf einer externen Seite belegen nicht automatisch eine Qualifikation, Zugehörigkeit, Kategorie oder Lizenz. Trennen Sie beschreibenden Text, der als Vorschlag importiert werden kann, von Angaben, für die eine Identitätsprüfung oder ein Antrag erforderlich ist. Neue Informationen an anderer Stelle aktualisieren oder veröffentlichen das bestätigte Profil nicht automatisch.

## Speichern und Veröffentlichen als getrennte Entscheidungen behandeln

Importvorschläge übernehmen, den Entwurf speichern und den öffentlichen Snapshot aktualisieren sind getrennte Aktionen. Speicher-Konflikte müssen noch in der Abnahme geprüft werden; ein erfolgreicher Speichervorgang bedeutet nicht, dass das Profil veröffentlicht wurde. Prüfen Sie Links, auch öffentliche Kalender-URLs, bevor deren Werte veröffentlicht werden, und übernehmen Sie keine privaten Notizen in öffentliche Daten.

## Zugehörige Änderung: HTTPS-Links aus öffentlichen Terminen öffnen

Eine von der Übernahme unabhängige Editor-Änderung ergänzt HTTPS-Links für öffentliche Kalendertermine. Ein Termin öffnet sein Ziel direkt in einem neuen Tab; ohne URL wird er ohne bedienbaren Link angezeigt. Prüfen Sie Format, Länge und das Fehlen eingebetteter Zugangsdaten. Verwenden Sie `noopener noreferrer` und nennen Sie das Öffnen des neuen Tabs im zugänglichen Namen.

Die zugehörigen Formulare entfernen zudem ein unnötiges Titelfeld für Kooperationszeitfenster sowie private Notizfelder. Datenbankänderungen, CI, Produktionsbereitstellung und Anzeigen mit Prüfdaten wurden kontrolliert. Die Anmeldung eines tatsächlichen Eigentümers mit anschließendem Speichern und Veröffentlichen eines echten Termins bleibt ungeprüft.

## Was geprüft wurde und welche Abnahme noch folgt

Implementierung, Integration und Produktivsetzung des Importablaufs in Stufe 1 wurden bestätigt. Ein vollständiger Test durch reale Nutzende — vom Import über Bearbeitung und Speichern bis zur Kontrolle der öffentlichen Anzeige — wurde jedoch noch nicht abgeschlossen. Auch die weitergehende Idee, aus der URL einer Aktivitätsplattform automatisch ein vollständiges Profil zu erstellen, ist nicht umgesetzt.

Zu den Grenzen veröffentlichten CSS siehe [Sicheres Benutzer-CSS und versionierte öffentliche Designs](/insights/user-css-versioned-theme-safety/). Zu Login-Grenzen siehe [Sitzungslebenszyklen über mehrere Dienste hinweg](/insights/multi-service-session-lifecycle/).
