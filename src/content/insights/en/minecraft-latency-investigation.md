---
title: "Investigating Minecraft Lag: Quiet Metrics and Shared-Storage Diagnosis"
description: "From quiet TPS/MSPT collection to correlating JFR and OS I/O observations. This article separates a completed cause investigation from performance improvements that have not been tested."
date: "2026-10-06T01:10:00+09:00"
lastUpdated: "2026-10-06T08:52:00+09:00"
author: gui
image: /images/insights/covers/minecraft-latency-investigation-cover-v1.webp
tags: ["Minecraft", "Monitoring", "Performance"]
callout:
  type: note
  title: "Separate cause investigation from improvement results"
  text: "Always-on monitoring and the investigation of save waits are complete. Moving to different storage and comparing performance have not been done; the investigation does not prove a component failure or eliminate lag for every player."
---

Minecraft lag can come from different sources: server tick processing, brief save stalls, networking, or client rendering. This anonymized investigation covers several Paper servers without revealing internal hostnames or configuration.

## Measure averages and brief pauses separately

Record TPS, average, maximum and p95 MSPT, and the cumulative number of slow ticks. A good average can hide brief stalls. Host-wide CPU usage alone cannot distinguish single-threaded work from I/O wait.

## Collect quietly, and record missing data

In this case, a small plugin wrote measurements from Paper’s public API to local JSON, and a collector aggregated them into monitoring time series. File I/O ran outside the game’s main thread; replacing a temporary file avoided readers seeing a partial update. This did not suppress ordinary console logs.

Check timestamps and whether collection succeeded. Do not treat an old value from a stopped collector as healthy, or replace missing data with zero TPS.

## Correlate bounded JVM, OS, and save observations

While the issue was reproducible, JFR, OS wait observations, and block I/O were collected in separate, bounded windows. Those observations were compared with continuous MSPT data and periodic I/O pressure to distinguish GC activity from waits during synchronous saves. The captures were not all taken at the same time. For a general Paper starting point, see the [official spark profiling guide](https://docs.papermc.io/paper/profiling/). Here, JFR and OS observations were added to investigate waits during saves.

Across a normal 240-second window and a stalled 220-second window, per-second write-await medians were 1.60 ms and 43.71 ms; the maxima were 6.00 ms and 123.57 ms. These are two observation windows, not before-and-after results or a general benchmark.

Along with synchronous saves and filesystem journal waits, delays also appeared in device requests from multiple applications, narrowing the candidate to the shared-storage path. A completion event in a [Linux block tracepoint](https://www.kernel.org/doc/html/latest/core-api/tracepoint.html) may represent only part of a request, so unmatched requests were not mixed into a statistic for all I/O. Capture duration and volume were bounded, and measurement overhead was considered.

<figure class="article-diagram" data-layout="compare" data-tone="green" data-count="2" aria-labelledby="diagram-minecraft-latency-investigation">
  <figcaption>
    <strong id="diagram-minecraft-latency-investigation">Separate observations from hypotheses</strong>
    <span>Continuous metrics and bounded samples use different observation windows. Storage-migration effects remain untested.</span>
  </figcaption>
  <ol class="article-diagram__nodes">
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">1</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M4 19V5M4 19h16"/><path d="m7 15 4-5 3 2 5-7"/></svg></span>
      <strong>Quiet continuous metrics</strong>
      <span>Record TPS/MSPT and missing data without adding routine console output.</span>
    </li>
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">2</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="12" cy="12" r="4"/><path d="M6 8h.01M18 16h.01"/></svg></span>
      <strong>Bounded investigation</strong>
      <span>Collect JFR, OS, and block I/O separately and correlate them. Shared storage is a candidate cause, not a confirmed fault.</span>
    </li>
  </ol>
</figure>

## Treat the next step as a separate test

After the investigation, bounded tracing ended and always-on collection was confirmed healthy. A comparison over several cycles under similar use after moving storage has not been run. This record prepares a follow-up with backup, restore, and rollback plans; it does not reduce save durability or assign blame to GC or a particular plugin without evidence.

For the distinction between monitoring signals and diagnosis, see [OpenClaw monitoring and incident investigation](/insights/openclaw-monitoring-investigation/). For recovery testing, see [R2 and restic backup monitoring](/insights/restic-r2-backup-verification/).
