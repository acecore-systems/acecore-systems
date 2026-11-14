---
title: "Conception technique pour afficher en toute sécurité les liens Markdown dans les réponses d'un chat IA"
description: "Note de mise en œuvre pour convertir en toute sécurité en HTML les liens Markdown présents dans les réponses d'un chat IA. En tolérant les espaces autour des URL et en séparant trim, liste d'autorisation, création du DOM, solution de repli et cas de test, on obtient un moteur de rendu facile à réutiliser sur d'autres sites."
date: 2026-06-07T14:30
lastUpdated: "2026-11-12T00:00:00+09:00"
author: gui
tags: ["Technique", "Site web", "IA", "Sécurité", "Astro"]
image: "/images/insights/covers/ai-chat-markdown-link-safety-cover-v2.webp"
callout:
  type: tip
  title: Points clés de cet article
  text: Une réponse de l’IA n’est pas du HTML de confiance. Même si les liens Markdown sont pratiques, il faut appliquer trim aux URL avant de les vérifier à l’aide d’une liste d’autorisation et afficher sous forme de texte, sans les convertir en liens, celles qui ne sont pas autorisées.
processFigure:
  title: Flux d’affichage des liens d’une réponse d’IA
  steps:
    - title: Texte
      description: Traiter d’abord la réponse du modèle comme du texte brut.
      icon: i-lucide-message-square-text
      accent: brand
    - title: Analyser
      description: Ne récupérer que les syntaxes Markdown nécessaires à l’aide d’un petit parseur.
      icon: i-lucide-brackets
      accent: amber
    - title: Valider
      description: Appliquer trim à href, puis n’autoriser que les URL internes ou les domaines autorisés.
      icon: i-lucide-shield-check
      accent: emerald
    - title: Afficher
      description: Créer uniquement des éléments sûrs avec l’API DOM, et non avec innerHTML.
      icon: i-lucide-code-2
      accent: slate
compareTable:
  title: Décisions à distinguer pour l’affichage des liens Markdown
  before:
    label: Affichage approximatif
    items:
      - Injecter directement la réponse de l’IA dans innerHTML
      - Tenter d’implémenter d’un seul coup toute la spécification Markdown
      - Échouer à créer le lien à cause des espaces autour de l’URL
      - "Traiter de la même manière les URL externes et javascript:"
  after:
    label: Affichage réduit et sûr
    items:
      - Recevoir la réponse comme du texte et ne convertir en DOM que les syntaxes nécessaires
      - Prendre en charge uniquement le Markdown utilisé dans le chat
      - Vérifier la sécurité de l’URL après trim
      - Afficher sous forme de texte les URL non autorisées, sans les convertir en liens
checklist:
  title: Liste de vérification avant la mise en production
  items:
    - text: Ne pas considérer la réponse de l’IA comme du HTML de confiance
    - text: Tolérer les espaces autour des URL des liens Markdown
    - text: Toujours appliquer trim à href avant la validation
    - text: N’autoriser que les chemins internes, la même origine et les domaines externes nécessaires
    - text: Indiquer explicitement target et rel sur les liens externes
    - text: Conserver sous forme de texte les liens qui ne sont pas autorisés
    - text: Tester les URL dangereuses et les syntaxes Markdown mal formées, pas seulement les cas normaux
linkCards:
  - href: /blog/astro-ai-contact-chat/
    title: Conception technique du chat IA de prise de contact
    description: Article de fond consacré aux réponses de l’IA, à la frontière de l’API et au contrôle des prompts.
    icon: i-lucide-sparkles
  - href: /insights/cloudflare-pages-security/
    title: Paramètres de sécurité de Cloudflare Pages
    description: Article connexe consacré à la CSP et aux en-têtes de sécurité.
    icon: i-lucide-shield
  - href: /contact/
    title: Nous contacter
    description: Le parcours réel sur lequel sont intégrés le chat IA et le formulaire.
    icon: i-lucide-message-square
faq:
  title: Questions fréquentes
  items:
    - question: markdown-it ou marked suffisent-ils ?
      answer: Même avec une bibliothèque, il faut concevoir séparément le traitement de la sortie HTML, les destinations autorisées, l’ajout de target et rel, ainsi que le rejet des URL dangereuses. Pour un chat, un petit moteur de rendu dédié peut parfois suffire.
    - question: Les espaces autour de l’URL rendent-ils le lien dangereux ?
      answer: Ce n’est pas le fait d’autoriser les espaces en soi qui pose problème ; l’important est de déterminer ce qui est autorisé après trim. En vérifiant le href après trim à l’aide d’une liste d’autorisation, on résiste mieux aux variations de format produites par le modèle tout en préservant la sécurité.
    - question: Faut-il supprimer les URL qui ne sont pas autorisées ?
      answer: Dans de nombreux cas, afficher le lien sous forme de texte plutôt que le supprimer facilite le débogage et préserve le contexte de la réponse pour l’utilisateur. Cependant, si l’objectif est de masquer complètement les chaînes suspectes, on peut décider de supprimer le lien dans son ensemble.
