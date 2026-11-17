---
title: "Vérifier si l’IA contredit les archives : distinguer les omissions des événements distincts lors de l’examen du canon"
description: "Comment distinguer les omissions, les contradictions et les scènes distinctes lorsqu’on confronte un texte généré aux archives ? Présentation de l’évaluation sur 31 cas fixes concernant Alpha-kun et de ses limites."
date: "2026-11-17T12:00:00+09:00"
author: gui
image: /images/insights/covers/ai-reply-capability-guardrails-cover-v1.webp
tags: ["IA", "Vérification", "Exploitation"]
---

Lorsqu’une IA génère un texte à partir d’un récit ou d’archives professionnelles existantes, considérer comme contradictoire tout contenu absent des archives risque de conduire au rejet de nouvelles formulations. À l’inverse, il faut éviter de laisser passer un texte qui contredit ce qui est explicitement consigné au sujet d’un même événement. À partir de l’examen de propositions pour le canon d’Alpha-kun, nous précisons les éléments qui fondent le jugement et la portée de l’évaluation.

<figure class="article-diagram" data-layout="flow" data-tone="violet" data-count="3" aria-labelledby="diagram-lore">
  <figcaption><strong id="diagram-lore">Confronter la proposition aux archives</strong><span>Vérifier qu’il s’agit du même sujet, du même événement et du même moment avant de trancher.</span></figcaption>
  <ol class="article-diagram__nodes">
    <li><strong>Consulter les archives</strong><span>Rechercher le passage original et le sujet liés à la proposition.</span></li>
    <li><strong>Comparer les scènes</strong><span>Examiner les éléments indiquant qu’il s’agit du même événement et du même moment.</span></li>
    <li><strong>Distinguer les motifs</strong><span>Différencier contradiction explicite, dépassement du cadre et omission.</span></li>
  </ol>
</figure>

## Une omission n’est pas une contradiction

Par exemple, si les archives indiquent seulement « a vu des nuages blancs pendant la promenade », la couleur des fleurs vues pendant cette promenade n’est pas précisée. Leur absence des archives ne permet pas de conclure qu’aucune fleur n’a été vue. En revanche, s’il est explicitement indiqué qu’« il n’a pas plu » pendant cette même promenade, une proposition affirmant qu’« il a plu à ce moment-là » est contradictoire. Cet exemple fictif illustre la différence entre les deux jugements.

Même en présence d’indices similaires, il peut s’agir d’une promenade faite un autre jour. Il faut vérifier les éléments montrant que le sujet, l’événement et le moment sont les mêmes, et ne pas traiter une condition telle que « s’il pleut, rentrer » comme un compte rendu indiquant qu’il a effectivement plu. Lorsqu’une proposition attribue un résultat opposé à une scène dont l’issue est explicitement indéterminée à ce moment-là, on la traite comme un dépassement du cadre plutôt que comme une simple contradiction.

## Comparer les améliorations sur des cas fixes

Selon le journal interne des modifications apportées à l’examen, les 29 cas fixes existants et les 2 cas témoins synthétiques, soit 31 cas au total, ont été évalués avec la même configuration de modèle qu’en production. Pour les 31 cas, la v13 a produit la décision d’acceptation ou de rejet et le motif attendus ; le nombre de régénérations dues à une contradiction détectée à tort était de 0. Il s’agit d’un résultat obtenu sur un ensemble fixe : il ne démontre ni la précision sur tous les textes, ni la réussite d’ajouts au canon apparus naturellement en production.

On compare l’ancienne et la nouvelle version en conservant les mêmes entrées et résultats attendus, puis on ajoute les exemples ayant échoué pour détecter les régressions. Lorsqu’il est impossible de relier une citation des archives à l’affirmation de la proposition, il est important de signaler l’insuffisance des éléments afin qu’une personne puisse vérifier. Les [bonnes pratiques d’OpenAI pour les évaluations](https://platform.openai.com/docs/guides/evaluation-best-practices) peuvent également aider à créer des ensembles d’évaluation pour l’IA.

Pour commencer, préparez un petit nombre d’archives réelles pouvant être publiées et de cas témoins fictifs, puis faites consigner par une personne les jugements attendus : « même scène », « scène différente », « non mentionné » et « contradiction explicite ». Date de vérification : 17/11/2026.
