---
title: "如何让 Astro 博客支持 9 种语言——翻译、URL 和 hreflang 实现记录"
description: "本文记录了 Astro 博客支持 9 种语言的实现过程，分别说明截至 2026 年 7 月的配置与当前差异，涵盖使用 prefixDefaultLocale 设计 URL、翻译文件的放置、未翻译 locale 不生成文章 URL、sitemap 和 hreflang 的条件、通过 View 组件切换显示，以及 OG 图片、CMS 和 RSS 的注意事项，为考虑采用相同配置时提供决策依据。"
date: 2026-03-25T10:00
lastUpdated: "2026-10-25T06:10:55Z"
author: gui
tags: ["技术", "Astro", "i18n", "网站"]
image: "/images/insights/covers/astro-i18n-blog-translation-cover-v2.webp"
processFigure:
  title: 多语言化流程
  steps:
    - title: 构建 i18n 基础
      description: 配置 Astro 内置的 i18n 路由和翻译工具。
      icon: i-lucide-globe
    - title: 翻译 UI 文本
      description: 将页眉、页脚及所有组件的显示文本多语言化。
      icon: i-lucide-languages
    - title: 翻译博客文章
      description: 首次实施时生成 21 篇文章 × 8 种语言＝168 个翻译文件。
      icon: i-lucide-file-text
    - title: CMS 与构建验证
      description: 实现 Pages CMS 多语言支持并验证所有页面的构建。
      icon: i-lucide-check-circle
compareTable:
  title: 多语言化前后对比
  before:
    label: 仅日语
    items:
      - 仅日语 1 种语言
      - 博客文章 23 篇
      - 生成 523 个页面（UI 多语言化后）
      - Pages CMS 中有 1 个博客集合
      - 标签和作者数据仅有日语
      - RSS 订阅源 1 个
  after:
    label: 支持 9 种语言（首次引入时）
    items:
      - 日语 + 8 种语言（en, zh-cn, es, pt, fr, ko, de, ru）
      - 博客文章 23 篇 + 翻译 168 篇 = 191 篇
      - 生成 621 个页面（首次引入时）
      - Pages CMS 中按语言划分的 9 个集合
      - 将 25 种标签和作者数据翻译为各语言
      - 多语言 RSS 订阅源（9 种语言）
callout:
  type: info
  title: 支持的语言
  text: "支持日语（默认）、英语、简体中文、西班牙语、葡萄牙语、法语、韩语、德语和俄语，共 9 种语言。"
statBar:
  items:
    - value: "9"
      label: 支持的语言数量
    - value: "208"
      label: 翻译文章数量（截至 2026 年 7 月 29 日）
    - value: "652"
      label: 生成页面数量（截至 2026 年 7 月 29 日）
faq:
  title: 常见问题
  items:
    - question: 为什么选择 9 种语言？
      answer: "为了最大限度地扩大全球覆盖范围，我们涵盖了世界主要语言区。英语、中文、西班牙语和葡萄牙语覆盖了大部分互联网用户，法语、德语、俄语和韩语则补充了其他主要市场。"
    - question: 如何保证翻译质量？
      answer: "我们使用 GitHub Copilot 进行 AI 翻译。先以英语作为中间语言，再从英语翻译为各语言，以减少翻译质量的差异。frontmatter 的标签值保留日语，URL、代码块和图片路径保持不变。这是截至 2026 年 7 月的方式。目前的翻译生成使用 OpenAI Batch。"
    - question: 如果翻译文章不存在，会发生什么？
      answer: "没有翻译文件的 locale 不会生成文章 URL。日语版继续通过原 URL 发布，切换语言时则跳转到目标 locale 的博客列表。"
    - question: 添加新文章时也必须翻译吗？
      answer: "发布日语版不要求必须提供翻译。如需添加翻译，只需在对应语言目录中放置同名 Markdown 文件，该语言的文章 URL、sitemap 和 hreflang 就会被纳入生成范围。"
---

