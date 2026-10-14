---
title: "Monitoring restic backups on R2: from successful storage to verified restoration"
description: "Separate snapshot freshness, integrity and restoration with R2 and restic. Covers PostgreSQL version selection after OS upgrades, Samba isolated runtime and DB/LDAP checks, and remaining disaster-recovery conditions."
date: "2026-09-30T20:53:00+09:00"
lastUpdated: "2026-10-15T00:00:00+09:00"
author: gui
image: /images/insights/covers/restic-r2-backup-verification-cover-v1.webp
tags: ["Cloudflare R2", "restic", "Backup"]
callout:
  type: note
  title: "Full recovery requires separate verification"
  text: "Scheduled backups, monitoring, retention and extraction/integrity checks of selected data were performed. Startup of every application and disaster recovery including separately managed credentials were not demonstrated."
---

A completed backup job does not establish that the required data can be recovered. This generalized internal case evaluates storage, integrity, restoration and service recovery separately. It does not describe a completed migration from another backup service.

## Fix the snapshot ID and one recovery goal

Record the snapshot ID and restore needed files to an empty isolated destination. For settings, check references and permissions; for a database, test loading it in isolation. Record elapsed time. Repeat the same checks periodically to compare freshness and usable recovery scope.

[restic：Restoring to an isolated destination](https://restic.readthedocs.io/en/stable/050_restore.html)

## Define the source and success

The design uses restic encryption and deduplication with R2’s S3-compatible API. Check required operations against the [compatibility table](https://developers.cloudflare.com/r2/api/s3/api/). For live databases, design consistent capture using dumps or application quiescence where appropriate.

## Monitor freshness separately

Track the latest successful snapshot, overdue runs, failures, and integrity/restore results independently. Starting a job is not success. Also distinguish a failed notification from a failed backup.

## Check integrity and extraction

Default `restic check` and checks that read stored data have different scopes. `--read-data` reads all data; record the scope of any partial check. Combine the [repository checks](https://restic.readthedocs.io/en/stable/045_working_with_repos.html) with [restoration](https://restic.readthedocs.io/en/stable/050_restore.html) into an isolated location and comparisons of contents or hashes. Extracting files does not verify application startup.

## Retain data through restic

Choose snapshots with restic’s retention policy, then use `forget`, `prune` and `check`, inspecting what will remain before executing. Blanket age-based deletion in R2 can remove shared data needed by retained snapshots. Follow the [retention documentation](https://restic.readthedocs.io/en/stable/060_forget.html); object cleanup for image delivery is a different use case.

## Check the PostgreSQL used by restore tests after an OS upgrade

After an OS upgrade, a restore test failed because it referenced a fixed path for an older PostgreSQL major. The change selects the numerically newest installed major with a complete set of executable server tools, then uses that same version for initialization, startup, restore, checks and shutdown. If no complete set exists, fail rather than connect to a running database and call that success.

Check dump format and destination compatibility against the [PostgreSQL SQL dump and restore documentation](https://www.postgresql.org/docs/current/backup-dump.html). Automatic version selection does not guarantee every dump is compatible. This selection change was checked through automated tests and CI; restoring the real R2 database backup remains a separate acceptance item.

## Recreate runtime inside the isolated Samba environment

Reading the restored Samba database was insufficient: the isolated DC could not start without runtime directories for internal sockets. Separate network, PID and mount namespaces, verify isolation, then create a private `/run` tmpfs and `/run/samba` only inside them. Use generated isolated configuration and restore paths without mixing test processes into production runtime or listeners.

Using the [official samba-tool domain backup restore and dbcheck commands](https://www.samba.org/samba/docs/current/man-html/samba-tool.8.html), checks covered the restored database, isolated DC startup and LDAP readiness. This Samba path was verified with an actual R2 backup. Disaster recovery including every application login, service connection and separately stored credentials remains a different test. Checked on 14 October 2026.

<figure class="article-diagram" data-layout="layers" data-tone="amber" data-count="3" aria-labelledby="diagram-restic-r2-backup-verification">
  <figcaption>
    <strong id="diagram-restic-r2-backup-verification">From snapshot to service-specific restoration and full recovery</strong>
    <span>Actual R2 verified Samba DC, DB and LDAP. Real PostgreSQL acceptance and complete recovery remain separate.</span>
  </figcaption>
  <ol class="article-diagram__nodes">
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">1</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M5 3h10l4 4v14H5z"/><path d="M15 3v5h5M8 12h8M8 16h6"/></svg></span>
      <strong>Successful snapshot and freshness</strong>
      <span>Record actual backup success and check scope.</span>
    </li>
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">2</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5M8 10l2 2 3-4"/></svg></span>
      <strong>Recreate isolation</strong>
      <span>Check DB version, network/PID/mount and runtime.</span>
    </li>
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">3</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/></svg></span>
      <strong>Test service startup</strong>
      <span>Verify Samba DB and LDAP; all-app recovery remains unproven.</span>
    </li>
  </ol>
</figure>

## Remaining recovery checks

Scheduled operation, monitoring/notifications, retention and selected data extraction/integrity checks were performed. Startup of every application, recovery of configuration and dependencies, and retrieving separately held credentials still need end-to-end validation. Recovery time and acceptable data loss also require measurement. This case does not claim complete disaster recovery or proven cost savings.

## October 6, 2026 update: stale locks and exclusive restore checks

Further changes use ordinary `restic unlock` after obtaining exclusive operation access on the same host, handling stale locks only. They do not use `--remove-all` to remove active locks. A bounded `--retry-lock` handles contention, and restore checks and prune do not restart indefinitely on failure. Host-local exclusivity alone does not prove absence of competing hosts.

Restore with `restore --verify` into an isolated temporary directory, check required target files and consistency, then record the verified snapshot and configuration together. Verify restoration before reviewing retained snapshots and pruning. Judge backup freshness from a successfully created snapshot, not job startup or retries.

Target-data extraction remains distinct from full recovery including application startup and credentials. See [monitoring and investigation](/insights/openclaw-monitoring-investigation/) for maintenance windows and acquisition failures.
