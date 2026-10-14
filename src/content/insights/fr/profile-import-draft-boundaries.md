---
title: "Importer un profil comme brouillon : comparer, choisir et publier avec discernement"
description: "Importer URL publiques, texte, CSV, HTML et JSON dans un brouillon de profil : médias limités, ordre des liens, conservation après échec de relecture, enregistrement et publication par le titulaire."
date: "2026-10-06T01:10:00+09:00"
lastUpdated: "2026-10-15T00:00:00+09:00"
author: gui
image: /images/insights/covers/profile-import-draft-boundaries-cover-v1.webp
tags: ["Web", "Import", "Security"]
callout:
  type: note
  title: "Mise en œuvre vérifiée ; réception sur un compte réel en attente"
  text: "Les imports de fichiers et de certaines URL, images et pistes audio publiques sont intégrés et déployés. Les contrôles couvrent des interactions synthétiques et certains médias publics. Droits, enregistrement et publication par le titulaire réel, intégrations officielles et réponses 429 restent des travaux distincts inachevés."
---

Lorsqu’on transfère un profil existant vers un autre éditeur, il faut comparer les valeurs actuelles aux données candidates avant tout remplacement. Cet exemple anonymisé décrit les limites entre l’importation et la publication d’un profil.

## Tester la conservation des retouches avec une biographie

Modifiez manuellement la biographie, puis importez un autre texte candidat. Vérifiez conservation des champs non sélectionnés, possibilité de revoir les remplacements et restauration après annulation. Comparez ensuite brouillon et page publique : l’import seul ne doit pas modifier la publication.

[OWASP：Valider format, valeurs et longueur des entrées](https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html)

## Définir d’abord les formats d’entrée pris en charge

Texte, CSV, HTML statique, JSON commun et modèles sont complétés par la récupération depuis les URL de profils publics prises en charge. Le HTML est analysé comme donnée : scripts et balisage original ne sont pas exécutés sur la page publique. Longueur, nombre, format et liens HTTPS sont contrôlés.

Les liens gardent leur ordre et les parenthèses équilibrées dans les URL. Une URL dans un lien Markdown ne devient pas deux candidats, mais une répétition ailleurs reste distincte. Le titulaire décide du traitement de l’ordre et des doublons.

## Examiner les propositions avant de remplacer les valeurs existantes

Ne publiez pas immédiatement le résultat de l’analyse ; comparez-le d’abord aux valeurs actuelles. La personne propriétaire choisit les champs un par un et peut modifier les propositions avant de les appliquer à l’éditeur. Un champ choisi remplace sa valeur actuelle : il faut donc vérifier les différences à chaque importation. La modification peut aussi être annulée. Ces commandes ne garantissent pas la résolution automatique des conflits avec des modifications faites sur un autre écran ou par une autre personne.

Si la relecture de la même URL ou du même fichier échoue, conserver candidats, modifications, sélections, correspondances CSV et médias téléchargés. Afficher l’erreur et préciser qu’il s’agit des candidats précédents. Les remplacer après changement de source, méthode, texte ou fichier, ou après une relecture réussie. Leur conservation ne les applique, enregistre ni publie.

## Distinguer récupération par URL et intégration officielle

La récupération se limite aux structures publiques connues de Profcard, lit.link, POTOFU, HTML Meishi et foriio. Vérifier identité, exclusions d’indexation et cohérence des candidats, sans étendre aux pages authentifiées ni aux destinations interdites. Cela ne prouve ni connexion ou API officielle, ni migration complète.

Le modèle JSON commun et les capacités par service restent disponibles. Les URL non prises en charge et contenus dynamiques utilisent le collage ou les fichiers. Les réponses 401, 403 ou 429 arrêtent la récupération, sans contourner les restrictions par un autre navigateur ou une API.

[OWASP : Limiter destinations et redirections contre SSRF](https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html)

## Examiner l’image ou écouter l’audio récupéré avant sélection

Outre les images de profil GIF, des cartes de liens et publications connues fournissent images et titres d’œuvres. Les liens autorisés du titulaire vers des images, WAV et MP3 GitHub et les fichiers publics individuels Dropbox ont un support limité. Les cartes du HTML initial POTOFU sont couvertes ; descriptions, pages supplémentaires, lecteurs intégrés et galerie foriio restent hors du périmètre terminé.

