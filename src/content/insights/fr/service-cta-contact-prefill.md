---
title: "Conception technique pour transmettre le contexte d’un CTA de service au formulaire de contact"
description: "Conception d’implémentation permettant de transmettre au formulaire le contexte lu sur une page de service. Elle couvre les mini-CTA dans Astro, le contrat de paramètres URL, la sélection initiale de catégorie, le prefill de l’objet, les URL multilingues, la mesure GA et la vérification du HTML généré."
date: 2026-06-07T13:00
author: gui
tags: ["Technologie", "Site web", "Services", "Astro", "CMS"]
image: https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=400&fit=crop&q=80
callout:
  type: info
  title: Point essentiel de l’article
  text: Un CTA de service constitue un parcours faible s’il se contente d’envoyer vers le formulaire. Transmettre par l’URL le contexte du service consulté, puis initialiser la catégorie et l’objet dans le formulaire, réduit à la fois l’hésitation lors de la saisie et le travail de tri de l’équipe destinataire.
processFigure:
  title: Flux de transmission du contexte du CTA de service au formulaire
  steps:
    - title: Service
      description: Attribuer un service key au CTA de chaque section de service.
      icon: i-lucide-panels-top-left
      accent: brand
    - title: URL
      description: Le transmettre par un contrat URL tel que /contact/?category=service&service=web#contact-form.
      icon: i-lucide-link
      accent: amber
    - title: Form
      description: Initialiser dans le formulaire la catégorie et l’objet correspondants.
      icon: i-lucide-file-input
      accent: emerald
    - title: Ops
      description: L’équipe destinataire identifie le contexte du service avec la seule catégorie.
      icon: i-lucide-inbox
      accent: slate
compareTable:
  title: Différence lors de la connexion entre le CTA et le formulaire
  before:
    label: Envoyer simplement vers le formulaire
    items:
      - L’utilisateur doit sélectionner une nouvelle fois le même service
      - L’objet reste vide et la nature de la demande est peu claire
      - L’équipe destinataire doit lire le message pour identifier le service
      - La mesure de chaque CTA de service reste ambiguë
  after:
    label: Transmettre le contexte
    items:
      - La catégorie peut être présélectionnée à partir du service key du CTA
      - Le nom du service peut remplir l’objet et structurer la demande
      - L’équipe destinataire classe la demande en regardant la catégorie
      - Le GA label et les paramètres URL facilitent l’analyse de chaque CTA
checklist:
  title: Vérification de conception lors de l’adoption
  items:
    - text: Utiliser dans l’URL uniquement des service keys courts et stables
    - text: Employer comme valeurs envoyées des données stables pour l’exploitation, et non les libellés affichés
    - text: Revenir aux demandes générales pour un service key inconnu
    - text: Préremplir l’objet uniquement lorsqu’il est vide
    - text: Avant d’ajouter un champ hidden, vérifier si la catégorie existante suffit à classer
    - text: Générer côté serveur l’URL de contact de chaque locale
    - text: Ajouter GA label et location au CTA afin d’en mesurer l’efficacité
    - text: Après le build, vérifier dans le HTML le nombre de CTA et d’option ainsi que la présence ou l’absence de champs hidden
linkCards:
  - href: /services/
    title: Services
    description: Entrée du parcours contenant les CTA propres à chaque service.
    icon: i-lucide-panels-top-left
  - href: /contact/
    title: Contact
    description: Formulaire qui reçoit les paramètres URL et initialise catégorie et objet.
    icon: i-lucide-message-square
  - href: /blog/astro-ai-contact-chat/
    title: Conception technique du chat de contact avec IA
    description: Article lié sur un parcours conversationnel qui aide à orienter la demande.
    icon: i-lucide-sparkles
