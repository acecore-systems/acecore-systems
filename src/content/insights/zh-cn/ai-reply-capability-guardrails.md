---
title: "避免 AI 回复做出无法兑现的承诺"
description: "防止信息助手擅自承诺工作人员参与、安排时间或后续联系。介绍会话状态、检索失败、旧草稿复检和会话结束时的处理。"
date: "2026-10-06T01:10:00+09:00"
lastUpdated: "2026-10-09T15:00:00+09:00"
author: gui
image: /images/insights/covers/ai-reply-capability-guardrails-cover-v1.webp
tags: ["AI", "Security", "Web"]
callout:
  type: note
  title: "一般化案例，不公开具体会话"
  text: "本文讨论策略与分类调整、发送前检查、测试、发布及有限的运营观察。不会包含他人的帖子或账号，也不保证能够防止所有形式的错误承诺。"
---

用于咨询引导或客服回复时，应将解释公开信息、转交工作人员和实际预约定义为不同能力。允许的操作与审批设计可参考[OWASP: Excessive Agency](https://genai.owasp.org/llmrisk/llm062025-excessive-agency/)。下文仅讨论回复边界，不涉及特定平台的自动发送步骤。

即使信息助手的回复很自然，也不能在没有能力执行的证据时承诺工作人员会稍后联系，或会在某个时间参加。本文以一般化方式介绍内部回复流程，不指出具体平台或会话。

## 定义助手可以说明什么、可以执行什么

说明公开信息、确认对方的意愿、实际联系或参加属于不同能力。应在生成指令中说明助手的角色，并在初次回复、后续回复和发送前检查中保持一致。提高推理强度的设置不会赋予行动权限，也不会提供工作人员的日程。

## 使用会话状态，而非只看关键词

传递原帖、已确认的近期对话、是否已经提供过说明、是否有待回答的问题以及会话是否结束。对方表达了其他意愿时，不能仅凭关键词匹配就把对方归类为有意参加。先前 AI 写下的错误承诺也不能证明有人计划执行。

## 发送前检查说话者与语义

“工作人员稍后会联系您”是预期执行者作出的承诺；引用对方的话，以及一般性地指引活动信息，含义不同。不要只按字符串一刀切，而要核对角色、会话状态和行动依据。遇到含糊内容时先暂停发送，必要时交给人工处理。还需要设置边界：检索失败或返回无效响应后，不能假装已查阅资料并继续生成。该检索侧停止条件仅通过修订代码和 PR 审查确认；尚未确认这条路径在生产环境中运行。

## 不要混淆相似措辞或不同类型的请求

区分招募参与者的帖子与某人表示希望参加的发言。措辞相似不代表产品、版本或使用条款相同，不要混用不同环境的说明。发送前还要检查缺少依据的感谢语，以及把对方当作已获准参与的回复。即使优先处理回复，也要在限流时使用有上限的等待并防止重复；不能把等待或跳过回复记成发送成功。

## 根据最新条件重新检查旧草稿

生成时通过检查的草稿，可能会因会话或策略变化而过时。发送前应按最新状态再次检查，不要发送已结束会话的草稿。将跳过发送和会话结束分别记录在审计状态中，与发送成功区分。若提问只会无谓延长对话，也可以选择不回复。

<figure class="article-diagram" data-layout="branches" data-tone="violet" data-count="3" aria-labelledby="diagram-ai-reply-capability-guardrails">
  <figcaption>
    <strong id="diagram-ai-reply-capability-guardrails">回复前检查依据与能力</strong>
    <span>根据会话语境选择答复或暂缓。检索停止条件在生产环境的运行尚未确认。</span>
  </figcaption>
  <ol class="article-diagram__nodes">
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">1</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M5 5h14v11H9l-4 4V5Z"/><path d="M8 9h8M8 12h5"/></svg></span>
      <strong>识别说话者与请求</strong>
      <span>确认是招募还是参与意愿、对应版本以及会话状态。</span>
    </li>
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">2</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/></svg></span>
      <strong>只回答有依据的内容</strong>
      <span>只说明确实能够执行的事项，并在发送前重新检查。</span>
    </li>
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">3</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg></span>
      <strong>不明确时暂缓</strong>
      <span>检索失败或格式错误不视为已查阅，应转交人工。等待有上限，并抑制重复发送。</span>
    </li>
  </ol>
</figure>

## 已检查的范围与尚未证明的事项

该案例修改了分类和发送前检查，运行了回归测试，检查了生成的草稿，并在发布后进行了有限的运营观察。这不代表已证明所有会话、改写表达或模型变更都安全。对外发送除内容检查外，还需要运营层面的权限与批准。上文的检索停止条件只经过代码和 PR 审查；其生产运行情况仍未验证。

关于搜索输入边界，请参阅[使用 Vectorize 安全同步公开 HTML](/zh-cn/insights/cloudflare-vectorize-safe-implementation/)；关于内容呈现，请参阅[安全呈现 AI 聊天回复中的 Markdown 链接](/zh-cn/insights/ai-chat-markdown-link-safety/)。
