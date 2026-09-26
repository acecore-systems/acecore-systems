---
title: "Encabezados de seguridad para recursos estáticos y Functions de Cloudflare Pages"
description: "Distingue las respuestas estáticas de Pages y las de Functions y revisa _headers, CSP y la configuración actual."
date: 2026-03-15T00:00
author: gui
tags: ["Tecnología", "Cloudflare", "Seguridad"]
image: /uploads/acecore-generated/blog-cloudflare-pages-security.webp
lastUpdated: "2026-09-26T19:12:47+09:00"
---

Este artículo documentaba el cambio de marzo de 2026 de un formulario con Worker a un servicio externo y a la entrega estática con Cloudflare Pages. La arquitectura ha cambiado. **En septiembre de 2026, el sitio corporativo de Acecore usa Pages Functions junto a páginas estáticas** para contacto, comentarios, búsqueda, asistencia de IA y API del CMS. La decisión anterior es contexto histórico.

## Separa respuestas estáticas y Functions

`public/_headers` se aplica a las **respuestas de recursos estáticos** de Pages. Cloudflare indica expresamente que no se aplica a respuestas generadas por Pages Functions, aunque coincida el patrón de URL. Configura los encabezados CORS, de caché y de seguridad necesarios en el `Response` de cada Function.

No supongas que `_headers` protege todas las páginas y API. Comprueba por separado los encabezados reales del HTML estático y de `/api/*`.

## Consulta la configuración actual

El [archivo `_headers` actual](https://github.com/acecore-systems/acecore-net/blob/main/public/_headers) revalida HTML y conserva más tiempo los recursos `_astro/` con hash. El CMS tiene una CSP propia y `X-Frame-Options` vale `SAMEORIGIN`. No copies como valores actuales el antiguo `form-action https://ssgform.com`, la caché HTML de una hora ni `DENY`.

Las rutas dinámicas están en el [código de Pages Functions](https://github.com/acecore-systems/acecore-net/tree/main/functions). Ajusta las fuentes CSP a los scripts, imágenes, marcos y conexiones de tu propio sitio; no trasplantes la política de Acecore sin revisarla.

## Despliegue y verificación

El sitio publica `main` mediante Cloudflare Pages conectado con GitHub. La versión actual de Node figura en [`.node-version`](https://github.com/acecore-systems/acecore-net/blob/main/.node-version); CI usa `npm run build` de `package.json`. La tabla de marzo de 2026 con “Node.js 22 / npx astro build” es histórica.

Comprueba por separado la vista previa del PR, el build de main, el despliegue de producción y la URL pública. Consulta la [documentación de encabezados de Pages](https://developers.cloudflare.com/pages/configuration/headers/) de Cloudflare.
