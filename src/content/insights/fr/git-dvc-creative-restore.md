---
title: "Restaurer les ressources de montage vidéo et audio avec Git et DVC : vérifier séparément la lecture et l’édition"
description: "Comment associer les définitions de montage dans Git aux ressources dans DVC, puis vérifier successivement les hachages, la lecture et le réenregistrement dans l’application de montage."
date: "2026-11-17T12:00:00+09:00"
author: gui
image: /images/insights/covers/restic-r2-backup-verification-cover-v1.webp
tags: ["Git", "DVC", "Production"]
---

Même si un fichier vidéo ou audio final peut être lu, il n’est pas forcément possible de reprendre le montage : des références aux ressources peuvent être rompues ou des applications peuvent manquer. Lorsque Git gère les définitions de montage et que DVC leur associe les versions des ressources volumineuses, consignez séparément ce qui a pu être restauré.

<figure class="article-diagram" data-layout="flow" data-tone="blue" data-count="3" aria-labelledby="diagram-git-dvc-creative-restore">
  <figcaption><strong id="diagram-git-dvc-creative-restore">Restaurer les ressources de montage vidéo et audio avec Git et DVC : vérifier séparément la lecture et l’édition</strong><span>Comment associer les définitions de montage dans Git aux ressources dans DVC, puis vérifier successivement les hachages, la lecture et le réenregistrement dans l’application de montage.</span></figcaption>
  <ol class="article-diagram__nodes">
    <li><strong>Fixer la version</strong><span>Faire correspondre les définitions de montage et les références aux ressources.</span></li>
    <li><strong>Restaurer indépendamment</strong><span>Récupérer les données depuis un cache vide et comparer les hachages.</span></li>
    <li><strong>Vérifier les usages</strong><span>Tester séparément la lecture de l’export et l’édition suivie du réenregistrement.</span></li>
  </ol>
</figure>

## Que faire correspondre entre Git et DVC ?

Stockez dans Git les projets de montage, le registre des ressources et les informations de référence de DVC, et gérez les ressources vidéo et audio volumineuses avec DVC. Consignez également leur provenance et leurs conditions d’utilisation dans le registre. La présence d’une référence dans Git ne prouve pas que la ressource elle-même a été sauvegardée : vérifiez donc séparément son dépôt dans le stockage et sa récupération indépendante. La [documentation de DVC sur pull](https://doc.dvc.org/command-reference/pull) explique comment récupérer les données correspondant aux références.

## Restaurer depuis un cache vide et comparer

Sur une infrastructure interne de production vidéo, nous avons utilisé un cache vide indépendant pour passer d’une version à l’autre parmi 2 versions, puis comparé les hachages SHA-256 des ressources revenues à leur version d’origine. Nous avons également vérifié les références relatives dans les définitions de montage. Les vidéos de 8 secondes produites à partir des données d’origine et des données restaurées étaient identiques octet pour octet. Ce résultat concerne une restauration et un export locaux limités ; il ne prouve pas qu’une restauration depuis un stockage externe ou un autre PC, ni un réenregistrement dans l’interface de montage, soient possibles.

Pour une autre version vidéo, nous avons restauré 60 ressources depuis un stockage local vers un cache vide, puis comparé les hachages et les références dans les définitions de montage. Ce test ne comprenait ni synchronisation cloud ni rechargement dans l’interface de montage. Si le stockage change, recommencez la même procédure avec le nouveau stockage.

Dans un autre test de production musicale, nous avons restauré 7 médias depuis un cache local indépendant, puis comparé les hachages, les tailles et les références relatives de 3 stems et des définitions de montage vidéo. Avec le traitement natif d’Ardour, nous avons enregistré, rechargé et exporté le projet sur toute sa durée ; la différence PCM avec le WAV de référence était de 0. Cette vérification reposait sur le traitement natif. Le test ne comprenait pas la séquence complète dans l’interface graphique consistant à modifier, enregistrer sous un autre nom et rouvrir le projet, ni une nouvelle restauration depuis un stockage externe ou une vérification sur un autre PC.

## Vérifier la lecture et la possibilité de modifier

1. Restaurer la version Git concernée et les ressources dans un emplacement qui n’écrase pas les originaux.
2. Vérifier les hachages du registre, les chemins de référence et l’absence de ressources manquantes.
3. Lire la vidéo ou l’audio exporté et vérifier la durée ainsi que les éventuels éléments manquants.
4. Ouvrir le projet dans l’application de montage, l’enregistrer sous un autre nom, puis le rouvrir pour vérifier l’état du montage.

La version de l’application, les polices, les plug-ins, les sources sonores et les droits influent également sur la restauration. Même si la comparaison automatique confirme une correspondance, une vérification humaine reste nécessaire pour déterminer si le son et l’image ont la qualité voulue. Essayez d’abord toute la procédure sur un court projet utilisant des ressources fictives, puis consignez la date de vérification et les stockages non vérifiés. Date de vérification : 17/11/2026.
