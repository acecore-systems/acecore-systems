# Quiet Infrastructure polish — Design QA

## 対象

- テーマの視覚基準: `docs/03_詳細設計/デザイン品質確認/静かなインフラ/実装_デスクトップ.jpg`
  - 1487 × 1058 px
  - 「静かな基盤」の色、書体、三層断面、コピーを維持するための基準
- 余白設計の視覚基準: `C:\Users\gnish\repos\acecore-net\docs\ui-concepts\selected-technical-workshop\01-home-hero-detail.png`
  - 1536 × 1024 px
  - 実装値は acecore-net の `max-width: 70rem` と `20 / 24 / 32px` のガターを採用
- 実装スクリーンショット: `C:\Users\gnish\AppData\Local\Temp\codex-clipboard-faf5b13b-02ab-47c7-8638-ac8248608297.png`
  - 1763 × 6776 px
  - ユーザーの通常デスクトップブラウザによるホーム全体、未操作状態
  - CSS viewportとdevice scaleは画像に埋め込まれていないため不明。画素寸法を変えずに重点領域を切り出し、全体比較だけ1024px幅へ等比縮小した。
- 実装URL: `http://127.0.0.1:4390/`
- ブランド資産: `C:\Users\gnish\repos\acecore-net\public\favicon.svg`
  - Acecore公式サイトがヘッダー、favicon、Organization JSON-LDで使用している単独マーク
  - SHA-256: `AE99B43D842245D8F799A07F4A7186F46437029BBD87478D71E7B3DE8C8CCECE`

## 比較証跡

- acecore-netとホーム上部の同一入力比較:
  `C:\Users\gnish\.codex\visualizations\2026\07\24\019f938f-262e-72c0-872a-becd6a9ac783\acecore-spacing-qa\acecore-net-vs-systems-top-1024.png`
- ヒーロー・三層断面:
  `C:\Users\gnish\.codex\visualizations\2026\07\24\019f938f-262e-72c0-872a-becd6a9ac783\acecore-spacing-qa\top.png`
- 考え方:
  `C:\Users\gnish\.codex\visualizations\2026\07\24\019f938f-262e-72c0-872a-becd6a9ac783\acecore-spacing-qa\philosophy.png`
- 設計領域:
  `C:\Users\gnish\.codex\visualizations\2026\07\24\019f938f-262e-72c0-872a-becd6a9ac783\acecore-spacing-qa\domains.png`
- 相談・事例:
  `C:\Users\gnish\.codex\visualizations\2026\07\24\019f938f-262e-72c0-872a-becd6a9ac783\acecore-spacing-qa\consultation-work.png`
- CTA・フッター:
  `C:\Users\gnish\.codex\visualizations\2026\07\24\019f938f-262e-72c0-872a-becd6a9ac783\acecore-spacing-qa\closing.png`

## Findings（解消済み）

- [P2] 三層断面の注釈だけ本文より左へ出ている
  - Location: ヒーロー直下の「現場・仕組み・運用」
  - Evidence: 全幅画像上の注釈に1348pxのwide例外が適用され、ヘッダー・ヒーロー・本文の1120px基準線より左へ配置されている。
  - Impact: サイト全体で整えた左端のリズムが、最も目立つ三層断面だけ途切れる。
  - Fix: 画像と下部の三分割要約はwideのまま維持し、注釈overlayだけ共通1120pxコンテナへ戻す。
- [P2] 日本語の語中で見出しが改行される
  - Location: 設計領域H2、設計領域03、Selected WorkのH2と事例タイトル
  - Evidence: 「ひ／とつ」「フ／ォーム」「運／用」「問い合／わせ」「追／加」が別行に分かれている。
  - Impact: 余白とグリッドが整った一方で、見出しの読み始めに引っ掛かりが生まれ、仕上げの精度を下げる。
  - Fix: 見出しに通常の改行規則をフォールバックとして残した上で `word-break: auto-phrase` を追加し、行見出しの最大サイズを2remから1.85remへ抑える。

## 必須5面の評価

| 観点             | 状態 | 根拠                                                                                             |
| ---------------- | ---- | ------------------------------------------------------------------------------------------------ |
| タイポグラフィ   | pass | 書体・階層・本文サイズは良好。1528 × 828pxと390 × 844pxで語中改行と横溢れがないことを確認。      |
| 余白・レイアウト | pass | 本文と三層断面の注釈を共通1120px基準線へ統一。通常デスクトップで三層すべてが初期画面内に収まる。 |
| 色・トークン     | pass | 紙色、石材色、濃紺、青のアクセントを維持。セクションの切替とコントラストに崩れなし。             |
| 画像品質         | pass | ヒーローと三層画像は自然な比率・クロップで、引き伸ばしやぼけは見られない。                       |
| コピー           | pass | ヒーロー、考え方、設計領域、相談、事例、CTAの文面に欠落・重複なし。                              |
| ブランド・ロゴ   | pass | Acecore公式SVGを無改変で使用。デスクトップとモバイルでヘッダー・フッターの識別性を確認。         |

## 比較履歴

1. 既存実装では最大1348pxの本文コンテナを使い、通常デスクトップで左右が詰まって見えた。
2. acecore-net の実装を確認し、本文を最大1120px、ガターを20/24/32pxへ統一した。
3. 断面図の画像と注釈へ、デスクトップのみ最大1348px・左右56px以上のwide例外を追加した。
4. ユーザー提供の1763 × 6776px全体画像を原寸の重点領域へ分割して確認。左右余白、本文サイズ、三層断面、セクション間隔にはP1/P2なし。
5. 設計領域とSelected Workで語中改行をP2として特定した。
6. `word-break: auto-phrase` と行見出しの上限1.85remを反映し、ビルドを再実行した。
7. ユーザー指摘により、三層注釈の左端だけが本文基準線より外へ出ていることを追加のP2として確認した。
8. 注釈overlayをwide例外から外し、画像と三分割要約は全幅の演出を維持したまま、ラベルと説明だけを1120px基準線へ揃えた。
9. 1528 × 828pxと390 × 844pxで修正後の描画を確認し、2件のP2を解消済みとした。
10. Systems独自のAマークをAcecore公式SVGへ置き換え、ヘッダーとフッターの社名表示へ追加した。faviconとOrganization JSON-LDも同じ公式資産に統一した。

## 機能・検証

- `npm run build`: pass（9ページ生成、公式SVGを含む）
- ローカルHTTP確認: 9ルートすべて200
- 差分レビュー: P1 / P2なし
- 主要操作: ナビ、ページ内リンク、CTA、料金から問い合わせへの事前選択、モバイルメニューを確認。ロゴは既存のホームリンク内へ追加し、重複した読み上げを避けるため画像を装飾扱いにした。
- レスポンシブ: 1528 × 828pxと390 × 844pxで横溢れなし。デスクトップ初期画面で「現場・仕組み・運用」の三層を確認できる。
- console error: 関連するアプリケーションエラーなし

final result: passed
