---
title: "Restaurar materiales de edición de vídeo y música con Git y DVC: comprobar por separado la reproducción y la edición"
description: "Cómo vincular las definiciones de edición de Git con los materiales de DVC y comprobar sucesivamente los hashes, la reproducción y el guardado en la aplicación de edición."
date: "2026-11-17T12:00:00+09:00"
author: gui
image: /images/insights/covers/restic-r2-backup-verification-cover-v1.webp
tags: ["Git", "DVC", "Producción"]
---

Aunque se pueda reproducir el archivo final de un vídeo o una pieza musical, eso no garantiza que se pueda reanudar la edición: las referencias a los materiales pueden estar rotas o faltar aplicaciones. Al gestionar las definiciones de edición con Git y vincular las versiones de los materiales grandes con DVC, conviene registrar por separado qué se ha podido restaurar.

<figure class="article-diagram" data-layout="flow" data-tone="blue" data-count="3" aria-labelledby="diagram-git-dvc-creative-restore">
  <figcaption><strong id="diagram-git-dvc-creative-restore">Restaurar materiales de edición de vídeo y música con Git y DVC: comprobar por separado la reproducción y la edición</strong><span>Cómo vincular las definiciones de edición de Git con los materiales de DVC y comprobar sucesivamente los hashes, la reproducción y el guardado en la aplicación de edición.</span></figcaption>
  <ol class="article-diagram__nodes">
    <li><strong>Fijar la versión</strong><span>Alinear las definiciones de edición y las referencias a los materiales.</span></li>
    <li><strong>Restaurar de forma independiente</strong><span>Obtener los datos desde una caché vacía y cotejar los hashes.</span></li>
    <li><strong>Comprobar el uso</strong><span>Probar por separado la reproducción de la exportación y la edición y el guardado.</span></li>
  </ol>
</figure>

## Qué alinear entre Git y DVC

En Git se guardan el proyecto de edición, el registro de materiales y la información de referencia de DVC, mientras que los archivos grandes de vídeo y audio se gestionan con DVC. El origen y las condiciones de uso de los materiales también se anotan en el registro. Una referencia en Git no demuestra por sí sola que el material esté almacenado, por lo que se comprueban por separado su carga en el destino de almacenamiento y su obtención independiente. En la [explicación de pull de DVC](https://doc.dvc.org/command-reference/pull) se puede consultar cómo obtener los datos correspondientes a las referencias.

## Restaurar desde una caché vacía y cotejar

En la plataforma interna de producción de vídeo, se utilizó una caché independiente y vacía para alternar entre 2 versiones y cotejar el SHA-256 de los materiales restaurados a la versión original. También se comprobaron las referencias relativas de la definición de edición, y los vídeos de 8 segundos generados a partir del original y de la copia restaurada coincidieron byte por byte. Este resultado se limita a una restauración y exportación locales y no demuestra la restauración desde un almacenamiento externo o desde otro PC, ni el guardado desde la interfaz de edición.

En otra versión de vídeo se restauraron 60 materiales desde un almacenamiento local a una caché vacía, y se cotejaron los hashes y las referencias de la definición de edición. En esta prueba no se realizaron la sincronización en la nube ni la recarga desde la interfaz de edición. Si cambia el destino de almacenamiento, se debe repetir el mismo procedimiento con el nuevo destino.

En otra prueba de producción musical se restauraron 7 archivos multimedia desde una caché local independiente y se cotejaron los hashes y tamaños, así como las referencias relativas de 3 stems y de la definición de edición de vídeo. Se guardó, recargó y exportó la duración completa mediante el procesamiento nativo de Ardour, y la diferencia PCM respecto al WAV de referencia fue 0. Esta comprobación se realizó mediante procesamiento nativo. En esta prueba no se realizó la secuencia completa de comprobación mediante la interfaz gráfica —editar, guardar con otro nombre y volver a abrir—, ni una nueva restauración desde un almacenamiento externo o una comprobación en otro PC.

## Comprobar la reproducción y la edición

1. Restaurar la versión de Git y los materiales correspondientes en un lugar donde no se sobrescriba el original.
2. Comprobar los hashes del registro, las rutas de referencia y si falta algún material.
3. Reproducir el vídeo o audio exportado y comprobar su duración y si falta contenido.
4. Abrir el proyecto en la aplicación de edición, volver a guardarlo con otro nombre y abrirlo de nuevo para comprobar su estado de edición.

La versión de la aplicación, las fuentes, los complementos, las bibliotecas de sonido y los derechos también afectan a la restauración. Aunque la comparación automática coincida, una persona debe comprobar que la calidad del sonido y de la imagen sea la prevista. Pruebe primero toda la secuencia con un proyecto breve de materiales ficticios y registre la fecha de comprobación y los destinos de almacenamiento aún no comprobados. Fecha de comprobación: 17/11/2026.
