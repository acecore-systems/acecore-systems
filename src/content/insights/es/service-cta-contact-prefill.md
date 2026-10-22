---
title: "Diseño técnico para transferir el contexto desde las CTA de servicio al formulario de contacto"
description: "Diseño de implementación para transferir al formulario de contacto el contexto de la página del servicio que el usuario estaba leyendo. Organizamos en un formato reutilizable en otros sitios aspectos como las mini CTA en un sitio Astro, el contrato de parámetros de URL, la selección inicial del tipo de consulta, la precarga del asunto, las URL multilingües, la medición con GA y la comprobación del HTML generado."
date: 2026-06-07T13:00
lastUpdated: "2026-10-09T15:00:00+09:00"
author: gui
tags: ["Tecnología", "Sitio web", "Servicios", "Astro", "CMS"]
image: https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=400&fit=crop&q=80
callout:
  type: info
  title: Puntos clave de este artículo
  text: Las CTA de las páginas de servicio son un punto de entrada débil si solo envían al formulario. Si se transfiere por URL el contexto del servicio que estaba leyendo el usuario y el formulario preselecciona el tipo de consulta y el asunto, se reduce a la vez la indecisión al rellenarlo y la clasificación del lado receptor.
processFigure:
  title: Flujo de transferencia del contexto desde una CTA de servicio al formulario
  steps:
    - title: Servicio
      description: Asignar una clave de servicio a la CTA de cada sección de servicio.
      icon: i-lucide-panels-top-left
      accent: brand
    - title: URL
      description: Transferir mediante el contrato de URL, por ejemplo, /contact/?category=service&service=web#contact-form.
      icon: i-lucide-link
      accent: amber
    - title: Formulario
      description: El formulario preselecciona el tipo de consulta correspondiente y el asunto.
      icon: i-lucide-file-input
      accent: emerald
    - title: Operaciones
      description: El equipo receptor puede identificar el contexto del servicio con solo ver el tipo de consulta.
      icon: i-lucide-inbox
      accent: slate
compareTable:
  title: Diferencias al conectar una CTA con un formulario
  before:
    label: Si solo se envía al formulario
    items:
      - El usuario vuelve a seleccionar en el formulario el mismo servicio
      - El asunto queda en blanco y cuesta saber de qué trata la consulta
      - El equipo receptor no puede identificar fácilmente el servicio objetivo sin leer el cuerpo del mensaje
      - La medición del efecto de las CTA de cada servicio se vuelve imprecisa
  after:
    label: Al transferir el contexto
    items:
      - El tipo de consulta puede preseleccionarse mediante la clave de servicio de la CTA
      - Se puede organizar el motivo de consulta incluyendo el nombre del servicio en el asunto
      - El equipo receptor puede clasificarla consultando el tipo de consulta
      - Es más fácil analizar cada CTA mediante la etiqueta de GA y los parámetros de URL
checklist:
  title: Lista de comprobación para la implementación
  items:
    - text: Usar en los parámetros de URL únicamente claves de servicio breves y estables
    - text: Usar como valores recibidos por el formulario valores estables para la operación, no textos visibles para el usuario
    - text: Hacer que las claves de servicio desconocidas recurran a Servicios en general
    - text: Precargar el asunto solo cuando esté vacío
    - text: Antes de añadir campos ocultos, comprobar si se puede clasificar con el tipo de consulta existente
    - text: Generar en el servidor las URL de contacto para cada idioma
    - text: Asignar etiquetas de GA y la ubicación a las CTA para medir su rendimiento
    - text: Tras la compilación, comprobar en el HTML generado el número de CTA, el número de opciones y la presencia o ausencia de campos ocultos
linkCards:
  - href: /services/
    title: Servicios
    description: Punto de entrada al flujo con CTA para cada servicio.
    icon: i-lucide-panels-top-left
  - href: /contact/
    title: Contacto
    description: Formulario que recibe parámetros de URL y preselecciona el tipo y el asunto.
    icon: i-lucide-message-square
  - href: /blog/astro-ai-contact-chat/
    title: Diseño técnico del chat de IA para consultas
    description: Artículo relacionado sobre un flujo que organiza mediante una conversación el destino de la consulta.
    icon: i-lucide-sparkles
