# デザインQA: 24公式サイトの参照を全体の選択・比較・相談へ反映

final result: passed

確認日: 2026-10-17 JST。既存PR143で「内容は案3・見た目は案1」を維持し、home・サービス一覧・全7詳細に加えて、実績・導入ガイド・料金・問い合わせ・運営会社への案内を改善した。親担当の独立した情報監査・ブラウザ受入と、実装担当の検証・差分レビューを実施。受入を妨げる未解消P0/P1/P2はない。UIによる成約/売上改善を測定したという意味ではない。

## 参照と採用判断

[24公式サイトの根拠/採用・非採用](docs/design/expanded-benchmark/research.md)、[構造化台帳](docs/design/expanded-benchmark/sources.json)、[実画面の採取条件](docs/design/expanded-benchmark/visual-observations.json)を保存した。主要12サイトをin-app browserで深掘りし、追加3ページも取得。実装担当も比較ボード3枚を実見した。SmartHRの課題メニューを実際に開いた操作を含む。一部の画面外lazy画像は未読込で、全画像の完全監査とは扱わない。

STORESの初期/継続費用と準備・設定・引き継ぎ、LIG/GIGの大きな実績と実装意図、JOYZOの対象と契約範囲、IIJ等の管理対象と導入/FAQを採用。巨大メガメニュー、根拠のない顧客数・成果数値・保証・無料体験は追加していない。企業の事業規模は参照対象の根拠であり、UI成功の因果ではない。

視覚基準は[承認済み案1](docs/design/purpose-ui-hybrid/visual-reference-option1.jpg)。白・薄青・濃紺の太字、鮮明な青のpill CTA、既存の実績画面とPC/スマホ合成を維持した。

## 実画面と5つの観点

親担当がローカル静的preview `http://127.0.0.1:4322/` をin-app browserで操作・撮影し、実装担当が比較証拠を照合した。

1. 文字: 太字sansと16px本文を維持。見出しの禁則・自然な改行を保持。旧ID用の空要素がhome/関連見出しのflex余白を作らないよう見出し内へ配置し、親が実画面で受入確認した。
2. 配置/余白: 実績は2列の大きな画面と結果を先に示し、課題/提案をカード内で開く。guideは小さな導入画像、選択経路、工程、準備チェック、FAQへ。料金は8群の目次と全33項目を表示。contactは案内/FAQと幅のあるフォームを分けた。
3. 色: 既存の青白トークンと読みやすいフッターを共通維持。選択中の実績分類は背景と枠で示し、固定の偽activeは使わない。
4. 画像: 全7実績の既存画像/altを保持し、実寸のwidth/heightと全体が見える比率へ。新しい顧客写真や未承認画像は追加しない。Cast権利manifest/チェックサム/allowlistを維持し、未使用素材の全掲載は強制しない。
5. 内容: 旧具体例・契約/価格・FAQ・工程・実績事実を保持。画像captionだけの固有情報は本文に移設し、画像を装飾として残すためのhiddenギャラリーは作らない。

## 比較証拠

- [最新home](docs/design/expanded-benchmark/final-home-desktop.jpg) — 最終アンカー配置・ヘッダー境界補正後。
- [実績: 旧本番と改修後](docs/design/expanded-benchmark/compare-works.jpg)
- [導入ガイド: 旧本番と改修後](docs/design/expanded-benchmark/compare-guide.jpg)
- [料金: 旧本番と改修後](docs/design/expanded-benchmark/compare-pricing.jpg)
- [問い合わせ: 旧本番と改修後](docs/design/expanded-benchmark/compare-contact.jpg)
- [全7詳細のmobile](docs/design/expanded-benchmark/new-seven-mobile-board.jpg) — 工程末尾のcaption本文復元前。復元後の同内容は親が静的HTMLで追加監査済み。
- [mobile料金](docs/design/expanded-benchmark/final-pricing-mobile.jpg) / [mobile問い合わせ](docs/design/expanded-benchmark/final-contact-mobile.jpg)
- [1260/1440pxヘッダー境界](docs/design/expanded-benchmark/final-header-boundaries.jpg)
- [レスポンシブ計測](docs/design/expanded-benchmark/responsive-measurements.json)

