---
title: "프로필 정보를 초안으로 가져오기: 비교·선택·게시 경계"
description: "공개 URL·텍스트·CSV·HTML·JSON을 프로필 초안으로 가져오는 설계. 제한된 이미지·음성 가져오기, 링크 순서, 재읽기 실패 시 후보 보존, 본인의 저장·공개를 설명합니다."
date: "2026-10-06T01:10:00+09:00"
lastUpdated: "2026-10-15T00:00:00+09:00"
author: gui
image: /images/insights/covers/profile-import-draft-boundaries-cover-v1.webp
tags: ["Web", "Import", "Security"]
callout:
  type: note
  title: "구현은 확인했고 실제 계정 수락은 남아 있습니다"
  text: "파일 입력과 제한된 공개 URL·이미지·음성 가져오기는 구현·통합·운영 배포되었습니다. 합성 데이터 조작과 일부 공개 미디어 가져오기를 확인했습니다. 실제 본인의 권리 확인·저장·공개, 공식 로그인 연동, 원본의 429 해결은 별도의 미완료 사항입니다."
---

기존 프로필을 다른 편집기로 옮길 때는 값을 교체하기 전에 현재 값과 가져오기 후보를 비교해야 합니다. 이 익명 사례를 통해 데이터 가져오기와 프로필 게시의 경계를 설명합니다.

## 자기소개 한 항목으로 수동 편집 보존 시험하기

기존 자기소개를 직접 수정한 뒤 다른 문장이 있는 입력에서 후보를 만듭니다. 미선택 항목은 현재 값이 유지되는지, 선택 시 교체 내용을 확인하는지, 취소하면 원래 값으로 돌아오는지 시험합니다. 적용 후 초안과 공개 페이지를 비교해 가져오기만으로 공개 내용이 바뀌지 않는지 확인하세요.

[OWASP：입력 형식, 값, 길이 검증](https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html)

## 먼저 지원 입력 형식을 정합니다

텍스트, CSV, 정적 HTML, 공통 JSON과 서식에 더해 지원하는 공개 프로필 URL에서 후보를 가져옵니다. HTML은 입력 데이터로만 분석하며 스크립트나 원본 HTML을 공개 화면에서 실행하지 않습니다. 길이·개수·형식·HTTPS 링크를 검사합니다.

링크는 등장 순서를 유지하고 URL 내부의 짝이 맞는 괄호를 보존합니다. Markdown 안의 URL을 두 번 수집하지 않지만 다른 위치에 다시 나온 같은 URL은 독립 후보로 남깁니다. 본인의 판단 없이 순서나 중복을 정리하지 않습니다.

## 기존 값을 바꾸기 전에 후보를 검토합니다

분석 결과를 바로 게시하지 않고 현재 값과 먼저 비교합니다. 소유자가 항목별로 선택하고 편집기 적용 전에 후보 값을 수정할 수 있습니다. 선택한 항목을 적용하면 현재 값이 교체되므로 매번 가져오기 차이를 확인해야 합니다. 적용을 취소할 수도 있습니다. 이 기능이 다른 화면이나 다른 사람이 한 편집과의 충돌을 자동으로 해결한다고 보장하지는 않습니다.

같은 URL이나 파일을 다시 읽다가 실패하면 기존 후보, 본인의 편집, 선택, CSV 열 매핑, 가져온 미디어를 보존합니다. 오류와 이전 후보라는 사실을 표시합니다. 입력 원본·방식·본문·파일을 변경하거나 재읽기가 성공했을 때 후보를 바꿉니다. 보존만으로 적용·저장·공개하지 않습니다.

## URL 가져오기와 공식 연동을 구분하기

URL 가져오기는 Profcard, lit.link, POTOFU, HTML Meishi, foriio의 알려진 공개 구조로 제한합니다. 원본 신원, 검색 제외 지시, 후보 일치를 확인하며 인증 페이지나 허용되지 않은 목적지로 확대하지 않습니다. 각 서비스의 공식 로그인·API 연동이나 전체 프로필의 완전한 이전을 뜻하지 않습니다.

공통 JSON 서식과 서비스별 지원 안내는 계속 제공합니다. 미지원 URL과 동적 내용은 붙여넣기나 파일 가져오기로 안내합니다. 401·403·429 등이 반환되면 멈추며 다른 브라우저나 API로 제한을 우회하지 않습니다.

[OWASP: URL 목적지와 리디렉션을 제한하는 SSRF 방어](https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html)

## 가져온 이미지·음성을 확인한 뒤 선택하기

GIF 프로필 이미지뿐 아니라 알려진 링크 카드와 공개 게시물의 작품 이미지·제목도 후보로 만들 수 있습니다. 본인 링크란의 허용된 GitHub 이미지·WAV·MP3 링크와 공개 Dropbox 단일 파일도 제한적으로 지원합니다. POTOFU 초기 HTML 게시물 카드는 지원하지만 설명문·추가 페이지·임베디드 플레이어·foriio 작품 갤러리는 완료 범위에 포함하지 않습니다.

