---
title: "Using public registers for CRM candidates: preserve sources and differences for human review"
description: "A design that separates original public data from acquisition observations and prevents duplicate, disappeared, or changed candidates from being automatically reflected in existing company records."
date: "2026-11-17T12:00:00+09:00"
author: gui
image: /images/insights/covers/private-dashboard-access-and-aggregation-cover-v1.webp
tags: ["Data", "CRM", "Operations"]
---

When creating CRM candidates from a public register, facilities with the same name do not necessarily belong to the same operator. Rather than directly treating updates or missing rows in the source data as updates to existing company records or evidence of closure, make sources and differences available for human review.

<figure class="article-diagram" data-layout="flow" data-tone="blue" data-count="3" aria-labelledby="diagram-public-register-snapshot-review">
  <figcaption><strong id="diagram-public-register-snapshot-review">Using public registers for CRM candidates: preserve sources and differences for human review</strong><span>A design that separates original public data from acquisition observations and prevents duplicate, disappeared, or changed candidates from being automatically reflected in existing company records.</span></figcaption>
  <ol class="article-diagram__nodes">
    <li><strong>Save the original</strong><span>Record the source, reference date, and observation time.</span></li>
    <li><strong>Review differences</strong><span>Reuse identical originals and hold duplicate names for review.</span></li>
    <li><strong>Let a person decide</strong><span>Check candidates before adding any necessary records.</span></li>
  </ol>
</figure>

## Keep originals and observations separate

Record the source URL, terms of use, publisher's reference date, and acquisition time. Even if the original is the same as the previous one, the time of rechecking or the publisher's description may differ. By separating storage of the file contents from observations of what was checked and when, you can reuse identical files while retaining a review history.

For example, [Funabashi City's data catalog](https://www.city.funabashi.lg.jp/shisei/toukei/002/opendata.html) is a place to check public data and terms of use. Also check the terms, update date, and scope of each dataset you actually use. Do not assume that publication alone permits every acquisition method or use.

## Show changes and disappearances as information for review

In an internal register-matching exercise, we compared all rows before and after and displayed field differences for names that could be uniquely matched. When multiple entries had the same name, we held them for review rather than matching them automatically. A missing row is an observation that it is no longer visible in the data, not evidence of a closure or grounds for deleting a company. Addresses and phone numbers are not automatically overwritten in existing company records either.

Using fictional data, we tested reuse of identical originals, field changes and disappearances, holding duplicate names for review, and resuming after partial failures. This article contains no actual originals or sales information. Update methods and identifiers differ by dataset, so these tests cannot be treated as a guarantee that unrestricted automated acquisition from other sites is appropriate.

## Steps to try first

Prepare 2 versions of a small fictional CSV, including unchanged rows, changed rows, missing rows, and 2 rows with the same name. Save the originals and observation times, display only candidates, and confirm that existing data remains unchanged. Stop if acquisition fails or the terms of use change, and resume only after a person checks the source data. Decide on the retention period and deletion method before starting operations. Checked on: 2026-11-17.
