# 共通UIの細部整合

2026-10-24。全面刷新Draftの後続確認。本番への新規反映は含めない。

[4サイトの監査表と共通仕様](https://github.com/acecore-systems/acecore-net/blob/3b891aa86e0d157bfc32cefcd246b5b30f289eb0/docs/03_詳細設計/08_共通UIと操作の整合.md)を参照する。

- ブランド名のslashを省き、空白・部分着色・SVGを保持。主CTAは相談/主要行動、副CTAは詳細選択を示し、両者を同じ装飾にしない。focusは2px、offset3px。本文・料金は中立色。
- chatbotのある公式/Schools/Systemsは起動アイコン・52px操作・会話/入力の構造とIME/Shift+Enter/Escape/focusを共通化。接続先と既存安全検証・文言は保持。Designsには新設せず既存制作相談を使用。
- 料金/工程/FAQ/作品/本文/既存画像の意味を維持。実API送信はせず、mockの長文・待機・errorでUIを検証する。
- 52ルート家族PC/mobile計104画面と代表の操作確認を使用。事業固有の情報構成や検索/言語の有無は一律化しない。
