---
title: "Lecciones prácticas al desplegar Cloudflare Vectorize en varios repositorios"
description: "Primero explica qué es Cloudflare Vectorize y cómo ayuda a encontrar paráfrasis e información relacionada que la búsqueda por palabras clave puede pasar por alto; después recoge lecciones para introducirlo con seguridad en varios sitios Astro y Cloudflare Pages."
date: 2026-07-31T12:00
author: gui
tags: ["Tecnología", "Cloudflare", "Vectorize", "OpenAI", "Búsqueda interna"]
image: /uploads/acecore-generated/blog-cloudflare-pages-security.webp
callout:
  type: tip
  title: Vectorize es una base para buscar por significado, no solo por palabras
  text: "La base de datos vectorial de Cloudflare puede devolver páginas publicadas con un significado cercano a una pregunta aunque las palabras clave no coincidan exactamente. Su valor está en complementar la búsqueda actual con paráfrasis e información relacionada, no en sustituirla."
processFigure:
  eyebrow: Vectorize rollout
  title: Del HTML publicado al index de Production
  description: "En lugar de insertar directamente el source editable, usamos como referencia el HTML que realmente se publica y el commit desplegado."
  variant: inline
  steps:
    - title: Hacer build del HTML publicado
      description: "Generar HTML estático que refleje canonical, locale y noindex."
      icon: i-lucide-file-code-2
      accent: slate
    - title: Generar el corpus de forma determinista
      description: "Dividir el cuerpo en chunks y añadir ID derivados del content hash y metadata de auditoría."
      icon: i-lucide-boxes
      accent: brand
    - title: Verificar la UI en Preview
      description: "Mantener allí desactivada la búsqueda semántica y comprobar las sugerencias de Pagefind, el fallback y el aviso visible."
      icon: i-lucide-flask-conical
      accent: amber
    - title: Sincronizar el commit publicado con Production
      description: "Comparar el build marker con la corpus version y habilitar la función solo después de que las mutations hayan convergido."
      icon: i-lucide-shield-check
      accent: emerald
compareTable:
  title: La búsqueda y la sincronización necesitan políticas de fallo distintas
  before:
    label: Depender de Vectorize para todo
    items:
      - "Si se detiene AI, Vectorize o D1, deja de funcionar toda la búsqueda interna"
      - "Las diferencias entre el borrador del CMS y la página publicada aparecen directamente en los resultados"
      - "Una configuración errónea del script de sincronización puede modificar otro entorno o una gran cantidad de vectors"
      - "Es fácil considerar terminada la adopción cuando se hace merge del código"
  after:
    label: Búsqueda fail-soft y sincronización fail-closed
    items:
      - "Usar Pagefind para la búsqueda normal y dejar la búsqueda semántica como función auxiliar activada por una acción explícita"
      - "Crear el corpus desde el HTML publicado para reflejar canonical, noindex y locale"
      - "Validar la allowlist de Production, la tasa de eliminación, el commit publicado y la finalización de las mutations antes y después de sincronizar"
      - "Registrar por separado la implementación, la validación local, la verificación de UI en Preview y el funcionamiento en Production"
statBar:
  items:
    - value: "4 repos"
      label: Comparación de registros de adopción y pruebas
      description: "Comparamos Production, validación local, Preview e investigación previa sin tratarlos como el mismo estado."
      icon: i-lucide-git-branch
    - value: "36 → 250"
      label: Primera sincronización de Acecore Systems en Production
      description: "Generamos 250 vectors a partir de 36 páginas publicadas en japonés y sincronizamos con 0 eliminaciones."
      icon: i-lucide-database
    - value: "72 → 134"
      label: Validación local de World Foundation
      description: "Generamos 134 vectors a partir de 72 sources, pero lo registramos como un estado previo a Production."
      icon: i-lucide-test-tube-2
    - value: "37 tests"
      label: Validación del contrato de búsqueda
      description: "World Foundation superó 37 pruebas de contrato para la búsqueda, el corpus y la sincronización."
      icon: i-lucide-badge-check
