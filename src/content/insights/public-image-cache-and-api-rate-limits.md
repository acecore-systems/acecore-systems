---
title: "公開画像のエッジキャッシュとAPIの閲覧制限を分ける"
description: "画像付きコンテンツの連続閲覧で、本文APIと画像取得が同じ制限枠を使っていた事例。公開画像の再利用、正常応答の検証、WAFとアプリの境界、本番確認を整理します。"
date: "2026-10-06T02:20:00+09:00"
lastUpdated: "2026-10-09T15:00:00+09:00"
author: gui
image: /images/insights/covers/public-image-cache-and-api-rate-limits-cover-v1.webp
tags: ["Cloudflare", "Performance", "Web"]
callout:
  type: note
  title: "キャッシュと閲覧制限を別々に確認する"
  text: "実装・CI・GitHub連携による本番配信と、代表画像の取得内容・キャッシュ状態の照合を確認した事例です。全拠点のキャッシュ命中率や高負荷時の性能改善率を測定した結果ではありません。"
---

画像付きの日記やカタログでは、日付やページを切り替えるたびに本文APIと画像の取得が発生します。連続閲覧時に画像が止まった事例を、運用URL・内部ルート・制限値を伏せて紹介します。

## 連続閲覧を一枚の画像から再現する

同じ公開画像を繰り返し取得し、初回と再取得でbodyのハッシュ、status、キャッシュ状態を比べます。次に本文と複数画像を通常のページ切替で取得し、どの要求が制限枠へ数えられるか確認します。HITだけを成功基準にせず、画像内容とAPI保護の両方を確認する試験です。

[Cloudflare Cache API：条件付き取得と拠点ごとのキャッシュ](https://developers.cloudflare.com/workers/runtime-apis/cache/)

## 本文と画像が同じ枠を消費していた

この事例では、動的APIへのリクエストと公開画像のGETをWAFの同じ制限枠で数えていました。普通のページ切替でも複数の取得が重なり、本文は取得できても画像だけが制限される場合がありました。

画像のエッジキャッシュを追加しても、WAFで先に止められるリクエストは届きません。配信元の負荷を減らす変更と、何を同じ制限枠で数えるかの変更を別々に行いました。既存のアプリ側制限や生成処理のquotaは、それぞれの目的に沿って維持します。

## 共有できる公開画像だけを再利用する

ここで扱う画像は、同じ公開asset IDなら同じ内容を返す不変の画像です。asset IDの形式、リクエスト境界、Service Bindingの設定を確認してから、同一hostとasset IDに対応するキャッシュを参照します。キャッシュが温まっていても、この入口の確認を飛ばしません。

内容に影響しないquery stringや利用者のヘッダーで同じ画像のキャッシュを分割しない設計にしました。この判断は、不変の公開画像という前提があるために可能です。利用者や組織ごとに内容が変わる非公開画像へ、そのまま適用することはできません。

## 検証した200応答を保存する

キャッシュがなければ、非公開のService Binding先から画像を取得します。HTTP status、画像のContent-Type、Content-Length、応答bodyを検証し、条件を満たす200応答だけを保存します。部分応答、空のbody、不正なmetadata、障害応答は保存対象にしません。

画像の実体を保存する処理と、ETag一致による304応答は分けます。キャッシュへの書込みは`waitUntil`へ登録し、読取りや書込みの障害では、配信元から取得できた正常な画像の返却を妨げないようにしました。再取得時にキャッシュが使えれば、Service Binding先の取得処理を省けます。

[Cloudflare Cache API](https://developers.cloudflare.com/workers/runtime-apis/cache/)では、ETagを使った条件付き取得と、拠点ごとのキャッシュの性質を確認できます。ある拠点のHITは全拠点のHITを意味しません。Pages Functionsの応答ヘッダーは[静的ファイル用の`_headers`](https://developers.cloudflare.com/pages/configuration/headers/)だけでは設定できないため、Function側で管理します。

## 動的APIの制限を独立して扱う

動的APIの保護は、画像をキャッシュできることとは別の要件です。この事例ではWAFの集計対象から公開画像のGETを外し、対象となる動的API、制限期間、action、有効状態を適用後に読み直しました。変更前の設定も切戻し用に保存しています。

閾値は通常閲覧で発生する取得数と、保護する処理の負荷に合わせて選びます。[Cloudflareのレート制限](https://developers.cloudflare.com/waf/rate-limiting-rules/)のplan別条件も確認が必要です。リポジトリの運用メモに値があるだけで、本番ruleが有効だとは判断できません。

<figure class="article-diagram" data-layout="boundary" data-tone="teal" data-count="2" aria-labelledby="diagram-public-image-cache-and-api-rate-limits">
  <figcaption>
    <strong id="diagram-public-image-cache-and-api-rate-limits">公開画像と動的APIの境界</strong>
    <span>不変の公開画像の再利用と、動的APIの保護を別に設計します。非公開画像は対象外です。</span>
  </figcaption>
  <ol class="article-diagram__nodes">
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">1</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="m21 15-5-5L5 20"/></svg></span>
      <strong>公開画像GET</strong>
      <span>入口を確認し、同じ画像をcacheで再利用。保存は検証した200だけ。</span>
    </li>
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">2</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M12 3 20 6v5c0 5-3.4 8.5-8 10-4.6-1.5-8-5-8-10V6l8-3Z"/><path d="m9 12 2 2 4-4"/></svg></span>
      <strong>動的API</strong>
      <span>WAFとアプリquotaで処理を保護。画像cacheとは別に制限する。</span>
    </li>
  </ol>
</figure>

## 本番では画像の内容まで照合する

単体テストでは、同じ公開画像の再利用、host・asset IDの分離、キャッシュ利用前の境界確認、304、キャッシュ障害、保存してはいけない応答を確認しました。CIの後にGitHub pushによる本番deploymentとcustom domainを確認し、代表画像のHTTP結果、アプリが示すHIT・MISSなどの状態、取得したbytesのhashを照合しました。

本番では本文と複数画像の連続取得も行い、その通常閲覧の試験条件では制限に当たらないことを確認しました。これは限定した取得条件での確認であり、高負荷時の境界まで試した結果ではありません。

キャッシュ状態の表示だけでは、正しい画像を返した証明にはなりません。本文の取得、画像の取得、WAFの設定、画面上の閲覧結果を別々に確認します。この記録は代表画像の配信確認までで、全利用者・全拠点の連続閲覧や高負荷時の性能改善率まで実証したものではありません。

サイト全体の静的・動的な分担は[AstroとCloudflareの全体設計](/insights/astro-cloudflare-site-architecture/)、画像・CSSなどの配信最適化は[Astroのパフォーマンス調整](/insights/astro-performance-tuning/)も参照してください。
