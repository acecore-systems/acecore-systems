---
title: "将个人资料导入草稿：比较、选择与审慎发布"
description: "介绍从文本、CSV、静态 HTML 和通用 JSON 导入个人资料的实现，以及如何比较现有值、选择并替换字段或撤销更改，并将保存与发布分开处理。"
date: "2026-10-06T01:10:00+09:00"
lastUpdated: "2026-10-06T08:52:00+09:00"
author: gui
image: /images/insights/covers/profile-import-draft-boundaries-cover-v1.webp
tags: ["Web", "Import", "Security"]
callout:
  type: note
  title: "实现已确认，真实账户验收仍待完成"
  text: "文本、CSV、静态 HTML 和通用 JSON 导入已确认完成实现、集成与生产部署。真实账户中从导入到保存和发布的验收尚未完成。自动获取特定服务 URL 以及迁移图片或音频不属于本次已完成范围。"
---

将已有个人资料迁移到另一个编辑器时，应先比较当前值与导入候选，再决定是否替换。本文以匿名化实现为例，说明资料导入与发布之间的边界。

## 先明确支持的输入格式

在原有的文本、CSV 和静态 HTML 导入之外，此流程现在还支持读取通用 JSON 文件并下载对应模板。解析粘贴内容或文件，与访问 URL 获取其内容是两件不同的事。特定服务的专用导出格式、自动获取 URL、图片和音频迁移、动态页面以及外部服务 API 均未完成。

将 HTML 仅作为输入数据处理，不要在公开页面执行其中的脚本或直接渲染导入的 HTML。限制文本长度、字段、链接和输入格式，再将来源内容转换为个人资料所需的文本候选。

## 在替换现有值之前先审阅候选内容

不要立即发布解析结果；先与当前值进行比较。资料所有者逐项选择字段，也可以先编辑候选值，再将其应用到编辑器。应用所选字段会替换当前值，因此每次重新导入都应查看差异。更改也可以撤销。这些控制并不保证会自动解决其他页面或其他人所做编辑产生的冲突。

## 区分通用 JSON 与特定服务支持情况

界面会显示 7 个活动服务的支持情况。能够读取通用格式的数据，不代表可以直接从每个服务的 URL 获取个人资料。对于不支持的 URL，界面会引导用户改用粘贴内容导入。列出这 7 个服务的状态，并不意味着已经为每个服务实现专用导出或 API 集成。

使用合成数据检查了 JSON 导入、与现有值比较、应用所选字段、撤销以及移动端布局。真实账户中从导入到保存和发布的验收仍需单独进行。

## 不根据导入文本推断资质或权利

简介或外部页面中的措辞本身不能证明资质、所属关系、类别或许可。将可作为候选导入的说明文字，与需要身份核验或申请的信息分开。外部信息发生变化时，也不会自动更新或发布所有者确认过的个人资料。

## 将保存与发布保留为不同的决定

应用导入候选、保存草稿和更新公开快照是不同操作。验收测试还需覆盖保存冲突；保存成功不代表资料已经发布。公开关联链接（包括公开日历 URL）之前，应由本人检查其公开值，并避免把私人备注混入公开数据。

## 相关更新：从公开日程打开 HTTPS 链接

另一项与个人资料导入独立的编辑更新，为公开日历日程增加 HTTPS 链接。点击日程会在新标签页直接打开目标；没有 URL 的日程仍会显示，但不会生成可操作的链接。验证 URL 格式、拒绝嵌入的凭据并限制输入长度。添加 **noopener noreferrer**，并在可访问名称中说明会打开新标签页。

相关表单还移除了协作可用时段中不必要的标题字段，以及私人备注字段。已确认数据库修改、CI、生产部署和使用验证数据的页面显示；本人登录后保存真实日程并发布的验收仍未完成。

<figure class="article-diagram" data-layout="boundary" data-tone="violet" data-count="2" aria-labelledby="diagram-profile-import-draft-boundaries">
  <figcaption>
    <strong id="diagram-profile-import-draft-boundaries">导入与日程链接的边界</strong>
    <span>这是两项独立的编辑功能。尚未确认登录用户完成保存和发布的验收。</span>
  </figcaption>
  <ol class="article-diagram__nodes">
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">1</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M6 3h8l4 4v14H6z"/><path d="M14 3v5h5M9 12h6M9 16h4"/></svg></span>
      <strong>个人资料导入</strong>
      <span>由本人检查并编辑支持格式的内容；保存与发布是不同操作。</span>
    </li>
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">2</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18M14 15h5m-2-2 2 2-2 2"/></svg></span>
      <strong>公开日程链接</strong>
      <span>HTTPS 链接在安全的新标签页打开；没有链接的日程不可操作。</span>
    </li>
  </ol>
</figure>

## 已确认的内容与下一步验收

已确认文本、CSV、静态 HTML 和通用 JSON 导入的实现、集成与生产部署。不过，真实用户从导入、编辑、保存到检查发布结果的端到端测试尚未完成。根据活动服务 URL 自动生成完整个人资料这一更大的构想也尚未完成。

关于公开 CSS 的边界，请参阅[安全处理用户 CSS 与版本固定的公开主题](/insights/user-css-versioned-theme-safety/)。关于登录边界，请参阅[跨服务的会话生命周期](/insights/multi-service-session-lifecycle/)。
