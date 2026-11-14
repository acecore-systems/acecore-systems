---
title: "Diseño de implementación para renderizar de forma segura los enlaces Markdown de las respuestas de chat con IA"
description: "Nota de implementación para convertir de forma segura a HTML los enlaces Markdown incluidos en las respuestas de un chat con IA. Al permitir espacios en blanco alrededor de la URL y tratar por separado el recorte mediante trim, la lista de permitidos, la creación del DOM, la alternativa de respaldo y los casos de prueba, se obtiene un renderizador fácil de reutilizar en otros sitios."
date: 2026-06-07T14:30
lastUpdated: "2026-11-12T00:00:00+09:00"
author: gui
tags: ["Tecnología", "Sitios web", "IA", "Seguridad", "Astro"]
image: "/images/insights/covers/ai-chat-markdown-link-safety-cover-v2.webp"
callout:
  type: tip
  title: Puntos clave de este artículo
  text: Las respuestas de IA no son HTML de confianza. Aunque los enlaces Markdown resulten prácticos, el diseño debe recortar la URL antes de validarla con una lista de permitidos, y mostrar como texto aquello que no se pueda permitir, sin convertirlo en enlace.
processFigure:
  title: Flujo de representación de enlaces en respuestas de IA
  steps:
    - title: Texto
      description: Trata primero la respuesta del modelo como texto sin formato.
      icon: i-lucide-message-square-text
      accent: brand
    - title: Análisis
      description: Extrae con un parser pequeño solo las expresiones Markdown necesarias.
      icon: i-lucide-brackets
      accent: amber
    - title: Validación
      description: Aplica trim al href y permite solo las URL internas o de dominios autorizados.
      icon: i-lucide-shield-check
      accent: emerald
    - title: Renderizado
      description: Crea solo elementos seguros con la API del DOM, no con innerHTML.
      icon: i-lucide-code-2
      accent: slate
compareTable:
  title: Decisiones que conviene separar al renderizar enlaces Markdown
  before:
    label: Renderizado descuidado
    items:
      - Insertar directamente la respuesta de IA en innerHTML
      - Intentar implementar de una vez toda la especificación Markdown
      - No poder convertir en enlace por los espacios que rodean la URL
      - "Tratar las URL externas y javascript: de la misma manera"
  after:
    label: Renderizado pequeño y seguro
    items:
      - Recibir la respuesta como texto y convertir en elementos DOM solo las expresiones necesarias
      - Admitir solo el Markdown usado en el chat
      - Comprobar la seguridad de las URL después de recortarlas
      - Mostrar como texto las URL no permitidas, sin convertirlas en enlaces
checklist:
  title: Lista de comprobación para la implementación
  items:
    - text: No confiar en las respuestas de IA como HTML
    - text: Permitir espacios antes y después de las URL de los enlaces Markdown
    - text: Validar siempre href después de aplicar trim
    - text: Permitir solo rutas internas, el mismo origen y los dominios externos necesarios
    - text: Especificar target y rel en los enlaces externos
    - text: Dejar como texto los enlaces no permitidos
    - text: Probar no solo el caso correcto, sino también URL peligrosas y Markdown mal formado
linkCards:
  - href: /blog/astro-ai-contact-chat/
    title: Diseño técnico del chat de IA para consultas
    description: Artículo principal sobre las respuestas de IA, los límites de la API y el control de prompts.
    icon: i-lucide-sparkles
  - href: /insights/cloudflare-pages-security/
    title: Configuración de seguridad de Cloudflare Pages
    description: Artículo relacionado que organiza la CSP y las cabeceras de seguridad.
    icon: i-lucide-shield
  - href: /contact/
    title: Contacto
    description: El recorrido real donde están el chat de IA y el formulario.
    icon: i-lucide-message-square
faq:
  title: Preguntas frecuentes
  items:
    - question: ¿Basta con usar markdown-it o marked?
      answer: Aunque se use una biblioteca, hay que diseñar por separado el tratamiento de la salida HTML, los destinos de enlace permitidos, la adición de target y rel y el rechazo de URL peligrosas. Para un chat, a veces basta con un renderizador pequeño hecho a medida.
    - question: ¿Permitir espacios alrededor de las URL no resulta peligroso?
      answer: Lo importante no es permitir espacios en sí, sino qué se permite después de aplicar trim. Si se valida el href ya recortado con una lista de permitidos, se puede mantener la seguridad y, a la vez, tolerar mejor las variaciones de formato del modelo.
    - question: ¿Hay que eliminar las URL que no se pueden permitir?
      answer: En muchos casos es más fácil depurar si se muestran como texto en vez de eliminarlas, y también se conserva el contexto de la respuesta para el usuario. Sin embargo, si el funcionamiento requiere ocultar por completo las cadenas sospechosas, también se puede optar por descartar todo el enlace.
