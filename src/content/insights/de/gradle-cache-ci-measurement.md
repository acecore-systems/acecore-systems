---
title: "Doppelte GitHub-Actions-Ausführungen und Gradle-Build-Zeiten unabhängig voneinander reduzieren"
description: "Startbedingungen für doppelte CI-Ausführungen bei Push und PR überprüfen und den Android-Gradle-Cache mit demselben Commit vergleichen. Entscheidungskriterien und Grenzen der Messung im Überblick."
date: "2026-11-17T12:00:00+09:00"
author: gui
image: /images/insights/covers/astro-performance-tuning-cover-v2.webp
tags: ["GitHub Actions", "Android", "Betrieb"]
---

Wenn die Android-CI bei jeder Ausführung dieselben Schritte wiederholt, kann ein Vergleich einschließlich der Zeit für die Cache-Wiederherstellung als Entscheidungsgrundlage für die Einführung eines Caches dienen. Anhand eines Tests mit demselben Commit im Android-Job von DaysChat zeigen wir, wie Geschwindigkeit und Reproduzierbarkeit überprüft wurden.

<figure class="article-diagram" data-layout="flow" data-tone="blue" data-count="3" aria-labelledby="diagram-gradle">
  <figcaption><strong id="diagram-gradle">Caches mit derselben Eingabe vergleichen</strong><span>Betrachtet wird der gesamte Job einschließlich des Aufwands für Speichern und Wiederherstellen.</span></figcaption>
  <ol class="article-diagram__nodes">
    <li><strong>Erste Ausführung</strong><span>Cache erstellen und Speicherzeit erfassen.</span></li>
    <li><strong>Erneute Ausführung desselben Commits</strong><span>Wiederherstellungszeit und wiederverwendete Tasks prüfen.</span></li>
    <li><strong>Artefakte überprüfen</strong><span>Zielarchitekturen und APK-Erzeugung prüfen.</span></li>
  </ol>
</figure>

## Dieselben Prüfungen nicht bei Push und PR doppelt ausführen

In einem anderen Sitzungsprotokollsystem wurden sowohl beim Push auf einen Arbeitsbranch als auch beim PR die reguläre CI und Rust parity gestartet. Der Push-Auslöser wurde auf main beschränkt, die PR-Prüfung blieb bestehen, und für Prüfungen vor dem Erstellen eines PR wurde eine manuelle Ausführung ermöglicht. Die Auslösebedingungen für Produktionsreleases wurden nicht geändert.

Eine interne Untersuchung ergab für den Monat 11 insgesamt 97 durch Push ausgelöste Ausführungen, bei denen auch die PR-Prüfung erfolgreich war. Ihre Gesamtlaufzeit auf Linux-Runnern betrug 342 Minuten. Dies ist die Laufzeit der auf Überschneidungen untersuchten Ausführungen, nicht die nach der Änderung tatsächlich eingesparte Zeit oder der eingesparte Rechnungsbetrag. Vor der Eingrenzung des Umfangs wird geprüft, wie Änderungen ohne PR validiert werden und ob verpflichtende Checks und Releases weiterhin funktionieren. Die Bedingungen für push und pull_request lassen sich unter [GitHub-Actions-Ereignisse](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows) nachlesen.

## Messergebnisse und Bedingungen innerhalb des Jobs

Bei einem in den internen Änderungsaufzeichnungen dokumentierten Vergleich mit demselben Commit dauerte der Android-Job bei der ersten Ausführung 16 Minuten 20 Sekunden und bei der erneuten Ausführung einschließlich Wiederherstellung 6 Minuten 16 Sekunden. 194 Gradle-Tasks wurden wiederverwendet; auch die Prüfung von x86_64 und arm64-v8a sowie die APK-Erzeugung waren erfolgreich. Das Speichern bei der ersten Ausführung dauerte 34 Sekunden, die Wiederherstellung bei der erneuten Ausführung 62 Sekunden. Der Test-Cache war etwa 1.81 GB groß.

| Beobachtung   | Erste Ausführung       | Erneute Ausführung            |
| ------------- | ---------------------- | ----------------------------- |
| Android-Job   | 16 Minuten 20 Sekunden | 6 Minuten 16 Sekunden         |
| Cache-Vorgang | Speichern: 34 Sekunden | Wiederherstellen: 62 Sekunden |

Dieses 1 Ausführungspaar wurde mit einem PR-spezifischen Cache gemessen. In der endgültigen Konfiguration speichert nur main den gemeinsamen Cache; PRs stellen ihn ausschließlich lesend wieder her. Es wurde nicht gemessen, ob sich bei allen PRs in der endgültigen Konfiguration dieselbe Zeitersparnis ergibt oder ob die Rechnung sinkt. Auch die Ausführungsumgebung und die Cache-Trefferrate beeinflussen das Ergebnis.

## Bedingungen für die Wiederverwendung und sicheres Speichern festlegen

Der [Gradle-Build-Cache](https://docs.gradle.org/current/userguide/build_cache.html) entscheidet anhand der Ein- und Ausgaben von Tasks über deren Wiederverwendung. Ungenaue Deklarationen der Task-Eingaben können zur Verwendung veralteter Ausgaben führen. Vergleichen Sie deshalb zunächst eine saubere Ausführung sowie Artefakte und Testergebnisse. Prüfen Sie auch, ob der Cache bei Änderungen an Abhängigkeiten oder Build-Konfiguration wie erwartet ungültig wird.

Beschränken Sie, welche Ausführungen speichern dürfen, und konfigurieren Sie den gemeinsamen Cache so, dass nicht vertrauenswürdige Änderungen ihn nicht aktualisieren können. Für den [Abhängigkeits-Cache von GitHub Actions](https://docs.github.com/en/actions/concepts/workflows-and-actions/dependency-caching) gelten Einschränkungen beim Zugriff und Hinweise zur Nutzung. Verwenden Sie den Cache nicht zur Speicherung von Geheimnissen und beobachten Sie Größe, Speicher- und Wiederherstellungszeit sowie die Gesamtdauer des Jobs gemeinsam.

Beschränken Sie den Umfang zunächst auf 1 Job und erfassen Sie Artefakte und Zeiten bei der ersten und der erneuten Ausführung desselben Commits. Auch wenn eine Zeitersparnis sichtbar ist, prüfen Sie separat, ob der Build bei anderen Änderungen und bei fehlendem Cache ordnungsgemäß funktioniert. Überprüft am: 2026-11-17.
