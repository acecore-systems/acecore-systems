---
title: "Diseñar un sitio Astro + Cloudflare que crece función por función"
description: "Cómo combinamos Astro y Cloudflare Pages con chat de contacto con IA, Sveltia CMS, blog multilingüe, CTA de servicios, renderizado seguro de Markdown y comentarios sin servicios externos."
date: 2026-06-07T19:00
author: gui
tags: ["Tecnología", "Astro", "Cloudflare", "Sitio web", "AI", "CMS"]
image: /uploads/acecore-generated/work-acecore-net-website.webp
callout:
  type: tip
  title: Define límites antes de añadir funciones
  text: "El chat con IA, el CMS, la localización y los comentarios son útiles, pero en un mismo sitio corporativo necesitan límites claros. Astro genera HTML estático, Cloudflare entrega el sitio y procesa APIs pequeñas, y GitHub mantiene los cambios revisables."
processFigure:
  eyebrow: Site Architecture
  title: Capas para ampliar el sitio
  description: Mantener el sitio estático por defecto y añadir dinamismo solo donde hace falta.
  variant: inline
  steps:
    - title: Entregar
      description: Generar HTML con Astro y servirlo en Cloudflare Pages.
      icon: i-lucide-rocket
      accent: brand
    - title: Editar
      description: Editar el contenido japonés en Sveltia CMS y revisarlo con PRs.
      icon: i-lucide-file-pen-line
      accent: emerald
    - title: Traducir
      description: Separar las traducciones en PRs, no dentro de toda la interfaz del CMS.
      icon: i-lucide-languages
      accent: amber
    - title: Guiar
      description: Usar chat con IA y CTA de servicios para llevar al usuario al formulario correcto.
      icon: i-lucide-route
      accent: slate
compareTable:
  title: Diferencias entre añadir funciones de forma aislada y hacerlo como parte de una arquitectura global
  before:
    label: Añadir cada función por separado
    items:
      - "La IA, el CMS, los comentarios y los formularios terminan siguiendo criterios de diseño diferentes"
      - "Aumentan los scripts y paneles de servicios externos, y la responsabilidad de explicarlos se dispersa"
      - "Es fácil que aparezcan discrepancias entre las URL multilingües, el índice de búsqueda y el entorno de vista previa"
      - "No se ve la relación entre funciones y cuesta decidir el orden de adopción"
  after:
    label: Añadir por capas
    items:
      - "Se pueden explicar por separado las funciones de Astro, Cloudflare, GitHub y la API de Workers AI"
      - "Las API dinámicas se concentran en Pages Functions y el almacenamiento se aproxima a Cloudflare mediante D1"
      - "Las actualizaciones del CMS, las traducciones, la búsqueda, RSS y sitemap comparten la misma estructura de contenido"
      - "La página resulta fácil de recorrer como índice por objetivo y orden de adopción"
checklist:
  title: Lista de diseño para reutilizar la arquitectura en otro sitio
  items:
    - text: "Separar lo que puede generarse de forma estática de lo que necesita una API"
      checked: true
    - text: "Separar el CMS como entrada de edición, la traducción como PR y la decisión de publicación como build"
      checked: true
    - text: "No enviar información personal a la IA de consultas y permitirle orientar solo con información ya publicada"
      checked: true
    - text: "Transmitir el contexto del formulario mediante parámetros URL y mantener valores de recepción estables"
      checked: true
    - text: "Definir en la configuración el nombre físico de D1 y su binding para datos enviados, como comentarios"
      checked: true
    - text: "No confiar en la salida de la IA ni en los envíos de usuarios como HTML; tratarlos mediante listas permitidas"
      checked: true
faq:
  title: Preguntas frecuentes
  items:
    - question: ¿Por dónde conviene empezar?
      answer: "Primero consolide las páginas estáticas de Astro, el blog, RSS, sitemap y OGP. Después añada el CMS y los idiomas; cuando necesite un recorrido de consulta, incorpore el chat de IA, las CTA de servicios y los comentarios."
    - question: ¿Todo debería construirse únicamente con Cloudflare?
      answer: "No. Algunas partes, como la IA de consultas, utilizan la API de Workers AI. La clave es acercar a Cloudflare la distribución, el límite de las API, la base de datos y la protección contra bots, y decidir conscientemente dónde usar servicios externos."
    - question: ¿Un sitio pequeño necesita todo esto?
      answer: "No hace falta incorporarlo todo desde el principio. Pero si prevé añadir un CMS, recorridos de consulta, varios idiomas o comentarios, decidir pronto las URL, el almacenamiento, el entorno de vista previa y el índice de búsqueda facilita el trabajo posterior."
