---
title: "Concevoir un site Astro + Cloudflare qui grandit fonctionnalité par fonctionnalité"
description: "Comment nous avons combiné Astro et Cloudflare Pages avec un chat IA, Sveltia CMS, un blog multilingue, des CTA de services, un rendu Markdown sécurisé et des commentaires sans service externe."
date: 2026-06-07T19:00
lastUpdated: "2026-10-06T13:58:01+09:00"
author: gui
tags: ["Technologie", "Astro", "Cloudflare", "Site web", "AI", "CMS"]
image: "/images/insights/covers/astro-cloudflare-site-architecture-cover-v2.webp"
callout:
  type: tip
  title: Définir les limites avant d'ajouter des fonctions
  text: "Chat IA, CMS, localisation et commentaires sont utiles, mais ils ont besoin de limites claires dans le même site. Astro génère le HTML statique, Cloudflare livre le site et traite les petites API, GitHub garde les changements vérifiables."
processFigure:
  eyebrow: Site Architecture
  title: Couches d'extension du site
  description: Garder le site statique par défaut et ajouter du dynamique seulement où c'est nécessaire.
  variant: inline
  steps:
    - title: Livrer
      description: Générer le HTML avec Astro et le servir sur Cloudflare Pages.
      icon: i-lucide-rocket
      accent: brand
    - title: Éditer
      description: Modifier la source japonaise dans Sveltia CMS et revoir par PR.
      icon: i-lucide-file-pen-line
      accent: emerald
    - title: Traduire
      description: Garder les traductions dans des PR plutôt que dans toute l'interface CMS.
      icon: i-lucide-languages
      accent: amber
    - title: Guider
      description: Utiliser le chat IA et les CTA de services pour orienter vers le bon formulaire.
      icon: i-lucide-route
      accent: slate
compareTable:
  title: Différences entre ajouter des fonctions isolées et les intégrer à une architecture globale
  before:
    label: Ajouter chaque fonction séparément
    items:
      - "L’IA, le CMS, les commentaires et les formulaires finissent par suivre des principes de conception différents"
      - "Les scripts et interfaces de services externes se multiplient, dispersant la responsabilité d’explication"
      - "Des écarts apparaissent facilement entre les URL multilingues, l’index de recherche et l’environnement de prévisualisation"
      - "Les relations entre fonctions restent invisibles et l’ordre d’adoption est difficile à décider"
  after:
    label: Ajouter par couches
    items:
      - "Les rôles d’Astro, Cloudflare, GitHub et de l’API OpenAI peuvent être expliqués séparément"
      - "Les API dynamiques sont regroupées dans Pages Functions et le stockage peut être rapproché de Cloudflare avec D1"
      - "Les mises à jour du CMS, les traductions, la recherche, RSS et sitemap partagent la même structure de contenu"
      - "La page se parcourt facilement comme un index par usage et ordre d’adoption"
checklist:
  title: Vérifications de conception pour réutiliser cette architecture sur un autre site
  items:
    - text: "Séparer ce qui peut être généré statiquement de ce qui nécessite une API"
      checked: true
    - text: "Séparer le CMS comme entrée d’édition, la traduction sous forme de PR et la décision de publication au build"
      checked: true
    - text: "Ne pas transmettre de données personnelles à l’IA de contact et la laisser guider uniquement avec des informations publiées"
      checked: true
    - text: "Transmettre le contexte du formulaire par des paramètres d’URL et conserver des valeurs reçues stables"
      checked: true
    - text: "Définir explicitement dans la configuration le nom physique de D1 et son binding pour les données soumises, comme les commentaires"
      checked: true
    - text: "Ne pas faire confiance aux sorties d’IA ni aux contributions utilisateur comme HTML et les traiter par listes d’autorisation"
      checked: true
