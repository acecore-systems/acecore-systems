---
title: "Cómo gestionar un blog multilingüe con Sveltia CMS"
description: "Para iniciar un flujo multilingüe, genera HTML localizado desde las traducciones de un artículo representativo y revisa texto, title, description y enlaces internos."
date: 2026-06-07T17:00
lastUpdated: "2026-10-09T15:00:00+09:00"
author: gui
tags: ["Tecnología", "GitHub Copilot", "i18n", "CMS", "SEO"]
image: "/images/insights/covers/copilot-translation-pipeline-cover-v2.webp"
callout:
  type: tip
  title: Traducir la UI no es publicar contenido multilingüe
  text: "La traducción del navegador o de un widget ayuda a leer una página, pero no crea URLs, title, description, enlaces internos, RSS, sitemap ni hreflang por idioma. Para que los buscadores vean páginas localizadas, conviene publicar HTML estático traducido."
processFigure:
  eyebrow: Translation Workflow
  title: De Sveltia CMS a los PR de traducción (flujo de junio de 2026)
  description: El japonés se mantiene como source of truth y la traducción se separa en el flujo de PR de GitHub.
  variant: inline
  steps:
    - title: Editar solo japonés
      description: Actualizar `src/content/blog/{slug}.md` mediante Sveltia CMS o Markdown.
      icon: i-lucide-file-pen-line
      accent: brand
    - title: Detectar el commit del CMS
      description: "Convertir el prefix `cms:` y el path modificado en el contrato del lado de GitHub Actions."
      icon: i-lucide-git-commit-horizontal
      accent: amber
    - title: Crear una PR de traducción
      description: Entregar a Copilot el source path, el locale y las reglas de traducción para que genere los archivos traducidos.
      icon: i-lucide-languages
      accent: emerald
    - title: Aplicar después del build
      description: Incorporar a main solo las PR que superen Astro build, Pagefind y la comprobación de enlaces.
      icon: i-lucide-check-check
      accent: slate
compareTable:
  title: Diferencia entre traducir la interfaz y generar páginas específicas por idioma
  before:
    label: Traducción de la interfaz
    items:
      - "El navegador o widget de traducción del usuario traduce al mostrar la página"
      - "La URL, title, description y OGP suelen permanecer en el idioma original"
      - "Es difícil incluir páginas específicas por idioma en sitemap, RSS y hreflang"
      - "El texto mostrado en URL compartidas y resultados de búsqueda se inclina al idioma original"
  after:
    label: Páginas multilingües estáticas
    items:
      - "Se pueden publicar URL por idioma como `/{locale}/blog/{slug}/`"
      - "title, description, cuerpo, FAQ y datos estructurados pueden mantenerse por idioma"
      - "hreflang comunica a los buscadores la relación entre las versiones lingüísticas"
      - "RSS, sitemap, enlaces internos y Search Console pueden revisarse por idioma"
checklist:
  title: Decisiones que deben tomarse al adoptar el flujo
  items:
    - text: "Tratar el artículo japonés como fuente de traducción"
      checked: true
    - text: "Mantener el slug de los archivos traducidos igual al del artículo japonés"
      checked: true
    - text: "Fijar las condiciones de activación del workflow, como los commits `cms:`"
      checked: true
    - text: "No romper URL, path de imágenes, bloques de código ni ID de etiquetas al traducir"
      checked: true
    - text: "Comprobar en el build la salida de hreflang, canonical, RSS y sitemap"
      checked: true
linkCards:
  - href: /es/blog/cms-selection-and-turnstile/
    title: Guía de instalación de Sveltia CMS
    description: Implementación de Sveltia CMS en un sitio estático Astro.
    icon: i-lucide-badge-check
  - href: /es/blog/astro-i18n-blog-translation/
    title: Arquitectura multilingüe con Astro
    description: Rutas, fallback, hreflang, RSS y sitemap para 9 idiomas.
    icon: i-lucide-globe-2
