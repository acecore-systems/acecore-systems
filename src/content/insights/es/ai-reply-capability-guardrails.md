---
title: "Evitar que una respuesta de IA prometa algo que no puede cumplir"
description: "Cómo impedir que un asistente informativo prometa por su cuenta la participación, la disponibilidad o el seguimiento de una persona del equipo. Trata el estado de la conversación, los fallos de recuperación y la revisión de borradores antiguos."
date: "2026-10-06T01:10:00+09:00"
author: gui
image: /images/insights/ai-reply-capability-guardrails.webp
tags: ["AI", "Security", "Web"]
callout:
  type: note
  title: "Caso generalizado; no se publica ninguna conversación concreta"
  text: "El caso abarca cambios de políticas y clasificación, controles previos al envío, pruebas, entrega y una observación operativa limitada. No incluye publicaciones ni cuentas de otras personas y no demuestra que se puedan evitar todas las formulaciones de promesas incorrectas."
---

Aunque una respuesta informativa suene natural, no debe prometer que una persona del equipo hará un seguimiento o asistirá en determinado momento sin pruebas de que esa acción se puede realizar. Este relato generalizado de un flujo interno de respuestas no identifica ninguna plataforma ni conversación.

## Definir qué puede explicar el asistente y qué puede hacer

Explicar información pública, confirmar lo que desea alguien y ponerse en contacto o asistir de verdad son capacidades distintas. Indica el papel del asistente en sus instrucciones y aplícalo a las respuestas iniciales, las posteriores y las comprobaciones previas al envío. Aumentar la intensidad del razonamiento no concede autoridad para actuar ni proporciona la agenda de una persona del equipo.

## Usar el estado de la conversación, no solo palabras clave

Transmite la publicación original, el intercambio reciente que se haya confirmado, si ya se ofreció orientación, si queda una pregunta por responder y si la conversación terminó. No clasifiques a alguien como interesado en asistir solo porque coincida una palabra cuando ha expresado otra preferencia. Una promesa incorrecta escrita por una IA anterior tampoco demuestra que alguien vaya a cumplirla.

## Comprobar quién habla y qué significa antes de enviar

«Una persona del equipo se pondrá en contacto más tarde» es una promesa de quien tendría que actuar. Una cita de la otra persona y una indicación general sobre un evento tienen significados distintos. En vez de prohibir una cadena de texto en todas partes, comprueba el papel, el estado de la conversación y las pruebas de la acción. Retén las respuestas ambiguas y pásalas a una persona cuando sea necesario. También hace falta impedir que se genere una respuesta como si se hubieran consultado las fuentes cuando la recuperación falla o devuelve una respuesta no válida. Esa condición de parada del lado de la recuperación solo se confirmó en el código revisado y en la revisión del PR; no se ha confirmado su funcionamiento en producción.

## No confundir expresiones similares ni tipos de solicitud

Distingue una publicación que busca participantes de una persona que expresa su deseo de asistir. Una redacción parecida no hace equivalentes los productos, las ediciones ni las condiciones de uso; no mezcles las indicaciones de distintos entornos. Comprueba también, antes de enviar, los agradecimientos sin fundamento y las respuestas que dan por aceptada a una persona. Aunque se prioricen las respuestas, usa esperas limitadas cuando haya límites de solicitudes y evita duplicados. No registres una espera o una respuesta omitida como un envío correcto.

## Volver a comprobar los borradores antiguos con las condiciones actuales

Un borrador que pasó las comprobaciones al generarse puede quedar obsoleto si cambia la conversación o la política. Compruébalo de nuevo con el estado más reciente justo antes del envío y no envíes borradores de conversaciones cerradas. Registra por separado la omisión del envío y el cierre de la conversación, sin confundirlos con un envío correcto. También se puede omitir una respuesta cuando una pregunta innecesaria solo alargaría el intercambio.

## Qué se comprobó y qué sigue sin demostrarse

Se revisaron la clasificación y los controles previos al envío, se ejecutaron pruebas de regresión, se revisaron borradores generados y se hizo una observación operativa limitada después de la entrega. Esto no demuestra la seguridad ante todas las conversaciones, paráfrasis o cambios de modelo. El envío externo también requiere autorización y aprobación operativas, además de controles de contenido. La condición de parada de recuperación descrita antes solo se revisó en el código y en un PR; su funcionamiento en producción sigue sin verificarse.

Para los límites de entrada de búsqueda, consulta [Sincronizar HTML público con Vectorize de forma segura](/es/insights/cloudflare-vectorize-safe-implementation/); para la representación, consulta [Representar de forma segura enlaces Markdown en respuestas de chat con IA](/es/insights/ai-chat-markdown-link-safety/).
