---
title: "用 Sveltia CMS 运营多语言博客的方法"
description: "以日语正本生成8种语言静态页面，说明OpenAI Batch对数字、URL、代码的保护、全部结果验证后写入、翻译PR、CI及GitHub关联发布。"
date: 2026-06-07T17:00
lastUpdated: "2026-10-15T00:00:00+09:00"
author: gui
tags: ["技术", "GitHub Copilot", "i18n", "CMS", "SEO"]
image: "/images/insights/covers/copilot-translation-pipeline-cover-v2.webp"
callout:
  type: tip
  title: 界面翻译和多语言发布不是一回事
  text: "浏览器翻译或翻译插件可以帮助读者阅读当前页面，但不会自动生成语言专用 URL、title、description、内部链接、RSS、sitemap 或 hreflang。若希望搜索引擎把各语言当作独立页面理解，就需要发布翻译后的静态 HTML。"
processFigure:
  eyebrow: Translation Workflow
  title: "从日语正本到验证后的翻译PR"
  description: "从原文恢复数字、URL、代码，验证全部结果后才写入。"
  variant: inline
  steps:
    - title: "编辑日语"
      description: "检查最新main并合并连续编辑。"
      icon: i-lucide-file-pen-line
      accent: brand
    - title: "保护后提交Batch"
      description: "将数字、URL、placeholder、代码token化。"
      icon: i-lucide-shield-check
      accent: amber
    - title: "全量验证后写入"
      description: "核对sourceHash、token及内容，失败记录后停止。"
      icon: i-lucide-languages
      accent: emerald
    - title: "PR、CI和生产发布"
      description: "通过GitHub关联发布并检查内容。"
      icon: i-lucide-check-check
      accent: slate
compareTable:
  title: UI翻译与生成语言专属页面的翻译流程之间的区别
  before:
    label: UI翻译
    items:
      - "由用户浏览器或翻译widget在显示时翻译"
      - "URL、title、description和OGP容易保持原语言"
      - "难以在sitemap、RSS和hreflang中作为语言专属页面输出"
      - "共享URL与搜索结果的显示文案会偏向原语言"
  after:
    label: 静态多语言页面
    items:
      - "可以用 `/{locale}/blog/{slug}/` 等形式发布语言专属URL"
      - "title、description、正文、FAQ和结构化数据都可按语言保存"
      - "可通过hreflang向搜索引擎传达各语言版本的对应关系"
      - "可按语言处理RSS、sitemap、内部链接与Search Console检查"
checklist:
  title: 导入时需要决定的事项
  items:
    - text: "将日语文章作为翻译源"
      checked: true
    - text: "使翻译文件的slug与日语文章一致"
      checked: true
    - text: "以main上的日语source更新触发翻译"
      checked: true
    - text: "翻译时不得破坏URL、图片path、代码块和标签ID"
      checked: true
    - text: "通过build检查hreflang、canonical、RSS和sitemap输出"
      checked: true
linkCards:
  - href: /zh-cn/blog/cms-selection-and-turnstile/
    title: Sveltia CMS 导入指南
    description: 在 Astro 静态网站中导入 Sveltia CMS 的实现记录。
    icon: i-lucide-badge-check
  - href: /zh-cn/blog/astro-i18n-blog-translation/
    title: Astro 多语言架构
    description: 9种语言、fallback、hreflang、RSS 和 sitemap 的基础设计。
    icon: i-lucide-globe-2
faq:
  title: 常见问题
  items:
    - question: 只用界面翻译不够吗？
      answer: "如果只是帮助读者临时阅读，它很有用。但如果要把各语言作为搜索结果、分享链接、RSS 和 sitemap 中的正式资产，就需要语言专用 URL 和静态 HTML。"
    - question: AI 翻译会影响 SEO 吗？
      answer: "问题不在于是否使用 AI，而在于是否发布了没有用户价值的大量页面。术语、事实、链接和自然度都需要审核。"
    - question: 翻译页面会被视为重复内容吗？
      answer: "Google 的说明是，主要内容已经翻译的本地化页面不会仅因为内容对应就成为重复页面。应保持 slug 对应，并通过 hreflang 表示关系。"
---

