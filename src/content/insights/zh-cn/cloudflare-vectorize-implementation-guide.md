---
title: "Cloudflare Vectorize 与 RAG 入门：理解搜索与 AI 回答的区别"
description: "说明 Cloudflare Vectorize 如何让访客用自然语言更容易找到已公开的信息，并从导入价值、普通搜索的分工、RAG 和分阶段起步方法理解其作用。"
date: 2026-07-31T12:00
lastUpdated: 2026-08-01T17:00
author: gui
tags: ["技术", "Cloudflare", "Vectorize", "RAG", "语义搜索", "站内搜索"]
image: /images/insights/vectorize-rag-hero.webp
callout:
  type: tip
  title: "先让搜索能找到答案，再考虑让 AI 回答"
  text: "Vectorize 是让访客用自然表达找到既有公开信息的检索层。保留 Pagefind，小范围验证语义搜索；只有能核验依据时，再扩展到 RAG 回答。"
insightGrid:
  eyebrow: 导入价值
  title: "把已有公开信息变成更容易回答问题的入口"
  description: "它不会凭空创造知识，而是把已发布的指南、FAQ 和规格重新连接到访客真正会提出的问题。"
  variant: card
  items:
    - title: "通过不同说法找到内容"
      description: "即使提问与页面标题不完全一致，也能返回语义接近的公开页面。"
      icon: i-lucide-sparkles
      tone: brand
    - title: "复用已经维护的文档"
      description: "指南、FAQ、案例和规格可以同时成为搜索结果与回答依据。"
      icon: i-lucide-library-big
      tone: emerald
    - title: "让回答附带来源"
      description: "RAG 可以把读者带回被选中的公开来源，以便自行核验。"
      icon: i-lucide-badge-check
      tone: amber
    - title: "保留普通搜索作为基础"
      description: "Pagefind 处理专有名词和错误代码，语义搜索作为补充。"
      icon: i-lucide-shield-check
      tone: slate
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
  - href: /insights/astro-ai-contact-chat/
    title: "面向咨询 AI 聊天的技术设计"
    description: "了解使用公开信息引导访客时的 API 边界、输入控制和 URL 允许列表。"
    icon: i-lucide-message-circle
  - href: /insights/astro-cloudflare-site-architecture/
    title: "用 Astro 与 Cloudflare 扩展官网的整体设计"
    description: "了解如何以静态网站为基础，安全添加搜索与 AI 功能。"
    icon: i-lucide-layers-3
  - href: https://developers.cloudflare.com/vectorize/
    title: Cloudflare Vectorize 官方文档
    description: "可确认 Vectorize 的用途、embedding 和搜索的官方说明。"
    icon: i-lucide-book-open
  - href: https://developers.cloudflare.com/vectorize/reference/what-is-a-vector-database/
    title: Cloudflare 对 RAG 与向量数据库的说明
    description: "了解如何把向量搜索取回的上下文补充到 LLM prompt 中。"
    icon: i-lucide-network
  - href: https://developers.cloudflare.com/vectorize/best-practices/create-indexes/
    title: "Cloudflare 的 Vectorize index 创建指南"
    description: "确认 embedding 维度与距离指标等必须在创建 index 前决定的事项。"
    icon: i-lucide-settings-2
---

## 先说结论：Vectorize 缩短问题与页面之间的距离

网站可能已经有完善的指南与 FAQ，但访客仍然找不到它们。常见原因是页面标题使用的词，与访客提问使用的词并不相同。

例如，页面写的是“账户设置”，访客却会问“登录后该做什么？”或“我不明白初始设置”。Vectorize 能按语义而非仅按完全相同的词找到接近的公开内容，从而缩短这段距离。

