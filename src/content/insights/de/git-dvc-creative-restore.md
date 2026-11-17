---
title: "Video- und Musikbearbeitungsmaterial mit Git und DVC wiederherstellen: Wiedergabe und Bearbeitung getrennt prüfen"
description: "So lassen sich Git-Bearbeitungsdefinitionen und DVC-Material einander zuordnen und anschließend Hashes, Wiedergabe und erneutes Speichern in der Bearbeitungsanwendung prüfen."
date: "2026-11-17T12:00:00+09:00"
author: gui
image: /images/insights/covers/restic-r2-backup-verification-cover-v1.webp
tags: ["Git", "DVC", "Produktion"]
---

Auch wenn sich die fertige Video- oder Musikdatei abspielen lässt, kann die Bearbeitung wegen fehlender Materialreferenzen oder Anwendungen möglicherweise nicht fortgesetzt werden. Wenn Bearbeitungsdefinitionen in Git verwaltet und Versionen großer Materialien über DVC zugeordnet werden, sollte getrennt dokumentiert werden, was jeweils wiederhergestellt werden konnte.

<figure class="article-diagram" data-layout="flow" data-tone="blue" data-count="3" aria-labelledby="diagram-git-dvc-creative-restore">
  <figcaption><strong id="diagram-git-dvc-creative-restore">Video- und Musikbearbeitungsmaterial mit Git und DVC wiederherstellen: Wiedergabe und Bearbeitung getrennt prüfen</strong><span>So lassen sich Git-Bearbeitungsdefinitionen und DVC-Material einander zuordnen und anschließend Hashes, Wiedergabe und erneutes Speichern in der Bearbeitungsanwendung prüfen.</span></figcaption>
  <ol class="article-diagram__nodes">
    <li><strong>Version festlegen</strong><span>Bearbeitungsdefinitionen und Materialreferenzen aufeinander abstimmen.</span></li>
    <li><strong>Unabhängig wiederherstellen</strong><span>Aus einem leeren Cache abrufen und Hashes abgleichen.</span></li>
    <li><strong>Verwendung prüfen</strong><span>Wiedergabe des Exports sowie Bearbeitung und erneutes Speichern getrennt testen.</span></li>
  </ol>
</figure>

## Was in Git und DVC aufeinander abgestimmt werden muss

Git speichert das Bearbeitungsprojekt, das Materialverzeichnis und die DVC-Referenzinformationen; große Video- und Audiodateien werden von DVC verwaltet. Herkunft und Nutzungsbedingungen des Materials werden ebenfalls im Verzeichnis festgehalten. Eine Referenz in Git allein belegt nicht, dass das Material selbst gespeichert wurde. Prüfen Sie daher das Übertragen an den Speicherort und den unabhängigen Abruf getrennt. Die [DVC-Dokumentation zu pull](https://doc.dvc.org/command-reference/pull) beschreibt, wie sich die zu einer Referenz gehörenden Daten abrufen lassen.

## Aus einem leeren Cache wiederherstellen und abgleichen

Auf einer internen Videoproduktionsplattform wurden mithilfe eines unabhängigen leeren Caches 2 Versionen gewechselt und die SHA-256-Hashes des auf die ursprüngliche Version zurückgesetzten Materials abgeglichen. Auch die relativen Referenzen der Bearbeitungsdefinition wurden geprüft. Die aus dem Original und der Wiederherstellung erzeugten 8 Sekunden langen Videos stimmten Byte für Byte überein. Dieses Ergebnis betrifft eine begrenzte lokale Wiederherstellung und einen Export; es belegt weder eine Wiederherstellung von einem externen Speicherort oder auf einem anderen PC noch das erneute Speichern in der Bearbeitungsoberfläche.

Bei einer anderen Videoversion wurden 60 Materialien von einem lokalen Speicherort in einen leeren Cache wiederhergestellt und ihre Hashes sowie die Referenzen der Bearbeitungsdefinition abgeglichen. Cloud-Synchronisierung und erneutes Laden in der Bearbeitungsoberfläche wurden bei diesem Test nicht durchgeführt. Ändert sich der Speicherort, wiederholen Sie das Verfahren für den neuen Speicherort.

Bei einem weiteren Test zur Musikproduktion wurden 7 Mediendateien aus einem unabhängigen lokalen Cache wiederhergestellt und Hashes und Größen sowie die relativen Referenzen von 3 Stems und der Videobearbeitungsdefinition abgeglichen. Mit der nativen Verarbeitung von Ardour wurden Speichern, erneutes Laden und Export über die gesamte Länge durchgeführt; die PCM-Differenz zur festgelegten WAV-Datei betrug 0. Diese Prüfung erfolgte mittels nativer Verarbeitung. Eine vollständige GUI-Prüfung mit Bearbeiten, Speichern unter einem anderen Namen und erneutem Öffnen, eine neue Wiederherstellung von einem externen Speicherort sowie eine Prüfung auf einem anderen PC wurden bei diesem Test nicht durchgeführt.

## Wiedergabe und Bearbeitbarkeit prüfen

1. Die betreffende Git-Version und das Material an einem Ort wiederherstellen, an dem die Originale nicht überschrieben werden.
2. Hashes und Referenzpfade im Verzeichnis sowie fehlendes Material prüfen.
3. Exportiertes Video oder Audio abspielen und Länge sowie fehlende Inhalte prüfen.
4. In der Bearbeitungsanwendung öffnen, unter einem anderen Namen erneut speichern, wieder öffnen und den Bearbeitungszustand prüfen.

Auch Anwendungsversion, Schriftarten, Plugins, Klangerzeuger und Rechte wirken sich auf die Wiederherstellung aus. Selbst wenn ein automatischer Vergleich Übereinstimmung ergibt, muss ein Mensch prüfen, ob Ton und Bild die beabsichtigte Qualität haben. Testen Sie zunächst das gesamte Verfahren an einem kurzen Projekt mit fiktivem Material und dokumentieren Sie das Prüfdatum sowie nicht geprüfte Speicherorte. Prüfdatum: 2026-11-17.
