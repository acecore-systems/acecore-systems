---
title: "Ubuntu 26.04 이전과 복구: AD, 백업, 이용자 없는 시간의 업데이트"
description: "Ubuntu 서버 6대에서 확인한 Samba·SSSD 호환 문제, 연결 복구, R2 실제 복원, 이용자가 없는 시점의 Velocity 업데이트와 완료 판단을 소개합니다."
date: "2026-10-08T13:35:00+09:00"
author: gui
image: /images/insights/covers/ubuntu26-lts-upgrade-recovery-cover-v1.webp
tags: ["Ubuntu", "Samba", "SSSD", "Backup", "Minecraft"]
callout:
  type: note
  title: "버전 표시만으로 완료를 판단하지 않기"
  text: "정상 재부팅, 연결과 역할 서비스의 자동 복귀, 설정 보존, 해당 백업의 실제 복원을 확인합니다. 실제 사용자 로그인, Minecraft 플레이, 전체 재해 복구는 별도 검증이 필요합니다."
processFigure:
  eyebrow: "유지보수 완료 조건"
  title: "변경 전 증거부터 업데이트 후 복원 확인까지"
  description: "단계가 실패하면 대상과 상태를 기록하고 제한된 범위에서 복구한 뒤 진행합니다."
  variant: inline
  steps:
    - title: "범위와 복구 경로"
      description: "의존성, 중지 조건, 원래 설정과 백업을 확인합니다."
      icon: i-lucide-server
      accent: brand
    - title: "중지와 업데이트"
      description: "새 접속을 제어하고 정상 종료한 뒤 허가된 업데이트를 적용합니다."
      icon: i-lucide-wrench
      accent: amber
    - title: "부팅과 실제 복원"
      description: "독립 경로의 응답, 원래 상태, 같은 백업 세대의 복원을 확인합니다."
      icon: i-lucide-shield-check
      accent: emerald
---

Ubuntu 업데이트는 인증, 네트워크, 백업, 시작 의존성도 보존해야 합니다. 재부팅 뒤 정상 운영으로 돌아오는 것이 목표입니다.

2026년 10월 8일, 웹·인증·Bot·CTF·Minecraft 프록시 등의 Ubuntu 서버 6대에서 이전 또는 업데이트를 마쳤습니다. 2대는 24.04에서 26.04로 이전했고, 나머지 4대는 이미 26.04여서 일반 패키지 업데이트와 재부팅을 수행했습니다. 실제로 관찰한 문제와 검증 방법을 재사용할 수 있게 정리합니다.

## 릴리스 업그레이드와 일반 업데이트 구분하기

