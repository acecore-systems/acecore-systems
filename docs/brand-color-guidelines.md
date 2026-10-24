# Systemsのブランドカラー

2026-10-24、全体彩色とテーマ背景の白無地ロゴを正式採用。[Acecore共通正本](https://github.com/acecore-systems/acecore-net/blob/9aab8f60b9137dbbd93e1dc70730aba5504ced86/docs/03_詳細設計/07_ブランドカラーと球状グラデーション.md)をUI・ロゴ変更前に読む。このcommit permalinkを承認版として固定し、今後の正本は[mainの同文書](https://github.com/acecore-systems/acecore-net/blob/main/docs/03_詳細設計/07_ブランドカラーと球状グラデーション.md)（net PR314マージ後）。現時点はDraft Previewで本番未反映。

- 明背景は全6描画pathに同一theme radial。黒/白やdark/paleの材質区分をなくし、外周と中央を一つの広い色流れへ揃える。ロゴ形状・path/clip・比率・余白は保持する。
- 色背景では背景全体を事業テーマにし、ロゴは中央も含め白無地。ロゴSVG内のgradientは0。旧「中央は色付きのまま」「中央不変」「黒系/淡色の外周」は現行仕様ではない。
- 文書imgは白背景用/logo.svgまたはテーマ背景用/logo-on-dark.svgを明示選択。専用/favicon.svgだけが明外観の全体彩色と暗外観のテーマ背景＋白へ切り替わる。OS darkで白headerのimgを白くしない。
- CSSは--logo-paint・--logo-on-theme・--logo-theme-backgroundへ同期。旧--sphere-paintと白い光沢の重ねを廃止。座標と停止点は共通正本を参照する。
- Acecore文字は共通青#0656d9、Systems紫#8950c5、Schools緑#39a86b、Designsは読みやすい多色。通常見出し・本文・料金は中立色#20252b、白主体の使用量を維持。色面を増やす目的ではない。
- 元写真・Hatt・作品・図・価格・本文・翻訳・既存機能は不変。承認されたロゴSVGとコード生成ブランドOGだけを同期し、写真OGを差し替えない。

desktop/mobile、OS外観、小さいfavicon、既存header/footer、OGと形状保全を確認する。build・format・diff checkと必要な既存検証を行い、CI・Preview・本番を区別する。過去のgroup-ui-standard.mdと旧承認HTMLは履歴として参照し、最新の本ガイドを優先する。
