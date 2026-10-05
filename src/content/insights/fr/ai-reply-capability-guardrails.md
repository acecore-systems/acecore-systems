---
title: "Empêcher l’IA de promettre ce qu’elle ne peut pas tenir"
description: "Comment éviter qu’un assistant d’information promette de lui-même la participation, la disponibilité ou le suivi d’un membre de l’équipe. L’article traite de l’état de la conversation, des échecs de récupération, des anciens brouillons et des conversations closes."
date: "2026-10-06T01:10:00+09:00"
author: gui
image: /images/insights/ai-reply-capability-guardrails.webp
tags: ["AI", "Security", "Web"]
callout:
  type: note
  title: "Cas généralisé ; aucune conversation précise n’est publiée"
  text: "Ce cas couvre des changements de politique et de classification, des contrôles avant envoi, des tests, une mise en production et une observation opérationnelle limitée. Il ne contient ni publications ni comptes d’autres personnes et ne démontre pas qu’on peut empêcher toute formulation de promesse erronée."
---

Même une réponse d’information formulée naturellement ne doit pas promettre qu’un membre de l’équipe prendra contact plus tard ou participera à une heure donnée sans preuve que cette action peut être réalisée. Ce récit généralisé d’un flux interne de réponses ne révèle ni plateforme ni conversation.

## Définir ce que l’assistant peut expliquer et ce qu’il peut faire

Expliquer des informations publiques, confirmer les souhaits d’une personne, et réellement la contacter ou participer sont des capacités différentes. Indiquez le rôle de l’assistant dans ses instructions et appliquez-le aux premières réponses, aux suivis et aux contrôles avant envoi. Un réglage qui augmente l’effort de raisonnement ne donne pas le droit d’agir et ne révèle pas l’agenda d’un membre de l’équipe.

## Utiliser l’état de la conversation, pas seulement les mots-clés

Transmettez la publication d’origine, les échanges récents effectivement confirmés, l’existence d’une réponse déjà fournie, les questions encore en attente et la clôture éventuelle de la conversation. Ne classez pas quelqu’un comme intéressé par une participation sur la seule correspondance d’un mot s’il a exprimé une autre préférence. Une promesse erronée rédigée par une IA précédente ne prouve pas non plus que quelqu’un prévoit d’agir.

## Vérifier qui parle et ce que signifie le message avant l’envoi

« Un membre de l’équipe vous contactera plus tard » est une promesse de la personne censée agir. Une citation de l’autre personne et une indication générale sur un événement ont un autre sens. Au lieu d’interdire partout une suite de caractères, vérifiez le rôle, l’état de la conversation et les preuves de l’action. Suspendez une réponse ambiguë et transmettez-la à une personne si nécessaire. Il faut également empêcher la génération de continuer comme si les sources avaient été consultées lorsque la récupération échoue ou renvoie une réponse invalide. Cette condition d’arrêt côté récupération a été confirmée uniquement dans le code modifié et lors de la revue du PR ; son fonctionnement en production n’a pas été confirmé.

## Ne pas confondre des formulations semblables ou des demandes différentes

Distinguez une publication qui cherche des participants du message d’une personne qui souhaite participer. Des formulations proches ne rendent pas équivalents les produits, les éditions ou les conditions d’utilisation ; ne mélangez pas les indications de différents environnements. Vérifiez aussi avant envoi les remerciements sans fondement et les réponses qui considèrent la personne comme déjà acceptée. Même en donnant la priorité aux réponses, utilisez des attentes limitées en cas de limitation de débit et évitez les doublons. N’enregistrez pas une attente ou une réponse omise comme un envoi réussi.

## Réexaminer les anciens brouillons selon les conditions actuelles

Un brouillon validé à sa création peut devenir obsolète si la conversation ou la politique change. Vérifiez-le à nouveau selon l’état le plus récent juste avant l’envoi et ne transmettez pas les brouillons de conversations closes. Enregistrez séparément l’envoi omis et la clôture, sans les confondre avec un envoi réussi. Il est aussi possible de ne pas répondre lorsqu’une question inutile ne ferait que prolonger l’échange.

## Ce qui a été vérifié et ce qui reste à démontrer

La classification et les contrôles avant envoi ont été révisés, des tests de régression ont été exécutés, les brouillons générés ont été examinés et une observation opérationnelle limitée a suivi la mise en production. Cela ne démontre pas la sécurité pour toutes les conversations, reformulations ou évolutions du modèle. Un envoi externe exige aussi une autorisation et une approbation opérationnelles, en plus des contrôles de contenu. La condition d’arrêt de récupération décrite plus haut a été revue dans le code et dans un PR ; son fonctionnement en production reste à vérifier.

Pour les limites des entrées de recherche, consultez [Synchroniser en sécurité le HTML public avec Vectorize](/fr/insights/cloudflare-vectorize-safe-implementation/) ; pour le rendu, consultez [Afficher en sécurité les liens Markdown des réponses de chat IA](/fr/insights/ai-chat-markdown-link-safety/).
