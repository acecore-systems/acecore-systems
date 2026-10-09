---
title: "En-têtes de sécurité pour les ressources statiques et Functions de Cloudflare Pages"
description: "Distinguez les réponses statiques de Pages et celles de Functions et vérifiez _headers, la CSP et la configuration actuelle."
date: 2026-03-15T00:00
author: gui
tags: ["Technologie", "Cloudflare", "Sécurité"]
image: "/images/insights/covers/cloudflare-pages-security-cover-v2.webp"
lastUpdated: "2026-10-09T15:00:00+09:00"
---

Si CSP ou cache semblent sans effet sur Cloudflare Pages, identifiez d’abord une réponse statique ou Functions. Choisissez l’emplacement de configuration avec [Cloudflare Pages: Headers](https://developers.cloudflare.com/pages/configuration/headers/), puis vérifiez les en-têtes d’erreur comme de succès pour repérer les oublis après ajout d’API.

Cet article retraçait le passage, en mars 2026, d’un formulaire géré par Worker à un service externe et à une diffusion statique sur Cloudflare Pages. L’architecture a changé depuis. **En septembre 2026, le site d’Acecore utilise aussi Pages Functions** pour le contact, les commentaires, la recherche, l’aide par IA et les API du CMS. L’ancienne décision reste un contexte historique.

## Distinguer réponses statiques et Functions

`public/_headers` s’applique aux **réponses des ressources statiques** servies par Pages. Cloudflare précise que ces règles ne s’appliquent pas aux réponses produites par Pages Functions, même si l’URL correspond. Définissez les en-têtes CORS, de cache et de sécurité nécessaires dans le `Response` de la Function.

Ne supposez pas que `_headers` protège toutes les pages et API. Vérifiez séparément les en-têtes du HTML statique et de `/api/*`.

<figure class="article-diagram" data-layout="boundary" data-tone="teal" data-count="2" aria-labelledby="diagram-cloudflare-pages-security">
  <figcaption>
    <strong id="diagram-cloudflare-pages-security">Les en-têtes se configurent à des endroits différents</strong>
    <span>Les fichiers statiques et les API ont des points de configuration distincts. Vérifiez les deux réponses après le déploiement.</span>
  </figcaption>
  <ol class="article-diagram__nodes">
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">1</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M5 3h10l4 4v14H5z"/><path d="M15 3v5h5M8 12h8M8 16h8"/></svg></span>
      <strong>Réponse d’un fichier statique</strong>
      <span>Configurez avec _headers ; vérifiez la réponse servie par Pages.</span>
    </li>
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">2</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M8 9h8M8 12h4M8 16h8"/></svg></span>
      <strong>Réponse API d’une Function</strong>
      <span>Définissez les en-têtes sur la Response de la Function ; vérifiez l’API séparément.</span>
    </li>
  </ol>
</figure>

## Où lire la configuration actuelle

Le [fichier `_headers` actuel](https://github.com/acecore-systems/acecore-net/blob/main/public/_headers) impose la revalidation du HTML et conserve plus longtemps les ressources `_astro/` nommées par hash. Le CMS possède une CSP distincte et `X-Frame-Options` vaut `SAMEORIGIN`. Ne reprenez pas comme valeurs actuelles l’ancien `form-action https://ssgform.com`, le cache HTML d’une heure ou `DENY`.

Les routes dynamiques sont visibles dans le [code Pages Functions](https://github.com/acecore-systems/acecore-net/tree/main/functions). Adaptez la CSP aux scripts, images, cadres et connexions réellement utilisés par votre site, sans copier telle quelle celle d’Acecore.

## Déploiement et vérification

Le site publie `main` avec Cloudflare Pages relié à GitHub. La version actuelle de Node figure dans [`.node-version`](https://github.com/acecore-systems/acecore-net/blob/main/.node-version) ; la CI exécute `npm run build` depuis `package.json`. Le tableau de mars 2026 indiquant « Node.js 22 / npx astro build » est historique.

Vérifiez séparément l’aperçu PR, le build de main, le déploiement Pages en production et l’URL publique. Consultez la [documentation Cloudflare sur les en-têtes Pages](https://developers.cloudflare.com/pages/configuration/headers/).
