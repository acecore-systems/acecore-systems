---
title: "Cómo diseñar la delegación en Codex: el plugin público Task Routing"
description: "Las decisiones de diseño de Codex Task Routing: conservar la configuración del agente principal, identificar la política vigente y verificar cada entrega."
date: "2026-09-26T18:30:00+09:00"
author: gui
image: /images/insights/codex-task-routing-design.webp
tags: ["Tecnología", "IA", "Desarrollo"]
callout:
  type: note
  title: "Alcance de la verificación"
  text: "Se revisaron el código público, los PR integrados, el CI en tres sistemas operativos y la instalación en un entorno aislado. No se afirma una mejora medida de calidad o consumo ni la ejecución de un modelo delegado en una cuenta real."
---

Al realizar varios trabajos con Codex, escoger un modelo es solo una parte de la decisión. También hay que decidir qué etapa puede entregarse por separado, qué contexto debe acompañarla y cómo comprobar su resultado. Acecore publicó [Codex Task Routing](https://github.com/acecore-systems/codex-task-routing) para explicitar esas decisiones.

![Cuatro etapas de verificación: versión de la política, criterios de entrega, pruebas de ejecución y resultados medidos](/images/insights/codex-task-routing-evidence.webp)

## El trabajo habitual permanece con el agente principal

El agente principal realiza la investigación, implementación y verificación habituales. Solo delega una etapa delimitada cuando aporta un valor concreto. El plugin conserva el modelo y la configuración de razonamiento elegidos por el usuario. Evita transferir trabajo solo para usar otra instancia del mismo modelo o paralelizar sin una tarea independiente para el agente principal.

Una entrega requiere más que «escribe un artículo»: debe indicar fuentes primarias, alcance, herramientas disponibles, criterios de aceptación y cuándo devolver una duda sin resolver. El agente principal revisa los cambios importantes y sus pruebas, no solo la conclusión.

## Política configurada y ejecución observada

Al iniciar una tarea, el plugin presenta la política efectiva y su hash. Las opciones personalizadas no cambian silenciosamente la configuración del agente principal. El hook no llama a modelos ni realiza solicitudes de red.

Un nombre de modelo en la configuración no demuestra que ese modelo se haya ejecutado. Conexión, ejecución y resultado se comprueban por separado; las mediciones no disponibles se registran como ausentes. La ruta hacia Chat normal es opcional y se detiene si no están claros la disponibilidad o el permiso.

## Qué establecen las pruebas

El [PR de actualización](https://github.com/acecore-systems/codex-task-routing/pull/13) documenta 134 pruebas unitarias, CI en Windows, Ubuntu y macOS, e instalación, hooks, reinstalación y eliminación en un entorno Codex aislado. Un [PR anterior](https://github.com/acecore-systems/codex-task-routing/pull/12) mejoró el diagnóstico en Windows y la comprobación del paquete.

Estas pruebas cubren el paquete y la configuración. No demuestran ejecución de modelos delegados en una cuenta real, mejoras cuantificadas de calidad o consumo, ni el funcionamiento de Chat normal en todos los equipos. Los requisitos y pasos de instalación están en el [README público](https://github.com/acecore-systems/codex-task-routing#readme).
