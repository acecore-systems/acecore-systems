---
title: "在 Astro 网站中集成咨询 AI 聊天机器人的技术设计"
description: "这是截至2026年6月的参考设计。本文介绍如何在 Astro + Cloudflare Pages 架构的静态网站中集成使用 OpenAI Responses API 的咨询 AI 聊天机器人。我们将 API 边界、站内上下文、提示词控制、按 locale 区分的 URL、Origin 检查、速率限制以及安全的 Markdown 链接渲染等内容，整理成便于移植到其他网站的形式。"
date: 2026-06-07T12:00
lastUpdated: "2026-11-12T00:00:00+09:00"
author: gui
tags: ["技术", "Cloudflare", "网站", "AI", "服务"]
image: "/images/insights/covers/astro-ai-contact-chat-cover-v2.webp"
callout:
  type: info
  title: 本文要点
  text: 咨询 AI 聊天机器人并非让 AI 自由回答的功能，而应设计成一个利用已公开的网站信息、将访客引导至恰当入口的小型应用。API 密钥、提示词、联系方式和 Markdown 渲染均通过服务器端和允许列表进行控制。
processFigure:
  title: 咨询 AI 聊天机器人的参考架构
  steps:
    - title: 聊天组件
      description: Astro 端的聊天 UI 只发送问题、显示 locale 和必要的最少历史记录。
      icon: i-lucide-message-circle
      accent: brand
    - title: 函数
      description: Cloudflare Pages Function 负责输入验证、Origin 检查、速率限制和提示词生成。
      icon: i-lucide-shield-check
      accent: amber
    - title: 模型
      description: 将公开的网站信息和会话上下文发送至 OpenAI Responses API，并接收回答文本。
      icon: i-lucide-sparkles
      accent: emerald
    - title: 渲染器
      description: 在客户端将允许的 Markdown 转换为 DOM，并引导至站内链接或联系方式。
      icon: i-lucide-code-2
      accent: slate
compareTable:
  title: 实施时应拆分的职责
  before:
    label: 集中实现时
    items:
      - 直接从浏览器调用 AI API
      - 网站信息、API 密钥、UI 显示和链接渲染混在一起
      - AI 容易对价格、合同和交付期限作出确定承诺
      - 容易将 Markdown 或 URL 原样写入 HTML
  after:
    label: 拆分职责后
    items:
      - API 密钥和模型调用仅保留在服务器端
      - 将公开的网站信息作为明确的上下文进行管理
      - 通过提示词控制回答范围和联系入口
      - 使用允许列表渲染 Markdown 和 URL
checklist:
  title: 移植到其他网站时的设计检查清单
  items:
    - text: 将 AI 聊天机器人的目标定义为「梳理引导路径」，而非「完成咨询」
    - text: 不在浏览器中暴露 API 密钥，并建立服务器端 API 边界
    - text: 将回答所用的网站信息限定为已公开的信息
    - text: 明确 AI 不得对价格、合同、交付期限、保证等内容作出断言
    - text: 确定表单、LINE、电子邮件和电话的展示规则
    - text: 生成按 locale 区分的 URL，确保多语言导航正常
    - text: 加入 Origin 检查、输入长度限制、历史记录限制和速率限制
    - text: 对 Markdown 链接先执行 trim，再通过允许列表判定
linkCards:
  - href: /contact/
    title: 联系我们
    description: 整理了 AI 聊天、LINE、表单和直接联系方式的入口。
    icon: i-lucide-message-square
  - href: /insights/cloudflare-pages-security/
    title: Cloudflare Pages 安全设置
    description: 介绍 CSP、标头设置等静态网站托管基础的文章。
    icon: i-lucide-shield
  - href: /blog/cms-selection-and-turnstile/
    title: Sveltia CMS 集成指南
    description: 介绍如何为静态网站添加 CMS 编辑界面的相关文章。
    icon: i-lucide-badge-check
