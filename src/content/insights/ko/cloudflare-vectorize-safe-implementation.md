---
title: "Cloudflare Vectorize 구현 가이드: 공개 HTML을 안전하게 동기화하는 방법"
description: "공개 HTML에서 corpus를 만들고 Pagefind를 유지하면서 Vectorize 동기화를 안전하게 운영하는 상세 가이드입니다."
date: 2026-07-31T12:00
author: gui
tags: ["기술", "Cloudflare", "Vectorize", "OpenAI", "사이트 검색"]
image: /uploads/acecore-generated/blog-cloudflare-pages-security.webp
callout:
  type: tip
  title: Vectorize는 단어가 아니라 의미로 찾기 위한 검색 기반입니다
  text: "Cloudflare의 벡터 데이터베이스는 키워드가 완전히 일치하지 않아도 질문과 의미가 가까운 공개 페이지를 후보로 돌려줄 수 있습니다. 기존 키워드 검색을 대체하는 것이 아니라, 바꿔 말한 표현과 관련 정보 발견을 보완할 때 가치가 생깁니다."
processFigure:
  eyebrow: Vectorize rollout
  title: 공개 HTML에서 안전한 관련 검색까지의 흐름
  description: "편집 source를 직접 넣지 않고, 실제로 공개되는 HTML과 배포된 commit을 동기화 기준으로 삼습니다."
  variant: inline
  steps:
    - title: 공개 HTML을 build한다
      description: "canonical, locale, noindex가 반영된 정적 HTML을 생성합니다."
      icon: i-lucide-file-code-2
      accent: slate
    - title: corpus를 결정론적으로 만든다
      description: "본문을 chunk로 나누고 content hash 기반 ID와 감사용 metadata를 부여합니다."
      icon: i-lucide-boxes
      accent: brand
    - title: Preview UI를 확인한다
      description: "그곳에서는 의미 검색을 끄고 Pagefind 후보, fallback, 표시되는 안내를 확인합니다."
      icon: i-lucide-flask-conical
      accent: amber
    - title: 공개 commit을 Production에 동기화한다
      description: "build marker와 corpus version을 대조하고 mutation이 수렴한 뒤에만 활성화합니다."
      icon: i-lucide-shield-check
      accent: emerald
compareTable:
  title: 검색 기능과 동기화 처리는 실패 시 정책을 분리한다
  before:
    label: 모든 것을 Vectorize에 의존
    items:
      - "AI, Vectorize, D1 중 하나가 중단되면 사이트 검색 전체를 사용할 수 없음"
      - "CMS 초안과 공개 페이지의 차이가 그대로 검색 결과의 차이가 됨"
      - "동기화 스크립트의 잘못된 설정으로 다른 환경이나 대량의 vectors를 변경할 수 있음"
      - "코드가 merged된 시점을 도입 완료로 판단하기 쉬움"
  after:
    label: fail-soft 검색 ＋ fail-closed 동기화
    items:
      - "일반 검색은 Pagefind가 맡고 의미 검색은 명시적인 조작으로 호출하는 보조 기능으로 구성"
      - "corpus는 공개 HTML에서 만들고 canonical, noindex, locale을 반영"
      - "Production allowlist, 삭제율, 공개 commit, mutation 완료를 동기화 전후에 검증"
      - "구현, 로컬 검증, Preview UI 확인, Production 운영을 서로 다른 상태로 기록"
statBar:
  items:
    - value: "의미로 검색"
      label: 정확한 단어 이상을 찾기
      description: "질문, 바꿔 말한 표현, 주제가 가까운 페이지를 찾는 데 도움이 됩니다."
      icon: i-lucide-git-branch
    - value: "두 가지 검색 경로"
      label: Pagefind와 Vectorize
      description: "안정적인 키워드 검색은 유지하고 Vectorize가 선택적으로 보완합니다."
      icon: i-lucide-database
    - value: "공개 HTML"
      label: 독자가 보는 내용을 검색
      description: "index는 CMS 초안이 아니라 실제 공개 페이지를 따릅니다."
      icon: i-lucide-test-tube-2
    - value: "단계적 도입"
      label: 먼저 검증하고 공개
      description: "UI, corpus, 동기화에 각각 안전 경계를 둡니다."
      icon: i-lucide-badge-check
