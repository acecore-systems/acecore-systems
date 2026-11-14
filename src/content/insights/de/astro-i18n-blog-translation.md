---
title: "So wird ein Astro-Blog in 9 Sprachen verfügbar – Implementierung von Übersetzung, URLs und hreflang"
description: "Ein Implementierungsbericht zur Übersetzung eines Astro-Blogs in 9 Sprachen. Er erläutert URL-Design mit prefixDefaultLocale, die Ablage von Übersetzungsdateien, Bedingungen, unter denen für nicht übersetzte Locales keine Artikel-URLs, Sitemaps oder hreflang-Einträge erzeugt werden, die Anzeige über View-Komponenten sowie Hinweise zu OG-Bildern, CMS und RSS. Dabei werden der Stand von 7/2026 und aktuelle Änderungen getrennt dargestellt, um Entscheidungen für eine vergleichbare Konfiguration zu erleichtern."
date: 2026-03-25T10:00
lastUpdated: "2026-10-25T06:10:55Z"
author: gui
tags: ["Technik", "Astro", "i18n", "Website"]
image: "/images/insights/covers/astro-i18n-blog-translation-cover-v2.webp"
processFigure:
  title: Ablauf der Mehrsprachigkeit
  steps:
    - title: i18n-Grundlage aufbauen
      description: Integriertes i18n-Routing von Astro und Übersetzungswerkzeuge einrichten.
      icon: i-lucide-globe
    - title: UI-Texte übersetzen
      description: Anzeigetexte von Header, Footer und allen Komponenten mehrsprachig machen.
      icon: i-lucide-languages
    - title: Blogartikel übersetzen
      description: Bei der Ersteinführung 21 Artikel × 8 Sprachen = 168 Übersetzungsdateien erzeugen.
      icon: i-lucide-file-text
    - title: CMS und Build prüfen
      description: Mehrsprachigkeit in Pages CMS und Build aller Seiten prüfen.
      icon: i-lucide-check-circle
compareTable:
  title: Vergleich vor und nach der Einführung der Mehrsprachigkeit
  before:
    label: Nur Japanisch
    items:
      - Nur 1 Sprache, Japanisch
      - 23 Blogartikel
      - 523 generierte Seiten (nach der UI-Übersetzung)
      - 1 Blog-Collection in Pages CMS
      - Tags und Autorendaten nur auf Japanisch
      - 1 RSS-Feed
  after:
    label: "9 Sprachen (bei der Ersteinführung)"
    items:
      - Japanisch + 8 Sprachen (en, zh-cn, es, pt, fr, ko, de, ru)
      - "23 Blogartikel + 168 Übersetzungen = 191 Artikel"
      - "621 generierte Seiten (bei der Ersteinführung)"
      - "9 sprachspezifische Collections in Pages CMS"
      - "25 verschiedene Tags und Autorendaten in jede Sprache übersetzt"
      - Mehrsprachige RSS-Feeds (für 9 Sprachen)
callout:
  type: info
  title: Unterstützte Sprachen
  text: "Unterstützt werden 9 Sprachen: Japanisch (Standard), Englisch, vereinfachtes Chinesisch, Spanisch, Portugiesisch, Französisch, Koreanisch, Deutsch und Russisch."
statBar:
  items:
    - value: "9"
      label: Anzahl unterstützter Sprachen
    - value: "208"
      label: Anzahl übersetzter Artikel (Stand 29. 7. 2026)
    - value: "652"
      label: Anzahl generierter Seiten (Stand 29. 7. 2026)
