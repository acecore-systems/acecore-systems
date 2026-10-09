---
title: "Empêcher l’IA de promettre ce qu’elle ne peut pas tenir"
description: "Comment éviter qu’un assistant d’information promette de lui-même la participation, la disponibilité ou le suivi d’un membre de l’équipe. L’article traite de l’état de la conversation, des échecs de récupération, des anciens brouillons et des conversations closes."
date: "2026-10-06T01:10:00+09:00"
lastUpdated: "2026-10-09T15:00:00+09:00"
author: gui
image: /images/insights/covers/ai-reply-capability-guardrails-cover-v1.webp
tags: ["AI", "Security", "Web"]
callout:
  type: note
  title: "Cas généralisé ; aucune conversation précise n’est publiée"
  text: "Ce cas couvre des changements de politique et de classification, des contrôles avant envoi, des tests, une mise en production et une observation opérationnelle limitée. Il ne contient ni publications ni comptes d’autres personnes et ne démontre pas qu’on peut empêcher toute formulation de promesse erronée."
---

Pour l’orientation ou le support, distinguez l’explication d’informations publiques, le transfert à une personne et la réservation effective. [OWASP: Excessive Agency](https://genai.owasp.org/llmrisk/llm062025-excessive-agency/) aide à définir actions autorisées et approbation. La suite traite des limites des réponses, sans procédure d’envoi automatisé propre à une plateforme.

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

<figure class="article-diagram" data-layout="branches" data-tone="violet" data-count="3" aria-labelledby="diagram-ai-reply-capability-guardrails">
  <figcaption>
    <strong id="diagram-ai-reply-capability-guardrails">Vérifier les preuves et la capacité avant de répondre</strong>
    <span>Le contexte de la conversation détermine s’il faut répondre ou suspendre. Le fonctionnement en production de l’arrêt de récupération n’est pas confirmé.</span>
  </figcaption>
  <ol class="article-diagram__nodes">
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">1</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M5 5h14v11H9l-4 4V5Z"/><path d="M8 9h8M8 12h5"/></svg></span>
      <strong>Lire l’interlocuteur et la demande</strong>
      <span>Vérifiez s’il s’agit d’une invitation ou d’un intérêt, la version concernée et l’état de la conversation.</span>
    </li>
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">2</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/></svg></span>
      <strong>Répondre avec des preuves</strong>
      <span>Dire uniquement ce qui peut être fait, puis revérifier juste avant l’envoi.</span>
    </li>
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">3</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg></span>
      <strong>Mettre en attente en cas de doute</strong>
      <span>Ne pas considérer une récupération échouée ou invalide comme consultée ; transférer à une personne. Limiter l’attente et éviter les doublons.</span>
    </li>
  </ol>
</figure>

## Ce qui a été vérifié et ce qui reste à démontrer

La classification et les contrôles avant envoi ont été révisés, des tests de régression ont été exécutés, les brouillons générés ont été examinés et une observation opérationnelle limitée a suivi la mise en production. Cela ne démontre pas la sécurité pour toutes les conversations, reformulations ou évolutions du modèle. Un envoi externe exige aussi une autorisation et une approbation opérationnelles, en plus des contrôles de contenu. La condition d’arrêt de récupération décrite plus haut a été revue dans le code et dans un PR ; son fonctionnement en production reste à vérifier.

Pour les limites des entrées de recherche, consultez [Synchroniser en sécurité le HTML public avec Vectorize](/fr/insights/cloudflare-vectorize-safe-implementation/) ; pour le rendu, consultez [Afficher en sécurité les liens Markdown des réponses de chat IA](/fr/insights/ai-chat-markdown-link-safety/).
