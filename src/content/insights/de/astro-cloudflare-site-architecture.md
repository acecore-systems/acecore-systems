---
title: "Eine Astro + Cloudflare Website Schritt für Schritt erweitern"
description: "Wie wir Astro und Cloudflare Pages mit AI-Kontaktchat, Sveltia CMS, mehrsprachigem Blog, Service-CTA, sicherem Markdown-Rendering und Kommentaren ohne externen Dienst kombiniert haben."
date: 2026-06-07T19:00
lastUpdated: "2026-10-09T15:00:00+09:00"
author: gui
tags: ["Technologie", "Astro", "Cloudflare", "Website", "AI", "CMS"]
image: "/images/insights/covers/astro-cloudflare-site-architecture-cover-v2.webp"
callout:
  type: tip
  title: Grenzen festlegen, bevor Funktionen hinzukommen
  text: "AI-Chat, CMS, Lokalisierung und Kommentare sind nützlich, brauchen aber klare Grenzen auf derselben Website. Astro erzeugt statisches HTML, Cloudflare liefert aus und verarbeitet kleine APIs, GitHub hält Änderungen überprüfbar."
processFigure:
  eyebrow: Site Architecture
  title: Schichten für wachsende Website-Funktionen
  description: Standardmäßig statisch bleiben und Dynamik nur dort ergänzen, wo sie nötig ist.
  variant: inline
  steps:
    - title: Ausliefern
      description: HTML mit Astro generieren und über Cloudflare Pages ausliefern.
      icon: i-lucide-rocket
      accent: brand
    - title: Bearbeiten
      description: Japanische Quellen in Sveltia CMS bearbeiten und über PRs prüfen.
      icon: i-lucide-file-pen-line
      accent: emerald
    - title: Übersetzen
      description: Übersetzungen in PRs auslagern, statt alle Sprachen im CMS zu pflegen.
      icon: i-lucide-languages
      accent: amber
    - title: Leiten
      description: AI-Chat und Service-CTAs führen Besucher zum passenden Formular.
      icon: i-lucide-route
      accent: slate
compareTable:
  title: Unterschied zwischen einzeln hinzugefügten Funktionen und einer ganzheitlichen Architektur
  before:
    label: Funktionen einzeln hinzufügen
    items:
      - "KI, CMS, Kommentare und Formulare folgen jeweils unterschiedlichen Designprinzipien"
      - "Skripte und Verwaltungsoberflächen externer Dienste nehmen zu und verteilen die Erklärungsverantwortung"
      - "Mehrsprachige URLs, Suchindex und Vorschauumgebung weichen leicht voneinander ab"
      - "Die Beziehung zwischen den Funktionen bleibt unsichtbar und die Einführungsreihenfolge ist schwer festzulegen"
  after:
    label: Nach Schichten hinzufügen
    items:
      - "Die Rollen von Astro, Cloudflare, GitHub und OpenAI API lassen sich getrennt erklären"
      - "Dynamische APIs werden in Pages Functions gebündelt und Speicher mit D1 näher an Cloudflare gebracht"
      - "CMS-Aktualisierungen, Übersetzungen, Suche, RSS und Sitemap verwenden dieselbe Inhaltsstruktur"
      - "Die Seite lässt sich als Index nach Zweck und Einführungsreihenfolge lesen"
checklist:
  title: Designprüfung für die Übertragung auf andere Websites
  items:
    - text: "Statisch generierbare Inhalte von API-pflichtigen Funktionen trennen"
      checked: true
    - text: "CMS als Bearbeitungseinstieg, Übersetzung als PR und Veröffentlichungsentscheidung als Build trennen"
      checked: true
    - text: "Keine personenbezogenen Daten an die Anfrage-KI senden und nur mit veröffentlichten Informationen führen lassen"
      checked: true
    - text: "Formularkontext über URL-Parameter übergeben und empfangene Werte als stabile Kategorien führen"
      checked: true
    - text: "Für Einsendedaten wie Kommentare den physischen D1-Namen und das Binding in der Konfiguration festlegen"
      checked: true
    - text: "KI-Ausgaben und Nutzereingaben nicht als vertrauenswürdiges HTML behandeln, sondern Allowlisten verwenden"
      checked: true