checklist:
  title: 다음 사이트에 도입하기 전 확인 사항
  items:
    - text: "기존 키워드 검색을 유지하고 Vectorize 중단 시에도 검색 경로를 보존한다"
      checked: true
    - text: "embedding model의 실제 출력과 index의 dimensions／metric을 대조한다"
      checked: true
    - text: "공개 HTML에서 corpus를 생성하고 noindex, 외부 canonical, 관리 화면을 제외한다"
      checked: true
    - text: "content hash 기반 ID로 변경되지 않은 chunk를 다시 embedding하지 않는다"
      checked: true
    - text: "Preview는 Pagefind만 쓰고 Vectorize／D1과 동기화 권한은 Production으로 한정한다"
      checked: true
    - text: "upsert 완료를 확인한 뒤 delete하고 대량 삭제에는 명시적 승인을 요구한다"
      checked: true
    - text: "검색 API에 body, query, locale, origin, rate limit, kill switch를 설정한다"
      checked: true
    - text: "공개 commit과 corpus version이 일치하는 deployment만 Production에 동기화한다"
      checked: true
    - text: "구현 완료, 검증 완료, Preview 확인 완료, Production 운영 중을 구분해 기록한다"
      checked: true
linkCards:
  - href: /insights/cloudflare-vectorize-implementation-guide/
    title: 먼저 Vectorize와 RAG의 역할 이해하기
    description: "의미 검색과 RAG의 차이, 출처가 있는 답변에 필요한 조건을 짧게 설명합니다."
    icon: i-lucide-route
  - href: https://developers.cloudflare.com/vectorize/
    title: Cloudflare Vectorize 공식 문서
    description: "index, binding, query, metadata filtering의 최신 사양을 확인할 수 있습니다."
    icon: i-lucide-book-open
  - href: https://developers.cloudflare.com/vectorize/platform/limits/
    title: Vectorize 최신 limits
    description: "batch, topK, metadata, vector 수 제한은 바뀔 수 있으므로 구현할 때 다시 확인합니다."
    icon: i-lucide-gauge
  - href: /insights/astro-cloudflare-site-architecture/
    title: Astro ＋ Cloudflare 사이트 전체 설계
    description: "정적 HTML, Pages Functions, D1, 검색을 어느 레이어에 둘지 정리한 글입니다."
    icon: i-lucide-layers-3
faq:
  title: 자주 묻는 질문
  items:
    - question: Vectorize를 도입하면 Pagefind가 필요 없나요?
      answer: "Pagefind를 제거하지 않았습니다. Pagefind는 정적 HTML에서 만들 수 있는 저의존성 일반 검색, Vectorize는 바꿔 말한 표현이나 관련 개념을 찾는 보조 검색으로 역할을 나눴습니다. AI나 Vectorize가 실패해도 일반 검색은 유지됩니다."
    - question: Vectorize 도입에 D1이나 R2가 필수인가요?
      answer: "필수는 아닙니다. D1은 예를 들어 검색 API의 rate limit에 사용할 수 있지만 Vectorize 자체의 필수 저장소는 아닙니다. 원문의 위치도 공개 HTML, JSON, D1, R2 등 요구 사항에 맞게 결정합니다."
    - question: 현재 구현의 embedding model과 dimensions는 어떻게 관리하나요?
      answer: "model, dimensions, metric은 corpus, index, API, 동기화가 함께 지켜야 할 계약입니다. dimensions가 다른 vector를 같은 index에 섞어서는 안 됩니다. index 설정은 생성 후 변경할 수 없으므로 생성 전에 최신 공식 사양과 실제 출력 shape을 확인합니다."
    - question: 어느 시점에 도입 완료로 판단하나요?
      answer: "merge나 로컬 test만으로는 완료로 보지 않습니다. Preview에서는 Pagefind와 UI fallback을 확인하고, Production에서는 공개 commit과 corpus 일치, index 동기화, mutation 수렴, 관련 검색, rate limit, 중단 절차를 확인한 뒤 운영으로 기록합니다."
---

## 먼저 이해하기: Cloudflare Vectorize란?

