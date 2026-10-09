---
title: "Ein geschütztes Betriebs-Dashboard mit Cloudflare Pages und D1"
description: "Ein anonymisiertes Design, das den Zugang mit Cloudflare Access schützt und Betriebsaggregate über Pages Functions aus D1 liest. Es trennt geprüfte Produktivbereitstellung, authentifizierte Oberfläche und Indexnutzung von nicht getesteten Punkten."
date: "2026-10-06T01:10:00+09:00"
lastUpdated: "2026-10-09T15:00:00+09:00"
author: gui
image: /images/insights/covers/private-dashboard-access-and-aggregation-cover-v1.webp
tags: ["Cloudflare Pages", "Cloudflare D1", "Security"]
callout:
  type: note
  title: "Implementierung, Produktivoberfläche und Indexprüfung getrennt betrachten"
  text: "In diesem anonymisierten Fall wurden eine durch Access geschützte Pages-Oberfläche und schreibgeschützte D1-Aggregate umgesetzt. GitHub-verbundene Produktivbereitstellung, authentifizierte Oberfläche und Indexnutzung durch eine Produktivabfrage wurden bestätigt. Große Lasten und die Leistung über mehrere Organisationen hinweg wurden nicht getestet."
---

Wenn Betriebsinformationen über Protokolle und Datenbanken verteilt sind, kann es für das Team schwierig sein, den aktuellen Zustand sicher zu prüfen. Dieses anonymisierte Dashboard-Beispiel erläutert, wie Zugriff, Aggregation und Bereitstellung überprüft werden. Domains, Konten, Beitragsinhalte und aktuelle Betriebszahlen werden nicht offengelegt.

## Eine Aggregation über Oberfläche und API prüfen

Beginnen Sie mit einer Zeitraumzählung und vergleichen Sie die Anzeige mit bekannten Testdaten. Unterscheiden Sie leere Zeiträume von Abruffehlern und testen Sie direkten API-Zugriff vor und nach Anmeldung. Erweitern Sie erst nach Prüfung des Abfrageplans für diesen Filter.

[Cloudflare D1：Indizes anhand der Abfragebedingungen prüfen](https://developers.cloudflare.com/d1/best-practices/use-indexes/)

## Seite und API in die Zugriffsschranke aufnehmen

Eine statische Cloudflare-Pages-Seite zu verbergen reicht nicht, wenn ihre Daten-API weiterhin direkt aufrufbar ist. Nehmen Sie Oberfläche und API in dieselbe Cloudflare-Access-Schranke auf, sodass nur Betriebspersonal die Daten lesen kann. Als Prüfverfahren sollten Seite und Daten-API vor und nach der Anmeldung separat getestet werden. In diesem Fall wurden in der Produktion die Zugangsschranke der Seite und die Datenanzeige nach der Anmeldung mit einem dedizierten Konto bestätigt. Der vorhandene Nachweis bestätigt keinen direkten unauthentifizierten Aufruf des API-Endpunkts; das bleibt ein eigener Abnahmepunkt. Authentifizierungsgeheimnisse gehören nicht in den Browsercode.

<figure class="article-diagram" data-layout="boundary" data-tone="teal" data-count="2" aria-labelledby="diagram-private-dashboard-access-and-aggregation">
  <figcaption>
    <strong id="diagram-private-dashboard-access-and-aggregation">Seite und API schützen</strong>
    <span>Ein direkter nicht authentifizierter API-Zugriff wurde nicht getestet. Die Prüfungen umfassten eine Betriebsumgebung.</span>
  </figcaption>
  <ol class="article-diagram__nodes">
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">1</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="3" y="6" width="18" height="14" rx="2"/><path d="M8 6V4a4 4 0 0 1 8 0v2M9 13h6"/></svg></span>
      <strong>Authentifiziertes Dashboard</strong>
      <span>Nach der Access-Anmeldung zeigt die Oberfläche geschützte Betriebsaggregate.</span>
    </li>
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">2</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v7c0 1.7 3.6 3 8 3M20 5v5M4 12v7c0 1.7 3.6 3 8 3"/></svg></span>
      <strong>Schreibgeschützte API</strong>
      <span>D1 innerhalb derselben Grenze lesen. Die Zurückweisung eines direkten nicht authentifizierten API-Aufrufs wurde nicht geprüft.</span>
    </li>
  </ol>
</figure>

## Schreibvorgänge und schreibgeschützte Aggregate trennen

Ein GET-Endpunkt in Pages Functions fragt D1 ab und fasst Stundenwerte, den jüngsten Verarbeitungsstatus und den Ausführungsmodus in einer Antwort zusammen. Begrenzen Sie die Dashboard-API selbst auf Lesezugriffe, statt sich auf einen ausgeblendeten Button zu verlassen. Legen Sie Zeitraum, Zeitzone und Bedeutung bestätigter und ausstehender Zustände fest, damit unterschiedliche Zählwerte nicht addiert werden. Fehlende oder ungeklärte Werte werden separat angezeigt, nicht als erfolgreiche Aktionen oder als null.

## D1-Indizes passend zur Aggregatabfrage prüfen

Betriebsansichten filtern häufig die jüngsten Zeiträume; ihr Aussehen allein belegt nicht, dass ein Index nützlich ist. Fügen Sie einen Index für die tatsächlichen Aggregationsbedingungen hinzu, prüfen Sie anschließend den Abfrageplan in der D1-Produktion und bestätigen Sie die Verwendung des erwarteten Index. Einen Index anzulegen und seine Nutzung durch eine Abfrage zu bestätigen sind zwei getrennte Prüfungen. In diesem Fall wurden beide in der Produktion bestätigt, aber kein Benchmark belegte eine bessere Antwortzeit oder Belastbarkeit bei hoher Last.

## Authentifizierung und Anzeige nach der Produktivbereitstellung prüfen

Stellen Sie Pages über die GitHub-Integration in der Produktion bereit und prüfen Sie den erfolgreichen Deploy des vorgesehenen Commits sowie den aktiven Status der benutzerdefinierten Domain. Prüfen Sie anschließend, ob die Seite vor der Anmeldung geschützt ist und die Dashboard-Daten nach dem Login erscheinen. CI oder ein erfolgreicher Deploy allein beweisen nicht, dass authentifiziertes Betriebspersonal die Produktivoberfläche sehen kann.

Dieser anonymisierte Fall bestätigte Zugriffsschranke, Produktivansicht und Indexnutzung durch die D1-Aggregatabfrage in einer Betriebsumgebung. Rechteaufteilung zwischen mehreren Organisationen, Last bei mehr Nutzern und Penetrationstests für alle Authentifizierungskonfigurationen wurden nicht geprüft. Die übergreifende Pages-Site-Architektur beschreibt [Cloudflare-Pages-Site-Architektur](/insights/astro-cloudflare-site-architecture/).
