---
title: "Cloudflare-Vectorize-Implementierungsleitfaden: Öffentliches HTML sicher synchronisieren"
description: "Ein ausführlicher Leitfaden, um einen Corpus aus öffentlichem HTML zu erstellen, Pagefind verfügbar zu halten und Vectorize sicher zu synchronisieren."
date: 2026-07-31T12:00
author: gui
tags: ["Technologie", "Cloudflare", "Vectorize", "OpenAI", "Website-Suche"]
image: /uploads/acecore-generated/blog-cloudflare-pages-security.webp
callout:
  type: tip
  title: Vectorize ist eine Suchbasis für Bedeutung, nicht nur für Wörter
  text: "Die Cloudflare-Vektordatenbank kann veröffentlichte Seiten zurückgeben, deren Bedeutung einer Frage nahekommt, auch wenn die Keywords nicht exakt übereinstimmen. Ihr Wert liegt darin, die bestehende Keyword-Suche um Umschreibungen und verwandte Informationen zu ergänzen, nicht sie zu ersetzen."
processFigure:
  eyebrow: Vectorize rollout
  title: Vom veröffentlichten HTML zur sicheren verwandten Suche
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
    - title: Preview-Oberfläche prüfen
      description: "Die semantische Suche dort deaktiviert lassen und Pagefind-Vorschläge, Fallback und sichtbaren Hinweis prüfen."
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
      - "Production-Allowlist, Löschquote, veröffentlichter Commit und Abschluss der Mutation werden vor und nach der Synchronisierung geprüft"
      - "Implementierung, lokale Prüfung, Prüfung der Preview-Oberfläche und Produktionsbetrieb werden als getrennte Zustände dokumentiert"
statBar:
  items:
    - value: "Suche nach Bedeutung"
      label: Mehr als exakte Begriffe finden
      description: "Hilft bei Fragen, Umschreibungen und thematisch verwandten Seiten."
      icon: i-lucide-git-branch
    - value: "Zwei Suchwege"
      label: Pagefind plus Vectorize
      description: "Eine robuste Keyword-Suche bleibt verfügbar; Vectorize ergänzt sie gezielt."
      icon: i-lucide-database
    - value: "Öffentliches HTML"
      label: Durchsuchen, was Leser sehen
      description: "Der Index folgt den tatsächlich veröffentlichten Seiten, nicht CMS-Entwürfen."
      icon: i-lucide-test-tube-2
    - value: "Schrittweise Einführung"
      label: Erst prüfen, dann veröffentlichen
      description: "UI, Corpus und Synchronisierung erhalten jeweils eigene Sicherheitsgrenzen."
      icon: i-lucide-badge-check
checklist:
  title: Prüfung vor der Einführung auf der nächsten Website
  items:
    - text: "Die vorhandene Stichwortsuche behalten, damit der Suchweg auch bei einem Vectorize-Ausfall verfügbar bleibt"
      checked: true
    - text: "Tatsächliche Ausgabe des embedding model mit dimensions und metric des Index abgleichen"
      checked: true
    - text: "Corpus aus öffentlichem HTML erzeugen und noindex, externe canonicals sowie Verwaltungsseiten ausschließen"
      checked: true
    - text: "Mit IDs aus content hashes unveränderte Chunks nicht erneut embedden"
      checked: true
    - text: "Preview nur mit Pagefind betreiben und Vectorize, D1 sowie Synchronisierungsrechte auf Production begrenzen"
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
  - href: /insights/cloudflare-vectorize-implementation-guide/
    title: Zuerst die Rollen von Vectorize und RAG verstehen
    description: "Eine kurze Einführung in semantische Suche, RAG und die Voraussetzungen für Antworten mit Quellen."
    icon: i-lucide-route
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
      answer: "Nein. D1 kann zum Beispiel ein rate limit für die Such-API verwalten, ist aber kein Pflichtspeicher für Vectorize selbst. Auch der Ablageort des Originaltexts kann je nach Anforderungen öffentliches HTML, JSON, D1 oder R2 sein."
    - question: Wie werden embedding model und dimensions in der aktuellen Implementierung verwaltet?
      answer: "Modell, dimensions und metric sind ein gemeinsamer Vertrag zwischen Corpus, Index, API und Synchronisierung. Vektoren mit unterschiedlichen dimensions dürfen nie in einem Index gemischt werden. Da die Index-Konfiguration nach der Erstellung nicht geändert werden kann, müssen vor dem Anlegen die aktuelle offizielle Spezifikation und die tatsächliche Ausgabeform geprüft werden."
    - question: Wann gilt die Einführung als abgeschlossen?
      answer: "Weder ein Merge noch lokale tests reichen aus. In Preview prüfen wir Pagefind und das UI-Fallback; in Production den Abgleich von veröffentlichtem Commit und Corpus, die Index-Synchronisierung, die Mutation-Konvergenz, die verwandte Suche, das rate limit und das Abschaltverfahren, bevor wir den Produktionsbetrieb dokumentieren."
