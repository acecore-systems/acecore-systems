---
title: "Prüfen, ob KI Aufzeichnungen widerspricht: Nicht erwähnte Angaben und andere Ereignisse bei der Kanonprüfung unterscheiden"
description: "Wie lassen sich bei der Prüfung generierter Texte anhand von Aufzeichnungen nicht erwähnte Angaben, Widersprüche und andere Szenen unterscheiden? Ein Überblick über die Bewertung und Grenzen anhand von Alphas festem Set aus 31 Fällen."
date: "2026-11-17T12:00:00+09:00"
author: gui
image: /images/insights/covers/ai-reply-capability-guardrails-cover-v1.webp
tags: ["KI", "Überprüfung", "Betrieb"]
---

Wenn KI Texte auf Grundlage bestehender Geschichten oder Geschäftsaufzeichnungen erstellt, könnten auch neue Formulierungen abgelehnt werden, falls alle nicht dokumentierten Inhalte als Widerspruch gelten. Umgekehrt sollen Texte, die ausdrücklich dokumentierten Angaben zum selben Ereignis widersprechen, nicht übersehen werden. Am Beispiel der Prüfung von Kandidaten für Alphas Kanon betrachten wir die Urteilsgrundlagen und den Umfang der Bewertung.

<figure class="article-diagram" data-layout="flow" data-tone="violet" data-count="3" aria-labelledby="diagram-lore">
  <figcaption><strong id="diagram-lore">Kandidaten mit den Aufzeichnungen abgleichen</strong><span>Vor der Beurteilung prüfen, ob sich alles auf denselben Gegenstand, dasselbe Ereignis und denselben Zeitpunkt bezieht.</span></figcaption>
  <ol class="article-diagram__nodes">
    <li><strong>Aufzeichnungen prüfen</strong><span>Die relevanten Originalstellen und Bezugsgegenstände zum Kandidaten suchen.</span></li>
    <li><strong>Szenen abgleichen</strong><span>Belege dafür prüfen, dass dasselbe Ereignis und derselbe Zeitpunkt gemeint sind.</span></li>
    <li><strong>Gründe unterscheiden</strong><span>Zwischen ausdrücklichem Widerspruch, Überschreitung des belegten Rahmens und fehlender Erwähnung unterscheiden.</span></li>
  </ol>
</figure>

## Nicht erwähnt ist nicht dasselbe wie widersprüchlich

Steht in einer Aufzeichnung beispielsweise nur „Beim Spaziergang sah ich weiße Wolken“, ist die Farbe der bei diesem Spaziergang gesehenen Blumen nicht erwähnt. Aus dem Fehlen einer Angabe lässt sich nicht schließen, dass keine Blumen gesehen wurden. Steht dagegen ausdrücklich, dass es bei demselben Spaziergang nicht geregnet hat, widerspricht dies dem Kandidaten „Zu diesem Zeitpunkt regnete es“. Dieses fiktive Beispiel veranschaulicht den Unterschied zwischen den Urteilen.

Auch bei ähnlichen Anhaltspunkten könnte es sich um einen Spaziergang an einem anderen Tag handeln. Daher werden die Belege dafür geprüft, dass Gegenstand, Ereignis und Zeitpunkt übereinstimmen. Zudem darf ein Bedingungssatz wie „Wenn es regnet, gehe ich nach Hause“ nicht als Aufzeichnung darüber gelten, dass es tatsächlich geregnet hat. Weist ein Kandidat einer Szene, deren Ausgang zum betreffenden Zeitpunkt ausdrücklich noch offen ist, ein gegenteiliges Ergebnis zu, wird dies getrennt von einem einfachen Widerspruch als Überschreitung des belegten Rahmens behandelt.

## Verbesserungen anhand fester Fälle vergleichen

Laut dem internen Änderungsprotokoll zur Prüfung wurden die bisherigen 29 festen Fälle und 2 synthetische Kontrollfälle, insgesamt also 31 Fälle, mit derselben Modelleinstellung wie im Produktivbetrieb bewertet. Bei v13 stimmten Annahme beziehungsweise Ablehnung und Begründung in allen 31 Fällen mit den Erwartungen überein; es gab 0 erneute Generierungen aufgrund fälschlich festgestellter Widersprüche. Dies ist ein Ergebnis für das feste Set und belegt weder die Genauigkeit für alle Texte noch den Erfolg natürlich anfallender Kanonergänzungen im Produktivbetrieb.

Bei gleichbleibenden Erwartungen und Eingaben werden die alte und die neue Version verglichen. Fehlgeschlagene Beispiele werden hinzugefügt, um Regressionen zu erkennen. Wichtig ist dabei, dass ein Mensch Fälle mit unzureichender Beleglage prüfen kann, wenn sich Zitate aus den Aufzeichnungen nicht mit der Aussage des Kandidaten verknüpfen lassen. Für die Erstellung von KI-Evaluierungssets sind auch die [Best Practices für Evaluierungen von OpenAI](https://platform.openai.com/docs/guides/evaluation-best-practices) hilfreich.

Stellen Sie zunächst einige tatsächlich veröffentlichbare Aufzeichnungen und fiktive Kontrollfälle zusammen. Lassen Sie dann Menschen die erwarteten Urteile „dieselbe Szene“, „andere Szene“, „nicht erwähnt“ und „ausdrücklicher Widerspruch“ festhalten. Prüfdatum: 2026-11-17.
