---
title: "Importer un profil comme brouillon : comparer, choisir et publier avec discernement"
description: "Une mise en œuvre générique pour importer un profil depuis du texte, un CSV, du HTML statique ou un JSON commun. Elle explique la comparaison des valeurs actuelles, le remplacement sélectif ou l’annulation, et la séparation entre enregistrement et publication."
date: "2026-10-06T01:10:00+09:00"
lastUpdated: "2026-10-09T15:00:00+09:00"
author: gui
image: /images/insights/covers/profile-import-draft-boundaries-cover-v1.webp
tags: ["Web", "Import", "Security"]
callout:
  type: note
  title: "Mise en œuvre vérifiée ; réception sur un compte réel en attente"
  text: "L’importation de texte, CSV, HTML statique et JSON commun a été mise en œuvre, intégrée et déployée en production. La réception complète, de l’importation à l’enregistrement et à la publication sur un compte réel, reste à faire. La récupération automatique depuis les URL propres aux services et la migration d’images ou d’audio ne font pas partie du périmètre achevé."
---

Lorsqu’on transfère un profil existant vers un autre éditeur, il faut comparer les valeurs actuelles aux données candidates avant tout remplacement. Cet exemple anonymisé décrit les limites entre l’importation et la publication d’un profil.

## Tester la conservation des retouches avec une biographie

Modifiez manuellement la biographie, puis importez un autre texte candidat. Vérifiez conservation des champs non sélectionnés, possibilité de revoir les remplacements et restauration après annulation. Comparez ensuite brouillon et page publique : l’import seul ne doit pas modifier la publication.

[OWASP：Valider format, valeurs et longueur des entrées](https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html)

## Définir d’abord les formats d’entrée pris en charge

En plus des formats initiaux — texte, CSV et HTML statique — le parcours lit maintenant un fichier JSON commun et propose un modèle à télécharger. Analyser un texte collé ou un fichier ne revient pas à visiter une URL pour en récupérer le contenu. Les formats d’export propres aux services, la récupération automatique par URL, la migration d’images ou d’audio, les pages dynamiques et les API de services externes ne sont pas terminés.

Traitez le HTML comme une donnée d’entrée : n’exécutez pas ses scripts et ne rendez pas le HTML importé lui-même sur la page publique. Limitez la longueur du texte, les champs, les liens et les formats d’entrée, puis convertissez la source en propositions textuelles adaptées au profil.

## Examiner les propositions avant de remplacer les valeurs existantes

Ne publiez pas immédiatement le résultat de l’analyse ; comparez-le d’abord aux valeurs actuelles. La personne propriétaire choisit les champs un par un et peut modifier les propositions avant de les appliquer à l’éditeur. Un champ choisi remplace sa valeur actuelle : il faut donc vérifier les différences à chaque importation. La modification peut aussi être annulée. Ces commandes ne garantissent pas la résolution automatique des conflits avec des modifications faites sur un autre écran ou par une autre personne.

## Distinguer le JSON commun de la prise en charge de chaque service

L’interface affiche l’état de prise en charge de 7 services d’activité. La lecture de données au format commun ne signifie pas que le profil peut être récupéré directement depuis l’URL de chaque service. Pour les URL non prises en charge, elle propose de coller le contenu. L’affichage de l’état des 7 services ne signifie pas que des exports dédiés ou des intégrations API existent pour chacun.

Des données synthétiques ont servi à vérifier l’import JSON, la comparaison avec les valeurs existantes, l’application des champs choisis, l’annulation et l’affichage sur mobile. La réception complète, de l’importation à l’enregistrement et à la publication sur un compte réel, doit être vérifiée séparément.

## Ne pas déduire des qualifications ou des droits du texte importé

Les formulations d’une biographie ou d’une page externe ne prouvent pas à elles seules une qualification, une affiliation, une catégorie ou une licence. Distinguez les textes descriptifs importables comme propositions des informations qui exigent une vérification d’identité ou une demande. Si les informations externes changent, le profil confirmé par son propriétaire n’est ni modifié ni publié automatiquement.

## Garder l’enregistrement et la publication comme deux décisions

Appliquer les propositions importées, enregistrer le brouillon et mettre à jour la version publique sont des actions distinctes. La réception doit aussi couvrir les conflits d’enregistrement ; une sauvegarde réussie ne signifie pas que le profil est publié. Avant de rendre publics des liens, y compris les URL du calendrier public, demandez au propriétaire de vérifier les valeurs exposées et gardez les notes privées hors des données publiques.

## Mise à jour associée : ouvrir les liens HTTPS des événements du calendrier public

Une évolution distincte de l’importation ajoute des liens HTTPS aux événements du calendrier public. Un événement ouvre directement sa destination dans un nouvel onglet ; sans URL, il reste affiché sans lien actionnable. Validez le format de l’URL, refusez les identifiants intégrés et limitez la longueur de l’entrée. Ajoutez **noopener noreferrer** et indiquez l’ouverture d’un nouvel onglet dans le nom accessible.

Les formulaires associés suppriment aussi le champ de titre superflu des créneaux de disponibilité pour collaborer et les champs de notes privées. Les changements de base de données, la CI, le déploiement en production et les écrans utilisant des données de vérification ont été contrôlés. La réception par une personne propriétaire qui se connecte, enregistre un événement réel et le publie reste non vérifiée.

<figure class="article-diagram" data-layout="boundary" data-tone="violet" data-count="2" aria-labelledby="diagram-profile-import-draft-boundaries">
  <figcaption>
    <strong id="diagram-profile-import-draft-boundaries">Limites de l’importation et des liens du calendrier</strong>
    <span>Ce sont des fonctions d’édition distinctes. La validation de l’enregistrement et de la publication par une personne connectée reste non vérifiée.</span>
  </figcaption>
  <ol class="article-diagram__nodes">
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">1</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M6 3h8l4 4v14H6z"/><path d="M14 3v5h5M9 12h6M9 16h4"/></svg></span>
      <strong>Importer le profil</strong>
      <span>La personne examine et modifie les formats pris en charge. Enregistrer et publier sont deux actions distinctes.</span>
    </li>
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">2</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18M14 15h5m-2-2 2 2-2 2"/></svg></span>
      <strong>Lien du calendrier public</strong>
      <span>Ouvrir les liens HTTPS dans un nouvel onglet sécurisé. Les événements sans lien restent non interactifs.</span>
    </li>
  </ol>
</figure>

## Éléments vérifiés et prochaine réception

La mise en œuvre, l’intégration et le déploiement en production de l’importation depuis du texte, un CSV, du HTML statique et un JSON commun sont confirmés. Toutefois, un parcours complet réalisé par une personne réelle, de l’importation et de la modification jusqu’à l’enregistrement et au contrôle du résultat publié, n’a pas été testé. Le projet plus vaste de générer automatiquement un profil complet à partir de l’URL d’un service d’activité n’est pas terminé non plus.

Pour les limites du CSS publié, consultez [CSS utilisateur sûr et thèmes publics versionnés](/insights/user-css-versioned-theme-safety/). Pour les limites de connexion, consultez [Cycle de vie des sessions entre services](/insights/multi-service-session-lifecycle/).
