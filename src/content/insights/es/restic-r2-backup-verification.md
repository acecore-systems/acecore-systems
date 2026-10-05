---
title: "Copias con restic en R2: de guardar datos a verificar su restauración"
description: "Supervise por separado la actualidad de las instantáneas, la integridad y la restauración, indicando qué recuperación de aplicaciones falta probar."
date: "2026-09-30T20:53:00+09:00"
lastUpdated: "2026-10-06T01:10:00+09:00"
author: gui
image: /images/insights/restic-r2-backup-verification.webp
tags: ["Cloudflare R2", "restic", "Backup"]
callout:
  type: note
  title: "La recuperación completa exige otra verificación"
  text: "Se realizaron copias periódicas, supervisión, retención y extracción/comprobación de datos seleccionados. No se demostró el arranque de todas las aplicaciones ni la recuperación ante desastres con credenciales guardadas por separado."
---

Un trabajo terminado no demuestra que los datos necesarios puedan recuperarse. Este caso interno generalizado evalúa almacenamiento, integridad, restauración y recuperación del servicio por separado. No documenta una migración completada desde otro servicio.

## Definir origen y éxito

El diseño usa cifrado y deduplicación de restic con la API compatible con S3 de R2. Revise las operaciones necesarias en la [tabla de compatibilidad](https://developers.cloudflare.com/r2/api/s3/api/). Para bases de datos activas, diseñe una captura consistente mediante volcados o pausa de la aplicación cuando corresponda.

## Supervisar la actualidad

Siga por separado la última instantánea correcta, retrasos, fallos y resultados de integridad/restauración. Iniciar un trabajo no es éxito; un aviso fallido tampoco es lo mismo que una copia fallida.

## Comprobar integridad y extracción

`restic check` por defecto y las verificaciones que leen datos tienen alcances distintos. `--read-data` lee todos los datos; documente el alcance de pruebas parciales. Combine [comprobaciones del repositorio](https://restic.readthedocs.io/en/stable/045_working_with_repos.html), [restauración](https://restic.readthedocs.io/en/stable/050_restore.html) en un lugar aislado y comparación de contenidos o hashes. Extraer archivos no verifica el arranque de aplicaciones.

## Gestionar retención con restic

Seleccione instantáneas mediante su política y use `forget`, `prune` y `check`, revisando antes qué se conservará. Borrar objetos por antigüedad en R2 puede eliminar datos compartidos necesarios para instantáneas retenidas. Siga la [documentación de retención](https://restic.readthedocs.io/en/stable/060_forget.html); limpiar imágenes de distribución es otro caso.

## Comprobaciones pendientes

Se realizaron operación periódica, supervisión/avisos, retención y extracción/integridad de datos seleccionados. Faltan validar de extremo a extremo el arranque de todas las aplicaciones, configuración y dependencias, y acceso a credenciales independientes. Tiempo de recuperación y pérdida aceptable requieren medición. No se afirma recuperación completa ni ahorro demostrado.

## Actualización del 6 de octubre de 2026: bloqueos obsoletos y control de la concurrencia en las pruebas de restauración

En una mejora adicional, se comprueba la actividad de los procesos en el mismo host antes de ejecutar el desbloqueo normal de restic, que solo trata bloqueos obsoletos. No se usa la opción que elimina todos los bloqueos, incluidos los de operaciones activas. Para conflictos se emplean reintentos con un límite mediante <code>--retry-lock</code>; las pruebas de restauración y prune no reinician el proceso indefinidamente cuando fallan. Comprobar la actividad dentro de un host no demuestra que no exista una operación concurrente desde otro host.

Los datos se extraen con <code>restore --verify</code> a un directorio temporal aislado. Después de comprobar los archivos necesarios y su integridad, se registra la correspondencia entre la instantánea verificada y la configuración. Primero se confirma la restauración de los datos objetivo; después se revisa lo que debe conservarse antes de ejecutar prune. La vigencia de una copia se determina por una instantánea que realmente terminó con éxito, no por el inicio del proceso ni por sus reintentos.

La restauración comprobada de los datos objetivo sigue siendo distinta de la recuperación completa, que incluye iniciar todas las aplicaciones y recuperar sus credenciales. Para el tratamiento de las ventanas de mantenimiento y los fallos de recopilación, consulta también [Supervisión e investigación de incidentes](/insights/openclaw-monitoring-investigation/).
