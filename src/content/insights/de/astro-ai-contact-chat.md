---
title: "KI-Kontaktchat in eine Astro-Website integrieren: Architektur und Umsetzung"
description: "Referenzarchitektur mit Stand 6/2026. Dieser Artikel zeigt, wie sich ein KI-Kontaktchat mit der OpenAI Responses API in eine statische Website mit Astro und Cloudflare Pages integrieren lässt. Er behandelt die API-Grenze, den Website-Kontext, die Regeln im Prompt, sprachabhängige URLs, die Origin-Prüfung, Anfragelimits und die sichere Darstellung von Markdown-Links. Das Muster lässt sich auf andere Websites übertragen."
date: 2026-06-07T12:00
lastUpdated: "2026-11-12T00:00:00+09:00"
author: gui
tags: ["Technik", "Cloudflare", "Website", "KI", "Dienstleistungen"]
image: "/images/insights/covers/astro-ai-contact-chat-cover-v2.webp"
callout:
  type: info
  title: Das Wichtigste
  text: Der KI-Kontaktchat ist eine kleine Anwendung, die Besucher anhand veröffentlichter Website-Informationen zum passenden nächsten Schritt führt. Der Server und explizite Freigabelisten regeln den Umgang mit API-Schlüsseln, Prompts, Kontaktdaten und Markdown.
processFigure:
  title: Referenzarchitektur des KI-Kontaktchats
  steps:
    - title: Widget
      description: Die Chatoberfläche in Astro sendet die Frage, die Anzeigesprache und einen möglichst kurzen Gesprächsverlauf.
      icon: i-lucide-message-circle
      accent: brand
    - title: Funktion
      description: Die Cloudflare Pages Function prüft die Eingabe und den Origin, begrenzt Anfragen und erstellt den Prompt.
      icon: i-lucide-shield-check
      accent: amber
    - title: Modell
      description: Die OpenAI Responses API erhält öffentliche Website-Informationen und den Gesprächskontext und gibt den Antworttext zurück.
      icon: i-lucide-sparkles
      accent: emerald
    - title: Darstellung
      description: Der Client wandelt freigegebene Markdown-Elemente in DOM-Knoten um und verweist auf interne Seiten oder passende Kontaktmöglichkeiten.
      icon: i-lucide-code-2
      accent: slate
compareTable:
  title: Zuständigkeiten bei der Einführung
  before:
    label: Gemeinsame Implementierung
    items:
      - Der Browser kann die KI-API direkt aufrufen
      - Website-Informationen, API-Schlüssel, Oberfläche und Linkdarstellung vermischen sich
      - Die KI macht leichter verbindliche Aussagen über Preise, Verträge und Liefertermine
      - Markdown und URLs gelangen leicht ungeprüft ins HTML
  after:
    label: Getrennte Zuständigkeiten
    items:
      - API-Schlüssel und Modellaufrufe bleiben auf dem Server
      - Öffentliche Website-Informationen werden als expliziter Kontext gepflegt
      - Der Prompt legt den Antwortumfang und die Kontaktwege fest
      - Die Darstellung von Markdown und URLs folgt Freigabelisten
checklist:
  title: Checkliste für die Umsetzung auf einer anderen Website
  items:
    - text: Den KI-Chat als Orientierung zu den Kontaktwegen einplanen und formelle Anfragen über das Formular abwickeln
    - text: Eine serverseitige API-Grenze einrichten, damit der API-Schlüssel auf dem Server bleibt
    - text: Für Antworten nur veröffentlichte Website-Informationen verwenden
    - text: Festlegen, in welchen Bereichen die KI keine verbindlichen Aussagen treffen darf, etwa bei Preisen, Verträgen, Lieferterminen und Garantien
    - text: Regeln für den Einsatz von Formular, LINE, E-Mail und Telefon festlegen
    - text: URLs für die jeweilige Sprachversion erzeugen, damit die Navigation in allen Sprachen funktioniert
    - text: Origin-Prüfung sowie Limits für Eingabelänge, Verlauf und Anfragerate einbauen
    - text: Leerraum an den Rändern von Markdown-Linkzielen entfernen und danach die Freigabeliste prüfen
