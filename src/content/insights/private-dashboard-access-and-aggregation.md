---
title: "Cloudflare PagesとD1で作る認証付き運営ダッシュボード"
description: "Cloudflare Accessで入口を保護し、Pages FunctionsからD1の運用集計を読み取る構成を匿名化して紹介。GitHub連携の本番配信、認証済み画面、集計用DB索引の確認範囲を分けて説明します。"
date: "2026-10-06T01:10:00+09:00"
lastUpdated: "2026-10-06T08:52:00+09:00"
author: gui
image: /images/insights/covers/private-dashboard-access-and-aggregation-cover-v1.webp
tags: ["Cloudflare Pages", "Cloudflare D1", "Security"]
callout:
  type: note
  title: "実装・本番画面・索引確認を分ける"
  text: "Accessで保護したPages画面とD1の読み取り集計を実装し、GitHub連携の本番配信、認証済みUI、本番クエリでの索引利用を確認した匿名事例です。大規模負荷や複数組織への性能保証は検証していません。"
---

運用に必要な情報が複数のログやデータベースに分散すると、担当者は現在の状態を安全に確かめにくくなります。認証付きの運営ダッシュボードを作った事例から、入口、集計、配信の確認方法を一般化します。固有のドメイン、アカウント、投稿内容、実運用数値は掲載しません。

## 画面とAPIの両方を認証境界に入れる

Cloudflare Pagesの静的画面だけを隠しても、データを返すAPIが直接呼べる状態では意味がありません。Cloudflare Accessの対象に画面とAPIを含め、運用者だけが読み取れる入口を設けます。検証手順では、画面とデータAPIの双方を認証前・認証後に確かめます。本件では本番画面の認証境界と、専用ログイン後にデータが表示されることを確認しました。API単独URLへの未認証試験は、この記録では未確認で、追加の受入項目に含めます。ブラウザーへ認証用の秘密情報を埋め込まないことも基本です。

<figure class="article-diagram" data-layout="boundary" data-tone="teal" data-count="2" aria-labelledby="diagram-private-dashboard-access-and-aggregation">
  <figcaption>
    <strong id="diagram-private-dashboard-access-and-aggregation">画面とAPIを認証境界に置く</strong>
    <span>API直接の未認証アクセス試験は未確認。確認は単一の運用環境です。</span>
  </figcaption>
  <ol class="article-diagram__nodes">
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">1</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="3" y="6" width="18" height="14" rx="2"/><path d="M8 6V4a4 4 0 0 1 8 0v2M9 13h6"/></svg></span>
      <strong>認証済み画面</strong>
      <span>Accessを通った運用者に、保護された集計を表示する。</span>
    </li>
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">2</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v7c0 1.7 3.6 3 8 3M20 5v5M4 12v7c0 1.7 3.6 3 8 3"/></svg></span>
      <strong>読み取り専用API</strong>
      <span>同じ境界内でD1を読む。API直接URLの未認証拒否は未確認。</span>
    </li>
  </ol>
</figure>

## 書き込み処理と読み取り集計を分ける

Pages FunctionsのGET APIからD1へ問い合わせ、時間帯ごとの件数、最近の処理状況、実行モードなどをひとつの応答にまとめます。画面の見た目やボタンの非表示だけに頼らず、運営ダッシュボードのAPI自体を読み取り用途に限定します。対象期間、時刻基準、確定済みと確認待ちの状態を決め、違う意味の件数を同じ数字へ足さないようにします。欠けた値や未確定の状態も、成功件数やゼロとして扱わず別に見せます。

## 集計クエリに合わせてD1索引を確かめる

運用画面は直近の期間で何度も絞り込むため、画面の応答だけを見て索引の有効性を推測しません。実際の集計条件に合う索引を追加した後、本番D1でクエリ計画を調べ、狙った索引が使われることを確かめます。索引を作ったことと、クエリが利用することは別の確認です。この事例では両方を本番で確認しましたが、応答時間の改善率や大規模負荷への耐性を示すベンチマークは行っていません。

## 本番配信後に認証状態と表示を確認する

PagesはGitHub連携で本番へ配信し、対象のコミットに対するデプロイ成功とカスタムドメインの有効状態を確認します。その後、認証前には保護されること、認証後にはダッシュボードのデータが表示されることを本番UIで確かめます。CIやデプロイ成功だけで、認証済み利用者の画面表示まで済んだことにはしません。

この匿名事例で確認したのは、単一の運用環境での認証境界、本番画面、D1集計クエリの索引利用です。複数組織の権限分離、利用者数が増えた際の負荷試験、あらゆる認証設定に対する侵入試験は未実施です。サイト全体のPages構成は[Cloudflare Pagesのサイト設計](/insights/astro-cloudflare-site-architecture/)も参照してください。