这是一份实现记录，面向希望使用 Astro 将日语博客多语言化，并可靠地维护翻译文章 URL、语言切换、sitemap 和 hreflang 的读者。首先选取代表性文章，配齐正文、元信息和语言切换，并确认不会将用户引导至未翻译的页面。请以 [Astro: Internationalization Routing](https://docs.astro.build/en/guides/internationalization/) 为 URL 设计依据，将 UI 翻译与文章翻译分开，逐步扩展。下文的数量和旧 CMS 配置是引入时的实例。

> **2026 年 9 月 26 日补充：**正文中的 Astro 7.1.3、文章数量和 Copilot 翻译是截至 2026 年 7 月的记录。[当前依赖声明](https://github.com/acecore-systems/acecore-net/blob/main/package.json)使用 Astro ^7.3.3 和 Tailwind CSS 4.3.3，翻译工作流程已整理在[更新至 OpenAI Batch 的文章](/insights/copilot-translation-pipeline/)中。在将以下实现示例或数值作为当前配置使用之前，请先确认当前源代码和公开页面。

## 截至 2026 年 7 月的实现记录

我们将 Acecore 官方网站从仅支持日语升级为支持 9 种语言。首次实施时翻译了 21 篇博客文章 × 8 种语言＝168 篇；截至 2026 年 7 月 29 日，共有日语文章 29 篇、翻译文章 208 篇，合计 237 篇，构建输出为 652 个页面。未添加翻译的 locale 不生成文章 URL，只发布实际存在的语言版本。

## 多语言化方针与 URL 设计

多语言化分阶段覆盖了以下 3 个范围。

1. **构建 i18n 基础**：Astro 内置 i18n 路由配置、翻译工具及 9 种语言的翻译 JSON 文件
2. **翻译 UI 文本**：页眉、页脚、侧边栏及所有页面的组件文本
3. **翻译博客文章**：首次实施时将 21 篇文章翻译为 8 种语言（生成 168 个文件）

### URL 设计

采用 Astro 的 `prefixDefaultLocale: false`，日语直接位于根路径下（`/blog/...`），其他语言则通过带前缀的路径提供（如 `/en/blog/...`、`/zh-cn/blog/...`）。

```
# 日本語（デフォルト）
/blog/astro-performance-tuning/

# 英語
/en/blog/astro-performance-tuning/

# 簡体字中国語
/zh-cn/blog/astro-performance-tuning/
```

所有语言使用相同的 slug，因此切换语言时的 URL 对应关系很简单。

为了持续开展翻译工作而使用的 Copilot 自动化，已整理在[如何使用 Sveltia CMS 运营多语言博客](/insights/copilot-translation-pipeline/)中。

## 配置 Astro 的 i18n 基础

### Astro 的 i18n 配置

在 `astro.config.mjs` 中配置 i18n 路由。

```javascript
// astro.config.mjs
export default defineConfig({
  i18n: {
    defaultLocale: "ja",
    locales: ["ja", "en", "zh-cn", "es", "pt", "fr", "ko", "de", "ru"],
    routing: {
      prefixDefaultLocale: false,
    },
  },
});
```

### 翻译工具

我们将配置文件、工具函数和翻译 JSON 集中放在 `src/i18n/` 中。

```typescript
// src/i18n/utils.ts
export function t(locale: Locale, key: string): string {
  return translations[locale]?.[key] ?? translations[defaultLocale][key] ?? key;
}
```

各语言的翻译文件以 JSON 格式放在 `src/i18n/locales/` 中，管理导航、页脚、博客 UI、元信息等约 100 个键。

### View 组件模式

页面实现采用 **View 组件模式**。将布局和逻辑集中在 `src/views/` 中，路由文件（`src/pages/`）则作为只负责传递 locale 的轻量包装层。

```astro
---
// src/pages/[locale]/about.astro（ルートファイル）
import AboutPage from "../../views/AboutPage.astro";
const { locale } = Astro.params;
---

<AboutPage locale={locale} />
```

通过这种设计，日语路由（`/about`）和多语言路由（`/en/about`）之间的逻辑重复为零。

## 按语言目录翻译博客文章

### 目录结构

翻译文章放在以语言代码命名的子目录中。Astro 的 glob 加载器使用 `**/*.md` 模式自动递归查找。Astro 的 [Content Loader API](https://docs.astro.build/en/reference/content-loader-reference/) 说明，可以在 `glob()` 加载器的 `pattern` 中指定类似 `**/*.md` 的 globstar，从目录加载 Markdown 等文件。

```
src/content/blog/
  astro-performance-tuning.md          # 日本語（ベース）
  website-renewal.md
  en/
    astro-performance-tuning.md        # 英語版
    website-renewal.md
  zh-cn/
    astro-performance-tuning.md        # 簡体字中国語版
    website-renewal.md
  es/
    ...
```

### 内容解析工具

我们在 `src/utils/blog-i18n.ts` 中实现了 3 个函数。

```typescript
// ベース記事かどうかを判定（IDにスラッシュが無い = ベース）
export function isBasePost(post: CollectionEntry<"blog">): boolean {
  return !post.id.includes("/");
}

// IDからロケールプレフィックスを除去してベーススラッグを取得
export function getBaseSlug(postId: string): string {
  const idx = postId.indexOf("/");
  return idx !== -1 ? postId.slice(idx + 1) : postId;
}

// ベース記事のローカライズ版を取得（無ければ原文にフォールバック）
export function localizePost(
  post: CollectionEntry<"blog">,
  allPosts: CollectionEntry<"blog">[],
  locale: Locale,
): CollectionEntry<"blog"> {
  if (locale === defaultLocale) return post;
  return allPosts.find((p) => p.id === `${locale}/${post.id}`) ?? post;
}
```

`localizePost()` 本身会作为安全措施返回原文，但公开路由和列表通过 `isPostAvailableInLocale()` 与过滤器只处理实际存在的翻译，因此不会生成未翻译 locale 的文章 URL。

重点是**不修改现有内容集合的 schema**。Astro 的 glob 加载器会自动以类似 `en/astro-performance-tuning` 的 ID 识别子目录中的文件，因此无需更改配置。

### 翻译文件规则

翻译文件按以下规则生成。

- **frontmatter 的键**保留英文（如 `title`、`description`、`date`）
- **标签值**保留日语（如 `['技術', 'Astro']`）
- **URL、图片路径、代码块和 HTML**保持不变
- **日期和作者**保持不变
- 翻译**正文和 frontmatter 的文本值**（title、description、callout、FAQ 等）

### 翻译工作流程

翻译流程如下。

1. **创建英文版作为中间语言**：将日语原文翻译为英语
2. **从英文版翻译为各语言**：以英语为起点扩展至 7 种语言
3. **批量处理**：使用 GitHub Copilot，每批处理 5～6 篇文章

通过日语→英语→各语言的 2 阶段翻译，减少翻译质量的差异。与直接从日语翻译为各语言相比，以英语作为中间语言获得了更稳定的质量。

<figure class="article-diagram" data-layout="branches" data-tone="teal" data-count="3" aria-labelledby="diagram-astro-i18n-blog-translation">
  <figcaption>
    <strong id="diagram-astro-i18n-blog-translation">将翻译与最新日语源文件核对后发布</strong>
    <span>公开 URL 和供搜索使用的引用与实际存在的翻译文件保持一致。</span>
  </figcaption>
  <ol class="article-diagram__nodes">
    <li>
      <span class="article-diagram__symbol">
        <span aria-hidden="true">1</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M6 3h8l4 4v14H6z M14 3v5h5 M9 12h6 M9 16h6"/></svg>
      </span>
      <strong>更新日语源文件</strong>
      <span>确认日语源文件的变更，先确定受影响的语言版本及需要重新检查的文章范围。</span>
    </li>
    <li>
      <span class="article-diagram__symbol">
        <span aria-hidden="true">2</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z M3 12h18 M12 3a14 14 0 0 1 0 18 M12 3a14 14 0 0 0 0 18"/></svg>
      </span>
      <strong>核对各 locale 的翻译</strong>
      <span>检查 title、description 和正文，只生成与现有翻译文件对应的 locale URL。</span>
    </li>
    <li>
      <span class="article-diagram__symbol">
        <span aria-hidden="true">3</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M6 3h8l4 4v14H6z M14 3v5h5 M8 16l8-8"/></svg>
      </span>
      <strong>没有翻译文件时</strong>
      <span>不生成该 locale 的 URL、sitemap 和 hreflang，也不自动发布未翻译页面。</span>
    </li>
  </ol>
</figure>

## View 组件的多语言支持

### BlogPostPage 的实现

在博客文章页面中，通过 `localizePost()` 获取对应 locale 的内容，并赋值给模板变量。

```astro
---
// src/views/BlogPostPage.astro
const localizedPost = localizePost(basePost, allPosts, locale);
const post = localizedPost; // テンプレートの既存参照がそのまま動く
---
```

通过这种方法，无需更改模板中对 `post.data.title` 和 `post.body` 的引用，即可实现多语言支持。

### 列表页面的支持

在博客列表、标签列表、作者列表和归档页面中，使用 `isBasePost()` 筛选出基础文章，显示时再通过 `localizePost()` 替换为翻译版本。

```astro
---
const allPosts = await getCollection("blog");
const basePosts = allPosts.filter(isBasePost);
const displayPosts = basePosts.map((p) => localizePost(p, allPosts, locale));
---
```

## 构建时遇到的 YAML 和 OG 图片问题

### YAML frontmatter 的转义

法语翻译中的撇号（如 `l'atelier`、`qu'on`）与 YAML 单引号发生冲突。

```yaml
# NG：YAML パースエラー
title: 'Le métavers est plus proche qu'on ne le pense'

# OK：ダブルクォートに変更
title: "Le métavers est plus proche qu'on ne le pense"
```

我们使用 Node.js 脚本批量修复了所有文件。英语中的 `Acecore's` 等也有类似问题，因此生成翻译文件时需要注意引号类型。

### OG 图片路由的过滤

`/blog/og/[slug].png.ts` 也匹配到了翻译文章的 slug（如 `en/aceserver-hijacked`），导致参数错误。通过 `isBasePost()` 过滤后解决了问题。

```typescript
export const getStaticPaths: GetStaticPaths = async () => {
  const allPosts = await getCollection("blog");
  const posts = allPosts.filter(isBasePost);
  return posts.map((post) => ({
    params: { slug: post.id },
    props: { title: post.data.title },
  }));
};
```

## Pages CMS 的多语言支持

由于 Pages CMS（`.pages.yml`）仅处理 `path` 指定目录下的直接文件，我们将翻译子目录分别注册为独立集合。

```yaml
content:
  - name: blog
    label: ブログ（日本語）
    path: src/content/blog
  - name: blog-en
    label: Blog（English）
    path: src/content/blog/en
  - name: blog-zh-cn
    label: 博客（简体中文）
    path: src/content/blog/zh-cn
  # ... 各言語ごとに設定
```

通过使用各语言编写标签，可以在 CMS 中一眼看出每个集合对应的语言。

## 语言切换 UI

我们在页眉中添加了 `LanguageSwitcher` 组件，实现同时适用于桌面端和移动端的语言切换 UI。切换语言时跳转至同一页面对应的 locale；首次访问时则检测浏览器的 `navigator.language` 并自动重定向。

## 标签的多语言显示

文章标签在 URL 中继续使用日语 slug，**仅翻译显示名称**。这样既能避免路由变得复杂，也能让用户以母语看到标签。

标签定义集中在 `src/content/tags/{tagId}.json` 中，每个标签都具有 `i18n.name`。这样可以将标签翻译的唯一可信来源从翻译 JSON 转移到标签集合。

```json
{
  "id": "technology",
  "name": "技術",
  "i18n": {
    "en": { "name": "Technology" },
    "fr": { "name": "Technologie" }
  }
}
```

文章卡片、侧边栏、标签列表和文章详情均引用 tags collection 切换显示名称，所有标签显示都统一使用对应 locale 的语言。

## 作者数据的多语言支持

我们还引入了按语言切换作者姓名、个人简介（bio）和技能列表的机制。在 `src/content/authors/{authorId}.json` 中添加 `i18n` 字段，保存各语言的翻译。

```json
{
  "id": "hatt",
  "name": "ハット",
  "bio": "代表取締役。Web制作・サーバー運用…",
  "skills": ["TypeScript", "Astro", "..."],
  "i18n": {
    "en": {
      "name": "Hatt",
      "bio": "CEO and representative director. Web development...",
      "skills": ["TypeScript", "Astro", "..."]
    }
  }
}
```

使用 `getLocalizedAuthor()` 工具获取对应 locale 的作者信息。

```typescript
// src/utils/blog-i18n.ts
export function getLocalizedAuthor(author: Author, locale: Locale) {
  const localized = author.i18n?.[locale];
  return localized ? { ...author, ...localized } : author;
}
```

## 多语言 SEO 的实现

为了最大化多语言化的 SEO 效益，我们配置了让搜索引擎正确识别和索引各语言版本的机制。

### 站点地图的 hreflang 支持

我们配置了 `@astrojs/sitemap` 的 `i18n` 选项，以及检查翻译文件是否存在的过滤器。站点地图只收录实际存在的语言版本，并自动输出对应的 `xhtml:link rel="alternate"` 标签。

```javascript
// astro.config.mjs
sitemap({
  filter(page) {
    return !isMissingLocalizedBlogPost(page);
  },
  i18n: {
    defaultLocale: "ja",
    locales: {
      ja: "ja",
      en: "en",
      "zh-cn": "zh-CN",
      es: "es",
      pt: "pt",
      fr: "fr",
      ko: "ko",
      de: "de",
      ru: "ru",
    },
  },
});
```

对于 9 种语言版本全部存在的文章，会输出 9 种语言的 hreflang。没有翻译的文章只收录日语 URL，不会在 sitemap 或 hreflang 中包含不存在的语言版本。

### JSON-LD 结构化数据的语言支持

我们在博客文章的 `BlogPosting` 结构化数据中添加 `inLanguage` 字段，告知搜索引擎各篇文章使用的语言。

```javascript
// BlogPostPage.astro（JSON-LD 抜粋）
{
  "@type": "BlogPosting",
  "inLanguage": htmlLangMap[locale],  // "ja", "en", "zh-CN" など
  "headline": post.data.title,
  // ...
}
```

### 多语言 RSS 订阅源

除了日语版的 `/rss.xml`，我们还生成各语言的 RSS 订阅源（如 `/en/rss.xml`、`/zh-cn/rss.xml`）。订阅源的标题和描述也翻译为各语言，并通过 `<language>` 标签输出符合 BCP47 的语言代码。

```typescript
// src/pages/[locale]/rss.xml.ts
export const getStaticPaths = () =>
  locales
    .filter((l) => l !== defaultLocale)
    .map((l) => ({ params: { locale: l } }));
```

`BaseLayout.astro` 的 `<link rel="alternate" type="application/rss+xml">` 也会根据 locale 自动设置 RSS URL。

## 总结

在截至 2026 年 7 月的实现中，通过利用 Astro 7.1.3 内置的 i18n 功能，静态网站也实现了多语言支持。

- **i18n 基础**：使用 Astro 的 `prefixDefaultLocale: false`，日语不带前缀
- **UI 翻译**：通过 View 组件模式实现零逻辑重复
- **内容翻译**：采用子目录方式，无需修改现有 schema
- **标签翻译**：URL 保留日语 slug，仅将显示名称翻译为各语言
- **作者数据翻译**：按语言切换 bio 和 skills
- **SEO 措施**：站点地图 hreflang、JSON-LD `inLanguage` 和多语言 RSS 订阅源
- **未翻译的 locale**：不生成文章 URL，日语版继续通过原 URL 发布
- **CMS 支持**：可在 Pages CMS 中分别编辑各语言的文章

今后添加新文章时，也会陆续添加翻译文件。在翻译完成前只发布日语版，并在添加翻译文件的 locale 中启用文章 URL、sitemap 和 hreflang。

## 2026 年 10 月 6 日补充：认证界面的语言与错误

除了翻译公开文章，认证界面也需要一致的语言选择。在经过匿名化处理的改造中，我们依次选择受支持的 `ui_locales`、`Accept-Language` 和默认语言，并为不受支持的值提供安全的回退机制。已知的 OIDC 错误会转换为统一的显示文本，即使遇到未知错误，也不会显示未经处理的内部消息。

我们会一并检查页面标签、通过 API 返回的错误以及注册完成后的提示。博客支持 9 种语言，并不意味着所有认证界面和实际注册路径都已完成验收。

登录、账户管理、授权同意和一次性验证码流程也会继承语言设置，并在跳转过程中保留 OIDC 的 locale 和 state。我们会区分已结合 URL、Content-Language 和窄屏显示进行检查的范围，与所有语言的用户验收。
