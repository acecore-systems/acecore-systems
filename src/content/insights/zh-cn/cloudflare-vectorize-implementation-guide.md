---
title: "Cloudflare Vectorize 与 RAG 入门：理解搜索与 AI 回答的区别"
description: "简要说明 Cloudflare Vectorize 的语义搜索与 RAG，并区分搜索、依据和 AI 回答各自的作用。"
date: 2026-07-31T12:00
author: gui
tags: ["技术", "Cloudflare", "Vectorize", "RAG", "站内搜索"]
image: /uploads/acecore-generated/blog-cloudflare-pages-security.webp
callout:
  type: tip
  title: "RAG 是“先搜索，再回答”的机制"
  text: "Vectorize 负责查找语义接近的公开信息；RAG 则把选定信息作为依据，由 AI 组织回答。只有 Vectorize，或只有回答 AI，都不是 RAG。"
processFigure:
  eyebrow: RAG 基础
  title: "从问题到有依据回答的四个步骤"
  description: "搜索结果本身不是回答；先取回原始公开页面，再把它作为回答依据。"
  variant: inline
  steps:
    - title: 准备公开信息
      description: "只把可以展示给读者的页面加入搜索范围。"
      icon: i-lucide-file-check-2
      accent: slate
    - title: 按语义搜索问题
      description: "把问题转换为 embedding，并用 Vectorize 查找接近的信息。"
      icon: i-lucide-search
      accent: brand
    - title: 筛选依据
      description: "确认源页面、URL 和时效性，只选择允许用于回答的信息。"
      icon: i-lucide-list-checks
      accent: amber
    - title: 回答或暂缓回答
      description: "只有依据充足时才生成回答；否则明确说明无法确认。"
      icon: i-lucide-message-square-text
      accent: emerald
linkCards:
  - href: /insights/cloudflare-vectorize-safe-implementation/
    title: 安全实现 Vectorize 的详细指南
    description: "需要实现公开 HTML corpus、差量同步、Preview／Production 隔离和 API 边界时阅读。"
    icon: i-lucide-wrench
  - href: https://developers.cloudflare.com/vectorize/
    title: Cloudflare Vectorize 官方文档
    description: "可确认 Vectorize 的用途、embedding 和搜索的官方说明。"
    icon: i-lucide-book-open
  - href: https://developers.cloudflare.com/vectorize/reference/what-is-a-vector-database/
    title: Cloudflare 对 RAG 与向量数据库的说明
    description: "了解如何把向量搜索取回的上下文补充到 LLM prompt 中。"
    icon: i-lucide-network
---

## 先理解：什么是 RAG？

RAG 是 **Retrieval Augmented Generation** 的缩写。可以简单理解为：先搜索相关信息，再让 AI 使用这些信息生成回答。

可以把 Vectorize 看作图书管理员的检索目录：它查找语义接近的资料。RAG 则是完整的工作流程：找到资料、阅读选定来源，再附带来源说明来回答问题。

它不是直接把问题发送给 AI，而是先从自己的公开信息中取回相关资料，再把资料作为上下文交给模型。Cloudflare 将“把向量搜索得到的上下文加入发送给 LLM 的 prompt”称为 RAG。[Cloudflare 官方说明](https://developers.cloudflare.com/vectorize/reference/what-is-a-vector-database/)

## Vectorize 与 RAG 的职责不同

| 部件      | 职责                         | 单独可以做什么                     |
| --------- | ---------------------------- | ---------------------------------- |
| Pagefind  | 在页面中查找词语             | 快速查找产品名、专有名词和错误代码 |
| Vectorize | 查找语义接近的信息           | 返回改述和关联页面的候选项         |
| RAG       | 使用检索到的依据生成 AI 回答 | 返回回答及其来源页面链接           |

Vectorize 不会生成回答。RAG 也不只是搜索。只有把检索、依据筛选、回答生成和来源展示作为同一份契约设计，读者才能核对回答。

## 应该从哪里开始？

不需要一开始就做聊天机器人。下面的顺序更容易理解，也更安全。

1. 保留 Pagefind 作为普通搜索入口。
2. 用 Vectorize 添加“查找关联页面”，并评估搜索质量。
3. 确定可作为依据的页面、来源链接和依据不足时的处理方式。
4. 只有能满足这些条件时，才添加 RAG 的 AI 回答。

这样可以先验证搜索信息本身是否正确，再优化 AI 回答的呈现。

## RAG 之前先决定四件事

| 要决定的事 | 容易开始的选择                                     | 原因                               |
| ---------- | -------------------------------------------------- | ---------------------------------- |
| 问题范围   | 只回答公开网站的信息                               | 避免把草稿或内部信息误用于回答     |
| 依据显示   | 每个回答链接到原页面                               | 读者可以核对回答                   |
| 依据不足时 | 说明“无法确认”                                     | 避免看似合理的猜测                 |
| 搜索分离   | 输入时使用 Pagefind；明确操作后使用 Vectorize／RAG | 传输范围、成本和等待时间更容易理解 |

RAG 不能保证绝不出错。corpus 的选择、依据的确认以及明确何时不回答，决定了它的质量。

## 实现细节请另读一篇

本页解释为什么要使用 Vectorize 与 RAG。公开 HTML 的 corpus、content hash、差量同步、Preview／Production 隔离和 rate limit 已移到[安全实现 Vectorize 的详细指南](/insights/cloudflare-vectorize-safe-implementation/)中。
