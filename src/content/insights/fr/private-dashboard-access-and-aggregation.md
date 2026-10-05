---
title: "Créer un tableau de bord opérationnel protégé avec Cloudflare Pages et D1"
description: "Une conception anonymisée qui protège l’entrée avec Cloudflare Access et lit les agrégats opérationnels de D1 via Pages Functions. Elle distingue le déploiement en production, l’interface authentifiée et l’utilisation d’index vérifiée des points non testés."
date: "2026-10-06T01:10:00+09:00"
lastUpdated: "2026-10-06T01:10:00+09:00"
author: gui
image: "/images/insights/private-dashboard-access-and-aggregation.webp"
tags: ["Cloudflare Pages", "Cloudflare D1", "Security"]
callout:
  type: note
  title: "Distinguer l’implémentation, l’interface de production et la vérification des index"
  text: "Ce cas anonymisé met en œuvre une interface Pages protégée par Access et des agrégats D1 en lecture seule. Le déploiement en production relié à GitHub, l’interface authentifiée et l’utilisation d’un index par une requête de production ont été vérifiés. Les fortes charges et les performances entre plusieurs organisations n’ont pas été testées."
---

Lorsque les informations opérationnelles sont dispersées dans des journaux et des bases de données, il peut être difficile pour l’équipe de vérifier l’état actuel en toute sécurité. Cet exemple anonymisé explique comment vérifier l’accès, l’agrégation et le déploiement d’un tableau de bord. Il ne révèle aucun domaine, compte, contenu de publication ou chiffre opérationnel réel.

## Inclure la page et l’API dans le périmètre d’accès

Masquer une page statique Cloudflare Pages ne suffit pas si son API de données reste directement appelable. Incluez l’interface et l’API dans le périmètre Cloudflare Access pour que seuls les opérateurs puissent lire les données. Dans la procédure de vérification, testez la page et l’API avant et après authentification. Dans ce cas, les contrôles de production ont confirmé la protection de l’entrée de la page et l’affichage des données dans l’interface après connexion dédiée. Les traces disponibles ne confirment pas une requête directe non authentifiée vers le point de terminaison de l’API ; ce contrôle reste un critère de réception séparé. Ne placez pas de secrets d’authentification dans le code du navigateur.

## Séparer les écritures des agrégations en lecture seule

Un point de terminaison GET de Pages Functions interroge D1 et rassemble dans une réponse les volumes horaires, l’état récent des traitements et le mode d’exécution. Limitez l’API du tableau de bord à la lecture seule ; ne vous fiez pas au masquage d’un bouton dans l’interface. Définissez la période, le fuseau horaire et le sens des états confirmés et en attente afin de ne pas additionner des volumes de nature différente. Affichez séparément les valeurs manquantes ou non résolues au lieu de les traiter comme des actions réussies ou comme zéro.

## Vérifier les index D1 pour la requête d’agrégation

Les écrans opérationnels filtrent souvent des périodes récentes ; leur apparence ne prouve pas qu’un index soit utile. Après avoir ajouté un index correspondant aux conditions réelles d’agrégation, examinez le plan de requête dans D1 en production et confirmez que l’index attendu est utilisé. Créer un index et vérifier qu’une requête l’utilise sont deux contrôles distincts. Les deux ont été vérifiés en production dans ce cas, mais aucun benchmark n’a établi une amélioration du temps de réponse ou la tenue sous forte charge.

## Vérifier l’authentification et l’affichage après le déploiement

Déployez Pages en production via l’intégration GitHub, puis vérifiez la réussite du déploiement du commit prévu et l’activation du domaine personnalisé. Vérifiez ensuite que la page est protégée avant authentification et que les données du tableau de bord s’affichent après connexion. Une CI réussie ou un déploiement achevé ne prouve pas à lui seul qu’un opérateur authentifié peut voir l’interface de production.

Cet exemple anonymisé a vérifié le périmètre d’accès, l’écran de production et l’utilisation d’un index par la requête d’agrégation D1 dans un environnement opérationnel. Il n’a pas testé la séparation des droits entre organisations, la charge à mesure que le nombre d’utilisateurs augmente ni les scénarios d’intrusion pour toutes les configurations d’authentification. Pour l’architecture générale du site Pages, consultez [Architecture d’un site Cloudflare Pages](/insights/astro-cloudflare-site-architecture/).