---

## Zuerst verstehen: Was ist Cloudflare Vectorize?

Cloudflare Vectorize ist die Vektordatenbank von Cloudflare. Sie speichert **embeddings** — numerische Repräsentationen der Merkmale und Bedeutung von Texten, Bildern und anderen Daten — und findet Informationen, deren Bedeutung einer Eingabe nahekommt. Wie die [offizielle Übersicht](https://developers.cloudflare.com/vectorize/) beschreibt, eignet sie sich für semantische Suche, Empfehlungen, Klassifizierung und die Abrufschicht späterer RAG-Anwendungen.

Eine normale Keyword-Suche findet besonders schnell Seiten mit Produktnamen, Eigennamen oder Fehlercodes. Vectorize hilft dagegen, wenn die verwendeten Wörter nicht exakt übereinstimmen. Eine Frage wie „Ich möchte meine Website verbessern“ kann so eine Seite über fortlaufende Web-Betreuung oder technische Beratung finden, obwohl die Formulierung anders ist.

> Vectorize ist für sich genommen kein Chatbot, der Antworten erzeugt. Es ist eine Suchbasis, die relevante veröffentlichte Seiten und ihre URLs auswählt. Wird später generative AI ergänzt, können diese Ergebnisse die Belegschicht der Antwort bilden.

## Was wird durch die Einführung besser?

- **Umschreibungen und Fragen finden**: Leser müssen die auf der Website verwendeten Fachbegriffe nicht genau kennen, um eine Seite mit ähnlicher Absicht zu erreichen.
- **Verwandtes Wissen über Inhalte hinweg verbinden**: Artikel, FAQs und Service-Seiten mit unterschiedlicher Wortwahl können über ihre inhaltliche Nähe gefunden werden.
- **Die bestehende Suche ergänzen statt ersetzen**: Wird sie nur für eine explizite Aktion „verwandte Informationen finden“ genutzt und die Keyword-Suche beibehalten, steigt die Auffindbarkeit ohne einen Neuaufbau der gesamten UI.
- **Die Abrufschicht später wiederverwenden**: Wenn die ursprüngliche Seite und URL zurückgegeben werden, lässt sich dieselbe Schicht für zitierbare AI-Antworten, verwandte Artikel oder Empfehlungen verwenden.

Semantische Suche ist jedoch keine Magie. Ihre Qualität hängt von einem korrekt ausgewählten öffentlichen Corpus, einem passenden embedding model und der Bewertung echter Suchergebnisse ab. Für exakte Produktnamen oder Codes ersetzt sie die normale Suche nicht.

## Zuerst über die bestehende Suche legen

Für die erste Einführung ist es am einfachsten, die vorhandene Keyword-Suche beizubehalten und Vectorize nur aufzurufen, wenn Leser ausdrücklich nach verwandten Informationen suchen.

1. Pagefind oder eine andere normale Suche für Produktnamen, Eigennamen und kurze exakte Begriffe nutzen.
2. Die Vectorize-Suche für Fragen, Umschreibungen und verwandte Themen nutzen.
3. Die normale Suche verfügbar lassen, wenn embedding provider oder Vectorize ausfallen.

Das sind Wert und Einsatzbereich, die zuerst beurteilt werden sollten. Der Rest dieses Artikels zeigt ein wiederverwendbares Vorgehen für Astro- und Cloudflare-Pages-Websites.

> **Eine praxisnahe Erstkonfiguration:** Die normale Pages Preview verwendet mit `SEARCH_ENABLED=false` nur Pagefind. Vectorize-/D1-Bindings und die automatische Synchronisierung bleiben auf Production beschränkt. In Preview prüfen Sie die Suchoberfläche und den Fallback; nach Production synchronisieren Sie nur einen Corpus aus dem veröffentlichten Commit. So gelangen weder unfertige Änderungen noch weitreichende Rechte in die produktive Suche.

Bei der Planung einer Einführung wird schnell klar: Nur „ein embedding erzeugen und `query()` aufrufen“ reicht nicht aus. Wie entsteht der Suchbestand? Wie bleibt Preview bei Pagefind, während Production geschützt wird? Wie verhindert man bei einer fehlerhaften Synchronisierung eine Massenlöschung? Und stimmt der Index wirklich mit den aktuell veröffentlichten Seiten überein? Im Betrieb ist das Design vor und nach dem Vectorize-API-Aufruf wichtiger als der Aufruf selbst.

## Fazit vorweg: Suche fail-soft, Synchronisierung und Veröffentlichung fail-closed

Das am besten wiederverwendbare Prinzip war, für die nutzerseitige Suche und die betriebliche Synchronisierung unterschiedliche Fehlerstrategien festzulegen.

| Bereich                 | Strategie bei Fehlern | Grund                                                                                                                    |
| ----------------------- | --------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Normale Website-Suche   | fail-soft             | Auch bei einem Vectorize-Ausfall kann mit Pagefind weitergesucht werden                                                  |
| API für verwandte Suche | fail-soft             | Fehler schnell beenden, ohne die Ergebnisse der normalen Suche zu beeinträchtigen                                        |
| Corpus-Erzeugung        | fail-closed           | Bei ungültigen Seiten, locales, Mengen oder Metadaten keinen Corpus erzeugen                                             |
| Index-Synchronisierung  | fail-closed           | Nichts ändern, wenn Zielumgebung, vorhandene IDs, Löschquote oder Mutation nicht prüfbar sind                            |
| Production-Aktivierung  | fail-closed           | Erst nach Abgleich von veröffentlichtem Commit und Corpus sowie Konvergenz von Production-Sync und Mutationen aktivieren |

So lassen sich zwei Ziele gleichzeitig erreichen: „Die Website-Suche funktioniert auch bei einem AI-Ausfall“ und „Bei Zweifeln verändert die Synchronisierung keinen einzigen Datensatz“.

## Zuerst diese vier Entscheidungen treffen

Bevor Sie Provider oder Indexnamen auswählen, beantworten Sie diese vier Fragen. Damit wird die Architektur deutlich einfacher zu beurteilen.

| Entscheidung            | Einfacher Einstieg                                                 | Warum                                                                              |
| ----------------------- | ------------------------------------------------------------------ | ---------------------------------------------------------------------------------- |
| Ziel der Leser          | „Verwandte Seiten finden“                                          | Statt sofort Antworten zu erzeugen, können Sie zunächst die Suchqualität bewerten. |
| Einstieg in die Suche   | Während der Eingabe Pagefind; Vectorize nach ausdrücklicher Aktion | Geschwindigkeit, Kosten und Datenübertragung bleiben nachvollziehbar.              |
| Maßgeblicher Corpus     | Veröffentlichtes HTML                                              | Entwürfe und Verwaltungsseiten erscheinen nicht versehentlich in den Treffern.     |
| Veröffentlichungsablauf | UI in Preview prüfen; nur Production synchronisieren               | Testdaten und Rechte gelangen nicht in die produktive Suche.                       |

Wenn diese vier Fragen beantwortet sind, lassen sich embedding provider, D1, R2 und eine spätere Antwortgenerierung passend zu den eigenen Anforderungen auswählen.

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

In einem solchen Suchdialog stammen Vorschläge während der Eingabe nur von Pagefind im Browser. Erst wenn ein Leser „Suchen“ ausführt, wird der Suchbegriff wie in der UI erläutert an den embedding provider gesendet und mit den öffentlichen Informationen der Website in Vectorize abgeglichen. Der Hinweis rät davon ab, persönliche oder vertrauliche Informationen einzugeben, und trennt diese Übertragung von gewöhnlichen Keyword-Vorschlägen.

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

Für eine mehrsprachige Website kann der erste Corpus zum Beispiel nur Seiten einer gewählten Sprache aufnehmen, die diese Bedingungen erfüllen:

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

Wählen Sie embedding provider und Modell erst aus, nachdem Sie deren tatsächliche Ausgabe geprüft haben. Ein Modell wie [`@cf/baai/bge-m3`](https://developers.cloudflare.com/workers-ai/models/bge-m3/) von Workers AI oder [OpenAI Embeddings](https://platform.openai.com/docs/guides/embeddings) kann geeignet sein, doch dimensions und metric müssen mit dem vorgesehenen Index übereinstimmen. Wechseln sie später, legen Sie einen getrennten Zielindex an, halten Sie den bisherigen Index für den rollback vor und mischen Sie niemals Vektoren mit unterschiedlichen dimensions.

Wichtiger als der konkrete Modellname ist, in vier Bereichen denselben Vertrag festzuschreiben.

| Bereich          | Festzulegende Werte                |
| ---------------- | ---------------------------------- |
| Corpus-Metadaten | model, dimensions, metric          |
| Vectorize-Index  | dimensions, metric                 |
| Such-API         | model, embedding length            |
| Sync-Skript      | erlaubte model, dimensions, metric |

Wie Cloudflare unter [Create indexes](https://developers.cloudflare.com/vectorize/best-practices/create-indexes/) beschreibt, lassen sich dimensions und metric eines Index nach der Erstellung nicht ändern. Sind die Modellunterlagen unklar, darf der Index nicht aufgrund einer Vermutung erstellt werden. Zuerst werden die aktuelle Dokumentation und die tatsächliche Ausgabe geprüft.

Wer metadata filtering verwendet, muss den metadata index vor den Vektoren anlegen. Bereits eingespielte Vektoren werden nicht allein dadurch filterbar, dass der metadata index später hinzugefügt wird; sie müssen erneut upsertet werden.

Auch Produktlimits ändern sich. Am 31. Juli 2026 erneut bestätigt, liegt das upsert-batch-Limit von Vectorize V2 bei 1,000 über die Workers API und bei 5,000 über die HTTP API. Das normale `topK`-Limit beträgt 100; bei `returnValues: true` oder `returnMetadata: "all"` beträgt es 50. Bei jeder Implementierung sollten die [aktuellen Limits](https://developers.cloudflare.com/vectorize/platform/limits/) und die [client API](https://developers.cloudflare.com/vectorize/reference/client-api/) erneut geprüft werden.

Wählen Sie für Synchronisierung und Suche bewusst kleinere, sicher beobachtbare batch-Größen und `topK`-Werte als die Produktgrenzen erlauben. Ein Anbieterlimit und eine Batch-Größe, die das eigene System sicher wiederholen und überwachen kann, sind zwei verschiedene Entscheidungen.

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

- Der Name des Zielindex stimmt nicht exakt mit der Allowlist für den Production-Index überein
- Der Production-Index soll durch den Sync-Prozess automatisch erstellt werden
- Der Wert von `--confirm-production` stimmt nicht mit dem Zielindex überein
- dimensions／metric weichen vom Vertrag ab
- locale, URL, Metadaten oder content hash des Corpus sind ungültig
- Die Zahl der source pages oder Vektoren überschreitet die erwartete Obergrenze
- Im vorhandenen Index befinden sich nicht verwaltete IDs
- Mehr als 20% der vorhandenen Vektoren sollen gelöscht werden
- Retry-Limit oder Wartezeit für die Mutation werden überschritten

Auch eine beabsichtigte große Löschung wird als separat geprüfter Migrationsvorgang behandelt und nicht im normalen Workflow überschrieben. Normale push- und schedule-Läufe dürfen sie nicht ausführen.

## Bei großen Löschungen oder Modellwechseln einen Ersatzindex verwenden

Eine Löschung von mehr als 20 % gehört nicht in die gewöhnliche Differenzsynchronisierung. Die 20 % sind kein Cloudflare-Produktlimit, sondern ein operativer Schutzwert: Der Routine-Workflow hält an, damit eine Person die Änderung prüft.

Als bei einem bestehenden Index 21,3 % der Vektoren gelöscht werden sollten, löschten wir nicht direkt. Stattdessen nutzten wir diese Reihenfolge:

1. Einen Ersatzindex erstellen, der zum neuen Vertrag aus Modell, Dimensionszahl und Metrik passt.
2. Den veröffentlichten Corpus vollständig synchronisieren sowie ID-Mengen-Konvergenz und bekannte Query-Canaries prüfen.
3. Die Worker- oder Pages-Bindung auf den Ersatzindex umstellen.
4. Production-Such-API, Fallback der normalen Suche und die aktive Bindung prüfen.
5. Den alten Index nur nach einer separaten ausdrücklichen Freigabe löschen.

Tritt nach einer Löschung ein Problem auf, setzt man zuerst `SEARCH_ENABLED=false`, um nur die verwandte Suche anzuhalten und die normale Suche zu erhalten. Danach Ersatzindex neu erstellen, vollständig synchronisieren, Queries prüfen und die Bindung erneut umstellen. Eine Indexlöschung darf nie die erste Rollback-Maßnahme sein.

## Preview nur mit Pagefind betreiben und Production zum einzigen Synchronisierungsziel mit hohen Rechten machen

Die Trennung von Preview und Production in der Einführungsphase half dabei, Rechte und Stopbedingungen zu erkennen. Eine normale Pages Preview benötigt jedoch keine Vectorize- oder D1-Bindings. Die aktuelle Konfiguration hält `SEARCH_ENABLED=false`: In Preview werden Pagefind-Vorschläge, Fallback und Layout geprüft. Vectorize- und D1-Bindings, Synchronisierungs-Token und die Production Environment sind auf Production beschränkt.

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

Eine öffentliche Such-API sollte mindestens folgende Grenzen setzen:

| Bereich         | Implementierung                                                               |
| --------------- | ----------------------------------------------------------------------------- |
| Methode／Format | Nur same-origin JSON POST akzeptieren                                         |
| body            | Maximal 2KiB; auch ohne `Content-Length` beim Lesen des Streams abbrechen     |
| query           | Nach NFKC-Normalisierung 2 bis 160 Zeichen                                    |
| locale          | Nur `ja`                                                                      |
| rate limit      | Client- und globale Limits passend zu Kosten, Traffic und Bedrohungsmodell    |
| Abschaltung     | Mit `SEARCH_ENABLED` nur die verwandte Suche stoppen                          |
| query           | raw query weder in Logs noch im Corpus oder in Vectorize-Metadaten speichern  |
| Ergebnis-URL    | Nur öffentliche, same-origin und root-relative URLs zulassen                  |
| Fehler          | Strukturierte Codes pro Stufe zurückgeben und den Inhalt nicht protokollieren |

Eine clientseitige UUID ist keine starke Kostengrenze, da Nutzer sie verändern können. Deshalb werden ein aus Cloudflare-Verbindungsdaten gebildeter client key, ein global limit und die Überwachung des Verbrauchs kombiniert. Je nach Größe und Bedrohungsmodell kommen zusätzlich Turnstile, WAF oder Durable Objects infrage.

D1 wird in dieser Architektur für das rate limit verwendet, ist aber keine Voraussetzung für Vectorize. Dasselbe gilt für R2. Die Wahl hängt davon ab, wo der Originaltext liegt und wo das rate limit verwaltet werden soll.

## Verwandte Suche und generativen KI-Chat mit getrennten Verträgen versehen

Eine Suche nach „verwandten Inhalten“ kann den Suchbegriff erst nach einer ausdrücklichen Aktion an einen embedding provider senden und ihn mit den öffentlichen Informationen der Website in Vectorize abgleichen. Ein separater KI-Chat sendet dagegen Frage und gegebenenfalls Gesprächskontext an einen Antwortdienst, um eine Antwort zu erzeugen.

Beides darf nicht zu einer vagen „AI-Suche“ zusammengezogen werden. Übertragene Daten, Quellenbereich, Fehleranzeige, Nutzung und Datenschutzhinweise müssen getrennt gestaltet werden; ein Fallback der Vectorize-Suche darf nie stillschweigend an die AI-Anleitung gesendet werden.

## Zuständigkeiten der Suchquellen nicht vermischen

Websites, Hilfecenter, Richtlinien und interne Wissensbasen haben unterschiedliche Zuständigkeiten. Legen Sie vorab fest, welche Fragen zu welcher Quelle gehören.

- Öffentliche Produkt- und Serviceinformationen mit dem Website-Corpus durchsuchen
- Verbindliche Regeln und Anleitungen in der jeweils offiziellen Quelle suchen
- Bei Vectorize-Ausfall nicht auf eine unpassende Quelle zurückfallen
- Nur tatsächlich ausgewählte Quellen als Beleg verlinken
- Unbestätigte Regeln oder Informationen nicht erraten

Das ist auch bei RAG und Auskunftschats wichtig. Je mehr Suchorte es gibt, desto früher muss festgelegt werden, welche Frage an welche Quelle geht und was bei fehlenden Informationen ausdrücklich nicht beantwortet wird.

## Tatsächliche Fehler und die daraus abgeleiteten Änderungen

Typische wiederkehrende Probleme sollten von Beginn an berücksichtigt werden.

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
| In Preview bestätigt | Pagefind-Vorschläge, Anzeige bei nicht verfügbarer verwandter Suche und UI geprüft  |
| In Production aktiv  | Veröffentlichten Commit synchronisiert; Mutation, API und Abschaltverfahren geprüft |

Halten Sie diese Zustände auch in Abschlussberichten und Release Notes getrennt fest. So werden vorhandener Code und ein tatsächlich sicherer Produktionsbetrieb nicht verwechselt.

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
  -> nur den in der Allowlist stehenden Production-Index synchronisieren
  -> nach Upsert-Konvergenz löschen
  -> Corpus-Version dokumentieren

Pages Preview
  -> SEARCH_ENABLED=false
  -> Pagefind-Vorschläge und UI-Fallback prüfen
```

Eine LLM-Antwortgenerierung ist zu Beginn nicht nötig. Zuerst sollte eine Suche entstehen, die „verwandte Seiten sicher zurückgibt“ und bewertbar ist. Auch bei späterer Antwortgenerierung werden abgerufener Originaltext, zitierbare URL und Bedingungen für nicht beantwortbare Fragen als eigener Vertrag entworfen.

## Zusammenfassung

Die schwierige Aufgabe bei Cloudflare Vectorize ist nicht die nearest-neighbor query selbst.

Entscheidend ist das Betriebsdesign: Was wird als öffentliche Information indexiert? Wie erkennt man unveränderte Chunks? Wie stoppt man eine fehlerhafte Synchronisierung? Wie stimmt sie mit dem aktuell veröffentlichten Commit überein? Und wie bleibt die Standardsuche bei einem Ausfall verfügbar? Dieses Design bestimmt die Qualität bei der Übertragung auf eine weitere Website.

Das Ergebnis lässt sich knapp zusammenfassen:

- Pagefind als Standardsuche behalten
- Vectorize als Ergänzung für semantische Suche verwenden
- Corpus aus öffentlichem HTML erzeugen
- ID und Version deterministisch aus content hashes erzeugen
- Preview nur mit Pagefind betreiben und Vectorize, D1 sowie Synchronisierungsrechte auf Production begrenzen
- Suche fail-soft, Synchronisierung und Veröffentlichung fail-closed gestalten
- „Implementierung“, „lokale Prüfung“, „Prüfung der Preview-Oberfläche“ und „Production“ als getrennte Zustände dokumentieren

Mit diesen Grenzen lässt sich Vectorize nicht nur als einmalige AI-Funktion, sondern als kontinuierlich aktualisierbare Suchinfrastruktur betreiben.
