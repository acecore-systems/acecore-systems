---
title: "R2와 restic 백업 모니터링: 저장 성공부터 복원 검증까지"
description: "스냅샷 최신성, 저장소 무결성, 복원을 따로 점검하고 아직 검증하지 않은 애플리케이션 복구 범위를 설명합니다."
date: "2026-09-30T20:53:00+09:00"
lastUpdated: "2026-10-09T15:00:00+09:00"
author: gui
image: /images/insights/covers/restic-r2-backup-verification-cover-v1.webp
tags: ["Cloudflare R2", "restic", "Backup"]
callout:
  type: note
  title: "완전한 복구는 별도 검증"
  text: "정기 백업·모니터링·보존 처리와 선택한 데이터의 추출·무결성 확인을 수행했습니다. 모든 앱의 기동과 별도 자격 증명 관리를 포함한 재해 복구는 입증하지 않았습니다."
---

백업 작업이 끝나도 필요한 데이터를 복구할 수 있다는 뜻은 아닙니다. 내부 사례를 일반화해 저장·무결성·복원·서비스 복구를 따로 평가합니다. 다른 백업 서비스에서 이전을 완료했다는 사례는 아닙니다.

## snapshot ID와 복원 목적 하나를 고정하기

검증할 snapshot ID를 기록하고 빈 격리 경로에 필요한 파일을 복원합니다. 설정은 참조 경로와 권한, DB는 격리 환경에서 읽을 수 있는지까지 확인하고 소요 시간을 기록하세요. 같은 항목으로 정기 시험을 이어 가면 저장 시점과 실제 복구 가능한 범위를 비교할 수 있습니다.

[restic：격리된 경로로 복원하는 절차](https://restic.readthedocs.io/en/stable/050_restore.html)

## 원본과 성공 기준 정의

restic의 암호화·중복 제거와 R2의 S3 호환 API를 사용합니다. 필요한 작업을 [호환표](https://developers.cloudflare.com/r2/api/s3/api/)로 확인합니다. 가동 중인 데이터베이스는 덤프나 앱 정지 등 적절한 일관성 확보 방법을 설계합니다.

## 최신성 별도 감시

최근 성공 스냅샷, 지연, 실패, 무결성·복원 검사 결과를 별도로 추적합니다. 작업 시작을 성공으로 간주하지 않고 알림 실패와 백업 실패도 구분합니다.

## 무결성과 추출 확인

기본 `restic check`와 실제 데이터를 읽는 검사의 범위는 다릅니다. `--read-data`는 전체 데이터를 읽으며 부분 검사는 범위를 기록합니다. [저장소 검사](https://restic.readthedocs.io/en/stable/045_working_with_repos.html), 격리된 장소로의 [복원](https://restic.readthedocs.io/en/stable/050_restore.html), 내용이나 해시 비교를 결합합니다. 파일 추출은 앱 기동 검증이 아닙니다.

## restic으로 보존 처리

보존 정책으로 스냅샷을 선택하고 `forget`, `prune`, `check`를 사용하며 실행 전 남길 내용을 확인합니다. R2 객체를 나이만으로 일괄 삭제하면 보존 스냅샷에 필요한 공유 데이터가 사라질 수 있습니다. [보존 문서](https://restic.readthedocs.io/en/stable/060_forget.html)를 따르고 이미지 배포용 객체 정리와 혼동하지 않습니다.

## 남은 복구 검증

정기 운영, 감시·알림, 보존 처리, 선택 데이터 추출·무결성 확인을 수행했습니다. 모든 앱 기동, 설정·의존 데이터 복구, 별도 보관 자격 증명의 회수는 종단 간 검증이 남아 있습니다. 복구 시간과 허용 데이터 손실도 실측해야 합니다. 완전한 재해 복구나 비용 절감 달성을 주장하지 않습니다.

<figure class="article-diagram" data-layout="layers" data-tone="amber" data-count="3" aria-labelledby="diagram-restic-r2-backup-verification">
  <figcaption>
    <strong id="diagram-restic-r2-backup-verification">snapshot 최신성부터 완전 복구까지 증거를 단계별로 확인하기</strong>
    <span>데이터를 꺼낼 수 있어도 앱이나 인증 정보까지 복구됐다는 뜻은 아닙니다.</span>
  </figcaption>
  <ol class="article-diagram__nodes">
    <li>
      <span class="article-diagram__symbol">
        <span aria-hidden="true">1</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M4 7h16v13H4z M3 7l2-4h14l2 4 M8 11h8 M12 11v5"/></svg>
      </span>
      <strong>성공한 snapshot과 최신성</strong>
      <span>실제로 성공한 snapshot의 시각과 예정 대비 지연을 확인합니다. 작업이 시작된 것만으로 성공 처리하지 않습니다.</span>
    </li>
    <li>
      <span class="article-diagram__symbol">
        <span aria-hidden="true">2</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M5 6h14v13H5z M8 10h8 M8 14l2 2 4-4"/></svg>
      </span>
      <strong>무결성과 격리 복원</strong>
      <span>검사 범위를 기록하고 별도 위치에서 restore --verify를 실행해 대상 파일과 hash를 대조한 뒤 보존 대상과 prune을 확인합니다.</span>
    </li>
    <li>
      <span class="article-diagram__symbol">
        <span aria-hidden="true">3</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M5 8h14v12H5z M8 8V5h8v3 M9 14h.01 M12 14h.01 M15 14h.01"/></svg>
      </span>
      <strong>완전한 재해 복구</strong>
      <span>모든 앱 실행, 종속 데이터, 별도로 보관한 인증 정보 복구는 아직 검증되지 않았습니다. 복구 시간과 허용 가능한 데이터 손실도 측정하지 않았습니다.</span>
    </li>
  </ol>
</figure>

## 2026년 10월 6일 추가: 오래된 lock과 복원 검사 점유

추가 개선은 같은 호스트에서 작업 독점을 확보한 후 일반 `restic unlock`으로 오래된 lock만 처리했습니다. 활성 lock까지 지우는 `--remove-all`은 쓰지 않습니다. 제한된 `--retry-lock`으로 경쟁을 처리하고 복원 검사·prune이 실패 후 무한 재시작하지 않게 했습니다. 호스트 내 독점만으로 다른 호스트의 경쟁 부재가 입증되지는 않습니다.

격리된 임시 디렉터리에 `restore --verify`로 복원하고 대상의 필수 파일과 무결성을 확인한 뒤 검증 snapshot·설정의 대응을 기록했습니다. 복원 확인을 먼저 하고 보존 대상을 검토한 후 prune합니다. 백업 최신성은 시작·재시도가 아닌 실제 성공 snapshot으로 평가합니다.

대상 데이터 추출과 모든 앱 시작·인증 정보 복구를 포함한 완전 복구는 계속 별개입니다. 유지보수 시간과 수집 실패는[감시·장애 조사](/insights/openclaw-monitoring-investigation/)도 참조하세요.
