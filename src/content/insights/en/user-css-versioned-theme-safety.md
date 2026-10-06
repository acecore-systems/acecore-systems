---
title: "Safe User CSS and Public Themes: Shared Source, Scoped Rendering, and Versioned Releases"
description: "An anonymized profile-editing design where a shared CSS source of truth can be edited through both a GUI and direct changes. Covers rich CSS syntax within a rendering boundary, drafts and published versions, immutable theme releases, delisting, and operational suspension."
date: "2026-10-06T01:10:00+09:00"
lastUpdated: "2026-10-06T08:52:00+09:00"
author: gui
image: /images/insights/covers/user-css-versioned-theme-safety-cover-v1.webp
tags: ["CSS", "Security", "Web"]
callout:
  type: note
  title: "Implementation checks do not equal end-to-end user acceptance"
  text: "The fixed-version theme store's database change, production delivery, and display with test data were confirmed. The shared CSS source and GUI editing expansion were confirmed merged into main with CI; production delivery and logged-in acceptance were not confirmed within this audit scope. Submission and application by real users, and paid sales, have not been demonstrated."
---

A profile editor that lets people adjust colors and spacing in a GUI and edit the overall layout with CSS needs to address both usability and the safety of code shown on public pages. This anonymized implementation illustrates the boundaries between editing and distribution.

## Use one CSS source of truth for the GUI and direct editing

In a later expansion, the full CSS became the theme's source of truth, and the GUI was changed to edit the same CSS declarations. Handwritten comments, declarations the GUI does not manage, and responsive rules are preserved. The older format with GUI settings and additional CSS is carried forward into an editable full stylesheet. Changing only helper settings used to display a settings list does not mean the CSS used for rendering has changed.

The backend and frontend expansions were each merged into their main branch, and CI and implementation tests were checked. Within this audit scope, that is not proof of production delivery or of an end-to-end workflow tested by a logged-in user.

## Support rich CSS syntax within the rendering boundary

The initial limits based on a small property allowlist were expanded to cover Grid and Flex, variables, gradients, pseudo-elements, transforms, animations, and rules such as @media, @supports, and @container. This does not mean arbitrary CSS is inserted without inspection. The syntax tree is parsed, and every selector branch is confined to descendants of the designated profile region. The same boundary is applied inside conditional rules; outer operator controls and license displays are outside the theme's scope. [W3C Selectors](https://www.w3.org/TR/selectors-4/) is a starting point for the selector specification.

Variable and keyframe names are rewritten to unique names in published CSS to avoid interference with variables in the outer interface or animations from another theme. The original names remain available for editing. Containment and isolation on the outer rendering wrapper further confine the effects of broad layout rules to the profile region.

External resource fetching, global rules such as @import and @font-face, unparsable syntax, CSS nesting, the HTML style terminator, and animation references whose names cannot be resolved safely are rejected. Input and generated output sizes are also checked. On publication and when loading a snapshot, the scope, unique names, and validated canonical CSS string are checked again for consistency. Supporting a broad syntax does not guarantee identical rendering in every browser.

## Separate preview, draft, and publication

Trying on or applying a theme changes a draft. The public page does not change until the owner publishes it. Being able to edit handwritten CSS again is also different from exposing that original source to visitors. The save contract detects conflicts and prevents a retried operation from duplicating a version or draft update.

## Keep another author's update from changing an active design

A theme's editable listing information is separated from its immutable versions. A user imports a specific version ID; when the author releases a new version, existing drafts and published versions do not change automatically. The source and version applied, along with the source of the usage terms, remain attached after editing. If a public profile becomes private again, the author's draft name and image must not leak into the distributed theme.

## Distinguish delisting from operational suspension

An author delisting a theme stops new discovery and application, but does not necessarily revoke existing uses of a pinned version immediately. Suspending a dangerous theme operationally has a different boundary: public retrieval and CSS from existing snapshots are stopped, and the standard appearance is restored. Even when rolling back to an older snapshot, the current suspension state is checked so that CSS from before suspension cannot be revived.

<figure class="article-diagram" data-layout="flow" data-tone="violet" data-count="3" aria-labelledby="diagram-user-css-versioned-theme-safety">
  <figcaption>
    <strong id="diagram-user-css-versioned-theme-safety">From CSS editing to a fixed release</strong>
    <span>Code integration, CI, and production delivery of the earlier Store version were checked. Production/login acceptance of the CSS expansion, user application, and paid sales are unverified.</span>
  </figcaption>
  <ol class="article-diagram__nodes">
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">1</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="m8 6-5 6 5 6M16 6l5 6-5 6M14 4l-4 16"/></svg></span>
      <strong>Shared CSS source</strong>
      <span>The GUI and direct editing use the same CSS source and preserve hand-written rules.</span>
    </li>
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">2</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M8 8h8M8 12h5M8 16h8"/></svg></span>
      <strong>Parse and scope</strong>
      <span>Support Grid/Flex, variables, pseudo-elements, responsive rules, and animation. Reject external, global, or unparseable input.</span>
    </li>
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">3</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/></svg></span>
      <strong>Publish an explicit version</strong>
      <span>Publish an immutable version after preview/draft. Delisting and operational suspension are separate.</span>
    </li>
  </ol>
</figure>

## What to verify before publication

Check out-of-scope selectors, external requests, input size, save conflicts, retries, an author's profile becoming private, delisting, operational suspension, and rollback. Production delivery of the fixed-version store and display of test data were confirmed, but production delivery and logged-in acceptance of the CSS editing expansion remain unconfirmed within this audit scope. The public theme count was zero at an earlier check; this is not a statement of the current count. An end-to-end test of real users submitting and applying themes, and paid sales, have not been demonstrated. Usage terms cannot guarantee that CSS delivered to a browser will never be copied.

For the input side of editing, see [draft import of profile information](/insights/profile-import-draft-boundaries/); for CMS operations, see [the Sveltia CMS guide](/insights/cms-selection-and-turnstile/).
