---
title: "Importar datos de perfil como borrador: revisión, sustitución y límites de publicación"
description: "Una implementación generalizada para importar datos de perfil desde texto, CSV y HTML estático. Explica cómo comparar los valores actuales, seleccionar y sustituir campos, separar el guardado de la publicación y reconocer las entradas no admitidas."
date: "2026-10-06T01:10:00+09:00"
author: gui
image: /images/insights/profile-import-draft-boundaries.webp
tags: ["Web", "Import", "Security"]
callout:
  type: note
  title: "Alcance de la implementación de la etapa 1"
  text: "Se confirmaron la implementación, la integración y el despliegue en producción de la importación de texto, CSV y HTML estático. Sigue pendiente la aceptación integral en una cuenta real, desde la importación hasta el guardado y la publicación; la obtención directa por URL y la migración de imágenes o audio quedan fuera de esta entrega."
---

Al trasladar un perfil existente a otro editor, primero hay que comparar el valor actual con el candidato importado y decidir qué se reemplazará. Este caso generalizado de una implementación de etapa 1 explica los límites entre importar y publicar.

## Definir primero los formatos admitidos

Esta etapa admite texto, CSV y HTML estático. Analizar contenido pegado o un archivo no es lo mismo que visitar una URL para obtener su contenido. JSON, imágenes, audio, páginas dinámicas y API de servicios externos no forman parte de la implementación completada.

Trata el HTML como datos de entrada: no ejecutes sus scripts ni representes el propio HTML importado en la página pública. Establece límites para la longitud del texto, los campos, los enlaces y los formatos de entrada; después, convierte el origen en candidatos de texto útiles para el perfil.

## Separar la revisión de candidatos de la edición del perfil

No publiques de inmediato los resultados del análisis; compara primero los valores actuales con los candidatos. La persona propietaria selecciona los campos uno por uno y puede editar los valores candidatos antes de aplicarlos al editor. Cada campo seleccionado sustituye su valor actual, así que revisa las diferencias en cada importación. Se puede deshacer el cambio antes de guardar, pero eso no significa que esté completa una protección automática de las ediciones manuales o la combinación de conflictos.

## No deducir credenciales ni derechos del texto importado

Las expresiones de una biografía o una página externa no acreditan automáticamente una cualificación, afiliación, categoría o licencia. Separa el texto descriptivo que puede importarse como candidato de la información que requiere verificación de identidad o una solicitud. La información nueva en otros sitios no actualiza ni publica automáticamente el perfil confirmado por su propietario.

## Mantener el guardado y la publicación como decisiones distintas

Aplicar candidatos de importación, guardar el borrador y actualizar la instantánea pública son acciones separadas. Las pruebas de aceptación aún deben cubrir los conflictos de guardado; guardar correctamente no significa que el perfil esté publicado. Revisa los enlaces, incluidas las URL de calendarios públicos, antes de publicar sus valores y no mezcles notas privadas con los datos públicos.

## Actualización relacionada: abrir enlaces HTTPS desde eventos públicos

Una mejora de edición independiente de la importación permite añadir enlaces HTTPS a eventos del calendario público. El evento abre directamente su destino en otra pestaña; los eventos sin URL se muestran sin un enlace accionable. Valide el formato, la ausencia de credenciales incrustadas y la longitud de la URL. Añada `noopener noreferrer` e indique la apertura de otra pestaña en el nombre accesible.

Los formularios relacionados también eliminan un título innecesario en los intervalos disponibles para colaborar y los campos de notas privadas. Se comprobaron cambios de base de datos, CI, despliegue en producción y pantallas con datos de verificación; sigue pendiente que el propietario inicie sesión, guarde un evento real y lo publique.

## Qué se verificó y qué falta aceptar

Se confirmaron la implementación, la integración y el despliegue en producción del flujo de importación de la etapa 1. Sin embargo, no se ha completado una prueba integral con una persona usuaria real: importar, editar, guardar y comprobar la visualización publicada. Tampoco está completada la idea más amplia de crear automáticamente un perfil entero desde la URL de una plataforma de actividad.

Para consultar los límites del CSS publicado, lee [CSS de usuario seguro y temas públicos con versiones fijas](/insights/user-css-versioned-theme-safety/). Para los límites de inicio de sesión, consulta [Ciclos de sesión entre servicios](/insights/multi-service-session-lifecycle/).
