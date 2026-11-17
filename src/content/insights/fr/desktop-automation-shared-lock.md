---
title: "Séparer en toute sécurité les opérations automatisées sur les écrans d’authentification : éviter les saisies simultanées sur un bureau partagé"
description: "Comment définir le périmètre d’exclusion mutuelle, arrêter les opérations en cas de conflit et effectuer une dernière vérification avant l’envoi lorsque plusieurs automatisations utilisent le même écran."
date: "2026-11-17T12:00:00+09:00"
author: gui
image: /images/insights/covers/multi-service-session-lifecycle-cover-v1.webp
tags: ["Authentification", "Automatisation", "Exploitation"]
---

Lorsque plusieurs automatisations manipulent simultanément le même bureau, l’une risque de saisir des données dans l’écran ouvert par une autre. Pour les écrans d’authentification, il est important de limiter les opérations à une seule à la fois et de vérifier la cible juste avant l’envoi. Nous prenons ici l’exemple de tests synthétiques qui n’utilisent ni informations secrètes ni destinations de connexion réelles.

<figure class="article-diagram" data-layout="flow" data-tone="blue" data-count="3" aria-labelledby="diagram-desktop-lock">
  <figcaption><strong id="diagram-desktop-lock">Prévenir les conflits d’opérations à l’écran</strong><span>Réserver l’utilisation de l’écran partagé à une seule opération à la fois.</span></figcaption>
  <ol class="article-diagram__nodes">
    <li><strong>Acquérir le droit d’utilisation</strong><span>Ne pas accéder à l’écran si un autre traitement l’utilise.</span></li>
    <li><strong>Vérifier à nouveau la cible</strong><span>Contrôler l’écran et la destination de connexion avant l’envoi.</span></li>
    <li><strong>Libérer et vérifier le résultat</strong><span>Vérifier séparément le résultat après l’opération à l’écran.</span></li>
  </ol>
</figure>

## Traiter le même bureau comme une ressource partagée

Même si chaque automatisation possède son propre verrou, cela ne suffit pas à prévenir les conflits lorsqu’elles saisissent des données sur le même écran. Les traitements qui utilisent le même bureau doivent participer à un mécanisme d’exclusion mutuelle commun, et ceux qui ne peuvent pas l’acquérir doivent s’arrêter avant tout clic ou toute saisie. La [documentation sur les mutex Windows](https://learn.microsoft.com/en-us/windows/win32/sync/using-mutex-objects) présente un exemple de mécanisme permettant de contrôler l’accès simultané à une ressource partagée.

L’exclusion mutuelle doit être maintenue pendant la saisie et les transitions d’écran, puis l’écran actuel et la destination de connexion doivent être vérifiés à nouveau avant l’envoi. Pour déterminer s’il est nécessaire de continuer à occuper l’écran pendant un traitement externe dont le délai d’attente est long, il faut examiner la période pendant laquelle l’écran est réellement utilisé. La conception doit également prévoir la libération en cas d’exception, l’état de l’écran après une interruption et le traitement des envois dont le résultat est inconnu.

## Ce que nous avons vérifié sur un écran synthétique

Pour le parcours d’authentification enregistré en interne, nous avons inclus les transitions d’écran ainsi que les vérifications et opérations précédant l’envoi dans le périmètre de l’exclusion mutuelle partagée. Sur un écran synthétique fixe, nous avons vérifié la réussite de l’envoi, l’arrêt en cas de conflit, la transition vers l’authentification multifacteur et une exception lors d’un clic. Ces tests ne démontrent ni un fonctionnement avec des identifiants réels ni un fonctionnement sur tous les sites.

Si l’on ne sait pas si un envoi a déjà eu lieu, il faut vérifier l’état du côté de la cible plutôt que de répéter les envois. Le verrou réduit le risque de saisie erronée, mais ne remplace ni la vérification de l’identité, ni l’autorisation, ni le contrôle des données saisies ou du résultat de l’envoi.

## Premier essai

Préparez un formulaire fictif et lancez simultanément deux traitements. Vérifiez qu’un seul effectue des opérations, que l’autre s’arrête avant la saisie et que le traitement suivant peut reprendre même après une exception en cours d’exécution. Ajoutez aussi un cas où l’écran change en cours de route et assurez-vous qu’aucun envoi n’a lieu si la nouvelle vérification échoue. Date de vérification : 17/11/2026.
