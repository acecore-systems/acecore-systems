---
title: "Implementierungsdesign für die sichere Darstellung von Markdown-Links in KI-Chat-Antworten"
description: "Ein Implementierungsvermerk dazu, wie Markdown-Links in KI-Chat-Antworten sicher in HTML umgewandelt werden. Indem man Leerzeichen vor und nach URLs zulässt, aber trim, Allowlist, DOM-Erstellung, Fallback und Testfälle getrennt betrachtet, entsteht ein Renderer, der sich leicht auf andere Websites übertragen lässt."
date: 2026-06-07T14:30
lastUpdated: "2026-11-12T00:00:00+09:00"
author: gui
tags: ["Technik", "Websites", "KI", "Sicherheit", "Astro"]
image: "/images/insights/covers/ai-chat-markdown-link-safety-cover-v2.webp"
callout:
  type: tip
  title: Die wichtigsten Punkte dieses Artikels
  text: KI-Antworten sind kein vertrauenswürdiges HTML. Auch wenn Markdown-Links praktisch sind, sollten URLs zunächst getrimmt und dann anhand einer Allowlist geprüft werden; nicht zulässige URLs werden nicht verlinkt, sondern als Text beibehalten.
processFigure:
  title: Ablauf der Linkdarstellung für KI-Antworten
  steps:
    - title: Text
      description: Eine Antwort des Modells zunächst als Klartext behandeln.
      icon: i-lucide-message-square-text
      accent: brand
    - title: Parsen
      description: Nur die benötigten Markdown-Formen mit einem kleinen Parser erfassen.
      icon: i-lucide-brackets
      accent: amber
    - title: Prüfen
      description: href trimmen und nur interne URLs oder zulässige Domains durchlassen.
      icon: i-lucide-shield-check
      accent: emerald
    - title: Rendern
      description: Mit der DOM-API statt mit innerHTML nur sichere Elemente erstellen.
      icon: i-lucide-code-2
      accent: slate
compareTable:
  title: Entscheidungen bei der Darstellung von Markdown-Links, die getrennt getroffen werden sollten
  before:
    label: Bei einer nachlässigen Darstellung
    items:
      - KI-Antworten direkt in innerHTML einsetzen
      - Versuchen, die gesamte Markdown-Spezifikation auf einmal umzusetzen
      - Wegen Leerzeichen vor oder nach der URL scheitert die Verlinkung
      - "Externe URLs und javascript: gleich behandeln"
  after:
    label: Bei einer schlanken und sicheren Darstellung
    items:
      - Antworten als Text entgegennehmen und nur die benötigten Ausdrucksformen in DOM-Elemente umwandeln
      - Nur die Markdown-Formen unterstützen, die im Chat verwendet werden
      - URL nach trim sicherheitsprüfen
      - Nicht zulässige URLs nicht verlinken, sondern als Zeichenfolge anzeigen
checklist:
  title: Einführungscheckliste
  items:
    - text: KI-Antworten nicht als HTML vertrauen
    - text: Leerzeichen vor und nach URLs in Markdown-Links zulassen
    - text: href immer erst nach dem trim prüfen
    - text: Nur interne Pfade, denselben Origin und erforderliche externe Domains zulassen
    - text: Bei externen Links target und rel explizit angeben
    - text: Nicht zulässige Links als Text beibehalten
    - text: Nicht nur Normalfälle, sondern auch gefährliche URLs und fehlerhaftes Markdown testen
linkCards:
  - href: /blog/astro-ai-contact-chat/
    title: Technisches Design für den KI-Chat zur Kontaktaufnahme
    description: Ein übergeordneter Artikel zu KI-Antworten, API-Grenzen und Prompt-Steuerung.
    icon: i-lucide-sparkles
  - href: /insights/cloudflare-pages-security/
    title: Sicherheitseinstellungen für Cloudflare Pages
    description: Ein verwandter Artikel zu CSP und Security-Headern.
    icon: i-lucide-shield
  - href: /contact/
    title: Kontakt
    description: Der tatsächliche Einstiegspunkt, auf dem KI-Chat und Formular eingebunden sind.
    icon: i-lucide-message-square
faq:
  title: Häufig gestellte Fragen
  items:
    - question: Reicht es, markdown-it oder marked zu verwenden?
      answer: Auch bei Verwendung einer Bibliothek müssen der Umgang mit der HTML-Ausgabe, die erlaubten Linkziele, das Hinzufügen von target und rel sowie das Zurückweisen gefährlicher URLs separat entworfen werden. Für Chat-Anwendungen kann ein kleiner eigener Renderer ausreichen.
    - question: Ist es nicht gefährlich, Leerzeichen vor und nach URLs zuzulassen?
      answer: Entscheidend ist nicht das Zulassen von Leerzeichen an sich, sondern was nach dem trim erlaubt wird. Wird das getrimmte href anhand einer Allowlist geprüft, bleibt die Sicherheit gewahrt und zugleich werden unterschiedliche Schreibweisen des Modells besser abgefangen.
    - question: Sollten nicht zulässige URLs gelöscht werden?
      answer: In vielen Fällen ist eine Textdarstellung einfacher zu debuggen als das Löschen und bewahrt auch für Nutzer den Antwortkontext. Wenn im Betrieb verdächtige Zeichenfolgen vollständig verborgen werden sollen, kann man jedoch entscheiden, den gesamten Link zu entfernen.
