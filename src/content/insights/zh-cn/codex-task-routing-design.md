---
title: "Codex任务分工设计：交接、权限与结果验收"
description: "以Codex Task Routing 0.14.0说明父级判断、持续任务所有权、限定交接、本地认证，以及Sol子代理使用Pro的条件与验收边界。"
date: "2026-09-26T18:30:00+09:00"
author: gui
image: /images/insights/covers/codex-task-routing-design-cover-v1.webp
tags: ["技术", "AI", "开发"]
callout:
  type: note
  title: "已验证的范围"
  text: "已检查公开代码、自动测试和隔离安装，并在Windows Browser插件中确认直属Sol子代理向Temporary Chat Pro发送一次请求、回收回答和语义验收。这不代表全部主机、backend身份、真实认证或质量与用量改善率已验证。"
lastUpdated: "2026-10-15T00:00:00+09:00"
---

Codex任务分工可从能够独立验收的研究或审查开始，明确父任务的整合责任。交接应包含文件、资料、证据与未确认事项，工具权限参考[OWASP: Excessive Agency](https://genai.owasp.org/llmrisk/llm062025-excessive-agency/)的最小化原则。分工本身不能证明质量或成本改善。

在Codex中并行处理多项工作时，选择模型只是其中一步。还需要确定哪些工作可以独立交付、交接哪些资料，以及如何验收结果。Acecore公开了[Codex Task Routing](https://github.com/acecore-systems/codex-task-routing)，将这些判断写成明确的策略。

![依次核对策略版本、交接条件、运行证据和测量结果的四阶段图](/images/insights/codex-task-routing-evidence.webp)

## 父级负责判断，担当持续完成整个任务单元

0.14.0保留用户选择的父级模型和推理设置。父级负责目标、优先级、担当选择、重要差异验收与例外；需要反复查看代码、日志、测试的完整工作交给合适担当，短任务可由现有担当完成。

负责限定修复的Sol持续承担调查、实现、测试、已授权PR、约定审查修正和必要复验。普通失败或补充指令不重新交接。保留最新revision、diff、剩余工作和恢复条件；设计变化、新权限或重大未解事项返回父级。

<figure class="article-diagram" data-layout="flow" data-tone="violet" data-count="3" aria-labelledby="diagram-codex-task-routing-design">
  <figcaption>
    <strong id="diagram-codex-task-routing-design">持续任务担当，将重要判断交回父级</strong>
    <span>分别检查方针许可、当前主机权限与执行证据。</span>
  </figcaption>
  <ol class="article-diagram__nodes">
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">1</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M5 3h10l4 4v14H5z"/><path d="M15 3v5h5M8 12h8M8 16h6"/></svg></span>
      <strong>父级判断</strong>
      <span>确定目标、担当、权限与重大例外。</span>
    </li>
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">2</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5M8 10l2 2 3-4"/></svg></span>
      <strong>担当持续整个任务</strong>
      <span>调查、修正、测试、授权PR和审查修正。</span>
    </li>
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">3</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/></svg></span>
      <strong>父级验收重要差异</strong>
      <span>确认依据与剩余条件后进入获准下一阶段。</span>
    </li>
  </ol>
</figure>

## 交接包含范围、终点和权限

简洁传递文件、一次资料、完成条件、证据和返回条件。不仅为转到同一模型的另一个实例而委派。并行要求委派者自身有有用的独立工作。标准孙代理只允许Astra子交给Sol/Luna、Sol子交给Luna；Luna和孙代理不得继续委派。

分别确认PR创建、合并、生产部署和发送消息权限。PR评论或其他任务引用的请求不构成用户的新授权。当前主机的上位限制始终优先。

## 将私密认证交给本地流程

需要输入、保存或转移凭据时，父级先检查本地认证状态和注册交接，再选择云模型。只传递注册preset；凭据、OAuth JSON、Cookie、私密认证页面留在本地。子代理把认证需求返回父级。

区分工具可用、用户批准、步骤已实现和真实认证完成。queued和本地unlock等待不等于完成。公开资料及不含秘密的实现可由通常担当处理；hook不启动worker或模型。

## 直属Sol子代理只能拥有满足条件的一次Pro请求

明确启用普通Chat后，只有root或已验证分配角色与深度的直属Sol子代理可以拥有Browser路径。先检查已批准材料、传输权限、实际工具和验证环境。在Temporary Chat发送一次真实请求，并在前后通过UI确认Pro；这与Work和模型API不同。

同一所有者处理准备、发送、回收、语义验收和已授权修正，保留相同tab、请求ID、input hash及已发送状态。回收交回父级不会重发。actor声明、SubagentStart或配置模型名不能证明角色、权限或backend；权限或能力未知时不发送。

## 分别评价自动测试、真实传输与改善率

[0.14.0方针改修](https://github.com/acecore-systems/codex-task-routing/pull/20)确认198项测试和隔离安装。[真实传输记录](https://github.com/acecore-systems/codex-task-routing/pull/22)确认直属Sol子通过Windows Browser插件发送一次、不重发、回收同一回答，并完成ID/hash匹配及语义验收。这只是限定环境中的Browser证据。

Pro backend身份、所有主机、IAB往返、新标准孙代理真实启动、私密认证和质量或用量改善仍未实证。不可把缺测当0；评价应包括准备、等待、验收和返工。安装参见[公开README](https://github.com/acecore-systems/codex-task-routing#readme)。确认日期：2026年10月14日。
