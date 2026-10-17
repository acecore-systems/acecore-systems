# 旧公開情報の移設・保持

比較元は本番 `033c6420ee41dc02eeab2c30924f06265b1cd032`、今回の開始点は `bbf3297d386cac71063fef62802a67c9ab0ef421`。旧公開16ページ・829長文・496 URLの独立照合は親担当が実施する。下表は今回実装で扱う移設先と理由であり、全829項目を機械的一致だけで保全したという主張ではない。

## 具体的な対応例

旧一覧9分類の本文・全具体例は `src/data/services.json` を正本のまま、次の読み取り可能なUIへ移設した。一覧は7独立商品を選ぶ場に絞り、詳細の「具体的な対応例」を開くと全文を読める。掲載のためだけの装飾画像やhidden領域は使わない。

| 旧分類       | 現在の表示先                       | 保持する主な内容                                              |
| ------------ | ---------------------------------- | ------------------------------------------------------------- |
| IT顧問       | `/services/it-advisor/` 対応例     | AI導入・公開・IT基盤の技術判断                                |
| 業務システム | `/services/development/` 対応例    | CRM/ERP等の業務管理                                           |
| Webアプリ    | `/services/development/` 対応例    | 管理画面・権限・承認・CSV                                     |
| デザイン     | `/services/#design` 補足           | グラフィック/クリエイティブを含む受付範囲、公式サイトへの案内 |
| Web機能      | `/services/site-functions/` 対応例 | CMS・Sveltia・RSS等                                           |
| データ連携   | `/services/development/` 対応例    | API・既存データ/ツール連携                                    |
| 改修・再構築 | `/services/development/` 対応例    | 現状診断・段階的刷新                                          |
| セキュリティ | `/services/security/` 対応例       | アプリ/Webサイトの安全性確認と改善                            |
| ホームページ | `/services/website/` 対応例        | 制作・更新・保守の依頼                                        |

旧3入口の説明本文も、それぞれの詳細の対応例に保持。旧homeの7相談例は、AI公開→IT顧問、手作業/現場との不一致/データ分断→開発、安全性→security、ホームページ→website、要件前の整理→guideの視点セクションに表示する。旧homeの3領域の説明は、現在の3困りごとカードに利用する。

## 料金・契約条件

- `pricing.json` の全33 label/price/note/detailUrlを変更しない。7サービスとデザイン補足の8群へ目次を付け、全項目を開閉なしで表示する。既存detailUrlのfragmentは維持。
- websiteは制作プランと月額契約の分離、税込、外部実費、契約前見積りを料金セクションの冒頭に明示。固定5ページまで、10ページまで、更新を含まない保守、保守30分+更新60分=90分など、既存料金注記を常時表示する。重複した一般税込案内だけをwebsiteでは省く。
- 全7詳細の提供内容・includes・priceNote・terms・FAQを保持。IT顧問の月額/単発の既存注記も各プランに表示し、受託開発との責任境界を保持。
- サービス、実績、料金からcontactへ渡す `category/service/from/entry` を維持。フォーム実送信・本番認証はUI検証と区別する。

## 実績・導入ガイド・会社情報

全7実績のタイトル・画像/alt・概要・課題・提案・結果・詳細/外部/相談リンクを保持。画像と結果を常時表示し、課題/提案は各カードで開く。目的分類は既存内容に基づく3分類で、顧客数・数値成果・顧客コメントは追加しない。

導入ガイドは既存2つの開発/伴走ルート、3視点、4工程、7準備項目の本文と全箇条書き、3FAQ、技術解説/相談導線を保持。重複するhero/route見出しは、同じ文字列の場合だけrouteを既存UIの選択ラベルへ変更する。承認済み人物画像は小さな導入補助として1枚を維持し、権利manifest・未承認素材禁止は維持。

運営会社情報は公式 `acecore.net/about/` へ直接つなぐ。ローカルに会社概要を複製せず、法人名・実績・資格等の事実を増やさない。フッターの法務リンクと画像権利表示を保持。

## 旧fragmentの互換

homeの `layer-model-title/domain-title/consultation-title` は目的カード見出しへ、`customer-touchpoints/operations/it-foundation` は対応カードへ、`home-cta-title` は相談へ残す。servicesの旧入口/分類/詳細見出しIDと3入口IDは、現在の一覧/該当行へ残す。`service-cta-title` も保持。

IT顧問の `advisor-*-title` 8つは、導入/活用例/プラン/工程/境界/FAQ/関連/相談へ保持。websiteの `website-cost-title/website-terms-title/website-faq-title` は費用例/条件/FAQへ保持。旧IDを一括でページ先頭へ置かず意味が対応する箇所に配置する。閉じたdetails内へのfragmentは、アクセス時に親のdetailsを開く。

## 検証

既存SEO validatorに、旧9分類の本文/全例の移設先、旧7相談例、全7実績の事実/リンク、ガイド全準備項目/FAQ、website別契約条件、IT顧問の契約注記、上記旧fragmentの一意な存在を追加検証する。実画面、496 URL、829長文の意味対応、全33料金の旧本番比較は親担当の独立監査と突合する。

## 残り47表現の意味対応

親の独立照合で残った47件を、画像説明も含め個別に確認した。以下は削除理由と移設先であり、まとめて装飾と扱わない。

