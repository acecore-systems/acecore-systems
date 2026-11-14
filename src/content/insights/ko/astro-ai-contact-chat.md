---
title: "Astro 사이트에 문의 AI 채팅을 통합하는 기술 설계"
description: "2026년6월 기준 참고 설계입니다. Astro + Cloudflare Pages 구성의 정적 사이트에 OpenAI Responses API를 사용하는 문의 AI 채팅을 통합하기 위한 기술 설계입니다. API 경계, 사이트 내 컨텍스트, 프롬프트 제어, locale별 URL, Origin 확인, 요청 제한, 안전한 Markdown 링크 렌더링까지 다른 사이트에서도 재사용하기 쉬운 형태로 정리합니다."
date: 2026-06-07T12:00
lastUpdated: "2026-11-12T00:00:00+09:00"
author: gui
tags: ["기술", "Cloudflare", "웹사이트", "AI", "서비스"]
image: "/images/insights/covers/astro-ai-contact-chat-cover-v2.webp"
callout:
  type: info
  title: 이 글의 핵심
  text: 문의 AI 채팅은 AI가 자유롭게 답변하도록 하는 기능이 아니라, 공개된 사이트 정보를 바탕으로 방문자를 적절한 경로로 안내하는 작은 애플리케이션으로 설계합니다. API 키, 프롬프트, 연락처, Markdown 렌더링은 서버 측 처리와 허용 목록을 통해 제어합니다.
processFigure:
  title: 문의 AI 채팅의 참조 아키텍처
  steps:
    - title: 위젯
      description: Astro 쪽의 채팅 UI는 질문, 표시 locale, 꼭 필요한 최소한의 대화 기록만 전송합니다.
      icon: i-lucide-message-circle
      accent: brand
    - title: 함수
      description: Cloudflare Pages Function은 입력 검증, Origin 확인, 요청 제한, 프롬프트 생성을 담당합니다.
      icon: i-lucide-shield-check
      accent: amber
    - title: 모델
      description: OpenAI Responses API에 공개된 사이트 정보와 대화 맥락을 전달하고 답변 텍스트를 받습니다.
      icon: i-lucide-sparkles
      accent: emerald
    - title: 렌더러
      description: 클라이언트 측에서 허용된 Markdown만 DOM으로 렌더링하고 내부 링크나 연락처로 안내합니다.
      icon: i-lucide-code-2
      accent: slate
compareTable:
  title: 도입 시 분리해야 하는 책임
  before:
    label: 한꺼번에 구현한 경우
    items:
      - 브라우저에서 AI API를 직접 호출하게 된다
      - 사이트 정보, API 키, UI 표시, 링크 렌더링이 뒤섞인다
      - AI가 요금, 계약, 납기를 단정적으로 말하기 쉽다
      - Markdown이나 URL을 그대로 HTML에 넣기 쉽다
  after:
    label: 책임을 분리한 경우
    items:
      - API 키와 모델 호출은 서버 측에 둔다
      - 공개 사이트 정보는 명시적인 컨텍스트로 관리한다
      - 프롬프트로 답변 범위와 연락 경로를 제어한다
      - Markdown과 URL은 허용 목록을 통해 렌더링한다
checklist:
  title: 다른 사이트에 도입할 때의 설계 체크리스트
  items:
    - text: AI 채팅의 목적을 ‘문의 처리 완료’가 아닌 ‘안내 경로 정리’로 정의한다
    - text: 브라우저에 API 키를 노출하지 않고 서버 측 API 경계를 만든다
    - text: 답변에 사용할 사이트 정보를 이미 공개된 정보로만 제한한다
    - text: 요금, 계약, 납기, 보증 등 AI가 단정하지 않도록 할 영역을 정한다
    - text: 폼, LINE, 이메일, 전화의 분기 규칙을 정한다
    - text: locale별 URL을 생성해 다국어 경로를 손상시키지 않는다
    - text: Origin 확인, 입력 길이 제한, 대화 기록 제한, 요청 제한을 적용한다
    - text: Markdown 링크는 trim한 뒤 허용 목록으로 판정한다
linkCards:
  - href: /contact/
    title: 문의하기
    description: AI 채팅, LINE, 폼, 직접 연락처의 입구를 정리한 페이지입니다.
    icon: i-lucide-message-square
  - href: /insights/cloudflare-pages-security/
    title: Cloudflare Pages 보안 설정
    description: CSP와 헤더 설정 등 정적 사이트 배포의 기반을 정리한 글입니다.
    icon: i-lucide-shield
  - href: /blog/cms-selection-and-turnstile/
    title: Sveltia CMS 도입 가이드
    description: 정적 사이트에 CMS 편집 화면을 추가하는 설계를 다룬 관련 글입니다.
    icon: i-lucide-badge-check
