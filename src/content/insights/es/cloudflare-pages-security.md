---
title: "Encabezados de seguridad en Cloudflare Pages: diferencias entre _headers
  y Functions"
description: "Cómo diagnosticar los encabezados de seguridad que no se aplican
  en Cloudflare Pages: diferencias entre _headers para recursos estáticos y
  Response de Functions, dónde revisar la configuración actual y qué comprobar
  tras publicar."
date: 2026-03-15T00:00
author: gui
tags: ["Tecnología", "Cloudflare", "Seguridad"]
image: "/images/insights/covers/cloudflare-pages-security-cover-v2.webp"
lastUpdated: "2026-10-20T09:59:18Z"
---

Si la configuración de CSP o caché no se aplica en Cloudflare Pages, lo primero es comprobar si la respuesta corresponde a un recurso estático o a Pages Functions. Este artículo explica el alcance de `_headers` y de `Response` en una Function, dónde consultar la configuración actual y qué revisar después de publicar. Compruebe las cabeceras tanto de las respuestas correctas como de las respuestas de error para detectar posibles omisiones de configuración después de añadir una API.

Este artículo recoge el contexto de marzo de 2026, cuando se trasladó el formulario de contacto a un formulario externo y el sitio volvió a la entrega estática de Cloudflare Pages. La arquitectura del sitio cambió después. **En septiembre de 2026, el sitio oficial de Acecore usa Pages Functions además de páginas estáticas** para gestionar el contacto, los comentarios, la búsqueda, la asistencia de IA y la API del CMS en el mismo sitio. A continuación se explican tanto los motivos de la decisión de entonces como los límites que siguen siendo relevantes para configurar encabezados.

## ¿En qué se diferencian los encabezados de Cloudflare Pages para respuestas estáticas y Functions?

`public/_headers` se aplica a las **respuestas de recursos estáticos** que entrega Pages. La [documentación de Headers de Cloudflare Docs en GitHub](https://github.com/cloudflare/cloudflare-docs/blob/production/src/content/docs/pages/configuration/headers.mdx) explica que sus reglas se aplican a las respuestas de recursos estáticos. Además, en [Cloudflare Pages: Headers](https://developers.cloudflare.com/pages/configuration/headers/) se indica que las reglas no se aplican a las respuestas generadas por Pages Functions, aunque coincida el patrón de URL. Configura en el `Response` de cada Function los encabezados CORS, de caché y de seguridad que necesiten las respuestas de la API.

Por eso, no des por hecho que basta con escribir `_headers` una vez para que se aplique a todas las páginas y API del sitio. Comprueba por separado los encabezados reales de la respuesta del HTML estático y de `/api/*`.

<figure class="article-diagram" data-layout="boundary" data-tone="teal" data-count="2" aria-labelledby="diagram-cloudflare-pages-security">
  <figcaption>
    <strong id="diagram-cloudflare-pages-security">Límites de configuración entre respuestas estáticas y de Functions</strong>
    <span>Los archivos estáticos y las API se configuran en lugares distintos. Comprueba ambas respuestas por separado después de publicar.</span>
  </figcaption>
  <ol class="article-diagram__nodes">
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">1</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M5 3h10l4 4v14H5z"/><path d="M15 3v5h5M8 12h8M8 16h8"/></svg></span>
      <strong>Respuesta de archivo estático</strong>
      <span>Configúrala con _headers y comprueba la respuesta que entrega Pages.</span>
    </li>
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">2</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M8 9h8M8 12h4M8 16h8"/></svg></span>
      <strong>Respuesta de API de Function</strong>
      <span>Configura los encabezados en el Response de Function y comprueba la API por separado.</span>
    </li>
  </ol>
</figure>

## ¿Dónde se consulta la configuración actual de encabezados?

El [`_headers` actual](https://github.com/acecore-systems/acecore-net/blob/main/public/_headers) configura la revalidación del HTML y una caché de larga duración para los recursos `_astro/` con hash. Para el panel de administración se especifica una CSP distinta de la de las páginas normales, y `X-Frame-Options` es `SAMEORIGIN`. No copies como valores actuales el antiguo `form-action https://ssgform.com`, la caché de una hora para el HTML ni `DENY`.

Puedes consultar las rutas dinámicas en el [código de Pages Functions](https://github.com/acecore-systems/acecore-net/tree/main/functions). Comprueba también que los dominios externos permitidos en la CSP correspondan a los scripts, imágenes, marcos y destinos de comunicación que realmente se cargan. No trasplantes sin revisar la configuración publicada a otro sitio.

## ¿Qué hay que comprobar después del despliegue?

El sitio oficial se publica desde `main` en Cloudflare Pages, conectado con GitHub. La [versión actual de Node](https://github.com/acecore-systems/acecore-net/blob/main/.node-version) figura en `.node-version`; los pasos de compilación están en `package.json`, y CI los verifica con `npm run build`. La tabla de marzo de 2026 con «Node.js 22 / npx astro build» no describe el procedimiento de publicación actual.

Al comprobar una publicación, revisa por separado la vista previa del PR, la compilación de `main`, el despliegue de producción en Pages y los encabezados y el contenido de la URL pública. Consulta la [documentación oficial de Cloudflare Pages sobre Headers](https://developers.cloudflare.com/pages/configuration/headers/) para revisar la configuración de `_headers`.
