---
title: "R2와 restic 백업 모니터링: 저장 성공부터 복원 검증까지"
description: "R2·restic으로 snapshot 신선도·무결성·복원을 나누는 설계. OS 갱신 후 PostgreSQL 버전 선택, Samba 격리 runtime과 DB·LDAP 검사, 전체 복구의 잔여 조건을 설명합니다."
date: "2026-09-30T20:53:00+09:00"
lastUpdated: "2026-10-15T00:00:00+09:00"
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

## OS 갱신 때 복원 검사의 PostgreSQL도 확인하기

OS 갱신 후 복원 검사가 고정된 예전 PostgreSQL major 경로를 참조해 실패했습니다. 수정은 필요한 server 실행 파일이 모두 있는 설치 major 중 숫자상 최신을 골라 초기화·시작·복원·검사·종료에 같은 버전을 사용합니다. 완전한 실행 도구가 없으면 실패하며 다른 운영 DB에 접속해 성공으로 처리하지 않습니다.

[PostgreSQL SQL dump·복원 문서](https://www.postgresql.org/docs/current/backup-dump.html)로 dump 형식과 대상 호환성을 검사합니다. 자동 버전 선택이 모든 dump 호환을 보장하지 않습니다. 이 변경은 기계 테스트·CI로 확인했으며 실제 R2 DB 복원은 별도 수용 항목입니다.

## 격리 Samba는 runtime도 재현해 시작 확인하기

복원 DB가 읽혀도 내부 socket용 runtime이 없으면 격리 DC가 시작되지 않았습니다. network·PID·mount 이름 공간을 분리하고 확인한 뒤 내부에만 전용 `/run` tmpfs와 `/run/samba`를 준비합니다. 생성한 격리 설정과 복원 경로로 실행해 운영 runtime·수신 포트에 검증 프로세스를 섞지 않습니다.

[공식 samba-tool domain backup restore·dbcheck](https://www.samba.org/samba/docs/current/man-html/samba-tool.8.html)로 복원 DB 검사·격리 DC 시작·LDAP 준비 완료까지 확인했습니다. Samba 경로는 실제 R2 백업으로 검증했습니다. 모든 앱 로그인·서비스 연결·별도 보관 자격 증명의 회복까지 포함한 재해 복구 완료는 다른 시험입니다. 확인일: 2026년 10월 14일.

<figure class="article-diagram" data-layout="layers" data-tone="amber" data-count="3" aria-labelledby="diagram-restic-r2-backup-verification">
  <figcaption>
    <strong id="diagram-restic-r2-backup-verification">snapshot에서 서비스별 복원과 전체 복구로</strong>
    <span>Samba DC·DB·LDAP는 실제 R2로 확인. PostgreSQL 실DB 수용과 전체 복구는 별도입니다.</span>
  </figcaption>
  <ol class="article-diagram__nodes">
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">1</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M5 3h10l4 4v14H5z"/><path d="M15 3v5h5M8 12h8M8 16h6"/></svg></span>
      <strong>성공 snapshot과 신선도</strong>
      <span>실제 저장 성공과 검사 범위를 기록.</span>
    </li>
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">2</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5M8 10l2 2 3-4"/></svg></span>
      <strong>격리 환경 재현</strong>
      <span>DB 버전·network/PID/mount·runtime 확인.</span>
    </li>
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">3</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/></svg></span>
      <strong>서비스 시작 검사</strong>
      <span>Samba DB·LDAP 검증. 전체 앱 복구는 미실증.</span>
    </li>
  </ol>
</figure>

## 남은 복구 검증

정기 운영, 감시·알림, 보존 처리, 선택 데이터 추출·무결성 확인을 수행했습니다. 모든 앱 기동, 설정·의존 데이터 복구, 별도 보관 자격 증명의 회수는 종단 간 검증이 남아 있습니다. 복구 시간과 허용 데이터 손실도 실측해야 합니다. 완전한 재해 복구나 비용 절감 달성을 주장하지 않습니다.

## 2026년 10월 6일 추가: 오래된 lock과 복원 검사 점유

추가 개선은 같은 호스트에서 작업 독점을 확보한 후 일반 `restic unlock`으로 오래된 lock만 처리했습니다. 활성 lock까지 지우는 `--remove-all`은 쓰지 않습니다. 제한된 `--retry-lock`으로 경쟁을 처리하고 복원 검사·prune이 실패 후 무한 재시작하지 않게 했습니다. 호스트 내 독점만으로 다른 호스트의 경쟁 부재가 입증되지는 않습니다.

격리된 임시 디렉터리에 `restore --verify`로 복원하고 대상의 필수 파일과 무결성을 확인한 뒤 검증 snapshot·설정의 대응을 기록했습니다. 복원 확인을 먼저 하고 보존 대상을 검토한 후 prune합니다. 백업 최신성은 시작·재시도가 아닌 실제 성공 snapshot으로 평가합니다.

대상 데이터 추출과 모든 앱 시작·인증 정보 복구를 포함한 완전 복구는 계속 별개입니다. 유지보수 시간과 수집 실패는[감시·장애 조사](/insights/openclaw-monitoring-investigation/)도 참조하세요.
