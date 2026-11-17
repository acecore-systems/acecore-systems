---
title: "GitHub Actionsの重複実行とGradleビルド時間を別々に減らす"
description: "pushとPRで重複するCIの起動条件を見直し、AndroidのGradleキャッシュを同一コミットで比較。判断条件と実測の限界を整理します。"
date: "2026-11-17T12:00:00+09:00"
author: gui
image: /images/insights/covers/astro-performance-tuning-cover-v2.webp
tags: ["GitHub Actions", "Android", "運用"]
---

AndroidのCIが毎回同じ処理を繰り返すなら、キャッシュの復元にかかる時間を含めて比較すると、導入の判断材料になります。DaysChatのAndroidジョブで行った同一コミットの試験を使い、速さと再現性をどう確認したかを紹介します。

<figure class="article-diagram" data-layout="flow" data-tone="blue" data-count="3" aria-labelledby="diagram-gradle">
  <figcaption><strong id="diagram-gradle">同じ入力でキャッシュを比較</strong><span>保存と復元の負担を含めてジョブ全体を見ます。</span></figcaption>
  <ol class="article-diagram__nodes">
    <li><strong>初回実行</strong><span>キャッシュを作り、保存時間を記録。</span></li>
    <li><strong>同一コミット再実行</strong><span>復元時間と再利用タスクを確認。</span></li>
    <li><strong>成果物を検証</strong><span>対象アーキテクチャとAPK生成を確認。</span></li>
  </ol>
</figure>

## pushとPRで同じ検証を重ねない

別の会議録システムでは、作業ブランチへのpushとPRの両方で通常CIとRust parityが起動していました。pushによる起動はmainに絞り、PRの検証は維持し、PR作成前に確認したい場合は手動実行を使えるようにしました。本番リリースの起動条件は変更していません。

社内の調査では、11月にPR側も成功したpush起動が97回、Linuxランナーの合計が342分でした。これは重複を調べる対象の実行時間であり、変更後に実際に節約した時間や請求額ではありません。PRがない変更をどう検証するか、必須チェックとリリースを止めないかを確認してから対象を絞ります。[GitHub Actionsのイベント](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows)でpushとpull_requestの条件を確認できます。

## ジョブ内の実測結果と条件

社内の変更記録に残した同一コミット比較では、Androidジョブは初回16分20秒、復元を含む再実行6分16秒でした。Gradleタスク194件を再利用し、x86_64とarm64-v8aの確認とAPK生成も通過しました。初回の保存は34秒、再実行の復元は62秒、試験用キャッシュは約1.81 GBです。

| 観測項目       | 初回     | 再実行   |
| -------------- | -------- | -------- |
| Androidジョブ  | 16分20秒 | 6分16秒  |
| キャッシュ操作 | 保存34秒 | 復元62秒 |

この1組はPR専用キャッシュで測った例です。最終構成はmainだけが共有キャッシュを保存し、PRは読み取り専用で復元します。最終構成のすべてのPRで同じ短縮が得られること、請求額が減ることは測定していません。実行環境やキャッシュの一致率でも結果は変わります。

## 再利用できる条件と安全な保存を決める

[Gradleのビルドキャッシュ](https://docs.gradle.org/current/userguide/build_cache.html)はタスクの入力と出力を使って再利用を判断します。タスクの入力宣言が不正確だと古い出力を使う原因になるため、まずクリーンな実行と成果物、テスト結果を比較します。依存関係やビルド設定を変更したときに期待どおり無効化されるかも確認します。

保存できる実行主体を限定し、未信頼の変更が共有キャッシュを更新しない構成にします。[GitHub Actionsの依存関係キャッシュ](https://docs.github.com/en/actions/concepts/workflows-and-actions/dependency-caching)にはアクセス範囲と利用上の注意があります。キャッシュは秘密情報の保管場所にせず、サイズ、保存・復元時間、ジョブ全体の所要時間を合わせて観測します。

まず対象を1ジョブに絞り、同じコミットの初回と再実行で成果物と時間を記録してください。短縮が見えても、異なる変更やキャッシュ欠落時に正常にビルドできることを別に確認します。確認日：2026年11月17日。
