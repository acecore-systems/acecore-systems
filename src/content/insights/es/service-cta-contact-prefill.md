---
title: "Diseño técnico para trasladar el contexto de una CTA de servicio al formulario de contacto"
description: "Diseño de implementación para llevar al formulario el contexto que el usuario estaba leyendo en una página de servicio. Incluye mini CTA en Astro, el contrato de parámetros URL, la selección inicial de categoría, el prefill del asunto, URL multilingües, medición con GA y comprobaciones del HTML generado."
date: 2026-06-07T13:00
author: gui
tags: ["Tecnología", "Sitio web", "Servicios", "Astro", "CMS"]
image: https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=400&fit=crop&q=80
callout:
  type: info
  title: Punto clave del artículo
  text: Una CTA de servicio es un recorrido débil si solo envía al formulario. Pasar por la URL el contexto del servicio que se estaba leyendo e inicializar en el formulario la categoría y el asunto reduce a la vez la indecisión al rellenarlo y el trabajo de clasificación del equipo receptor.
processFigure:
  title: Flujo para pasar el contexto de la CTA de servicio al formulario
  steps:
    - title: Service
      description: Asignar un service key a la CTA de cada sección de servicio.
      icon: i-lucide-panels-top-left
      accent: brand
    - title: URL
      description: Pasarlo mediante un contrato URL como /contact/?category=service&service=web#contact-form.
      icon: i-lucide-link
      accent: amber
    - title: Form
      description: Inicializar en el formulario la categoría y el asunto correspondientes.
      icon: i-lucide-file-input
      accent: emerald
    - title: Ops
      description: El equipo receptor puede identificar el contexto del servicio solo con la categoría.
      icon: i-lucide-inbox
      accent: slate
compareTable:
  title: Diferencia al conectar la CTA con el formulario
  before:
    label: Enviar simplemente al formulario
    items:
      - El usuario debe volver a elegir el mismo servicio
      - El asunto queda vacío y no queda claro el motivo de la consulta
      - El equipo receptor debe leer el mensaje para identificar el servicio
      - La medición de cada CTA de servicio queda ambigua
  after:
    label: Trasladar el contexto
    items:
      - La categoría puede preseleccionarse desde el service key de la CTA
      - El nombre del servicio puede incorporarse al asunto
      - El equipo receptor puede clasificar la consulta viendo la categoría
      - El GA label y los parámetros URL facilitan revisar cada CTA
checklist:
  title: Lista de diseño para la adopción
  items:
    - text: Usar en la URL únicamente service keys cortos y estables
    - text: Usar como valores enviados datos operativamente estables, no textos visibles para el usuario
    - text: Hacer fallback a consultas generales de servicios ante un service key desconocido
    - text: Rellenar el asunto solo cuando esté vacío
    - text: Antes de añadir campos hidden, comprobar si la categoría existente permite clasificar
    - text: Generar en el servidor la URL de contacto para cada locale
    - text: Añadir GA label y location a la CTA para medir su rendimiento
    - text: Tras el build, revisar en el HTML el número de CTA y option y la presencia o ausencia de campos hidden
linkCards:
  - href: /services/
    title: Servicios
    description: Entrada al recorrido que contiene CTA específicas por servicio.
    icon: i-lucide-panels-top-left
  - href: /contact/
    title: Contacto
    description: Formulario que recibe parámetros URL e inicializa categoría y asunto.
    icon: i-lucide-message-square
  - href: /blog/astro-ai-contact-chat/
    title: Diseño técnico del chat de consultas con IA
    description: Artículo relacionado sobre un recorrido conversacional para ordenar el destino de la consulta.
    icon: i-lucide-sparkles
faq:
  title: Preguntas frecuentes
  items:
    - question: ¿Por qué no enviar el servicio objetivo en un campo hidden?
      answer: Para no aumentar los campos que revisa el equipo receptor y poder clasificar solo con la categoría existente. Cada campo adicional también añade comprobaciones operativas y en las plantillas de notificación.
    - question: ¿Es seguro que se manipulen los parámetros URL?
      answer: Un service key desconocido hace fallback a consultas generales. El valor enviado se selecciona entre los option del formulario, de modo que el valor de la URL no se usa directamente.
    - question: ¿Cómo debe tratarse en un sitio multilingüe?
      answer: Genere el destino de la CTA para cada locale y traduzca las etiquetas visibles del formulario. Mantener los valores enviados en nombres de clasificación japoneses estables ayuda a conservar una operación receptora uniforme.
---

Cuando un usuario que lee una página de servicio piensa «quiero consultar sobre esto», enviarlo sin más al formulario hace que se pierda parte del contexto.

El usuario debe volver a seleccionar el tipo de servicio y escribir el asunto. El equipo receptor tampoco puede saber fácilmente si se trata de producción web, operación de servidores o Aceserver hasta leer el cuerpo.

