---
title: "Preventing AI Replies from Making Promises They Cannot Keep"
description: "How to keep an informational assistant from promising staff participation, scheduling, or follow-up it cannot perform. Covers conversation state, retrieval failures, rechecking stale drafts, and handling closed conversations."
date: "2026-10-06T01:10:00+09:00"
lastUpdated: "2026-10-06T08:52:00+09:00"
author: gui
image: /images/insights/covers/ai-reply-capability-guardrails-cover-v1.webp
tags: ["AI", "Security", "Web"]
callout:
  type: note
  title: "A generalized case; no specific conversation is published"
  text: "This case covers policy and classification changes, pre-send checks, tests, delivery, and limited operational review. It includes no other person's posts or account, and does not prove that every phrasing of an incorrect promise can be prevented."
---

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

<figure class="article-diagram" data-layout="branches" data-tone="violet" data-count="3" aria-labelledby="diagram-ai-reply-capability-guardrails">
  <figcaption>
    <strong id="diagram-ai-reply-capability-guardrails">Check evidence and capability before replying</strong>
    <span>Use conversation context to choose an answer or hold. Production operation of the retrieval stop is unconfirmed.</span>
  </figcaption>
  <ol class="article-diagram__nodes">
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">1</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M5 5h14v11H9l-4 4V5Z"/><path d="M8 9h8M8 12h5"/></svg></span>
      <strong>Read speaker and request</strong>
      <span>Check whether the message is an invitation or interest, the relevant edition, and the conversation state.</span>
    </li>
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">2</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/></svg></span>
      <strong>Answer within the evidence</strong>
      <span>State only what can be done, then recheck immediately before sending.</span>
    </li>
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">3</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg></span>
      <strong>Hold if unclear</strong>
      <span>Do not treat failed or malformed retrieval as consulted; return to a person. Use finite waits and suppress duplicates.</span>
    </li>
  </ol>
</figure>

## What was checked and what remains unproven

The classification and pre-send checks were revised, regression tests were run, generated drafts were reviewed, and limited operational observation took place after delivery. This does not demonstrate safety for every conversation, paraphrase, or model change. External sending also requires operational authorization and approval in addition to content checks. The retrieval-side stop described above was reviewed in code and a PR; its operation in production remains unverified.

For the search-input boundary, see [Safely Synchronizing Public HTML with Vectorize](/en/insights/cloudflare-vectorize-safe-implementation/); for rendering, see [Safely Rendering Markdown Links in AI Chat Answers](/en/insights/ai-chat-markdown-link-safety/).
