---
title: "서비스 CTA의 문맥을 문의 폼으로 이어 주는 기술 설계"
description: "서비스 페이지에서 읽던 문맥을 문의 폼으로 전달하는 구현 설계입니다. Astro 사이트의 미니 CTA, URL 파라미터 계약, 폼 분류 초기 선택, 제목 prefill, 다국어 URL, GA 측정, 생성 HTML 확인까지 다른 사이트에도 적용할 수 있게 정리합니다."
date: 2026-06-07T13:00
author: gui
tags: ["기술", "웹사이트", "서비스", "Astro", "CMS"]
image: https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=400&fit=crop&q=80
callout:
  type: info
  title: 이 글의 핵심
  text: 서비스 페이지의 CTA가 단순히 폼으로 보내기만 하면 동선이 약합니다. 사용자가 읽던 서비스 문맥을 URL로 전달하고 폼에서 문의 분류와 제목을 초기화하면 입력할 때의 망설임과 수신 측 분류 작업을 동시에 줄일 수 있습니다.
processFigure:
  title: 서비스 CTA에서 폼으로 문맥을 전달하는 흐름
  steps:
    - title: Service
      description: 각 서비스 섹션의 CTA에 service key를 둡니다.
      icon: i-lucide-panels-top-left
      accent: brand
    - title: URL
      description: /contact/?category=service&service=web#contact-form 같은 URL 계약으로 전달합니다.
      icon: i-lucide-link
      accent: amber
    - title: Form
      description: 폼에서 해당 문의 분류와 제목을 초기 입력합니다.
      icon: i-lucide-file-input
      accent: emerald
    - title: Ops
      description: 수신 측은 문의 분류만으로 서비스 문맥을 판단할 수 있습니다.
      icon: i-lucide-inbox
      accent: slate
compareTable:
  title: CTA와 폼을 연결할 때의 차이
  before:
    label: 단순히 폼으로 보내는 경우
    items:
      - 사용자가 폼에서 같은 서비스명을 다시 선택함
      - 제목이 비어 있어 무엇에 관한 상담인지 알기 어려움
      - 수신 측이 본문을 읽어야 대상 서비스를 판단할 수 있음
      - 서비스별 CTA 효과 측정이 모호해짐
  after:
    label: 문맥을 이어 주는 경우
    items:
      - CTA의 service key로 문의 분류를 초기 선택할 수 있음
      - 제목에 서비스명을 넣어 상담 내용을 정리할 수 있음
      - 수신 측은 문의 분류만 보고 분류할 수 있음
      - GA label과 URL 파라미터로 CTA별 확인이 쉬움
checklist:
  title: 도입 시 설계 체크
  items:
    - text: URL 파라미터에는 짧고 안정적인 service key만 사용한다
    - text: 폼 수신 값은 사용자 표시 문구가 아니라 운영상 안정적인 값으로 한다
    - text: 알 수 없는 service key는 서비스 일반 문의로 fallback한다
    - text: 제목은 비어 있을 때만 초기 입력한다
    - text: hidden 필드를 늘리기 전에 기존 문의 분류만으로 분류 가능한지 확인한다
    - text: locale별 문의 URL을 서버 측에서 생성한다
    - text: CTA에 GA label과 location을 달아 효과를 측정할 수 있게 한다
    - text: build 후 생성 HTML에서 CTA 수, option 수, hidden 필드 유무를 확인한다
linkCards:
  - href: /services/
    title: 서비스
    description: 서비스별 CTA가 있는 동선의 진입점입니다.
    icon: i-lucide-panels-top-left
  - href: /contact/
    title: 문의
    description: URL 파라미터를 받아 분류와 제목을 초기화하는 폼입니다.
    icon: i-lucide-message-square
  - href: /blog/astro-ai-contact-chat/
    title: 문의 AI 채팅 기술 설계
    description: 대화로 상담할 곳을 정리하는 동선을 다룬 관련 글입니다.
    icon: i-lucide-sparkles
