---
title: "安全处理支付与退款 Webhook：Workers 中的状态核对"
description: "通过实现案例介绍如何区分签名校验、重复与延迟事件、退款状态和外部 API 响应，并说明管理操作前的权限复核。"
date: "2026-10-06T01:10:00+09:00"
lastUpdated: "2026-10-09T15:00:00+09:00"
author: gui
image: /images/insights/covers/cloudflare-payment-event-boundaries-cover-v1.webp
tags: ["Cloudflare Workers", "Stripe", "Security"]
callout:
  type: note
  title: "区分实现证据与真实交易操作"
  text: "本匿名案例已验证实现、测试、本番部署以及对外部 API 的只读核对。测试没有执行客户退款、取消或积分调整，也不声称所有支付路径均已端到端验证。"
---

验证Workers支付Webhook时，在测试环境尝试重复投递与乱序到达，确认业务状态不会重复更新。外部API重定向处理应对照[Cloudflare Workers: Request](https://developers.cloudflare.com/workers/runtime-apis/request/)和运行环境检查，并分别记录接收、外部状态确认和后续处理。

收到支付服务的事件，并不代表订单或退款已经完成。本匿名案例介绍如何在 Workers 上让运营流程将服务方状态与本地记录进行核对。文中不包含客户信息、真实交易标识符或内部通知目的地。

## 在入口处验证签名并阻止重复处理

使用未修改的原始请求正文验证签名，并检查事件属于预期的生产或测试模式。记录事件处理状态并取得处理租约，避免同一事件重投时重复执行业务操作。这不保证事件按顺序到达。另见[Stripe 官方 Webhook 指南](https://docs.stripe.com/webhooks)。

## 对延迟的退款事件读取服务方当前状态

本实现处理 `refund.created`、`refund.updated` 和 `refund.failed`。对于正在管理的退款，会重新获取 Stripe 当前对象，避免迟到的事件将本地记录回退到旧状态。判断订单是否已全额退款前，会区分已成功和仍待处理的退款金额。

还会核对金额、币种、PaymentIntent、关联订单与操作的 metadata，以及已保存的标识符。支付 ID 可能使用 `py_` 前缀，退款 ID 可能使用 `pyr_` 前缀；实现已调整为不会仅因某个已知前缀不符而拒绝有效响应。支持另一种前缀并不意味着放宽金额和身份核对。未知值不会按零计入。

## 将退款、积分和通知结果分开

请求退款前检查余额和权限；读取外部状态后、写入之前，再次检查权限和操作是否过期。使用与操作对应的幂等键和处理占用。外部结果不确定时，应重新核对当前状态，而不是无条件再次发起退款。

退款成功与积分调整成功是不同状态。后续处理失败不能触发重复退款；需要核对或修复时应留下记录。通知配置、实际接收以及工作人员跟进，是支付事件处理之外的独立验收事项。本文不声称通知当前处于运行状态。

<figure class="article-diagram" data-layout="flow" data-tone="amber" data-count="3" aria-labelledby="diagram-cloudflare-payment-event-boundaries">
  <figcaption>
    <strong id="diagram-cloudflare-payment-event-boundaries">从 Webhook 到独立结果</strong>
    <span>先核对当前状态再记录完成。本次没有执行客户退款或积分操作。</span>
  </figcaption>
  <ol class="article-diagram__nodes">
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">1</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M4 5h16v14H4z"/><path d="M8 9h8M8 12h5M8 15h3"/></svg></span>
      <strong>入口验证</strong>
      <span>检查原始 body、mode 和 event ID，识别重试及处理中状态。</span>
    </li>
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">2</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5M8 10h5"/></svg></span>
      <strong>核对当前状态</strong>
      <span>不因延迟事件回退记录；核对金额、币种和订单。</span>
    </li>
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">3</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="4" y="5" width="6" height="14" rx="1"/><rect x="14" y="5" width="6" height="14" rx="1"/><path d="M11 12h2"/></svg></span>
      <strong>分别记录结果</strong>
      <span>退款、积分和通知各自记录状态。外部结果未知时先重新核对，不要重试操作。</span>
    </li>
  </ol>
</figure>

## 同时在 Node 和 Workers 运行环境检查响应

只在 Node 中测试外部 fetch，可能会遗漏 Workers 运行环境的差异。本案例复现了 `redirect: 'error'` 的兼容性问题，随后改为 `redirect: 'manual'` 并显式检查 HTTP 状态。不要把 3xx 响应或错误页当作普通 JSON 解析，也不要携带认证信息自动跳转到其他主机。另见[Workers Request API](https://developers.cloudflare.com/workers/runtime-apis/request/)。

## 记录部署与验收边界

数据库变更、依赖处理和管理界面按顺序发布，并检查了测试、CI、本番只读画面以及与服务方 API 读取状态的一致性。没有为了测试而执行客户资金操作。CSV 导出也会将可能被解释为公式的单元格作为文本处理，并且不会把未知手续费替换为零。

管理登录边界另见[多服务会话设计](/insights/multi-service-session-lifecycle/)。
