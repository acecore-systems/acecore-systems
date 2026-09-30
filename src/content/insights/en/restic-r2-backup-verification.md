---
title: "Monitoring restic backups on R2: from successful storage to verified restoration"
description: "Track snapshot freshness, repository integrity and restoration separately, and identify the application recovery steps that remain untested."
date: "2026-09-30T20:53:00+09:00"
author: gui
image: /images/insights/restic-r2-backup-verification.webp
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