checklist:
  title: Comprobaciones antes de adoptar Vectorize en el siguiente repositorio
  items:
    - text: "Mantener la búsqueda existente por palabras clave para conservar la ruta de búsqueda cuando Vectorize no esté disponible"
      checked: true
    - text: "Comparar la salida real del embedding model con las dimensions y el metric del index"
      checked: true
    - text: "Generar el corpus desde el HTML publicado y excluir noindex, canonical externos y pantallas de administración"
      checked: true
    - text: "Usar ID derivados del content hash para no volver a generar embeddings de chunks sin cambios"
      checked: true
    - text: "Dejar Preview solo con Pagefind y limitar Vectorize, D1 y los permisos de sincronización a Production"
      checked: true
    - text: "Confirmar que el upsert terminó antes de hacer delete y exigir aprobación explícita para eliminaciones grandes"
      checked: true
    - text: "Proteger la API de búsqueda con límites para body, query, locale, origin y rate limit, además de un kill switch"
      checked: true
    - text: "Sincronizar con Production solo un despliegue cuyo commit publicado coincida con la corpus version"
      checked: true
    - text: "Registrar por separado los estados implementado, validado localmente, verificado en Preview y activo en Production"
      checked: true
linkCards:
  - href: https://developers.cloudflare.com/vectorize/
    title: Documentación oficial de Cloudflare Vectorize
    description: "Permite consultar las especificaciones vigentes de index, binding, query y metadata filtering."
    icon: i-lucide-book-open
  - href: https://developers.cloudflare.com/vectorize/platform/limits/
    title: Limits actuales de Vectorize
    description: "Los límites de batch, topK, metadata y cantidad de vectors pueden cambiar, por lo que deben revisarse durante la implementación."
    icon: i-lucide-gauge
  - href: /insights/astro-cloudflare-site-architecture/
    title: Arquitectura general de un sitio Astro y Cloudflare
    description: "Una guía para decidir en qué capa ubicar el HTML estático, Pages Functions, D1 y la búsqueda."
    icon: i-lucide-layers-3
faq:
  title: Preguntas frecuentes
  items:
    - question: ¿Pagefind deja de ser necesario al introducir Vectorize?
      answer: "Lo mantuvimos. Pagefind es la búsqueda normal de baja dependencia que se genera desde el HTML estático, mientras que Vectorize actúa como búsqueda auxiliar de paráfrasis y conceptos relacionados. La búsqueda normal puede seguir disponible aunque AI o Vectorize fallen."
    - question: ¿D1 o R2 son obligatorios para adoptar Vectorize?
      answer: "No. Acecore Systems usa D1 para aplicar rate limit a la API de búsqueda, pero no es un almacenamiento obligatorio para Vectorize. El texto original puede estar en HTML publicado, JSON, D1, R2 u otra ubicación elegida según los requisitos."
    - question: ¿Cómo se gestionan el embedding model y las dimensions en la implementación actual?
      answer: "La implementación actual de Acecore Systems usa OpenAI text-embedding-3-large con 1,536 dimensions y cosine. El index anterior de BGE-M3 con 1,024 dimensions se conserva para rollback, y nunca se mezclan vectors de dimensions diferentes en un mismo index. Como la configuración del index no puede cambiarse después de crearlo, hay que comprobar la especificación oficial vigente y el output shape real antes de crear uno."
    - question: ¿Cuándo se considera terminada la adopción?
      answer: "Un merge o un test local no bastan. En Preview comprobamos Pagefind y el fallback de la UI; en Production comprobamos la coincidencia entre el commit publicado y el corpus, la sincronización del index, la convergencia de mutations, la búsqueda relacionada, el rate limit y el procedimiento de detención antes de registrarlo como activo."
---

## Primero: ¿qué es Cloudflare Vectorize?

