---
title: "Benutzer-CSS und öffentliche Themes sicher verwalten: gemeinsame Quelle, begrenztes Rendering und feste Versionen"
description: "Gemeinsamer CSS-Quelltext für GUI und Handbearbeitung, sichere Darstellung und sofortige Anwendung fester Store-Themes. Separate Seiten/Karten, Eigentümervorschau, Entwürfe und Veröffentlichung."
date: "2026-10-06T01:10:00+09:00"
lastUpdated: "2026-10-15T00:00:00+09:00"
author: gui
image: /images/insights/covers/user-css-versioned-theme-safety-cover-v1.webp
tags: ["CSS", "Security", "Web"]
callout:
  type: note
  title: "Implementierungsprüfungen sind keine vollständige Abnahme durch Nutzer"
  text: "CSS/GUI, versionierter Store, sofortige Anwendung, unabhängige Ziele und Eigentümervorschau sind integriert und produktiv ausgeliefert; öffentliche Darstellung wurde geprüft. Authentifizierte Abläufe nutzten synthetische Profile. Echte Zustimmung, Anwendung, Speichern und Veröffentlichung sowie Verkäufe sind nicht belegt."
---

Ein Profil-Editor, in dem sich Farben und Abstände über eine grafische Oberfläche anpassen und das gesamte Layout mit CSS bearbeiten lassen, muss sowohl die Bedienbarkeit als auch die Sicherheit des auf öffentlichen Seiten angezeigten Codes berücksichtigen. Dieser anonymisierte Implementierungsfall zeigt die Grenzen zwischen Bearbeitung und Verteilung.

## Gestaltungsfreiheit und Verteilung getrennt wählen

Prüfen Sie bei persönlicher Bearbeitung zuerst Bereichsbegrenzung und Speicherkonflikte. Verteilung erfordert zusätzlich feste Versions-IDs, Nutzungsbedingungen und Standarddarstellung nach Sperre. Testen Sie mit Grid und Pseudoelementen, dass äußere Navigation unverändert bleibt und Autoren-Updates angewandte Versionen nicht ersetzen.

