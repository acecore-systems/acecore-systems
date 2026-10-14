---
title: "Mehrsprachige Blogs mit Sveltia CMS betreiben"
description: "Acht statische Übersetzungen aus japanischer Quelle: Schutz von Zahlen, URLs und Code in OpenAI Batch, vollständige Prüfung vor dem Schreiben, PR, CI und GitHub-Veröffentlichung."
date: 2026-06-07T17:00
lastUpdated: "2026-10-15T00:00:00+09:00"
author: gui
tags: ["Technologie", "GitHub Copilot", "i18n", "CMS", "SEO"]
image: "/images/insights/covers/copilot-translation-pipeline-cover-v2.webp"
callout:
  type: tip
  title: UI-Übersetzung ist keine mehrsprachige Veröffentlichung
  text: "Browser-Übersetzung oder Widgets helfen beim Lesen, erzeugen aber keine sprachspezifischen URLs, Title, Description, internen Links, RSS, Sitemap oder hreflang. Für Suchmaschinen sollten übersetzte statische HTML-Seiten veröffentlicht werden."
processFigure:
  eyebrow: Translation Workflow
  title: "Von japanischer Quelle zur geprüften Übersetzungs-PR"
  description: "Zahlen, URLs und Code wiederherstellen; alles vor dem Schreiben prüfen."
  variant: inline
  steps:
    - title: "Japanisch bearbeiten"
      description: "Aktuelles main nutzen und Änderungen bündeln."
      icon: i-lucide-file-pen-line
      accent: brand
    - title: "Schützen und Batch einreichen"
      description: "Zahlen, URLs, Platzhalter und Code tokenisieren."
      icon: i-lucide-shield-check
      accent: amber
    - title: "Alles prüfen, dann schreiben"
      description: "sourceHash, Tokens und Inhalt prüfen; Fehler protokollieren und stoppen."
      icon: i-lucide-languages
      accent: emerald
    - title: "PR, CI und Veröffentlichung"
      description: "Über GitHub veröffentlichen und Inhalt prüfen."
      icon: i-lucide-check-check
      accent: slate
compareTable:
  title: Unterschied zwischen UI-Übersetzung und der Erzeugung sprachspezifischer Seiten
  before:
    label: UI-Übersetzung
    items:
      - "Browser oder Übersetzungs-Widget des Nutzers übersetzen bei der Anzeige"
      - "URL, title, description und OGP bleiben leicht in der Ausgangssprache"
      - "Sprachspezifische Seiten lassen sich nur schwer in Sitemap, RSS und hreflang ausgeben"
      - "Text in geteilten URLs und Suchergebnissen orientiert sich an der Ausgangssprache"
  after:
    label: Statische mehrsprachige Seiten
    items:
      - "Sprachspezifische URLs wie `/{locale}/blog/{slug}/` können veröffentlicht werden"
      - "title, description, Inhalt, FAQ und strukturierte Daten können pro Sprache vorliegen"
      - "hreflang teilt Suchmaschinen die Beziehung zwischen Sprachversionen mit"
      - "RSS, Sitemap, interne Links und Search Console können pro Sprache geprüft werden"
checklist:
  title: Entscheidungen bei der Einführung
  items:
    - text: "Den japanischen Artikel als Übersetzungsquelle behandeln"
      checked: true
    - text: "Den Slug der Übersetzungsdateien mit dem japanischen Artikel abgleichen"
      checked: true
    - text: "Übersetzung durch japanische Quelländerungen auf main starten"
      checked: true
    - text: "URLs, Bild-Paths, Codeblöcke und Tag-IDs bei der Übersetzung nicht verändern"
      checked: true
    - text: "Die Ausgabe von hreflang, canonical, RSS und Sitemap im Build prüfen"
      checked: true
linkCards:
  - href: /de/blog/cms-selection-and-turnstile/
    title: Sveltia CMS Einrichtungsleitfaden
    description: Sveltia CMS in einer statischen Astro-Website einrichten.
    icon: i-lucide-badge-check
  - href: /de/blog/astro-i18n-blog-translation/
    title: Mehrsprachige Astro-Architektur
    description: Routen, Fallback, hreflang, RSS und Sitemap für 9 Sprachen.
    icon: i-lucide-globe-2
faq:
  title: FAQ
  items:
    - question: Reicht UI-Übersetzung?
      answer: "Zum Lesen kann sie reichen. Für SEO, RSS, Sitemap und interne Links pro Sprache braucht man echte lokalisierte Seiten."
    - question: Ist KI-Übersetzung schlecht für SEO?
      answer: "Nicht die KI ist das Problem, sondern viele wertlose Seiten ohne Prüfung. Terminologie, Fakten, Links und Natürlichkeit müssen geprüft werden."
    - question: Sind übersetzte Seiten Duplicate Content?
      answer: "Google betrachtet lokalisierte Seiten nur dann als Duplikate, wenn der Hauptinhalt nicht übersetzt ist. Varianten sollten mit hreflang verbunden werden."