원본과 후보를 다시 확인하고 host·path·리디렉션·MIME·실제 내용·용량·기한을 검사합니다. 본인이 같은 데이터를 보거나 듣고 권리·제목·설명을 확인해 선택합니다. 선택한 첨부만 저장 전 작품에 넣고 기존 업로드 경로로 준비한 뒤 일반 저장을 사용합니다. 소유자·프로필·미디어 종류·ready 상태를 다시 검사하고 수동 입력과 공개 snapshot을 보존합니다.

<figure class="article-diagram" data-layout="flow" data-tone="violet" data-count="4" aria-labelledby="diagram-profile-import-draft-boundaries">
  <figcaption>
    <strong id="diagram-profile-import-draft-boundaries">가져오기·선택·저장·공개의 경계</strong>
    <span>재읽기 실패 시 이전 후보를 보존합니다. 가져오기만으로 공개 snapshot은 바뀌지 않습니다.</span>
  </figcaption>
  <ol class="article-diagram__nodes">
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">1</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M5 3h10l4 4v14H5z"/><path d="M15 3v5h5M8 12h8M8 16h6"/></svg></span>
      <strong>제한된 입력 읽기</strong>
      <span>지원 URL·형식·가져오기 제한 검사.</span>
    </li>
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">2</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5M8 10l2 2 3-4"/></svg></span>
      <strong>비교·선택</strong>
      <span>이미지·음성을 확인하고 수동 편집 보존.</span>
    </li>
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">3</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/></svg></span>
      <strong>초안 저장</strong>
      <span>선택 항목과 준비된 첨부를 일반 저장.</span>
    </li>
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">4</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M6 4v6a3 3 0 0 0 3 3h6a3 3 0 0 1 3 3v4"/><path d="M18 4v3a3 3 0 0 1-3 3H9a3 3 0 0 0-3 3v7"/></svg></span>
      <strong>본인이 공개</strong>
      <span>별도 조작으로 공개 snapshot 갱신.</span>
    </li>
  </ol>
</figure>

## 가져온 텍스트로 자격이나 권리를 추론하지 않습니다

소개 글이나 외부 페이지의 표현만으로 자격, 소속, 카테고리, 라이선스를 확정하지 않습니다. 후보로 가져올 수 있는 설명과 신원 확인이나 신청이 필요한 정보를 구분합니다. 외부 정보가 바뀌어도 소유자가 확인한 프로필을 자동으로 수정하거나 게시하지 않습니다.

## 저장과 게시를 별개의 결정으로 둡니다

가져오기 후보 적용, 초안 저장, 공개 snapshot 갱신은 서로 다른 동작입니다. 저장 충돌도 수락 과정에서 확인해야 하며, 저장 성공만으로 프로필이 게시된 것은 아닙니다. 공개 캘린더 URL을 포함한 관련 링크는 공개 전에 소유자가 값을 확인하고, 개인 메모는 공개 데이터에 섞이지 않도록 합니다.

## 관련 업데이트: 공개 캘린더 일정에서 HTTPS 링크 열기

프로필 가져오기와 별개인 편집 기능 업데이트로 공개 캘린더 일정에 HTTPS 링크를 추가합니다. 일정에서 목적지를 새 탭으로 바로 열고 URL이 없는 일정은 조작 가능한 링크 없이 표시합니다. URL 형식, 포함된 인증 정보 여부, 입력 길이를 검증합니다. **noopener noreferrer**를 적용하고 접근 가능한 이름에도 새 탭으로 열린다고 알립니다.

관련 양식에서 협업 가능 시간대의 불필요한 제목 필드와 개인 메모 필드도 제거했습니다. 데이터베이스 변경, CI, 프로덕션 배포, 검증 데이터가 표시되는 화면은 확인했습니다. 소유자가 로그인해 실제 일정을 저장하고 게시하는 수락은 아직 확인되지 않았습니다.

## 확인된 내용과 남은 수락

제한된 URL·GIF·작품 이미지·음성의 구현, CI, 운영 배포와 합성 데이터 편집·취소, 일부 공개 파일 가져오기를 확인했습니다. POTOFU 원본 프로필의 429는 남아 있으며 CDN 파일 성공만으로 프로필 가져오기 성공을 뜻하지 않습니다. 실제 본인의 권리 확인부터 저장·공개까지의 전체 수용 검증은 미완료입니다. 확인일: 2026년 10월 14일.

공개 CSS 경계는 [안전한 사용자 CSS와 버전 고정 공개 테마](/insights/user-css-versioned-theme-safety/), 로그인 경계는 [여러 서비스의 세션 수명 주기](/insights/multi-service-session-lifecycle/)를 참고하세요.
