---
title: "공개 이미지의 엣지 캐시와 API 요청 제한을 분리하기"
description: "반복해서 탐색할 때 콘텐츠 API와 이미지 요청이 같은 제한을 공유했던 사례입니다. 공개 이미지 재사용, 정상 응답 검증, WAF와 애플리케이션의 경계, 프로덕션 확인을 다룹니다."
date: "2026-10-06T02:20:00+09:00"
lastUpdated: "2026-10-09T15:00:00+09:00"
author: gui
image: /images/insights/covers/public-image-cache-and-api-rate-limits-cover-v1.webp
tags: ["Cloudflare", "Performance", "Web"]
callout:
  type: note
  title: "캐시와 요청 제한을 각각 확인하기"
  text: "이 사례에서는 구현, CI, GitHub 연동을 통한 프로덕션 배포와 대표 이미지의 콘텐츠 및 캐시 상태 대조를 확인했습니다. 모든 데이터 센터의 캐시 적중률이나 고부하에서의 성능 개선율을 측정한 결과는 아닙니다."
---

이미지가 포함된 일기나 카탈로그에서는 날짜나 페이지를 바꿀 때마다 콘텐츠 API와 이미지 요청이 함께 발생합니다. 반복 탐색 중 이미지가 멈춘 사례를 운영 URL, 내부 경로, 제한값을 공개하지 않고 설명합니다.

## 이미지 한 장부터 연속 열람 재현하기

같은 공개 이미지를 반복 조회하여 최초와 재조회 시 body 해시, status, 캐시 상태를 비교합니다. 다음으로 일반 페이지 전환에서 본문과 여러 이미지를 조회해 어떤 요청이 제한 횟수에 포함되는지 확인합니다. HIT만으로 성공을 판단하지 않고 이미지 내용과 API 보호를 함께 시험하세요.

