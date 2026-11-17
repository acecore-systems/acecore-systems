---
title: "Usar registros públicos para generar candidatos para el CRM: conservar la fuente y los cambios para su revisión humana"
description: "Presentamos un diseño que separa los archivos originales de los datos públicos de los momentos de observación y evita reflejar automáticamente en la información existente de las empresas los duplicados, las desapariciones y los cambios de los candidatos."
date: "2026-11-17T12:00:00+09:00"
author: gui
image: /images/insights/covers/private-dashboard-access-and-aggregation-cover-v1.webp
tags: ["Datos", "CRM", "Operaciones"]
---

Al generar candidatos para el CRM a partir de registros públicos, los establecimientos con el mismo nombre no pertenecen necesariamente a la misma empresa. En lugar de vincular directamente las actualizaciones de los datos de origen o la desaparición de filas con la actualización de la información existente de las empresas o con su cierre, se permite que una persona compruebe la fuente y los cambios.

<figure class="article-diagram" data-layout="flow" data-tone="blue" data-count="3" aria-labelledby="diagram-public-register-snapshot-review">
  <figcaption><strong id="diagram-public-register-snapshot-review">Usar registros públicos para generar candidatos para el CRM: conservar la fuente y los cambios para su revisión humana</strong><span>Presentamos un diseño que separa los archivos originales de los datos públicos de los momentos de observación y evita reflejar automáticamente en la información existente de las empresas los duplicados, las desapariciones y los cambios de los candidatos.</span></figcaption>
  <ol class="article-diagram__nodes">
    <li><strong>Guardar el archivo original</strong><span>Registrar la fuente, la fecha de referencia y el momento de observación.</span></li>
    <li><strong>Revisar los cambios</strong><span>Reutilizar los archivos originales idénticos y dejar pendientes los nombres duplicados.</span></li>
    <li><strong>Decisión humana</strong><span>Cotejar los candidatos antes de crear los registros necesarios.</span></li>
  </ol>
</figure>

## Conservar por separado los archivos originales y las observaciones

Registre la URL de origen, las condiciones de uso, la fecha de referencia del organismo que publica los datos y la hora de obtención. Aunque el archivo original sea idéntico al anterior, la hora de la nueva comprobación o la descripción del organismo publicador pueden ser diferentes. Al separar el almacenamiento del contenido del archivo de la observación de qué se comprobó y cuándo, se puede reutilizar el mismo archivo y conservar un historial de comprobaciones.

Por ejemplo, el [catálogo de datos de la ciudad de Funabashi](https://www.city.funabashi.lg.jp/shisei/toukei/002/opendata.html) permite consultar los datos públicos y sus condiciones de uso. Compruebe también las condiciones, la fecha de actualización y el alcance de cada conjunto de datos que vaya a utilizar. El mero hecho de que los datos sean públicos no implica que estén permitidos todos los métodos de obtención ni todos los usos.

## Mostrar los cambios y las desapariciones como información para la toma de decisiones

En una comprobación interna del registro, comparamos todas las filas de ambas versiones y mostramos las diferencias de los campos para los nombres que podían emparejarse de forma unívoca. Si hay varios registros con el mismo nombre, se dejan pendientes en lugar de vincularlos automáticamente. La desaparición de una fila es una observación de que ya no aparece en los datos; no se utiliza como prueba del cierre o la eliminación de una empresa. Las direcciones y los números de teléfono tampoco sobrescriben automáticamente la información existente de las empresas.

Con datos ficticios, verificamos la reutilización de un mismo archivo original, los cambios y las desapariciones de campos, la retención de nombres duplicados para revisión y la reanudación tras fallos parciales. Este artículo no incluye archivos originales reales ni información comercial. Como los métodos de actualización y los identificadores varían según los datos, esta verificación no garantiza la obtención automatizada e ilimitada de datos de otros sitios.

## Pasos para una primera prueba

Prepare 2 versiones de un CSV ficticio pequeño e incluya una fila idéntica, una fila modificada, una fila desaparecida y 2 filas con el mismo nombre. Guarde los archivos originales y los momentos de observación, muestre solo los candidatos y compruebe que los datos existentes no cambian. Si falla la obtención o cambian las condiciones de uso, detenga el proceso y reanúdelo después de que una persona compruebe los datos de origen. Decida también el período de conservación y el método de eliminación antes de ponerlo en funcionamiento. Fecha de comprobación: 17/11/2026.