faq:
  title: Questions fréquentes
  items:
    - question: Par où faut-il commencer ?
      answer: "Commencez par consolider les pages statiques Astro, le blog, RSS, sitemap et OGP. Ajoutez ensuite le CMS et les langues ; lorsque le parcours de contact devient nécessaire, ajoutez le chat IA, les CTA de services et les commentaires."
    - question: Faut-il tout construire uniquement avec Cloudflare ?
      answer: "Non. Certaines parties, comme l’IA de contact, utilisent l’API OpenAI. L’essentiel est de rapprocher de Cloudflare la diffusion, la frontière des API, la base de données et la protection antibot, tout en choisissant consciemment où employer des services externes."
    - question: Un petit site a-t-il besoin de tout cela ?
      answer: "Il n’est pas nécessaire de tout intégrer dès le départ. Mais si vous prévoyez un CMS, un parcours de contact, plusieurs langues ou des commentaires, décider tôt des URL, du stockage, de l’environnement de prévisualisation et de l’index de recherche facilitera la suite."
linkCards:
  - href: /fr/blog/astro-ai-contact-chat/
    title: Conception technique du chat IA de contact
    description: Frontières API et contrôle des réponses avec les informations du site.
    icon: i-lucide-bot
  - href: /fr/blog/cms-selection-and-turnstile/
    title: Guide d'installation de Sveltia CMS
    description: CMS, GitHub backend, OAuth et exploitation par PR pour un site statique.
    icon: i-lucide-badge-check
  - href: /fr/blog/copilot-translation-pipeline/
    title: Exploiter un blog multilingue avec Sveltia CMS
    description: Publier des pages statiques localisées au lieu d'une traduction uniquement en UI.
    icon: i-lucide-languages
  - href: /blog/service-cta-contact-prefill/
    title: Transmettre le contexte du CTA au formulaire
    description: Conserver le service consulté dans la catégorie et le sujet du formulaire.
    icon: i-lucide-route
  - href: /fr/blog/ai-chat-markdown-link-safety/
    title: Rendu sécurisé des liens Markdown de l'IA
    description: Rendre seulement les liens autorisés sans traiter la sortie IA comme du HTML fiable.
    icon: i-lucide-shield-check
  - href: /fr/blog/cloudflare-only-blog-comments/
    title: Commentaires de blog avec Cloudflare seulement
    description: Commentaires sans service externe, avec Pages Functions, D1 et Turnstile.
    icon: i-lucide-message-square-text
---

**Mise à jour du 26 septembre 2026 :** Cet article décrit l’architecture de juin 2026. Dans le code ultérieur, le CMS enregistre directement sur `main` via une GitHub App après vérification des droits, du contenu et de HEAD ; les traductions passent par OpenAI Batch et des PR ; l’IA de contact appelle un Worker partagé via Service Binding. Les passages ci-dessous sur Copilot, les enregistrements CMS par PR et les appels directs à l’API d’IA décrivent l’ancienne version. Voir les guides [CMS](/fr/blog/cms-selection-and-turnstile/), [traduction](/fr/blog/copilot-translation-pipeline/) et [IA](/fr/blog/astro-ai-contact-chat/).

Quand on démarre avec Astro et Cloudflare Pages, des pages statiques rapides et sûres suffisent souvent.

Avec le temps, de nouveaux besoins arrivent : édition depuis le navigateur, pages localisées, orientation par chat IA, transmission du contexte au formulaire et commentaires.

Cet article est un index d'implémentation : il aide à décider dans quelle couche placer chaque fonction, dans quel ordre les ajouter et quel guide lire ensuite. L'exemple vient du site Acecore, mais le modèle s'applique à d'autres sites Astro + Cloudflare.

## Résumé

L'architecture sépare les rôles :

| Couche      | Rôle                                     |
| ----------- | ---------------------------------------- |
| Astro       | Pages, blog, OGP, RSS, sitemap et UI     |
| Cloudflare  | Pages, Pages Functions, D1 et Turnstile  |
| GitHub      | PR, diffs CMS, traductions et historique |
| Sveltia CMS | Source japonaise, auteurs, tags, images  |
| OpenAI API  | Réponses du chat de contact              |
| Pagefind    | Index de recherche pour HTML revu        |

Ce qui peut être statique reste statique. Le dynamique passe par de petites API.

## Petites API sur Cloudflare

Le chat IA et les commentaires suivent le même modèle.

