---
title: "Evitar que una respuesta de IA prometa algo que no puede cumplir"
description: "Evitar promesas de acciones que la IA no puede ejecutar: contexto, asistencia medida, frescura y fallos, anuncios con personalidad, supresión de textos similares y controles de envío."
date: "2026-10-06T01:10:00+09:00"
lastUpdated: "2026-10-15T00:00:00+09:00"
author: gui
image: /images/insights/covers/ai-reply-capability-guardrails-cover-v1.webp
tags: ["AI", "Security", "Web"]
callout:
  type: note
  title: "Caso generalizado; no se publica ninguna conversación concreta"
  text: "El caso abarca cambios de políticas y clasificación, controles previos al envío, pruebas, entrega y una observación operativa limitada. No incluye publicaciones ni cuentas de otras personas y no demuestra que se puedan evitar todas las formulaciones de promesas incorrectas."
---

Para orientación o soporte, define como capacidades distintas explicar información pública, transferir a personal y realizar una reserva. [OWASP: Excessive Agency](https://genai.owasp.org/llmrisk/llm062025-excessive-agency/) ayuda a diseñar acciones permitidas y aprobaciones. Lo que sigue se centra en los límites de las respuestas, sin procedimientos de envío automático por plataforma.

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

## Usar asistencia medida y hora de observación

Los anuncios distinguen participantes humanos de voz pública y jugadores simultáneos sumados de todos los servidores Minecraft supervisados. Basta con que un indicador alcance 15 personas; no se suman ambos. Todas las fuentes Minecraft deben tener menos de 30 segundos y voz, 120 segundos. Si solo hay un indicador disponible que cumple, describir solo ese.

Datos ausentes o caducados no son cero. Solo se prepara un nuevo auge cuando ambos se obtienen y están bajo el umbral. No se repite durante el mismo auge y deben pasar al menos 3 horas desde el intento de envío anterior. El sondeo solo de asistencia no llama a IA.

## Mantener la personalidad y omitir anuncios casi idénticos

Cada anuncio usa personalidad y tono compartidos y los últimos 20 anuncios, con una línea de asistencia separada. El modelo no escribe cifras ni horas: se insertan mediciones recuperadas tras generar. Si solo cambian cifras y el texto es similar, se regenera una vez y se omite si persiste. Fallos, revisión humana necesaria o cambio del indicador válido impiden publicar, sin plantilla fija de respaldo.

Aprobar el texto no basta. Revisar cuenta, sesión, restricciones, exclusión mutua y frescura justo antes del clic. Un resultado incierto no se reenvía automáticamente; éxito exige resultado público con autor, texto completo y hora coincidentes. Se completaron implementación, pruebas, configuración y revisión operativa limitada; falta demostrar un envío real exitoso tras cumplirse el umbral. Comprobado el 14 de octubre de 2026.

<figure class="article-diagram" data-layout="branches" data-tone="violet" data-count="3" aria-labelledby="diagram-ai-reply-capability-guardrails">
  <figcaption>
    <strong id="diagram-ai-reply-capability-guardrails">Comprobar evidencia, frescura y autorización</strong>
    <span>Un texto natural no autoriza publicar. Ausencia no es cero; revisar antes de enviar.</span>
  </figcaption>
  <ol class="article-diagram__nodes">
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">1</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M5 3h10l4 4v14H5z"/><path d="M15 3v5h5M8 12h8M8 16h6"/></svg></span>
      <strong>Leer contexto y mediciones</strong>
      <span>Revisar hablante, petición, asistencia y hora.</span>
    </li>
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">2</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5M8 10l2 2 3-4"/></svg></span>
      <strong>Generar y validar con evidencia</strong>
      <span>Cotejar capacidad, personalidad, similitud y condiciones.</span>
    </li>
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">3</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/></svg></span>
      <strong>Enviar autorizado o retener</strong>
      <span>Revisar sesión, frescura y exclusión; no reenviar lo incierto.</span>
    </li>
  </ol>
</figure>

## Qué se comprobó y qué sigue sin demostrarse

Se revisaron la clasificación y los controles previos al envío, se ejecutaron pruebas de regresión, se revisaron borradores generados y se hizo una observación operativa limitada después de la entrega. Esto no demuestra la seguridad ante todas las conversaciones, paráfrasis o cambios de modelo. El envío externo también requiere autorización y aprobación operativas, además de controles de contenido. La condición de parada de recuperación descrita antes solo se revisó en el código y en un PR; su funcionamiento en producción sigue sin verificarse.

Para los límites de entrada de búsqueda, consulta [Sincronizar HTML público con Vectorize de forma segura](/es/insights/cloudflare-vectorize-safe-implementation/); para la representación, consulta [Representar de forma segura enlaces Markdown en respuestas de chat con IA](/es/insights/ai-chat-markdown-link-safety/).