faq:
  title: Häufig gestellte Fragen
  items:
    - question: Wo sollte man mit der Einführung beginnen?
      answer: "Festigen Sie zuerst die statischen Astro-Seiten, den Blog, RSS, Sitemap und OGP. Fügen Sie danach CMS und Mehrsprachigkeit hinzu; erst wenn ein Anfrageweg nötig wird, folgen KI-Chat, Service-CTAs und Kommentare."
    - question: Sollte alles ausschließlich mit Cloudflare gebaut werden?
      answer: "Nein. Teile wie die Anfrage-KI verwenden auch die OpenAI API. Entscheidend ist, Auslieferung, API-Grenze, Datenbank und Bot-Schutz bei Cloudflare zu bündeln und bewusst zu trennen, wo externe Dienste eingesetzt werden."
    - question: Braucht eine kleine Website all das?
      answer: "Nicht alles ist von Anfang an nötig. Wenn jedoch CMS, Anfragewege, Mehrsprachigkeit oder Kommentare geplant sind, erleichtert eine frühe Entscheidung über URLs, Speicherort, Vorschauumgebung und Suchindex die spätere Arbeit."
linkCards:
  - href: /de/blog/astro-ai-contact-chat/
    title: Technisches Design für den AI-Kontaktchat
    description: API-Grenzen und Antwortkontrolle mit Informationen aus der Website.
    icon: i-lucide-bot
  - href: /de/blog/cms-selection-and-turnstile/
    title: Sveltia CMS Setup Guide
    description: CMS, GitHub backend, OAuth und PR-basierter Betrieb für statische Websites.
    icon: i-lucide-badge-check
  - href: /de/blog/copilot-translation-pipeline/
    title: Mehrsprachigen Blog mit Sveltia CMS betreiben
    description: Lokalisierte statische Seiten statt reiner UI-Übersetzung veröffentlichen.
    icon: i-lucide-languages
  - href: /blog/service-cta-contact-prefill/
    title: Service-CTA-Kontext an das Formular übergeben
    description: Den gelesenen Service in Kategorie und Betreff des Formulars übernehmen.
    icon: i-lucide-route
  - href: /de/blog/ai-chat-markdown-link-safety/
    title: Sichere Markdown-Links im AI-Chat rendern
    description: Nur erlaubte Links rendern und AI-Ausgabe nicht als vertrauenswürdiges HTML behandeln.
    icon: i-lucide-shield-check
  - href: /de/blog/cloudflare-only-blog-comments/
    title: Blog-Kommentare nur mit Cloudflare
    description: Kommentare ohne externen Dienst, mit Pages Functions, D1 und Turnstile.
    icon: i-lucide-message-square-text
---

