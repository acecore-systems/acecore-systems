---
title: "GitHub Actions의 중복 실행과 Gradle 빌드 시간을 각각 줄이기"
description: "push와 PR에서 중복되는 CI 실행 조건을 검토하고, Android의 Gradle 캐시를 동일한 커밋에서 비교합니다. 판단 조건과 실측의 한계를 정리합니다."
date: "2026-11-17T12:00:00+09:00"
author: gui
image: /images/insights/covers/astro-performance-tuning-cover-v2.webp
tags: ["GitHub Actions", "Android", "운영"]
---

Android CI가 매번 같은 작업을 반복한다면 캐시 복원에 걸리는 시간까지 포함해 비교하는 것이 도입을 판단하는 데 도움이 됩니다. DaysChat의 Android 작업에서 동일한 커밋으로 진행한 시험을 통해 속도와 재현성을 어떻게 확인했는지 소개합니다.

<figure class="article-diagram" data-layout="flow" data-tone="blue" data-count="3" aria-labelledby="diagram-gradle">
  <figcaption><strong id="diagram-gradle">동일한 입력으로 캐시 비교</strong><span>저장과 복원의 부담을 포함해 작업 전체를 살펴봅니다.</span></figcaption>
  <ol class="article-diagram__nodes">
    <li><strong>첫 실행</strong><span>캐시를 만들고 저장 시간을 기록합니다.</span></li>
    <li><strong>동일한 커밋 재실행</strong><span>복원 시간과 재사용된 태스크를 확인합니다.</span></li>
    <li><strong>산출물 검증</strong><span>대상 아키텍처와 APK 생성을 확인합니다.</span></li>
  </ol>
</figure>

## push와 PR에서 동일한 검증을 중복하지 않기

다른 회의록 시스템에서는 작업 브랜치에 대한 push와 PR 모두에서 일반 CI와 Rust parity가 실행되고 있었습니다. push에 의한 실행은 main으로 제한하고 PR 검증은 유지했으며, PR 생성 전에 확인하고 싶을 때는 수동으로 실행할 수 있도록 했습니다. 프로덕션 릴리스의 실행 조건은 변경하지 않았습니다.

사내 조사에서는 11월에 PR 측에서도 성공한 push 실행이 97회였고, Linux 러너의 실행 시간 합계는 342분이었습니다. 이는 중복 여부를 조사할 대상의 실행 시간이지, 변경 후 실제로 절약한 시간이나 청구 금액이 아닙니다. PR이 없는 변경을 어떻게 검증할지, 필수 검사와 릴리스를 중단시키지 않을지 확인한 뒤 대상을 좁힙니다. [GitHub Actions 이벤트](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows)에서 push와 pull_request의 조건을 확인할 수 있습니다.

## 작업 내 실측 결과와 조건

사내 변경 기록에 남긴 동일한 커밋 비교에서 Android 작업은 첫 실행에 16분 20초, 복원을 포함한 재실행에 6분 16초가 걸렸습니다. Gradle 태스크 194개를 재사용했으며, x86_64와 arm64-v8a 확인과 APK 생성도 통과했습니다. 첫 실행의 저장은 34초, 재실행의 복원은 62초가 걸렸고, 시험용 캐시는 약 1.81 GB였습니다.

| 관측 항목    | 첫 실행   | 재실행    |
| ------------ | --------- | --------- |
| Android 작업 | 16분 20초 | 6분 16초  |
| 캐시 작업    | 저장 34초 | 복원 62초 |

이 1쌍은 PR 전용 캐시로 측정한 사례입니다. 최종 구성에서는 main만 공유 캐시를 저장하고 PR은 읽기 전용으로 복원합니다. 최종 구성의 모든 PR에서 같은 단축 효과를 얻을 수 있는지, 청구 금액이 줄어드는지는 측정하지 않았습니다. 실행 환경이나 캐시 일치율에 따라서도 결과가 달라집니다.

## 재사용 조건과 안전한 저장 방식 정하기

[Gradle 빌드 캐시](https://docs.gradle.org/current/userguide/build_cache.html)는 태스크의 입력과 출력을 사용해 재사용 여부를 판단합니다. 태스크의 입력 선언이 부정확하면 오래된 출력을 사용할 수 있으므로, 먼저 클린 실행과 산출물, 테스트 결과를 비교합니다. 의존성이나 빌드 설정을 변경했을 때 예상대로 캐시가 무효화되는지도 확인합니다.

저장할 수 있는 실행 주체를 제한하고, 신뢰할 수 없는 변경이 공유 캐시를 갱신하지 못하도록 구성합니다. [GitHub Actions 의존성 캐시](https://docs.github.com/en/actions/concepts/workflows-and-actions/dependency-caching)에는 접근 범위와 사용 시 주의사항이 있습니다. 캐시를 비밀 정보의 보관 장소로 사용하지 않고, 크기와 저장·복원 시간, 작업 전체 소요 시간을 함께 관측합니다.

먼저 대상을 1개 작업으로 좁히고, 동일한 커밋의 첫 실행과 재실행에서 산출물과 시간을 기록하세요. 단축 효과가 확인되더라도 다른 변경이 있거나 캐시가 없을 때 정상적으로 빌드할 수 있는지는 별도로 확인합니다. 확인일: 2026년 11월 17일.