faq:
  title: 常见问题
  items:
    - question: 没有 RAG 或向量数据库，就不能构建咨询 AI 聊天机器人吗？
      answer: 对于规模较小的企业网站，只要先将已公开页面的要点整理为结构化上下文并传入提示词，就能满足实际使用需求。页面数量和更新频率增加后，再考虑搜索索引或向量数据库即可。
    - question: OpenAI API 密钥会暴露在浏览器中吗？
      answer: 不会。浏览器只会将问题发送到 /api/ai-contact，OpenAI Responses API 的调用和 API 密钥管理都在 Cloudflare Pages Function 端进行。
    - question: AI 回答中的链接可以随意显示吗？
      answer: 不会随意显示。只允许内部路径、同一 origin、acecore.net、官方 LINE，以及必要时使用的 mailto 和 tel；即使 Markdown 链接的 URL 前后有空格，也会先执行 trim 再进行安全判定。
---

如果要在静态网站上尝试 AI 聊天，首先只让它为访客指引已公开的 FAQ，并将正式报价和业务受理交给表单。服务器端连接配置请参阅 [Cloudflare Pages：绑定](https://developers.cloudflare.com/pages/functions/bindings/)。正文中的 URL 判定属于当时的简化示例，因此在实际实现时，请使用相关文章中介绍的 URL 解析和允许列表，不要仅凭字符串前缀匹配就放行。

> **2026年9月26日补充：** 以下是截至2026年6月的参考设计。Acecore Systems 当前的 `/api/ai-chat` 会从 Cloudflare Pages Function 经由 Service Binding 转发至通用的 `acecore-chat-worker`。界面端接收 JSON 响应并显示已生成的回答。正文中直接调用 OpenAI Responses API 的架构，请按照当前 Systems 实现的方式重新理解。

只要是在网站上放置 AI，搭建咨询 AI 聊天机器人并不难。但实际运营中容易出问题的，与其说是模型性能，不如说是允许它回答到什么程度、将访客引导至哪里、允许显示哪些 URL，以及如何控制 API 成本。

在 Acecore 的网站上，我们在 Astro + Cloudflare Pages 静态网站中加入了咨询 AI 聊天机器人。实现的核心是 [实现咨询 AI 和 CMS 专属翻译流程的 PR](https://github.com/acecore-systems/acecore-net/pull/98)。随后，我们通过[另一项 PR](https://github.com/acecore-systems/acecore-net/pull/99)调整了 AI 回答中 Markdown 链接的安全渲染。链接渲染的详细设计另行整理在[安全渲染 AI 聊天回答中 Markdown 链接的实现设计](/blog/ai-chat-markdown-link-safety/)。

本文不记录特定网站的具体作业，而是将其整理为便于移植到其他静态网站的技术设计。即使使用 Astro 以外的前端框架，思路也基本相同；关键是区分客户端、API 边界、提示词和渲染器各自的职责。

## 整体架构

本次架构分为简单的3层。

| 层级                 | 作用                                                     |
| -------------------- | -------------------------------------------------------- |
| 聊天组件             | UI、输入、显示 locale、必要的最少历史记录、Markdown 渲染 |
| `/api/ai-contact`    | 输入验证、Origin 检查、速率限制、提示词生成、调用 OpenAI |
| OpenAI Responses API | 基于站内信息和会话上下文生成回答                         |

不会采用从浏览器直接调用 OpenAI API 的架构。原因有3个。

- 不在浏览器中暴露 API 密钥
- 可在服务器端更新模型、提示词和站内上下文
- 可将输入长度、Origin、速率限制和错误处理集中到1处

在 Astro + Cloudflare Pages 中，API 边界可以实现为 Cloudflare Pages Functions 的 `/api/ai-contact`。在 Next.js 中可替换为 Route Handler，在 Hono 或 Express 中可替换为 API route，采用同样的思路即可。

## 精简端点契约

发送到咨询 AI 聊天机器人 API 的信息应尽可能精简。

```ts
type ContactAiRequest = {
  message: string;
  locale: "ja" | "en" | "zh-cn" | "es" | "pt" | "fr" | "ko" | "de" | "ru";
  history?: Array<{
    role: "user" | "assistant";
    content: string;
  }>;
};

type ContactAiResponse = {
  answer: string;
};
```

我们决定不将表单中填写的姓名、电子邮件、电话号码、公司名称等信息发送给 AI 聊天机器人。咨询 AI 聊天不是收集个人信息的地方，而是帮助访客梳理「应该查看哪项服务」或「应该从哪里开始咨询」的入口。

对话历史也不会无限制发送。只发送最近的几条，并限制每1条消息的字符数。这样可以控制提示词膨胀和 API 成本。

## 在服务器端控制输入和调用

Cloudflare Pages Function 端会集中执行以下处理。

```ts
export async function onRequestPost({ request, env }: PagesFunction<Env>) {
  assertSameOrigin(request);
  assertRateLimit(request);

  const body = await request.json();
  const message = validateMessage(body.message);
  const locale = validateLocale(body.locale);
  const history = trimHistory(body.history);

  const prompt = buildContactPrompt({
    locale,
    message,
    history,
    siteContext: buildPublicSiteContext(locale),
  });

  const answer = await callOpenAIResponsesApi({
    apiKey: env.OPENAI_API_KEY,
    model: env.OPENAI_MODEL,
    prompt,
  });

  return Response.json({ answer });
}
```

关键点是在调用 OpenAI 之前，务必先将输入控制在较小范围内。调用 AI API 会根据接收的输入产生费用。如果直接放行长文本、不必要的历史记录和来自外部网站的连续访问，运营稳定性会先于功能体验受到影响。

将 `OPENAI_MODEL` 设置为环境变量后，更便于更换模型或在 preview 环境中进行验证。`OPENAI_API_KEY` 则理应只通过服务器端环境变量进行管理。

Cloudflare Pages 的托管和 CSP 相关思路，也整理在[使用 Cloudflare Pages 构建安全的静态网站托管](/insights/cloudflare-pages-security/)一文中。

## 将站内信息明确作为上下文传递

对于这种规模的网站，不必一开始就引入向量数据库或 RAG。首先将已公开的网站信息要点整理成结构化内容并传入提示词，会让实现和运营都更轻量。

例如，可以在服务器端整理以下信息。

- 公司或服务的概要
- 各项服务的目标对象、咨询示例和相关 URL
- FAQ 中已有答案的内容
- 咨询表单、LINE、电子邮件和电话的使用场景
- AI 不得对价格、合同、交付期限等内容作出断言的范围
- 各 locale 对应的内部 URL

关键在于，不要让模型回答它「似乎知道的事情」，而是向它提供「本网站可以作答的信息」。

```ts
function buildPublicSiteContext(locale: Locale) {
  return {
    services: [
      {
        name: "Web制作",
        summary: "コーポレートサイト、採用サイト、LPの制作相談に対応",
        url: localizePath("/services/web-production/", locale),
      },
      {
        name: "サーバー運用",
        summary: "クラウド、VPS、監視、バックアップ設計の相談に対応",
        url: localizePath("/services/server-operations/", locale),
      },
    ],
    contact: {
      form: localizePath("/contact/", locale),
      line: "https://lin.ee/...",
      emailPolicy: "フォームが使えない場合や補足が必要な場合だけ案内する",
      phonePolicy: "急ぎの確認が必要な場合だけ案内する",
    },
  };
}
```

页面数量不多时，这种方式就足够了。随着页面数量、更新频率和搜索需求增加，可以考虑使用 Pagefind、CMS 的 JSON、D1、Vectorize 等工具添加搜索层。

## 提示词应写清规则，而非只关注回答措辞

在咨询 AI 聊天机器人的提示词中，与其要求模型写出自然流畅的文字，不如明确规定回答范围和禁止事项。

```txt
あなたはこのサイトの問い合わせ案内AIです。
公開済みサイト情報だけを根拠に回答してください。

ルール:
- 料金、契約、納期、保証を断定しない
- 詳細見積りや正式な相談は問い合わせフォームへ案内する
- 短い確認やSchoolsに関する相談はLINEも案内する
- メールと電話は、ユーザーが直接連絡を求めた場合だけ案内する
- 内部リンクは現在のlocaleに合うURLを使う
- わからない場合は、推測せずフォームへ案内する
```

AI 聊天机器人常见的问题是，模型为了让服务显得更好而作出断言。例如，对于「多少钱可以做」「最晚什么时候能交付」「一定能处理吗」这类问题，应限于一般性说明，并引导用户通过表单获取正式答复。

这不仅是法律层面的问题。因为在沟通需求之前，报价和交期无法确定。提示词应明确写出运营中能够负责的回答范围，而不是写一些对销售有利的回答。

## 区分咨询入口的职责

AI 聊天机器人不能替代表单。将咨询页面中的入口按以下方式区分，会更便于运营。

| 入口         | 作用                                               |
| ------------ | -------------------------------------------------- |
| FAQ          | 先在页面中解答常见疑问                             |
| AI 聊天      | 通过对话梳理服务选择、咨询对象和相关页面           |
| LINE         | 用于简短咨询、Schools 相关联系和简单确认           |
| 表单         | 用于报价、制作咨询、合作、招聘等需要留存记录的咨询 |
| 直接联系方式 | 仅在表单沟通后的补充联系或需要紧急确认时开放       |

让 AI 将[服务页面](/services/)等介绍性内容与[咨询页面](/contact/)中的具体受理入口连接起来，访客就不必自己重新寻找页面。

这种设计也适用于 BtoB 网站、制作公司网站、学校网站和 SaaS 的支持入口。与其让 AI 完成整个咨询，不如让它帮访客缩小下一步要查看的页面或要使用的联系方式范围，这样更容易落地。

## 不要破坏各 locale 对应的 URL

在多语言网站中，不仅回答语言要匹配，链接目标 URL 也需要与 locale 对应。

例如，如果用户在英文页面提问，回答也应使用英文，指向服务页面的链接也应使用 `/en/services/` 这类带 locale 的 URL。如果用户在日语页面提问，则应使用 `/services/`。

与其把这项处理交给提示词，不如通过服务器端的 URL 生成函数来确定。

```ts
function localizePath(path: string, locale: Locale) {
  if (locale === "ja") return path;
  return `/${locale}${path}`;
}
```

如果只有 AI 回答跳回日语 URL，多语言导航就会被破坏。多语言博客和翻译运营的基础整理在 [使用 Sveltia CMS 运营多语言博客的方法](/blog/copilot-translation-pipeline/)一文中。

## 加入 Origin 检查和速率限制

由于 `/api/ai-contact` 是公开 API，至少应加入 Origin 检查、输入长度限制、历史记录限制和速率限制。

Origin 检查会在存在 `Origin` 标头时，确认请求来源与 API 主机是否一致，以减少其他网站擅自调用的可能性。

```ts
function assertSameOrigin(request: Request) {
  const origin = request.headers.get("Origin");
  if (!origin) return;

  const requestUrl = new URL(request.url);
  const originUrl = new URL(origin);

  if (originUrl.host !== requestUrl.host) {
    throw new Response("Forbidden", { status: 403 });
  }
}
```

首先采用基于 IP 的简单速率限制也很有效。在 Cloudflare 环境中，可以使用 `CF-Connecting-IP`、`X-Forwarded-For`、`CF-Ray` 等来识别请求。

不过，内存中的速率限制无法跨多个 isolate 或重启实现持久限制。它可以作为小型网站的初期防护措施，但访问量增加时，使用 Cloudflare WAF、Turnstile、KV、D1、Durable Objects 等方案会更稳定。

内容更新侧的 CMS 设计另行整理在 [Sveltia CMS 集成指南](/blog/cms-selection-and-turnstile/)中。表单和评论的 bot 防护应作为 Turnstile 等独立层来处理。仅使用 Cloudflare 为 Astro 博客构建评论功能的设计，整理在[仅用 Cloudflare 为 Astro 博客添加评论功能的方法](/blog/cloudflare-only-blog-comments/)一文中。

## 使用允许列表渲染 Markdown 链接

允许 AI 回答中包含链接，可以方便地引导访客了解服务。但应避免将 Markdown 原样注入 HTML。

聊天 UI 只将允许的语法转换为 DOM。

- 段落
- 项目列表
- 粗体
- 行内代码
- Markdown 链接

还要进一步限制链接目标。

- `/services/` 这类同一网站内的路径
- 当前 origin
- `https://acecore.net`
- 官方 LINE
- 必要时使用的 `mailto:info@acecore.net`
- 必要时使用的 `tel:0120987370`

判定前务必先对 URL 执行 `trim()`。AI 有时会像 `[サービス一覧]( /services/ )` 这样，在 URL 前后带上空格。

```ts
function sanitizeHref(rawHref: string, currentOrigin: string) {
  const href = rawHref.trim();

  if (href.startsWith("/")) return href;
  if (href.startsWith(`${currentOrigin}/`)) return href;
  if (href.startsWith("https://acecore.net/")) return href;
  if (href.startsWith("https://lin.ee/")) return href;
  if (href === "mailto:info@acecore.net") return href;
  if (href === "tel:0120987370") return href;

  return null;
}
```

与其追求完整实现 Markdown 规范，不如仅支持聊天中实际使用的语法，并严格处理，这样更便于维护。即使要允许自由输出外部 URL，也至少应设置域名允许列表和 `rel="noopener noreferrer"`。

## 在本地、preview 和生产环境中检查的事项

仅在本地运行 Astro dev 或 preview，无法与 Cloudflare Pages Functions 的执行环境完全一致。没有 `OPENAI_API_KEY` 的环境无法生成 AI 回答，因此需要确认 UI 侧的备用处理和错误提示。

在 Pages preview 或生产环境中，请确认以下事项。

- `/api/ai-contact` 可以通过 POST 调用
- `OPENAI_API_KEY` 和 `OPENAI_MODEL` 已配置
- 可以拒绝 Origin 不同的请求
- 输入长度和历史记录条数受到限制
- 回答符合显示语言 locale
- 内部链接使用带 locale 的 URL
- AI 不会对报价或合同作出断言
- 电子邮件和电话不会始终显示
- Markdown 链接只会转换为安全的 URL

AI 集成并不是只要提问1次并收到回复就算完成。还要分别检查意料之外的问题、长文本、来自英语页面的问题、要求直接联系方式的问题和询问价格的问题。

## 日志和运营中应关注的指标

咨询 AI 聊天机器人发布后的日志检查也很重要。

至少应关注以下指标。

- API 错误率
- 触发速率限制的次数
- 每1次咨询的平均消息数
- 跳转至表单或 LINE 的次数
- AI 无法回答并引导至表单的次数
- 各 locale 的使用量

如果要保存对话内容，就需要预先决定如何处理个人信息。更安全的做法是先不保存正文，仅从事件数量和错误情况开始观察。

## 本文单独讨论的范围

本文只讨论咨询 AI 聊天机器人的技术设计。我们还实现了从服务页面向表单传递咨询对象的入口，并将其单独整理在[从服务 CTA 向咨询表单传递上下文的技术设计](/blog/service-cta-contact-prefill/)一文中。

这是因为两者讨论的问题不同。

- AI 聊天机器人：通过对话梳理访客的疑虑，并安全地引导他们
- 按服务区分的 CTA：将访客正在阅读的服务上下文传递到表单

前者涉及 AI、API 边界、提示词和安全渲染；后者涉及表单 UX 和入口设计。分开整理更易阅读，也便于之后添加内部链接。

## 总结

将咨询 AI 聊天机器人集成到静态网站时，比起聊天 UI，更应优先设计 API 边界和回答控制。

本次实现中特别有效的做法包括：

- 从 Cloudflare Pages Function 而非浏览器调用 OpenAI API
- 精简端点输入，并限制历史记录和字符数
- 在服务器端构建站内信息和按 locale 区分的 URL
- 在提示词中明确 AI 可以和不可以作出断言的内容
- 区分表单、LINE 和直接联系方式的作用
- 加入 Origin 检查和速率限制
- Markdown 链接先执行 trim，再通过允许列表方式渲染

静态网站也完全可以集成咨询 AI 聊天机器人。集成的重点不是让 AI 更醒目，而是帮助访客安全地选择下一步行动。
