---
title: "Astro 블로그를 9개 언어로 지원하는 방법 ― 번역·URL·hreflang 구현 기록"
description: "Astro 블로그를 9개 언어로 제공한 구현 기록입니다. prefixDefaultLocale을 이용한 URL 설계, 번역 파일 배치, 번역되지 않은 로케일의 글 URL·sitemap·hreflang을 생성하지 않는 조건, View 컴포넌트를 이용한 표시 전환, OG 이미지·CMS·RSS의 주의점을 2026년 7월 기준 구성과 현재의 차이로 나누어 설명하고, 같은 구성을 검토할 때 참고할 판단 기준을 제시합니다."
date: 2026-03-25T10:00
lastUpdated: "2026-10-25T06:10:55Z"
author: gui
tags: ["기술", "Astro", "i18n", "웹사이트"]
image: "/images/insights/covers/astro-i18n-blog-translation-cover-v2.webp"
processFigure:
  title: 다국어 지원 과정
  steps:
    - title: i18n 기반 구축
      description: Astro의 내장 i18n 라우팅과 번역 유틸리티를 정비합니다.
      icon: i-lucide-globe
    - title: UI 텍스트 번역
      description: 헤더·푸터·모든 컴포넌트의 표시 텍스트를 다국어로 제공합니다.
      icon: i-lucide-languages
    - title: 블로그 글 번역
      description: 최초 도입 시 글 21개 × 8개 언어 = 번역 파일 168개를 생성했습니다.
      icon: i-lucide-file-text
    - title: CMS·빌드 검증
      description: Pages CMS의 다국어 지원과 전체 페이지의 빌드를 검증합니다.
      icon: i-lucide-check-circle
compareTable:
  title: 다국어 지원 전후 비교
  before:
    label: 일본어만 지원
    items:
      - 일본어 1개 언어만 지원
      - 블로그 글 23개
      - 523개 페이지 생성（UI 다국어화 후）
      - Pages CMS에 블로그 컬렉션 1개
      - 태그·저자 데이터는 일본어만 지원
      - RSS 피드 1개
  after:
    label: 9개 언어 지원（최초 도입 시）
    items:
      - 일본어 + 8개 언어（en, zh-cn, es, pt, fr, ko, de, ru）
      - 블로그 글 23개 + 번역 168개 = 191개
      - 621개 페이지 생성（최초 도입 시）
      - Pages CMS에 언어별 컬렉션 9개
      - 태그 25종·저자 데이터를 각 언어로 번역
      - 다국어 RSS 피드（9개 언어）
callout:
  type: info
  title: 지원 언어
  text: "일본어（기본）·영어·중국어 간체·스페인어·포르투갈어·프랑스어·한국어·독일어·러시아어의 9개 언어를 지원합니다."
statBar:
  items:
    - value: "9"
      label: 지원 언어 수
    - value: "208"
      label: 번역 글 수（2026년 7월 29일 기준）
    - value: "652"
      label: 생성 페이지 수（2026년 7월 29일 기준）
faq:
  title: 자주 묻는 질문
  items:
    - question: 왜 9개 언어를 선택했나요?
      answer: "글로벌 도달 범위를 극대화하기 위해 세계 주요 언어권을 포괄했습니다. 영어·중국어·스페인어·포르투갈어로 인터넷 인구의 대부분을 포괄하고, 프랑스어·독일어·러시아어·한국어로 나머지 주요 시장을 보완합니다."
    - question: 번역 품질은 어떻게 보장하나요?
      answer: "GitHub Copilot을 이용한 AI 번역을 채택했습니다. 영어 버전을 중간 언어로 작성하고 이를 각 언어로 번역하여 품질 편차를 줄였습니다. 프런트매터의 태그 값은 일본어로 유지하고 URL·코드 블록·이미지 경로는 변경하지 않는 방침입니다. 이는 2026년 7월 기준 방식입니다. 현재 번역 생성에는 OpenAI Batch를 사용합니다."
    - question: 번역 글이 없는 경우에는 어떻게 되나요?
      answer: "번역 파일이 없는 로케일의 글 URL은 생성하지 않습니다. 일본어 버전은 원래 URL에서 계속 공개하며, 언어를 전환하면 해당 로케일의 블로그 목록으로 이동합니다."
    - question: 새 글을 추가하면 번역도 필요한가요?
      answer: "일본어 버전을 공개할 때 번역은 필수가 아닙니다. 번역을 추가하려면 해당 언어 디렉터리에 같은 이름의 Markdown 파일을 배치하면 됩니다. 그러면 해당 언어의 글 URL·sitemap·hreflang이 생성 대상이 됩니다."
