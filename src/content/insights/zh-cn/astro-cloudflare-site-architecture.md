---
title: "用 Astro + Cloudflare 逐步扩展官网功能的整体设计"
description: "整理 Acecore 官网如何以 Astro 和 Cloudflare Pages 为基础，组合咨询 AI、Sveltia CMS、多语言博客、服务 CTA、Markdown 安全渲染和 Cloudflare 评论功能。"
date: 2026-06-07T19:00
author: gui
tags: ["技术", "Astro", "Cloudflare", "网站", "AI", "CMS"]
image: /uploads/acecore-generated/work-acecore-net-website.webp
callout:
  type: tip
  title: 添加功能前先划清边界
  text: "AI 聊天、CMS、多语言和评论功能各自都很有用，但放在同一个官网里时，需要先决定职责边界。Astro 生成静态 HTML，Cloudflare 负责发布和小型 API，GitHub PR 保留变更记录。"
processFigure:
  eyebrow: Site Architecture
  title: 官网功能扩展的层次
  description: 默认保持静态，只在必要位置加入动态处理。
  variant: inline
  steps:
    - title: 发布
      description: Astro 生成静态 HTML，Cloudflare Pages 负责发布。
      icon: i-lucide-rocket
      accent: brand
    - title: 编辑
      description: Sveltia CMS 编辑日文 source，并通过 GitHub PR 审核。
      icon: i-lucide-file-pen-line
      accent: emerald
    - title: 翻译
      description: 翻译通过 PR 流程处理，而不是把所有语言塞进 CMS。
      icon: i-lucide-languages
      accent: amber
    - title: 引导
      description: 用 AI 聊天和服务 CTA 把访客带到合适的表单。
      icon: i-lucide-route
      accent: slate
    - title: 接收
      description: Pages Functions 承担 API 边界，必要时连接 D1 和 Turnstile。
      icon: i-lucide-cloud
      accent: brand
compareTable:
  title: 单独添加功能与作为整体架构添加功能的区别
  before:
    label: 按功能分别添加
    items:
      - "AI、CMS、评论和表单各自采用不同的设计理念"
      - "外部服务脚本和管理界面不断增加，说明责任变得分散"
      - "多语言URL、搜索索引和预览环境容易产生偏差"
      - "功能之间的关系不清晰，难以决定导入顺序"
  after:
    label: 按层添加
    items:
      - "能够分别说明Astro、Cloudflare、GitHub和Workers AI的职责"
      - "动态API集中到Pages Functions，存储位置也可统一到D1等Cloudflare服务"
      - "CMS更新、多语言翻译、搜索、RSS和sitemap可使用同一内容结构处理"
      - "可作为按用途和导入顺序阅读的索引"
checklist:
  title: 迁移到其他网站时的设计检查
  items:
    - text: "区分可静态输出的内容与需要API的内容"
      checked: true
    - text: "将CMS作为编辑入口、翻译作为PR、发布判断作为build分别处理"
      checked: true
    - text: "不向咨询AI传递个人信息，只允许其依据已公开信息进行引导"
      checked: true
    - text: "表单导流通过URL参数传递上下文，接收值使用稳定的分类"
      checked: true
    - text: "对评论等投稿数据，在配置中明确D1实体名称与binding"
      checked: true
    - text: "不把AI输出或用户投稿视为可信HTML，而是通过允许列表处理"
      checked: true
faq:
  title: 常见问题
  items:
    - question: 应该从哪里开始导入？
      answer: "首先完善Astro的静态页面、博客、RSS、sitemap和OGP。接着导入CMS与多语言功能，等到需要咨询导流后，再依次加入AI聊天、服务CTA和评论功能，这样最容易管理。"
    - question: 所有功能都应该只用Cloudflare构建吗？
      answer: "不是。咨询AI等部分也会使用Workers AI。重点是将分发、API边界、数据库和bot防护集中到Cloudflare，并有意识地区分使用和不使用外部服务的位置。"
    - question: 小型网站也需要做到这个程度吗？
      answer: "不需要一开始全部导入。但如果计划加入CMS、咨询导流、多语言或评论中的任何一项，尽早确定URL、数据存储位置、预览环境和搜索索引的处理方式，后续会更轻松。"
linkCards:
  - href: /zh-cn/blog/astro-ai-contact-chat/
    title: 咨询 AI 聊天的技术设计
    description: 使用站内信息引导访客时的 API 边界和安全控制。
    icon: i-lucide-bot
  - href: /zh-cn/blog/cms-selection-and-turnstile/
    title: Sveltia CMS 导入指南
    description: 为静态网站加入 CMS、GitHub backend、OAuth 和 PR 运营。
    icon: i-lucide-badge-check
  - href: /zh-cn/blog/copilot-translation-pipeline/
    title: 用 Sveltia CMS 运营多语言博客
    description: 生成各语言的静态页面，而不是只依赖浏览器 UI 翻译。
    icon: i-lucide-languages
  - href: /blog/service-cta-contact-prefill/
    title: 将服务 CTA 的上下文传给联系表单
    description: 把服务页面的阅读上下文传递到表单分类和主题。
    icon: i-lucide-route
  - href: /zh-cn/blog/ai-chat-markdown-link-safety/
    title: 安全渲染 AI 聊天中的 Markdown 链接
    description: 不把 AI 输出当作可信 HTML，只渲染通过 allowlist 的链接。
    icon: i-lucide-shield-check
  - href: /zh-cn/blog/cloudflare-only-blog-comments/
    title: 只用 Cloudflare 添加博客评论
    description: 不使用外部评论服务，用 Pages Functions、D1 和 Turnstile 实现评论。
    icon: i-lucide-message-square-text