faq:
  title: 자주 묻는 질문
  items:
    - question: RAG나 벡터 DB 없이도 문의 AI 채팅을 만들 수 있나요?
      answer: 소규모 기업 사이트라면 먼저 공개된 페이지의 핵심을 구조화한 컨텍스트로 프롬프트에 전달하는 것만으로도 실용적입니다. 페이지 수나 업데이트 빈도가 늘어난 뒤 검색 인덱스나 벡터 DB를 검토해도 충분합니다.
    - question: OpenAI API 키가 브라우저에 노출되나요?
      answer: 노출되지 않습니다. 브라우저는 /api/ai-contact로 질문만 보내고, OpenAI Responses API 호출과 API 키 관리는 Cloudflare Pages Function 측에서 처리합니다.
    - question: AI 답변의 링크를 자유롭게 표시할 수 있나요?
      answer: 자유롭게 표시하지 않습니다. 내부 경로, 동일 origin, acecore.net, 공식 LINE, 필요할 때의 mailto와 tel만 허용하고, Markdown 링크 URL 앞뒤에 공백이 있더라도 trim한 뒤 안전성을 판정합니다.
---

정적 사이트에서 AI 채팅을 시험해 본다면 먼저 공개 FAQ 안내만 대상으로 삼고, 정식 견적이나 접수는 폼으로 넘깁니다. 서버 측 연결은 [Cloudflare Pages: 바인딩](https://developers.cloudflare.com/pages/functions/bindings/)에서 확인하세요. 본문의 URL 판정은 당시의 간략한 예시이므로, 구현 시에는 관련 글에서 다룬 URL 구문 분석과 허용 목록을 사용하고 문자열 접두사 일치만으로 허용하지 않도록 합니다.

> **2026년9월26일 추가:** 아래는 2026년6월 기준의 참고 설계입니다. Acecore Systems의 현재 `/api/ai-chat`은 Cloudflare Pages Function에서 Service Binding을 통해 공통 `acecore-chat-worker`로 전달합니다. 화면에서는 JSON 응답을 받아 완성된 답변을 표시합니다. 본문의 OpenAI Responses API 직접 호출 구성은 현재 Systems 구현을 설명하는 내용으로 읽지 말고, 현재 구현에 맞게 해석해 주세요.

문의 AI 채팅은 사이트에 AI를 추가하기만 하면 간단합니다. 하지만 실제 운영에서 문제가 되는 것은 모델 성능보다 어디까지 답하게 할지, 어떤 경로로 안내할지, 어떤 URL을 표시해도 되는지, API 비용을 어떻게 억제할지입니다.

Acecore 사이트는 Astro + Cloudflare Pages 정적 사이트에 문의 AI 채팅을 추가했습니다. 구현의 중심은 [문의 AI와 CMS 전용 번역 흐름을 구현한 PR](https://github.com/acecore-systems/acecore-net/pull/98)입니다. 이후 AI 답변에 포함된 Markdown 링크의 안전한 렌더링을 [별도의 PR](https://github.com/acecore-systems/acecore-net/pull/99)에서 조정했습니다. 링크 렌더링의 자세한 내용은 [AI 채팅 답변의 Markdown 링크를 안전하게 렌더링하는 구현 설계](/blog/ai-chat-markdown-link-safety/)에서 별도로 정리했습니다.

이 글에서는 특정 사이트의 작업 기록이 아니라 다른 정적 사이트에도 적용하기 쉬운 기술 설계로 정리합니다. Astro 이외의 프런트엔드에서도 접근 방식은 거의 같으며, 클라이언트, API 경계, 프롬프트, 렌더러의 책임을 나누는 것이 기본입니다.

## 전체 구성

이번 구성은 단순한 3계층 구조입니다.

| 계층                 | 역할                                                                 |
| -------------------- | -------------------------------------------------------------------- |
| 채팅 위젯            | UI, 입력, 표시 locale, 꼭 필요한 최소한의 대화 기록, Markdown 렌더링 |
| `/api/ai-contact`    | 입력 검증, Origin 확인, 요청 제한, 프롬프트 생성, OpenAI 호출        |
| OpenAI Responses API | 사이트 정보와 대화 맥락을 바탕으로 답변 생성                         |

브라우저에서 OpenAI API를 직접 호출하는 구성은 사용하지 않습니다. 이유는 3가지입니다.

- API 키를 브라우저에 노출하지 않는다
- 모델, 프롬프트, 사이트 컨텍스트를 서버 측에서 업데이트할 수 있다
- 입력 길이, Origin, 요청 제한, 오류 처리를 1곳에 모을 수 있다

Astro + Cloudflare Pages의 경우 API 경계는 Cloudflare Pages Functions의 `/api/ai-contact`로 구현할 수 있습니다. Next.js라면 Route Handler, Hono나 Express라면 API 라우트로 대체하면 같은 방식으로 사용할 수 있습니다.

## 엔드포인트 계약을 간결하게 만들기

문의 AI 채팅 API로 전송하는 정보는 가능한 한 최소화합니다.

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

폼 입력값인 이름, 이메일 주소, 전화번호, 회사명 등은 AI 채팅에 보내지 않기로 했습니다. 문의 AI 채팅은 개인정보를 모으는 곳이 아니라, 방문자가 “어떤 서비스를 살펴봐야 하는지”, “어디로 상담해야 하는지”를 정리하는 입구이기 때문입니다.

대화 기록도 무제한으로 보내지 않습니다. 최근 몇 건만 보내고, 1개 메시지당 글자 수도 제한합니다. 이렇게 하면 프롬프트 비대화와 API 비용을 줄일 수 있습니다.

## 서버 측에서 입력과 호출을 제어하기

Cloudflare Pages Function 측에서는 다음 처리를 한곳에서 수행합니다.

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

구현의 핵심은 OpenAI를 호출하기 전에 반드시 입력을 간결하게 정돈하는 것입니다. AI API는 전달된 입력에 따라 비용이 발생합니다. 긴 입력, 불필요한 대화 기록, 외부 사이트에서 발생하는 연속 요청을 그대로 통과시키면 기능 면보다 운영 면이 먼저 불안정해집니다.

`OPENAI_MODEL`는 환경 변수로 지정해 두면 모델을 변경하거나 preview 환경에서 검증하기 편합니다. `OPENAI_API_KEY`는 당연히 서버 측 환경 변수로만 관리합니다.

Cloudflare Pages 배포와 CSP에 관한 내용은 [Cloudflare Pages로 구현하는 안전한 정적 사이트 배포](/insights/cloudflare-pages-security/)에서도 정리했습니다.

## 사이트 정보를 컨텍스트로 명시하기

이 정도 규모의 사이트라면 처음부터 벡터 DB나 RAG를 도입할 필요는 없습니다. 먼저 공개된 사이트 정보의 핵심을 구조화해 프롬프트에 전달하는 편이 구현과 운영 모두 간편합니다.

예를 들어 다음과 같은 정보를 서버 측에서 구성합니다.

- 회사와 서비스 개요
- 각 서비스의 대상, 상담 예시, 관련 URL
- FAQ에서 이미 답변한 내용
- 문의 폼, LINE, 이메일, 전화의 사용 구분
- 요금, 계약, 납기 등 AI가 단정해서는 안 되는 영역
- locale별 내부 URL

중요한 점은 모델이 “알 것 같은 내용”을 답하게 하는 것이 아니라, “이 사이트의 입장에서 답해도 되는 정보”를 전달하는 것입니다.

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

페이지 수가 많지 않을 때는 이 방식으로 충분합니다. 페이지 수, 업데이트 빈도, 검색 요구가 늘어나면 Pagefind, CMS의 JSON, D1, Vectorize 등을 사용해 검색 계층을 추가할지 검토하면 됩니다.

## 프롬프트에는 답변보다 규칙을 작성하기

문의 AI 채팅의 프롬프트에는 자연스러운 문장을 작성하라는 지시보다 답변 범위와 금지 사항을 명확히 적습니다.

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

AI 채팅에서 흔히 발생하는 문제는 서비스를 좋게 보이게 하려다 모델이 단정해 버리는 것입니다. 예를 들어 “얼마에 할 수 있나요?”, “언제까지 납품할 수 있나요?”, “반드시 대응할 수 있나요?” 같은 질문에는 일반적인 안내만 제공하고, 공식적인 답변은 폼으로 연결해야 합니다.

이는 법률 문제에만 국한되지 않습니다. 견적이나 납기는 사전 상담 전에 확정할 수 없기 때문입니다. 프롬프트에는 영업상 편리한 답변보다 운영 측면에서 책임질 수 있는 답변의 범위를 적습니다.

## 문의 경로의 역할 나누기

AI 채팅은 폼을 대체하지 않습니다. 문의 페이지 전체에서 경로를 다음과 같이 나누면 운영하기 쉽습니다.

| 경로        | 역할                                                              |
| ----------- | ----------------------------------------------------------------- |
| FAQ         | 자주 묻는 질문을 페이지 안에서 먼저 해결한다                      |
| AI 채팅     | 서비스 선택, 상담 대상, 관련 페이지를 대화로 정리한다             |
| LINE        | 짧은 상담, Schools 관련 연락, 간단한 확인에 사용한다              |
| 폼          | 견적, 제작 상담, 제휴, 채용 등 기록을 남기고 싶은 상담에 사용한다 |
| 직접 연락처 | 폼 제출 후 보충 설명이나 긴급한 확인이 필요한 경우에만 연다       |

[서비스 페이지](/services/)와 같은 개요 콘텐츠와 [문의 페이지](/contact/)의 구체적인 접수 경로를 AI가 연결하면, 방문자는 페이지를 다시 찾아볼 필요가 없습니다.

이 설계는 BtoB 사이트, 제작 회사 사이트, 스쿨 사이트, SaaS 지원 경로에도 응용할 수 있습니다. AI가 문의를 끝까지 처리하도록 하는 대신 다음에 볼 페이지나 연락 방법을 좁히는 용도로 쓰면 도입하기 쉽습니다.

## locale별 URL을 유지하기

다국어 사이트에서는 AI 답변의 언어뿐 아니라 링크 대상 URL도 locale에 맞춰야 합니다.

예를 들어 영어 페이지에서 질문을 받으면 답변도 영어로 하고, 서비스 페이지 링크도 `/en/services/`처럼 locale이 포함된 URL을 사용합니다. 일본어 페이지라면 `/services/`을 사용합니다.

이 처리는 프롬프트에 맡기기보다 서버 측 URL 생성 함수에서 결정하는 편이 안정적입니다.

```ts
function localizePath(path: string, locale: Locale) {
  if (locale === "ja") return path;
  return `/${locale}${path}`;
}
```

AI 답변만 일본어 URL로 되돌아가면 다국어 경로가 깨집니다. 다국어 블로그와 번역 운영의 기반은 [Sveltia CMS로 다국어 블로그를 운영하는 방법](/blog/copilot-translation-pipeline/)에 정리했습니다.

## Origin 확인과 요청 제한 적용하기

`/api/ai-contact`은 공개 API이므로 최소한 Origin 확인, 입력 길이 제한, 대화 기록 제한, 요청 제한을 적용합니다.

Origin 확인에서는 `Origin` 헤더가 있을 경우 요청 출처와 API 호스트가 일치하는지 확인합니다. 다른 사이트에서 임의로 호출하는 상황을 줄이기 위해서입니다.

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

요청 제한은 우선 IP 기반의 간단한 제한만으로도 효과가 있습니다. Cloudflare 환경에서는 `CF-Connecting-IP`, `X-Forwarded-For`, `CF-Ray` 등을 사용해 식별할 수 있습니다.

다만 인메모리 요청 제한은 여러 isolate에 걸치거나 재시작한 뒤에도 유지되는 영속적인 제한은 아닙니다. 소규모 사이트의 초기 방어 장치로는 쓸 수 있지만, 접속이 늘어나면 Cloudflare WAF, Turnstile, KV, D1, Durable Objects 등으로 옮기는 편이 안정적입니다.

콘텐츠 업데이트를 위한 CMS 설계는 [Sveltia CMS 도입 가이드](/blog/cms-selection-and-turnstile/)에서 따로 정리했습니다. 폼이나 댓글의 봇 방지는 Turnstile 등 별도의 계층으로 다룹니다. Cloudflare만으로 댓글 기능을 만드는 설계는 [Cloudflare만으로 Astro 블로그에 댓글 기능을 만드는 방법](/blog/cloudflare-only-blog-comments/)에 정리했습니다.

## Markdown 링크는 허용 목록으로 렌더링하기

AI 답변에 링크를 포함하면 서비스 안내에 편리합니다. 다만 Markdown을 그대로 HTML에 삽입하는 것은 피해야 합니다.

채팅 UI에서는 허용된 표현만 DOM으로 변환합니다.

- 문단
- 글머리 기호 목록
- 굵은 글씨
- 인라인 코드
- Markdown 링크

링크 대상은 더욱 제한합니다.

- `/services/`와 같은 동일 사이트 내부 경로
- 현재 origin
- `https://acecore.net`
- 공식 LINE
- 필요한 경우 `mailto:info@acecore.net`
- 필요한 경우 `tel:0120987370`

이때 URL은 반드시 `trim()` 후에 판정합니다. AI는 `[サービス一覧]( /services/ )`처럼 URL 앞뒤에 공백을 포함해 반환할 수 있습니다.

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

Markdown 사양을 완전히 구현하려 하기보다 채팅에서 사용하는 표현으로 범위를 좁혀 견고하게 처리하는 편이 관리하기 쉽습니다. 외부 URL을 자유롭게 표시하려는 경우에도 최소한 도메인 허용 목록과 `rel="noopener noreferrer"`를 적용해야 합니다.

## 로컬, preview, 프로덕션에서 확인할 사항

로컬 Astro dev나 preview만으로는 Cloudflare Pages Functions 실행 환경과 완전히 일치하지 않습니다. `OPENAI_API_KEY`가 없는 환경에서는 AI 답변을 사용할 수 없으므로 UI의 대체 동작과 오류 표시를 확인합니다.

Pages preview 또는 프로덕션에서는 다음을 확인합니다.

- `/api/ai-contact`를 POST로 호출할 수 있다
- `OPENAI_API_KEY`와 `OPENAI_MODEL`이 설정되어 있다
- Origin이 다른 요청을 거부할 수 있다
- 입력 길이와 대화 기록 개수가 제한되어 있다
- 답변이 표시 locale에 맞는다
- 내부 링크가 locale이 포함된 URL로 되어 있다
- 견적이나 계약을 AI가 단정하지 않는다
- 이메일이나 전화번호가 항상 표시되지 않는다
- Markdown 링크가 안전한 URL로만 변환된다

AI 연동은 1번 질문해 답이 돌아오면 끝나는 게 아닙니다. 예상하지 못한 질문, 긴 입력, 영어 페이지에서 온 질문, 직접 연락처를 요구하는 질문, 요금을 묻는 질문을 각각 나누어 확인합니다.

## 로그와 운영에서 확인할 지표

문의 AI 채팅은 공개한 뒤 로그를 확인하는 것도 중요합니다.

최소한 다음 지표를 확인합니다.

- API 오류율
- 요청 제한에 걸린 횟수
- 문의 1건당 평균 메시지 수
- 폼이나 LINE으로 이동한 횟수
- AI가 답변하지 못해 폼으로 안내한 횟수
- locale별 이용 횟수

대화 내용을 저장한다면 개인정보 취급 방식을 먼저 정해야 합니다. 우선은 대화 본문을 저장하지 않고 이벤트 수나 오류만 확인하는 방식으로 시작하는 편이 안전합니다.

## 이번에 분리한 범위

이번 글에서는 문의 AI 채팅의 기술 설계만 다뤘습니다. 이와 관련해 서비스 페이지에서 문의 폼으로 상담 대상을 전달하는 경로도 구현했으며, 이에 대해서는 [서비스 CTA에서 문의 폼으로 맥락을 전달하는 기술 설계](/blog/service-cta-contact-prefill/)에서 별도로 정리했습니다.

이유는 다루는 주제가 다르기 때문입니다.

- AI 채팅: 대화로 고민을 정리하고 안전하게 안내한다
- 서비스별 CTA: 읽고 있는 서비스의 맥락을 폼에 전달한다

전자는 AI, API 경계, 프롬프트, 안전한 렌더링에 관한 내용입니다. 후자는 폼 UX와 경로 설계에 관한 내용입니다. 분리하는 편이 읽기 쉽고 나중에 내부 링크도 추가하기 편합니다.

## 정리

정적 사이트에 문의 AI 채팅을 통합할 때는 채팅 UI보다 API 경계와 답변 제어를 먼저 설계하는 것이 중요합니다.

이번 구현에서 특히 효과적이었던 점은 다음과 같습니다.

- 브라우저가 아니라 Cloudflare Pages Function에서 OpenAI API를 호출한다
- 엔드포인트 입력을 간소화하고 대화 기록과 글자 수를 제한한다
- 사이트 정보와 locale별 URL을 서버 측에서 구성한다
- AI가 단정해도 되는 내용과 안 되는 내용을 프롬프트에 작성한다
- 폼, LINE, 직접 연락처의 역할을 나눈다
- Origin 확인과 요청 제한을 적용한다
- Markdown 링크는 trim한 뒤 허용 목록 방식으로 렌더링한다

정적 사이트에서도 문의 AI 채팅은 충분히 구현할 수 있습니다. 도입의 핵심은 AI를 눈에 띄게 만드는 것이 아니라 방문자가 안전하게 다음 행동을 선택할 수 있도록 하는 것입니다.