[Cloudflare Cache API：조건부 조회와 지역별 캐시](https://developers.cloudflare.com/workers/runtime-apis/cache/)

## 콘텐츠와 이미지가 같은 요청 제한을 사용했다

이 사례에서는 동적 API 요청과 공개 이미지 GET 요청을 같은 WAF 요청 제한 규칙으로 집계했습니다. 일반적인 페이지 전환만으로도 여러 요청이 겹쳐 콘텐츠는 불러오면서 이미지에만 제한이 걸릴 수 있었습니다.

이미지에 엣지 캐시를 추가해도 WAF가 캐시에 도달하기 전에 차단하는 요청에는 도움이 되지 않습니다. 원본 부하를 줄이는 변경과 같은 제한에서 집계할 요청을 정하는 변경을 따로 적용했습니다. 기존 애플리케이션 제한과 생성 처리 quota는 각 목적에 따라 유지합니다.

## 공유할 수 있는 공개 이미지만 재사용하기

여기서 다루는 이미지는 불변 이미지로, 같은 공개 asset ID는 항상 같은 콘텐츠를 반환합니다. asset ID 형식, 요청 경계, Service Binding 설정을 검증한 뒤에만 같은 host와 asset ID로 지정된 캐시 항목을 조회합니다. 캐시가 이미 채워져 있어도 이 진입 시 확인을 생략하지 않습니다.

콘텐츠에 영향을 주지 않는 query string과 최종 사용자 요청 헤더 때문에 같은 이미지의 캐시를 분할하지 않습니다. 이는 불변 공개 이미지라는 전제가 있어서 가능한 선택입니다. 사용자나 조직에 따라 내용이 달라지는 비공개 이미지에 그대로 적용할 수는 없습니다.

## 검증된 200 응답만 저장하기

캐시가 없으면 비공개 Service Binding에서 이미지를 가져옵니다. HTTP status, 이미지 Content-Type, Content-Length, 응답 body를 검증하고 조건을 충족하는 200 응답만 저장합니다. 부분 응답, 빈 body, 잘못된 metadata, 오류 응답은 저장하지 않습니다.

이미지 본문을 저장하는 것과 ETag가 일치할 때 304를 반환하는 것은 별개입니다. 캐시 쓰기는 waitUntil에 예약하며, 캐시 읽기나 쓰기 실패가 원본에서 정상적으로 가져온 유효한 이미지의 반환을 막지 않도록 했습니다. 이후 요청에서 캐시를 사용할 수 있으면 Service Binding 가져오기를 생략할 수 있습니다.

[Cloudflare Cache API](https://developers.cloudflare.com/workers/runtime-apis/cache/) 문서에서 ETag 조건부 요청과 데이터 센터별 캐시의 특성을 확인할 수 있습니다. 한 데이터 센터의 HIT가 모든 데이터 센터의 HIT를 뜻하지는 않습니다. Pages Functions 응답 헤더는[정적 파일용 _headers](https://developers.cloudflare.com/pages/configuration/headers/)만으로 설정할 수 없으므로 Function에서 관리합니다.

## 동적 API의 제한은 별도로 다루기

동적 API 보호는 이미지 캐시와 별도의 요구사항입니다. 이 사례에서는 공개 이미지 GET을 WAF 집계에서 제외했고, 변경 적용 후 대상 동적 API, 제한 기간, action, 활성 상태를 다시 읽어 확인했습니다. 되돌릴 수 있도록 이전 설정도 저장했습니다.

일반 탐색에서 발생하는 요청 수와 보호할 작업의 부하를 기준으로 임계값을 선택합니다. [Cloudflare 요청 제한](https://developers.cloudflare.com/waf/rate-limiting-rules/)의 plan별 조건도 확인해야 합니다. 저장소 운영 메모에 값이 적혀 있다는 사실만으로 프로덕션 규칙이 활성화됐다고 판단할 수 없습니다.

<figure class="article-diagram" data-layout="boundary" data-tone="teal" data-count="2" aria-labelledby="diagram-public-image-cache-and-api-rate-limits">
  <figcaption>
    <strong id="diagram-public-image-cache-and-api-rate-limits">공개 이미지와 동적 API</strong>
    <span>변하지 않는 공개 이미지의 재사용과 동적 API 보호를 별도로 설계합니다. 비공개 이미지는 대상이 아닙니다.</span>
  </figcaption>
  <ol class="article-diagram__nodes">
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">1</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="m21 15-5-5L5 20"/></svg></span>
      <strong>공개 이미지 GET</strong>
      <span>요청 경계를 확인한 뒤 같은 이미지를 캐시에서 재사용합니다. 검증된 200 응답만 저장합니다.</span>
    </li>
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">2</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M12 3 20 6v5c0 5-3.4 8.5-8 10-4.6-1.5-8-5-8-10V6l8-3Z"/><path d="m9 12 2 2 4-4"/></svg></span>
      <strong>동적 API</strong>
      <span>WAF와 앱 quota로 API 처리를 보호합니다. 제한은 이미지 캐시와 분리합니다.</span>
    </li>
  </ol>
</figure>

## 프로덕션에서 이미지 내용까지 확인하기

단위 테스트에서는 동일한 공개 이미지의 재사용, host 및 asset ID별 분리, 캐시 사용 전 경계 확인, 304, 캐시 장애, 저장하면 안 되는 응답을 확인했습니다. CI 이후 GitHub push를 통한 프로덕션 deployment와 custom domain을 확인하고, 대표 이미지의 HTTP 결과, 애플리케이션이 표시하는 HIT·MISS 상태, 가져온 bytes의 hash를 대조했습니다.

운영 환경에서 본문과 여러 이미지를 연속으로 가져와, 해당 정상 열람 시험 조건에서는 요청 제한에 걸리지 않음을 확인했습니다. 이는 제한된 요청 패턴의 확인이며, 높은 부하에서의 경계를 시험한 결과는 아닙니다.

캐시 상태 표시만으로 올바른 이미지가 반환됐다고 증명할 수는 없습니다. 콘텐츠 가져오기, 이미지 가져오기, WAF 설정, UI에서의 탐색 결과를 각각 확인합니다. 이 기록은 대표 이미지 전달 확인까지이며 모든 사용자·데이터 센터의 연속 탐색이나 고부하 성능 개선율을 입증하지는 않습니다.

사이트의 정적·동적 영역 구분은 [Astro와 Cloudflare 전체 설계](/insights/astro-cloudflare-site-architecture/)를, 이미지·CSS 등 리소스 전달 최적화는 [Astro 성능 조정](/insights/astro-performance-tuning/)을 참고하세요.
