---
title: "Designing task delegation in Codex: the public Task Routing plugin"
description: "A look at Codex Task Routing's design choices: preserving the parent's settings, versioning effective policy, handing off bounded work, and verifying what actually ran."
date: "2026-09-26T18:30:00+09:00"
author: gui
image: /images/insights/codex-task-routing-design.webp
tags: ["Technology", "AI", "Development"]
callout:
  type: note
  title: "What was verified"
  text: "We checked the public code, merged PRs, CI on three operating systems, and installation in an isolated environment. This article does not claim measured improvements in quality or usage, or a verified child-model run on a real account."
---

When several jobs run through Codex, choosing a model is only part of the decision. We also need to decide which step can stand alone, what context travels with it, and how its result will be checked. Acecore published [Codex Task Routing](https://github.com/acecore-systems/codex-task-routing) to make those decisions explicit.

![Four stages of verification: policy version, handoff criteria, run evidence, and measured outcome](/images/insights/codex-task-routing-evidence.webp)

## Keep routine work with the parent

The parent handles ordinary research, implementation, and verification. A specialist receives a bounded step only when the handoff adds concrete value. The plugin preserves the model and reasoning settings selected for the parent. It avoids transferring work just to reach another instance of the same model, or starting parallel work when the parent has no independent step.

A handoff needs more than “write an article.” It should identify primary materials, scope, available tools, acceptance criteria, and when to return an unresolved issue. The parent checks important changes and evidence, not just the conclusion.

## Distinguish policy from observed execution

At task start, the plugin presents the effective policy and its hash. Overrides do not silently rewrite the parent's settings. The hook itself makes no model call or network request.

A model name in configuration does not prove that the model actually ran. Connections, execution, and results need separate checks; unavailable usage measurements remain marked as missing. The route to ordinary Chat is optional and stops when availability or permission is unclear.

## What the checks establish

The [policy update PR](https://github.com/acecore-systems/codex-task-routing/pull/13) reports 134 unit tests, CI on Windows, Ubuntu, and macOS, and installation, hooks, reinstall, and removal in an isolated Codex home. An [earlier PR](https://github.com/acecore-systems/codex-task-routing/pull/12) improved Windows diagnostics and package checks.

Those checks cover the package and configuration path. They do not establish child-model execution on a real account, a measured quality or usage benefit, or ordinary Chat behavior on every host. See the [public README](https://github.com/acecore-systems/codex-task-routing#readme) for installation requirements and instructions.