比較元は旧本番 `033c6420ee41dc02eeab2c30924f06265b1cd032`。最終home画像は1440px、その他desktop比較も主に1440px、mobileは390px。追加320pxでworks/guide/pricing/contactの横はみ出しなし。390pxで全7詳細と主要ページの画像破損・横はみ出しなし。1440pxでhome/services/contactとdesktop/mobileナビ切替を確認。全スクロール位置・全実機の検査ではない。

## 独立した情報保全監査

- 旧本番の496 URL欠落0、旧16基幹ページのfragment ID欠落0。
- 全33料金のlabel/price/note/詳細route/anchorが旧本番と一致。
- 重要長文98項目を保持。829長文のうち791が完全一致、残38は見出し・画像説明・一覧ナビ等の意味対応を個別確認。
- 旧9分類の本文/具体例を関連7詳細とdesign補足へ移設。データJSONだけに残した状態を保全と扱っていない。
- 旧process caption7件とoperations/securityのscope caption2件を表示本文に復元。複数端末の表示/操作確認、監視/権限/更新の引き継ぎ、障害記録/変更履歴/責任範囲を保持。
- websiteは月額別契約、税込/外部実費、契約前見積り、固定5ページまで/10ページまで、保守30分の更新なし/更新合計90分を保持。
- source記事・works・guide・privacy・pricing JSONは旧本番比で不変。移設先と残38を含む表現差分の理由は[情報保全台帳](docs/design/expanded-benchmark/information-migration.md)に記載。

## 操作・回帰

worksフィルター7件→目的2件→ブラウザで戻る7件、課題/提案開閉、guide7チェックとFAQ、料金33項目/8群、mobileメニューと検索dialogの開閉を確認。旧 `#website-terms-title`、development `#web-app`、services `#design` が対応先へ届き、必要なdetailsを開く。

共通ヘッダーの1201〜1279pxでmenuが残幅へ伸びる不整合を修正。旧globalと同じ1279pxで2列へ切り替え、非表示の言語/CTA用列を残さずmenuを右へ揃える。日本語/他言語に同じ境界を適用する。親が1260pxでmenu幅88px/右端/ナビ非表示、1440pxでナビ表示/menu非表示、双方横はみ出しなしを静的previewで再確認した。

問い合わせはqueryなしで件名空欄→実サービス選択で補完→手入力後に別種別を選んでも手入力を保持。サービス/実績/料金からの `category/service/from/entry` は維持。問い合わせ送信は行っていない。

## 自動検証

- 標準prebuild: Cast11・CMS84・検索45・AI7・問い合わせを通過。Cloudflare生成型/Pages/functions型、content/i18n sourceを通過。
- 問い合わせ修正後は5testsを通過。未選択の案内を件名にしないこと、日本語の自然な補完、編集済み維持、英語ラベル保持を検証。
- 最終実build/postbuild: 506ページ、検索/AI境界、Pagefind、376 vectors/56 pages、Cast使用1/登録11、SEO・全9言語の内部リンク/fragmentを通過。
- SEO validatorを強化し、旧9分類全例/旧7相談例、全7実績事実/リンク、ガイド全準備項目/FAQ、7工程caption、website別契約、IT顧問注記、旧fragmentの一意性を検証。
- 既存翻訳PR経路33testsを通過。日本語UI sourceHashを更新し、新UIラベルは全9言語に用意。有料翻訳Batchは投入していない。
- 最終format/checkとdiff空白検査を通過。commit後のGitHub CI/共有previewはPRのチェック結果と照合する。

## 限界・公開手順

ローカルcontactでTurnstile hostname制限による110200を確認。フォーム送信/CAPTCHA受入は未検証。websiteの既存翻訳pendingを維持し、未生成の英独website詳細を成功扱いしない。実機Safari、網羅的アクセシビリティ適合、売上/成約の測定は未実施。

ユーザーはレビュー後のmerge・本番反映まで明示承認済み。実装担当がcommit/push/PR更新とCI/immutable previewを確認し、親担当が最終PRレビュー・mergeとGitHub連携の本番反映を担当する。本記録のローカルpassedだけで本番公開完了とは扱わない。Git Provider/source repo、github:push deployment成功、custom domain activeと本番HEADは反映後に確認する。

前回のQAは[全7サービスの選択構成](docs/design/service-selection/qa-before-expanded.md)、[案1と案3の統合](docs/design/purpose-ui-hybrid/qa-hybrid.md)に保存した。
