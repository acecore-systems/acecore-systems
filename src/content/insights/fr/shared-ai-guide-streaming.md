---
title: "Relier les guides IA des sites et afficher les réponses progressivement"
description: "Retour sur le raccordement des guides IA des sites publics à un traitement partagé et sur l’affichage progressif des réponses."
date: 2026-09-25T12:00
author: gui
image: https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=400&fit=crop&q=80
tags: ["Technology", "AI", "Cloudflare", "Websites"]
---

## Des entrées propres à chaque site, un traitement partagé

Les sites publics d’Acecore proposent des guides IA pour orienter les visiteurs vers les pages et les contacts utiles. En août 2026, les guides d’Acecore et des sites spécialisés ont évolué vers un traitement commun côté serveur. Chaque site garde ses questions et destinations; une API de même origine transmet les demandes à un Worker partagé. Alpha d’Aceserver utilise un autre service partagé entre le portail et le Wiki.

## Distinguer texte provisoire et réponse finale

Avec SSE, le texte apparaît progressivement dans le même message. Pendant la génération, il reste en texte brut; les liens validés ne sont rendus qu’à la fin. Une sortie inachevée du modèle n’est donc pas traitée comme du HTML fiable. L’ancienne réponse JSON reste compatible.

## Renvoyer aux sources officielles

Sur le site public de Systems, nous avons vérifié le guide et une réponse menant au contact. L’interface demande de ne pas saisir de données personnelles ou confidentielles. Tarifs et contrats doivent être confirmés sur les pages officielles et auprès de l’équipe. L’[ancien article de conception](/insights/astro-ai-contact-chat/) décrit juin 2026; les évolutions sont documentées pour [Acecore](https://github.com/acecore-systems/acecore-net/pull/240), [Systems](https://github.com/acecore-systems/acecore-systems/pull/58), [le portail](https://github.com/acecore-systems/aceserver-portal/pull/111) et [le Wiki](https://github.com/acecore-systems/aceserver-wiki/pull/81).