开始多语言博客流程时，先用代表文章的翻译文件生成各语言HTML，检查正文、title、description和内部链接。按照[Google: Localized Versions](https://developers.google.com/search/docs/specialty/international/localized-versions)仅关联存在的语言版本，并将翻译服务成功与公开页面完成分别验收。

> **2026年10月14日确认：** 当前翻译使用OpenAI Batch。以下Copilot步骤保留为2026年6月的导入记录。现行图和流程已更新为保护原文、验证全部结果后再写入。

## 现行翻译：分别处理保护、验证和PR

Systems的main更新日语文章或UI后，等待15分钟，再由[提交workflow](https://github.com/acecore-systems/acecore-systems/blob/main/.github/workflows/submit-openai-translation-batch.yml)读取最新main。[回收workflow](https://github.com/acecore-systems/acecore-systems/blob/main/.github/workflows/collect-openai-translation-batch.yml)计划每小时第2、17、32、47分钟执行，核对当前sourceHash并创建翻译PR。[合并workflow](https://github.com/acecore-systems/acecore-systems/blob/main/.github/workflows/merge-openai-translation-pr.yml)将满足条件的PR经过CI交给现有GitHub关联发布。计划时刻、Batch完成、PR合并和生产发布是不同状态。

发送前将数字、URL、现有placeholder、inline code和fenced code替换成唯一token。回收时从匹配的日语source恢复原文，拒绝token缺失、重复、改写或增加。保护用于避免模型改动这些细节，恢复后的验证和内容审查仍然必要。

[OpenAI Batch文档](https://developers.openai.com/api/docs/guides/batch)说明输出顺序可能不同，因此通过`custom_id`匹配语言、source path和sourceHash。[保护与回收改修](https://github.com/acecore-systems/acecore-systems/pull/131)验证Batch内全部结果后才开始写入。后半的不合格、重复或旧source结果不会使前半翻译已被部分应用。失败artifact记录语言、source path、Batch ID和原因。这不等于对写入期间磁盘故障的文件系统事务保证。

改修验证了27项自动化测试，以及55个日语source × 8个locale、共440结果的离线保护恢复往返。这不是新增模型API调用的全量重译。现有译文与日语在同一PR改订，再更新格式化后的source hash；不能只对齐hash而不改译文。

<figure class="article-diagram" data-layout="flow" data-tone="green" data-count="3" aria-labelledby="diagram-copilot-translation-pipeline">
  <figcaption>
    <strong id="diagram-copilot-translation-pipeline">核对受保护原文和全部结果</strong>
    <span>验证失败不能只改部分语言；Batch完成不代表发布完成。</span>
  </figcaption>
  <ol class="article-diagram__nodes">
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">1</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M5 3h10l4 4v14H5z"/><path d="M15 3v5h5M8 12h8M8 16h6"/></svg></span>
      <strong>保护原文</strong>
      <span>数字、URL、代码使用唯一token。</span>
    </li>
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">2</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5M8 10l2 2 3-4"/></svg></span>
      <strong>验证当前source和全部结果</strong>
      <span>匹配custom_id、sourceHash、token并恢复。</span>
    </li>
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">3</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/></svg></span>
      <strong>PR进入发布流程</strong>
      <span>验证后写入，再经过CI与内容检查。</span>
    </li>
  </ol>
</figure>

## 2026 年 6 月的实施记录

Acecore 的内容编辑以日语为中心，但博客面向9种语言发布。这里最容易混淆的是：**在界面上把文字翻译出来**，和 **把各语言页面作为网站内容发布出来**，是两件事。

浏览器翻译、扩展或翻译小组件适合帮助读者理解当前页面。但它们不会自动生成 `/en/blog/.../` 或 `/zh-cn/blog/.../` 这样的 URL，也不会生成对应语言的 `title`、`description`、结构化数据、RSS、sitemap 或 hreflang。

因此，如果多语言博客的目标包含搜索流入，翻译应该作为发布前的内容生成流程来处理。

## 基本方针

这个站点采用以下结构。

- 日语源文章: `src/content/blog/{slug}.md`
- 翻译文章: `src/content/blog/{locale}/{slug}.md`
- URL: `/blog/{slug}/`, `/en/blog/{slug}/`, `/zh-cn/blog/{slug}/` 等
- 编辑入口: Sveltia CMS
- 翻译作业: GitHub Copilot 的 PR
- 发布条件: Astro build 和审核通过

Sveltia CMS 负责编辑日语 source。翻译不在 CMS 里逐项手动维护，而是交给 GitHub 上的 PR 流程。

## 界面翻译适合的场景

界面翻译不是坏方案。以下场景完全可以使用。

- 内部阅读
- 临时浏览
- 管理画面或帮助页面的辅助阅读
- 不以搜索流量为目标的页面
- 不需要管理翻译质量的内容

这种模式的翻译发生在读者环境中，网站并不保存翻译文件。因此很轻量，但也不会形成可被搜索引擎直接抓取的多语言内容资产。

## 为什么静态多语言页面更适合 SEO

搜索引擎、SNS 预览、RSS 阅读器和外部索引服务看到的基本单位是 URL 和 HTML。

如果只有日语 URL，英文只是浏览器翻译出来的，那么搜索结果中的 URL、title、description、结构化数据和 RSS item 仍然会偏向日语。

静态生成翻译页面后，每种语言都可以拥有自己的页面。

```txt
/blog/copilot-translation-pipeline/
/en/blog/copilot-translation-pipeline/
/zh-cn/blog/copilot-translation-pipeline/
/es/blog/copilot-translation-pipeline/
```

这样可以带来几个好处。

### 1. 搜索引擎可以直接抓取各语言 URL

Google 可以处理 JavaScript，但官方文档也说明 JavaScript 存在限制，并推荐静态渲染或服务器端渲染作为更稳定的方案。把翻译后的正文放入初始 HTML，更适合 Google 之外的 crawler、RSS 和链接预览。

### 2. 元信息可以按语言优化

翻译 Markdown 不只翻译正文，也翻译 frontmatter。

```yaml
title: "用 Sveltia CMS 运营多语言博客的方法"
description: "用 Sveltia CMS 和 GitHub Copilot 生成翻译 PR 的实践流程。"
```

这会影响搜索结果、OGP、相关文章卡片和 RSS。

### 3. 可以输出 hreflang

当各语言有不同 URL 时，Google 建议使用 `hreflang` 表示语言版本的对应关系。只有界面翻译时，并不存在可对应的英文或中文 URL。

### 4. RSS 和 sitemap 可以语言化

翻译文件存在后，可以输出 `/zh-cn/rss.xml` 这样的 feed，并在 sitemap 中包含语言专用 URL。这比只有一个日语 feed 更适合长期运营。

## Sveltia CMS 的角色

Sveltia CMS 不是翻译引擎。这里它负责的是日语 source 的编辑体验。

CMS 中主要处理：

- 日语博客
- 作者信息
- 标签定义
- 日本语 source JSON
- 图片上传
- date、FAQ、linkCards 等 frontmatter

CMS 具体导入方法请看 [Sveltia CMS 导入指南](/zh-cn/blog/cms-selection-and-turnstile/)。

## 翻译 PR 的规则

Copilot 翻译任务必须明确哪些内容可以翻译、哪些不能改。

```md
Keep:

- slug
- image path
- author id
- tag ids
- external URLs
- code blocks

Localize:

- title
- description
- callout
- FAQ
- body text
- internal blog URLs when locale-specific URLs exist
```

Markdown 中混合了正文、URL、代码、图片和 frontmatter。规则不明确时，最容易破坏内部链接或分类。

## 实际 PR 中得到的教训

这次更新中有几个值得记录的反省点。

- 实现已经迁移到 Sveltia CMS，但旧文章仍然写着 Pages CMS。
- 文章全面改写后，如果 `date` 还是旧日期，就不会出现在博客首页。
- 翻译标题可以变化，但 slug 必须与日语 source 保持一致。
- 翻译后的内部链接不能总是回到日语 URL。
- AI 翻译需要审核，避免只生成没有价值的大量页面。

## 参考链接

- [Google Search Central: Localized Versions of your Pages](https://developers.google.com/search/docs/advanced/crawling/localized-versions?hl=en&rd=1&visit_id=638856769088389068-716743185)
- [Google Search Central: Managing Multi-Regional and Multilingual Sites](https://developers.google.com/search/docs/advanced/crawling/managing-multi-regional-sites)
- [Google Search Central: JavaScript SEO Basics](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics)
- [Google Search Central: Spam Policies](https://developers.google.com/search/docs/essentials/spam-policies)
- [Sveltia CMS 导入指南](/zh-cn/blog/cms-selection-and-turnstile/)

## 总结

界面翻译适合帮助读者临时理解页面。

但如果希望多语言内容成为搜索引擎、RSS、sitemap、内部链接和 SNS 预览中的正式资产，就应该生成语言专用的静态页面。

Sveltia CMS 负责日语 source，GitHub Copilot 负责翻译 PR，Astro build 负责验证。这种分工可以让编辑界面保持简单，同时让搜索引擎看到清晰的多语言结构。
