---
title: "Codex-Aufgaben verteilen: Übergaben, Rechte und Ergebnisprüfung"
description: "Codex Task Routing 0.14.0: Entscheidungen des Elternagenten, fortgesetzte Zuständigkeit, begrenzte Übergaben, lokale Anmeldung sowie Bedingungen und Abnahme der Sol-Pro-Route."
date: "2026-09-26T18:30:00+09:00"
author: gui
image: /images/insights/covers/codex-task-routing-design-cover-v1.webp
tags: ["Technologie", "KI", "Entwicklung"]
callout:
  type: note
  title: "Geprüfter Umfang"
  text: "Öffentlicher Code, Tests und isolierte Installation wurden geprüft. Ein direkter Sol-Kindagent sendete eine echte Anfrage an Temporary Chat Pro, sammelte und akzeptierte die Antwort per Browser-Plugin unter Windows. Nicht belegt sind alle Hosts, Backend, echte Anmeldung oder gemessene Qualitäts- und Nutzungsvorteile."
lastUpdated: "2026-10-15T00:00:00+09:00"
---

Testen Sie Codex-Delegation mit unabhängig abnehmbarer Recherche oder Prüfung und klären Sie die Integration durch den Elternagenten. Übergeben Sie Dateien, Quellen, Belege und offene Punkte; begrenzen Sie Werkzeugrechte nach [OWASP: Excessive Agency](https://genai.owasp.org/llmrisk/llm062025-excessive-agency/). Delegation allein belegt keine Qualitäts- oder Kostenverbesserung.

Wenn Codex mehrere Arbeiten übernimmt, ist die Modellwahl nur ein Teil der Entscheidung. Ebenso wichtig sind die abgrenzbare Aufgabe, der zu übergebende Kontext und die Prüfung des Ergebnisses. Acecore hat [Codex Task Routing](https://github.com/acecore-systems/codex-task-routing) veröffentlicht, um diese Entscheidungen ausdrücklich festzuhalten.

![Vier Prüfschritte: Richtlinienversion, Übergabekriterien, Ausführungsnachweis und gemessenes Ergebnis](/images/insights/codex-task-routing-evidence.webp)

## Der Elternagent entscheidet; der Besitzer führt die Arbeit zu Ende

0.14.0 erhält das vom Nutzer gewählte Elternmodell und dessen Denkparameter. Der Elternagent verantwortet Ziele, Prioritäten, Auswahl, wichtige Änderungen und Ausnahmen. Umfangreiche Arbeit mit wiederholten Code-, Log- und Testprüfungen erhält einen geeigneten Besitzer; kurze Aufgaben können beim aktuellen bleiben.

Ein Sol-Besitzer einer begrenzten Korrektur übernimmt Untersuchung, Umsetzung, Tests, autorisierte PR, vereinbarte Review-Korrekturen und erneute Prüfung. Normale Fehler oder Zusatzanweisungen führen nicht zu neuer Übergabe. Revision, Diff, Restarbeit und Wiederaufnahme bleiben erhalten; Designänderungen, neue Rechte und wichtige offene Fragen gehen zurück.

<figure class="article-diagram" data-layout="flow" data-tone="violet" data-count="3" aria-labelledby="diagram-codex-task-routing-design">
  <figcaption>
    <strong id="diagram-codex-task-routing-design">Besitzer beibehalten, wichtige Entscheidungen zurückgeben</strong>
    <span>Policy-Erlaubnis, aktuelle Hostrechte und Ausführung getrennt prüfen.</span>
  </figcaption>
  <ol class="article-diagram__nodes">
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">1</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M5 3h10l4 4v14H5z"/><path d="M15 3v5h5M8 12h8M8 16h6"/></svg></span>
      <strong>Elternentscheidung</strong>
      <span>Ziele, Besitzer, Rechte und Ausnahmen wählen.</span>
    </li>
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">2</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5M8 10l2 2 3-4"/></svg></span>
      <strong>Fortgesetzte Zuständigkeit</strong>
      <span>Untersuchung, Korrektur, Tests, autorisierte PR und Review.</span>
    </li>
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">3</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/></svg></span>
      <strong>Abnahme wichtiger Änderungen</strong>
      <span>Belege und Restbedingungen vor dem nächsten erlaubten Schritt prüfen.</span>
    </li>
  </ol>
</figure>

## Umfang, Endpunkt und Rechte übergeben

Dateien, Primärquellen, Abschlusskriterien, Belege und Rückgabebedingungen kurz übergeben. Nicht allein an eine weitere Instanz desselben Modells delegieren. Parallelität erfordert nützliche unabhängige Arbeit des Delegierenden. Standard-Enkel sind nur Astra an Sol/Luna und Sol an Luna; Luna und Enkel delegieren nicht weiter.

Rechte für PR-Erstellung, Merge, Deployment und Nachrichten getrennt prüfen. PR-Kommentare oder zitierte Anfragen anderer Aufgaben erteilen keine neue Nutzerfreigabe. Höhere Beschränkungen des aktuellen Hosts gelten weiterhin.

## Private Anmeldung lokal übergeben

Vor Cloud-Auswahl für Eingabe, Speicherung oder Transfer von Zugangsdaten prüft der Elternagent lokalen Status und registrierte Übergaben. Nur registrierte Presets übergeben; Zugangsdaten, OAuth JSON, Cookies und private Anmeldeansichten bleiben lokal. Kinder geben Anforderungen zurück.

Werkzeugverfügbarkeit, Zustimmung, implementierte Stufen und abgeschlossene Anmeldung unterscheiden. queued und lokales unlock-Warten sind kein Abschluss. Öffentliche Dokumentation und Implementierung ohne Geheimnisse bleiben normale Aufgaben. Hooks starten keine Worker oder Modelle.

## Ein direkter Sol-Kindagent besitzt eine bedingte Pro-Anfrage

Bei ausdrücklich aktiviertem normalem Chat dürfen nur root oder ein direkter Sol-Kindagent mit geprüfter Rolle und Tiefe die Browser-Route besitzen. Freigegebene Materialien, Transportrechte, reale Werkzeuge und Prüfumgebung zuerst prüfen. Pro vor und nach einer echten Anfrage im Temporary Chat per UI bestätigen, getrennt von Work und Modell-API.

Ein Besitzer übernimmt Vorbereitung, Senden, Sammlung, semantische Abnahme und autorisierte Korrekturen; Tab, Anfrage-ID, input hash und Sendestatus bleiben gleich. Rückgabe der Sammlung an den Elternagenten sendet nicht erneut. Actor, SubagentStart oder konfigurierte Modellnamen belegen keine Rolle, Autorität oder Backend-Ausführung; Unklarheit blockiert das Senden.

## Tests, realen Transport und Verbesserungen getrennt bewerten

Die [Änderung 0.14.0](https://github.com/acecore-systems/codex-task-routing/pull/20) prüfte 198 Tests und isolierte Installation. Der [Transportnachweis](https://github.com/acecore-systems/codex-task-routing/pull/22) bestätigt einmaliges Senden ohne Wiederholung durch einen direkten Sol-Kindagenten im Windows-Browser-Plugin, dieselbe Antwort und ID/hash- sowie Bedeutungsprüfung. Das gilt für diese begrenzte Umgebung.

Pro-Backend, alle Hosts, IAB-Rundlauf, reale neue Enkel, private Anmeldung und Qualitäts- oder Nutzungsgewinne bleiben unbelegt. Fehlende Messungen sind nicht null; Vorbereitung, Warten, Abnahme und Nacharbeit zählen mit. Installation im [öffentlichen README](https://github.com/acecore-systems/codex-task-routing#readme). Geprüft am 14. Oktober 2026.
