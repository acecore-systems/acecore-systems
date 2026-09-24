---
title: "多站点 AI 导览接入共用 Worker 与流式回答的记录"
description: "介绍公开网站的 AI 导览如何接入共用处理服务、逐步显示回答，并说明对正式网站的确认。"
date: 2026-09-25T12:00
author: gui
image: https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=400&fit=crop&q=80
tags: ["Technology", "AI", "Cloudflare", "Websites"]
---

## 区分各站入口与共用处理

Acecore 的公开网站使用 AI 导览帮助访客找到页面和咨询渠道。2026 年 8 月，Acecore 与专业网站的导览逐步接入共用的服务器端处理。各网站保留适合自身的提问示例和去向，同源 API 将请求转给共用 Worker。Aceserver 的 Alpha 导览使用另一套由门户与 Wiki 共用的服务。

## 区分生成中的文字与最终回答

界面通过 SSE 将新文字逐步加入同一条消息。生成时只显示纯文本，完成后才渲染通过验证的链接，避免把未完成的模型输出当作可信 HTML。同时保留对原有 JSON 固定回答的兼容。

## 引导至权威信息

Systems 正式网站上已确认导览及指向咨询页面的回答。界面提示不要输入个人或机密信息。价格与合同条件仍应以正式页面和工作人员确认为准。较早的 [AI 咨询设计文章](/insights/astro-ai-contact-chat/)记录了 2026 年 6 月的结构；后续变更见 [Acecore 流式回答](https://github.com/acecore-systems/acecore-net/pull/240)、[Systems 接入](https://github.com/acecore-systems/acecore-systems/pull/58)、[Aceserver 门户](https://github.com/acecore-systems/aceserver-portal/pull/111)与 [Wiki](https://github.com/acecore-systems/aceserver-wiki/pull/81)。