linkCards:
  - href: /contact/
    title: Kontakt
    description: Die Kontaktseite bündelt den KI-Chat, LINE, das Formular und direkte Kontaktmöglichkeiten.
    icon: i-lucide-message-square
  - href: /insights/cloudflare-pages-security/
    title: Sicherheitseinstellungen für Cloudflare Pages
    description: Der Artikel erklärt die Grundlagen für statische Websites, darunter CSP und HTTP-Header.
    icon: i-lucide-shield
  - href: /blog/cms-selection-and-turnstile/
    title: Sveltia CMS einrichten
    description: Der Artikel zeigt, wie eine statische Website eine CMS-Oberfläche zur Bearbeitung erhält.
    icon: i-lucide-badge-check
faq:
  title: Häufig gestellte Fragen
  items:
    - question: Braucht ein KI-Kontaktchat RAG oder eine Vektordatenbank?
      answer: Für eine kleine Unternehmenswebsite genügt als Einstieg oft ein Prompt mit den wichtigsten Informationen aus veröffentlichten Seiten als strukturierter Kontext. Ein Suchindex oder eine Vektordatenbank lässt sich ergänzen, wenn die Zahl der Seiten oder die Häufigkeit der Aktualisierungen steigt.
    - question: Ist der OpenAI-API-Schlüssel im Browser sichtbar?
      answer: Nein. Der Browser sendet nur die Frage an /api/ai-contact. Die Cloudflare Pages Function ruft die OpenAI Responses API auf und verwaltet den Schlüssel.
    - question: Darf eine KI-Antwort beliebige Links enthalten?
      answer: Zulässig sind interne Pfade, URLs desselben Origins, acecore.net, der offizielle LINE-Kanal sowie bei Bedarf mailto und tel. Vor der Sicherheitsprüfung werden Leerzeichen an den Rändern des Markdown-Linkziels entfernt.
---

