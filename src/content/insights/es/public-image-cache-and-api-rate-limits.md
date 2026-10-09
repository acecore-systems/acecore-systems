---
title: "Separar la caché perimetral de imágenes públicas de los límites de la API"
description: "Un caso en el que la API de contenido y las solicitudes de imágenes compartían el mismo límite durante la navegación repetida. Explica la reutilización de imágenes públicas, la validación de respuestas correctas, los límites entre WAF y aplicación y las comprobaciones en producción."
date: "2026-10-06T02:20:00+09:00"
lastUpdated: "2026-10-09T15:00:00+09:00"
author: gui
image: /images/insights/covers/public-image-cache-and-api-rate-limits-cover-v1.webp
tags: ["Cloudflare", "Performance", "Web"]
callout:
  type: note
  title: "Verifica por separado la caché y los límites de solicitudes"
  text: "Este caso confirma la implementación, CI, el despliegue en producción mediante la integración con GitHub y la comparación del contenido de imágenes representativas con el estado de la caché. No mide la tasa de aciertos en todos los centros de datos ni las mejoras de rendimiento con mucha carga."
---

En diarios y catálogos con imágenes, cada cambio de fecha o página genera solicitudes tanto a la API de contenido como a las imágenes. Describimos un caso en el que las imágenes dejaron de cargarse durante la navegación repetida, sin revelar URL operativas, rutas internas ni valores límite.

## Reproducir la navegación consecutiva desde una imagen

Solicite varias veces la misma imagen pública y compare hash del cuerpo, estado HTTP y caché. Después cargue texto y varias imágenes al cambiar de página y compruebe qué solicitudes consumen el límite. Un HIT no basta: verifique contenido correcto y protección de la API.

