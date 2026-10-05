---
title: "Handling User CSS and Public Themes Safely: Validation, Version Pinning, and Suspension"
description: "A generalized look at profile editing with both GUI controls and hand-written CSS. It covers CSS allowlists, drafts and published versions, immutable theme releases, delisting, and operator suspension."
date: "2026-10-06T01:10:00+09:00"
author: gui
image: /images/insights/user-css-versioned-theme-safety.webp
tags: ["CSS", "Security", "Web"]
callout:
  type: note
  title: "Implementation checks are not end-to-end user acceptance"
  text: "This anonymized case covers implementation, a database change, production delivery, and rendering with test data. At the time of review, there were no public themes. End-to-end submission and application by real users, or paid sales, were not demonstrated."
---

A profile editor that lets people adjust colors and spacing through a GUI, with an option to write a limited CSS syntax, has to address both usability and the safety of code shown on public pages. This anonymized implementation provides a way to separate editing from distribution.

## Restrict CSS with a small grammar

Do not insert arbitrary CSS directly into a public page. Parse it and allow only supported components, properties, and values. The current implementation intentionally accepts a small grammar; broader CSS editing remains an additional, unfinished request. This implementation limits rules to selected classes and a small set of pseudo-classes, and rejects external URLs, at-rules, unrestricted attribute selectors, HTML delimiters, and excessive rule counts.

Scope accepted CSS to a defined profile area, regenerate it, and validate it again before publication. Keep GUI settings and the hand-written source available for editing, while fixing only validated CSS in the public snapshot. Scoping alone does not make arbitrary CSS safe. See the [W3C Selectors specification](https://www.w3.org/TR/selectors-4/) for selector concepts.

## Keep preview, draft, and publication separate

Trying on or applying a theme changes a draft. The public page changes only after its owner publishes. Being able to edit hand-written CSS again is also different from sending that source to visitors. Detect save conflicts and make retries idempotent so that resending an operation does not update a version or draft twice.

## Do not let another author's update change an active design

Separate mutable theme-listing information from immutable releases. A user imports a specific version ID, so an author publishing a new version does not silently change an existing draft or published design. Preserve the source, version, and license attribution after editing. If a public profile becomes private, do not let the author's draft name or image leak into the distributed theme.

## Distinguish delisting from an operator suspension

An author delisting a theme can stop new discovery and application without necessarily revoking an already pinned version. An operator suspending a dangerous theme needs a different boundary: stop serving its CSS, including CSS in existing snapshots, and fall back to the standard appearance. After rolling back to an older snapshot, check the current suspension state so that CSS from before the suspension cannot return.

## Checks to perform before publication

Test out-of-scope selectors, external requests, input size, save conflicts, retries, author privacy changes, delisting, operator suspension, and rollback. The code, delivery, and rendering of test data were checked, but that is not an end-to-end test of a real user submitting a theme and another user applying it. License terms also cannot guarantee that CSS delivered to a browser will never be copied.

For the input side of editing, see [Draft Boundaries for Profile Imports](/en/insights/profile-import-draft-boundaries/); for CMS operations, see the [Sveltia CMS guide](/en/insights/cms-selection-and-turnstile/).
