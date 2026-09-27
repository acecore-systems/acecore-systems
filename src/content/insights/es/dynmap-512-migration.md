---
title: "Cómo verificamos la migración de Dynmap a 512px y retiramos imágenes antiguas de R2"
description: "Registro operativo de la migración de 89 mapas en ocho servidores a imágenes de 512px, con revisión pública y limpieza de datos antiguos en R2."
date: "2026-09-27T22:40:00+09:00"
author: gui
image: /images/insights/dynmap-512-migration.webp
tags: ["Tecnología", "Cloudflare"]
callout:
  type: note
  title: "Alcance de la verificación"
  text: "Una auditoría de producción del 11 de septiembre de 2026 confirmó la migración y la eliminación de imágenes antiguas. No hemos verificado la factura ni una tasa de ahorro en operación normal."
---

Cambiamos el formato de las imágenes de un Dynmap que distribuye mapas desde Cloudflare R2 y limpiamos los datos antiguos. El alcance fue de ocho servidores y 89 mapas. El orden era esencial: comprobar las imágenes nuevas en público antes de borrar las antiguas.

## Migración gradual con un área de renderizado limitada

Unificamos los mapas de producción en imágenes de 512px. Para los 21 mapas que necesitaban renderizado adicional, limitamos el área a un radio de 2.000 bloques alrededor del centro público. No esperamos a renderizar el mundo entero; las actualizaciones normales continuaron durante la transición.

También mejoramos los reintentos tras fallos de comunicación con R2, la conservación de actualizaciones pendientes tras errores de escritura y la distinción entre una imagen de zoom ausente y un error de lectura. El [PR #9 del fork de Dynmap](https://github.com/acecore-systems/dynmap/pull/9) documenta la recuperación de las actualizaciones de zoom tras reiniciar. Estas mejoras no eliminan los posibles fallos internos de Cloudflare.

## Verificar por separado el mapa público y el almacenamiento

Tras el cambio, comprobamos una imagen normal y otra de zoom para cada uno de los 89 mapas publicados: 178 imágenes en total. Confirmamos que tenían 512px y revisamos los recursos web y la actualización del JSON en vivo. En R2 auditamos que las rutas coincidieran con los 89 prefijos de mapas de producción y que 192 prefijos antiguos de imágenes normales y diurnas estuvieran vacíos.

Solo entonces eliminamos 11.707.356 objetos de imágenes y archivos hash antiguos, unos 51,71 GB. No existe copia del contenido de esas imágenes; si hicieran falta, habría que renderizarlas de nuevo a partir de los mundos. Conservamos las imágenes actuales, los mundos y las copias de configuración y JAR. Una auditoría final confirmó que no quedaban imágenes antiguas, datos de transición ni hashes antiguos, más allá de la salida correcta del proceso de borrado.

## El cambio de capacidad no equivale a un cambio en la factura

En dos periodos consecutivos de 24 horas que incluían trabajos de migración, los PutObject correctos bajaron de 240.835 a 90.423. Como ambos periodos incluían la migración, no representan una tasa de reducción durante el uso normal ni una estimación del coste mensual. La factura sigue sin verificarse.

En migraciones similares, consulte por separado las [métricas de operaciones y almacenamiento de R2](https://developers.cloudflare.com/r2/platform/metrics-analytics/) y verifique el mapa público, las imágenes actuales y los datos antiguos en ese orden. Defina el alcance del borrado y cómo recuperar los datos antes de eliminarlos.
