---
title: "Praxiswissen aus der Einführung von Cloudflare Vectorize in mehreren Repositories"
description: "Erkenntnisse aus der Einführung und Erprobung von Cloudflare Vectorize auf mehreren Astro-/Cloudflare-Pages-Websites: Aufgabenteilung mit Pagefind, Corpus-Erzeugung aus veröffentlichtem HTML, sichere differenzielle Synchronisierung, Trennung von Preview und Production, API-Schutz und Prüf-Gates."
date: 2026-07-31T12:00
author: gui
tags: ["Technologie", "Cloudflare", "Vectorize", "OpenAI", "Website-Suche"]
image: /uploads/acecore-generated/blog-cloudflare-pages-security.webp
callout:
  type: tip
  title: Suche fail-soft, Synchronisierung und Veröffentlichung fail-closed
  text: "Bei der Suche für Nutzer bleibt Pagefind verfügbar, auch wenn Vectorize ausfällt. Index-Synchronisierung und Produktionsfreigabe stoppen dagegen, wenn Zielumgebung, Corpus, Löschquote, veröffentlichter Commit oder Abschluss der Mutation nicht bestätigt werden können. Dieses asymmetrische Design hat sich beim Übertragen auf mehrere Websites am stärksten bewährt."
processFigure:
  eyebrow: Vectorize rollout
  title: Vom veröffentlichten HTML zum Production-Index
  description: "Nicht die bearbeitete Quelle wird direkt eingespielt. Maßstab sind das tatsächlich veröffentlichte HTML und der bereits deployte Commit."
  variant: inline
  steps:
    - title: Öffentliches HTML bauen
      description: "Statisches HTML erzeugen, in dem canonical, locale und noindex bereits berücksichtigt sind."
      icon: i-lucide-file-code-2
      accent: slate
    - title: Corpus deterministisch erzeugen
      description: "Text in Chunks teilen und IDs aus content hashes sowie Audit-Metadaten vergeben."
      icon: i-lucide-boxes
      accent: brand
    - title: Mit Preview synchronisieren
      description: "Mit eigenem Index und Token upserten und API, leere Ergebnisse, fallback sowie rate limit prüfen."
      icon: i-lucide-flask-conical
      accent: amber
    - title: Veröffentlichten Commit nach Production synchronisieren
      description: "Build marker und Corpus-Version abgleichen und erst nach Konvergenz der Mutation aktivieren."
      icon: i-lucide-shield-check
      accent: emerald
compareTable:
  title: Suche und Synchronisierung brauchen unterschiedliche Fehlerstrategien
  before:
    label: Alles von Vectorize abhängig machen
    items:
      - "Fällt AI, Vectorize oder D1 aus, ist die gesamte Website-Suche nicht mehr nutzbar"
      - "Unterschiede zwischen CMS-Entwurf und öffentlicher Seite werden direkt zu Unterschieden in den Suchergebnissen"
      - "Eine falsche Konfiguration im Sync-Skript kann eine andere Umgebung oder sehr viele Vektoren verändern"
      - "Die Einführung gilt leicht schon mit dem Merge des Codes als abgeschlossen"
  after:
    label: Fail-soft-Suche + fail-closed-Synchronisierung
    items:
      - "Pagefind übernimmt die normale Suche; die semantische Suche wird nur durch eine ausdrückliche Aktion als Ergänzung aufgerufen"
      - "Der Corpus entsteht aus öffentlichem HTML und berücksichtigt canonical, noindex und locale"
      - "Umgebungs-Allowlist, Löschquote, veröffentlichter Commit und Abschluss der Mutation werden vor und nach der Synchronisierung geprüft"
      - "Implementierung, lokale Prüfung, Preview und Produktionsbetrieb werden als getrennte Zustände dokumentiert"
statBar:
  items:
    - value: "4 repos"
      label: Einführungs- und Testprotokolle verglichen
      description: "Production, lokale Prüfung, Preview und Voruntersuchung wurden nicht gleichgesetzt, sondern getrennt verglichen."
      icon: i-lucide-git-branch
    - value: "36 → 250"
      label: Erste Systems-Production-Synchronisierung
      description: "Aus 36 öffentlichen japanischen Seiten entstanden 250 Vektoren; synchronisiert wurde mit 0 Löschungen."
      icon: i-lucide-database
    - value: "72 → 134"
      label: Lokale Prüfung bei World Foundation
      description: "Aus 72 sources entstanden 134 Vektoren; der Zustand wurde jedoch als noch nicht veröffentlicht dokumentiert."
      icon: i-lucide-test-tube-2
    - value: "37 tests"
      label: Prüfung des Suchvertrags
      description: "Bei World Foundation bestanden 37 Vertragstests für Suche, Corpus und Synchronisierung."
      icon: i-lucide-badge-check
