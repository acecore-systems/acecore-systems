---
title: "Enquêter sur les ralentissements de Minecraft : mesures discrètes et stockage partagé"
description: "De la collecte discrète de TPS/MSPT à la mise en regard de JFR et des observations d’E/S du système d’exploitation. L’article distingue l’enquête sur les causes, achevée, des améliorations de performance qui restent à tester."
date: "2026-10-06T01:10:00+09:00"
lastUpdated: "2026-10-06T08:52:00+09:00"
author: gui
image: /images/insights/covers/minecraft-latency-investigation-cover-v1.webp
tags: ["Minecraft", "Monitoring", "Performance"]
callout:
  type: note
  title: "Distinguer l’enquête sur les causes des résultats d’amélioration"
  text: "La surveillance continue et l’enquête sur les attentes pendant les sauvegardes sont terminées. Le passage à un autre stockage et la comparaison des performances n’ont pas été réalisés ; l’enquête ne prouve ni une panne de composant ni la disparition des ralentissements pour tous les joueurs."
---

Les ralentissements de Minecraft peuvent avoir des causes différentes : traitement des ticks du serveur, brèves attentes pendant une sauvegarde, réseau ou rendu côté client. Nous présentons de façon anonyme une enquête menée sur plusieurs serveurs Paper, sans révéler les noms d’hôtes ni la configuration internes.

## Mesurer séparément les moyennes et les pauses brèves

Consignez le TPS, le MSPT moyen, maximal et au p95, ainsi que le nombre cumulé de ticks lents. Une bonne moyenne peut masquer de courtes pauses. L’utilisation CPU globale de l’hôte ne permet pas de distinguer le travail d’un seul thread de l’attente d’E/S.

## Collecter discrètement et consigner les données manquantes

Dans ce cas, un petit plugin a écrit en JSON local les mesures obtenues par l’API publique de Paper, puis un collecteur les a agrégées en séries temporelles de supervision. Les E/S de fichiers s’exécutaient hors du thread principal du jeu ; le remplacement d’un fichier temporaire évitait qu’un lecteur voie une mise à jour incomplète. Les journaux ordinaires de la console n’étaient pas masqués.

Vérifiez aussi les horodatages et la réussite de la collecte. Ne traitez pas comme sain un ancien relevé laissé par un collecteur arrêté et ne remplacez pas les données manquantes par un TPS nul.

## Mettre en regard des fenêtres limitées JVM, OS et sauvegarde

Pendant la reproduction du problème, JFR, les observations d’attente du système et les E/S de blocs ont été recueillis dans des fenêtres séparées et limitées. Ils ont été rapprochés de la série MSPT continue et des pics périodiques de pression d’E/S pour distinguer l’activité du GC des attentes lors des sauvegardes synchrones. Toutes les captures n’ont pas eu lieu au même instant. Pour commencer avec Paper, consultez le [guide officiel de profilage spark](https://docs.papermc.io/paper/profiling/). Ici, JFR et les observations du système ont été ajoutés pour examiner les attentes pendant les sauvegardes.

Sur une fenêtre normale de 240 secondes et une fenêtre bloquée de 220 secondes, les médianes par seconde de write-await étaient de 1,60 ms et 43,71 ms ; les maxima étaient de 6,00 ms et 123,57 ms. Il s’agit de deux fenêtres d’observation, et non de résultats avant/après ou d’un benchmark général.

Outre les attentes des sauvegardes synchrones et du journal du système de fichiers, des retards ont aussi été observés dans les demandes au périphérique de plusieurs applications, ce qui a resserré la piste vers le chemin de stockage partagé. Un événement de fin dans un [tracepoint de blocs Linux](https://www.kernel.org/doc/html/latest/core-api/tracepoint.html) peut ne représenter qu’une partie d’une requête ; les requêtes sans correspondance n’ont donc pas été mélangées aux statistiques de toutes les E/S. La durée et le volume de capture étaient limités, et la charge induite par la mesure a été prise en compte.

<figure class="article-diagram" data-layout="compare" data-tone="green" data-count="2" aria-labelledby="diagram-minecraft-latency-investigation">
  <figcaption>
    <strong id="diagram-minecraft-latency-investigation">Distinguer observations et hypothèses</strong>
    <span>Les métriques continues et les échantillons limités proviennent de fenêtres distinctes. L’effet d’une migration du stockage n’a pas été testé.</span>
  </figcaption>
  <ol class="article-diagram__nodes">
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">1</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M4 19V5M4 19h16"/><path d="m7 15 4-5 3 2 5-7"/></svg></span>
      <strong>Mesures continues discrètes</strong>
      <span>Consignez TPS/MSPT et les données manquantes sans ajouter de logs habituels à la console.</span>
    </li>
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">2</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="12" cy="12" r="4"/><path d="M6 8h.01M18 16h.01"/></svg></span>
      <strong>Enquête limitée</strong>
      <span>Relevez JFR, OS et block I/O séparément, puis comparez-les. Le stockage partagé est une piste, pas une panne confirmée.</span>
    </li>
  </ol>
</figure>

## Traiter la suite comme un test séparé

Après l’enquête, les captures limitées ont été arrêtées et le fonctionnement normal de la collecte continue a été confirmé. Aucun test n’a encore comparé plusieurs cycles dans des conditions d’usage similaires après une migration du stockage. Ce compte rendu prépare la suite avec des plans de sauvegarde, de restauration et de retour arrière ; il ne réduit pas la durabilité des sauvegardes et n’accuse pas le GC ou un plugin sans preuve.

Pour distinguer signaux de supervision et diagnostic, consultez [Supervision et enquête sur incident avec OpenClaw](/insights/openclaw-monitoring-investigation/). Pour tester la restauration, consultez [Supervision des sauvegardes R2 et restic](/insights/restic-r2-backup-verification/).
