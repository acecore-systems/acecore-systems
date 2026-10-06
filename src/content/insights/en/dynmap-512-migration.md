---
title: "How we verified Dynmap's 512px migration and retired old R2 tiles"
description: "An operations record of migrating Dynmap images across eight servers and 89 maps to 512px tiles, then checking public display and old R2 data removal."
date: "2026-09-27T22:40:00+09:00"
lastUpdated: "2026-10-06T08:52:00+09:00"
author: gui
image: /images/insights/dynmap-512-migration.webp
tags: ["Technology", "Cloudflare"]
callout:
  type: note
  title: "Scope of verification"
  text: "A production audit on September 11, 2026 confirmed the migration and removal of old images. We have not verified the billed amount or a cost reduction rate during normal operation."
---

We changed the map image format in a Dynmap setup that serves tiles from Cloudflare R2, then cleared the old data. The scope was eight servers and 89 maps. The critical part was the order: verify the new images in public before deleting the old ones.

## Migrate in stages with a bounded render area

We standardized the production maps on 512px tiles. For 21 maps requiring additional rendering, we limited the area to a 2,000-block radius around the public center. We did not require a render of the entire world to finish; ordinary map updates continued during the transition.

We also improved retries after R2 communication failures, preservation of pending updates after write failures, and the distinction between a missing zoom tile and a read error. The [Dynmap fork PR #9](https://github.com/acecore-systems/dynmap/pull/9) records the fix for resuming zoom updates after restart. These changes do not prevent failures inside Cloudflare itself.

<figure class="article-diagram" data-layout="flow" data-tone="green" data-count="3" aria-labelledby="diagram-dynmap-512-migration">
  <figcaption>
    <strong id="diagram-dynmap-512-migration">Retire old data only after verifying the new images</strong>
    <span>Audit public output and storage before cleanup. Old images have no backup, and normal-operation cost savings are unverified.</span>
  </figcaption>
  <ol class="article-diagram__nodes">
    <li>
      <span class="article-diagram__symbol">
        <span aria-hidden="true">1</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
          <path d="M3 5l9-3 9 3v14l-9 3-9-3z M12 2v20 M3 5l9 3 9-3 M3 12l9 3 9-3"/>
        </svg>
      </span>
      <strong>Bound the area and create new tiles</strong>
      <span>Set the 512px scope and render area, then create new images while routine updates continue.</span>
    </li>
    <li>
      <span class="article-diagram__symbol">
        <span aria-hidden="true">2</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
          <path d="M10.5 3a7.5 7.5 0 1 0 0 15 7.5 7.5 0 0 0 0-15z M16 16l5 5"/>
        </svg>
      </span>
      <strong>Audit public images and storage</strong>
      <span>Check regular and zoom images, web assets, live JSON, and the intended storage prefixes separately.</span>
    </li>
    <li>
      <span class="article-diagram__symbol">
        <span aria-hidden="true">3</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
          <path d="M4 7h16 M9 7V4h6v3 M7 7l1 14h8l1-14"/>
        </svg>
      </span>
      <strong>Clean up legacy data after audit</strong>
      <span>Remove legacy images and hashes after audit. They have no backup and must be rendered again from the world if needed.</span>
    </li>
  </ol>
</figure>

## Verify the public map and storage separately

After the switch, we checked one regular tile and one zoom tile for each of the 89 published maps: 178 images in total. We checked that the images were 512px and reviewed the web assets and live JSON updates. On R2, we audited whether storage paths matched the 89 production map prefixes and confirmed that 192 old regular and day-image prefixes were empty.

Only then did we remove 11,707,356 old image and hash objects, about 51.71 GB. The old image content has no backup; if needed, it must be rendered again from the worlds. We retained the current images, worlds, configuration, and JAR backups. A final audit, rather than the deletion process exit alone, confirmed that no old images, stage data, or old hash files remained.

## Do not equate storage changes with a bill

Across two consecutive 24-hour windows that included the migration, successful PutObject calls fell from 240,835 to 90,423. Both windows included migration work, so the comparison is not a normal-operation reduction rate or a monthly cost estimate. The billed amount remains unverified.

For similar migrations, inspect [R2 operation and storage metrics](https://developers.cloudflare.com/r2/platform/metrics-analytics/) separately, then verify public display, current images, and old data in that order. Decide the deletion scope and recovery method before removing anything.
