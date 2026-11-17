---
title: "Profildaten als Entwurf importieren: vergleichen, auswählen, gezielt veröffentlichen"
description: "Kandidaten aus einer öffentlichen Profil-URL in einen Entwurf übernehmen: begrenzte Medien, Erhalt bei Lesefehlern sowie Speichern und Veröffentlichen durch Eigentümer."
date: "2026-10-06T01:10:00+09:00"
lastUpdated: "2026-11-17T00:00:00+09:00"
author: gui
image: /images/insights/covers/profile-import-draft-boundaries-cover-v1.webp
tags: ["Web", "Import", "Security"]
callout:
  type: note
  title: "Umsetzung bestätigt; Abnahme mit echtem Konto steht aus"
  text: "Begrenzte öffentliche URL-, Bild- und Audioimporte sind implementiert und produktiv ausgeliefert. Synthetische Abläufe und ausgewählte öffentliche Medien wurden geprüft. Die Abnahme von Rechteprüfung, Speichern und Veröffentlichung durch echte Eigentümer steht aus. Offizieller Login liegt außerhalb des Umfangs; Quellenbeschränkungen werden nicht umgangen."
---

Wer ein vorhandenes Profil in einen anderen Editor überträgt, sollte die aktuellen Werte zuerst mit den Importvorschlägen vergleichen. Dieses anonymisierte Beispiel beschreibt die Grenzen zwischen Datenimport und Veröffentlichung eines Profils.

## Manuelle Änderungen mit einem Biografiefeld prüfen

Bearbeiten Sie eine Biografie und rufen Sie einen anderen Kandidaten über eine unterstützte öffentliche URL ab. Prüfen Sie nicht ausgewählte Werte, Ersetzung und Abbruch; vergleichen Sie Entwurf und öffentliche Seite: Import allein veröffentlicht nicht.

[OWASP：Format, Werte und Länge von Eingaben prüfen](https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html)

## Unterstützte Eingabeformate zuerst festlegen

Der aktuelle Einstieg akzeptiert eine unterstützte öffentliche Profil-URL. Abgerufenes HTML wird als Daten analysiert, ohne Skripte oder Markup auszuführen; Länge, Anzahl, Format und HTTPS-Links werden geprüft. Datei, eingefügter Text und offizieller Login sind keine Importeingänge.

Links behalten ihre Reihenfolge und zusammengehörige Klammern innerhalb von URLs. Eine URL in Markdown wird nicht doppelt erfasst; dieselbe URL an anderer Stelle bleibt ein eigener Kandidat. Reihenfolge und Duplikate werden nur nach Entscheidung des Eigentümers bereinigt.

## Vorschläge prüfen, bevor vorhandene Werte ersetzt werden

Veröffentlichen Sie Analyseergebnisse nicht sofort, sondern vergleichen Sie sie zuerst mit den aktuellen Werten. Die profilverantwortliche Person wählt Felder einzeln aus und kann Vorschläge bearbeiten, bevor sie im Editor angewendet werden. Ein ausgewähltes Feld ersetzt den aktuellen Wert; prüfen Sie daher bei jedem Import die Unterschiede. Die Änderung lässt sich auch rückgängig machen. Damit ist nicht garantiert, dass Konflikte mit Änderungen auf anderen Seiten oder durch andere Personen automatisch gelöst werden.

Scheitert das erneute Lesen derselben URL, bleiben frühere Kandidaten, Bearbeitungen, Auswahl und abgerufene Medien erhalten. Fehler und frühere Herkunft werden angezeigt. Bei Quellenwechsel oder erfolgreichem erneutem Lesen werden sie ersetzt. Erhalt wendet nichts an und speichert oder veröffentlicht nichts.

## URL-Abruf von offizieller Integration unterscheiden

Der Abruf ist auf bekannte öffentliche Strukturen von Profcard, lit.link, POTOFU, HTML Meishi und foriio begrenzt. Identität, Indexierungsausschlüsse und Kandidatenkonsistenz werden geprüft; authentifizierte Seiten und unzulässige Ziele bleiben ausgeschlossen. Das belegt keine offizielle Anmeldung oder API-Integration und keine vollständige Migration.

Nicht unterstützte URLs und nicht abrufbare dynamische Inhalte gelten nicht als erfolgreicher Import. Bei 401, 403 oder 429 stoppen, ohne Beschränkungen über andere Browser oder APIs zu umgehen.

[OWASP: URL-Ziele und Weiterleitungen gegen SSRF begrenzen](https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html)

## Abgerufene Bilder und Audio vor der Auswahl prüfen

Kandidaten können GIF-Profilbilder sowie Bilder und Titel bekannter Linkkarten und öffentlicher Beiträge enthalten; erlaubte GitHub-Links zu Bildern, WAV und MP3 und einzelne öffentliche Dropbox-Dateien werden begrenzt unterstützt. POTOFU-Beschreibungen können aus Anfangsdaten ergänzt werden, wenn Profil, Bild und ursprünglicher Titel einen öffentlichen Beitrag eindeutig zuordnen. Weitere Texte erfordern unter anderem die Übereinstimmung der sichtbaren ersten Beiträge. Zusätzliche Seiten, eingebettete Player, mehrdeutige Beiträge und die foriio-Galerie bleiben ausgeschlossen; Quellenbeschränkungen werden nicht umgangen.