[Cloudflare Cache API：Lectura condicional y caché por ubicación](https://developers.cloudflare.com/workers/runtime-apis/cache/)

## El contenido y las imágenes compartían el mismo límite

En este caso, las solicitudes a una API dinámica y las peticiones GET de imágenes públicas se contabilizaban en la misma regla de limitación del WAF. Incluso los cambios normales de página podían generar varias solicitudes a la vez: el contenido se cargaba, pero las imágenes podían quedar limitadas.

Añadir una caché perimetral para las imágenes no ayuda a las solicitudes que el WAF bloquea antes de que lleguen a ella. Modificamos por separado la carga en el origen y los tipos de solicitudes que se cuentan dentro del mismo límite. Se mantienen los límites de la aplicación y las cuotas del proceso de generación para sus respectivos fines.

## Reutiliza solo imágenes públicas que se puedan compartir

Las imágenes de este caso son inmutables: un mismo asset ID público siempre devuelve el mismo contenido. Validamos el formato del asset ID, las condiciones de aceptación de la solicitud y la configuración del Service Binding antes de consultar una entrada de caché identificada por el mismo host y asset ID. Una caché caliente no permite omitir estas comprobaciones de entrada.

Las cadenas de consulta que no afectan al contenido y las cabeceras de la solicitud del usuario final no dividen la caché de una misma imagen. Esta decisión solo es válida porque se trata de imágenes públicas e inmutables. No se puede aplicar tal cual a imágenes privadas cuyo contenido varía según el usuario o la organización.

## Guarda solo respuestas 200 validadas

Si no hay una entrada en caché, se obtiene la imagen desde un Service Binding privado. Validamos el HTTP status, Content-Type de la imagen, Content-Length y el body de la respuesta; solo guardamos las respuestas 200 que cumplen esas condiciones. No guardamos respuestas parciales, bodies vacíos, metadata no válida ni respuestas de error.

Guardar el contenido de la imagen es distinto de devolver un 304 cuando coincide el ETag. Las escrituras en caché se programan con waitUntil. Si falla la lectura o escritura de la caché, no debe impedirse la entrega de una imagen válida obtenida del origen. Si una solicitud posterior encuentra la imagen en caché, se puede omitir la obtención a través del Service Binding.

La [Cloudflare Cache API](https://developers.cloudflare.com/workers/runtime-apis/cache/) describe las solicitudes condicionales con ETag y el comportamiento de la caché por centro de datos. Un HIT en un centro de datos no significa que haya HIT en todos. Las cabeceras de respuesta de Pages Functions no se pueden configurar únicamente con los [_headers para archivos estáticos](https://developers.cloudflare.com/pages/configuration/headers/); configúralas en la Function.

## Trata por separado los límites de la API dinámica

Proteger la API dinámica es un requisito distinto de almacenar imágenes en caché. En este caso excluimos los GET de imágenes públicas del cómputo del WAF y, tras aplicar el cambio, volvimos a leer las API dinámicas seleccionadas, el periodo del límite, la acción y el estado habilitado. También guardamos la configuración anterior para poder revertirla.

Elige los umbrales según el número de solicitudes que genera la navegación normal y la carga de la operación protegida. También hay que revisar las condiciones por plan de la [limitación de solicitudes de Cloudflare](https://developers.cloudflare.com/waf/rate-limiting-rules/). Que un valor aparezca en una nota operativa del repositorio no demuestra que una regla esté activa en producción.

<figure class="article-diagram" data-layout="boundary" data-tone="teal" data-count="2" aria-labelledby="diagram-public-image-cache-and-api-rate-limits">
  <figcaption>
    <strong id="diagram-public-image-cache-and-api-rate-limits">Imágenes públicas y API dinámica</strong>
    <span>Diseña por separado la reutilización de imágenes públicas inmutables y la protección de las API dinámicas. Las imágenes privadas quedan fuera.</span>
  </figcaption>
  <ol class="article-diagram__nodes">
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">1</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="m21 15-5-5L5 20"/></svg></span>
      <strong>GET de imagen pública</strong>
      <span>Comprueba el límite de la solicitud y reutiliza la misma imagen desde la caché. Guarda solo respuestas 200 validadas.</span>
    </li>
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">2</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M12 3 20 6v5c0 5-3.4 8.5-8 10-4.6-1.5-8-5-8-10V6l8-3Z"/><path d="m9 12 2 2 4-4"/></svg></span>
      <strong>API dinámica</strong>
      <span>Protege el trabajo de la API con WAF y la quota de la aplicación. Sus límites son independientes de la caché de imágenes.</span>
    </li>
  </ol>
</figure>

## Comprueba el contenido de las imágenes en producción

Las pruebas unitarias comprobaron la reutilización de la misma imagen pública, la separación por host y asset ID, la verificación del límite antes de usar la caché, las respuestas 304, los fallos de caché y las respuestas que no se deben guardar. Después de CI confirmamos el despliegue en producción mediante un push a GitHub y el dominio personalizado; luego comparamos el resultado HTTP de imágenes representativas, el estado HIT o MISS indicado por la aplicación y el hash de los bytes obtenidos.

En producción también obtuvimos el contenido y varias imágenes de forma consecutiva, y confirmamos que no se limitaban bajo esa condición de prueba de navegación normal. Fue una comprobación de un patrón de solicitudes limitado, no una prueba del límite bajo carga elevada.

Mostrar el estado de la caché por sí solo no demuestra que se haya devuelto la imagen correcta. Verificamos por separado la obtención del contenido, la de imágenes, la configuración del WAF y el resultado de visualización en la UI. Este registro confirma la entrega de imágenes representativas; no demuestra navegación continua de todos los usuarios y centros de datos ni mejoras de rendimiento con mucha carga.

Para ver cómo se dividen las partes estáticas y dinámicas del sitio, consulta [el diseño general de Astro y Cloudflare](/insights/astro-cloudflare-site-architecture/). Para optimizar la entrega de imágenes, CSS y otros recursos, consulta [el ajuste de rendimiento de Astro](/insights/astro-performance-tuning/).
