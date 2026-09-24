---
title: "Comment nous avons migré la recherche sémantique de plusieurs sites vers Cloudflare Workers AI"
description: "Retour sur la migration des représentations de recherche des sites publics d'Acecore vers BGE-M3, avec déploiement et évaluation."
date: 2026-09-25T12:00
author: gui
tags: ["Technique", "Cloudflare", "Vectorize", "Recherche"]
image: /images/insights/vectorize-rag-hero.webp
---

Plusieurs sites publics d'Acecore utilisent Cloudflare Vectorize pour retrouver des pages liées à une question, même si ses mots diffèrent de ceux du titre. En août 2026, nous avons migré progressivement le modèle de représentation des requêtes et des pages publiées vers BGE-M3 sur Cloudflare Workers AI.

## Préparer un nouvel index

Changer de modèle change aussi les dimensions des vecteurs. Nous avons créé de nouveaux index au lieu de réutiliser les anciens, synchronisé les données issues des pages publiées et vérifié les identifiants. Nous avons testé de vraies requêtes avant la bascule et conservé les anciens index pour la reprise.

## Évaluer avec des questions réelles

Sur Acecore Systems, nous avons évalué 12 requêtes représentatives. La page attendue arrivait en tête dans 10 cas et figurait parmi les cinq premiers résultats dans les 12 cas. Quatre requêtes sans rapport ont été écartées par le seuil alors en vigueur. Il s'agit d'une petite évaluation de migration, et non d'une garantie pour toutes les futures requêtes.

## Actualiser les informations visibles

Nous avons mis à jour l'interface de recherche et les mentions de confidentialité selon le lieu réel du traitement. La recherche classique par mots clés reste disponible à côté de la recherche sémantique. Nous continuons à vérifier la pertinence, le temps de réponse et la présence exclusive d'informations publiques dans l'index.
