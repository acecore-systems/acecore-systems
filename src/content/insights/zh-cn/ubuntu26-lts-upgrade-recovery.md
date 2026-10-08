---
title: "Ubuntu 26.04 迁移与恢复：AD、备份和无人在线时的更新"
description: "六台 Ubuntu 服务器迁移与更新的经验：Samba、SSSD 兼容问题，连接恢复，R2 实际还原，以及 Velocity 无人在线时的维护与完成判断。"
date: "2026-10-08T13:35:00+09:00"
author: gui
image: /images/insights/covers/ubuntu26-lts-upgrade-recovery-cover-v1.webp
tags: ["Ubuntu", "Samba", "SSSD", "Backup", "Minecraft"]
callout:
  type: note
  title: "版本号不能单独证明工作完成"
  text: "需要验证正常重启、连接和角色服务自动恢复、原有配置保留，以及相关备份的实际还原。真实用户交互登录、Minecraft 实际游玩和全面灾难恢复需要另外测试。"
processFigure:
  eyebrow: "维护验收条件"
  title: "从变更前的证据到更新后的还原验证"
  description: "任何步骤失败时，先记录目标和状态，在限定范围内恢复后再继续。"
  variant: inline
  steps:
    - title: "范围与恢复入口"
      description: "确认依赖、停止条件、原有配置和备份。"
      icon: i-lucide-server
      accent: brand
    - title: "停止与更新"
      description: "控制新连接，正常停止服务，再执行已批准的更新。"
      icon: i-lucide-wrench
      accent: amber
    - title: "启动与实际还原"
      description: "从独立路径验证响应，恢复原状态，检查同一备份世代。"
      icon: i-lucide-shield-check
      accent: emerald
---

更新 Ubuntu 还需要保留认证、网络、备份和启动依赖。目标是在重启后恢复正常运行。

2026 年 10 月 8 日，我们完成了六台 Ubuntu 服务器的迁移或更新，涉及 Web、认证、Bot、CTF 和 Minecraft 代理。其中两台从 24.04 迁移至 26.04，另外四台原本已运行 26.04，只进行了常规软件包更新与重启。本文把实际遇到的问题和验证方法整理成可复用的经验。

## 区分发行版升级与常规更新

