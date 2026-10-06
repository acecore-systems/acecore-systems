---
title: "Cloudflare Pages 静态资源与 Functions 的安全响应头"
description: "区分 Cloudflare Pages 静态响应与 Functions 响应，并检查 _headers、CSP 和当前网站配置。"
date: 2026-03-15T00:00
author: gui
tags: ["技术", "Cloudflare", "安全"]
image: "/images/insights/covers/cloudflare-pages-security-cover-v2.webp"
lastUpdated: "2026-10-06T13:58:01+09:00"
---

本文最初记录了2026年3月将联系表单交给外部服务、使网站回到 Cloudflare Pages 静态发布的过程。此后架构已有变化。**截至2026年9月，Acecore 官网在静态页面之外也使用 Pages Functions**，处理联系、评论、搜索、AI 辅助及 CMS API。旧方案属于历史记录，下面说明仍然重要的响应头边界。

## 区分静态响应和 Functions

`public/_headers` 只应用于 Pages 提供的**静态资源响应**。Cloudflare 官方明确指出，即使 URL 规则匹配，它也不会应用于 Pages Functions 生成的响应。API 所需的 CORS、缓存和安全响应头应由 Function 的 `Response` 设置。

不要认为写一次 `_headers` 就覆盖所有页面和 API。应分别检查静态 HTML 与 `/api/*` 的实际响应头。

<figure class="article-diagram" data-layout="boundary" data-tone="teal" data-count="2" aria-labelledby="diagram-cloudflare-pages-security">
  <figcaption>
    <strong id="diagram-cloudflare-pages-security">静态响应与 Functions 响应的 header 设置边界</strong>
    <span>静态文件与 API 的 header 配置位置不同。发布后分别检查两类响应。</span>
  </figcaption>
  <ol class="article-diagram__nodes">
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">1</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M5 3h10l4 4v14H5z"/><path d="M15 3v5h5M8 12h8M8 16h8"/></svg></span>
      <strong>静态文件响应</strong>
      <span>通过 _headers 设置；检查 Pages 实际返回的响应。</span>
    </li>
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">2</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M8 9h8M8 12h4M8 16h8"/></svg></span>
      <strong>Function API 响应</strong>
      <span>在 Function 的 Response 上设置；单独检查 API 响应。</span>
    </li>
  </ol>
</figure>

## 查看当前配置

[当前 `_headers`](https://github.com/acecore-systems/acecore-net/blob/main/public/_headers)要求 HTML 重新验证，对带哈希的 `_astro/` 资源使用较长缓存。CMS 有独立的 CSP，`X-Frame-Options` 为 `SAMEORIGIN`。旧文中的 `form-action https://ssgform.com`、HTML 一小时缓存及 `DENY` 均不应当作当前值复制。

动态路径可在 [Pages Functions 代码](https://github.com/acecore-systems/acecore-net/tree/main/functions)中查看。请根据自己网站实际使用的脚本、图像、框架和请求检查 CSP，不要直接移植 Acecore 的策略。

## 发布与核验

官网通过连接 GitHub 的 Cloudflare Pages 发布 `main`。[`.node-version`](https://github.com/acecore-systems/acecore-net/blob/main/.node-version)记录当前 Node 版本，CI 根据 `package.json` 执行 `npm run build`。2026年3月的“Node.js 22 / npx astro build”表格只是历史记录。

应分别检查 PR 预览、main 构建、Pages 生产部署以及公开 URL。平台行为请参阅 Cloudflare 的 [Pages 响应头文档](https://developers.cloudflare.com/pages/configuration/headers/)。
