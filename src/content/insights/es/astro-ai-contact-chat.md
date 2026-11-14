---
title: "Diseño técnico para integrar un chat de IA para consultas en un sitio Astro"
description: "Diseño de referencia a fecha de 2026-6. Diseño técnico para integrar un chat de IA para consultas que utiliza OpenAI Responses API en un sitio estático con Astro + Cloudflare Pages. Se presenta de forma reutilizable en otros sitios y abarca los límites de API, el contexto del sitio, el control de prompts, las URL por locale, la comprobación de Origin, la limitación de frecuencia y la representación segura de enlaces Markdown."
date: 2026-06-07T12:00
lastUpdated: "2026-11-12T00:00:00+09:00"
author: gui
tags: ["Tecnología", "Cloudflare", "Sitio web", "IA", "Servicios"]
image: "/images/insights/covers/astro-ai-contact-chat-cover-v2.webp"
callout:
  type: info
  title: Puntos clave de este artículo
  text: El chat de IA para consultas no debe diseñarse como una función que permite a la IA responder libremente, sino como una pequeña aplicación que utiliza la información publicada en el sitio para orientar a los visitantes hacia el canal adecuado. Las claves de API, los prompts, la información de contacto y la representación de Markdown se controlan en el servidor y mediante listas de permitidos.
processFigure:
  title: Arquitectura de referencia de un chat de IA para consultas
  steps:
    - title: Widget de chat
      description: La interfaz de chat de Astro envía la pregunta, el locale de visualización y solo el historial mínimo necesario.
      icon: i-lucide-message-circle
      accent: brand
    - title: Función
      description: Cloudflare Pages Function se encarga de validar la entrada, comprobar Origin, limitar la frecuencia y generar el prompt.
      icon: i-lucide-shield-check
      accent: amber
    - title: Modelo
      description: Envía a OpenAI Responses API la información pública del sitio y el contexto de la conversación, y recibe el texto de respuesta.
      icon: i-lucide-sparkles
      accent: emerald
    - title: Renderizador
      description: En el cliente, convierte en elementos DOM solo el Markdown permitido y orienta hacia enlaces internos o datos de contacto.
      icon: i-lucide-code-2
      accent: slate
compareTable:
  title: Responsabilidades que conviene separar al implementar
  before:
    label: Si se implementa todo junto
    items:
      - Se llama directamente a la API de IA desde el navegador
      - Se mezclan la información del sitio, la clave de API, la interfaz y el renderizado de enlaces
      - La IA tiende a afirmar precios, contratos y plazos de entrega como definitivos
      - Es fácil insertar Markdown y URL directamente en HTML
  after:
    label: Si se separan las responsabilidades
    items:
      - La clave de API y las llamadas al modelo quedan en el servidor
      - La información pública del sitio se gestiona como contexto explícito
      - El prompt controla el alcance de las respuestas y los canales de contacto
      - Markdown y URL se representan mediante una lista de permitidos
checklist:
  title: Lista de comprobación del diseño para implementarlo en otros sitios
  items:
    - text: Definir el objetivo del chat de IA como «organizar los canales adecuados», no «resolver la consulta por completo»
    - text: No exponer la clave de API en el navegador y crear un límite de API del lado del servidor
    - text: Limitar la información que se usa para responder a contenido ya publicado
    - text: Definir los ámbitos sobre los que la IA no debe pronunciarse de forma concluyente, como precios, contratos, plazos de entrega y garantías
    - text: Definir las reglas para dirigir a los usuarios al formulario, LINE, correo electrónico o teléfono
    - text: Generar URL por locale sin romper los recorridos multilingües
    - text: Añadir comprobaciones de Origin, límites de longitud de entrada e historial y limitación de frecuencia
    - text: Validar los enlaces Markdown con una lista de permitidos después de aplicar trim
