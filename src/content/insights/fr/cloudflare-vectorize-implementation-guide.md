---
title: "Cloudflare Vectorize et RAG : comprendre la différence entre recherche et réponses IA"
description: "Une courte introduction à la recherche sémantique avec Cloudflare Vectorize et au RAG, qui distingue recherche, preuves et réponses d'IA."
date: 2026-07-31T12:00
author: gui
tags: ["Technologie", "Cloudflare", "Vectorize", "RAG", "Recherche sur le site"]
image: /uploads/acecore-generated/blog-cloudflare-pages-security.webp
callout:
  type: tip
  title: "Le RAG consiste à chercher avant de répondre"
  text: "Vectorize trouve des informations publiques de sens proche. Le RAG utilise les informations sélectionnées comme preuves pour qu'une IA produise une réponse. Vectorize seul, ou un modèle qui répond seul, n'est pas du RAG."
processFigure:
  eyebrow: Principes du RAG
  title: "Quatre étapes d'une question à une réponse fondée sur des preuves"
  description: "Un résultat de recherche n'est pas une réponse : récupérez d'abord la page publique originale avant de l'utiliser comme contexte."
  variant: inline
  steps:
    - title: Préparer les informations publiques
      description: "N'inclure que les pages que les lecteurs peuvent voir."
      icon: i-lucide-file-check-2
      accent: slate
    - title: Chercher par le sens
      description: "Transformer la question en embedding et utiliser Vectorize pour trouver les informations proches."
      icon: i-lucide-search
      accent: brand
    - title: Sélectionner les preuves
      description: "Vérifier la page source, l'URL et l'actualité avant de choisir ce que la réponse peut utiliser."
      icon: i-lucide-list-checks
      accent: amber
    - title: Répondre ou différer
      description: "Générer une réponse seulement avec des preuves suffisantes ; sinon indiquer que cela ne peut pas être confirmé."
      icon: i-lucide-message-square-text
      accent: emerald
linkCards:
  - href: /insights/cloudflare-vectorize-safe-implementation/
    title: Guide détaillé pour implémenter Vectorize en sécurité
    description: "À lire pour les corpus HTML publics, la synchronisation différentielle, la séparation Preview/Production et les limites d'API."
    icon: i-lucide-wrench
  - href: https://developers.cloudflare.com/vectorize/
    title: Documentation officielle de Cloudflare Vectorize
    description: "Consultez les capacités, les embeddings et les conseils de query officiels de Vectorize."
    icon: i-lucide-book-open
  - href: https://developers.cloudflare.com/vectorize/reference/what-is-a-vector-database/
    title: Guide Cloudflare sur les bases vectorielles et le RAG
    description: "Découvrez comment le contexte récupéré par recherche vectorielle peut enrichir le prompt d'un LLM."
    icon: i-lucide-network
---

## D'abord : qu'est-ce que le RAG ?

RAG signifie **Retrieval Augmented Generation**. En termes simples, il s'agit de chercher d'abord des informations pertinentes, puis de laisser une IA générer une réponse à partir de ces informations.

Voyez Vectorize comme le catalogue d'un bibliothécaire qui retrouve des documents de sens proche. Le RAG est le travail complet du bibliothécaire : trouver les documents, lire les sources choisies et répondre en montrant d'où vient l'information.

Au lieu d'envoyer directement une question à un modèle d'IA, on récupère des éléments liés dans ses propres informations publiques et on les ajoute comme contexte. Cloudflare décrit le RAG comme l'utilisation du contexte d'une recherche vectorielle pour enrichir le prompt envoyé à un LLM. [Documentation Cloudflare](https://developers.cloudflare.com/vectorize/reference/what-is-a-vector-database/)

## Vectorize et RAG n'ont pas le même rôle

| Composant | Rôle                                                  | Ce qu'il fait seul                                                  |
| --------- | ----------------------------------------------------- | ------------------------------------------------------------------- |
| Pagefind  | Trouver des mots dans les pages                       | Trouver rapidement noms de produits, noms propres et codes d'erreur |
| Vectorize | Trouver des informations de sens proche               | Renvoyer des candidats pour les reformulations et pages liées       |
| RAG       | Générer une réponse IA à partir de preuves récupérées | Renvoyer une réponse avec des liens vers les pages sources          |

Vectorize ne génère pas de réponse. Le RAG est plus qu'une recherche. C'est le contrat entre récupération, sélection des preuves, génération de réponse et affichage des sources qui permet au lecteur de vérifier une réponse.

## Par où commencer

Il n'est pas nécessaire de créer d'abord un chatbot. Cet ordre est plus facile à comprendre et plus sûr à exploiter.

1. Conserver Pagefind comme parcours de recherche ordinaire.
2. Ajouter Vectorize pour trouver des pages liées et évaluer la qualité de la recherche.
3. Définir les sources autorisées, les liens sources et le comportement lorsque les preuves sont insuffisantes.
4. Ajouter des réponses RAG uniquement lorsque ces conditions peuvent être respectées.

Cette approche permet de valider la qualité de l'information recherchable avant d'optimiser l'apparence des réponses de l'IA.

## Quatre décisions avant le RAG

| Décision                   | Premier choix simple                                                  | Pourquoi                                                                      |
| -------------------------- | --------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| Portée des questions       | Informations publiques du site uniquement                             | Évite d'utiliser des brouillons ou des informations internes dans une réponse |
| Affichage des preuves      | Lier la page originale à chaque réponse                               | Les lecteurs peuvent vérifier la réponse                                      |
| Preuves insuffisantes      | Dire « Je ne peux pas le confirmer »                                  | Évite les suppositions plausibles                                             |
| Séparation de la recherche | Pagefind pendant la saisie ; Vectorize/RAG après une action explicite | Rend clairs l'envoi de données, le coût et l'attente                          |

Le RAG ne rend pas les réponses incorrectes impossibles. La qualité dépend du choix du corpus, de la vérification des preuves et de la définition explicite des cas où il ne faut pas répondre.

## Lire les détails d'implémentation séparément

Cette page explique pourquoi utiliser Vectorize et le RAG. Le corpus HTML public, le content hash, la synchronisation différentielle, la séparation Preview/Production et les rate limits sont dans le [guide détaillé pour implémenter Vectorize en sécurité](/insights/cloudflare-vectorize-safe-implementation/).
