---
title: "사용자 CSS와 공개 테마를 안전하게 다루기: 공유 원본, 렌더링 범위, 버전 고정"
description: "GUI와 직접 편집이 하나의 CSS 정본을 공유하는 프로필 편집 설계를 익명화해 설명합니다. 렌더링 범위 안의 폭넓은 CSS 문법, 임시 저장과 공개 버전, 불변 테마 버전, 목록에서 내리기와 운영 중지를 다룹니다."
date: "2026-10-06T01:10:00+09:00"
lastUpdated: "2026-10-09T15:00:00+09:00"
author: gui
image: /images/insights/covers/user-css-versioned-theme-safety-cover-v1.webp
tags: ["CSS", "Security", "Web"]
callout:
  type: note
  title: "구현 확인은 실제 사용자 전체 흐름 검증과 다릅니다"
  text: "버전 고정 테마 스토어의 데이터베이스 변경, 프로덕션 배포, 테스트 데이터 표시를 확인했습니다. CSS 정본을 GUI 편집과 공유하도록 확장한 변경은 main 병합과 CI 통과까지 확인했지만, 이 감사 범위에서는 프로덕션 반영과 로그인 사용자 인수 테스트를 확인하지 못했습니다. 실제 사용자의 테마 제출부터 적용까지의 전체 흐름과 유료 판매도 입증하지 않았습니다."
---

GUI로 프로필의 색상과 간격을 조정하고 CSS로 전체 레이아웃도 편집할 수 있는 기능은 사용성과 공개 페이지에 표시되는 코드의 안전성을 모두 고려해야 합니다. 익명화한 구현 사례를 바탕으로 편집과 배포의 경계를 살펴봅니다.

## 스타일 자유도와 배포 기능을 따로 선택하기

자신의 프로필만 편집한다면 먼저 영역 스코프와 저장 충돌을 검증합니다. 타인에게 배포하려면 고정 버전 ID, 이용 조건, 중지 후 기본 표시가 추가로 필요합니다. Grid와 의사 요소를 포함한 작은 테마로 외부 내비게이션이 유지되고 작성자 새 버전에도 적용된 버전이 바뀌지 않는지 시험하세요.

