---
title: "KI-Antworten dürfen keine unerfüllbaren Versprechen machen"
description: "So lässt sich verhindern, dass ein Informationsassistent eigenmächtig die Teilnahme, Terminplanung oder spätere Kontaktaufnahme durch Mitarbeitende verspricht. Behandelt werden Gesprächsstatus, Abruffehler, veraltete Entwürfe und geschlossene Gespräche."
date: "2026-10-06T01:10:00+09:00"
lastUpdated: "2026-10-09T15:00:00+09:00"
author: gui
image: /images/insights/covers/ai-reply-capability-guardrails-cover-v1.webp
tags: ["AI", "Security", "Web"]
callout:
  type: note
  title: "Verallgemeinerter Fall; kein konkretes Gespräch wird veröffentlicht"
  text: "Der Fall behandelt Änderungen an Richtlinien und Klassifizierung, Prüfungen vor dem Versand, Tests, Bereitstellung und eine begrenzte betriebliche Beobachtung. Beiträge oder Konten anderer Personen werden nicht einbezogen; außerdem wird nicht belegt, dass sich jede Formulierung eines falschen Versprechens verhindern lässt."
---

Definieren Sie öffentliche Auskünfte, Übergaben an Mitarbeitende und tatsächliche Buchungen als getrennte Fähigkeiten. [OWASP: Excessive Agency](https://genai.owasp.org/llmrisk/llm062025-excessive-agency/) unterstützt die Gestaltung erlaubter Aktionen und Freigaben. Der folgende Text behandelt Antwortgrenzen, ohne plattformspezifische Verfahren zum automatisierten Versand.

Auch eine natürlich klingende Informationsantwort darf nicht ohne Beleg versprechen, dass sich eine mitarbeitende Person später meldet oder zu einer bestimmten Zeit teilnimmt. Dieser verallgemeinerte Bericht über einen internen Antwortablauf nennt weder Plattform noch Gespräch.

## Festlegen, was der Assistent erklären und was er ausführen kann

Öffentliche Informationen zu erläutern, die Wünsche einer Person zu klären und tatsächlich Kontakt aufzunehmen oder teilzunehmen sind unterschiedliche Fähigkeiten. Lege die Rolle des Assistenten in den Anweisungen fest und wende sie auf erste Antworten, Folgeantworten und Prüfungen vor dem Versand gleichermaßen an. Eine Einstellung für mehr Schlussfolgerungsaufwand verleiht keine Handlungsbefugnis und gibt keinen Mitarbeitendenkalender frei.

## Den Gesprächsstatus statt einzelner Schlüsselwörter verwenden

Übermittle den ursprünglichen Beitrag, den tatsächlich bestätigten jüngsten Austausch, bereits erteilte Hinweise, offene Fragen und den Abschlussstatus des Gesprächs. Ordne jemanden nicht allein wegen eines passenden Wortes als teilnahmeinteressiert ein, wenn die Person einen anderen Wunsch geäußert hat. Ein falsches Versprechen aus einer früheren KI-Antwort ist ebenfalls kein Beleg dafür, dass jemand handeln wird.

## Sprecher und Bedeutung vor dem Versand prüfen

„Eine mitarbeitende Person meldet sich später“ ist ein Versprechen der Person, die handeln soll. Ein Zitat der anderen Person und ein allgemeiner Hinweis auf eine Veranstaltung haben eine andere Bedeutung. Sperre nicht pauschal eine Zeichenfolge, sondern prüfe Rolle, Gesprächsstatus und Belege für die Handlung. Halte mehrdeutige Antworten zurück und gib sie bei Bedarf an einen Menschen weiter. Außerdem muss verhindert werden, dass die Generierung so fortgesetzt wird, als seien Quellen geprüft worden, wenn der Abruf fehlschlägt oder eine ungültige Antwort liefert. Diese Stop-Bedingung auf der Abrufseite wurde nur im korrigierten Code und in der PR-Prüfung bestätigt; der Betrieb dieses Pfads in Produktion wurde nicht bestätigt.

## Ähnliche Formulierungen und verschiedene Anfragen nicht verwechseln

Unterscheide einen Beitrag, der Teilnehmende sucht, von der Aussage einer Person, dass sie teilnehmen möchte. Ähnliche Formulierungen machen Produkte, Editionen oder Nutzungsbedingungen nicht gleich; vermische keine Hinweise für unterschiedliche Umgebungen. Prüfe vor dem Versand auch unbegründete Dankesäußerungen und Antworten, die eine Person bereits als angenommen behandeln. Selbst wenn Antworten priorisiert werden, braucht es bei Rate Limits begrenzte Wartezeiten und Schutz vor Duplikaten. Eine Wartezeit oder ausgelassene Antwort darf nicht als erfolgreicher Versand protokolliert werden.

## Alte Entwürfe erneut anhand der aktuellen Bedingungen prüfen

Ein beim Erstellen geprüfter Entwurf kann veraltet sein, wenn sich Gespräch oder Richtlinie ändern. Prüfe ihn unmittelbar vor dem Versand erneut anhand des neuesten Status und sende keine Entwürfe für geschlossene Gespräche. Protokolliere einen ausgelassenen Versand und ein geschlossenes Gespräch getrennt von einem erfolgreichen Versand. Eine Antwort kann auch entfallen, wenn eine unnötige Frage den Austausch nur verlängern würde.

<figure class="article-diagram" data-layout="branches" data-tone="violet" data-count="3" aria-labelledby="diagram-ai-reply-capability-guardrails">
  <figcaption>
    <strong id="diagram-ai-reply-capability-guardrails">Belege und Fähigkeit vor der Antwort prüfen</strong>
    <span>Der Gesprächskontext entscheidet zwischen Antworten und Zurückstellen. Der Produktivbetrieb des Abrufstopps ist unbestätigt.</span>
  </figcaption>
  <ol class="article-diagram__nodes">
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">1</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M5 5h14v11H9l-4 4V5Z"/><path d="M8 9h8M8 12h5"/></svg></span>
      <strong>Sprecher und Anfrage erfassen</strong>
      <span>Prüfen, ob es eine Einladung oder Interesse ist, welche Ausgabe gemeint ist und wie der Gesprächsstatus lautet.</span>
    </li>
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">2</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/></svg></span>
      <strong>Nur belegt antworten</strong>
      <span>Nur tatsächlich Machbares mitteilen und unmittelbar vor dem Senden erneut prüfen.</span>
    </li>
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">3</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg></span>
      <strong>Bei Unklarheit zurückstellen</strong>
      <span>Fehlerhafte oder fehlgeschlagene Abrufe nicht als gelesen behandeln, sondern an eine Person geben. Wartezeiten begrenzen und Duplikate vermeiden.</span>
    </li>
  </ol>
</figure>

## Was geprüft wurde und was noch nicht belegt ist

Klassifizierung und Prüfungen vor dem Versand wurden überarbeitet, Regressionstests ausgeführt, generierte Entwürfe geprüft und nach der Bereitstellung begrenzte Betriebsbeobachtungen vorgenommen. Das belegt keine Sicherheit für jedes Gespräch, jede Umformulierung oder jede Modelländerung. Externer Versand erfordert neben Inhaltsprüfungen auch betriebliche Berechtigung und Freigabe. Die oben beschriebene Abruf-Stop-Bedingung wurde im Code und in einem PR geprüft; ihr Betrieb in Produktion bleibt ungeprüft.

Zu Grenzen der Sucheingabe siehe [Öffentliches HTML sicher mit Vectorize synchronisieren](/de/insights/cloudflare-vectorize-safe-implementation/); zur Darstellung siehe [Markdown-Links in KI-Chatantworten sicher darstellen](/de/insights/ai-chat-markdown-link-safety/).
