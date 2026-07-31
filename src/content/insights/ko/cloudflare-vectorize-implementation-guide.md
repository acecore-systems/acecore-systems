---
title: "Cloudflare Vectorize와 RAG 입문: 검색과 AI 답변의 차이 이해하기"
description: "Cloudflare Vectorize를 이용한 의미 검색과 RAG를 짧게 소개하고, 검색·근거·AI 답변의 역할을 구분해 설명합니다."
date: 2026-07-31T12:00
author: gui
tags: ["기술", "Cloudflare", "Vectorize", "RAG", "사이트 검색"]
image: /uploads/acecore-generated/blog-cloudflare-pages-security.webp
callout:
  type: tip
  title: "RAG는 ‘검색한 뒤 답하는’ 방식입니다"
  text: "Vectorize는 의미가 가까운 공개 정보를 찾고, RAG는 선택한 정보를 근거로 AI가 답변을 구성합니다. Vectorize만으로도, 답변 AI만으로도 RAG가 되지는 않습니다."
processFigure:
  eyebrow: RAG의 기본
  title: "질문을 근거 있는 답변으로 연결하는 네 단계"
  description: "검색 결과 자체는 답변이 아닙니다. 원래 공개 페이지를 가져온 뒤 답변의 맥락으로 사용합니다."
  variant: inline
  steps:
    - title: 공개 정보를 준비한다
      description: "독자에게 보여도 되는 페이지만 검색 대상에 넣습니다."
      icon: i-lucide-file-check-2
      accent: slate
    - title: 질문을 의미로 검색한다
      description: "질문을 embedding으로 바꾸고 Vectorize에서 가까운 정보를 찾습니다."
      icon: i-lucide-search
      accent: brand
    - title: 근거를 고른다
      description: "원본 페이지, URL, 최신 상태를 확인하고 답변에 쓸 정보만 고릅니다."
      icon: i-lucide-list-checks
      accent: amber
    - title: 답하거나 보류한다
      description: "근거가 충분할 때만 AI가 답하고, 부족하면 확인할 수 없다고 알립니다."
      icon: i-lucide-message-square-text
      accent: emerald
linkCards:
  - href: /insights/cloudflare-vectorize-safe-implementation/
    title: Vectorize를 안전하게 구현하는 상세 가이드
    description: "공개 HTML corpus, 차등 동기화, Preview／Production 분리, API 경계를 구현할 때 읽는 글입니다."
    icon: i-lucide-wrench
  - href: https://developers.cloudflare.com/vectorize/
    title: Cloudflare Vectorize 공식 문서
    description: "Vectorize의 용도, embedding, 검색에 관한 공식 설명을 확인할 수 있습니다."
    icon: i-lucide-book-open
  - href: https://developers.cloudflare.com/vectorize/reference/what-is-a-vector-database/
    title: Cloudflare의 RAG와 벡터 데이터베이스 해설
    description: "벡터 검색으로 가져온 맥락을 LLM prompt에 더하는 RAG의 흐름을 확인할 수 있습니다."
    icon: i-lucide-network
---

## 먼저 RAG란?

RAG는 **Retrieval Augmented Generation**의 약자입니다. 쉽게 말하면 관련 정보를 먼저 검색하고, AI가 그 정보를 사용해 답변을 만드는 방식입니다.

Vectorize는 의미가 가까운 자료를 찾는 사서의 목록처럼 생각할 수 있습니다. RAG는 그 목록에서 자료를 찾고, 선택한 원문을 읽고, 출처를 보여 주며 답하는 사서의 전체 업무입니다.

질문을 바로 AI 모델에 보내는 대신, 먼저 자신의 공개 정보에서 관련 자료를 가져와 맥락으로 더합니다. Cloudflare는 벡터 검색 맥락을 LLM에 보내는 prompt에 더하는 방식을 RAG로 설명합니다. [Cloudflare 공식 설명](https://developers.cloudflare.com/vectorize/reference/what-is-a-vector-database/)

## Vectorize와 RAG의 역할은 다릅니다

| 구성 요소 | 역할                         | 단독으로 할 수 있는 일                     |
| --------- | ---------------------------- | ------------------------------------------ |
| Pagefind  | 페이지의 단어 찾기           | 제품명, 고유명사, 오류 코드를 빠르게 찾기  |
| Vectorize | 의미가 가까운 정보 찾기      | 바꿔 말한 표현과 관련 페이지 후보 돌려주기 |
| RAG       | 검색한 근거로 AI 답변 만들기 | 답변과 원본 페이지 링크 함께 돌려주기      |

Vectorize는 답변을 생성하지 않습니다. RAG는 검색만도 아닙니다. 검색, 근거 선별, 답변 생성, 출처 표시를 하나의 계약으로 설계해야 독자가 답변을 확인할 수 있습니다.

## 어디서 시작할까?

처음부터 챗봇을 만들 필요는 없습니다. 다음 순서가 이해하기 쉽고 안전합니다.

1. Pagefind를 일반 검색으로 남깁니다.
2. Vectorize로 관련 페이지 찾기를 추가하고 검색 품질을 평가합니다.
3. 근거로 쓸 페이지, URL 표시, 정보 부족 시 동작을 정합니다.
4. 이 조건을 만족할 수 있을 때만 RAG AI 답변을 추가합니다.

이 순서라면 AI 답변의 모양을 다듬기 전에 검색 대상 자체가 올바른지 확인할 수 있습니다.

## RAG 전에 결정할 네 가지

| 결정할 것    | 시작하기 쉬운 선택                                      | 이유                                       |
| ------------ | ------------------------------------------------------- | ------------------------------------------ |
| 질문 범위    | 공개 사이트 정보만                                      | 초안이나 내부 정보를 답변에 잘못 쓰지 않음 |
| 근거 표시    | 답변마다 원본 페이지 링크                               | 독자가 답변을 확인할 수 있음               |
| 근거 부족 시 | “확인할 수 없습니다”라고 알림                           | 그럴듯한 추측을 피함                       |
| 검색 분리    | 입력 중에는 Pagefind, 명시적 실행 뒤에는 Vectorize／RAG | 전송 범위, 비용, 대기 시간을 이해하기 쉬움 |

RAG가 오답을 불가능하게 하지는 않습니다. corpus 선택, 근거 확인, 답하지 않을 조건을 명확히 하는 일이 품질을 결정합니다.

## 구현 상세는 따로 읽기

이 페이지는 Vectorize와 RAG를 왜 쓰는지 설명하는 입문입니다. 공개 HTML corpus, content hash, 차등 동기화, Preview／Production 분리, rate limit은 [Vectorize를 안전하게 구현하는 상세 가이드](/insights/cloudflare-vectorize-safe-implementation/)로 옮겼습니다.
