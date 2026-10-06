---
title: "Minecraftの遅延をどう調べるか：静かな測定と共有ストレージの切り分け"
description: "TPS・MSPTの静かな収集からJFRとOSのI/O観測を照合するまで。完了した原因調査と、未実施の性能改善を分けて紹介します。"
date: "2026-10-06T01:10:00+09:00"
lastUpdated: "2026-10-06T08:52:00+09:00"
author: gui
image: /images/insights/covers/minecraft-latency-investigation-cover-v1.webp
tags: ["Minecraft", "Monitoring", "Performance"]
callout:
  type: note
  title: "原因調査と改善効果を分ける"
  text: "常時計測の導入と保存待ちの原因調査は完了しています。別ストレージへの移行や改善効果の比較は未実施で、部品故障や全利用者のラグ解消を証明するものではありません。"
---

Minecraftの『重い』には、サーバーのtick処理、短い保存待ち、通信、クライアントの描画など、異なる原因が含まれます。複数のPaperサーバーで行った調査を、内部ホスト名や構成を伏せて紹介します。

## 平均と短い停止を別々に測る

TPSだけでなく、MSPTの平均・最大・p95、遅いtickの累積回数を残します。平均が低くても、短い停止は起こります。ホスト全体のCPU使用率だけでは、単一スレッドの処理やI/O待ちは切り分けられません。

## コンソールを増やさず、欠測も記録する

この事例では、Paperの公開APIから取った測定値を小型プラグインがローカルJSONへ書き、収集器が監視用の系列へ集約しました。ファイルI/Oはゲームのmain threadから分け、一時ファイルからの置換で読み取り途中の内容を避けます。通常のコンソールログを隠す方式ではありません。

データの時刻と収集の成功状態も確認します。停止した収集器の古い値を正常値として使わず、欠測をTPSゼロへ置き換えません。

## 同じ時刻のJVM・OS・保存処理を照合する

問題が再現する中で、JFR・OSの待機・ブロックI/Oを別々の限定した時間窓で採取しました。周期的なI/O pressureとMSPTの継続系列に突き合わせ、GCや同期保存の待ちを切り分けました。すべての採取を同時刻に行ったという意味ではありません。一般的なPaperの入口は[公式のsparkによるプロファイリング](https://docs.papermc.io/paper/profiling/)です。この事例では、保存時の待機を掘り下げるためJFRとOS観測を組み合わせました。

正常な観測窓240秒と停滞した観測窓220秒では、1秒ごとのwrite awaitの中央値が1.60msと43.71ms、最大値が6.00msと123.57msでした。これは二つの観測窓の比較で、対策前後の改善率や一般的なベンチマークではありません。

同期保存とファイルシステムのjournal待ちに加え、複数アプリケーションのデバイス要求でも遅延を確認し、共有ストレージ経路を対策候補に絞りました。[Linuxのブロックtracepoint](https://www.kernel.org/doc/html/latest/core-api/tracepoint.html)の完了イベントは要求の一部を表す場合もあるため、照合できなかった要求を混ぜて全I/Oの統計とはしません。採取にも時間・容量の上限を設け、計測自身の負荷を考慮します。

<figure class="article-diagram" data-layout="compare" data-tone="green" data-count="2" aria-labelledby="diagram-minecraft-latency-investigation">
  <figcaption>
    <strong id="diagram-minecraft-latency-investigation">観測と原因仮説を分ける</strong>
    <span>常時計測と限定採取は別の観測窓です。ストレージ移行の効果は未検証です。</span>
  </figcaption>
  <ol class="article-diagram__nodes">
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">1</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M4 19V5M4 19h16"/><path d="m7 15 4-5 3 2 5-7"/></svg></span>
      <strong>静かな常時計測</strong>
      <span>TPS/MSPTと欠測を記録し、通常のconsole logを増やさない。</span>
    </li>
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">2</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="12" cy="12" r="4"/><path d="M6 8h.01M18 16h.01"/></svg></span>
      <strong>限定窓で原因調査</strong>
      <span>JFR・OS・block I/Oを別々に採取して照合。共有storage経路は候補で、故障確定ではない。</span>
    </li>
  </ol>
</figure>

## ここから先は別の検証

調査後は限定採取を終了し、常時計測が正常であることを確認しました。ストレージ移行後に同程度の利用状況で複数の周期を比較する試験は未実施です。保存の耐久性を下げたり、GCや特定プラグインを根拠なく原因と決めたりせず、バックアップ・復元・切戻しを用意した次の対策へ進むための調査記録です。

監視の検知と判断の分け方は[OpenClawの監視・障害調査](/insights/openclaw-monitoring-investigation/)、復元の検証は[R2とresticのバックアップ監視](/insights/restic-r2-backup-verification/)も参照してください。