faq:
  title: Questions fréquentes
  items:
    - question: Pourquoi ne pas envoyer le service ciblé dans un champ hidden ?
      answer: Pour ne pas augmenter le nombre de champs examinés par l’équipe destinataire et permettre la classification avec la seule catégorie existante. Chaque champ supplémentaire ajoute aussi des contrôles à l’exploitation et aux modèles de notification.
    - question: Est-ce sûr si les paramètres URL sont modifiés ?
      answer: Un service key inconnu revient aux demandes générales. La valeur envoyée est choisie parmi les option du formulaire, de sorte que la valeur URL n’est jamais utilisée directement.
    - question: Comment procéder sur un site multilingue ?
      answer: Générez la destination du CTA pour chaque locale et traduisez les libellés affichés dans le formulaire. Conserver des valeurs envoyées alignées sur des classifications japonaises stables rend l’exploitation destinataire plus cohérente.
---

Lorsqu’une personne lisant une page de service pense « je veux vous consulter à ce sujet », l’envoyer simplement vers le formulaire fait perdre une partie du contexte.

Elle doit sélectionner à nouveau le type de service et réécrire l’objet. L’équipe destinataire ne peut pas non plus savoir facilement s’il s’agit de production web, d’exploitation de serveurs ou d’Aceserver avant de lire le message.

