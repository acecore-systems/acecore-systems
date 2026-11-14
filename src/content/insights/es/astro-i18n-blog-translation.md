---
title: "Cómo adaptar un blog de Astro a 9 idiomas: implementación de traducciones, URL y hreflang"
description: "Registro de la implementación de un blog de Astro en 9 idiomas. Explica el diseño de URL con prefixDefaultLocale, la ubicación de los archivos de traducción, las condiciones para no generar URL de artículos, sitemap ni hreflang en idiomas sin traducción, el cambio de visualización mediante componentes View y las consideraciones sobre imágenes OG, CMS y RSS. Distingue la configuración de 7 de 2026 de los cambios actuales y ofrece criterios para evaluar una configuración similar."
date: 2026-03-25T10:00
lastUpdated: "2026-10-25T06:10:55Z"
author: gui
tags: ["Tecnología", "Astro", "i18n", "Sitios web"]
image: "/images/insights/covers/astro-i18n-blog-translation-cover-v2.webp"
processFigure:
  title: Proceso de adaptación multilingüe
  steps:
    - title: Construcción de la base de i18n
      description: Configuración del enrutamiento i18n integrado de Astro y de las utilidades de traducción.
      icon: i-lucide-globe
    - title: Traducción de textos de la interfaz
      description: Adaptación multilingüe de los textos visibles del encabezado, el pie de página y todos los componentes.
      icon: i-lucide-languages
    - title: Traducción de artículos del blog
      description: En la implementación inicial se generaron 21 artículos × 8 idiomas = 168 archivos de traducción.
      icon: i-lucide-file-text
    - title: Validación del CMS y de la compilación
      description: Adaptación multilingüe de Pages CMS y validación de la compilación de todas las páginas.
      icon: i-lucide-check-circle
compareTable:
  title: Comparación antes y después de la adaptación multilingüe
  before:
    label: Solo japonés
    items:
      - Solo 1 idioma, japonés
      - 23 artículos de blog
      - 523 páginas generadas (tras la adaptación multilingüe de la interfaz)
      - 1 colección de blog en Pages CMS
      - Datos de etiquetas y autores solo en japonés
      - 1 feed RSS
  after:
    label: "Compatibilidad con 9 idiomas (implementación inicial)"
    items:
      - Japonés + 8 idiomas (en, zh-cn, es, pt, fr, ko, de, ru)
      - 23 artículos de blog + 168 traducciones = 191 artículos
      - 621 páginas generadas (implementación inicial)
      - 9 colecciones por idioma en Pages CMS
      - 25 tipos de etiquetas y datos de autores traducidos a cada idioma
      - Feeds RSS multilingües (para 9 idiomas)
callout:
  type: info
  title: Idiomas compatibles
  text: "Se admiten 9 idiomas: japonés (predeterminado), inglés, chino simplificado, español, portugués, francés, coreano, alemán y ruso."
statBar:
  items:
    - value: "9"
      label: Idiomas compatibles
    - value: "208"
      label: Artículos traducidos (a 29 de 7 de 2026)
    - value: "652"
      label: Páginas generadas (a 29 de 7 de 2026)
faq:
  title: Preguntas frecuentes
  items:
    - question: ¿Por qué se eligieron 9 idiomas?
      answer: "Para maximizar el alcance global, cubrimos las principales comunidades lingüísticas del mundo. El inglés, el chino, el español y el portugués cubren gran parte de la población que usa internet; el francés, el alemán, el ruso y el coreano completan los principales mercados restantes."
    - question: ¿Cómo se garantiza la calidad de las traducciones?
      answer: "Adoptamos la traducción mediante IA con GitHub Copilot. Creamos una versión en inglés como idioma intermedio y, a partir de ella, traducimos a los demás idiomas para reducir las variaciones de calidad. Los valores de las etiquetas del frontmatter se mantienen en japonés y las URL, los bloques de código y las rutas de imágenes no se modifican. Este era el método utilizado en 7 de 2026. La generación actual de traducciones utiliza OpenAI Batch."
    - question: ¿Qué sucede si no existe un artículo traducido?
      answer: "No se genera la URL del artículo para los idiomas que no tienen archivo de traducción. La versión japonesa sigue publicada en su URL original y, al cambiar de idioma, se accede a la lista del blog del idioma seleccionado."
    - question: ¿Es necesario traducir cada artículo nuevo?
      answer: "La traducción no es obligatoria para publicar la versión japonesa. Si se añade una traducción, basta con colocar un archivo Markdown con el mismo nombre en el directorio del idioma correspondiente para que se generen la URL del artículo, el sitemap y hreflang de ese idioma."
