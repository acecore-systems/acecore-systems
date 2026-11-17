---
title: "Réduire séparément les exécutions GitHub Actions en double et la durée des builds Gradle"
description: "Revoir les conditions de déclenchement de la CI en double sur les push et les PR, et comparer le cache Gradle Android sur un même commit. Critères de décision et limites des mesures."
date: "2026-11-17T12:00:00+09:00"
author: gui
image: /images/insights/covers/astro-performance-tuning-cover-v2.webp
tags: ["GitHub Actions", "Android", "Exploitation"]
---

Si la CI Android répète les mêmes opérations à chaque exécution, une comparaison incluant le temps de restauration du cache aide à décider de son adoption. À partir d’un test effectué sur le même commit dans le job Android de DaysChat, nous présentons comment vérifier la rapidité et la reproductibilité.

<figure class="article-diagram" data-layout="flow" data-tone="blue" data-count="3" aria-labelledby="diagram-gradle">
  <figcaption><strong id="diagram-gradle">Comparer le cache avec les mêmes entrées</strong><span>Examiner le job dans son ensemble, y compris le coût de sauvegarde et de restauration.</span></figcaption>
  <ol class="article-diagram__nodes">
    <li><strong>Première exécution</strong><span>Créer le cache et enregistrer le temps de sauvegarde.</span></li>
    <li><strong>Réexécution du même commit</strong><span>Vérifier le temps de restauration et les tâches réutilisées.</span></li>
    <li><strong>Vérifier les artefacts</strong><span>Vérifier les architectures ciblées et la génération de l’APK.</span></li>
  </ol>
</figure>

## Éviter de répéter les mêmes vérifications sur les push et les PR

Dans un autre système de comptes rendus de réunion, la CI habituelle et Rust parity étaient déclenchés à la fois par les push sur les branches de travail et par les PR. Nous avons limité les déclenchements par push à main, maintenu les vérifications des PR et permis une exécution manuelle pour les vérifications avant la création d’une PR. Les conditions de déclenchement des mises en production n’ont pas été modifiées.

Selon une analyse interne, en 11, 97 exécutions déclenchées par push correspondaient à des PR dont l’exécution avait également réussi, pour un total de 342 minutes sur les runners Linux. Il s’agit du temps d’exécution à examiner pour détecter les doublons, et non du temps ou du montant facturé réellement économisé après la modification. Avant de restreindre les déclenchements concernés, il faut vérifier comment valider les changements sans PR et s’assurer que les contrôles obligatoires et les releases ne seront pas bloqués. Les conditions de push et de pull_request sont décrites dans les [événements GitHub Actions](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows).

## Mesures et conditions au sein du job

Dans la comparaison sur un même commit consignée dans le journal interne des modifications, le job Android a pris 16 minutes 20 secondes lors de la première exécution et 6 minutes 16 secondes lors de la réexécution, restauration comprise. 194 tâches Gradle ont été réutilisées, et les vérifications de x86_64 et arm64-v8a ainsi que la génération de l’APK ont réussi. La sauvegarde initiale a pris 34 secondes, la restauration lors de la réexécution 62 secondes, et le cache de test occupait environ 1.81 GB.

| Élément observé        | Première exécution       | Réexécution                |
| ---------------------- | ------------------------ | -------------------------- |
| Job Android            | 16 minutes 20 secondes   | 6 minutes 16 secondes      |
| Opération sur le cache | Sauvegarde : 34 secondes | Restauration : 62 secondes |

Cette paire de 1 comparaison est un exemple mesuré avec un cache dédié aux PR. Dans la configuration finale, seul main sauvegarde le cache partagé, que les PR restaurent en lecture seule. Nous n’avons pas mesuré si toutes les PR de la configuration finale bénéficient du même gain de temps ni si le montant facturé diminue. Les résultats varient aussi selon l’environnement d’exécution et le taux de correspondance du cache.

## Définir les conditions de réutilisation et une sauvegarde sûre

Le [cache de build Gradle](https://docs.gradle.org/current/userguide/build_cache.html) utilise les entrées et les sorties des tâches pour déterminer leur réutilisation. Une déclaration inexacte des entrées peut entraîner l’utilisation de sorties obsolètes : comparez donc d’abord une exécution propre, les artefacts et les résultats des tests. Vérifiez également que le cache est invalidé comme prévu lors d’une modification des dépendances ou de la configuration du build.

Limitez les acteurs autorisés à sauvegarder le cache et configurez le système pour que les modifications non fiables ne puissent pas mettre à jour le cache partagé. Le [cache des dépendances GitHub Actions](https://docs.github.com/en/actions/concepts/workflows-and-actions/dependency-caching) est soumis à des restrictions d’accès et à des précautions d’utilisation. Ne stockez pas de secrets dans le cache et observez ensemble sa taille, les temps de sauvegarde et de restauration, ainsi que la durée totale du job.

Commencez par limiter le test à 1 job et consignez les artefacts et les temps de la première exécution et de la réexécution du même commit. Même si un gain de temps est visible, vérifiez séparément que le build fonctionne normalement avec d’autres modifications ou en l’absence de cache. Date de vérification : 2026-11-17.