faq:
  title: Preguntas frecuentes
  items:
    - question: ¿Basta con traducir la interfaz?
      answer: "Sirve para que una persona lea la página, pero no crea activos SEO por idioma. Si necesitas URLs, metadatos, RSS, sitemap y enlaces internos localizados, necesitas páginas traducidas reales."
    - question: ¿La traducción con IA perjudica el SEO?
      answer: "El problema no es usar IA, sino publicar muchas páginas sin valor. Hay que revisar terminología, enlaces, datos y naturalidad antes de publicar."
    - question: ¿Las páginas traducidas son contenido duplicado?
      answer: "Google indica que las versiones localizadas solo son duplicadas si el contenido principal no está traducido. Mantén las variantes conectadas con hreflang."
---

Para iniciar un flujo multilingüe, genera HTML localizado desde las traducciones de un artículo representativo y revisa texto, title, description y enlaces internos. Relaciona solo versiones existentes según [Google: Localized Versions](https://developers.google.com/search/docs/specialty/international/localized-versions); verifica por separado el éxito del servicio y las páginas públicas terminadas.

> **Actualización del 26 de septiembre de 2026:** Los pasos con Copilot que siguen documentan la implantación de junio de 2026. La generación de traducciones pasó a OpenAI Batch. El japonés sigue siendo la fuente principal y las páginas estáticas traducidas siguen siendo el formato de publicación.

## Flujo actual de traducción (septiembre de 2026)

Cuando cambia un artículo o texto de UI en japonés en main, se inicia el [flujo de envío del Batch](https://github.com/acecore-systems/acecore-net/blob/main/.github/workflows/submit-openai-translation-batch.yml). Espera 15 minutos por cambios adicionales, comprueba el main actual y envía la traducción. El [flujo de recogida](https://github.com/acecore-systems/acecore-net/blob/main/.github/workflows/collect-openai-translation-batch.yml) compara los resultados con el sourceHash actual, descarta resultados antiguos y crea un PR de traducción. El [flujo de integración](https://github.com/acecore-systems/acecore-net/blob/main/.github/workflows/merge-translation-pr.yml) activa la integración automática solo para PR que cumplen los requisitos. Aún hay que revisar términos, enlaces, hechos y naturalidad.

<figure class="article-diagram" data-layout="flow" data-tone="green" data-count="3" aria-labelledby="diagram-copilot-translation-pipeline">
  <figcaption>
    <strong id="diagram-copilot-translation-pipeline">Comparar la traducción con la fuente japonesa actual</strong>
    <span>Se excluyen los resultados Batch de fuentes obsoletas. Aunque el PR cumpla las condiciones, hay que revisar términos, enlaces, hechos y naturalidad.</span>
  </figcaption>
  <ol class="article-diagram__nodes">
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">1</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M5 3h10l4 4v14H5z"/><path d="M15 3v5h5M8 12h8M8 16h6"/></svg></span>
      <strong>Actualizar la fuente japonesa</strong>
      <span>Un cambio de source en main activa un Batch de traducción.</span>
    </li>
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">2</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5M8 10l2 2 3-4"/></svg></span>
      <strong>Comparar sourceHash</strong>
      <span>Al recopilar, se descartan resultados que ya no coinciden con la fuente actual.</span>
    </li>
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">3</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M6 4v6a3 3 0 0 0 3 3h6a3 3 0 0 1 3 3v4"/><path d="M18 4v3a3 3 0 0 1-3 3H9a3 3 0 0 0-3 3v7"/></svg></span>
      <strong>Integrar el PR de traducción</strong>
      <span>La validación puede activar la integración automática; el contenido requiere revisión aparte.</span>
    </li>
  </ol>
</figure>

## Registro de la implantación de junio de 2026

Acecore edita su contenido principalmente en japonés, pero publica el blog en 9 idiomas. La diferencia importante es que **traducir texto en la pantalla** y **publicar páginas localizadas** no son lo mismo.

La traducción del navegador o un widget puede ayudar al lector. Pero no genera `/en/blog/.../`, `/es/blog/.../`, metadatos localizados, RSS, sitemap ni enlaces `hreflang`.

Si el objetivo incluye tráfico de búsqueda, la traducción debe formar parte del proceso de publicación, no solo de la capa visual.

## Estructura usada

El sitio sigue esta convención:

- Fuente japonesa: `src/content/blog/{slug}.md`
- Traducciones: `src/content/blog/{locale}/{slug}.md`
- URLs: `/blog/{slug}/`, `/en/blog/{slug}/`, `/es/blog/{slug}/`, etc.
- Edición: Sveltia CMS
- Traducción: PRs de GitHub Copilot
- Publicación: build y revisión

Sveltia CMS es la entrada para editar el contenido japonés. Las traducciones se gestionan como pull requests para conservar historial, revisión y CI.

## Cuándo sirve la traducción de UI

La traducción de UI es suficiente para lectura interna, consultas puntuales, pantallas de administración, páginas que no buscan SEO o contenidos cuya calidad de traducción no se mantiene como parte del sitio.

Es ligera porque no crea archivos traducidos. Justamente por eso tampoco crea páginas indexables por idioma.

## Ventajas SEO de las páginas estáticas localizadas

Los buscadores y las previsualizaciones sociales trabajan principalmente con URLs y HTML.

Si solo existe la página japonesa, el title, description, datos estructurados, RSS y sitemap seguirán perteneciendo a esa página, aunque el navegador traduzca el texto al usuario.

Con páginas estáticas localizadas, cada idioma tiene una URL:

```txt
/blog/copilot-translation-pipeline/
/en/blog/copilot-translation-pipeline/
/es/blog/copilot-translation-pipeline/
/fr/blog/copilot-translation-pipeline/
```

### 1. Cada idioma se puede rastrear directamente

Google puede procesar JavaScript, pero su documentación también explica que JavaScript tiene limitaciones y recomienda renderizado estático o del lado servidor como opciones más estables. Además, otros crawlers, lectores RSS o vistas previas pueden ser menos capaces.

### 2. Los metadatos se traducen

El frontmatter también puede localizarse:

```yaml
title: "Cómo gestionar un blog multilingüe con Sveltia CMS"
description: "Flujo para generar PRs de traducción con GitHub Copilot."
```

Esto afecta resultados de búsqueda, OGP, tarjetas relacionadas y RSS.

### 3. hreflang puede conectar variantes

Google recomienda `hreflang` cuando diferentes URLs representan diferentes idiomas o regiones. Con solo traducción de UI no hay URL localizada que conectar.

### 4. RSS y sitemap también son multilingües

Al existir archivos por idioma, el sitio puede generar `/es/rss.xml` y entradas localizadas en sitemap. Esto ayuda a buscadores, lectores RSS y servicios externos.

## Papel de Sveltia CMS

Sveltia CMS no es el motor de traducción. En este flujo, mantiene limpio el punto de edición del contenido japonés:

- artículos japoneses
- autores
- etiquetas
- JSON fuente en japonés
- imágenes
- frontmatter como fecha, FAQ y linkCards

La instalación de CMS está explicada en [Guía de instalación de Sveltia CMS](/es/blog/cms-selection-and-turnstile/).

## Reglas para Copilot

La tarea de traducción debe separar qué se traduce y qué se conserva.

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
- link card text
- body text
- internal blog URLs when locale-specific URLs exist
```

Markdown mezcla texto, URLs, código y frontmatter. Sin reglas, se rompen enlaces o taxonomías.

## Lecciones de los PRs

- El sitio ya usaba Sveltia CMS, pero artículos antiguos seguían mencionando Pages CMS.
- Si `date` queda viejo, el artículo no sube al inicio del blog aunque se reescriba.
- El slug traducido debe coincidir con el original.
- Los enlaces internos en una traducción deben apuntar al locale correcto.
- La IA acelera, pero la revisión humana sigue siendo necesaria.

## Referencias

- [Google Search Central: Localized Versions of your Pages](https://developers.google.com/search/docs/advanced/crawling/localized-versions?hl=en&rd=1&visit_id=638856769088389068-716743185)
- [Google Search Central: Managing Multi-Regional and Multilingual Sites](https://developers.google.com/search/docs/advanced/crawling/managing-multi-regional-sites)
- [Google Search Central: JavaScript SEO Basics](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics)
- [Google Search Central: Spam Policies](https://developers.google.com/search/docs/essentials/spam-policies)
- [Guía de instalación de Sveltia CMS](/es/blog/cms-selection-and-turnstile/)

## Resumen

La traducción de UI ayuda a leer una página. Las páginas estáticas localizadas convierten cada idioma en un activo real del sitio.

La separación es sencilla: Sveltia CMS edita el japonés, Copilot genera PRs de traducción y Astro build verifica que las páginas localizadas funcionen.
