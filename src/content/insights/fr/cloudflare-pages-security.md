---
title: "En-têtes de sécurité Cloudflare Pages : distinguer _headers des Pages
  Functions"
description: "Découvrez où configurer les en-têtes pour les réponses statiques
  et celles des Pages Functions, où vérifier la configuration actuelle et quoi
  contrôler après le déploiement."
date: 2026-03-15T00:00
author: gui
tags: ["Technologie", "Cloudflare", "Sécurité"]
image: "/images/insights/covers/cloudflare-pages-security-cover-v2.webp"
lastUpdated: "2026-10-20T09:59:18Z"
---

Si les réglages CSP ou de cache ne semblent pas s’appliquer sur Cloudflare Pages, commencez par déterminer si la réponse provient d’une ressource statique ou d’une Pages Function. Cet article explique où configurer les en-têtes dans chaque cas, où consulter la configuration actuelle et quoi vérifier après le déploiement. Vérifiez les en-têtes des réponses d’erreur comme ceux des réponses réussies afin de repérer les oublis de configuration après l’ajout d’une API.

En mars 2026, le formulaire de contact a été transféré vers un formulaire externe et le site est revenu à la diffusion statique par Cloudflare Pages. Depuis, l’architecture du site a changé. **En septembre 2026, le site officiel d’Acecore utilise des pages statiques ainsi que Pages Functions** pour le contact, les commentaires, la recherche, l’assistance par IA et les API du CMS. Voici le contexte de cette décision passée et les limites d’application des en-têtes qui restent utiles aujourd’hui.

## Où s’appliquent _headers et les Pages Functions ?

`public/_headers` s’applique aux **réponses des ressources statiques** servies par Pages. Le [code source public de Cloudflare Docs consacré aux en-têtes](https://github.com/cloudflare/cloudflare-docs/blob/production/src/content/docs/pages/configuration/headers.mdx) précise que les règles de `_headers` s’appliquent aux réponses des ressources statiques. La documentation [Cloudflare Pages: Headers](https://developers.cloudflare.com/pages/configuration/headers/) indique également que ces règles ne s’appliquent pas aux réponses produites par Pages Functions, même si le modèle d’URL correspond. Définissez dans le `Response` de la Function les en-têtes CORS, de cache et de sécurité nécessaires aux réponses API.

Ne supposez donc pas qu’un seul fichier `_headers` couvre toutes les pages et toutes les API. Vérifiez séparément les en-têtes renvoyés par le HTML statique et par `/api/*`.

<figure class="article-diagram" data-layout="boundary" data-tone="teal" data-count="2" aria-labelledby="diagram-cloudflare-pages-security">
  <figcaption>
    <strong id="diagram-cloudflare-pages-security">Les réponses statiques et celles des Functions ont des réglages distincts</strong>
    <span>Les fichiers statiques et les API ont des emplacements de configuration différents. Après le déploiement, vérifiez les deux séparément.</span>
  </figcaption>
  <ol class="article-diagram__nodes">
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">1</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M5 3h10l4 4v14H5z"/><path d="M15 3v5h5M8 12h8M8 16h8"/></svg></span>
      <strong>Réponse d’un fichier statique</strong>
      <span>Configurez les en-têtes avec _headers, puis vérifiez la réponse renvoyée par Pages.</span>
    </li>
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">2</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M8 9h8M8 12h4M8 16h8"/></svg></span>
      <strong>Réponse API d’une Function</strong>
      <span>Configurez les en-têtes dans l’objet Response de la Function, puis vérifiez l’API séparément.</span>
    </li>
  </ol>
</figure>

## Où vérifier la configuration actuelle des en-têtes ?

Le [fichier `_headers` actuel](https://github.com/acecore-systems/acecore-net/blob/main/public/_headers) prévoit la revalidation du HTML et une mise en cache de longue durée pour les ressources `_astro/` nommées par hash. L’interface d’administration utilise une CSP distincte de celle des pages ordinaires, et `X-Frame-Options` vaut `SAMEORIGIN`. Ne reprenez pas comme valeurs actuelles l’ancien `form-action https://ssgform.com`, la mise en cache du HTML pendant une heure ou `DENY`.

Les routes dynamiques actuelles sont consultables dans le [code des Pages Functions](https://github.com/acecore-systems/acecore-net/tree/main/functions). Vérifiez aussi que les domaines externes autorisés par la CSP correspondent aux scripts, images, cadres et connexions réellement utilisés. Ne copiez pas directement la configuration publiée ici dans un autre site.

## Que vérifier après le déploiement ?

Le site officiel est publié depuis `main` avec Cloudflare Pages connecté à GitHub. La [version actuelle de Node](https://github.com/acecore-systems/acecore-net/blob/main/.node-version) figure dans `.node-version`, et les étapes de build sont définies dans `package.json`. La CI vérifie le build avec `npm run build`. Le tableau de mars 2026 indiquant « Node.js 22 / npx astro build » ne décrit pas la procédure de publication actuelle.

Pour vérifier la publication, contrôlez séparément l’aperçu de la PR, le build de `main`, le déploiement de production sur Pages, puis les en-têtes et le contenu de l’URL publique. La [documentation officielle Cloudflare Pages sur les en-têtes](https://developers.cloudflare.com/pages/configuration/headers/) décrit la configuration de `_headers`.
