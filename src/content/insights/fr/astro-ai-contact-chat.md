---
title: "Conception technique de l'intégration d'un chat IA de contact dans un site Astro"
description: "Conception de référence établie en 2026/6. Ce document présente la conception technique d'un chat IA de contact utilisant l'API OpenAI Responses dans un site statique construit avec Astro + Cloudflare Pages. Il organise, sous une forme facilement réutilisable sur d'autres sites, la frontière de l'API, le contexte du site, le contrôle des prompts, les URL par locale, la vérification de l'origine, la limitation du débit et le rendu sécurisé des liens Markdown."
date: 2026-06-07T12:00
lastUpdated: "2026-11-12T00:00:00+09:00"
author: gui
tags: ["Technologie", "Cloudflare", "Site web", "IA", "Services"]
image: "/images/insights/covers/astro-ai-contact-chat-cover-v2.webp"
callout:
  type: info
  title: Points clés de cet article
  text: Le chat IA de contact ne doit pas être conçu comme une fonction qui laisse l'IA répondre librement, mais comme une petite application qui s'appuie sur les informations publiées du site pour guider les visiteurs vers le parcours approprié. La clé API, les prompts, les coordonnées et le rendu Markdown sont contrôlés côté serveur et au moyen de listes d'autorisation.
processFigure:
  title: Architecture de référence d'un chat IA de contact
  steps:
    - title: Widget
      description: L'interface de chat côté Astro n'envoie que la question, la locale d'affichage et l'historique strictement nécessaire.
      icon: i-lucide-message-circle
      accent: brand
    - title: Fonction
      description: La Cloudflare Pages Function prend en charge la validation des entrées, la vérification de l'origine, la limitation du débit et la génération du prompt.
      icon: i-lucide-shield-check
      accent: amber
    - title: Modèle
      description: Elle transmet à l'API OpenAI Responses les informations publiées du site et le contexte de la conversation, puis reçoit le texte de la réponse.
      icon: i-lucide-sparkles
      accent: emerald
    - title: Moteur de rendu
      description: Côté client, seul le Markdown autorisé est converti en DOM afin de guider les visiteurs vers les liens internes et les coordonnées.
      icon: i-lucide-code-2
      accent: slate
compareTable:
  title: Responsabilités à séparer lors de l'intégration
  before:
    label: Implémentation regroupée
    items:
      - L'API IA est appelée directement depuis le navigateur
      - Les informations du site, la clé API, l'affichage de l'interface et le rendu des liens sont mélangés
      - L'IA risque d'affirmer des informations sur les tarifs, les contrats et les délais
      - Le Markdown et les URL risquent d'être injectés tels quels dans le HTML
  after:
    label: Responsabilités séparées
    items:
      - La clé API et les appels au modèle restent côté serveur
      - Les informations publiées du site sont gérées explicitement comme contexte
      - Le prompt définit le périmètre des réponses et les parcours de contact
      - Le Markdown et les URL sont rendus à l'aide de listes d'autorisation
checklist:
  title: Points à vérifier pour intégrer cette solution à un autre site
  items:
    - text: Définir l'objectif du chat IA comme une aide à l'orientation, et non comme un moyen de traiter les demandes de bout en bout
    - text: Créer une frontière API côté serveur sans exposer la clé API dans le navigateur
    - text: Limiter les informations utilisées pour les réponses aux seules informations publiées sur le site
    - text: Définir les sujets sur lesquels l'IA ne doit pas se prononcer, comme les tarifs, les contrats, les délais et les garanties
    - text: Définir les règles d'orientation vers le formulaire, LINE, l'e-mail ou le téléphone
    - text: Générer des URL par locale afin de préserver les parcours multilingues
    - text: Ajouter une vérification de l'origine, des limites de longueur des entrées et de taille de l'historique, ainsi qu'une limitation du débit
    - text: Vérifier les liens Markdown après trim à l'aide d'une liste d'autorisation
