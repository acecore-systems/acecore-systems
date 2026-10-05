---
title: "Aligner l’expiration des connexions entre services : renouvellement et réauthentification"
description: "Une conception générale distinguant connexion explicite, expiration côté serveur, cookies et fournisseur d’identité."
date: "2026-09-30T13:37:47+00:00"
lastUpdated: "2026-10-06T01:10:00+09:00"
author: gui
image: /images/insights/multi-service-session-lifecycle.webp
tags: ["Authentication", "Session", "Web"]
callout:
  type: note
  title: "Cas interne généralisé"
  text: "Fondé sur des changements de règles et leur déploiement en production. Durées et réglages internes sont omis ; le comportement à long terme de tous les utilisateurs et une sécurité exhaustive ne sont pas démontrés."
---

Un compte commun ne rend pas identiques les sessions des applications et du fournisseur d’identité. Ce cas aligne les règles sans publier les destinations ni les durées.

## Identifier chaque durée

Inventorier séparément session du fournisseur, session applicative et cookie. Expiration absolue, inactivité et rotation de l’identifiant sont distinctes. Une rotation n’impose pas de prolonger la validité.

## Distinguer connexion explicite et accès courant

Le cas renouvelle la période applicable après une connexion explicite réussie, pas par navigation, trafic de fond, renouvellement automatique de jeton ou rotation d’identifiant : ces opérations gardent l’échéance initiale. Un clic ou l’arrivée au callback ne suffit pas : valider l’authentification. Si une authentification récente est exigée, vérifier séparément si la session existante du fournisseur convient.

## Contrôler l’expiration côté serveur

Un cookie plus durable ne fixe pas la durée acceptée par le serveur. Contrôler expiration, révocation, cookie et contraintes du fournisseur. Des règles cohérentes ne signifient ni cookie partagé ni déconnexion immédiate de tous les services.

Vérifier les dates d’authentification et d’expiration de l’autorité, puis limiter les sessions applicatives à cette période. Le contrat commun valide les sessions ; les droits métier restent dans chaque application. Une passerelle avec son propre cookie constitue une autre limite à inventorier et auditer.

## Séparer réglages et comportement

Auditer code et réglages séparément des tests de connexion, limites d’expiration, reconnexion et déconnexion. Vérifier l’application des nouvelles règles aux anciennes sessions et la réaction des pages et API. Journaliser décisions et heures, sans valeurs de session ni identifiants secrets.

## Portée confirmée

L’historique confirme modifications, déploiement et outils d’audit des différences. Les vérifications n’incluent ni connexion d’utilisateurs réels ni attente de l’expiration effective. Il ne démontre ni tests en temps réel sur tous les appareils ni sécurité exhaustive de la révocation et de la réauthentification. Choisir durées et contrôles selon données et opérations.

Voir [sessions OWASP](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html) et [authentification](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html). Pour une autre couche, voir [sessions Cloudflare](https://developers.cloudflare.com/cloudflare-one/access-controls/access-settings/session-management/). Les recommandations ne déclarent pas tous ces tests accomplis dans ce cas.

## Ajout du 6 octobre 2026 : continuité de l’authentification et droits des applications

Dans le compte rendu anonymisé d’une modification de l’authentification, l’arrivée au callback OIDC, la validation du jeton, la reprise de la demande d’authentification initiale et les droits d’utilisation de l’application ont été distingués. Si le contexte nécessaire à la reprise a été perdu, le parcours ne présente pas cela comme une connexion réussie : il renvoie une erreur sûre qui permet de reprendre le processus. La destination de retour est également validée ; se connecter au compte commun n’accorde pas, à lui seul, les droits métier de chaque application.

Le même contrat est vérifié pour la connexion et l’inscription, l’ajout ou le retrait de fournisseurs d’authentification et les procédures de récupération. Les journaux de modification et de déploiement ne prouvent ni que toutes les personnes peuvent se connecter avec tous les fournisseurs, ni que la conservation du dernier moyen de récupération a été testée de bout en bout.

L’activation d’un second facteur, la connexion à la plateforme d’identité, le passage par la passerelle d’accès et une écriture protégée dans l’application sont également vérifiés séparément. Un test d’écriture limité ne remplace pas la vérification de tous les parcours OIDC formels et ne prouve pas qu’un compte désactivé est refusé. L’inscription, la configuration initiale, les écrans de modification et l’API utilisent les mêmes règles de saisie ; les tests vérifient ensemble les valeurs limites acceptées et rejetées. Aucune longueur particulière n’est présentée comme une norme universelle.

Les écrans et les indications de callback sont aussi distincts pour la connexion et l’inscription. Afficher un écran ou vérifier l’état de santé ne vaut pas recette de la création effective d’un compte externe ou de l’octroi du consentement. Lors du retrait d’un fournisseur, le bouton, le callback, la configuration, les indications et les tests sont examinés ensemble, puis les parcours résiduels sont recherchés.
