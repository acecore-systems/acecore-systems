---
title: "Cómo investigar el lag de Minecraft: métricas silenciosas y almacenamiento compartido"
description: "Desde la recopilación silenciosa de TPS/MSPT hasta la correlación de JFR con observaciones de E/S del sistema operativo. Separa la investigación de causas ya completada de las mejoras de rendimiento aún no probadas."
date: "2026-10-06T01:10:00+09:00"
lastUpdated: "2026-10-06T01:10:00+09:00"
author: gui
image: "/images/insights/minecraft-latency-investigation.webp"
tags: ["Minecraft", "Monitoring", "Performance"]
callout:
  type: note
  title: "Separar la investigación de causas de los resultados de mejora"
  text: "La monitorización continua y la investigación de las esperas al guardar están completas. No se ha migrado a otro almacenamiento ni comparado el rendimiento; la investigación no demuestra un fallo de componentes ni que haya desaparecido el lag para todos los jugadores."
---

El lag de Minecraft puede deberse a causas distintas: procesamiento de ticks del servidor, pausas breves al guardar, red o renderizado del cliente. Presentamos de forma anónima una investigación en varios servidores Paper, sin revelar nombres de host ni configuración internos.

## Medir por separado los promedios y las pausas breves

Registra TPS, MSPT medio, máximo y p95, y el total acumulado de ticks lentos. Un promedio bueno puede ocultar pausas breves. El uso de CPU de todo el host no permite distinguir el trabajo de un único hilo de una espera de E/S.

## Recopilar sin ruido y registrar los datos ausentes

En este caso, un pequeño plugin escribió en JSON local mediciones obtenidas mediante la API pública de Paper, y un recolector las agregó en series temporales de monitorización. La E/S de archivos se ejecutó fuera del hilo principal del juego; sustituir un archivo temporal evitó que los lectores vieran una actualización incompleta. No se ocultaron los mensajes habituales de la consola.

Comprueba también las marcas de tiempo y si la recopilación tuvo éxito. No trates como saludable un valor antiguo de un recolector detenido ni sustituyas datos ausentes por cero TPS.

## Correlacionar ventanas acotadas de JVM, SO y guardado

Mientras el problema se reproducía, se recopilaron JFR, observaciones de espera del SO y E/S de bloques en ventanas separadas y limitadas. Se compararon con la serie continua de MSPT y la presión periódica de E/S para distinguir la actividad del GC de las esperas durante los guardados síncronos. Las capturas no se realizaron todas al mismo tiempo. Para empezar con Paper, consulta la [guía oficial de perfilado con spark](https://docs.papermc.io/paper/profiling/). En este caso se añadieron JFR y observaciones del SO para investigar las esperas al guardar.

En una ventana normal de 240 segundos y otra con atascos de 220 segundos, las medianas por segundo de write-await fueron de 1.60 ms y 43.71 ms; los máximos fueron de 6.00 ms y 123.57 ms. Son dos ventanas de observación, no resultados antes y después ni un benchmark general.

Además de las esperas en los guardados síncronos y el journal del sistema de archivos, también se vieron retrasos en solicitudes al dispositivo de varias aplicaciones; así se acotó el candidato a la ruta de almacenamiento compartido. Un evento de finalización de un [tracepoint de bloques de Linux](https://www.kernel.org/doc/html/latest/core-api/tracepoint.html) puede representar solo parte de una solicitud; por eso no se mezclaron solicitudes sin correspondencia en una estadística de toda la E/S. Se limitaron el tiempo y el volumen de captura y se tuvo en cuenta la sobrecarga de la medición.

## Tratar el siguiente paso como una prueba aparte

Tras la investigación se detuvo el trazado acotado y se confirmó que la recopilación continua funcionaba. Aún no se ha comparado el rendimiento durante varios ciclos de uso similar tras migrar el almacenamiento. Este registro prepara el siguiente paso con planes de copia de seguridad, restauración y reversión; no reduce la durabilidad de los guardados ni culpa al GC o a un plugin sin pruebas.

Para distinguir señales de monitorización de un diagnóstico, consulta [Monitorización e investigación de incidentes con OpenClaw](/insights/openclaw-monitoring-investigation/). Para probar la recuperación, consulta [Monitorización de copias con R2 y restic](/insights/restic-r2-backup-verification/).