checklist:
  title: Prüfung vor der Einführung im nächsten Repository
  items:
    - text: "Die vorhandene Stichwortsuche behalten, damit der Suchweg auch bei einem Vectorize-Ausfall verfügbar bleibt"
      checked: true
    - text: "Tatsächliche Ausgabe des embedding model mit dimensions und metric des Index abgleichen"
      checked: true
    - text: "Corpus aus öffentlichem HTML erzeugen und noindex, externe canonicals sowie Verwaltungsseiten ausschließen"
      checked: true
    - text: "Mit IDs aus content hashes unveränderte Chunks nicht erneut embedden"
      checked: true
    - text: "Index, binding, Token und Freigabegrenzen für Preview und Production trennen"
      checked: true
    - text: "Erst nach bestätigtem upsert löschen und für große Löschungen eine ausdrückliche Freigabe verlangen"
      checked: true
    - text: "Such-API mit Grenzen für body, query, locale, origin und rate limit sowie einem kill switch versehen"
      checked: true
    - text: "Nur Deployments nach Production synchronisieren, bei denen veröffentlichter Commit und Corpus-Version übereinstimmen"
      checked: true
    - text: "Implementiert, geprüft, in Preview bestätigt und in Production aktiv getrennt dokumentieren"
      checked: true
linkCards:
  - href: https://developers.cloudflare.com/vectorize/
    title: Offizielle Cloudflare-Vectorize-Dokumentation
    description: "Aktuelle Spezifikationen für Index, binding, query und metadata filtering."
    icon: i-lucide-book-open
  - href: https://developers.cloudflare.com/vectorize/platform/limits/
    title: Aktuelle Vectorize-Limits
    description: "Grenzen für batch, topK, metadata und Vektoranzahl können sich ändern und sollten bei jeder Implementierung erneut geprüft werden."
    icon: i-lucide-gauge
  - href: /insights/astro-cloudflare-site-architecture/
    title: Gesamtarchitektur einer Astro- und Cloudflare-Website
    description: "Einordnung von statischem HTML, Pages Functions, D1 und Suche in die richtigen Schichten."
    icon: i-lucide-layers-3
faq:
  title: Häufig gestellte Fragen
  items:
    - question: Wird Pagefind nach der Einführung von Vectorize überflüssig?
      answer: "Nein. Pagefind bleibt die wenig abhängige Standardsuche, die aus statischem HTML entsteht. Vectorize ergänzt sie für Umschreibungen und verwandte Konzepte. Selbst wenn AI oder Vectorize ausfallen, bleibt die normale Suche verfügbar."
    - question: Sind D1 oder R2 für Vectorize zwingend erforderlich?
      answer: "Nein. Bei Systems dient D1 dem rate limit der Such-API, ist aber kein Pflichtspeicher für Vectorize selbst. Auch der Ablageort des Originaltexts kann je nach Anforderungen öffentliches HTML, JSON, D1 oder R2 sein."
    - question: Wie werden embedding model und dimensions in der aktuellen Implementierung verwaltet?
      answer: "Die aktuelle Acecore-Systems-Implementierung verwendet OpenAI text-embedding-3-large mit 1,536 dimensions und cosine. Der ältere BGE-M3-Index mit 1,024 dimensions bleibt für rollback erhalten; Vektoren mit unterschiedlichen dimensions werden nie in einem Index gemischt. Da die Index-Konfiguration nach der Erstellung nicht geändert werden kann, müssen vor dem Anlegen die aktuelle offizielle Spezifikation und die tatsächliche Ausgabeform geprüft werden."
    - question: Wann gilt die Einführung als abgeschlossen?
      answer: "Weder ein Merge noch lokale tests reichen aus. Als Produktionsbetrieb dokumentieren wir die Einführung erst nach einer echten Preview-Anfrage, dem Abgleich von veröffentlichtem Commit und Corpus, der Synchronisierung des Production-Index, der Konvergenz der Mutation sowie Prüfungen von Pagefind fallback, rate limit und Abschaltverfahren."
