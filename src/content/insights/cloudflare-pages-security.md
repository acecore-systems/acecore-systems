---
title: "Cloudflare Pagesのセキュリティヘッダー設定：_headersとFunctionsの違い"
description: "Cloudflare
  Pagesでセキュリティヘッダーが反映されないときの切り分け方を解説。静的アセットの_headersとFunctionsのResponseの違い、現行設定\
  の確認先、公開後の確認項目を整理します。"
date: 2026-03-15T00:00
author: gui
tags: ["技術", "Cloudflare", "セキュリティ"]
image: "/images/insights/covers/cloudflare-pages-security-cover-v2.webp"
lastUpdated: "2026-10-20T09:59:18Z"
---

Cloudflare PagesでCSPやキャッシュの設定が反映されない場合、まず確認するのは、応答が静的アセットかPages Functionsかです。この記事では、`_headers`とFunctionの`Response`の適用範囲、現行設定の確認先、公開後に確認する項目を整理します。成功応答だけでなくエラー応答のヘッダーも確認すると、API追加後の設定漏れを見つけやすくなります。

この記事は、2026年3月にお問い合わせを外部フォームへ移し、Cloudflare Pagesの静的配信へ戻した経緯を記録しています。その後、サイト構成は変わりました。**2026年9月時点のAcecore公式サイトは、静的ページに加えてPages Functionsを使用**し、お問い合わせ、コメント、検索、AI案内、CMSのAPIを同じサイトで扱います。以下では当時の選定理由と、現在も使えるヘッダー設定の境界を説明します。

## Cloudflare Pagesのヘッダーは静的応答とFunctionsでどう違う？

`public/_headers`は、Pagesが配信する**静的アセットの応答**に適用されます。[Cloudflare DocsのHeaders公開ソース](https://github.com/cloudflare/cloudflare-docs/blob/production/src/content/docs/pages/configuration/headers.mdx)では、`_headers`のルールが静的アセットの応答に適用されると説明されています。また、[Cloudflare Pages: Headers](https://developers.cloudflare.com/pages/configuration/headers/)では、URLパターンが一致していてもPages Functionsが生成した応答には適用されないとされています。API応答に必要なCORS、キャッシュ、セキュリティヘッダーは、Function側の`Response`に設定します。

このため、「`_headers`を一度書けばサイトのすべてのページとAPIに効く」とは限りません。静的HTMLと`/api/*`の両方について、実際のレスポンスヘッダーを別々に確認します。

<figure class="article-diagram" data-layout="boundary" data-tone="teal" data-count="2" aria-labelledby="diagram-cloudflare-pages-security">
  <figcaption>
    <strong id="diagram-cloudflare-pages-security">静的応答とFunctions応答の設定境界</strong>
    <span>静的ファイルとAPIではヘッダーの設定場所が異なります。公開後は両方を個別に確認します。</span>
  </figcaption>
  <ol class="article-diagram__nodes">
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">1</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M5 3h10l4 4v14H5z"/><path d="M15 3v5h5M8 12h8M8 16h8"/></svg></span>
      <strong>静的ファイル応答</strong>
      <span>_headersで設定し、Pagesが返す応答を確認。</span>
    </li>
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">2</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M8 9h8M8 12h4M8 16h8"/></svg></span>
      <strong>FunctionのAPI応答</strong>
      <span>FunctionのResponseに設定し、API応答を別に確認。</span>
    </li>
  </ol>
</figure>

## 現行のヘッダー設定はどこで確認する？

[現行の`_headers`](https://github.com/acecore-systems/acecore-net/blob/main/public/_headers)では、HTMLは再検証、ハッシュ付き`_astro/`アセットは長期キャッシュに分けています。管理画面には通常ページと別のCSPを指定し、`X-Frame-Options`は`SAMEORIGIN`です。古い記事に載っていた`form-action https://ssgform.com`、HTMLの1時間キャッシュ、`DENY`を、現在の値としてコピーしないでください。

現在の動的経路は[Pages Functionsのコード](https://github.com/acecore-systems/acecore-net/tree/main/functions)で確認できます。CSPに許可する外部ドメインも、実際に読み込むスクリプト、画像、フレーム、通信先に合わせて検査します。掲載した設定をそのまま別サイトへ移植しないでください。

## デプロイ後に何を確認する？

公式サイトはGitHubに連携したCloudflare Pagesで`main`を公開します。[現在のNodeバージョン](https://github.com/acecore-systems/acecore-net/blob/main/.node-version)は`.node-version`に、ビルド手順は`package.json`に置き、CIは`npm run build`で検証します。2026年3月当時の「Node.js 22 / npx astro build」という表は、現行の公開手順ではありません。

公開を確認するときは、PRのプレビュー、mainのビルド、Pagesの本番デプロイ、公開URLのヘッダーと本文を別々に確認します。[Cloudflare PagesのHeaders公式資料](https://developers.cloudflare.com/pages/configuration/headers/)では、`_headers`の設定について確認できます。