---

使用 Astro 和 Cloudflare Pages 做静态网站时，一开始只要能快速、安全地发布页面就足够了。

但运营一段时间后，通常会想加入浏览器编辑、多语言页面、AI 聊天引导、从服务页传递表单上下文，以及评论功能。

这篇文章是一个实现索引：先判断功能属于哪一层、按什么顺序加入、接下来该读哪篇详细文章。例子来自 Acecore 官网，但方法可以直接套用到其他 Astro + Cloudflare 网站。

## 结论

官网扩展功能时，先把职责拆开：

| 层次        | 职责                                       |
| ----------- | ------------------------------------------ |
| Astro       | 页面、博客、OGP、RSS、sitemap、UI          |
| Cloudflare  | Pages 发布、Pages Functions、D1、Turnstile |
| GitHub      | PR 审核、CMS 差异、翻译差异、历史记录      |
| Sveltia CMS | 日文 source、作者、标签、图片              |
| Workers AI  | 咨询 AI 的回答生成                         |
| Pagefind    | 为审核后的静态 HTML 建立站内搜索索引       |

能静态生成的内容保持静态。需要请求时处理的部分才进入 Cloudflare Pages Functions。

## 动态功能只做小 API

咨询 AI 和评论功能都采用相同模式：

- Astro 负责 UI
- Pages Functions 负责 API 边界
- secret、D1 binding、Turnstile secret、Origin 检查不暴露给浏览器

网站不会因此变成完整的应用服务器。它仍然以静态页面为主。

## CMS 是编辑入口，不是运行时数据库

Sveltia CMS 的职责是让内容编辑变成 Git 差异。

日文博客、作者、标签、图片和日文 JSON 文案都通过 CMS 编辑，然后经过 GitHub PR、build 和 review 再发布。

这样可以保留静态网站的可审查性。

## 多语言是静态内容生成

多语言页面不是浏览器 UI 翻译，而是实际生成各语言 Markdown 和 HTML。

因此每种语言都有 URL、title、description、OGP、JSON-LD、RSS、sitemap 和 hreflang。

## 联系导线要分工

AI 聊天适合帮助访客判断该看哪个服务。服务 CTA 适合把已经阅读的服务上下文传到表单。表单负责记录正式咨询。

把这些都当作同一个“联系我们按钮”会让体验变弱。

## AI 输出不是可信 HTML

AI 回答可以包含 Markdown 风格的链接，但不能直接放进 `innerHTML`。

链接需要 trim、allowlist 检查，并用 DOM API 渲染。无法确认安全的链接保留为文本。

## 评论功能留在 Cloudflare 内

评论功能没有使用外部评论服务。

Pages Functions 处理 GET/POST，D1 保存评论，Turnstile 验证提交，Origin、hostname、rate limit 和内容过滤决定是否接受。

对小型公司博客来说，这比引入完整社区系统更合适。

## 按目的阅读

不需要从头读完。先从想加入的功能开始。

| 想做的事                   | 先读文章                                                                                |
| -------------------------- | --------------------------------------------------------------------------------------- |
| 从浏览器编辑文章和图片     | [Sveltia CMS 导入指南](/zh-cn/blog/cms-selection-and-turnstile/)                        |
| 让多语言页面进入搜索索引   | [用 Sveltia CMS 运营多语言博客](/zh-cn/blog/copilot-translation-pipeline/)              |
| 用 AI 聊天引导访客         | [在 Astro 网站中加入咨询 AI 聊天的技术设计](/zh-cn/blog/astro-ai-contact-chat/)         |
| 在 AI 回答中安全渲染链接   | [安全渲染 AI 聊天回答中的 Markdown 链接](/zh-cn/blog/ai-chat-markdown-link-safety/)     |
| 把服务页上下文传给联系表单 | [将服务 CTA 的上下文传给联系表单](/blog/service-cta-contact-prefill/)                   |
| 不依赖外部服务添加评论功能 | [只用 Cloudflare 为 Astro 博客添加评论功能](/zh-cn/blog/cloudflare-only-blog-comments/) |

## 推荐导入顺序

如果要在其他网站采用同样结构，顺序建议如下：

1. 先用 Astro 固定静态页面、博客、RSS、sitemap 和 OGP。
2. 用 Sveltia CMS 编辑日文 source。
3. 将多语言页面生成成静态 HTML。
4. 加入 AI 聊天和服务 CTA。
5. 固化 Markdown 链接、表单 prefill、Origin 检查和 rate limit。
6. 真正需要交流时，再在 Cloudflare 内加入评论功能。

## 总结

Astro + Cloudflare 的官网不必停留在静态公司介绍页。

只要把职责分清，静态页面、CMS、多语言、咨询 AI、表单导线和评论功能可以在同一个架构里共存。

把这篇作为入口，就可以只选择自己网站需要的功能，同时不破坏静态网站的基础。
