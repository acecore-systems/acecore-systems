---
title: "Copias con restic en R2: de guardar datos a verificar su restauración"
description: "Separar frescura, integridad y restauración con R2 y restic: selección PostgreSQL tras actualizar el OS, runtime aislado Samba, comprobaciones DB/LDAP y recuperación completa pendiente."
date: "2026-09-30T20:53:00+09:00"
lastUpdated: "2026-10-15T00:00:00+09:00"
author: gui
image: /images/insights/covers/restic-r2-backup-verification-cover-v1.webp
tags: ["Cloudflare R2", "restic", "Backup"]
callout:
  type: note
  title: "La recuperación completa exige otra verificación"
  text: "Se realizaron copias periódicas, supervisión, retención y extracción/comprobación de datos seleccionados. No se demostró el arranque de todas las aplicaciones ni la recuperación ante desastres con credenciales guardadas por separado."
---

Un trabajo terminado no demuestra que los datos necesarios puedan recuperarse. Este caso interno generalizado evalúa almacenamiento, integridad, restauración y recuperación del servicio por separado. No documenta una migración completada desde otro servicio.

## Fijar el ID del snapshot y un objetivo de recuperación

Registre el ID y restaure los archivos necesarios en un destino vacío y aislado. Revise referencias y permisos de configuración, o cargue la base de datos en aislamiento. Anote el tiempo. Repita las mismas comprobaciones periódicamente para comparar actualidad y alcance recuperable.

[restic：Restaurar en un destino aislado](https://restic.readthedocs.io/en/stable/050_restore.html)

## Definir origen y éxito

El diseño usa cifrado y deduplicación de restic con la API compatible con S3 de R2. Revise las operaciones necesarias en la [tabla de compatibilidad](https://developers.cloudflare.com/r2/api/s3/api/). Para bases de datos activas, diseñe una captura consistente mediante volcados o pausa de la aplicación cuando corresponda.

## Supervisar la actualidad

Siga por separado la última instantánea correcta, retrasos, fallos y resultados de integridad/restauración. Iniciar un trabajo no es éxito; un aviso fallido tampoco es lo mismo que una copia fallida.

## Comprobar integridad y extracción

`restic check` por defecto y las verificaciones que leen datos tienen alcances distintos. `--read-data` lee todos los datos; documente el alcance de pruebas parciales. Combine [comprobaciones del repositorio](https://restic.readthedocs.io/en/stable/045_working_with_repos.html), [restauración](https://restic.readthedocs.io/en/stable/050_restore.html) en un lugar aislado y comparación de contenidos o hashes. Extraer archivos no verifica el arranque de aplicaciones.

## Gestionar retención con restic

Seleccione instantáneas mediante su política y use `forget`, `prune` y `check`, revisando antes qué se conservará. Borrar objetos por antigüedad en R2 puede eliminar datos compartidos necesarios para instantáneas retenidas. Siga la [documentación de retención](https://restic.readthedocs.io/en/stable/060_forget.html); limpiar imágenes de distribución es otro caso.

## Comprobar el PostgreSQL de restauración tras actualizar el OS

Tras actualizar el OS, la prueba falló por una ruta fija de un major antiguo de PostgreSQL. El cambio elige el major instalado más nuevo en orden numérico con todas las herramientas de servidor ejecutables y usa la misma versión para inicializar, arrancar, restaurar, comprobar y parar. Si no existe un conjunto completo, falla sin conectarse a otra base activa y darlo por éxito.

Compruebe formato y compatibilidad del destino con la [documentación PostgreSQL de SQL dump y restauración](https://www.postgresql.org/docs/current/backup-dump.html). Seleccionar versión automáticamente no garantiza cualquier dump. El cambio tiene pruebas automáticas y CI; restaurar la base real de R2 sigue siendo otra aceptación.

## Recrear el runtime dentro del Samba aislado

Poder leer la base restaurada no bastaba: sin runtime para sockets internos, el DC aislado no arrancaba. Separe namespaces de red, PID y mount, compruebe aislamiento y cree solo dentro un tmpfs privado en `/run` y `/run/samba`. Use configuración y destinos aislados, sin mezclar procesos de prueba con runtime o puertos productivos.

Con [samba-tool oficial, domain backup restore y dbcheck](https://www.samba.org/samba/docs/current/man-html/samba-tool.8.html), se comprobaron base restaurada, arranque del DC y disponibilidad LDAP. Este recorrido Samba se verificó con una copia R2 real. Recuperar todas las aplicaciones, conexiones y credenciales guardadas por separado requiere otras pruebas. Comprobado el 14 de octubre de 2026.

<figure class="article-diagram" data-layout="layers" data-tone="amber" data-count="3" aria-labelledby="diagram-restic-r2-backup-verification">
  <figcaption>
    <strong id="diagram-restic-r2-backup-verification">De snapshot a restauración por servicio y recuperación completa</strong>
    <span>Samba DC, DB y LDAP se verificaron con R2 real; PostgreSQL real y recuperación global siguen separados.</span>
  </figcaption>
  <ol class="article-diagram__nodes">
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">1</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M5 3h10l4 4v14H5z"/><path d="M15 3v5h5M8 12h8M8 16h6"/></svg></span>
      <strong>Snapshot correcto y frescura</strong>
      <span>Registrar éxito real y alcance.</span>
    </li>
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">2</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5M8 10l2 2 3-4"/></svg></span>
      <strong>Recrear aislamiento</strong>
      <span>Verificar versión DB, red/PID/mount y runtime.</span>
    </li>
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">3</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/></svg></span>
      <strong>Probar arranque del servicio</strong>
      <span>Samba DB y LDAP verificados; falta recuperación de todas las apps.</span>
    </li>
  </ol>
</figure>

## Comprobaciones pendientes

Se realizaron operación periódica, supervisión/avisos, retención y extracción/integridad de datos seleccionados. Faltan validar de extremo a extremo el arranque de todas las aplicaciones, configuración y dependencias, y acceso a credenciales independientes. Tiempo de recuperación y pérdida aceptable requieren medición. No se afirma recuperación completa ni ahorro demostrado.

## Actualización del 6 de octubre de 2026: bloqueos obsoletos y control de la concurrencia en las pruebas de restauración

En una mejora adicional, se comprueba la actividad de los procesos en el mismo host antes de ejecutar el desbloqueo normal de restic, que solo trata bloqueos obsoletos. No se usa la opción que elimina todos los bloqueos, incluidos los de operaciones activas. Para conflictos se emplean reintentos con un límite mediante <code>--retry-lock</code>; las pruebas de restauración y prune no reinician el proceso indefinidamente cuando fallan. Comprobar la actividad dentro de un host no demuestra que no exista una operación concurrente desde otro host.

Los datos se extraen con <code>restore --verify</code> a un directorio temporal aislado. Después de comprobar los archivos necesarios y su integridad, se registra la correspondencia entre la instantánea verificada y la configuración. Primero se confirma la restauración de los datos objetivo; después se revisa lo que debe conservarse antes de ejecutar prune. La vigencia de una copia se determina por una instantánea que realmente terminó con éxito, no por el inicio del proceso ni por sus reintentos.

La restauración comprobada de los datos objetivo sigue siendo distinta de la recuperación completa, que incluye iniciar todas las aplicaciones y recuperar sus credenciales. Para el tratamiento de las ventanas de mantenimiento y los fallos de recopilación, consulta también [Supervisión e investigación de incidentes](/insights/openclaw-monitoring-investigation/).