En el sitio de Acecore mejoramos este recorrido mediante la [PR que traslada el objetivo de la CTA al formulario de contacto](https://github.com/acecore-systems/acecore-net/pull/100). Este artículo lo organiza no solo como registro de implementación en Astro, sino también como diseño reutilizable en otros sitios.

## El objetivo no es solo reducir la entrada en el formulario

La finalidad no es simplemente rellenar campos automáticamente para que parezca más fácil.

Lo esencial es trasladar correctamente el contexto creado en la página de servicio al formulario y a la operación receptora.

| Perspectiva           | Qué se quiere mejorar                                          |
| --------------------- | -------------------------------------------------------------- |
| Usuario               | Evitar que vuelva a seleccionar el servicio que estaba leyendo |
| Formulario            | Inicializar categoría y asunto según la consulta               |
| Equipo receptor       | Clasificar el objetivo solo con la categoría                   |
| Medición              | Rastrear desde qué CTA empezó la consulta                      |
| Recorrido multilingüe | Enviar a una URL de contacto acorde al locale                  |

Aunque visualmente sea una mini CTA, el diseño abarca CTA, URL, formulario, traducción, medición y operación receptora.

## Aislar responsabilidades en un componente de CTA

Se coloca una CTA «Consultar sobre este servicio» al final de cada sección.

Conviene evitar escribir directamente en cada sección la misma generación de enlace y los mismos atributos de GA. Con siete servicios, la misma lógica se repite siete veces y puede quedar alguna copia sin actualizar al cambiar el texto o la especificación de URL.

Por eso creamos `ServiceSectionActions`, que centraliza la CTA de contacto.

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

El componente tiene tres responsabilidades:

- Generar una URL de contacto acorde al locale
- Incluir el service key en un parámetro URL
- Mantener el label y location usados por GA

La CTA es un punto de acción y también de medición. Conservamos `data-ga-label` y `data-ga-location` para comprobar después desde qué servicio comenzó la consulta.

## Convertir los parámetros URL en contrato con el formulario

Los valores se pasan mediante parámetros URL.

```txt
/contact/?category=service&service=web#contact-form
```

Lo importante es no incluir en la URL el texto visible.

Una etiqueta como `Webサイト制作・運用について` puede cambiar por traducción, variaciones de redacción o renombrados futuros. La URL contiene únicamente un service key corto como `web` o `server`.

| Parámetro  | Función                                                |
| ---------- | ------------------------------------------------------ |
| `category` | Indica la entrada para tratar una consulta de servicio |
| `service`  | Key estable del servicio objetivo                      |
| hash       | Se usa para desplazarse hasta el formulario            |

El usuario puede editar los parámetros. Por eso el formulario no usa el valor URL directamente como valor enviado, sino que lo mapea a un option existente.

## Mantener una tabla de clasificación en el formulario

El formulario conserva las categorías por servicio en un array.

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

`key`, `value`, `label` y `subject` tienen funciones distintas.

| Campo     | Función                                                  |
| --------- | -------------------------------------------------------- |
| `key`     | Identificador estable para buscar desde el parámetro URL |
| `value`   | Categoría que recibe el equipo al enviar el formulario   |
| `label`   | Option traducido que se muestra en pantalla              |
| `subject` | Nombre del servicio usado para inicializar el asunto     |

En un sitio multilingüe, `label` se traduce según el locale. `value`, en cambio, se usa para clasificar en recepción y se mantiene como valor japonés estable.

La decisión depende del producto. Si el CRM o formulario externo admite categorías multilingües, value también puede variar por locale. Para simplificar la operación receptora, separar la etiqueta visible y el valor enviado resulta más manejable.

## Añadir atributos data a los option

El select genera un option por servicio.

```astro
<select id="category" name="category" required>
  <option value="" disabled selected>
    {t(locale, "pages.contact.formCategoryPlaceholder")}
  </option>
  <option value="サービス全般について">
    {t(locale, "pages.contact.formCategoryService")}
  </option>
  {
    serviceCategoryOptions.map((option) => (
      <option
        value={option.value}
        data-service-key={option.key}
        data-service-subject={option.subject}
      >
        {option.label}
      </option>
    ))
  }
</select>
```

`data-service-key` se compara con `service` en la URL. `data-service-subject` se usa para crear el asunto.

Tampoco aquí se copia el valor URL directamente a `category.value`. Elegir siempre un option del select evita que un service key desconocido o un valor no válido se mezcle con los datos enviados.

## Hacer el prefill en el cliente

Un pequeño script inicializa el formulario tras cargar la página.

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

Hay cuatro puntos:

- Revisar `data-service-prefill-initialized` para evitar una inicialización doble
- Procesar solo cuando `category=service`
- Hacer fallback a `サービス全般について` ante un service key desconocido
- Rellenar el asunto solo cuando esté vacío

El último punto es importante. Si una navegación atrás o el autocompletado conserva el asunto, sobrescribirlo empeora la experiencia.

Con Astro View Transitions o navegación cliente, se inicializa también en `astro:page-load`.

```js
document.addEventListener("astro:page-load", initContactServicePrefill);
initContactServicePrefill();
```

## Moverse al formulario mediante el hash

La URL incluye `#contact-form`.

```txt
/contact/?category=service&service=web#contact-form
```

Como la página de contacto puede contener FAQ, LINE, explicaciones y otros medios, es natural llevar directamente al formulario a quien llega desde una CTA de servicio.

Si el formulario se inicializa, hay que cuidar el momento del desplazamiento. Usamos `requestAnimationFrame` para hacerlo después de renderizar el elemento.

```js
if (window.location.hash === "#contact-form") {
  window.requestAnimationFrame(() => {
    form.scrollIntoView({ block: "start" });
  });
}
```

El desplazamiento es pequeño, pero si la intención de la CTA no coincide con la posición visible, el usuario se pierde. URL, selección inicial y posición de scroll forman una unidad.

## Decidir no aumentar los campos hidden

No añadimos un campo hidden `相談対象サービス`.

Queríamos que la categoría bastara para identificar el servicio.

Al aumentar campos también aumentan las comprobaciones:

- Si debe aparecer en el correo de notificación
- Si hay que añadir una columna al panel o a una hoja de cálculo
- Si afecta a plantillas de respuesta automática
- Si se usa en CRM o Webhook
- Cómo separar nombres multilingües y valores enviados

Si la información puede expresarse con campos existentes, no añadir otro estabiliza la operación. Dividimos `お問い合わせ種別` entre consultas generales y categorías por servicio.

Un hidden sí puede ser adecuado si se requiere selección múltiple, guardar un ID de campaña o utilizar un campo separado en el CRM.

## Enfoque para sitios multilingües

Separar tres valores evita confusiones.

| Tipo             | Ejemplo                       | Depende del locale      |
| ---------------- | ----------------------------- | ----------------------- |
| URL key          | `web`, `server`, `aceserver`  | No                      |
| Etiqueta visible | `About Website Design`, etc.  | Sí                      |
| Valor enviado    | `Webサイト制作・運用について` | Depende de la operación |

Es más estable no traducir la URL key porque se usa al compartir, medir y comparar en el formulario.

La etiqueta visible siempre se traduce porque es lo que ve el usuario.

El valor enviado se decide según la operación. Aquí usamos valores japoneses estables. Separar la visualización multilingüe de la operación interna posterior facilita la gestión.

El flujo de traducción se describe también en [Cómo operar un blog multilingüe con Sveltia CMS](/blog/copilot-translation-pipeline/).

## Comprobar el HTML generado

No basta con mirar el componente. Tras el build hay que confirmar que enlaces y option se han generado.

Comprobamos:

- Siete CTA específicas en `/services/`
- Cada CTA contiene `?category=service&service=...#contact-form`
- Siete option con `data-service-key` en `/contact/`
- Aparecen `サービス全般について` y las categorías por servicio
- No aparece un hidden `相談対象サービス`

Por ejemplo, se puede usar `rg`.

```powershell
rg -n "category=service&service=.*#contact-form" dist\services\index.html
rg -n "data-service-key" dist\contact\index.html
rg -n "相談対象サービス" dist\contact\index.html
```

La última comprobación confirma que no aparece aquello que decidimos no añadir. En formularios se revisa tanto lo agregado como lo deliberadamente ausente.

## Reparto de funciones con el chat de IA

Este recorrido combina bien con el [diseño técnico del chat de consultas con IA](/blog/astro-ai-contact-chat/), pero sus funciones difieren.

| Recorrido       | Lo que hace bien                                    |
| --------------- | --------------------------------------------------- |
| Chat de IA      | Ordena mediante conversación qué servicio consultar |
| CTA de servicio | Pasa al formulario el contexto del servicio leído   |
| Formulario      | Recibe la consulta formal y deja registro           |

El chat es útil cuando el usuario todavía duda. Si ya terminó la página y decidió consultar ese servicio, enviarlo directamente al formulario sin otra conversación es más natural.

Al aumentar los recorridos, no se les debe dar la misma función. Conversación, CTA y formulario se usan según el estado del usuario.

## Resumen

Trasladar el contexto de la página de servicio al formulario tiene más efecto de lo que su pequeño cambio visual sugiere.

Los puntos importantes fueron:

- Convertir la CTA en componente y centralizar URL y atributos de medición
- Usar un service key estable en la URL, no una etiqueta visible
- Mapear el service key a un option del formulario
- Separar valor enviado, etiqueta y nombre usado para el asunto
- Hacer fallback a consultas generales ante un service key desconocido
- Rellenar el asunto solo si está vacío
- Clasificar con la categoría sin añadir hidden
- Revisar tras el build el número de enlaces, option y la ausencia de campos innecesarios

Mejorar un formulario no consiste solo en reducir campos. Llevar el contexto leído hasta el equipo receptor facilita la atención real.
