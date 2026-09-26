---
title: "Concevoir la délégation dans Codex : le plugin public Task Routing"
description: "Les choix de Codex Task Routing : préserver les réglages de l'agent principal, identifier la politique appliquée et vérifier les tâches confiées."
date: "2026-09-26T18:30:00+09:00"
author: gui
image: /images/insights/codex-task-routing-design.webp
tags: ["Technologie", "IA", "Développement"]
callout:
  type: note
  title: "Ce qui a été vérifié"
  text: "Le code public, les PR fusionnées, la CI sur trois systèmes et l'installation dans un environnement isolé ont été vérifiés. Cet article ne prétend pas mesurer un gain de qualité ou d'utilisation, ni prouver l'exécution d'un modèle délégué sur un compte réel."
---

Pour mener plusieurs travaux avec Codex, choisir un modèle n'est qu'une partie de la décision. Il faut aussi définir quelle étape peut être isolée, quel contexte transmettre et comment vérifier le résultat. Acecore a publié [Codex Task Routing](https://github.com/acecore-systems/codex-task-routing) pour expliciter ces choix.

![Quatre étapes de vérification : version de la politique, critères de transfert, preuves d'exécution et résultats mesurés](/images/insights/codex-task-routing-evidence.webp)

## Garder le travail courant chez l'agent principal

L'agent principal effectue les recherches, l'implémentation et les vérifications ordinaires. Il ne confie une étape délimitée à un spécialiste que si cela apporte une valeur concrète. Le plugin conserve le modèle et les réglages de raisonnement choisis par l'utilisateur. Il évite un transfert vers une autre instance du même modèle ou une parallélisation sans tâche indépendante pour l'agent principal.

Une transmission doit préciser plus que « rédige un article » : sources primaires, périmètre, outils disponibles, critères d'acceptation et conditions de retour d'une incertitude. L'agent principal vérifie les modifications importantes et leurs preuves, pas seulement la conclusion.

## Séparer la politique de l'exécution observée

Au démarrage, le plugin présente la politique effective et son hash. Les réglages personnalisés ne modifient pas silencieusement l'agent principal. Le hook ne lance aucun modèle et n'effectue aucune requête réseau.

Un nom de modèle dans la configuration ne prouve pas qu'il a effectivement été exécuté. Connexion, exécution et résultat doivent être vérifiés séparément ; les mesures indisponibles restent signalées comme manquantes. Le parcours vers Chat ordinaire est facultatif et s'arrête si disponibilité ou permission sont incertaines.

## Portée des contrôles

La [PR de mise à jour](https://github.com/acecore-systems/codex-task-routing/pull/13) décrit 134 tests unitaires, une CI sous Windows, Ubuntu et macOS, ainsi que l'installation, les hooks, la réinstallation et la suppression dans un environnement Codex isolé. Une [PR précédente](https://github.com/acecore-systems/codex-task-routing/pull/12) a renforcé les diagnostics Windows et les contrôles du paquet.

Ces contrôles couvrent le paquet et la configuration. Ils ne prouvent pas l'exécution d'un modèle délégué sur un compte réel, un gain mesuré de qualité ou d'utilisation, ni le fonctionnement du parcours Chat sur tous les hôtes. Les conditions et étapes d'installation figurent dans le [README public](https://github.com/acecore-systems/codex-task-routing#readme).