---

Wenn ein Link in einer KI-Antwort als Zeichenfolge stehen bleibt, schicken Sie dieselbe Eingabe zunächst nacheinander durch Parsing, URL-Prüfung und DOM-Darstellung und ermitteln Sie, in welchem Schritt es scheitert. Verwenden Sie für den Anzeigetext eine Text-API wie [MDN: textContent](https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent) und vermischen Sie nicht die Entscheidung, ob etwas verlinkt werden darf, mit der Interpretation von HTML – das ist der Ausgangspunkt für die Übertragung auf einen bestehenden Chat.

Wenn man den KI-Chat bittet, mit „Weitere Informationen finden Sie in der [Serviceübersicht](/services/).“ zu antworten, kann es vorkommen, dass der Inhalt nicht als Link erscheint und der Markdown-String unverändert stehen bleibt.

Da sich in Antworten des KI-Chats zur Kontaktaufnahme auf der Acecore-Website auch Markdown-Links mit Leerzeichen vor oder nach der URL fanden, haben wir den Renderer in [PR zur Korrektur der Markdown-Linkdarstellung im KI-Chat](https://github.com/acecore-systems/acecore-net/pull/99) angepasst.

Dieser Artikel nimmt diese kleine Korrektur zum Anlass und fasst die Überlegungen dazu zusammen, wie KI-Antworten sicher in DOM umgewandelt werden.

## KI-Antworten sind kein vertrauenswürdiges HTML

Zunächst gilt: KI-Antworten behandeln wir als Text, nicht als HTML.

Im Chat-UI möchte man zumindest Links, Fettdruck und Aufzählungen unterstützen. Wenn man die Antwort aber direkt in `innerHTML` einsetzt, überlässt man dem Browser die Interpretation einer vom Modell erzeugten Zeichenfolge.

Wir müssen nicht das gesamte Markdown implementieren. Es genügt, nur die im Chat benötigten Ausdrucksformen in kleinem Umfang zu erkennen und ausschließlich sichere DOM-Elemente zu erstellen.

## Das Problem sind nicht nur Leerzeichen

Der unmittelbare Fehler sah so aus.

```md
[サービス一覧](/services/)
```

Als Markdown ist das für Menschen verständlich, aber wenn man den URL-Teil mit einem regulären Ausdruck als „Zeichenfolge ohne Leerzeichen“ erfasst, wird kein Treffer gefunden.

Vor der Korrektur sah der Ansatz so aus.

```js
/\[([^\]]+)\]\(([^)\s]+)\)/;
```

Da `[^)\s]+` keine Leerzeichen zulässt, kann `( /services/ )` nicht als Link erfasst werden. Deshalb erlauben wir innerhalb der Klammern Leerraum am Anfang und Ende und trimmen anschließend die tatsächlich verwendete URL.

```js
/\[([^\]]+)\]\(\s*([^)]+?)\s*\)/;
```

Entscheidend ist, die Regex nicht einfach nur zu lockern. Danach müssen unbedingt Normalisierung und Sicherheitsprüfung folgen.

## href erst nach trim prüfen

Die Reihenfolge beim Erstellen eines Links steht fest.

1. Label und raw href aus dem Markdown auslesen
2. raw href mit `trim()` trimmen
3. Den getrimmten href anhand einer Allowlist prüfen
4. Nur wenn er zulässig ist, `<a>` erstellen

```js
const href = String(rawHref || "").trim();

if (label && isSafeMarkdownHref(href)) {
  const link = document.createElement("a");
  link.href = href;
  link.rel = "noopener noreferrer";

  if (/^https?:\/\//i.test(href)) {
    link.target = "_blank";
  }

  link.textContent = label;
  parent.appendChild(link);
}
```

Wir prüfen nicht den Wert vor `trim()`, sondern den Wert, den wir tatsächlich ins DOM einfügen. Wenn sich der geprüfte Wert von dem dargestellten Wert unterscheidet, verliert die Sicherheitsprüfung an Aussagekraft.

## Die Allowlist je nach Produkt festlegen

Welche URLs der KI-Chat verlinken darf, unterscheidet sich von Website zu Website.

Der KI-Chat für Kontaktanfragen von Acecore beschränkt sich ungefähr auf folgende Bereiche.

| Typ                    | Beispiel                  | Entscheidung                            |
| ---------------------- | ------------------------- | --------------------------------------- |
| Interner Pfad          | `/services/`              | Zulassen                                |
| Gleicher Origin        | `https://acecore.net/...` | Zulassen                                |
| Offizieller LINE-Kanal | `https://lin.ee/...`      | Zulassen, da der Zweck eindeutig ist    |
| mailto                 | `mailto:info@acecore.net` | Nur notwendige feste Empfänger zulassen |
| tel                    | `tel:0120987370`          | Nur notwendige feste Nummern zulassen   |
| Sonstige externe URLs  | Beliebige URL             | Grundsätzlich nicht verlinken           |

Ein Implementierungsbeispiel:

```js
function isSafeMarkdownHref(rawHref) {
  const href = String(rawHref ?? "").trim();
  if (!href || /[\u0000-\u001f\u007f\\]/u.test(href)) return false;
  if (href === "mailto:info@acecore.net" || href === "tel:0120987370") {
    return true;
  }

  try {
    if (href.startsWith("/")) {
      if (href.startsWith("//")) return false;
      const url = new URL(href, window.location.origin);
      return (
        url.origin === window.location.origin && !url.username && !url.password
      );
    }

    const url = new URL(href);
    return (
      url.protocol === "https:" &&
      !url.username &&
      !url.password &&
      !url.port &&
      [
        window.location.origin,
        "https://acecore.net",
        "https://lin.ee",
      ].includes(url.origin)
    );
  } catch {
    return false;
  }
}
```

Diese Funktion sollte je nach Website angepasst werden. Eine Karrierewebsite könnte Jobportale erlauben, ein E-Commerce-Shop Zahlungsdienste oder Sendungsverfolgung, und ein SaaS-Angebot vielleicht Dokumentation oder Statusseiten.

## Nicht zulässige Links als Text beibehalten

Auch der Umgang mit Links, die die Sicherheitsprüfung nicht bestehen, muss festgelegt werden.

Beim KI-Chat für Kontaktanfragen ist es einfacher, Markdown, das sich nicht verlinken lässt, als ursprüngliche Zeichenfolge beizubehalten, statt es vollständig zu entfernen. So bleibt der Kontext für Nutzer erhalten, und Entwickler können nachvollziehen, was die KI ausgegeben hat.

Der Parser ist also nicht nur dafür verantwortlich, sichere Links zu erstellen, sondern auch dafür, sie als normalen Text auszugeben, wenn sie sich nicht sicher erstellen lassen.

## Testfälle von Anfang an vorbereiten

Bei dieser Art Renderer übersieht man leicht Fehler, wenn man nur den Erfolgsfall betrachtet.

Mindestens die folgenden Fälle sollten geprüft werden.

| Eingabe                             | Erwartetes Ergebnis                      |
| ----------------------------------- | ---------------------------------------- |
| `[サービス一覧](/services/)`        | Ergibt einen internen Link               |
| `[サービス一覧]( /services/ )`      | Wird getrimmt und zu einem internen Link |
| `[LINE]( https://lin.ee/example )`  | Wird als externer Link geöffnet          |
| `[危険](javascript:alert(1))`       | Wird nicht verlinkt                      |
| `[外部](https://example.com/)`      | Wird nicht verlinkt, wenn nicht zulässig |
| `[壊れたリンク](/services/`         | Wird als Text angezeigt                  |
| `` `code` と [link]( /contact/ ) `` | Code und Link werden jeweils gerendert   |

In PR #99 haben wir bestätigt, dass `[サービス一覧]( /services/ )`, `[サービス一覧](/services/)` und `[LINE]( https://lin.ee/DjIrdqj )` als dieselbe URL behandelt werden.

## Warum wir nicht das gesamte Markdown implementieren

Das in einem KI-Chat verwendete Markdown lässt sich einschränken.

- Absätze
- Aufzählungen
- Fettdruck
- Inline-Code
- Links

Wenn auch Tabellen, Bilder, HTML, Fußnoten und tiefe Überschriftenhierarchien unterstützt werden, wächst der Verantwortungsbereich des Renderers rapide. Für ein Chat-UI reicht es, Informationen gut lesbar vermitteln zu können.

Bei Bedarf kann man sich auch für eine bewährte Markdown-Bibliothek entscheiden. Doch auch dann muss separat festgelegt werden, ob HTML erlaubt ist, wie URLs beschränkt werden und welche Attribute externe Links erhalten.

## Fazit

Die Darstellung von Markdown-Links im KI-Chat wirkt wie eine kleine visuelle Korrektur. Tatsächlich ist sie jedoch eine Frage der Grenzziehung: Wie weit vertrauen wir der KI-Ausgabe?

Bei der Umsetzung sind folgende Punkte wichtig.

- KI-Antworten als Text und nicht als HTML behandeln
- Nur das benötigte Markdown in kleinem Umfang in DOM-Elemente umwandeln
- Leerzeichen vor und nach URLs in Markdown-Links zulassen
- href trimmen und erst danach die Sicherheitsprüfung durchführen
- Mit einer Allowlist nur interne und erforderliche externe URLs zulassen
- Nicht zulässige Links als Text beibehalten
- Fehlerhaftes Markdown und gefährliche URLs testen

Je stärker KI in die Nutzerführung einer Website eingebunden wird, desto wichtiger ist es, wie Antworttexte dargestellt werden. Komfortable Markdown-Unterstützung und sichere Linkkontrolle sollten gemeinsam in derselben Implementierung behandelt werden.