---

Wer Cloudflare Vectorize in mehreren Repositories einführt oder erprobt, merkt schnell: Nur „ein embedding erzeugen und `query()` aufrufen“ reicht nicht aus.

Wie entsteht der Suchbestand? Wie bleibt die bisherige Suche verfügbar? Wie werden Preview und Production getrennt? Wie verhindert man bei einer fehlerhaften Synchronisierung eine Massenlöschung? Und stimmt der Index wirklich mit den aktuell veröffentlichten Seiten überein? Im Betrieb war das Design vor und nach dem Vectorize-API-Aufruf wichtiger als der Aufruf selbst.

Dieser Artikel führt die dokumentierten Einführungs- und Untersuchungsergebnisse von Acecore Systems, World Foundation, Acecore Schools und Aceserver Portal zusammen und bereitet sie so auf, dass sie sich auf andere Astro-/Cloudflare-Pages-Websites übertragen lassen.

## Fazit vorweg: Suche fail-soft, Synchronisierung und Veröffentlichung fail-closed

Das am besten wiederverwendbare Prinzip war, für die nutzerseitige Suche und die betriebliche Synchronisierung unterschiedliche Fehlerstrategien festzulegen.

| Bereich                 | Strategie bei Fehlern | Grund                                                                                         |
| ----------------------- | --------------------- | --------------------------------------------------------------------------------------------- |
| Normale Website-Suche   | fail-soft             | Auch bei einem Vectorize-Ausfall kann mit Pagefind weitergesucht werden                       |
| API für verwandte Suche | fail-soft             | Fehler schnell beenden, ohne die Ergebnisse der normalen Suche zu beeinträchtigen             |
| Corpus-Erzeugung        | fail-closed           | Bei ungültigen Seiten, locales, Mengen oder Metadaten keinen Corpus erzeugen                  |
| Index-Synchronisierung  | fail-closed           | Nichts ändern, wenn Zielumgebung, vorhandene IDs, Löschquote oder Mutation nicht prüfbar sind |
| Production-Aktivierung  | fail-closed           | Erst nach Preview QA und Abgleich des veröffentlichten Commits aktivieren                     |

So lassen sich zwei Ziele gleichzeitig erreichen: „Die Website-Suche funktioniert auch bei einem AI-Ausfall“ und „Bei Zweifeln verändert die Synchronisierung keinen einzigen Datensatz“.

## Bestätigte Zustände in vier Repositories

Wer Einführungsprotokolle in einem Artikel zusammenfasst, sollte nicht alles pauschal als „eingeführt“ bezeichnen. In unseren Aufzeichnungen kamen Produktionsbetrieb, lokale Prüfung, vorbereitete Preview-Ressourcen und reine Voruntersuchung gemeinsam vor.

| Repository       | Dokumentierter und bestätigter Zustand                                                                                                | Erkenntnis                                                                                                          |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Acecore Systems  | OpenAI-Indizes mit 1,536 dimensions in Preview und Production in Betrieb; je 256 Vektoren synchronisiert und bekannte queries geprüft | Kombination mit Pagefind, öffentlicher HTML-Corpus, D1 rate limit, sicherer Production-Sync und Dimensionsmigration |
| Aceserver Portal | Vectorize-Suche für Acecore-Informationen in Production bestätigt                                                                     | Suchziele für Unternehmensinformationen und WIKI-Regeln nicht vermischen                                            |
| World Foundation | 72 sources／134 Vektoren lokal erzeugt, 37 tests bestanden; unveröffentlicht                                                          | content hash, fail-closed-Synchronisierung, Trennung der Gates vor Veröffentlichung                                 |
| Acecore Schools  | Bestehende Struktur untersucht; Index und Implementierung noch nicht begonnen                                                         | API, Corpus, Rechte und Umgebungsaufbau vor dem binding festlegen                                                   |

