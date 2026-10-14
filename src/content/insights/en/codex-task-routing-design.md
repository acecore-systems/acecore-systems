---
title: "Codex Task Delegation: Handoffs, Permissions and Result Review"
description: "Codex Task Routing 0.14.0: parent judgment, continuous task ownership, scoped handoffs, local authentication, and the conditions and acceptance boundaries of the Sol-to-Pro route."
date: "2026-09-26T18:30:00+09:00"
author: gui
image: /images/insights/covers/codex-task-routing-design-cover-v1.webp
tags: ["Technology", "AI", "Development"]
callout:
  type: note
  title: "What was verified"
  text: "Public code, automated checks and isolated installation were examined. One actual request from a direct Sol child to Temporary Chat Pro, response collection and semantic acceptance were verified through a Windows Browser plugin. This does not establish all hosts, backend identity, real authentication or measured quality and usage gains."
lastUpdated: "2026-10-15T00:00:00+09:00"
---

Trial Codex delegation with research or reviews that can be accepted independently, clarifying what the parent must integrate. Include files, references, returned evidence and unknowns in the handoff; use the least-privilege approach in [OWASP: Excessive Agency](https://genai.owasp.org/llmrisk/llm062025-excessive-agency/) for tools. Delegation alone does not demonstrate quality or cost improvement.

When several jobs run through Codex, choosing a model is only part of the decision. We also need to decide which step can stand alone, what context travels with it, and how its result will be checked. Acecore published [Codex Task Routing](https://github.com/acecore-systems/codex-task-routing) to make those decisions explicit.

![Four stages of verification: policy version, handoff criteria, run evidence, and measured outcome](/images/insights/codex-task-routing-evidence.webp)

## The parent makes decisions; the owner continues the complete unit

Version 0.14.0 preserves the parent model and reasoning settings chosen by the user. The parent handles goals, priorities, owner selection, important changes and exceptions. A capable owner takes a substantial unit requiring repeated code, log and test inspection; short work can stay with its current owner.

A Sol owner of a bounded fix continues investigation, implementation, tests, authorized PR creation, agreed review fixes and necessary revalidation. Routine failures or added instructions do not trigger a new handoff. Retain the latest revision, diff, remaining work and resume conditions; return design changes, new permissions and important unresolved issues to the parent.

<figure class="article-diagram" data-layout="flow" data-tone="violet" data-count="3" aria-labelledby="diagram-codex-task-routing-design">
  <figcaption>
    <strong id="diagram-codex-task-routing-design">Keep the owner through completion; return important decisions</strong>
    <span>Policy permission, current host authority and execution evidence need separate checks.</span>
  </figcaption>
  <ol class="article-diagram__nodes">
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">1</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M5 3h10l4 4v14H5z"/><path d="M15 3v5h5M8 12h8M8 16h6"/></svg></span>
      <strong>Parent judgment</strong>
      <span>Choose goals, owner, permissions and major exceptions.</span>
    </li>
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">2</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5M8 10l2 2 3-4"/></svg></span>
      <strong>Owner continues the unit</strong>
      <span>Investigation through fixes, tests, authorized PR and review corrections.</span>
    </li>
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">3</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/></svg></span>
      <strong>Parent accepts important changes</strong>
      <span>Check evidence and remaining conditions before the next permitted stage.</span>
    </li>
  </ol>
</figure>

## Include scope, endpoint and permissions in the handoff

Pass primary materials, files, completion criteria, evidence and return conditions concisely. Do not delegate merely to another instance of the same model. Parallel delegation needs useful independent work by the delegator. Standard grandchildren are limited to Astra children delegating to Sol/Luna and Sol children to Luna; Luna and grandchildren cannot delegate further.

Check permissions for PR creation, merge, deployment and messages separately. PR comments or quoted requests from another task are not new human authorization. The current host’s higher-level restrictions still apply.

## Hand private authentication to the local process

Before selecting a cloud model for credential entry, storage or transfer, the parent checks local authentication status and registered handoffs. Pass only a registered preset; keep credentials, OAuth JSON, cookies and private authentication screens out of the cloud. Children return authentication requirements to the parent.

Separate tool availability, human approval, implemented stages and completed authentication. Queued requests and local unlock waits are not completion. Public documentation and implementations without secrets can use ordinary owners. Hooks do not start workers or models.

## A direct Sol child may own one conditional Pro request

With ordinary Chat explicitly enabled, only root or a direct Sol child whose assigned role and depth are verified may own the browser route. First check approved materials, transport permission, actual tools and verification environment. Verify Pro in the UI before and after one real request in a Temporary Chat. This is separate from Work and model API calls.

One owner retains preparation, sending, collection, semantic acceptance and authorized fixes, along with the same tab, request ID, input hash and sent state. Returning collection to the parent never triggers a resend. Actor declarations, SubagentStart and configured model names do not prove role, authority or backend execution; unclear permission or capability blocks sending.

## Evaluate automated checks, real transport and improvement separately

The [0.14.0 policy change](https://github.com/acecore-systems/codex-task-routing/pull/20) checked 198 tests and isolated installation. The [real transport record](https://github.com/acecore-systems/codex-task-routing/pull/22) confirms a direct Sol child sending once with no resend through a Windows Browser plugin, collecting the same answer, checking ID/hash and accepting its meaning. This is evidence for that limited browser environment.

Pro backend identity, all hosts, IAB round trips, actual new standard grandchildren, private authentication, and quality or usage gains remain unproven. Do not turn missing measurements into zero; include preparation, waiting, acceptance and rework. See the [public README](https://github.com/acecore-systems/codex-task-routing#readme) for installation. Checked on 14 October 2026.