linkCards:
  - href: /es/blog/astro-ai-contact-chat/
    title: Diseño técnico del chat de contacto con IA
    description: Límites de API y control de respuestas para guiar visitantes con información del sitio.
    icon: i-lucide-bot
  - href: /es/blog/cms-selection-and-turnstile/
    title: Guía de instalación de Sveltia CMS
    description: CMS, GitHub backend, OAuth y operación basada en PRs para sitios estáticos.
    icon: i-lucide-badge-check
  - href: /es/blog/copilot-translation-pipeline/
    title: Operar un blog multilingüe con Sveltia CMS
    description: Publicar páginas estáticas localizadas, no solo traducción de interfaz.
    icon: i-lucide-languages
  - href: /blog/service-cta-contact-prefill/
    title: Pasar contexto del CTA al formulario
    description: Llevar el contexto del servicio leído hasta la categoría y el asunto del formulario.
    icon: i-lucide-route
  - href: /es/blog/ai-chat-markdown-link-safety/
    title: Renderizado seguro de enlaces Markdown en IA
    description: Renderizar enlaces permitidos sin tratar la salida de IA como HTML confiable.
    icon: i-lucide-shield-check
  - href: /es/blog/cloudflare-only-blog-comments/
    title: Comentarios de blog usando solo Cloudflare
    description: Comentarios sin servicio externo, con Pages Functions, D1 y Turnstile.
    icon: i-lucide-message-square-text
---

Cuando empiezas con Astro y Cloudflare Pages, normalmente basta con publicar páginas estáticas rápidas y seguras.

Con el tiempo aparecen nuevas necesidades: edición desde el navegador, páginas localizadas, guía con chat de IA, traspaso de contexto al formulario y comentarios.

Este artículo es un índice de implementación: ayuda a decidir en qué capa vive cada función, en qué orden añadirlas y qué guía leer después. El ejemplo es el sitio de Acecore, pero el patrón se puede copiar en otros sitios Astro + Cloudflare.

## Resumen

La arquitectura divide responsabilidades:

| Capa        | Responsabilidad                                  |
| ----------- | ------------------------------------------------ |
| Astro       | Páginas, blog, OGP, RSS, sitemap y UI            |
| Cloudflare  | Pages, Pages Functions, D1 y Turnstile           |
| GitHub      | PRs, diferencias de CMS, traducciones, historial |
| Sveltia CMS | Fuente japonesa, autores, etiquetas, imágenes    |
| Workers AI  | Respuestas del chat de contacto                  |
| Pagefind    | Índice de búsqueda para HTML revisado            |

Lo que puede ser estático se mantiene estático. Lo dinámico pasa a APIs pequeñas.

## APIs pequeñas en Cloudflare

El chat de IA y los comentarios comparten patrón.

Astro muestra la interfaz. Pages Functions maneja la frontera de API. Secrets, D1 bindings, Turnstile, Origin checks y límites de frecuencia no salen al navegador.

Así el sitio no se convierte en un servidor de aplicación completo.

## CMS como interfaz de edición

Sveltia CMS no es una base de datos en runtime. Crea cambios en Git.

El contenido japonés, autores, etiquetas, imágenes y textos JSON se editan desde el CMS, pasan por PR, build y review, y luego llegan a producción.

## Traducción como contenido estático

La localización no depende de traducir la interfaz en el navegador.

Cada idioma genera su propia URL, title, description, OGP, JSON-LD, RSS, sitemap y hreflang.

## Canales de contacto separados

El chat con IA ayuda cuando el visitante todavía no sabe qué servicio necesita. El CTA de servicio conserva el contexto. El formulario registra la consulta formal.

No son el mismo botón repetido.

## La salida de IA no es HTML confiable

El chat puede devolver enlaces Markdown, pero no se insertan con `innerHTML`.

Solo se parsean expresiones necesarias, se valida el href con allowlist y se crean nodos DOM seguros.

## Comentarios dentro de Cloudflare

Los comentarios no usan un widget externo.

Pages Functions recibe GET/POST, D1 guarda comentarios y Turnstile protege envíos. Para un blog corporativo pequeño, ese alcance es suficiente.

## Leer por objetivo

No hace falta leerlo todo primero. Empieza por la función que quieres añadir.

| Objetivo                                       | Leer primero                                                                                         |
| ---------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Editar artículos e imágenes desde el navegador | [Guía de instalación de Sveltia CMS](/es/blog/cms-selection-and-turnstile/)                          |
| Publicar páginas multilingües indexables       | [Cómo operar un blog multilingüe con Sveltia CMS](/es/blog/copilot-translation-pipeline/)            |
| Guiar visitantes con chat de IA                | [Diseño técnico del chat de contacto con IA](/es/blog/astro-ai-contact-chat/)                        |
| Renderizar enlaces seguros en respuestas IA    | [Renderizado seguro de enlaces Markdown en respuestas de IA](/es/blog/ai-chat-markdown-link-safety/) |
| Pasar contexto de servicio al formulario       | [Pasar contexto del CTA al formulario](/blog/service-cta-contact-prefill/)                           |
| Añadir comentarios sin un servicio externo     | [Comentarios de blog Astro usando solo Cloudflare](/es/blog/cloudflare-only-blog-comments/)          |

## Orden de implementación

Para otro sitio con una estructura similar, el orden práctico es:

1. Cerrar páginas estáticas, blog, RSS, sitemap y OGP con Astro.
2. Añadir Sveltia CMS para editar la fuente japonesa.
3. Generar las páginas localizadas como HTML estático.
4. Añadir guía con chat de IA y CTA de servicios.
5. Proteger enlaces Markdown, prefill de formulario, Origin checks y rate limits.
6. Añadir comentarios dentro de Cloudflare solo cuando sean necesarios.

## Cierre

Astro + Cloudflare permite ampliar un sitio corporativo sin abandonar las ventajas de la entrega estática.

Usa esta página como entrada y añade solo las piezas que tu sitio necesita, sin debilitar la base estática.
