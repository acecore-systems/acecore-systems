# デザインQA: 内容は案3、見た目は案1

final result: passed

ユーザーの指定「内容的には3のほうがいいけどデザイン的には1のほうがよかったかも」に合わせて、PR143の内容・導線を維持し、1案目の見た目へ調整した再検証。未解消のP0/P1/P2はなし。初回の案3だけの受入記録は [旧QA](docs/design/purpose-ui/qa-option3.md) に保存した。

## 参照と意図した差

デザインの原本は `exec-2a687cb1-4917-4c14-aebe-fd6fc6eedc78.png`、1536×1024。レビュー用は [案1](docs/design/purpose-ui-hybrid/visual-reference-option1.jpg)。内容の正本は既存実装 c4a71ab とそのJSON。今回JSON本文・料金・翻訳stateを変更していない。

1案目から採用: 文章左・PC/スマホ実績右のヒーロー、太い濃紺見出し、鮮明な青のpill CTA、大きめの青線アイコン、柔らかな薄青カード、左揃えの一覧見出し。

3案目から保持: 困りごと3件、カテゴリ絞込み、7サービスの独立URL、実績セクション、詳細冒頭の料金、保守と更新の条件、下部の既存詳細内容。1案目の6サービスへの統合、異なる宣伝文、料金条件、飾り文字・背景写真は移植しない。参照ボードの拡大画像そのものをページ化したものではない。

## 証拠と撮影条件

最終URL: `http://127.0.0.1:4322/`、`/services/`、`/services/website/`。本番用Astroビルドの静的プレビューであり開発ツールバーなし。Codex in-app browserを使用。

- [トップ比較](docs/design/purpose-ui-hybrid/compare-home-final.jpg)
- [一覧比較](docs/design/purpose-ui-hybrid/compare-services-final.jpg)
- [詳細比較](docs/design/purpose-ui-hybrid/compare-website-final.jpg)
- [文字とCTAの部分比較](docs/design/purpose-ui-hybrid/compare-typography-final.jpg)
- [実装全体](docs/design/purpose-ui-hybrid/implementation-overview.jpg)
- [モバイル3画面](docs/design/purpose-ui-hybrid/mobile-final-board.jpg)
- [料金のdesktop表示](docs/design/purpose-ui-hybrid/pricing-desktop-final.jpg)、[320px表示](docs/design/purpose-ui-hybrid/pricing-320-final.jpg)

各全体比較は左が案1、右が今回実装。同じ画像内で比較して実見した。案1は3ページを並べたコンセプトボードで、実ブラウザの同一viewportではない。参照は左から x6..510 / 518..1020 / 1027..1529、y90..1024を切り出した。実装は1440×1000 CSS pxで撮影したフルページの先頭1950 / 2350 / 1600pxを参照列幅へ等比縮小。フルページ原本はトップ1424×5212、一覧1424×6851、詳細1424×12047px。スクロールバー・画像出力の密度差を考慮して実画像幅を使用し、高さだけの伸縮はしていない。

文字部分比較では詳細参照の235×240px領域を2倍表示し、実装の605×410pxを等倍で並置した。文字やボタンを読める大きさで比較するための拡大であり、ピクセル完全一致の主張ではない。スマートフォンは390×844 CSS px（撮影画像375×811px）、最小幅は320×780 CSS px、タブレット768×1024 CSS px。密度を端末DPRと推定せず、実測の撮影寸法を記録した。

## 必須5面の確認

1. 文字: Yu Gothic UI / Meiryo等の日本語sansを使用し、ヒーロー見出しはweight850、desktop詳細52.56px。内容を案3のまま保持し、desktop2行・mobile2行の主見出しと長い本文を確認。参照は画像内文字なので同一フォントの断定はしない。書体の厳密な再現は今回の合格条件に含めず、太字階層と読みやすさを確認。
2. 配置・余白: desktopは左右ヒーローと横3カード、mobileは縦積み。CTAは丸型、カードは丸角。一覧は案3のカテゴリ軸を残し、行のアイコン・余白を案1に寄せた。320/390/768/1440で横はみ出しなし。
3. 色: 白・薄青・濃紺・鮮明青に統一。主CTAと輪郭線、選択カテゴリの背景、hover/focusを確認。画像の発色を真似るための新しい装飾グラデーションは追加していない。
4. 画像: 機器外観だけを画像生成し、実績内の写真・文字は元画像をimgで配置。外形をCSS/SVGで描かない。desktopは既存1585×892、mobileは実サイトの375×811スクショを使用。装飾枠と重複画面はaria-hidden、主画像には既存の説明altを維持。初回撮影で画像decode前の白い画面が含まれたため、ロード完了を確認し再撮影した。[素材とprompt](docs/design/purpose-ui-hybrid/asset-provenance.md)参照。
5. 内容: 見出し・サービス・料金条件は既存内容。165,000円の固定5ページまで、330,000円〜の固定10ページまで、保守5,500円と更新付き11,000円の区別・税込・別途費用を維持。新しい実績・提供範囲の主張なし。

## 比較履歴・修正

- 初回: 1案目と初期ハイブリッドを同じ画像へ並べて比較。左右構成・pill・画像合成は適合。
- P2: 詳細ページの「特徴」が料金アンカーへ移動しても常に青下線で選択中に見えた。[初回画面](docs/design/purpose-ui-hybrid/website-desktop-initial.jpg)。固定first-childの強調を削除し、hover / focus-visible時だけ青下線に変更。
- 再確認: 最終ビルドで料金CTAのhash、料金領域のtop約32px、全ナビの通常色をDOMで確認し再撮影。全体比較と部分比較を実見し、未解消のP0/P1/P2なし。

## 操作・回帰検証

- カテゴリ切替でworkだけ表示、戻るで全3カテゴリ復帰。
- 料金CTAから `#website-pricing-preview` に到達。
- モバイルメニューの開閉と各リンク・言語選択の存在。
- 最終desktopと390pxの3画面で画像ロード・横はみ出しを確認。320pxはclientWidth305=scrollWidth305。英語768pxは753=753。
- pricing / it-advisor / en / deの代表画面は破損画像・横はみ出しなし。
- consoleのwarn/errorは確認範囲内で0。
- 既存7詳細URL・問い合わせqueryの挙動は今回変更なし。前回の機能受入を再利用し、フォーム実送信は行わない。

実装担当の検証: format成功、既存prebuild検証の成功結果を再利用し、最終Astro buildとpostbuild（SEO、i18n dist、検索索引）が成功。装飾画像の空alt許容は今回の2素材かつaria-hidden=trueに限定し、それ以外のalt検証を維持した。トップで実績をheroと既存実績欄に表示する期待回数も明示した。

残る限界: 既存翻訳本文の更新待ち、フォーム実送信と外部サービス受入、実機Safari・網羅的アクセシビリティ監査は未実施。本番マージ・本番反映は行っていない。CSSで表現できる通常UIの形状・余白と、生成された機器画像を組み合わせている。

実装チェックリスト: 参照選択済み／画像実見済み／5面比較済み／P2修正再確認済み／最終build済み。細かな書体の好みは次回の見た目調整候補（P3）。