faq:
  title: 자주 묻는 질문
  items:
    - question: hidden 필드로 상담 대상 서비스를 보내지 않는 이유는 무엇인가요?
      answer: 수신 측에서 확인할 필드를 늘리지 않고 기존 문의 분류만으로 분류하기 위해서입니다. 폼 필드가 늘수록 운영과 알림 템플릿의 확인 지점도 늘어납니다.
    - question: URL 파라미터가 변조되어도 괜찮나요?
      answer: 알 수 없는 service key는 서비스 일반 문의로 fallback합니다. 전송 값은 폼의 option에서 선택하므로 URL 값을 그대로 수신 값으로 사용하지 않습니다.
    - question: 다국어 사이트에서는 어떻게 처리하나요?
      answer: CTA 링크를 locale별로 생성하고 폼 표시 라벨도 번역합니다. 반면 수신 값은 안정적인 일본어 분류명으로 통일하면 수신 측 운영이 흔들리지 않습니다.
---

서비스 페이지를 읽은 사용자가 “이 내용으로 상담하고 싶다”고 생각했을 때 단순히 문의 폼으로 보내기만 하면 문맥이 일부 사라집니다.

사용자는 폼에서 서비스 종류를 다시 선택하고 제목도 작성해야 합니다. 수신 측도 본문을 읽기 전에는 웹 제작 상담인지, 서버 운영인지, Aceserver인지 판단하기 어렵습니다.

