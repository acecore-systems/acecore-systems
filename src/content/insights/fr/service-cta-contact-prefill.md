---
title: "Conception technique du transfert du contexte d’un CTA de service vers le formulaire de contact"
description: "Conception de mise en œuvre pour transmettre au formulaire de contact le contexte de la page de service consultée. Des mini-CTA d’un site Astro au contrat des paramètres d’URL, en passant par la présélection du type de demande, le préremplissage de l’objet, les URL multilingues, le suivi GA et la vérification du HTML généré, cet article présente une approche réutilisable sur d’autres sites."
date: 2026-06-07T13:00
lastUpdated: "2026-10-09T15:00:00+09:00"
author: gui
tags: ["Technique", "Site web", "Services", "Astro", "CMS"]
image: https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=400&fit=crop&q=80
callout:
  type: info
  title: Points clés de cet article
  text: Sur une page de service, un CTA qui se contente de rediriger vers un formulaire ne constitue pas un parcours suffisant. En transmettant via l’URL le contexte du service que l’utilisateur consultait et en initialisant côté formulaire le type de demande et l’objet, on réduit à la fois les hésitations lors de la saisie et le travail de tri à la réception.
processFigure:
  title: Parcours de transfert du contexte du CTA de service au formulaire
  steps:
    - title: Service
      description: Associer une clé de service au CTA de chaque section de service.
      icon: i-lucide-panels-top-left
      accent: brand
    - title: URL
      description: Transmettre les informations via un contrat d’URL, par exemple /contact/?category=service&service=web#contact-form.
      icon: i-lucide-link
      accent: amber
    - title: Formulaire
      description: Initialiser le type de demande et l’objet correspondants côté formulaire.
      icon: i-lucide-file-input
      accent: emerald
    - title: Opérations
      description: Côté réception, le type de demande suffit à identifier le contexte du service.
      icon: i-lucide-inbox
      accent: slate
compareTable:
  title: Différences entre les CTA et le formulaire lorsqu’on les relie
  before:
    label: En redirigeant simplement vers le formulaire
    items:
      - L’utilisateur doit sélectionner à nouveau le même nom de service dans le formulaire
      - L’objet reste vide et le sujet de la demande est difficile à comprendre
      - Côté réception, il est difficile d’identifier le service concerné sans lire le corps du message
      - Il devient difficile de mesurer l’efficacité des CTA propres à chaque service
  after:
    label: En transmettant le contexte
    items:
      - Le type de demande peut être présélectionné à partir de la clé de service du CTA
      - Le nom du service dans l’objet permet de clarifier la demande
      - Côté réception, le type de demande suffit à classer la demande
      - Les paramètres label GA et URL facilitent le suivi par CTA
checklist:
  title: Points de contrôle lors de la mise en place
  items:
    - text: Garder les paramètres d’URL courts et se limiter à des clés de service stables
    - text: Utiliser comme valeur reçue par le formulaire une valeur stable pour les opérations, plutôt qu’un libellé affiché à l’utilisateur
    - text: Faire retomber les clés de service inconnues sur la catégorie générale des services
    - text: Ne préremplir l’objet que lorsqu’il est vide
    - text: Avant d’ajouter des champs masqués, vérifier si les types de demande existants permettent déjà le classement
    - text: Générer côté serveur l’URL de contact correspondant à chaque locale
    - text: Ajouter un label GA et un emplacement au CTA pour pouvoir en mesurer l’efficacité
    - text: Après le build, vérifier dans le HTML généré le nombre de CTA, le nombre d’options et la présence ou l’absence de champs masqués
linkCards:
  - href: /services/
    title: Services
    description: Point d’entrée du parcours avec des CTA propres à chaque service.
    icon: i-lucide-panels-top-left
  - href: /contact/
    title: Contact
    description: Formulaire qui reçoit les paramètres d’URL et initialise le type et l’objet.
    icon: i-lucide-message-square
  - href: /blog/astro-ai-contact-chat/
    title: Conception technique d’un chatbot IA pour les demandes de contact
    description: Article associé sur un parcours qui clarifie la demande au fil d’une conversation.
    icon: i-lucide-sparkles
