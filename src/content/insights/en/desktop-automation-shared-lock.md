---
title: "Safely Separating Automated Authentication Screen Operations: Preventing Simultaneous Input on a Shared Desktop"
description: "How to design the scope of mutual exclusion, stop on contention, and recheck the target immediately before submission when multiple automations use the same screen."
date: "2026-11-17T12:00:00+09:00"
author: gui
image: /images/insights/covers/multi-service-session-lifecycle-cover-v1.webp
tags: ["Authentication", "Automation", "Operations"]
---

When multiple automations operate the same desktop at the same time, one may enter data into a screen opened by another. When working with authentication screens, it is important to limit screen operations to one at a time and verify the target immediately before submission. This article explains the approach using synthetic tests that do not involve secrets or real endpoints.

<figure class="article-diagram" data-layout="flow" data-tone="blue" data-count="3" aria-labelledby="diagram-desktop-lock">
  <figcaption><strong id="diagram-desktop-lock">Preventing screen operation conflicts</strong><span>Limit use of the shared screen to one operation at a time.</span></figcaption>
  <ol class="article-diagram__nodes">
    <li><strong>Acquire exclusive access</strong><span>Do not proceed to the screen if another process is using it.</span></li>
    <li><strong>Recheck the target</strong><span>Verify the screen and endpoint before submission.</span></li>
    <li><strong>Release and check the result</strong><span>Check the result separately after operating the screen.</span></li>
  </ol>
</figure>

## Treat the shared desktop as a shared resource

Even if each automation has its own lock, those locks cannot prevent conflicts if the automations actually enter data into the same screen. Processes that use the same desktop must participate in a shared mutual exclusion mechanism, and any process that cannot acquire it must stop before clicking or entering data. As an example of a mechanism for controlling concurrent access to shared resources, see the [Windows mutex documentation](https://learn.microsoft.com/en-us/windows/win32/sync/using-mutex-objects).

Maintain exclusive access during input and screen transitions, and recheck the current screen and endpoint before submission. Decide whether the screen must remain occupied during long-running external processes by examining when the screen is actually in use. The design should also address releasing the lock on exceptions, the screen state after an interruption, and how to handle submissions with an unknown outcome.

## What we verified with synthetic screens

For an internally registered authentication path, we included screen transitions and the pre-submission recheck and operation within the scope of shared mutual exclusion. Using fixed synthetic screens, we tested successful submission, stopping due to contention, transition to multi-factor authentication, and an exception during a click. These tests do not demonstrate behavior with real credentials or across all sites.

If it is unclear whether a submission has already occurred, check the state on the receiving side instead of repeatedly resubmitting. A lock reduces the risk of incorrect input; it does not replace identity verification, authorization, or verification of input and submission results.

## What to try first

Prepare a fictional form and start two processes at the same time. Verify that only one operates the screen, that the other stops before entering data, and that the next process can resume even after an exception occurs. Add a case where the screen changes partway through, and ensure that no submission occurs if the recheck fails. Verified on: 2026-11-17.
