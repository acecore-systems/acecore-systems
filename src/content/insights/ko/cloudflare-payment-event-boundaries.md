---
title: "Workers에서 결제·환불 Webhook 안전하게 처리하기: 상태 대조와 관리"
description: "서명 검증, 중복·지연 이벤트, 환불 상태, 외부 API 응답을 구분하는 구현 사례입니다. 관리 작업 직전 권한을 다시 확인하는 방법도 다룹니다."
date: "2026-10-06T01:10:00+09:00"
lastUpdated: "2026-10-06T08:52:00+09:00"
author: gui
image: /images/insights/covers/cloudflare-payment-event-boundaries-cover-v1.webp
tags: ["Cloudflare Workers", "Stripe", "Security"]
callout:
  type: note
  title: "구현 확인과 실제 거래 작업을 구분합니다"
  text: "익명화한 이 사례에서는 구현, 테스트, 프로덕션 배포, 외부 API의 읽기 전용 대조를 확인했습니다. 테스트 목적으로 고객의 환불·취소·포인트 조정은 실행하지 않았으며 모든 결제 경로의 종단 간 검증을 주장하지 않습니다."
---

결제 서비스 이벤트를 받았다고 주문이나 환불이 완료되는 것은 아닙니다. 이 익명 사례는 Workers에서 운영 처리가 서비스 측 상태와 내부 기록을 대조하는 방법을 보여줍니다. 고객 정보, 실제 거래 식별자, 내부 알림 대상은 포함하지 않습니다.

## 진입점에서 서명을 검증하고 중복을 막습니다

변경되지 않은 원본 요청 본문으로 서명을 검증하고, 이벤트가 예상한 실서비스 또는 테스트 모드인지 확인합니다. 이벤트 처리 상태를 기록하고 처리 점유를 확보해 같은 이벤트가 재전송되어도 업무 작업이 반복되지 않게 합니다. 이벤트가 순서대로 도착한다는 보장은 아닙니다. [Stripe 공식 Webhook 안내](https://docs.stripe.com/webhooks)를 참고하세요.

## 지연된 환불 이벤트에는 현재 서비스 상태를 조회합니다

이 구현은 `refund.created`, `refund.updated`, `refund.failed`를 처리합니다. 관리 중인 환불은 Stripe의 현재 객체를 다시 가져와 지연 이벤트가 내부 기록을 과거 상태로 되돌리지 않게 합니다. 주문이 전액 환불되었는지 판단하기 전에 성공한 금액과 대기 중인 금액을 구분합니다.

금액, 통화, PaymentIntent, 주문과 작업을 연결하는 metadata, 이미 저장된 식별자를 확인합니다. 결제 ID는 `py_`, 환불 ID는 `pyr_` 접두사를 사용할 수 있습니다. 알려진 한 종류의 접두사와 다르다는 이유만으로 유효한 응답을 거절하지 않도록 구현을 조정했습니다. 접두사 지원을 늘려도 금액과 식별 조건을 완화하지 않습니다. 알 수 없는 값은 0으로 계산하지 않습니다.

## 환불·포인트·알림 결과를 분리합니다

환불 요청 전에 잔액과 권한을 확인하고, 외부 상태를 조회한 뒤 실제로 기록하기 직전에도 권한과 작업 만료 여부를 다시 확인합니다. 작업별 멱등성 키와 점유를 사용합니다. 외부 결과가 불확실하면 환불을 무조건 다시 요청하는 대신 현재 상태를 재대조합니다.

환불 성공과 포인트 조정 성공은 서로 다른 상태입니다. 후속 실패 때문에 환불을 다시 실행해서는 안 되며 필요한 재대조나 복구를 기록합니다. 알림 설정, 실제 수신, 담당자 후속 조치는 결제 이벤트 처리와 별도의 수락 항목입니다. 이 글은 알림이 운영 중이라고 주장하지 않습니다.

<figure class="article-diagram" data-layout="flow" data-tone="amber" data-count="3" aria-labelledby="diagram-cloudflare-payment-event-boundaries">
  <figcaption>
    <strong id="diagram-cloudflare-payment-event-boundaries">Webhook에서 업무 결과까지</strong>
    <span>완료로 기록하기 전에 현재 상태를 대조합니다. 고객 환불이나 포인트 조정은 실행하지 않았습니다.</span>
  </figcaption>
  <ol class="article-diagram__nodes">
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">1</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M4 5h16v14H4z"/><path d="M8 9h8M8 12h5M8 15h3"/></svg></span>
      <strong>진입점 검증</strong>
      <span>원본 body, mode, event ID를 확인하고 재전송과 처리 중 상태를 구분합니다.</span>
    </li>
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">2</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5M8 10h5"/></svg></span>
      <strong>현재 상태 대조</strong>
      <span>지연 event 때문에 기록을 되돌리지 않고 금액·통화·주문을 비교합니다.</span>
    </li>
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">3</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="4" y="5" width="6" height="14" rx="1"/><rect x="14" y="5" width="6" height="14" rx="1"/><path d="M11 12h2"/></svg></span>
      <strong>결과를 따로 기록</strong>
      <span>환불·포인트·알림 상태는 각각 다릅니다. 외부 결과가 불명확하면 재실행하지 말고 다시 대조합니다.</span>
    </li>
  </ol>
</figure>

## Node와 Workers 런타임에서 응답을 확인합니다

외부 fetch를 Node에서만 시험하면 Workers 런타임의 차이를 놓칠 수 있습니다. 이 사례는 `redirect: 'error'` 호환성 문제를 재현한 뒤 `redirect: 'manual'`과 명시적인 HTTP 상태 검사로 변경했습니다. 3xx 응답이나 오류 페이지를 일반 JSON으로 파싱하지 말고, 권한 정보를 붙인 채 다른 호스트로 자동 리디렉션하지 않습니다. [Workers Request API](https://developers.cloudflare.com/workers/runtime-apis/request/)를 참고하세요.

## 배포와 수락 범위를 기록합니다

데이터베이스 변경, 의존 처리, 관리 화면을 순서대로 반영했습니다. 테스트, CI, 프로덕션 읽기 전용 화면, 외부 서비스 API 조회와의 일관성을 확인했습니다. 테스트 목적으로 고객 금전 작업을 실행하지 않았습니다. CSV 내보내기에서 수식으로 해석될 수 있는 셀은 문자열로 처리하고, 알 수 없는 수수료를 0으로 바꾸지 않습니다.

관리 로그인 경계는 [여러 서비스의 세션 설계](/insights/multi-service-session-lifecycle/)를 참고하세요.
