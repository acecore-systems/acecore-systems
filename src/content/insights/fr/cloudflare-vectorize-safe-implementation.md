---
title: "Guide d'implémentation Cloudflare Vectorize : synchroniser le HTML public en sécurité"
description: "Un guide détaillé pour créer un corpus depuis le HTML public, conserver Pagefind et exploiter une synchronisation Vectorize sûre."
date: 2026-07-31T12:00
author: gui
tags: ["Technologie", "Cloudflare", "Vectorize", "OpenAI", "Recherche interne"]
image: /uploads/acecore-generated/blog-cloudflare-pages-security.webp
callout:
  type: tip
  title: Vectorize est une base de recherche par le sens, pas seulement par les mots
  text: "La base de données vectorielle de Cloudflare peut renvoyer des pages publiques dont le sens est proche d'une question, même lorsque les mots-clés ne correspondent pas exactement. Sa valeur consiste à compléter la recherche existante par les reformulations et les informations liées, et non à la remplacer."
processFigure:
  eyebrow: Vectorize rollout
  title: Du HTML public à une recherche associée sûre
  description: "Au lieu d'insérer directement la source éditoriale, nous prenons comme référence de synchronisation le HTML réellement publié et le commit déjà déployé."
  variant: inline
  steps:
    - title: Construire le HTML public
      description: "Générer un HTML statique qui reflète canonical, locale et noindex."
      icon: i-lucide-file-code-2
      accent: slate
    - title: Créer le corpus de façon déterministe
      description: "Découper le texte en chunks et ajouter des ID dérivés du content hash ainsi que des metadata d'audit."
      icon: i-lucide-boxes
      accent: brand
    - title: Vérifier l'interface en Preview
      description: "Y laisser la recherche sémantique désactivée, puis vérifier les suggestions Pagefind, le fallback et l'avertissement visible."
      icon: i-lucide-flask-conical
      accent: amber
    - title: Synchroniser le commit publié en Production
      description: "Comparer le build marker à la corpus version et n'activer qu'après convergence des mutations."
      icon: i-lucide-shield-check
      accent: emerald
compareTable:
  title: Recherche et synchronisation exigent des politiques de panne différentes
  before:
    label: Tout faire dépendre de Vectorize
    items:
      - "Si AI, Vectorize ou D1 s'arrête, toute la recherche interne devient indisponible"
      - "L'écart entre les brouillons du CMS et les pages publiées se retrouve directement dans les résultats"
      - "Une erreur de configuration du script de synchronisation peut modifier un autre environnement ou un grand nombre de vectors"
      - "Il est facile de considérer l'intégration comme terminée dès que le code est merged"
  after:
    label: Recherche fail-soft ＋ synchronisation fail-closed
    items:
      - "Utiliser Pagefind pour la recherche normale et n'appeler la recherche sémantique que par une action explicite"
      - "Créer le corpus depuis le HTML public afin de refléter canonical, noindex et locale"
      - "Vérifier l'allowlist de Production, le taux de suppression, le commit publié et l'achèvement des mutations avant et après la synchronisation"
      - "Consigner séparément l'implémentation, la validation locale, la vérification de l'interface Preview et l'exploitation en Production"
statBar:
  items:
    - value: "Recherche par sens"
      label: Trouver au-delà des mots exacts
      description: "Les questions et reformulations peuvent atteindre des pages publiques proches de l'intention."
      icon: i-lucide-git-branch
    - value: "Deux recherches"
      label: Pagefind plus Vectorize
      description: "La recherche normale reste disponible et la recherche associée s'ajoute seulement quand elle est utile."
      icon: i-lucide-database
    - value: "HTML public"
      label: Chercher ce que le lecteur voit
      description: "Le corpus utilise les pages publiques, pas les brouillons ni les écrans d'administration."
      icon: i-lucide-test-tube-2
    - value: "Déploiement progressif"
      label: Vérifier avant de publier
      description: "L'interface est vérifiée en Preview et la synchronisation est limitée à Production."
      icon: i-lucide-badge-check
