---
title: "VitePress zu Starlight migrieren: Markdown, URLs und Mermaid prüfen"
description: "Astro-Vereinheitlichung abwägen und Markdown-Ablage, Frontmatter, alte URLs, Mermaid-Darstellung und CDN-Abhängigkeiten anhand einer Migration vom März 2026 prüfen."
date: 2026-03-15T00:00
author: gui
tags: ["Technologie", "Astro", "Starlight"]
image: "/images/insights/covers/vitepress-to-starlight-migration-cover-v2.webp"
processFigure:
  title: Migrationsablauf
  steps:
    - title: Ist-Analyse
      description: Die VitePress + UnoCSS-Konfiguration bewertet.
      icon: i-lucide-search
    - title: Starlight-Einrichtung
      description: Das Projekt mit Astro + Starlight neu strukturiert.
      icon: i-lucide-star
    - title: Inhaltsmigration
      description: Markdown-Dateiablage und Frontmatter angepasst.
      icon: i-lucide-file-text
    - title: Mermaid CDN-Migration
      description: Plugin-Abhängigkeit durch Diagramm-Rendering über CDN eliminiert.
      icon: i-lucide-git-branch
compareTable:
  title: Vor und nach der Migration
  before:
    label: VitePress + UnoCSS
    items:
      - Vue-basierter SSG
      - Styling mit UnoCSS
      - Mermaid via Plugin
      - Separater Tech-Stack vom Astro-Projekt
  after:
    label: Astro + Starlight
    items:
      - Astro-basierter SSG
      - Starlights integriertes Styling
      - Mermaid via CDN
      - Vereinheitlichtes Framework mit der Hauptseite
faq:
  title: FAQ
  items:
    - question: Welche Vorteile hat die Migration von VitePress zu Starlight?
      answer: Wenn Ihre Hauptseite auf Astro läuft, reduziert die Framework-Vereinheitlichung den Lernaufwand, vereinfacht das Dependency-Management und verbessert die Konfigurationskonsistenz. Auch die Build-Pipelines können konsolidiert werden.
    - question: Wie werden Mermaid-Diagramme gerendert?
      answer: "Wir luden Mermaid von jsdelivr und übergaben Definitionen an Zielelemente. Das entfernt die npm-Abhängigkeit; CDN-Verfügbarkeit und Versionskompatibilität bleiben zu prüfen."
    - question: Wie viel Aufwand erfordert die Migration?
      answer: Die Hauptaufgaben sind die Konvertierung der Verzeichnisstruktur (docs/ → src/content/docs/) und die Anpassung des Frontmatters. Da der Inhalt selbst Markdown ist, kann er unverändert wiederverwendet werden, was die Migration relativ schnell macht.
lastUpdated: "2026-10-09T15:00:00+09:00"
---

Hier ist eine Anleitung zur Migration einer VitePress-Dokumentationssite zu Astro + Starlight. Wenn Ihre Hauptseite auf Astro läuft, vereinfacht die Zusammenführung Ihrer Dokumentation unter Starlight den Betrieb. Wir behandeln auch die Migration von Mermaid-Diagrammen zum CDN.

## Kompatibilität vor der Migration an einer Seite prüfen

Migrieren Sie zunächst eine Seite mit Überschriften, internen Links, Code und Mermaid. Vergleichen Sie URLs und Diagramme. Der CDN-Import macht Markdown-Codeblöcke nicht automatisch zu Mermaid-Zielen. Definitionen müssen an class="mermaid"-Elemente übergeben werden; prüfen Sie das erzeugte HTML vor der vollständigen Migration.

