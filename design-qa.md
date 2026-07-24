# Quiet Infrastructure redesign — Design QA

## 対象

- 参照画像: `C:\Users\gnish\AppData\Local\Temp\codex-clipboard-a7e19458-bb4c-4273-b971-f0b39a07ba8c.png`
- 参照画像の実寸: 1487 × 1058 px
- 実装画面: `/` の未スクロール状態
- 検証時CSS viewport: 1487 × 1058 px
- Browser Pluginの取得画像: 1472 × 1047 px、1x
- 比較時の正規化: 参照画像を取得画像と同じ1472 × 1047 pxへ合わせた

## 比較証跡

- 全体比較（左: 参照、右: 実装）: `docs/design-qa/quiet-infrastructure/reference-vs-implementation.jpg`
- ヒーロー重点比較: `docs/design-qa/quiet-infrastructure/hero-reference-vs-implementation.jpg`
- 三層断面重点比較: `docs/design-qa/quiet-infrastructure/layers-reference-vs-implementation.jpg`
- 実装デスクトップ: `docs/design-qa/quiet-infrastructure/implementation-desktop.jpg`
- 実装タブレット: `docs/design-qa/quiet-infrastructure/implementation-tablet.jpg`
- 実装モバイル: `docs/design-qa/quiet-infrastructure/implementation-mobile.jpg`

## 判定

| 観点           | 判定 | 確認内容                                                                                                   |
| -------------- | ---- | ---------------------------------------------------------------------------------------------------------- |
| タイポグラフィ | pass | 明朝の大見出し、サンセリフの本文・ナビ、英字eyebrowの役割を再現。モバイルの句読点孤立も解消した。          |
| 余白・寸法     | pass | ヘッダー、ヒーロー、棚、三層、要約帯の開始位置を参照に合わせた。CTAは約254 × 60pxへ調整した。              |
| 色・質感       | pass | アイボリーの表層、濃紺の文字、石材グレーから深い青への断面を維持した。                                     |
| 画像品質       | pass | 表層と三層断面はWebPの実画像を使用。断面は1487 × 376px、SNS画像は1200 × 630pxで用意した。                  |
| コピー         | pass | 「現場・仕組み・運用」と「画面だけでなくデータ・権限・例外・保守まで」という設計思想を保った。             |
| レスポンシブ   | pass | 390 × 844、768 × 1024、800 × 1024、834 × 1194、900 × 1024で確認。横切れなし。                              |
| 操作           | pass | デスクトップ／モバイルナビ、ページ内リンク、FAQ、フォーム入力、主要CTAを確認。フォーム送信は行っていない。 |
| ブラウザログ   | pass | Vite接続のdebugログのみで、error / warningなし。                                                           |

## 反復履歴

1. 初回実装ではコンテンツ幅が狭く、ヒーローと棚が参照より約130px深かった。コンテナ幅、見出し行高、本文量、CTA間隔を調整した。
2. 断面画像の上部を再クロップし、棚約76px＋三層各約100pxの比率へ合わせた。
3. 参照との同寸比較で、CTA上端、棚の開始、暗部の開始、要約帯の位置を再調整した。
4. モバイルで見出しの読点が孤立し、「仕組み」が改行されていたため、文字サイズ、禁則処理、ラベル幅を修正した。
5. 実装監査で見つかったOGP相対URL、761〜1040px帯の下層レイアウト、`h3`セレクタ、CMS未使用項目を修正した。
6. 最終の全体・ヒーロー・三層断面比較で、P0 / P1 / P2の未解決項目がないことを確認した。

Final result: passed
