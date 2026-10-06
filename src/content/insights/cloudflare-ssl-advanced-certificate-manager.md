---
title: "以前有料だった Cloudflare の SSL オプションの正体 ― Dedicated SSL から Advanced Certificate Manager へ"
description: "Cloudflare で以前有料だった「Dedicated SSL Certificates（専用SSL証明書）」は、2021年に「Advanced Certificate Manager（ACM）」として機能拡張・名称変更されました。無料の Universal SSL との違いや ACM が必要なケースを解説します。"
date: 2026-03-31T00:00
author: gui
tags: ["技術", "Cloudflare", "セキュリティ", "インフラ"]
image: "/images/insights/covers/cloudflare-ssl-advanced-certificate-manager-cover-v2.webp"
lastUpdated: "2026-10-06T13:58:01+09:00"
---

Cloudflare の旧「Dedicated SSL Certificates」は、2021年に **Advanced Certificate Manager（ACM）** へ移行しました。現在は、まず対象ホスト名と DNS 構成を確認してから証明書を選ぶのが確実です。

## Universal SSL で足りる範囲

Cloudflare の **full DNS setup** では、無料の Universal SSL は通常、ルートドメインと1階層のサブドメインを保護します。`*.example.com` は `www.example.com` を含みますが、`api.staging.example.com` は含みません。一方、**CNAME（partial）setup** では、プロキシされたホスト名ごとに、階層に関係なく Universal 証明書が発行されます。「多階層なら必ず ACM が必要」とは限りません。

Universal SSL の証明書は現在、無料で個別に発行されます。以前の「他サイトと共有されるから ACM が必要」という説明は現行仕様に合いません。

<figure class="article-diagram" data-layout="compare" data-tone="amber" data-count="2" aria-labelledby="diagram-cloudflare-ssl-advanced-certificate-manager">
  <figcaption>
    <strong id="diagram-cloudflare-ssl-advanced-certificate-manager">Universal SSLの適用範囲はDNS方式で変わる</strong>
    <span>適用範囲はDNS方式で異なり、サブドメイン階層だけでACMの要否は決まりません。</span>
  </figcaption>
  <ol class="article-diagram__nodes">
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">1</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M12 3 19 6v5c0 4.5-3 7.5-7 10-4-2.5-7-5.5-7-10V6z"/><path d="M9 12h6"/></svg></span>
      <strong>Full DNS setup</strong>
      <span>通常はルートと1階層をカバー。さらに深い名前はwildcardの範囲外。</span>
    </li>
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">2</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18"/></svg></span>
      <strong>CNAME / partial setup</strong>
      <span>プロキシ済みホスト名ごとに発行。階層数は問わない。</span>
    </li>
  </ol>
</figure>

## ACM を選ぶとき

ACM は有料アドオンです。CA、検証方法、有効期間、対象ホスト名を選べます。高度な証明書1枚には、ルートドメインを含めて最大50ホスト名を指定できます。有効期間の選択肢は CA とプランにより異なり、**1年は SSL.com を使う Enterprise 顧客に限定**されています。全プランで14～365日を自由に選べるわけではありません。

full DNS setup で多階層のプロキシ済みホスト名を自動保護したい場合は、ACM の **Total TLS** が候補です。特定のホスト名だけなら、高度な証明書やカスタム証明書も選択肢です。Total TLS は full DNS setup が条件で、Cloudflare Tunnel など一部製品のホスト名には証明書を発行しません。

**Cloudflare Pages と R2 のカスタムドメインには ACM の高度な証明書は適用されません。** これらは別の証明書経路を使用します。Acecore の Pages サイトのために ACM を購入しても、この証明書を Pages のホスト名へ適用することはできません。

## 導入前の確認

1. 対象ホスト名と、full DNS setup か CNAME setup かを確認する。
2. Universal SSL で実際に保護される範囲を確認する。
3. 必要な CA・有効期間・Total TLS の条件を確認する。
4. 料金と購入条件は、契約プランの Cloudflare ダッシュボードで確認する。

証明書の CN 表示だけを購入理由にせず、必要なホスト名が証明書の SAN に含まれるかを確認してください。

## 公式資料

- [Universal SSL limitations](https://developers.cloudflare.com/ssl/edge-certificates/universal-ssl/limitations/)
- [Advanced certificates](https://developers.cloudflare.com/ssl/edge-certificates/advanced-certificate-manager/)
- [Validity periods and renewal](https://developers.cloudflare.com/ssl/reference/certificate-validity-periods/)
- [Total TLS](https://developers.cloudflare.com/ssl/edge-certificates/additional-options/total-tls/)
