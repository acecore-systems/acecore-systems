---
title: "Delegación de tareas en Codex: traspasos, permisos y revisión de resultados"
description: "Codex Task Routing 0.14.0: decisiones del padre, continuidad del responsable, traspasos limitados, autenticación local y condiciones y aceptación de la ruta Sol a Pro."
date: "2026-09-26T18:30:00+09:00"
author: gui
image: /images/insights/covers/codex-task-routing-design-cover-v1.webp
tags: ["Tecnología", "IA", "Desarrollo"]
callout:
  type: note
  title: "Alcance de la verificación"
  text: "Se revisaron código público, pruebas e instalación aislada. Un hijo Sol directo envió una petición real a Temporary Chat Pro, recuperó y aceptó su respuesta mediante un Browser plugin en Windows. No demuestra todos los hosts, backend, autenticación real ni mejoras medidas de calidad o consumo."
lastUpdated: "2026-10-15T00:00:00+09:00"
---

Prueba la delegación en Codex con investigaciones o revisiones verificables de forma independiente, aclarando la integración del agente principal. Incluye archivos, referencias, evidencias e incógnitas; aplica el mínimo privilegio de [OWASP: Excessive Agency](https://genai.owasp.org/llmrisk/llm062025-excessive-agency/) a las herramientas. Delegar no demuestra por sí solo mejoras de calidad o coste.

Al realizar varios trabajos con Codex, escoger un modelo es solo una parte de la decisión. También hay que decidir qué etapa puede entregarse por separado, qué contexto debe acompañarla y cómo comprobar su resultado. Acecore publicó [Codex Task Routing](https://github.com/acecore-systems/codex-task-routing) para explicitar esas decisiones.

![Cuatro etapas de verificación: versión de la política, criterios de entrega, pruebas de ejecución y resultados medidos](/images/insights/codex-task-routing-evidence.webp)

## El padre decide y el responsable continúa la unidad completa

La versión 0.14.0 conserva modelo y razonamiento del padre elegidos por el usuario. El padre decide objetivos, prioridades, responsable, cambios importantes y excepciones. El trabajo que exige revisar repetidamente código, logs y pruebas pasa a un responsable adecuado; las tareas cortas pueden quedarse con el actual.

Un Sol encargado de una corrección limitada continúa investigación, implementación, pruebas, PR autorizado, correcciones acordadas y revalidación. Fallos normales o instrucciones añadidas no reinician el traspaso. Se mantienen revision, diff, trabajo pendiente y condiciones de reanudación; cambios de diseño, permisos nuevos y dudas importantes vuelven al padre.

<figure class="article-diagram" data-layout="flow" data-tone="violet" data-count="3" aria-labelledby="diagram-codex-task-routing-design">
  <figcaption>
    <strong id="diagram-codex-task-routing-design">Mantener al responsable y devolver decisiones importantes</strong>
    <span>Permiso de política, autoridad del host y evidencia de ejecución se comprueban por separado.</span>
  </figcaption>
  <ol class="article-diagram__nodes">
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">1</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M5 3h10l4 4v14H5z"/><path d="M15 3v5h5M8 12h8M8 16h6"/></svg></span>
      <strong>Decisión del padre</strong>
      <span>Elegir objetivos, responsable, permisos y excepciones.</span>
    </li>
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">2</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5M8 10l2 2 3-4"/></svg></span>
      <strong>Responsable continuo</strong>
      <span>Investigar, corregir, probar y completar PR y revisión autorizados.</span>
    </li>
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">3</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/></svg></span>
      <strong>Aceptación del padre</strong>
      <span>Revisar evidencia y condiciones antes del siguiente paso permitido.</span>
    </li>
  </ol>
</figure>

## Incluir alcance, final y permisos en el traspaso

Transmitir archivos, fuentes, criterios, pruebas y condiciones de devolución de forma breve. No delegar solo para llegar a otra instancia del mismo modelo. La delegación paralela requiere trabajo independiente útil del delegador. Solo se permiten nietos estándar Astra a Sol/Luna y Sol a Luna; Luna y los nietos no delegan más.

Revisar por separado permisos para crear PR, integrar, desplegar y enviar mensajes. Comentarios de PR o solicitudes citadas de otra tarea no son nueva autorización humana. Prevalecen las restricciones superiores del host actual.

## La autenticación privada se gestiona localmente

Antes de seleccionar un modelo de nube para introducir, guardar o transferir credenciales, el padre consulta estado y traspasos locales registrados. Solo se pasa un preset registrado; credenciales, OAuth JSON, cookies y pantallas privadas quedan locales. Los hijos devuelven al padre los requisitos de autenticación.

Disponibilidad de herramientas, aprobación, implementación y autenticación completa son estados distintos. queued y espera de unlock no son éxito. Documentación pública y código sin secretos usan responsables normales. Los hooks no arrancan workers ni modelos.

## Un Sol directo puede asumir una petición Pro condicionada

Si Chat normal se habilita expresamente, solo root o un hijo Sol directo con rol y profundidad comprobados puede asumir la ruta Browser. Antes se verifican materiales aprobados, permiso de transporte, herramientas y entorno. Se comprueba Pro en la UI antes y después de enviar una sola petición real en Temporary Chat, separado de Work y las API de modelos.

El mismo responsable prepara, envía, recoge, acepta y realiza correcciones autorizadas, conservando tab, ID, input hash y estado enviado. Devolver la recogida al padre no reenvía. Declaraciones actor, SubagentStart y nombres configurados no prueban rol, autoridad o backend; sin permiso o capacidad clara no se envía.

## Separar pruebas, transporte real y mejoras

El [cambio 0.14.0](https://github.com/acecore-systems/codex-task-routing/pull/20) verificó 198 pruebas e instalación aislada. El [registro real](https://github.com/acecore-systems/codex-task-routing/pull/22) confirma un Sol directo enviando una vez, sin reenvío, mediante Browser plugin en Windows, recuperando la misma respuesta y aceptándola tras cotejar ID/hash. Es evidencia de ese entorno limitado.

Quedan sin demostrar identidad backend de Pro, todos los hosts, recorridos IAB, ejecución real de nuevos nietos, autenticación privada y mejoras de consumo o calidad. No tratar ausencias como cero; incluir preparación, espera, aceptación y retrabajo. Instalación en el [README público](https://github.com/acecore-systems/codex-task-routing#readme). Comprobado el 14 de octubre de 2026.