Sur le site Acecore, nous avons amélioré ce parcours dans la [PR qui transmet la cible du CTA au formulaire](https://github.com/acecore-systems/acecore-net/pull/100). Cet article présente la solution non seulement comme un relevé d’implémentation Astro, mais aussi comme une conception de parcours réutilisable sur d’autres sites.

## Le but n’est pas seulement de réduire la saisie

L’objectif ne consiste pas simplement à remplir automatiquement des champs pour donner une impression de facilité.

L’essentiel est de transmettre correctement le contexte créé sur la page de service au formulaire et à l’exploitation destinataire.

| Point de vue         | Amélioration recherchée                               |
| -------------------- | ----------------------------------------------------- |
| Utilisateur          | Éviter de sélectionner de nouveau le service consulté |
| Formulaire           | Initialiser catégorie et objet selon la demande       |
| Équipe destinataire  | Classer la cible à partir de la seule catégorie       |
| Mesure               | Suivre le CTA de service à l’origine de la demande    |
| Parcours multilingue | Envoyer vers une URL de contact conforme à la locale  |

Bien qu’il s’agisse visuellement d’un petit CTA, la conception couvre le CTA, l’URL, le formulaire, la traduction, la mesure et l’exploitation.

## Isoler les responsabilités dans un composant CTA

Un CTA « Nous consulter sur ce service » est placé à la fin de chaque section.

Il faut éviter de réécrire dans chaque section la même génération de lien et les mêmes attributs GA. Avec sept services, la logique apparaît sept fois et certaines copies risquent de rester inchangées lorsque le texte ou l’URL évolue.

Nous avons donc créé `ServiceSectionActions` pour centraliser le CTA.

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

Le composant a trois responsabilités :

- Générer une URL de contact adaptée à la locale
- Placer le service key dans un paramètre URL
- Porter le label et la location utilisés pour la mesure GA

Un CTA est un point d’action et de mesure, pas seulement une interface. Nous conservons `data-ga-label` et `data-ga-location` afin de voir plus tard depuis quel service la demande a commencé.

## Faire des paramètres URL le contrat avec le formulaire

Les valeurs sont transmises par paramètres URL.

```txt
/contact/?category=service&service=web#contact-form
```

Il est important de ne pas placer le libellé affiché dans l’URL.

Un texte tel que `Webサイト制作・運用について` varie avec la traduction, la rédaction et les futurs changements de nom. L’URL ne contient qu’un service key court comme `web` ou `server`.

| Paramètre  | Rôle                                                    |
| ---------- | ------------------------------------------------------- |
| `category` | Indique l’entrée de traitement d’une demande de service |
| `service`  | Key stable représentant le service ciblé                |
| hash       | Sert à faire défiler jusqu’au formulaire                |

L’utilisateur peut modifier les paramètres. Le formulaire ne prend donc pas la valeur URL comme valeur envoyée ; il la mappe vers un option existant.

## Conserver une table de classification côté formulaire

Le formulaire conserve les catégories de service dans un tableau.

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

`key`, `value`, `label` et `subject` ont chacun un rôle.

| Champ     | Rôle                                                 |
| --------- | ---------------------------------------------------- |
| `key`     | Identifiant stable recherché depuis le paramètre URL |
| `value`   | Catégorie reçue par l’équipe lors de l’envoi         |
| `label`   | Option traduit affiché à l’écran                     |
| `subject` | Nom de service utilisé pour initialiser l’objet      |

Sur un site multilingue, `label` est traduit pour la locale. `value`, utilisé pour le classement à la réception, reste une valeur japonaise stable.

Cette décision dépend du produit. Si le CRM ou le formulaire externe gère des classifications multilingues, value peut aussi varier. Pour simplifier l’exploitation destinataire, séparer libellé affiché et valeur envoyée est plus facile.

## Ajouter des attributs data aux option

Le select produit un option par service.

```astro
<select id="category" name="category" required>
  <option value="" disabled selected>
    {t(locale, "pages.contact.formCategoryPlaceholder")}
  </option>
  <option value="サービス全般について">
    {t(locale, "pages.contact.formCategoryService")}
  </option>
  {
    serviceCategoryOptions.map((option) => (
      <option
        value={option.value}
        data-service-key={option.key}
        data-service-subject={option.subject}
      >
        {option.label}
      </option>
    ))
  }
</select>
```

`data-service-key` est comparé à `service` dans l’URL. `data-service-subject` sert à créer l’objet.

Ici encore, la valeur URL n’est pas affectée directement à `category.value`. Choisir obligatoirement un option du select empêche un service key inconnu ou une valeur invalide de se glisser dans les données envoyées.

## Effectuer le prefill côté client

Un petit script initialise le formulaire après le chargement.

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

Quatre points comptent :

- Vérifier `data-service-prefill-initialized` pour éviter une double initialisation
- Ne traiter que lorsque `category=service`
- Revenir à `サービス全般について` pour un service key inconnu
- Préremplir l’objet uniquement lorsqu’il est vide

Le dernier point est important. Si un retour arrière ou l’autocomplétion conserve l’objet, l’écraser dégrade l’expérience.

Avec Astro View Transitions ou une navigation cliente, on initialise aussi sur `astro:page-load`.

```js
document.addEventListener("astro:page-load", initContactServicePrefill);
initContactServicePrefill();
```

## Aller au formulaire avec le hash

L’URL du CTA contient `#contact-form`.

```txt
/contact/?category=service&service=web#contact-form
```

Une page de contact pouvant contenir FAQ, LINE, explications et autres moyens, il est naturel d’envoyer directement au formulaire les visiteurs venus d’un CTA de service.

Lorsque le formulaire s’initialise, le moment du défilement demande de l’attention. Nous utilisons `requestAnimationFrame` pour défiler après le rendu de l’élément.

```js
if (window.location.hash === "#contact-form") {
  window.requestAnimationFrame(() => {
    form.scrollIntoView({ block: "start" });
  });
}
```

Le comportement est minime, mais si l’intention du CTA et la position visible ne coïncident pas, l’utilisateur hésite. URL, sélection initiale et défilement sont conçus ensemble.

## Décider de ne pas ajouter de champ hidden

Nous n’avons pas ajouté de champ hidden `相談対象サービス`.

Le but était d’identifier le service avec la seule catégorie.

Ajouter des champs ajoute aussi des contrôles :

- Faut-il l’afficher dans l’e-mail de notification ?
- Faut-il ajouter une colonne dans une interface ou une feuille ?
- Affecte-t-il les modèles de réponse automatique ?
- Est-il traité par le CRM ou un Webhook ?
- Comment séparer noms multilingues et valeurs reçues ?

Si les champs existants expriment l’information, ne pas en ajouter stabilise l’exploitation. Nous divisons `お問い合わせ種別` entre demandes générales et catégories propres aux services.

Un champ hidden peut être pertinent pour sélectionner plusieurs services, conserver un identifiant de campagne ou utiliser un champ CRM distinct.

## Approche pour les sites multilingues

Séparer trois valeurs évite la confusion.

| Type            | Exemple                       | Dépend de la locale  |
| --------------- | ----------------------------- | -------------------- |
| URL key         | `web`, `server`, `aceserver`  | Non                  |
| Libellé affiché | `About Website Design`, etc.  | Oui                  |
| Valeur envoyée  | `Webサイト制作・運用について` | Selon l’exploitation |

Ne pas traduire l’URL key est plus stable, car elle sert au partage, à la mesure et à la correspondance côté formulaire.

Le libellé affiché est toujours traduit, puisqu’il est vu par l’utilisateur.

La valeur envoyée suit l’exploitation. Ici, nous utilisons des valeurs japonaises stables. Séparer l’affichage multilingue de l’exploitation interne après envoi facilite la gestion.

Le flux de traduction est également présenté dans [Comment exploiter un blog multilingue avec Sveltia CMS](/blog/copilot-translation-pipeline/).

## Vérifier le HTML généré

Regarder le composant ne suffit pas. Après le build, il faut confirmer que liens et option sont générés.

Nous avons vérifié :

- Sept CTA de service dans `/services/`
- Chaque CTA contient `?category=service&service=...#contact-form`
- Sept option avec `data-service-key` dans `/contact/`
- `サービス全般について` et les catégories propres aux services sont présents
- Aucun champ hidden `相談対象サービス` n’est présent

On peut par exemple utiliser `rg`.

```powershell
rg -n "category=service&service=.*#contact-form" dist\services\index.html
rg -n "data-service-key" dist\contact\index.html
rg -n "相談対象サービス" dist\contact\index.html
```

La dernière vérification confirme l’absence de ce qui ne doit pas être ajouté. Une modification de formulaire vérifie autant les ajouts que les absences voulues.

## Répartition des rôles avec le chat IA

Ce parcours fonctionne avec la [conception technique du chat de contact avec IA](/blog/astro-ai-contact-chat/), mais les rôles diffèrent.

| Parcours       | Point fort                                                |
| -------------- | --------------------------------------------------------- |
| Chat IA        | Clarifier par conversation quel service consulter         |
| CTA de service | Transmettre au formulaire le contexte du service consulté |
| Formulaire     | Recevoir la demande officielle et conserver une trace     |

Le chat est utile lorsque l’utilisateur hésite encore. S’il a terminé la page et décidé de consulter sur ce service, l’envoyer directement au formulaire sans conversation est plus naturel.

Lorsqu’on multiplie les parcours, il ne faut pas leur donner le même rôle. Conversation, CTA et formulaire s’emploient selon l’état de l’utilisateur.

## Résumé

Transmettre le contexte de la page de service au formulaire a plus d’effet que ne le suggère la petite modification visuelle.

Les points importants étaient :

- Transformer le CTA en composant et centraliser l’URL et les attributs de mesure
- Utiliser un service key stable dans l’URL, et non un libellé affiché
- Mapper le service key vers un option du formulaire
- Séparer valeur envoyée, libellé et nom utilisé pour l’objet
- Revenir aux demandes générales pour un service key inconnu
- Préremplir l’objet uniquement s’il est vide
- Classer par catégorie sans ajouter de champ hidden
- Vérifier après le build le nombre de liens et d’option ainsi que l’absence de champs inutiles

Améliorer un formulaire ne consiste pas seulement à réduire les champs. Transmettre jusqu’à l’équipe destinataire le contexte consulté facilite réellement le traitement des demandes.
