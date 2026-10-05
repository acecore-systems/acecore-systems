---
title: "Importing Profile Details as a Draft: Review, Replace, and Publish Deliberately"
description: "A generalized implementation for importing profile details from text, CSV, and static HTML. It covers comparison with current values, field selection and replacement, save and publication boundaries, and unsupported inputs."
date: "2026-10-06T01:10:00+09:00"
author: gui
image: /images/insights/profile-import-draft-boundaries.webp
tags: ["Web", "Import", "Security"]
callout:
  type: note
  title: "Stage 1 implementation scope"
  text: "Implementation, integration, and production deployment of text, CSV, and static HTML import were confirmed. End-to-end acceptance from import through save and publication in a real account remains outstanding; direct URL fetching and image or audio migration are outside this release."
---

When moving an existing profile into another editor, compare the current value with the import candidate before replacing anything. This generalized account of a Stage 1 implementation explains the boundaries between import and publication.

## Define the supported input formats first

This stage supports text, CSV, and static HTML. Parsing pasted content or a file is different from visiting a URL to retrieve its contents. JSON, images, audio, dynamic pages, and APIs for external services are not part of the completed implementation.

Treat HTML as input data: do not execute scripts or render the imported HTML itself in the public page. Set limits on text length, fields, links, and input formats, then convert the source into text candidates needed for a profile.

## Separate candidate review from editing the profile

Do not publish parsed results immediately; compare the current values with the candidates first. The owner selects fields individually and can edit candidate values before applying them to the editor. A selected field replaces its current value, so review the differences on every import. The change can be undone before saving, but this does not mean automatic protection for manual edits or conflict merging has been completed.

## Do not infer qualifications or rights from imported text

Wording in a bio or on an external page does not automatically establish a qualification, affiliation, category, or licence. Keep descriptive text that may be imported as a candidate separate from information that requires identity checks or an application. New information elsewhere does not automatically update the owner's confirmed profile or publish it.

## Keep saving and publication as separate decisions

Applying import candidates, saving the draft, and updating the public snapshot are separate actions. Save conflicts still need to be covered by acceptance testing; a successful save does not mean the profile has been published. Review links, including public calendar URLs, before publishing their values, and keep private notes out of public data.

## Related update: opening HTTPS links from public calendar events

A separate editing update, independent of import, adds HTTPS links to public calendar events. An event opens its destination directly in a new tab; events without a link are displayed without an actionable link. Validate the URL format, absence of embedded credentials, and input length. Add `noopener noreferrer` and include the new-tab behavior in the accessible name.

The related forms also remove an unnecessary title field for collaboration-availability slots and private-note fields. Database changes, CI, production deployment, and displays with verification data were checked; a real owner signing in, saving an actual event, and publishing it remains unverified.

## What was verified and what comes next

Implementation, integration, and production deployment of the Stage 1 import flow were confirmed. However, an end-to-end test by a real user—from import through editing and saving to verifying the published display—has not been completed. The broader idea of automatically building an entire profile from an activity-site URL is not complete.

For boundaries around published CSS, see [Safe user CSS and versioned public themes](/insights/user-css-versioned-theme-safety/). For login boundaries, see [Session lifecycles across services](/insights/multi-service-session-lifecycle/).
