---
title: "Cloudflare만으로 Astro 블로그 댓글 기능 만들기"
description: "외부 댓글 서비스를 쓰지 않고 Cloudflare Pages Functions, D1, Turnstile, Wrangler 설정만으로 Astro 블로그 댓글 기능을 구현한 기록입니다."
date: 2026-06-07T18:00
author: gui
tags: ["기술", "Cloudflare", "Astro", "보안", "웹사이트"]
image: /uploads/acecore-generated/blog-cloudflare-pages-security.webp
callout:
  type: tip
  title: 외부 댓글 서비스 없이 구현
  text: "Astro 정적 사이트도 자체 댓글 기능을 가질 수 있습니다. Pages Functions가 API 경계를 만들고, D1이 데이터를 저장하고, Turnstile이 제출을 보호하며, Wrangler가 환경별 binding을 관리합니다."
processFigure:
  eyebrow: Cloudflare Comments
  title: Cloudflare만으로 만드는 댓글 기능 구성
  description: "Astro가 UI를 렌더링하고 Cloudflare Pages Functions가 API 경계가 되며, D1과 Turnstile을 Cloudflare 내부 구성 요소로 연결합니다."
  variant: inline
  steps:
    - title: Astro에 UI 배치
      description: "기사 상세 아래에 댓글 목록, 게시 폼, Turnstile widget을 배치합니다."
      icon: i-lucide-message-square-text
      accent: brand
    - title: Pages Function에서 수신
      description: "`/api/comments`가 GET/POST/OPTIONS를 처리하고 입력 검증과 CORS를 담당합니다."
      icon: i-lucide-cloud
      accent: slate
    - title: D1에 저장
      description: "`COMMENTS_DB` binding으로 SQLite 호환 D1에 댓글, hash, 생성 시각을 저장합니다."
      icon: i-lucide-database
      accent: emerald
    - title: Turnstile로 보호
      description: "Cloudflare Turnstile token을 server-side validation하고 hostname allowlist도 확인합니다."
      icon: i-lucide-shield-check
      accent: amber
compareTable:
  title: 외부 댓글 서비스와 Cloudflare 자체 구현의 차이
  before:
    label: 외부 댓글 서비스
    items:
      - "도입은 빠르지만 UI, 데이터 저장소, 약관, 표시 속도를 서비스에 의존함"
      - "외부 script나 iframe이 기사 페이지 로딩에 영향을 주기 쉬움"
      - "다국어 UI와 사이트 디자인의 통일에 제약이 생기기 쉬움"
      - "댓글 데이터 처리, 삭제, 이전이 서비스 사양에 의존함"
  after:
    label: Cloudflare만으로 구현
    items:
      - "Pages Functions, D1, Turnstile만으로 API와 저장소를 구성할 수 있음"
      - "Astro의 HTML/CSS로 사이트 디자인에 자연스럽게 맞출 수 있음"
      - "Wrangler 설정에서 D1 binding과 Cloudflare 측 DB 이름을 맞출 수 있음"
      - "스팸 대책, 삭제, 저장할 개인정보 범위를 직접 결정할 수 있음"
checklist:
  title: 구현 전에 결정할 사항
  items:
    - text: "댓글을 외부 서비스에 맡기지 않고 자체 Cloudflare 구성에서 관리한다"
      checked: true
    - text: "저장소는 D1, API 경계는 Cloudflare Pages Functions로 한다"
      checked: true
    - text: "Turnstile token은 반드시 server-side validation한다"
      checked: true
    - text: "URL, 이메일, HTML, Markdown 링크, 홍보 문구를 게시 전에 거부한다"
      checked: true
    - text: "D1 database 이름과 COMMENTS_DB binding을 Cloudflare 측과 맞춘다"
      checked: true
linkCards:
  - href: /ko/insights/cloudflare-pages-security/
    title: Cloudflare Pages 보안 설정
    description: 정적 사이트 배포와 보안 header 설정입니다.
    icon: i-lucide-shield
  - href: /ko/blog/cms-selection-and-turnstile/
    title: Sveltia CMS 도입 가이드
    description: CMS와 Cloudflare 구성 요소를 다룬 글입니다.
    icon: i-lucide-badge-check
  - href: /ko/blog/astro-ai-contact-chat/
    title: Astro 문의 AI 채팅
    description: Pages Functions로 API 경계를 만든 다른 예시입니다.
    icon: i-lucide-bot
