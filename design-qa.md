# Quiet Infrastructure redesign — Design QA

## 対象

- 参照画像: `C:\Users\gnish\AppData\Local\Temp\codex-clipboard-6112ff5b-e987-46ca-98c9-8cfcde12a8a1.png`
- 参照画像の実寸: 1487 × 1058 px
- 実装画面: `/` の未スクロール状態
- 比較viewport: 1487 × 1058 CSS px、device scale 1
- 通常ウィンドウ検証: ユーザー提供の1920 × 1140 pxスクリーンショットを再現した、実表示1526 × 829 CSS px
- 実装確認: Codex in-app Browser と、同寸法比較用のPlaywright管理Chromium
- 撮影前状態: `document.activeElement.blur()`、`scrollTo(0, 0)`

## 比較証跡

- 全体比較（左: 参照、右: 実装）: `docs/design-qa/quiet-infrastructure/reference-vs-implementation.jpg`
- ヒーロー重点比較: `docs/design-qa/quiet-infrastructure/hero-reference-vs-implementation.jpg`
- 三層断面重点比較: `docs/design-qa/quiet-infrastructure/layers-reference-vs-implementation.jpg`
- 実装デスクトップ: `docs/design-qa/quiet-infrastructure/implementation-desktop.jpg`
- 実装タブレット（834 × 1194）: `docs/design-qa/quiet-infrastructure/implementation-tablet.jpg`
- 実装モバイル（390 × 844）: `docs/design-qa/quiet-infrastructure/implementation-mobile.jpg`

## 判定

| 観点             | 判定 | 確認内容                                                                                                                                                                                                  |
| ---------------- | ---- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| タイポグラフィ   | pass | 参照と同じ明朝の見出し寸法・2行位置、横幅、行送りを再現。本文は非UI版のYu Gothicを優先し、25字ずつの2行を明示した。                                                                                       |
| 余白・寸法       | pass | Header 96px、Hero 454px、棚66px、三層各102px前後、要約帯136pxで、主要境界が参照のy=96 / 550 / 616 / 718 / 821 / 922と一致する。                                                                           |
| 色・質感         | pass | ヘッダー上端からHero棚まで連続するアイボリー面と右側の淡い枝影、石材グレー、濃紺の配線層、深紺の運用層を維持した。                                                                                        |
| 画像品質         | pass | 文字を持たない実画像を使用。上端面は1487 × 550、断面は1487 × 372のWebP。参照の紙面・枝影・棚上オブジェクトと断面の主要領域を保持し、HTML文字と重複しない。                                                |
| 画像構図         | pass | 右の石板・金属円柱・黒円柱・白い石、棚、現場の石ブロック、仕組みの配線、運用の円柱・歯車が参照位置にある。                                                                                                |
| コピー           | pass | Hero本文と各層の説明を参照文面・改行に合わせ、HTMLとして選択・読み上げ可能な状態を保った。                                                                                                                |
| CTA・アイコン    | pass | Primary 254 × 60px、Secondary 178px、間隔59px。参照から抽出した透過矢印画像を使用し、CSS記号や手描きSVGで代用していない。                                                                                 |
| レスポンシブ     | pass | 1526 × 829では現場・仕組み・運用の全行を初期表示内に収め、次の要約帯を12.52px見せた。短いデスクトップ用調整は1200–1600px幅かつ800–933px高だけに限定。390 / 834 / 1040 / 1487pxでもdocument overflowなし。 |
| 操作             | pass | デスクトップ／モバイルナビ、ページ内リンク、主要CTAを確認。モバイルメニューは5リンクを表示し、ページ内リンク選択後に閉じる。フォーム送信は行っていない。                                                  |
| アクセシビリティ | pass | Skip link、見出し階層、aria-current、ラベル、focus-visibleを維持。QA撮影時だけフォーカスを解除し、skip link自体は隠していない。                                                                           |
| ブラウザログ     | pass | 本番プレビューでconsole message 0。error 0、warning 0。                                                                                                                                                   |

## 反復履歴

1. 初回実装は表層の影と棚上オブジェクト、三層の素材差が参照から大きく離れていたため、判定をいったんblockedとして再作業した。
2. Built-in ImageGenのprecise-object-editで参照から文字・ナビ・ボタンだけを除去し、背景素材を生成した。
3. Hero右側は参照画素をフェザーブレンドし、断面は参照の棚・石材・配線・機械構造を保持した文字なし素材へ置き換えた。
4. H1、本文、CTA、各層ラベル、要約帯を1487 × 1058の同寸法比較で調整した。Heroの文字幅、CTA位置、棚・各帯・要約帯の境界が一致した。
5. モバイルでは本文の不自然な分断、CTA内の文字位置、層ラベルの縦位置を修正した。
6. 参照と実装を同じ比較画像へ結合し、fonts / spacing / colors / image quality / layout / behavior / accessibility / content / icons / responsivenessを再確認した。
7. 再比較で、ヘッダーだけがフラットな別面になっていた点、CTAの青、見出し・本文・ナビの文字メトリクスを残差として特定した。
8. Built-in ImageGenのprecise-object-editで上端550pxの文字・UIだけを除去し、紙面・枝影・棚・右側オブジェクトを保持した`quiet-home-surface-v3-exact.webp`へ置き換えた。
9. HeaderとHeroに同じ背景面を通し、CTAを`#022f5d`へ合わせ、見出し・本文・ナビ・三層説明・要約帯を1487 × 1058の同寸法比較で再調整した。
10. 本番ビルドを1040 / 1041 / 834 / 390pxで確認し、390pxでdocument overflowなし、開発ツール表示なしを確認した。
11. 最終比較でP0 / P1 / P2の未解決項目がないことを確認した。
12. ユーザー提供の通常ウィンドウを1526 × 829 CSS pxで再現し、初期表示で運用行が見切れる状態を確認した。短いデスクトップだけHeroと三層断面を高さ連動で圧縮し、運用行の下端を816.48px、要約帯の見え幅を12.52pxに調整した。1199 / 1200 / 1600 / 1601pxの適用境界と1487 × 1058の既存レイアウト不変も本番プレビューで確認した。

Final result: passed
