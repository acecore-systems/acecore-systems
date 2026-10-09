---
title: "Dynmap 512px 타일 이전: 공개 검증과 R2 이전 이미지 정리"
description: "512px 타일 이전에서 렌더링 범위, 일반·줌 이미지, R2 저장 경로를 검증하는 방법을 설명합니다. 8개 서버·89개 맵 사례로 삭제 전 확인과 비용 비교 조건을 정리합니다."
date: "2026-09-27T22:40:00+09:00"
lastUpdated: "2026-10-09T15:00:00+09:00"
author: gui
image: /images/insights/dynmap-512-migration.webp
tags: ["기술", "Cloudflare"]
callout:
  type: note
  title: "검증한 범위"
  text: "2026년 9월 11일 운영 환경 감사에서 전환과 이전 이미지 삭제를 확인했습니다. 실제 청구액과 평상시 비용 절감률은 확인하지 못했습니다."
---

Cloudflare R2에서 지도 이미지를 제공하는 Dynmap 구성의 이미지 형식을 바꾸고 이전 데이터를 정리했습니다. 대상은 8개 서버의 89개 지도였습니다. 핵심은 새 이미지가 공개 화면에 표시되는지 확인한 뒤 이전 이미지를 지우는 순서였습니다.

## Dynmap 타일 이전 전에 비교할 조건

512px 타일을 검토할 때는 같은 렌더링 범위에서 일반 이미지와 줌 이미지를 비교하고, 열람 요청과 렌더링 쓰기 횟수를 따로 기록합니다. 먼저 이전 prefix 후보를 목록으로 만들고, 새 이미지의 공개 표시와 월드 재렌더링으로 복구할 방법을 확인한 뒤 삭제 여부를 결정하세요.

[R2：용량과 작업 횟수 측정](https://developers.cloudflare.com/r2/platform/metrics-analytics/)

## 렌더링 범위를 제한해 단계적으로 전환

운영 지도를 512px 타일로 통일했습니다. 추가 렌더링이 필요한 21개 지도는 공개 중심을 기준으로 반경 2,000블록으로 범위를 제한했습니다. 세계 전체 렌더링 완료를 기다리지 않고 평상시 업데이트를 계속하면서 전환했습니다.

R2 통신 실패 후 재시도, 쓰기 실패 시 대기 중인 업데이트 보존, 확대 타일이 없는 경우와 읽기 오류를 구분하는 처리도 개선했습니다. 재시작 후 확대 타일 업데이트를 재개하는 수정은 [Dynmap fork PR #9](https://github.com/acecore-systems/dynmap/pull/9)에 기록했습니다. 이 수정으로 Cloudflare 내부 장애까지 사라지는 것은 아닙니다.

<figure class="article-diagram" data-layout="flow" data-tone="green" data-count="3" aria-labelledby="diagram-dynmap-512-migration">
  <figcaption>
    <strong id="diagram-dynmap-512-migration">새 이미지 검증 후 이전 데이터를 정리</strong>
    <span>공개 결과와 저장소를 감사한 뒤 정리합니다. 이전 이미지 백업은 없고 평상시 비용 절감도 확인되지 않았습니다.</span>
  </figcaption>
  <ol class="article-diagram__nodes">
    <li>
      <span class="article-diagram__symbol">
        <span aria-hidden="true">1</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
          <path d="M3 5l9-3 9 3v14l-9 3-9-3z M12 2v20 M3 5l9 3 9-3 M3 12l9 3 9-3"/>
        </svg>
      </span>
      <strong>범위를 정하고 새 타일 생성</strong>
      <span>512px 대상과 렌더링 범위를 정하고 일반 업데이트를 계속하면서 새 이미지 형식으로 단계적으로 생성합니다.</span>
    </li>
    <li>
      <span class="article-diagram__symbol">
        <span aria-hidden="true">2</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
          <path d="M10.5 3a7.5 7.5 0 1 0 0 15 7.5 7.5 0 0 0 0-15z M16 16l5 5"/>
        </svg>
      </span>
      <strong>공개 이미지와 저장소 감사</strong>
      <span>일반·확대 이미지, 웹 자산과 실시간 JSON, 정식 저장 prefix를 각각 확인해 공개와 저장을 감사합니다.</span>
    </li>
    <li>
      <span class="article-diagram__symbol">
        <span aria-hidden="true">3</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
          <path d="M4 7h16 M9 7V4h6v3 M7 7l1 14h8l1-14"/>
        </svg>
      </span>
      <strong>감사 후 이전 데이터 정리</strong>
      <span>감사 후 이전 이미지와 hash를 정리합니다. 백업이 없으므로 필요하면 월드에서 다시 렌더링해야 합니다.</span>
    </li>
  </ol>
</figure>

## 공개 지도와 저장소를 따로 검증

전환 후 공개된 89개 지도에서 일반 이미지와 확대 이미지를 각각 한 장씩, 총 178장을 확인했습니다. 이미지가 512px인지 확인하고 웹 자산과 실시간 JSON 업데이트도 점검했습니다. R2에서는 저장 경로가 운영 지도 89개의 접두사와 일치하는지 감사하고, 이전 일반 및 주간 이미지 접두사 192개가 비었는지 확인했습니다.

그 뒤에야 이전 이미지와 hash 파일 11,707,356개 객체, 약 51.71GB를 삭제했습니다. 이전 이미지 내용은 백업하지 않았으므로 필요하면 월드에서 다시 렌더링해야 합니다. 현재 이미지, 월드, 설정과 JAR 백업은 유지했습니다. 삭제 프로세스 종료만 믿지 않고 최종 감사에서 이전 이미지, 전환 단계 데이터, 이전 hash 파일이 남지 않았음을 확인했습니다.

## 용량 변화와 청구액을 혼동하지 않기

전환 작업이 포함된 연속 24시간 두 구간에서 성공한 PutObject는 240,835회에서 90,423회로 줄었습니다. 두 구간 모두 전환 작업을 포함하므로 평상시 감소율이나 월간 비용을 뜻하지 않습니다. 청구액도 아직 확인하지 못했습니다.

비슷한 전환에서는 [R2 작업량과 저장 용량 지표](https://developers.cloudflare.com/r2/platform/metrics-analytics/)를 따로 살펴보고 공개 표시, 현재 이미지, 이전 데이터 순서로 확인해야 합니다. 삭제 대상과 복구 방법을 먼저 정한 뒤 데이터를 지우는 것이 중요합니다.
