---
title: "CSS utilisateur et thèmes publics sûrs : source partagée, rendu cloisonné et versions figées"
description: "Un modèle anonymisé de modification de profil où l’interface graphique et l’édition directe partagent une même source de CSS. L’article traite d’une syntaxe CSS étendue dans un périmètre de rendu, des brouillons et versions publiées, des versions immuables de thèmes, du retrait et de la suspension opérationnelle."
date: "2026-10-06T01:10:00+09:00"
lastUpdated: "2026-10-06T08:52:00+09:00"
author: gui
image: /images/insights/covers/user-css-versioned-theme-safety-cover-v1.webp
tags: ["CSS", "Security", "Web"]
callout:
  type: note
  title: "La vérification de l’implémentation ne vaut pas une recette de bout en bout par les utilisateurs"
  text: "La modification de base de données, la mise en production et l’affichage avec des données de test du magasin de thèmes à versions figées ont été confirmés. L’extension qui partage la source de CSS avec l’interface graphique a été confirmée intégrée dans main avec la CI réussie ; dans le périmètre de cet audit, sa mise en production et sa recette avec une session ouverte ne sont pas confirmées. La soumission et l’application de thèmes de bout en bout par de vrais utilisateurs, ainsi que des ventes payantes, n’ont pas été démontrées."
---

Un éditeur de profil qui permet d’ajuster les couleurs et les espacements dans une interface graphique et de modifier toute la mise en page avec du CSS doit tenir compte à la fois de l’ergonomie et de la sécurité du code affiché sur les pages publiques. Ce cas anonymisé présente les limites entre modification et distribution.

## Partager une même source de CSS entre l’interface graphique et l’édition directe

Dans une extension ultérieure, le CSS complet est devenu la source de vérité du thème et l’interface graphique a été modifiée pour éditer les mêmes déclarations CSS. Les commentaires écrits à la main, les déclarations que l’interface ne gère pas et les règles responsives sont conservés. L’ancien format avec paramètres de l’interface et CSS supplémentaire est également repris dans une feuille de style complète modifiable. Modifier uniquement les paramètres auxiliaires qui servent à afficher une liste d’options ne signifie pas que le CSS de rendu a changé.

Les extensions backend et frontend ont chacune été intégrées dans leur branche main ; la CI et les tests d’implémentation ont été vérifiés. Dans le périmètre de cet audit, cela ne prouve ni la mise en production ni un parcours de bout en bout testé par un utilisateur connecté.

## Prendre en charge une syntaxe CSS étendue dans le périmètre de rendu