Quelle und Kandidat sowie host, path, Weiterleitungen, MIME, Inhalt, Größe und Fristen werden erneut geprüft. Eigentümer sehen oder hören dieselben Daten und prüfen Rechte, Titel und Beschreibung. Nur ausgewählte Anhänge gelangen zu ungespeicherten Werken, werden über den bestehenden Upload vorbereitet und normal gespeichert. Eigentümer, Profil, Medientyp und ready-Status werden erneut geprüft; manuelle Eingaben und öffentlicher snapshot bleiben erhalten.

<figure class="article-diagram" data-layout="flow" data-tone="violet" data-count="4" aria-labelledby="diagram-profile-import-draft-boundaries">
  <figcaption>
    <strong id="diagram-profile-import-draft-boundaries">Grenzen von Abruf, Auswahl, Speichern und Veröffentlichung</strong>
    <span>Lesefehler erhalten vorherige Kandidaten. Import allein ändert keinen öffentlichen snapshot.</span>
  </figcaption>
  <ol class="article-diagram__nodes">
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">1</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M5 3h10l4 4v14H5z"/><path d="M15 3v5h5M8 12h8M8 16h6"/></svg></span>
      <strong>Begrenzte Eingaben lesen</strong>
      <span>URLs, Formate und Abrufgrenzen prüfen.</span>
    </li>
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">2</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5M8 10l2 2 3-4"/></svg></span>
      <strong>Vergleichen und auswählen</strong>
      <span>Medien prüfen und Bearbeitungen erhalten.</span>
    </li>
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">3</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/></svg></span>
      <strong>Entwurf speichern</strong>
      <span>Auswahl und vorbereitete Anhänge normal speichern.</span>
    </li>
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">4</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M6 4v6a3 3 0 0 0 3 3h6a3 3 0 0 1 3 3v4"/><path d="M18 4v3a3 3 0 0 1-3 3H9a3 3 0 0 0-3 3v7"/></svg></span>
      <strong>Eigentümer veröffentlicht</strong>
      <span>Öffentlichen snapshot separat aktualisieren.</span>
    </li>
  </ol>
</figure>

## Aus importiertem Text keine Qualifikationen oder Rechte ableiten

Formulierungen in einer Biografie oder auf einer externen Seite belegen für sich allein keine Qualifikation, Zugehörigkeit, Kategorie oder Lizenz. Trennen Sie beschreibende Texte, die als Vorschläge importiert werden können, von Informationen, die eine Identitätsprüfung oder einen Antrag erfordern. Änderungen externer Informationen aktualisieren oder veröffentlichen ein vom Inhaber bestätigtes Profil nicht automatisch.

## Speichern und Veröffentlichen als getrennte Entscheidungen behandeln

Importvorschläge anzuwenden, den Entwurf zu speichern und die öffentliche Momentaufnahme zu aktualisieren sind getrennte Vorgänge. Auch Speicherkonflikte müssen bei der Abnahme geprüft werden; ein erfolgreicher Speichervorgang bedeutet nicht, dass das Profil veröffentlicht ist. Die profilverantwortliche Person sollte öffentliche Links einschließlich öffentlicher Kalender-URLs vor der Freigabe prüfen. Private Notizen gehören nicht in öffentliche Daten.

## Zugehörige Aktualisierung: HTTPS-Links aus öffentlichen Kalenderterminen öffnen

Eine vom Profilimport unabhängige Editor-Erweiterung ergänzt HTTPS-Links für öffentliche Kalendertermine. Ein Termin öffnet sein Ziel direkt in einem neuen Tab; Termine ohne URL bleiben ohne bedienbaren Link sichtbar. Prüfen Sie URL-Format, eingebettete Zugangsdaten und Eingabelänge. Verwenden Sie **noopener noreferrer** und nennen Sie das Öffnen eines neuen Tabs im zugänglichen Namen.

In den zugehörigen Formularen wurden außerdem das unnötige Titelfeld bei Verfügbarkeitszeiten für Zusammenarbeit und Felder für private Notizen entfernt. Datenbankänderungen, CI, Produktionsbereitstellung und Ansichten mit Prüfdaten wurden kontrolliert. Die Abnahme durch eine eingeloggte Person, die einen echten Termin speichert und veröffentlicht, ist noch nicht bestätigt.

## Was bestätigt wurde und welche Abnahme noch aussteht

Implementierung, CI und produktive Auslieferung begrenzter URLs, GIFs, Werkbilder und Audio sowie synthetische Bearbeitung, Rücknahme und ausgewählte öffentliche Dateien wurden geprüft. Das POTOFU-Quellprofil liefert weiterhin 429; ein CDN-Abruf belegt keinen Profilabruf. Die echte Abnahme von Rechteprüfung bis Speichern und Veröffentlichung ist offen. Geprüft am 14. Oktober 2026.

Zu den Grenzen veröffentlichten CSS siehe [Sicheres Benutzer-CSS und versionierte öffentliche Designs](/insights/user-css-versioned-theme-safety/). Zu Login-Grenzen siehe [Sitzungslebenszyklen über mehrere Dienste hinweg](/insights/multi-service-session-lifecycle/).
