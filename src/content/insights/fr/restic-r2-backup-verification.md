---
title: "Superviser restic sur R2 : du stockage réussi à la restauration vérifiée"
description: "Suivre séparément fraîcheur des instantanés, intégrité et restauration, en précisant la reprise applicative restant à vérifier."
date: "2026-09-30T20:53:00+09:00"
author: gui
image: /images/insights/restic-r2-backup-verification.webp
tags: ["Cloudflare R2", "restic", "Backup"]
callout:
  type: note
  title: "La reprise complète exige une vérification distincte"
  text: "Sauvegardes périodiques, supervision, rétention et extraction/intégrité de données sélectionnées ont été effectuées. Le démarrage de toutes les applications et la reprise avec identifiants séparés ne sont pas démontrés."
---

Une tâche terminée ne prouve pas que les données nécessaires sont récupérables. Ce cas interne généralisé évalue séparément stockage, intégrité, restauration et reprise du service. Il ne décrit pas une migration achevée depuis un autre service.

## Définir source et réussite

Le dispositif utilise chiffrement et déduplication restic avec l’API compatible S3 de R2. Vérifiez les opérations dans la [table de compatibilité](https://developers.cloudflare.com/r2/api/s3/api/). Pour les bases actives, prévoyez une capture cohérente par export ou suspension appropriée de l’application.

## Surveiller la fraîcheur

Suivez séparément dernier instantané réussi, retards, échecs et résultats d’intégrité/restauration. Le lancement ne vaut pas réussite. Un échec de notification diffère aussi d’un échec de sauvegarde.

## Vérifier intégrité et extraction

`restic check` par défaut et les contrôles lisant les données ont des périmètres différents. `--read-data` lit toutes les données ; documentez les contrôles partiels. Combinez [contrôles du dépôt](https://restic.readthedocs.io/en/stable/045_working_with_repos.html), [restauration](https://restic.readthedocs.io/en/stable/050_restore.html) dans un emplacement isolé et comparaison de contenus ou empreintes. Extraire les fichiers ne vérifie pas le démarrage applicatif.

## Gérer la rétention avec restic

Choisissez les instantanés par sa politique et utilisez `forget`, `prune`, `check`, en vérifiant auparavant ce qui restera. Supprimer les objets R2 uniquement selon leur âge peut détruire des données partagées nécessaires aux instantanés conservés. Suivez la [documentation de rétention](https://restic.readthedocs.io/en/stable/060_forget.html) ; nettoyer des images distribuées relève d’un autre usage.

## Vérifications restantes

Exploitation périodique, supervision/alertes, rétention et extraction/intégrité de données sélectionnées ont été effectuées. Démarrage de toutes les applications, configurations et dépendances, et accès aux identifiants séparés restent à valider de bout en bout. Délai de reprise et perte acceptable doivent être mesurés. Aucune reprise complète ni économie démontrée n’est revendiquée.
