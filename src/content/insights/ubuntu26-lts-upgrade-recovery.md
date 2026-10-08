---
title: "Ubuntu 26.04への移行と復旧：AD・バックアップ・無人時更新の実践"
description: "Ubuntuサーバー6台の移行・更新で確認した、SambaとSSSDの互換問題、接続復旧、R2バックアップの実復元、Velocityの無人時更新と完了判定を紹介します。"
date: "2026-10-08T13:35:00+09:00"
author: gui
image: /images/insights/covers/ubuntu26-lts-upgrade-recovery-cover-v1.webp
tags: ["Ubuntu", "Samba", "SSSD", "Backup", "Minecraft"]
callout:
  type: note
  title: "バージョン表示だけでは完了としない"
  text: "通常再起動、接続と役割サービスの自動復帰、設定の保持、対象バックアップの実復元まで確認します。実ユーザーの対話ログインやMinecraftの実プレイ、全サービスを含む災害復旧は別の検証です。"
processFigure:
  eyebrow: "保守の完了条件"
  title: "変更前の証拠から、更新後の復元確認まで"
  description: "途中で失敗したら次へ進まず、対象と状態を記録して限定的に復旧します。"
  variant: inline
  steps:
    - title: "対象と復旧経路"
      description: "依存関係、停止条件、元設定とバックアップを確認する。"
      icon: i-lucide-server
      accent: brand
    - title: "停止と更新"
      description: "新規受付を制御し、正常停止して承認した更新を適用する。"
      icon: i-lucide-wrench
      accent: amber
    - title: "通常起動と実復元"
      description: "別経路の応答、元状態への復帰、同じ保存世代の復元を確かめる。"
      icon: i-lucide-shield-check
      accent: emerald
---

Ubuntuの更新で難しいのは、新しいOSを入れることだけではありません。認証、ネットワーク、バックアップ、サービスの起動順序を保ち、再起動後にも運用を続けられる状態へ戻す必要があります。

2026年10月8日、Web・認証・Bot・CTF・MinecraftプロキシなどのUbuntuサーバー6台で移行・更新を完了しました。2台は24.04から26.04へのLTS更新、残る4台は既に26.04で、通常のパッケージ更新と再起動です。本記事では、この作業で実際に確認した問題と検証手順を一般化して紹介します。

## リリース更新と通常更新を分ける