| 比較元source / pointer                                | 意味と現在の対応                                                                                                                                                     |
| ----------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| home: heroEyebrow / heroTitle                         | 抽象的なブランド見出しを、承認された「いま困っていることから」の対象・目的に変更。商品や契約条件ではない。                                                           |
| home: heroLead / consultationLead / consultationTitle | ホームページ・予約・問い合わせは目的カード、業務/運用は各目的と7サービス、要件前の整理は現在のCTA本文とguideの相談例へ保持。                                         |
| home: layersTitle / layersLead                        | 目的から選ぶ意味を3目的カードへ統合。旧3領域の説明全文は各カードに保持。                                                                                             |
| home: consultationEyebrow / ctaEyebrow                | 英語の区切りラベルを削減。日本語の相談内容・CTA本文・旧IDは保持。                                                                                                    |
| 全7detail: heroEyebrow                                | 英語カテゴリ装飾を、既存の各サービス名へ統一。見出しと7独立URLは保持。                                                                                               |
| it-advisor: visual/caption                            | 構成・安全性・公開条件の確認はintro、課題、PoC/デプロイのsupportAreasと範囲合意へ保持。                                                                              |
| it-advisor: sectionVisuals/scope/caption              | 既存アプリ、公開設定、権限、残るリスクはsupportAreasのデプロイ支援本文、確認・公開準備とgovernanceへ保持。                                                           |
| it-advisor: sectionVisuals/process/caption            | 監視・権限・更新方法の引き継ぎという固有情報を、工程末尾の本文として全文復元。継続運用/監視設計の別見積り、24時間監視の対象外はそのまま近接条件を保持。              |
| development: visual/caption                           | 発想・設計・実装・確認・現場利用はintro、5工程とhand-offで保持。                                                                                                     |
| development: sectionVisuals/scope/caption             | 管理画面・申請承認・顧客画面はofferingsと旧Webアプリ分類の具体例へ保持。                                                                                             |
| development: sectionVisuals/process/caption           | 実環境確認・公開・引き継ぎを工程末尾の本文として全文復元。                                                                                                           |
| operations: visual/caption                            | 変更/障害と担当者の手順はheroLead、introと運用手順のofferingsへ保持。                                                                                                |
| operations: sectionVisuals/scope/caption              | 監視・バックアップ・変更受付・障害記録の対象/責任範囲を、料金/提供範囲後の本文として全文復元。                                                                       |
| operations: sectionVisuals/process/caption            | 保守/追加開発を分ける振り返りを工程末尾の本文として全文復元。                                                                                                        |
| security: visual/caption                              | 画面・結果と改善順位はchallenge、診断offeringsと実施/結果報告工程へ保持。品質改善の画面計測と、安全性診断の合意対象を同一保証にしない。                              |
| security: sectionVisuals/scope/caption                | 構成・権限・変更履歴と責任範囲を、料金/提供範囲後の本文として全文復元。                                                                                              |
| security: sectionVisuals/process/caption              | 複数端末での表示/操作の再確認を工程末尾の本文として全文復元。再診断の対象/期限/回数の合意条件は保持。                                                                |
| site-functions: visual/caption                        | 既存サイト・編集担当・編集画面・公開フローはintro、CMS offeringと旧機能追加の具体例に保持。                                                                          |
| site-functions: sectionVisuals/scope/caption          | 必要機能を既存構成と運用に組み合わせる意味はofferingsLeadと工程の範囲設計へ保持。                                                                                    |
| site-functions: sectionVisuals/process/caption        | 単位ごとの追加、公開前後のチェック共有を工程末尾の本文として全文復元。                                                                                               |
| site-quality: visual/caption                          | 画面と計測、改善順序はintro、横断点検/優先修正工程へ保持。                                                                                                           |
| site-quality: sectionVisuals/scope/caption            | SEO・速度・アクセシビリティ・安全性は全4offerings、横断点検と各価格注記に保持。                                                                                      |
| site-quality: sectionVisuals/process/caption          | 複数端末の表示/操作確認を工程末尾の本文として全文復元。再確認工程のdesktop/mobile・Preview/本番も保持。                                                              |
| website: visual/caption                               | 内容整理、見やすいページ、更新手段はintro、制作/更新の各offeringへ保持。                                                                                             |
| website: sectionVisuals/scope/caption                 | 事業紹介・料金・アクセス・問い合わせの情報/導線はintro本文に全文の具体項目を保持。                                                                                   |
| website: sectionVisuals/process/caption               | 内容/表示確認と公開後の更新方法を工程末尾の本文として全文復元。                                                                                                      |
| website: indexTopics/2                                | 旧「更新付き月額11,000円〜」は主な対応から除き、同じ金額と保守30+更新60分の条件をupdates料金へ保持。価格の削除ではなく分類修正。                                     |
| website: indexNavigation 4表現                        | 三つの入口に加えて全7商品を3目的で比較する一覧へ変更。ホームページ/開発/既存公開運用の意味は7独立行、対象/作業/料金と詳細へ保持。                                    |
| services: heroTitle / heroLead                        | 抽象的な開発/デザイン/運用の反復を新一覧heroへ変更。開発/運用は独立詳細、デザインの受付範囲は補足と旧#designに保持。業務定着は各detailの工程/引き継ぎとguideへ保持。 |
| services: entryPoints 3ラベル                         | IT顧問/websiteのCTA文言・英語eyebrowを、実際の独立行と各詳細のCTAへ統一。リンク先と提供条件は保持。                                                                  |

7つの工程captionは元JSONをそのまま参照するため、既存翻訳・CMS経路を保つ。画像の全掲載を要件化せず、意味のある作業情報を文章として移す。上記全文復元箇所はSEO validatorでも確認する。
