---
title: "AI 채팅 응답의 Markdown 링크를 안전하게 렌더링하는 구현 설계"
description: "AI 채팅 응답에 포함된 Markdown 링크를 HTML로 안전하게 변환하기 위한 구현 메모입니다. URL 앞뒤의 공백을 허용하되 trim, 허용 목록, DOM 생성, fallback, 테스트 사례를 각각 분리해 생각하면 다른 사이트에도 재사용하기 쉬운 렌더러가 됩니다."
date: 2026-06-07T14:30
lastUpdated: "2026-11-12T00:00:00+09:00"
author: gui
tags: ["기술", "웹사이트", "AI", "보안", "Astro"]
image: "/images/insights/covers/ai-chat-markdown-link-safety-cover-v2.webp"
callout:
  type: tip
  title: 이 글의 핵심
  text: AI 응답은 신뢰할 수 있는 HTML이 아닙니다. Markdown 링크를 편리하게 사용하더라도 URL은 trim한 다음 허용 목록으로 판정하고, 허용할 수 없는 것은 링크로 만들지 않고 텍스트로 남기는 설계를 합니다.
processFigure:
  title: AI 응답 링크 렌더링 흐름
  steps:
    - title: 텍스트
      description: 모델의 응답은 먼저 일반 텍스트로 취급한다.
      icon: i-lucide-message-square-text
      accent: brand
    - title: 파싱
      description: 필요한 Markdown 표현만 작은 파서로 추출한다.
      icon: i-lucide-brackets
      accent: amber
    - title: 검증
      description: href를 trim하고 내부 URL이나 허용된 도메인만 통과시킨다.
      icon: i-lucide-shield-check
      accent: emerald
    - title: 렌더링
      description: innerHTML 대신 DOM API로 안전한 요소만 만든다.
      icon: i-lucide-code-2
      accent: slate
compareTable:
  title: Markdown 링크 렌더링에서 구분해야 할 판단
  before:
    label: 허술하게 렌더링하는 경우
    items:
      - AI 응답을 innerHTML에 직접 넣는다
      - Markdown 사양 전체를 한꺼번에 구현하려 한다
      - URL 앞뒤의 공백 때문에 링크 생성에 실패한다
      - "외부 URL과 javascript:를 같은 방식으로 취급한다"
  after:
    label: 작고 안전하게 렌더링하는 경우
    items:
      - 응답을 텍스트로 받고 필요한 표현만 DOM으로 만든다
      - 채팅에서 사용하는 Markdown만 지원한다
      - URL은 trim한 후 안전성을 검사한다
      - 허용할 수 없는 URL은 링크로 만들지 않고 문자열로 표시한다
checklist:
  title: 도입 체크리스트
  items:
    - text: AI 응답을 HTML로 신뢰하지 않는다
    - text: Markdown 링크 URL 앞뒤의 공백을 허용한다
    - text: href는 반드시 trim한 뒤 검증한다
    - text: 내부 경로, 동일 origin, 필요한 외부 도메인만 허용한다
    - text: 외부 링크에는 target과 rel을 명시한다
    - text: 허용할 수 없는 링크는 텍스트로 남긴다
    - text: 정상 사례뿐 아니라 위험한 URL과 잘못된 Markdown도 테스트한다
linkCards:
  - href: /blog/astro-ai-contact-chat/
    title: 문의 AI 채팅의 기술 설계
    description: AI 응답, API 경계, 프롬프트 제어까지 다룬 상위 문서입니다.
    icon: i-lucide-sparkles
  - href: /insights/cloudflare-pages-security/
    title: Cloudflare Pages 보안 설정
    description: CSP와 보안 헤더를 정리한 관련 문서입니다.
    icon: i-lucide-shield
  - href: /contact/
    title: 문의하기
    description: AI 채팅과 양식이 배치된 실제 사용자 경로입니다.
    icon: i-lucide-message-square