LTSの移行には[Ubuntu公式のリリース更新手順](https://ubuntu.com/server/docs/how-to/software/upgrade-your-release/)と`do-release-upgrade`を使います。既に26.04のホストへ残りの更新を適用する作業とは、必要なパッケージ変更も所要時間も異なります。通常更新で設定した「削除0」の条件を、リリース更新へそのまま流用しません。

先に役割、依存先、許容停止時間、復旧コンソールへの到達方法を確認します。Netplan、SSH、認証設定、サービス、コンテナ、timer、APTのhold状態を保存し、退避先はroot専用にします。設定に秘密値が含まれることがあるため、退避ファイルを記事や公開リポジトリへ載せません。

作業は1台ずつ進め、別の保守処理が終わっていることも確認します。「すべて更新する」は、停止指定のバックアップや別OSのホストまで変更する理由にはなりません。

## バックアップは取り出して検証する

保存ジョブの成功と、復元できることは別です。更新前にR2の対象世代を別の作業領域へ実復元し、DBの整合性、必要な設定、ZIPの内容を対象に応じて確認しました。基本の考え方は[R2とresticのバックアップ検証](/insights/restic-r2-backup-verification/)でも紹介しています。

Samba ADは、稼働中のDBファイルを単にコピーする方式で済ませません。[`samba-tool`のバックアップ機能](https://www.samba.org/samba/docs/current/man-html/samba-tool.8.html)を使い、隔離したDCのDBとLDAP応答まで検査しました。

今回のSamba 4.23の検証環境では、DBやPIDの保存先を変えるだけでは内部ソケット用の`/run/samba/nmbd`を用意できず、起動が失敗しました。ネットワークとマウントの名前空間が本番から分離されていることを検査してから、検証環境内だけに専用の`/run`を用意する方式へ修正しました。本番ホストの`/run`へ検証用のtmpfsをマウントする手順ではありません。

プロバイダーのディスクイメージは、取得中の起動制限、保存容量、時間、課金単位も事前に確認します。今回の追加作業では新規イメージを作らず、検証済みのアプリケーションバックアップとOS設定の退避を使いました。この方式が、ディスク全体の復旧と同じ範囲を保証するわけではありません。停止指定のバックアップは起動しませんでした。

## Samba AD/DCのパッケージを先に確認する

Ubuntu 26.04のAD/DCでは、`samba-ad-dc`が必要です。[LTS移行の注意事項](https://documentation.ubuntu.com/release-notes/26.04/summary-for-lts-users/#upgrading-an-ad-dc-from-previous-ubuntu-releases)に従い、旧OS側で導入状態を確認します。

```bash
dpkg-query -W samba-ad-dc
```

未導入なら、対象がAD/DCであることと公式APTの取得元を確認したうえで、更新前に追加します。これは既存ドメインの維持に必要なパッケージの確認であり、ドメインの再作成や機能レベルの引き上げを伴う作業ではありません。

## 更新が中断したら、まず現在の状態を確かめる

今回の認証サーバーでは、未設定のパッケージと欠けた新カーネルのinitrdが残りました。復旧コンソールから点検し、必要なパッケージ設定とinitrd生成を行った後、通常のsystemd起動へ戻して確認しました。

`init=/bin/bash`による一時復旧起動は、通常の認証を迂回する操作です。対象の起動について許可を得てから使い、最初は読み取り専用で点検しました。恒久的なGRUB変更やパスワードの変更は行っていません。一時的なサービス起動抑止も元へ戻します。

次は確認用コマンドの例です。修復コマンドを一律に実行する手順ではありません。出力は公開前に秘密値や接続情報がないか確認してください。

```bash
cat /etc/os-release
uname -r
sudo dpkg --audit
sudo apt-get check
sudo sshd -t
systemctl --failed
cat /proc/sys/kernel/random/boot_id
```

元の更新コマンドの終了コードが記録されていない場合は、後から成功値を補いません。修復した内容と、その後の実測結果を記録します。新カーネルのファイルが存在していても、そのカーネルで通常起動したことは別に確認します。

## ネットワークと認証は、失敗の根拠から直す

既存Netplanが正しくても、更新後の起動で別の仕組みが生成し直すと接続が変わります。今回の管理方式では既存設定のハッシュを照合し、[cloud-initのネットワーク生成設定](https://docs.cloud-init.io/en/24.3/reference/network-config.html#disabling-network-configuration)で再生成だけを無効化しました。クラウド側のネットワーク管理が必要な環境へ、一律に適用する設定ではありません。

SSHが戻らない原因はネットワーク設定だけとは限りません。実機では、古いLDAP中継socketとVPNの起動順序が循環し、systemdがVPNの起動を取り消していました。現在使う中継の待受と通信を確認してから、役割を終えた古いsocketだけ自動起動を解除しました。socket activationの待機中にserviceがinactiveでも、それだけでは異常とは判断できません。

SSSDでは、廃止された`config_file_version`と、monitor起動・socket起動の競合を確認しました。[SSSD 2.10の変更](https://sssd.io/release-notes/sssd-2.10.0.html#configuration-changes)と[Ubuntuの設定仕様](https://manpages.ubuntu.com/manpages/resolute/man5/sssd.conf.5.html)を照合し、元ファイルの所有者・権限を保存して限定的に修正します。すべてのSSSD socketを止める方法ではありません。

修正後は`sssctl config-check`、NSS・PAM・PAC responder、ドメインのOnline状態、既存machine keyによる`adcli testjoin`を確認しました。設定を直すために鍵を作り直したり、ドメインへ再参加したりはしていません。

| 観測した問題             | 根拠                               | 修復後に確かめたこと                  |
| ------------------------ | ---------------------------------- | ------------------------------------- |
| AD/DCの必要構成が不足    | パッケージ構成と公式の移行注意事項 | Samba起動、DB・LDAP、元のドメインID   |
| VPNが通常起動で戻らない  | journalの起動循環と取消記録        | 通常再起動後のSSH・VPN・DNS・LDAP     |
| SSSDの設定・socketが失敗 | config-checkとresponderの競合ログ  | responderの稼働、Online、machine join |

## Minecraftの無人判定には、新鮮さと受付停止が必要

Velocityの更新は、利用者がいない場合だけ実施しました。コンソールへ定期的に`list`や`glist`を送らず、人数だけをJSON監視とstatus pingで取得します。監視している8台だけでなく、監視対象外の1台を含む稼働バックエンド9台とプロキシを照合しました。

判定は、すべての人数が0で、観測と監視snapshotが15秒以内の場合だけ通します。有人、未取得、照会失敗、古い値、未監視の対象があれば待機します。プレイヤー名は判定に不要です。

1. 全対象が新鮮な0で、先行する保守作業も終わっていることを確認する。
2. 更新前の復元確認と、対象専用の設定・元状態の退避を済ませる。
3. 停止直前にもう一度人数を取得する。
4. ゲームの新規受付だけを一時的に閉じ、閉じた後の新しい観測でも全0を確認する。
5. Velocityへ正常終了を要求し、終了を確認してから通常APT更新へ進む。
6. 通常再起動、独立した接続確認、受付復元、更新後の実復元確認を行う。

受付停止はIPv4・IPv6の必要なTCP・UDPを対象にし、再起動中も維持しました。SSH、VPN、API、バックエンドの通信を保ち、既存ファイアウォール全体を置き換えず、専用の一時ルールを使います。受付を戻す際は一時unitやルールの撤去まで確認します。

Velocityの正常終了には、コンソールの[`shutdown`](https://docs.papermc.io/velocity/built-in-commands/)を使いました。バックエンド本体、ワールド、pluginの更新や停止はこの作業に含めていません。

## 段階配信の保留は、作業フェーズに応じて扱う

通常更新では削除なしのsimulation、厳密なAPT索引取得、設定保持、元のtimerとholdへの復帰を確認しました。サービスの再起動を意図した順序で行うため、この通常更新では`NEEDRESTART_MODE=l`を使いました。SSH切断に依存せず、対象ホストと停止状態を検査するworkerで更新を実行しています。

移行後の通常更新で残った7件は、[Ubuntuの段階配信](https://ubuntu.com/project/docs/how-ubuntu-is-made/concepts/phased-updates/)に従って保留しました。保留を消すためだけに強制配信へ切り替えていません。

一方、リリース更新の前提確認では扱いが異なります。Ubuntuの公式手順は、段階配信のパッケージも含めた更新を案内しています。移行後の日常更新の方針を、`do-release-upgrade`の事前条件へそのまま当てはめないことが大切です。

## 完了は、再起動と同じ保存世代の検証で判定する

最終的に6台でUbuntu 26.04.1と新カーネルによる通常起動を確認しました。boot IDの変化、パッケージ整合性、失敗unitの有無、SSH・VPN、役割サービスの自動復帰、元設定・timer・hold・受付状態への復帰を照合しています。

VelocityはJava版のstatus応答、GeyserのRakNet応答、別ホストからの接続を検査しました。経済APIは、許可された経路の200、認証なしの401、認証ありの200を確認しています。HTTP 200だけで認証境界まで正常と判断しません。

バックアップが有効な対象では、完成状態を改めて保存し、その同じ世代を実復元して検証しました。古い復元成功を、新しい保存世代の証拠に使い回しません。停止指定のバックアップは停止状態を維持しています。

ここまでで通常運用への復帰を確認しましたが、実ユーザーの対話ログイン、Minecraftの実プレイ、Botの実投稿や生成処理は未実施です。全サービスを別環境で起動する災害復旧も、この検証と区別します。また、DebianからUbuntuへの移行は本事例の対象外です。
