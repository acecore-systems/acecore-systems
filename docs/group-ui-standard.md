# グループ共通UIの適用

## 変更と保全

2026年10月23日、Acecore本体・Schools・Designsと共通の白・濃紺 `#071f3e`、太いsans見出し、矩形CTA、細い罫線を適用した。Systemsの青は `#0656d9`、hover `#0446b5`、淡色面 `#eef4ff`。色の変更に加え、Homeの依頼内容と支援方針を開いた罫線行に、実績を元のサイト画面と説明の段組にした。サービス詳細・価格比較・工程・導入ガイド・フォーム・記事・法務・完了・404を共通の字級、余白と操作体系で揃えた。

既存の原画像・Hattのサイト画面・Cast素材・登録とbytes・図・説明・価格・記事・法人情報・リンクは保持した。フッターの暗いロゴは元ファイルを変更せず、footer限定のfilterで白く表示する。記事カバーと実績画像はcontainで全体を見せる。技術記事の本文幅は最大736px、1024pxで読めることを確認した。見出しと導線を追加して同じ説明を重ねる変更はしていない。

日本語と8言語の507HTMLを基点 `7ea8748` と照合し、title/main本文/全href/画像src・ALT/idの差分は0。親の独立hash比較でもグループ3サイトのsource/data/content/i18n/public計658ファイルは全て一致した。既存の11固定ページ分の翻訳準備状態と公開言語リンクの制限も変更していない。

ヘッダーの現在ページはpage、配下ページはlocationに区別した。native detailsのmenuとlanguageにEscapeで閉じてsummaryへfocusを戻す操作、外側click、desktop復帰を加えた。menu表示中は固定AIを非表示にし、閉じると復帰する。メニューは短い画面内でscrollでき、言語リンクが切れない配置にした。検索/AI/フォーム/API/CMSの実装と認証・送信条件は変更していない。

## 検証

- `npm run build`：成功。prebuild内のCast11、CMS84、search45、AI7、contact6件の既存テスト、content/i18n、Cloudflare型・Functions build・typecheckを含む。出力の検索/AI境界、Pagefind/corpus/marker、Cast出力、SEO、i18n distも成功。
- `node node_modules/prettier/bin/prettier.cjs . --check`：全体成功。
- `git diff --check`：成功。
- 外部QA `group-html-preservation.mjs`：507HTML差分0。
- 外部QA `group-systems-qa.mjs`：日本語19ページ種別×1440/390px、en/de/ru各6ページ×390pxの56画面。横溢れ・壊れた画像・無効anchor・pageerrorは全て0。全原画像をeager/decode/naturalWidth完了まで待ち、実見した。
- 外部QA `group-systems-interactions.mjs`：390×667 menu/9言語、Escape/focus、desktop言語・current、AI応答、検索、Pagefind fallback、サービス/実績filter、詳細開閉、フォームquery/required、記事TOCと736px本文を確認。

最終のフッターロゴ、メニュー位置、サービス詳細CTA/工程の変更後は、関係する画面と操作を再確認した。青い相談帯のh2/pは不透明白（contrast6.29:1）、紺フッターの文字とfocusは白。全サイトのWCAG認定を意味しない。

## 境界・制約・後処理

Browser/IAB利用不能のため、Playwright管理Chromiumを使用。通常Edgeや既存profileを使用していない。APIはUI専用モックで、Pagefindだけは生成済みローカルindexによる結果を確認。実AI回答、実semantic/network検索、問い合わせ送信、実機確認は未実施。Turnstileの設定や認証境界は変更・迂回していない。devの問い合わせで `TurnstileError 110200` を観測したが、最終静的56画面ではpageerror0だった。

初回QAのlazy画像未開始、details直後のstyle更新前assert、翻訳準備中の詳細ページへ9言語を期待したselector、日本語hashのencode差はハーネスを正して再確認した。入れ子worktreeの親PostCSS探索だけ外部一時設定で停止し、repo設定は変更していない。

証拠はタスクvisualizationsの `group-systems/after/`、`systems-html-comparison.json`、`systems-build.log`。Draft PRとGitHub連携Previewまでが対象で、本番merge/deployは行わない。ブラウザは各処理のfinallyで終了し、ローカルpreviewは確認後停止する。open Draftの専用branch/worktreeはレビュー用に保持する。
