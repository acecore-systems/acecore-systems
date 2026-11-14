---
title: "Comment rendre un blog Astro disponible en 9 langues : retour sur la traduction, les URL et hreflang"
description: "Retour sur la mise en œuvre d'un blog Astro en 9 langues : conception des URL avec prefixDefaultLocale, emplacement des fichiers de traduction, conditions empêchant la génération des URL d'articles, du sitemap et de hreflang pour les locales non traduites, changement d'affichage avec les composants View et points d'attention pour les images OG, le CMS et les flux RSS. La configuration de juillet 2026 (mois 7) est distinguée des changements actuels afin de faciliter l'évaluation d'une architecture similaire."
date: 2026-03-25T10:00
lastUpdated: "2026-10-25T06:10:55Z"
author: gui
tags: ["Technologie", "Astro", "i18n", "Site web"]
image: "/images/insights/covers/astro-i18n-blog-translation-cover-v2.webp"
processFigure:
  title: Étapes de l'internationalisation
  steps:
    - title: Mise en place de l'infrastructure i18n
      description: Configuration du routage i18n intégré à Astro et des utilitaires de traduction.
      icon: i-lucide-globe
    - title: Traduction des textes de l'interface
      description: Traduction des textes affichés dans l'en-tête, le pied de page et tous les composants.
      icon: i-lucide-languages
    - title: Traduction des articles de blog
      description: Lors de la mise en place initiale, génération de 21 articles × 8 langues = 168 fichiers de traduction.
      icon: i-lucide-file-text
    - title: Vérification du CMS et du build
      description: Prise en charge multilingue de Pages CMS et vérification du build de toutes les pages.
      icon: i-lucide-check-circle