faq:
  title: 자주 묻는 질문
  items:
    - question: markdown-it이나 marked를 사용하면 충분한가요?
      answer: 라이브러리를 사용하더라도 HTML 출력 처리, 허용할 링크 대상, target 및 rel 속성 부여, 위험한 URL 거부는 별도로 설계해야 합니다. 채팅 용도라면 작은 자체 렌더러만으로 충분한 경우도 있습니다.
    - question: URL 앞뒤의 공백을 허용하면 위험하지 않나요?
      answer: 공백 자체를 허용하는 것이 위험한 게 아니라, trim한 뒤 무엇을 허용할지가 중요합니다. trim한 href를 허용 목록으로 검사하면 모델의 표기 차이에 더 잘 대응하면서 안전성을 유지할 수 있습니다.
    - question: 허용할 수 없는 URL은 삭제해야 하나요?
      answer: 대부분의 경우 삭제하는 것보다 텍스트로 표시하는 편이 디버깅하기 쉽고 사용자에게도 답변의 맥락이 남습니다. 다만 의심스러운 문자열을 완전히 숨기려는 운영 방식이라면 링크 전체를 제거할 수도 있습니다.
---

AI 응답 링크가 문자열 그대로 남는다면, 먼저 같은 입력을 분석, URL 검증, DOM 렌더링 순으로 처리해 어느 단계에서 실패하는지 파악합니다. 표시 문자열에는 [MDN: textContent](https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent)와 같은 텍스트용 API를 사용하고, 링크를 만들 수 있는지 여부와 HTML 해석을 뒤섞지 않는 것이 기존 채팅에 적용하는 출발점입니다.

AI 채팅에 “자세한 내용은 [서비스 목록](/services/)을 확인하세요”라고 답하도록 하면, 링크로 표시되지 않고 Markdown 문자열이 그대로 남는 경우가 있습니다.

