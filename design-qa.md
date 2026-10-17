# デザインQA: 参照17社を比較・相談の選びやすさへ反映

final result: passed

確認日: 2026-10-17 JST。開始点 `3e869e05e21ed166673c652c3e5a2bd359d390d1`（Hatt最新画像PR147を含む）。「内容は案3・見た目は案1」を維持し、新たに17の公式サイトを調査して、問い合わせ・website料金・実績導線・サービス比較・料金番号を改善した。親担当の独立した情報監査とIAB受入、および実装担当の検証を実施。受入を妨げる未解消P0/P1/P2はない。成約や売上の向上を測定したという意味ではない。

## 参照と適用

[17社の公式根拠・採否](docs/design/reference-expansion-2/research.md)、[構造化台帳](docs/design/reference-expansion-2/sources.json)、[実画面の観察条件](docs/design/reference-expansion-2/reference-observations.json)、[実装と情報保持](docs/design/reference-expansion-2/implementation.md)を保存。前回24社と重複せず、主に海外の受託・プロサービス・B2B SaaS・保守支援から選んだ。実名事例や利用規模は参照対象の根拠であり、UI成功の因果として扱わない。

親がin-app browserで13ページ/11サイトを観察。実装担当も比較ボード3枚とLinear Sales画面を実見した。thoughtbot埋込フォームは未展開、IntercomはFinへredirect、Help ScoutはHelp Centerとしての観察に限る。Basecampのradio切替を試みたが変更確認はできなかった。LinearはSalesリンクから相談フォームへの到達を確認したが、入力/送信はしていない。一部の画面外lazy画像は未確認であり、全ページ全画像の完全監査ではない。

[比較1](docs/design/reference-expansion-2/reference-board-1.jpg) / [比較2](docs/design/reference-expansion-2/reference-board-2.jpg) / [比較3](docs/design/reference-expansion-2/reference-board-3.jpg)。Atomic等の名称と対象を比較する行、Fueled等の実例から提供範囲への接続、Webflow等の役割別プラン分離、Linear等の短い相談目的とフォームの近接を採用した。常時入力ヘルプは自社の入力負担からの適用判断であり、Linearで同じヘルプを実見したという意味ではない。他社料金・年契約・無制限対応・SLA・受賞・成果率は追加していない。

## 5つの変更

1. 問い合わせは短い導入→フォーム→FAQのDOMへ。desktopは左の導入/FAQと右フォームを維持し、FAQがフォーム底へ落ちる初回配置を修正。messageに全9言語の常時ヘルプとaria-describedbyを追加した。
2. websiteの制作3件と月額3件を別見出し・余白・カテゴリ内番号へ。全価格と条件は同じ場所で読め、別契約を必須2段階として誘導しない。6つの既存anchorとhash時の開閉を維持。
3. 全7実績に「関連するサービス」を示し、Cherry/Hatt/portalはwebsite、contact/platformはsite-functions、Storeはbusiness-system、Aceserverはit-advisorの相談へ引き継ぐ。受付の既存valueは変更せず、全9言語のwebsite表示ラベルを用意した。未翻訳websiteの関連リンクは実在する言語別サービス一覧へ。
4. 既存7サービスの対象・主な対応・料金をdesktop3列で比較し、mobileはラベルと内容で読む。重複する比較一覧やwizardは追加していない。
5. 料金一覧は各カテゴリ01からの連番へ。33項目のdata順、key、詳細URL/anchor、JSON-LDの全体positionを保つ。

## 最終画面と操作

静的preview `http://127.0.0.1:4322/` で親が確認した。320/390/768/1440pxでservices/contact/works/websiteの横はみ出しなし。390pxでは料金一覧も確認。desktopの問い合わせ導入/FAQの間隔は適切で、mobileではFAQがフォーム後にある。

390pxの最初のselectのdocument座標は、本番開始点967.56pxから最終静的preview670.64pxへ移動。近い位置に必須表示を保ち、textareaの説明参照を確認した。[計測JSON](docs/design/reference-expansion-2/contact-mobile-measurement.json)は先行dev確認の678.64pxを記録しており、最終静的の670.64pxは親の最終受入値である。

worksの運用フィルター3件、website `#care` へ移動して保守条件を開く操作、Cherry相談リンク→website分類/自然な件名、手入力件名保持、英語のwebsite分類/入力ヘルプを確認。

- [最終mobile問い合わせ](docs/design/reference-expansion-2/final-contact-mobile.png)
- [最終website desktop](docs/design/reference-expansion-2/final-website-desktop.png) — hash先の保守プランを開いた操作状態。
- [サービス比較desktop](docs/design/reference-expansion-2/after-services-desktop.png) / [実績導線desktop](docs/design/reference-expansion-2/after-works-desktop.png)
- [mobile操作確認ボード](docs/design/reference-expansion-2/mobile-qa-board.jpg) — 一部はdev toolbar/キーボードfocusを含む先行操作証拠。完成サイトの要素とは扱わない。
- [レスポンシブ計測](docs/design/reference-expansion-2/responsive-checks.json)

## 独立した情報保全監査

親が開始点本番の16基幹ページの見出し・段落・リスト・ddとID、sitemap、全料金を比較した。

- [情報監査結果](docs/design/reference-expansion-2/information-preservation-result.json): sitemap496→496、欠落URL0、旧ID欠落0、未解決差分0。
- 16ページの主要本文差分は料金li30件の表示番号のみ。先頭2桁を除く本文は完全保持。
- [全33料金の照合](docs/design/reference-expansion-2/all-prices-check.json): label/amount/note/詳細route/anchorを保持。
- 業務本文・価格・契約・実績・記事のJSONおよび画像assetは変更なし。Hatt画像のGit blobは開始点と同一 `4a7d074e5f533413ec42f6b1eb3f0d9b30a8d6ac`。
- 既存の翻訳pending11項目を維持。新UIは全9言語、sourceHashは既存コマンドで更新。有料Batchの新規実行なし。

## 自動検証

- 標準 `npm run build` を通過。content/i18n source、Cast/CMS/検索/AI/問い合わせ、Cloudflare型・Pages Functions・functions型を含む。
- 最終Astro生成/postbuildを通過。506ページ、Pagefind、377 vectors/56ページ、Cast使用1/登録11、SEO、9言語/16固定route/40記事の内部リンク・fragmentを検証。
- 受付value互換と全9言語の表示/ヘルプを追加検証し、問い合わせ6testsを通過。手入力保持と未選択件名も既存testsで確認。
- 既存翻訳PR経路33tests、最終source i18n検証を通過。
- 最終Prettier/差分空白検査を実施。GitHub CI/共有previewはcommit後のPRチェックと照合する。

## 限界と公開手順

フォーム実送信、CAPTCHA受入、CMSでの実編集、Safari実機、網羅的アクセシビリティ適合、成約測定は未実施。既存website本文の翻訳待ちを維持し、未生成の英独website詳細を成功扱いしない。ローカルpreview合格と本番公開完了を区別する。

ユーザー承認済みのフローに従い、実装担当はcommit/push/Draft PRとCI/preview確認を行い、親担当が最終レビュー・merge・GitHub連携の本番反映を担当する。Git Provider/source repo、github:push deploy成功、custom domain active、本番HEADは反映後に親が確認する。

前回の全体改善QAは[24サイトの参照と全体構造改善](docs/design/expanded-benchmark/qa-expanded.md)に保存した。
