---
title: "Checking Whether AI Contradicts the Record: A Canon Review That Separates Omissions from Different Events"
description: "How can omissions, contradictions, and different scenes be distinguished when checking generated text against a record? We examine the evaluation and limitations of Alpha-kun's fixed 31-case set."
date: "2026-11-17T12:00:00+09:00"
author: gui
image: /images/insights/covers/ai-reply-capability-guardrails-cover-v1.webp
tags: ["AI", "Verification", "Operations"]
---

When AI generates text based on an existing story or business record, treating everything not mentioned in the record as a contradiction risks rejecting new expressions as well. Conversely, we do not want to overlook text that overturns what is explicitly stated about the same event. Using the review of proposed additions to Alpha-kun's canon as an example, we examine the basis for decisions and the scope of the evaluation.

<figure class="article-diagram" data-layout="flow" data-tone="violet" data-count="3" aria-labelledby="diagram-lore">
  <figcaption><strong id="diagram-lore">Check a candidate against the record</strong><span>Confirm the same subject, event, and time before deciding.</span></figcaption>
  <ol class="article-diagram__nodes">
    <li><strong>Check the record</strong><span>Find the original text and subjects relevant to the candidate.</span></li>
    <li><strong>Compare the scenes</strong><span>Look for evidence that they refer to the same event and time.</span></li>
    <li><strong>Distinguish the reasons</strong><span>Separate explicit contradictions, overreach, and omissions.</span></li>
  </ol>
</figure>

## An omission is not a contradiction

For example, if a record only says, “I saw white clouds on a walk,” it does not specify the color of any flowers seen on that walk. The mere absence of that information does not establish that no flowers were seen. On the other hand, if the record explicitly says “it did not rain” on the same walk, it contradicts a candidate that says “it rained then.” This is a hypothetical example illustrating the difference in judgment.

Even with similar clues, the walk might have taken place on a different day. Check for evidence that the subject, event, and time are the same, and avoid treating a conditional statement such as “If it rains, I will go home” as a record that it actually rained. If a candidate assigns an opposite outcome to a scene whose outcome at that point is explicitly unresolved, treat it as overreach rather than a simple contradiction.

## Comparing improvements with fixed cases

In an internal review change log, we evaluated a total of 31 cases—the existing 29 fixed cases and 2 synthetic controls—using the same model configuration as in production. v13 matched the expected acceptance or rejection decisions and reasons in all 31 cases, with 0 regenerations caused by false contradictions. This result applies to the fixed set; it does not prove accuracy across all texts or the success of naturally occurring additions to the production canon.

Keep the expected results and inputs fixed when comparing the old and new versions, and add failed examples to check for regressions. When a quotation in the record cannot be linked to a claim in the candidate, it is important to flag the insufficient evidence for human review. [OpenAI's evaluation best practices](https://platform.openai.com/docs/guides/evaluation-best-practices) can also help when creating AI evaluation sets.

Start with a small number of real records that can be published and fictional controls, and have people write down the expected judgments: “same scene,” “different scene,” “not recorded,” and “explicit contradiction.” Reviewed: 2026-11-17.