linkCards:
  - href: /contact/
    title: Contact
    description: Une page qui organise les accès au chat IA, à LINE, au formulaire et aux coordonnées directes.
    icon: i-lucide-message-square
  - href: /insights/cloudflare-pages-security/
    title: Sécurité de Cloudflare Pages
    description: Un article sur les fondations de la diffusion d'un site statique, notamment la CSP et les en-têtes.
    icon: i-lucide-shield
  - href: /blog/cms-selection-and-turnstile/
    title: Guide d'intégration de Sveltia CMS
    description: Un article associé sur l'ajout d'une interface de gestion de contenu à un site statique.
    icon: i-lucide-badge-check
faq:
  title: Questions fréquentes
  items:
    - question: Peut-on créer un chat IA de contact sans RAG ni base de données vectorielle ?
      answer: Pour un petit site d'entreprise, il est tout à fait possible de commencer par transmettre au prompt les points clés des pages publiées sous forme de contexte structuré. Il suffira d'envisager un index de recherche ou une base de données vectorielle lorsque le nombre de pages ou la fréquence des mises à jour augmentera.
    - question: La clé API OpenAI est-elle exposée dans le navigateur ?
      answer: Non. Le navigateur se contente d'envoyer la question à /api/ai-contact. L'appel à l'API OpenAI Responses et la gestion de la clé API sont effectués côté Cloudflare Pages Function.
    - question: Peut-on afficher librement des liens dans les réponses de l'IA ?
      answer: Non. Seuls les chemins internes, la même origine, acecore.net, la ligne officielle et, si nécessaire, mailto et tel sont autorisés. Même si l'URL d'un lien Markdown comporte des espaces avant ou après, ceux-ci sont supprimés avec trim avant la vérification de sécurité.
---

Si vous testez un chat IA sur un site statique, commencez par le limiter à l'orientation vers la FAQ publiée et confiez au formulaire les demandes officielles de devis ou de prise en charge. Vérifiez la liaison côté serveur dans [Bindings de Cloudflare Pages](https://developers.cloudflare.com/pages/functions/bindings/). La vérification des URL décrite dans le corps de cet article est un exemple simplifié de l'époque. Lors de l'implémentation, utilisez l'analyse syntaxique des URL et une liste d'autorisation, comme expliqué dans l'article associé, et ne vous fiez pas à une simple correspondance au début de la chaîne.

> **Ajout du 2026/9/26 :** Ce qui suit est une conception de référence correspondant à 2026/6. Dans l'implémentation actuelle d'Acecore Systems, `/api/ai-chat` est relayé par la Cloudflare Pages Function vers un `acecore-chat-worker` commun via Service Binding. L'interface reçoit la réponse JSON et affiche la réponse complète. La configuration décrite dans le corps de l'article, qui appelle directement l'API OpenAI Responses, doit être interprétée comme une référence et non comme la description de l'implémentation actuelle de Systems.

Ajouter un chat à un site pour y intégrer une IA est facile. En exploitation réelle, cependant, les difficultés tiennent moins aux performances du modèle qu'aux questions suivantes : jusqu'où l'autoriser à répondre, vers quel parcours orienter les visiteurs, quelles URL afficher et comment maîtriser le coût de l'API.

