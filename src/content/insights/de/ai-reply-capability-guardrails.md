---
title: "KI-Antworten dürfen keine unerfüllbaren Versprechen machen"
description: "So lässt sich verhindern, dass ein Informationsassistent eigenmächtig die Teilnahme, Terminplanung oder spätere Kontaktaufnahme durch Mitarbeitende verspricht. Behandelt werden Gesprächsstatus, Abruffehler, veraltete Entwürfe und geschlossene Gespräche."
date: "2026-10-06T01:10:00+09:00"
author: gui
image: /images/insights/ai-reply-capability-guardrails.webp
tags: ["AI", "Security", "Web"]
callout:
  type: note
  title: "Verallgemeinerter Fall; kein konkretes Gespräch wird veröffentlicht"
  text: "Der Fall behandelt Änderungen an Richtlinien und Klassifizierung, Prüfungen vor dem Versand, Tests, Bereitstellung und eine begrenzte betriebliche Beobachtung. Beiträge oder Konten anderer Personen werden nicht einbezogen; außerdem wird nicht belegt, dass sich jede Formulierung eines falschen Versprechens verhindern lässt."
---

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

## Was geprüft wurde und was noch nicht belegt ist

Klassifizierung und Prüfungen vor dem Versand wurden überarbeitet, Regressionstests ausgeführt, generierte Entwürfe geprüft und nach der Bereitstellung begrenzte Betriebsbeobachtungen vorgenommen. Das belegt keine Sicherheit für jedes Gespräch, jede Umformulierung oder jede Modelländerung. Externer Versand erfordert neben Inhaltsprüfungen auch betriebliche Berechtigung und Freigabe. Die oben beschriebene Abruf-Stop-Bedingung wurde im Code und in einem PR geprüft; ihr Betrieb in Produktion bleibt ungeprüft.

Zu Grenzen der Sucheingabe siehe [Öffentliches HTML sicher mit Vectorize synchronisieren](/de/insights/cloudflare-vectorize-safe-implementation/); zur Darstellung siehe [Markdown-Links in KI-Chatantworten sicher darstellen](/de/insights/ai-chat-markdown-link-safety/).
