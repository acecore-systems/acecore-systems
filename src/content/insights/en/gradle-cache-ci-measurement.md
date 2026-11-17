---
title: "Reduce duplicate GitHub Actions runs and Gradle build times separately"
description: "Review CI triggers duplicated across pushes and PRs, and compare Android Gradle caching on the same commit. We cover decision criteria and the limits of the measurements."
date: "2026-11-17T12:00:00+09:00"
author: gui
image: /images/insights/covers/astro-performance-tuning-cover-v2.webp
tags: ["GitHub Actions", "Android", "Operations"]
---

If your Android CI repeats the same work on every run, a comparison that includes cache restoration time can help you decide whether to adopt caching. Using a same-commit test of the DaysChat Android job, we explain how we checked speed and reproducibility.

<figure class="article-diagram" data-layout="flow" data-tone="blue" data-count="3" aria-labelledby="diagram-gradle">
  <figcaption><strong id="diagram-gradle">Compare caching with the same input</strong><span>Look at the entire job, including the overhead of saving and restoring the cache.</span></figcaption>
  <ol class="article-diagram__nodes">
    <li><strong>Initial run</strong><span>Create the cache and record the save time.</span></li>
    <li><strong>Rerun the same commit</strong><span>Check the restore time and reused tasks.</span></li>
    <li><strong>Verify artifacts</strong><span>Check target architectures and APK generation.</span></li>
  </ol>
</figure>

## Avoid duplicating checks on pushes and PRs

In a separate meeting minutes system, both regular CI and Rust parity were triggered by pushes to working branches and by PRs. We restricted push triggers to main, kept PR checks, and enabled manual runs for cases where checks are needed before creating a PR. We did not change the production release triggers.

An internal investigation found 97 push-triggered runs in month 11 whose corresponding PR runs also succeeded, totaling 342 minutes on Linux runners. This is the runtime of the runs examined for duplication, not the time or billing actually saved after the change. Before narrowing the triggers, check how changes without PRs will be validated and whether required checks or releases will be blocked. You can check the conditions for push and pull_request in [GitHub Actions events](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows).

## Measurements and conditions within the job

In a same-commit comparison documented in our internal change records, the Android job took 16 minutes 20 seconds on the initial run and 6 minutes 16 seconds on the rerun, including restoration. It reused 194 Gradle tasks and passed checks for x86_64 and arm64-v8a, as well as APK generation. The initial save took 34 seconds, restoration on the rerun took 62 seconds, and the test cache was approximately 1.81 GB.

| Observation     | Initial run           | Rerun                |
| --------------- | --------------------- | -------------------- |
| Android job     | 16 minutes 20 seconds | 6 minutes 16 seconds |
| Cache operation | Save: 34 seconds      | Restore: 62 seconds  |

This 1 pair of runs was measured using a PR-specific cache. In the final configuration, only main saves the shared cache, and PRs restore it in read-only mode. We did not measure whether every PR in the final configuration achieves the same reduction or whether billing decreases. Results also vary with the execution environment and cache hit rate.

## Define reuse conditions and safe cache writes

[Gradle's build cache](https://docs.gradle.org/current/userguide/build_cache.html) uses task inputs and outputs to determine whether results can be reused. Inaccurate task input declarations can cause stale outputs to be used, so first compare a clean run with the cached run, including artifacts and test results. Also check that changes to dependencies or build configuration invalidate the cache as expected.

Limit which actors can save the cache, and configure it so that untrusted changes cannot update the shared cache. [GitHub Actions dependency caching](https://docs.github.com/en/actions/concepts/workflows-and-actions/dependency-caching) has access restrictions and usage considerations. Do not use the cache to store secrets; monitor its size, save and restore times, and total job duration together.

First, limit the trial to 1 job and record artifacts and timings for the initial run and rerun of the same commit. Even if you see a reduction, separately verify that builds succeed with different changes and when the cache is missing. Checked on: 2026-11-17.
