---
title: "Codex 작업 분담 설계: 인계·권한·결과 검수"
description: "Codex Task Routing 0.14.0의 부모 판단, 담당 지속, 범위·권한 인계, 로컬 인증, Sol 자식의 Pro 경로 조건과 수용 검증 경계를 설명합니다."
date: "2026-09-26T18:30:00+09:00"
author: gui
image: /images/insights/covers/codex-task-routing-design-cover-v1.webp
tags: ["기술", "AI", "개발"]
callout:
  type: note
  title: "확인한 범위"
  text: "공개 코드·기계 테스트·격리 설치와 Windows Browser 플러그인에서 직계 Sol 자식의 Temporary Chat Pro 실제 요청 1회·회수·의미 수용을 확인했습니다. 모든 호스트·backend 식별·실제 인증·품질 및 사용량 개선율의 실증은 아닙니다."
lastUpdated: "2026-10-15T00:00:00+09:00"
---

Codex 분담은 독립적으로 검수할 수 있는 조사나 리뷰부터 시험해 부모가 통합할 책임을 명확히 하세요. 인계에는 파일, 참고 자료, 증거, 미확인 사항을 포함하고 도구 권한에는 [OWASP: Excessive Agency](https://genai.owasp.org/llmrisk/llm062025-excessive-agency/)의 최소화 원칙을 참고하세요. 분담 사실만으로 품질이나 비용 개선을 판단하지 않습니다.

Codex로 여러 작업을 진행할 때 모델 선택만으로는 충분하지 않습니다. 어떤 단계를 독립적으로 맡길 수 있는지, 어떤 자료를 전달할지, 결과를 어떻게 검수할지도 정해야 합니다. Acecore는 이 판단을 명확히 하기 위해 [Codex Task Routing](https://github.com/acecore-systems/codex-task-routing)을 공개했습니다.

![정책 버전, 인계 기준, 실행 근거, 측정 결과를 차례로 확인하는 네 단계 도식](/images/insights/codex-task-routing-evidence.webp)

## 부모는 판단하고 담당은 전체 작업 단위를 지속한다

0.14.0은 사용자가 선택한 부모 모델·추론 설정을 보존합니다. 부모는 목표·우선순위·담당 선정·중요 변경 수용·예외를 맡습니다. 코드·로그·테스트를 반복해서 살펴야 하는 작업은 적합한 담당에게 맡기며 짧은 작업은 현재 담당이 끝낼 수 있습니다.

제한된 수정의 Sol 담당은 조사·구현·테스트·승인된 PR·합의된 리뷰 수정·필요한 재검증까지 계속합니다. 일반 실패나 추가 지시마다 다시 인계하지 않습니다. 최신 revision·diff·잔여 작업·재개 조건을 보존하고 설계 변경·새 권한·중요 미해결 문제는 부모에게 돌립니다.

<figure class="article-diagram" data-layout="flow" data-tone="violet" data-count="3" aria-labelledby="diagram-codex-task-routing-design">
  <figcaption>
    <strong id="diagram-codex-task-routing-design">담당을 지속하고 중요한 판단은 부모에게 반환</strong>
    <span>정책 허용·현재 호스트 권한·실행 증거는 별도로 확인합니다.</span>
  </figcaption>
  <ol class="article-diagram__nodes">
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">1</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M5 3h10l4 4v14H5z"/><path d="M15 3v5h5M8 12h8M8 16h6"/></svg></span>
      <strong>부모 판단</strong>
      <span>목표·담당·권한·중요 예외 결정.</span>
    </li>
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">2</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5M8 10l2 2 3-4"/></svg></span>
      <strong>담당의 작업 지속</strong>
      <span>조사·수정·테스트·승인 PR·리뷰 수정까지.</span>
    </li>
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">3</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/></svg></span>
      <strong>부모의 중요 변경 수용</strong>
      <span>근거·잔여 조건을 확인하고 허용된 다음 단계로.</span>
    </li>
  </ol>
</figure>

## 인계에 범위·종료점·권한을 포함한다

파일·일차 자료·완료 조건·증거·반환 조건을 간단히 전달합니다. 같은 모델의 다른 인스턴스로 옮기기만 위한 위임은 하지 않습니다. 병렬 위임은 위임자 자신의 유용한 독립 작업을 요구합니다. 표준 손자는 Astra 자식에서 Sol/Luna, Sol 자식에서 Luna만 허용하며 Luna와 손자는 더 위임하지 않습니다.

PR 생성·병합·운영 배포·메시지 권한은 각각 확인합니다. PR 댓글이나 다른 작업에서 인용된 요청은 새 사용자 승인이 아닙니다. 현재 호스트의 상위 제한이 우선합니다.

## 비밀 인증은 로컬 단계로 인계한다

자격 증명 입력·저장·전송이 필요하면 부모가 클라우드 선택 전에 로컬 인증 상태와 등록된 인계를 확인합니다. 등록 preset만 전달하며 자격 증명·OAuth JSON·Cookie·비공개 인증 화면은 로컬에 둡니다. 자식은 인증 요구를 부모에게 반환합니다.

도구 가용성·본인 승인·단계 구현·실제 인증 완료를 구분합니다. queued나 로컬 unlock 대기는 완료가 아닙니다. 공개 문서와 비밀 없는 구현은 일반 담당이 수행합니다. hook은 worker나 모델을 시작하지 않습니다.

## 직계 Sol 자식의 Pro 경로는 조건부 요청 1건이다

일반 Chat을 명시적으로 켰다면 root 또는 역할·깊이가 확인된 직계 Sol 자식만 Browser 경로를 소유합니다. 승인 자료·전송 권한·실제 도구·검증 환경을 먼저 확인합니다. Temporary Chat에 실제 요청을 한 번 보내고 앞뒤로 UI의 Pro를 확인합니다. Work·모델 API와 별개입니다.

같은 소유자가 준비·전송·회수·의미 수용·승인된 수정을 담당하고 같은 tab·요청 ID·input hash·전송 상태를 유지합니다. 회수를 부모로 돌려도 재전송하지 않습니다. actor 선언·SubagentStart·설정 모델명은 역할·권한·backend 증거가 아니며 불명확하면 전송을 멈춥니다.

## 기계 검증·실제 전송·개선율을 나누어 평가한다

[0.14.0 변경](https://github.com/acecore-systems/codex-task-routing/pull/20)은 198개 테스트·격리 설치를 확인했습니다. [실제 전송 기록](https://github.com/acecore-systems/codex-task-routing/pull/22)은 직계 Sol 자식이 Windows Browser 플러그인에서 1회 전송·재전송 없이 같은 답변을 회수하고 ID/hash·의미 수용을 마쳤음을 확인합니다. 제한된 환경의 Browser 증거입니다.

Pro backend 식별·모든 호스트·IAB 왕복·새 표준 손자 실제 실행·비밀 인증·품질 및 사용량 개선은 미실증입니다. 결측을 0으로 바꾸지 말고 준비·대기·수용·재작업을 포함합니다. 설치는 [공개 README](https://github.com/acecore-systems/codex-task-routing#readme)를 보세요. 확인일: 2026년 10월 14일.