---

Astro에서 일본어 블로그를 다국어로 제공하면서 번역 글의 URL, 언어 전환, sitemap과 hreflang을 문제없이 운영하려는 분들을 위한 구현 기록입니다. 먼저 대표 글의 본문·메타 정보·언어 전환을 갖추고, 번역되지 않은 페이지로 안내하지 않는지 확인합니다. [Astro: Internationalization Routing](https://docs.astro.build/en/guides/internationalization/)을 URL 설계 기준으로 삼고, UI 번역과 글 번역을 분리해 단계적으로 늘려가세요. 아래의 건수와 이전 CMS 구성은 도입 당시의 사례입니다.

> **2026년 9월 26일 추가:** 본문의 Astro 7.1.3, 글 수, Copilot 번역은 2026년 7월 기준 기록입니다. [현재 의존성 선언](https://github.com/acecore-systems/acecore-net/blob/main/package.json)은 Astro ^7.3.3과 Tailwind CSS 4.3.3이며, 번역 운영은 [OpenAI Batch 업데이트 글](/insights/copilot-translation-pipeline/)에 정리했습니다. 아래의 구현 예와 수치를 현재 설정으로 사용하기 전에 최신 소스와 공개 페이지를 확인하세요.

## 2026년 7월 기준 구현 기록

Acecore 공식 사이트를 일본어만 지원하던 상태에서 9개 언어를 지원하도록 업그레이드했습니다. 최초 도입 시 블로그 글 21개 × 8개 언어 = 168개를 번역했으며, 2026년 7월 29일 기준으로 일본어 글 29개·번역 208개로 총 237개이며, 빌드 출력은 652개 페이지입니다. 번역이 아직 추가되지 않은 로케일에는 글 URL을 생성하지 않고, 실제로 존재하는 언어 버전만 공개합니다.

## 다국어 지원 방침과 URL 설계

다국어 지원을 위해 다음 3가지 범위를 단계적으로 처리했습니다.

1. **i18n 기반 구축**: Astro의 내장 i18n 라우팅 설정, 번역 유틸리티, 9개 언어의 번역 JSON 파일
2. **UI 텍스트 번역**: 헤더·푸터·사이드바·전체 페이지의 컴포넌트 텍스트
3. **블로그 글 번역**: 최초 도입 시 글 21개를 8개 언어로 번역（파일 168개 생성）

### URL 설계

Astro의 `prefixDefaultLocale: false`를 채택하여 일본어는 루트 바로 아래（`/blog/...`）에서, 다른 언어는 접두사를 붙여（`/en/blog/...`, `/zh-cn/blog/...` 등） 제공합니다.

```
# 日本語（デフォルト）
/blog/astro-performance-tuning/

# 英語
/en/blog/astro-performance-tuning/

# 簡体字中国語
/zh-cn/blog/astro-performance-tuning/
```

모든 언어에서 같은 슬러그를 사용하므로 언어 전환 시 URL 대응이 간단합니다.

번역 운영을 지속하기 위한 Copilot 자동화는 [Sveltia CMS로 다국어 블로그를 운영하는 방법](/insights/copilot-translation-pipeline/)에 정리했습니다.

## Astro의 i18n 기반 설정하기

### Astro의 i18n 설정

`astro.config.mjs`에 i18n 라우팅을 설정합니다.

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

### 번역 유틸리티

`src/i18n/`에 설정 파일·유틸리티 함수·번역 JSON을 모았습니다.

```typescript
// src/i18n/utils.ts
export function t(locale: Locale, key: string): string {
  return translations[locale]?.[key] ?? translations[defaultLocale][key] ?? key;
}
```

각 언어의 번역 파일은 JSON 형식으로 `src/i18n/locales/`에 배치합니다. 내비게이션, 푸터, 블로그 UI, 메타 정보 등 약 100개 키를 관리합니다.

### View 컴포넌트 패턴

페이지 구현에는 **View 컴포넌트 패턴**을 채택했습니다. 레이아웃과 로직을 `src/views/`에 모으고, 라우트 파일（`src/pages/`）은 locale만 전달하는 얇은 래퍼로 만듭니다.

```astro
---
// src/pages/[locale]/about.astro（ルートファイル）
import AboutPage from "../../views/AboutPage.astro";
const { locale } = Astro.params;
---

<AboutPage locale={locale} />
```

이 설계로 일본어용 라우트（`/about`）와 다국어 라우트（`/en/about`） 간의 로직 중복이 사라집니다.

## 블로그 글을 언어별 디렉터리에서 번역하기

### 디렉터리 구조

번역 글은 언어 코드의 하위 디렉터리에 배치합니다. Astro의 glob 로더가 `**/*.md` 패턴으로 자동 재귀 탐색합니다. Astro의 [Content Loader API](https://docs.astro.build/en/reference/content-loader-reference/)에서는 `glob()` 로더의 `pattern`에 `**/*.md` 같은 globstar를 지정할 수 있으며, 디렉터리에서 Markdown 등을 읽어올 수 있다고 설명합니다.

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

### 콘텐츠 해석 유틸리티

`src/utils/blog-i18n.ts`에 3개 함수를 구현했습니다.

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

`localizePost()` 자체는 안전장치로 원문을 반환하지만, 공개 라우트와 목록은 `isPostAvailableInLocale()`와 필터를 이용해 실제로 존재하는 번역만 대상으로 삼으므로 번역되지 않은 로케일의 글 URL은 생성되지 않습니다.

핵심은 **기존 콘텐츠 컬렉션 스키마를 변경하지 않는 것**입니다. Astro의 glob 로더가 하위 디렉터리의 파일을 `en/astro-performance-tuning` 같은 ID로 자동 인식하므로 설정을 변경할 필요가 없었습니다.

### 번역 파일 규칙

번역 파일은 다음 규칙에 따라 생성했습니다.

- **프런트매터 키**는 영어로 유지（`title`, `description`, `date` 등）
- **태그 값**은 일본어로 유지（`['技術', 'Astro']` 등）
- **URL·이미지 경로·코드 블록·HTML**은 변경하지 않음
- **날짜·저자**는 변경하지 않음
- **본문과 프런트매터의 텍스트 값**（title, description, callout, FAQ 등）을 번역

### 번역 워크플로

번역 과정은 다음과 같습니다.

1. **중간 언어로 영어 버전 작성**: 일본어 원문을 영어로 번역
2. **영어 버전에서 각 언어로 번역**: 영어를 기준으로 7개 언어로 확장
3. **일괄 배치 처리**: GitHub Copilot으로 글 5~6개씩 배치 처리

일본어→영어→각 언어의 2단계 번역으로 번역 품질의 편차를 줄였습니다. 일본어에서 각 언어로 직접 번역하는 것보다 영어라는 중간 언어를 거치는 편이 더 안정적인 품질을 얻을 수 있었습니다.

<figure class="article-diagram" data-layout="branches" data-tone="teal" data-count="3" aria-labelledby="diagram-astro-i18n-blog-translation">
  <figcaption>
    <strong id="diagram-astro-i18n-blog-translation">번역을 최신 일본어 소스와 대조한 후 공개</strong>
    <span>공개 URL과 검색용 참조는 실제로 존재하는 번역 파일에 맞춥니다.</span>
  </figcaption>
  <ol class="article-diagram__nodes">
    <li>
      <span class="article-diagram__symbol">
        <span aria-hidden="true">1</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M6 3h8l4 4v14H6z M14 3v5h5 M9 12h6 M9 16h6"/></svg>
      </span>
      <strong>일본어 소스 업데이트</strong>
      <span>일본어 소스의 변경 사항을 확인하고, 영향을 받는 언어 버전과 다시 확인해야 할 글의 범위를 먼저 파악합니다.</span>
    </li>
    <li>
      <span class="article-diagram__symbol">
        <span aria-hidden="true">2</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z M3 12h18 M12 3a14 14 0 0 1 0 18 M12 3a14 14 0 0 0 0 18"/></svg>
      </span>
      <strong>각 로케일의 번역 대조</strong>
      <span>title·description·본문을 확인하고, 존재하는 번역 파일에 대응하는 로케일 URL만 생성합니다.</span>
    </li>
    <li>
      <span class="article-diagram__symbol">
        <span aria-hidden="true">3</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M6 3h8l4 4v14H6z M14 3v5h5 M8 16l8-8"/></svg>
      </span>
      <strong>번역 파일이 없는 경우</strong>
      <span>해당 로케일의 URL·sitemap·hreflang은 만들지 않습니다. 번역되지 않은 페이지를 자동으로 공개하지 않습니다.</span>
    </li>
  </ol>
</figure>

## View 컴포넌트의 다국어 지원

### BlogPostPage 구현

블로그 글 페이지에서는 `localizePost()`로 로케일별 콘텐츠를 가져와 템플릿 변수에 할당합니다.

```astro
---
// src/views/BlogPostPage.astro
const localizedPost = localizePost(basePost, allPosts, locale);
const post = localizedPost; // テンプレートの既存参照がそのまま動く
---
```

이 접근 방식으로 템플릿 내의 `post.data.title` 및 `post.body` 참조를 전혀 변경하지 않고 다국어를 지원할 수 있었습니다.

### 목록 페이지 대응

블로그 목록·태그 목록·저자 목록·아카이브 페이지에서는 `isBasePost()`로 기본 글만 필터링하고, 표시할 때 `localizePost()`으로 번역 버전으로 교체합니다.

```astro
---
const allPosts = await getCollection("blog");
const basePosts = allPosts.filter(isBasePost);
const displayPosts = basePosts.map((p) => localizePost(p, allPosts, locale));
---
```

## 빌드 시 발생한 YAML과 OG 이미지 문제

### YAML 프런트매터 이스케이프

프랑스어 번역에서 아포스트로피（`l'atelier`, `qu'on` 등）가 YAML의 작은따옴표와 충돌하는 문제가 발생했습니다.

```yaml
# NG：YAML パースエラー
title: 'Le métavers est plus proche qu'on ne le pense'

# OK：ダブルクォートに変更
title: "Le métavers est plus proche qu'on ne le pense"
```

Node.js 스크립트로 전체 파일을 일괄 수정했습니다. 영어의 `Acecore's` 등도 같은 문제가 있으므로 번역 파일을 생성할 때 따옴표 종류에 주의해야 합니다.

### OG 이미지 라우트 필터링

`/blog/og/[slug].png.ts`가 번역 글의 슬러그（`en/aceserver-hijacked` 등）도 수집해 파라미터 오류가 발생했습니다. `isBasePost()`로 필터링하여 해결했습니다.

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

## Pages CMS의 다국어 지원

Pages CMS（`.pages.yml`）는 `path`로 지정한 디렉터리 바로 아래의 파일만 대상으로 하므로, 번역용 하위 디렉터리를 개별 컬렉션으로 등록했습니다.

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

레이블을 각 언어로 표기하여 CMS에서 어떤 컬렉션이 어떤 언어인지 한눈에 알아볼 수 있도록 했습니다.

## 언어 전환 UI

헤더에 `LanguageSwitcher` 컴포넌트를 추가하여 데스크톱과 모바일을 모두 지원하는 언어 전환 UI를 구현했습니다. 언어를 전환하면 같은 페이지의 해당 로케일로 이동하고, 최초 방문 시에는 브라우저의 `navigator.language`를 감지해 자동 리디렉션하는 방식입니다.

## 태그의 다국어 표시

글의 태그는 URL에서 일본어 슬러그를 그대로 사용하고 **표시 이름만 번역**하는 방식을 채택했습니다. 이를 통해 라우팅이 복잡해지는 것을 피하면서 사용자에게는 모국어로 태그를 표시합니다.

태그 정의는 `src/content/tags/{tagId}.json`에 모으고, 각 태그가 `i18n.name`를 갖도록 구성했습니다. 이를 통해 태그 번역의 단일 기준을 번역 JSON이 아닌 태그 컬렉션 쪽에 둘 수 있습니다.

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

글 카드·사이드바·태그 목록·글 상세에서는 tags 컬렉션을 참조해 표시 이름을 전환하며, 모든 태그가 로케일에 맞는 언어로 통일되어 표시됩니다.

## 저자 데이터의 다국어 지원

저자 이름, 자기소개（bio）, 스킬 목록도 언어별로 전환하는 기능을 도입했습니다. `src/content/authors/{authorId}.json`에 `i18n` 필드를 추가해 각 언어의 번역을 보관합니다.

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

`getLocalizedAuthor()` 유틸리티로 로케일에 맞는 저자 정보를 가져옵니다.

```typescript
// src/utils/blog-i18n.ts
export function getLocalizedAuthor(author: Author, locale: Locale) {
  const localized = author.i18n?.[locale];
  return localized ? { ...author, ...localized } : author;
}
```

## 다국어 SEO 구현

다국어 지원의 SEO 이점을 극대화하기 위해 검색 엔진이 각 언어 버전을 올바르게 인식하고 색인할 수 있는 기능을 마련했습니다.

### 사이트맵의 hreflang 지원

`@astrojs/sitemap`의 `i18n` 옵션과 번역 파일의 존재 여부를 확인하는 필터를 설정했습니다. 사이트맵에는 실제로 존재하는 언어 버전만 수록하고, 해당 `xhtml:link rel="alternate"` 태그를 자동 출력합니다.

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

9개 언어가 모두 존재하는 글에는 9개 언어의 hreflang이 출력됩니다. 번역이 없는 글은 일본어 URL만 수록하며, 존재하지 않는 언어 버전은 sitemap이나 hreflang에 포함하지 않습니다.

### JSON-LD 구조화 데이터의 언어 지원

블로그 글의 `BlogPosting` 구조화 데이터에 `inLanguage` 필드를 추가해 각 글이 어떤 언어로 작성되었는지 검색 엔진에 알립니다.

```javascript
// BlogPostPage.astro（JSON-LD 抜粋）
{
  "@type": "BlogPosting",
  "inLanguage": htmlLangMap[locale],  // "ja", "en", "zh-CN" など
  "headline": post.data.title,
  // ...
}
```

### 다국어 RSS 피드

일본어 버전의 `/rss.xml` 외에도 각 언어 버전의 RSS 피드（`/en/rss.xml`, `/zh-cn/rss.xml` 등）를 생성합니다. 피드의 제목과 설명도 각 언어로 번역하고, `<language>` 태그로 BCP47을 준수하는 언어 코드를 출력합니다.

```typescript
// src/pages/[locale]/rss.xml.ts
export const getStaticPaths = () =>
  locales
    .filter((l) => l !== defaultLocale)
    .map((l) => ({ params: { locale: l } }));
```

`BaseLayout.astro`의 `<link rel="alternate" type="application/rss+xml">`도 로케일에 맞는 RSS URL을 자동 설정합니다.

## 정리

2026년 7월 기준 구현에서는 Astro 7.1.3의 내장 i18n 기능을 활용해 정적 사이트에서도 다국어 지원을 실현했습니다.

- **i18n 기반**: Astro의 `prefixDefaultLocale: false`로 일본어에는 접두사를 붙이지 않음
- **UI 번역**: View 컴포넌트 패턴으로 로직 중복 제거
- **콘텐츠 번역**: 하위 디렉터리 방식으로 기존 스키마 변경 없음
- **태그 번역**: URL은 일본어 슬러그를 유지하고 표시 이름만 각 언어로 번역
- **저자 데이터 번역**: bio·skills를 언어별로 전환
- **SEO 대책**: 사이트맵 hreflang·JSON-LD `inLanguage`·다국어 RSS 피드
- **번역되지 않은 로케일**: 글 URL을 생성하지 않고 일본어 버전은 원래 URL에서 계속 공개
- **CMS 지원**: Pages CMS에서 각 언어의 글을 개별적으로 편집 가능

앞으로는 새 글을 추가할 때 번역 파일도 순차적으로 추가할 계획입니다. 번역이 완료될 때까지는 일본어 버전만 공개하고, 번역 파일을 추가한 로케일부터 글 URL·sitemap·hreflang을 활성화합니다.

## 2026년 10월 6일 추가: 인증 화면의 언어와 오류

공개 글의 번역뿐 아니라 인증 화면에도 일관된 언어 선택이 필요합니다. 익명화한 개선 작업에서는 지원되는 `ui_locales`, `Accept-Language`, 기본 언어 순으로 선택하고, 지원되지 않는 값에는 안전한 폴백을 마련했습니다. 알려진 OIDC 오류는 공통 표시 문구로 변환하며, 알 수 없는 오류에서도 내부 메시지를 그대로 표시하지 않습니다.

페이지 레이블, API를 통해 전달되는 오류, 가입 완료 후 안내를 함께 확인합니다. 블로그의 9개 언어 지원만으로 모든 인증 화면과 실제 가입 경로의 인수 검증이 완료되었다고 간주하지 않습니다.

로그인, 계정 관리, 동의, 일회용 코드에서도 언어 설정을 이어받고, 전환 중에 OIDC의 locale과 state를 유지합니다. URL, Content-Language, 좁은 화면의 표시를 함께 확인한 범위와 모든 언어의 사용자 인수 검증은 구분합니다.
