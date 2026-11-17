---
title: "Automatisierte Aktionen auf Anmeldeseiten sicher trennen: Gleichzeitige Eingaben auf einem gemeinsam genutzten Desktop verhindern"
description: "So lassen sich der Geltungsbereich der exklusiven Sperre, der Abbruch bei Konflikten und die erneute Prüfung unmittelbar vor dem Absenden gestalten, wenn mehrere Automatisierungen denselben Bildschirm bedienen."
date: "2026-11-17T12:00:00+09:00"
author: gui
image: /images/insights/covers/multi-service-session-lifecycle-cover-v1.webp
tags: ["Authentifizierung", "Automatisierung", "Betrieb"]
---

Wenn mehrere Automatisierungen gleichzeitig denselben Desktop bedienen, kann eine davon Eingaben auf einer von der anderen geöffneten Seite vornehmen. Bei Anmeldeseiten ist es daher wichtig, Bildschirmaktionen nur nacheinander zuzulassen und das Ziel unmittelbar vor dem Absenden zu überprüfen. Dies wird anhand eines synthetischen Tests erläutert, der weder vertrauliche Informationen noch echte Verbindungsziele verwendet.

<figure class="article-diagram" data-layout="flow" data-tone="blue" data-count="3" aria-labelledby="diagram-desktop-lock">
  <figcaption><strong id="diagram-desktop-lock">Konflikte bei Bildschirmaktionen verhindern</strong><span>Der Zugriff auf den gemeinsam genutzten Bildschirm wird auf jeweils eine Aktion beschränkt.</span></figcaption>
  <ol class="article-diagram__nodes">
    <li><strong>Bedienrecht erwerben</strong><span>Ist ein anderer Prozess aktiv, wird der Bildschirm nicht bedient.</span></li>
    <li><strong>Ziel erneut prüfen</strong><span>Vor dem Absenden Bildschirm und Verbindungsziel abgleichen.</span></li>
    <li><strong>Freigeben und Ergebnis prüfen</strong><span>Nach der Bildschirmaktion das Ergebnis separat überprüfen.</span></li>
  </ol>
</figure>

## Den gemeinsamen Desktop als gemeinsame Ressource behandeln

Auch wenn jede Automatisierung eine eigene Sperre besitzt, lassen sich Konflikte nicht verhindern, wenn sie tatsächlich auf demselben Bildschirm Eingaben vornehmen. Alle Prozesse, die denselben Desktop verwenden, müssen dieselbe exklusive Sperre nutzen. Prozesse, die sie nicht erwerben können, stoppen vor dem Klicken oder Eingeben. Als Beispiel für einen Mechanismus zur Steuerung des gleichzeitigen Zugriffs auf gemeinsame Ressourcen ist auch die [Beschreibung von Windows-Mutexen](https://learn.microsoft.com/en-us/windows/win32/sync/using-mutex-objects) hilfreich.

Die exklusive Sperre bleibt während der Eingabe und der Bildschirmwechsel bestehen. Vor dem Absenden werden der aktuelle Bildschirm und das Verbindungsziel erneut überprüft. Ob der Bildschirm auch während langwieriger externer Prozesse belegt bleiben muss, wird anhand des tatsächlich benötigten Bildschirmzugriffs entschieden. Die Gestaltung berücksichtigt außerdem die Freigabe bei Ausnahmen, den Bildschirmzustand nach einem Prozessabbruch und den Umgang mit Übermittlungen, deren Ergebnis unbekannt ist.

## Was auf einem synthetischen Bildschirm geprüft wurde

Bei einem intern registrierten Authentifizierungsweg wurden Bildschirmwechsel sowie die erneute Prüfung und Bedienung vor dem Absenden in den Geltungsbereich der gemeinsamen exklusiven Sperre aufgenommen. Auf einem festen synthetischen Bildschirm wurden erfolgreiche Übermittlungen, Stopps aufgrund von Konflikten, der Übergang zur Multi-Faktor-Authentifizierung und Ausnahmen beim Klicken überprüft. Dies stellt weder einen Test mit echten Zugangsdaten noch einen Nachweis der Funktion auf allen Websites dar.

Ist unklar, ob eine Übermittlung bereits erfolgt ist, wird der Zustand auf der Zielseite geprüft, statt wiederholt erneut zu senden. Die Sperre verringert das Risiko falscher Eingaben, ersetzt aber weder die Identitätsprüfung und Autorisierung noch die Prüfung der Eingaben und des Übermittlungsergebnisses.

## Was Sie zuerst ausprobieren können

Erstellen Sie ein fiktives Formular und starten Sie zwei Prozesse gleichzeitig. Prüfen Sie, ob nur einer den Bildschirm bedient und der andere vor der Eingabe stoppt, und ob der nächste Prozess auch nach einer Ausnahme während der Ausführung fortgesetzt werden kann. Ergänzen Sie außerdem einen Fall, in dem sich der Bildschirm währenddessen ändert, und stellen Sie sicher, dass bei einer fehlgeschlagenen erneuten Prüfung nichts abgesendet wird. Prüfdatum: 2026-11-17.
