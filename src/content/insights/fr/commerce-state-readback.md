---
title: "Relire et rapprocher les états des systèmes e-commerce : distinguer produits, expéditions et examen des annonces"
description: "Découvrez comment vérifier séparément les états de la base de données de la boutique, du fabricant et de Merchant Center, sans confondre l’acceptation d’un envoi avec la publication, l’expédition ou la diffusion d’annonces."
date: "2026-11-17T12:00:00+09:00"
author: gui
image: /images/insights/covers/cloudflare-payment-event-boundaries-cover-v1.webp
tags: ["E-commerce", "API", "Exploitation"]
---

Dans le commerce en ligne, l’enregistrement des produits, les commandes auprès du fabricant, la livraison et l’envoi des informations produit à des services externes suivent des processus distincts. Un enregistrement de réussite dans un système ne suffit pas à établir l’état actuel des autres. Voici comment aborder leur rapprochement par lecture.

<figure class="article-diagram" data-layout="flow" data-tone="blue" data-count="3" aria-labelledby="diagram-commerce-state-readback">
  <figcaption><strong id="diagram-commerce-state-readback">Relire et rapprocher les états des systèmes e-commerce : distinguer produits, expéditions et examen des annonces</strong><span>Découvrez comment vérifier séparément les états de la base de données de la boutique, du fabricant et de Merchant Center, sans confondre l’acceptation d’un envoi avec la publication, l’expédition ou la diffusion d’annonces.</span></figcaption>
  <ol class="article-diagram__nodes">
    <li><strong>Boutique</strong><span>Lire les enregistrements des produits et des commandes.</span></li>
    <li><strong>Fabrication et expédition</strong><span>Rapprocher les états des commandes et des expéditions chez le fabricant.</span></li>
    <li><strong>Examen des produits</strong><span>Distinguer l’acceptation de l’envoi de l’état après traitement.</span></li>
  </ol>
</figure>

## Vérifier séparément chaque état

| Système à vérifier | Éléments à examiner                                           | Ce que cette vérification ne permet pas d’établir à elle seule         |
| ------------------ | ------------------------------------------------------------- | ---------------------------------------------------------------------- |
| Boutique           | Paramètres de publication, état des produits et des commandes | Traitement par le fabricant ou achèvement de la livraison              |
| Fabricant          | État des commandes, de la fabrication et des expéditions      | Affichage sur la boutique ou diffusion des annonces                    |
| Merchant Center    | État des produits et problèmes après l’envoi                  | Possibilité d’achat sur la boutique ou affichage effectif des annonces |

Pour le rapprochement, utilisez des identifiants et des versions désignant le même élément, et consignez la date et l’heure de récupération ainsi que les échecs de récupération. Si la récupération échoue, laissez l’état non vérifié et ne considérez pas une ancienne réussite comme l’état actuel. Les [requêtes Cloudflare D1](https://developers.cloudflare.com/d1/best-practices/query-d1/) et la [documentation de l’API Printful](https://developers.printful.com/docs/edm/) constituent respectivement des points de départ pour vérifier les données et les informations du fabricant.

## Acceptation de l’envoi et relecture après traitement

Dans notre intégration interne avec Merchant, nous vérifions si la version dont l’envoi a été accepté correspond à la version et aux attributs des informations produit relues ultérieurement. Des divergences ont été constatées malgré l’acceptation. Nous avons donc ajouté un diagnostic qui consigne des motifs prédéfinis, par exemple l’absence de l’élément, une différence de version ou une différence d’attributs. Les valeurs des attributs produit et les identifiants d’authentification ne figurent pas dans les journaux de diagnostic.

L’acceptation ne garantit ni la concordance après traitement ni la diffusion des annonces. La documentation sur la [gestion des produits dans Google Merchant API](https://developers.google.com/merchant/api/guides/products/overview) permet de vérifier comment sont traités les produits envoyés et les informations après traitement. La publication d’un produit sur la boutique et l’examen externe du produit ou l’affichage des annonces nécessitent également des vérifications distinctes.

## Ne pas répéter une écriture dont le résultat est inconnu

Si la réponse à une création ou à un envoi est perdue, supposer un échec et renvoyer la demande peut créer des doublons. Vérifiez d’abord l’état en lisant l’élément concerné et son historique ; si vous ne pouvez pas le déterminer, mettez l’opération en attente. Lors du rapprochement des expéditions, ne publiez pas dans les journaux accessibles publiquement de commandes réelles ou d’informations de suivi contenant des données personnelles : seules les personnes responsables qui en ont besoin doivent les consulter. Testez d’abord les 4 cas suivants avec des commandes fictives : traitement normal, retard, données non récupérées et divergence. Date de vérification : 2026-11-17.
