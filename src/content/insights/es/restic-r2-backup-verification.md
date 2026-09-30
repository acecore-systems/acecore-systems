---
title: "Copias con restic en R2: de guardar datos a verificar su restauración"
description: "Supervise por separado la actualidad de las instantáneas, la integridad y la restauración, indicando qué recuperación de aplicaciones falta probar."
date: "2026-09-30T20:53:00+09:00"
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
