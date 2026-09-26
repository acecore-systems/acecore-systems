---
title: "SEO-Verbesserungsleitfaden: Strukturierte Daten und OGP auf Ihrer Astro-Website implementieren"
description: "Eine Schritt-für-Schritt-Anleitung zur korrekten Implementierung von JSON-LD-strukturierten Daten, OGP, Sitemaps und RSS auf einer Astro + Cloudflare Pages-Website. Behandelt alles von der Unterstützung für Google Rich Results bis zur RSS-Feed-Optimierung mit praktischen SEO-Verbesserungen."
date: 2026-03-25T11:00
author: gui
tags: ["Technologie", "Astro", "SEO"]
lastUpdated: "2026-09-26T19:21:24+09:00"
image: /uploads/acecore-generated/blog-astro-seo-and-structured-data.webp
callout:
  type: tip
  title: Für wen dieser Artikel gedacht ist
  text: "Für alle, die die SEO ihrer Astro-Website systematisch verbessern möchten. Behandelt die Typen und Implementierungsmuster von strukturierten Daten, OGP-Konfiguration, Sitemap-Optimierung und mehr – alles mit praktischen, sofort anwendbaren Schritten."
processFigure:
  title: SEO-Verbesserungs-Workflow
  steps:
    - title: Meta-Tags
      description: Title, Description, Canonical und OGP auf jeder Seite setzen.
      icon: i-lucide-file-text
    - title: Strukturierte Daten
      description: Die Seitenbedeutung für Google mit JSON-LD vermitteln.
      icon: i-lucide-braces
    - title: Sitemap
      description: "Kanonische URLs aufnehmen und Daten wesentlicher Änderungen prüfen."
      icon: i-lucide-map
    - title: RSS
      description: Hochwertige Feeds mit Autor- und Kategorieinformationen bereitstellen.
      icon: i-lucide-rss
insightGrid:
  title: Implementierte strukturierte Daten
  items:
    - title: Organization
      description: Firmenname, URL, Logo und Kontaktinformationen in den Suchergebnissen anzeigen.
      icon: i-lucide-building
    - title: BlogPosting
      description: Rich Results für Artikel mit Autor, Veröffentlichungsdatum, Aktualisierungsdatum und Bildern aktivieren.
      icon: i-lucide-pen-line
    - title: BreadcrumbList
      description: Die hierarchische Struktur aller Seiten als Breadcrumb-Listen ausgeben.
      icon: i-lucide-chevrons-right
    - title: FAQPage
      description: "FAQ-Inhalte maschinenlesbar machen; Google zeigt FAQ-Rich-Results für allgemeine Seiten kaum an."
      icon: i-lucide-help-circle
    - title: WebPage / ContactPage
      description: Dedizierte Typen für die Startseite und Kontaktseite zuweisen.
      icon: i-lucide-layout
    - title: SearchAction
      description: "Google stellte das Suchfeld 2024 ein; bieten Sie die Suche auf Ihrer Website an."
      icon: i-lucide-search
faq:
  title: Häufig gestellte Fragen
  items:
    - question: Ändern sich die Suchergebnisse sofort nach dem Hinzufügen von strukturierten Daten?
      answer: 'Nein. Es dauert Tage bis Wochen, bis Google crawlt und neu indexiert. Sie können den Reflexionsstatus im Bericht „Rich-Ergebnisse" in der Google Search Console überprüfen.'
    - question: Welche OGP-Bildgröße wird empfohlen?
      answer: "1200×630px wird empfohlen. Dieses Verhältnis ist optimal für X (Twitter) bei Verwendung von summary_large_image."
    - question: Beeinflusst die Sitemap-Priorität die SEO?
      answer: "Google ignoriert `priority` und `changefreq`; erfundene Werte bringen keinen SEO-Vorteil."
---

