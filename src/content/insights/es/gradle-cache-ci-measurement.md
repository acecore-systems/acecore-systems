---
title: "Reducir por separado las ejecuciones duplicadas de GitHub Actions y el tiempo de compilación de Gradle"
description: "Revisamos las condiciones que activan ejecuciones duplicadas de CI en push y PR, y comparamos la caché de Gradle para Android en el mismo commit. Analizamos los criterios de decisión y los límites de las mediciones."
date: "2026-11-17T12:00:00+09:00"
author: gui
image: /images/insights/covers/astro-performance-tuning-cover-v2.webp
tags: ["GitHub Actions", "Android", "Operaciones"]
---

Si la CI de Android repite el mismo procesamiento en cada ejecución, una comparación que incluya el tiempo de restauración de la caché puede ayudar a decidir si conviene implementarla. Con una prueba realizada sobre el mismo commit en el job de Android de DaysChat, mostramos cómo comprobamos la velocidad y la reproducibilidad.

<figure class="article-diagram" data-layout="flow" data-tone="blue" data-count="3" aria-labelledby="diagram-gradle">
  <figcaption><strong id="diagram-gradle">Comparar la caché con la misma entrada</strong><span>Examinamos el job completo, incluido el coste de guardar y restaurar la caché.</span></figcaption>
  <ol class="article-diagram__nodes">
    <li><strong>Primera ejecución</strong><span>Crear la caché y registrar el tiempo de guardado.</span></li>
    <li><strong>Nueva ejecución del mismo commit</strong><span>Comprobar el tiempo de restauración y las tareas reutilizadas.</span></li>
    <li><strong>Validar los artefactos</strong><span>Comprobar las arquitecturas objetivo y la generación del APK.</span></li>
  </ol>
</figure>

## No duplicar la misma validación en push y PR

En otro sistema de actas de reuniones, tanto el push a una rama de trabajo como el PR activaban la CI habitual y la verificación de paridad de Rust. Limitamos la activación por push a main, mantuvimos la validación del PR y habilitamos la ejecución manual para quienes quisieran comprobar los cambios antes de crear el PR. No modificamos las condiciones de activación de los lanzamientos a producción.

En una investigación interna, identificamos 97 ejecuciones activadas por push en el mes 11, cuyos PR correspondientes también habían terminado correctamente, con un total de 342 minutos de ejecución en runners de Linux. Este es el tiempo de ejecución objeto de la investigación sobre duplicados, no el tiempo ni el importe facturado que se ahorró realmente tras el cambio. Antes de delimitar el alcance, compruebe cómo se validarán los cambios sin PR y si se bloquearán las comprobaciones obligatorias o los lanzamientos. Puede consultar las condiciones de push y pull_request en los [eventos de GitHub Actions](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows).

## Resultados medidos y condiciones del job

En la comparación del mismo commit registrada en el historial interno de cambios, el job de Android tardó 16 minutos y 20 segundos en la primera ejecución, y 6 minutos y 16 segundos en la nueva ejecución, incluida la restauración. Se reutilizaron 194 tareas de Gradle, y también se completaron las comprobaciones de x86_64 y arm64-v8a y la generación del APK. El guardado inicial tardó 34 segundos, la restauración en la nueva ejecución tardó 62 segundos y la caché de prueba ocupó aproximadamente 1.81 GB.

| Métrica observada  | Primera ejecución        | Nueva ejecución           |
| ------------------ | ------------------------ | ------------------------- |
| Job de Android     | 16 minutos y 20 segundos | 6 minutos y 16 segundos   |
| Operación de caché | Guardado: 34 segundos    | Restauración: 62 segundos |

Este par de 1 mediciones es un ejemplo obtenido con una caché exclusiva para PR. En la configuración final, solo main guarda la caché compartida y los PR la restauran en modo de solo lectura. No hemos medido si todos los PR de la configuración final obtienen la misma reducción ni si disminuye el importe facturado. Los resultados también varían según el entorno de ejecución y la tasa de aciertos de la caché.

## Definir las condiciones de reutilización y un guardado seguro

La [caché de compilación de Gradle](https://docs.gradle.org/current/userguide/build_cache.html) utiliza las entradas y salidas de las tareas para decidir si puede reutilizarlas. Si las entradas de una tarea no se declaran correctamente, podrían usarse salidas antiguas; por ello, primero compare una ejecución limpia, sus artefactos y los resultados de las pruebas. Compruebe también que la caché se invalida según lo previsto cuando cambian las dependencias o la configuración de compilación.

Limite qué procesos pueden guardar la caché y configure el sistema para que los cambios no confiables no actualicen la caché compartida. La [caché de dependencias de GitHub Actions](https://docs.github.com/en/actions/concepts/workflows-and-actions/dependency-caching) tiene restricciones de acceso y consideraciones de uso. No utilice la caché para almacenar información secreta y observe conjuntamente su tamaño, los tiempos de guardado y restauración, y la duración total del job.

Empiece limitando el alcance a 1 job y registre los artefactos y los tiempos de la primera ejecución y de una nueva ejecución del mismo commit. Aunque observe una reducción, compruebe por separado que la compilación funciona correctamente con otros cambios y cuando falta la caché. Fecha de comprobación: 17/11/2026.