Für einen ersten KI-Chat auf einer statischen Website genügt es, auf öffentliche FAQ zu verweisen und formelle Angebotsanfragen oder andere verbindliche Anliegen an das Formular weiterzuleiten. Die serverseitige Verbindung beschreibt die Dokumentation [Cloudflare Pages: Bindings](https://developers.cloudflare.com/pages/functions/bindings/). Die URL-Prüfung im Artikel ist ein vereinfachtes Beispiel aus der damaligen Implementierung. Verwenden Sie für die Umsetzung die URL-Syntaxprüfung und die Freigabeliste aus dem verlinkten Artikel. Ein übereinstimmender Zeichenkettenanfang allein reicht für eine Freigabe nicht aus.

> **Nachtrag vom 26. Tag im 9. Monat 2026:** Die folgende Referenzarchitektur hat den Stand 6/2026. Der heutige Endpunkt `/api/ai-chat` von Acecore Systems leitet von einer Cloudflare Pages Function über ein Service Binding an den gemeinsamen Worker `acecore-chat-worker` weiter. Die Oberfläche nimmt eine JSON-Antwort entgegen und zeigt die fertige Antwort an. Der direkte Aufruf der OpenAI Responses API im Artikel beschreibt die damalige Architektur.

Einen KI-Chat auf einer Website einzubinden ist einfach. Für den Betrieb zählen vor allem klare Regeln: Worauf darf der Chat antworten? Welche Kontaktwege soll er anbieten? Welche URLs darf er anzeigen? Wie lassen sich die API-Kosten begrenzen?

Acecore hat einen KI-Kontaktchat in seine statische Website mit Astro und Cloudflare Pages eingebaut. Die zentrale Umsetzung steht im [PR zum KI-Kontaktchat und zur auf das CMS beschränkten Übersetzung](https://github.com/acecore-systems/acecore-net/pull/98). Ein [weiterer PR](https://github.com/acecore-systems/acecore-net/pull/99) passte die sichere Darstellung von Markdown-Links in KI-Antworten an. Der Artikel [Markdown-Links in KI-Chatantworten sicher darstellen](/blog/ai-chat-markdown-link-safety/) erklärt die Linkdarstellung im Detail.

Die Architektur lässt sich auch für andere statische Websites verwenden. Das Prinzip gilt ebenso für andere Frontends: Client, API-Grenze, Prompt und Darstellung haben jeweils klar abgegrenzte Aufgaben.

## Gesamtaufbau

Die Architektur besteht aus 3 Schichten.

| Schicht              | Aufgabe                                                                                      |
| -------------------- | -------------------------------------------------------------------------------------------- |
| Chat-Widget          | Oberfläche, Eingabe, Anzeigesprache, kurzer Gesprächsverlauf und Markdown-Darstellung        |
| `/api/ai-contact`    | Eingaben validieren, Origin prüfen, Anfragen begrenzen, Prompt erstellen und OpenAI aufrufen |
| OpenAI Responses API | Antworten aus Website-Informationen und Gesprächskontext erzeugen                            |

Der Aufruf der OpenAI API läuft über den Server. Dafür gibt es 3 Gründe.

- Der API-Schlüssel bleibt auf dem Server.
- Modell, Prompt und Website-Kontext lassen sich serverseitig aktualisieren.
- Eingabelänge, Origin-Prüfung, Anfragelimits und Fehlerbehandlung lassen sich an 1 Stelle bündeln.

Bei Astro und Cloudflare Pages lässt sich die API-Grenze als Cloudflare Pages Function unter `/api/ai-contact` umsetzen. In Next.js übernimmt diese Aufgabe ein Route Handler, in Hono oder Express eine API-Route.

## Den Vertrag des Endpunkts klein halten

Die API des KI-Kontaktchats erhält nur die Informationen, die sie für die Antwort benötigt.

```ts
type ContactAiRequest = {
  message: string;
  locale: "ja" | "en" | "zh-cn" | "es" | "pt" | "fr" | "ko" | "de" | "ru";
  history?: Array<{
    role: "user" | "assistant";
    content: string;
  }>;
};

type ContactAiResponse = {
  answer: string;
};
```

Namen, E-Mail-Adressen, Telefonnummern und Firmennamen aus dem Formular gehen nicht an den Chat. Der Chat hilft Besuchern, den passenden Dienst und die richtige Anlaufstelle zu finden. Persönliche Daten bleiben beim Kontaktformular.

Der Chat übermittelt nur die letzten Nachrichten aus dem Verlauf. Auch die Zeichenzahl pro 1 Nachricht ist begrenzt. Das hält den Prompt klein und begrenzt die Kosten der API.

## Eingaben und Aufrufe auf dem Server steuern

Die Cloudflare Pages Function bündelt die folgenden Schritte.

```ts
export async function onRequestPost({ request, env }: PagesFunction<Env>) {
  assertSameOrigin(request);
  assertRateLimit(request);

  const body = await request.json();
  const message = validateMessage(body.message);
  const locale = validateLocale(body.locale);
  const history = trimHistory(body.history);

  const prompt = buildContactPrompt({
    locale,
    message,
    history,
    siteContext: buildPublicSiteContext(locale),
  });

  const answer = await callOpenAIResponsesApi({
    apiKey: env.OPENAI_API_KEY,
    model: env.OPENAI_MODEL,
    prompt,
  });

  return Response.json({ answer });
}
```

Vor dem OpenAI-Aufruf wird die Eingabe geprüft und auf das Nötige gekürzt. Die KI-API berechnet Kosten für die übermittelten Eingaben. Unbegrenzte Texte, überflüssiger Gesprächsverlauf und wiederholte Aufrufe von fremden Websites machen den Betrieb schnell instabil.

Die Umgebungsvariable `OPENAI_MODEL` erleichtert Modellwechsel und Tests in der Vorschau. `OPENAI_API_KEY` wird ausschließlich in der Serverumgebung verwaltet.

Weitere Hinweise zur Auslieferung und zu CSP stehen in [Statische Websites mit Cloudflare Pages sicher ausliefern](/insights/cloudflare-pages-security/).

## Website-Informationen als Kontext übergeben

Bei einer Website dieser Größe können Sie mit einem strukturierten Auszug aus veröffentlichten Inhalten beginnen. So bleiben Umsetzung und Betrieb überschaubar. Eine Vektordatenbank oder RAG lässt sich später ergänzen.

Bereiten Sie etwa folgende Informationen auf dem Server auf.

- Kurzbeschreibung des Unternehmens und seiner Leistungen
- Zielgruppen, typische Beratungsanfragen und passende URLs für jede Leistung
- Antworten aus den FAQ
- Einsatzbereiche von Kontaktformular, LINE, E-Mail und Telefon
- Themen wie Preise, Verträge und Liefertermine, zu denen die KI keine verbindlichen Aussagen treffen darf
- Interne URLs für jede Sprachversion

Geben Sie dem Modell die Informationen vor, auf deren Grundlage diese Website Auskunft erteilen darf.

```ts
function buildPublicSiteContext(locale: Locale) {
  return {
    services: [
      {
        name: "Web制作",
        summary: "コーポレートサイト、採用サイト、LPの制作相談に対応",
        url: localizePath("/services/web-production/", locale),
      },
      {
        name: "サーバー運用",
        summary: "クラウド、VPS、監視、バックアップ設計の相談に対応",
        url: localizePath("/services/server-operations/", locale),
      },
    ],
    contact: {
      form: localizePath("/contact/", locale),
      line: "https://lin.ee/...",
      emailPolicy: "フォームが使えない場合や補足が必要な場合だけ案内する",
      phonePolicy: "急ぎの確認が必要な場合だけ案内する",
    },
  };
}
```

Für wenige Seiten genügt dieses Vorgehen. Wachsen Seitenzahl, Aktualisierungsfrequenz oder Suchanforderungen, können Sie eine Suche mit Pagefind, JSON aus dem CMS, D1 oder Vectorize ergänzen.

## Im Prompt Regeln für Antworten festlegen

Im Prompt für den KI-Kontaktchat stehen vor allem klare Grenzen und Verbote. Stilvorgaben für flüssige Antworten sind zweitrangig.

```txt
あなたはこのサイトの問い合わせ案内AIです。
公開済みサイト情報だけを根拠に回答してください。

ルール:
- 料金、契約、納期、保証を断定しない
- 詳細見積りや正式な相談は問い合わせフォームへ案内する
- 短い確認やSchoolsに関する相談はLINEも案内する
- メールと電話は、ユーザーが直接連絡を求めた場合だけ案内する
- 内部リンクは現在のlocaleに合うURLを使う
- わからない場合は、推測せずフォームへ案内する
```

Ein häufiger Fehler ist, dass das Modell Leistungen möglichst vorteilhaft darstellen will und dabei verbindlich klingt. Auf Fragen wie „Was kostet das?“, „Bis wann können Sie liefern?“ oder „Können Sie das auf jeden Fall umsetzen?“ soll es allgemein Auskunft geben und für eine verbindliche Antwort auf das Formular verweisen.

Dafür gibt es auch einen praktischen Grund. Angebote und Liefertermine lassen sich erst nach dem Gespräch mit dem Kunden festlegen. Beschreiben Sie im Prompt, für welche Auskünfte das Team im Betrieb die Verantwortung übernehmen kann.

## Kontaktwege nach ihrem Zweck aufteilen

Auf der Kontaktseite ergänzen sich Chat und Formular. Die folgende Aufteilung erleichtert den Betrieb.

| Kontaktweg           | Aufgabe                                                                                         |
| -------------------- | ----------------------------------------------------------------------------------------------- |
| FAQ                  | Häufige Fragen direkt auf der Seite beantworten                                                 |
| KI-Chat              | Im Gespräch passende Leistungen, Anlaufstellen und Seiten finden                                |
| LINE                 | Kurze Beratungen, Anliegen zu Schools und einfache Rückfragen klären                            |
| Formular             | Angebote, Projektanfragen, Kooperationen und Bewerbungen mit nachvollziehbarem Verlauf erfassen |
| Direkte Kontaktdaten | Bei Ergänzungen nach der Formularanfrage oder dringenden Rückfragen anzeigen                    |

Der Chat kann von Übersichtsseiten wie der [Leistungsübersicht](/services/) zu konkreten Kontaktmöglichkeiten auf der [Kontaktseite](/contact/) führen. Besucher müssen dann nicht erneut selbst nach der passenden Seite suchen.

Das Muster funktioniert auch für Websites, die sich an Unternehmen richten, für Agenturen, Bildungseinrichtungen und den Support von SaaS-Produkten. Wenn der Chat die passenden Seiten und Kontaktwege eingrenzt, lässt er sich leichter einführen.

## Die richtige Sprachversion verlinken

Auf mehrsprachigen Websites müssen sowohl die Sprache der Antwort als auch die Linkziele zur aktuellen Sprachversion passen.

Kommt die Frage von einer englischen Seite, antwortet der Chat auf Englisch und verweist zum Beispiel über `/en/services/` auf die englischen Leistungen. Auf einer japanischen Seite verwendet er `/services/`.

Eine serverseitige Funktion für die URL-Erzeugung ist zuverlässiger als eine Vorgabe im Prompt.

```ts
function localizePath(path: string, locale: Locale) {
  if (locale === "ja") return path;
  return `/${locale}${path}`;
}
```

Wenn Chatantworten auf japanische URLs zurückführen, unterbricht das die Navigation in der gewählten Sprache. Die Grundlagen für Übersetzungen und mehrsprachige Beiträge erklärt [Einen mehrsprachigen Blog mit Sveltia CMS betreiben](/blog/copilot-translation-pipeline/).

## Origin prüfen und Anfragen begrenzen

`/api/ai-contact` ist eine öffentliche API. Sie braucht mindestens eine Origin-Prüfung und Limits für Eingabelänge, Gesprächsverlauf und Anfragerate.

Enthält die Anfrage den Header `Origin`, prüfen Sie, ob der Host der anfragenden Website mit dem Host der API übereinstimmt. So lassen sich unerwünschte Aufrufe von anderen Websites begrenzen.

```ts
function assertSameOrigin(request: Request) {
  const origin = request.headers.get("Origin");
  if (!origin) return;

  const requestUrl = new URL(request.url);
  const originUrl = new URL(origin);

  if (originUrl.host !== requestUrl.host) {
    throw new Response("Forbidden", { status: 403 });
  }
}
```

Als Einstieg ist ein einfaches IP-basiertes Anfragelimit sinnvoll. In Cloudflare lassen sich Anfragen beispielsweise anhand von `CF-Connecting-IP`, `X-Forwarded-For` oder `CF-Ray` zuordnen.

Ein Limit im Arbeitsspeicher gilt nicht dauerhaft über mehrere Isolates oder Neustarts hinweg. Für eine kleine Website ist es ein erster Schutz. Bei wachsendem Verkehr sind Cloudflare WAF, Turnstile, KV, D1 oder Durable Objects zuverlässiger.

Wie sich Inhalte aktualisieren lassen, beschreibt der [Leitfaden zur Einführung von Sveltia CMS](/blog/cms-selection-and-turnstile/). Der Bot-Schutz für Formulare und Kommentare gehört in eine eigene Schicht, etwa mit Turnstile. Ein Beispiel dafür steht in [Eine Kommentarfunktion für einen Astro-Blog mit Cloudflare umsetzen](/blog/cloudflare-only-blog-comments/).

## Markdown-Links über eine Freigabeliste anzeigen

Links in KI-Antworten erleichtern es, Besucher zu den passenden Leistungen zu führen. Die Anwendung verarbeitet die Markdown-Antwort, bevor sie daraus HTML erzeugt.

Die Chatoberfläche wandelt ausschließlich freigegebene Elemente in DOM-Knoten um.

- Absätze
- Aufzählungen
- Fettdruck
- Inline-Code
- Markdown-Links

Für Linkziele gelten zusätzliche Einschränkungen.

- Interne Pfade derselben Website wie `/services/`
- Der aktuelle Origin
- `https://acecore.net`
- Der offizielle LINE-Kanal
- Bei Bedarf `mailto:info@acecore.net`
- Bei Bedarf `tel:0120987370`

Bereinigen Sie die URL immer mit `trim()`, bevor Sie sie prüfen. Das Modell kann wie in `[サービス一覧]( /services/ )` vor und nach dem Linkziel Leerzeichen ausgeben.

```ts
function sanitizeHref(rawHref: string, currentOrigin: string) {
  const href = rawHref.trim();

  if (href.startsWith("/")) return href;
  if (href.startsWith(`${currentOrigin}/`)) return href;
  if (href.startsWith("https://acecore.net/")) return href;
  if (href.startsWith("https://lin.ee/")) return href;
  if (href === "mailto:info@acecore.net") return href;
  if (href === "tel:0120987370") return href;

  return null;
}
```

Beschränken Sie die Implementierung auf die Markdown-Elemente, die im Chat gebraucht werden. So bleiben Sicherheitsregeln und Wartung überschaubar. Wenn externe URLs erlaubt sein sollen, verwenden Sie mindestens eine Domain-Freigabeliste und `rel="noopener noreferrer"`.

## Lokal, in der Vorschau und in Produktion prüfen

Die lokale Astro-Entwicklungsumgebung und die Astro-Vorschau entsprechen nicht vollständig der Laufzeit der Cloudflare Pages Functions. Ohne `OPENAI_API_KEY` sind keine KI-Antworten verfügbar. Prüfen Sie in diesem Fall den Ersatzhinweis und die Fehleranzeige der Oberfläche.

Prüfen Sie in der Pages-Vorschau oder in Produktion folgende Punkte.

- `/api/ai-contact` lässt sich per POST aufrufen.
- `OPENAI_API_KEY` und `OPENAI_MODEL` sind konfiguriert.
- Anfragen mit abweichendem Origin werden abgelehnt.
- Eingabelänge und Anzahl der Nachrichten im Verlauf sind begrenzt.
- Die Antwort ist in der Sprache der aktuellen Seite.
- Interne Links führen zur entsprechenden Sprachversion.
- Die KI macht keine verbindlichen Aussagen zu Angeboten oder Verträgen.
- E-Mail-Adresse und Telefonnummer erscheinen nur bei Bedarf.
- Markdown-Links führen ausschließlich zu sicheren URLs.

Eine Antwort auf 1 Frage reicht als Test nicht aus. Prüfen Sie unerwartete und lange Fragen, Anfragen über die englische Website sowie Fragen nach direkten Kontaktdaten oder Preisen jeweils separat.

## Kennzahlen für Protokollierung und Betrieb

Prüfen Sie nach der Veröffentlichung auch die Protokolle des KI-Kontaktchats.

Erfassen Sie mindestens folgende Kennzahlen.

- Fehlerquote der API
- Anzahl der Anfragen, die das Ratenlimit erreicht haben
- Durchschnittliche Nachrichtenanzahl pro 1 Anfrage
- Aufrufe des Formulars oder von LINE aus dem Chat
- Weiterleitungen zum Formular bei Fragen, die die KI offenlassen musste
- Nutzung nach Sprachversion

Legen Sie vor dem Speichern von Gesprächsinhalten fest, wie Sie personenbezogene Daten behandeln. Als Einstieg genügt es, Ereignisse und Fehler zu zählen, ohne Gesprächsinhalte zu speichern.

## Abgrenzung zur Weitergabe des Formular-Kontexts

Dieser Artikel beschreibt die Architektur des KI-Kontaktchats. Die benachbarte Funktion, die die ausgewählte Dienstleistung von der Leistungsseite an das Formular übergibt, erklärt [Den Kontext eines Service-CTA an das Kontaktformular übergeben](/blog/service-cta-contact-prefill/).

Die beiden Funktionen lösen unterschiedliche Aufgaben.

- KI-Chat: Fragen im Gespräch klären und Besucher sicher zu den passenden Informationen führen.
- Dienstleistungsbezogener CTA: Die aktuell gelesene Dienstleistung als Kontext an das Formular übergeben.

Beim Chat geht es um KI, API-Grenze, Prompt und sichere Darstellung. Bei der Weitergabe an das Formular stehen dessen Bedienung und die Gestaltung der Kontaktwege im Vordergrund. Getrennte Artikel machen beide Themen leichter verständlich und später leichter intern verlinkbar.

## Zusammenfassung

Planen Sie die API-Grenze und die Regeln für Antworten, bevor Sie die Chatoberfläche in eine statische Website einbauen.

Folgende Entscheidungen waren für diese Umsetzung besonders hilfreich.

- Die OpenAI API aus einer Cloudflare Pages Function aufrufen.
- Nur die benötigten Daten an den Endpunkt senden und Verlauf sowie Zeichenzahl begrenzen.
- Website-Kontext und sprachabhängige URLs serverseitig zusammenstellen.
- Im Prompt vorgeben, welche Aussagen die KI treffen darf.
- Formular, LINE und direkte Kontaktdaten für die jeweils passenden Anliegen verwenden.
- Origin prüfen und Anfragen begrenzen.
- Markdown-Linkziele vor der Prüfung bereinigen und anhand einer Freigabeliste zulassen.

Ein KI-Kontaktchat lässt sich auch auf einer statischen Website umsetzen. Er hilft Besuchern, sicher den passenden nächsten Schritt zu wählen.