> Aktualisierung vom September 2026: Google hat das Sitelinks-Suchfeld im November 2024 eingestellt. FAQ-Rich-Results sind im Allgemeinen auf anerkannte Behörden- und Gesundheitsseiten beschränkt; `changefreq` und `priority` in Sitemaps ignoriert Google. Lesen Sie diesen Implementierungsbericht vom März 2026 zusammen mit den Änderungen zu [Suchfeld](https://developers.google.com/search/blog/2024/10/sitelinks-search-box), [FAQ](https://developers.google.com/search/blog/2023/08/howto-faq-changes) und den [Sitemap-Hinweisen](https://developers.google.com/search/blog/2023/06/sitemaps-lastmod-ping).

## Einführung

Wenn Menschen an SEO denken, stellen sie sich vielleicht „Keyword-Stuffing" vor, aber modernes SEO bedeutet grundsätzlich, **die Struktur und den Inhalt Ihrer Website akkurat an Suchmaschinen zu vermitteln**.

Dieser Artikel erklärt SEO-Maßnahmen, die auf einer Astro-Website implementiert werden sollten, unterteilt in vier Kategorien. Jede einzelne bietet nach der Einrichtung langfristigen Nutzen.

---

## OGP und Meta-Tags einrichten

OGP und Meta-Tags steuern die Darstellung beim Teilen in sozialen Medien und die Informationsübermittlung an Suchmaschinen.

### Grundlegende Meta-Tags

Geben Sie in Ihrer Astro-Layout-Komponente Folgendes für jede Seite aus:

- `og:title` / `og:description` / `og:image` — Titel, Beschreibung und Bild beim Teilen in sozialen Medien
- `twitter:card` = `summary_large_image` — Große Bildkarte auf X (Twitter) anzeigen
- `rel="canonical"` — Die kanonische URL für Duplikatseiten angeben
- `rel="prev"` / `rel="next"` — Paginierungsbeziehungen anzeigen

### Meta-Tags für Blog-Beiträge

Setzen Sie auf Artikelseiten folgende zusätzliche Tags:

- `article:published_time` / `article:modified_time` — Veröffentlichungs- und Aktualisierungsdatum
- `article:tag` — Artikel-Tag-Informationen
- `article:section` — Inhaltskategorie

### Implementierungstipps

Indem Sie `title` / `description` / `image` als Props in der Layout-Komponente akzeptieren und von jeder Seite übergeben, können Sie eine konsistente Meta-Tag-Ausgabe auf allen Seiten sicherstellen. Für den `og:title` der Startseite verwenden Sie einen spezifischen Titel, der den Website-Namen und den Slogan enthält, anstatt nur „Home".

---

## Strukturierte Daten implementieren (JSON-LD)

Strukturierte Daten sind ein Mechanismus, der Suchmaschinen ermöglicht, den Seiteninhalt maschinell zu verstehen. Bei korrekter Implementierung können Rich Results (FAQs, Breadcrumbs, Autoreninfos usw.) in den Suchergebnissen erscheinen.

### Organization

Übermitteln Sie Firmeninformationen an Google. Dies kann im Knowledge Panel erscheinen.

```json
{
  "@type": "Organization",
  "name": "Acecore",
  "url": "https://acecore.net",
  "logo": "https://acecore.net/logo.png",
  "contactPoint": { "@type": "ContactPoint", "telephone": "..." }
}
```

Sie können auch ein `knowsAbout`-Feld auf der Über-uns-Seite hinzufügen, um Geschäftsbereiche anzugeben.

### BlogPosting

Setzen Sie `BlogPosting` für Blog-Artikel. Die Angabe von Autor, Veröffentlichungsdatum, Aktualisierungsdatum und Beitragsbild ermöglicht die Anzeige von Autoreninfos in Google Discover und Suchergebnissen.

### BreadcrumbList

Strukturierte Breadcrumb-Daten sollten auf allen Seiten gesetzt werden. Ein wichtiger Implementierungshinweis: Überprüfen Sie, ob Zwischenpfade (wie Listenseiten, z.B. `/blog/tags/`) tatsächlich existieren, und geben Sie die `item`-Eigenschaft für nicht existierende Pfade nicht aus.

### FAQPage

Wenn die Seite FAQ enthält, können passende `FAQPage`-Daten ausgegeben werden. Google beschränkt FAQ-Rich-Results im Allgemeinen auf anerkannte Behörden- und Gesundheitsseiten. Andere Seiten sollten diese Darstellung nicht erwarten.

### WebSite + SearchAction

Google stellte das Sitelinks-Suchfeld im November 2024 ein. Vorhandenes `SearchAction`-Markup verursacht für sich genommen keinen Suchfehler. Pagefind und ähnliche Tools bleiben für die Suche auf der eigenen Website nützlich.

---

## Sitemap-Optimierung

Sie können eine Sitemap automatisch mit Astros `@astrojs/sitemap`-Plugin generieren, aber die Standardeinstellungen sind unzureichend.

### Konfiguration pro Seitentyp

Die damalige `serialize()`-Konfiguration gab `changefreq` und `priority` je URL-Typ aus. Die Tabelle dokumentiert diese Implementierung. Google ignoriert beide Werte; ein Rankinggewinn ist nicht zu erwarten.

| Seitentyp     | changefreq | priority |
| ------------- | ---------- | -------- |
| Startseite    | daily      | 1.0      |
| Blog-Beiträge | weekly     | 0.8      |
| Sonstige      | monthly    | 0.6      |

### lastmod setzen

`lastmod` sollte das Datum einer tatsächlichen, wesentlichen Seitenänderung angeben. Vermeiden Sie das Build-Datum auf allen unveränderten Seiten; bei Artikeln sollte es zu Veröffentlichung oder `lastUpdated` passen.

---

## RSS-Feed verbessern

RSS wird oft als „einmal einrichten und vergessen"-Aufgabe behandelt, aber die Verbesserung der Feed-Qualität verbessert die Darstellung in RSS-Readern und die Abonnentenerfahrung.

### Hinzuzufügende Informationen

- **author**: Den Autorennamen pro Artikel einbinden
- **categories**: Tag-Informationen als Kategorien hinzufügen, um die Klassifizierung in RSS-Readern zu verbessern

```typescript
items: posts.map((post) => ({
  title: post.data.title,
  description: post.data.description,
  link: `/blog/${post.id}/`,
  pubDate: post.data.date,
  author: post.data.author,
  categories: post.data.tags,
}));
```

---

## SEO-Verbesserungs-Checkliste

Abschließend eine Zusammenfassung der wichtigsten Punkte zur Überprüfung für die SEO-Verbesserung einer Astro-Website:

1. **Ist auf jeder Seite eine kanonische URL gesetzt?**
2. **Ist für jede Seite ein einzigartiges OGP-Bild vorbereitet?**
3. **Validierung strukturierter Daten**: Mit dem [Google Rich Results Test](https://search.google.com/test/rich-results) prüfen
4. **Zeigen Zwischenpfade in Breadcrumb-Listen auf tatsächliche URLs?**
5. **Schließt die Sitemap unnötige Seiten (wie 404) aus?**
6. **Enthält der RSS-Feed Autor und Kategorien?**
7. **Schließt robots.txt Suchindizes (wie `/pagefind/`) vom Crawling aus?**

Sobald Sie all dies konfiguriert haben, steht Ihre SEO-Grundlage. Von da an werden Suchrankings durch Inhaltsqualität und Aktualisierungsfrequenz bestimmt.

---

## Zugehörige Serie

Dieser Artikel ist Teil der Serie „[Leitfaden zur Qualitätsverbesserung von Astro-Websites](/blog/website-improvement-batches/)". Separate Artikel behandeln Verbesserungen in den Bereichen Performance, Barrierefreiheit und UX.
