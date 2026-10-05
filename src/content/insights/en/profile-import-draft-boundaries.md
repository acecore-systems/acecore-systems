---
title: "Import Profile Details as a Draft: Compare, Select, and Publish Deliberately"
description: "A generalized profile-import flow for text, CSV, static HTML, and shared JSON. Learn how it compares current values, lets people replace selected fields or undo changes, and keeps saving separate from publication."
date: "2026-10-06T01:10:00+09:00"
lastUpdated: "2026-10-06T02:20:00+09:00"
author: gui
image: /images/insights/profile-import-draft-boundaries-20261006-v2.webp
tags: ["Web", "Import", "Security"]
callout:
  type: note
  title: "Verified implementation; real-account acceptance remains"
  text: "Text, CSV, static HTML, and shared JSON import have been implemented, integrated, and deployed to production. Real-account acceptance from import through save and publication is incomplete. Automatic service-specific URL retrieval and image or audio migration are outside this completed scope."
---

When moving an existing profile into another editor, compare the current values with the import candidates before replacing anything. This anonymized example explains the boundaries between importing data and publishing a profile.

## Choose supported input formats first

Alongside the original text, CSV, and static HTML paths, the flow now reads a shared JSON file and provides a downloadable template. Parsing pasted content or a file is different from visiting a URL to retrieve its contents. Service-specific export formats, automatic URL retrieval, image and audio migration, dynamic pages, and external-service APIs are not complete.

Treat HTML as input data. Do not execute scripts or render the imported HTML itself on the public page. Limit text length, fields, links, and input formats, then convert the source into text candidates suitable for a profile.

## Review candidates before replacing existing values

Do not publish parsed results immediately. Compare them with current values first. The owner selects fields one by one and can edit candidate values before applying them to the editor. Applying a selected field replaces its current value, so review the differences on every import. The change can also be undone. These controls do not guarantee that conflicts with edits made elsewhere or by another person will be resolved automatically.

## Separate common JSON from service-specific support

The interface shows support status for 7 activity services. Reading data in the shared format does not mean the flow can fetch a profile directly from each service URL. For unsupported URLs, it directs people to import by pasting content instead. A status list for all 7 services does not mean that dedicated exports or API integrations have been implemented for each one.

Synthetic data was used to check JSON import, comparison with existing values, applying selected fields, undo, and the mobile layout. Acceptance from import through save and publication in a real account still needs a separate check.

## Do not infer qualifications or rights from imported text

Wording in a bio or on an external page does not establish a qualification, affiliation, category, or licence by itself. Keep descriptive text that can be imported as a candidate separate from information that requires identity checks or an application. Changes to external information do not automatically update or publish a profile the owner has confirmed.

## Keep saving and publication as separate decisions

Applying import candidates, saving a draft, and updating the public snapshot are separate actions. Save conflicts also need acceptance testing; a successful save does not mean the profile has been published. Have the owner review links, including public calendar URLs, before making those values public, and keep private notes out of public data.

## Related update: open HTTPS links from public calendar events

A separate editing update, independent of profile import, adds HTTPS links to public calendar events. An event opens its destination directly in a new tab. Events without a URL remain visible without an actionable link. Validate the URL format, reject embedded credentials, and limit input length. Add **noopener noreferrer** and include the new-tab behavior in the accessible name.

The related forms also remove an unnecessary title field for collaboration availability slots and fields for private notes. Database changes, CI, production deployment, and screens using verification data were checked. Acceptance by an owner signing in, saving an actual event, and publishing it remains unverified.

## What was verified and what comes next

Implementation, integration, and production deployment were confirmed for text, CSV, static HTML, and shared JSON import. An end-to-end test by a real user—from import through editing and saving to checking the published result—has not been completed. The broader idea of automatically building a full profile from an activity-service URL is not complete.

For boundaries around published CSS, see [Safe user CSS and versioned public themes](/insights/user-css-versioned-theme-safety/). For login boundaries, see [Session lifecycles across services](/insights/multi-service-session-lifecycle/).