faq:
  title: Preguntas frecuentes
  items:
    - question: ¿Por qué no se envía el servicio objeto de la consulta mediante un campo oculto?
      answer: '"En 2026, durante el mes 6, la clasificación se hacía únicamente con los tipos de consulta existentes, sin añadir campos ocultos. El formulario actual de Systems guarda service, from y entry en campos ocultos de integración, por separado del valor de clasificación."'
    - question: ¿Qué pasa si se manipulan los parámetros de URL?
      answer: Las claves de servicio desconocidas recurren a Servicios en general. El valor enviado se elige entre las opciones del formulario, de modo que el valor de URL no se utiliza directamente como valor recibido.
    - question: ¿Cómo se gestiona en un sitio multilingüe?
      answer: El destino de los enlaces de las CTA se genera para cada idioma y también se traducen las etiquetas visibles del formulario. En cambio, conviene usar valores recibidos estables en japonés para que la operación del equipo receptor no varíe.
---

> **Actualización del mes 9 de 2026:** Los ejemplos de `ServiceSectionActions` y `service=web` que aparecen a continuación documentan una configuración utilizada en el sitio web oficial de Acecore en 2026, durante el mes 6. En Acecore Systems, las [CTA de las páginas de servicio](https://github.com/acecore-systems/acecore-systems/blob/main/src/components/ServiceDetailPage.astro) actuales incluyen `category`, `service`, `from` y `entry`; el [formulario de contacto](https://github.com/acecore-systems/acecore-systems/blob/main/src/pages/contact.astro) valida una clave de servicio breve y preselecciona el tipo y el asunto. Actualmente también se usan campos ocultos para medición e integración, así que no copies como especificación vigente el diseño descrito a continuación de no usar campos ocultos. Sigue vigente el principio de no confiar en los valores de la URL y asignarlos a opciones del formulario.

Cuando un usuario que ha leído una página de servicio piensa «Quiero consultar sobre este tema», limitarse a enviarlo al formulario de contacto hace que se pierda algo de contexto.

El usuario tiene que volver a elegir en el formulario el tipo de servicio y escribir otra vez el asunto. Además, el equipo receptor no puede determinar fácilmente si se trata de una consulta sobre creación web, gestión de servidores o Aceserver hasta que lee el cuerpo del mensaje.

En el sitio de Acecore, mejoramos este flujo mediante [una PR que transfiere el servicio objeto de la consulta desde la CTA de servicio al formulario de contacto](https://github.com/acecore-systems/acecore-net/pull/100). En este artículo organizamos el tema no solo como un registro de implementación en Astro, sino también como un diseño de flujo reutilizable en otros sitios web.

## Validar la inicialización del formulario con una CTA

Prueba el flujo con una clave de servicio válida, una clave desconocida y una operación de volver con el asunto ya rellenado. Comprueba que el tipo se asigne a una opción permitida y que el asunto no se sobrescriba; utiliza el mismo contrato de valores incluso en las URL de distintos idiomas. No incluyas información personal ni texto libre en la URL: transfiere el contexto de la consulta únicamente mediante identificadores breves.

[MDN URLSearchParams: especificación para leer parámetros de URL](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams)

## El objetivo no es reducir los campos del formulario

El objetivo de esta implementación no es solo autocompletar campos del formulario para que resulte más fácil rellenarlo.

Lo esencial es transmitir correctamente el contexto que se originó en la página del servicio al formulario de contacto y al proceso de recepción.

| Perspectiva       | Qué se quiere mejorar                                                                          |
| ----------------- | ---------------------------------------------------------------------------------------------- |
| Usuario           | Reducir el esfuerzo de volver a seleccionar el servicio que estaba consultando                 |
| Formulario        | Preseleccionar el tipo de consulta y el asunto de acuerdo con el motivo de consulta            |
| Equipo receptor   | Facilitar la clasificación del servicio objeto de la consulta con solo ver el tipo de consulta |
| Medición          | Facilitar el seguimiento del inicio de una consulta desde cada CTA de servicio                 |
| Flujo multilingüe | Enviar al usuario a la URL de contacto correspondiente a su idioma                             |

Aunque visualmente se trate de una pequeña CTA, el diseño abarca las CTA, las URL, el formulario, las traducciones, la medición y las operaciones de recepción.

## Separar las responsabilidades en un componente CTA

Al final de cada sección de servicio, colocamos una CTA con el texto «Consultar sobre este servicio».

Lo primero que conviene evitar es escribir directamente en cada sección de la página de servicios la misma generación de enlaces y los mismos atributos de GA. Si hay 7 servicios, la misma forma de escribirlo aparecerá 7 veces. Así es fácil que se pase algo por alto cuando se quiere cambiar el texto o la especificación de la URL.

Por eso, creamos `ServiceSectionActions` para reunir las CTA de contacto.

```astro
---
import Icon from "./Icon.astro";
import { t, getLocalizedUrl, type Locale } from "../i18n";

interface Props {
  locale: Locale;
  gaLabel: string;
  gaLocation: string;
  serviceKey: string;
}

const { locale, gaLabel, gaLocation, serviceKey } = Astro.props;
const u = (path: string) => getLocalizedUrl(path, locale);
const contactUrl = `${u("/contact/")}?category=service&service=${encodeURIComponent(serviceKey)}#contact-form`;
---

<a
  href={contactUrl}
  class="ac-btn-outline gap-2 text-sm sm:w-auto"
  data-ga-event="cta_click"
  data-ga-label={gaLabel}
  data-ga-location={gaLocation}
  data-ga-destination={contactUrl}
>
  <Icon name="message-circle" class="text-sm" />
  {t(locale, "pages.services.miniCta")}
</a>
```

Las responsabilidades de este componente son 3:

- Generar una URL de contacto adecuada para cada idioma
- Incluir la clave de servicio en los parámetros de URL
- Añadir una etiqueta y una ubicación para la medición de GA

Las CTA son puntos de acción para el usuario y también puntos de medición. Conservamos `data-ga-label` y `data-ga-location` para poder consultar más adelante desde qué servicio se inició una consulta.

## Usar los parámetros de URL como contrato con el formulario

Los valores transferidos desde la CTA al formulario de contacto se envían mediante parámetros de URL.

```txt
/contact/?category=service&service=web#contact-form
```

Lo importante aquí es no poner en la URL un texto visible para el usuario.

Los textos visibles como `Webサイト制作・運用について` se ven afectados por las traducciones, las variaciones de redacción y los cambios de nombre futuros. En la URL solo se incluyen claves de servicio breves, como `web` o `server`.

| Parámetro  | Función                                                          |
| ---------- | ---------------------------------------------------------------- |
| `category` | Indica la entrada que se procesa como consulta sobre un servicio |
| `service`  | Clave estable que representa el servicio objeto de la consulta   |
| hash       | Se usa para desplazarse a la ubicación del formulario            |

El usuario puede editar los parámetros de URL. Por eso, el formulario no usa el valor de URL directamente como valor enviado, sino que lo asigna a una opción existente.

<figure class="article-diagram" data-layout="flow" data-tone="teal" data-count="3" aria-labelledby="diagram-service-cta-contact-prefill">
  <figcaption>
    <strong id="diagram-service-cta-contact-prefill">Flujo desde la recepción de consultas hasta el registro de gestión</strong>
    <span>Se muestran las fases de implementación del flujo. El contacto con clientes reales y la finalización de la atención deben verificarse por separado.</span>
  </figcaption>
  <ol class="article-diagram__nodes">
    <li>
      <span class="article-diagram__symbol">
        <span aria-hidden="true">1</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
          <path d="M4 5h16v14H4z M4 7l8 6 8-6"/>
        </svg>
      </span>
      <strong>Leer el contexto de la CTA</strong>
      <span>Asignar la clave de servicio estable a las URL visibles en cada idioma y a la lista de opciones permitidas del formulario.</span>
    </li>
    <li>
      <span class="article-diagram__symbol">
        <span aria-hidden="true">2</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
          <path d="M12 2l8 3v6c0 5-3 8-8 11-5-3-8-6-8-11V5z M8 12l3 3 5-6"/>
        </svg>
      </span>
      <strong>Validar los datos y los permisos</strong>
      <span>Precargar el asunto solo si está vacío y comprobar también en la API la identidad del usuario y sus permisos de operación.</span>
    </li>
    <li>
      <span class="article-diagram__symbol">
        <span aria-hidden="true">3</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
          <path d="M6 3h9l4 4v14H6z M15 3v5h4 M9 12h6 M9 16h6"/>
        </svg>
      </span>
      <strong>Transferir al registro de recepción</strong>
      <span>Reflejar el contenido de la consulta en el historial del CRM y en las tareas posteriores, y registrar por separado la finalización efectiva de la atención por parte del responsable.</span>
    </li>
  </ol>
</figure>

## Mantener una tabla de clasificación en el formulario

En el formulario de contacto, mantenemos la clasificación por servicio en un arreglo.

```ts
const serviceCategoryOptions = [
  {
    key: "server",
    value: "サーバー構築・運用について",
    label: t(locale, "pages.contact.formCategoryServiceServer"),
    subject: t(locale, "pages.services.server.title"),
  },
  {
    key: "web",
    value: "Webサイト制作・運用について",
    label: t(locale, "pages.contact.formCategoryServiceWeb"),
    subject: t(locale, "pages.services.web.title"),
  },
];
```

`key`, `value`, `label` y `subject` desempeñan funciones distintas.

| Campo     | Función                                                      |
| --------- | ------------------------------------------------------------ |
| `key`     | Identificador estable para buscarlo en los parámetros de URL |
| `value`   | Tipo de consulta que se recibe al enviar el formulario       |
| `label`   | Opción traducida que se muestra en pantalla                  |
| `subject` | Nombre del servicio que se usa para precargar el asunto      |

En los sitios multilingües, traducimos `label` según el idioma. En cambio, como `value` se usa para la clasificación del lado receptor, lo fijamos en un valor japonés estable.

La decisión depende del producto. Si el CRM o el formulario externo admite categorías multilingües, también se pueden adaptar los valores al idioma. Si, como en este caso, se quiere simplificar la operación del equipo receptor, resulta más fácil gestionar por separado la etiqueta visible y el valor recibido.

## Añadir atributos data a las opciones

En el selector del formulario, generamos una opción por servicio.

```astro
<select id="category" name="category" required>
  <option value="" disabled selected>
    {t(locale, "pages.contact.formCategoryPlaceholder")}
  </option>
  <option value="サービス全般について">
    {t(locale, "pages.contact.formCategoryService")}
  </option>
  {serviceCategoryOptions.map((option) => (
    <option
      value={option.value}
      data-service-key={option.key}
      data-service-subject={option.subject}
    >
      {option.label}
    </option>
  ))}
</select>
```

Usamos `data-service-key` para compararlo con `service` de la URL. `data-service-subject` se usa para construir el asunto.

La clave también aquí es no asignar directamente el valor de la URL a `category.value`. Al seleccionar siempre una opción del selector, evitamos que una clave de servicio desconocida o un valor no válido se incluya entre los valores recibidos.

## Precargar los valores desde el cliente

Inicializamos el formulario con un pequeño script después de cargar la página.

```js
function initContactServicePrefill() {
  const form = document.getElementById("contact-form");
  if (!form || form.dataset.servicePrefillInitialized === "true") return;

  form.dataset.servicePrefillInitialized = "true";

  const url = new URL(window.location.href);
  const requestedCategory = url.searchParams.get("category");
  const requestedService = url.searchParams.get("service") || "";
  const category = document.getElementById("category");
  const subject = document.getElementById("subject");

  if (
    requestedCategory === "service" &&
    category instanceof HTMLSelectElement
  ) {
    const serviceOption = Array.from(category.options).find((option) => {
      return option.dataset.serviceKey === requestedService;
    });

    category.value = serviceOption?.value || "サービス全般について";
    category.dispatchEvent(new Event("input", { bubbles: true }));
    category.dispatchEvent(new Event("change", { bubbles: true }));

    if (
      serviceOption &&
      subject instanceof HTMLInputElement &&
      !subject.value.trim()
    ) {
      const template = form.dataset.serviceSubjectTemplate || "{service}";
      const serviceName =
        serviceOption.dataset.serviceSubject ||
        serviceOption.textContent?.trim() ||
        "";
      subject.value = template.replace("{service}", serviceName);
    }
  }
}
```

Los puntos clave de la implementación son 4:

- Comprobar `data-service-prefill-initialized` para evitar una inicialización duplicada
- Procesar solo cuando sea `category=service`
- Si la clave de servicio es desconocida, recurrir a Servicios en general
- Precargar el asunto solo cuando esté vacío

El último punto, solo si el asunto está vacío, es importante. Si el usuario conserva un asunto al volver o por el autocompletado del navegador, sobrescribirlo sin más empeora la experiencia.

Si se usan Astro View Transitions o navegación del lado del cliente, hay que inicializar también en `astro:page-load`, no solo durante la carga inicial habitual.

```js
document.addEventListener("astro:page-load", initContactServicePrefill);
initContactServicePrefill();
```

## Desplazarse hasta la ubicación del formulario con hash

La URL de la CTA incluye `#contact-form`.

```txt
/contact/?category=service&service=web#contact-form
```

Como la página de contacto incluye preguntas frecuentes, LINE, explicaciones y otros medios de contacto además del formulario, resulta más natural que quienes llegan desde una CTA de servicio vayan directamente a la ubicación del formulario.

Sin embargo, si el formulario se inicializa en el lado del cliente, hay que prestar atención al momento del desplazamiento. Queremos desplazar la página después de que se haya renderizado el elemento, así que usamos `requestAnimationFrame`.

```js
if (window.location.hash === "#contact-form") {
  window.requestAnimationFrame(() => {
    form.scrollIntoView({ block: "start" });
  });
}
```

Desplazarse hasta el formulario es un detalle pequeño, pero el usuario se desorienta si la intención de la CTA y la ubicación mostrada del formulario no coinciden. En el diseño del flujo se consideran conjuntamente la URL, la selección inicial y la posición de desplazamiento.

## Decidir no añadir campos ocultos

En esta implementación, no añadimos el campo oculto `相談対象サービス`.

El motivo es que queríamos que el servicio objeto de la consulta pudiera identificarse solo con el tipo de consulta.

Al aumentar los campos del formulario, también aumentan los aspectos que hay que comprobar:

- Si se incluyen en el correo de notificación
- Si se añade una columna en el panel de administración o la hoja de cálculo
- Si afectan a las plantillas existentes de respuesta automática
- Si se usan en la integración con el CRM o en un Webhook
- Cómo se distinguen las etiquetas visibles multilingües de los valores recibidos

Si la información necesaria puede representarse con los campos existentes, no añadir más mantiene la operación más estable. En este caso, bastó con dividir `お問い合わせ種別` entre Servicios en general y los servicios concretos, de forma que el equipo receptor pueda distinguirlos.

Por supuesto, si se necesita seleccionar varios servicios a la vez, guardar también el identificador de una campaña publicitaria o usar un campo separado en el CRM, puede ser conveniente añadir campos ocultos.

## Criterios para los sitios multilingües

Para crear este flujo en un sitio multilingüe, conviene separar 3 tipos de valores.

| Tipo             | Ejemplo                             | Depende del idioma      |
| ---------------- | ----------------------------------- | ----------------------- |
| Clave de URL     | `web`, `server`, `aceserver`        | No                      |
| Etiqueta visible | `About Website Design`, entre otras | Sí                      |
| Valor recibido   | `Webサイト制作・運用について`       | Depende de la operación |

Es más estable no traducir la clave de URL, ya que así se pueden compartir y analizar los enlaces y compararlos en el formulario.

Las etiquetas visibles siempre se traducen, porque son los textos que ve el usuario en el formulario.

Los valores recibidos se ajustan a la operación. En este caso, usamos valores estables en japonés. El formulario resulta más fácil de gestionar si se diseñan por separado las etiquetas visibles multilingües y las operaciones internas posteriores a la recepción.

También explicamos el flujo de traducción en [Cómo gestionar un blog multilingüe con Sveltia CMS](/blog/copilot-translation-pipeline/).

## Comprobar el HTML generado

En este tipo de implementación no basta con revisar el componente. Después de la compilación, comprobamos en el HTML generado que los enlaces y las opciones se hayan renderizado correctamente.

Estos son los aspectos que comprobamos:

- La página `/services/` muestra 7 CTA de servicio
- Cada CTA tiene `?category=service&service=...#contact-form`
- `/contact/` contiene 7 opciones con `data-service-key`
- Aparecen tanto Servicios en general como los tipos específicos de cada servicio
- No se genera el campo oculto `相談対象サービス`

Por ejemplo, se puede comprobar con `rg` en el HTML generado.

```powershell
rg -n "category=service&service=.*#contact-form" dist\services\index.html
rg -n "data-service-key" dist\contact\index.html
rg -n "相談対象サービス" dist\contact\index.html
```

El último aspecto sirve para comprobar que no aparezca algo que no debería estar. Al modificar el formulario, verificamos no solo lo que se añade, sino también aquello que se decidió no añadir.

## Repartir las funciones con el chat de IA

Este flujo encaja bien con el [diseño técnico del chat de IA para consultas](/blog/astro-ai-contact-chat/). Sin embargo, sus funciones son distintas.

| Flujo           | Qué hace mejor                                                                 |
| --------------- | ------------------------------------------------------------------------------ |
| Chat de IA      | Organiza mediante una conversación a qué servicio conviene dirigir la consulta |
| CTA de servicio | Transfiere al formulario el contexto del servicio que el usuario está leyendo  |
| Formulario      | Recibe el motivo formal de la consulta y deja un registro                      |

El chat de IA es un buen punto de entrada cuando el usuario todavía tiene dudas. En cambio, cuando ha terminado de leer la página del servicio y ha decidido «Consultar sobre este servicio», resulta más natural enviarlo directamente al formulario, sin interponer una conversación.

Al añadir flujos, es importante no asignarles a todos la misma función. La conversación, las CTA y el formulario se usan según la situación del usuario.

## Resumen

La implementación que transfiere el contexto desde una página de servicio al formulario de contacto tiene más efecto del que su apariencia sencilla podría sugerir.

Estos fueron los aspectos más importantes del diseño:

- Convertir las CTA en componentes y centralizar la generación de URL y los atributos de medición
- Incluir en la URL una clave de servicio estable, no un texto visible
- Asignar la clave de servicio a una opción del formulario
- Separar el valor recibido, la etiqueta visible y el nombre del servicio usado para el asunto
- Hacer que las claves de servicio desconocidas recurran a Servicios en general
- Precargar el asunto solo cuando esté vacío
- Clasificar mediante el tipo de consulta sin aumentar los campos ocultos
- Comprobar en el HTML generado después de la compilación el número de enlaces, el número de opciones y la ausencia de campos innecesarios

Mejorar un formulario de contacto no consiste solo en reducir los campos. Transmitir sin perder el contexto que el usuario estaba consultando hasta el equipo receptor facilita la atención de las consultas reales.

## Actualización (día 6, mes 10 de 2026): de la recepción de consultas al registro de gestión

En una modificación de integración anonimizada, tratamos como estados distintos la recepción de una consulta, su reflejo en el historial y las tareas del CRM, y la finalización de la atención por parte del responsable. Validamos los datos de entrada de la URL y la ruta de consulta, y asignamos los valores de ruta a una enumeración estable. El mero conocimiento de la URL del panel de administración no se considera autorización para modificar el historial o las tareas.

También verificamos en la API la identidad del usuario y sus permisos de operación, y no incorporamos información de clientes a búsquedas públicas ni a respuestas públicas de IA. Que la implementación de recepción o registro esté completada no significa que se haya realizado una verificación integral desde el contacto con clientes reales hasta la finalización del trabajo.

Distinguimos la precarga del formulario de la información introducida por el usuario y, en las solicitudes que requieren una respuesta, transferimos el canal de contacto preferido como una selección fija obligatoria a la tarea posterior. Alineamos los requisitos obligatorios de la interfaz y la API, así como los permisos de lectura y adición de los responsables, y verificamos el esquema y las restricciones tras modificar la base de datos. También diferenciamos las comprobaciones necesarias en producción de la copia de todas las bases de datos de clientes reales para uso en desarrollo.
