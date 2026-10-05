---
title: "Importer un profil comme brouillon : examen, remplacement et limites de publication"
description: "Une implémentation généralisée de l’import de profil depuis du texte, un fichier CSV ou du HTML statique. Elle explique la comparaison avec les valeurs actuelles, la sélection et le remplacement des champs, la séparation entre enregistrement et publication, ainsi que les entrées non prises en charge."
date: "2026-10-06T01:10:00+09:00"
author: gui
image: /images/insights/profile-import-draft-boundaries.webp
tags: ["Web", "Import", "Security"]
callout:
  type: note
  title: "Périmètre de l’implémentation de l’étape 1"
  text: "L’implémentation, l’intégration et le déploiement en production de l’import depuis du texte, un fichier CSV et du HTML statique ont été confirmés. La recette complète dans un compte réel, de l’import à l’enregistrement et à la publication, reste à effectuer ; la récupération directe par URL et la migration d’images ou d’audio ne font pas partie de cette livraison."
---

Lorsqu’on transfère un profil existant vers un autre éditeur, il faut comparer la valeur actuelle au candidat importé avant de décider d’un remplacement. Ce retour généralisé sur une implémentation de l’étape 1 présente les limites entre import et publication.

## Définir d’abord les formats d’entrée pris en charge

Cette étape prend en charge le texte, les fichiers CSV et le HTML statique. Analyser du contenu collé ou un fichier n’équivaut pas à consulter une URL pour en récupérer le contenu. JSON, images, audio, pages dynamiques et API de services externes ne font pas partie de l’implémentation achevée.

Traitez le HTML uniquement comme une donnée d’entrée : n’exécutez pas ses scripts et ne rendez pas le HTML importé lui-même sur la page publique. Définissez des limites pour la longueur du texte, les champs, les liens et les formats, puis convertissez la source en propositions textuelles utiles au profil.

## Distinguer l’examen des propositions de la modification du profil

Ne publiez pas immédiatement les résultats de l’analyse ; comparez d’abord les valeurs actuelles aux propositions. La personne propriétaire sélectionne les champs individuellement et peut modifier les valeurs proposées avant de les appliquer à l’éditeur. Chaque champ sélectionné remplace sa valeur actuelle ; il faut donc examiner les différences à chaque import. L’action peut être annulée avant l’enregistrement, mais cela ne signifie pas qu’une protection automatique des modifications manuelles ou une fusion des conflits est achevée.

## Ne pas déduire de qualifications ni de droits du texte importé

Une formulation dans une biographie ou sur une page externe ne prouve pas automatiquement une qualification, une affiliation, une catégorie ou une licence. Séparez les descriptions pouvant être importées comme propositions des informations qui nécessitent une vérification d’identité ou une demande. De nouvelles informations externes ne mettent pas automatiquement à jour ni ne publient le profil confirmé par sa personne propriétaire.

## Garder l’enregistrement et la publication comme deux décisions

Appliquer les propositions importées, enregistrer le brouillon et actualiser l’instantané public sont des actions distinctes. Les conflits d’enregistrement doivent encore être couverts par la recette ; un enregistrement réussi ne signifie pas que le profil est publié. Vérifiez les liens, y compris les URL de calendrier public, avant de publier leurs valeurs et ne mélangez pas de notes privées aux données publiques.

## Mise à jour associée : ouvrir des liens HTTPS depuis les événements publics

Une amélioration de l’édition distincte de l’importation permet d’ajouter des liens HTTPS aux événements du calendrier public. L’événement ouvre directement sa destination dans un nouvel onglet ; sans URL, il est affiché sans lien actif. Validez le format, l’absence d’identifiants intégrés et la longueur de l’URL. Ajoutez `noopener noreferrer` et annoncez l’ouverture du nouvel onglet dans le nom accessible.

Les formulaires associés retirent aussi un titre inutile des créneaux disponibles pour collaborer et les champs de notes privées. Les modifications de base de données, la CI, le déploiement en production et l’affichage de données de vérification ont été contrôlés. La connexion du propriétaire, l’enregistrement d’un événement réel et sa publication restent non vérifiés.

## Ce qui a été vérifié et les prochaines étapes de recette

L’implémentation, l’intégration et le déploiement en production du flux d’import de l’étape 1 ont été confirmés. En revanche, le test complet par une personne utilisant réellement le service — import, modification, enregistrement et vérification de l’affichage public — n’a pas été effectué. Le projet plus large de création automatique d’un profil entier depuis l’URL d’une plateforme d’activité n’est pas achevé non plus.

Pour les limites du CSS publié, consultez [CSS utilisateur sûr et thèmes publics versionnés](/insights/user-css-versioned-theme-safety/). Pour celles de la connexion, consultez [Cycle de vie des sessions entre services](/insights/multi-service-session-lifecycle/).
