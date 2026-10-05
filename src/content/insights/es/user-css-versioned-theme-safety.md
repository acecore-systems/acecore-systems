---
title: "Cómo gestionar de forma segura el CSS de usuarios y los temas públicos"
description: "Una visión general de la edición de perfiles con controles gráficos y CSS escrito a mano. Explica los límites del CSS permitido, los borradores y las versiones publicadas, las versiones inmutables y la retirada o suspensión de temas."
date: "2026-10-06T01:10:00+09:00"
author: gui
image: /images/insights/user-css-versioned-theme-safety.webp
tags: ["CSS", "Security", "Web"]
callout:
  type: note
  title: "La comprobación de la implementación no equivale a la aceptación integral de usuarios"
  text: "Este caso anonimizado incluye la implementación, un cambio de base de datos, la entrega en producción y la representación de datos de prueba. En el momento de la revisión no había temas públicos. No se demostró el flujo completo de publicación y aplicación por usuarios reales ni la venta de pago."
---

Un editor de perfiles que permite ajustar colores y espaciados mediante una interfaz gráfica, con la opción de escribir una sintaxis CSS limitada, debe atender tanto la facilidad de uso como la seguridad del código que se muestra en páginas públicas. Este caso anonimizado ayuda a separar la edición de la distribución.

## Limitar el CSS mediante una gramática reducida

No insertes CSS arbitrario directamente en una página pública. Analízalo y permite solo los componentes, las propiedades y los valores admitidos. La implementación actual acepta deliberadamente una gramática pequeña; la edición de CSS más amplia sigue siendo una solicitud adicional sin terminar. Este caso limita las reglas a clases seleccionadas y a un conjunto reducido de pseudoclases, y rechaza URL externas, reglas at, selectores de atributos sin restricciones, delimitadores HTML y un número excesivo de reglas.

Limita el CSS aceptado a un área de perfil definida, vuelve a generarlo y valídalo otra vez antes de publicarlo. Conserva la configuración gráfica y el texto escrito a mano para poder editarlos, pero fija en la instantánea pública solo el CSS validado. El mero hecho de limitar el ámbito no hace seguro cualquier CSS. Consulta la [especificación W3C Selectors](https://www.w3.org/TR/selectors-4/) para conocer los conceptos de selectores.

## Separar la vista previa, el borrador y la publicación

Probar o aplicar un tema modifica un borrador. La página pública solo cambia cuando su titular la publica. Poder volver a editar el CSS escrito a mano tampoco significa que se envíe ese original a los visitantes. Detecta conflictos al guardar y haz que los reintentos sean idempotentes para que reenviar una operación no actualice dos veces una versión o un borrador.

## Evitar que la actualización de otra persona cambie un diseño activo

Separa la información modificable del catálogo de temas de sus versiones inmutables. El usuario importa un ID de versión concreto, por lo que una versión nueva del autor no cambia silenciosamente un borrador o diseño publicado. Conserva el origen, la versión y la atribución de la licencia después de editar. Si un perfil público pasa a ser privado, evita que el nombre o la imagen del borrador del autor se filtre al tema distribuido.

## Distinguir la retirada de una suspensión operativa

Cuando el autor retira un tema, puede impedir nuevos descubrimientos y aplicaciones sin revocar necesariamente una versión ya fijada. La suspensión operativa de un tema peligroso requiere otro límite: dejar de servir su CSS, incluso el que aparece en instantáneas existentes, y volver a la apariencia estándar. Después de restaurar una instantánea anterior, comprueba el estado de suspensión actual para impedir que reaparezca el CSS anterior a la suspensión.

## Qué comprobar antes de publicar

Prueba los selectores fuera de alcance, las solicitudes externas, el tamaño de entrada, los conflictos al guardar, los reintentos, los cambios de privacidad del autor, la retirada, la suspensión operativa y la restauración. Se comprobaron el código, la entrega y la visualización de datos de prueba, pero eso no constituye una prueba integral en la que un usuario real envíe un tema y otra persona lo aplique. Las condiciones de licencia tampoco pueden garantizar que nadie copie el CSS enviado al navegador.

Para la entrada de edición, consulta [Límites de los borradores al importar perfiles](/es/insights/profile-import-draft-boundaries/); para la operación del CMS, consulta la [guía de Sveltia CMS](/es/insights/cms-selection-and-turnstile/).