Cloudflare Vectorize는 Cloudflare의 벡터 데이터베이스입니다. 텍스트, 이미지 등 데이터의 특징과 의미를 숫자열로 나타낸 **embedding**을 저장하고, 입력과 의미가 가까운 정보를 찾습니다. [공식 개요](https://developers.cloudflare.com/vectorize/)에서 설명하듯 의미 검색, 추천, 분류, 향후 RAG 애플리케이션의 검색 계층에 활용할 수 있습니다.

일반 키워드 검색은 제품명, 고유명사, 오류 코드처럼 그 단어가 포함된 페이지를 빠르게 찾는 데 뛰어납니다. 반면 Vectorize는 쓰인 단어가 정확히 일치하지 않을 때 도움이 됩니다. 예를 들어 “사이트를 개선하고 싶다”라는 질문으로 “지속적인 웹 운영 지원”이나 “기술 자문” 페이지를 찾는 식입니다.

> Vectorize는 그 자체로 답변 문장을 생성하는 챗봇이 아닙니다. 관련 공개 페이지와 URL을 고르는 검색 기반입니다. 나중에 생성 AI를 결합하더라도 이 검색 결과를 답변의 근거 계층으로 사용할 수 있습니다.

## 도입하면 무엇이 좋아질까?

- **바꿔 말한 표현과 질문을 찾을 수 있습니다**: 독자가 사이트의 정확한 용어를 몰라도 의도와 가까운 페이지에 도달하기 쉬워집니다.
- **콘텐츠를 가로질러 관련 지식을 연결합니다**: 표현이 다른 글, FAQ, 서비스 안내도 의미의 가까움을 바탕으로 찾을 수 있습니다.
- **기존 검색 경험을 대체하지 않고 보강합니다**: 키워드 검색을 남기고 “관련 정보 찾기”라는 명시적 동작에만 쓰면 전체 UI를 다시 만들지 않아도 발견성을 높일 수 있습니다.
- **나중에 검색 계층을 재사용할 수 있습니다**: 원래 페이지와 URL을 돌려주도록 설계하면 인용 가능한 AI 답변, 관련 글, 콘텐츠 추천에도 같은 계층을 활용할 수 있습니다.

의미 검색은 마법이 아닙니다. 품질은 올바르게 고른 공개 corpus, 적절한 embedding model, 실제 검색 결과 평가에 달려 있습니다. 정확한 제품명이나 코드를 찾는 일반 검색을 대체해서는 안 됩니다.

## 먼저 기존 검색 위에 겹치기

첫 도입에서는 기존 키워드 검색을 남기고, 독자가 관련 정보를 명시적으로 찾을 때만 Vectorize를 호출하는 구성이 가장 다루기 쉽습니다.

1. 제품명, 고유명사, 짧고 정확한 용어는 Pagefind 같은 일반 검색으로 찾습니다.
2. 질문문, 바꿔 말한 표현, 인접한 주제는 Vectorize 관련 검색으로 보완합니다.
3. embedding provider나 Vectorize가 실패해도 일반 검색은 그대로 남깁니다.

여기까지가 도입을 검토할 때 먼저 판단할 가치와 적용 범위입니다. 이후에는 Astro／Cloudflare Pages 사이트에서 재사용할 수 있는 구현·운영 설계를 설명합니다.

> **실용적인 첫 구성:** 일반 Pages Preview에서는 `SEARCH_ENABLED=false`로 Pagefind만 사용합니다. Vectorize／D1 binding과 자동 동기화는 Production으로 제한합니다. Preview에서 검색 UI와 fallback을 확인하고, Production에는 공개 commit에서 만든 corpus만 동기화합니다. 이렇게 하면 시험 중인 변경과 넓은 권한이 운영 검색에 들어가지 않습니다.

도입을 계획해 보면 단순히 “embedding을 만들고 `query()`를 호출하는 것”만으로는 충분하지 않다는 사실을 알게 됩니다. 검색 대상을 어떻게 만들지, Preview는 Pagefind만 유지하면서 Production을 어떻게 보호할지, 잘못된 동기화로 대량 삭제가 일어나지 않게 할지, 공개 중인 페이지와 index가 실제로 일치하는지 등을 고려해야 합니다. 실제 운영에서는 Vectorize API 호출보다 그 전후의 설계가 더 중요합니다.

## 결론: 검색은 fail-soft, 동기화와 공개는 fail-closed

가장 재사용하기 쉬웠던 원칙은 사용자 검색과 운영자 동기화에서 실패 시 정책을 분리하는 것입니다.

| 대상              | 실패 시 정책 | 이유                                                                              |
| ----------------- | ------------ | --------------------------------------------------------------------------------- |
| 일반 사이트 검색  | fail-soft    | Vectorize가 중단되어도 Pagefind로 검색을 계속함                                   |
| 관련 검색 API     | fail-soft    | 오류를 짧게 종료하고 일반 검색 결과를 훼손하지 않음                               |
| corpus 생성       | fail-closed  | 대상 페이지, locale, 개수, metadata가 잘못되면 만들지 않음                        |
| index 동기화      | fail-closed  | 대상 환경, 기존 ID, 삭제율, mutation을 확인할 수 없으면 변경하지 않음             |
| Production 활성화 | fail-closed  | 공개 commit과 corpus 일치, Production 동기화와 mutation 수렴을 확인한 뒤 활성화함 |

“AI 검색이 중단되어도 사이트 검색은 사용할 수 있다”와 “동기화가 의심스러우면 단 한 건도 변경하지 않는다”를 동시에 충족합니다.

## 먼저 이 네 가지를 결정합니다

provider나 index 이름을 고르기 전에 다음 네 가지 질문에 답합니다. 그러면 아키텍처를 훨씬 쉽게 판단할 수 있습니다.

| 결정할 것   | 시작하기 쉬운 선택                                 | 이유                                                          |
| ----------- | -------------------------------------------------- | ------------------------------------------------------------- |
| 독자의 목적 | “관련 페이지 찾기”                                 | 처음부터 답변을 생성하지 않고 검색 품질을 평가할 수 있습니다. |
| 검색 진입점 | 입력 중에는 Pagefind, 명시적 실행 뒤에는 Vectorize | 속도, 비용, 데이터 전송 범위를 이해하기 쉽게 유지합니다.      |
| 기준 corpus | 공개 HTML                                          | 초안과 관리 화면이 검색 결과에 섞이지 않습니다.               |
| 공개 흐름   | Preview에서 UI 확인, Production만 동기화           | 시험 데이터와 권한이 운영 검색에 들어가지 않습니다.           |

이 네 가지에 답했다면 embedding provider, D1, R2, 나중의 답변 생성은 각자의 요구에 맞춰 선택할 수 있습니다.

## Pagefind를 대체하지 않고 역할을 분리한다

Vectorize 도입의 목적은 기존 검색을 버리는 것이 아니었습니다.

Pagefind는 build된 HTML에서 정적 index를 만들고 브라우저 안에서 검색할 수 있습니다. 제품명, 서비스명, 고유명사처럼 명시적인 단어를 찾는 일반 검색에 사용하기 쉽고 embedding provider나 Vectorize의 상태에 의존하지 않습니다.

Vectorize는 검색어가 본문과 완전히 일치하지 않거나 관련 개념으로 페이지를 찾고 싶을 때 적합합니다. 다만 embedding 생성과 Vectorize query가 필요하므로 외부 서비스 지연, 오류, 사용량도 고려해야 합니다.

그래서 UI도 분리했습니다.

1. 입력 중에는 Pagefind 후보를 표시
2. 사용자가 관련 검색을 명시적으로 실행할 때만 API 호출
3. API에 짧은 timeout 설정
4. API가 실패해도 Pagefind 결과를 지우지 않음
5. kill switch로 관련 검색만 중단 가능

현재 검색 모달에서는 입력 중 후보를 브라우저 안의 Pagefind만으로 표시합니다. 이용자가 “검색”을 실행할 때에만 UI에 표시한 안내대로 검색어를 OpenAI Embeddings API로 보내고, 그 수치 표현을 이 사이트의 공개 정보와 Vectorize에서 대조합니다. 개인 정보나 기밀 정보는 입력하지 않도록 안내하며, 이 전송은 일반 키워드 후보와 구분합니다.

이 구성에서는 Vectorize가 검색 경험을 확장하지만 검색 전체의 단일 장애점이 되지 않습니다.

## corpus는 CMS 초안이 아니라 공개 HTML에서 만든다

여러 사이트에서 특히 차이가 난 부분은 검색 대상의 기준을 무엇으로 삼을지였습니다.

CMS 초안이나 Markdown을 corpus로 직접 사용하면 실제 공개 페이지와 차이가 생깁니다.

- `draft`나 `noindex` 콘텐츠가 섞임
- 외부 canonical을 가리키는 페이지가 남음
- layout의 중복 문구나 관리 UI가 섞임
- 변환 후에만 나타나는 title, description, URL을 반영할 수 없음
- 다국어 사이트에서 locale 경계가 모호해짐

그래서 Astro build 후 생성된 HTML을 읽고 공개 조건을 반영한 뒤 corpus를 만들었습니다.

다국어 사이트라면 첫 corpus에 선택한 한 언어의 페이지 중 다음 조건을 충족하는 것만 넣을 수 있습니다.

- same-origin canonical을 가짐
- `lang`이 일본어임
- `noindex`가 아님
- `/admin`, `/api`, 404, 전송 완료 페이지가 아님
- `data-vectorize-ignore`, 내비게이션 등 비본문 요소를 제외할 수 있음
- 공개 root-relative URL과 title을 가짐

본문은 목표 850자, 최대 1,200자, overlap 120자로 chunk화했습니다. 이 값은 보편적인 정답이 아니라 이번 페이지 길이와 일본어 본문에 사용한 운영 값입니다. 다른 사이트에서는 실제 문서 구조와 검색 평가를 보고 조정합니다.

## content hash로 차등 동기화를 결정론적으로 만든다

vector ID에 일련번호나 실행 시 UUID를 사용하면 같은 corpus를 다시 생성해도 모든 ID가 달라집니다. 변경되지 않은 본문까지 다시 embedding해야 하고 기존 ID도 대량 삭제해야 합니다.

그래서 locale, 공개 URL, chunk 번호, 본문으로 SHA-256을 만들고 ID와 corpus version을 결정론적으로 생성했습니다.

```js
const identity = [locale, url, String(chunkIndex), text].join("\u001f");
const digest = sha256(identity);

const vector = {
  id: `v1-${digest.slice(0, 48)}`,
  text,
  metadata: {
    locale,
    url,
    chunkIndex,
    contentHash: digest,
  },
};
```

동기화할 때는 예상 ID와 현재 index ID를 비교합니다.

- 예상 집합에만 있는 ID를 embedding하고 upsert
- 양쪽에 모두 있는 ID는 변경 없음으로 보고 skip
- index에만 있는 ID는 삭제 후보로 처리
- `v1-` 관리 범위 밖의 ID가 섞여 있으면 mutation 전에 중단

같은 공개 콘텐츠에서는 같은 corpus가 생성되므로 차이가 발생한 이유를 설명하기 쉬워집니다.

## embedding model과 index 설정을 계약으로 고정한다

실제 출력을 확인한 뒤에만 embedding provider와 model을 고릅니다. Workers AI의 [`@cf/baai/bge-m3`](https://developers.cloudflare.com/workers-ai/models/bge-m3/)나 [OpenAI Embeddings](https://platform.openai.com/docs/guides/embeddings) 같은 model을 쓸 수 있지만 dimensions와 metric은 계획한 index와 일치해야 합니다. 나중에 교체할 때는 별도 대상 index를 만들고 이전 index는 rollback용으로 유지하며, dimensions가 다른 vector를 같은 index에 섞지 않습니다.

모델 이름 자체보다 중요한 것은 다음 네 곳에 같은 계약을 적용하는 것입니다.

| 위치            | 고정할 값                      |
| --------------- | ------------------------------ |
| corpus metadata | model, dimensions, metric      |
| Vectorize index | dimensions, metric             |
| 검색 API        | model, embedding length        |
| 동기화 스크립트 | 허용 model, dimensions, metric |

Cloudflare의 [Create indexes](https://developers.cloudflare.com/vectorize/best-practices/create-indexes/)에도 설명되어 있듯 index의 dimensions와 metric은 생성 후 변경할 수 없습니다. 모델 문서가 모호하다면 추측으로 index를 만들지 말고 최신 문서와 실제 출력을 확인합니다.

metadata filtering을 사용할 때는 vector를 넣기 전에 metadata index를 만듭니다. 이미 넣은 vector는 나중에 metadata index를 추가하는 것만으로 대상이 되지 않으며 다시 upsert해야 합니다.

제품 limits도 바뀝니다. 2026년 7월 31일에 다시 확인한 Vectorize V2에서 Workers API의 upsert batch 제한은 1,000, HTTP API는 5,000입니다. 일반 `topK` 제한은 100이며 `returnValues: true` 또는 `returnMetadata: "all"`일 때는 50입니다. 구현 시 반드시 [최신 limits](https://developers.cloudflare.com/vectorize/platform/limits/)와 [client API](https://developers.cloudflare.com/vectorize/reference/client-api/)를 다시 확인합니다.

제품 최대치를 그대로 쓰지 말고, 관찰하고 안전하게 재시도할 수 있는 더 작은 batch 크기와 `topK` 값을 의도적으로 선택합니다. provider 제한과 팀이 안전하게 재시도·감시할 수 있는 batch 크기는 별개의 결정입니다.

## upsert 후 수렴을 기다리고 나서 delete한다

Vectorize의 insert, upsert, delete는 비동기입니다. API가 성공했다고 해서 변경 사항이 query에 반영되었다는 의미는 아닙니다.

안전한 동기화는 다음 순서로 구성했습니다.

1. corpus와 index 설정 검증
2. 현재 모든 vector ID를 pagination으로 가져옴
3. upsert 대상과 delete 후보 계산
4. upsert를 batch로 실행
5. 반환된 `mutationId`가 `processedUpToMutation`에 도달할 때까지 대기
6. upsert가 수렴한 뒤 delete 실행
7. delete mutation도 같은 방식으로 수렴 확인

Cloudflare [Vectorize API](https://developers.cloudflare.com/vectorize/reference/client-api/)에도 mutation이 비동기라고 명시되어 있습니다. 고정된 시간만 sleep하지 말고 mutation ID로 완료를 확인합니다.

또한 동기화 스크립트에는 다음 중단 조건을 넣었습니다.

- 대상 index 이름이 Production index의 완전 일치 allowlist 밖에 있음
- 동기화 과정에서 Production index를 자동 생성하려고 함
- `--confirm-production` 값이 대상 index 이름과 일치하지 않음
- dimensions／metric이 계약과 다름
- corpus의 locale, URL, metadata, content hash가 잘못됨
- source page 수 또는 vector 수가 예상 상한을 넘음
- 기존 index에 관리 대상이 아닌 ID가 섞여 있음
- 기존 vectors의 20%를 넘게 삭제하게 됨
- retry 한도 또는 mutation 대기 시간을 초과함

대량 삭제가 의도된 변경이어도 일반 workflow에서 override하지 않고 별도로 검토한 마이그레이션 절차로 분리합니다. 일반 push나 schedule에서는 허용하지 않습니다.

## 대량 삭제나 모델 변경에는 교체 index를 사용한다

20%를 넘는 삭제를 일반적인 차등 동기화에 맡기지 않습니다. 20%는 Cloudflare 제품 한도가 아니라, 사람이 검토할 수 있도록 일반 workflow를 멈추게 하는 운영상 가드레일입니다.

기존 index에서 21.3%의 vector 삭제가 예상되었을 때도 직접 delete하지 않고 다음 순서로 전환했습니다.

1. 새 model, dimensions, metric 계약에 맞는 교체 index를 만듭니다.
2. 공개 corpus를 전체 동기화하고 ID 집합 수렴과 알려진 query canary를 확인합니다.
3. Worker 또는 Pages binding을 교체 index로 전환합니다.
4. Production 검색 API, 일반 검색 fallback, 활성 binding을 확인합니다.
5. 이전 index는 별도의 명시적 승인 후에만 삭제합니다.

삭제 후 문제가 생기면 먼저 `SEARCH_ENABLED=false`로 관련 검색만 멈추고 일반 검색은 유지합니다. 그다음 교체 index를 다시 만들고 전체 동기화, query 검증, binding 전환을 반복합니다. index 삭제가 첫 번째 rollback 수단이 되어서는 안 됩니다.

## Preview는 Pagefind만 사용하고 Production만 고권한 동기화 대상으로 한다

도입 초기 Preview와 Production을 분리해 검증한 일은 권한과 중단 조건을 정리하는 데 도움이 됐습니다. 하지만 일반 Pages Preview에는 Vectorize／D1 binding이 필요하지 않습니다. 현행 구성은 `SEARCH_ENABLED=false`를 유지하며 Preview에서 Pagefind 후보, fallback, 레이아웃을 확인합니다. Vectorize／D1 binding, 동기화 token, Production Environment는 Production으로 한정합니다.

다음 항목을 분리합니다.

- Vectorize index
- D1 등의 보조 리소스
- Wrangler environment
- API token
- GitHub Environment
- 동기화 workflow concurrency
- 활성화용 repository variable
- kill switch

동기화 token은 대상 Cloudflare account의 Vectorize Read / Write로 제한하고 OpenAI API key와 분리했습니다. Production은 보호된 `main`에서만 실행하고 GitHub Environment reviewer를 거칩니다.

여기에는 운영상 trade-off도 있습니다. Production Environment에 required reviewer를 설정하면 schedule로 시작한 동기화도 승인 대기 상태가 될 수 있습니다. 첫 공개만 승인할지, 정기 동기화도 매번 승인할지, 별도 job으로 나눌지를 cron 추가 전에 결정해야 합니다.

## 공개 중인 commit과 같은 corpus만 Production에 동기화한다

GitHub의 `main`과 현재 Cloudflare Pages에 공개된 commit은 항상 같지 않습니다. push 직후에는 build 중일 수 있고 deployment가 실패해 이전 commit이 계속 공개될 수도 있습니다.

그래서 공개 사이트에 build marker를 두고 Production 동기화 중 다음을 확인했습니다.

- marker의 commit이 40자 Git SHA임
- 해당 commit이 repository에 존재함
- 보호된 `main`의 조상임
- 해당 commit을 checkout해 corpus를 다시 생성할 수 있음
- marker의 corpus version과 재생성 결과가 일치함
- mutation 직전에도 같은 commit이 공개 중임

완료 조건은 GitHub repository와 연결된 Cloudflare Pages deployment입니다. 로컬이나 Direct Upload로 임시 공개한 산출물은 Production 동기화의 기준으로 삼지 않습니다.

이렇게 하면 “새 corpus를 이전 사이트에 동기화”하거나 “deployment에 실패한 commit의 내용만 검색 결과에 노출”하는 불일치를 막을 수 있습니다.

## 공개 검색 API에 비용과 개인정보 경계를 둔다

검색 API는 입력한 문자열을 embedding provider에 보내는 공개 endpoint입니다. 검색 정확도뿐 아니라 악용, 비용, 로그, 반환 URL도 설계 대상입니다.

공개 검색 API에는 최소한 다음 경계를 둡니다.

| 항목         | 구현 예시                                                    |
| ------------ | ------------------------------------------------------------ |
| method／형식 | same-origin JSON POST만 허용                                 |
| body         | 2KiB 이하. `Content-Length`가 없어도 stream을 읽는 중에 중단 |
| query        | NFKC 정규화 후 2〜160자                                      |
| locale       | `ja`만 허용                                                  |
| rate limit   | 비용, 트래픽, 위협 모델에 맞는 client·global 제한            |
| 중단         | `SEARCH_ENABLED`로 관련 검색만 중단                          |
| query        | raw query를 로그, corpus, Vectorize metadata에 저장하지 않음 |
| 결과 URL     | same-origin의 공개 root-relative URL만 허용                  |
| 오류         | 단계별 구조화 code를 반환하고 본문은 로그에 남기지 않음      |

client UUID만으로는 사용자가 변경할 수 있어 강력한 비용 경계가 되지 않습니다. Cloudflare 연결 정보로 만드는 client key, global limit, 사용량 감시를 조합합니다. 규모와 위협에 따라 Turnstile, WAF, Durable Objects도 검토합니다.

D1은 이 구성에서 rate limit에 사용하지만 Vectorize 도입의 필수 요건은 아닙니다. R2도 마찬가지입니다. 원문을 어디서 가져올지, rate limit을 어디에 보관할지에 맞춰 선택합니다.

## 관련 검색과 생성 AI 채팅을 별도 계약으로 둔다

“관련 내용” 검색은 이용자가 명시적으로 실행한 뒤에만 검색어를 embedding provider로 보내고, 그 embedding을 사이트의 공개 정보와 Vectorize에서 대조할 수 있습니다. 반면 별도 AI 채팅은 질문과 필요하다면 대화 맥락을 답변 서비스로 보내 답변을 생성합니다.

두 기능을 모호하게 “AI 검색”으로 묶지 않는 것이 중요합니다. 전송 데이터, 정보원 범위, 오류 표시, 사용량, 개인정보 안내를 각각 설계하고, Vectorize 관련 검색의 fallback을 AI 안내로 임의 전송하지 않습니다.

## 검색 정보원의 책임을 섞지 않는다

웹사이트, 도움말 센터, 정책, 내부 지식 기반은 서로 다른 책임을 가집니다. 어떤 질문이 어느 정보원에 속하는지 미리 정합니다.

- 공개 제품·서비스 정보는 사이트 corpus에서 검색
- 구속력 있는 규칙과 절차는 해당 공식 정보원에서 검색
- Vectorize가 실패해도 맞지 않는 정보원으로 fallback하지 않음
- 실제 근거로 선택한 정보원만 링크
- 확인되지 않은 규칙이나 정보를 추측하지 않음

이는 RAG와 안내 채팅에서도 중요합니다. 검색할 수 있는 곳이 늘어날수록 어떤 질문을 어느 정보원으로 보낼지, 정보가 없을 때 무엇을 답하지 않을지를 먼저 정해야 합니다.

## 실제로 발생한 실패와 다음에 바꾼 점

처음부터 고려할 만한 재발하기 쉬운 문제를 정리했습니다.

| 증상                                          | 원인                                           | 다음 조치                                               |
| --------------------------------------------- | ---------------------------------------------- | ------------------------------------------------------- |
| binding을 추가했지만 검색 기능이 되지 않음    | API, corpus, reindex, 권한, UI가 설계되지 않음 | index 생성 전에 검색 계약과 운영 흐름을 결정            |
| index 생성 시 dimensions를 추측               | 모델 이름만 보고 실제 출력을 확인하지 않음     | 실제 embedding length를 검사한 뒤 생성                  |
| metadata filter에서 기존 vector가 나오지 않음 | metadata index보다 먼저 투입함                 | metadata index를 먼저 만들고 기존 vector를 다시 upsert  |
| 동기화 직후 query가 불안정                    | mutation이 비동기임                            | `mutationId`와 index 정보로 수렴을 기다림               |
| 대량의 재embedding과 delete가 발생            | vector ID가 실행할 때마다 바뀜                 | content hash 기반 결정론적 ID 사용                      |
| schedule이 진행되지 않고 waiting 상태         | Production Environment가 승인을 요구           | 정기 동기화와 승인 정책을 함께 설계                     |
| Windows에서 test나 Git 실패                   | `spawn EPERM`, lock, cache 등의 환경 요인      | baseline 비교, Node version 고정, fresh `npm ci`로 분리 |
| API timeout을 코드 결함으로 판단              | 일시 장애, payload 차이, provider 지연         | 올바른 contract로 재시험하고 단발 결과와 재현성을 구분  |

의존성이나 실행 환경 문제를 Vectorize 변경에 잘못 귀속하지 않는 것도 중요합니다. 변경 전 baseline에서도 같은 오류가 발생하는지 확인하고 코드 결함과 환경 문제를 분리합니다.

## “도입 완료”를 4단계로 나눠 기록한다

글이나 완료 보고에서는 다음 상태를 구분하면 오해가 줄어듭니다.

| 상태               | 완료 조건 예시                                               |
| ------------------ | ------------------------------------------------------------ |
| 구현 완료          | API, corpus, 동기화 스크립트, UI가 branch에 있음             |
| 로컬 검증 완료     | build, typecheck, 계약 test, dry-run 성공                    |
| Preview 확인 완료  | Pagefind 후보, 관련 검색을 사용할 수 없을 때의 표시, UI 확인 |
| Production 운영 중 | 공개 commit 동기화, mutation 수렴, API, 중단 절차 확인       |

이 상태는 완료 보고와 release notes에도 분리해 기록합니다. 그러면 코드가 있는 상태와 실제로 안전한 Production 운영을 혼동하지 않습니다.

성공한 test 수뿐 아니라 아직 확인하지 않은 항목도 기록하는 것이 다음 담당자에게 가장 유용한 운영 정보입니다.

## 다른 사이트로 확장할 때의 최소 구성

다른 Astro／Cloudflare Pages 사이트에 적용할 때 최소 구성은 다음과 같습니다.

```txt
Astro build
  -> 공개 HTML
  -> Pagefind index
  -> Vectorize corpus (locale / canonical / noindex 반영)

Cloudflare Pages Function
  -> input validation
  -> OpenAI Embeddings API
  -> Vectorize query
  -> 공개 URL만 반환

GitHub Actions
  -> 공개 commit 확인
  -> corpus 재생성
  -> allowlist의 Production index만 동기화
  -> upsert 수렴 후 delete
  -> corpus version 기록

Pages Preview
  -> SEARCH_ENABLED=false
  -> Pagefind 후보와 UI fallback 확인
```

처음부터 LLM 답변 생성까지 도입할 필요는 없습니다. 먼저 “관련 페이지를 안전하게 반환하는” 검색을 만들고 평가할 수 있는 상태로 둡니다. 답변 생성을 추가할 때도 가져온 원문, 인용 가능한 URL, 답변하지 않아야 하는 조건을 별도 계약으로 설계합니다.

## 정리

Cloudflare Vectorize 도입에서 어려운 부분은 nearest-neighbor query 자체가 아닙니다.

무엇을 공개 정보로 index할지, 변경되지 않은 chunk를 어떻게 구분할지, 잘못된 동기화를 어떻게 중단할지, 공개 중인 commit과 어떻게 일치시킬지, 장애 시 일반 검색을 어떻게 유지할지가 다른 사이트로 확장할 때의 품질을 좌우합니다.

결론은 간단합니다.

- Pagefind를 주 검색으로 유지
- Vectorize는 의미 검색 보조 기능으로 사용
- corpus는 공개 HTML에서 생성
- ID와 version은 content hash로 결정론적으로 생성
- Preview는 Pagefind만 사용하고 Vectorize／D1과 동기화 권한은 Production으로 한정
- 검색은 fail-soft, 동기화와 공개는 fail-closed로 구성
- “구현”, “로컬 검증”, “Preview UI 확인”, “Production”을 서로 다른 상태로 기록

이 경계를 먼저 만들어 두면 Vectorize를 일회성 AI 기능이 아니라 지속적으로 갱신할 수 있는 검색 기반으로 운영하기 쉬워집니다.