[W3C Selectors：Geltungsbereich von Selektoren prüfen](https://www.w3.org/TR/selectors-4/)

## Eine gemeinsame CSS-Quelle für GUI und direkte Bearbeitung verwenden

Bei einer späteren Erweiterung wurde das vollständige CSS zur maßgeblichen Theme-Quelle, und die GUI wurde so geändert, dass sie dieselben CSS-Deklarationen bearbeitet. Von Hand geschriebene Kommentare, Deklarationen außerhalb der GUI-Steuerung und responsive Regeln bleiben erhalten. Das ältere Format mit GUI-Einstellungen und zusätzlichem CSS wird ebenfalls in ein vollständig bearbeitbares Stylesheet übernommen. Eine Änderung an Hilfseinstellungen für die Darstellung einer Optionsliste bedeutet nicht, dass sich das gerenderte CSS geändert hat.

CSS/GUI und Eigentümervorschau sind integriert; CI und Auslieferung wurden geprüft. Authentifizierte Tests nutzen synthetische Profile und belegen keine Bearbeitung, Speicherung oder Veröffentlichung durch echte Eigentümer.

## Umfangreiche CSS-Syntax innerhalb der Rendering-Grenze unterstützen

Die anfängliche Beschränkung durch eine kleine Liste erlaubter Eigenschaften wurde erweitert. Unterstützt werden Grid und Flex, Variablen, Verläufe, Pseudoelemente, Transformationen, Animationen und Regeln wie @media, @supports und @container. Das bedeutet nicht, dass beliebiges CSS ungeprüft eingefügt wird. Der Syntaxbaum wird analysiert, und jeder Selektorzweig wird auf Nachfahren des festgelegten Profilbereichs beschränkt. Dieselbe Grenze gilt innerhalb bedingter Regeln; externe Bedienwege und Lizenzkennzeichnungen gehören nicht zum Theme-Bereich. [W3C Selectors](https://www.w3.org/TR/selectors-4/) ist ein Einstieg in die Selektorspezifikation.

Variablen- und Keyframe-Namen werden im veröffentlichten CSS in eindeutige Namen umgeschrieben, damit sie nicht mit Variablen der äußeren Oberfläche oder Animationen anderer Themes kollidieren. Die ursprünglichen Namen bleiben für die Bearbeitung erhalten. Der äußere Rendering-Wrapper nutzt zusätzlich Containment und Isolation, um die Wirkung weit gefasster Layoutregeln auf den Profilbereich zu begrenzen.

Das Abrufen externer Ressourcen, globale Regeln wie @import und @font-face, nicht analysierbare Syntax, CSS-Nesting, der HTML-Abschluss des style-Elements und Animationsreferenzen mit nicht sicher auflösbaren Namen werden abgewiesen. Auch die Größe der Eingabe und des erzeugten Ergebnisses wird geprüft. Bei der Veröffentlichung und beim Laden eines Snapshots werden Bereich, eindeutige Namen und die validierte kanonische CSS-Zeichenfolge erneut auf Übereinstimmung geprüft. Umfangreiche Syntaxunterstützung garantiert nicht dieselbe Darstellung in jedem Browser.

## Anprobe, CSS-Speichern und Store-Anwendung trennen

CSS/GUI-Bearbeitung, Anprobe und Entwurfsspeicherung ändern die Bearbeitungsansicht des Eigentümers. Besucher sehen gespeichertes CSS erst nach separater Profilveröffentlichung. Speicherkonflikte werden erkannt und doppelte Aktualisierungen durch Wiederholung verhindert.

Auswahl einer verfügbaren öffentlichen festen Version, Zustimmung und Anwendung ändern sofort das Erscheinungsbild eines bereits öffentlichen Profils. Nur das Theme wechselt; veröffentlichte Inhalte bleiben erhalten und Entwurfstext oder Bilder werden nicht veröffentlicht. Private Profile bleiben privat. Store-Anwendung und Entwurfsspeicherung von eigenem CSS benötigen verschiedene Erklärungen.

<figure class="article-diagram" data-layout="boundary" data-tone="violet" data-count="3" aria-labelledby="diagram-user-css-versioned-theme-safety">
  <figcaption>
    <strong id="diagram-user-css-versioned-theme-safety">Wirkung von CSS-Bearbeitung und Store-Anwendung</strong>
    <span>Ein Store-Theme ändert bei öffentlichen Profilen sofort nur das Aussehen des gewählten Ziels.</span>
  </figcaption>
  <ol class="article-diagram__nodes">
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">1</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M5 3h10l4 4v14H5z"/><path d="M15 3v5h5M8 12h8M8 16h6"/></svg></span>
      <strong>CSS/GUI bearbeiten</strong>
      <span>Eigentümervorschau und Entwurf; Veröffentlichung separat.</span>
    </li>
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">2</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5M8 10l2 2 3-4"/></svg></span>
      <strong>Feste Version anwenden</strong>
      <span>Öffentliche Verfügbarkeit und Zustimmung prüfen; private Profile nicht veröffentlichen.</span>
    </li>
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">3</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/></svg></span>
      <strong>Seite und Verzeichnis trennen</strong>
      <span>CSS, Entwurf und öffentliche Version je Ziel.</span>
    </li>
  </ol>
</figure>

## Seite und Verzeichnis trennen und Eigentümerinhalte prüfen

Profilseite und Verzeichniskarte haben eigenes CSS, Entwürfe, öffentliche Versionen, Herkunft und Store-Ziele. Ein Seitentheme ändert das Verzeichnis nicht; inkompatible Versionen und Zieländerungen werden abgewiesen. Karten behalten gemeinsame Maße und responsive Grenzen, geprüft mit langen Namen und Beschreibungen.

Einstellungen zeigen gespeicherte Eigentümervorschau und Themenname mit Auswahl und Bearbeitung im selben Bildschirm. Wechsel zwischen visueller und Codebearbeitung erhält ungespeicherte Namen, CSS und Konfliktversion. Neben Mustern werden eigene Inhalte geprüft; Speichern aktualisiert nur den Entwurf des gewählten Ziels.

## Aktive Designs nicht durch Änderungen anderer Autoren verändern

Bearbeitbare Angaben im Theme-Eintrag werden von unveränderlichen Versionen getrennt. Ein Nutzer importiert eine bestimmte Versions-ID; eine neue Version des Autors ändert bestehende Entwürfe und veröffentlichte Fassungen nicht automatisch. Herkunft und Version der angewendeten Theme-Fassung sowie die Quelle der Nutzungsbedingungen bleiben auch nach der Bearbeitung erhalten. Wird ein öffentliches Profil wieder privat, dürfen Name und Bild aus dem Autorenentwurf nicht in das verteilte Theme gelangen.

## Auslistung und betriebliche Sperre unterscheiden

Wenn ein Autor ein Theme auslistet, sind neue Entdeckungen und Anwendungen nicht mehr möglich; bestehende Nutzungen einer festgelegten Version werden dadurch nicht zwingend sofort widerrufen. Die betriebliche Sperre eines gefährlichen Themes hat eine andere Grenze: Öffentlicher Abruf und CSS aus bestehenden Snapshots werden gestoppt, und die Standarddarstellung wird wiederhergestellt. Auch bei einem Rollback auf einen älteren Snapshot wird der aktuelle Sperrstatus geprüft, damit CSS von vor der Sperre nicht wieder aktiviert wird.

## Was vor der Veröffentlichung zu prüfen ist

Bereichsfremde Selektoren, externe Abrufe, Kapazität, Konflikte, Wiederholungen, Delisting, Sperrung und Rückkehr prüfen. Auslieferung fester Versionen, CSS/GUI, unabhängiger Ziele und Vorschau sowie öffentliche Kataloge und echte Karten wurden geprüft. Authentifizierte Tests sind synthetisch; echte Zustimmung, Anwendung, Speicherung und Veröffentlichung bleiben offen. Bedingungen verhindern nicht jede Kopie ausgelieferten CSS. Geprüft am 14. Oktober 2026.

Zum Eingabeteil der Bearbeitung siehe [Profilinformationen als Entwurf importieren](/insights/profile-import-draft-boundaries/); zu CMS-Abläufen siehe [den Sveltia-CMS-Leitfaden](/insights/cms-selection-and-turnstile/).
