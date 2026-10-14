---
title: "Safe User CSS and Public Themes: Shared Source, Scoped Rendering, and Versioned Releases"
description: "A shared CSS source for GUI and handwritten editing, safe rendering, and immediate application of fixed store themes. Covers independent page and directory targets, owner previews, drafts and publication."
date: "2026-10-06T01:10:00+09:00"
lastUpdated: "2026-10-15T00:00:00+09:00"
author: gui
image: /images/insights/covers/user-css-versioned-theme-safety-cover-v1.webp
tags: ["CSS", "Security", "Web"]
callout:
  type: note
  title: "Implementation checks do not equal end-to-end user acceptance"
  text: "CSS/GUI editing, the fixed-version store, immediate application, independent page/card targets and owner previews are integrated and deployed, with public display checked. Authenticated interactions used synthetic profiles. Real-owner consent, application, saving and publication, and paid sales, remain unproven."
---

A profile editor that lets people adjust colors and spacing in a GUI and edit the overall layout with CSS needs to address both usability and the safety of code shown on public pages. This anonymized implementation illustrates the boundaries between editing and distribution.

## Choose styling freedom and distribution separately

For personal editing, first test scope containment and save conflicts. Distribution to others also needs fixed version IDs, usage terms, and a default appearance after suspension. Use a small theme with Grid and pseudo-elements to check unchanged outer navigation and stability of applied versions after author updates.

[W3C Selectors：Checking selector scope](https://www.w3.org/TR/selectors-4/)

## Use one CSS source of truth for the GUI and direct editing

In a later expansion, the full CSS became the theme's source of truth, and the GUI was changed to edit the same CSS declarations. Handwritten comments, declarations the GUI does not manage, and responsive rules are preserved. The older format with GUI settings and additional CSS is carried forward into an editable full stylesheet. Changing only helper settings used to display a settings list does not mean the CSS used for rendering has changed.

The CSS/GUI editor and owner-preview expansion is integrated, with CI and production delivery checked. Authenticated interaction checks use synthetic profiles and do not establish editing, saving and publication by a real owner.

## Support rich CSS syntax within the rendering boundary

The initial limits based on a small property allowlist were expanded to cover Grid and Flex, variables, gradients, pseudo-elements, transforms, animations, and rules such as @media, @supports, and @container. This does not mean arbitrary CSS is inserted without inspection. The syntax tree is parsed, and every selector branch is confined to descendants of the designated profile region. The same boundary is applied inside conditional rules; outer operator controls and license displays are outside the theme's scope. [W3C Selectors](https://www.w3.org/TR/selectors-4/) is a starting point for the selector specification.

Variable and keyframe names are rewritten to unique names in published CSS to avoid interference with variables in the outer interface or animations from another theme. The original names remain available for editing. Containment and isolation on the outer rendering wrapper further confine the effects of broad layout rules to the profile region.

External resource fetching, global rules such as @import and @font-face, unparsable syntax, CSS nesting, the HTML style terminator, and animation references whose names cannot be resolved safely are rejected. Input and generated output sizes are also checked. On publication and when loading a snapshot, the scope, unique names, and validated canonical CSS string are checked again for consistency. Supporting a broad syntax does not guarantee identical rendering in every browser.

## Separate try-on, CSS saving and store application

Handwritten CSS or GUI editing, try-on and draft saving affect the owner’s editing view. Showing saved CSS to visitors requires a separate profile publication action. Detect save conflicts and preserve retry boundaries that prevent duplicate draft or version updates.

Selecting an available public fixed version from the store, accepting its terms and applying it immediately changes the appearance of an already public profile. It updates only the theme, preserving published content without publishing draft text or images. It does not publish a private profile. Store application and saving handwritten CSS as a draft therefore need different explanations.

<figure class="article-diagram" data-layout="boundary" data-tone="violet" data-count="3" aria-labelledby="diagram-user-css-versioned-theme-safety">
  <figcaption>
    <strong id="diagram-user-css-versioned-theme-safety">Where CSS edits and store application take effect</strong>
    <span>Applying a store theme to a public profile immediately updates only the chosen target’s appearance.</span>
  </figcaption>
  <ol class="article-diagram__nodes">
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">1</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M5 3h10l4 4v14H5z"/><path d="M15 3v5h5M8 12h8M8 16h6"/></svg></span>
      <strong>CSS/GUI editing</strong>
      <span>Owner preview and draft saving; publication is separate.</span>
    </li>
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">2</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5M8 10l2 2 3-4"/></svg></span>
      <strong>Apply a fixed store version</strong>
      <span>Check available public version and consent; do not publish private profiles.</span>
    </li>
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">3</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/></svg></span>
      <strong>Independent page and directory</strong>
      <span>Keep CSS, drafts and public versions per target.</span>
    </li>
  </ol>
</figure>

## Keep page and directory themes independent and preview owner content

Profile pages and directory cards have separate CSS, drafts, public versions, provenance and store targets. Selecting a page theme leaves the directory unchanged; incompatible version targets and target changes are rejected. Cards retain common dimensions and responsive boundaries, tested with long names and descriptions.

Settings show the saved owner preview and theme name, with store selection and editing in the same screen. Switching between visual and code editing retains unsaved names, CSS and the conflict-detection version. Preview actual owner content as well as samples; saving updates only the chosen target’s draft.

## Keep another author's update from changing an active design

A theme's editable listing information is separated from its immutable versions. A user imports a specific version ID; when the author releases a new version, existing drafts and published versions do not change automatically. The source and version applied, along with the source of the usage terms, remain attached after editing. If a public profile becomes private again, the author's draft name and image must not leak into the distributed theme.

## Distinguish delisting from operational suspension

An author delisting a theme stops new discovery and application, but does not necessarily revoke existing uses of a pinned version immediately. Suspending a dangerous theme operationally has a different boundary: public retrieval and CSS from existing snapshots are stopped, and the standard appearance is restored. Even when rolling back to an older snapshot, the current suspension state is checked so that CSS from before suspension cannot be revived.

## What to verify before publication

Check selectors outside scope, external requests, capacity, save conflicts, retries, delisting, suspension and rollback. Production delivery covers fixed versions, CSS/GUI editing, independent targets and owner previews; public catalogs and real directory cards were checked. Authenticated checks used synthetic profiles, so real-owner consent, application, saving and publication remain unaccepted. Terms do not guarantee complete copy prevention for delivered CSS. Checked on 14 October 2026.

For the input side of editing, see [draft import of profile information](/insights/profile-import-draft-boundaries/); for CMS operations, see [the Sveltia CMS guide](/insights/cms-selection-and-turnstile/).
