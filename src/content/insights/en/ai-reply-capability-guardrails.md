---
title: "Preventing AI Replies from Making Promises They Cannot Keep"
description: "Prevent AI from promising actions it cannot perform. Covers conversation context, measured attendance, freshness and retrieval failure, persona-based announcements, similar-copy suppression and pre-send gates."
date: "2026-10-06T01:10:00+09:00"
lastUpdated: "2026-10-15T00:00:00+09:00"
author: gui
image: /images/insights/covers/ai-reply-capability-guardrails-cover-v1.webp
tags: ["AI", "Security", "Web"]
callout:
  type: note
  title: "A generalized case; no specific conversation is published"
  text: "This case covers policy and classification changes, pre-send checks, tests, delivery, and limited operational review. It includes no other person's posts or account, and does not prove that every phrasing of an incorrect promise can be prevented."
---

For inquiry guidance or support replies, define explaining public information, handing off to staff and making a booking as separate capabilities. [OWASP: Excessive Agency](https://genai.owasp.org/llmrisk/llm062025-excessive-agency/) helps frame permitted actions and approval. The following focuses on reply boundaries rather than platform-specific automated sending procedures.

Even a natural-sounding informational reply must not promise that a staff member will follow up or attend at a certain time without evidence that the action can be performed. This generalized account of an internal reply workflow does not identify a platform or conversation.

## Define what the assistant can explain and what it can do

Explaining public information, confirming what someone wants, and actually contacting or attending are different capabilities. State the assistant's role in its instructions and apply the same role to initial replies, follow-up replies, and pre-send checks. A setting that increases reasoning effort does not grant authority to act or reveal a staff member's schedule.

## Use conversation state, not keywords alone

Pass along the original post, the recent exchange that was actually confirmed, whether guidance has already been given, whether a question needs an answer, and whether the conversation is over. Do not classify someone as interested in attending just because a word matches when they have expressed a different preference. An incorrect promise written by an earlier AI is not evidence that anyone plans to act.

## Check the speaker and meaning before sending

“A staff member will contact you later” is a promise by the person expected to act. A quotation from the other person and a general pointer to an event are different. Instead of banning a string everywhere, check the role, conversation state, and evidence for the action. Hold an ambiguous reply and return it to a person when needed. The workflow also needs a boundary that prevents generation from continuing as if sources were checked after retrieval fails or returns an invalid response. That retrieval-side stop condition was confirmed in the revised code and PR review only; production operation of that path has not been confirmed.

## Do not confuse similar wording or different kinds of requests

Distinguish a post recruiting participants from a person's statement that they want to join. Similar wording does not make products, editions, or usage terms interchangeable; do not mix guidance for different environments. Check unsupported expressions of gratitude and replies that treat someone as already accepted before sending. Even when replies are prioritized, use bounded waits under rate limiting and prevent duplicates. Do not record a wait or a skipped reply as a successful send.

## Recheck old drafts against current conditions

A draft that passed when it was generated may become stale as the conversation or policy changes. Check it again against the latest state immediately before sending, and do not send drafts for closed conversations. Record a skipped send and a closed conversation in audit state separately from a successful send. Omitting a reply is also an option when adding an unnecessary question would only prolong the exchange.

## Use measured attendance and observation time

For attendance announcements, public voice-chat human participants and concurrent players across all monitored Minecraft servers are separate metrics. This example requires either to reach 15 people, without adding the two together. Every Minecraft source must be within 30 seconds; voice-chat data must be within 120 seconds. If only one metric is available and qualifies, describe only that metric.

Unavailable or expired data is not zero. Rearm for a new surge only after both metrics are available and below threshold. Do not repost during the same continuing surge, and allow at least 3 hours after the previous send attempt. Attendance-only polling does not call AI.

## Preserve the persona and skip nearly identical announcements

Generate each announcement using the shared persona, voice and latest 20 announcements, with a separate attendance line. The model does not supply counts or observation times; insert freshly retrieved measurements after generation. If copy is similar except for numbers, regenerate once, then skip if still similar. Generation failures, copy needing human review and a changed qualifying metric are not posted, with no fixed-template fallback.

Passing copy checks is only one condition. Recheck posting account, session, restrictions, mutual exclusion and freshness immediately before clicking. Do not automatically resend uncertain outcomes; record success only after a public result matches author, full text and time. Implementation, tests, settings and limited operational checks were completed, but a successful real post after the attendance threshold was met is outside this evidence. Checked on 14 October 2026.

<figure class="article-diagram" data-layout="branches" data-tone="violet" data-count="3" aria-labelledby="diagram-ai-reply-capability-guardrails">
  <figcaption>
    <strong id="diagram-ai-reply-capability-guardrails">Check evidence, freshness and send authority</strong>
    <span>Natural wording does not authorize posting. Missing data is not zero; recheck before sending.</span>
  </figcaption>
  <ol class="article-diagram__nodes">
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">1</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M5 3h10l4 4v14H5z"/><path d="M15 3v5h5M8 12h8M8 16h6"/></svg></span>
      <strong>Read context and measurements</strong>
      <span>Check speaker, request, attendance and observed time.</span>
    </li>
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">2</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5M8 10l2 2 3-4"/></svg></span>
      <strong>Generate and inspect within evidence</strong>
      <span>Match capability, persona, similar copy and current conditions.</span>
    </li>
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">3</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/></svg></span>
      <strong>Authorized send or hold</strong>
      <span>Check session, freshness and exclusion; do not resend uncertain outcomes.</span>
    </li>
  </ol>
</figure>

## What was checked and what remains unproven

The classification and pre-send checks were revised, regression tests were run, generated drafts were reviewed, and limited operational observation took place after delivery. This does not demonstrate safety for every conversation, paraphrase, or model change. External sending also requires operational authorization and approval in addition to content checks. The retrieval-side stop described above was reviewed in code and a PR; its operation in production remains unverified.

For the search-input boundary, see [Safely Synchronizing Public HTML with Vectorize](/en/insights/cloudflare-vectorize-safe-implementation/); for rendering, see [Safely Rendering Markdown Links in AI Chat Answers](/en/insights/ai-chat-markdown-link-safety/).
