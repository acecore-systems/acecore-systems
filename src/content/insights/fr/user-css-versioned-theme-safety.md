---
title: "CSS utilisateur et thèmes publics sûrs : source partagée, rendu cloisonné et versions figées"
description: "CSS commun à l’édition visuelle et manuelle, rendu sûr et application immédiate de versions fixes du magasin. Pages et cartes indépendantes, aperçu du titulaire, brouillon et publication."
date: "2026-10-06T01:10:00+09:00"
lastUpdated: "2026-10-15T00:00:00+09:00"
author: gui
image: /images/insights/covers/user-css-versioned-theme-safety-cover-v1.webp
tags: ["CSS", "Security", "Web"]
callout:
  type: note
  title: "La vérification de l’implémentation ne vaut pas une recette de bout en bout par les utilisateurs"
  text: "CSS/GUI, magasin versionné, application immédiate, cibles indépendantes et aperçus du titulaire sont intégrés et déployés, avec affichage public contrôlé. Les tests authentifiés utilisent des profils synthétiques. Consentement, application, enregistrement et publication réels, et ventes payantes, ne sont pas démontrés."
---

Un éditeur de profil qui permet d’ajuster les couleurs et les espacements dans une interface graphique et de modifier toute la mise en page avec du CSS doit tenir compte à la fois de l’ergonomie et de la sécurité du code affiché sur les pages publiques. Ce cas anonymisé présente les limites entre modification et distribution.

## Choisir séparément liberté de style et distribution

Pour l’édition personnelle, testez d’abord confinement et conflits de sauvegarde. La distribution exige aussi IDs fixes, conditions d’usage et apparence standard après suspension. Un petit thème avec Grid et pseudo-éléments permet de vérifier navigation extérieure intacte et versions appliquées stables après mise à jour de l’auteur.