---

Si les liens des réponses de l’IA restent de simples chaînes de caractères, faites d’abord passer la même entrée successivement par l’analyse syntaxique, la validation de l’URL et le rendu dans le DOM afin d’identifier l’étape qui échoue. Utilisez une API destinée au texte pour la chaîne affichée, comme [MDN: textContent](https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent), et séparez la possibilité de créer un lien de l’interprétation du HTML : c’est le point de départ pour adapter cette approche à un chat existant.

Lorsque vous demandez à un chat IA de répondre « Consultez la [liste des services](/services/) pour en savoir plus », il arrive que le lien ne s’affiche pas et que la chaîne Markdown reste telle quelle.

Sur le site d’Acecore aussi, les réponses du chat IA de prise de contact contenaient des liens Markdown avec des espaces autour de l’URL. Nous avons donc ajusté le moteur de rendu dans la [PR de correction de l’affichage des liens Markdown du chat IA](https://github.com/acecore-systems/acecore-net/pull/99).

Cet article prend cette petite correction comme point de départ pour présenter comment convertir en toute sécurité les réponses de l’IA en éléments DOM.

## Une réponse d’IA n’est pas du HTML de confiance

Pour commencer, traitez les réponses de l’IA comme du texte et non comme du HTML.

Dans une interface de chat, on a envie de proposer au moins des liens, du gras et des listes à puces. Mais si l’on insère directement une réponse dans `innerHTML`, on laisse le navigateur interpréter une chaîne produite par le modèle.

Il ne s’agit pas d’implémenter l’ensemble de Markdown. Il faut seulement gérer quelques syntaxes utiles dans le chat et créer exclusivement du DOM sûr.

## Le problème ne se limite pas aux espaces

Le bug immédiat concernait des liens de ce type.

```md
[サービス一覧](/services/)
```

Du point de vue humain, la syntaxe Markdown est compréhensible, mais si la partie URL est capturée avec une expression régulière comme « chaîne sans espaces », elle ne correspond pas.

Voici l’approche utilisée avant la correction.

```js
/\[([^\]]+)\]\(([^)\s]+)\)/;
```

`[^)\s]+` n’autorise pas les espaces, si bien qu’il ne peut pas capturer `( /services/ )` comme lien. Nous autorisons donc les espaces avant et après l’URL à l’intérieur des parenthèses, puis appliquons trim à l’URL réellement utilisée.

```js
/\[([^\]]+)\]\(\s*([^)]+?)\s*\)/;
```

Le point important est de ne pas s’arrêter après avoir assoupli l’expression régulière. Une fois assouplie, il faut systématiquement normaliser et effectuer un contrôle de sécurité.

## Vérifier href après trim

Fixez l’ordre de création des liens.

1. Extraire du Markdown le libellé et le href brut
2. Appliquer `trim()` au href brut
3. Vérifier le href après trim à l’aide de la liste d’autorisation
4. Créer `<a>` uniquement si l’URL est autorisée

```js
const href = String(rawHref || "").trim();

if (label && isSafeMarkdownHref(href)) {
  const link = document.createElement("a");
  link.href = href;
  link.rel = "noopener noreferrer";

  if (/^https?:\/\//i.test(href)) {
    link.target = "_blank";
  }

  link.textContent = label;
  parent.appendChild(link);
}
```

Il faut vérifier la valeur qui sera réellement insérée dans le DOM, et non la valeur avant `trim()`. Si la valeur vérifiée et celle affichée ne correspondent pas, le contrôle de sécurité perd de son efficacité.

## La liste d’autorisation dépend du produit

Les URL que le chat IA est autorisé à recommander varient d’un site à l’autre.

Pour le chat IA de prise de contact d’Acecore, nous nous limitons à peu près aux catégories suivantes.

| Type                | Exemple                   | Décision                                            |
| ------------------- | ------------------------- | --------------------------------------------------- |
| Chemin interne      | `/services/`              | Autoriser                                           |
| Même origine        | `https://acecore.net/...` | Autoriser                                           |
| LINE officielle     | `https://lin.ee/...`      | Autoriser, car l’objectif est clair                 |
| mailto              | `mailto:info@acecore.net` | N’autoriser que les destinataires fixes nécessaires |
| tel                 | `tel:0120987370`          | N’autoriser que les numéros fixes nécessaires       |
| Autres URL externes | URL quelconque            | En principe, ne pas convertir en lien               |

Voici un exemple de mise en œuvre.

```js
function isSafeMarkdownHref(rawHref) {
  const href = String(rawHref ?? "").trim();
  if (!href || /[\u0000-\u001f\u007f\\]/u.test(href)) return false;
  if (href === "mailto:info@acecore.net" || href === "tel:0120987370") {
    return true;
  }

  try {
    if (href.startsWith("/")) {
      if (href.startsWith("//")) return false;
      const url = new URL(href, window.location.origin);
      return (
        url.origin === window.location.origin && !url.username && !url.password
      );
    }

    const url = new URL(href);
    return (
      url.protocol === "https:" &&
      !url.username &&
      !url.password &&
      !url.port &&
      [
        window.location.origin,
        "https://acecore.net",
        "https://lin.ee",
      ].includes(url.origin)
    );
  } catch {
    return false;
  }
}
```

Cette fonction doit être adaptée à chaque site. Un site de recrutement pourrait autoriser des plateformes d’offres d’emploi, un site de commerce en ligne des services de paiement ou de suivi des livraisons, et un SaaS sa documentation ou sa page d’état.

## Afficher en texte les liens qui ne sont pas autorisés

La manière de traiter les liens qui échouent au contrôle de sécurité fait aussi partie de la conception.

Pour le chat IA de prise de contact, il est plus simple de conserver sous forme de texte la syntaxe Markdown qui ne peut pas être convertie en lien que de la supprimer complètement. L’utilisateur garde ainsi le contexte, et les développeurs peuvent vérifier ce que l’IA a produit.

Autrement dit, le parseur a pour responsabilité non seulement de créer des liens sûrs, mais aussi d’afficher le contenu sous forme de texte ordinaire lorsqu’il ne peut pas créer de lien sûr.

## Préparer les cas de test dès le début

Avec ce type de moteur de rendu, vérifier uniquement les cas normaux ne suffit pas à repérer tous les problèmes.

Vérifiez au minimum les cas suivants.

| Entrée                              | Résultat attendu                           |
| ----------------------------------- | ------------------------------------------ |
| `[サービス一覧](/services/)`        | Devient un lien interne                    |
| `[サービス一覧]( /services/ )`      | Après trim, devient un lien interne        |
| `[LINE]( https://lin.ee/example )`  | S’ouvre comme un lien externe              |
| `[危険](javascript:alert(1))`       | N’est pas converti en lien                 |
| `[外部](https://example.com/)`      | N’est pas converti en lien si non autorisé |
| `[壊れたリンク](/services/`         | S’affiche sous forme de texte              |
| `` `code` と [link]( /contact/ ) `` | Le code et le lien sont rendus séparément  |

Dans la PR #99, nous avons vérifié que `[サービス一覧]( /services/ )`, `[サービス一覧](/services/)` et `[LINE]( https://lin.ee/DjIrdqj )` sont traités comme une seule et même URL.

## Choisir de ne pas implémenter tout Markdown

Les syntaxes Markdown utilisées dans un chat peuvent être limitées.

- Paragraphes
- Listes à puces
- Gras
- Code en ligne
- Liens

Prendre aussi en charge les tableaux, les images, le HTML, les notes de bas de page et les niveaux de titre imbriqués rend rapidement le rôle du moteur de rendu beaucoup plus complexe. Dans une interface de chat, il suffit de pouvoir présenter les informations de manière lisible.

Si le besoin s’en fait sentir, on peut aussi choisir une bibliothèque Markdown éprouvée. Mais même dans ce cas, il faut décider séparément si le HTML est autorisé, comment restreindre les URL et quels attributs ajouter aux liens externes.

## Conclusion

L’affichage des liens Markdown dans un chat IA peut sembler n’être qu’une petite correction visuelle. En réalité, il s’agit de définir la frontière de confiance accordée aux sorties de l’IA.

Les points importants de la mise en œuvre sont les suivants.

- Traiter les réponses de l’IA comme du texte, et non comme du HTML
- Ne convertir en DOM que les syntaxes Markdown nécessaires
- Tolérer les espaces autour des URL des liens Markdown
- Vérifier la sécurité de href après trim
- N’autoriser, à l’aide d’une liste d’autorisation, que les URL internes et les URL externes nécessaires
- Conserver sous forme de texte les liens qui ne sont pas autorisés
- Tester les syntaxes Markdown mal formées et les URL dangereuses

Plus l’IA s’intègre aux parcours du site, plus le mode d’affichage du texte de ses réponses devient important. La prise en charge pratique de Markdown et le contrôle sûr des liens doivent être traités ensemble, dans la même implémentation.
