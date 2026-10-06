---
title: "Profildaten als Entwurf importieren: vergleichen, auswählen, gezielt veröffentlichen"
description: "Eine verallgemeinerte Umsetzung für Profilimporte aus Text, CSV, statischem HTML und gemeinsamem JSON. Sie behandelt den Vergleich vorhandener Werte, das gezielte Ersetzen oder Zurücknehmen von Änderungen und die Trennung von Speichern und Veröffentlichung."
date: "2026-10-06T01:10:00+09:00"
lastUpdated: "2026-10-06T08:52:00+09:00"
author: gui
image: /images/insights/covers/profile-import-draft-boundaries-cover-v1.webp
tags: ["Web", "Import", "Security"]
callout:
  type: note
  title: "Umsetzung bestätigt; Abnahme mit echtem Konto steht aus"
  text: "Der Import von Text, CSV, statischem HTML und gemeinsamem JSON wurde umgesetzt, integriert und in Produktion bereitgestellt. Die vollständige Abnahme vom Import bis zum Speichern und Veröffentlichen mit einem echten Konto ist noch offen. Automatischer Abruf dienstspezifischer URLs sowie die Übernahme von Bildern oder Audio gehören nicht zum abgeschlossenen Umfang."
---

Wer ein vorhandenes Profil in einen anderen Editor überträgt, sollte die aktuellen Werte zuerst mit den Importvorschlägen vergleichen. Dieses anonymisierte Beispiel beschreibt die Grenzen zwischen Datenimport und Veröffentlichung eines Profils.

## Unterstützte Eingabeformate zuerst festlegen

Neben den ursprünglichen Formaten Text, CSV und statischem HTML liest der Ablauf jetzt auch eine gemeinsame JSON-Datei und bietet eine Vorlage zum Herunterladen. Eingefügte Inhalte oder eine Datei zu analysieren ist etwas anderes, als eine URL aufzurufen und dort Daten abzurufen. Dienstspezifische Exportformate, automatischer URL-Abruf, Bild- und Audioübernahme, dynamische Seiten und APIs externer Dienste sind nicht fertiggestellt.

Behandeln Sie HTML ausschließlich als Eingabedaten. Führen Sie keine Skripte aus und rendern Sie das importierte HTML nicht selbst auf der öffentlichen Seite. Begrenzen Sie Textlänge, Felder, Links und Eingabeformate; wandeln Sie die Quelle anschließend in Textvorschläge für das Profil um.

## Vorschläge prüfen, bevor vorhandene Werte ersetzt werden

Veröffentlichen Sie Analyseergebnisse nicht sofort, sondern vergleichen Sie sie zuerst mit den aktuellen Werten. Die profilverantwortliche Person wählt Felder einzeln aus und kann Vorschläge bearbeiten, bevor sie im Editor angewendet werden. Ein ausgewähltes Feld ersetzt den aktuellen Wert; prüfen Sie daher bei jedem Import die Unterschiede. Die Änderung lässt sich auch rückgängig machen. Damit ist nicht garantiert, dass Konflikte mit Änderungen auf anderen Seiten oder durch andere Personen automatisch gelöst werden.

## Gemeinsames JSON von der Unterstützung einzelner Dienste unterscheiden

Die Oberfläche zeigt den Unterstützungsstatus für 7 Aktivitätsdienste. Daten im gemeinsamen Format lesen zu können bedeutet nicht, dass ein Profil direkt über die URL jedes Dienstes abgerufen werden kann. Für nicht unterstützte URLs verweist die Oberfläche auf den Import durch Einfügen des Inhalts. Eine Statusanzeige für alle 7 Dienste bedeutet nicht, dass dafür jeweils eigene Exportformate oder API-Integrationen umgesetzt wurden.

Mit synthetischen Daten wurden JSON-Import, Vergleich mit vorhandenen Werten, Anwendung ausgewählter Felder, Rücknahme und die mobile Darstellung geprüft. Die Abnahme vom Import bis zum Speichern und Veröffentlichen mit einem echten Konto muss separat erfolgen.

## Aus importiertem Text keine Qualifikationen oder Rechte ableiten

