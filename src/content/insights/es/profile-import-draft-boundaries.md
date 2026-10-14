---
title: "Importar datos del perfil como borrador: comparar, elegir y publicar con criterio"
description: "Importa URL públicas, texto, CSV, HTML y JSON a borradores de perfil. Explica medios limitados, orden de enlaces, conservación tras fallos de relectura y guardado y publicación por el titular."
date: "2026-10-06T01:10:00+09:00"
lastUpdated: "2026-10-15T00:00:00+09:00"
author: gui
image: /images/insights/covers/profile-import-draft-boundaries-cover-v1.webp
tags: ["Web", "Import", "Security"]
callout:
  type: note
  title: "Implementación verificada; falta la aceptación en una cuenta real"
  text: "La importación de archivos y de URL, imágenes y audio públicos limitados está implementada, integrada y desplegada. Se comprobaron interacciones sintéticas y algunos medios públicos. La revisión de derechos, el guardado y la publicación por titulares reales, las integraciones oficiales y los errores 429 de origen siguen pendientes por separado."
---

Al trasladar un perfil existente a otro editor, compara los valores actuales con los candidatos importados antes de sustituir nada. Este caso anonimizado explica los límites entre importar datos y publicar un perfil.

## Probar la conservación de ediciones con una biografía

Edite manualmente la biografía e importe un texto distinto como candidato. Compruebe que los campos no elegidos permanecen, que puede revisar reemplazos y que cancelar restaura el original. Compare después borrador y página pública: importar por sí solo no debe cambiar la publicación.

[OWASP：Validar formato, valores y longitud de entrada](https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html)

## Define primero los formatos de entrada admitidos

Además de texto, CSV, HTML estático, JSON común y plantillas, se obtienen candidatos de URL de perfiles públicos admitidos. El HTML se analiza como datos; sus scripts y marcado original no se ejecutan en la página pública. Se validan longitud, cantidad, formato y enlaces HTTPS.

Los enlaces conservan el orden de aparición y los paréntesis emparejados dentro de la URL. Una URL dentro de Markdown no se recoge dos veces, pero una repetición en otra posición sigue siendo un candidato independiente. El titular decide sobre el orden y los duplicados.

## Revisa los candidatos antes de sustituir valores existentes

No publiques de inmediato los resultados del análisis: compáralos primero con los valores actuales. La persona propietaria del perfil selecciona los campos uno por uno y puede editar los valores candidatos antes de aplicarlos al editor. Aplicar un campo seleccionado sustituye el valor actual, así que hay que revisar las diferencias en cada importación. También es posible deshacer el cambio. Estos controles no garantizan que se resuelvan automáticamente los conflictos con ediciones hechas en otra pantalla o por otra persona.

Si falla la relectura de la misma URL o archivo, se conservan candidatos, ediciones, selección, correspondencia de columnas CSV y medios descargados. Se muestra el error y que son candidatos anteriores. Solo se sustituyen al cambiar origen, método, texto o archivo, o tras una relectura correcta. Conservarlos no los aplica, guarda ni publica.

## Distinguir la obtención por URL de las integraciones oficiales

La obtención se limita a estructuras públicas conocidas de Profcard, lit.link, POTOFU, HTML Meishi y foriio. Se comprueban identidad, exclusiones de indexación y coincidencia de candidatos, sin acceder a páginas autenticadas ni destinos no permitidos. No implica integración oficial de acceso o API ni migración completa.

Siguen disponibles la plantilla JSON común y la información por servicio. Las URL no admitidas y el contenido dinámico usan texto pegado o archivos. Ante 401, 403 o 429 se detiene el proceso, sin eludir restricciones con otro navegador o API.

[OWASP: Restringir destinos y redirecciones para prevenir SSRF](https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html)

## Revisar la imagen o el audio obtenido antes de seleccionarlo

Además de imágenes de perfil GIF, las tarjetas de enlaces y publicaciones públicas conocidas aportan imágenes y títulos de obras. Se admiten de forma limitada enlaces autorizados de GitHub a imágenes, WAV y MP3 en los enlaces del titular, y archivos públicos individuales de Dropbox. Se admiten tarjetas del HTML inicial de POTOFU; quedan fuera descripciones, páginas adicionales, reproductores incrustados y la galería de foriio.

