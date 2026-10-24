# Systemsのブランドカラー

2026-10-24、外周のテーマ彩色と中央の単色公式青を適用。[Acecore共通正本](https://github.com/acecore-systems/acecore-net/blob/f9bd3f77d9c62321528370fdec24fe5e71da4c20/docs/03_詳細設計/07_ブランドカラーと球状グラデーション.md)をUI・ロゴ変更前に読む。このcommit permalinkを承認版として固定し、今後の正本は[mainの同文書](https://github.com/acecore-systems/acecore-net/blob/main/docs/03_詳細設計/07_ブランドカラーと球状グラデーション.md)（net PR314マージ後）。現時点はDraft Previewで本番未反映。

- 明背景は外周4描画pathに同一theme radial、中央2描画pathは背景に関係なく単色#0656d9。外周の黒/白材質区分は復活させず、path/clip・比率・余白を保持する。
- 色背景では外周は白無地、中央は単色#0656d9。旧「中央も全白」は最新ユーザー指示で失効。faviconも同じ中央色を保持し、文書imgは実背景で明示選択する。
- 文書imgは白背景用/logo.svgまたはテーマ背景用/logo-on-dark.svgを明示選択。専用/favicon.svgだけが明外観の外周テーマ色と暗外観のテーマ背景＋白い外周へ切り替わり、中央は常に青とする。OS darkで白headerのimgを白くしない。
- CSSは--logo-paint・--logo-on-theme・--logo-center・--logo-theme-backgroundへ同期。旧--sphere-paintと白い光沢の重ねを廃止。座標と停止点は共通正本を参照する。
- wordmarkはAcecoreの2つ目のc（index3）だけ共通青#0656d9、子名は頭文字だけSystems紫/Schools緑/Designs多色。残りは中立色#20252b。通常見出し・本文・料金は中立色#20252b、白主体の使用量を維持。色面を増やす目的ではない。
- 元写真・Hatt・作品・図・価格・本文・翻訳・既存機能は不変。承認されたロゴSVGとコード生成ブランドOGだけを同期し、写真OGを差し替えない。

desktop/mobile、OS外観、小さいfavicon、既存header/footer、OGと形状保全を確認する。build・format・diff checkと必要な既存検証を行い、CI・Preview・本番を区別する。過去のgroup-ui-standard.mdと旧承認HTMLは履歴として参照し、最新の本ガイドを優先する。

header/footer/部門ブランド見出し/OGのwordmarkは色付き1文字のみを分け、余計な空白・改行を加えずtextContentと読み上げを保つ。通常本文中の社名は細分化しない。DesignsのDのgradientはinline-blockと余裕ある行高で描き、CTA/footer境界の帯はfooter側の1本とする。pinch zoomは維持する。

ロゴimgの円形border-radiusやclip/maskで矢印先端を隠さない。Systems/Schools footerの旧50% radiusと4px paddingは除去し、元SVGのviewBox/path/clipは維持。中央丸は常に単色公式青。