Recontrôler source et candidat, host, path, redirections, MIME, contenu réel, taille et délai. Le titulaire examine les mêmes données et confirme droits, titre et description. Seules les pièces choisies rejoignent les œuvres non enregistrées, sont préparées via l’upload existant puis enregistrées normalement. Titulaire, profil, type et état ready sont revérifiés, avec conservation des saisies manuelles et du snapshot public.

<figure class="article-diagram" data-layout="flow" data-tone="violet" data-count="4" aria-labelledby="diagram-profile-import-draft-boundaries">
  <figcaption>
    <strong id="diagram-profile-import-draft-boundaries">Limites entre récupération, sélection, enregistrement et publication</strong>
    <span>Une relecture échouée conserve les candidats précédents. Importer ne modifie pas le snapshot public.</span>
  </figcaption>
  <ol class="article-diagram__nodes">
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">1</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M5 3h10l4 4v14H5z"/><path d="M15 3v5h5M8 12h8M8 16h6"/></svg></span>
      <strong>Lire les entrées limitées</strong>
      <span>Contrôler URL, formats et restrictions.</span>
    </li>
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">2</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5M8 10l2 2 3-4"/></svg></span>
      <strong>Comparer et choisir</strong>
      <span>Examiner les médias et garder les modifications.</span>
    </li>
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">3</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/></svg></span>
      <strong>Enregistrer le brouillon</strong>
      <span>Enregistrer champs choisis et pièces préparées.</span>
    </li>
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">4</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M6 4v6a3 3 0 0 0 3 3h6a3 3 0 0 1 3 3v4"/><path d="M18 4v3a3 3 0 0 1-3 3H9a3 3 0 0 0-3 3v7"/></svg></span>
      <strong>Le titulaire publie</strong>
      <span>Actualiser le snapshot par une autre action.</span>
    </li>
  </ol>
</figure>

## Ne pas déduire des qualifications ou des droits du texte importé

Les formulations d’une biographie ou d’une page externe ne prouvent pas à elles seules une qualification, une affiliation, une catégorie ou une licence. Distinguez les textes descriptifs importables comme propositions des informations qui exigent une vérification d’identité ou une demande. Si les informations externes changent, le profil confirmé par son propriétaire n’est ni modifié ni publié automatiquement.

## Garder l’enregistrement et la publication comme deux décisions

Appliquer les propositions importées, enregistrer le brouillon et mettre à jour la version publique sont des actions distinctes. La réception doit aussi couvrir les conflits d’enregistrement ; une sauvegarde réussie ne signifie pas que le profil est publié. Avant de rendre publics des liens, y compris les URL du calendrier public, demandez au propriétaire de vérifier les valeurs exposées et gardez les notes privées hors des données publiques.

## Mise à jour associée : ouvrir les liens HTTPS des événements du calendrier public

Une évolution distincte de l’importation ajoute des liens HTTPS aux événements du calendrier public. Un événement ouvre directement sa destination dans un nouvel onglet ; sans URL, il reste affiché sans lien actionnable. Validez le format de l’URL, refusez les identifiants intégrés et limitez la longueur de l’entrée. Ajoutez **noopener noreferrer** et indiquez l’ouverture d’un nouvel onglet dans le nom accessible.

Les formulaires associés suppriment aussi le champ de titre superflu des créneaux de disponibilité pour collaborer et les champs de notes privées. Les changements de base de données, la CI, le déploiement en production et les écrans utilisant des données de vérification ont été contrôlés. La réception par une personne propriétaire qui se connecte, enregistre un événement réel et le publie reste non vérifiée.

## Éléments vérifiés et prochaine réception

Implémentation, CI et déploiement couvrent URL limitées, GIF, images d’œuvres et audio. Des éditions et annulations synthétiques et certains fichiers publics ont été vérifiés. Le profil source POTOFU renvoie toujours 429 ; télécharger un fichier CDN ne prouve pas récupérer le profil. L’acceptation réelle des droits à l’enregistrement et la publication reste incomplète. Vérifié le 14 octobre 2026.

Pour les limites du CSS publié, consultez [CSS utilisateur sûr et thèmes publics versionnés](/insights/user-css-versioned-theme-safety/). Pour les limites de connexion, consultez [Cycle de vie des sessions entre services](/insights/multi-service-session-lifecycle/).
