---
title: "Sveltia CMS로 다국어 블로그를 운영하는 방법"
description: "일본어 정본으로 8개 언어 정적 페이지를 운영하는 방법. OpenAI Batch의 숫자·URL·코드 보호, 전체 검증 후 쓰기, 번역 PR·CI·GitHub 연계 공개를 설명합니다."
date: 2026-06-07T17:00
lastUpdated: "2026-10-15T00:00:00+09:00"
author: gui
tags: ["기술", "GitHub Copilot", "i18n", "CMS", "SEO"]
image: "/images/insights/covers/copilot-translation-pipeline-cover-v2.webp"
callout:
  type: tip
  title: UI 번역과 다국어 공개는 다릅니다
  text: "브라우저 번역이나 번역 위젯은 독자가 현재 페이지를 읽는 데 도움이 되지만, 언어별 URL, title, description, 내부 링크, RSS, sitemap, hreflang을 자동으로 만들지는 않습니다. 검색 엔진에 각 언어 페이지를 전달하려면 번역된 정적 HTML이 필요합니다."
processFigure:
  eyebrow: Translation Workflow
  title: "일본어 정본에서 검증된 번역 PR까지"
  description: "숫자·URL·코드를 원문에서 복원하고 전체 결과 검증 후 씁니다."
  variant: inline
  steps:
    - title: "일본어 편집"
      description: "최신 main을 확인하고 연속 편집을 모읍니다."
      icon: i-lucide-file-pen-line
      accent: brand
    - title: "보호 후 Batch 제출"
      description: "숫자·URL·placeholder·코드를 token화."
      icon: i-lucide-shield-check
      accent: amber
    - title: "전체 검증 후 쓰기"
      description: "sourceHash·token·내용을 대조하고 실패는 기록 후 중단."
      icon: i-lucide-languages
      accent: emerald
    - title: "PR·CI·운영 공개"
      description: "GitHub 연계로 공개하고 내용도 확인."
      icon: i-lucide-check-check
      accent: slate
compareTable:
  title: UI 번역과 언어별 페이지를 생성하는 번역 운영의 차이
  before:
    label: UI 번역
    items:
      - "사용자 브라우저나 번역 widget이 표시할 때 번역함"
      - "URL, title, description, OGP는 원문 언어로 남기 쉬움"
      - "sitemap, RSS, hreflang에 언어별 페이지로 출력하기 어려움"
      - "공유 URL과 검색 결과의 표시 문구가 원문 언어에 치우침"
  after:
    label: 정적 다국어 페이지
    items:
      - "`/{locale}/blog/{slug}/` 같은 언어별 URL을 공개할 수 있음"
      - "title, description, 본문, FAQ, 구조화 데이터를 언어별로 보유할 수 있음"
      - "hreflang으로 검색 엔진에 각 언어판의 대응 관계를 전달할 수 있음"
      - "RSS, sitemap, 내부 링크, Search Console 확인을 언어별로 처리할 수 있음"
checklist:
  title: 도입할 때 결정할 사항
  items:
    - text: "일본어 기사를 번역 원문으로 취급한다"
      checked: true
    - text: "번역 파일의 slug를 일본어 기사와 일치시킨다"
      checked: true
    - text: "main의 일본어 source 갱신으로 번역 시작"
      checked: true
    - text: "번역에서 URL, 이미지 path, 코드 블록, 태그 ID를 손상시키지 않는다"
      checked: true
    - text: "build에서 hreflang, canonical, RSS, sitemap 출력을 확인한다"
      checked: true
linkCards:
  - href: /ko/blog/cms-selection-and-turnstile/
    title: Sveltia CMS 도입 가이드
    description: Astro 정적 사이트에 Sveltia CMS를 도입한 구현 기록입니다.
    icon: i-lucide-badge-check
  - href: /ko/blog/astro-i18n-blog-translation/
    title: Astro 다국어 아키텍처
    description: 9개 언어, fallback, hreflang, RSS, sitemap 기반을 설명합니다.
    icon: i-lucide-globe-2
faq:
  title: 자주 묻는 질문
  items:
    - question: UI 번역만으로 충분하지 않나요?
      answer: "읽기 보조로는 충분할 수 있습니다. 하지만 SEO, RSS, sitemap, 내부 링크까지 언어별 자산으로 만들려면 실제 번역 페이지가 필요합니다."
    - question: AI 번역은 SEO에 불리한가요?
      answer: "AI 사용 자체가 문제가 아니라, 가치 없는 페이지를 대량으로 공개하는 것이 문제입니다. 용어, 사실, 링크, 자연스러움을 검토해야 합니다."
    - question: 번역 페이지는 중복 콘텐츠인가요?
      answer: "Google 문서에 따르면 본문이 번역되어 있다면 현지화 페이지가 단순 중복으로 취급되는 것은 아닙니다. hreflang으로 관계를 명확히 합니다."
---

