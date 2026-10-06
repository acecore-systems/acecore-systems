---
title: "Distinguer le cache en périphérie des images publiques des limites de l’API"
description: "Un cas où l’API de contenu et les requêtes d’images partageaient la même limite lors de consultations répétées. L’article traite de la réutilisation des images publiques, de la validation des réponses réussies, des frontières entre WAF et application et des vérifications en production."
date: "2026-10-06T02:20:00+09:00"
lastUpdated: "2026-10-06T08:52:00+09:00"
author: gui
image: /images/insights/covers/public-image-cache-and-api-rate-limits-cover-v1.webp
tags: ["Cloudflare", "Performance", "Web"]
callout:
  type: note
  title: "Vérifier séparément le cache et les limites"
  text: "Ce cas confirme l’implémentation, la CI, le déploiement en production via l’intégration GitHub et la comparaison du contenu d’images représentatives avec l’état du cache. Il ne mesure ni le taux de succès du cache dans tous les centres de données ni les gains de performance sous forte charge."
---

Dans un journal ou un catalogue contenant des images, chaque changement de date ou de page déclenche des requêtes vers l’API de contenu et vers les images. Nous décrivons un cas où les images ont cessé de se charger lors de consultations répétées, sans révéler les URL opérationnelles, les routes internes ni les valeurs de limite.

## Le contenu et les images partageaient la même limite

Dans ce cas, les requêtes vers une API dynamique et les requêtes GET des images publiques étaient comptabilisées par la même règle de limitation du WAF. Même un changement de page ordinaire pouvait déclencher plusieurs requêtes à la fois : le contenu était chargé, mais les images pouvaient être limitées.

Ajouter un cache en périphérie pour les images n’aide pas les requêtes que le WAF bloque avant qu’elles ne l’atteignent. Nous avons modifié séparément la charge à l’origine et les types de requêtes comptabilisées dans la même limite. Les limites existantes de l’application et les quotas du processus de génération restent en place pour leurs objectifs respectifs.

## Ne réutiliser que des images publiques partageables

Les images concernées ici sont immuables : un même asset ID public renvoie toujours le même contenu. Nous validons le format de l’asset ID, la frontière de la requête et la configuration du Service Binding avant de consulter une entrée de cache indexée par le même host et le même asset ID. Un cache déjà rempli ne permet pas d’omettre ces contrôles d’entrée.

Les chaînes de requête sans effet sur le contenu et les en-têtes de la requête de l’utilisateur final ne créent pas de variantes de cache pour une même image. Ce choix n’est possible que parce qu’il s’agit d’images publiques et immuables. Il ne peut pas être appliqué tel quel à des images privées dont le contenu varie selon l’utilisateur ou l’organisation.

## Enregistrer uniquement les réponses 200 validées

En cas d’absence dans le cache, l’image est récupérée depuis un Service Binding privé. Nous validons le HTTP status, le Content-Type de l’image, le Content-Length et le body de la réponse, puis n’enregistrons que les réponses 200 qui satisfont ces conditions. Les réponses partielles, les bodies vides, les metadata invalides et les réponses d’échec ne sont pas enregistrés.

Enregistrer le contenu de l’image est différent du retour d’un 304 lorsque l’ETag correspond. Les écritures du cache sont planifiées avec waitUntil ; une erreur de lecture ou d’écriture du cache ne doit pas empêcher de renvoyer une image valide récupérée depuis l’origine. Si le cache peut répondre à une requête ultérieure, la récupération par le Service Binding peut être évitée.

La [Cloudflare Cache API](https://developers.cloudflare.com/workers/runtime-apis/cache/) décrit les requêtes conditionnelles avec ETag et le fonctionnement du cache par centre de données. Un HIT dans un centre de données ne signifie pas que tous les centres ont un HIT. Les en-têtes de réponse des Pages Functions ne peuvent pas être définis uniquement avec les [_headers pour les fichiers statiques](https://developers.cloudflare.com/pages/configuration/headers/) ; il faut les gérer dans la Function.

## Gérer séparément les limites de l’API dynamique

La protection de l’API dynamique est une exigence distincte du cache des images. Dans ce cas, les GET des images publiques ont été exclus du comptage WAF ; après application du changement, nous avons relu les API dynamiques ciblées, la période de limite, l’action et l’état d’activation. L’ancienne configuration a également été conservée pour le retour arrière.

Choisissez les seuils en fonction du nombre de requêtes générées par une navigation normale et de la charge de l’opération protégée. Il faut aussi vérifier les conditions propres au plan de la [limitation de débit Cloudflare](https://developers.cloudflare.com/waf/rate-limiting-rules/). La présence d’une valeur dans une note d’exploitation du dépôt ne prouve pas qu’une règle soit active en production.

<figure class="article-diagram" data-layout="boundary" data-tone="teal" data-count="2" aria-labelledby="diagram-public-image-cache-and-api-rate-limits">
  <figcaption>
    <strong id="diagram-public-image-cache-and-api-rate-limits">Images publiques et API dynamique</strong>
    <span>Concevez séparément la réutilisation des images publiques immuables et la protection des API dynamiques. Les images privées sont hors périmètre.</span>
  </figcaption>
  <ol class="article-diagram__nodes">
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">1</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="m21 15-5-5L5 20"/></svg></span>
      <strong>GET d’image publique</strong>
      <span>Vérifiez la frontière de la requête, puis réutilisez la même image depuis le cache. Ne stockez que les réponses 200 validées.</span>
    </li>
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">2</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M12 3 20 6v5c0 5-3.4 8.5-8 10-4.6-1.5-8-5-8-10V6l8-3Z"/><path d="m9 12 2 2 4-4"/></svg></span>
      <strong>API dynamique</strong>
      <span>Protégez le traitement avec le WAF et la quota applicative. Ces limites sont distinctes du cache des images.</span>
    </li>
  </ol>
</figure>

## Vérifier le contenu des images en production

Les tests unitaires ont couvert la réutilisation de la même image publique, la séparation par host et asset ID, la vérification de la frontière avant l’usage du cache, les réponses 304, les défaillances du cache et les réponses à ne pas enregistrer. Après la CI, nous avons confirmé le déploiement en production via un push GitHub et le domaine personnalisé, puis comparé le résultat HTTP d’images représentatives, l’état HIT ou MISS indiqué par l’application et le hash des bytes récupérés.

En production, nous avons aussi récupéré le contenu et plusieurs images à la suite, et confirmé que les requêtes n’étaient pas limitées dans cette condition de test de navigation normale. Il s’agit d’un contrôle d’un scénario de requêtes limité, et non d’un test de la frontière sous forte charge.

L’affichage de l’état du cache ne prouve pas à lui seul que la bonne image a été renvoyée. Nous vérifions séparément la récupération du contenu, celle des images, la configuration du WAF et le résultat de consultation dans l’UI. Ce compte rendu confirme la livraison d’images représentatives ; il ne démontre ni une consultation continue par tous les utilisateurs et dans tous les centres de données, ni des gains de performance sous forte charge.

Pour la répartition entre parties statiques et dynamiques du site, consultez [la conception générale d’Astro et Cloudflare](/insights/astro-cloudflare-site-architecture/). Pour optimiser la livraison des images, du CSS et des autres ressources, consultez [l’optimisation des performances d’Astro](/insights/astro-performance-tuning/).
