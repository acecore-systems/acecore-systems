---
title: "Cloudflare Pages 보안 헤더 설정: _headers와 Functions의 차이"
description:
  "Cloudflare Pages에서 보안 헤더가 적용되지 않을 때 확인할 방법을 설명합니다. 정적 자산의
  _headers와 Functions의 Response가 적용되는 범위, 현재 설정의 확인 위치, 배포 후 점검 항목을 정리합니다."
date: 2026-03-15T00:00
author: gui
tags: ["기술", "Cloudflare", "보안"]
image: "/images/insights/covers/cloudflare-pages-security-cover-v2.webp"
lastUpdated: "2026-10-20T09:59:18Z"
---

Cloudflare Pages에서 CSP나 캐시 설정이 적용되지 않으면 먼저 응답이 정적 자산인지 Pages Functions인지 확인하세요. 이 글에서는 `_headers`와 Function의 `Response`가 적용되는 범위, 현재 설정을 확인할 위치, 배포 후 점검 항목을 정리합니다. 성공 응답뿐 아니라 오류 응답의 헤더도 확인하면 API를 추가한 뒤 누락된 설정을 찾는 데 도움이 됩니다.

이 글은 2026년 3월 문의 양식을 외부 폼으로 옮기고 Cloudflare Pages의 정적 배포로 돌아간 경위를 기록합니다. 이후 사이트 구성이 바뀌었습니다. **2026년 9월 기준 Acecore 공식 사이트는 정적 페이지와 함께 Pages Functions를 사용**해 문의, 댓글, 검색, AI 안내, CMS API를 처리합니다. 아래에서는 당시의 선택 이유와 현재도 적용할 수 있는 헤더 설정의 범위를 설명합니다.

## Cloudflare Pages 헤더는 정적 응답과 Functions에서 어떻게 다를까?

`public/_headers`는 Pages가 제공하는 **정적 자산의 응답**에 적용됩니다. [Cloudflare Docs의 Headers 공개 소스](https://github.com/cloudflare/cloudflare-docs/blob/production/src/content/docs/pages/configuration/headers.mdx)는 `_headers` 규칙이 정적 자산 응답에 적용된다고 설명합니다. 또한 [Cloudflare Pages: Headers](https://developers.cloudflare.com/pages/configuration/headers/)는 URL 패턴이 일치하더라도 Pages Functions가 생성한 응답에는 이 규칙이 적용되지 않는다고 설명합니다. API 응답에 필요한 CORS, 캐시, 보안 헤더는 Function의 `Response`에 설정하세요.

따라서 `_headers`를 한 번 작성하면 사이트의 모든 페이지와 API에 적용된다고 볼 수는 없습니다. 정적 HTML과 `/api/*`의 실제 응답 헤더를 각각 확인하세요.

<figure class="article-diagram" data-layout="boundary" data-tone="teal" data-count="2" aria-labelledby="diagram-cloudflare-pages-security">
  <figcaption>
    <strong id="diagram-cloudflare-pages-security">정적 응답과 Functions 응답의 설정 경계</strong>
    <span>정적 파일과 API는 헤더 설정 위치가 다릅니다. 배포 후 두 응답을 각각 확인하세요.</span>
  </figcaption>
  <ol class="article-diagram__nodes">
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">1</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M5 3h10l4 4v14H5z"/><path d="M15 3v5h5M8 12h8M8 16h8"/></svg></span>
      <strong>정적 파일 응답</strong>
      <span>_headers로 설정하고 Pages가 반환하는 응답을 확인합니다.</span>
    </li>
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">2</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M8 9h8M8 12h4M8 16h8"/></svg></span>
      <strong>Function API 응답</strong>
      <span>Function의 Response에 설정하고 API 응답을 따로 확인합니다.</span>
    </li>
  </ol>
</figure>

## 현재 헤더 설정은 어디에서 확인할까?

[현재 `_headers` 파일](https://github.com/acecore-systems/acecore-net/blob/main/public/_headers)은 HTML을 재검증하고 해시가 포함된 `_astro/` 자산은 장기 캐시를 사용하도록 구분합니다. 관리 화면에는 일반 페이지와 다른 CSP를 지정하고 `X-Frame-Options`는 `SAMEORIGIN`으로 설정합니다. 이전 글에 실린 `form-action https://ssgform.com`, HTML 1시간 캐시, `DENY`를 현재 값으로 복사하지 마세요.

현재 동적 경로는 [Pages Functions 코드](https://github.com/acecore-systems/acecore-net/tree/main/functions)에서 확인할 수 있습니다. CSP에서 허용할 외부 도메인도 실제로 불러오는 스크립트, 이미지, 프레임, 통신 대상에 맞춰 점검하세요. 여기에 실린 설정을 다른 사이트에 그대로 적용하지 마세요.

## 배포 후에는 무엇을 확인할까?

공식 사이트는 GitHub에 연결된 Cloudflare Pages에서 `main`을 공개합니다. [현재 Node 버전](https://github.com/acecore-systems/acecore-net/blob/main/.node-version)은 `.node-version`에, 빌드 절차는 `package.json`에 있으며 CI는 `npm run build`로 검증합니다. 2026년 3월 당시의 “Node.js 22 / npx astro build” 표는 현재 공개 절차가 아닙니다.

공개 상태를 확인할 때는 PR 미리보기, main 빌드, Pages 운영 배포, 공개 URL의 헤더와 본문을 각각 확인하세요. [Cloudflare Pages 헤더 공식 문서](https://developers.cloudflare.com/pages/configuration/headers/)에서 `_headers` 설정에 관한 설명을 확인할 수 있습니다.