它不会创造新事实，也不会自动修正过时信息。它的价值在于为已经发布、可以信任的信息建立更自然的入口。Cloudflare 也将 Vectorize 用于语义搜索、推荐和分类等场景。[Cloudflare Vectorize 官方文档](https://developers.cloudflare.com/vectorize/)

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

![对比只寻找精确词语的普通搜索与寻找多个语义相关页面的语义搜索](/images/insights/vectorize-keyword-vs-semantic.webp)

_图：普通搜索适合精确词语；语义搜索适合改述和相关信息。不要用一种取代另一种，而要分配不同角色。_

## 何时最能发挥作用

| 适合引入 Vectorize 的场景       | 应先完善信息设计的场景               |
| ------------------------------- | ------------------------------------ |
| 用户用不同说法询问同一件事      | 公开页面、草稿和内部信息没有清晰边界 |
| FAQ、指南、规格和案例分布在多页 | 内容过时，无法判断哪一页是当前依据   |
| 希望把读者带到下一篇相关页面    | 只需要快速找产品名、型号或错误代码   |
| 回答需要附上原始页面链接        | 计划让 AI 自由回答却不展示来源       |

语义搜索不能替代信息质量。先明确公开内容的责任边界，再用一小组代表性问题检查会返回哪些页面。

## 分三阶段开始

不必一开始就制作聊天机器人。按下面的顺序可以在保持安全的同时观察价值。

1. **保留普通搜索**：继续用 Pagefind 查找产品名和错误代码。
2. **增加关联页面搜索**：用 Vectorize 展示与问题接近的公开页面，并用代表性问题评估结果。
3. **增加有依据的回答**：只有定义了可用页面、来源链接和拒答条件后，才加入 RAG。

![从普通搜索到语义关联搜索，再到有依据的 AI 回答，并可安全返回普通搜索的分阶段路径](/images/insights/vectorize-adoption-path.webp)

_图：普通搜索仍是基础，因此可以逐步验证语义搜索和 AI 回答，必要时安全回退。_

这样可以先验证搜索信息本身是否正确，再优化 AI 回答的呈现。

## RAG 的回答从筛选依据开始

| 要决定的事 | 容易开始的选择                                     | 原因                               |
| ---------- | -------------------------------------------------- | ---------------------------------- |
| 问题范围   | 只回答公开网站的信息                               | 避免把草稿或内部信息误用于回答     |
| 依据显示   | 每个回答链接到原页面                               | 读者可以核对回答                   |
| 依据不足时 | 说明“无法确认”                                     | 避免看似合理的猜测                 |
| 搜索分离   | 输入时使用 Pagefind；明确操作后使用 Vectorize／RAG | 传输范围、成本和等待时间更容易理解 |
| 更新基准   | 使用已发布 HTML 与其发布状态                       | 不把草稿和未公开修改混入回答依据   |
| 评估方法   | 核对代表性问题及其原始页面链接                     | 不只凭“看起来合理”的回答判断质量   |

RAG 不能保证绝不出错。corpus 的选择、依据的确认以及明确何时不回答，决定了它的质量。

![展示 RAG 如何获取候选页面、核验来源、生成带引用回答，并在依据不足时暂停的流程图](/images/insights/vectorize-rag-evidence-path.webp)

_图：RAG 不把搜索结果直接当作回答，而是核验来源，只把可用依据连接到回答和引用。_

## 从判断到实现，接下来可以这样阅读

1. [安全实现 Vectorize 的详细指南](/insights/cloudflare-vectorize-safe-implementation/)：公开 HTML corpus、content hash、差量同步、Preview／Production 隔离和 rate limit。
2. [面向咨询 AI 聊天的技术设计](/insights/astro-ai-contact-chat/)：AI 输入、API 边界与 URL 允许列表。
3. [用 Astro 与 Cloudflare 扩展官网的整体设计](/insights/astro-cloudflare-site-architecture/)：静态网站如何安全增加搜索与 AI 功能。

把“需要更好的搜索”和“需要可追溯来源的 AI 指引”分开判断，所需的实现与验证就会更清楚。