Bei Acecore Systems wurde die Arbeit in drei Stufen aufgeteilt: [Einführungs-PR #40](https://github.com/acecore-systems/acecore-systems/pull/40), [Production-Vorbereitungs-PR #41](https://github.com/acecore-systems/acecore-systems/pull/41) und [Production-Aktivierungs-PR #42](https://github.com/acecore-systems/acecore-systems/pull/42). Der spätere [PR #43 für die direkte OpenAI-Anbindung](https://github.com/acecore-systems/acecore-systems/pull/43) bereitet einen separat benannten Index mit 1,536 dimensions vor, statt Vektoren mit unterschiedlichen dimensions zu mischen. [Aktivierungs-PR #44](https://github.com/acecore-systems/acecore-systems/pull/44) synchronisiert je 256 Vektoren in beide Umgebungen und aktiviert die verwandte Suche nach Prüfung bekannter queries und des Pagefind-Fallbacks.

Im [GitHub-Actions-Lauf der ersten Production-Synchronisierung zum bisherigen BGE-M3-Index](https://github.com/acecore-systems/acecore-systems/actions/runs/30539728752) wurden veröffentlichter Commit und Corpus-Version abgeglichen und aus 36 öffentlichen japanischen Seiten 250 Vektoren erzeugt. Das Ergebnis waren 250 upserts und 0 deletes. Durch getrennte Änderungen für Code-Merge, Index-Vorbereitung, erste Synchronisierung und Aktivierung der Suche erhielt jede Stufe eindeutige Abbruchbedingungen.

## Pagefind nicht ersetzen, sondern die Aufgaben aufteilen

Das Ziel von Vectorize war nicht, die vorhandene Suche zu verwerfen.

Pagefind erstellt aus gebautem HTML einen statischen Index und sucht im Browser. Es eignet sich als Standardsuche für explizite Begriffe wie Produkt-, Service- oder Eigennamen und ist nicht vom Zustand eines embedding provider oder von Vectorize abhängig.

Vectorize hilft, wenn ein Suchbegriff nicht exakt im Text vorkommt oder Seiten über verwandte Konzepte gefunden werden sollen. Dafür sind jedoch embedding-Erzeugung und eine Vectorize query nötig; Latenz, Fehler und Verbrauch externer Dienste müssen berücksichtigt werden.

Deshalb wurde auch die UI aufgeteilt.

1. Während der Eingabe Vorschläge von Pagefind anzeigen
2. Die API nur aufrufen, wenn der Nutzer die verwandte Suche ausdrücklich ausführt
3. Für die API einen kurzen timeout setzen
4. Pagefind-Ergebnisse bei einem API-Fehler nicht entfernen
5. Nur die verwandte Suche über einen kill switch abschalten können

Damit erweitert Vectorize das Sucherlebnis, wird aber nicht zum Single Point of Failure der gesamten Suche.

## Den Corpus aus veröffentlichtem HTML statt aus CMS-Entwürfen erzeugen

Besonders große Unterschiede zwischen den Websites entstanden durch die Frage, was als maßgebliche Suchquelle gilt.

Wer CMS-Entwürfe oder Markdown direkt in den Corpus übernimmt, erzeugt leicht Abweichungen zur tatsächlich veröffentlichten Seite.

- Inhalte mit `draft` oder `noindex` gelangen in den Index
- Seiten mit externem canonical bleiben enthalten
- Wiederholte Layout-Texte oder Verwaltungsoberflächen werden mit aufgenommen
- title, description und URL, die erst nach der Transformation entstehen, fehlen
- Bei mehrsprachigen Websites bleibt die locale-Grenze unscharf

Deshalb wurde nach dem Astro-Build das erzeugte HTML gelesen und erst nach Anwendung der Veröffentlichungsregeln ein Corpus erstellt.

Bei Acecore Systems werden nur japanische Seiten aufgenommen, die folgende Bedingungen erfüllen:

- Sie besitzen ein same-origin canonical
- Ihr `lang` ist Japanisch
- Sie sind nicht mit `noindex` markiert
- Sie sind weder `/admin`, `/api`, 404 noch eine Bestätigungsseite nach dem Absenden
- Nicht zum Inhalt gehörende Elemente wie `data-vectorize-ignore` oder Navigation lassen sich entfernen
- Sie besitzen eine öffentliche root-relative URL und einen title

Der Text wurde mit einer Ziellänge von 850 Zeichen, einer Maximallänge von 1,200 Zeichen und einem overlap von 120 Zeichen in Chunks geteilt. Diese Werte sind keine allgemeingültige Lösung, sondern Betriebswerte für die Seitenlängen und japanischen Texte dieses Projekts. Auf anderen Websites sollten sie anhand der tatsächlichen Dokumentstruktur und Suchbewertung angepasst werden.

## Differenzielle Synchronisierung mit content hashes deterministisch machen

Wer fortlaufende Nummern oder bei jedem Lauf neue UUIDs als Vektor-IDs verwendet, erhält selbst aus demselben Corpus vollständig andere IDs. Dann müssen auch unveränderte Texte erneut eingebettet und die alten IDs massenhaft gelöscht werden.

Deshalb wurde aus locale, öffentlicher URL, Chunk-Nummer und Text ein SHA-256 gebildet, aus dem ID und Corpus-Version deterministisch entstehen.

```js
const identity = [locale, url, String(chunkIndex), text].join("\u001f");
const digest = sha256(identity);

const vector = {
  id: `v1-${digest.slice(0, 48)}`,
  text,
  metadata: {
    locale,
    url,
    chunkIndex,
    contentHash: digest,
  },
};
```

Bei der Synchronisierung werden die erwarteten IDs mit den aktuellen IDs des Index verglichen.

- Nur auf der erwarteten Seite vorhandene IDs embedden und upserten
- Auf beiden Seiten vorhandene IDs als unverändert überspringen
- Nur im Index vorhandene IDs als Löschkandidaten behandeln
- Bei einer nicht mit `v1-` verwalteten ID vor jeder Mutation stoppen

So entsteht aus demselben veröffentlichten Inhalt derselbe Corpus, und der Grund jeder Differenz bleibt erklärbar.

## Embedding model und Index-Konfiguration als Vertrag festlegen

Im Einführungsprotokoll kam [`@cf/baai/bge-m3`](https://developers.cloudflare.com/workers-ai/models/bge-m3/) aus Workers AI zum Einsatz; nach Prüfung der tatsächlichen Ausgabeform wurden alle Komponenten auf 1,024 dimensions／cosine vereinheitlicht. Die aktuelle Acecore-Systems-Implementierung verwendet [OpenAI Embeddings](https://platform.openai.com/docs/guides/embeddings) `text-embedding-3-large` mit 1,536 dimensions／cosine in separat benannten Zielindizes. Preview und Production laufen jeweils mit 256 synchronisierten Vektoren; der bisherige BGE-M3-Index bleibt für rollback erhalten, und Vektoren unterschiedlicher dimensions werden nicht in einem Index gemischt.

Wichtiger als der konkrete Modellname ist, in vier Bereichen denselben Vertrag festzuschreiben.

| Bereich          | Festzulegende Werte                |
| ---------------- | ---------------------------------- |
| Corpus-Metadaten | model, dimensions, metric          |
| Vectorize-Index  | dimensions, metric                 |
| Such-API         | model, embedding length            |
| Sync-Skript      | erlaubte model, dimensions, metric |

Wie Cloudflare unter [Create indexes](https://developers.cloudflare.com/vectorize/best-practices/create-indexes/) beschreibt, lassen sich dimensions und metric eines Index nach der Erstellung nicht ändern. Sind die Modellunterlagen unklar, darf der Index nicht aufgrund einer Vermutung erstellt werden. Zuerst werden die aktuelle Dokumentation und die tatsächliche Ausgabe geprüft.

Wer metadata filtering verwendet, muss den metadata index vor den Vektoren anlegen. Bereits eingespielte Vektoren werden nicht allein dadurch filterbar, dass der metadata index später hinzugefügt wird; sie müssen erneut upsertet werden.

Auch Produktlimits ändern sich. Zum 30. Juli 2026 liegt das upsert-batch-Limit von Vectorize V2 bei 1,000 über die Workers API und bei 5,000 über die HTTP API. Das normale `topK`-Limit beträgt 100; bei `returnValues: true` oder `returnMetadata: "all"` beträgt es 50. Bei jeder Implementierung sollten die [aktuellen Limits](https://developers.cloudflare.com/vectorize/platform/limits/) und die [client API](https://developers.cloudflare.com/vectorize/reference/client-api/) erneut geprüft werden.

Acecore Systems synchronisiert über die HTTP API in Batches zu 200 und sucht mit `topK: 15`; die Produktgrenzen werden nicht direkt als Verarbeitungsgrößen verwendet. Ein Anbieterlimit und eine Batch-Größe, die das eigene System sicher wiederholen und überwachen kann, sind zwei verschiedene Entscheidungen.

## Erst upserten und Konvergenz abwarten, dann löschen

Insert, upsert und delete in Vectorize laufen asynchron. Ein erfolgreicher API-Aufruf bedeutet noch nicht, dass die Änderung bereits in queries sichtbar ist.

Die sichere Synchronisierung verwendet daher diese Reihenfolge:

1. Corpus und Index-Konfiguration prüfen
2. Alle aktuellen Vektor-IDs per pagination abrufen
3. Upsert-Ziele und Löschkandidaten berechnen
4. Upserts in Batches ausführen
5. Warten, bis die zurückgegebene `mutationId` in `processedUpToMutation` erreicht ist
6. Erst nach Konvergenz der Upserts löschen
7. Auch die Delete-Mutation bis zur Konvergenz prüfen

Auch die [Vectorize API](https://developers.cloudflare.com/vectorize/reference/client-api/) von Cloudflare weist darauf hin, dass Mutationen asynchron sind. Ein fester sleep reicht nicht; der Abschluss wird über die Mutation-ID bestätigt.

Zusätzlich stoppt das Sync-Skript unter folgenden Bedingungen:

- Der Name des Zielindex steht nicht auf der Preview-/Production-Allowlist
- Der Production-Index soll durch den Sync-Prozess automatisch erstellt werden
- Der Wert von `--confirm-production` stimmt nicht mit dem Zielindex überein
- dimensions／metric weichen vom Vertrag ab
- locale, URL, Metadaten oder content hash des Corpus sind ungültig
- Die Zahl der source pages oder Vektoren überschreitet die erwartete Obergrenze
- Im vorhandenen Index befinden sich nicht verwaltete IDs
- Mehr als 20% der vorhandenen Vektoren sollen gelöscht werden
- Retry-Limit oder Wartezeit für die Mutation werden überschritten

Nur wenn eine große Löschung beabsichtigt ist, wird sie bei einem manuellen Lauf ausdrücklich überschrieben. Normale push- und schedule-Läufe dürfen sie nicht ausführen.

## Preview und Production nicht nur nach Namen, sondern auch nach Rechten trennen

Für die Umgebungstrennung reicht es nicht, lediglich im binding einen anderen Indexnamen einzutragen.

Getrennt werden:

- Vectorize-Index
- Hilfsressourcen wie D1
- Wrangler environment
- API token
- GitHub Environment
- concurrency des Sync-Workflows
- repository variable für die Aktivierung
- kill switch

Die Sync-Token werden auf Vectorize Read / Write im Ziel-Cloudflare-Account beschränkt und vom OpenAI API key getrennt. Production läuft nur vom geschützten `main` und durchläuft den reviewer der GitHub Environment.

Dabei entsteht ein betrieblicher trade-off. Wenn die Production Environment einen required reviewer verlangt, kann auch eine per schedule gestartete Synchronisierung auf Freigabe warten. Ob nur die Erstveröffentlichung bestätigt werden soll, jede regelmäßige Synchronisierung eine Freigabe braucht oder die Aufgaben in getrennte jobs gehören, muss vor dem Einrichten des cron entschieden werden.

## Nur den Corpus des „aktuell veröffentlichten Commits“ nach Production synchronisieren

GitHubs `main` und der aktuell auf Cloudflare Pages veröffentlichte Commit sind nicht immer gleich. Direkt nach einem push kann der Build noch laufen; nach einem fehlgeschlagenen Deployment kann weiterhin der vorherige Commit öffentlich sein.

Deshalb legt die Production-Synchronisierung einen build marker auf der öffentlichen Website ab und prüft:

- Der Commit im Marker ist ein 40-stelliges Git SHA
- Der Commit existiert im Repository
- Er ist ein Vorfahr des geschützten `main`
- Dieser Commit kann ausgecheckt und sein Corpus erneut erzeugt werden
- Die Corpus-Version im Marker stimmt mit dem neu erzeugten Ergebnis überein
- Unmittelbar vor der Mutation ist weiterhin derselbe Commit veröffentlicht

Abschlussbedingung ist ein über die GitHub-Repository-Integration erfolgtes Cloudflare-Pages-Deployment. Eine nur lokal oder per Direct Upload vorübergehend veröffentlichte Ausgabe dient nicht als Grundlage für die Production-Synchronisierung.

So werden Abweichungen wie „neuen Corpus mit einer alten Website synchronisieren“ oder „nur den Inhalt eines fehlgeschlagenen Deployment-Commits in den Suchergebnissen anzeigen“ verhindert.

## Die öffentliche Such-API braucht Kosten- und Datenschutzgrenzen

Die Such-API sendet die eingegebene Zeichenfolge an einen embedding provider über einen öffentlichen Endpoint. Neben der Suchqualität gehören deshalb Missbrauch, Kosten, Protokollierung und zurückgegebene URLs zum Design.

Acecore Systems setzt folgende Grenzen:

| Bereich         | Implementierung                                                               |
| --------------- | ----------------------------------------------------------------------------- |
| Methode／Format | Nur same-origin JSON POST akzeptieren                                         |
| body            | Maximal 2KiB; auch ohne `Content-Length` beim Lesen des Streams abbrechen     |
| query           | Nach NFKC-Normalisierung 2 bis 160 Zeichen                                    |
| locale          | Nur `ja`                                                                      |
| rate limit      | Festes D1-Fenster: client 20 Aufrufe／Minute, global 300 Aufrufe／Minute      |
| Abschaltung     | Mit `SEARCH_ENABLED` nur die verwandte Suche stoppen                          |
| query           | raw query weder in Logs noch im Corpus oder in Vectorize-Metadaten speichern  |
| Ergebnis-URL    | Nur öffentliche, same-origin und root-relative URLs zulassen                  |
| Fehler          | Strukturierte Codes pro Stufe zurückgeben und den Inhalt nicht protokollieren |

Eine clientseitige UUID ist keine starke Kostengrenze, da Nutzer sie verändern können. Deshalb werden ein aus Cloudflare-Verbindungsdaten gebildeter client key, ein global limit und die Überwachung des Verbrauchs kombiniert. Je nach Größe und Bedrohungsmodell kommen zusätzlich Turnstile, WAF oder Durable Objects infrage.

D1 wird in dieser Architektur für das rate limit verwendet, ist aber keine Voraussetzung für Vectorize. Dasselbe gilt für R2. Die Wahl hängt davon ab, wo der Originaltext liegt und wo das rate limit verwaltet werden soll.

## Zuständigkeiten der Suchziele nicht vermischen

Im Aceserver Portal wurden die Suchziele für Acecore-Serviceinformationen und für Regeln beziehungsweise Anleitungen des Minecraft-Servers getrennt.

- Fragen zu Acecore mit Vectorize suchen
- Serverregeln im offiziellen WIKI suchen
- Bei einem Vectorize-Ausfall nicht auf eine unpassende WIKI-Antwort zurückfallen
- Nur tatsächlich als Beleg ausgewählte WIKI-Artikel verlinken
- Regeln, die im WIKI nicht bestätigt werden können, nicht erraten

Das ist auch bei RAG und Auskunftschats wichtig. Je mehr Suchorte es gibt, desto früher muss festgelegt werden, welche Frage an welche Quelle geht und was bei fehlenden Informationen ausdrücklich nicht beantwortet wird.

## Tatsächliche Fehler und die daraus abgeleiteten Änderungen

Aus den Protokollen mehrerer Repositories lassen sich typische wiederkehrende Probleme ableiten.

| Symptom                                                 | Ursache                                                   | Nächster Schritt                                                                      |
| ------------------------------------------------------- | --------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| Ein binding wurde ergänzt, aber es gibt keine Suche     | API, Corpus, Reindex, Rechte und UI fehlen im Design      | Suchvertrag und Betriebsablauf vor dem Anlegen des Index festlegen                    |
| dimensions werden beim Anlegen des Index geraten        | Nur der Modellname, nicht die echte Ausgabe wurde geprüft | Tatsächliche embedding length vor der Erstellung prüfen                               |
| Vorhandene Vektoren erscheinen nicht im metadata filter | Vektoren wurden vor dem metadata index eingespielt        | Metadata-Index zuerst anlegen und vorhandene Vektoren erneut upserten                 |
| Queries sind direkt nach dem Sync instabil              | Mutationen sind asynchron                                 | Konvergenz mit `mutationId` und Index-Info abwarten                                   |
| Sehr viele erneute embeddings und deletes entstehen     | Vektor-ID ändert sich bei jedem Lauf                      | Deterministische ID aus dem content hash verwenden                                    |
| Ein schedule bleibt im Status waiting                   | Production Environment verlangt eine Freigabe             | Regelmäßige Synchronisierung und Freigaberichtlinie gemeinsam entwerfen               |
| Tests oder Git schlagen unter Windows fehl              | Umgebungsfaktoren wie `spawn EPERM`, Locks oder Cache     | Baseline vergleichen, Node-Version festlegen und mit frischem `npm ci` eingrenzen     |
| Ein API-timeout gilt sofort als Codefehler              | Temporärer Fehler, falscher payload oder Provider-Latenz  | Mit dem korrekten Vertrag erneut testen und Einzelfall von Reproduzierbarkeit trennen |

Auch Probleme mit Abhängigkeiten und Ausführungsumgebung dürfen nicht fälschlich der Vectorize-Änderung zugeschrieben werden. Es muss geprüft werden, ob derselbe Fehler bereits in der Baseline vor der Änderung auftritt; Code- und Umgebungsfehler werden getrennt.

## „Eingeführt“ in vier Zustände aufteilen

Wer Artikel oder Abschlussberichte schreibt, vermeidet Missverständnisse durch getrennte Zustände.

| Zustand              | Beispiel für die Abschlussbedingung                                                 |
| -------------------- | ----------------------------------------------------------------------------------- |
| Implementiert        | API, Corpus, Sync-Skript und UI befinden sich im Branch                             |
| Lokal geprüft        | Build, Typprüfung, Vertragstests und dry-run sind erfolgreich                       |
| In Preview bestätigt | Mit Preview-Ressourcen synchronisiert; echte Anfrage und fallback geprüft           |
| In Production aktiv  | Veröffentlichten Commit synchronisiert; Mutation, API und Abschaltverfahren geprüft |

World Foundation bestand die lokale Prüfung, doch Index, secret, Deployment und browser QA waren noch offen. Deshalb wurde es nicht als Production dokumentiert. Schools befand sich noch in der Untersuchungsphase.

Acecore Systems dagegen wurde über gestufte PRs, erste Production-Synchronisierung, Production-Aktivierung, öffentlichen Marker und eine tatsächliche Such-API bestätigt.

Nicht nur die Anzahl erfolgreicher tests, sondern auch die noch ungeprüften Punkte zu dokumentieren, ist für die nächste verantwortliche Person die nützlichste Betriebsinformation.

## Minimale Architektur für die Übertragung auf weitere Websites

Für eine andere Astro-/Cloudflare-Pages-Website sieht die minimale Architektur so aus:

```txt
Astro build
  -> öffentliches HTML
  -> Pagefind index
  -> Vectorize corpus (locale / canonical / noindex berücksichtigt)

Cloudflare Pages Function
  -> input validation
  -> OpenAI Embeddings API
  -> Vectorize query
  -> nur öffentliche URLs zurückgeben

GitHub Actions
  -> veröffentlichten Commit auflösen
  -> Corpus neu erzeugen
  -> Preview / Production trennen
  -> nach Upsert-Konvergenz löschen
  -> Corpus-Version dokumentieren
```

Eine LLM-Antwortgenerierung ist zu Beginn nicht nötig. Zuerst sollte eine Suche entstehen, die „verwandte Seiten sicher zurückgibt“ und bewertbar ist. Auch bei späterer Antwortgenerierung werden abgerufener Originaltext, zitierbare URL und Bedingungen für nicht beantwortbare Fragen als eigener Vertrag entworfen.

## Zusammenfassung

Die schwierige Aufgabe bei Cloudflare Vectorize ist nicht die nearest-neighbor query selbst.

Entscheidend ist das Betriebsdesign: Was wird als öffentliche Information indexiert? Wie erkennt man unveränderte Chunks? Wie stoppt man eine fehlerhafte Synchronisierung? Wie stimmt sie mit dem aktuell veröffentlichten Commit überein? Und wie bleibt die Standardsuche bei einem Ausfall verfügbar? Dieses Design bestimmt die Qualität beim Übertragen auf mehrere Repositories.

Das Ergebnis lässt sich knapp zusammenfassen:

- Pagefind als Standardsuche behalten
- Vectorize als Ergänzung für semantische Suche verwenden
- Corpus aus öffentlichem HTML erzeugen
- ID und Version deterministisch aus content hashes erzeugen
- Preview und Production einschließlich Ressourcen und Rechte trennen
- Suche fail-soft, Synchronisierung und Veröffentlichung fail-closed gestalten
- „Implementierung“, „Prüfung“, „Preview“ und „Production“ als getrennte Zustände dokumentieren

Mit diesen Grenzen lässt sich Vectorize nicht nur als einmalige AI-Funktion, sondern als kontinuierlich aktualisierbare Suchinfrastruktur betreiben.