---

Erzeugen Sie zu Beginn eines mehrsprachigen Blog-Ablaufs lokales HTML eines repräsentativen Artikels und prüfen Sie Text, title, description und interne Links. Verknüpfen Sie nach [Google: Localized Versions](https://developers.google.com/search/docs/specialty/international/localized-versions) nur vorhandene Sprachversionen. Nehmen Sie Übersetzungsdienst und fertige öffentliche Seiten getrennt ab.

> **Geprüft am 14. Oktober 2026:** Aktuelle Übersetzungen nutzen OpenAI Batch. Die folgenden Copilot-Schritte bleiben der Einführungsbericht vom Juni 2026. Aktuelle Diagramme und Abläufe schützen die Quelle und prüfen alle Ergebnisse vor dem Schreiben.

## Aktueller Ablauf: Schutz, Prüfung und PR

Bei Systems warten japanische Artikel- oder UI-Änderungen auf main 15 Minuten, bevor der [Einreichungsworkflow](https://github.com/acecore-systems/acecore-systems/blob/main/.github/workflows/submit-openai-translation-batch.yml) aktuelles main nutzt. Die [Abholung](https://github.com/acecore-systems/acecore-systems/blob/main/.github/workflows/collect-openai-translation-batch.yml) ist zu Minute 2, 17, 32 und 47 geplant, prüft sourceHash und erstellt eine PR. Der [Merge-Workflow](https://github.com/acecore-systems/acecore-systems/blob/main/.github/workflows/merge-openai-translation-pr.yml) leitet geeignete PRs über CI und bestehende GitHub-Veröffentlichung weiter. Planzeit, Batch-Abschluss, Merge und Veröffentlichung sind getrennte Zustände.

Vor dem Senden werden Zahlen, URLs, vorhandene Platzhalter, inline code und fenced code durch eindeutige Tokens ersetzt. Bei Abholung wird aus passender japanischer Quelle wiederhergestellt; fehlende, doppelte, geänderte oder zusätzliche Tokens werden abgewiesen. Der Schutz verhindert Modelländerungen dieser Details, während Prüfung nach Wiederherstellung und Inhaltsreview bestehen bleiben.

Laut [OpenAI-Batch-Dokumentation](https://developers.openai.com/api/docs/guides/batch) kann die Ergebnisreihenfolge abweichen; `custom_id` ordnet Sprache, source path und sourceHash zu. Die [Schutz- und Abholänderung](https://github.com/acecore-systems/acecore-systems/pull/131) prüft alle Ergebnisse vor Schreibbeginn. Ein später ungültiges, doppeltes oder veraltetes Ergebnis lässt keine früheren Übersetzungen teilweise angewandt zurück. Ein Artifact enthält Sprache, source path, Batch ID und Ursache. Das garantiert keine Dateisystemtransaktion gegen Datenträgerfehler während des Schreibens.

Geprüft wurden 27 Tests und ein Offline-Schutz/Wiederherstellungsrundlauf für 55 japanische Quellen × 8 Locales, also 440 Ergebnisse. Es war keine neue Komplettübersetzung per Modell-API. Bestehende Übersetzungen werden mit Japanisch in derselben PR geändert, dann folgt der Hash der formatierten Quelle; niemals nur der Hash.

<figure class="article-diagram" data-layout="flow" data-tone="green" data-count="3" aria-labelledby="diagram-copilot-translation-pipeline">
  <figcaption>
    <strong id="diagram-copilot-translation-pipeline">Geschützte Quelle und alle Ergebnisse abgleichen</strong>
    <span>Prüffehler dürfen nicht nur einige Sprachen ändern. Batch-Abschluss ist keine Veröffentlichung.</span>
  </figcaption>
  <ol class="article-diagram__nodes">
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">1</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M5 3h10l4 4v14H5z"/><path d="M15 3v5h5M8 12h8M8 16h6"/></svg></span>
      <strong>Quelle schützen</strong>
      <span>Eindeutige Tokens für Zahlen, URLs und Code.</span>
    </li>
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">2</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5M8 10l2 2 3-4"/></svg></span>
      <strong>Aktuelle Quelle und Ergebnisse prüfen</strong>
      <span>custom_id, sourceHash und Tokens abgleichen und wiederherstellen.</span>
    </li>
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">3</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/></svg></span>
      <strong>PR im Veröffentlichungspfad</strong>
      <span>Nach Prüfung schreiben, dann CI und Review.</span>
    </li>
  </ol>
</figure>

## Einführung im Juni 2026

Acecore bearbeitet Inhalte hauptsächlich auf Japanisch, veröffentlicht den Blog aber in 9 Sprachen. Entscheidend ist: **Text in der Oberfläche übersetzen** und **lokalisierte Seiten veröffentlichen** sind verschiedene Dinge.

Browser-Übersetzung hilft Nutzern beim Lesen. Sie erzeugt aber keine `/de/blog/.../` URL, keine lokalisierten Metadaten, kein RSS, keine Sitemap und kein hreflang.

Wenn mehrsprachiger Content auch Suchtraffic bringen soll, muss Übersetzung Teil des Veröffentlichungsprozesses sein.

## Struktur

- Japanische Quelle: `src/content/blog/{slug}.md`
- Übersetzungen: `src/content/blog/{locale}/{slug}.md`
- URLs: `/blog/{slug}/`, `/en/blog/{slug}/`, `/de/blog/{slug}/`
- Bearbeitung: Sveltia CMS
- Übersetzung: GitHub-Copilot-PRs
- Veröffentlichung: Build und Review

Sveltia CMS ist die Oberfläche für die japanische Quelle. Übersetzungen laufen über Pull Requests, damit Review, Historie und CI erhalten bleiben.

## Wann UI-Übersetzung reicht

Sie eignet sich für interne Lektüre, einmalige Recherche, Admin-Seiten oder Inhalte ohne Suchstrategie.

Das ist leichtgewichtig, erzeugt aber keine indexierbaren Sprachseiten.

## SEO-Vorteile statischer Sprachseiten

Suchmaschinen, Social Previews und RSS-Reader arbeiten mit URLs und HTML.

Wenn nur die japanische Seite existiert, bleiben `title`, `description`, strukturierte Daten, RSS und Sitemap japanisch, auch wenn der Browser dem Nutzer eine Übersetzung zeigt.

Mit statischen Übersetzungen erhält jede Sprache eine URL.

```txt
/blog/copilot-translation-pipeline/
/en/blog/copilot-translation-pipeline/
/de/blog/copilot-translation-pipeline/
/fr/blog/copilot-translation-pipeline/
```

### 1. Jede Sprache ist direkt crawlbar

Google kann JavaScript verarbeiten, dokumentiert aber auch Einschränkungen und empfiehlt statisches oder serverseitiges Rendering als stabilere Lösung. Andere Crawler und RSS-Reader sind oft weniger leistungsfähig.

### 2. Metadaten sind lokalisiert

Frontmatter kann pro Sprache übersetzt werden:

```yaml
title: "Mehrsprachige Blogs mit Sveltia CMS betreiben"
description: "Workflow für Übersetzungs-PRs mit Sveltia CMS und GitHub Copilot."
```

Das wirkt auf Suchergebnisse, OGP, Related Cards und RSS.

### 3. hreflang verbindet Varianten

Google empfiehlt `hreflang`, wenn verschiedene URLs verschiedene Sprachen oder Regionen bedienen. Ohne lokalisierte URL gibt es nichts zu verbinden.

### 4. RSS und Sitemap werden mehrsprachig

Mit Übersetzungsdateien kann die Website `/de/rss.xml` und lokalisierte Sitemap-URLs ausgeben.

## Rolle von Sveltia CMS

Sveltia CMS übersetzt nicht. Es hält die Bearbeitung der japanischen Quelle schlank:

- japanische Artikel
- Autoren
- Tags
- japanische Source-JSON
- Bilder
- Frontmatter wie date, FAQ und linkCards

Die CMS-Einrichtung steht im [Sveltia CMS Einrichtungsleitfaden](/de/blog/cms-selection-and-turnstile/).

## Regeln für Copilot

Der Übersetzungs-PR muss klar trennen, was erhalten bleibt und was lokalisiert wird.

```md
Keep:

- slug
- image path
- author id
- tag ids
- external URLs
- code blocks

Localize:

- title
- description
- FAQ
- body text
- internal blog URLs when locale-specific URLs exist
```

## Lehren aus den PRs

- Alte Artikel nannten noch Pages CMS, obwohl die Implementierung Sveltia CMS nutzt.
- Bleibt `date` alt, erscheint ein neu geschriebener Artikel nicht oben im Blog.
- Slugs müssen über Sprachen hinweg stabil bleiben.
- Interne Links sollten zur Locale des Lesers führen.
- KI-Übersetzung spart Zeit, braucht aber Review.

## Quellen

- [Google Search Central: Localized Versions of your Pages](https://developers.google.com/search/docs/advanced/crawling/localized-versions?hl=en&rd=1&visit_id=638856769088389068-716743185)
- [Google Search Central: Managing Multi-Regional and Multilingual Sites](https://developers.google.com/search/docs/advanced/crawling/managing-multi-regional-sites)
- [Google Search Central: JavaScript SEO Basics](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics)
- [Google Search Central: Spam Policies](https://developers.google.com/search/docs/essentials/spam-policies)
- [Sveltia CMS Einrichtungsleitfaden](/de/blog/cms-selection-and-turnstile/)

## Fazit

UI-Übersetzung hilft beim Lesen. Lokalisierte statische Seiten machen jede Sprache zu echtem Website-Content.

Sveltia CMS bearbeitet Japanisch, GitHub Copilot erstellt Übersetzungs-PRs, und Astro build prüft das Ergebnis vor der Veröffentlichung.
