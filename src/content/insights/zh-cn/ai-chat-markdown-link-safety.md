---
title: "安全渲染 AI 聊天回答中的 Markdown 链接：实现设计"
description: "这是一份将 AI 聊天回答中包含的 Markdown 链接安全转换为 HTML 的实现笔记。通过分别考虑 URL 前后的空白、trim、允许列表、DOM 生成、回退和测试用例，可以构建便于移植到其他网站的渲染器。"
date: 2026-06-07T14:30
lastUpdated: "2026-11-12T00:00:00+09:00"
author: gui
tags: ["技术", "网站", "AI", "安全", "Astro"]
image: "/images/insights/covers/ai-chat-markdown-link-safety-cover-v2.webp"
callout:
  type: tip
  title: 本文要点
  text: AI 回答不是可信的 HTML。即使要便捷地使用 Markdown 链接，也应先对 URL 执行 trim，再通过允许列表进行判定；无法通过检查的内容不要转换为链接，而应作为文本保留。
processFigure:
  title: AI 回答的链接渲染流程
  steps:
    - title: 文本
      description: 首先将模型生成的回答视为纯文本。
      icon: i-lucide-message-square-text
      accent: brand
    - title: 解析
      description: 使用小型解析器提取所需的 Markdown 表达。
      icon: i-lucide-brackets
      accent: amber
    - title: 验证
      description: 对 href 执行 trim，并仅允许内部 URL 或允许列表中的域名。
      icon: i-lucide-shield-check
      accent: emerald
    - title: 渲染
      description: 不使用innerHTML，而是通过 DOM API 仅创建安全元素。
      icon: i-lucide-code-2
      accent: slate
compareTable:
  title: Markdown 链接渲染中应区分的判断
  before:
    label: 粗略渲染时
    items:
      - 直接将 AI 回答放入innerHTML
      - 试图一次性实现完整的 Markdown 规范
      - URL 前后的空白导致链接转换失败
      - "将外部 URL 与 javascript: 当作同一类处理"
  after:
    label: 小而安全地渲染时
    items:
      - 将回答作为文本接收，只将必要的表达转换为 DOM
      - 仅支持聊天中会用到的 Markdown
      - URL 执行 trim 后再进行安全检查
      - 无法通过允许列表的 URL 不转换为链接，而作为字符串显示
checklist:
  title: 集成检查清单
  items:
    - text: 不要将 AI 回答视为 HTML
    - text: 允许 Markdown 链接 URL 前后的空白
    - text: 务必先对 href 执行 trim，再进行验证
    - text: 仅允许内部路径、同一 origin 和必需的外部域名
    - text: 为外部链接明确设置 target 和 rel
    - text: 将无法通过允许列表的链接作为文本保留
    - text: 除正常情况外，也要测试危险 URL 和格式错误的 Markdown
linkCards:
  - href: /blog/astro-ai-contact-chat/
    title: 咨询 AI 聊天的技术设计
    description: 涵盖 AI 回答、API 边界和提示词控制的主文章。
    icon: i-lucide-sparkles
  - href: /insights/cloudflare-pages-security/
    title: Cloudflare Pages 的安全设置
    description: 整理 CSP 和安全标头的相关文章。
    icon: i-lucide-shield
  - href: /contact/
    title: 联系我们
    description: 实际部署 AI 聊天和表单的页面入口。
    icon: i-lucide-message-square
faq:
  title: 常见问题
  items:
    - question: 使用 markdown-it 或 marked 就足够了吗？
      answer: 即使使用库，也仍需单独设计如何处理 HTML 输出、允许哪些链接目标、添加 target 和 rel，以及拒绝危险 URL。对于聊天用途，有时小型自定义渲染器就足够了。
    - question: 允许 URL 前后有空白会不会带来安全风险？
      answer: 关键不在于本身是否允许空白，而在于 trim 后允许什么。只要用允许列表检查 trim 后的 href，就能在适应模型表述差异的同时确保安全。
    - question: 无法通过允许列表的 URL 应该删除吗？
      answer: 很多时候，与其删除，不如以文本显示，这样更便于调试，也能为用户保留回答上下文。不过，如果运营上希望完全隐藏可疑字符串，也可以选择移除整个链接。
---

如果 AI 回答中的链接仍然只是字符串，首先将相同输入依次交给解析、URL 验证和 DOM 渲染，并找出失败的阶段。对于显示文本，使用诸如[MDN: textContent](https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent)这样的文本 API，并将是否转换为链接与 HTML 解释分开处理，这是将该做法应用到现有聊天界面的起点。

如果让 AI 聊天回复“请参阅[服务列表](/services/)了解详情”，有时它不会显示为链接，Markdown 字符串就会原样留在页面上。

