# Quiet Infrastructure redesign — Design QA

## 対象

- 参照画像: `C:\Users\gnish\AppData\Local\Temp\codex-clipboard-6112ff5b-e987-46ca-98c9-8cfcde12a8a1.png`
- 参照画像の実寸: 1487 × 1058 px
- 実装画面: `/` の未スクロール状態
- 比較viewport: 1487 × 1058 CSS px、device scale 1
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

| 観点             | 判定 | 確認内容                                                                                                                                                 |
| ---------------- | ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| タイポグラフィ   | pass | 参照と同じ明朝の見出し寸法・2行位置、横幅、行送りを再現。本文は非UI版のYu Gothicを優先し、25字ずつの2行を明示した。                                      |
| 余白・寸法       | pass | Header 96px、Hero 454px、棚66px、三層各102px前後、要約帯136pxで、主要境界が参照のy=96 / 550 / 616 / 718 / 821 / 922と一致する。                          |
| 色・質感         | pass | アイボリー面、右側の淡い枝影、石材グレー、濃紺の配線層、深紺の運用層を維持した。                                                                         |
| 画像品質         | pass | 文字を持たない実画像を使用。Heroは1487 × 454、断面は1487 × 372のWebP。参照の右側背景と断面の主要領域を保持し、HTML文字と重複しない。                     |
| 画像構図         | pass | 右の石板・金属円柱・黒円柱・白い石、棚、現場の石ブロック、仕組みの配線、運用の円柱・歯車が参照位置にある。                                               |
| コピー           | pass | Hero本文と各層の説明を参照文面・改行に合わせ、HTMLとして選択・読み上げ可能な状態を保った。                                                               |
| CTA・アイコン    | pass | Primary 254 × 60px、Secondary 178px、間隔59px。参照から抽出した透過矢印画像を使用し、CSS記号や手描きSVGで代用していない。                                |
| レスポンシブ     | pass | 390、768、800、834、900、1040、1041、1487pxで横切れを検査。全8ルートを390 / 834 / 1040 / 1487pxで確認し、document overflowなし。                         |
| 操作             | pass | デスクトップ／モバイルナビ、ページ内リンク、主要CTAを確認。モバイルメニューは5リンクを表示し、ページ内リンク選択後に閉じる。フォーム送信は行っていない。 |
| アクセシビリティ | pass | Skip link、見出し階層、aria-current、ラベル、focus-visibleを維持。QA撮影時だけフォーカスを解除し、skip link自体は隠していない。                          |
| ブラウザログ     | pass | 3件のdebugログのみ。error 0、warning 0。                                                                                                                 |

## 反復履歴

1. 初回実装は表層の影と棚上オブジェクト、三層の素材差が参照から大きく離れていたため、判定をいったんblockedとして再作業した。
2. Built-in ImageGenのprecise-object-editで参照から文字・ナビ・ボタンだけを除去し、背景素材を生成した。
3. Hero右側は参照画素をフェザーブレンドし、断面は参照の棚・石材・配線・機械構造を保持した文字なし素材へ置き換えた。
4. H1、本文、CTA、各層ラベル、要約帯を1487 × 1058の同寸法比較で調整した。Heroの文字幅、CTA位置、棚・各帯・要約帯の境界が一致した。
5. モバイルでは本文の不自然な分断、CTA内の文字位置、層ラベルの縦位置を修正した。
6. 参照と実装を同じ比較画像へ結合し、fonts / spacing / colors / image quality / layout / behavior / accessibility / content / icons / responsivenessを再確認した。
7. 最終比較でP0 / P1 / P2の未解決項目がないことを確認した。

Final result: passed