Acecore 사이트에서는 [서비스 CTA의 상담 대상을 문의 폼으로 전달하는 PR](https://github.com/acecore-systems/acecore-net/pull/100)로 이 동선을 개선했습니다. 이 글은 Astro 구현 기록뿐 아니라 다른 웹사이트에서도 재사용할 수 있는 동선 설계로 정리합니다.

## 목적은 폼 입력을 줄이는 것만이 아니다

이 구현은 폼 필드를 자동 입력해 편해 보이게 만드는 것만을 목적으로 하지 않습니다.

본질은 서비스 페이지에서 생긴 문맥을 문의 폼과 수신 운영에 올바르게 전달하는 것입니다.

| 관점        | 개선하려는 점                              |
| ----------- | ------------------------------------------ |
| 사용자      | 읽던 서비스를 다시 선택하는 수고를 줄임    |
| 폼          | 상담 내용에 맞춰 문의 분류와 제목을 초기화 |
| 수신 측     | 문의 분류만으로 상담 대상을 쉽게 분류      |
| 측정        | 어느 서비스 CTA에서 상담이 시작됐는지 추적 |
| 다국어 동선 | locale에 맞는 문의 URL로 이동              |

겉보기에는 작은 미니 CTA지만 설계 범위는 CTA, URL, 폼, 번역, 측정, 수신 운영까지 이어집니다.

## CTA 컴포넌트로 책임을 분리하기

각 서비스 섹션 끝에 “이 서비스에 대해 상담하기” CTA를 둡니다.

서비스 페이지의 모든 섹션에 같은 링크 생성과 GA 속성을 직접 반복해서 쓰는 것은 피해야 합니다. 서비스가 7개라면 같은 구현이 7번 나오고, 문구나 URL 사양을 바꿀 때 누락되기 쉽습니다.

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

이 컴포넌트에는 세 가지 책임이 있습니다.

- locale에 맞는 문의 URL 생성
- service key를 URL 파라미터에 포함
- GA 측정용 label과 location 보유

CTA는 사용자 행동 지점이므로 UI이면서 측정 지점입니다. `data-ga-label`과 `data-ga-location`은 어느 서비스에서 상담이 시작됐는지 나중에 확인하기 위해 남깁니다.

## URL 파라미터를 폼과의 계약으로 삼기

CTA에서 폼으로 전달하는 값은 URL 파라미터입니다.

```txt
/contact/?category=service&service=web#contact-form
```

중요한 것은 URL에 표시 문구를 넣지 않는 것입니다.

`Webサイト制作・運用について` 같은 표시 문구는 번역, 표기 차이, 향후 명칭 변경의 영향을 받습니다. URL에는 `web`, `server` 같은 짧은 service key만 넣습니다.

| 파라미터   | 역할                                 |
| ---------- | ------------------------------------ |
| `category` | 서비스 상담으로 처리하는 진입점 표시 |
| `service`  | 대상 서비스를 나타내는 안정적인 key  |
| hash       | 폼 위치로 스크롤할 때 사용           |

URL 파라미터는 사용자가 편집할 수 있습니다. 따라서 폼에서는 URL 값을 그대로 전송하지 않고 기존 option으로 매핑합니다.

## 폼 측에 분류표 두기

문의 폼에서는 서비스별 분류를 배열로 둡니다.

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

`key`, `value`, `label`, `subject`는 역할이 각각 다릅니다.

| 필드      | 역할                                       |
| --------- | ------------------------------------------ |
| `key`     | URL 파라미터에서 찾기 위한 안정적인 식별자 |
| `value`   | 폼 전송 시 수신 측에 전달되는 문의 분류    |
| `label`   | 화면에 표시되는 번역된 option              |
| `subject` | 제목 초기 입력에 쓰는 서비스명             |

다국어 사이트에서 `label`은 locale에 맞게 번역합니다. `value`는 수신 측 분류에 쓰므로 안정적인 일본어 값으로 유지했습니다.

이는 제품마다 판단이 다릅니다. CRM이나 외부 폼이 다국어 분류를 지원하면 value도 locale별로 둘 수 있습니다. 이번처럼 수신 운영을 단순하게 하려면 표시 라벨과 전송 값을 분리하는 편이 관리하기 쉽습니다.

## option에 data 속성 두기

폼 select에는 서비스별 option을 출력합니다.

```astro
<select id="category" name="category" required>
  <option value="" disabled selected>
    {t(locale, "pages.contact.formCategoryPlaceholder")}
  </option>
  <option value="サービス全般について">
    {t(locale, "pages.contact.formCategoryService")}
  </option>
  {
    serviceCategoryOptions.map((option) => (
      <option
        value={option.value}
        data-service-key={option.key}
        data-service-subject={option.subject}
      >
        {option.label}
      </option>
    ))
  }
</select>
```

`data-service-key`는 URL의 `service`와 대조하고, `data-service-subject`는 제목을 만들 때 사용합니다.

여기서도 URL 값을 `category.value`에 직접 넣지 않는 것이 핵심입니다. 반드시 select 안의 option을 선택해 알 수 없는 service key나 잘못된 값이 전송 값에 섞이지 않게 합니다.

## 클라이언트에서 prefill하기

페이지를 읽은 뒤 작은 스크립트로 폼을 초기화합니다.

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

구현상의 포인트는 네 가지입니다.

- `data-service-prefill-initialized`를 확인해 중복 초기화를 피함
- `category=service`일 때만 처리
- 알 수 없는 service key는 `サービス全般について`로 fallback
- 제목은 비어 있을 때만 초기 입력

마지막 항목이 중요합니다. 뒤로 가기나 브라우저 자동 완성으로 제목이 남아 있을 때 덮어쓰면 경험이 나빠집니다.

Astro View Transitions나 클라이언트 내비게이션을 쓰면 일반 초기 로드뿐 아니라 `astro:page-load`에서도 초기화합니다.

```js
document.addEventListener("astro:page-load", initContactServicePrefill);
initContactServicePrefill();
```

## hash로 폼 위치로 이동하기

CTA URL에는 `#contact-form`이 있습니다.

```txt
/contact/?category=service&service=web#contact-form
```

문의 페이지에는 FAQ, LINE, 설명, 다른 연락 수단도 있을 수 있으므로 서비스 CTA에서 온 사용자는 폼으로 바로 이동하는 편이 자연스럽습니다.

폼을 초기화할 때는 스크롤 시점에 주의합니다. 요소가 렌더링된 뒤 스크롤하도록 `requestAnimationFrame`을 사용합니다.

```js
if (window.location.hash === "#contact-form") {
  window.requestAnimationFrame(() => {
    form.scrollIntoView({ block: "start" });
  });
}
```

작은 동작이지만 CTA 의도와 보이는 폼 위치가 어긋나면 사용자가 헤맵니다. URL, 초기 선택, 스크롤 위치를 하나로 설계합니다.

## hidden 필드를 늘리지 않은 이유

이번에는 `相談対象サービス` hidden 필드를 추가하지 않았습니다.

문의 분류만으로 대상 서비스를 판단하게 하려는 목적입니다.

폼 필드를 늘리면 확인할 것도 늘어납니다.

- 알림 메일에 표시할지
- 관리 화면이나 스프레드시트에 열을 추가할지
- 기존 자동 회신 템플릿에 영향을 주는지
- CRM 연동이나 Webhook에서 처리할지
- 다국어 표시명과 수신 값을 어떻게 나눌지

필요한 정보를 기존 필드로 표현할 수 있다면 필드를 늘리지 않는 편이 운영이 안정적입니다. `お問い合わせ種別`를 서비스 일반과 서비스별 분류로 나눠 수신 측이 판단하게 했습니다.

여러 서비스를 동시에 선택하거나 광고 캠페인 ID를 보관하거나 CRM의 별도 필드가 필요하면 hidden 필드를 추가할 수 있습니다.

## 다국어 사이트에서의 접근

세 가지 값을 나눠 생각하면 혼란이 줄어듭니다.

| 종류      | 예                            | locale 의존 |
| --------- | ----------------------------- | ----------- |
| URL key   | `web`, `server`, `aceserver`  | 안 함       |
| 표시 라벨 | `About Website Design` 등     | 함          |
| 수신 값   | `Webサイト制作・運用について` | 운영에 따름 |

URL key는 공유, 분석, 폼 대조에 쓰므로 번역하지 않는 편이 안정적입니다.

표시 라벨은 사용자가 보는 문구이므로 반드시 번역합니다.

수신 값은 운영에 맞춥니다. 여기서는 안정적인 일본어 값을 사용했습니다. 다국어 표시와 전송 후 내부 운영을 분리하면 폼 관리가 쉬워집니다.

번역 흐름은 [Sveltia CMS로 다국어 블로그를 운영하는 방법](/blog/copilot-translation-pipeline/)에서도 소개합니다.

## 생성 HTML 확인하기

이 구현은 컴포넌트만 봐서는 충분하지 않습니다. build 후 HTML에서 링크와 option이 실제로 출력됐는지 확인합니다.

확인 항목은 다음과 같습니다.

- `/services/`에 서비스별 CTA 7개가 있음
- 각 CTA가 `?category=service&service=...#contact-form`을 가짐
- `/contact/`에 `data-service-key`가 있는 option 7개가 있음
- `サービス全般について`와 서비스별 분류가 있음
- `相談対象サービス` hidden 필드가 없음

예를 들어 생성 HTML에 `rg`를 사용할 수 있습니다.

```powershell
rg -n "category=service&service=.*#contact-form" dist\services\index.html
rg -n "data-service-key" dist\contact\index.html
rg -n "相談対象サービス" dist\contact\index.html
```

마지막 검사는 나오면 안 되는 것이 없음을 확인합니다. 폼 수정에서는 추가한 것뿐 아니라 추가하지 않기로 한 것도 확인 대상입니다.

## AI 채팅과의 역할 분담

이 동선은 [문의 AI 채팅 기술 설계](/blog/astro-ai-contact-chat/)와 잘 맞지만 역할은 다릅니다.

| 동선       | 잘하는 일                           |
| ---------- | ----------------------------------- |
| AI 채팅    | 어느 서비스에 상담할지 대화로 정리  |
| 서비스 CTA | 읽고 있는 서비스 문맥을 폼으로 전달 |
| 폼         | 공식 상담 내용을 받고 기록을 남김   |

AI 채팅은 사용자가 아직 고민하는 단계에 강합니다. 서비스 페이지를 다 읽고 해당 서비스에 상담하기로 정한 사용자에게는 대화 없이 폼으로 보내는 편이 자연스럽습니다.

동선을 늘릴 때 모두 같은 역할을 주지 마세요. 사용자 상태에 따라 대화, CTA, 폼을 구분합니다.

## 정리

서비스 페이지 문맥을 문의 폼으로 전달하는 구현은 작은 외형 변화 이상으로 효과가 있습니다.

중요한 설계 포인트는 다음과 같습니다.

- CTA를 컴포넌트화해 URL 생성과 측정 속성을 모음
- 표시 문구가 아니라 안정적인 service key를 URL에 사용
- 폼 측에서 service key를 option으로 매핑
- 수신 값, 표시 라벨, 제목용 서비스명을 분리
- 알 수 없는 service key는 서비스 일반 문의로 fallback
- 제목은 비어 있을 때만 초기 입력
- hidden 필드를 늘리지 않고 문의 분류로 구분
- build 후 생성 HTML에서 링크 수, option 수, 불필요한 필드 부재 확인

문의 폼 개선은 입력 칸을 줄이는 것만이 아닙니다. 사용자가 읽던 문맥을 수신 측까지 잃지 않고 전달하면 실제 상담 처리가 쉬워집니다.