LTS 迁移应使用 `do-release-upgrade`，遵循 [Ubuntu 官方升级流程](https://ubuntu.com/server/docs/how-to/software/upgrade-your-release/)。所需的软件包变更与维护时间不同于已运行 26.04 的主机。常规维护的“删除数量为零”条件，不能直接照搬到发行版升级。

首先明确角色、依赖、可接受的停机时间和恢复控制台的入口。将 Netplan、SSH、认证配置、服务、容器、timer 和 APT hold 状态保存到仅 root 可访问的位置。这些资料可能包含秘密值，不应放入公开文章或仓库。

逐台处理，并确认其他维护已经结束。更新整个集群不意味着可以启动明确要求停止的备份，或修改运行其他操作系统的主机。

## 先实际还原，再信任备份

保存任务成功不能证明数据可恢复。更新前，我们把指定 R2 世代还原到独立工作区，并按目标检查数据库一致性、配置和 ZIP 内容。相关方法见 [R2 与 restic 备份验证](/insights/restic-r2-backup-verification/)。

Samba AD 使用 [`samba-tool` 的备份功能](https://www.samba.org/samba/docs/current/man-html/samba-tool.8.html)，随后在隔离 DC 中检查还原后的数据库和 LDAP 响应。仅复制正在运行的数据库文件并不足够。

此次 Samba 4.23 验证器仅修改 DB 和 PID 路径时，无法创建内部 socket 所需的 `/run/samba/nmbd`，导致启动失败。我们先确认网络和挂载命名空间与生产环境隔离，再仅在验证环境内准备独立 `/run`。这不是在生产主机的 `/run` 上挂载测试用 tmpfs 的做法。

使用供应商磁盘镜像前，应确认创建期间的启动限制、保存大小、时长及计费单位。后续维护没有创建新镜像，而是使用已验证的应用备份与系统配置存档。它不能保证与完整磁盘镜像相同的恢复范围。明确停用的备份始终保持停用。

## 提前检查 Samba AD/DC 软件包

Ubuntu 26.04 的 AD/DC 需要 `samba-ad-dc`。依据 [LTS 迁移注意事项](https://documentation.ubuntu.com/release-notes/26.04/summary-for-lts-users/#upgrading-an-ad-dc-from-previous-ubuntu-releases)，在旧系统上检查安装状态。

```bash
dpkg-query -W samba-ad-dc
```

如果未安装，应先确认主机确实是 AD/DC 且 APT 使用官方来源，然后在迁移前安装。保留现有域不需要重新创建域或提高功能级别。

## 升级中断后先检查当前状态

认证服务器上残留未配置的软件包，新内核的 initrd 也缺失。我们从恢复控制台检查，完成必要的软件包配置与 initrd 生成，然后回到正常 systemd 启动进行验证。

使用 `init=/bin/bash` 临时启动会绕过通常的认证。我们获得此次启动的许可后，首先进行了只读检查。没有永久修改 GRUB 或密码，并恢复了临时的服务启动抑制设置。

以下是检查命令示例，不是统一的修复脚本。发布输出前应检查秘密值和连接信息。

```bash
cat /etc/os-release
uname -r
sudo dpkg --audit
sudo apt-get check
sudo sshd -t
systemctl --failed
cat /proc/sys/kernel/random/boot_id
```

如果原始升级命令的退出码未被记录，不应事后补写成功值。应记录实际修复内容和之后的观察结果。内核文件存在，不代表主机已使用该内核正常启动。

## 根据证据修复网络与认证

即使 Netplan 文件正确，其他组件仍可能在启动时重新生成配置。在我们的管理方式中，先比对原始哈希，再通过 [cloud-init 网络配置](https://docs.cloud-init.io/en/24.3/reference/network-config.html#disabling-network-configuration)仅禁用重新生成。依赖云端网络管理的环境不能一概采用这一设置。

SSH 无法恢复也可能源于启动依赖。日志表明，旧 LDAP 转发 socket 与 VPN 形成启动循环，使 systemd 取消 VPN 启动。确认当前转发监听和通信后，我们只关闭过时 socket 的自动启动。等待 socket activation 的 service 显示 inactive，本身不能证明故障。

SSSD 检查发现已移除的 `config_file_version` 以及 monitor 与 socket 启动冲突。我们对照 [SSSD 2.10 变更](https://sssd.io/release-notes/sssd-2.10.0.html#configuration-changes)和 [Ubuntu 配置参考](https://manpages.ubuntu.com/manpages/resolute/man5/sssd.conf.5.html)，保留所有者与权限，进行有限修改，没有停止所有 SSSD socket。

之后检查 `sssctl config-check`、NSS/PAM/PAC responder、域的 Online 状态，以及使用现有机器密钥的 `adcli testjoin`。没有重新生成密钥或重新加入域。

| 观察到的问题            | 证据                          | 修复后检查                             |
| ----------------------- | ----------------------------- | -------------------------------------- |
| AD/DC 所需组件不足      | 软件包清单与迁移说明          | Samba、DB/LDAP、原有域 ID              |
| 正常启动后 VPN 未恢复   | journal 的启动循环与取消记录  | 正常重启后的 SSH、VPN、DNS、LDAP       |
| SSSD 配置与 socket 失败 | 配置检查和 responder 冲突日志 | responder 运行、Online、机器域成员关系 |

## 无人在线维护需要新鲜数据与新连接控制

Velocity 只在没有玩家时更新。我们通过 JSON 监控和 status ping 获取人数，没有向控制台定期发送 `list` 或 `glist`。除八台 JSON 监控对象外，还检查了另一台，共覆盖九台运行中的后端及代理。

只有全部人数为零，且观察与监控 snapshot 不超过 15 秒，才允许继续。有人、数据缺失、查询失败、陈旧值或未覆盖的目标，都必须等待。无需获取玩家姓名。

1. 确认所有目标都是新鲜的零人值，且此前的维护已结束。
2. 完成更新前还原验证，为本目标保存配置和原状态。
3. 停止前再次获取人数。
4. 临时关闭游戏新连接入口，并要求关闭后的新观察仍全部为零。
5. 请求 Velocity 正常退出，确认结束后再进行常规 APT 更新。
6. 正常重启、独立验证、恢复入口，并验证更新后的备份还原。

入口控制覆盖所需 IPv4/IPv6 TCP/UDP，在重启期间持续生效。独立的临时规则保留 SSH、VPN、API 和后端通信，不替换现有整个防火墙。恢复入口时，同时确认临时 unit 与规则已移除。

正常退出使用 Velocity 控制台的 [`shutdown`](https://docs.papermc.io/velocity/built-in-commands/)。此次没有停止或更新后端本体、世界或 plugin。

## 按维护阶段处理分阶段更新

常规更新包括无删除模拟、严格获取 APT 索引、保留配置，以及恢复原有 timer 和 hold。我们使用 `NEEDRESTART_MODE=l` 保持预定的服务重启顺序。执行 worker 检查目标主机和已停止状态，运行不依赖 SSH 连接持续存在。

剩余七个软件包依据 [Ubuntu 分阶段更新](https://ubuntu.com/project/docs/how-ubuntu-is-made/concepts/phased-updates/)延后，没有仅为了清空待更新列表而强制安装。

发行版升级的前置条件不同：官方流程要求更新包括分阶段软件包在内的系统。不能把迁移后的日常更新策略直接用于 `do-release-upgrade` 的前置要求。

## 以重启和同一备份世代的验证判定完成

最终六台主机使用 Ubuntu 26.04.1 和新内核正常启动。我们比对 boot ID 的变化、软件包一致性、失败 unit、SSH/VPN、角色服务自动恢复，以及配置、timer、hold 和入口的原状态。

Velocity 验证了 Java status、Geyser RakNet 响应以及另一台主机的连接。经济 API 经许可路径返回 200，无认证返回 401，有认证返回 200。单独一个 HTTP 200 不能验证认证边界。

对已启用备份的目标，我们重新保存完成状态并实际还原同一世代。没有把旧世代还原成功用作新备份的证据。明确停用的备份仍保持停用。

这些检查确认了常规运行恢复。真实用户交互登录、Minecraft 实际游玩、Bot 的实际发布或生成，以及完整灾难恢复演练仍需单独验证。Debian 迁移到 Ubuntu 不属于本案例。
