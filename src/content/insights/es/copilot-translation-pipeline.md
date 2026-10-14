---
title: "Cómo gestionar un blog multilingüe con Sveltia CMS"
description: "Publicar ocho traducciones estáticas desde japonés: protección de cifras, URL y código en OpenAI Batch, validación completa antes de escribir, PR, CI y publicación conectada a GitHub."
date: 2026-06-07T17:00
lastUpdated: "2026-10-15T00:00:00+09:00"
author: gui
tags: ["Tecnología", "GitHub Copilot", "i18n", "CMS", "SEO"]
image: "/images/insights/covers/copilot-translation-pipeline-cover-v2.webp"
callout:
  type: tip
  title: Traducir la UI no es publicar contenido multilingüe
  text: "La traducción del navegador o de un widget ayuda a leer una página, pero no crea URLs, title, description, enlaces internos, RSS, sitemap ni hreflang por idioma. Para que los buscadores vean páginas localizadas, conviene publicar HTML estático traducido."
processFigure:
  eyebrow: Translation Workflow
  title: "Del origen japonés al PR de traducción validado"
  description: "Restaurar cifras, URL y código; validar todos los resultados antes de escribir."
  variant: inline
  steps:
    - title: "Editar japonés"
      description: "Usar main actual y agrupar cambios consecutivos."
      icon: i-lucide-file-pen-line
      accent: brand
    - title: "Proteger y enviar Batch"
      description: "Tokenizar cifras, URL, placeholders y código."
      icon: i-lucide-shield-check
      accent: amber
    - title: "Validar todo y escribir"
      description: "Comprobar sourceHash, tokens y contenido; detener y registrar fallos."
      icon: i-lucide-languages
      accent: emerald
    - title: "PR, CI y publicación"
      description: "Publicar con GitHub y revisar el contenido."
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
    - text: "Iniciar traducción desde cambios japoneses en main"
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

> **Comprobado el 14 de octubre de 2026:** La traducción actual usa OpenAI Batch. Los pasos de Copilot se conservan como registro de junio de 2026. Los diagramas y el flujo actuales protegen el origen y validan todos los resultados antes de escribir.

## Flujo actual: protección, validación y PR

En Systems, las actualizaciones japonesas de artículos o UI en main esperan 15 minutos antes de que el [workflow de envío](https://github.com/acecore-systems/acecore-systems/blob/main/.github/workflows/submit-openai-translation-batch.yml) use main actual. La [recogida](https://github.com/acecore-systems/acecore-systems/blob/main/.github/workflows/collect-openai-translation-batch.yml), prevista a los minutos 2, 17, 32 y 47 de cada hora, coteja sourceHash y crea un PR. La [integración](https://github.com/acecore-systems/acecore-systems/blob/main/.github/workflows/merge-openai-translation-pr.yml) lleva los PR válidos por CI y publicación conectada a GitHub. Hora programada, final del Batch, merge y publicación son estados distintos.

Antes del envío, cifras, URL, placeholders existentes, inline code y fenced code se sustituyen por tokens únicos. Al recoger, se restaura el texto del origen japonés coincidente y se rechazan tokens ausentes, duplicados, alterados o añadidos. La protección evita cambios del modelo en estos detalles y mantiene validación posterior y revisión de contenido.

La [documentación de OpenAI Batch](https://developers.openai.com/api/docs/guides/batch) indica que el orden de salida puede variar; `custom_id` identifica idioma, source path y sourceHash. El [cambio de protección y recogida](https://github.com/acecore-systems/acecore-systems/pull/131) valida todos los resultados antes de escribir. Un error, duplicado u origen obsoleto posterior no deja traducciones anteriores aplicadas parcialmente. Un artifact registra idioma, source path, Batch ID y causa. No garantiza una transacción de archivos ante fallos de disco durante la escritura.

Se verificaron 27 pruebas y una ida y vuelta offline de 55 fuentes japonesas × 8 locales, 440 resultados. No fue una retraducción completa con nuevas llamadas al modelo. Las traducciones existentes se revisan con el japonés en el mismo PR y después se actualiza el hash del origen formateado; no se cambia solo el hash.

<figure class="article-diagram" data-layout="flow" data-tone="green" data-count="3" aria-labelledby="diagram-copilot-translation-pipeline">
  <figcaption>
    <strong id="diagram-copilot-translation-pipeline">Cotejar origen protegido y todos los resultados</strong>
    <span>Un fallo no debe actualizar solo algunos idiomas. Batch terminado no significa publicado.</span>
  </figcaption>
  <ol class="article-diagram__nodes">
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">1</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M5 3h10l4 4v14H5z"/><path d="M15 3v5h5M8 12h8M8 16h6"/></svg></span>
      <strong>Proteger origen</strong>
      <span>Tokens únicos para cifras, URL y código.</span>
    </li>
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">2</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5M8 10l2 2 3-4"/></svg></span>
      <strong>Validar origen actual y resultados</strong>
      <span>Cotejar custom_id, sourceHash y tokens; restaurar.</span>
    </li>
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">3</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/></svg></span>
      <strong>PR al flujo de publicación</strong>
      <span>Escribir tras validar, luego CI y revisión.</span>
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