faq:
  title: Häufig gestellte Fragen
  items:
    - question: Warum wurden 9 Sprachen gewählt?
      answer: "Um die globale Reichweite zu maximieren, haben wir die wichtigsten Sprachräume der Welt abgedeckt. Englisch, Chinesisch, Spanisch und Portugiesisch erreichen einen Großteil der Internetbevölkerung; Französisch, Deutsch, Russisch und Koreanisch ergänzen die übrigen wichtigen Märkte."
    - question: Wie wird die Übersetzungsqualität sichergestellt?
      answer: "Wir verwenden KI-Übersetzungen mit GitHub Copilot. Eine englische Version dient als Zwischensprache, aus der in die einzelnen Sprachen übersetzt wird. Das verringert Qualitätsschwankungen. Tag-Werte im Frontmatter bleiben auf Japanisch; URLs, Codeblöcke und Bildpfade werden nicht geändert. Dies beschreibt das Verfahren vom 7/2026. Aktuell werden Übersetzungen mit OpenAI Batch erzeugt."
    - question: Was passiert, wenn kein übersetzter Artikel vorhanden ist?
      answer: "Für Locales ohne Übersetzungsdatei wird keine Artikel-URL erzeugt. Die japanische Version bleibt unter ihrer ursprünglichen URL veröffentlicht; beim Sprachwechsel gelangt man zur Blogübersicht der gewünschten Locale."
    - question: Müssen neue Artikel ebenfalls übersetzt werden?
      answer: "Für die Veröffentlichung der japanischen Version ist keine Übersetzung erforderlich. Wird eine Übersetzung hinzugefügt, erzeugt eine gleichnamige Markdown-Datei im entsprechenden Sprachverzeichnis die Grundlage für Artikel-URL, Sitemap und hreflang dieser Sprache."
---