checklist:
  title: Vérifications avant l'intégration sur le prochain site
  items:
    - text: "Conserver la recherche par mots-clés existante et son parcours lorsque Vectorize est indisponible"
      checked: true
    - text: "Comparer la sortie réelle de l'embedding model avec dimensions／metric de l'index"
      checked: true
    - text: "Générer le corpus depuis le HTML public et exclure noindex, les canonical externes et les pages d'administration"
      checked: true
    - text: "Utiliser des ID dérivés du content hash afin de ne pas recalculer les embeddings des chunks inchangés"
      checked: true
    - text: "Garder Preview sur Pagefind seulement et limiter Vectorize, D1 et les permissions de synchronisation à Production"
      checked: true
    - text: "Confirmer l'achèvement de l'upsert avant le delete et exiger une approbation explicite pour les suppressions massives"
      checked: true
    - text: "Définir body, query, locale, origin, rate limit et kill switch pour l'API de recherche"
      checked: true
    - text: "Ne synchroniser en Production que les deployments dont le commit publié correspond à la corpus version"
      checked: true
    - text: "Consigner séparément implémenté, validé, vérifié en Preview et exploité en Production"
      checked: true
linkCards:
  - href: https://developers.cloudflare.com/vectorize/
    title: Documentation officielle de Cloudflare Vectorize
    description: "Consultez les spécifications actuelles des index, bindings, queries et du metadata filtering."
    icon: i-lucide-book-open
  - href: https://developers.cloudflare.com/vectorize/platform/limits/
    title: Limits actuelles de Vectorize
    description: "Les limites de batch, topK, metadata et nombre de vectors peuvent évoluer ; vérifiez-les à nouveau lors de l'implémentation."
    icon: i-lucide-gauge
  - href: /insights/astro-cloudflare-site-architecture/
    title: Architecture globale d'un site Astro ＋ Cloudflare
    description: "Un article qui organise les couches où placer HTML statique, Pages Functions, D1 et la recherche."
    icon: i-lucide-layers-3
faq:
  title: Questions fréquentes
  items:
    - question: Pagefind devient-il inutile après l'ajout de Vectorize ?
      answer: "Nous ne l'avons pas supprimé. Pagefind sert de recherche normale à faible dépendance, créée depuis le HTML statique ; Vectorize sert de recherche auxiliaire pour trouver des reformulations et des concepts liés. La recherche normale reste donc disponible même si AI ou Vectorize échoue."
    - question: D1 ou R2 est-il obligatoire pour intégrer Vectorize ?
      answer: "Non. D1 peut appliquer un rate limit à une API de recherche et R2 peut stocker du texte source ou des fichiers générés, mais aucun des deux n'est un stockage obligatoire de Vectorize. L'emplacement du texte source dépend des exigences : HTML public, JSON, D1, R2 ou autre."
    - question: Comment gérer l'embedding model et les dimensions dans l'implémentation actuelle ?
      answer: "Le embedding model, les dimensions et la metric se gèrent comme un seul contrat. Lors d'un changement de modèle, vérifiez le shape réel de la sortie et migrez vers un index séparé ; ne mélangez jamais des vectors de dimensions différentes dans un index. La configuration d'un index ne pouvant pas être modifiée après création, vérifiez la spécification officielle actuelle et la sortie réelle avant de le créer."
    - question: À quel moment l'intégration est-elle considérée comme terminée ?
      answer: "Un merge ou des tests locaux ne suffisent pas. En Preview, nous vérifions Pagefind et le fallback de l'interface ; en Production, la correspondance entre commit publié et corpus, la synchronisation de l'index, la convergence des mutations, la recherche associée, le rate limit et la procédure d'arrêt avant de consigner l'exploitation."
---

## À comprendre d'abord : qu'est-ce que Cloudflare Vectorize ?

