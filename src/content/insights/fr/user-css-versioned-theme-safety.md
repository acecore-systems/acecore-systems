---
title: "Gérer en sécurité le CSS utilisateur et les thèmes publics"
description: "Présentation générale de la modification de profils avec une interface graphique et du CSS écrit à la main. Cet article traite des limites autorisées, des brouillons et versions publiées, des versions immuables ainsi que du retrait et de la suspension des thèmes."
date: "2026-10-06T01:10:00+09:00"
author: gui
image: /images/insights/user-css-versioned-theme-safety.webp
tags: ["CSS", "Security", "Web"]
callout:
  type: note
  title: "Vérifier l’implémentation ne vaut pas une recette complète par les utilisateurs"
  text: "Ce cas anonymisé couvre l’implémentation, une modification de base de données, la mise en production et l’affichage de données de test. Au moment de la vérification, aucun thème n’était public. La soumission et l’application de bout en bout par de vrais utilisateurs, ainsi que les ventes payantes, n’ont pas été démontrées."
---

Un éditeur de profil qui permet d’ajuster les couleurs et les espacements dans une interface graphique, avec la possibilité d’écrire une syntaxe CSS limitée, doit prendre en compte à la fois l’ergonomie et la sécurité du code affiché sur les pages publiques. Ce cas anonymisé aide à séparer la modification de la distribution.

## Limiter le CSS à une grammaire réduite

N’insérez pas directement du CSS arbitraire dans une page publique. Analysez sa syntaxe et n’autorisez que les composants, propriétés et valeurs pris en charge. L’implémentation actuelle se limite volontairement à une petite grammaire ; l’édition plus libre du CSS reste une demande supplémentaire non terminée. Ce cas autorise certaines classes et un ensemble restreint de pseudo-classes, tout en rejetant les URL externes, les règles at, les sélecteurs d’attribut sans restriction, les délimiteurs HTML et un nombre excessif de règles.

Limitez le CSS accepté à une zone de profil définie, régénérez-le et validez-le de nouveau avant publication. Conservez les réglages de l’interface et le texte écrit à la main pour la modification, mais ne figez dans l’instantané public que le CSS validé. Le simple fait de délimiter une zone ne rend pas sûr n’importe quel CSS. Consultez la [spécification W3C Selectors](https://www.w3.org/TR/selectors-4/) pour les principes des sélecteurs.

## Séparer l’aperçu, le brouillon et la publication

Essayer ou appliquer un thème modifie un brouillon. La page publique ne change qu’après sa publication par son propriétaire. La possibilité de modifier à nouveau le CSS écrit à la main ne signifie pas non plus que son texte source est envoyé aux visiteurs. Détectez les conflits d’enregistrement et rendez les nouvelles tentatives idempotentes afin qu’une même opération ne mette pas à jour deux fois une version ou un brouillon.

## Ne pas laisser la mise à jour d’un autre auteur modifier un thème actif

Séparez les informations modifiables de la liste des thèmes de leurs versions immuables. L’utilisateur importe un ID de version précis : la publication d’une nouvelle version par l’auteur ne change donc pas silencieusement un brouillon ni un thème déjà publié. Conservez la source, la version et l’attribution de licence après modification. Si un profil public devient privé, le nom ou l’image du brouillon de l’auteur ne doit pas se retrouver dans le thème distribué.

## Distinguer le retrait de la liste d’une suspension opérationnelle

Le retrait d’un thème par son auteur peut empêcher sa découverte et son application à l’avenir sans nécessairement révoquer une version déjà épinglée. La suspension opérationnelle d’un thème dangereux exige une autre limite : cesser de servir son CSS, y compris celui des instantanés existants, et revenir à l’apparence standard. Après la restauration d’un ancien instantané, vérifiez l’état actuel de suspension afin que le CSS antérieur à la suspension ne réapparaisse pas.

## Vérifications avant publication

Testez les sélecteurs hors périmètre, les requêtes externes, la taille des entrées, les conflits d’enregistrement, les nouvelles tentatives, le passage du profil de l’auteur en privé, le retrait, la suspension opérationnelle et la restauration. Le code, la mise en production et l’affichage des données de test ont été vérifiés, mais cela ne constitue pas un test de bout en bout où un utilisateur réel soumet un thème et où une autre personne l’applique. Les conditions de licence ne peuvent pas non plus garantir que le CSS envoyé au navigateur ne sera jamais copié.

Pour la saisie dans l’éditeur, consultez [Les limites des brouillons lors de l’importation de profils](/fr/insights/profile-import-draft-boundaries/) ; pour l’exploitation du CMS, consultez le [guide de Sveltia CMS](/fr/insights/cms-selection-and-turnstile/).