[W3C Selectors：Vérifier la portée des sélecteurs](https://www.w3.org/TR/selectors-4/)

## Partager une même source de CSS entre l’interface graphique et l’édition directe

Dans une extension ultérieure, le CSS complet est devenu la source de vérité du thème et l’interface graphique a été modifiée pour éditer les mêmes déclarations CSS. Les commentaires écrits à la main, les déclarations que l’interface ne gère pas et les règles responsives sont conservés. L’ancien format avec paramètres de l’interface et CSS supplémentaire est également repris dans une feuille de style complète modifiable. Modifier uniquement les paramètres auxiliaires qui servent à afficher une liste d’options ne signifie pas que le CSS de rendu a changé.

L’extension CSS/GUI et des aperçus du titulaire est intégrée, avec CI et déploiement contrôlés. Les tests authentifiés utilisent des profils synthétiques et ne prouvent pas l’édition, l’enregistrement et la publication par un titulaire réel.

## Prendre en charge une syntaxe CSS étendue dans le périmètre de rendu

Les limites initiales fondées sur une petite liste de propriétés autorisées ont été élargies pour prendre en charge Grid, Flex, les variables, les dégradés, les pseudo-éléments, les transformations, les animations et des règles comme @media, @supports et @container. Cela ne signifie pas que du CSS arbitraire est inséré sans contrôle. L’arbre syntaxique est analysé et chaque branche de sélecteur est limitée aux descendants de la région de profil désignée. La même frontière s’applique à l’intérieur des règles conditionnelles ; les commandes d’exploitation et les badges de licence à l’extérieur ne font pas partie du thème. [W3C Selectors](https://www.w3.org/TR/selectors-4/) est un point de départ pour consulter la spécification des sélecteurs.

Les noms de variables et de keyframes sont remplacés par des noms uniques dans le CSS publié afin d’éviter les conflits avec les variables de l’interface extérieure ou les animations d’un autre thème. Les noms d’origine restent disponibles pour l’édition. Le wrapper de rendu extérieur utilise aussi containment et isolation pour limiter les effets des règles de mise en page étendues à la région de profil.

La récupération de ressources externes, les règles globales comme @import et @font-face, la syntaxe impossible à analyser, CSS nesting, la balise de fermeture style du HTML et les références d’animation dont les noms ne peuvent pas être résolus de façon sûre sont refusés. La taille de l’entrée et celle du résultat généré sont également contrôlées. Lors de la publication et du chargement d’un snapshot, la cohérence du périmètre, des noms uniques et de la chaîne CSS canonical validée est vérifiée à nouveau. Prendre en charge une syntaxe étendue ne garantit pas un rendu identique dans tous les navigateurs.

## Séparer essai, enregistrement CSS et application du magasin

Éditer CSS ou GUI, essayer et enregistrer un brouillon modifie la vue d’édition du titulaire. Montrer le CSS enregistré aux visiteurs demande une publication séparée du profil. Détecter les conflits et éviter les doubles mises à jour lors des réessais.

Choisir une version fixe publique disponible, accepter ses conditions et l’appliquer change immédiatement l’apparence d’un profil déjà public. Seul le thème change : le contenu publié est conservé, sans publier textes ou images en cours d’édition. Un profil privé reste privé. Application du magasin et enregistrement du CSS manuel doivent être expliqués séparément.

<figure class="article-diagram" data-layout="boundary" data-tone="violet" data-count="3" aria-labelledby="diagram-user-css-versioned-theme-safety">
  <figcaption>
    <strong id="diagram-user-css-versioned-theme-safety">Effet des éditions CSS et de l’application du magasin</strong>
    <span>Appliquer un thème à un profil public change immédiatement l’apparence de la seule cible choisie.</span>
  </figcaption>
  <ol class="article-diagram__nodes">
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">1</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M5 3h10l4 4v14H5z"/><path d="M15 3v5h5M8 12h8M8 16h6"/></svg></span>
      <strong>Édition CSS/GUI</strong>
      <span>Aperçu personnel et brouillon ; publication séparée.</span>
    </li>
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">2</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5M8 10l2 2 3-4"/></svg></span>
      <strong>Appliquer une version fixe</strong>
      <span>Vérifier version publique et consentement, sans publier un profil privé.</span>
    </li>
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">3</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/></svg></span>
      <strong>Page et annuaire distincts</strong>
      <span>CSS, brouillon et version publique par cible.</span>
    </li>
  </ol>
</figure>

## Séparer page et annuaire et prévisualiser le contenu du titulaire

Page et carte d’annuaire possèdent CSS, brouillon, version publique, provenance et cible de magasin distincts. Un thème de page ne change pas l’annuaire ; les cibles incompatibles et leur modification sont rejetées. Les cartes gardent des dimensions communes et limites adaptatives, testées avec noms et descriptions longs.

Les réglages montrent l’aperçu enregistré du titulaire et le nom du thème, avec choix et édition sur le même écran. Le passage entre édition visuelle et code conserve nom, CSS et version de détection des conflits non enregistrés. Tester le contenu réel en plus des exemples ; enregistrer ne modifie que le brouillon de la cible choisie.

## Empêcher la mise à jour d’un autre auteur de modifier un design actif

Les informations modifiables de la fiche du thème sont séparées de ses versions immuables. L’utilisateur importe une version précise par son ID ; la publication d’une nouvelle version par l’auteur ne modifie pas automatiquement les brouillons ni les versions publiées existants. L’origine et la version appliquées, ainsi que la source des conditions d’utilisation, restent associées après modification. Si un profil public redevient privé, le nom et l’image du brouillon de l’auteur ne doivent pas fuiter dans le thème distribué.

## Distinguer le retrait de la liste d’une suspension opérationnelle

Le retrait d’un thème par son auteur empêche de nouvelles découvertes et applications, mais ne révoque pas nécessairement immédiatement les utilisations existantes d’une version figée. La suspension opérationnelle d’un thème dangereux a une autre portée : elle arrête la récupération publique et le CSS des snapshots existants, puis rétablit l’apparence standard. Même lors d’un retour à un ancien snapshot, l’état actuel de suspension est vérifié pour ne pas réactiver le CSS antérieur à la suspension.

## Vérifications avant publication

Contrôler sélecteurs hors périmètre, requêtes externes, capacité, conflits, réessais, retrait, suspension et retour arrière. Déploiement des versions fixes, CSS/GUI, cibles indépendantes et aperçus, catalogues et cartes réelles ont été vérifiés. Les tests authentifiés sont synthétiques ; consentement, application, enregistrement et publication réels restent à accepter. Les conditions ne garantissent pas d’empêcher toute copie du CSS distribué. Vérifié le 14 octobre 2026.

Pour l’entrée de modification, consultez [l’importation de profils en brouillon](/insights/profile-import-draft-boundaries/) ; pour l’exploitation du CMS, consultez [le guide Sveltia CMS](/insights/cms-selection-and-turnstile/).