Cloudflare Vectorize es la base de datos vectorial de Cloudflare. Guarda **embeddings** —representaciones numéricas de las características y el significado de texto, imágenes y otros datos— y busca información cuyo significado se acerca a una entrada. Como explica la [visión general oficial](https://developers.cloudflare.com/vectorize/), sirve para búsqueda semántica, recomendaciones, clasificación y la capa de recuperación de futuras aplicaciones RAG.

La búsqueda normal por palabras clave es excelente para encontrar rápidamente una página que contiene un nombre de producto, un nombre propio o un código de error. Vectorize ayuda cuando las palabras no coinciden exactamente. Una consulta como «quiero mejorar mi sitio» puede llevar a una página sobre soporte continuo de operaciones web o asesoría técnica aunque la redacción sea distinta.

> Vectorize no es por sí solo un chatbot que genera respuestas. Es una base de búsqueda que selecciona páginas publicadas relevantes y sus URL. Si después se añade IA generativa, esos resultados pueden ser la capa de evidencia de la respuesta.

## ¿Qué mejora al añadirlo?

- **Encuentra paráfrasis y preguntas**: los lectores no necesitan conocer los términos exactos del sitio para llegar a una página cercana a su intención.
- **Conecta conocimiento relacionado entre contenidos**: artículos, FAQ y páginas de servicios con redacciones distintas pueden descubrirse por su similitud.
- **Refuerza la búsqueda existente en vez de sustituirla**: si se usa solo para una acción explícita de «buscar información relacionada» y se conserva la búsqueda por palabras clave, mejora la encontrabilidad sin rehacer toda la UI.
- **Permite reutilizar la capa de recuperación**: devolver la página original y su URL sirve después para respuestas de IA con citas, artículos relacionados o recomendaciones.

La búsqueda semántica no es magia. Su calidad depende de un corpus público bien seleccionado, un embedding model adecuado y la evaluación de resultados reales. No debe sustituir la búsqueda normal de nombres de producto o códigos exactos.

## Primero, superponerla a la búsqueda existente

En una adopción inicial, lo más accesible es conservar la búsqueda actual por palabras clave y llamar a Vectorize solo cuando el lector pide explícitamente información relacionada.

1. Usar Pagefind u otra búsqueda normal para nombres de productos, nombres propios y términos cortos exactos.
2. Usar la búsqueda relacionada de Vectorize para preguntas, paráfrasis y temas cercanos.
3. Mantener disponible la búsqueda normal si falla el embedding provider o Vectorize.

Este es el valor y el alcance que conviene juzgar primero. Después, el artículo reúne resultados de adopción e investigación de Acecore Systems, World Foundation, Acecore Schools y Aceserver Portal y los convierte en prácticas reutilizables para otros sitios Astro y Cloudflare Pages.

> **Operación actual, reconfirmada el 31 de julio de 2026:** La Pages Preview habitual no tiene binding de Vectorize ni D1, mantiene `SEARCH_ENABLED=false` y usa únicamente Pagefind. La búsqueda relacionada y la sincronización automática funcionan solo contra el index de Production. En la última sincronización de Production comprobada antes de actualizar este artículo, 37 páginas y 256 vectors convergieron tras comparar el commit publicado y el corpus: tanto `current` como `expected` eran 256, con 1 upsert y 1 delete. [GitHub Actions run #30604713256](https://github.com/acecore-systems/acecore-systems/actions/runs/30604713256) Las menciones de índices Preview que aparecen más abajo son registros del despliegue, no un criterio actual de finalización.

Al introducir y probar Vectorize en varios repositorios, comprobamos que no basta con «crear embeddings y llamar a `query()`». Hay que decidir cómo construir el contenido de búsqueda, cómo mantener Preview solo con Pagefind mientras se protege Production, cómo evitar eliminaciones masivas por una sincronización incorrecta y si las páginas publicadas coinciden realmente con el index. En operación real, el diseño que rodea la llamada a la API de Vectorize fue más importante que la propia llamada.

## Conclusión: búsqueda fail-soft; sincronización y publicación fail-closed

El principio más reutilizable fue aplicar políticas de fallo diferentes a la búsqueda para usuarios y a la sincronización para operadores.

| Área                        | Política de fallo | Motivo                                                                                                                      |
| --------------------------- | ----------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Búsqueda interna normal     | fail-soft         | Seguir buscando con Pagefind aunque Vectorize esté detenido                                                                 |
| API de búsqueda relacionada | fail-soft         | Cerrar el error rápidamente sin afectar los resultados normales                                                             |
| Generación del corpus       | fail-closed       | No generar si las páginas, el locale, la cantidad o la metadata no son válidos                                              |
| Sincronización del index    | fail-closed       | No modificar si no se pueden verificar el entorno, los ID existentes, la tasa de eliminación y las mutations                |
| Habilitación en Production  | fail-closed       | Habilitar solo cuando coincidan el commit publicado y el corpus y converjan la sincronización y las mutations de Production |

Así se cumplen a la vez dos objetivos: «la búsqueda del sitio sigue disponible cuando falla la búsqueda con AI» y «una sincronización dudosa no modifica ni un solo registro».

## Estados verificados en cuatro repositorios

Al documentar una adopción, también es importante no agrupar todos los registros como «implementado». En esta ocasión se mezclaban funcionamiento en Production, validación local, verificación de UI en Preview e investigación previa.

| Repositorio      | Estado registrado y verificado                                                                                                                          | Lección obtenida                                                                                                                     |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Acecore Systems  | Index OpenAI de 1,536 dimensions activo solo en Production; la sincronización convergió en 37 páginas y 256 vectors, mientras Preview usa solo Pagefind | Convivencia con Pagefind, corpus de HTML publicado, rate limit con D1, sincronización segura de Production y migración de dimensions |
| Aceserver Portal | Confirmada en Production la búsqueda Vectorize de información de Acecore                                                                                | No mezclar el destino de búsqueda de información corporativa con el de reglas del WIKI                                               |
| World Foundation | Generó localmente 134 vectors a partir de 72 sources y superó 37 tests; no publicado                                                                    | Content hash, sincronización fail-closed y separación de puertas previas a la publicación                                            |
| Acecore Schools  | Solo se investigó la arquitectura existente; no se crearon index ni implementación                                                                      | Definir API, corpus, permisos y entornos antes de añadir un binding                                                                  |

En Acecore Systems dividimos la adopción en tres etapas: [PR #40 de implementación](https://github.com/acecore-systems/acecore-systems/pull/40), [PR #41 de preparación de Production](https://github.com/acecore-systems/acecore-systems/pull/41) y [PR #42 de habilitación en Production](https://github.com/acecore-systems/acecore-systems/pull/42). La sincronización de Preview y Production de los registros iniciales ya no describe la operación actual: el [PR #47](https://github.com/acecore-systems/acecore-systems/pull/47) dejó la Pages Preview normal solo con Pagefind, y ahora solo Production se sincroniza y ofrece búsqueda relacionada.

En el primer [GitHub Actions run](https://github.com/acecore-systems/acecore-systems/actions/runs/30539728752) de sincronización en Production, se compararon el commit publicado y la corpus version, y se generaron 250 vectors a partir de 36 páginas publicadas en japonés. El resultado fue upsert de 250 registros y delete de 0. Separar el merge del código, la preparación del index, la primera sincronización y la habilitación de la búsqueda dejó claras las condiciones de parada de cada etapa.

## Repartir funciones en lugar de sustituir Pagefind

El objetivo de introducir Vectorize no era descartar la búsqueda existente.

Pagefind crea un index estático a partir del HTML ya compilado y busca dentro del navegador. Funciona bien como búsqueda normal de términos explícitos, como nombres de productos, servicios y nombres propios, y no depende del estado de un embedding provider ni de Vectorize.

Vectorize resulta útil cuando la frase buscada no coincide exactamente con el cuerpo o cuando se quiere encontrar una página a partir de un concepto relacionado. Sin embargo, necesita generar embeddings y ejecutar una Vectorize query, por lo que también hay que considerar la latencia, los errores y el uso del servicio externo.

Por eso también separamos el comportamiento de la UI.

1. Mostrar sugerencias de Pagefind mientras se escribe
2. Llamar a la API solo cuando el usuario ejecute explícitamente la búsqueda relacionada
3. Configurar un timeout corto en la API
4. No eliminar los resultados de Pagefind si la API falla
5. Permitir que el kill switch detenga solo la búsqueda relacionada

En el modal de búsqueda actual, las sugerencias mientras se escribe proceden solo de Pagefind en el navegador. Solo al ejecutar «Buscar» se envía el término a OpenAI Embeddings API, como explica la UI, y se compara con la información pública de este sitio en Vectorize. El aviso pide no introducir información personal ni confidencial y distingue ese envío de las sugerencias normales por palabras clave.

Con esta arquitectura, Vectorize amplía la experiencia de búsqueda sin convertirse en un punto único de fallo para toda la búsqueda.

## Generar el corpus desde el HTML publicado, no desde borradores del CMS

Una de las diferencias más importantes entre sitios fue decidir cuál debía ser la fuente de verdad de la búsqueda.

Si se insertan directamente borradores del CMS o Markdown en el corpus, pueden diferir de las páginas que ven los usuarios.

- Puede incluirse contenido `draft` o `noindex`
- Pueden permanecer páginas con canonical externo
- Puede mezclarse texto repetido del layout o de la UI de administración
- No se reflejan title, description y URL que aparecen solo después de transformar el contenido
- Los límites de locale pueden volverse ambiguos en sitios multilingües

Por eso leímos el HTML generado después del build de Astro y aplicamos las condiciones de publicación antes de crear el corpus.

Acecore Systems incluye únicamente páginas en japonés que cumplen todas estas condiciones.

- Tienen un canonical same-origin
- Su `lang` es japonés
- No incluyen `noindex`
- No son `/admin`, `/api`, una página 404 ni una página de envío completado
- Permiten excluir elementos ajenos al cuerpo, como navegación y elementos con `data-vectorize-ignore`
- Tienen una URL root-relative publicada y un title

Dividimos el cuerpo en chunks con un objetivo de 850 caracteres, un máximo de 1,200 y un overlap de 120. Estos valores no son una respuesta universal, sino parámetros operativos elegidos para la longitud de estas páginas y su contenido en japonés. En otro sitio deben ajustarse tras evaluar la estructura documental y los resultados de búsqueda reales.

## Hacer determinista la sincronización incremental con content hash

Si los vector ID son números secuenciales o UUID generados durante la ejecución, regenerar el mismo corpus produce ID diferentes para todos los registros. En ese caso hay que volver a generar embeddings incluso para contenido sin cambios y eliminar en masa los ID anteriores.

En su lugar, generamos SHA-256 a partir del locale, la URL publicada, el número del chunk y el cuerpo. De ese valor derivamos de forma determinista tanto el ID como la corpus version.

```js
const identity = [locale, url, String(chunkIndex), text].join("\u001f");
const digest = sha256(identity);

const vector = {
  id: `v1-${digest.slice(0, 48)}`,
  text,
  metadata: {
    locale,
    url,
    chunkIndex,
    contentHash: digest,
  },
};
```

Durante la sincronización se comparan los ID esperados con los ID actuales del index.

- Generar embeddings y hacer upsert de los ID presentes solo en el conjunto esperado
- Hacer skip de los ID presentes en ambos conjuntos porque no cambiaron
- Tratar como candidatos de eliminación los ID presentes solo en el index
- Detenerse antes de cualquier mutation si aparece un ID fuera del espacio administrado `v1-`

Así, el mismo contenido publicado produce el mismo corpus y resulta más fácil explicar la causa de cada diferencia.

## Fijar el embedding model y la configuración del index como un contrato

El registro inicial de la implementación utilizó [`@cf/baai/bge-m3`](https://developers.cloudflare.com/workers-ai/models/bge-m3/) de Workers AI tras comprobar el output shape real y unificar la configuración en 1,024 dimensions／cosine. La implementación actual de Acecore Systems usa [OpenAI Embeddings](https://platform.openai.com/docs/guides/embeddings) `text-embedding-3-large` con 1,536 dimensions／cosine en un index de destino con otro nombre. Solo el index de Production se sincroniza y consulta; Preview usa únicamente Pagefind. El index anterior de BGE-M3 se conserva para rollback y no se mezclan vectors de dimensions distintas en un mismo index.

Lo importante no es el nombre del model, sino mantener el mismo contrato en cuatro lugares.

| Ubicación                | Valores fijos                       |
| ------------------------ | ----------------------------------- |
| corpus metadata          | model, dimensions, metric           |
| Vectorize index          | dimensions, metric                  |
| API de búsqueda          | model, embedding length             |
| Script de sincronización | model permitido, dimensions, metric |

Como explica la guía [Create indexes](https://developers.cloudflare.com/vectorize/best-practices/create-indexes/) de Cloudflare, las dimensions y el metric de un index no pueden cambiarse después de crearlo. Si la documentación del model es ambigua, no hay que crear el index por suposición: se deben comprobar la documentación vigente y la salida real.

Si se usa metadata filtering, el metadata index debe crearse antes de insertar los vectors. Los vectors insertados previamente no pasan a ser filtrables por el simple hecho de añadir después un metadata index; hay que hacer upsert de nuevo.

Los limits del producto también cambian. Reconfirmado el 31 de julio de 2026, Vectorize V2 admite batches de upsert de hasta 1,000 en Workers API y 5,000 en HTTP API. El límite normal de `topK` es 100, o 50 cuando se usa `returnValues: true` o `returnMetadata: "all"`. Durante la implementación siempre hay que volver a consultar los [limits actuales](https://developers.cloudflare.com/vectorize/platform/limits/) y la [client API](https://developers.cloudflare.com/vectorize/reference/client-api/).

Acecore Systems sincroniza mediante HTTP API en batches de 200 y busca con `topK: 15`; no usa el límite máximo del producto como cantidad de procesamiento. El límite del producto y el batch que el equipo puede reintentar y supervisar con seguridad deben decidirse por separado.

## Hacer upsert, esperar la convergencia y solo entonces delete

Las operaciones insert, upsert y delete de Vectorize son asíncronas. Una respuesta correcta de la API no significa que el cambio ya aparezca en una query.

La sincronización segura sigue este orden.

1. Validar el corpus y la configuración del index
2. Recuperar todos los vector ID actuales mediante pagination
3. Calcular los destinos de upsert y los candidatos de eliminación
4. Ejecutar upsert por batches
5. Esperar hasta que cada `mutationId` devuelto alcance `processedUpToMutation`
6. Ejecutar delete solo después de que los upserts hayan convergido
7. Confirmar también la convergencia de las mutations de delete

La documentación de la [Vectorize API](https://developers.cloudflare.com/vectorize/reference/client-api/) de Cloudflare también indica que las mutations son asíncronas. En lugar de depender de un sleep de duración fija, hay que verificar la finalización mediante el mutation ID.

Además, añadimos estas condiciones de parada al script de sincronización.

- El nombre del index de destino no coincide exactamente con la allowlist del index de Production
- El proceso intenta crear automáticamente el Production index
- El valor de `--confirm-production` no coincide con el nombre del index de destino
- Las dimensions o el metric difieren del contrato
- El corpus contiene locale, URL, metadata o content hash no válidos
- La cantidad de source pages o vectors supera el límite esperado
- El index actual contiene un ID no administrado
- La eliminación superaría el 20% de los vectors actuales
- Se supera el límite de retry o el tiempo de espera de mutation

Incluso una eliminación grande intencionada se separa en un procedimiento de migración revisado aparte, sin hacer override en el workflow normal. Las ejecuciones normales por push o schedule no lo permiten.

## Dejar Preview solo con Pagefind y hacer de Production el único destino de sincronización con privilegios altos

Separar Preview y Production durante la fase inicial ayudó a identificar permisos y condiciones de parada. Sin embargo, una Pages Preview normal no necesita bindings de Vectorize ni D1. La configuración actual mantiene `SEARCH_ENABLED=false`: Preview sirve para comprobar sugerencias de Pagefind, fallback y diseño. Los bindings de Vectorize y D1, los tokens de sincronización y el Production Environment se limitan a Production.

Hay que separar estos elementos.

- Vectorize index
- Recursos auxiliares como D1
- Wrangler environment
- API token
- GitHub Environment
- Concurrency del workflow de sincronización
- Repository variable de habilitación
- Kill switch

Limitamos los tokens de sincronización a Vectorize Read / Write para la Cloudflare account de destino y los separamos de la OpenAI API key. Production solo se ejecuta desde el `main` protegido y pasa por un reviewer de GitHub Environment.

Esto introduce un trade-off operativo. Si Production Environment tiene required reviewer, las sincronizaciones iniciadas por schedule también pueden quedar esperando aprobación. Antes de añadir cron, hay que decidir si solo se aprueba la primera publicación, si se aprueba cada sincronización periódica o si el trabajo programado se separa en otro job.

## Sincronizar con Production solo el corpus del commit publicado

El `main` de GitHub y el commit que Cloudflare Pages publica en ese momento no siempre coinciden. Justo después de un push, el build puede seguir en curso; o el deployment puede haber fallado y el commit anterior continuar publicado.

Por eso, para sincronizar Production colocamos un build marker en el sitio publicado y verificamos lo siguiente.

- El commit del marker es un Git SHA de 40 caracteres
- Ese commit existe en el repository
- Es un ancestro del `main` protegido
- Al hacer checkout de ese commit se puede regenerar el corpus
- La corpus version del marker coincide con el resultado regenerado
- El mismo commit sigue publicado inmediatamente antes de la mutation

La condición de finalización es un deployment de Cloudflare Pages conectado al GitHub repository. No usamos como referencia para Production artefactos publicados temporalmente desde local o con Direct Upload.

Esto evita desajustes como sincronizar un corpus nuevo con un sitio antiguo o mostrar en los resultados contenido de un commit cuyo deployment falló.

## Establecer límites de coste y privacidad en la API pública de búsqueda

La API de búsqueda es un endpoint público que envía el texto introducido por el usuario a un embedding provider. Además de la calidad de búsqueda, su diseño debe contemplar abuso, facturación, logs y URL devueltas.

Acecore Systems implementa estos límites.

| Área             | Ejemplo de implementación                                                            |
| ---------------- | ------------------------------------------------------------------------------------ |
| method／formato  | Aceptar solo JSON POST same-origin                                                   |
| body             | Hasta 2KiB; detener la lectura del stream incluso sin `Content-Length`               |
| query            | De 2 a 160 caracteres después de normalizar con NFKC                                 |
| locale           | Solo `ja`                                                                            |
| rate limit       | Ventanas fijas en D1: 20 solicitudes por minuto por client y 300 por minuto globales |
| Detención        | Desactivar solo la búsqueda relacionada mediante `SEARCH_ENABLED`                    |
| query            | No guardar la raw query en logs, corpus ni Vectorize metadata                        |
| URL de resultado | Permitir solo URL publicadas, same-origin y root-relative                            |
| Errores          | Devolver un code estructurado por etapa sin escribir el cuerpo en logs               |

Un UUID del client no es un límite de facturación sólido porque el usuario puede cambiarlo. Se debe combinar una client key derivada de la información de conexión de Cloudflare, un global limit y la supervisión de uso. Según la escala y el modelo de amenazas, también pueden considerarse Turnstile, WAF o Durable Objects.

Esta arquitectura usa D1 para el rate limit, pero D1 no es un requisito para adoptar Vectorize. Lo mismo se aplica a R2. Hay que elegirlos según el origen del texto y el lugar donde deba mantenerse el estado del rate limit.

## Dar contratos distintos a la búsqueda Vectorize y a la guía de AI

Acecore Systems tiene una función de guía de AI independiente de la búsqueda de «contenido relacionado» del sitio. La segunda envía el término a OpenAI Embeddings API solo cuando el lector ejecuta explícitamente la búsqueda y compara el embedding con la información pública de este sitio en Vectorize. La primera envía la pregunta y la conversación reciente a la API de AI compartida de Acecore y usa OpenAI para generar una respuesta.

No hay que agrupar ambas como una vaga «búsqueda de AI». Los datos enviados, el alcance de las fuentes, el comportamiento ante fallos, el uso y las explicaciones de privacidad deben diseñarse por separado; nunca se debe enviar silenciosamente un fallback de búsqueda Vectorize a la guía de AI.

## No mezclar las responsabilidades de los destinos de búsqueda

En Aceserver Portal separamos los destinos de búsqueda para la información de servicios de Acecore y para las reglas y procedimientos del servidor de Minecraft.

- Buscar en Vectorize las preguntas sobre Acecore
- Buscar las reglas del servidor en el WIKI oficial
- Si Vectorize falla, no hacer fallback a una respuesta del WIKI sin relación
- Enlazar solo el artículo del WIKI seleccionado como fundamento
- No inferir reglas que no puedan verificarse en el WIKI

Esto también es importante en RAG y chats de orientación. Cuantas más fuentes se puedan consultar, más necesario es decidir de antemano qué preguntas van a cada fuente y qué no debe responderse cuando no hay información.

## Fallos reales y cambios para la siguiente vez

Los registros de varios repos muestran problemas que tienden a repetirse.

| Síntoma                                                      | Causa                                                                   | Siguiente acción                                                                            |
| ------------------------------------------------------------ | ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Se añadió un binding, pero no existe una función de búsqueda | No se diseñaron la API, el corpus, el reindexado, los permisos ni la UI | Definir el contrato de búsqueda y el flujo operativo antes de crear el index                |
| Se adivinan las dimensions al crear el index                 | Se mira solo el nombre del model sin comprobar la salida real           | Revisar el embedding length real antes de crearlo                                           |
| Los vectors existentes no aparecen con metadata filter       | Se insertaron antes de crear el metadata index                          | Crear primero el metadata index y volver a hacer upsert de los vectors existentes           |
| La query es inestable justo después de sincronizar           | La mutation es asíncrona                                                | Esperar la convergencia con `mutationId` e index info                                       |
| Se producen muchos embeddings nuevos y delete                | El vector ID cambia en cada ejecución                                   | Usar ID deterministas derivados del content hash                                            |
| Un schedule permanece en waiting                             | Production Environment exige aprobación                                 | Diseñar conjuntamente la sincronización periódica y la política de aprobación               |
| Tests o Git fallan en Windows                                | Factores del entorno como `spawn EPERM`, locks o caches                 | Comparar con el baseline, fijar Node version y aislar con un `npm ci` limpio                |
| Se considera que un API timeout es un fallo de código        | Fallo temporal, payload incorrecto o latencia del provider              | Repetir con el contract correcto y distinguir un resultado puntual de un fallo reproducible |

También es importante no atribuir erróneamente a Vectorize un problema de dependencias o del entorno de ejecución. Hay que comprobar si el mismo error aparece en el baseline anterior al cambio y separar los defectos del código de los fallos del entorno.

## Registrar «implementado» en cuatro etapas

Distinguir estos estados en artículos e informes reduce las confusiones.

| Estado                | Ejemplo de condición de finalización                                                                                    |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Implementado          | La API, el corpus, el script de sincronización y la UI existen en una branch                                            |
| Validado localmente   | El build, la comprobación de tipos, los contract tests y el dry-run terminan correctamente                              |
| Verificado en Preview | Se comprobaron las sugerencias de Pagefind, el aviso cuando la búsqueda relacionada no está disponible y la UI          |
| Activo en Production  | Se sincronizó el commit publicado y se verificaron la convergencia de mutations, la API y el procedimiento de detención |

World Foundation superó la validación local, pero aún faltaban index, secret, deployment y browser QA, por lo que no lo registramos como activo en Production. Acecore Schools continúa en la fase de investigación.

En cambio, Acecore Systems se verificó mediante PR por etapas, la primera sincronización de Production, la habilitación en Production, el marker publicado y la API de búsqueda real.

Además del número de tests correctos, indicar qué sigue sin verificarse es la información operativa más útil para la siguiente persona responsable.

## Arquitectura mínima para extenderlo a otro sitio

Para otro sitio Astro y Cloudflare Pages, la arquitectura mínima es la siguiente.

```txt
Astro build
  -> HTML publicado
  -> Pagefind index
  -> Vectorize corpus (refleja locale / canonical / noindex)

Cloudflare Pages Function
  -> input validation
  -> OpenAI Embeddings API
  -> Vectorize query
  -> devolver solo URL publicadas

GitHub Actions
  -> resolver el commit publicado
  -> regenerar el corpus
  -> sincronizar solo el index de Production incluido en la allowlist
  -> delete después de que converja el upsert
  -> registrar la corpus version

Pages Preview
  -> SEARCH_ENABLED=false
  -> comprobar las sugerencias de Pagefind y el fallback de UI
```

No es necesario añadir generación de respuestas con un LLM desde el principio. Primero conviene construir una búsqueda que devuelva páginas relacionadas de forma segura y que pueda evaluarse. Si más adelante se añade generación de respuestas, el texto recuperado, las URL que se pueden citar y las condiciones en las que no se debe responder deben definirse como otro contrato.

## Resumen

La parte difícil de adoptar Cloudflare Vectorize no es la nearest-neighbor query.

Lo que determina la calidad al extenderlo a varios repos es el diseño operativo: qué se indexa como información pública, cómo se identifican chunks sin cambios, cómo se detiene una sincronización incorrecta, cómo se alinea el corpus con el commit publicado y cómo se conserva la búsqueda normal durante un fallo.

Las conclusiones son sencillas.

- Mantener Pagefind como búsqueda principal
- Usar Vectorize como búsqueda semántica auxiliar
- Generar el corpus desde el HTML publicado
- Derivar ID y version del content hash de forma determinista
- Dejar Preview solo con Pagefind y limitar Vectorize, D1 y los permisos de sincronización a Production
- Mantener la búsqueda fail-soft y la sincronización y publicación fail-closed
- Registrar implementación, validación local, verificación de UI en Preview y Production como estados diferentes

Establecer primero estos límites facilita operar Vectorize como una base de búsqueda que se actualiza continuamente, y no como una función aislada de AI.