Formulierungen in einer Biografie oder auf einer externen Seite belegen für sich allein keine Qualifikation, Zugehörigkeit, Kategorie oder Lizenz. Trennen Sie beschreibende Texte, die als Vorschläge importiert werden können, von Informationen, die eine Identitätsprüfung oder einen Antrag erfordern. Änderungen externer Informationen aktualisieren oder veröffentlichen ein vom Inhaber bestätigtes Profil nicht automatisch.

## Speichern und Veröffentlichen als getrennte Entscheidungen behandeln

Importvorschläge anzuwenden, den Entwurf zu speichern und die öffentliche Momentaufnahme zu aktualisieren sind getrennte Vorgänge. Auch Speicherkonflikte müssen bei der Abnahme geprüft werden; ein erfolgreicher Speichervorgang bedeutet nicht, dass das Profil veröffentlicht ist. Die profilverantwortliche Person sollte öffentliche Links einschließlich öffentlicher Kalender-URLs vor der Freigabe prüfen. Private Notizen gehören nicht in öffentliche Daten.

## Zugehörige Aktualisierung: HTTPS-Links aus öffentlichen Kalenderterminen öffnen

Eine vom Profilimport unabhängige Editor-Erweiterung ergänzt HTTPS-Links für öffentliche Kalendertermine. Ein Termin öffnet sein Ziel direkt in einem neuen Tab; Termine ohne URL bleiben ohne bedienbaren Link sichtbar. Prüfen Sie URL-Format, eingebettete Zugangsdaten und Eingabelänge. Verwenden Sie **noopener noreferrer** und nennen Sie das Öffnen eines neuen Tabs im zugänglichen Namen.

In den zugehörigen Formularen wurden außerdem das unnötige Titelfeld bei Verfügbarkeitszeiten für Zusammenarbeit und Felder für private Notizen entfernt. Datenbankänderungen, CI, Produktionsbereitstellung und Ansichten mit Prüfdaten wurden kontrolliert. Die Abnahme durch eine eingeloggte Person, die einen echten Termin speichert und veröffentlicht, ist noch nicht bestätigt.

<figure class="article-diagram" data-layout="boundary" data-tone="violet" data-count="2" aria-labelledby="diagram-profile-import-draft-boundaries">
  <figcaption>
    <strong id="diagram-profile-import-draft-boundaries">Grenzen von Import und Kalenderlinks</strong>
    <span>Dies sind getrennte Editorfunktionen. Die Abnahme von Speichern und Veröffentlichen durch eine eingeloggte Person ist unbestätigt.</span>
  </figcaption>
  <ol class="article-diagram__nodes">
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">1</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M6 3h8l4 4v14H6z"/><path d="M14 3v5h5M9 12h6M9 16h4"/></svg></span>
      <strong>Profil importieren</strong>
      <span>Die Person prüft und bearbeitet unterstützte Formate. Speichern und Veröffentlichen sind getrennte Aktionen.</span>
    </li>
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">2</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18M14 15h5m-2-2 2 2-2 2"/></svg></span>
      <strong>Öffentlicher Kalenderlink</strong>
      <span>HTTPS-Links öffnen in einem sicheren neuen Tab. Termine ohne Link bleiben nicht interaktiv.</span>
    </li>
  </ol>
</figure>

## Was bestätigt wurde und welche Abnahme noch aussteht

Umsetzung, Integration und Produktionsbereitstellung des Imports aus Text, CSV, statischem HTML und gemeinsamem JSON sind bestätigt. Ein vollständiger Ablauf mit einer realen Person – vom Import über Bearbeitung und Speichern bis zur Kontrolle der veröffentlichten Ansicht – wurde jedoch noch nicht getestet. Auch die weitergehende Idee, ein komplettes Profil automatisch aus einer URL eines Aktivitätsdienstes zu erstellen, ist nicht fertig.

Zu den Grenzen veröffentlichten CSS siehe [Sicheres Benutzer-CSS und versionierte öffentliche Designs](/insights/user-css-versioned-theme-safety/). Zu Login-Grenzen siehe [Sitzungslebenszyklen über mehrere Dienste hinweg](/insights/multi-service-session-lifecycle/).
