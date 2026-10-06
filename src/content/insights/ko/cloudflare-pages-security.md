---
title: "Cloudflare Pages 정적 자산과 Functions의 보안 헤더"
description: "Cloudflare Pages의 정적 응답과 Functions 응답을 구분하고 _headers, CSP, 현재 구성을 확인합니다."
date: 2026-03-15T00:00
author: gui
tags: ["기술", "Cloudflare", "보안"]
image: "/images/insights/covers/cloudflare-pages-security-cover-v2.webp"
lastUpdated: "2026-10-06T13:58:01+09:00"
---

이 글은 2026년 3월 연락 양식을 Worker에서 외부 서비스로 옮기고 Cloudflare Pages의 정적 배포로 돌아간 과정을 기록했습니다. 이후 구조가 바뀌었습니다. **2026년 9월 현재 Acecore 회사 사이트는 정적 페이지와 함께 Pages Functions를 사용**해 문의, 댓글, 검색, AI 안내, CMS API를 처리합니다. 당시 결정은 이력으로 읽어야 합니다.

## 정적 응답과 Functions 구분

`public/_headers`는 Pages가 제공하는 **정적 자산의 응답**에 적용됩니다. Cloudflare 공식 문서는 URL 규칙이 일치하더라도 Pages Functions가 생성한 응답에는 적용되지 않는다고 명시합니다. API에 필요한 CORS, 캐시, 보안 헤더는 Function의 `Response`에 설정합니다.

`_headers` 한 번으로 모든 페이지와 API가 보호된다고 가정하지 말고 정적 HTML과 `/api/*`의 실제 응답 헤더를 별도로 확인하세요.

<figure class="article-diagram" data-layout="boundary" data-tone="teal" data-count="2" aria-labelledby="diagram-cloudflare-pages-security">
  <figcaption>
    <strong id="diagram-cloudflare-pages-security">정적 응답과 Function 응답의 헤더 경계</strong>
    <span>정적 파일과 API는 헤더 설정 위치가 다릅니다. 배포 후 두 응답을 각각 확인합니다.</span>
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

## 현재 설정 확인 위치

[현재 `_headers` 파일](https://github.com/acecore-systems/acecore-net/blob/main/public/_headers)은 HTML을 재검증하고 해시가 붙은 `_astro/` 자산을 더 오래 캐시합니다. CMS에는 별도 CSP가 있으며 `X-Frame-Options`는 `SAMEORIGIN`입니다. 옛 글의 `form-action https://ssgform.com`, HTML 1시간 캐시, `DENY`를 현재 값으로 복사하지 마세요.

동적 경로는 [Pages Functions 코드](https://github.com/acecore-systems/acecore-net/tree/main/functions)에서 확인할 수 있습니다. CSP 허용 출처는 자신의 사이트에서 실제 사용하는 스크립트, 이미지, 프레임, 연결에 맞게 검증해야 합니다.

## 배포와 확인

회사 사이트는 GitHub에 연결된 Cloudflare Pages로 `main`을 공개합니다. 현재 Node 버전은 [`.node-version`](https://github.com/acecore-systems/acecore-net/blob/main/.node-version)에 있으며 CI는 `package.json`의 `npm run build`를 실행합니다. 2026년 3월의 “Node.js 22 / npx astro build” 표는 당시 기록입니다.

PR 미리보기, main 빌드, Pages 운영 배포, 공개 URL을 각각 확인하세요. 플랫폼 동작은 Cloudflare의 [Pages 헤더 공식 문서](https://developers.cloudflare.com/pages/configuration/headers/)를 참고하세요.