[Starlight：Markdown- und HTML-Spezifikationen](https://starlight.astro.build/guides/authoring-content/)

## Warum Frameworks vereinheitlichen?

Die Verwendung verschiedener Frameworks für die Hauptseite und die Dokumentationssite erzeugt folgende Probleme:

- **Doppelter Lernaufwand**: Sie müssen sowohl VitePress- als auch Astro-Spezifikationen verstehen
- **Verteilte Abhängigkeiten**: npm-Paketaktualisierungen in zwei separaten Systemen verwaltet
- **Konfigurationsinkonsistenz**: ESLint, Prettier, Deploy-Einstellungen usw. unabhängig gepflegt

Die Vereinheitlichung auf Astro + Starlight ermöglicht die gemeinsame Nutzung von Konfigurationsdateimustern und Troubleshooting-Wissen.

## Migrationsschritte: VitePress zu Starlight

### 1. Projektstruktur-Konvertierung

VitePress platziert Dokumente im `docs/`-Verzeichnis, Starlight verwendet `src/content/docs/`.

```
# Vorher (VitePress)
docs/
  pages/
    index.md
    business-overview.md
    market-analysis.md

# Nachher (Starlight)
src/
  content/
    docs/
      index.md
      business-overview.md
      market-analysis.md
```

### 2. Frontmatter-Anpassungen

VitePress und Starlight haben leicht unterschiedliche Frontmatter-Formate. Wir haben VitePress' `sidebar`-Konfiguration zu Starlights Frontmatter-`sidebar`-Feld migriert.

```yaml
# Starlight frontmatter
---
title: Business Overview
sidebar:
  order: 1
---
```

### 3. astro.config.mjs-Konfiguration

```javascript
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";

export default defineConfig({
  integrations: [
    starlight({
      title: "Acecore Business Plan",
      defaultLocale: "ja",
      sidebar: [
        {
          label: "Business Plan",
          autogenerate: { directory: "/" },
        },
      ],
    }),
  ],
});
```

### 4. Entfernung von UnoCSS

In der VitePress-Umgebung wurde UnoCSS für benutzerdefinierte Styles verwendet, aber Starlight bietet ausreichende integrierte Standard-Styles. Wir haben `uno.config.ts` und zugehörige Pakete entfernt und die Abhängigkeiten verschlankt.

## Mermaid-Diagramm CDN-Migration

Die Dokumente nutzten `vitepress-plugin-mermaid`. Für einheitliche Abhängigkeiten wählten wir CDN-Laden in Starlight. Die [offizielle Plugin-Liste](https://starlight.astro.build/resources/plugins/) zeigt Erweiterungen; CDN ist nicht die einzige Möglichkeit.

Daher haben wir zum Laden von Mermaid über CDN auf der Browserseite gewechselt.

### Implementierung

Fügen Sie das Mermaid CDN-Skript zu Starlights benutzerdefiniertem Head hinzu:

```javascript
// astro.config.mjs
starlight({
  head: [
    {
      tag: "script",
      attrs: { type: "module" },
      content: `
        import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@11.16.0/dist/mermaid.esm.min.mjs'
        mermaid.initialize({ startOnLoad: true })
      `,
    },
  ],
});
```

Der folgende Block definiert ein Diagramm; zusätzlich muss es an [Mermaid-Zielelemente](https://mermaid.js.org/intro/) übergeben werden:

````markdown
```mermaid
graph TD
    A[Business Plan] --> B[Market Analysis]
    A --> C[Sales Strategy]
    A --> D[Financial Plan]
```
````

### Vorteile des CDN-Ansatzes

- **Null Build-Abhängigkeiten**: Mermaid als npm-Paket wird nicht mehr benötigt
- **Version festlegen**: Das Beispiel wählt 11.16.0; ein CDN aktualisiert sie nicht automatisch auf die neueste Version
- **Kein SSR erforderlich**: Wird im Browser gerendert, daher keine Auswirkung auf die Build-Zeit

## Migrationsergebnisse

| Punkt         | Vorher                   | Nachher                        |
| ------------- | ------------------------ | ------------------------------ |
| Framework     | VitePress 1.x            | Astro 6 + Starlight            |
| CSS           | UnoCSS                   | Starlight integriert           |
| Mermaid       | vitepress-plugin-mermaid | CDN (jsdelivr)                 |
| Build-Ausgabe | `docs/.vitepress/dist`   | `dist`                         |
| Deployment    | Cloudflare Pages         | Cloudflare Pages (unverändert) |

Durch die Framework-Vereinheitlichung können `astro.config.mjs`-Konfigurationsmuster und Deployment-Einstellungen über mehrere Projekte hinweg geteilt werden.

## Fazit

Framework-Vereinheitlichung mag nicht „dringend" sein, aber je länger man betreibt, desto mehr zahlt es sich aus. Die Migration von VitePress zu Starlight kann in wenigen Stunden abgeschlossen werden, und der CDN-Ansatz für Mermaid ist eigentlich eine Befreiung vom Plugin-Management. Wenn Sie mehrere Projekte betreiben, sollten Sie eine Vereinheitlichung Ihres Tech-Stacks in Betracht ziehen.