Cloudflare Vectorize est la base de données vectorielle de Cloudflare. Elle stocke des **embeddings** — des représentations numériques des caractéristiques et du sens de textes, d'images et d'autres données — puis retrouve les informations dont le sens est proche d'une entrée. Comme l'explique la [présentation officielle](https://developers.cloudflare.com/vectorize/), elle peut servir à la recherche sémantique, aux recommandations, à la classification et à la couche de récupération de futures applications RAG.

La recherche classique par mots-clés excelle pour retrouver rapidement une page qui contient un nom de produit, un nom propre ou un code d'erreur. Vectorize aide au contraire lorsque les mots employés ne correspondent pas exactement. Une question telle que « je veux améliorer mon site » peut faire remonter une page sur l'accompagnement continu de l'exploitation web ou le conseil technique, même si la formulation diffère.

> Vectorize n'est pas, à lui seul, un chatbot qui génère une réponse. C'est une base de recherche qui sélectionne des pages publiques pertinentes et leurs URL. Si une IA générative est ajoutée plus tard, ces résultats peuvent devenir la couche de preuve de la réponse.

## Qu'apporte son ajout ?

- **Trouver des reformulations et des questions** : les lecteurs n'ont pas besoin de connaître les termes exacts du site pour atteindre une page proche de leur intention.
- **Relier les connaissances entre les contenus** : articles, FAQ et pages de services aux formulations différentes peuvent être découverts grâce à leur proximité de sens.
- **Renforcer la recherche existante au lieu de la remplacer** : en l'utilisant seulement pour une action explicite « trouver des informations liées » tout en gardant la recherche par mots-clés, on améliore la découvrabilité sans reconstruire toute l'UI.
- **Réutiliser la couche de récupération plus tard** : le retour de la page d'origine et de son URL rend la même couche utilisable pour des réponses d'IA citées, des articles liés ou des recommandations.

La recherche sémantique n'est toutefois pas magique. Sa qualité dépend d'un corpus public correctement sélectionné, d'un embedding model adapté et de l'évaluation de résultats réels. Elle ne doit pas remplacer la recherche classique pour des noms de produit ou des codes exacts.

## La superposer d'abord à la recherche existante

Pour une première adoption, le schéma le plus abordable consiste à conserver la recherche par mots-clés et à appeler Vectorize seulement lorsqu'un lecteur demande explicitement des informations liées.

1. Utiliser Pagefind ou une autre recherche classique pour les noms de produits, les noms propres et les termes courts exacts.
2. Utiliser la recherche liée de Vectorize pour les questions, les reformulations et les thèmes voisins.
3. Laisser la recherche classique disponible si l'embedding provider ou Vectorize échoue.

Il faut d'abord juger cette valeur et ce périmètre. La suite de l'article transforme ces décisions en pratiques d'implémentation et d'exploitation réutilisables sur Astro, Cloudflare Pages et d'autres sites statiques.

> **Une première configuration pratique :** Gardez la Pages Preview habituelle sur Pagefind seulement avec `SEARCH_ENABLED=false`, et limitez les bindings Vectorize/D1 ainsi que la synchronisation automatique à Production. Preview sert à vérifier l'interface et le fallback ; en Production, synchronisez seulement un corpus généré depuis le commit publié. Les permissions et données expérimentales restent ainsi hors de la recherche en ligne.

Lors de la préparation d'une intégration, on constate qu'il ne suffit pas de « créer des embeddings puis d'appeler `query()` ». Comment construire le contenu interrogeable, garder Preview sur Pagefind tout en protégeant Production, éviter une suppression massive causée par une mauvaise synchronisation et confirmer que les pages publiées correspondent réellement à l'index ? En exploitation, la conception autour des appels à l'API Vectorize est plus importante que les appels eux-mêmes.

## Conclusion : recherche fail-soft, synchronisation et publication fail-closed

Le principe le plus réutilisable consiste à séparer la politique de panne entre la recherche destinée aux utilisateurs et la synchronisation opérée par l'équipe.

| Cible                      | Politique en cas de panne | Raison                                                                                                                                   |
| -------------------------- | ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Recherche interne normale  | fail-soft                 | Continuer à chercher avec Pagefind même si Vectorize s'arrête                                                                            |
| API de recherche associée  | fail-soft                 | Fermer rapidement l'erreur sans détériorer les résultats de la recherche normale                                                         |
| Génération du corpus       | fail-closed               | Ne rien générer si les pages, la locale, le nombre ou les metadata sont incorrects                                                       |
| Synchronisation de l'index | fail-closed               | Ne rien modifier si l'environnement, les ID existants, le taux de suppression ou les mutations ne peuvent pas être confirmés             |
| Activation en Production   | fail-closed               | N'activer qu'après concordance du commit publié et du corpus, ainsi que convergence de la synchronisation et des mutations de Production |

Cette approche satisfait simultanément deux exigences : « la recherche du site reste disponible si la recherche par IA tombe » et « la synchronisation ne modifie aucun élément dès qu'un doute subsiste ».

## Décider d'abord ces quatre points

Avant de choisir un provider ou un nom d'index, décidez ces quatre points. Le reste de l'architecture sera alors beaucoup plus simple à choisir.

| Décision                   | Premier choix accessible                                            | Pourquoi                                                                               |
| -------------------------- | ------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| Objectif du lecteur        | « Trouver des pages associées »                                     | Vous pouvez évaluer la qualité de recherche avant d'ajouter une génération de réponse. |
| Entrée de recherche        | Pagefind pendant la saisie ; Vectorize après une action explicite   | Vitesse, coût et transmission des données restent clairs.                              |
| Source de vérité du corpus | HTML public                                                         | Les brouillons et écrans d'administration restent hors des résultats.                  |
| Flux de publication        | Vérifier l'interface en Preview ; synchroniser seulement Production | Permissions et données de test ne rejoignent pas la recherche en ligne.                |

Une fois ces quatre questions traitées, le embedding provider, D1, R2 ou la génération de réponses peuvent être choisis selon les besoins.

## Ne pas remplacer Pagefind : séparer les responsabilités

L'objectif de l'adoption de Vectorize n'était pas d'abandonner la recherche existante.

Pagefind crée un index statique à partir du HTML construit et effectue la recherche dans le navigateur. Il convient à la recherche normale de termes explicites, comme des noms de produits, de services ou des noms propres, et ne dépend pas de l'état d'un embedding provider ni de Vectorize.

Vectorize convient lorsque le terme recherché ne correspond pas exactement au texte ou lorsqu'on veut retrouver une page depuis un concept associé. Mais il nécessite la génération d'embeddings et une query Vectorize, avec la latence, les erreurs et la consommation de services externes qu'il faut prendre en compte.

Nous avons donc également séparé l'interface.

1. Afficher les suggestions Pagefind pendant la saisie
2. N'appeler l'API que lorsque l'utilisateur lance explicitement la recherche associée
3. Définir un timeout court pour l'API
4. Ne pas effacer les résultats Pagefind en cas d'échec de l'API
5. Pouvoir arrêter uniquement la recherche associée avec un kill switch

Dans le modal de recherche actuel, les suggestions pendant la saisie proviennent seulement de Pagefind dans le navigateur. Ce n'est qu'après l'action « Rechercher » que le terme est envoyé à l'OpenAI Embeddings API, comme l'indique l'interface, puis comparé aux informations publiques de ce site dans Vectorize. L'avertissement demande de ne pas saisir d'informations personnelles ou confidentielles et distingue cet envoi des suggestions ordinaires par mots-clés.

Avec cette structure, Vectorize élargit l'expérience de recherche sans devenir un point unique de défaillance.

## Créer le corpus depuis le HTML public, pas depuis les brouillons du CMS

La principale différence entre les sites concernait le choix de la source de vérité du contenu interrogeable.

Créer directement le corpus depuis des brouillons CMS ou du Markdown produit des écarts avec les pages réellement publiées.

- Du contenu marqué `draft` ou `noindex` peut être inclus
- Des pages pointant vers un canonical externe peuvent rester
- Du texte répété par le layout ou des interfaces d'administration peuvent être intégrés
- Les title, description et URL qui n'apparaissent qu'après conversion ne sont pas reflétés
- Les frontières de locale deviennent ambiguës sur un site multilingue

Nous avons donc lu le HTML généré après le build Astro et construit le corpus une fois les conditions de publication appliquées.

Pour un site japonais, un point de départ maniable est d'inclure seulement les pages répondant aux critères suivants.

- Posséder un canonical same-origin
- Avoir un `lang` japonais
- Ne pas être marquée `noindex`
- Ne pas être `/admin`, `/api`, une 404 ou une page de confirmation d'envoi
- Permettre l'exclusion des éléments hors contenu, comme `data-vectorize-ignore` et la navigation
- Posséder une URL publique root-relative et un title

Le texte est découpé en chunks avec une cible de 850 caractères, un maximum de 1,200 et un overlap de 120 caractères. Ces valeurs ne constituent pas une réponse universelle ; ce sont les paramètres d'exploitation retenus pour la longueur des pages et le texte japonais de ce cas. Sur un autre site, ajustez-les selon la structure réelle des documents et l'évaluation de la recherche.

## Rendre la synchronisation différentielle déterministe avec content hash

Si les vector IDs sont des numéros séquentiels ou des UUID générés à l'exécution, même un corpus identique produira des ID différents à la génération suivante. Cela recalcule les embeddings de textes inchangés et impose une suppression massive des anciens ID.

Nous créons donc un SHA-256 à partir de locale, de l'URL publique, du numéro de chunk et du texte, puis nous générons l'ID et la corpus version de manière déterministe.

```js
const identity = [locale, url, String(chunkIndex), text].join("\u001f");
const digest = sha256(identity);

const vector = {
  id: `v1-${digest.slice(0, 48)}`,
  text,
  metadata: {
    locale,
    url,
    chunkIndex,
    contentHash: digest,
  },
};
```

Pendant la synchronisation, nous comparons les ID attendus aux ID actuels de l'index.

- Créer les embeddings et effectuer l'upsert des ID présents uniquement dans l'ensemble attendu
- Traiter les ID présents des deux côtés comme inchangés et les skip
- Considérer comme candidats à la suppression les ID présents uniquement dans l'index
- S'arrêter avant toute mutation si l'index contient des ID hors du périmètre géré `v1-`

Ainsi, un même contenu public produit le même corpus et la raison de chaque différence reste explicable.

## Fixer l'embedding model et la configuration de l'index comme un contrat

Choisissez le embedding provider et le model selon les langues cibles, la qualité de recherche, la latence et le coût. Par exemple, avec [OpenAI Embeddings](https://platform.openai.com/docs/guides/embeddings) `text-embedding-3-large`, vérifiez la sortie réelle et créez un index cosine à 1,536 dimensions nommé séparément. Si le model change, migrez vers un index du nouveau contrat et ne mélangez pas des vectors de dimensions différentes.

Plus que le nom du modèle, l'important est de conserver le même contrat aux quatre endroits suivants.

| Emplacement               | Valeur fixée                        |
| ------------------------- | ----------------------------------- |
| corpus metadata           | model, dimensions, metric           |
| Vectorize index           | dimensions, metric                  |
| API de recherche          | model, embedding length             |
| Script de synchronisation | model, dimensions, metric autorisés |

Comme l'indique la page [Create indexes](https://developers.cloudflare.com/vectorize/best-practices/create-indexes/) de Cloudflare, les dimensions et la metric de l'index ne peuvent pas être modifiées après sa création. Si la documentation du modèle est ambiguë, ne créez pas l'index par supposition : vérifiez la documentation actuelle et la sortie réelle.

Pour utiliser metadata filtering, créez le metadata index avant d'insérer les vectors. Les vectors déjà insérés ne deviennent pas éligibles simplement parce qu'un metadata index est ajouté ensuite ; un nouvel upsert est nécessaire.

Les limits du produit évoluent également. Recontrôlée le 31 juillet 2026, Vectorize V2 a une limite d'upsert batch de 1,000 pour Workers API et de 5,000 pour HTTP API. La limite habituelle de `topK` est de 100 et passe à 50 avec `returnValues: true` ou `returnMetadata: "all"`. Au moment de l'implémentation, consultez toujours les [limits actuelles](https://developers.cloudflare.com/vectorize/platform/limits/) et la [client API](https://developers.cloudflare.com/vectorize/reference/client-api/).

Choisissez des batches de synchronisation et un `topK` de recherche sous les limites du produit, en partant de valeurs que votre équipe peut réessayer et surveiller en sécurité. Les limits du produit et une taille de traitement sûre sont deux décisions différentes.

## Effectuer l'upsert, attendre la convergence, puis seulement exécuter le delete

Les opérations insert, upsert et delete de Vectorize sont asynchrones. Une réponse positive de l'API ne signifie pas que la modification est déjà reflétée dans les queries.

Une synchronisation sûre suit cet ordre.

1. Valider le corpus et la configuration de l'index
2. Récupérer tous les vector IDs actuels par pagination
3. Calculer les éléments à upsert et les candidats au delete
4. Exécuter l'upsert par batches
5. Attendre que le `mutationId` renvoyé atteigne `processedUpToMutation`
6. Exécuter le delete seulement après convergence de l'upsert
7. Confirmer également la convergence de la mutation de delete

La [Vectorize API](https://developers.cloudflare.com/vectorize/reference/client-api/) de Cloudflare précise elle aussi que les mutations sont asynchrones. Ne vous contentez pas d'un sleep d'une durée fixe ; utilisez le mutation ID pour confirmer l'achèvement.

Le script de synchronisation contient en outre les conditions d'arrêt suivantes.

- Le nom de l'index cible ne correspond pas exactement à l'allowlist de l'index Production
- Le processus tente de créer automatiquement un index de Production
- La valeur de `--confirm-production` ne correspond pas au nom de l'index cible
- dimensions／metric diffèrent du contrat
- locale, URL, metadata ou content hash du corpus est invalide
- Le nombre de source pages ou de vectors dépasse la limite prévue
- L'index existant contient des ID hors du périmètre géré
- Plus de 20% des vectors existants seraient supprimés
- La limite de retries ou le délai d'attente d'une mutation est dépassé

Même une suppression massive intentionnelle est traitée par une procédure de migration revue séparément, sans override dans le workflow normal. Un push normal ou un schedule ne l'autorise jamais.

## Garder Preview sur Pagefind seulement et faire de Production l'unique cible de synchronisation à privilèges élevés

La séparation de Preview et Production lors de la phase initiale a permis d'identifier les permissions et conditions d'arrêt. Toutefois, une Pages Preview normale n'a pas besoin de bindings Vectorize ou D1. La configuration actuelle conserve `SEARCH_ENABLED=false` : Preview sert à vérifier les suggestions Pagefind, le fallback et la mise en page. Les bindings Vectorize et D1, les tokens de synchronisation et le Production Environment sont limités à Production.

Nous séparons les éléments suivants.

- Vectorize index
- Ressources auxiliaires comme D1
- Wrangler environment
- API token
- GitHub Environment
- concurrency du workflow de synchronisation
- repository variable d'activation
- kill switch

Le token de synchronisation est limité à Vectorize Read / Write sur le compte Cloudflare cible et reste séparé de la OpenAI API key. Production ne peut s'exécuter que depuis le `main` protégé et passe par les reviewers du GitHub Environment.

Cela implique aussi un trade-off opérationnel. Lorsqu'un Production Environment impose un reviewer, une synchronisation déclenchée par schedule peut également rester en attente d'approbation. Avant d'ajouter le cron, il faut décider si seule la première publication est approuvée, si chaque synchronisation périodique l'est, ou si des jobs distincts sont nécessaires.

## Ne synchroniser en Production que le corpus du commit publié

Le `main` de GitHub et le commit actuellement publié sur Cloudflare Pages ne sont pas toujours identiques. Juste après un push, le build peut être en cours ; si le deployment échoue, le commit précédent peut rester publié.

Nous plaçons donc un build marker sur le site public et vérifions les points suivants pendant la synchronisation de Production.

- Le commit du marker est un Git SHA de 40 caractères
- Ce commit existe dans le repository
- Il est un ancêtre du `main` protégé
- Son checkout permet de régénérer le corpus
- La corpus version du marker correspond au résultat régénéré
- Le même commit est toujours public immédiatement avant la mutation

Le critère d'achèvement est un deployment Cloudflare Pages connecté au GitHub repository. Un artefact temporairement publié en local ou par Direct Upload ne sert pas de référence à la synchronisation de Production.

Cela évite des écarts tels que « synchroniser un nouveau corpus sur un ancien site » ou « afficher dans les résultats le contenu d'un commit dont le deployment a échoué ».

## Définir les limites de coût et de confidentialité de l'API publique de recherche

L'API de recherche est un endpoint public qui transmet le texte saisi à un embedding provider. Au-delà de la pertinence, il faut concevoir la protection contre les abus, le coût, les logs et les URL renvoyées.

Par exemple, une API de recherche publique peut appliquer les limites suivantes.

| Élément         | Exemple implémenté                                                             |
| --------------- | ------------------------------------------------------------------------------ |
| method／format  | Accepter uniquement un JSON POST same-origin                                   |
| body            | 2KiB maximum ; interrompre la lecture du stream même sans `Content-Length`     |
| query           | 2〜160 caractères après normalisation NFKC                                     |
| locale          | `ja` uniquement                                                                |
| rate limit      | Limites distinctes par client et globales selon l'usage et le coût attendus    |
| arrêt           | Désactiver uniquement la recherche associée avec `SEARCH_ENABLED`              |
| query           | Ne pas stocker la raw query dans les logs, le corpus ou les Vectorize metadata |
| URL de résultat | N'autoriser que des URL publiques root-relative et same-origin                 |
| erreur          | Renvoyer un code structuré par étape sans journaliser le corps                 |

Un UUID côté client n'est pas une limite de coût forte, car l'utilisateur peut le modifier. Nous combinons une client key dérivée des informations de connexion Cloudflare, une global limit et le suivi de la consommation. Selon l'échelle et la menace, Turnstile, WAF ou Durable Objects peuvent aussi être envisagés.

D1 sert ici au rate limit, mais n'est pas obligatoire pour intégrer Vectorize. Il en va de même pour R2. Le choix dépend de l'origine du texte et de l'endroit où conserver le rate limit.

## Donner des contrats distincts à la recherche associée et au chat AI génératif

La recherche associée transforme un terme soumis explicitement en embedding et cherche des pages publiques proches. Le chat AI génératif est une fonction distincte qui construit une réponse à partir d'une question et, souvent, d'un historique de conversation.

Il ne faut pas les confondre sous une vague « recherche AI ». Les données transmises, le périmètre des sources, l'affichage en cas d'échec, l'utilisation et les explications de confidentialité doivent être conçus séparément ; un fallback de recherche associée ne doit jamais être envoyé silencieusement au chat AI génératif.

## Ne pas mélanger les responsabilités des sources de recherche

Les sources dont la fréquence de mise à jour et l'exigence d'exactitude diffèrent — pages d'entreprise, procédures de support, politiques ou connaissances internes — doivent utiliser des destinations de recherche différentes.

- Cherchez les explications du site public seulement dans son corpus public.
- Cherchez les politiques et procédures changeantes dans leur source officielle primaire.
- Ne revenez pas d'une recherche associée vers une source sans rapport.
- Liez uniquement les pages choisies comme justification.
- Ne déduisez pas une information qui ne peut pas être vérifiée dans sa source.

Ce point est également important pour le RAG et les chats d'assistance. Plus le nombre de sources interrogeables augmente, plus il faut décider en amont où envoyer chaque type de question et ce qu'il ne faut pas répondre lorsqu'aucune information n'est disponible.

## Pannes réelles et changements apportés ensuite

Voici les problèmes récurrents à prendre en compte dès le départ.

| Symptôme                                                      | Cause                                                       | Action suivante                                                                     |
| ------------------------------------------------------------- | ----------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| L'ajout d'un binding ne produit pas de fonction de recherche  | API, corpus, reindex, permissions et UI ne sont pas conçus  | Définir le contrat de recherche et le flux opérationnel avant de créer l'index      |
| Les dimensions sont supposées à la création de l'index        | Le nom du modèle est utilisé sans vérifier la sortie réelle | Vérifier l'embedding length réel avant la création                                  |
| Les vectors existants n'apparaissent pas avec metadata filter | Ils ont été insérés avant le metadata index                 | Créer d'abord le metadata index et effectuer un nouvel upsert des vectors existants |
| La query est instable juste après la synchronisation          | La mutation est asynchrone                                  | Attendre la convergence avec `mutationId` et les informations de l'index            |
| De nombreux embeddings et deletes sont recalculés             | Le vector ID change à chaque exécution                      | Utiliser des ID déterministes dérivés du content hash                               |
| Un schedule reste bloqué en waiting                           | Le Production Environment exige une approbation             | Concevoir ensemble la synchronisation périodique et la politique d'approbation      |
| Des tests ou Git échouent sous Windows                        | Facteurs d'environnement comme `spawn EPERM`, lock ou cache | Isoler par comparaison au baseline, Node version fixe et nouveau `npm ci`           |
| Un timeout API est pris pour un défaut du code                | Incident temporaire, mauvais payload ou latence du provider | Retester avec le bon contrat et distinguer résultat isolé et reproductibilité       |

Il est également essentiel de ne pas attribuer à tort un problème de dépendance ou d'environnement à la modification Vectorize. Vérifiez si la même erreur apparaît sur le baseline antérieur et séparez les défaillances du code de celles de l'environnement.

## Consigner « déployé » en quatre étapes

Dans les articles et rapports de fin, séparer les états suivants réduit les malentendus.

| État                   | Exemple de critère d'achèvement                                                                      |
| ---------------------- | ---------------------------------------------------------------------------------------------------- |
| Implémenté             | API, corpus, script de synchronisation et UI existent dans la branch                                 |
| Validé localement      | build, typecheck, tests de contrat et dry-run réussis                                                |
| Vérifié en Preview     | Suggestions Pagefind, affichage lorsque la recherche associée est indisponible et interface vérifiés |
| Exploité en Production | Commit publié synchronisé, convergence des mutations, API et procédure d'arrêt confirmés             |

Utilisez également ces étapes dans les notes de publication et les rapports d'achèvement. Elles évitent de confondre une branch qui contient seulement du code avec une recherche publiée en sécurité.

Consigner non seulement le nombre de tests réussis, mais aussi ce qui n'a pas encore été vérifié, constitue l'information opérationnelle la plus utile pour la personne suivante.

## Configuration minimale pour déployer sur un autre site

Pour appliquer cette solution à un autre site Astro／Cloudflare Pages, la configuration minimale ressemble au flux suivant.

```txt
Astro build
  -> HTML public
  -> Pagefind index
  -> Vectorize corpus (reflète locale / canonical / noindex)

Cloudflare Pages Function
  -> input validation
  -> OpenAI Embeddings API
  -> Vectorize query
  -> renvoie uniquement des URL publiques

GitHub Actions
  -> résout le commit publié
  -> régénère le corpus
  -> synchronise seulement l'index Production dans l'allowlist
  -> exécute delete après convergence de l'upsert
  -> consigne la corpus version

Pages Preview
  -> SEARCH_ENABLED=false
  -> vérifie les suggestions Pagefind et le fallback de l'interface
```

Il n'est pas nécessaire d'ajouter dès le départ la génération de réponses par LLM. Commencez par une recherche capable de « renvoyer des pages associées en sécurité » et qui peut être évaluée. Même si vous ajoutez ensuite la génération de réponses, traitez le texte récupéré, les URL citables et les conditions dans lesquelles il ne faut pas répondre comme des contrats séparés.

## Conclusion

La difficulté de l'intégration de Cloudflare Vectorize ne réside pas dans la nearest-neighbor query elle-même.

Quelles informations publiques indexer, comment reconnaître les chunks inchangés, arrêter une mauvaise synchronisation, correspondre au commit publié et préserver la recherche normale en cas de panne : cette conception opérationnelle détermine la qualité lors du déploiement sur un autre site.

Notre conclusion est simple.

- Conserver Pagefind comme recherche principale
- Utiliser Vectorize comme complément de recherche sémantique
- Créer le corpus depuis le HTML public
- Générer ID et version de façon déterministe avec content hash
- Garder Preview sur Pagefind seulement et limiter Vectorize, D1 et les permissions de synchronisation à Production
- Rendre la recherche fail-soft, et la synchronisation et la publication fail-closed
- Consigner « implémentation », « validation locale », « vérification de l'interface Preview » et « Production » comme des états distincts

En posant ces limites dès le départ, Vectorize devient plus facile à exploiter non comme une fonction d'IA ponctuelle, mais comme une infrastructure de recherche continuellement actualisable.