[W3C Selectors：선택자 적용 범위 확인](https://www.w3.org/TR/selectors-4/)

## GUI와 직접 편집이 하나의 CSS 정본을 공유하기

이후 확장에서는 전체 CSS를 테마의 정본으로 삼고 GUI도 같은 CSS 선언을 편집하도록 변경했습니다. 직접 작성한 주석, GUI가 관리하지 않는 선언, 반응형 규칙은 보존합니다. GUI 설정과 추가 CSS를 따로 두던 기존 형식도 편집 가능한 전체 스타일시트로 이어받습니다. 목록 표시용 보조 설정만 바꿔서 렌더링 CSS까지 변경됐다고 간주하지 않습니다.

backend와 frontend 확장은 각각 main에 병합했고 CI와 구현 테스트를 확인했습니다. 이 감사 범위에서는 이것이 프로덕션 반영이나 로그인 사용자의 전체 흐름 검증을 증명하지 않습니다.

## 렌더링 경계 안에서 폭넓은 CSS 문법 지원하기

작은 속성 허용 목록에 의존하던 초기 제한을 넓혀 Grid와 Flex, 변수, 그라데이션, 의사 요소, 변형, 애니메이션, @media·@supports·@container 등의 규칙을 지원합니다. 그렇다고 검사 없이 임의의 CSS를 삽입하는 것은 아닙니다. 구문 트리를 분석하고 모든 선택자 분기를 지정된 프로필 영역의 하위 요소로 한정합니다. 조건부 규칙 안에도 같은 경계를 적용하며, 영역 밖의 운영 경로와 라이선스 표시는 테마 대상에서 제외합니다. 선택자 규격은 [W3C Selectors](https://www.w3.org/TR/selectors-4/)에서 확인할 수 있습니다.

공개 CSS의 변수명과 keyframes 이름은 고유한 이름으로 바꿔 바깥 UI의 변수나 다른 테마의 애니메이션과 충돌하지 않게 합니다. 편집을 위해 원래 이름은 보존합니다. 바깥 렌더링 wrapper에는 containment와 isolation도 적용해 광범위한 레이아웃 규칙의 영향을 프로필 영역 안으로 제한합니다.

외부 리소스 가져오기, @import·@font-face 같은 전역 규칙, 분석할 수 없는 문법, CSS nesting, HTML의 style 종료 문자열, 이름을 안전하게 확정할 수 없는 애니메이션 참조는 거부합니다. 입력과 생성된 결과의 용량도 검사합니다. 공개할 때와 snapshot을 불러올 때 범위, 고유 이름, 검증된 canonical CSS 문자열이 일치하는지 다시 확인합니다. 폭넓은 문법을 지원한다고 모든 브라우저에서 같은 모양으로 렌더링된다는 보장은 없습니다.

## 미리보기, 임시 저장, 공개를 분리하기

테마를 시험하거나 적용하면 임시 저장 내용이 바뀝니다. 소유자가 공개하기 전에는 공개 페이지가 바뀌지 않습니다. 직접 작성한 CSS를 다시 편집할 수 있는 것과 방문자에게 그 원문을 전달하는 것도 별개입니다. 저장 계약은 충돌을 감지하고 같은 작업의 재시도로 버전이나 임시 저장 내용이 중복 갱신되지 않도록 합니다.

## 다른 작성자의 업데이트가 사용 중인 디자인을 바꾸지 않게 하기

테마에서 수정 가능한 목록 정보와 불변 버전을 분리합니다. 사용자는 버전 ID를 지정해 가져오며 작성자가 새 버전을 내도 기존 임시 저장 내용이나 공개 버전은 자동으로 바뀌지 않습니다. 편집 후에도 적용한 출처와 버전, 이용 조건의 출처를 유지합니다. 공개 프로필이 다시 비공개로 바뀌어도 작성자 임시 저장의 이름과 이미지가 배포 테마에 유출되면 안 됩니다.

## 목록에서 내리기와 운영 중지를 구분하기

작성자가 테마를 목록에서 내리면 새로 찾거나 적용하는 것을 막지만, 기존 고정 버전 사용을 즉시 취소하는 것은 아닐 수 있습니다. 위험한 테마를 운영자가 중지할 때는 공개 조회와 기존 snapshot의 CSS를 차단하고 기본 모양으로 되돌립니다. 이전 snapshot으로 되돌릴 때도 현재 중지 상태를 확인해 중지 전 CSS가 다시 활성화되지 않게 합니다.

<figure class="article-diagram" data-layout="flow" data-tone="violet" data-count="3" aria-labelledby="diagram-user-css-versioned-theme-safety">
  <figcaption>
    <strong id="diagram-user-css-versioned-theme-safety">CSS 편집에서 고정 버전 게시까지</strong>
    <span>코드 통합, CI, 이전 Store 버전의 프로덕션 배포를 확인했습니다. CSS 확장의 프로덕션/로그인 수락, 실제 사용자 적용, 유료 판매는 확인되지 않았습니다.</span>
  </figcaption>
  <ol class="article-diagram__nodes">
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">1</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="m8 6-5 6 5 6M16 6l5 6-5 6M14 4l-4 16"/></svg></span>
      <strong>공유 CSS 정본</strong>
      <span>GUI와 직접 편집이 같은 CSS 정본을 사용하고 손으로 쓴 규칙을 유지합니다.</span>
    </li>
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">2</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M8 8h8M8 12h5M8 16h8"/></svg></span>
      <strong>분석해 범위를 제한</strong>
      <span>Grid/Flex·변수·가상 요소·반응형 규칙·애니메이션을 지원합니다. 외부·전역·분석 불가 입력은 거부합니다.</span>
    </li>
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">3</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/></svg></span>
      <strong>명시적으로 버전 공개</strong>
      <span>미리보기/임시 저장 후 불변 버전을 공개합니다. 목록에서 내리기와 운영 중지는 별도입니다.</span>
    </li>
  </ol>
</figure>

## 공개 전에 확인할 항목

범위 밖 선택자, 외부 요청, 입력 용량, 저장 충돌, 재시도, 작성자 프로필의 비공개 전환, 목록에서 내리기, 운영 중지, 되돌리기를 확인합니다. 버전 고정 스토어의 프로덕션 배포와 테스트 데이터 표시는 확인했지만, 이 감사 범위에서는 CSS 편집 확장의 프로덕션 반영과 로그인 사용자 인수 테스트를 확인하지 못했습니다. 이전 확인 시점의 공개 테마 수는 0개였으며 현재 공개 수를 뜻하지 않습니다. 실제 사용자가 테마를 제출하고 적용하는 전체 흐름이나 유료 판매는 입증되지 않았습니다. 이용 조건을 정해도 브라우저에 전달된 CSS의 복사를 완전히 막을 수는 없습니다.

편집 입력 측은 [프로필 정보의 임시 저장 가져오기](/insights/profile-import-draft-boundaries/), CMS 운영은 [Sveltia CMS 안내](/insights/cms-selection-and-turnstile/)를 참고하세요.
