---
title: "Migrer Dynmap vers des tuiles de 512px : contrôles publics et nettoyage R2"
description: "Comment vérifier zones de rendu, images normales et de zoom et stockage R2. Un exemple de huit serveurs et 89 cartes explique les contrôles avant suppression et les conditions de comparaison des coûts."
date: "2026-09-27T22:40:00+09:00"
lastUpdated: "2026-10-09T15:00:00+09:00"
author: gui
image: /images/insights/dynmap-512-migration.webp
tags: ["Technologie", "Cloudflare"]
callout:
  type: note
  title: "Périmètre vérifié"
  text: "Un audit de production du 11 septembre 2026 a confirmé la migration et la suppression des anciennes images. Le montant facturé et le taux de réduction des coûts en fonctionnement normal restent inconnus."
---

Nous avons changé le format des images d'un Dynmap distribué depuis Cloudflare R2, puis nettoyé les anciennes données. Le périmètre couvrait huit serveurs et 89 cartes. L'essentiel était l'ordre des opérations : vérifier publiquement les nouvelles images avant de supprimer les anciennes.

## Que comparer avant de migrer les tuiles Dynmap

Comparez images normales et de zoom sur une même zone avant de choisir des tuiles de 512px. Distinguez requêtes de consultation et écritures de rendu. Inventoriez les anciens préfixes, puis décidez de leur suppression après vérification des images publiques et de leur régénération depuis le monde.

[R2：Mesurer stockage et opérations](https://developers.cloudflare.com/r2/platform/metrics-analytics/)

## Migrer par étapes avec une zone de rendu limitée

Les cartes de production ont été uniformisées en tuiles de 512px. Pour les 21 cartes qui nécessitaient un rendu supplémentaire, nous avons limité la zone à un rayon de 2 000 blocs autour du centre public. Nous n'avons pas attendu la fin du rendu du monde entier ; les mises à jour ordinaires ont continué pendant la transition.

Nous avons également amélioré les nouvelles tentatives après une erreur de communication avec R2, la conservation des mises à jour en attente après un échec d'écriture, ainsi que la distinction entre une tuile de zoom absente et une erreur de lecture. La [PR #9 du fork Dynmap](https://github.com/acecore-systems/dynmap/pull/9) décrit la reprise des mises à jour de zoom après redémarrage. Ces corrections ne suppriment pas les pannes possibles du côté de Cloudflare.

<figure class="article-diagram" data-layout="flow" data-tone="green" data-count="3" aria-labelledby="diagram-dynmap-512-migration">
  <figcaption>
    <strong id="diagram-dynmap-512-migration">Supprimer les anciennes données après vérification des nouvelles images</strong>
    <span>Auditer l’affichage public et le stockage avant le nettoyage. Les anciennes images ne sont pas sauvegardées et les économies en régime normal ne sont pas vérifiées.</span>
  </figcaption>
  <ol class="article-diagram__nodes">
    <li>
      <span class="article-diagram__symbol">
        <span aria-hidden="true">1</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
          <path d="M3 5l9-3 9 3v14l-9 3-9-3z M12 2v20 M3 5l9 3 9-3 M3 12l9 3 9-3"/>
        </svg>
      </span>
      <strong>Limiter la zone et produire de nouvelles tuiles</strong>
      <span>Définir le périmètre 512px et la zone de rendu, puis produire les nouvelles images tout en poursuivant les mises à jour habituelles.</span>
    </li>
    <li>
      <span class="article-diagram__symbol">
        <span aria-hidden="true">2</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
          <path d="M10.5 3a7.5 7.5 0 1 0 0 15 7.5 7.5 0 0 0 0-15z M16 16l5 5"/>
        </svg>
      </span>
      <strong>Auditer les images publiques et le stockage</strong>
      <span>Vérifier séparément les tuiles normales et zoomées, les ressources Web, le JSON en direct et les préfixes de stockage prévus.</span>
    </li>
    <li>
      <span class="article-diagram__symbol">
        <span aria-hidden="true">3</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
          <path d="M4 7h16 M9 7V4h6v3 M7 7l1 14h8l1-14"/>
        </svg>
      </span>
      <strong>Nettoyer les anciennes données après audit</strong>
      <span>Supprimer les anciennes images et leurs hash après audit. Sans sauvegarde, elles devront être rendues à nouveau depuis le monde si nécessaire.</span>
    </li>
  </ol>
</figure>

## Vérifier séparément l'affichage public et le stockage

Après la bascule, nous avons contrôlé une tuile normale et une tuile de zoom pour chacune des 89 cartes publiées, soit 178 images. Nous avons confirmé leur taille de 512px, puis examiné les ressources Web et les mises à jour du JSON en direct. Côté R2, nous avons vérifié que les chemins correspondaient aux 89 préfixes officiels et que 192 anciens préfixes d'images normales et diurnes étaient vides.

Ce n'est qu'ensuite que nous avons supprimé 11 707 356 objets d'images et de fichiers hash anciens, soit environ 51,71 Go. Le contenu des anciennes images n'a pas de sauvegarde ; il faudrait le rendre à nouveau à partir des mondes. Les images actuelles, les mondes et les sauvegardes de configuration et de JAR ont été conservés. Un audit final a confirmé l'absence d'anciennes images, de données de transition et de vieux fichiers hash, au-delà de la simple fin du processus de suppression.

## Ne pas confondre stockage et facture

Sur deux fenêtres consécutives de 24 heures comprenant des travaux de migration, les PutObject réussis sont passés de 240 835 à 90 423. Ces deux fenêtres incluent la migration : elles ne mesurent ni le taux de réduction en fonctionnement normal ni l'écart de coût mensuel. Le montant facturé n'a pas été vérifié.

Pour une migration semblable, consultez séparément les [indicateurs d'opérations et de stockage R2](https://developers.cloudflare.com/r2/platform/metrics-analytics/), puis vérifiez l'affichage public, les images actuelles et les anciennes données. Définissez le périmètre de suppression et la méthode de récupération avant tout effacement.
