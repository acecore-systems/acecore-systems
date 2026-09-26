---
title: "Cloudflare Pages の静的配信と Functions のセキュリティヘッダー"
description: "Cloudflare Pages の静的配信と Functions の応答を区別し、_headers、CSP、現行構成の確認方法を整理します。"
date: 2026-03-15T00:00
author: gui
tags: ["技術", "Cloudflare", "セキュリティ"]
image: /uploads/acecore-generated/blog-cloudflare-pages-security.webp
lastUpdated: "2026-09-26T19:12:47+09:00"
---

この記事は、2026年3月にお問い合わせを外部フォームへ移して Cloudflare Pages の静的配信へ戻した経緯を記録しています。その後、サイト構成は変わりました。**2026年9月時点の Acecore 公式サイトは、静的ページに加えて Pages Functions を使用**し、お問い合わせ、コメント、検索、AI案内、CMS の API を同じサイトで扱います。以下は当時の選定理由と、現在も使えるヘッダー設計の境界を整理したものです。

## 静的ページと Functions を分けて考える

`public/_headers` は、Pages が配信する**静的アセットの応答**に適用されます。Cloudflare の公式資料は、URL パターンが一致していても Pages Functions が生成した応答には適用されないと明記しています。API 応答に必要な CORS、キャッシュ、セキュリティヘッダーは、Function 側の `Response` に設定します。

このため「`_headers` を一度書けばサイトのすべてのページと API に効く」と考えるのは危険です。静的 HTML と `/api/*` の両方について、実際のレスポンスヘッダーを別々に確認します。

## 現在の設定を確認する場所

[現行の `_headers`](https://github.com/acecore-systems/acecore-net/blob/main/public/_headers)では、HTML は再検証、ハッシュ付き `_astro/` アセットは長期キャッシュに分けています。管理画面には通常ページと別の CSP を指定し、`X-Frame-Options` は `SAMEORIGIN` です。古い記事に載っていた `form-action https://ssgform.com`、HTMLの1時間キャッシュ、`DENY` を、現在の値としてコピーしないでください。

現在の動的経路は[Pages Functions のコード](https://github.com/acecore-systems/acecore-net/tree/main/functions)で確認できます。CSP に許可する外部ドメインも、実際に読み込むスクリプト、画像、フレーム、通信先に合わせて検査します。掲載した設定をそのまま別サイトへ移植しないでください。

## デプロイと確認

公式サイトは GitHub に連携した Cloudflare Pages で `main` を公開します。[現在の Node バージョン](https://github.com/acecore-systems/acecore-net/blob/main/.node-version)は `.node-version` に、ビルド手順は `package.json` に置き、CI は `npm run build` で検証します。2026年3月当時の「Node.js 22 / npx astro build」という表は、現行の公開手順ではありません。

公開を確認するときは、PRのプレビュー、mainのビルド、Pagesの本番デプロイ、公開URLのヘッダーと本文を別々に確認します。Cloudflare の[Pagesヘッダー公式資料](https://developers.cloudflare.com/pages/configuration/headers/)も参照してください。
