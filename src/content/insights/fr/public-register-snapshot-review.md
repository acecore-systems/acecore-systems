---
title: "Utiliser un registre public pour créer des candidats dans le CRM : conserver la source et les différences pour une vérification humaine"
description: "Une conception qui distingue les fichiers sources des données publiques et les moments de leur observation, sans répercuter automatiquement les doublons, disparitions ou modifications des candidats sur les informations existantes des entreprises."
date: "2026-11-17T12:00:00+09:00"
author: gui
image: /images/insights/covers/private-dashboard-access-and-aggregation-cover-v1.webp
tags: ["Données", "CRM", "Exploitation"]
---

Lorsqu’on crée des candidats pour un CRM à partir d’un registre public, des établissements portant le même nom ne relèvent pas nécessairement du même exploitant. Plutôt que de relier directement les mises à jour des données sources ou la disparition de lignes à une modification des informations existantes d’une entreprise ou à sa fermeture, on permet à une personne de vérifier la source et les différences.

<figure class="article-diagram" data-layout="flow" data-tone="blue" data-count="3" aria-labelledby="diagram-public-register-snapshot-review">
  <figcaption><strong id="diagram-public-register-snapshot-review">Utiliser un registre public pour créer des candidats dans le CRM : conserver la source et les différences pour une vérification humaine</strong><span>Une conception qui distingue les fichiers sources des données publiques et les moments de leur observation, sans répercuter automatiquement les doublons, disparitions ou modifications des candidats sur les informations existantes des entreprises.</span></figcaption>
  <ol class="article-diagram__nodes">
    <li><strong>Conserver le fichier source</strong><span>Enregistrer la source, la date de référence et le moment de l’observation.</span></li>
    <li><strong>Vérifier les différences</strong><span>Réutiliser les fichiers sources identiques et mettre en attente les noms en double.</span></li>
    <li><strong>Décision humaine</strong><span>Comparer les candidats avant de procéder aux enregistrements nécessaires.</span></li>
  </ol>
</figure>

## Conserver séparément les fichiers sources et les observations

Enregistrez l’URL de la source, les conditions d’utilisation, la date de référence de l’organisme publiant les données et l’heure de récupération. Même si le fichier source est identique au précédent, l’heure de la nouvelle vérification ou les explications de l’organisme peuvent différer. En séparant la conservation du contenu du fichier de l’observation indiquant quand et quoi a été vérifié, on peut réutiliser un fichier identique tout en conservant l’historique des vérifications.

Par exemple, le [catalogue de données de la ville de Funabashi](https://www.city.funabashi.lg.jp/shisei/toukei/002/opendata.html) permet de consulter les données publiques et leurs conditions d’utilisation. Vérifiez également les conditions, la date de mise à jour et le périmètre de chaque jeu de données utilisé. Le seul fait que des données soient publiques ne signifie pas que toutes les méthodes de récupération ou toutes les utilisations sont autorisées.

## Présenter les modifications et les disparitions comme éléments d’aide à la décision

Lors d’un rapprochement interne de registres, nous avons comparé toutes les lignes avant et après la mise à jour et affiché les différences de champs pour les noms pouvant être associés de manière univoque. Lorsque plusieurs lignes portent le même nom, elles sont mises en attente plutôt qu’associées automatiquement. La disparition d’une ligne indique seulement qu’elle n’est plus visible dans les données ; elle ne justifie ni la conclusion d’une fermeture ni la suppression d’une entreprise. Les adresses et numéros de téléphone ne remplacent pas non plus automatiquement les informations existantes des entreprises.

Nous avons utilisé des données fictives pour vérifier la réutilisation d’un fichier source identique, la modification et la disparition de champs, la mise en attente des noms en double et la reprise après un échec partiel. Cet article ne contient aucun fichier source réel ni aucune information commerciale réelle. Les méthodes de mise à jour et les identifiants variant selon les données, cette vérification ne garantit pas la possibilité d’effectuer une récupération automatique illimitée sur d’autres sites.

## Premières étapes à essayer

Préparez 2 versions d’un petit fichier CSV fictif, comprenant des lignes identiques, des lignes modifiées, des lignes disparues et 2 lignes portant le même nom. Conservez les fichiers sources et les heures d’observation, puis affichez uniquement les candidats et vérifiez que les données existantes restent inchangées. En cas d’échec de la récupération ou de modification des conditions d’utilisation, arrêtez le processus et ne le reprenez qu’après vérification des données sources par une personne. Définissez également la durée de conservation et la méthode de suppression avant la mise en exploitation. Date de vérification : 17/11/2026.
