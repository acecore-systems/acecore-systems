---
title: "将公开图片的边缘缓存与 API 速率限制分开"
description: "一个在连续浏览时，内容 API 与图片请求共用同一限制额度的案例。介绍公开图片的复用、成功响应的验证、WAF 与应用的边界，以及生产环境检查。"
date: "2026-10-06T02:20:00+09:00"
author: gui
image: /images/insights/public-image-cache-and-api-rate-limits.webp
tags: ["Cloudflare", "Performance", "Web"]
callout:
  type: note
  title: "分别验证缓存与速率限制"
  text: "本案例确认了实现、CI、通过 GitHub 集成进行的生产部署，以及对代表性图片内容和缓存状态的核对。它并未测量所有数据中心的缓存命中率，也未测量高负载下的性能提升。"
---

在带图片的日记或目录中，每次切换日期或页面都会同时请求正文 API 和图片。本文介绍连续浏览时图片停止加载的案例，不公开运维 URL、内部路由或限制值。

## 正文与图片共用同一速率限制额度

在本案例中，动态 API 请求和公开图片的 GET 请求由同一条 WAF 速率限制规则计数。即使只是正常切换页面，也可能同时触发多个请求，导致正文能够加载而图片被限流。

为图片添加边缘缓存，无法帮助那些在到达缓存之前就被 WAF 拦截的请求。我们分别调整了源站负载，以及同一限制额度内计数的请求类型。原有的应用层限制和生成处理的 quota 仍按各自用途保留。

## 只复用可共享的公开图片

这里处理的图片是不可变的：相同的公开 asset ID 始终返回相同内容。我们先校验 asset ID 的格式、请求边界和 Service Binding 配置，然后才查询按相同 host 和 asset ID 建立的缓存条目。即使缓存已预热，也不会跳过这些入口检查。

不会因不影响内容的 query string 或终端用户请求头而拆分同一图片的缓存条目。这种做法仅适用于不可变的公开图片。对于会因用户或组织不同而返回不同内容的私有图片，不能原样套用。

## 只保存经过验证的 200 响应

缓存未命中时，会从私有的 Service Binding 获取图片。我们验证 HTTP status、图片的 Content-Type、Content-Length 和响应 body，并且只保存符合这些条件的 200 响应。部分响应、空 body、无效 metadata 和故障响应都不会保存。

保存图片实体与 ETag 匹配时返回 304 是两件不同的事。缓存写入通过 waitUntil 安排；缓存读取或写入失败时，不应阻止返回从源站成功取得的有效图片。如果后续请求命中缓存，就可以跳过 Service Binding 获取操作。

[Cloudflare Cache API](https://developers.cloudflare.com/workers/runtime-apis/cache/)说明了使用 ETag 的条件请求以及缓存按数据中心区分的特性。一个数据中心的 HIT 不代表所有数据中心都有 HIT。Pages Functions 的响应头不能只通过[静态文件用的 _headers](https://developers.cloudflare.com/pages/configuration/headers/)设置；应在 Function 中设置。

## 独立处理动态 API 的限制

保护动态 API 与缓存图片是不同的要求。在本案例中，公开图片的 GET 请求被排除在 WAF 统计之外；变更生效后，我们重新读取并核对目标动态 API、限制周期、action 和启用状态。旧配置也已保存，以便回滚。

阈值应根据正常浏览产生的请求数量和受保护操作的负载来选择。还需要核对[Cloudflare 速率限制](https://developers.cloudflare.com/waf/rate-limiting-rules/)按 plan 适用的条件。仓库运维记录中写有某个值，并不能证明生产规则已经启用。

## 在生产环境核对图片内容

单元测试检查了同一公开图片的复用、host 与 asset ID 的隔离、使用缓存前的边界检查、304、缓存故障以及不得保存的响应。CI 完成后，我们确认了通过 GitHub push 进行的生产 deployment 和 custom domain，并核对代表性图片的 HTTP 结果、应用显示的 HIT 或 MISS 状态，以及取回 bytes 的 hash。

在生产环境中，我们还连续获取了正文和多张图片，确认在该正常浏览的测试条件下没有触发限流。这只是对有限请求模式的检查，并非高负载下的边界测试。

仅显示缓存状态无法证明返回的是正确图片。我们分别核对正文获取、图片获取、WAF 配置和 UI 中的浏览结果。本记录确认了代表性图片的交付，不代表已经验证所有用户和数据中心的连续浏览，也不代表测得了高负载下的性能提升。

关于站点静态与动态部分的划分，请参阅[Astro 与 Cloudflare 的整体设计](/insights/astro-cloudflare-site-architecture/)。关于图片、CSS 等资源的传输优化，请参阅[Astro 性能调优](/insights/astro-performance-tuning/)。