Unterscheiden Sie vor CMS- oder Sucherweiterungen Redakteure, öffentliche Daten und nutzerabhängige Verarbeitung. Beginnen Sie mit statischen Artikeln und Functions für Eingaben oder externe APIs. Prüfen Sie nur erforderliche Verbindungen in [Cloudflare Pages: Bindings](https://developers.cloudflare.com/pages/functions/bindings/), um den Umfang zu begrenzen.

**Ergänzung vom 26. September 2026:** Dieser Beitrag dokumentiert die Architektur vom Juni 2026. Im späteren Quellcode werden CMS-Änderungen nach Prüfung von Berechtigungen, Inhalt und HEAD über eine GitHub App direkt in `main` gespeichert. Übersetzungen laufen über OpenAI Batch und Übersetzungs-PRs; die Kontakt-KI nutzt einen gemeinsamen Worker über ein Service Binding. Aussagen unten zu Copilot-Übersetzungen, CMS-Speicherung per PR und direkten KI-API-Aufrufen beschreiben den damaligen Stand. Einzelheiten stehen im [CMS-Leitfaden](/de/blog/cms-selection-and-turnstile/), [Übersetzungsleitfaden](/de/blog/copilot-translation-pipeline/) und [KI-Leitfaden](/de/blog/astro-ai-contact-chat/).

Wer mit Astro und Cloudflare Pages startet, braucht oft zuerst nur schnelle und sichere statische Seiten.

Mit der Zeit kommen neue Anforderungen hinzu: Bearbeitung im Browser, lokalisierte Seiten, Führung per AI-Chat, Formular-Kontext aus Service-Seiten und Kommentare.

Dieser Artikel ist ein Implementierungsindex: Er hilft zu entscheiden, in welche Schicht eine Funktion gehört, in welcher Reihenfolge sie ergänzt wird und welcher Detailartikel als Nächstes passt. Das Beispiel stammt von der Acecore-Website, das Muster lässt sich aber auf andere Astro + Cloudflare-Websites übertragen.

## Kurzfassung

Die Architektur trennt Zuständigkeiten:

| Schicht     | Zuständigkeit                            |
| ----------- | ---------------------------------------- |
| Astro       | Seiten, Blog, OGP, RSS, Sitemap und UI   |
| Cloudflare  | Pages, Pages Functions, D1 und Turnstile |
| GitHub      | PRs, CMS-Diffs, Übersetzungen, Historie  |
| Sveltia CMS | Japanische Quelle, Autoren, Tags, Bilder |
| OpenAI API  | Antworten des Kontaktchats               |
| Pagefind    | Suchindex für geprüftes statisches HTML  |

Was statisch sein kann, bleibt statisch. Dynamik wird als kleine API ergänzt.

## Kleine APIs auf Cloudflare

AI-Chat und Kommentare folgen demselben Muster.

Astro rendert die UI. Pages Functions bilden die API-Grenze. Secrets, D1 bindings, Turnstile, Origin checks und rate limits bleiben serverseitig.

## CMS als Bearbeitungsoberfläche

Sveltia CMS ist keine Runtime-Datenbank. Es erzeugt Git-Änderungen.

Japanische Inhalte, Autoren, Tags, Bilder und JSON-Texte laufen durch PR, Build und Review.

## Übersetzung als statischer Inhalt

Lokalisierung ist keine reine Browser-Übersetzung.

Jede Sprache hat eigene URLs, title, description, OGP, JSON-LD, RSS, sitemap und hreflang.

## Kontaktwege haben verschiedene Rollen

Der AI-Chat hilft bei der Auswahl. Service-CTAs behalten Kontext. Das Formular erfasst die formelle Anfrage.

## AI-Ausgabe ist kein vertrauenswürdiges HTML

Markdown-Links aus der AI werden erst validiert.

Nur Links auf der Allowlist werden als DOM-Elemente gerendert.

## Kommentare bleiben in Cloudflare

Die Kommentare nutzen kein externes Widget.

Pages Functions verarbeiten GET/POST, D1 speichert Kommentare und Turnstile schützt Einreichungen.

<figure class="article-diagram" data-layout="boundary" data-tone="teal" data-count="3" aria-labelledby="diagram-astro-cloudflare-site-architecture">
  <figcaption>
    <strong id="diagram-astro-cloudflare-site-architecture">Veröffentlichungsgrenzen für Inhalte, Beiträge und Administration</strong>
    <span>Geprüfte statische Inhalte sind durchsuchbar; Beiträge und Administration folgen anderen Grenzen. Preview und Produktion werden getrennt geprüft.</span>
  </figcaption>
  <ol class="article-diagram__nodes">
    <li>
      <span class="article-diagram__symbol">
        <span aria-hidden="true">1</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
          <path d="M6 3h9l4 4v14H6z M15 3v5h4 M9 12h7 M9 16h7"/>
        </svg>
      </span>
      <strong>Geprüfter statischer Inhalt</strong>
      <span>Geprüfte Artikel als statisches HTML veröffentlichen und in den Pagefind-Index aufnehmen.</span>
    </li>
    <li>
      <span class="article-diagram__symbol">
        <span aria-hidden="true">2</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
          <path d="M4 5h16v12H9l-5 4z M8 9h8 M8 13h5"/>
        </svg>
      </span>
      <strong>Beiträge von Besuchern</strong>
      <span>Kommentare laufen über eine dynamische API und Speicherung; Formulareingaben bleiben aus der statischen Suche heraus. Eine Indexierung erfordert Moderation und Neuerstellung.</span>
    </li>
    <li>
      <span class="article-diagram__symbol">
        <span aria-hidden="true">3</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
          <path d="M12 2l8 4v6c0 5-3 8.5-8 10-5-1.5-8-5-8-10V6z M9 12h6"/>
        </svg>
      </span>
      <strong>Administration und Umgebungen</strong>
      <span>Admin-Bereiche bleiben außerhalb der öffentlichen Suche. Preview und Produktion getrennt prüfen; Konfiguration allein belegt keinen Betrieb.</span>
    </li>
  </ol>
</figure>

## Nach Ziel lesen

Man muss nicht zuerst alles lesen. Starten Sie mit der Funktion, die Sie ergänzen möchten.

| Ziel                                             | Zuerst lesen                                                                                |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------- |
| Artikel und Bilder im Browser bearbeiten         | [Sveltia CMS Setup Guide](/de/blog/cms-selection-and-turnstile/)                            |
| Mehrsprachige Seiten indexierbar veröffentlichen | [Mehrsprachigen Blog mit Sveltia CMS betreiben](/de/blog/copilot-translation-pipeline/)     |
| Besucher per AI-Chat führen                      | [Technisches Design für den AI-Kontaktchat](/de/blog/astro-ai-contact-chat/)                |
| Sichere Links in AI-Antworten rendern            | [Sichere Markdown-Links in AI-Antworten rendern](/de/blog/ai-chat-markdown-link-safety/)    |
| Service-Kontext an das Formular übergeben        | [Service-CTA-Kontext an das Formular übergeben](/blog/service-cta-contact-prefill/)         |
| Kommentare ohne externen Dienst ergänzen         | [Astro-Blogkommentare nur mit Cloudflare umsetzen](/de/blog/cloudflare-only-blog-comments/) |

## Implementierungsreihenfolge

Für eine ähnliche Website ist diese Reihenfolge praktikabel:

1. Statische Seiten, Blog, RSS, Sitemap und OGP mit Astro stabilisieren.
2. Sveltia CMS für die japanische Quelle ergänzen.
3. Lokalisierte Seiten als statisches HTML generieren.
4. AI-Chat-Führung und Service-CTAs ergänzen.
5. Markdown-Links, Formular-Prefill, Origin checks und rate limits absichern.
6. Kommentare erst dann innerhalb von Cloudflare ergänzen, wenn sie wirklich gebraucht werden.

## Fazit

Astro + Cloudflare kann eine Unternehmenswebsite erweitern, ohne die Vorteile statischer Auslieferung aufzugeben.

Nutzen Sie diese Seite als Einstieg und ergänzen Sie nur die Teile, die Ihre Website wirklich braucht, ohne die statische Grundlage zu schwächen.

## Ergänzung: Worker-Umgebungen und Build-Konfiguration trennen

Ergänzt am 30. September 2026. Wir verallgemeinern Konfigurationsverbesserungen ohne Dienstnamen oder interne Einstellungen. Ordnen Sie bei mehreren Workers je Wrangler-Konfiguration das Quellverzeichnis sowie Build- und Deployment-Ziel zu. Getrennte Dateien beweisen keine Isolation.

Prüfen Sie Variablen, Secrets sowie D1-, R2- und Service-Binding-Ziele für Produktion und Tests. Bindings und Variablen von Worker-Umgebungen werden nicht automatisch geerbt: deklarieren Sie sie je Umgebung. Fehlende Pflichtkonfiguration sollte die Verarbeitung stoppen, statt unbemerkt Produktionsressourcen zu verwenden. Dauerhaftes Staging und branch- oder PR-bezogene Previews sind unterschiedliche Abläufe.

Legen Sie einen Produktionspfad mit vorgeschalteten Prüfungen fest. Builds oder Versions-Uploads außerhalb der Produktion dienen der Validierung; ihr Erfolg allein stellt keine Produktionsfreigabe dar. Prüfen Sie bei Git-Builds Branch, Commit, Quellverzeichnis, gewählte Konfiguration, Umgebung und Deployment-Befehl. Eine erfolgreiche Pages-Veröffentlichung beweist kein separates Worker-Deployment. Prüfen Sie CI, Produktions-Build, aktive Versionen und Bindings sowie das Domain-Verhalten getrennt. Diese Anpassungsprüfungen belegen nicht die Isolation aller Dienste.

Siehe [Worker-Umgebungen](https://developers.cloudflare.com/workers/wrangler/environments/), [Builds für mehrere Workers](https://developers.cloudflare.com/workers/ci-cd/builds/advanced-setups/) und [Build-Konfiguration](https://developers.cloudflare.com/workers/ci-cd/builds/configuration/). Unterscheiden Sie die [Pages-Functions-Konfiguration](https://developers.cloudflare.com/pages/functions/wrangler-configuration/).

## Ergänzung: Feed-Wiederholungen begrenzen und Fehler je Quelle isolieren

Ergänzt am 30. September 2026. Öffentliche Feeds wie RSS einzulesen unterscheidet sich von der RSS-Ausgabe. Begrenzen Sie Wartezeit und Wiederholungen, damit vorübergehende Fehler einen Job nicht unbegrenzt laufen lassen.

Behandeln Sie Quellen getrennt. Ein fehlgeschlagener Abruf sollte unabhängig aktualisierbare Eingaben nicht stoppen. Melden Sie Teilerfolg nicht als Gesamterfolg: halten Sie Ergebnisse je Quelle und verbleibende Fehler im Bericht fest. Prüfen Sie Abruf, erzeugte Daten, Produktions-Builds und öffentliche Seiten getrennt. Dies sind allgemeine Prüfungen, kein Nachweis aller Fehlerfälle oder künftiger Integrationen.

## Ergänzung vom 6. Oktober 2026: API-Vertrag und Prüfumfang für Anhänge

In einer anonymisierten Änderung wurde ein Ablauf korrigiert, bei dem eine Abweichung zwischen den Session- und Limit-Verträgen von Frontend und Backend die Antwort in einen 503-Fehler verwandelte, obwohl der Vorgang bereits erfolgreich war. HTTP-Ergebnis, gespeicherter Zustand und Anzeige in der Oberfläche werden getrennt abgeglichen; Wiederholungen des Clients werden so behandelt, dass kein doppelter Schreibvorgang entsteht.

Ein angezeigtes Anhangsfeld bedeutet außerdem nicht, dass Übertragung, Speicherung und erneuter Abruf einer echten Datei geprüft wurden. Eine Änderung an Oberfläche oder API allein schließt diese Prüfung nicht ab. Die Grenzen zwischen einer statischen öffentlichen Website und einer privaten Administrationsoberfläche beschreibt [Authentifizierung und Aggregation des privaten Dashboards](/insights/private-dashboard-access-and-aggregation/); der Abgleich externer Zahlungszustände wird unter [Webhook-Statusverwaltung](/insights/cloudflare-payment-event-boundaries/) behandelt.