Astro rend l'interface. Pages Functions gère la frontière API. Les secrets, bindings D1, Turnstile, Origin checks et rate limits restent côté serveur.

## CMS comme surface d'édition

Sveltia CMS n'est pas une base de données runtime. Il crée des changements Git.

Le contenu japonais, les auteurs, tags, images et JSON passent par PR, build et review.

## Traduction comme contenu statique

La localisation n'est pas une traduction de l'interface au moment de l'affichage.

Chaque langue a sa propre URL, son title, sa description, ses métadonnées OGP, JSON-LD, RSS, sitemap et hreflang.

## Canaux de contact séparés

Le chat IA aide les visiteurs qui hésitent. Le CTA de service conserve le contexte. Le formulaire enregistre la demande formelle.

Chaque canal a son rôle.

## La sortie IA n'est pas du HTML fiable

Les liens Markdown de l'IA sont traités comme du texte jusqu'à validation.

Seuls les liens autorisés par allowlist deviennent des éléments DOM sûrs.

## Commentaires dans Cloudflare

Les commentaires ne reposent pas sur un widget externe.

Pages Functions reçoit GET/POST, D1 stocke les commentaires et Turnstile protège les envois.

<figure class="article-diagram" data-layout="boundary" data-tone="teal" data-count="3" aria-labelledby="diagram-astro-cloudflare-site-architecture">
  <figcaption>
    <strong id="diagram-astro-cloudflare-site-architecture">Frontières de publication entre contenu, contributions et administration</strong>
    <span>Le contenu statique révisé est indexé ; les contributions et l’administration relèvent d’autres frontières. Preview et production se vérifient séparément.</span>
  </figcaption>
  <ol class="article-diagram__nodes">
    <li>
      <span class="article-diagram__symbol">
        <span aria-hidden="true">1</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
          <path d="M6 3h9l4 4v14H6z M15 3v5h4 M9 12h7 M9 16h7"/>
        </svg>
      </span>
      <strong>Contenu statique révisé</strong>
      <span>Publier les articles révisés en HTML statique et les inclure dans l’index Pagefind.</span>
    </li>
    <li>
      <span class="article-diagram__symbol">
        <span aria-hidden="true">2</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
          <path d="M4 5h16v12H9l-5 4z M8 9h8 M8 13h5"/>
        </svg>
      </span>
      <strong>Contributions des visiteurs</strong>
      <span>Les commentaires passent par une API et un stockage dynamiques ; exclure formulaires et autres saisies de la recherche statique. Leur indexation exige modération et régénération.</span>
    </li>
    <li>
      <span class="article-diagram__symbol">
        <span aria-hidden="true">3</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
          <path d="M12 2l8 4v6c0 5-3 8.5-8 10-5-1.5-8-5-8-10V6z M9 12h6"/>
        </svg>
      </span>
      <strong>Administration et environnements</strong>
      <span>Exclure l’administration de la recherche publique. Vérifier Preview et production séparément ; la configuration seule ne prouve pas l’exécution.</span>
    </li>
  </ol>
</figure>

## Lire par objectif

Il n'est pas nécessaire de tout lire d'abord. Commencez par la fonction à ajouter.