Les limites initiales fondées sur une petite liste de propriétés autorisées ont été élargies pour prendre en charge Grid, Flex, les variables, les dégradés, les pseudo-éléments, les transformations, les animations et des règles comme @media, @supports et @container. Cela ne signifie pas que du CSS arbitraire est inséré sans contrôle. L’arbre syntaxique est analysé et chaque branche de sélecteur est limitée aux descendants de la région de profil désignée. La même frontière s’applique à l’intérieur des règles conditionnelles ; les commandes d’exploitation et les badges de licence à l’extérieur ne font pas partie du thème. [W3C Selectors](https://www.w3.org/TR/selectors-4/) est un point de départ pour consulter la spécification des sélecteurs.

Les noms de variables et de keyframes sont remplacés par des noms uniques dans le CSS publié afin d’éviter les conflits avec les variables de l’interface extérieure ou les animations d’un autre thème. Les noms d’origine restent disponibles pour l’édition. Le wrapper de rendu extérieur utilise aussi containment et isolation pour limiter les effets des règles de mise en page étendues à la région de profil.

La récupération de ressources externes, les règles globales comme @import et @font-face, la syntaxe impossible à analyser, CSS nesting, la balise de fermeture style du HTML et les références d’animation dont les noms ne peuvent pas être résolus de façon sûre sont refusés. La taille de l’entrée et celle du résultat généré sont également contrôlées. Lors de la publication et du chargement d’un snapshot, la cohérence du périmètre, des noms uniques et de la chaîne CSS canonical validée est vérifiée à nouveau. Prendre en charge une syntaxe étendue ne garantit pas un rendu identique dans tous les navigateurs.

## Séparer l’aperçu, le brouillon et la publication

Essayer ou appliquer un thème modifie un brouillon. La page publique ne change qu’après publication par son propriétaire. Pouvoir modifier à nouveau le CSS écrit à la main ne signifie pas non plus que ce texte d’origine est transmis aux visiteurs. Le contrat d’enregistrement détecte les conflits et empêche une nouvelle tentative de dupliquer une version ou une mise à jour du brouillon.

## Empêcher la mise à jour d’un autre auteur de modifier un design actif

Les informations modifiables de la fiche du thème sont séparées de ses versions immuables. L’utilisateur importe une version précise par son ID ; la publication d’une nouvelle version par l’auteur ne modifie pas automatiquement les brouillons ni les versions publiées existants. L’origine et la version appliquées, ainsi que la source des conditions d’utilisation, restent associées après modification. Si un profil public redevient privé, le nom et l’image du brouillon de l’auteur ne doivent pas fuiter dans le thème distribué.

## Distinguer le retrait de la liste d’une suspension opérationnelle

Le retrait d’un thème par son auteur empêche de nouvelles découvertes et applications, mais ne révoque pas nécessairement immédiatement les utilisations existantes d’une version figée. La suspension opérationnelle d’un thème dangereux a une autre portée : elle arrête la récupération publique et le CSS des snapshots existants, puis rétablit l’apparence standard. Même lors d’un retour à un ancien snapshot, l’état actuel de suspension est vérifié pour ne pas réactiver le CSS antérieur à la suspension.

<figure class="article-diagram" data-layout="flow" data-tone="violet" data-count="3" aria-labelledby="diagram-user-css-versioned-theme-safety">
  <figcaption>
    <strong id="diagram-user-css-versioned-theme-safety">De l’édition CSS à une version figée</strong>
    <span>L’intégration du code, la CI et le déploiement en production de l’ancienne version du Store ont été vérifiés. La recette en production/login de l’extension CSS, son application par des utilisateurs et les ventes payantes restent non vérifiées.</span>
  </figcaption>
  <ol class="article-diagram__nodes">
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">1</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="m8 6-5 6 5 6M16 6l5 6-5 6M14 4l-4 16"/></svg></span>
      <strong>Source CSS partagée</strong>
      <span>L’interface graphique et l’édition directe utilisent la même source CSS et préservent les règles écrites à la main.</span>
    </li>
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">2</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M8 8h8M8 12h5M8 16h8"/></svg></span>
      <strong>Analyser et limiter la portée</strong>
      <span>Prend en charge Grid/Flex, variables, pseudo-éléments, règles responsives et animations. Refuse les entrées externes, globales ou impossibles à analyser.</span>
    </li>
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">3</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/></svg></span>
      <strong>Publier une version explicite</strong>
      <span>Publier une version immuable après aperçu/brouillon. Le retrait de la liste et la suspension opérationnelle sont distincts.</span>
    </li>
  </ol>
</figure>

## Vérifications avant publication

Vérifiez les sélecteurs hors périmètre, les requêtes externes, la taille de l’entrée, les conflits d’enregistrement, les nouvelles tentatives, le passage du profil de l’auteur en privé, le retrait, la suspension opérationnelle et le retour arrière. La mise en production du magasin à versions figées et l’affichage de données de test ont été confirmés, mais dans le périmètre de cet audit la mise en production et la recette avec session ouverte de l’extension d’édition CSS ne sont pas confirmées. Une vérification antérieure a relevé zéro thème public ; ce chiffre ne représente pas le nombre actuel. Les essais de bout en bout où de vrais utilisateurs soumettent et appliquent des thèmes, ainsi que des ventes payantes, n’ont pas été démontrés. Les conditions d’utilisation ne peuvent pas garantir que le CSS livré au navigateur ne sera jamais copié.

Pour l’entrée de modification, consultez [l’importation de profils en brouillon](/insights/profile-import-draft-boundaries/) ; pour l’exploitation du CMS, consultez [le guide Sveltia CMS](/insights/cms-selection-and-turnstile/).
