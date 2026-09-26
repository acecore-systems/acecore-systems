---
title: "En-têtes de sécurité pour les ressources statiques et Functions de Cloudflare Pages"
description: "Distinguez les réponses statiques de Pages et celles de Functions et vérifiez _headers, la CSP et la configuration actuelle."
date: 2026-03-15T00:00
author: gui
tags: ["Technologie", "Cloudflare", "Sécurité"]
image: /uploads/acecore-generated/blog-cloudflare-pages-security.webp
lastUpdated: "2026-09-26T19:12:47+09:00"
---

Cet article retraçait le passage, en mars 2026, d’un formulaire géré par Worker à un service externe et à une diffusion statique sur Cloudflare Pages. L’architecture a changé depuis. **En septembre 2026, le site d’Acecore utilise aussi Pages Functions** pour le contact, les commentaires, la recherche, l’aide par IA et les API du CMS. L’ancienne décision reste un contexte historique.

## Distinguer réponses statiques et Functions

`public/_headers` s’applique aux **réponses des ressources statiques** servies par Pages. Cloudflare précise que ces règles ne s’appliquent pas aux réponses produites par Pages Functions, même si l’URL correspond. Définissez les en-têtes CORS, de cache et de sécurité nécessaires dans le `Response` de la Function.

Ne supposez pas que `_headers` protège toutes les pages et API. Vérifiez séparément les en-têtes du HTML statique et de `/api/*`.

## Où lire la configuration actuelle

Le [fichier `_headers` actuel](https://github.com/acecore-systems/acecore-net/blob/main/public/_headers) impose la revalidation du HTML et conserve plus longtemps les ressources `_astro/` nommées par hash. Le CMS possède une CSP distincte et `X-Frame-Options` vaut `SAMEORIGIN`. Ne reprenez pas comme valeurs actuelles l’ancien `form-action https://ssgform.com`, le cache HTML d’une heure ou `DENY`.

Les routes dynamiques sont visibles dans le [code Pages Functions](https://github.com/acecore-systems/acecore-net/tree/main/functions). Adaptez la CSP aux scripts, images, cadres et connexions réellement utilisés par votre site, sans copier telle quelle celle d’Acecore.

## Déploiement et vérification

Le site publie `main` avec Cloudflare Pages relié à GitHub. La version actuelle de Node figure dans [`.node-version`](https://github.com/acecore-systems/acecore-net/blob/main/.node-version) ; la CI exécute `npm run build` depuis `package.json`. Le tableau de mars 2026 indiquant « Node.js 22 / npx astro build » est historique.

Vérifiez séparément l’aperçu PR, le build de main, le déploiement Pages en production et l’URL publique. Consultez la [documentation Cloudflare sur les en-têtes Pages](https://developers.cloudflare.com/pages/configuration/headers/).