| Objectif                                         | Lire d'abord                                                                                     |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------ |
| Modifier articles et images depuis le navigateur | [Guide d'installation de Sveltia CMS](/fr/blog/cms-selection-and-turnstile/)                     |
| Publier des pages multilingues indexables        | [Exploiter un blog multilingue avec Sveltia CMS](/fr/blog/copilot-translation-pipeline/)         |
| Guider les visiteurs avec le chat IA             | [Conception technique du chat IA de contact](/fr/blog/astro-ai-contact-chat/)                    |
| Rendre des liens sûrs dans les réponses IA       | [Rendu sécurisé des liens Markdown dans les réponses IA](/fr/blog/ai-chat-markdown-link-safety/) |
| Transmettre le contexte du service au formulaire | [Transmettre le contexte du CTA au formulaire](/blog/service-cta-contact-prefill/)               |
| Ajouter des commentaires sans service externe    | [Commentaires de blog Astro avec Cloudflare seulement](/fr/blog/cloudflare-only-blog-comments/)  |

## Ordre d'implémentation

Pour un site similaire, l'ordre pratique est :

1. Stabiliser les pages statiques, le blog, RSS, sitemap et OGP avec Astro.
2. Ajouter Sveltia CMS pour modifier la source japonaise.
3. Générer les pages localisées en HTML statique.
4. Ajouter le guidage par chat IA et les CTA de services.
5. Verrouiller les liens Markdown, le prefill de formulaire, les Origin checks et les rate limits.
6. Ajouter les commentaires dans Cloudflare seulement quand ils deviennent nécessaires.

## Conclusion

Astro + Cloudflare permet d'étendre un site institutionnel sans perdre les avantages du statique.

Utilisez cette page comme point d'entrée et n'ajoutez que les éléments dont votre site a besoin, sans affaiblir la base statique.

## Complément : séparer les environnements et configurations de build des Workers

Ajout du 30 septembre 2026. Nous généralisons des améliorations de configuration sans noms de services ni réglages internes. Pour plusieurs Workers dans un dépôt, associez chaque configuration Wrangler à sa racine source et à ses cibles de build et de déploiement. Des fichiers séparés ne prouvent pas l’isolation.

Vérifiez variables, secrets et destinations D1, R2 et Service Binding en production et en test. Les bindings et variables des environnements Worker ne sont pas hérités automatiquement : déclarez-les par environnement. Une configuration obligatoire manquante doit arrêter le traitement plutôt que sélectionner silencieusement la production. Staging persistant et Previews de branches ou PR sont des flux distincts.

Définissez une seule voie de publication en production avec des contrôles préalables. Les builds ou versions hors production servent à valider : leur succès ne les promeut pas en production. Pour les builds Git, vérifiez branche, commit, racine, configuration, environnement et commande de déploiement. Une publication Pages réussie ne prouve pas le déploiement d’un Worker distinct. Vérifiez séparément CI, build de production, versions et connexions actives, puis comportement du domaine. Ce sont des contrôles pour adapter le modèle, pas une preuve d’isolation de tous les services.

Consultez les [environnements Worker](https://developers.cloudflare.com/workers/wrangler/environments/), les [Builds multi-Workers](https://developers.cloudflare.com/workers/ci-cd/builds/advanced-setups/) et la [configuration Builds](https://developers.cloudflare.com/workers/ci-cd/builds/configuration/). Distinguez la [configuration Pages Functions](https://developers.cloudflare.com/pages/functions/wrangler-configuration/).

## Complément : borner les tentatives et isoler les échecs par source

Ajout du 30 septembre 2026. Importer des flux publics comme RSS diffère de la publication RSS. Limitez l’attente et le nombre de tentatives afin qu’un échec temporaire ne prolonge pas indéfiniment une tâche.

Traitez les sources séparément. Un échec ne doit pas arrêter les entrées qui peuvent être actualisées indépendamment. Ne présentez pas un succès partiel comme complet : conservez les résultats par source et les échecs restants dans le rapport. Vérifiez séparément récupération, données générées, builds de production et pages publiques. Ce sont des contrôles généraux, pas une preuve de toutes les situations d’échec ou intégrations futures.

## Ajout du 6 octobre 2026 : contrat d’API et périmètre de vérification des pièces jointes

Dans une modification anonymisée, un parcours a été corrigé : le désaccord entre les contrats de session et de limite du frontend et du backend transformait la réponse en 503 même après la réussite de l’opération. Le résultat HTTP, l’état enregistré et l’affichage dans l’interface sont vérifiés séparément ; les nouvelles tentatives du client sont gérées pour éviter une double écriture.

La présence d’un champ de pièce jointe ne signifie pas non plus que le transfert, le stockage et la récupération du fichier réel ont été vérifiés. Une modification de l’interface ou de l’API ne suffit pas à achever ces contrôles. Les limites entre un site public statique et une interface d’administration privée sont décrites dans [Authentification et agrégation du tableau de bord privé](/insights/private-dashboard-access-and-aggregation/) ; la vérification des états externes de paiement figure dans [Gestion des états des webhooks](/insights/cloudflare-payment-event-boundaries/).