LTS 이전에는 `do-release-upgrade`와 [Ubuntu 공식 절차](https://ubuntu.com/server/docs/how-to/software/upgrade-your-release/)를 사용합니다. 이미 26.04인 호스트의 업데이트와는 패키지 변경과 소요 시간이 다릅니다. 일반 유지보수의 ‘삭제 0’ 조건을 릴리스 업그레이드에 그대로 적용하지 않습니다.

먼저 역할, 의존 대상, 허용 중단 시간, 복구 콘솔 접근 방법을 확인합니다. Netplan, SSH, 인증 설정, 서비스, 컨테이너, timer, APT hold 상태를 root 전용 영역에 보관합니다. 비밀 값이 포함될 수 있으므로 공개 기사나 저장소에는 올리지 않습니다.

한 번에 한 대씩 진행하며 다른 유지보수가 끝났는지도 확인합니다. 전체 업데이트가 중지하도록 지정한 백업을 시작하거나 다른 운영체제의 호스트를 변경할 근거는 아닙니다.

## 백업은 실제로 꺼내 검증하기

저장 작업의 성공이 복원 가능성을 입증하지는 않습니다. 업데이트 전에 특정 R2 세대를 별도 작업 영역으로 복원하고 대상에 맞춰 DB 일관성, 설정, ZIP 내용을 검사했습니다. [R2와 restic 백업 검증](/insights/restic-r2-backup-verification/)에서도 기본 원칙을 다룹니다.

Samba AD에는 [`samba-tool` 백업 기능](https://www.samba.org/samba/docs/current/man-html/samba-tool.8.html)을 사용하고 격리된 DC에서 복원 DB와 LDAP 응답을 확인했습니다. 실행 중인 DB 파일을 단순 복사하는 것으로 끝내지 않았습니다.

이번 Samba 4.23 검증기는 DB와 PID 경로만 바꾸면 내부 socket의 `/run/samba/nmbd`를 준비하지 못해 시작에 실패했습니다. 네트워크와 마운트 네임스페이스가 운영 환경과 분리되었는지 검사한 뒤 검증 환경 안에만 전용 `/run`을 만드는 방식으로 고쳤습니다. 운영 호스트의 `/run` 위에 검증용 tmpfs를 마운트하는 절차가 아닙니다.

제공업체 디스크 이미지는 생성 중 부팅 제한, 저장 크기, 시간, 과금 단위를 먼저 확인합니다. 추가 작업에서는 새 이미지를 만들지 않고 검증된 애플리케이션 백업과 OS 설정 보관본을 사용했습니다. 전체 디스크 이미지와 같은 복구 범위를 보장하는 것은 아닙니다. 중지 지정된 백업은 시작하지 않았습니다.

## Samba AD/DC 패키지를 먼저 확인하기

Ubuntu 26.04의 AD/DC에는 `samba-ad-dc`가 필요합니다. [LTS 이전 주의사항](https://documentation.ubuntu.com/release-notes/26.04/summary-for-lts-users/#upgrading-an-ad-dc-from-previous-ubuntu-releases)에 따라 기존 OS에서 설치 상태를 확인합니다.

```bash
dpkg-query -W samba-ad-dc
```

없다면 AD/DC 호스트인지와 공식 APT 소스인지 확인한 뒤 이전 전에 설치합니다. 기존 도메인 보존을 위한 확인이며 도메인 재생성이나 기능 수준 상향은 필요하지 않습니다.

## 업데이트가 중단되면 현재 상태부터 확인하기

인증 서버에는 미설정 패키지와 새 커널의 initrd 누락이 남았습니다. 복구 콘솔에서 점검하고 필요한 패키지 설정과 initrd 생성을 완료한 뒤 정상 systemd 부팅으로 돌아와 검증했습니다.

`init=/bin/bash` 임시 부팅은 일반 인증을 우회합니다. 해당 부팅에 대한 허가를 받은 뒤 먼저 읽기 전용으로 점검했습니다. GRUB의 영구 변경이나 비밀번호 변경은 하지 않았고 임시 서비스 시작 억제도 되돌렸습니다.

다음은 확인용 명령 예시이며 일괄 복구 스크립트가 아닙니다. 출력 공개 전 비밀 값과 연결 정보가 없는지 검토합니다.

```bash
cat /etc/os-release
uname -r
sudo dpkg --audit
sudo apt-get check
sudo sshd -t
systemctl --failed
cat /proc/sys/kernel/random/boot_id
```

원래 업그레이드의 종료 코드를 기록하지 않았다면 나중에 성공 값을 만들어 넣지 않습니다. 수정한 내용과 이후 실측 결과를 기록합니다. 커널 파일이 있어도 그 커널로 정상 부팅했는지는 따로 확인합니다.

## 근거를 보고 네트워크와 인증 수정하기

Netplan 파일이 올바르더라도 다른 구성 요소가 부팅 때 다시 생성할 수 있습니다. 이번 관리 방식에서는 원래 해시를 대조하고 [cloud-init 네트워크 설정](https://docs.cloud-init.io/en/24.3/reference/network-config.html#disabling-network-configuration)으로 재생성만 비활성화했습니다. 클라우드 네트워크 관리가 필요한 환경에 일괄 적용할 설정은 아닙니다.

SSH가 돌아오지 않는 원인은 시작 의존성일 수도 있습니다. journal에는 이전 LDAP 중계 socket과 VPN의 순환으로 systemd가 VPN 시작을 취소한 기록이 있었습니다. 현재 중계의 listen 상태와 통신을 검증한 뒤 용도가 끝난 socket만 자동 시작을 해제했습니다. socket activation을 기다리는 service가 inactive인 것만으로 장애를 판단할 수는 없습니다.

SSSD에서는 제거된 `config_file_version`과 monitor·socket 시작 충돌을 확인했습니다. [SSSD 2.10 변경](https://sssd.io/release-notes/sssd-2.10.0.html#configuration-changes) 및 [Ubuntu 설정 참고](https://manpages.ubuntu.com/manpages/resolute/man5/sssd.conf.5.html)를 대조하고 소유자와 권한을 보존하며 제한적으로 수정했습니다. 모든 SSSD socket을 중지하지 않았습니다.

이후 `sssctl config-check`, NSS/PAM/PAC responder, 도메인 Online 상태, 기존 machine key를 사용하는 `adcli testjoin`을 확인했습니다. 키 재생성이나 도메인 재가입은 하지 않았습니다.

| 관찰한 문제             | 근거                            | 수정 뒤 확인                    |
| ----------------------- | ------------------------------- | ------------------------------- |
| AD/DC 구성 부족         | 패키지 목록과 이전 주의사항     | Samba, DB/LDAP, 원래 도메인 ID  |
| 정상 부팅 뒤 VPN 미복귀 | journal의 순환과 취소 기록      | 재부팅 후 SSH·VPN·DNS·LDAP      |
| SSSD 설정·socket 실패   | 설정 검사와 responder 충돌 로그 | responder, Online, machine join |

## 이용자 없는 시점에는 최신 값과 신규 접속 제어가 필요

Velocity는 플레이어가 없을 때만 업데이트했습니다. 콘솔에 주기적으로 `list`나 `glist`를 보내지 않고 JSON 모니터링과 status ping으로 인원만 수집했습니다. JSON 대상 8대뿐 아니라 그 밖의 1대를 포함한 실행 중 백엔드 9대와 프록시를 확인했습니다.

모든 인원이 0이고 관측 및 모니터링 snapshot이 15초 이내일 때만 통과합니다. 접속자, 누락 데이터, 조회 실패, 오래된 값, 미포함 대상이 있으면 기다립니다. 플레이어 이름은 필요하지 않습니다.

1. 모든 대상의 최신 0명 값과 선행 유지보수 종료를 확인합니다.
2. 업데이트 전 복원 검증과 대상 전용 설정·상태 보관을 마칩니다.
3. 중지 직전에 인원을 다시 조회합니다.
4. 게임 신규 접속만 임시 차단하고, 차단 후 최신 관측도 모두 0인지 확인합니다.
5. Velocity의 정상 종료를 요청하고 종료를 확인한 뒤 일반 APT 업데이트를 진행합니다.
6. 정상 재부팅, 독립 검증, 접속 복구, 업데이트 후 백업의 실제 복원을 수행합니다.

접속 차단은 필요한 IPv4/IPv6 TCP/UDP를 포함하며 재부팅 중에도 유지했습니다. 전용 임시 규칙으로 SSH, VPN, API, 백엔드 통신을 보존하고 기존 방화벽 전체를 바꾸지 않았습니다. 접속 복구 때 임시 unit과 규칙 제거까지 확인합니다.

Velocity 정상 종료에는 콘솔의 [`shutdown`](https://docs.papermc.io/velocity/built-in-commands/)을 사용했습니다. 백엔드 본체, 월드, plugin은 이 작업에서 중지하거나 업데이트하지 않았습니다.

## 작업 단계에 맞춰 단계적 배포 보류 처리하기

일반 업데이트에서는 삭제 없는 simulation, 엄격한 APT 인덱스 취득, 설정 보존, 원래 timer와 hold 복귀를 확인했습니다. `NEEDRESTART_MODE=l`로 서비스 재시작 순서를 유지했습니다. worker는 대상 호스트와 중지 상태를 검사하고 SSH 연결 유지와 독립적으로 실행했습니다.

남은 7개 패키지는 [Ubuntu 단계적 배포](https://ubuntu.com/project/docs/how-ubuntu-is-made/concepts/phased-updates/)에 따라 보류했습니다. 대기 목록을 비우려고 강제 포함하지 않았습니다.

릴리스 업그레이드의 사전 조건은 다릅니다. 공식 절차는 단계적 배포 패키지도 업데이트하도록 안내합니다. 이전 후 일상 업데이트 정책을 `do-release-upgrade`의 사전 조건에 그대로 적용하지 않습니다.

## 재부팅과 같은 백업 세대 검증으로 완료 판단하기

최종적으로 6대 모두 Ubuntu 26.04.1과 새 커널로 정상 부팅했습니다. boot ID 변경, 패키지 일관성, 실패 unit, SSH/VPN, 역할 서비스 자동 복귀, 원래 설정·timer·hold·접속 상태를 대조했습니다.

Velocity는 Java status, Geyser RakNet 응답, 다른 호스트에서의 연결을 검사했습니다. 경제 API는 허용 경로 200, 인증 없는 401, 인증 있는 200을 확인했습니다. HTTP 200만으로 인증 경계가 정상인지 판단하지 않습니다.

백업이 활성화된 대상은 완성 상태를 새로 저장하고 같은 세대를 실제 복원했습니다. 이전 복원 성공을 새 백업의 증거로 재사용하지 않았습니다. 중지 지정 백업은 계속 중지 상태를 유지했습니다.

이 검증으로 일반 운영 복귀를 확인했지만 실제 사용자 로그인, Minecraft 플레이, Bot 게시·생성, 전체 재해 복구는 별도 테스트입니다. Debian에서 Ubuntu로의 이전은 이 사례의 범위 밖입니다.
