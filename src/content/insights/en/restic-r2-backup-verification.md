---
title: "Monitoring restic backups on R2: from successful storage to verified restoration"
description: "Track snapshot freshness, repository integrity and restoration separately, and identify the application recovery steps that remain untested."
date: "2026-09-30T20:53:00+09:00"
lastUpdated: "2026-10-06T08:52:00+09:00"
author: gui
image: /images/insights/covers/restic-r2-backup-verification-cover-v1.webp
tags: ["Cloudflare R2", "restic", "Backup"]
callout:
  type: note
  title: "Full recovery requires separate verification"
  text: "Scheduled backups, monitoring, retention and extraction/integrity checks of selected data were performed. Startup of every application and disaster recovery including separately managed credentials were not demonstrated."
---

A completed backup job does not establish that the required data can be recovered. This generalized internal case evaluates storage, integrity, restoration and service recovery separately. It does not describe a completed migration from another backup service.

## Define the source and success

The design uses restic encryption and deduplication with R2’s S3-compatible API. Check required operations against the [compatibility table](https://developers.cloudflare.com/r2/api/s3/api/). For live databases, design consistent capture using dumps or application quiescence where appropriate.

## Monitor freshness separately

Track the latest successful snapshot, overdue runs, failures, and integrity/restore results independently. Starting a job is not success. Also distinguish a failed notification from a failed backup.

## Check integrity and extraction

Default `restic check` and checks that read stored data have different scopes. `--read-data` reads all data; record the scope of any partial check. Combine the [repository checks](https://restic.readthedocs.io/en/stable/045_working_with_repos.html) with [restoration](https://restic.readthedocs.io/en/stable/050_restore.html) into an isolated location and comparisons of contents or hashes. Extracting files does not verify application startup.

## Retain data through restic

Choose snapshots with restic’s retention policy, then use `forget`, `prune` and `check`, inspecting what will remain before executing. Blanket age-based deletion in R2 can remove shared data needed by retained snapshots. Follow the [retention documentation](https://restic.readthedocs.io/en/stable/060_forget.html); object cleanup for image delivery is a different use case.

## Remaining recovery checks

Scheduled operation, monitoring/notifications, retention and selected data extraction/integrity checks were performed. Startup of every application, recovery of configuration and dependencies, and retrieving separately held credentials still need end-to-end validation. Recovery time and acceptable data loss also require measurement. This case does not claim complete disaster recovery or proven cost savings.

<figure class="article-diagram" data-layout="layers" data-tone="amber" data-count="3" aria-labelledby="diagram-restic-r2-backup-verification">
  <figcaption>
    <strong id="diagram-restic-r2-backup-verification">Check evidence in stages from snapshot freshness to full recovery</strong>
    <span>Retrieving data does not prove that applications or credentials can be recovered.</span>
  </figcaption>
  <ol class="article-diagram__nodes">
    <li>
      <span class="article-diagram__symbol">
        <span aria-hidden="true">1</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M4 7h16v13H4z M3 7l2-4h14l2 4 M8 11h8 M12 11v5"/></svg>
      </span>
      <strong>Successful snapshot and freshness</strong>
      <span>Check the timestamp of an actually successful snapshot and its delay from schedule. A job starting alone is not success.</span>
    </li>
    <li>
      <span class="article-diagram__symbol">
        <span aria-hidden="true">2</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M5 6h14v13H5z M8 10h8 M8 14l2 2 4-4"/></svg>
      </span>
      <strong>Integrity and isolated restore</strong>
      <span>Record the check scope, run restore --verify in a separate location, and compare target files and hashes before reviewing retention and prune.</span>
    </li>
    <li>
      <span class="article-diagram__symbol">
        <span aria-hidden="true">3</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M5 8h14v12H5z M8 8V5h8v3 M9 14h.01 M12 14h.01 M15 14h.01"/></svg>
      </span>
      <strong>Full disaster recovery</strong>
      <span>Application startup, dependent data, and recovery of separately stored credentials remain unverified. Recovery time and acceptable data loss are unmeasured.</span>
    </li>
  </ol>
</figure>

## October 6, 2026 update: stale locks and exclusive restore checks

Further changes use ordinary `restic unlock` after obtaining exclusive operation access on the same host, handling stale locks only. They do not use `--remove-all` to remove active locks. A bounded `--retry-lock` handles contention, and restore checks and prune do not restart indefinitely on failure. Host-local exclusivity alone does not prove absence of competing hosts.

Restore with `restore --verify` into an isolated temporary directory, check required target files and consistency, then record the verified snapshot and configuration together. Verify restoration before reviewing retained snapshots and pruning. Judge backup freshness from a successfully created snapshot, not job startup or retries.

Target-data extraction remains distinct from full recovery including application startup and credentials. See [monitoring and investigation](/insights/openclaw-monitoring-investigation/) for maintenance windows and acquisition failures.
