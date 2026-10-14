---
title: "Délégation de tâches Codex : transmission, permissions et validation"
description: "Codex Task Routing 0.14.0 : jugement du parent, continuité du responsable, périmètre et autorisations, authentification locale et conditions d’acceptation de la route Sol vers Pro."
date: "2026-09-26T18:30:00+09:00"
author: gui
image: /images/insights/covers/codex-task-routing-design-cover-v1.webp
tags: ["Technologie", "IA", "Développement"]
callout:
  type: note
  title: "Ce qui a été vérifié"
  text: "Code public, tests et installation isolée ont été contrôlés. Un enfant Sol direct a envoyé une requête réelle à Temporary Chat Pro, récupéré et accepté la réponse via Browser plugin sous Windows. Cela ne démontre pas tous les hôtes, le backend, l’authentification réelle ni des gains mesurés."
lastUpdated: "2026-10-15T00:00:00+09:00"
---

Testez la délégation Codex sur des recherches ou revues vérifiables indépendamment, en précisant l’intégration par le parent. Transmettez fichiers, références, preuves et inconnues ; appliquez aux outils les privilèges minimaux de [OWASP: Excessive Agency](https://genai.owasp.org/llmrisk/llm062025-excessive-agency/). Déléguer ne démontre pas à lui seul une amélioration de qualité ou de coût.

Pour mener plusieurs travaux avec Codex, choisir un modèle n'est qu'une partie de la décision. Il faut aussi définir quelle étape peut être isolée, quel contexte transmettre et comment vérifier le résultat. Acecore a publié [Codex Task Routing](https://github.com/acecore-systems/codex-task-routing) pour expliciter ces choix.

![Quatre étapes de vérification : version de la politique, critères de transfert, preuves d'exécution et résultats mesurés](/images/insights/codex-task-routing-evidence.webp)

## Le parent décide, le responsable poursuit l’unité complète

La version 0.14.0 conserve modèle et raisonnement du parent choisis par l’utilisateur. Le parent gère objectifs, priorités, choix du responsable, changements importants et exceptions. Une unité demandant des inspections répétées de code, logs et tests revient à un responsable adapté ; le travail court peut rester local.

Un Sol chargé d’une correction délimitée poursuit enquête, implémentation, tests, PR autorisée, corrections convenues et revalidation. Échecs ordinaires et instructions ajoutées ne relancent pas le transfert. Conserver revision, diff, travail restant et reprise ; changements de conception, nouvelles permissions et problèmes importants reviennent au parent.

<figure class="article-diagram" data-layout="flow" data-tone="violet" data-count="3" aria-labelledby="diagram-codex-task-routing-design">
  <figcaption>
    <strong id="diagram-codex-task-routing-design">Conserver le responsable et retourner les décisions importantes</strong>
    <span>Permission de politique, autorité de l’hôte et preuve d’exécution se contrôlent séparément.</span>
  </figcaption>
  <ol class="article-diagram__nodes">
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">1</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M5 3h10l4 4v14H5z"/><path d="M15 3v5h5M8 12h8M8 16h6"/></svg></span>
      <strong>Jugement du parent</strong>
      <span>Choisir objectifs, responsable, permissions et exceptions.</span>
    </li>
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">2</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5M8 10l2 2 3-4"/></svg></span>
      <strong>Responsable continu</strong>
      <span>Enquête, correction, tests, PR et revue autorisées.</span>
    </li>
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">3</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/></svg></span>
      <strong>Acceptation du parent</strong>
      <span>Contrôler preuves et conditions avant l’étape suivante autorisée.</span>
    </li>
  </ol>
</figure>

## Inclure périmètre, fin et autorisations dans le transfert

Transmettre brièvement fichiers, sources, critères, preuves et conditions de retour. Ne pas déléguer seulement vers une autre instance du même modèle. Le parallélisme exige un travail indépendant utile du délégateur. Les petits-enfants standard se limitent à Astra vers Sol/Luna et Sol vers Luna ; Luna et petits-enfants ne délèguent plus.

Vérifier séparément création de PR, fusion, déploiement et messages. Commentaires de PR et demandes citées d’une autre tâche ne sont pas une nouvelle autorisation humaine. Les restrictions supérieures de l’hôte prévalent.

## Confier l’authentification privée au processus local

Avant de choisir le cloud pour saisir, stocker ou transférer des identifiants, le parent contrôle état local et transferts enregistrés. Seul un preset enregistré circule ; identifiants, OAuth JSON, cookies et écrans privés restent locaux. Les enfants retournent les besoins au parent.

Disponibilité, approbation, implémentation et authentification réussie sont distinctes. queued et attente d’unlock ne sont pas une réussite. Documentation publique et code sans secrets utilisent les responsables habituels. Les hooks ne lancent ni workers ni modèles.

## Un Sol direct peut posséder une requête Pro conditionnelle

Avec Chat ordinaire explicitement activé, seuls root ou un Sol direct au rôle et à la profondeur vérifiés possèdent la route Browser. Contrôler matériaux approuvés, permission de transport, outils réels et environnement. Vérifier Pro dans l’UI avant et après une seule requête réelle en Temporary Chat, distincte de Work et des API de modèles.

Le même responsable prépare, envoie, collecte, accepte et corrige dans l’autorisation, conservant tab, ID, input hash et état envoyé. Retourner la collecte au parent ne renvoie pas la requête. Déclarations actor, SubagentStart et noms configurés ne prouvent pas rôle, autorité ou backend ; une incertitude bloque l’envoi.

## Séparer tests, transport réel et amélioration

Le [changement 0.14.0](https://github.com/acecore-systems/codex-task-routing/pull/20) a contrôlé 198 tests et l’installation isolée. Le [constat réel](https://github.com/acecore-systems/codex-task-routing/pull/22) confirme un Sol direct envoyant une fois sans réenvoi via Browser plugin sous Windows, récupérant la même réponse et vérifiant ID/hash et sens. C’est une preuve limitée à cet environnement.

Backend Pro, tous les hôtes, parcours IAB, nouveaux petits-enfants réels, authentification privée et gains de qualité ou d’usage restent non démontrés. Ne pas convertir les mesures absentes en zéro ; inclure préparation, attente, acceptation et reprises. Installation dans le [README public](https://github.com/acecore-systems/codex-task-routing#readme). Vérifié le 14 octobre 2026.