Acecore 사이트에서도 문의 AI 채팅의 답변에 URL 앞뒤 공백이 포함된 Markdown 링크가 섞였기 때문에, [AI 채팅 Markdown 링크 렌더링을 수정한 PR](https://github.com/acecore-systems/acecore-net/pull/99)에서 렌더러를 조정했습니다.

이 글에서는 이 작은 수정에서 출발해 AI 응답을 DOM으로 안전하게 변환하기 위한 사고방식을 정리합니다.

## AI 응답은 신뢰할 수 있는 HTML이 아니다

먼저 전제로 삼아야 할 것은 AI 응답을 HTML이 아니라 텍스트로 취급하는 것입니다.

채팅 UI에서는 링크, 굵은 글씨, 글머리 기호 목록 정도는 사용하고 싶어집니다. 그러나 응답을 그대로 `innerHTML`에 넣으면 모델이 출력한 문자열을 브라우저가 해석하게 됩니다.

필요한 것은 Markdown을 전부 구현하는 일이 아닙니다. 채팅에 필요한 표현만 작게 추려 안전한 DOM만 만드는 것입니다.

## 문제는 공백만이 아니다

이번에 직접 발생한 버그는 다음과 같은 링크였습니다.

```md
[サービス一覧](/services/)
```

Markdown으로는 사람이 뜻을 이해할 수 있지만, URL 부분을 “공백이 포함되지 않는 문자열”로 정규식에서 추출하면 일치하지 않습니다.

수정 전에는 이런 식으로 생각했습니다.

```js
/\[([^\]]+)\]\(([^)\s]+)\)/;
```

`[^)\s]+`는 공백을 허용하지 않으므로, `( /services/ )`를 링크로 추출하지 못합니다. 그래서 괄호 안에서는 앞뒤 공백을 허용하고, 실제로 사용할 URL은 나중에 trim합니다.

```js
/\[([^\]]+)\]\(\s*([^)]+?)\s*\)/;
```

여기서 중요한 것은 정규식을 느슨하게 하고 끝내지 않는 것입니다. 느슨하게 한 다음에는 반드시 정규화와 안전성 검사를 추가합니다.

## href는 trim한 다음 검증한다

링크 생성 순서는 고정합니다.

1. Markdown에서 label과 raw href를 추출한다
2. raw href를 `trim()`한다
3. trim을 마친 href를 허용 목록으로 검증한다
4. 허용할 수 있는 경우에만 `<a>`를 만든다

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

`trim()` 하기 전의 값이 아니라 실제로 DOM에 넣을 값을 검증합니다. 검증한 값과 렌더링할 값이 달라지면 안전성 검사의 의미가 약해집니다.

## 허용 목록은 제품마다 정한다

AI 채팅에서 안내해도 되는 URL은 사이트마다 다릅니다.

Acecore의 문의 AI에서는 대략 다음 범위로 제한하고 있습니다.

| 종류        | 예                        | 판단                             |
| ----------- | ------------------------- | -------------------------------- |
| 내부 경로   | `/services/`              | 허용한다                         |
| 동일 origin | `https://acecore.net/...` | 허용한다                         |
| 공식 LINE   | `https://lin.ee/...`      | 목적이 명확하므로 허용한다       |
| mailto      | `mailto:info@acecore.net` | 필요한 고정 수신 주소만 허용한다 |
| tel         | `tel:0120987370`          | 필요한 고정 번호만 허용한다      |
| 기타 외부   | 임의의 URL                | 원칙적으로 링크로 만들지 않는다  |

구현 예시는 다음과 같습니다.

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

이 함수는 사이트마다 다르게 정해야 합니다. 채용 사이트라면 구인 플랫폼을, EC라면 결제나 배송 추적을, SaaS라면 문서나 상태 페이지를 허용할 수도 있습니다.

## 허용할 수 없는 링크는 텍스트로 되돌린다

안전성 검사에 실패한 링크를 어떻게 처리할지도 설계의 일부입니다.

문의 AI의 경우 링크로 만들 수 없는 Markdown을 완전히 지우는 것보다 원래 문자열로 남기는 편이 다루기 쉽습니다. 사용자에게는 맥락이 남고, 개발자는 “AI가 무엇을 출력했는지” 확인할 수 있습니다.

즉, 파서는 “안전한 링크를 만드는 것”뿐 아니라 “안전하게 만들 수 없을 때 일반 텍스트로 표시하는 것”도 책임져야 합니다.

## 처음부터 테스트 사례를 마련한다

이런 렌더러는 정상 사례만 살펴보면 놓치는 부분이 생깁니다.

최소한 다음 사례를 확인합니다.

| 입력                                | 기대 결과                              |
| ----------------------------------- | -------------------------------------- |
| `[サービス一覧](/services/)`        | 내부 링크가 된다                       |
| `[サービス一覧]( /services/ )`      | trim된 후 내부 링크가 된다             |
| `[LINE]( https://lin.ee/example )`  | 외부 링크로 열린다                     |
| `[危険](javascript:alert(1))`       | 링크로 만들지 않는다                   |
| `[外部](https://example.com/)`      | 허용하지 않는다면 링크로 만들지 않는다 |
| `[壊れたリンク](/services/`         | 텍스트로 표시한다                      |
| `` `code` と [link]( /contact/ ) `` | 코드와 링크가 각각 렌더링된다          |

PR #99에서는 `[サービス一覧]( /services/ )`, `[サービス一覧](/services/)`, `[LINE]( https://lin.ee/DjIrdqj )`가 같은 URL로 처리되는 것을 확인했습니다.

## Markdown 전체를 구현하지 않기로 한 이유

AI 채팅에서 사용하는 Markdown은 제한할 수 있습니다.

- 문단
- 글머리 기호 목록
- 굵게
- 인라인 코드
- 링크

표, 이미지, HTML, 각주, 여러 단계의 깊은 제목까지 지원하면 렌더러의 책임이 갑자기 커집니다. 채팅 UI에서는 읽기 쉽게 안내할 수 있으면 충분합니다.

필요해지면 검증된 Markdown 라이브러리를 사용하는 방법도 있습니다. 다만 이 경우에도 “HTML을 허용할지”, “URL을 어떻게 제한할지”, “외부 링크에 무엇을 추가할지”는 별도로 결정해야 합니다.

## 요약

AI 채팅의 Markdown 링크 렌더링은 겉보기에는 사소한 수정처럼 보입니다. 하지만 실제로는 AI 출력을 어느 정도 신뢰할 것인지에 대한 경계 설계입니다.

구현에서 중요한 점은 다음과 같습니다.

- AI 응답은 HTML이 아니라 텍스트로 취급한다
- 필요한 Markdown만 작게 DOM으로 만든다
- Markdown 링크 URL 앞뒤의 공백을 허용한다
- href는 trim한 다음 안전성을 검사한다
- 허용 목록으로 내부 URL과 필요한 외부 URL만 통과시킨다
- 허용할 수 없는 링크는 텍스트로 남긴다
- 잘못된 Markdown과 위험한 URL을 테스트한다

AI를 사이트의 사용자 경로에 통합할수록 응답 텍스트를 어떻게 렌더링할지가 중요해집니다. 편리한 Markdown 지원과 안전한 링크 제어는 같은 구현 안에서 함께 다뤄야 합니다.
