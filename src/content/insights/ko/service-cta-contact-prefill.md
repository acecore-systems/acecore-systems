---
title: "서비스 CTA에서 문의 폼으로 맥락을 이어 주는 기술 설계"
description: "서비스 페이지에서 읽던 맥락을 문의 폼으로 전달하기 위한 구현 설계입니다. Astro 사이트의 미니 CTA, URL 매개변수 계약, 폼 유형의 초기 선택, 제목 prefill, 다국어 URL, GA 측정, 생성된 HTML 확인까지 다른 사이트에서도 활용할 수 있도록 정리합니다."
date: 2026-06-07T13:00
lastUpdated: "2026-10-09T15:00:00+09:00"
author: gui
tags: ["기술", "웹사이트", "서비스", "Astro", "CMS"]
image: https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=400&fit=crop&q=80
callout:
  type: info
  title: 이 글의 핵심
  text: 서비스 페이지의 CTA는 단순히 폼으로 보내기만 해서는 약한 전환 경로입니다. 사용자가 읽던 서비스 맥락을 URL로 전달하고, 폼에서 문의 유형과 제목을 초기화하면 입력할 때의 망설임과 수신 측의 분류 업무를 동시에 줄일 수 있습니다.
processFigure:
  title: 서비스 CTA에서 폼으로 맥락을 전달하는 흐름
  steps:
    - title: 서비스
      description: 각 서비스 섹션의 CTA에 service key를 지정합니다.
      icon: i-lucide-panels-top-left
      accent: brand
    - title: URL
      description: /contact/?category=service&service=web#contact-form 같은 URL 계약으로 전달합니다.
      icon: i-lucide-link
      accent: amber
    - title: 폼
      description: 폼 측에서 해당하는 문의 유형과 제목을 미리 입력합니다.
      icon: i-lucide-file-input
      accent: emerald
    - title: 운영
      description: 수신 측에서는 문의 유형만으로 서비스 맥락을 판별할 수 있습니다.
      icon: i-lucide-inbox
      accent: slate
compareTable:
  title: CTA와 폼을 연결할 때의 차이
  before:
    label: 폼으로 바로 보내는 경우
    items:
      - 사용자가 폼에서 같은 서비스명을 다시 선택한다
      - 제목이 비어 있어 어떤 문의인지 파악하기 어렵다
      - 수신 측은 본문을 읽어야 대상 서비스를 파악할 수 있다
      - 서비스별 CTA의 효과 측정이 모호해진다
  after:
    label: 맥락을 이어받는 경우
    items:
      - CTA의 service key에서 문의 유형을 미리 선택할 수 있다
      - 제목에 서비스명을 넣어 문의 내용을 정리할 수 있다
      - 수신 측은 문의 유형을 보기만 해도 분류할 수 있다
      - GA label과 URL 매개변수로 CTA별 확인이 쉽다
checklist:
  title: 도입 시 설계 점검 항목
  items:
    - text: URL 매개변수에는 짧고 안정적인 service key만 사용한다
    - text: 폼 수신 값은 사용자에게 보이는 문구가 아니라 운영상 안정적인 값으로 설정한다
    - text: 알 수 없는 service key는 서비스 전반으로 대체한다
    - text: 제목은 비어 있을 때만 미리 입력한다
    - text: hidden 항목을 늘리기 전에 기존 문의 유형으로 분류할 수 있는지 확인한다
    - text: locale별 문의 URL을 서버 측에서 생성한다
    - text: CTA에 GA label과 location을 지정해 효과를 측정할 수 있게 한다
    - text: build 후 생성 HTML에서 CTA 수, option 수, hidden 항목 유무를 확인한다
linkCards:
  - href: /services/
    title: 서비스
    description: 서비스별 CTA가 배치된 경로의 시작점입니다.
    icon: i-lucide-panels-top-left
  - href: /contact/
    title: 문의하기
    description: URL 매개변수를 받아 유형과 제목을 초기화하는 폼입니다.
    icon: i-lucide-message-square
  - href: /blog/astro-ai-contact-chat/
    title: 문의 AI 채팅의 기술 설계
    description: 대화로 문의 대상을 정리하는 경로를 다룬 관련 글입니다.
    icon: i-lucide-sparkles
