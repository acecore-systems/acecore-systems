---
title: "AI 답변이 지킬 수 없는 약속을 하지 않게 하기"
description: "안내용 AI가 직원의 참여, 일정 조율, 후속 연락을 임의로 약속하지 않도록 하는 방법입니다. 대화 상태, 검색 실패, 오래된 초안의 재검사, 대화 종료 처리를 다룹니다."
date: "2026-10-06T01:10:00+09:00"
lastUpdated: "2026-10-06T08:52:00+09:00"
author: gui
image: /images/insights/covers/ai-reply-capability-guardrails-cover-v1.webp
tags: ["AI", "Security", "Web"]
callout:
  type: note
  title: "특정 대화를 공개하지 않는 일반화된 사례"
  text: "정책과 분류의 변경, 전송 전 검사, 테스트, 배포, 제한적인 운영 확인을 다룹니다. 다른 사람의 게시물이나 계정은 포함하지 않으며, 모든 표현에서 잘못된 약속을 방지할 수 있음을 입증하지 않습니다."
---

안내용 답변이 자연스럽더라도 실제로 실행할 근거가 없다면 직원이 나중에 연락하거나 특정 시간에 참석한다고 약속해서는 안 됩니다. 이 글은 특정 플랫폼이나 대화를 밝히지 않고 내부 답변 흐름을 일반화합니다.

## AI가 설명할 수 있는 일과 실행할 수 있는 일 정의하기

공개 정보를 설명하는 일, 상대방의 희망을 확인하는 일, 실제로 연락하거나 참석하는 일은 서로 다른 능력입니다. 지침에 AI의 역할을 명시하고 최초 답변, 후속 답변, 전송 전 검사에서 같은 역할을 적용합니다. 추론 강도를 높이는 설정만으로 행동 권한이나 직원의 일정이 생기지는 않습니다.

## 키워드만 보지 말고 대화 상태 사용하기

원래 게시물, 확인된 최근 대화, 이미 안내했는지, 답이 필요한 질문이 남았는지, 대화가 끝났는지를 함께 전달합니다. 상대방이 다른 선호를 밝혔는데 단어가 일치한다는 이유만으로 참석 의사로 분류하지 않습니다. 이전 AI가 작성한 잘못된 약속도 누군가 실행할 계획이라는 근거가 아닙니다.

## 전송 전 화자와 의미 확인하기

“직원이 나중에 연락하겠습니다”는 실행 주체가 하는 약속입니다. 상대방 발언의 인용과 일반적인 행사 안내는 다른 의미입니다. 문자열만 일괄 금지하지 말고 역할, 대화 상태, 실행 근거를 확인합니다. 모호한 답변은 전송을 보류하고 필요하면 사람에게 넘깁니다. 자료 검색이 실패하거나 잘못된 응답을 반환했는데도 자료를 확인한 것처럼 생성이 계속되지 않도록 하는 경계도 필요합니다. 검색 단계의 중지 조건은 수정된 코드와 PR 검토에서만 확인했으며, 해당 경로의 프로덕션 운영은 확인되지 않았습니다.

## 비슷한 표현이나 다른 요청 유형을 혼동하지 않기

참가자를 모집하는 게시물과 참가 희망을 밝힌 사람의 발언을 구분합니다. 표현이 비슷해도 제품, 에디션, 이용 조건은 서로 바꿔 쓸 수 없으므로 다른 환경의 안내를 섞지 않습니다. 근거 없는 감사 표현이나 상대방을 이미 승인된 사람으로 취급하는 답변도 전송 전에 확인합니다. 답변을 우선 처리하더라도 요청 제한 시 대기 시간에 상한을 두고 중복을 막습니다. 대기하거나 답변을 생략한 것을 전송 성공으로 기록하지 않습니다.

## 오래된 초안도 최신 조건으로 다시 검사하기

생성 시점에 검사를 통과한 초안도 대화나 정책이 바뀌면 오래된 내용이 될 수 있습니다. 전송 직전에 최신 상태로 다시 검사하고 종료된 대화의 초안을 보내지 않습니다. 답변 생략과 대화 종료는 전송 성공과 구분해 감사 상태에 기록합니다. 불필요한 질문으로 대화를 늘리기보다 답변을 생략하는 선택도 둡니다.

<figure class="article-diagram" data-layout="branches" data-tone="violet" data-count="3" aria-labelledby="diagram-ai-reply-capability-guardrails">
  <figcaption>
    <strong id="diagram-ai-reply-capability-guardrails">답변 전에 근거와 실행 가능성 확인</strong>
    <span>대화 문맥에 따라 답변하거나 보류합니다. 검색 중단의 프로덕션 운영은 확인되지 않았습니다.</span>
  </figcaption>
  <ol class="article-diagram__nodes">
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">1</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M5 5h14v11H9l-4 4V5Z"/><path d="M8 9h8M8 12h5"/></svg></span>
      <strong>화자와 요청 확인</strong>
      <span>모집인지 참여 의향인지, 해당 버전과 대화 상태를 확인합니다.</span>
    </li>
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">2</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/></svg></span>
      <strong>근거 범위에서 답변</strong>
      <span>실제로 할 수 있는 내용만 알리고 전송 직전에 다시 확인합니다.</span>
    </li>
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">3</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg></span>
      <strong>불명확하면 보류</strong>
      <span>검색 실패나 잘못된 응답은 확인 완료로 보지 않고 사람에게 넘깁니다. 대기에는 한도를 두고 중복을 억제합니다.</span>
    </li>
  </ol>
</figure>

## 확인한 범위와 입증되지 않은 사항

분류와 전송 전 검사를 수정하고 회귀 테스트를 실행했으며 생성된 초안을 검토하고 배포 후 제한적으로 운영을 관찰했습니다. 모든 대화, 바꿔 쓴 표현, 모델 변경에서 안전하다는 뜻은 아닙니다. 외부 전송에는 콘텐츠 검사 외에도 운영 권한과 승인이 필요합니다. 위에서 설명한 검색 중지 조건은 코드와 PR에서 검토했으며, 프로덕션 운영 여부는 아직 검증되지 않았습니다.

검색 입력 경계는 [공개 HTML을 Vectorize와 안전하게 동기화하기](/ko/insights/cloudflare-vectorize-safe-implementation/), 표시 경계는 [AI 채팅 답변의 Markdown 링크를 안전하게 렌더링하기](/ko/insights/ai-chat-markdown-link-safety/)를 참고하세요.