Sur le site d'Acecore, nous avons ajouté un chat IA de contact à un site statique Astro + Cloudflare Pages. Le cœur de l'implémentation se trouve dans [la PR qui a implémenté le chat IA de contact et le flux de traduction réservé au CMS](https://github.com/acecore-systems/acecore-net/pull/98). Nous avons ensuite ajusté le rendu sécurisé des liens Markdown dans les réponses de l'IA dans [une PR distincte](https://github.com/acecore-systems/acecore-net/pull/99). Les détails du rendu des liens sont présentés séparément dans [Conception de l'implémentation pour afficher en toute sécurité les liens Markdown des réponses du chat IA](/blog/ai-chat-markdown-link-safety/).

Cet article présente une conception technique facilement réutilisable sur d'autres sites statiques, plutôt qu'un journal de travaux propre à un site en particulier. Les principes sont presque identiques avec un frontend autre qu'Astro. L'essentiel est de séparer les responsabilités du client, de la frontière API, du prompt et du moteur de rendu.

## Architecture globale

L'architecture retenue est une structure simple à 3 couches.

| Couche               | Rôle                                                                                                           |
| -------------------- | -------------------------------------------------------------------------------------------------------------- |
| Widget de chat       | Interface, saisie, locale d'affichage, historique strictement nécessaire et rendu Markdown                     |
| `/api/ai-contact`    | Validation des entrées, vérification de l'origine, limitation du débit, génération du prompt et appel à OpenAI |
| OpenAI Responses API | Génération de réponses fondées sur les informations du site et le contexte de la conversation                  |

Nous n'appelons pas directement l'API OpenAI depuis le navigateur. Il y a 3 raisons à cela.

- Ne pas exposer la clé API dans le navigateur
- Pouvoir mettre à jour côté serveur le modèle, le prompt et le contexte du site
- Centraliser les limites de longueur des entrées, la vérification de l'origine, la limitation du débit et la gestion des erreurs dans 1 seul endroit

Avec Astro + Cloudflare Pages, la frontière API peut être implémentée sous la forme de `/api/ai-contact` des Cloudflare Pages Functions. Avec Next.js, vous pouvez utiliser un Route Handler ; avec Hono ou Express, une route API, selon le même principe.

## Réduire le contrat de l'endpoint

Réduisez autant que possible les informations envoyées à l'API du chat IA de contact.

```ts
type ContactAiRequest = {
  message: string;
  locale: "ja" | "en" | "zh-cn" | "es" | "pt" | "fr" | "ko" | "de" | "ru";
  history?: Array<{
    role: "user" | "assistant";
    content: string;
  }>;
};

type ContactAiResponse = {
  answer: string;
};
```

Nous avons choisi de ne pas envoyer au chat IA les noms, adresses e-mail, numéros de téléphone, noms d'entreprise ou autres informations saisies dans le formulaire. Le chat IA de contact n'est pas destiné à collecter des données personnelles ; c'est une porte d'entrée qui aide les visiteurs à déterminer quel service consulter et par où nous contacter.

Nous n'envoyons pas non plus un historique illimité. Nous ne transmettons que quelques-uns des échanges les plus récents et limitons également le nombre de caractères par message, en définissant la limite pour 1 message à la fois. Cela permet de maîtriser la taille du prompt et le coût de l'API.

## Contrôler les entrées et les appels côté serveur

Côté Cloudflare Pages Function, les opérations suivantes sont regroupées.

```ts
export async function onRequestPost({ request, env }: PagesFunction<Env>) {
  assertSameOrigin(request);
  assertRateLimit(request);

  const body = await request.json();
  const message = validateMessage(body.message);
  const locale = validateLocale(body.locale);
  const history = trimHistory(body.history);

  const prompt = buildContactPrompt({
    locale,
    message,
    history,
    siteContext: buildPublicSiteContext(locale),
  });

  const answer = await callOpenAIResponsesApi({
    apiKey: env.OPENAI_API_KEY,
    model: env.OPENAI_MODEL,
    prompt,
  });

  return Response.json({ answer });
}
```

Le point essentiel de l'implémentation est de toujours réduire les entrées avant d'appeler OpenAI. Les appels à une API IA entraînent des coûts en fonction des données reçues. Si les longs textes, l'historique inutile et les accès répétés depuis des sites externes sont acceptés tels quels, l'exploitation devient instable avant même que la fonctionnalité ne pose problème.

Définir `OPENAI_MODEL` comme variable d'environnement facilite le changement de modèle et les tests dans un environnement de prévisualisation. `OPENAI_API_KEY`, bien sûr, ne doit être gérée que dans une variable d'environnement côté serveur.

Les principes de diffusion et de configuration CSP de Cloudflare Pages sont également présentés dans [Diffuser un site statique sécurisé avec Cloudflare Pages](/insights/cloudflare-pages-security/).

## Définir explicitement les informations du site comme contexte

Pour un site de cette taille, il n'est pas nécessaire d'intégrer dès le départ une base de données vectorielle ou du RAG. Commencer par transmettre au prompt les points clés des informations publiées sur le site sous forme structurée est plus léger, tant pour l'implémentation que pour l'exploitation.

Par exemple, vous pouvez assembler côté serveur les informations suivantes.

- Présentation de l'entreprise et de ses services
- Public visé par chaque service, exemples de demandes et URL associées
- Informations auxquelles la FAQ répond déjà
- Règles d'orientation vers le formulaire de contact, LINE, l'e-mail ou le téléphone
- Sujets sur lesquels l'IA ne doit pas se prononcer, comme les tarifs, les contrats et les délais
- URL internes pour chaque locale

L'important n'est pas de laisser le modèle répondre à partir de ce qu'il semble savoir, mais de lui fournir les informations que le site est autorisé à communiquer.

```ts
function buildPublicSiteContext(locale: Locale) {
  return {
    services: [
      {
        name: "Web制作",
        summary: "コーポレートサイト、採用サイト、LPの制作相談に対応",
        url: localizePath("/services/web-production/", locale),
      },
      {
        name: "サーバー運用",
        summary: "クラウド、VPS、監視、バックアップ設計の相談に対応",
        url: localizePath("/services/server-operations/", locale),
      },
    ],
    contact: {
      form: localizePath("/contact/", locale),
      line: "https://lin.ee/...",
      emailPolicy: "フォームが使えない場合や補足が必要な場合だけ案内する",
      phonePolicy: "急ぎの確認が必要な場合だけ案内する",
    },
  };
}
```

Cette approche suffit tant que le site compte peu de pages. Si le nombre de pages, la fréquence des mises à jour ou les besoins de recherche augmentent, vous pourrez envisager d'ajouter une couche de recherche avec Pagefind, le JSON du CMS, D1, Vectorize ou d'autres outils.

## Privilégier les règles plutôt que la rédaction dans le prompt

Dans le prompt du chat IA de contact, définissez clairement le périmètre des réponses et les interdictions, plutôt que de demander au modèle de rédiger des textes naturels.

```txt
あなたはこのサイトの問い合わせ案内AIです。
公開済みサイト情報だけを根拠に回答してください。

ルール:
- 料金、契約、納期、保証を断定しない
- 詳細見積りや正式な相談は問い合わせフォームへ案内する
- 短い確認やSchoolsに関する相談はLINEも案内する
- メールと電話は、ユーザーが直接連絡を求めた場合だけ案内する
- 内部リンクは現在のlocaleに合うURLを使う
- わからない場合は、推測せずフォームへ案内する
```

Une erreur fréquente consiste à laisser le modèle faire des affirmations catégoriques pour présenter les services sous leur meilleur jour. Par exemple, aux questions « Combien cela coûte-t-il ? », « Dans quel délai la livraison peut-elle être effectuée ? » ou « Pouvez-vous garantir la prise en charge ? », il faut se limiter à des indications générales et renvoyer vers le formulaire pour obtenir une réponse officielle.

Il ne s'agit pas seulement d'un enjeu juridique. Les devis et les délais ne peuvent pas être confirmés avant de recueillir les informations nécessaires. Le prompt doit définir le périmètre des réponses dont l'exploitation peut assumer la responsabilité, plutôt que des réponses simplement pratiques à des fins commerciales.

## Séparer les rôles des différents parcours de contact

Le chat IA ne remplace pas le formulaire. Sur la page de contact, il est plus facile de gérer les demandes en répartissant les parcours comme suit.

| Parcours             | Rôle                                                                                                                                           |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| FAQ                  | Répondre d'abord sur la page aux questions fréquentes                                                                                          |
| Chat IA              | Clarifier par la conversation le choix du service, le point de contact et les pages associées                                                  |
| LINE                 | Traiter les demandes brèves, les questions concernant Schools et les vérifications simples                                                     |
| Formulaire           | Recevoir les demandes de devis, de consultation pour un projet, de partenariat ou de recrutement, ainsi que celles qui doivent être consignées |
| Coordonnées directes | À utiliser uniquement pour compléter une demande envoyée via le formulaire ou pour une vérification urgente                                    |

En reliant des contenus de présentation comme la [page des services](/services/) aux parcours de contact concrets de la [page de contact](/contact/), l'IA évite aux visiteurs de devoir rechercher eux-mêmes les pages pertinentes.

Cette conception peut également s'appliquer aux sites BtoB, aux sites d'agences, aux sites d'écoles et aux parcours d'assistance SaaS. Il est plus facile de l'adopter si l'IA sert à réduire le choix de la prochaine page à consulter ou du moyen de contact, plutôt qu'à traiter les demandes de bout en bout.

## Préserver les URL de chaque locale

Sur un site multilingue, la langue des réponses de l'IA doit correspondre à celle de la page, mais les URL des liens doivent aussi être adaptées à la locale.

Par exemple, si une question est posée depuis une page en anglais, la réponse doit également être en anglais et le lien vers la page du service doit utiliser une URL avec locale, comme `/en/services/`. Pour une page en japonais, utilisez `/services/`.

Il est plus fiable de gérer cette logique avec une fonction de génération d'URL côté serveur que de la confier au prompt.

```ts
function localizePath(path: string, locale: Locale) {
  if (locale === "ja") return path;
  return `/${locale}${path}`;
}
```

Si seule la réponse de l'IA renvoie vers une URL japonaise, le parcours multilingue est rompu. Les fondations de la gestion de blogs multilingues et des traductions sont présentées dans [Gérer un blog multilingue avec Sveltia CMS](/blog/copilot-translation-pipeline/).

## Ajouter une vérification de l'origine et une limitation du débit

Comme `/api/ai-contact` est une API publique, prévoyez au minimum une vérification de l'origine, des limites sur la longueur des entrées et la taille de l'historique, ainsi qu'une limitation du débit.

Lors du contrôle de l'origine, si l'en-tête `Origin` est présent, vérifiez que l'hôte d'où provient la requête correspond à celui de l'API. Cela réduit les appels non souhaités depuis d'autres sites.

```ts
function assertSameOrigin(request: Request) {
  const origin = request.headers.get("Origin");
  if (!origin) return;

  const requestUrl = new URL(request.url);
  const originUrl = new URL(origin);

  if (originUrl.host !== requestUrl.host) {
    throw new Response("Forbidden", { status: 403 });
  }
}
```

Une limitation du débit simple fondée sur l'adresse IP est déjà utile pour commencer. Dans un environnement Cloudflare, vous pouvez identifier les requêtes à l'aide de `CF-Connecting-IP`, `X-Forwarded-For`, `CF-Ray`, entre autres.

Toutefois, une limitation du débit en mémoire ne constitue pas une mesure persistante au fil des redémarrages ou entre plusieurs isolates. Elle peut servir de premier frein pour un petit site, mais si le trafic augmente, une approche fondée sur Cloudflare WAF, Turnstile, KV, D1, Durable Objects ou des outils similaires sera plus stable.

La conception du CMS pour la mise à jour du contenu est présentée séparément dans [Guide d'intégration de Sveltia CMS](/blog/cms-selection-and-turnstile/). La protection contre les bots des formulaires et des commentaires doit être traitée dans une couche distincte, par exemple avec Turnstile. La conception d'une fonctionnalité de commentaires pour un blog Astro avec Cloudflare uniquement est présentée dans [Créer une fonctionnalité de commentaires pour un blog Astro avec Cloudflare uniquement](/blog/cloudflare-only-blog-comments/).

## Rendre les liens Markdown à l'aide d'une liste d'autorisation

Inclure des liens dans les réponses de l'IA est pratique pour présenter les services. Il faut toutefois éviter d'injecter directement le Markdown dans le HTML.

Dans l'interface de chat, convertissez en DOM uniquement les éléments autorisés.

- Paragraphes
- Listes à puces
- Texte en gras
- Code en ligne
- Liens Markdown

Limitez davantage encore les destinations des liens.

- Des chemins internes au site, tels que `/services/`
- L'origine actuelle
- `https://acecore.net`
- La ligne officielle
- `mailto:info@acecore.net` si nécessaire
- `tel:0120987370` si nécessaire

L'URL doit toujours être vérifiée après `trim()`. L'IA peut renvoyer une URL avec des espaces avant ou après, comme dans `[サービス一覧]( /services/ )`.

```ts
function sanitizeHref(rawHref: string, currentOrigin: string) {
  const href = rawHref.trim();

  if (href.startsWith("/")) return href;
  if (href.startsWith(`${currentOrigin}/`)) return href;
  if (href.startsWith("https://acecore.net/")) return href;
  if (href.startsWith("https://lin.ee/")) return href;
  if (href === "mailto:info@acecore.net") return href;
  if (href === "tel:0120987370") return href;

  return null;
}
```

Il est plus facile à maintenir de traiter de manière stricte les seuls formats utilisés dans le chat que de viser une implémentation complète de la spécification Markdown. Même si vous souhaitez autoriser librement les URL externes, prévoyez au minimum une liste d'autorisation des domaines et `rel="noopener noreferrer"`.

## Vérifications en local, en prévisualisation et en production

Les environnements Astro dev et de prévisualisation ne correspondent pas exactement à l'environnement d'exécution des Cloudflare Pages Functions. Sans `OPENAI_API_KEY`, les réponses de l'IA ne sont pas disponibles. Vérifiez donc le mécanisme de secours de l'interface et l'affichage des erreurs.

Dans Pages preview ou en production, vérifiez les points suivants.

- `/api/ai-contact` peut être appelé avec POST
- `OPENAI_API_KEY` et `OPENAI_MODEL` sont configurés
- Les requêtes dont l'origine est différente sont rejetées
- La longueur des entrées et le nombre d'éléments de l'historique sont limités
- Les réponses correspondent à la locale d'affichage
- Les liens internes utilisent des URL avec locale
- L'IA ne se prononce pas de façon catégorique sur les devis ou les contrats
- L'e-mail et le téléphone ne sont pas affichés en permanence
- Les liens Markdown sont convertis uniquement en URL sûres

L'intégration de l'IA n'est pas terminée simplement parce que le système renvoie une réponse après avoir posé 1 seule question. Vérifiez séparément les questions inattendues, les messages longs, les questions posées depuis des pages en anglais, les demandes de coordonnées directes et les questions sur les tarifs.

## Indicateurs à suivre dans les journaux et en exploitation

Il est également important de surveiller les journaux après la mise en ligne du chat IA de contact.

Suivez au minimum les indicateurs suivants.

- Taux d'erreur de l'API
- Nombre de déclenchements de la limitation du débit
- Nombre moyen de messages par demande, mesuré par groupe de 1 demande
- Nombre de redirections vers le formulaire ou LINE
- Nombre de fois où l'IA n'a pas pu répondre et a orienté le visiteur vers le formulaire
- Nombre d'utilisations par locale

Si vous enregistrez le contenu des conversations, il faut d'abord définir la manière de traiter les données personnelles. Il est plus sûr de commencer sans enregistrer le texte des conversations et de ne suivre que le nombre d'événements et les erreurs.

## Périmètre traité séparément dans cet article

Cet article se limite à la conception technique du chat IA de contact. Nous avons également implémenté un parcours qui transmet au formulaire le contexte de la demande depuis une page de service. Ce sujet est présenté séparément dans [Conception technique pour transmettre le contexte d'un CTA de service au formulaire de contact](/blog/service-cta-contact-prefill/).

Les sujets sont différents.

- Chat IA : clarifier les hésitations par la conversation et guider les visiteurs en toute sécurité
- CTA par service : transmettre au formulaire le contexte du service consulté

Le premier sujet concerne l'IA, la frontière API, le prompt et le rendu sécurisé. Le second porte sur l'expérience du formulaire et la conception des parcours. Les traiter séparément facilite la lecture et l'ajout de liens internes par la suite.

## Conclusion

Pour intégrer un chat IA de contact à un site statique, il est plus important de concevoir d'abord la frontière API et le contrôle des réponses que l'interface du chat.

Les choix qui ont été particulièrement efficaces dans cette implémentation sont les suivants.

- Appeler l'API OpenAI depuis une Cloudflare Pages Function plutôt que depuis le navigateur
- Réduire les données envoyées à l'endpoint et limiter l'historique ainsi que la longueur des messages
- Assembler côté serveur les informations du site et les URL par locale
- Préciser dans le prompt ce que l'IA peut affirmer et ce qu'elle ne doit pas affirmer
- Séparer les rôles du formulaire, de LINE et des coordonnées directes
- Ajouter une vérification de l'origine et une limitation du débit
- Rendre les liens Markdown à l'aide d'une liste d'autorisation après trim

Il est tout à fait possible d'intégrer un chat IA de contact à un site statique. L'essentiel n'est pas de mettre l'IA en avant, mais d'aider les visiteurs à choisir leur prochaine action en toute sécurité.
