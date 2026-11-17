---
title: "Mejorar artículos con Search Console: investigación, revisión y evaluación de los 28 días anteriores y posteriores"
description: "Presentamos un procedimiento para seleccionar candidatos a mejora a partir de datos de búsqueda, verificar las fuentes, revisar los cambios en un Draft PR y comparar los 28 días anteriores y posteriores a la publicación, junto con las precauciones para interpretar los resultados."
date: "2026-11-17T12:00:00+09:00"
author: gui
image: /images/insights/covers/astro-seo-and-structured-data-cover-v2.webp
tags: ["Tecnología", "SEO", "Operaciones"]
callout:
  type: note
  title: "Comparación y causalidad no son lo mismo"
  text: "Las cifras anteriores y posteriores sirven para observar cambios. Como también influyen factores como la demanda de búsqueda y otras revisiones realizadas en el mismo período, el caso de este artículo no demuestra una mejora del tráfico."
---

Aunque las impresiones y los clics de Search Console permitan encontrar candidatos a mejora, las cifras por sí solas no indican si los lectores obtuvieron las respuestas que necesitaban. En este artículo presentamos un procedimiento para investigar la página y la intención de búsqueda, cotejar la información pública con el texto, revisar una propuesta de cambios y comparar períodos con las mismas condiciones después de la publicación.

<figure class="article-diagram" data-layout="flow" data-tone="violet" data-count="3" aria-labelledby="diagram-search-editorial">
  <figcaption>
    <strong id="diagram-search-editorial">Vincular los datos de búsqueda con la edición y la evaluación</strong>
    <span>Separamos la identificación de candidatos, la verificación del contenido y la observación posterior a la publicación.</span>
  </figcaption>
  <ol class="article-diagram__nodes">
    <li><strong>Investigación</strong><span>Revisar la página y la intención de búsqueda, y registrar hipótesis.</span></li>
    <li><strong>Revisión y corrección</strong><span>Cotejar las fuentes primarias y revisar los cambios en un Draft PR.</span></li>
    <li><strong>Evaluación posterior a la publicación</strong><span>Comparar períodos con las mismas condiciones y dejar constancia de las limitaciones.</span></li>
  </ol>
</figure>

## 1. Seleccionar candidatos a mejora a partir de las cifras y el texto

En el informe de rendimiento de búsqueda, fija la página, el tipo de búsqueda y el período, y comprueba las impresiones, los clics, el CTR y la posición media. Si es necesario, revisa también las consultas, los países y los dispositivos. Las páginas que reciben impresiones pero en las que resulta difícil encontrar la respuesta en el texto son candidatas a investigación; sin embargo, un CTR bajo por sí solo no determina que sea necesario cambiar el título.

Abre la página y anota qué quieren saber las personas que buscan y qué explicaciones faltan en el texto actual. También es importante no tratar las consultas que no se muestran o las filas que no se han obtenido como prueba de que no hubo búsquedas. El [procedimiento de Google para investigar caídas del tráfico de búsqueda](https://developers.google.com/search/docs/monitor-debug/debugging-search-traffic-drops) puede servir de referencia para examinar los cambios por período, página y consulta.

## 2. Cotejar las fuentes y crear cambios útiles para los lectores

Consulta la documentación oficial y la página publicada, y añade ejemplos concretos, procedimientos, condiciones de aplicación y enlaces de referencia. Distingue entre mediciones reales, ejemplos ficticios usados para explicar y asuntos no verificados; no presentes como resultados efectos que no se hayan medido. Ajusta también el título y la descripción a lo que el texto realmente responde. La [autoevaluación de contenido útil de Google](https://developers.google.com/search/docs/fundamentals/creating-helpful-content) también puede servir de referencia para la revisión.

Reúne la propuesta de revisión en un Draft PR y comprueba los cambios y sus fuentes, que se hayan mantenido la fecha de publicación y la URL, y si hay traducciones pendientes. La revisión, la integración, el despliegue y la incorporación a los resultados de búsqueda son estados distintos. Que haya terminado la revisión del texto no significa que ya se pueda leer en producción.

## 3. Fijar la fecha de publicación y las condiciones de comparación

Como ejemplo, compara los 28 días anteriores y los 28 días posteriores, excluyendo la fecha de publicación. Mantén iguales en ambos períodos la URL y el idioma de destino, el tipo de búsqueda, el país, el dispositivo, los límites de fecha y el estado de consolidación de los datos. Si el contenido se desplegó a distintas horas durante el día de publicación, excluir ese día permite aclarar las condiciones de comparación. Los 28 días son una ventana de observación práctica, pero no garantizan ser el período óptimo para todos los artículos.

| Elemento que se registra                     | Motivo de la comprobación                                                    |
| -------------------------------------------- | ---------------------------------------------------------------------------- |
| Fecha y hora de publicación y URL de destino | Fijar los períodos y el objeto de comparación                                |
| Clics, impresiones, CTR y posición media     | Observar los cambios en las mismas condiciones                               |
| Idioma, tipo de búsqueda, país y dispositivo | Evitar confusiones debidas a diferencias en la agregación                    |
| Otras revisiones, demanda y falta de datos   | Dejar constancia de las limitaciones necesarias para interpretar los cambios |

## Caso real: la comparación anterior y posterior no basta para determinar el efecto de la revisión

En el [artículo de presentación de WIKI y Alpha-kun de Aceserver Portal](https://asv.acecore.net/stories/wiki-alpha-guide/), añadimos ejemplos de preguntas e indicaciones para consultar el texto original y publicamos la versión revisada en el año 2026, mes 10, día 10. Las ventanas de evaluación, según los límites de fecha de Search Console y excluyendo el día de publicación, van del mes 9, día 12, al mes 10, día 9, y del mes 10, día 11, al mes 11, día 7.

El período anterior también incluye la fecha de publicación inicial y otra revisión inmediatamente anterior. Como se realizaron varios cambios a la vez y también hay fluctuaciones debidas a la demanda de búsqueda y al reducido número de casos, la diferencia entre ambos períodos no puede interpretarse como el efecto aislado de esta revisión o de los enlaces de referencia. En el momento de la investigación no se había demostrado una mejora del tráfico. Al registrar las observaciones, distingue entre los datos que se pudieron obtener y los que no.

Para empezar, prueba a registrar para un artículo las preguntas de los lectores, el texto ya publicado, las fuentes consultadas y la hipótesis de revisión, y prepara cambios que puedan revisarse. Utiliza la comparación posterior a la publicación como base para seleccionar la siguiente investigación y trata por separado los cambios en las cifras y sus causas. Fecha de comprobación: año 2026, mes 11, día 17.
