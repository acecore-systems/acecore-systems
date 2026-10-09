---
title: "Superviser restic sur R2 : du stockage réussi à la restauration vérifiée"
description: "Suivre séparément fraîcheur des instantanés, intégrité et restauration, en précisant la reprise applicative restant à vérifier."
date: "2026-09-30T20:53:00+09:00"
lastUpdated: "2026-10-09T15:00:00+09:00"
author: gui
image: /images/insights/covers/restic-r2-backup-verification-cover-v1.webp
tags: ["Cloudflare R2", "restic", "Backup"]
callout:
  type: note
  title: "La reprise complète exige une vérification distincte"
  text: "Sauvegardes périodiques, supervision, rétention et extraction/intégrité de données sélectionnées ont été effectuées. Le démarrage de toutes les applications et la reprise avec identifiants séparés ne sont pas démontrés."
---

Une tâche terminée ne prouve pas que les données nécessaires sont récupérables. Ce cas interne généralisé évalue séparément stockage, intégrité, restauration et reprise du service. Il ne décrit pas une migration achevée depuis un autre service.

## Fixer l’ID du snapshot et un objectif de reprise

Notez l’ID et restaurez les fichiers nécessaires dans une destination vide et isolée. Vérifiez références et permissions des configurations, ou chargement de la base en isolation. Mesurez la durée. Répétez périodiquement les mêmes contrôles pour comparer fraîcheur et périmètre récupérable.

[restic：Restaurer dans une destination isolée](https://restic.readthedocs.io/en/stable/050_restore.html)

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

<figure class="article-diagram" data-layout="layers" data-tone="amber" data-count="3" aria-labelledby="diagram-restic-r2-backup-verification">
  <figcaption>
    <strong id="diagram-restic-r2-backup-verification">Vérifier les preuves par étapes, de la fraîcheur du snapshot à la reprise complète</strong>
    <span>Récupérer des données ne prouve pas que les applications ou les identifiants peuvent aussi être rétablis.</span>
  </figcaption>
  <ol class="article-diagram__nodes">
    <li>
      <span class="article-diagram__symbol">
        <span aria-hidden="true">1</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M4 7h16v13H4z M3 7l2-4h14l2 4 M8 11h8 M12 11v5"/></svg>
      </span>
      <strong>Snapshot réussi et fraîcheur</strong>
      <span>Vérifiez l’horodatage d’un snapshot réellement réussi et son retard par rapport au calendrier. Le démarrage du job ne suffit pas à prouver sa réussite.</span>
    </li>
    <li>
      <span class="article-diagram__symbol">
        <span aria-hidden="true">2</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M5 6h14v13H5z M8 10h8 M8 14l2 2 4-4"/></svg>
      </span>
      <strong>Intégrité et restauration isolée</strong>
      <span>Consignez le périmètre du contrôle, exécutez restore --verify dans un autre emplacement et comparez les fichiers et les empreintes attendus avant d’examiner la rétention et prune.</span>
    </li>
    <li>
      <span class="article-diagram__symbol">
        <span aria-hidden="true">3</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M5 8h14v12H5z M8 8V5h8v3 M9 14h.01 M12 14h.01 M15 14h.01"/></svg>
      </span>
      <strong>Reprise après sinistre complète</strong>
      <span>Le démarrage de toutes les applications, les données dépendantes et la récupération des identifiants stockés séparément restent non vérifiés. Le délai de reprise et la perte de données admissible ne sont pas mesurés.</span>
    </li>
  </ol>
</figure>

## Ajout du 6 octobre 2026 : verrous obsolètes et concurrence lors des tests de restauration

Une modification supplémentaire vérifie l’activité des processus sur le même hôte avant d’exécuter le déverrouillage standard de restic, qui ne traite que les verrous obsolètes. L’option qui supprimerait tous les verrous, y compris ceux d’opérations actives, n’est pas utilisée. Les conflits donnent lieu à un nombre limité de nouvelles tentatives avec <code>--retry-lock</code> ; les tests de restauration et prune ne relancent pas indéfiniment le processus en cas d’échec. Vérifier l’activité sur un hôte ne prouve pas qu’aucune opération concurrente n’a lieu depuis un autre hôte.

Les données sont extraites avec <code>restore --verify</code> dans un répertoire temporaire isolé. Après vérification des fichiers nécessaires et de leur intégrité, la correspondance entre l’instantané vérifié et la configuration est consignée. La restauration des données visées est confirmée en premier, puis les éléments à conserver sont revus avant prune. La fraîcheur des sauvegardes est évaluée à partir d’un instantané réellement réussi, et non du démarrage du processus ou de ses nouvelles tentatives.

La restauration vérifiée des données visées reste distincte d’une récupération complète incluant le démarrage de toutes les applications et la récupération des identifiants. Pour le traitement des fenêtres de maintenance et des échecs de collecte, consultez aussi [Surveillance et investigation des incidents](/insights/openclaw-monitoring-investigation/).
