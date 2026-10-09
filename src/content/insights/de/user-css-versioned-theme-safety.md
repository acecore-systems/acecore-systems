---
title: "Benutzer-CSS und öffentliche Themes sicher verwalten: gemeinsame Quelle, begrenztes Rendering und feste Versionen"
description: "Ein anonymisiertes Profilbearbeitungskonzept, in dem GUI und direkte Bearbeitung dieselbe CSS-Quelle nutzen. Behandelt werden eine umfangreiche CSS-Syntax innerhalb einer Rendering-Grenze, Entwürfe und veröffentlichte Fassungen, unveränderliche Theme-Versionen, Auslistung und betriebliche Sperre."
date: "2026-10-06T01:10:00+09:00"
lastUpdated: "2026-10-09T15:00:00+09:00"
author: gui
image: /images/insights/covers/user-css-versioned-theme-safety-cover-v1.webp
tags: ["CSS", "Security", "Web"]
callout:
  type: note
  title: "Implementierungsprüfungen sind keine vollständige Abnahme durch Nutzer"
  text: "Die Datenbankänderung, die Bereitstellung in Produktion und die Darstellung mit Testdaten für den Store mit fest versionierten Themes wurden bestätigt. Die Erweiterung, bei der GUI und direkte Bearbeitung dieselbe CSS-Quelle nutzen, wurde als in main integriert und mit erfolgreicher CI bestätigt; innerhalb dieses Prüfbereichs wurden weder ihre Produktionsbereitstellung noch eine Abnahme mit angemeldeten Nutzern bestätigt. Ein vollständiger Ablauf mit Einreichung und Anwendung durch echte Nutzer sowie kostenpflichtige Verkäufe wurde nicht nachgewiesen."
---

Ein Profil-Editor, in dem sich Farben und Abstände über eine grafische Oberfläche anpassen und das gesamte Layout mit CSS bearbeiten lassen, muss sowohl die Bedienbarkeit als auch die Sicherheit des auf öffentlichen Seiten angezeigten Codes berücksichtigen. Dieser anonymisierte Implementierungsfall zeigt die Grenzen zwischen Bearbeitung und Verteilung.

## Gestaltungsfreiheit und Verteilung getrennt wählen

Prüfen Sie bei persönlicher Bearbeitung zuerst Bereichsbegrenzung und Speicherkonflikte. Verteilung erfordert zusätzlich feste Versions-IDs, Nutzungsbedingungen und Standarddarstellung nach Sperre. Testen Sie mit Grid und Pseudoelementen, dass äußere Navigation unverändert bleibt und Autoren-Updates angewandte Versionen nicht ersetzen.