faq:
  title: 자주 묻는 질문
  items:
    - question: 왜 외부 댓글 서비스를 쓰지 않았나요?
      answer: "외부 서비스는 빠르지만 UI, 데이터, script 로딩, 삭제와 이전이 서비스에 의존합니다. 이번 구현은 사이트와 Cloudflare 안에 통제권을 둡니다."
    - question: D1로 충분한가요?
      answer: "post_slug 조회, created_at 정렬, deleted_at soft delete, 중복 검사, rate limit에는 D1이 잘 맞습니다."
    - question: Turnstile을 프런트에만 두면 되나요?
      answer: "아니요. Pages Function에서 Siteverify로 token을 검증한 뒤 D1에 저장해야 합니다."
---

정적 사이트에 댓글을 넣으면 상태 저장과 spam 대책이 필요해집니다.

Acecore는 외부 댓글 SaaS나 widget을 쓰지 않았습니다. [PR #101](https://github.com/acecore-systems/acecore-net/pull/101)에서 Cloudflare 안의 기능만으로 구현했습니다.

- Astro가 UI를 렌더링합니다.
- Cloudflare Pages Functions가 `/api/comments`를 제공합니다.
- Cloudflare D1이 댓글을 저장합니다.
- Cloudflare Turnstile이 POST를 보호합니다.
- `wrangler.jsonc`가 `COMMENTS_DB` binding을 정의합니다.

핵심은 댓글 영역이 페이지 안의 외부 서비스가 아니라, 기존 Cloudflare 구성의 일부라는 점입니다.

## 구조

| 계층      | 파일 또는 서비스                           |
| --------- | ------------------------------------------ |
| UI        | `src/components/BlogComments.astro`        |
| 기사 배치 | `src/views/BlogPostPage.astro`             |
| API       | `functions/api/comments.ts`                |
| 저장소    | D1 binding `COMMENTS_DB`                   |
| 보호      | Cloudflare Turnstile                       |
| schema    | `migrations/0001_create_blog_comments.sql` |

UI는 `GET /api/comments?slug=...&locale=...`로 읽고, `POST /api/comments`로 제출합니다.

Function은 origin, payload, Turnstile, rate limit, 중복, 금지 내용을 검증한 뒤 저장합니다.

## D1을 선택한 이유

댓글은 기사별 조회, 시간순 정렬, soft delete, 중복 검사, client별 제한이 필요합니다. SQL로 표현하기 쉬운 작업입니다.

보이는 댓글은 `deleted_at IS NULL`인 행입니다. spam은 물리 삭제하지 않고 `deleted_at`만 채워 숨길 수 있습니다.

쿼리는 prepared statement와 `bind()`를 사용해 사용자 입력을 SQL 문자열에 직접 붙이지 않습니다.

## Wrangler로 환경을 나누기

`COMMENTS_DB`는 `wrangler.jsonc`에 정의하며, 단일 D1 database인 `acecore-comments`를 가리킵니다.

binding 이름은 유지하고 Cloudflare dashboard와 repository의 database 이름을 맞춥니다.

## Turnstile은 서버에서 검증

브라우저의 widget만으로는 부족합니다.

Pages Function이 token을 Cloudflare Siteverify로 보내고, 성공한 경우에만 저장합니다. 반환된 hostname도 allowlist와 비교합니다.

## spam 대책

첫 버전은 엄격합니다.

- URL 금지
- 이메일 주소 금지
- HTML 금지
- Markdown 링크 금지
- 과도한 반복 문자 금지
- 홍보성 단어 금지
- honeypot 사용

또한 메모리 rate limit과 D1 기반 rate limit을 함께 둡니다. IP는 원문 저장 대신 salt를 섞은 hash로 사용합니다.

## SEO

댓글은 클라이언트에서 읽고, 영역에는 `data-pagefind-ignore`를 붙였습니다. 따라서 댓글은 본문 검색 index에 들어가지 않습니다.

기업 블로그에서는 본문과 댓글의 역할을 분리하는 편이 안전합니다.

## 정리

외부 댓글 서비스는 편하지만 필수는 아닙니다.

Cloudflare Pages를 쓰는 사이트라면 Pages Functions, D1, Turnstile, Wrangler만으로 가벼운 댓글 기능을 만들 수 있습니다.

## 참고

- [Cloudflare Pages: Configuration](https://developers.cloudflare.com/pages/functions/wrangler-configuration/)
- [Cloudflare Pages Functions: Bindings](https://developers.cloudflare.com/pages/functions/bindings/)
- [Cloudflare D1: Prepared statement methods](https://developers.cloudflare.com/d1/worker-api/prepared-statements/)
- [Cloudflare D1: Wrangler commands](https://developers.cloudflare.com/d1/wrangler-commands/)
- [Cloudflare Turnstile: Server-side validation](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/)
- [Cloudflare Turnstile: Any Hostname](https://developers.cloudflare.com/turnstile/additional-configuration/hostname-management/any-hostname/)
- [PR #101: Cloudflare 댓글 기능](https://github.com/acecore-systems/acecore-net/pull/101)
