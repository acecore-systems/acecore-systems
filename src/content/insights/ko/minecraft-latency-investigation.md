---
title: "Minecraft 지연 조사: 조용한 지표 수집과 공유 스토리지 원인 분석"
description: "TPS/MSPT를 조용히 수집하는 단계부터 JFR과 운영체제 I/O 관측을 대조하는 과정까지 소개합니다. 완료된 원인 조사와 아직 시험하지 않은 성능 개선을 구분합니다."
date: "2026-10-06T01:10:00+09:00"
lastUpdated: "2026-10-09T15:00:00+09:00"
author: gui
image: /images/insights/covers/minecraft-latency-investigation-cover-v1.webp
tags: ["Minecraft", "Monitoring", "Performance"]
callout:
  type: note
  title: "원인 조사와 개선 효과를 구분합니다"
  text: "상시 모니터링과 저장 대기 원인 조사는 완료했습니다. 다른 스토리지로 이전하거나 성능을 비교하지 않았으므로, 특정 부품의 고장이나 모든 플레이어의 지연 해소를 입증한 것은 아닙니다."
---

Minecraft 지연은 서버 tick 처리, 짧은 저장 대기, 네트워크, 클라이언트 렌더링 등 여러 원인에서 생길 수 있습니다. 내부 호스트명과 구성을 공개하지 않고 여러 Paper 서버에서 진행한 조사를 익명으로 소개합니다.

## 지연이 발생하는 시간에 첫 프로파일 수집하기

플레이어가 지연을 느낀 시각, 인원, 저장 여부를 기록하고 같은 시간대의 MSPT와 프로파일을 비교합니다. 정상 시간대의 짧은 표본도 수집하세요. 처리 점유 증가와 대기 증가를 나누면 플러그인 조정과 스토리지 조사 중 어느 쪽으로 진행할지 판단하기 쉽습니다.

[PaperMC：문제 발생 중 프로파일 수집](https://docs.papermc.io/paper/profiling/)

## 평균과 짧은 멈춤을 따로 측정합니다

TPS, MSPT 평균·최대·p95, 느린 tick의 누적 횟수를 기록합니다. 평균이 양호해도 짧은 멈춤은 숨을 수 있습니다. 호스트 전체 CPU 사용률만으로는 단일 스레드 작업과 I/O 대기를 구분할 수 없습니다.

## 콘솔을 늘리지 않고 누락도 기록합니다

이 사례에서는 소형 플러그인이 Paper 공개 API에서 가져온 측정값을 로컬 JSON에 기록하고, 수집기가 이를 모니터링 시계열로 집계했습니다. 파일 I/O는 게임 main thread 밖에서 처리했고, 임시 파일을 교체해 읽는 중인 파일이 부분 갱신되지 않게 했습니다. 일반 콘솔 로그를 숨긴 방식은 아닙니다.

시간과 수집 성공 여부도 확인합니다. 수집기가 멈춘 뒤 남은 오래된 값을 정상으로 보거나, 누락 데이터를 TPS 0으로 바꾸지 않습니다.

## 제한된 JVM·OS·저장 관측을 대조합니다

문제가 재현되는 동안 JFR, OS 대기 관측, 블록 I/O를 서로 다른 제한된 시간 창에서 수집했습니다. 이를 연속 MSPT 시계열 및 주기적인 I/O pressure와 대조해 GC 활동과 동기 저장 중 대기를 구분했습니다. 모든 수집이 같은 시점에 이뤄진 것은 아닙니다. Paper 분석을 시작할 때는 [공식 spark 프로파일링 안내](https://docs.papermc.io/paper/profiling/)를 참고할 수 있습니다. 이 사례에서는 저장 중 대기를 자세히 조사하기 위해 JFR과 OS 관측을 추가했습니다.

정상적인 240초 관측 창과 정체가 있던 220초 창에서 초당 write-await 중앙값은 각각 1.60ms와 43.71ms였고, 최대값은 6.00ms와 123.57ms였습니다. 이는 두 관측 창의 비교이며, 조치 전후 결과나 일반적인 벤치마크가 아닙니다.

동기 저장과 파일시스템 journal 대기 외에도 여러 애플리케이션의 장치 요청에서 지연이 보여 공유 스토리지 경로를 원인 후보로 좁혔습니다. [Linux 블록 tracepoint](https://www.kernel.org/doc/html/latest/core-api/tracepoint.html)의 완료 이벤트는 요청 일부만 나타낼 수 있으므로, 대응되지 않은 요청을 전체 I/O 통계에 섞지 않았습니다. 수집 시간과 데이터량을 제한하고 계측 부하도 고려했습니다.

<figure class="article-diagram" data-layout="compare" data-tone="green" data-count="2" aria-labelledby="diagram-minecraft-latency-investigation">
  <figcaption>
    <strong id="diagram-minecraft-latency-investigation">관측과 원인 가설을 구분합니다</strong>
    <span>상시 지표와 제한된 샘플은 서로 다른 관측 구간입니다. 저장소 이전 효과는 시험하지 않았습니다.</span>
  </figcaption>
  <ol class="article-diagram__nodes">
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">1</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M4 19V5M4 19h16"/><path d="m7 15 4-5 3 2 5-7"/></svg></span>
      <strong>조용한 상시 측정</strong>
      <span>일반 콘솔 로그를 늘리지 않고 TPS/MSPT와 누락 데이터를 기록합니다.</span>
    </li>
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">2</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="12" cy="12" r="4"/><path d="M6 8h.01M18 16h.01"/></svg></span>
      <strong>제한된 원인 조사</strong>
      <span>JFR·OS·block I/O를 따로 수집해 대조합니다. 공유 storage 경로는 후보 원인이지 확정된 장애가 아닙니다.</span>
    </li>
  </ol>
</figure>

## 다음 단계는 별도의 시험으로 다룹니다

조사 뒤 제한 수집을 종료하고 상시 수집이 정상임을 확인했습니다. 스토리지를 옮긴 뒤 유사한 사용 조건에서 여러 주기를 비교하는 시험은 아직 하지 않았습니다. 이 기록은 백업·복구·롤백 계획을 갖춘 후속 대응을 준비합니다. 저장 내구성을 낮추거나 근거 없이 GC 또는 특정 플러그인을 원인으로 지목하지 않습니다.

모니터링 신호와 장애 진단의 구분은 [OpenClaw 모니터링 및 장애 조사](/insights/openclaw-monitoring-investigation/), 복구 검증은 [R2 및 restic 백업 모니터링](/insights/restic-r2-backup-verification/)을 참고하세요.
