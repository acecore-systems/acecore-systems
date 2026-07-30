---
title: "Eine Astro + Cloudflare Website Schritt für Schritt erweitern"
description: "Wie wir Astro und Cloudflare Pages mit AI-Kontaktchat, Sveltia CMS, mehrsprachigem Blog, Service-CTA, sicherem Markdown-Rendering und Kommentaren ohne externen Dienst kombiniert haben."
date: 2026-06-07T19:00
author: gui
tags: ["Technologie", "Astro", "Cloudflare", "Website", "AI", "CMS"]
image: /uploads/acecore-generated/work-acecore-net-website.webp
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