linkCards:
  - href: /contact/
    title: Contacto
    description: Página que organiza los puntos de entrada del chat de IA, LINE, el formulario y los datos de contacto directo.
    icon: i-lucide-message-square
  - href: /insights/cloudflare-pages-security/
    title: Configuración de seguridad de Cloudflare Pages
    description: Artículo sobre los cimientos de la entrega de sitios estáticos, como CSP y la configuración de encabezados.
    icon: i-lucide-shield
  - href: /blog/cms-selection-and-turnstile/
    title: Guía de implementación de Sveltia CMS
    description: Artículo relacionado sobre cómo añadir una interfaz de edición CMS a un sitio estático.
    icon: i-lucide-badge-check
faq:
  title: Preguntas frecuentes
  items:
    - question: ¿Se puede crear un chat de IA para consultas sin RAG ni una base de datos vectorial?
      answer: Para un sitio corporativo pequeño, basta con pasar al prompt como contexto estructurado los puntos clave de las páginas públicas. Cuando aumenten el número de páginas o la frecuencia de actualización, se puede plantear incorporar un índice de búsqueda o una base de datos vectorial.
    - question: ¿Se expone la clave de API de OpenAI en el navegador?
      answer: No. El navegador solo envía la pregunta a /api/ai-contact; la llamada a OpenAI Responses API y la gestión de la clave de API se realizan desde Cloudflare Pages Function.
    - question: ¿Se pueden mostrar libremente los enlaces de las respuestas de IA?
      answer: No se muestran libremente. Solo se permiten las rutas internas, el mismo origen, acecore.net, LINE oficial y mailto y tel cuando sea necesario. Aunque haya espacios alrededor de la URL de un enlace Markdown, se eliminan con trim antes de validar su seguridad.
---

