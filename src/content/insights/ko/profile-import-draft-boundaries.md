---
title: "프로필 정보를 초안으로 가져오기: 비교·선택·게시 경계"
description: "텍스트, CSV, 정적 HTML, 공통 JSON으로 프로필을 가져오는 일반화된 구현을 설명합니다. 현재 값 비교, 선택 항목 교체와 취소, 저장과 게시의 분리 범위를 다룹니다."
date: "2026-10-06T01:10:00+09:00"
lastUpdated: "2026-10-06T08:52:00+09:00"
author: gui
image: /images/insights/covers/profile-import-draft-boundaries-cover-v1.webp
tags: ["Web", "Import", "Security"]
callout:
  type: note
  title: "구현은 확인했고 실제 계정 수락은 남아 있습니다"
  text: "텍스트, CSV, 정적 HTML, 공통 JSON 가져오기는 구현·통합·프로덕션 배포가 확인됐습니다. 실제 계정에서 가져오기부터 저장과 게시까지의 수락은 완료되지 않았습니다. 서비스별 URL 자동 수집과 이미지·음성 이동은 완료 범위에 포함되지 않습니다."
---

기존 프로필을 다른 편집기로 옮길 때는 값을 교체하기 전에 현재 값과 가져오기 후보를 비교해야 합니다. 이 익명 사례를 통해 데이터 가져오기와 프로필 게시의 경계를 설명합니다.

## 먼저 지원 입력 형식을 정합니다

기존 텍스트, CSV, 정적 HTML 입력에 더해 이제 공통 JSON 파일을 읽고 템플릿을 내려받을 수 있습니다. 붙여 넣은 내용이나 파일을 분석하는 것과 URL에 접속해 데이터를 가져오는 것은 다릅니다. 서비스별 전용 내보내기 형식, URL 자동 수집, 이미지·음성 이동, 동적 페이지, 외부 서비스 API는 완료되지 않았습니다.

HTML은 입력 데이터로만 취급합니다. 공개 페이지에서 script를 실행하거나 가져온 HTML 자체를 렌더링하지 않습니다. 글자 수, 항목, 링크, 입력 형식에 제한을 두고 원본을 프로필에 필요한 텍스트 후보로 변환합니다.

## 기존 값을 바꾸기 전에 후보를 검토합니다

분석 결과를 바로 게시하지 않고 현재 값과 먼저 비교합니다. 소유자가 항목별로 선택하고 편집기 적용 전에 후보 값을 수정할 수 있습니다. 선택한 항목을 적용하면 현재 값이 교체되므로 매번 가져오기 차이를 확인해야 합니다. 적용을 취소할 수도 있습니다. 이 기능이 다른 화면이나 다른 사람이 한 편집과의 충돌을 자동으로 해결한다고 보장하지는 않습니다.

## 공통 JSON과 서비스별 지원을 구분합니다

화면에는 7개 활동 서비스의 지원 상태가 표시됩니다. 공통 형식의 데이터를 읽을 수 있다고 해서 각 서비스 URL에서 프로필을 직접 가져올 수 있다는 뜻은 아닙니다. 지원하지 않는 URL은 내용을 붙여 넣어 가져오도록 안내합니다. 7개 서비스의 상태를 표시하는 것과 각 서비스의 전용 내보내기나 API 연동을 구현한 것은 다릅니다.

합성 데이터를 이용해 JSON 가져오기, 기존 값 비교, 선택 항목 적용, 취소, 모바일 화면을 확인했습니다. 실제 계정에서 가져오기부터 저장과 게시까지의 수락은 별도로 확인해야 합니다.

## 가져온 텍스트로 자격이나 권리를 추론하지 않습니다

소개 글이나 외부 페이지의 표현만으로 자격, 소속, 카테고리, 라이선스를 확정하지 않습니다. 후보로 가져올 수 있는 설명과 신원 확인이나 신청이 필요한 정보를 구분합니다. 외부 정보가 바뀌어도 소유자가 확인한 프로필을 자동으로 수정하거나 게시하지 않습니다.

## 저장과 게시를 별개의 결정으로 둡니다

가져오기 후보 적용, 초안 저장, 공개 snapshot 갱신은 서로 다른 동작입니다. 저장 충돌도 수락 과정에서 확인해야 하며, 저장 성공만으로 프로필이 게시된 것은 아닙니다. 공개 캘린더 URL을 포함한 관련 링크는 공개 전에 소유자가 값을 확인하고, 개인 메모는 공개 데이터에 섞이지 않도록 합니다.

## 관련 업데이트: 공개 캘린더 일정에서 HTTPS 링크 열기

프로필 가져오기와 별개인 편집 기능 업데이트로 공개 캘린더 일정에 HTTPS 링크를 추가합니다. 일정에서 목적지를 새 탭으로 바로 열고 URL이 없는 일정은 조작 가능한 링크 없이 표시합니다. URL 형식, 포함된 인증 정보 여부, 입력 길이를 검증합니다. **noopener noreferrer**를 적용하고 접근 가능한 이름에도 새 탭으로 열린다고 알립니다.

관련 양식에서 협업 가능 시간대의 불필요한 제목 필드와 개인 메모 필드도 제거했습니다. 데이터베이스 변경, CI, 프로덕션 배포, 검증 데이터가 표시되는 화면은 확인했습니다. 소유자가 로그인해 실제 일정을 저장하고 게시하는 수락은 아직 확인되지 않았습니다.

<figure class="article-diagram" data-layout="boundary" data-tone="violet" data-count="2" aria-labelledby="diagram-profile-import-draft-boundaries">
  <figcaption>
    <strong id="diagram-profile-import-draft-boundaries">가져오기와 일정 링크의 경계</strong>
    <span>서로 다른 편집 기능입니다. 로그인 사용자의 저장 및 게시 수락은 확인되지 않았습니다.</span>
  </figcaption>
  <ol class="article-diagram__nodes">
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">1</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M6 3h8l4 4v14H6z"/><path d="M14 3v5h5M9 12h6M9 16h4"/></svg></span>
      <strong>프로필 가져오기</strong>
      <span>지원 형식은 본인이 검토하고 편집합니다. 저장과 게시는 별도 작업입니다.</span>
    </li>
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">2</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18M14 15h5m-2-2 2 2-2 2"/></svg></span>
      <strong>공개 일정 링크</strong>
      <span>HTTPS 링크는 안전한 새 탭에서 엽니다. 링크가 없는 일정은 조작할 수 없습니다.</span>
    </li>
  </ol>
</figure>

## 확인된 내용과 남은 수락

텍스트, CSV, 정적 HTML, 공통 JSON 가져오기의 구현·통합·프로덕션 배포를 확인했습니다. 하지만 실제 사용자가 가져오기, 편집, 저장을 거쳐 게시 결과를 확인하는 전체 과정은 아직 테스트하지 않았습니다. 활동 서비스 URL에서 프로필 전체를 자동으로 만드는 더 큰 구상도 완료되지 않았습니다.

공개 CSS 경계는 [안전한 사용자 CSS와 버전 고정 공개 테마](/insights/user-css-versioned-theme-safety/), 로그인 경계는 [여러 서비스의 세션 수명 주기](/insights/multi-service-session-lifecycle/)를 참고하세요.
