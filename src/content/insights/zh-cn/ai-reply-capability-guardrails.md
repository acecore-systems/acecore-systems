---
title: "避免 AI 回复做出无法兑现的承诺"
description: "防止AI擅自承诺担当者行为的回复设计，说明上下文、实测人数、新鲜度与获取失败、人格一致的公告、相似文抑制及发送前检查。"
date: "2026-10-06T01:10:00+09:00"
lastUpdated: "2026-10-15T00:00:00+09:00"
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

## 按实测人数和观测时间判断

人数公告把公开语音聊天的人类参与者与所有监控Minecraft服务器的同时在线合计作为不同指标。本例任一达到15人即可，不把两者相加。Minecraft的所有来源必须在30秒内，语音聊天必须在120秒内；仅一方可获取且达标时，只描述该指标。

获取失败或过期不等于0人。仅当两方均获取且都低于门槛，才重新准备判断下一次热度到达。同一次持续热度不重复发帖，且距离上次发送操作至少3小时。只轮询人数时不调用AI。

## 保持人格，跳过近乎相同的公告

每次根据共享人格、语气和最近20篇公告生成，将人数放在独立行。数字和观测时间不由模型填写，而是在生成后重新获取实测值插入。若仅数字不同而文案近似，只重新生成一次，仍近似则跳过。生成失败、需人工确认或前后达标指标变化时不发布，也不退回固定模板。

文案通过仍需在点击前重新确认账户、会话、限制、互斥和数据新鲜度。发送后不确定时不自动重发；只有公开结果的作者、全文、时间一致才记录成功。已完成实现、测试、配置和有限运维检查，但条件成立后的真实发帖成功不在此次实证范围。确认日期：2026年10月14日。

<figure class="article-diagram" data-layout="branches" data-tone="violet" data-count="3" aria-labelledby="diagram-ai-reply-capability-guardrails">
  <figcaption>
    <strong id="diagram-ai-reply-capability-guardrails">回复与公告都检查依据、新鲜度和发送权限</strong>
    <span>自然文案不构成发布许可；缺失不当0，发送前再次检查。</span>
  </figcaption>
  <ol class="article-diagram__nodes">
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">1</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M5 3h10l4 4v14H5z"/><path d="M15 3v5h5M8 12h8M8 16h6"/></svg></span>
      <strong>读取上下文和实测值</strong>
      <span>确认发言者、请求、人数及观测时间。</span>
    </li>
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">2</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5M8 10l2 2 3-4"/></svg></span>
      <strong>在依据内生成并检查</strong>
      <span>匹配能力、人格、相似文和最新条件。</span>
    </li>
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">3</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/></svg></span>
      <strong>获准发送或保留</strong>
      <span>检查会话、新鲜度和互斥，不确定则不重发。</span>
    </li>
  </ol>
</figure>

## 已检查的范围与尚未证明的事项

该案例修改了分类和发送前检查，运行了回归测试，检查了生成的草稿，并在发布后进行了有限的运营观察。这不代表已证明所有会话、改写表达或模型变更都安全。对外发送除内容检查外，还需要运营层面的权限与批准。上文的检索停止条件只经过代码和 PR 审查；其生产运行情况仍未验证。

关于搜索输入边界，请参阅[使用 Vectorize 安全同步公开 HTML](/zh-cn/insights/cloudflare-vectorize-safe-implementation/)；关于内容呈现，请参阅[安全呈现 AI 聊天回复中的 Markdown 链接](/zh-cn/insights/ai-chat-markdown-link-safety/)。