[W3C Selectors：Geltungsbereich von Selektoren prüfen](https://www.w3.org/TR/selectors-4/)

## Eine gemeinsame CSS-Quelle für GUI und direkte Bearbeitung verwenden

Bei einer späteren Erweiterung wurde das vollständige CSS zur maßgeblichen Theme-Quelle, und die GUI wurde so geändert, dass sie dieselben CSS-Deklarationen bearbeitet. Von Hand geschriebene Kommentare, Deklarationen außerhalb der GUI-Steuerung und responsive Regeln bleiben erhalten. Das ältere Format mit GUI-Einstellungen und zusätzlichem CSS wird ebenfalls in ein vollständig bearbeitbares Stylesheet übernommen. Eine Änderung an Hilfseinstellungen für die Darstellung einer Optionsliste bedeutet nicht, dass sich das gerenderte CSS geändert hat.

Die Erweiterungen für Backend und Frontend wurden jeweils in ihren main-Zweig integriert; CI und Implementierungstests wurden geprüft. Innerhalb dieses Prüfbereichs belegt das weder die Bereitstellung in Produktion noch einen durch angemeldete Nutzer getesteten vollständigen Ablauf.

## Umfangreiche CSS-Syntax innerhalb der Rendering-Grenze unterstützen

Die anfängliche Beschränkung durch eine kleine Liste erlaubter Eigenschaften wurde erweitert. Unterstützt werden Grid und Flex, Variablen, Verläufe, Pseudoelemente, Transformationen, Animationen und Regeln wie @media, @supports und @container. Das bedeutet nicht, dass beliebiges CSS ungeprüft eingefügt wird. Der Syntaxbaum wird analysiert, und jeder Selektorzweig wird auf Nachfahren des festgelegten Profilbereichs beschränkt. Dieselbe Grenze gilt innerhalb bedingter Regeln; externe Bedienwege und Lizenzkennzeichnungen gehören nicht zum Theme-Bereich. [W3C Selectors](https://www.w3.org/TR/selectors-4/) ist ein Einstieg in die Selektorspezifikation.

Variablen- und Keyframe-Namen werden im veröffentlichten CSS in eindeutige Namen umgeschrieben, damit sie nicht mit Variablen der äußeren Oberfläche oder Animationen anderer Themes kollidieren. Die ursprünglichen Namen bleiben für die Bearbeitung erhalten. Der äußere Rendering-Wrapper nutzt zusätzlich Containment und Isolation, um die Wirkung weit gefasster Layoutregeln auf den Profilbereich zu begrenzen.

Das Abrufen externer Ressourcen, globale Regeln wie @import und @font-face, nicht analysierbare Syntax, CSS-Nesting, der HTML-Abschluss des style-Elements und Animationsreferenzen mit nicht sicher auflösbaren Namen werden abgewiesen. Auch die Größe der Eingabe und des erzeugten Ergebnisses wird geprüft. Bei der Veröffentlichung und beim Laden eines Snapshots werden Bereich, eindeutige Namen und die validierte kanonische CSS-Zeichenfolge erneut auf Übereinstimmung geprüft. Umfangreiche Syntaxunterstützung garantiert nicht dieselbe Darstellung in jedem Browser.

## Vorschau, Entwurf und Veröffentlichung trennen

Das Ausprobieren oder Anwenden eines Themes ändert einen Entwurf. Die öffentliche Seite ändert sich erst, wenn der Eigentümer veröffentlicht. Dass handgeschriebenes CSS erneut bearbeitet werden kann, bedeutet nicht, dass der Originaltext an Besucher weitergegeben wird. Der Speichervertrag erkennt Konflikte und verhindert, dass ein wiederholter Vorgang eine Version oder einen Entwurf doppelt aktualisiert.

## Aktive Designs nicht durch Änderungen anderer Autoren verändern

Bearbeitbare Angaben im Theme-Eintrag werden von unveränderlichen Versionen getrennt. Ein Nutzer importiert eine bestimmte Versions-ID; eine neue Version des Autors ändert bestehende Entwürfe und veröffentlichte Fassungen nicht automatisch. Herkunft und Version der angewendeten Theme-Fassung sowie die Quelle der Nutzungsbedingungen bleiben auch nach der Bearbeitung erhalten. Wird ein öffentliches Profil wieder privat, dürfen Name und Bild aus dem Autorenentwurf nicht in das verteilte Theme gelangen.

## Auslistung und betriebliche Sperre unterscheiden

Wenn ein Autor ein Theme auslistet, sind neue Entdeckungen und Anwendungen nicht mehr möglich; bestehende Nutzungen einer festgelegten Version werden dadurch nicht zwingend sofort widerrufen. Die betriebliche Sperre eines gefährlichen Themes hat eine andere Grenze: Öffentlicher Abruf und CSS aus bestehenden Snapshots werden gestoppt, und die Standarddarstellung wird wiederhergestellt. Auch bei einem Rollback auf einen älteren Snapshot wird der aktuelle Sperrstatus geprüft, damit CSS von vor der Sperre nicht wieder aktiviert wird.

<figure class="article-diagram" data-layout="flow" data-tone="violet" data-count="3" aria-labelledby="diagram-user-css-versioned-theme-safety">
  <figcaption>
    <strong id="diagram-user-css-versioned-theme-safety">Von der CSS-Bearbeitung zur festen Version</strong>
    <span>Codeintegration, CI und Produktivbereitstellung der früheren Store-Version wurden geprüft. Produktiv-/Login-Abnahme der CSS-Erweiterung, Nutzeranwendung und kostenpflichtige Verkäufe sind unbestätigt.</span>
  </figcaption>
  <ol class="article-diagram__nodes">
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">1</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="m8 6-5 6 5 6M16 6l5 6-5 6M14 4l-4 16"/></svg></span>
      <strong>Gemeinsame CSS-Quelle</strong>
      <span>GUI und direkte Bearbeitung nutzen dieselbe CSS-Quelle und erhalten handgeschriebene Regeln.</span>
    </li>
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">2</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M8 8h8M8 12h5M8 16h8"/></svg></span>
      <strong>Analysieren und begrenzen</strong>
      <span>Unterstützt Grid/Flex, Variablen, Pseudoelemente, responsive Regeln und Animation. Externe, globale oder nicht analysierbare Eingaben werden abgelehnt.</span>
    </li>
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">3</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/></svg></span>
      <strong>Version ausdrücklich veröffentlichen</strong>
      <span>Nach Vorschau/Entwurf eine unveränderliche Version veröffentlichen. Auslistung und betriebliche Sperre sind getrennt.</span>
    </li>
  </ol>
</figure>

## Was vor der Veröffentlichung zu prüfen ist

Prüfe Selektoren außerhalb des Bereichs, externe Anfragen, Eingabegröße, Speicherkonflikte, Wiederholungen, das Umstellen des Autorenprofils auf privat, Auslistung, betriebliche Sperre und Rollback. Die Produktionsbereitstellung des Stores mit festen Versionen und die Darstellung mit Testdaten wurden bestätigt. Innerhalb dieses Prüfbereichs sind jedoch weder die Produktionsbereitstellung noch die Abnahme mit angemeldeten Nutzern für die CSS-Editor-Erweiterung bestätigt. Bei einer früheren Prüfung gab es null öffentliche Themes; das ist keine Aussage über die aktuelle Zahl. Ein vollständiger Ablauf, in dem echte Nutzer Themes einreichen und anwenden, sowie kostenpflichtige Verkäufe wurden nicht nachgewiesen. Nutzungsbedingungen können nicht garantieren, dass CSS, das einen Browser erreicht, niemals kopiert wird.

Zum Eingabeteil der Bearbeitung siehe [Profilinformationen als Entwurf importieren](/insights/profile-import-draft-boundaries/); zu CMS-Abläufen siehe [den Sveltia-CMS-Leitfaden](/insights/cms-selection-and-turnstile/).