faq:
  title: 자주 묻는 질문
  items:
    - question: hidden 항목으로 상담 대상 서비스를 보내지 않는 이유는 무엇인가요?
      answer: "2026년 6월 당시에는 기존 문의 유형만으로 분류하고 hidden 항목을 늘리지 않는 설계였습니다. 현재 Systems 폼은 분류 값과 별도로 service・from・entry를 연동용 hidden 항목에 저장합니다."
    - question: URL 매개변수를 변조해도 괜찮나요?
      answer: 알 수 없는 service key는 서비스 전반으로 대체합니다. 전송 값은 폼 측 option에서 선택되므로, URL 값을 그대로 수신 값으로 사용하지 않는 설계입니다.
    - question: 다국어 사이트에서는 어떻게 처리하나요?
      answer: CTA 링크는 locale별로 생성하고 폼 표시 라벨도 번역합니다. 한편 수신 값은 일본어의 안정적인 분류명으로 맞추면 수신 측 운영이 흔들리지 않습니다.
---

> **2026년 9월 추가:** 아래의 `ServiceSectionActions`와 `service=web` 예시는 2026년 6월 Acecore 공식 사이트에서 사용한 구성을 기록한 것입니다. 현재 Acecore Systems에서는 [서비스 상세의 CTA](https://github.com/acecore-systems/acecore-systems/blob/main/src/components/ServiceDetailPage.astro)가 `category`, `service`, `from`, `entry`을 포함하고, [문의 폼](https://github.com/acecore-systems/acecore-systems/blob/main/src/pages/contact.astro)이 짧은 service key를 검증해 유형과 제목을 초기화합니다. 현재는 측정·연동용 hidden 항목도 사용하므로, 아래의 ‘hidden 항목을 사용하지 않는다’는 설계를 현행 사양처럼 복사하지 마세요. URL 값을 신뢰하지 않고 폼 선택지에 대응시키는 원칙은 계속 유효합니다.

서비스 페이지를 읽은 사용자가 ‘이 내용으로 상담하고 싶다’고 생각했을 때, 단순히 문의 폼으로 보내기만 하면 맥락이 조금 사라집니다.

사용자는 폼에서 서비스 유형을 다시 선택하고 제목도 직접 다시 써야 합니다. 수신 측도 본문을 읽기 전에는 ‘웹 제작 문의인지’, ‘서버 운영인지’, ‘Aceserver인지’를 판단하기 어렵습니다.

Acecore 사이트에서는 [서비스 CTA에서 문의 폼으로 상담 대상을 전달하는 PR](https://github.com/acecore-systems/acecore-net/pull/100)을 통해 이 경로를 개선했습니다. 이 글에서는 Astro 구현 기록뿐 아니라 다른 웹사이트에서도 활용할 수 있는 전환 경로 설계로 정리합니다.

## CTA 하나로 폼 초기화를 검증하기

유효한 service key, 알 수 없는 key, 제목을 입력한 상태에서 뒤로 가기 동작을 테스트합니다. 유형이 허용된 선택지에 대응하는지, 제목을 덮어쓰지 않는지 확인하고, locale별 URL에서도 동일한 값 계약을 사용합니다. URL에는 개인정보나 자유 형식의 입력값을 넣지 않고, 짧은 식별자만으로 문의 맥락을 전달합니다.

[MDN URLSearchParams: URL 매개변수 읽기 사양](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams)

## 목적은 폼 입력을 줄이는 것이 아니다

이 구현의 목적은 폼 항목을 자동 입력해 편리해 보이게 만드는 것만이 아닙니다.

핵심은 서비스 페이지에서 생겨난 맥락을 문의 폼과 수신 운영에 정확히 전달하는 것입니다.

| 관점        | 개선하려는 점                                            |
| ----------- | -------------------------------------------------------- |
| 사용자      | 읽던 서비스를 다시 선택하는 수고를 줄인다                |
| 폼          | 문의 유형과 제목을 상담 내용에 맞게 초기화한다           |
| 수신 측     | 문의 유형만으로 상담 대상을 쉽게 분류한다                |
| 측정        | 어떤 서비스 CTA에서 상담이 시작됐는지 추적하기 쉽게 한다 |
| 다국어 경로 | locale에 맞는 문의 URL로 보낸다                          |

겉으로는 작은 미니 CTA지만, 설계 범위는 CTA, URL, 폼, 번역, 측정, 수신 운영까지 이어집니다.

## CTA 컴포넌트에 책임을 분리한다

각 서비스 섹션 끝에 ‘이 서비스에 대해 상담하기’ CTA를 둡니다.

처음에 피해야 할 것은 서비스 페이지의 각 섹션에 같은 링크 생성 로직과 GA 속성을 그대로 반복해서 쓰는 것입니다. 서비스가 7개라면 같은 작성 방식이 7번 나타납니다. 문구나 URL 사양을 바꾸려 할 때 일부를 빠뜨리기 쉽습니다.

그래서 문의 CTA를 모은 `ServiceSectionActions`를 만들었습니다.

```astro
---
import Icon from "./Icon.astro";
import { t, getLocalizedUrl, type Locale } from "../i18n";

interface Props {
  locale: Locale;
  gaLabel: string;
  gaLocation: string;
  serviceKey: string;
}

const { locale, gaLabel, gaLocation, serviceKey } = Astro.props;
const u = (path: string) => getLocalizedUrl(path, locale);
const contactUrl = `${u("/contact/")}?category=service&service=${encodeURIComponent(serviceKey)}#contact-form`;
---

<a
  href={contactUrl}
  class="ac-btn-outline gap-2 text-sm sm:w-auto"
  data-ga-event="cta_click"
  data-ga-label={gaLabel}
  data-ga-location={gaLocation}
  data-ga-destination={contactUrl}
>
  <Icon name="message-circle" class="text-sm" />
  {t(locale, "pages.services.miniCta")}
</a>
```

이 컴포넌트의 책임은 3가지입니다.

- locale에 맞는 문의 URL을 생성한다
- service key를 URL 매개변수에 넣는다
- GA 측정용 label과 location을 지정한다

CTA는 사용자의 행동 지점이므로 UI뿐만 아니라 측정 지점이기도 합니다. `data-ga-label`와 `data-ga-location`은 나중에 ‘어떤 서비스에서 상담이 시작됐는지’를 확인하기 위해 남겨 두었습니다.

## URL 매개변수를 폼과의 계약으로 삼는다

CTA에서 문의 폼으로 전달할 값은 URL 매개변수로 만들었습니다.

```txt
/contact/?category=service&service=web#contact-form
```

여기서 중요한 점은 URL에 넣는 값을 ‘표시 문구’로 만들지 않는 것입니다.

`Webサイト制作・運用について` 같은 표시 문구는 번역, 표기 흔들림, 향후 이름 변경의 영향을 받습니다. URL에는 `web`나 `server`처럼 짧은 service key만 넣습니다.

| 매개변수   | 역할                                       |
| ---------- | ------------------------------------------ |
| `category` | 서비스 문의로 처리하는 진입점임을 나타낸다 |
| `service`  | 대상 서비스를 나타내는 안정적인 key        |
| 해시       | 폼 위치로 스크롤하는 데 사용한다           |

URL 매개변수는 사용자가 수정할 수 있습니다. 따라서 폼 측에서는 URL 값을 그대로 전송 값으로 사용하지 않고, 기존 option에 매핑합니다.

<figure class="article-diagram" data-layout="flow" data-tone="teal" data-count="3" aria-labelledby="diagram-service-cta-contact-prefill">
  <figcaption>
    <strong id="diagram-service-cta-contact-prefill">문의 접수 내용을 관리 기록으로 전달하는 흐름</strong>
    <span>경로의 구현 단계를 나타냅니다. 실제 고객에게 연락하고 대응을 완료했는지는 별도로 확인해야 합니다.</span>
  </figcaption>
  <ol class="article-diagram__nodes">
    <li>
      <span class="article-diagram__symbol">
        <span aria-hidden="true">1</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
          <path d="M4 5h16v14H4z M4 7l8 6 8-6"/>
        </svg>
      </span>
      <strong>CTA의 맥락을 해석</strong>
      <span>안정적인 service key를 다국어 표시 URL과 허용된 폼 선택지 목록에 대응시킵니다.</span>
    </li>
    <li>
      <span class="article-diagram__symbol">
        <span aria-hidden="true">2</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
          <path d="M12 2l8 3v6c0 5-3 8-8 11-5-3-8-6-8-11V5z M8 12l3 3 5-6"/>
        </svg>
      </span>
      <strong>입력값과 권한을 검증</strong>
      <span>제목은 비어 있을 때만 미리 입력하고, API에서도 이용자 본인 여부와 작업 권한을 확인합니다.</span>
    </li>
    <li>
      <span class="article-diagram__symbol">
        <span aria-hidden="true">3</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
          <path d="M6 3h9l4 4v14H6z M15 3v5h4 M9 12h6 M9 16h6"/>
        </svg>
      </span>
      <strong>접수 기록으로 전달</strong>
      <span>접수 내용을 CRM 이력과 후속 작업에 반영하고, 담당자의 실제 대응 완료는 별도의 상태로 기록합니다.</span>
    </li>
  </ol>
</figure>

## 폼 측에서 분류표를 관리한다

문의 폼 측에서는 서비스별 분류를 배열로 관리합니다.

```ts
const serviceCategoryOptions = [
  {
    key: "server",
    value: "サーバー構築・運用について",
    label: t(locale, "pages.contact.formCategoryServiceServer"),
    subject: t(locale, "pages.services.server.title"),
  },
  {
    key: "web",
    value: "Webサイト制作・運用について",
    label: t(locale, "pages.contact.formCategoryServiceWeb"),
    subject: t(locale, "pages.services.web.title"),
  },
];
```

`key`, `value`, `label`, `subject`은 각각 역할이 다릅니다.

| 필드      | 역할                                       |
| --------- | ------------------------------------------ |
| `key`     | URL 매개변수에서 찾기 위한 안정적인 식별자 |
| `value`   | 폼 제출 시 수신 측에 전달되는 문의 유형    |
| `label`   | 화면에 표시할 번역된 선택지                |
| `subject` | 제목을 초기 입력할 때 사용할 서비스명      |

다국어 사이트라면 `label`은 locale에 맞게 번역합니다. 반면 `value`는 수신 측 분류에 사용하므로 일본어의 안정적인 값으로 정했습니다.

이는 제품에 따라 판단이 달라지는 부분입니다. CRM이나 외부 폼이 다국어 분류를 지원한다면 value도 locale별로 설정할 수 있습니다. 이번처럼 수신 측 운영을 단순하게 유지하려면 표시 라벨과 수신 값을 분리하는 편이 다루기 쉽습니다.

## option에 data 속성을 지정한다

폼의 select에는 서비스별 option을 출력합니다.

```astro
<select id="category" name="category" required>
  <option value="" disabled selected>
    {t(locale, "pages.contact.formCategoryPlaceholder")}
  </option>
  <option value="サービス全般について">
    {t(locale, "pages.contact.formCategoryService")}
  </option>
  {serviceCategoryOptions.map((option) => (
    <option
      value={option.value}
      data-service-key={option.key}
      data-service-subject={option.subject}
    >
      {option.label}
    </option>
  ))}
</select>
```

`data-service-key`은 URL의 `service`과 대조하는 데 사용합니다. `data-service-subject`은 제목을 만드는 데 사용합니다.

여기서도 URL 값을 그대로 `category.value`에 넣지 않는 것이 핵심입니다. 반드시 select 안의 option에서 선택해 알 수 없는 service key나 잘못된 값이 수신 값에 섞이지 않도록 합니다.

## 클라이언트 측에서 prefill한다

폼 초기화는 페이지 로드 후 실행되는 짧은 스크립트로 수행합니다.

```js
function initContactServicePrefill() {
  const form = document.getElementById("contact-form");
  if (!form || form.dataset.servicePrefillInitialized === "true") return;

  form.dataset.servicePrefillInitialized = "true";

  const url = new URL(window.location.href);
  const requestedCategory = url.searchParams.get("category");
  const requestedService = url.searchParams.get("service") || "";
  const category = document.getElementById("category");
  const subject = document.getElementById("subject");

  if (
    requestedCategory === "service" &&
    category instanceof HTMLSelectElement
  ) {
    const serviceOption = Array.from(category.options).find((option) => {
      return option.dataset.serviceKey === requestedService;
    });

    category.value = serviceOption?.value || "サービス全般について";
    category.dispatchEvent(new Event("input", { bubbles: true }));
    category.dispatchEvent(new Event("change", { bubbles: true }));

    if (
      serviceOption &&
      subject instanceof HTMLInputElement &&
      !subject.value.trim()
    ) {
      const template = form.dataset.serviceSubjectTemplate || "{service}";
      const serviceName =
        serviceOption.dataset.serviceSubject ||
        serviceOption.textContent?.trim() ||
        "";
      subject.value = template.replace("{service}", serviceName);
    }
  }
}
```

구현상 핵심은 다음 4가지입니다.

- 중복 초기화를 피하기 위해 `data-service-prefill-initialized`을 확인한다
- `category=service`일 때만 처리한다
- 알 수 없는 service key는 ‘서비스 전반에 대해’로 대체한다
- 제목은 비어 있을 때만 미리 입력한다

마지막 항목인 ‘제목은 비어 있을 때만’이 중요합니다. 사용자가 뒤로 가기를 하거나 브라우저 자동 완성으로 제목을 입력해 둔 경우, 임의로 덮어쓰면 사용 경험이 나빠집니다.

Astro의 View Transitions나 클라이언트 내비게이션이 있다면 일반적인 초기 로드뿐 아니라 `astro:page-load`에서도 초기화합니다.

```js
document.addEventListener("astro:page-load", initContactServicePrefill);
initContactServicePrefill();
```

## 해시로 폼 위치로 이동한다

CTA URL에는 `#contact-form`을 붙입니다.

```txt
/contact/?category=service&service=web#contact-form
```

문의 페이지에는 FAQ, LINE, 설명문, 폼 이외의 연락 수단 등이 있으므로 서비스 CTA에서 온 사용자는 폼 위치로 바로 이동하는 편이 자연스럽습니다.

다만 폼 측에서 초기화할 경우 스크롤 시점에 조금 주의해야 합니다. 요소가 렌더링된 뒤 스크롤하고 싶으므로 `requestAnimationFrame`을 사용합니다.

```js
if (window.location.hash === "#contact-form") {
  window.requestAnimationFrame(() => {
    form.scrollIntoView({ block: "start" });
  });
}
```

폼 위치로 이동하는 것은 작은 동작이지만, CTA의 의도와 폼이 표시되는 위치가 어긋나면 사용자가 헤맬 수 있습니다. 경로를 설계할 때는 URL, 초기 선택, 스크롤 위치까지 함께 살펴봅니다.

## hidden 항목을 늘리지 않기로 한 판단

이번에는 `相談対象サービス` hidden 항목을 추가하지 않았습니다.

문의 유형만으로 대상 서비스를 판별할 수 있게 하고 싶었기 때문입니다.

폼 항목을 늘리면 다음과 같은 확인 사항도 늘어납니다.

- 알림 이메일에 표시할지
- 관리 화면이나 스프레드시트에 열을 추가할지
- 기존 자동 회신 템플릿에 영향을 주는지
- CRM 연동이나 Webhook에서 사용할지
- 다국어 표시명과 수신 값을 어떻게 구분할지

기존 항목으로 필요한 정보를 표현할 수 있다면 항목을 늘리지 않는 편이 운영상 안정적입니다. 이번에는 `お問い合わせ種別`을 ‘서비스 전반’과 서비스별로 나누는 것만으로 수신 측에서 구분할 수 있게 했습니다.

물론 여러 서비스를 동시에 선택하거나, 광고 캠페인 ID도 저장하거나, CRM에서 별도 필드로 관리하는 등의 요구사항이 있다면 hidden 항목을 추가할 수도 있습니다.

## 다국어 사이트에서 고려할 점

다국어 사이트에서 이 경로를 만들 때는 3가지 값을 구분해 생각하면 혼동하지 않습니다.

| 종류      | 예시                          | locale 의존      |
| --------- | ----------------------------- | ---------------- |
| URL key   | `web`, `server`, `aceserver`  | 아니요           |
| 표시 라벨 | `About Website Design` 등     | 예               |
| 수신 값   | `Webサイト制作・運用について` | 운영에 따라 다름 |

URL key는 번역하지 않는 편이 안정적입니다. 링크 공유, 분석, 폼 측 대조에 사용하기 때문입니다.

표시 라벨은 반드시 번역합니다. 사용자가 폼에서 보는 문구이기 때문입니다.

수신 값은 운영 방식에 맞춥니다. 이번에는 일본어의 안정된 값으로 정했습니다. 다국어 표시와 수신 후의 사내 운영을 별개로 설계하면 폼을 다루기 쉬워집니다.

번역 흐름 자체는 [Sveltia CMS로 다국어 블로그를 운영하는 방법](/blog/copilot-translation-pipeline/)에서도 소개했습니다.

## 생성 HTML에서 확인한다

이런 구현은 컴포넌트만 살펴보는 것으로는 충분하지 않습니다. build 후 HTML에서 링크와 option이 실제로 출력되는지 확인합니다.

이번에 확인한 항목은 다음과 같습니다.

- `/services/`에 서비스별 CTA가 7개 출력된다
- 각 CTA에 `?category=service&service=...#contact-form`이 포함된다
- `/contact/`에 `data-service-key`가 지정된 option이 7개 출력된다
- ‘서비스 전반에 대해’와 서비스별 유형이 표시된다
- `相談対象サービス` hidden 항목은 출력되지 않는다

예를 들어 생성 HTML에 `rg`를 사용해 확인할 수 있습니다.

```powershell
rg -n "category=service&service=.*#contact-form" dist\services\index.html
rg -n "data-service-key" dist\contact\index.html
rg -n "相談対象サービス" dist\contact\index.html
```

마지막 확인은 출력되면 안 되는 것이 실제로 출력되지 않았는지 살펴보는 것입니다. 폼을 수정할 때는 추가한 항목뿐 아니라 추가하지 않기로 한 항목도 확인 대상에 넣습니다.

## AI 채팅과 역할을 나눈다

이 경로는 [문의 AI 채팅의 기술 설계](/blog/astro-ai-contact-chat/)와 잘 어울립니다. 다만 역할은 서로 다릅니다.

| 경로       | 잘하는 일                                 |
| ---------- | ----------------------------------------- |
| AI 채팅    | 어떤 서비스에 문의할지 대화로 정리한다    |
| 서비스 CTA | 읽고 있는 서비스의 맥락을 폼으로 전달한다 |
| 폼         | 정식 문의 내용을 접수하고 기록을 남긴다   |

AI 채팅은 사용자가 아직 고민 중인 단계에 적합한 경로입니다. 반면 서비스 페이지를 다 읽고 ‘이 서비스에 대해 문의하기’로 결정한 사용자라면 대화를 거치지 않고 폼으로 보내는 편이 자연스럽습니다.

경로를 추가할 때는 모든 경로에 같은 역할을 맡기지 않는 것이 중요합니다. 사용자의 상태에 맞춰 대화, CTA, 폼을 나누어 사용합니다.

## 정리

서비스 페이지에서 문의 폼으로 맥락을 이어 주는 구현은 겉으로 보이는 것보다 효과가 큽니다.

이번 설계에서 중요했던 점은 다음과 같습니다.

- CTA를 컴포넌트로 만들어 URL 생성과 측정 속성을 한곳에 모은다
- URL에는 표시 문구가 아닌 안정적인 service key를 넣는다
- 폼 측에서 service key를 option에 매핑한다
- 수신 값, 표시 라벨, 제목에 사용할 서비스명을 구분한다
- 알 수 없는 service key는 서비스 전반으로 대체한다
- 제목은 비어 있을 때만 미리 입력한다
- hidden 항목을 늘리지 않고 문의 유형으로 분류할 수 있게 한다
- build 후 생성 HTML에서 링크 수, option 수, 불필요한 항목의 부재를 확인한다

문의 폼 개선은 입력란을 줄이는 것만이 아닙니다. 사용자가 읽던 맥락을 수신 측까지 잃지 않고 전달하면 실제 문의 대응도 수월해집니다.

## 2026년 10월 6일 추가: 문의 접수에서 관리 기록까지

익명화한 연동 개선에서는 문의 접수, CRM 이력·작업에 반영, 담당자의 대응 완료를 서로 다른 상태로 다뤘습니다. URL 입력과 문의 경로를 검증하고, 경로 값은 안정적인 enum에 매핑합니다. 관리 화면의 URL을 알고 있다는 사실만으로 이력이나 작업을 변경할 권한을 부여하지 않습니다.

API에서도 이용자와 작업 권한을 확인하며, 고객 정보를 공개 검색이나 공개 AI 답변의 자료에 섞지 않습니다. 접수나 기록 구현을 완료했다고 해서 실제 고객 연락부터 업무 완료까지 전 과정을 검증했다고 주장하는 것은 아닙니다.

폼의 prefill과 사용자가 직접 입력한 내용을 구분하고, 회신이 필요한 접수에는 희망 연락 경로를 필수 고정 선택 항목으로 설정해 후속 작업에 전달합니다. UI와 API의 필수 조건, 담당자의 열람·추가 권한을 일치시키고 DB 변경 후 schema와 constraint를 확인합니다. 필요한 프로덕션 검증과 실제 고객의 전체 DB를 개발용으로 복제하는 일도 구분합니다.
