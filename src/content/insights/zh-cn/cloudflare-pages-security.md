---
title: "Cloudflare Pages 安全响应头配置：_headers 与 Functions 的区别"
description:
  "Cloudflare Pages 的 CSP 或缓存设置未生效时，先区分静态资源与 Pages Functions 响应。本文说明
  _headers 与 Function Response 的适用范围、当前配置的查看位置，以及部署后的核查项。"
date: 2026-03-15T00:00
author: gui
tags: ["技术", "Cloudflare", "安全"]
image: "/images/insights/covers/cloudflare-pages-security-cover-v2.webp"
lastUpdated: "2026-10-20T09:59:18Z"
---

Cloudflare Pages 的 CSP 或缓存设置未生效时，首先检查响应来自静态资源还是 Pages Functions。本文整理 `_headers` 与 Function 的 `Response` 各自适用的范围、当前配置的查看位置，以及发布后的核查事项。 除了成功响应，还应检查错误响应的响应头，这有助于发现新增 API 后遗漏的配置。

本文记录了2026年3月将联系表单迁移到外部表单，并恢复 Cloudflare Pages 静态发布的经过。此后网站结构已有变化。**截至2026年9月，Acecore 官方网站除静态页面外也使用 Pages Functions**，在同一网站处理联系表单、评论、搜索、AI 指引和 CMS API。以下说明当时的选择理由，以及目前仍适用的响应头配置边界。

## Cloudflare Pages 的响应头在静态响应与 Functions 之间有何不同？

`public/_headers` 适用于 Pages 提供的**静态资源响应**。[Cloudflare Docs 的 Headers 公开源文件](https://github.com/cloudflare/cloudflare-docs/blob/production/src/content/docs/pages/configuration/headers.mdx)说明，`_headers` 规则适用于静态资源响应。此外，[Cloudflare Pages: Headers](https://developers.cloudflare.com/pages/configuration/headers/)指出，即使 URL 模式匹配，`_headers` 也不会应用于 Pages Functions 生成的响应。API 所需的 CORS、缓存和安全响应头应在 Function 的 `Response` 中设置。

因此，不能认为“写一次 `_headers` 就会作用于网站的所有页面和 API”。应分别检查静态 HTML 与 `/api/*` 的实际响应头。

<figure class="article-diagram" data-layout="boundary" data-tone="teal" data-count="2" aria-labelledby="diagram-cloudflare-pages-security">
  <figcaption>
    <strong id="diagram-cloudflare-pages-security">静态响应与 Functions 响应的配置边界</strong>
    <span>静态文件与 API 的响应头配置位置不同。发布后应分别检查两类响应。</span>
  </figcaption>
  <ol class="article-diagram__nodes">
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">1</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M5 3h10l4 4v14H5z"/><path d="M15 3v5h5M8 12h8M8 16h8"/></svg></span>
      <strong>静态文件响应</strong>
      <span>通过 _headers 设置，并检查 Pages 返回的响应。</span>
    </li>
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">2</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M8 9h8M8 12h4M8 16h8"/></svg></span>
      <strong>Function API 响应</strong>
      <span>在 Function 的 Response 中设置，并单独检查 API 响应。</span>
    </li>
  </ol>
</figure>

## 在哪里查看当前的响应头配置？

[当前的 `_headers`](https://github.com/acecore-systems/acecore-net/blob/main/public/_headers)将 HTML 设置为重新验证，并为带哈希的 `_astro/` 资源设置较长的缓存时间。CMS 管理界面使用与普通页面不同的 CSP，`X-Frame-Options` 为 `SAMEORIGIN`。不要将旧文章中的 `form-action https://ssgform.com`、HTML 缓存一小时或 `DENY` 复制为当前值。

当前的动态路径可在 [Pages Functions 代码](https://github.com/acecore-systems/acecore-net/tree/main/functions)中查看。CSP 中允许的外部域名也应根据实际加载的脚本、图像、框架和通信目标进行核对。不要将这里列出的设置直接移植到其他网站。

## 部署后应检查什么？

官网通过连接到 GitHub 的 Cloudflare Pages 发布 `main`。[当前 Node.js 版本](https://github.com/acecore-systems/acecore-net/blob/main/.node-version)记录在 `.node-version` 中，构建步骤写在 `package.json` 中，CI 通过 `npm run build` 进行验证。2026年3月的“Node.js 22 / npx astro build”表格并非当前的发布步骤。

核验发布情况时，应分别检查 PR 预览、main 构建、Pages 生产部署，以及公开 URL 的响应头和正文。[Cloudflare Pages Headers 官方文档](https://developers.cloudflare.com/pages/configuration/headers/)可用于查看 `_headers` 设置。
