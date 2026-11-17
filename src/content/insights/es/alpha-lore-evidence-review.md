---
title: "Comprobar si la IA contradice los registros: revisión del canon que distingue entre lo no registrado y otros acontecimientos"
description: "Cómo distinguir lo no registrado, las contradicciones y las escenas diferentes al cotejar textos generados con los registros. Presentamos la evaluación y los límites del conjunto fijo de 31 casos de Alpha-kun."
date: "2026-11-17T12:00:00+09:00"
author: gui
image: /images/insights/covers/ai-reply-capability-guardrails-cover-v1.webp
tags: ["IA", "Verificación", "Operaciones"]
---

Cuando la IA genera textos basados en historias existentes o registros de trabajo, considerar contradictorio todo lo que no aparece en los registros podría llevar a rechazar incluso expresiones nuevas. En cambio, no queremos pasar por alto textos que contradicen lo que se ha indicado explícitamente sobre un mismo acontecimiento. A partir de la revisión de candidatos al canon de Alpha-kun, organizamos los fundamentos de las decisiones y el alcance de la evaluación.

<figure class="article-diagram" data-layout="flow" data-tone="violet" data-count="3" aria-labelledby="diagram-lore">
  <figcaption><strong id="diagram-lore">Cotejar el candidato con los registros</strong><span>Antes de decidir, se comprueba que se trate del mismo referente, acontecimiento y momento.</span></figcaption>
  <ol class="article-diagram__nodes">
    <li><strong>Revisar los registros</strong><span>Buscar el texto original y los referentes relacionados con el candidato.</span></li>
    <li><strong>Cotejar la escena</strong><span>Revisar las pruebas de que se refiere al mismo acontecimiento y momento.</span></li>
    <li><strong>Distinguir los motivos</strong><span>Diferenciar la contradicción explícita, la extralimitación y lo no registrado.</span></li>
  </ol>
</figure>

## Lo no registrado no es una contradicción

Por ejemplo, si el registro solo dice «vio nubes blancas durante el paseo», el color de las flores que vio durante ese paseo no está registrado. El mero hecho de que no figure en el registro no permite concluir que no vio flores. En cambio, si se indica explícitamente que «no llovió» durante ese mismo paseo, esto contradice un candidato que diga «llovió en ese momento». Este es un ejemplo ficticio que ilustra la diferencia entre ambos criterios.

Aunque haya indicios similares, podría tratarse de un paseo de otro día. Hay que comprobar las pruebas de que el referente, el acontecimiento y el momento son los mismos, y evitar tratar una frase condicional como «si llueve, vuelve a casa» como un registro de que realmente llovió. Si un candidato asigna un resultado contrario a una escena en la que el resultado en ese momento se indica explícitamente como indeterminado, se trata como una extralimitación, no como una simple contradicción.

## Comparar las mejoras con casos fijos

Según el registro interno de cambios en la revisión, se evaluaron los 29 casos fijos anteriores y 2 controles sintéticos, un total de 31 casos, con la misma configuración del modelo que en producción. La v13 coincidió con las decisiones de aceptación o rechazo y los motivos esperados en los 31 casos, y hubo 0 regeneraciones debidas a contradicciones incorrectamente identificadas. Este es un resultado obtenido con un conjunto fijo y no demuestra la precisión para todos los textos ni el éxito de las adiciones al canon surgidas de forma natural en producción.

Se comparan la versión anterior y la nueva manteniendo fijos los valores esperados y las entradas, y se añaden los ejemplos fallidos para detectar regresiones. En ese proceso, si no se puede vincular una cita del registro con la afirmación del candidato, es importante señalar la falta de pruebas para que una persona pueda revisarla. Las [prácticas recomendadas de OpenAI para las evaluaciones](https://platform.openai.com/docs/guides/evaluation-best-practices) también pueden servir de referencia para crear conjuntos de evaluación de IA.

Para empezar, prepare unos pocos registros reales que puedan publicarse y controles ficticios, y pida a una persona que anote las decisiones esperadas para «misma escena», «otra escena», «no registrado» y «contradicción explícita». Fecha de comprobación: 17/11/2026.
