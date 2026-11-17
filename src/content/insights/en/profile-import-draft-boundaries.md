---
title: "Import Profile Details as a Draft: Compare, Select, and Publish Deliberately"
description: "Import candidates from a public profile URL into a draft, with limited media retrieval, recovery from reread failure, and owner-controlled saving and publication."
date: "2026-10-06T01:10:00+09:00"
lastUpdated: "2026-11-17T00:00:00+09:00"
author: gui
image: /images/insights/covers/profile-import-draft-boundaries-cover-v1.webp
tags: ["Web", "Import", "Security"]
callout:
  type: note
  title: "Verified implementation; real-account acceptance remains"
  text: "Limited public URL, image and audio imports are implemented and deployed. Synthetic interactions and selected public media were checked. Real-owner rights review, saving and publication remain unaccepted. Official login is outside the scope, and source restrictions are not bypassed."
---

When moving an existing profile into another editor, compare the current values with the import candidates before replacing anything. This anonymized example explains the boundaries between importing data and publishing a profile.

## Test preservation of edits with one biography field

Manually edit an existing biography, then retrieve a different candidate from a supported public profile URL. Check that unselected fields remain, selected replacements can be reviewed, and cancellation restores the original. Compare the draft with the public page: importing alone does not publish.

[OWASP：Validating input format, values, and length](https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html)

## Choose supported input formats first

The current entry point accepts a supported public profile URL. Retrieved HTML is parsed as data; scripts and original markup are not executed on the public page. Length, count, format and HTTPS links are validated. File upload, pasted text and official login are not import entry points.

Links retain their order of appearance and balanced parentheses within URLs. A URL inside a Markdown link is not collected twice, while the same URL repeated elsewhere remains a separate candidate. Order and duplicates are not silently tidied without the owner deciding.

## Review candidates before replacing existing values

Do not publish parsed results immediately. Compare them with current values first. The owner selects fields one by one and can edit candidate values before applying them to the editor. Applying a selected field replaces its current value, so review the differences on every import. The change can also be undone. These controls do not guarantee that conflicts with edits made elsewhere or by another person will be resolved automatically.

If rereading the same URL fails, previous candidates, edits, selections and retrieved media remain. Show the error and identify the candidates as previous results. Replace them when the source changes or rereading succeeds. Retention does not apply, save or publish them.

## Distinguish URL retrieval from official integrations

URL retrieval is limited to known public structures on Profcard, lit.link, POTOFU, HTML Meishi and foriio. Check source identity, indexing exclusions and candidate consistency, and do not expand retrieval to authenticated pages or disallowed destinations. This does not establish official login or API integration with those services, or complete profile migration.

Unsupported URLs and unavailable dynamic content are not treated as successful imports. Stop on 401, 403 or 429; do not bypass restrictions through another browser or API.

[OWASP: Limit URL destinations and redirects to prevent SSRF](https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html)

## Review the retrieved image or audio before selecting it

Candidates can include GIF profile images, portfolio images and titles from known link cards and public posts, with limited support for allowed GitHub image, WAV and MP3 links and individual public Dropbox files. POTOFU descriptions can also be taken from initial data when a public post uniquely matches the same profile, image and original title. Further text is eligible only under defined checks including matching the visible leading posts. Extra pages, embedded players, ambiguous posts and the foriio gallery remain unsupported; source restrictions are not bypassed.

Recheck the source and candidate, then validate host, path, redirects, MIME, file content, size and deadlines. Owners view or listen to the same retrieved bytes and review rights, titles and descriptions. Add only selected attachments to unsaved portfolio entries, prepare them through the existing upload path and use normal saving. Saving rechecks owner, profile, media kind and ready state while preserving manual input and the public snapshot.

<figure class="article-diagram" data-layout="flow" data-tone="violet" data-count="4" aria-labelledby="diagram-profile-import-draft-boundaries">
  <figcaption>
    <strong id="diagram-profile-import-draft-boundaries">Boundaries between retrieval, selection, saving and publication</strong>
    <span>Failed rereads retain previous candidates. Import alone leaves the public snapshot unchanged.</span>
  </figcaption>
  <ol class="article-diagram__nodes">
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">1</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M5 3h10l4 4v14H5z"/><path d="M15 3v5h5M8 12h8M8 16h6"/></svg></span>
      <strong>Read limited inputs</strong>
      <span>Validate supported URLs, formats and retrieval limits.</span>
    </li>
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">2</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5M8 10l2 2 3-4"/></svg></span>
      <strong>Compare and select</strong>
      <span>Review image/audio and preserve manual edits.</span>
    </li>
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">3</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/></svg></span>
      <strong>Save the draft</strong>
      <span>Use normal saving for selected fields and prepared attachments.</span>
    </li>
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">4</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M6 4v6a3 3 0 0 0 3 3h6a3 3 0 0 1 3 3v4"/><path d="M18 4v3a3 3 0 0 1-3 3H9a3 3 0 0 0-3 3v7"/></svg></span>
      <strong>Owner publishes</strong>
      <span>Update the public snapshot in a separate action.</span>
    </li>
  </ol>
</figure>

## Do not infer qualifications or rights from imported text

Wording in a bio or on an external page does not establish a qualification, affiliation, category, or licence by itself. Keep descriptive text that can be imported as a candidate separate from information that requires identity checks or an application. Changes to external information do not automatically update or publish a profile the owner has confirmed.

## Keep saving and publication as separate decisions

Applying import candidates, saving a draft, and updating the public snapshot are separate actions. Save conflicts also need acceptance testing; a successful save does not mean the profile has been published. Have the owner review links, including public calendar URLs, before making those values public, and keep private notes out of public data.

## Related update: open HTTPS links from public calendar events

A separate editing update, independent of profile import, adds HTTPS links to public calendar events. An event opens its destination directly in a new tab. Events without a URL remain visible without an actionable link. Validate the URL format, reject embedded credentials, and limit input length. Add **noopener noreferrer** and include the new-tab behavior in the accessible name.

The related forms also remove an unnecessary title field for collaboration availability slots and fields for private notes. Database changes, CI, production deployment, and screens using verification data were checked. Acceptance by an owner signing in, saving an actual event, and publishing it remains unverified.

## What was verified and what comes next

Implementation, CI and production delivery cover limited URLs, GIFs, portfolio images and audio. Checks include synthetic editing and undo, and retrieval of selected public files. The source POTOFU profile still returns 429; retrieving a CDN file does not prove profile retrieval. Real-owner acceptance from rights review through saving and publication remains incomplete. Checked on 14 October 2026.

For boundaries around published CSS, see [Safe user CSS and versioned public themes](/insights/user-css-versioned-theme-safety/). For login boundaries, see [Session lifecycles across services](/insights/multi-service-session-lifecycle/).
