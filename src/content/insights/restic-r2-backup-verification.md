---
title: "R2とresticのバックアップ監視：保存成功から復元確認まで"
description: "R2を保存先にしたrestic運用で、スナップショットの鮮度・整合性・復元を別々に確かめる設計と、未検証の完全復旧範囲を紹介します。"
date: "2026-09-30T20:53:00+09:00"
lastUpdated: "2026-10-06T08:52:00+09:00"
author: gui
image: /images/insights/covers/restic-r2-backup-verification-cover-v1.webp
tags: ["Cloudflare R2", "restic", "Backup"]
callout:
  type: note
  title: "完全復旧は別の検証"
  text: "定期バックアップと監視、保持処理、対象データの取り出し・整合性確認を実施しています。すべてのアプリケーションの起動確認や、認証情報の別管理を含む災害復旧の完了は実証していません。"
---

バックアップの定期処理が終わっても、必要なデータを取り戻せるとは限りません。R2とresticを使った社内運用から、保存、整合性確認、復元、サービス復旧を別々に評価する考え方を一般化して紹介します。既存の別サービスからの移行完了を示す事例ではありません。

## 保存対象と成功の定義を決める

resticの暗号化・重複排除を使い、R2のS3互換APIへ保存する構成です。S3互換でもすべての操作が同一ではないため、必要な操作を[対応表](https://developers.cloudflare.com/r2/api/s3/api/)で確認します。稼働中のデータベースなどは、ダンプやアプリケーションの静止化を含む、整合性を保った取得方法を設計します。

## ジョブの終了と保存の鮮度を分ける

最新の成功スナップショットの時刻、予定からの遅延、処理の失敗、検査と復元確認の結果を別々に監視します。ジョブが起動しただけでは成功扱いにせず、通知の失敗もバックアップ自体の失敗と区別して追跡します。

## 整合性と取り出しを確かめる

`restic check` の通常検査と、データ実体を読む検査は範囲が異なります。`--read-data` は全データを読み、部分検査なら確認した範囲を記録します。[公式の整合性検査](https://restic.readthedocs.io/en/stable/045_working_with_repos.html)を参照し、別の作業場所への[復元](https://restic.readthedocs.io/en/stable/050_restore.html)と、ファイル内容やハッシュの照合を組み合わせます。ファイルを取り出せてもアプリケーションの起動を確認したことにはなりません。

## 保持処理はリポジトリを理解する道具で行う

保持対象はresticのポリシーで選び、`forget`、`prune`、`check`を使って整理と検査を進めます。実行前に残すスナップショットを確認します。R2側で古いオブジェクトを一律に削除する方式は、残すスナップショットが共有するデータを失わせるおそれがあります。[resticの保持・削除手順](https://restic.readthedocs.io/en/stable/060_forget.html)に従い、画像配信など別用途のオブジェクト整理と混同しません。

## 完全復旧に必要な残りの確認

定期運用、監視・通知、保持処理、対象データの取り出しと整合性確認を実施しました。一方、すべてのアプリケーションの起動、設定や依存データを含む復旧手順、認証情報を別に保管して取り出す手順は、全体としての実証が残っています。復旧時間や失えるデータの範囲も実測で定める必要があり、完全な災害復旧や費用削減の達成を主張する記事ではありません。

<figure class="article-diagram" data-layout="layers" data-tone="amber" data-count="3" aria-labelledby="diagram-restic-r2-backup-verification">
  <figcaption>
    <strong id="diagram-restic-r2-backup-verification">snapshotの鮮度から完全復旧まで、証拠を段階で確認</strong>
    <span>データを取り出せても、アプリや認証情報の復旧まで証明したことにはなりません。</span>
  </figcaption>
  <ol class="article-diagram__nodes">
    <li>
      <span class="article-diagram__symbol">
        <span aria-hidden="true">1</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M4 7h16v13H4z M3 7l2-4h14l2 4 M8 11h8 M12 11v5"/></svg>
      </span>
      <strong>成功snapshotと鮮度</strong>
      <span>実際に成功したsnapshotの時刻と予定からの遅延を確認します。ジョブの起動だけでは成功としません。</span>
    </li>
    <li>
      <span class="article-diagram__symbol">
        <span aria-hidden="true">2</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M5 6h14v13H5z M8 10h8 M8 14l2 2 4-4"/></svg>
      </span>
      <strong>整合性と隔離復元</strong>
      <span>検査範囲を記録し、別の場所で restore --verify。対象ファイルとhashを照合してからpruneを検討します。</span>
    </li>
    <li>
      <span class="article-diagram__symbol">
        <span aria-hidden="true">3</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M5 8h14v12H5z M8 8V5h8v3 M9 14h.01 M12 14h.01 M15 14h.01"/></svg>
      </span>
      <strong>完全な災害復旧</strong>
      <span>全アプリの起動、依存データ、別管理の認証情報回復は未実証です。復旧時間や許容データ損失も未測定です。</span>
    </li>
  </ol>
</figure>

## 2026年10月6日追記：古いlockと復元検査の占有

追加改修では、同じホストで処理の占有を確認してから通常の `restic unlock` を実行し、古いlockだけを扱いました。稼働中のlockまで消す `--remove-all` は使いません。競合には上限のある `--retry-lock` を使い、復元検査やpruneが失敗時に無限に再起動しないようにしました。ホスト内の占有だけで別ホストの競合が無いと証明できるわけではありません。

隔離した一時ディレクトリへ `restore --verify` で取り出し、対象に必要なファイルと整合性を確認した後、検証したsnapshotと設定の対応を記録しました。対象データの復元確認を先に行い、その後で保持対象を確認してpruneへ進みます。バックアップの鮮度は起動や再試行ではなく、実際に成功したsnapshotで評価します。

対象データの取り出しを確認した範囲と、全アプリの起動・認証情報の回復を含む完全復旧は引き続き別です。保守時間と取得失敗の扱いは[監視・障害調査の記事](/insights/openclaw-monitoring-investigation/)も参照してください。