Acecore 网站也遇到过咨询 AI 聊天的回答中混入 URL 前后带空格的 Markdown 链接的情况，因此我们在[修复 AI 聊天 Markdown 链接渲染的 PR](https://github.com/acecore-systems/acecore-net/pull/99)中调整了渲染器。

本文以这项小修复为切入点，总结将 AI 回答安全转换为 DOM 的思路。

## AI 回答不是可信的 HTML

首先要明确：将 AI 回答视为文本，而不是 HTML。

在聊天 UI 中，我们可能会希望使用链接、粗体或项目符号列表等格式。然而，如果把回答直接放进 `innerHTML`，就等于让浏览器解释模型生成的字符串。

我们需要做的并不是实现全部 Markdown，而是仅支持聊天所需的表达，并且只创建安全的 DOM。

## 问题不只是空白

这次直接导致问题的是下面这样的链接。

```md
[サービス一覧](/services/)
```

从 Markdown 的角度看，人类可以理解它的含义，但如果使用正则表达式将 URL 部分提取为“不含空格的字符串”，就无法匹配。

修改前的思路大致如下。

```js
/\[([^\]]+)\]\(([^)\s]+)\)/;
```

由于 `[^)\s]+` 不允许空白，因此无法将 `( /services/ )` 识别为链接。所以，我们应允许括号内部的前后空白，并在之后对实际使用的 URL 执行 trim。

```js
/\[([^\]]+)\]\(\s*([^)]+?)\s*\)/;
```

这里重要的是，不能只是放宽正则表达式就结束。放宽之后，必须进行规范化和安全检查。

## 先对 href 执行 trim，再验证

创建链接的步骤应保持固定。

1. 从 Markdown 中提取 label 和 raw href
2. 对 raw href 执行 `trim()`
3. 使用允许列表验证已 trim 的 href
4. 仅在允许时创建 `<a>`

```js
const href = String(rawHref || "").trim();

if (label && isSafeMarkdownHref(href)) {
  const link = document.createElement("a");
  link.href = href;
  link.rel = "noopener noreferrer";

  if (/^https?:\/\//i.test(href)) {
    link.target = "_blank";
  }

  link.textContent = label;
  parent.appendChild(link);
}
```

应验证的不是执行 `trim()` 之前的值，而是实际写入 DOM 的值。如果经过验证的值与渲染时使用的值不一致，安全检查就会失去意义。

## 允许列表应按产品分别确定

AI 聊天可以引导用户访问哪些 URL，因网站而异。

Acecore 的咨询 AI 大致限定在以下范围。

| 类型        | 示例                      | 处理                     |
| ----------- | ------------------------- | ------------------------ |
| 内部路径    | `/services/`              | 允许                     |
| 同一 origin | `https://acecore.net/...` | 允许                     |
| 官方 LINE   | `https://lin.ee/...`      | 用途明确，因此允许       |
| mailto      | `mailto:info@acecore.net` | 仅允许必需的固定收件地址 |
| tel         | `tel:0120987370`          | 仅允许必需的固定号码     |
| 其他外部    | 任意 URL                  | 原则上不转换为链接       |

示例实现如下。

```js
function isSafeMarkdownHref(rawHref) {
  const href = String(rawHref ?? "").trim();
  if (!href || /[\u0000-\u001f\u007f\\]/u.test(href)) return false;
  if (href === "mailto:info@acecore.net" || href === "tel:0120987370") {
    return true;
  }

  try {
    if (href.startsWith("/")) {
      if (href.startsWith("//")) return false;
      const url = new URL(href, window.location.origin);
      return (
        url.origin === window.location.origin && !url.username && !url.password
      );
    }

    const url = new URL(href);
    return (
      url.protocol === "https:" &&
      !url.username &&
      !url.password &&
      !url.port &&
      [
        window.location.origin,
        "https://acecore.net",
        "https://lin.ee",
      ].includes(url.origin)
    );
  } catch {
    return false;
  }
}
```

这个函数应按网站而异。招聘网站可能会允许招聘平台，电商可能允许支付或物流追踪链接，SaaS 则可能允许文档或状态页面。

## 无法通过允许列表的链接应作为文本保留

如何处理未通过安全检查的链接，同样需要设计。

对于咨询 AI，与其彻底删除无法转换为链接的 Markdown，不如将其作为原始字符串保留，这样更易于处理。用户可以保留上下文，开发者也能确认“AI 输出了什么”。

也就是说，解析器不仅负责“创建安全链接”，还负责“无法安全创建时，将其作为普通文本输出”。

## 从一开始就准备好测试用例

这种渲染器如果只检查正常情况，就容易遗漏问题。

至少应验证以下情况。

| 输入                                | 预期结果                   |
| ----------------------------------- | -------------------------- |
| `[サービス一覧](/services/)`        | 转换为内部链接             |
| `[サービス一覧]( /services/ )`      | trim 后转换为内部链接      |
| `[LINE]( https://lin.ee/example )`  | 作为外部链接打开           |
| `[危険](javascript:alert(1))`       | 不转换为链接               |
| `[外部](https://example.com/)`      | 若未获允许，则不转换为链接 |
| `[壊れたリンク](/services/`         | 作为文本显示               |
| `` `code` と [link]( /contact/ ) `` | 代码和链接分别渲染         |

在 PR #99 中，我们确认 `[サービス一覧]( /services/ )`、`[サービス一覧](/services/)` 和 `[LINE]( https://lin.ee/DjIrdqj )` 会被视为同一个 URL。

## 决定不实现完整的 Markdown

AI 聊天中使用的 Markdown 可以限制在有限范围内。

- 段落
- 项目符号列表
- 粗体
- 行内代码
- 链接

如果还要支持表格、图片、HTML、脚注和深层级标题，渲染器的职责就会突然变得复杂得多。对于聊天 UI，只要能够清晰易读地提供引导就足够了。

有需要时，也可以选择使用成熟的 Markdown 库。不过，即便如此，“是否允许 HTML”“如何限制 URL”“外部链接要附加什么属性”仍然需要单独决定。

## 总结

AI 聊天中的 Markdown 链接渲染看起来只是一个很小的外观修复，但实际上它涉及 AI 输出可信度的边界设计。

实现中应重点关注以下几点。

- 将 AI 回答作为文本而非 HTML 处理
- 仅将必要的 Markdown 转换为 DOM
- 允许 Markdown 链接 URL 前后的空白
- 对 href 执行 trim 后再做安全检查
- 通过允许列表仅放行内部 URL 和必需的外部 URL
- 将无法通过允许列表的链接作为文本保留
- 测试格式错误的 Markdown 和危险 URL

越是将 AI 融入网站的用户引导流程，如何渲染回答文本就越重要。便捷的 Markdown 支持与安全的链接控制，应在同一实现中一并处理。
