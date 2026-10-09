---
title: "Traiter les webhooks de paiement et de remboursement en toute sécurité : rapprocher les états dans Workers"
description: "Un exemple d’implémentation qui distingue signature, événements dupliqués ou tardifs, état du remboursement et réponses des API externes. Il montre aussi la nouvelle vérification des autorisations avant une action d’administration."
date: "2026-10-06T01:10:00+09:00"
lastUpdated: "2026-10-09T15:00:00+09:00"
author: gui
image: /images/insights/covers/cloudflare-payment-event-boundaries-cover-v1.webp
tags: ["Cloudflare Workers", "Stripe", "Security"]
callout:
  type: note
  title: "Distinguer les preuves d’implémentation des opérations réelles"
  text: "Dans ce cas anonymisé, l’implémentation, les tests, le déploiement en production et le rapprochement en lecture seule avec des API externes ont été vérifiés. Aucun remboursement, aucune annulation ni aucun ajustement de points client n’a été effectué pour les tests ; l’article ne prétend pas vérifier de bout en bout tous les parcours de paiement."
---

Pour les webhooks de paiement sur Workers, testez doublons et événements désordonnés en environnement de test, sans double mise à jour métier. Vérifiez les redirections d’API externes avec [Cloudflare Workers: Request](https://developers.cloudflare.com/workers/runtime-apis/request/) et le runtime, puis consignez séparément réception, confirmation externe et traitements suivants.

La réception d’un événement du prestataire de paiement ne suffit pas à terminer une commande ou un remboursement. Cet exemple anonymisé montre comment un flux d’administration sur Workers rapproche l’état du prestataire et les enregistrements locaux. Les données client, identifiants de transactions réelles et destinations de notification internes sont omis.

## Vérifier la signature et éviter les doublons dès l’entrée

Validez la signature à partir du corps brut et intact de la requête, puis vérifiez le mode production ou test attendu. Enregistrez le traitement de l’événement et prenez un verrou de traitement pour empêcher qu’une nouvelle livraison du même événement répète une opération métier. Cela ne garantit pas l’ordre d’arrivée des événements. Consultez le [guide officiel des webhooks Stripe](https://docs.stripe.com/webhooks).

## Relire l’état actuel du prestataire après un événement de remboursement tardif

Cette implémentation traite `refund.created`, `refund.updated` et `refund.failed`. Pour un remboursement géré, elle récupère l’objet Stripe actuel afin qu’un événement tardif ne fasse pas revenir l’enregistrement local à un état plus ancien. Elle distingue les montants remboursés avec succès de ceux encore en attente avant de décider si une commande est entièrement remboursée.

Elle vérifie le montant, la devise, le PaymentIntent, les métadonnées reliant commande et opération, ainsi que les identifiants déjà enregistrés. Les ID de paiement peuvent commencer par `py_` et les ID de remboursement par `pyr_` ; l’implémentation a été adaptée afin qu’un seul préfixe connu ne fasse pas rejeter une réponse valide. La prise en charge d’un préfixe supplémentaire ne relâche pas les contrôles de montant et d’identité. Les valeurs inconnues ne sont pas comptées comme zéro.

## Distinguer les résultats du remboursement, des points et des notifications

Vérifiez le solde et les autorisations avant de demander un remboursement, puis vérifiez de nouveau les autorisations et l’expiration de l’opération après la lecture de l’état externe et juste avant l’écriture. Utilisez une clé d’idempotence et une réservation propres à chaque opération. Si le résultat externe est incertain, rapprochez l’état actuel au lieu de redemander le remboursement sans vérification.

Un remboursement réussi et un ajustement de points réussi sont deux états différents. Un échec ultérieur ne doit pas répéter le remboursement ; consignez tout rapprochement ou correctif nécessaire. La configuration des notifications, leur réception effective et le suivi par l’équipe sont des critères de réception distincts du traitement des événements de paiement. Cet article ne prétend pas que les notifications sont opérationnelles.

<figure class="article-diagram" data-layout="flow" data-tone="amber" data-count="3" aria-labelledby="diagram-cloudflare-payment-event-boundaries">
  <figcaption>
    <strong id="diagram-cloudflare-payment-event-boundaries">Du webhook à séparation des résultats</strong>
    <span>Vérifiez l’état actuel avant d’enregistrer une opération comme terminée. Aucun remboursement ni ajustement de points client n’a été effectué.</span>
  </figcaption>
  <ol class="article-diagram__nodes">
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">1</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M4 5h16v14H4z"/><path d="M8 9h8M8 12h5M8 15h3"/></svg></span>
      <strong>Vérifier à l’entrée</strong>
      <span>Contrôlez le body brut, le mode et l’event ID ; repérez les relances et traitements en cours.</span>
    </li>
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">2</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5M8 10h5"/></svg></span>
      <strong>Rapprocher l’état actuel</strong>
      <span>Ne revenez pas à un ancien état à cause d’un événement tardif ; comparez montant, devise et commande.</span>
    </li>
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">3</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="4" y="5" width="6" height="14" rx="1"/><rect x="14" y="5" width="6" height="14" rx="1"/><path d="M11 12h2"/></svg></span>
      <strong>Enregistrer les résultats séparément</strong>
      <span>Remboursements, points et notifications ont des états distincts. Si le résultat externe est incertain, rapprochez-le au lieu de répéter l’opération.</span>
    </li>
  </ol>
</figure>

## Vérifier les réponses dans Node et dans le runtime Workers

Tester une requête externe uniquement dans Node peut masquer des différences propres à Workers. Dans ce cas, un problème de compatibilité avec `redirect: 'error'` a été reproduit, puis les requêtes sont passées à `redirect: 'manual'` avec vérification explicite du statut HTTP. Ne traitez pas une réponse 3xx ou une page d’erreur comme du JSON normal et ne suivez pas automatiquement une redirection vers un autre hôte en conservant l’autorisation. Consultez l’[API Request de Workers](https://developers.cloudflare.com/workers/runtime-apis/request/).

## Consigner les limites du déploiement et de la réception

Les changements de base de données, les traitements dépendants et l’interface d’administration ont été déployés dans l’ordre. Les tests, CI, écrans de production en lecture seule et la cohérence avec les lectures des API prestataires ont été vérifiés. Aucune opération financière d’un client n’a été effectuée pour les tests. L’export CSV traite aussi comme texte les cellules susceptibles d’être interprétées comme des formules et ne remplace pas des frais inconnus par zéro.

Pour le périmètre de connexion à l’administration, consultez [Conception des sessions entre plusieurs services](/insights/multi-service-session-lifecycle/).
