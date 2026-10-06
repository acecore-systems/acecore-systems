---
title: "Importar datos del perfil como borrador: comparar, elegir y publicar con criterio"
description: "Una implementación general para importar perfiles desde texto, CSV, HTML estático y JSON común. Explica cómo comparar valores actuales, elegir campos para sustituirlos o deshacer cambios, y separar el guardado de la publicación."
date: "2026-10-06T01:10:00+09:00"
lastUpdated: "2026-10-06T08:52:00+09:00"
author: gui
image: /images/insights/covers/profile-import-draft-boundaries-cover-v1.webp
tags: ["Web", "Import", "Security"]
callout:
  type: note
  title: "Implementación verificada; falta la aceptación en una cuenta real"
  text: "La importación de texto, CSV, HTML estático y JSON común está implementada, integrada y desplegada en producción. Sigue pendiente la aceptación completa desde la importación hasta el guardado y la publicación en una cuenta real. La obtención automática desde URL específicas de cada servicio y la migración de imágenes o audio quedan fuera del alcance completado."
---

Al trasladar un perfil existente a otro editor, compara los valores actuales con los candidatos importados antes de sustituir nada. Este caso anonimizado explica los límites entre importar datos y publicar un perfil.

## Define primero los formatos de entrada admitidos

Además de las opciones iniciales de texto, CSV y HTML estático, el flujo ahora lee un archivo JSON común y ofrece una plantilla descargable. Analizar contenido pegado o un archivo es distinto de visitar una URL para obtener sus datos. No se han completado los formatos de exportación propios de cada servicio, la obtención automática desde URL, la migración de imágenes o audio, las páginas dinámicas ni las API de servicios externos.

Trata el HTML solo como datos de entrada. No ejecutes scripts ni renderices el propio HTML importado en la página pública. Limita la longitud del texto, los campos, los enlaces y los formatos de entrada; después convierte el contenido de origen en candidatos de texto útiles para un perfil.

## Revisa los candidatos antes de sustituir valores existentes

No publiques de inmediato los resultados del análisis: compáralos primero con los valores actuales. La persona propietaria del perfil selecciona los campos uno por uno y puede editar los valores candidatos antes de aplicarlos al editor. Aplicar un campo seleccionado sustituye el valor actual, así que hay que revisar las diferencias en cada importación. También es posible deshacer el cambio. Estos controles no garantizan que se resuelvan automáticamente los conflictos con ediciones hechas en otra pantalla o por otra persona.

## Distingue el JSON común de la compatibilidad con cada servicio

La interfaz muestra el estado de compatibilidad de 7 servicios de actividad. Poder leer datos en el formato común no significa que se pueda obtener un perfil directamente desde la URL de cada servicio. Para las URL no admitidas, se indica que se importe pegando el contenido. Mostrar el estado de los 7 servicios no significa que se hayan implementado exportaciones específicas o integraciones API para todos ellos.

Con datos sintéticos se comprobaron la importación JSON, la comparación con valores existentes, la aplicación de campos seleccionados, la reversión y la vista móvil. La aceptación desde la importación hasta el guardado y la publicación en una cuenta real requiere una comprobación aparte.

## No deduzcas cualificaciones ni derechos a partir del texto importado

Las palabras de una biografía o de una página externa no acreditan por sí mismas una titulación, afiliación, categoría o licencia. Separa los textos descriptivos que pueden importarse como candidatos de la información que exige verificar la identidad o presentar una solicitud. Si cambia la información externa, no se actualiza ni publica automáticamente el perfil confirmado por su propietario.

## Mantén el guardado y la publicación como decisiones distintas

Aplicar candidatos importados, guardar el borrador y actualizar la versión pública son acciones diferentes. La aceptación también debe cubrir conflictos al guardar; guardar correctamente no significa que el perfil se haya publicado. Antes de hacer públicos los enlaces relacionados, incluidas las URL del calendario público, la persona propietaria debe revisar los valores, y las notas privadas deben quedar fuera de los datos públicos.

## Actualización relacionada: abrir enlaces HTTPS desde eventos del calendario público

Una mejora del editor independiente de la importación añade enlaces HTTPS a los eventos del calendario público. El evento abre su destino directamente en una pestaña nueva; los eventos sin URL se muestran sin un enlace accionable. Valida el formato de la URL, rechaza credenciales incrustadas y limita la longitud de entrada. Añade **noopener noreferrer** e indica en el nombre accesible que se abrirá una pestaña nueva.

Los formularios relacionados también eliminan el campo de título innecesario en las franjas de disponibilidad para colaborar y los campos de notas privadas. Se comprobaron los cambios de base de datos, CI, el despliegue en producción y las pantallas con datos de verificación. Sigue sin verificarse que una persona propietaria inicie sesión, guarde un evento real y lo publique.

<figure class="article-diagram" data-layout="boundary" data-tone="violet" data-count="2" aria-labelledby="diagram-profile-import-draft-boundaries">
  <figcaption>
    <strong id="diagram-profile-import-draft-boundaries">Límites de la importación y los enlaces del calendario</strong>
    <span>Son funciones de edición distintas. Sigue sin verificarse la aceptación del guardado y la publicación por una persona conectada.</span>
  </figcaption>
  <ol class="article-diagram__nodes">
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">1</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M6 3h8l4 4v14H6z"/><path d="M14 3v5h5M9 12h6M9 16h4"/></svg></span>
      <strong>Importar perfil</strong>
      <span>La persona revisa y edita los formatos admitidos. Guardar y publicar son acciones distintas.</span>
    </li>
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">2</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18M14 15h5m-2-2 2 2-2 2"/></svg></span>
      <strong>Enlace del calendario público</strong>
      <span>Abre enlaces HTTPS en una pestaña nueva segura. Los eventos sin enlace no son interactivos.</span>
    </li>
  </ol>
</figure>

## Qué se verificó y qué aceptación queda pendiente

Se confirmaron la implementación, integración y publicación en producción de la importación desde texto, CSV, HTML estático y JSON común. Sin embargo, no se ha completado una prueba integral con una persona real, desde la importación y edición hasta el guardado y la comprobación del resultado publicado. La idea más amplia de crear automáticamente un perfil completo a partir de una URL de un servicio de actividad tampoco está terminada.

Para conocer los límites del CSS publicado, consulta [CSS de usuario seguro y temas públicos versionados](/insights/user-css-versioned-theme-safety/). Para los límites del inicio de sesión, consulta [Ciclo de vida de sesiones entre servicios](/insights/multi-service-session-lifecycle/).
