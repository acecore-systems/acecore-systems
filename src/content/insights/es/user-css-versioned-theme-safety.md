---
title: "CSS de usuario y temas públicos seguros: fuente compartida, ámbito de renderizado y versiones fijas"
description: "Un diseño anonimizado de edición de perfiles donde la interfaz gráfica y la edición directa comparten una única fuente de CSS. Trata la sintaxis CSS amplia dentro de un límite de renderizado, los borradores y versiones publicadas, las versiones inmutables de temas, su retirada y la suspensión operativa."
date: "2026-10-06T01:10:00+09:00"
lastUpdated: "2026-10-06T02:20:00+09:00"
author: gui
image: /images/insights/user-css-versioned-theme-safety-20261006-v2.webp
tags: ["CSS", "Security", "Web"]
callout:
  type: note
  title: "Comprobar la implementación no equivale a una aceptación integral de usuarios"
  text: "Se confirmaron el cambio de base de datos, el despliegue en producción y la visualización de datos de prueba del almacén de temas con versiones fijas. La ampliación para compartir la fuente de CSS con la interfaz gráfica se confirmó integrada en main y con CI aprobada; dentro del alcance de esta auditoría no se confirmó su despliegue en producción ni la aceptación con sesión iniciada. No se han demostrado el envío y la aplicación de temas de principio a fin por usuarios reales ni las ventas de pago."
---

Un editor de perfiles que permite ajustar colores y espaciados en una interfaz gráfica y editar el diseño completo con CSS debe atender tanto a la facilidad de uso como a la seguridad del código mostrado en páginas públicas. Este caso anonimizado explica los límites entre edición y distribución.

## Compartir una única fuente de CSS entre la interfaz gráfica y la edición directa

En una ampliación posterior, el CSS completo pasó a ser la fuente de verdad del tema y la interfaz gráfica se modificó para editar las mismas declaraciones de CSS. Se conservan los comentarios escritos a mano, las declaraciones que la interfaz no administra y las reglas adaptables a distintos tamaños de pantalla. El formato anterior, con ajustes de la interfaz y CSS adicional, también se migra a una hoja de estilos completa que se puede editar. Cambiar solo ajustes auxiliares que muestran una lista de opciones no significa que haya cambiado el CSS que se renderiza.

Las ampliaciones del backend y el frontend se integraron cada una en su rama main; se comprobaron CI y las pruebas de implementación. Dentro del alcance de esta auditoría, esto no demuestra el despliegue en producción ni un flujo completo probado por un usuario con sesión iniciada.

## Admitir sintaxis CSS amplia dentro del límite de renderizado

Se ampliaron los límites iniciales basados en una pequeña lista de propiedades permitidas para admitir Grid, Flex, variables, degradados, pseudoelementos, transformaciones, animaciones y reglas como @media, @supports y @container. Esto no significa insertar CSS arbitrario sin inspeccionarlo. Se analiza el árbol sintáctico y cada rama de selector queda limitada a descendientes de la región de perfil designada. Se aplica el mismo límite dentro de las reglas condicionales; los controles externos de operación y los distintivos de licencia quedan fuera del ámbito del tema. [W3C Selectors](https://www.w3.org/TR/selectors-4/) es un punto de partida para consultar la especificación de selectores.

Los nombres de variables y keyframes se reescriben con nombres únicos en el CSS publicado para evitar interferencias con variables de la interfaz exterior o animaciones de otros temas. Los nombres originales se conservan para la edición. El wrapper exterior de renderizado también usa containment e isolation para limitar los efectos de reglas de diseño amplias a la región de perfil.

Se rechazan la obtención de recursos externos, reglas globales como @import y @font-face, sintaxis que no se pueda analizar, CSS nesting, el terminador de style de HTML y referencias a animaciones cuyos nombres no se puedan resolver de forma segura. También se comprueba el tamaño de la entrada y del resultado generado. Al publicar y al cargar un snapshot, se vuelve a comprobar la coherencia entre el ámbito, los nombres únicos y la cadena CSS canonical validada. Admitir una sintaxis amplia no garantiza que todos los navegadores la rendericen igual.

## Separar la vista previa, el borrador y la publicación

Probar o aplicar un tema modifica un borrador. La página pública no cambia hasta que la persona propietaria lo publica. Poder volver a editar el CSS escrito a mano tampoco significa entregar ese texto original a los visitantes. El contrato de guardado detecta conflictos y evita que un reintento duplique una versión o una actualización del borrador.

## Evitar que la actualización de otro autor cambie un diseño activo

La información editable de la ficha del tema se separa de sus versiones inmutables. El usuario importa una versión concreta por su ID; cuando el autor publica una versión nueva, los borradores y las versiones publicadas existentes no cambian automáticamente. Después de editar se conservan el origen y la versión aplicados, así como la fuente de las condiciones de uso. Si un perfil público vuelve a ser privado, el nombre y la imagen del borrador del autor no deben filtrarse al tema distribuido.

## Distinguir la retirada de una suspensión operativa

Cuando un autor retira un tema, deja de aparecer para nuevos descubrimientos y aplicaciones, pero eso no revoca necesariamente de inmediato los usos existentes de una versión fijada. La suspensión operativa de un tema peligroso tiene otro límite: detener su obtención pública y el CSS de snapshots existentes, y volver a la apariencia estándar. Incluso al restaurar un snapshot anterior se comprueba el estado actual de suspensión, para no reactivar CSS anterior a la suspensión.

## Qué comprobar antes de publicar

Comprueba los selectores fuera del ámbito, las solicitudes externas, el tamaño de entrada, los conflictos de guardado, los reintentos, que el perfil del autor pase a ser privado, la retirada, la suspensión operativa y la reversión. Se confirmaron el despliegue en producción del almacén de versiones fijas y la visualización con datos de prueba, pero dentro del alcance de esta auditoría no se confirmaron el despliegue en producción ni la aceptación con sesión iniciada de la ampliación del editor CSS. En una comprobación anterior había cero temas públicos; esa cifra no representa el número actual. No se han demostrado las pruebas integrales con usuarios reales que envían y aplican temas ni las ventas de pago. Las condiciones de uso tampoco pueden garantizar que nadie copie el CSS que llega a un navegador.

Para la entrada de edición, consulta [la importación de perfiles como borrador](/insights/profile-import-draft-boundaries/); para las operaciones del CMS, consulta [la guía de Sveltia CMS](/insights/cms-selection-and-turnstile/).