Si quieres probar un chat de IA en un sitio estático, empieza limitándolo a orientar sobre las preguntas frecuentes públicas, y deriva los presupuestos formales y las solicitudes al formulario. Consulta [Cloudflare Pages: Bindings](https://developers.cloudflare.com/pages/functions/bindings/) para configurar la conexión del lado del servidor. La comprobación de URL del texto es un ejemplo simplificado de aquella época; al implementarlo, utiliza el análisis sintáctico de URL y una lista de permitidos del artículo relacionado, y evita permitir direcciones basándote únicamente en que una cadena empiece por cierto texto.

> **Nota añadida el 2026-9-26:** Lo siguiente es un diseño de referencia a fecha de 2026-6. La implementación actual de `/api/ai-chat` de Acecore Systems reenvía las solicitudes a un `acecore-chat-worker` común mediante Service Binding desde Cloudflare Pages Function. El lado de la interfaz recibe una respuesta JSON y muestra la respuesta completa. La configuración descrita en el cuerpo, que llama directamente a OpenAI Responses API, debe entenderse como diseño de referencia y no como descripción de la implementación actual de Systems.

Un chat de IA para consultas es fácil de añadir a un sitio. Sin embargo, en la práctica, los problemas no suelen depender tanto del rendimiento del modelo como de cuánto se le permite responder, a qué canal se dirige a los usuarios, qué URL se pueden mostrar y cómo se controlan los costes de API.

En el sitio de Acecore añadimos un chat de IA para consultas a un sitio estático con Astro + Cloudflare Pages. La implementación principal está en el [PR que implementa el chat de IA para consultas y el flujo de traducción limitado al CMS](https://github.com/acecore-systems/acecore-net/pull/98). Después, ajustamos la representación segura de los enlaces Markdown incluidos en las respuestas de IA en [otro PR](https://github.com/acecore-systems/acecore-net/pull/99). Los detalles de la representación de enlaces se explican por separado en [Diseño de implementación para representar de forma segura enlaces Markdown en las respuestas del chat de IA](/blog/ai-chat-markdown-link-safety/).

Este artículo presenta un diseño técnico fácil de reutilizar en otros sitios estáticos, en lugar de ser un registro del trabajo realizado para un sitio concreto. Aunque el frontend no sea Astro, el enfoque es prácticamente el mismo: la base es separar las responsabilidades del cliente, el límite de API, el prompt y el renderizador.

## Arquitectura general

La arquitectura utilizada es sencilla y consta de 3 capas.

| Capa                 | Función                                                                                                           |
| -------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Widget de chat       | Interfaz, entrada, locale de visualización, historial mínimo necesario y representación de Markdown               |
| `/api/ai-contact`    | Validación de entrada, comprobación de Origin, limitación de frecuencia, generación del prompt y llamada a OpenAI |
| OpenAI Responses API | Generación de respuestas basada en la información del sitio y el contexto de la conversación                      |

No hacemos llamadas directas a OpenAI API desde el navegador. Hay 3 motivos.

- No exponer la clave de API en el navegador
- Poder actualizar el modelo, el prompt y el contexto del sitio desde el servidor
- Centralizar en 1 lugar los límites de entrada, Origin, la limitación de frecuencia y el tratamiento de errores

En Astro + Cloudflare Pages, el límite de API puede implementarse como `/api/ai-contact` de Cloudflare Pages Functions. En Next.js se puede sustituir por un Route Handler; con Hono o Express, por una ruta de API. El enfoque es el mismo.

## Mantén pequeño el contrato del endpoint

Limita todo lo posible la información que se envía a la API del chat de IA para consultas.

```ts
type ContactAiRequest = {
  message: string;
  locale: "ja" | "en" | "zh-cn" | "es" | "pt" | "fr" | "ko" | "de" | "ru";
  history?: Array<{
    role: "user" | "assistant";
    content: string;
  }>;
};

type ContactAiResponse = {
  answer: string;
};
```

Decidimos no enviar al chat de IA los nombres, las direcciones de correo electrónico, los números de teléfono, los nombres de empresa ni otros datos introducidos en el formulario. El chat de IA para consultas no es un lugar para recopilar datos personales, sino un punto de entrada que ayuda a los visitantes a decidir qué servicio consultar y dónde pedir asesoramiento.

El historial tampoco se envía sin límite. Solo incluimos unos pocos mensajes recientes y limitamos también la longitud permitida por mensaje, es decir, por cada 1 mensaje. Así se evita que el prompt crezca demasiado y se reducen los costes de API.

## Controla la entrada y las llamadas desde el servidor

En el lado de Cloudflare Pages Function se agrupan los siguientes procesos.

```ts
export async function onRequestPost({ request, env }: PagesFunction<Env>) {
  assertSameOrigin(request);
  assertRateLimit(request);

  const body = await request.json();
  const message = validateMessage(body.message);
  const locale = validateLocale(body.locale);
  const history = trimHistory(body.history);

  const prompt = buildContactPrompt({
    locale,
    message,
    history,
    siteContext: buildPublicSiteContext(locale),
  });

  const answer = await callOpenAIResponsesApi({
    apiKey: env.OPENAI_API_KEY,
    model: env.OPENAI_MODEL,
    prompt,
  });

  return Response.json({ answer });
}
```

El punto clave de la implementación es normalizar la entrada antes de llamar a OpenAI. Las llamadas a la API de IA generan costes en función de la entrada recibida. Si se permite el paso sin control de textos largos, historial innecesario y accesos repetidos desde sitios externos, la operación se vuelve inestable antes que la funcionalidad.

Conviene definir `OPENAI_MODEL` como variable de entorno para facilitar el cambio de modelo y las pruebas en entornos preview. `OPENAI_API_KEY` debe administrarse, por supuesto, únicamente como variable de entorno del servidor.

La entrega desde Cloudflare Pages y el enfoque de CSP se explican también en [Entrega segura de sitios estáticos con Cloudflare Pages](/insights/cloudflare-pages-security/).

## Proporciona explícitamente la información del sitio como contexto

En un sitio de este tamaño, no hace falta incorporar de entrada una base de datos vectorial ni RAG. Al principio, es más sencillo implementar y operar si se estructura un resumen de la información publicada en el sitio y se pasa al prompt.

Por ejemplo, el servidor puede recopilar información como la siguiente.

- Resumen de la empresa y sus servicios
- Público de cada servicio, ejemplos de consultas y URL relacionadas
- Contenido respondido en las FAQ
- Cómo elegir entre el formulario de contacto, LINE, el correo electrónico y el teléfono
- Temas sobre los que la IA no debe pronunciarse de forma concluyente, como precios, contratos y plazos de entrega
- URL internas de cada locale

Lo importante no es hacer que el modelo responda basándose en lo que «parece saber», sino proporcionarle la información que este sitio puede ofrecer como respuesta.

```ts
function buildPublicSiteContext(locale: Locale) {
  return {
    services: [
      {
        name: "Web制作",
        summary: "コーポレートサイト、採用サイト、LPの制作相談に対応",
        url: localizePath("/services/web-production/", locale),
      },
      {
        name: "サーバー運用",
        summary: "クラウド、VPS、監視、バックアップ設計の相談に対応",
        url: localizePath("/services/server-operations/", locale),
      },
    ],
    contact: {
      form: localizePath("/contact/", locale),
      line: "https://lin.ee/...",
      emailPolicy: "フォームが使えない場合や補足が必要な場合だけ案内する",
      phonePolicy: "急ぎの確認が必要な場合だけ案内する",
    },
  };
}
```

Con pocas páginas, este método es suficiente. Cuando aumenten el número de páginas, la frecuencia de actualización o los requisitos de búsqueda, se puede añadir una capa de búsqueda con Pagefind, el JSON del CMS, D1 o Vectorize.

## Escribe reglas en el prompt, no solo instrucciones para redactar respuestas

En el prompt del chat de IA para consultas, aclara el alcance de las respuestas y las prohibiciones, en lugar de limitarte a pedir que genere una prosa natural.

```txt
あなたはこのサイトの問い合わせ案内AIです。
公開済みサイト情報だけを根拠に回答してください。

ルール:
- 料金、契約、納期、保証を断定しない
- 詳細見積りや正式な相談は問い合わせフォームへ案内する
- 短い確認やSchoolsに関する相談はLINEも案内する
- メールと電話は、ユーザーが直接連絡を求めた場合だけ案内する
- 内部リンクは現在のlocaleに合うURLを使う
- わからない場合は、推測せずフォームへ案内する
```

Un error frecuente en los chats de IA es que el modelo haga afirmaciones contundentes para presentar los servicios de forma favorable. Por ejemplo, ante preguntas como «¿Cuánto cuesta?», «¿Para cuándo se puede entregar?» o «¿Pueden garantizar que se encargarán?», la respuesta debe limitarse a información general y derivar la respuesta formal al formulario.

Esto no es solo una cuestión legal. Los presupuestos y los plazos de entrega no se pueden confirmar antes de conocer los detalles de la solicitud. El prompt debe definir qué respuestas se pueden respaldar en la práctica, en lugar de priorizar las respuestas que resulten convenientes desde el punto de vista comercial.

## Separa las funciones de los canales de contacto

El chat de IA no sustituye al formulario. Para facilitar la gestión, conviene separar los canales de la página de contacto de la siguiente manera.

| Canal            | Función                                                                                                       |
| ---------------- | ------------------------------------------------------------------------------------------------------------- |
| FAQ              | Resolver de antemano en la página las dudas frecuentes                                                        |
| Chat de IA       | Organizar mediante una conversación la elección del servicio, el canal de consulta y las páginas relacionadas |
| LINE             | Consultas breves, contactos relacionados con Schools y verificaciones sencillas                               |
| Formulario       | Consultas sobre presupuestos, proyectos, colaboraciones, empleo y otros temas que requieran dejar constancia  |
| Contacto directo | Mostrarlo solo si hace falta añadir información después de enviar el formulario o hacer una consulta urgente  |

La IA puede conectar contenido general, como la [página de servicios](/services/), con los canales concretos de recepción de la [página de contacto](/contact/). Así, los visitantes no tienen que volver a buscar las páginas por su cuenta.

Este diseño también se puede aplicar a sitios de empresa a empresa, sitios de agencias de producción, sitios de escuelas y canales de soporte de SaaS. Es más fácil implementarlo si la IA ayuda a elegir la página que se debe consultar o el canal de contacto, en lugar de resolver por completo las consultas.

## Mantén las URL correctas para cada locale

En un sitio multilingüe, no solo el idioma de la respuesta de IA, sino también la URL de destino debe corresponder al locale.

Por ejemplo, si alguien pregunta desde una página en inglés, la respuesta también debe estar en inglés y los enlaces a páginas de servicios deben usar URL con locale, como `/en/services/`. Desde una página en japonés, se debe usar `/services/`.

Es más fiable resolverlo con una función de generación de URL del lado del servidor que delegarlo al prompt.

```ts
function localizePath(path: string, locale: Locale) {
  if (locale === "ja") return path;
  return `/${locale}${path}`;
}
```

Si la respuesta de IA vuelve a enlazar únicamente a URL japonesas, se rompe el recorrido multilingüe. La base para gestionar blogs multilingües y su traducción se explica en [Cómo gestionar un blog multilingüe con Sveltia CMS](/blog/copilot-translation-pipeline/).

## Añade comprobaciones de Origin y limitación de frecuencia

Como `/api/ai-contact` es una API pública, incluye al menos comprobaciones de Origin, límites de longitud de entrada e historial y limitación de frecuencia.

Cuando existe un encabezado `Origin`, se comprueba que el host desde el que se origina la solicitud coincida con el host de la API. Así se reduce la posibilidad de que se invoque sin autorización desde otros sitios.

```ts
function assertSameOrigin(request: Request) {
  const origin = request.headers.get("Origin");
  if (!origin) return;

  const requestUrl = new URL(request.url);
  const originUrl = new URL(origin);

  if (originUrl.host !== requestUrl.host) {
    throw new Response("Forbidden", { status: 403 });
  }
}
```

La limitación de frecuencia puede empezar con un control sencillo basado en la IP. En un entorno de Cloudflare se pueden usar `CF-Connecting-IP`, `X-Forwarded-For` y `CF-Ray`, entre otros, para identificar las solicitudes.

Sin embargo, la limitación de frecuencia en memoria no ofrece un límite persistente entre varios isolates ni después de un reinicio. Puede servir como primera barrera para un sitio pequeño, pero si aumenta el tráfico, resulta más fiable recurrir a Cloudflare WAF, Turnstile, KV, D1 o Durable Objects.

El diseño del CMS para actualizar el contenido se explica por separado en la [Guía de implementación de Sveltia CMS](/blog/cms-selection-and-turnstile/). La protección contra bots de los formularios y los comentarios se gestiona en una capa distinta, con Turnstile, por ejemplo. El diseño para crear comentarios con Cloudflare únicamente se presenta en [Cómo añadir comentarios a un blog Astro usando solo Cloudflare](/blog/cloudflare-only-blog-comments/).

## Representa los enlaces Markdown mediante una lista de permitidos

Incluir enlaces en las respuestas de IA resulta práctico para orientar sobre los servicios. Sin embargo, evita insertar Markdown directamente en HTML.

La interfaz del chat convierte en elementos DOM solo las expresiones permitidas.

- Párrafos
- Listas con viñetas
- Negrita
- Código en línea
- Enlaces Markdown

Restringe aún más los destinos de los enlaces.

- Rutas dentro del mismo sitio, como `/services/`
- El origen actual
- `https://acecore.net`
- LINE oficial
- `mailto:info@acecore.net` cuando sea necesario
- `tel:0120987370` cuando sea necesario

Antes de validar una URL, asegúrate de aplicar `trim()`. La IA puede devolver una URL con espacios delante o detrás, como `[サービス一覧]( /services/ )`.

```ts
function sanitizeHref(rawHref: string, currentOrigin: string) {
  const href = rawHref.trim();

  if (href.startsWith("/")) return href;
  if (href.startsWith(`${currentOrigin}/`)) return href;
  if (href.startsWith("https://acecore.net/")) return href;
  if (href.startsWith("https://lin.ee/")) return href;
  if (href === "mailto:info@acecore.net") return href;
  if (href === "tel:0120987370") return href;

  return null;
}
```

Es más fácil de mantener un procesamiento estricto limitado a las expresiones que se usan en el chat que intentar implementar por completo la especificación Markdown. Aunque se quiera permitir que aparezcan URL externas libremente, conviene incluir al menos una lista de dominios permitidos y `rel="noopener noreferrer"`.

## Qué comprobar en local, preview y producción

El entorno local de Astro dev o preview no coincide por completo con el entorno de ejecución de Cloudflare Pages Functions. En los entornos donde no está configurado `OPENAI_API_KEY`, no se pueden usar respuestas de IA; por eso, comprueba el fallback de la interfaz y la visualización de errores.

En Pages preview o producción, comprueba lo siguiente.

- Que se pueda llamar a `/api/ai-contact` mediante POST
- Que estén configurados `OPENAI_API_KEY` y `OPENAI_MODEL`
- Que se rechacen las solicitudes con un Origin distinto
- Que se limiten la longitud de entrada y el número de mensajes del historial
- Que las respuestas estén en el locale mostrado
- Que los enlaces internos usen URL con locale
- Que la IA no haga afirmaciones definitivas sobre presupuestos o contratos
- Que el correo electrónico y el teléfono no aparezcan siempre
- Que los enlaces Markdown se conviertan solo en URL seguras

La integración con IA no está completa por el mero hecho de obtener una respuesta tras enviar 1 pregunta. Comprueba por separado las preguntas inesperadas, los textos largos, las preguntas desde páginas en inglés, las solicitudes de datos de contacto directo y las preguntas sobre precios.

## Indicadores que conviene observar en los registros y durante la operación

También es importante revisar los registros del chat de IA para consultas después de publicarlo.

Como mínimo, observa estos indicadores.

- Tasa de errores de la API
- Número de veces que se activa la limitación de frecuencia
- Promedio de mensajes por consulta (1 consulta)
- Número de visitas al formulario o a LINE
- Número de veces que la IA no puede responder y dirige al formulario
- Número de usos por locale

Si se guarda el contenido de las conversaciones, primero hay que decidir cómo se tratarán los datos personales. Para empezar con seguridad, se puede no guardar el contenido de los mensajes y observar únicamente el número de eventos y los errores.

## Qué se ha separado en este artículo

Este artículo se limita al diseño técnico del chat de IA para consultas. También implementamos un recorrido que transfiere al formulario el contexto de la consulta desde una página de servicios; se explica por separado en [Diseño técnico para transferir el contexto de la CTA de servicios al formulario de contacto](/blog/service-cta-contact-prefill/).

La razón es que son temas distintos.

- Chat de IA: aclarar dudas mediante una conversación y orientar de forma segura
- CTA de servicios: transferir al formulario el contexto del servicio que se está consultando

El primero trata de IA, límites de API, prompts y representación segura. El segundo trata de la experiencia del formulario y del diseño del recorrido. Separarlos facilita la lectura y la incorporación posterior de enlaces internos.

## Resumen

Al integrar un chat de IA para consultas en un sitio estático, es más importante diseñar primero el límite de API y el control de las respuestas que la interfaz del chat.

Estos son los aspectos que más ayudaron en la implementación.

- Llamar a OpenAI API desde Cloudflare Pages Function y no desde el navegador
- Reducir la entrada del endpoint y limitar el historial y la longitud de los mensajes
- Generar en el servidor la información del sitio y las URL por locale
- Indicar en el prompt qué puede afirmar la IA y qué no
- Separar las funciones del formulario, LINE y los datos de contacto directo
- Incluir comprobaciones de Origin y limitación de frecuencia
- Representar los enlaces Markdown mediante una lista de permitidos después de aplicar trim

El chat de IA para consultas se puede implementar sin problemas incluso en un sitio estático. La clave no es hacer que la IA destaque, sino ayudar a los visitantes a elegir de forma segura qué hacer a continuación.
