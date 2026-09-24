---
title: "여러 사이트의 AI 안내를 공통 Worker와 스트리밍 응답으로 연결한 기록"
description: "공개 사이트의 AI 안내를 공통 처리 서비스에 연결하고 답변을 순차적으로 표시한 과정과 실제 화면 확인을 정리합니다."
date: 2026-09-25T12:00
author: gui
image: https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=400&fit=crop&q=80
tags: ["Technology", "AI", "Cloudflare", "Websites"]
---

## 사이트별 입구와 공통 처리를 구분

Acecore 공개 사이트는 방문자가 관련 페이지와 문의처를 찾도록 AI 안내를 제공합니다. 2026년 8월 Acecore와 전문 사이트의 안내는 서버 측 공통 처리로 옮겨 갔습니다. 각 사이트는 목적에 맞는 질문과 링크를 유지하고, 동일 출처 API가 요청을 공통 Worker로 전달합니다. Aceserver의 Alpha는 포털과 Wiki가 사용하는 별도의 공통 서비스를 이용합니다.

## 생성 중인 문장과 최종 답변을 구분

SSE를 이용해 들어오는 문장을 같은 메시지에 순차적으로 추가합니다. 생성 중에는 일반 텍스트로 표시하고, 완료 후에만 검증된 링크를 렌더링합니다. 미완성 모델 출력을 신뢰할 수 있는 HTML로 취급하지 않기 위한 방식입니다. 이전 JSON 응답과의 호환성도 유지했습니다.

## 공식 정보로 안내

Systems 운영 사이트에서 안내 UI와 문의 페이지로 이어지는 답변을 확인했습니다. 화면은 개인 정보와 기밀 정보를 입력하지 말라고 안내합니다. 요금과 계약 조건은 공식 페이지와 담당자를 통해 확인해야 합니다. [이전 AI 채팅 설계 글](/insights/astro-ai-contact-chat/)은 2026년 6월의 구성이고, 후속 변경은 [Acecore](https://github.com/acecore-systems/acecore-net/pull/240), [Systems](https://github.com/acecore-systems/acecore-systems/pull/58), [포털](https://github.com/acecore-systems/aceserver-portal/pull/111), [Wiki](https://github.com/acecore-systems/aceserver-wiki/pull/81)에 기록되어 있습니다.