---

Si los enlaces de una respuesta de IA siguen apareciendo como texto sin formato, primero pasa la misma entrada, en orden, por el análisis, la validación de URL y el renderizado en el DOM para identificar en qué etapa falla. Usa una API para texto como [MDN: textContent](https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent) para la cadena visible y no mezcles la decisión de convertirla en enlace con la interpretación de HTML; ese es el punto de partida para aplicarlo a un chat existente.

Cuando un chat con IA responde «Para más información, consulta la [lista de servicios](/services/)», puede que no se muestre como enlace y la cadena Markdown quede tal cual.

En el sitio de Acecore también aparecieron enlaces Markdown con espacios alrededor de las URL en las respuestas del chat de IA para consultas, así que ajustamos el renderizador en la [PR que corrigió la representación de enlaces Markdown del chat con IA](https://github.com/acecore-systems/acecore-net/pull/99).

En este artículo tomamos esa pequeña corrección como punto de partida y resumimos cómo convertir de forma segura las respuestas de IA en DOM.

## Las respuestas de IA no son HTML de confianza

Como premisa, trata las respuestas de IA como texto, no como HTML.

En una interfaz de chat, dan ganas de permitir enlaces, negrita y listas con viñetas. Pero, si insertas la respuesta tal cual en `innerHTML`, haces que el navegador interprete la cadena generada por el modelo.

Lo necesario no es implementar Markdown completo. Basta con extraer de forma acotada solo las expresiones necesarias en el chat y crear únicamente un DOM seguro.

## El problema no son solo los espacios

El fallo concreto que motivó esta corrección se producía con un enlace como el siguiente.

```md
[サービス一覧](/services/)
```

Como Markdown, tiene sentido para una persona, pero si la parte de la URL se extrae con una expresión regular que la recoge como «una cadena sin espacios», no hay coincidencia.

Antes de corregirlo, el enfoque era el siguiente.

```js
/\[([^\]]+)\]\(([^)\s]+)\)/;
```

`[^)\s]+` no permite espacios, así que no puede reconocer `( /services/ )` como enlace. Por ello, permitimos espacios en blanco al principio y al final dentro de los paréntesis y luego aplicamos trim a la URL que realmente se utilizará.

```js
/\[([^\]]+)\]\(\s*([^)]+?)\s*\)/;
```

Lo importante aquí es no limitarse a flexibilizar la expresión regular. Después de hacerlo, siempre hay que normalizar y realizar la validación de seguridad.

## Validar href después de aplicar trim

El orden de creación de los enlaces debe mantenerse fijo.

1. Extraer de Markdown la etiqueta y el href sin procesar
2. Aplicar `trim()` al href sin procesar
3. Validar el href ya recortado con la lista de permitidos
4. Crear `<a>` solo si se permite

```js
const href = String(rawHref || "").trim();

if (label && isSafeMarkdownHref(href)) {
  const link = document.createElement("a");
  link.href = href;
  link.rel = "noopener noreferrer";

  if (/^https?:\/\//i.test(href)) {
    link.target = "_blank";
  }

  link.textContent = label;
  parent.appendChild(link);
}
```

Se valida el valor que realmente se insertará en el DOM, no el valor anterior a `trim()`. Si el valor validado y el que se representa no coinciden, la comprobación de seguridad pierde eficacia.

## Definir la lista de permitidos según cada producto

Las URL que puede indicar el chat con IA varían según el sitio.

En el chat de IA para consultas de Acecore, lo limitamos aproximadamente a estos casos.

| Tipo           | Ejemplo                   | Decisión                                    |
| -------------- | ------------------------- | ------------------------------------------- |
| Ruta interna   | `/services/`              | Permitir                                    |
| Mismo origen   | `https://acecore.net/...` | Permitir                                    |
| LINE oficial   | `https://lin.ee/...`      | Permitir porque su propósito está claro     |
| mailto         | `mailto:info@acecore.net` | Permitir solo los destinos fijos necesarios |
| tel            | `tel:0120987370`          | Permitir solo los números fijos necesarios  |
| Otras externas | URL cualquiera            | En principio, no convertir en enlace        |

Un ejemplo de implementación sería este.

```js
function isSafeMarkdownHref(rawHref) {
  const href = String(rawHref ?? "").trim();
  if (!href || /[\u0000-\u001f\u007f\\]/u.test(href)) return false;
  if (href === "mailto:info@acecore.net" || href === "tel:0120987370") {
    return true;
  }

  try {
    if (href.startsWith("/")) {
      if (href.startsWith("//")) return false;
      const url = new URL(href, window.location.origin);
      return (
        url.origin === window.location.origin && !url.username && !url.password
      );
    }

    const url = new URL(href);
    return (
      url.protocol === "https:" &&
      !url.username &&
      !url.password &&
      !url.port &&
      [
        window.location.origin,
        "https://acecore.net",
        "https://lin.ee",
      ].includes(url.origin)
    );
  } catch {
    return false;
  }
}
```

Esta función debe adaptarse a cada sitio. Un sitio de contratación puede permitir plataformas de empleo; una tienda en línea, pagos o seguimiento de envíos; y un SaaS, documentación o una página de estado.

## Dejar como texto los enlaces que no se puedan permitir

También hay que diseñar cómo tratar los enlaces que no pasan la comprobación de seguridad.

En el chat de consultas, resulta más fácil manejar el Markdown que no puede convertirse en enlace si se conserva como cadena original, en lugar de eliminarlo por completo. El usuario mantiene el contexto y el desarrollador puede comprobar «qué generó la IA».

En otras palabras, el analizador no solo debe «crear enlaces seguros», sino también «mostrar como texto normal aquello que no pueda crear de forma segura».

## Preparar los casos de prueba desde el principio

Si solo se revisa el caso normal, es fácil pasar por alto problemas en este tipo de renderizadores.

Comprueba como mínimo los siguientes casos.

| Entrada                             | Resultado esperado                               |
| ----------------------------------- | ------------------------------------------------ |
| `[サービス一覧](/services/)`        | Se convierte en enlace interno                   |
| `[サービス一覧]( /services/ )`      | Se recorta y se convierte en enlace interno      |
| `[LINE]( https://lin.ee/example )`  | Se abre como enlace externo                      |
| `[危険](javascript:alert(1))`       | No se convierte en enlace                        |
| `[外部](https://example.com/)`      | No se convierte en enlace si no está permitido   |
| `[壊れたリンク](/services/`         | Se muestra como texto                            |
| `` `code` と [link]( /contact/ ) `` | Se renderizan por separado el código y el enlace |

En la PR #99 comprobamos que `[サービス一覧]( /services/ )`, `[サービス一覧](/services/)` y `[LINE]( https://lin.ee/DjIrdqj )` se tratan como la misma URL.

## Decidir no implementar todo Markdown

El Markdown que se usa en un chat con IA se puede limitar.

- Párrafos
- Listas con viñetas
- Negrita
- Código en línea
- Enlaces

Si además se admiten tablas, imágenes, HTML, notas al pie y jerarquías profundas de encabezados, la responsabilidad del renderizador crece de golpe. En una interfaz de chat basta con ofrecer indicaciones legibles.

Si llega a ser necesario, también se puede optar por una biblioteca Markdown consolidada. Aun así, hay que decidir por separado si se permite HTML, cómo restringir las URL y qué atributos añadir a los enlaces externos.

## Resumen

El renderizado de enlaces Markdown en un chat con IA parece un pequeño ajuste visual. Sin embargo, en realidad es una decisión de diseño de límites que determina hasta qué punto se confía en la salida de la IA.

Los puntos importantes de la implementación son los siguientes.

- Tratar las respuestas de IA como texto, no como HTML
- Convertir en DOM solo el Markdown necesario
- Permitir espacios en blanco alrededor de la URL de los enlaces Markdown
- Comprobar la seguridad de href después de aplicar trim
- Permitir mediante una lista de permitidos solo las URL internas y las URL externas necesarias
- Dejar como texto los enlaces que no se puedan permitir
- Probar el Markdown mal formado y las URL peligrosas

Cuanto más se integra la IA en los recorridos de un sitio, más importante es cómo se representa el texto de respuesta. La compatibilidad práctica con Markdown y el control seguro de enlaces deben gestionarse juntos dentro de la misma implementación.
