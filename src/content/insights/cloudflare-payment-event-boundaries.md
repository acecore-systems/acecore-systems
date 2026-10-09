---
title: "決済・返金Webhookを安全に扱う：Workersでの照合と状態管理"
description: "署名、重複、遅延したイベント、返金状態と外部APIの応答を分けて扱う実装事例。管理操作の再確認と通知の境界を紹介します。"
date: "2026-10-06T01:10:00+09:00"
lastUpdated: "2026-10-09T15:00:00+09:00"
author: gui
image: /images/insights/covers/cloudflare-payment-event-boundaries-cover-v1.webp
tags: ["Cloudflare Workers", "Stripe", "Security"]
callout:
  type: note
  title: "実装の確認と実取引の操作を区別"
  text: "実装・テスト・本番配信・外部APIの読み取り照合を確認した匿名の事例です。検証のために顧客の返金・取消・ポイント調整を実行したものではなく、あらゆる決済経路の通し検証を主張しません。"
---

Workersの決済Webhookを検証するなら、テスト環境で同じイベントの再配信と到着順の入れ替わりを試し、業務状態が重複更新されないことを確認します。外部APIのリダイレクト処理は[Cloudflare Workers: Request](https://developers.cloudflare.com/workers/runtime-apis/request/)と実行環境を照合し、受信成功・外部状態確認・後続処理を分けて記録してください。

決済サービスのイベントを受信しただけで、注文や返金を完了扱いにはできません。Workers上の管理処理を整えた事例から、外部の状態と自分たちの記録を照合する境界を整理します。顧客情報、実取引の識別子、内部の通知先は掲載しません。

## 署名と重複を入口で確認する

Webhookはリクエストの未加工の本文と署名を検証し、想定する本番・テストのモードを照合します。イベントIDの処理記録と処理中の占有を使い、同じイベントの再配信を二重の業務操作にしません。これは受信順序が保証されるという意味ではありません。[StripeのWebhook公式ガイド](https://docs.stripe.com/webhooks)も参照してください。

## 古い返金イベントから現在の状態を確認する

この事例では `refund.created`、`refund.updated`、`refund.failed` を扱い、管理中の返金はStripeから現在のオブジェクトを取得して照合します。遅れて届いた通知の状態で、記録を古い状態へ戻さないためです。返金の成功分と保留分も分け、注文全体の返金完了を判断します。

金額、通貨、PaymentIntent、注文と操作を結びつけるmetadata、すでに保存した識別子を確認します。決済には `py_`、返金には `pyr_` という識別子もあり、既知の一種類の接頭辞だけで正当な応答を拒否しないよう修正しました。対応する接頭辞を増やすことと、照合を緩めることは別です。取得できない値をゼロとして集計しません。

## 返金・ポイント・通知を別の結果にする

返金を依頼する前に残高と権限を確認し、外部状態の取得後、実際の書き込み直前にも権限と操作の有効期限を再確認します。操作ごとの冪等性と占有を使い、外部結果が不明な場合は現在の状態の再照合へ進み、無条件に返金を再実行しません。

返金成功とポイント調整成功は異なる状態です。後続処理の失敗を返金の再実行へ変換せず、必要な再照合・修復の記録を残します。通知設定・実受信・担当者の対応完了は、決済イベント処理とは別の受入事項です。本稿では通知の稼働状態を主張しません。

<figure class="article-diagram" data-layout="flow" data-tone="amber" data-count="3" aria-labelledby="diagram-cloudflare-payment-event-boundaries">
  <figcaption>
    <strong id="diagram-cloudflare-payment-event-boundaries">Webhookから業務結果まで</strong>
    <span>現在状態を照合して処理を分けます。実顧客の返金・ポイント操作は行っていません。</span>
  </figcaption>
  <ol class="article-diagram__nodes">
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">1</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M4 5h16v14H4z"/><path d="M8 9h8M8 12h5M8 15h3"/></svg></span>
      <strong>入口を検証</strong>
      <span>未加工body・mode・event IDを確認し、再送や処理中を識別。</span>
    </li>
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">2</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5M8 10h5"/></svg></span>
      <strong>現在状態を照合</strong>
      <span>遅延eventで記録を戻さず、金額・通貨・注文と照合。</span>
    </li>
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">3</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="4" y="5" width="6" height="14" rx="1"/><rect x="14" y="5" width="6" height="14" rx="1"/><path d="M11 12h2"/></svg></span>
      <strong>結果を分けて記録</strong>
      <span>返金・ポイント・通知は別状態。外部結果が不明なら再実行せず再照合。</span>
    </li>
  </ol>
</figure>

## NodeとWorkersの実行環境で応答を確認する

外部APIへのfetchをNodeのテストだけで評価すると、Workersの実行環境で起こる差を見落とす場合があります。この事例では `redirect: 'error'` の互換性問題を調べ、`redirect: 'manual'` とHTTP statusの明示的な確認へ変更しました。3xxやエラーページを正常なJSONとして扱わず、別のホストへ認証情報を付けたまま自動追従しません。仕様は[WorkersのRequest](https://developers.cloudflare.com/workers/runtime-apis/request/)を確認します。

## 配信と受入の範囲を記録する

DB変更、依存する処理、管理画面を順に反映し、テスト・CI・本番の読み取り画面・外部APIとの整合性を確認しました。実顧客の金銭操作を検証目的で行ったものではありません。CSVへの出力でも数式として解釈され得るセルを文字列にし、不明な手数料をゼロに置き換えない境界を設けています。

管理ログインは[複数サービスのセッション設計](/insights/multi-service-session-lifecycle/)も参照してください。