다국어 블로그 운영은 대표 글의 번역 파일로 언어별 HTML을 생성해 본문, title, description, 내부 링크를 확인하는 것부터 시작하세요. [Google: Localized Versions](https://developers.google.com/search/docs/specialty/international/localized-versions)에 따라 실제 있는 언어판만 연결하고 번역 서비스 성공과 공개 페이지 완성을 따로 검수하세요.

> **2026년 10월 14일 확인:** 현재 번역 생성은 OpenAI Batch입니다. 아래 Copilot 절차는 2026년 6월 도입 기록으로 남깁니다. 현행 그림·운영은 원문 보호와 모든 결과 검증 후 쓰기로 갱신했습니다.

## 현행 번역 운영: 보호·검증·PR을 구분한다

Systems는 일본어 기사·UI의 main 갱신 후 15분 기다렸다가 최신 main으로 [제출 workflow](https://github.com/acecore-systems/acecore-systems/blob/main/.github/workflows/submit-openai-translation-batch.yml)를 실행합니다. [회수 workflow](https://github.com/acecore-systems/acecore-systems/blob/main/.github/workflows/collect-openai-translation-batch.yml)는 매시간 2·17·32·47분 예정이며 현재 sourceHash와 대조해 번역 PR을 만듭니다. [병합 workflow](https://github.com/acecore-systems/acecore-systems/blob/main/.github/workflows/merge-openai-translation-pr.yml)는 조건과 CI를 충족한 PR을 기존 GitHub 연계 공개로 보냅니다. 예정 시각·Batch 완료·병합·운영 공개는 별도 상태입니다.

제출 전 숫자·URL·기존 placeholder·inline code·fenced code를 고유 token으로 바꿉니다. 회수 때 일치하는 일본어 source에서 원문을 복원하고 token 누락·중복·변조·추가를 거부합니다. 모델의 세부 변경을 막는 보호이며 복원 후 검증과 내용 리뷰도 유지합니다.

[OpenAI Batch 문서](https://developers.openai.com/api/docs/guides/batch)는 반환 순서가 다를 수 있다고 설명하므로 `custom_id`로 언어·source path·sourceHash를 대조합니다. [보호·회수 수정](https://github.com/acecore-systems/acecore-systems/pull/131)은 Batch의 모든 결과를 검증한 뒤 쓰기를 시작합니다. 뒤쪽 오류·중복·오래된 source 때문에 앞쪽만 적용되는 상태를 막고 artifact에 언어·source path·Batch ID·원인을 남깁니다. 쓰기 중 디스크 장애까지 파일시스템 transaction으로 보장한다는 뜻은 아닙니다.

27개 자동화 테스트와 일본어 55 source × 8 locale, 440개 결과의 오프라인 보호·복원 왕복을 확인했습니다. 추가 모델 API로 전체 재번역한 실증은 아닙니다. 기존 번역 개정은 일본어와 같은 PR로 맞추고 정형 후 source hash를 갱신합니다. 번역 내용을 두고 hash만 맞추지 않습니다.

<figure class="article-diagram" data-layout="flow" data-tone="green" data-count="3" aria-labelledby="diagram-copilot-translation-pipeline">
  <figcaption>
    <strong id="diagram-copilot-translation-pipeline">보호한 원문과 전체 결과 대조</strong>
    <span>검증 실패로 일부 언어만 바꾸지 않습니다. Batch 완료는 공개 완료가 아닙니다.</span>
  </figcaption>
  <ol class="article-diagram__nodes">
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">1</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M5 3h10l4 4v14H5z"/><path d="M15 3v5h5M8 12h8M8 16h6"/></svg></span>
      <strong>원문 보호</strong>
      <span>숫자·URL·코드를 고유 token으로.</span>
    </li>
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">2</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5M8 10l2 2 3-4"/></svg></span>
      <strong>현재 source와 전체 검증</strong>
      <span>custom_id·sourceHash·token을 대조하고 복원.</span>
    </li>
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">3</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/></svg></span>
      <strong>번역 PR을 공개 경로로</strong>
      <span>검증 후 쓰고 CI·내용 리뷰를 거쳐 반영.</span>
    </li>
  </ol>
</figure>

## 2026년 6월 도입 기록

Acecore는 주로 일본어로 콘텐츠를 편집하지만, 블로그는 9개 언어로 공개합니다. 여기서 중요한 점은 **화면에서 번역해 보여주는 것**과 **언어별 페이지를 공개하는 것**이 다르다는 점입니다.

브라우저 번역이나 위젯은 독자가 지금 보고 있는 페이지를 이해하는 데 도움이 됩니다. 그러나 `/ko/blog/.../` 같은 URL, 언어별 메타 정보, RSS, sitemap, hreflang을 만들지는 않습니다.

검색 유입까지 고려한다면 번역은 UI 처리가 아니라 게시 전 콘텐츠 생성 과정으로 다뤄야 합니다.

## 기본 구조

- 일본어 원문: `src/content/blog/{slug}.md`
- 번역 파일: `src/content/blog/{locale}/{slug}.md`
- URL: `/blog/{slug}/`, `/en/blog/{slug}/`, `/ko/blog/{slug}/`
- 편집: Sveltia CMS
- 번역: GitHub Copilot PR
- 공개: build와 리뷰

Sveltia CMS는 일본어 source를 편집하는 화면입니다. 번역은 GitHub PR로 분리해 변경 이력과 리뷰, CI를 남깁니다.

## UI 번역이 맞는 경우

내부 확인, 일회성 열람, 관리 화면, 검색 유입을 목표로 하지 않는 페이지라면 UI 번역으로 충분할 수 있습니다.

이 방식은 가볍지만 번역 파일이 없으므로 검색 엔진이 직접 인덱싱할 언어별 페이지도 없습니다.

## 정적 다국어 페이지의 SEO 장점

검색 엔진, SNS 미리보기, RSS 리더는 URL과 HTML을 기준으로 정보를 봅니다.

일본어 페이지 하나만 있고 독자 브라우저가 번역하는 경우, `title`, `description`, 구조화 데이터, RSS, sitemap은 여전히 일본어 페이지 기준입니다.

정적 번역 페이지가 있으면 각 언어가 URL을 갖습니다.

```txt
/blog/copilot-translation-pipeline/
/en/blog/copilot-translation-pipeline/
/ko/blog/copilot-translation-pipeline/
/de/blog/copilot-translation-pipeline/
```

### 1. 각 언어 URL을 직접 크롤링할 수 있습니다

Google은 JavaScript를 처리할 수 있지만, 공식 문서에서는 JavaScript의 제한도 설명하며 정적 렌더링이나 서버 렌더링을 안정적인 선택지로 제시합니다. 다른 crawler나 RSS 리더까지 고려하면 초기 HTML에 번역문이 있는 편이 안전합니다.

### 2. 메타데이터를 번역할 수 있습니다

frontmatter도 언어별로 가질 수 있습니다.

```yaml
title: "Sveltia CMS로 다국어 블로그를 운영하는 방법"
description: "Sveltia CMS와 GitHub Copilot으로 번역 PR을 만드는 운영 방식"
```

검색 결과, OGP, 관련 글 카드, RSS에 모두 영향을 줍니다.

### 3. hreflang으로 언어 버전을 연결합니다

언어별 URL이 있을 때 Google은 `hreflang` 사용을 권장합니다. UI 번역만 있으면 연결할 언어별 URL이 없습니다.

### 4. RSS와 sitemap도 언어별로 만들 수 있습니다

번역 파일이 있으면 `/ko/rss.xml`과 sitemap의 언어별 URL을 생성할 수 있습니다.

## Sveltia CMS의 역할

Sveltia CMS는 번역 엔진이 아닙니다. 이 구성에서는 일본어 source 편집을 담당합니다.

- 일본어 블로그
- 저자 정보
- 태그 정의
- 일본어 source JSON
- 이미지
- date, FAQ, linkCards 같은 frontmatter

CMS 도입은 [Sveltia CMS 도입 가이드](/ko/blog/cms-selection-and-turnstile/)에서 설명합니다.

## Copilot 번역 규칙

번역 PR에는 유지할 값과 번역할 값을 명확히 전달해야 합니다.

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
- FAQ
- body text
- internal blog URLs when locale-specific URLs exist
```

## PR에서 얻은 교훈

- 구현은 Sveltia CMS인데 예전 글에는 Pages CMS 표현이 남아 있었습니다.
- `date`가 오래된 상태면 글을 다시 써도 블로그 첫 화면에 오르지 않습니다.
- 번역 제목은 바꿔도 slug는 유지해야 합니다.
- 내부 링크는 독자의 locale로 이어져야 합니다.
- AI 번역은 빠르지만 공개 전 리뷰가 필요합니다.

## 참고 링크

- [Google Search Central: Localized Versions of your Pages](https://developers.google.com/search/docs/advanced/crawling/localized-versions?hl=en&rd=1&visit_id=638856769088389068-716743185)
- [Google Search Central: Managing Multi-Regional and Multilingual Sites](https://developers.google.com/search/docs/advanced/crawling/managing-multi-regional-sites)
- [Google Search Central: JavaScript SEO Basics](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics)
- [Google Search Central: Spam Policies](https://developers.google.com/search/docs/essentials/spam-policies)
- [Sveltia CMS 도입 가이드](/ko/blog/cms-selection-and-turnstile/)

## 정리

UI 번역은 읽기 보조입니다. 정적 다국어 페이지는 각 언어를 사이트의 실제 콘텐츠로 만듭니다.

Sveltia CMS는 일본어를 편집하고, GitHub Copilot은 번역 PR을 만들고, Astro build는 배포 전 검증을 담당합니다.