---

Este registro de implementación está dirigido a quienes quieren adaptar un blog japonés de Astro a varios idiomas sin comprometer las URL de los artículos traducidos, el cambio de idioma, el sitemap ni hreflang. Comience por un artículo representativo: alinee el texto, los metadatos y el cambio de idioma, y compruebe que no se dirija a páginas sin traducir. Utilice [Astro: Internationalization Routing](https://docs.astro.build/en/guides/internationalization/) como referencia para el diseño de URL y amplíe gradualmente las traducciones de la interfaz y de los artículos por separado. Las cifras y la antigua configuración del CMS que aparecen a continuación corresponden a la implementación inicial.

> **Actualización del 26 de 9 de 2026:** Astro 7.1.3, las cifras de artículos y las traducciones con Copilot que se mencionan en el texto corresponden a 7 de 2026. La [declaración actual de dependencias](https://github.com/acecore-systems/acecore-net/blob/main/package.json) utiliza Astro ^7.3.3 y Tailwind CSS 4.3.3; el proceso de traducción se describe en el [artículo sobre la actualización a OpenAI Batch](/insights/copilot-translation-pipeline/). Antes de utilizar los ejemplos y cifras siguientes como configuración actual, consulte el código fuente vigente y las páginas publicadas.

## Registro de implementación a 7 de 2026

Actualizamos el sitio oficial de Acecore de un sitio solo en japonés a uno compatible con 9 idiomas. En la implementación inicial tradujimos 21 artículos × 8 idiomas = 168 traducciones. A 29 de 7 de 2026, había 29 artículos japoneses y 208 traducciones, para un total de 237 artículos, y la compilación generaba 652 páginas. No generamos URL de artículos para los idiomas sin traducción y publicamos únicamente las versiones existentes.

## Estrategia multilingüe y diseño de URL

Abordamos los siguientes 3 ámbitos por etapas.

1. **Construcción de la base de i18n**: configuración del enrutamiento i18n integrado de Astro, utilidades de traducción y archivos JSON de traducción para 9 idiomas
2. **Traducción de textos de la interfaz**: textos del encabezado, pie de página, barra lateral y componentes de todas las páginas
3. **Traducción de artículos del blog**: en la implementación inicial se tradujeron 21 artículos a 8 idiomas (se generaron 168 archivos)

### Diseño de URL

Adoptamos `prefixDefaultLocale: false` de Astro: el japonés se sirve directamente desde la raíz (`/blog/...`) y los demás idiomas con un prefijo (`/en/blog/...`, `/zh-cn/blog/...`, etc.).

```
# 日本語（デフォルト）
/blog/astro-performance-tuning/

# 英語
/en/blog/astro-performance-tuning/

# 簡体字中国語
/zh-cn/blog/astro-performance-tuning/
```

Como se utiliza el mismo slug en todos los idiomas, la correspondencia entre URL al cambiar de idioma es sencilla.

La automatización con Copilot para mantener el proceso de traducción se describe en [Cómo gestionar un blog multilingüe con Sveltia CMS](/insights/copilot-translation-pipeline/).

## Configurar la base de i18n de Astro

### Configuración de i18n de Astro

Configure el enrutamiento i18n en `astro.config.mjs`.

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

### Utilidades de traducción

Agrupamos los archivos de configuración, las funciones de utilidad y los JSON de traducción en `src/i18n/`.

```typescript
// src/i18n/utils.ts
export function t(locale: Locale, key: string): string {
  return translations[locale]?.[key] ?? translations[defaultLocale][key] ?? key;
}
```

Los archivos de traducción de cada idioma están en formato JSON en `src/i18n/locales/`. Gestionamos aproximadamente 100 claves para la navegación, el pie de página, la interfaz del blog, los metadatos y otros elementos.

### Patrón de componentes View

Para implementar las páginas utilizamos el **patrón de componentes View**. Agrupamos el diseño y la lógica en `src/views/`, mientras que los archivos de ruta (`src/pages/`) son envoltorios ligeros que solo pasan el locale.

```astro
---
// src/pages/[locale]/about.astro（ルートファイル）
import AboutPage from "../../views/AboutPage.astro";
const { locale } = Astro.params;
---

<AboutPage locale={locale} />
```

Este diseño elimina la duplicación de lógica entre la ruta japonesa (`/about`) y la ruta multilingüe (`/en/about`).

## Traducir artículos del blog en directorios por idioma

### Estructura de directorios

Los artículos traducidos se colocan en subdirectorios identificados por el código de idioma. El cargador glob de Astro los detecta automáticamente de forma recursiva mediante el patrón `**/*.md`. La [Content Loader API](https://docs.astro.build/en/reference/content-loader-reference/) de Astro explica que se puede especificar un globstar como `**/*.md` en `pattern` del cargador `glob()` para cargar archivos Markdown y otros contenidos desde directorios.

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

### Utilidades de resolución de contenido

Implementamos 3 funciones en `src/utils/blog-i18n.ts`.

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

Como medida de seguridad, `localizePost()` devuelve el original, pero las rutas públicas y los listados utilizan `isPostAvailableInLocale()` y filtros para incluir únicamente traducciones existentes. Por tanto, no se generan URL de artículos para idiomas sin traducción.

La clave es **no modificar el esquema existente de la colección de contenidos**. El cargador glob de Astro reconoce automáticamente los archivos de los subdirectorios con ID como `en/astro-performance-tuning`, por lo que no fue necesario cambiar la configuración.

### Reglas para los archivos de traducción

Los archivos de traducción se generaron con las siguientes reglas:

- Las **claves del frontmatter** permanecen en inglés (`title`, `description`, `date`, etc.)
- Los **valores de las etiquetas** se mantienen en japonés (`['技術', 'Astro']`, etc.)
- Las **URL, rutas de imágenes, bloques de código y HTML** no se modifican
- Las **fechas y autores** no se modifican
- Se traducen el **cuerpo y los valores de texto del frontmatter** (title, description, callout, FAQ, etc.)

### Flujo de traducción

El proceso de traducción es el siguiente:

1. **Crear una versión inglesa como idioma intermedio**: traducir el original japonés al inglés
2. **Traducir del inglés a cada idioma**: usar el inglés como punto de partida para llegar a 7 idiomas
3. **Procesamiento por lotes**: procesar lotes de 5 a 6 artículos con GitHub Copilot

La traducción en 2 etapas, japonés → inglés → cada idioma, reduce las variaciones de calidad. Utilizar el inglés como idioma intermedio produjo una calidad más estable que traducir directamente del japonés a cada idioma.

<figure class="article-diagram" data-layout="branches" data-tone="teal" data-count="3" aria-labelledby="diagram-astro-i18n-blog-translation">
  <figcaption>
    <strong id="diagram-astro-i18n-blog-translation">Comprobar las traducciones frente a la fuente japonesa más reciente antes de publicar</strong>
    <span>Las URL públicas y las referencias para buscadores se ajustan a los archivos de traducción existentes.</span>
  </figcaption>
  <ol class="article-diagram__nodes">
    <li>
      <span class="article-diagram__symbol">
        <span aria-hidden="true">1</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M6 3h8l4 4v14H6z M14 3v5h5 M9 12h6 M9 16h6"/></svg>
      </span>
      <strong>Actualizar la fuente japonesa</strong>
      <span>Compruebe los cambios en la fuente japonesa e identifique primero las versiones afectadas y los artículos que deben revisarse.</span>
    </li>
    <li>
      <span class="article-diagram__symbol">
        <span aria-hidden="true">2</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z M3 12h18 M12 3a14 14 0 0 1 0 18 M12 3a14 14 0 0 0 0 18"/></svg>
      </span>
      <strong>Comprobar la traducción de cada locale</strong>
      <span>Revise title, description y el cuerpo, y genere únicamente las URL de los locales con archivos de traducción existentes.</span>
    </li>
    <li>
      <span class="article-diagram__symbol">
        <span aria-hidden="true">3</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M6 3h8l4 4v14H6z M14 3v5h5 M8 16l8-8"/></svg>
      </span>
      <strong>Si no existe un archivo de traducción</strong>
      <span>No se crean la URL, el sitemap ni hreflang para ese locale. Las páginas sin traducir no se publican automáticamente.</span>
    </li>
  </ol>
</figure>

## Adaptación multilingüe de los componentes View

### Implementación de BlogPostPage

En la página de un artículo del blog, obtenemos el contenido del locale con `localizePost()` y lo asignamos a las variables de la plantilla.

```astro
---
// src/views/BlogPostPage.astro
const localizedPost = localizePost(basePost, allPosts, locale);
const post = localizedPost; // テンプレートの既存参照がそのまま動く
---
```

Este enfoque permitió añadir compatibilidad multilingüe sin modificar ninguna referencia a `post.data.title` o `post.body` en la plantilla.

### Adaptación de las páginas de listado

En las páginas de listado del blog, etiquetas, autores y archivo, filtramos únicamente los artículos base con `isBasePost()` y los sustituimos por su versión traducida al mostrarlos mediante `localizePost()`.

```astro
---
const allPosts = await getCollection("blog");
const basePosts = allPosts.filter(isBasePost);
const displayPosts = basePosts.map((p) => localizePost(p, allPosts, locale));
---
```

## Problemas de YAML e imágenes OG durante la compilación

### Escape del frontmatter YAML

En las traducciones al francés surgió un problema: los apóstrofos (`l'atelier`, `qu'on`, etc.) entraban en conflicto con las comillas simples de YAML.

```yaml
# NG：YAML パースエラー
title: 'Le métavers est plus proche qu'on ne le pense'

# OK：ダブルクォートに変更
title: "Le métavers est plus proche qu'on ne le pense"
```

Corregimos todos los archivos en bloque con un script de Node.js. Expresiones inglesas como `Acecore's` presentan el mismo problema, por lo que hay que prestar atención al tipo de comillas al generar los archivos de traducción.

### Filtrado de rutas de imágenes OG

`/blog/og/[slug].png.ts` también capturaba los slugs de los artículos traducidos (`en/aceserver-hijacked`, etc.), lo que provocaba errores de parámetros. Lo resolvimos filtrando con `isBasePost()`.

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

## Adaptación multilingüe de Pages CMS

Pages CMS (`.pages.yml`) solo incluye los archivos situados directamente en el directorio especificado por `path`, por lo que registramos los subdirectorios de traducción como colecciones independientes.

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

Al escribir las etiquetas en cada idioma, se puede identificar de un vistazo a qué idioma corresponde cada colección en el CMS.

## Interfaz de cambio de idioma

Añadimos el componente `LanguageSwitcher` al encabezado e implementamos una interfaz de cambio de idioma compatible con escritorio y móvil. Al cambiar de idioma se accede al locale correspondiente de la misma página y, en la primera visita, se detecta `navigator.language` del navegador para redirigir automáticamente.

## Visualización multilingüe de etiquetas

En las URL de las etiquetas de artículos conservamos los slugs japoneses y **traducimos únicamente el nombre visible**. Así evitamos complicar el enrutamiento y mostramos las etiquetas a los usuarios en su idioma.

Las definiciones de etiquetas se agrupan en `src/content/tags/{tagId}.json`, y cada etiqueta tiene `i18n.name`. De este modo, la fuente de referencia de las traducciones de etiquetas pasa del JSON de traducción a la colección de etiquetas.

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

Las tarjetas de artículos, la barra lateral, el listado de etiquetas y los detalles de artículos consultan la colección de etiquetas para cambiar el nombre visible, de modo que todas las etiquetas se muestran de forma coherente en el idioma del locale.

## Adaptación multilingüe de los datos de autores

También incorporamos un mecanismo para cambiar el nombre, la biografía y la lista de habilidades de cada autor según el idioma. Añadimos el campo `i18n` a `src/content/authors/{authorId}.json` para conservar las traducciones de cada idioma.

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

La utilidad `getLocalizedAuthor()` obtiene la información del autor correspondiente al locale.

```typescript
// src/utils/blog-i18n.ts
export function getLocalizedAuthor(author: Author, locale: Locale) {
  const localized = author.i18n?.[locale];
  return localized ? { ...author, ...localized } : author;
}
```

## Implementación de SEO multilingüe

Para maximizar los beneficios SEO de la adaptación multilingüe, configuramos mecanismos que permiten a los motores de búsqueda reconocer e indexar correctamente cada versión lingüística.

### Compatibilidad con hreflang en el sitemap

Configuramos la opción `i18n` de `@astrojs/sitemap` y un filtro que comprueba la existencia de archivos de traducción. El sitemap incluye únicamente las versiones lingüísticas existentes y genera automáticamente las etiquetas `xhtml:link rel="alternate"` correspondientes.

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

Para los artículos disponibles en los 9 idiomas se genera hreflang para los 9 idiomas. Los artículos sin traducción solo incluyen la URL japonesa; las versiones inexistentes no se incluyen en el sitemap ni en hreflang.

### Idioma en los datos estructurados JSON-LD

Añadimos el campo `inLanguage` a los datos estructurados `BlogPosting` de los artículos para indicar a los motores de búsqueda en qué idioma está escrito cada uno.

```javascript
// BlogPostPage.astro（JSON-LD 抜粋）
{
  "@type": "BlogPosting",
  "inLanguage": htmlLangMap[locale],  // "ja", "en", "zh-CN" など
  "headline": post.data.title,
  // ...
}
```

### Feeds RSS multilingües

Además de `/rss.xml` para la versión japonesa, generamos feeds RSS para cada idioma (`/en/rss.xml`, `/zh-cn/rss.xml`, etc.). También traducimos el título y la descripción del feed a cada idioma y generamos códigos de idioma conformes con BCP47 en la etiqueta `<language>`.

```typescript
// src/pages/[locale]/rss.xml.ts
export const getStaticPaths = () =>
  locales
    .filter((l) => l !== defaultLocale)
    .map((l) => ({ params: { locale: l } }));
```

`<link rel="alternate" type="application/rss+xml">` de `BaseLayout.astro` también configura automáticamente la URL RSS correspondiente al locale.

## Resumen

En la implementación de 7 de 2026, aprovechamos las funciones i18n integradas de Astro 7.1.3 para ofrecer compatibilidad multilingüe incluso en un sitio estático.

- **Base de i18n**: japonés sin prefijo mediante `prefixDefaultLocale: false` de Astro
- **Traducción de la interfaz**: el patrón de componentes View elimina la duplicación de lógica
- **Traducción de contenido**: el uso de subdirectorios no requiere cambiar el esquema existente
- **Traducción de etiquetas**: las URL conservan los slugs japoneses y solo se traducen los nombres visibles
- **Traducción de datos de autores**: bio y skills cambian según el idioma
- **SEO**: hreflang en el sitemap, `inLanguage` en JSON-LD y feeds RSS multilingües
- **Idiomas sin traducción**: no se generan URL de artículos y la versión japonesa permanece publicada en su URL original
- **Compatibilidad con CMS**: Pages CMS permite editar por separado los artículos de cada idioma

En adelante, al añadir artículos nuevos, también incorporaremos los archivos de traducción progresivamente. Hasta que se complete la traducción, solo se publicará la versión japonesa; las URL de artículos, el sitemap y hreflang se habilitarán para cada locale a medida que se añadan sus archivos de traducción.

## Actualización del 6 de 10 de 2026: idioma y errores en las pantallas de autenticación

Además de traducir los artículos publicados, es necesario seleccionar el idioma de forma coherente en las pantallas de autenticación. En una modificación anonimizada, seleccionamos por orden el `ui_locales` compatible, `Accept-Language` y el idioma predeterminado, con una alternativa segura para los valores no admitidos. Los errores conocidos de OIDC se convierten en mensajes de visualización comunes y, para los errores desconocidos, no se muestran mensajes internos sin procesar.

Comprobamos conjuntamente las etiquetas de la página, los errores recibidos a través de la API y las indicaciones posteriores al registro. La compatibilidad del blog con 9 idiomas por sí sola no significa que se haya completado la aceptación de todas las pantallas de autenticación ni de los flujos de registro reales.

El idioma también se mantiene durante el inicio de sesión, la gestión de la cuenta, el consentimiento y el uso de códigos de un solo uso, conservando el locale y el state de OIDC durante las transiciones. Distinguimos entre el alcance de las comprobaciones conjuntas de URL, Content-Language y visualización en pantallas estrechas, y la aceptación por usuarios de todos los idiomas.