compareTable:
  title: Comparaison avant et après l'internationalisation
  before:
    label: Japonais uniquement
    items:
      - 1 seule langue, le japonais
      - 23 articles de blog
      - 523 pages générées (après la traduction de l'interface)
      - 1 collection de blog dans Pages CMS
      - Tags et données des auteurs en japonais uniquement
      - 1 flux RSS
  after:
    label: Prise en charge de 9 langues (lors du lancement initial)
    items:
      - Japonais + 8 langues (en, zh-cn, es, pt, fr, ko, de, ru)
      - 23 articles de blog + 168 traductions = 191 articles
      - 621 pages générées (lors du lancement initial)
      - 9 collections par langue dans Pages CMS
      - 25 types de tags et données des auteurs traduits dans chaque langue
      - Flux RSS multilingues (pour 9 langues)
callout:
  type: info
  title: Langues prises en charge
  text: "Le site prend en charge 9 langues : japonais (par défaut), anglais, chinois simplifié, espagnol, portugais, français, coréen, allemand et russe."
statBar:
  items:
    - value: "9"
      label: Nombre de langues prises en charge
    - value: "208"
      label: Nombre d'articles traduits (au 29 juillet 2026, mois 7)
    - value: "652"
      label: Nombre de pages générées (au 29 juillet 2026, mois 7)
faq:
  title: Questions fréquentes
  items:
    - question: Pourquoi avoir choisi 9 langues ?
      answer: "Pour maximiser notre portée mondiale, nous avons couvert les principales communautés linguistiques. L'anglais, le chinois, l'espagnol et le portugais couvrent une grande partie de la population internaute, tandis que le français, l'allemand, le russe et le coréen complètent les autres marchés majeurs."
    - question: Comment garantissez-vous la qualité des traductions ?
      answer: "Nous utilisons la traduction par IA avec GitHub Copilot. Nous créons une version anglaise comme langue intermédiaire, puis traduisons à partir de celle-ci pour limiter les variations de qualité. Les valeurs des tags du frontmatter restent en japonais et les URL, blocs de code et chemins d'images ne sont pas modifiés. Cette méthode correspond à la situation au mois 7 de 2026. La génération actuelle des traductions utilise OpenAI Batch."
    - question: Que se passe-t-il lorsqu'un article traduit n'existe pas ?
      answer: "Aucune URL d'article n'est générée pour une locale sans fichier de traduction. La version japonaise reste publiée à son URL d'origine et le changement de langue dirige vers la liste du blog dans la locale cible."
    - question: Faut-il aussi traduire chaque nouvel article ?
      answer: "La traduction n'est pas obligatoire pour publier la version japonaise. Pour ajouter une traduction, placez un fichier Markdown de même nom dans le répertoire de la langue concernée : l'URL de l'article, le sitemap et hreflang seront alors générés pour cette langue."
---

Ce retour d'expérience s'adresse aux personnes qui souhaitent rendre un blog japonais Astro multilingue sans compromettre les URL des articles traduits, le changement de langue, le sitemap ou hreflang. Commencez par harmoniser le contenu, les métadonnées et le changement de langue pour un article représentatif, puis vérifiez que les utilisateurs ne sont pas dirigés vers des pages non traduites. Prenez [Astro: Internationalization Routing](https://docs.astro.build/en/guides/internationalization/) comme référence pour la conception des URL et développez progressivement les traductions de l'interface et des articles séparément. Les nombres et l'ancienne configuration du CMS ci-dessous correspondent à la mise en place initiale.

> **Ajout du 26 septembre 2026 (mois 9) :** Astro 7.1.3, les nombres d'articles et la traduction par Copilot indiqués dans cet article correspondent à la situation au mois 7 de 2026. Les [déclarations actuelles des dépendances](https://github.com/acecore-systems/acecore-net/blob/main/package.json) indiquent Astro ^7.3.3 et Tailwind CSS 4.3.3. Le processus de traduction est présenté dans l'[article sur la mise à jour vers OpenAI Batch](/insights/copilot-translation-pipeline/). Avant d'utiliser les exemples ou les chiffres ci-dessous comme configuration actuelle, vérifiez le code source et les pages publiées actuels.

## Retour sur la mise en œuvre au mois 7 de 2026

Nous avons fait évoluer le site officiel d'Acecore, initialement en japonais uniquement, pour prendre en charge 9 langues. Lors de la mise en place initiale, nous avons traduit 21 articles de blog × 8 langues = 168 traductions. Au 29 juillet 2026 (mois 7), le site comptait 29 articles japonais et 208 traductions, soit 237 articles au total, et le build produisait 652 pages. Aucune URL d'article n'est générée pour une locale sans traduction : seules les versions linguistiques existantes sont publiées.

## Stratégie multilingue et conception des URL

Nous avons traité progressivement les 3 volets suivants :

1. **Mise en place de l'infrastructure i18n** : configuration du routage i18n intégré à Astro, utilitaires de traduction et fichiers JSON de traduction pour 9 langues
2. **Traduction des textes de l'interface** : textes des composants de l'en-tête, du pied de page, de la barre latérale et de toutes les pages
3. **Traduction des articles de blog** : traduction de 21 articles en 8 langues lors de la mise en place initiale (168 fichiers générés)

### Conception des URL

Nous avons adopté `prefixDefaultLocale: false` d'Astro : le japonais est servi directement à la racine (`/blog/...`), tandis que les autres langues utilisent un préfixe (`/en/blog/...`, `/zh-cn/blog/...`, etc.).

```
# 日本語（デフォルト）
/blog/astro-performance-tuning/

# 英語
/en/blog/astro-performance-tuning/

# 簡体字中国語
/zh-cn/blog/astro-performance-tuning/
```

Comme le même slug est utilisé dans toutes les langues, la correspondance des URL lors du changement de langue reste simple.

L'automatisation avec Copilot pour maintenir les traductions est présentée dans [Comment gérer un blog multilingue avec Sveltia CMS](/insights/copilot-translation-pipeline/).

## Configurer l'infrastructure i18n d'Astro

### Configuration i18n d'Astro

Configurez le routage i18n dans `astro.config.mjs`.

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

### Utilitaires de traduction

Nous avons regroupé les fichiers de configuration, les fonctions utilitaires et les traductions JSON dans `src/i18n/`.

```typescript
// src/i18n/utils.ts
export function t(locale: Locale, key: string): string {
  return translations[locale]?.[key] ?? translations[defaultLocale][key] ?? key;
}
```

Les fichiers de traduction de chaque langue sont placés au format JSON dans `src/i18n/locales/`. Nous gérons environ 100 clés pour la navigation, le pied de page, l'interface du blog, les métadonnées et d'autres éléments.

### Modèle de composant View

Les pages utilisent le **modèle de composant View**. La mise en page et la logique sont regroupées dans `src/views/`, tandis que les fichiers de routes (`src/pages/`) sont de simples enveloppes qui transmettent la locale.

```astro
---
// src/pages/[locale]/about.astro（ルートファイル）
import AboutPage from "../../views/AboutPage.astro";
const { locale } = Astro.params;
---

<AboutPage locale={locale} />
```

Cette conception élimine toute duplication de logique entre la route japonaise (`/about`) et la route multilingue (`/en/about`).

## Traduire les articles dans des répertoires par langue

### Structure des répertoires

Les articles traduits sont placés dans des sous-répertoires nommés selon le code de langue. Le chargeur glob d'Astro les détecte automatiquement de manière récursive grâce au motif `**/*.md`. L'[API Content Loader](https://docs.astro.build/en/reference/content-loader-reference/) d'Astro explique qu'un globstar tel que `**/*.md` peut être indiqué dans `pattern` du chargeur `glob()` pour charger notamment des fichiers Markdown depuis un répertoire.

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

### Utilitaires de résolution du contenu

Nous avons implémenté 3 fonctions dans `src/utils/blog-i18n.ts`.

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

`localizePost()` renvoie le texte original par sécurité, mais les routes publiques et les listes utilisent `isPostAvailableInLocale()` et des filtres pour ne cibler que les traductions existantes. Aucune URL d'article n'est donc générée pour une locale non traduite.

L'essentiel est de **ne pas modifier le schéma de collection de contenu existant**. Le chargeur glob d'Astro reconnaît automatiquement les fichiers des sous-répertoires avec des identifiants tels que `en/astro-performance-tuning`, sans modification de configuration.

### Règles des fichiers de traduction

Les fichiers de traduction ont été générés selon les règles suivantes :

- Les **clés du frontmatter** restent en anglais (`title`, `description`, `date`, etc.)
- Les **valeurs des tags** restent en japonais (`['技術', 'Astro']`, etc.)
- Les **URL, chemins d'images, blocs de code et HTML** ne sont pas modifiés
- Les **dates et auteurs** ne sont pas modifiés
- Les **valeurs textuelles du corps et du frontmatter** (title, description, callout, FAQ, etc.) sont traduites

### Workflow de traduction

Le processus de traduction est le suivant :

1. **Créer une version anglaise comme langue intermédiaire** : traduire l'original japonais en anglais
2. **Traduire de l'anglais vers chaque langue** : décliner la version anglaise en 7 langues
3. **Traitement par lots** : traiter les articles par lots de 5 à 6 avec GitHub Copilot

Cette traduction en 2 étapes, du japonais vers l'anglais puis vers chaque langue, limite les variations de qualité. L'utilisation de l'anglais comme langue intermédiaire a donné une qualité plus stable que la traduction directe du japonais vers chaque langue.

<figure class="article-diagram" data-layout="branches" data-tone="teal" data-count="3" aria-labelledby="diagram-astro-i18n-blog-translation">
  <figcaption>
    <strong id="diagram-astro-i18n-blog-translation">Vérifier les traductions par rapport à la dernière version du texte source japonais avant publication</strong>
    <span>Les URL publiques et les références destinées aux moteurs de recherche correspondent aux fichiers de traduction existants.</span>
  </figcaption>
  <ol class="article-diagram__nodes">
    <li>
      <span class="article-diagram__symbol">
        <span aria-hidden="true">1</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M6 3h8l4 4v14H6z M14 3v5h5 M9 12h6 M9 16h6"/></svg>
      </span>
      <strong>Mettre à jour le texte source japonais</strong>
      <span>Vérifiez les modifications du texte source japonais et identifiez d'abord les versions linguistiques concernées et les articles à revérifier.</span>
    </li>
    <li>
      <span class="article-diagram__symbol">
        <span aria-hidden="true">2</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z M3 12h18 M12 3a14 14 0 0 1 0 18 M12 3a14 14 0 0 0 0 18"/></svg>
      </span>
      <strong>Vérifier les traductions de chaque locale</strong>
      <span>Vérifiez le titre, la description et le corps, puis générez uniquement les URL des locales correspondant à des fichiers de traduction existants.</span>
    </li>
    <li>
      <span class="article-diagram__symbol">
        <span aria-hidden="true">3</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M6 3h8l4 4v14H6z M14 3v5h5 M8 16l8-8"/></svg>
      </span>
      <strong>Si aucun fichier de traduction n'existe</strong>
      <span>Ne créez ni URL, ni entrée sitemap ou hreflang pour cette locale. Les pages non traduites ne sont pas publiées automatiquement.</span>
    </li>
  </ol>
</figure>

## Prise en charge multilingue des composants View

### Implémentation de BlogPostPage

Sur les pages d'articles, nous récupérons le contenu de la locale avec `localizePost()` et l'affectons aux variables du modèle.

```astro
---
// src/views/BlogPostPage.astro
const localizedPost = localizePost(basePost, allPosts, locale);
const post = localizedPost; // テンプレートの既存参照がそのまま動く
---
```

Cette approche a permis la prise en charge multilingue sans modifier les références à `post.data.title` ou `post.body` dans le modèle.

### Adaptation des pages de liste

Dans les listes du blog, des tags et des auteurs ainsi que dans les archives, `isBasePost()` filtre uniquement les articles de base, puis `localizePost()` les remplace par leur version traduite à l'affichage.

```astro
---
const allPosts = await getCollection("blog");
const basePosts = allPosts.filter(isBasePost);
const displayPosts = basePosts.map((p) => localizePost(p, allPosts, locale));
---
```

## Problèmes YAML et d'images OG rencontrés lors du build

### Échappement du frontmatter YAML

Dans les traductions françaises, les apostrophes (`l'atelier`, `qu'on`, etc.) entraient en conflit avec les guillemets simples YAML.

```yaml
# NG：YAML パースエラー
title: 'Le métavers est plus proche qu'on ne le pense'

# OK：ダブルクォートに変更
title: "Le métavers est plus proche qu'on ne le pense"
```

Nous avons corrigé tous les fichiers en une opération à l'aide d'un script Node.js. Des expressions anglaises comme `Acecore's` posent le même problème : il faut donc faire attention au type de guillemets lors de la génération des fichiers de traduction.

### Filtrage des routes d'images OG

`/blog/og/[slug].png.ts` récupérait aussi les slugs des articles traduits (`en/aceserver-hijacked`, etc.), provoquant une erreur de paramètres. Le filtrage avec `isBasePost()` a résolu le problème.

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

## Prise en charge multilingue de Pages CMS

Pages CMS (`.pages.yml`) ne cible que les fichiers situés directement dans le répertoire indiqué par `path`. Nous avons donc enregistré les sous-répertoires de traduction comme collections distinctes.

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

Les libellés sont écrits dans chaque langue afin d'identifier immédiatement la langue de chaque collection dans le CMS.

## Interface de changement de langue

Nous avons ajouté le composant `LanguageSwitcher` à l'en-tête pour proposer une interface de changement de langue sur ordinateur et sur mobile. Le changement de langue mène à la locale correspondante de la même page. Lors de la première visite, le système détecte `navigator.language` du navigateur et effectue une redirection automatique.

## Affichage multilingue des tags

Les URL conservent les slugs japonais des tags des articles et **seuls les noms affichés sont traduits**. Cela évite de complexifier le routage tout en présentant les tags aux utilisateurs dans leur langue maternelle.

Les définitions des tags sont regroupées dans `src/content/tags/{tagId}.json`, chaque tag possédant `i18n.name`. La collection de tags devient ainsi la source de référence des traductions de tags, plutôt que les fichiers JSON de traduction.

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

Les cartes d'articles, la barre latérale, la liste des tags et les pages détaillées des articles consultent la collection de tags pour changer le nom affiché. Tous les tags sont ainsi affichés dans la langue correspondant à la locale.

## Prise en charge multilingue des données des auteurs

Nous avons également mis en place un système qui adapte à la langue le nom, la biographie et la liste des compétences des auteurs. Le champ `i18n` a été ajouté à `src/content/authors/{authorId}.json` pour stocker les traductions de chaque langue.

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

L'utilitaire `getLocalizedAuthor()` récupère les informations de l'auteur selon la locale.

```typescript
// src/utils/blog-i18n.ts
export function getLocalizedAuthor(author: Author, locale: Locale) {
  const localized = author.i18n?.[locale];
  return localized ? { ...author, ...localized } : author;
}
```

## Mise en œuvre du SEO multilingue

Pour maximiser les bénéfices SEO du multilinguisme, nous avons mis en place les mécanismes permettant aux moteurs de recherche de reconnaître et d'indexer correctement chaque version linguistique.

### Prise en charge de hreflang dans le sitemap

Nous configurons l'option `i18n` de `@astrojs/sitemap` ainsi qu'un filtre vérifiant l'existence des fichiers de traduction. Le sitemap ne répertorie que les versions linguistiques existantes et génère automatiquement les balises `xhtml:link rel="alternate"` correspondantes.

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

Pour un article disponible dans les 9 langues, les entrées hreflang des 9 langues sont générées. Pour un article sans traduction, seule l'URL japonaise est répertoriée : les versions inexistantes ne figurent ni dans le sitemap ni dans hreflang.

### Langue des données structurées JSON-LD

Nous avons ajouté le champ `inLanguage` aux données structurées `BlogPosting` des articles de blog afin d'indiquer aux moteurs de recherche la langue de chaque article.

```javascript
// BlogPostPage.astro（JSON-LD 抜粋）
{
  "@type": "BlogPosting",
  "inLanguage": htmlLangMap[locale],  // "ja", "en", "zh-CN" など
  "headline": post.data.title,
  // ...
}
```

### Flux RSS multilingues

En plus de `/rss.xml` pour la version japonaise, nous générons des flux RSS pour chaque langue (`/en/rss.xml`, `/zh-cn/rss.xml`, etc.). Les titres et descriptions des flux sont également traduits et la balise `<language>` fournit un code de langue conforme à BCP47.

```typescript
// src/pages/[locale]/rss.xml.ts
export const getStaticPaths = () =>
  locales
    .filter((l) => l !== defaultLocale)
    .map((l) => ({ params: { locale: l } }));
```

`<link rel="alternate" type="application/rss+xml">` dans `BaseLayout.astro` définit aussi automatiquement l'URL RSS correspondant à la locale.

## Conclusion

Dans l'implémentation du mois 7 de 2026, les fonctionnalités i18n intégrées à Astro 7.1.3 permettent de prendre en charge plusieurs langues même sur un site statique.

- **Infrastructure i18n** : pas de préfixe pour le japonais grâce à `prefixDefaultLocale: false` d'Astro
- **Traduction de l'interface** : aucune duplication de logique grâce au modèle de composant View
- **Traduction du contenu** : aucun changement du schéma existant grâce aux sous-répertoires
- **Traduction des tags** : les URL conservent les slugs japonais ; seuls les noms affichés sont traduits
- **Traduction des données des auteurs** : bio et skills adaptés à chaque langue
- **SEO** : hreflang dans le sitemap, `inLanguage` en JSON-LD et flux RSS multilingues
- **Locales non traduites** : aucune URL d'article générée ; la version japonaise reste publiée à son URL d'origine
- **Prise en charge du CMS** : modification séparée des articles de chaque langue dans Pages CMS

À l'avenir, les fichiers de traduction seront ajoutés progressivement lors de l'ajout de nouveaux articles. Jusqu'à la fin de la traduction, seule la version japonaise sera publiée. Les URL d'articles, le sitemap et hreflang seront activés pour chaque locale à mesure que son fichier de traduction sera ajouté.

## Ajout du 6 octobre 2026 (mois 10) : langue et erreurs des écrans d'authentification

Outre la traduction des articles publiés, les écrans d'authentification nécessitent une sélection cohérente de la langue. Dans une modification anonymisée, nous avons choisi successivement `ui_locales`, `Accept-Language`, puis la langue par défaut, avec une solution de repli sûre pour les valeurs non prises en charge. Les erreurs OIDC connues sont converties en messages d'affichage communs et les messages internes bruts ne sont pas affichés, même pour les erreurs inconnues.

Les libellés des pages, les erreurs provenant de l'API et les indications après l'inscription sont vérifiés ensemble. La prise en charge des 9 langues du blog ne signifie pas à elle seule que la recette de tous les écrans d'authentification et des parcours réels d'inscription est terminée.

La langue est également conservée pour la connexion, la gestion du compte, le consentement et les codes à usage unique ; la locale et l'état OIDC sont maintenus pendant les transitions. Nous distinguons le périmètre vérifié pour les URL, Content-Language et l'affichage sur écran étroit de la recette par les utilisateurs dans toutes les langues.