Se revisan origen y candidato, host, path, redirecciones, MIME, contenido, tamaño y plazos. El titular ve o escucha los mismos datos obtenidos y confirma derechos, título y descripción. Solo los adjuntos seleccionados se incorporan a obras sin guardar; se preparan con la carga existente y se guardan normalmente. Se revalidan titular, perfil, tipo y estado ready, conservando la entrada manual y el snapshot público.

<figure class="article-diagram" data-layout="flow" data-tone="violet" data-count="4" aria-labelledby="diagram-profile-import-draft-boundaries">
  <figcaption>
    <strong id="diagram-profile-import-draft-boundaries">Límites de obtención, selección, guardado y publicación</strong>
    <span>Una relectura fallida conserva candidatos previos. Importar no cambia el snapshot público.</span>
  </figcaption>
  <ol class="article-diagram__nodes">
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">1</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M5 3h10l4 4v14H5z"/><path d="M15 3v5h5M8 12h8M8 16h6"/></svg></span>
      <strong>Leer entradas limitadas</strong>
      <span>Validar URL, formatos y límites.</span>
    </li>
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">2</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5M8 10l2 2 3-4"/></svg></span>
      <strong>Comparar y seleccionar</strong>
      <span>Revisar medios y conservar ediciones.</span>
    </li>
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">3</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/></svg></span>
      <strong>Guardar borrador</strong>
      <span>Guardar campos elegidos y adjuntos preparados.</span>
    </li>
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">4</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M6 4v6a3 3 0 0 0 3 3h6a3 3 0 0 1 3 3v4"/><path d="M18 4v3a3 3 0 0 1-3 3H9a3 3 0 0 0-3 3v7"/></svg></span>
      <strong>El titular publica</strong>
      <span>Actualizar el snapshot en otra acción.</span>
    </li>
  </ol>
</figure>

## No deduzcas cualificaciones ni derechos a partir del texto importado

Las palabras de una biografía o de una página externa no acreditan por sí mismas una titulación, afiliación, categoría o licencia. Separa los textos descriptivos que pueden importarse como candidatos de la información que exige verificar la identidad o presentar una solicitud. Si cambia la información externa, no se actualiza ni publica automáticamente el perfil confirmado por su propietario.

## Mantén el guardado y la publicación como decisiones distintas

Aplicar candidatos importados, guardar el borrador y actualizar la versión pública son acciones diferentes. La aceptación también debe cubrir conflictos al guardar; guardar correctamente no significa que el perfil se haya publicado. Antes de hacer públicos los enlaces relacionados, incluidas las URL del calendario público, la persona propietaria debe revisar los valores, y las notas privadas deben quedar fuera de los datos públicos.

## Actualización relacionada: abrir enlaces HTTPS desde eventos del calendario público

Una mejora del editor independiente de la importación añade enlaces HTTPS a los eventos del calendario público. El evento abre su destino directamente en una pestaña nueva; los eventos sin URL se muestran sin un enlace accionable. Valida el formato de la URL, rechaza credenciales incrustadas y limita la longitud de entrada. Añade **noopener noreferrer** e indica en el nombre accesible que se abrirá una pestaña nueva.

Los formularios relacionados también eliminan el campo de título innecesario en las franjas de disponibilidad para colaborar y los campos de notas privadas. Se comprobaron los cambios de base de datos, CI, el despliegue en producción y las pantallas con datos de verificación. Sigue sin verificarse que una persona propietaria inicie sesión, guarde un evento real y lo publique.

## Qué se verificó y qué aceptación queda pendiente

Se verificaron implementación, CI y despliegue de URL limitadas, GIF, imágenes y audio, así como edición y deshacer con datos sintéticos y algunos archivos públicos. El perfil de origen de POTOFU sigue devolviendo 429: descargar su CDN no demuestra obtener el perfil. Falta la aceptación con un titular real desde derechos hasta guardado y publicación. Comprobado el 14 de octubre de 2026.

Para conocer los límites del CSS publicado, consulta [CSS de usuario seguro y temas públicos versionados](/insights/user-css-versioned-theme-safety/). Para los límites del inicio de sesión, consulta [Ciclo de vida de sesiones entre servicios](/insights/multi-service-session-lifecycle/).