faq:
  title: Questions fréquentes
  items:
    - question: Pourquoi ne pas transmettre le service concerné dans un champ masqué ?
      answer: "À l’époque, en 2026-6, la conception consistait à classer les demandes uniquement selon les types de demande existants, sans ajouter de champs masqués. Aujourd’hui, le formulaire Systems stocke service, from et entry dans des champs masqués dédiés aux échanges, en plus de la valeur de classification."
    - question: Est-ce sans risque si les paramètres d’URL sont modifiés ?
      answer: Les clés de service inconnues sont redirigées vers la catégorie générale des services. La valeur envoyée est sélectionnée parmi les options du formulaire : la valeur de l’URL n’est donc pas transmise telle quelle.
    - question: Comment gérer cela sur un site multilingue ?
      answer: Générer la destination du CTA en fonction de la locale et traduire également les libellés affichés dans le formulaire. En revanche, utiliser des valeurs reçues stables en japonais pour le classement facilite la gestion côté réception.
---

> **Ajouté en 2026-9 :** Les exemples de `ServiceSectionActions` et `service=web` ci-dessous documentent la configuration utilisée sur le site officiel d’Acecore en 2026-6. Sur l’Acecore Systems actuel, les [CTA des pages de détail des services](https://github.com/acecore-systems/acecore-systems/blob/main/src/components/ServiceDetailPage.astro) ajoutent `category`, `service`, `from` et `entry`, tandis que le [formulaire de contact](https://github.com/acecore-systems/acecore-systems/blob/main/src/pages/contact.astro) valide la clé de service courte et initialise le type et l’objet. Comme des champs masqués dédiés au suivi et à l’intégration sont également utilisés actuellement, ne reprenez pas la conception « sans champ masqué » ci-dessous comme spécification en vigueur. Le principe consistant à ne pas faire confiance à la valeur de l’URL et à l’associer à une option côté formulaire reste valable.

Lorsqu’un utilisateur qui consultait une page de service se dit « Je voudrais poser une question sur ce sujet », le simple fait de le rediriger vers le formulaire de contact lui fait perdre un peu de contexte.

L’utilisateur doit sélectionner à nouveau le type de service dans le formulaire et rédiger l’objet lui-même. Côté réception, il est également difficile de savoir s’il s’agit d’une demande concernant la création d’un site web, l’exploitation d’un serveur ou Aceserver avant d’avoir lu le message.

Sur le site d’Acecore, nous avons amélioré ce parcours avec une [PR de transmission du service concerné depuis un CTA de service vers le formulaire de contact](https://github.com/acecore-systems/acecore-net/pull/100). Cet article présente cette mise en œuvre avec Astro, mais aussi une conception de parcours réutilisable sur d’autres sites web.

## Valider le préremplissage du formulaire à partir d’un CTA unique

Testez une clé de service valide, une clé inconnue et le retour après avoir déjà saisi un objet. Vérifiez que le type correspond à une option autorisée et que l’objet n’est pas écrasé, puis utilisez le même contrat de valeurs pour les URL de chaque locale. Ne placez ni données personnelles ni texte libre dans l’URL : transmettez le contexte de la demande uniquement au moyen d’un identifiant court.

[MDN URLSearchParams : spécification de lecture des paramètres d’URL](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams)

## L’objectif ne se limite pas à réduire la saisie du formulaire

Le but de cette mise en œuvre n’est pas seulement de préremplir automatiquement les champs pour donner l’impression que le formulaire est plus facile à remplir.

L’essentiel est de transmettre correctement le contexte créé sur la page de service au formulaire de contact et aux opérations de réception.

| Point de vue         | Amélioration recherchée                                                      |
| -------------------- | ---------------------------------------------------------------------------- |
| Utilisateur          | Réduire l’effort nécessaire pour sélectionner à nouveau le service consulté  |
| Formulaire           | Initialiser le type de demande et l’objet en fonction du sujet de la demande |
| Équipe de réception  | Faciliter le classement des demandes à partir du seul type de demande        |
| Suivi                | Faciliter l’identification du CTA de service à l’origine d’une demande       |
| Parcours multilingue | Rediriger vers l’URL de contact correspondant à la locale                    |

Visuellement, il s’agit d’un petit mini-CTA, mais la conception couvre le CTA, l’URL, le formulaire, la traduction, le suivi et les opérations de réception.

## Extraire les responsabilités dans un composant CTA

Placez un CTA « Poser une question sur ce service » à la fin de chaque section de service.

La première chose à éviter est d’écrire en dur la même génération de liens et les mêmes attributs GA dans chaque section de la page des services. Si le site comporte 7 services, le même code apparaît 7 fois. Il est alors facile d’oublier une occurrence lorsqu’on veut modifier les textes ou les règles des URL.

Nous avons donc créé `ServiceSectionActions` pour regrouper les CTA de contact.

```astro
---
import Icon from "./Icon.astro";
import { t, getLocalizedUrl, type Locale } from "../i18n";

interface Props {
  locale: Locale;
  gaLabel: string;
  gaLocation: string;
  serviceKey: string;
}

const { locale, gaLabel, gaLocation, serviceKey } = Astro.props;
const u = (path: string) => getLocalizedUrl(path, locale);
const contactUrl = `${u("/contact/")}?category=service&service=${encodeURIComponent(serviceKey)}#contact-form`;
---

<a
  href={contactUrl}
  class="ac-btn-outline gap-2 text-sm sm:w-auto"
  data-ga-event="cta_click"
  data-ga-label={gaLabel}
  data-ga-location={gaLocation}
  data-ga-destination={contactUrl}
>
  <Icon name="message-circle" class="text-sm" />
  {t(locale, "pages.services.miniCta")}
</a>
```

Ce composant remplit 3 responsabilités.

- Générer une URL de contact correspondant à la locale
- Ajouter la clé de service aux paramètres d’URL
- Ajouter un label et un emplacement pour le suivi GA

Les CTA sont des points d’action de l’utilisateur ; ils constituent donc aussi des points de mesure, et pas seulement des éléments d’interface. Nous conservons `data-ga-label` et `data-ga-location` pour pouvoir déterminer par la suite quel service est à l’origine d’une demande.

## Faire des paramètres d’URL le contrat avec le formulaire

Nous avons choisi les paramètres d’URL pour transmettre les valeurs du CTA au formulaire de contact.

```txt
/contact/?category=service&service=web#contact-form
```

Le point important est de ne pas mettre dans l’URL un « libellé affiché ».

Les libellés affichés tels que `Webサイト制作・運用について` sont affectés par les traductions, les variations d’orthographe et les changements de nom futurs. Dans l’URL, ne placez que de courtes clés de service telles que `web` ou `server`.

| Paramètre  | Rôle                                                           |
| ---------- | -------------------------------------------------------------- |
| `category` | Indiquer le point d’entrée d’une demande concernant un service |
| `service`  | Clé stable désignant le service concerné                       |
| hash       | Faire défiler la page jusqu’au formulaire                      |

Les paramètres d’URL peuvent être modifiés par l’utilisateur. C’est pourquoi, côté formulaire, nous associons la valeur de l’URL à une option existante plutôt que de l’envoyer telle quelle.

<figure class="article-diagram" data-layout="flow" data-tone="teal" data-count="3" aria-labelledby="diagram-service-cta-contact-prefill">
  <figcaption>
    <strong id="diagram-service-cta-contact-prefill">Flux de transfert des demandes reçues vers les enregistrements de gestion</strong>
    <span>Les étapes de mise en œuvre du parcours sont illustrées. La prise de contact avec de vrais clients et l’achèvement de leur suivi doivent être vérifiés séparément.</span>
  </figcaption>
  <ol class="article-diagram__nodes">
    <li>
      <span class="article-diagram__symbol">
        <span aria-hidden="true">1</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
          <path d="M4 5h16v14H4z M4 7l8 6 8-6"/>
        </svg>
      </span>
      <strong>Lire le contexte du CTA</strong>
      <span>Associer la clé de service stable à l’URL affichée dans la bonne langue et à la liste d’autorisation des options de formulaire approuvées.</span>
    </li>
    <li>
      <span class="article-diagram__symbol">
        <span aria-hidden="true">2</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
          <path d="M12 2l8 3v6c0 5-3 8-8 11-5-3-8-6-8-11V5z M8 12l3 3 5-6"/>
        </svg>
      </span>
      <strong>Valider les saisies et les autorisations</strong>
      <span>Ne préremplir l’objet que s’il est vide et vérifier également dans l’API l’identité de l’utilisateur et ses droits d’action.</span>
    </li>
    <li>
      <span class="article-diagram__symbol">
        <span aria-hidden="true">3</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
          <path d="M6 3h9l4 4v14H6z M15 3v5h4 M9 12h6 M9 16h6"/>
        </svg>
      </span>
      <strong>Transmettre aux enregistrements de réception</strong>
      <span>Répercuter le contenu reçu dans l’historique CRM et les tâches de suivi, puis consigner séparément l’achèvement effectif de l’intervention par la personne responsable.</span>
    </li>
  </ol>
</figure>

## Maintenir une table de classification côté formulaire

Côté formulaire, nous conservons la classification par service dans un tableau.

```ts
const serviceCategoryOptions = [
  {
    key: "server",
    value: "サーバー構築・運用について",
    label: t(locale, "pages.contact.formCategoryServiceServer"),
    subject: t(locale, "pages.services.server.title"),
  },
  {
    key: "web",
    value: "Webサイト制作・運用について",
    label: t(locale, "pages.contact.formCategoryServiceWeb"),
    subject: t(locale, "pages.services.web.title"),
  },
];
```

`key`, `value`, `label` et `subject` ont chacun un rôle différent.

| Champ     | Rôle                                                                       |
| --------- | -------------------------------------------------------------------------- |
| `key`     | Identifiant stable utilisé pour la recherche à partir des paramètres d’URL |
| `value`   | Type de demande reçu côté réception lors de l’envoi du formulaire          |
| `label`   | Option traduite affichée à l’écran                                         |
| `subject` | Nom du service utilisé pour le préremplissage de l’objet                   |

Sur un site multilingue, le libellé affiché `label` est traduit en fonction de la locale. En revanche, `value` sert au classement côté réception ; nous l’avons donc défini comme une valeur japonaise stable.

Le choix dépend du produit. Si le CRM ou le formulaire externe prend en charge des classifications multilingues, les valeurs peuvent également varier selon la locale. Lorsqu’on veut simplifier les opérations côté réception, comme ici, il est plus facile de gérer séparément le libellé affiché et la valeur reçue.

## Ajouter des attributs data aux options

Les options propres à chaque service sont générées dans le select du formulaire.

```astro
<select id="category" name="category" required>
  <option value="" disabled selected>
    {t(locale, "pages.contact.formCategoryPlaceholder")}
  </option>
  <option value="サービス全般について">
    {t(locale, "pages.contact.formCategoryService")}
  </option>
  {serviceCategoryOptions.map((option) => (
    <option
      value={option.value}
      data-service-key={option.key}
      data-service-subject={option.subject}
    >
      {option.label}
    </option>
  ))}
</select>
```

`data-service-key` sert à comparer le paramètre d’URL `service`. `data-service-subject` sert à construire l’objet.

Là encore, l’essentiel est de ne pas injecter directement la valeur de l’URL dans `category.value`. En sélectionnant toujours une option présente dans le select, nous évitons d’ajouter aux valeurs reçues des clés de service inconnues ou incorrectes.

## Préremplir côté client

L’initialisation du formulaire est effectuée par un petit script après le chargement de la page.

```js
function initContactServicePrefill() {
  const form = document.getElementById("contact-form");
  if (!form || form.dataset.servicePrefillInitialized === "true") return;

  form.dataset.servicePrefillInitialized = "true";

  const url = new URL(window.location.href);
  const requestedCategory = url.searchParams.get("category");
  const requestedService = url.searchParams.get("service") || "";
  const category = document.getElementById("category");
  const subject = document.getElementById("subject");

  if (
    requestedCategory === "service" &&
    category instanceof HTMLSelectElement
  ) {
    const serviceOption = Array.from(category.options).find((option) => {
      return option.dataset.serviceKey === requestedService;
    });

    category.value = serviceOption?.value || "サービス全般について";
    category.dispatchEvent(new Event("input", { bubbles: true }));
    category.dispatchEvent(new Event("change", { bubbles: true }));

    if (
      serviceOption &&
      subject instanceof HTMLInputElement &&
      !subject.value.trim()
    ) {
      const template = form.dataset.serviceSubjectTemplate || "{service}";
      const serviceName =
        serviceOption.dataset.serviceSubject ||
        serviceOption.textContent?.trim() ||
        "";
      subject.value = template.replace("{service}", serviceName);
    }
  }
}
```

Les 4 points importants de la mise en œuvre sont les suivants.

- Vérifier `data-service-prefill-initialized` pour éviter une double initialisation
- N’intervenir que lorsque `category=service`
- Faire retomber les clés de service inconnues sur « Tous les services »
- Ne préremplir l’objet que lorsqu’il est vide

Le dernier point, « ne préremplir l’objet que lorsqu’il est vide », est important. Si l’utilisateur a déjà un objet après être revenu en arrière ou grâce au remplissage automatique du navigateur, l’écraser sans prévenir nuit à l’expérience.

Si Astro View Transitions ou la navigation côté client est utilisée, l’initialisation doit se faire non seulement au chargement initial, mais aussi lors de `astro:page-load`.

```js
document.addEventListener("astro:page-load", initContactServicePrefill);
initContactServicePrefill();
```

## Utiliser un hash pour atteindre le formulaire

Nous ajoutons `#contact-form` à l’URL du CTA.

```txt
/contact/?category=service&service=web#contact-form
```

La page de contact peut aussi contenir une FAQ, LINE, des explications et d’autres moyens de contact que le formulaire. Il est donc plus naturel d’amener directement à la position du formulaire les utilisateurs qui arrivent depuis un CTA de service.

Il faut toutefois tenir compte du moment où le défilement s’effectue si le formulaire est initialisé de son côté. Pour faire défiler la page une fois l’élément rendu, nous utilisons `requestAnimationFrame`.

```js
if (window.location.hash === "#contact-form") {
  window.requestAnimationFrame(() => {
    form.scrollIntoView({ block: "start" });
  });
}
```

Le déplacement jusqu’au formulaire est un petit détail de comportement, mais si l’intention du CTA et la position affichée du formulaire ne correspondent pas, l’utilisateur risque d’hésiter. Dans la conception du parcours, nous considérons ensemble l’URL, la présélection et la position de défilement.

## Choisir de ne pas ajouter de champs masqués

Cette fois, nous n’avons pas ajouté de champ masqué `相談対象サービス`.

La raison est que nous voulions pouvoir identifier le service concerné à partir du seul type de demande.

Ajouter des champs au formulaire augmente aussi le nombre de points à vérifier.

- Faut-il les afficher dans les e-mails de notification ?
- Faut-il ajouter une colonne dans l’interface d’administration ou le tableur ?
- Cela aura-t-il un effet sur les modèles de réponse automatique existants ?
- Faut-il les exploiter dans une intégration CRM ou un Webhook ?
- Comment distinguer le libellé multilingue de la valeur reçue ?

Lorsque les champs existants permettent d’exprimer les informations nécessaires, ne pas en ajouter rend les opérations plus stables. Cette fois, nous avons séparé `お問い合わせ種別` entre « Tous les services » et les catégories propres à chaque service afin que l’équipe de réception puisse les distinguer.

Bien sûr, l’ajout de champs masqués peut être justifié si l’on doit sélectionner plusieurs services à la fois, enregistrer un identifiant de campagne publicitaire ou disposer d’un champ distinct dans le CRM.

## Réflexion sur les sites multilingues

Pour créer ce parcours sur un site multilingue, distinguer 3 types de valeurs permet d’éviter toute confusion.

| Type            | Exemple                       | Dépend de la locale  |
| --------------- | ----------------------------- | -------------------- |
| Clé d’URL       | `web`, `server`, `aceserver`  | Non                  |
| Libellé affiché | `About Website Design`, etc.  | Oui                  |
| Valeur reçue    | `Webサイト制作・運用について` | Selon les opérations |

Les clés d’URL sont plus stables si elles ne sont pas traduites. Elles servent à partager les liens, à analyser les parcours et à faire les correspondances côté formulaire.

Les libellés affichés doivent toujours être traduits, puisqu’ils sont visibles dans le formulaire.

Pour les valeurs reçues, adaptez-vous aux opérations. Ici, nous avons retenu une valeur japonaise stable. En concevant séparément l’affichage multilingue et les opérations internes après réception, le formulaire devient plus facile à gérer.

Le processus de traduction est également présenté dans [Gérer un blog multilingue avec Sveltia CMS](/blog/copilot-translation-pipeline/).

## Vérifier le HTML généré

Pour ce type de mise en œuvre, il ne suffit pas d’examiner les composants. Il faut vérifier dans le HTML généré après le build que les liens et les options sont effectivement présents.

Voici les points vérifiés cette fois.

- `/services/` contient 7 CTA propres aux services
- Chaque CTA contient `?category=service&service=...#contact-form`
- `/contact/` contient 7 options avec `data-service-key`
- « Tous les services » et les types propres aux services sont présents
- Aucun champ masqué `相談対象サービス` n’est généré

Par exemple, on peut vérifier le HTML généré avec `rg`.

```powershell
rg -n "category=service&service=.*#contact-form" dist\services\index.html
rg -n "data-service-key" dist\contact\index.html
rg -n "相談対象サービス" dist\contact\index.html
```

La dernière vérification consiste à s’assurer que les éléments qui ne doivent pas apparaître sont bien absents. Lorsqu’on modifie un formulaire, il faut vérifier non seulement ce qui a été ajouté, mais aussi ce que l’on a décidé de ne pas ajouter.

## Répartir les rôles avec un chatbot IA

Ce parcours est complémentaire de la [conception technique d’un chatbot IA pour les demandes de contact](/blog/astro-ai-contact-chat/). Toutefois, leurs rôles sont différents.

| Parcours       | Point fort                                                            |
| -------------- | --------------------------------------------------------------------- |
| Chatbot IA     | Aider l’utilisateur à déterminer en dialoguant le service à contacter |
| CTA de service | Transmettre au formulaire le contexte du service consulté             |
| Formulaire     | Recevoir la demande officielle et en conserver une trace              |

Le chatbot IA est particulièrement adapté aux utilisateurs qui hésitent encore. En revanche, pour ceux qui ont terminé de consulter une page de service et ont décidé de poser une question sur ce service, il est plus naturel de les envoyer directement au formulaire sans intercaler une conversation.

Lorsqu’on ajoute des parcours, il est important de ne pas leur attribuer à tous le même rôle. La conversation, le CTA et le formulaire s’utilisent selon la situation de l’utilisateur.

## Conclusion

Transmettre le contexte d’une page de service au formulaire de contact a un effet plus important que son apparence ne le laisse penser.

Les points essentiels de cette conception sont les suivants.

- Regrouper la génération des URL et les attributs de suivi en créant un composant CTA
- Utiliser dans l’URL une clé de service stable plutôt qu’un libellé affiché
- Associer côté formulaire la clé de service à une option
- Distinguer la valeur reçue, le libellé affiché et le nom du service utilisé dans l’objet
- Faire retomber les clés de service inconnues sur la catégorie générale des services
- Ne préremplir l’objet que lorsqu’il est vide
- Permettre le classement par type de demande sans ajouter de champs masqués
- Après le build, vérifier dans le HTML généré le nombre de liens, le nombre d’options et l’absence des champs inutiles

Améliorer un formulaire de contact ne consiste pas uniquement à réduire le nombre de champs. Transmettre sans perte jusqu’à l’équipe de réception le contexte consulté par l’utilisateur facilite le traitement concret de sa demande.

## Mise à jour du 2026-10-6 : de la réception des demandes aux enregistrements de gestion

Dans une modification d’intégration anonymisée, nous avons traité la réception des demandes, leur répercussion dans l’historique et les tâches du CRM, ainsi que l’achèvement de l’intervention par la personne responsable comme des états distincts. Nous avons validé les saisies d’URL et les canaux de demande, puis associé la valeur du canal à une enum stable. Le simple fait de connaître l’URL de l’interface d’administration ne donne pas le droit de modifier l’historique ou les tâches.

Nous vérifions également côté API l’identité de l’utilisateur et ses droits d’action, et nous n’utilisons pas les données client dans des recherches publiques ni comme matière pour des réponses d’IA publiques. Même si la réception ou la mise en œuvre des enregistrements est terminée, cela ne signifie pas que le parcours complet, du contact avec un vrai client à l’achèvement du traitement opérationnel, a été validé.

Nous distinguons le préremplissage du formulaire de la saisie de l’utilisateur. Pour les demandes nécessitant un rappel, le moyen de contact souhaité est transmis aux tâches de suivi comme choix fixe obligatoire. Nous alignons les conditions de champs obligatoires de l’interface et de l’API, ainsi que les droits de consultation et d’ajout des responsables, puis vérifions le schéma et les contraintes après les modifications de la DB. Nous distinguons également les vérifications nécessaires en production du fait de copier l’intégralité de la DB de vrais clients dans un environnement de développement.