Dieser Implementierungsbericht richtet sich an alle, die einen japanischen Astro-Blog mehrsprachig betreiben möchten, ohne URLs übersetzter Artikel, Sprachwechsel, Sitemap oder hreflang zu beeinträchtigen. Gleichen Sie zunächst Text, Metadaten und Sprachwechsel anhand eines repräsentativen Artikels ab und stellen Sie sicher, dass nicht auf unübersetzte Seiten verwiesen wird. Nutzen Sie [Astro: Internationalization Routing](https://docs.astro.build/en/guides/internationalization/) als Grundlage für das URL-Design und erweitern Sie UI- und Artikelübersetzungen getrennt und schrittweise. Die folgenden Zahlen und die frühere CMS-Konfiguration stammen aus der Einführungsphase.

> **Ergänzung vom 26. 9. 2026:** Astro 7.1.3, die Artikelzahlen und Copilot-Übersetzungen im Haupttext dokumentieren den Stand vom 7/2026. Die [aktuelle Abhängigkeitserklärung](https://github.com/acecore-systems/acecore-net/blob/main/package.json) nennt Astro ^7.3.3 und Tailwind CSS 4.3.3; den aktuellen Übersetzungsbetrieb beschreibt der [Artikel zur Umstellung auf OpenAI Batch](/insights/copilot-translation-pipeline/). Prüfen Sie den aktuellen Quellcode und die veröffentlichten Seiten, bevor Sie die folgenden Implementierungsbeispiele oder Zahlen als aktuelle Konfiguration verwenden.

## Implementierungsbericht zum Stand 7/2026

Wir haben die offizielle Acecore-Website von rein japanischen Inhalten auf 9 Sprachen erweitert. Bei der Ersteinführung übersetzten wir 21 Blogartikel × 8 Sprachen = 168 Übersetzungen. Am 29. 7. 2026 gab es 29 japanische Artikel und 208 Übersetzungen, insgesamt 237 Artikel; der Build erzeugte 652 Seiten. Für Locales ohne Übersetzung werden keine Artikel-URLs erzeugt; veröffentlicht werden nur tatsächlich vorhandene Sprachversionen.

## Ansatz zur Mehrsprachigkeit und URL-Design

Wir haben die folgenden 3 Bereiche schrittweise umgesetzt.

1. **i18n-Grundlage aufbauen**: Integriertes i18n-Routing von Astro, Übersetzungswerkzeuge und JSON-Übersetzungsdateien für 9 Sprachen
2. **UI-Texte übersetzen**: Header, Footer, Seitenleiste und Komponententexte aller Seiten
3. **Blogartikel übersetzen**: Bei der Ersteinführung 21 Artikel in 8 Sprachen übersetzen (168 Dateien erzeugt)

### URL-Design

Wir verwenden `prefixDefaultLocale: false` von Astro: Japanisch wird direkt unter dem Stammverzeichnis (`/blog/...`) bereitgestellt, andere Sprachen mit Präfix (`/en/blog/...`, `/zh-cn/blog/...` usw.).

```
# 日本語（デフォルト）
/blog/astro-performance-tuning/

# 英語
/en/blog/astro-performance-tuning/

# 簡体字中国語
/zh-cn/blog/astro-performance-tuning/
```

Da alle Sprachen denselben Slug verwenden, ist die Zuordnung der URLs beim Sprachwechsel einfach.

Die Copilot-Automatisierung für den laufenden Übersetzungsbetrieb wird in [So betreiben Sie einen mehrsprachigen Blog mit Sveltia CMS](/insights/copilot-translation-pipeline/) beschrieben.

## Astros i18n-Grundlage einrichten

### Astros i18n-Konfiguration

In `astro.config.mjs` richten wir das i18n-Routing ein.

```javascript
// astro.config.mjs
export default defineConfig({
  i18n: {
    defaultLocale: "ja",
    locales: ["ja", "en", "zh-cn", "es", "pt", "fr", "ko", "de", "ru"],
    routing: {
      prefixDefaultLocale: false,
    },
  },
});
```

### Übersetzungswerkzeuge

In `src/i18n/` haben wir Konfiguration, Hilfsfunktionen und Übersetzungs-JSON zusammengefasst.

```typescript
// src/i18n/utils.ts
export function t(locale: Locale, key: string): string {
  return translations[locale]?.[key] ?? translations[defaultLocale][key] ?? key;
}
```

Die Übersetzungsdateien der einzelnen Sprachen liegen im JSON-Format unter `src/i18n/locales/`. Dort verwalten wir etwa 100 Schlüssel für Navigation, Footer, Blog-UI, Metadaten und weitere Inhalte.

### View-Komponenten-Muster

Für die Seitenimplementierung verwenden wir das **View-Komponenten-Muster**. Layout und Logik sind in `src/views/` zusammengefasst; die Routendateien (`src/pages/`) sind schlanke Wrapper, die lediglich die Locale übergeben.

```astro
---
// src/pages/[locale]/about.astro（ルートファイル）
import AboutPage from "../../views/AboutPage.astro";
const { locale } = Astro.params;
---

<AboutPage locale={locale} />
```

Durch dieses Design gibt es zwischen der japanischen Route (`/about`) und der mehrsprachigen Route (`/en/about`) keine duplizierte Logik.

## Blogartikel in sprachspezifischen Verzeichnissen übersetzen

### Verzeichnisstruktur

Übersetzte Artikel liegen in Unterverzeichnissen mit Sprachcodes. Astros Glob-Loader erkennt sie anhand des Musters `**/*.md` automatisch rekursiv. Die [Content Loader API](https://docs.astro.build/en/reference/content-loader-reference/) von Astro beschreibt, dass für `pattern` des `glob()`-Loaders ein Globstar wie `**/*.md` angegeben werden kann, um unter anderem Markdown aus Verzeichnissen zu laden.

```
src/content/blog/
  astro-performance-tuning.md          # 日本語（ベース）
  website-renewal.md
  en/
    astro-performance-tuning.md        # 英語版
    website-renewal.md
  zh-cn/
    astro-performance-tuning.md        # 簡体字中国語版
    website-renewal.md
  es/
    ...
```

### Werkzeuge zur Inhaltsauflösung

In `src/utils/blog-i18n.ts` haben wir 3 Funktionen implementiert.

```typescript
// ベース記事かどうかを判定（IDにスラッシュが無い = ベース）
export function isBasePost(post: CollectionEntry<"blog">): boolean {
  return !post.id.includes("/");
}

// IDからロケールプレフィックスを除去してベーススラッグを取得
export function getBaseSlug(postId: string): string {
  const idx = postId.indexOf("/");
  return idx !== -1 ? postId.slice(idx + 1) : postId;
}

// ベース記事のローカライズ版を取得（無ければ原文にフォールバック）
export function localizePost(
  post: CollectionEntry<"blog">,
  allPosts: CollectionEntry<"blog">[],
  locale: Locale,
): CollectionEntry<"blog"> {
  if (locale === defaultLocale) return post;
  return allPosts.find((p) => p.id === `${locale}/${post.id}`) ?? post;
}
```

`localizePost()` selbst gibt als Sicherheitsmaßnahme den Originaltext zurück. Veröffentlichte Routen und Übersichten berücksichtigen jedoch mithilfe von `isPostAvailableInLocale()` und Filtern nur vorhandene Übersetzungen. Für nicht übersetzte Locales entstehen daher keine Artikel-URLs.

Der entscheidende Punkt ist, **das bestehende Content-Collection-Schema nicht zu ändern**. Astros Glob-Loader erkennt Dateien in Unterverzeichnissen automatisch anhand von IDs wie `en/astro-performance-tuning`; eine Konfigurationsänderung war daher nicht nötig.

### Regeln für Übersetzungsdateien

Die Übersetzungsdateien wurden nach folgenden Regeln erzeugt:

- **Frontmatter-Schlüssel** bleiben auf Englisch (`title`, `description`, `date` usw.)
- **Tag-Werte** bleiben auf Japanisch (`['技術', 'Astro']` usw.)
- **URLs, Bildpfade, Codeblöcke und HTML** bleiben unverändert
- **Datum und Autor** bleiben unverändert
- **Textwerte im Haupttext und Frontmatter** (title, description, callout, FAQ usw.) werden übersetzt

### Übersetzungsworkflow

Der Übersetzungsablauf sieht wie folgt aus:

1. **Englische Version als Zwischensprache erstellen**: Das japanische Original ins Englische übersetzen
2. **Aus der englischen Version in die einzelnen Sprachen übersetzen**: Von Englisch aus in 7 Sprachen übertragen
3. **Stapelverarbeitung**: Mit GitHub Copilot jeweils 5 bis 6 Artikel pro Stapel verarbeiten

Die 2-stufige Übersetzung Japanisch → Englisch → jeweilige Sprache verringert Schwankungen in der Übersetzungsqualität. Mit Englisch als Zwischensprache erzielten wir eine gleichmäßigere Qualität als bei der direkten Übersetzung aus dem Japanischen.

<figure class="article-diagram" data-layout="branches" data-tone="teal" data-count="3" aria-labelledby="diagram-astro-i18n-blog-translation">
  <figcaption>
    <strong id="diagram-astro-i18n-blog-translation">Übersetzungen vor der Veröffentlichung mit der aktuellen japanischen Quelle abgleichen</strong>
    <span>Veröffentlichte URLs und Verweise für Suchmaschinen richten sich nach den tatsächlich vorhandenen Übersetzungsdateien.</span>
  </figcaption>
  <ol class="article-diagram__nodes">
    <li>
      <span class="article-diagram__symbol">
        <span aria-hidden="true">1</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M6 3h8l4 4v14H6z M14 3v5h5 M9 12h6 M9 16h6"/></svg>
      </span>
      <strong>Japanische Quelle aktualisieren</strong>
      <span>Änderungen an der japanischen Quelle prüfen und zunächst die betroffenen Sprachversionen und erneut zu prüfenden Artikel bestimmen.</span>
    </li>
    <li>
      <span class="article-diagram__symbol">
        <span aria-hidden="true">2</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z M3 12h18 M12 3a14 14 0 0 1 0 18 M12 3a14 14 0 0 0 0 18"/></svg>
      </span>
      <strong>Übersetzung jeder Locale abgleichen</strong>
      <span>title, description und Haupttext prüfen und nur Locale-URLs erzeugen, für die Übersetzungsdateien vorhanden sind.</span>
    </li>
    <li>
      <span class="article-diagram__symbol">
        <span aria-hidden="true">3</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M6 3h8l4 4v14H6z M14 3v5h5 M8 16l8-8"/></svg>
      </span>
      <strong>Wenn keine Übersetzungsdatei vorhanden ist</strong>
      <span>Für diese Locale werden keine URL, Sitemap- oder hreflang-Einträge erzeugt. Nicht übersetzte Seiten werden nicht automatisch veröffentlicht.</span>
    </li>
  </ol>
</figure>

## Mehrsprachigkeit in View-Komponenten

### Implementierung von BlogPostPage

Auf Blogartikelseiten rufen wir mit `localizePost()` den Inhalt der jeweiligen Locale ab und weisen ihn Template-Variablen zu.

```astro
---
// src/views/BlogPostPage.astro
const localizedPost = localizePost(basePost, allPosts, locale);
const post = localizedPost; // テンプレートの既存参照がそのまま動く
---
```

So konnten wir Mehrsprachigkeit umsetzen, ohne Verweise auf `post.data.title` oder `post.body` im Template zu ändern.

### Übersichtsseiten

Auf Blog-, Tag- und Autorenübersichten sowie Archivseiten filtern wir mit `isBasePost()` nur die Basisartikel und ersetzen sie bei der Anzeige mittels `localizePost()` durch die Übersetzung.

```astro
---
const allPosts = await getCollection("blog");
const basePosts = allPosts.filter(isBasePost);
const displayPosts = basePosts.map((p) => localizePost(p, allPosts, locale));
---
```

## Probleme mit YAML und OG-Bildern beim Build

### Escape-Zeichen im YAML-Frontmatter

In französischen Übersetzungen kollidierten Apostrophe (`l'atelier`, `qu'on` usw.) mit den einfachen Anführungszeichen von YAML.

```yaml
# NG：YAML パースエラー
title: 'Le métavers est plus proche qu'on ne le pense'

# OK：ダブルクォートに変更
title: "Le métavers est plus proche qu'on ne le pense"
```

Wir korrigierten alle Dateien gesammelt mit einem Node.js-Skript. Da beispielsweise auch das englische `Acecore's` dasselbe Problem verursacht, muss bei der Erzeugung von Übersetzungsdateien auf die Art der Anführungszeichen geachtet werden.

### Filtern der OG-Bildroute

`/blog/og/[slug].png.ts` erfasste auch Slugs übersetzter Artikel (`en/aceserver-hijacked` usw.), was zu Parameterfehlern führte. Das Problem wurde durch Filtern mit `isBasePost()` gelöst.

```typescript
export const getStaticPaths: GetStaticPaths = async () => {
  const allPosts = await getCollection("blog");
  const posts = allPosts.filter(isBasePost);
  return posts.map((post) => ({
    params: { slug: post.id },
    props: { title: post.data.title },
  }));
};
```

## Mehrsprachigkeit in Pages CMS

Pages CMS (`.pages.yml`) berücksichtigt nur Dateien direkt im mit `path` angegebenen Verzeichnis. Daher haben wir die Unterverzeichnisse für Übersetzungen als separate Collections registriert.

```yaml
content:
  - name: blog
    label: ブログ（日本語）
    path: src/content/blog
  - name: blog-en
    label: Blog（English）
    path: src/content/blog/en
  - name: blog-zh-cn
    label: 博客（简体中文）
    path: src/content/blog/zh-cn
  # ... 各言語ごとに設定
```

Die Bezeichnungen sind in der jeweiligen Sprache gehalten, sodass im CMS auf einen Blick erkennbar ist, welche Collection zu welcher Sprache gehört.

## UI für den Sprachwechsel

Wir haben dem Header die Komponente `LanguageSwitcher` hinzugefügt und eine Sprachwechsel-UI für Desktop und Mobilgeräte implementiert. Beim Sprachwechsel wird zur entsprechenden Locale derselben Seite navigiert. Beim ersten Besuch wird `navigator.language` des Browsers erkannt und automatisch weitergeleitet.

## Mehrsprachige Anzeige von Tags

Für Tags verwenden wir in URLs weiterhin die japanischen Slugs und **übersetzen nur die Anzeigenamen**. So vermeiden wir komplexeres Routing und zeigen Nutzern Tags in ihrer Muttersprache an.

Die Tag-Definitionen sind in `src/content/tags/{tagId}.json` zusammengefasst; jedes Tag besitzt `i18n.name`. Damit liegt die maßgebliche Quelle für Tag-Übersetzungen in der Tag-Collection statt im Übersetzungs-JSON.

```json
{
  "id": "technology",
  "name": "技術",
  "i18n": {
    "en": { "name": "Technology" },
    "fr": { "name": "Technologie" }
  }
}
```

Artikelkarten, Seitenleiste, Tag-Übersicht und Artikeldetails beziehen die Anzeigenamen aus der Tags-Collection. Dadurch werden alle Tags einheitlich in der Sprache der jeweiligen Locale angezeigt.

## Mehrsprachige Autorendaten

Auch Namen, Selbstbeschreibungen (bio) und Fähigkeiten von Autoren werden je nach Sprache umgeschaltet. In `src/content/authors/{authorId}.json` haben wir das Feld `i18n` ergänzt, das die Übersetzungen für jede Sprache speichert.

```json
{
  "id": "hatt",
  "name": "ハット",
  "bio": "代表取締役。Web制作・サーバー運用…",
  "skills": ["TypeScript", "Astro", "..."],
  "i18n": {
    "en": {
      "name": "Hatt",
      "bio": "CEO and representative director. Web development...",
      "skills": ["TypeScript", "Astro", "..."]
    }
  }
}
```

Das Werkzeug `getLocalizedAuthor()` ruft die Autorendaten passend zur Locale ab.

```typescript
// src/utils/blog-i18n.ts
export function getLocalizedAuthor(author: Author, locale: Locale) {
  const localized = author.i18n?.[locale];
  return localized ? { ...author, ...localized } : author;
}
```

## Mehrsprachiges SEO implementieren

Um die SEO-Vorteile der Mehrsprachigkeit auszuschöpfen, haben wir dafür gesorgt, dass Suchmaschinen jede Sprachversion korrekt erkennen und indexieren können.

### hreflang in der Sitemap

Wir konfigurieren die Option `i18n` von `@astrojs/sitemap` und einen Filter, der prüft, ob Übersetzungsdateien vorhanden sind. Die Sitemap enthält nur tatsächlich vorhandene Sprachversionen und gibt automatisch die zugehörigen `xhtml:link rel="alternate"`-Tags aus.

```javascript
// astro.config.mjs
sitemap({
  filter(page) {
    return !isMissingLocalizedBlogPost(page);
  },
  i18n: {
    defaultLocale: "ja",
    locales: {
      ja: "ja",
      en: "en",
      "zh-cn": "zh-CN",
      es: "es",
      pt: "pt",
      fr: "fr",
      ko: "ko",
      de: "de",
      ru: "ru",
    },
  },
});
```

Für Artikel, die in allen 9 Sprachen vorliegen, wird hreflang für 9 Sprachen ausgegeben. Für Artikel ohne Übersetzung wird nur die japanische URL aufgeführt; nicht vorhandene Sprachversionen erscheinen weder in Sitemap noch hreflang.

### Sprachangaben in strukturierten JSON-LD-Daten

Wir haben den strukturierten `BlogPosting`-Daten der Blogartikel das Feld `inLanguage` hinzugefügt, um Suchmaschinen die Sprache jedes Artikels mitzuteilen.

```javascript
// BlogPostPage.astro（JSON-LD 抜粋）
{
  "@type": "BlogPosting",
  "inLanguage": htmlLangMap[locale],  // "ja", "en", "zh-CN" など
  "headline": post.data.title,
  // ...
}
```

### Mehrsprachige RSS-Feeds

Zusätzlich zum japanischen `/rss.xml` erzeugen wir RSS-Feeds für die einzelnen Sprachversionen (`/en/rss.xml`, `/zh-cn/rss.xml` usw.). Titel und Beschreibung der Feeds werden ebenfalls übersetzt; im Tag `<language>` wird ein Sprachcode gemäß BCP47 ausgegeben.

```typescript
// src/pages/[locale]/rss.xml.ts
export const getStaticPaths = () =>
  locales
    .filter((l) => l !== defaultLocale)
    .map((l) => ({ params: { locale: l } }));
```

Auch `<link rel="alternate" type="application/rss+xml">` von `BaseLayout.astro` setzt automatisch die zur Locale passende RSS-URL.

## Zusammenfassung

Die Implementierung vom 7/2026 nutzt die integrierten i18n-Funktionen von Astro 7.1.3, um auch eine statische Website mehrsprachig bereitzustellen.

- **i18n-Grundlage**: Japanisch ohne Präfix dank `prefixDefaultLocale: false` von Astro
- **UI-Übersetzung**: Keine duplizierte Logik durch das View-Komponenten-Muster
- **Inhaltsübersetzung**: Unterverzeichnisse ohne Änderung des bestehenden Schemas
- **Tag-Übersetzung**: Japanische Slugs in URLs beibehalten, nur Anzeigenamen übersetzen
- **Übersetzung der Autorendaten**: bio und skills je nach Sprache umschalten
- **SEO-Maßnahmen**: Sitemap-hreflang, JSON-LD `inLanguage` und mehrsprachige RSS-Feeds
- **Nicht übersetzte Locales**: Keine Artikel-URL erzeugen; japanische Version weiterhin unter der ursprünglichen URL veröffentlichen
- **CMS-Unterstützung**: Artikel jeder Sprache in Pages CMS separat bearbeiten

Künftig werden beim Hinzufügen neuer Artikel auch Übersetzungsdateien schrittweise ergänzt. Bis zur Fertigstellung der Übersetzung wird nur die japanische Version veröffentlicht; Artikel-URL, Sitemap und hreflang werden für Locales aktiviert, sobald deren Übersetzungsdateien vorliegen.

## Ergänzung vom 6. 10. 2026: Sprache und Fehler auf Authentifizierungsseiten

Neben der Übersetzung veröffentlichter Artikel benötigen auch Authentifizierungsseiten eine einheitliche Sprachauswahl. Bei einer anonymisierten Überarbeitung wurde in dieser Reihenfolge ein unterstützter Wert aus `ui_locales`, `Accept-Language` oder der Standardsprache gewählt; für nicht unterstützte Werte wurde ein sicherer Fallback eingerichtet. Bekannte OIDC-Fehler werden in gemeinsame Anzeigetexte umgewandelt; auch bei unbekannten Fehlern werden keine internen Rohmeldungen angezeigt.

Seitenbeschriftungen, über die API gemeldete Fehler und Hinweise nach Abschluss der Registrierung werden gemeinsam geprüft. Die Unterstützung von 9 Sprachen im Blog allein gilt nicht als abgeschlossene Abnahme aller Authentifizierungsseiten oder tatsächlichen Registrierungswege.

Die Sprache wird auch bei Anmeldung, Kontoverwaltung, Einwilligung und Einmalcodes übernommen; OIDC-Locale und -State bleiben während der Übergänge erhalten. Der Umfang der gemeinsamen Prüfung von URL, Content-Language und Anzeige auf schmalen Bildschirmen wird von der Nutzerabnahme in allen Sprachen unterschieden.
