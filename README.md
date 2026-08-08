# Acecore Systems 公式ホームページ

このリポジトリは、Acecore Systems 公式ホームページのソースコードです。

- 本番サイト: https://systems.acecore.net
- 公開方式: Cloudflare Pages
- 対象言語: 日本語、英語、簡体字中国語、スペイン語、ポルトガル語、フランス語、韓国語、ドイツ語、ロシア語

## 技術スタック

- Astro v7
- Cloudflare Pages
- Pagefind
- OpenAI Embeddings / Cloudflare Vectorize
- Sveltia CMS

## 必要環境

- Node.js 24.18.0 以上（`.node-version` を参照）
- npm

## 開発

```bash
npm install
npm run dev
```

## ビルド

```bash
npm run validate:content
npm run validate:i18n
npm run build
npm run preview
```

`npm run build` の前にもコンテンツ検証が自動実行され、詳細ページ、料金、内部リンクの対応関係を確認します。

## サイト構成

| ページ       | パス                            | CMS                                                            |
| ------------ | ------------------------------- | -------------------------------------------------------------- |
| ホーム       | `/`                             | `src/data/home.json`                                           |
| サービス     | `/services/`                    | `src/data/services.json`                                       |
| サービス詳細 | `/services/it-advisor/` ほか    | `src/data/it-advisor.json` / `src/data/service-details/*.json` |
| 料金         | `/pricing/`                     | `src/data/pricing.json`                                        |
| 実績         | `/works/`                       | `src/data/works.json`                                          |
| 実績詳細     | `/works/acecore-site-platform/` | `src/data/work-details/*.json`                                 |
| 導入ガイド   | `/guide/`                       | `src/data/guide.json`                                          |
| 技術解説     | `/insights/`                    | `src/content/insights/*.md`                                    |
| お問い合わせ | `/contact/`                     | `src/data/contact.json`                                        |
| プライバシー | `/privacy/`                     | `src/data/privacy.json`                                        |

固定ページと技術解説は、上記9言語を静的HTMLとして公開します。日本語はprefixなし、翻訳ページは `/{locale}/` prefixを使い、各ページをself-canonicalとしたうえでhreflangとx-defaultで対応関係を示します。

技術解説は、Acecore公式サイトからSystemsの技術・運用判断に関する22記事と既存翻訳を移管し、`src/content/insights/` で管理します。日本語記事は直下、翻訳記事は `src/content/insights/{locale}/` に置き、言語別RSSも公開します。タグ・著者の専用一覧、コメントUI、記事のCMS編集は移管しません。

記事のfrontmatterと著者情報はSystemsの公開情報として管理し、旧 `/blog/` 形式の本文リンクは表示時に各言語の `/insights/` へ解決します。未移管の記事はAcecore公式サイトの同じ言語の絶対URLへ向けます。記事が参照するローカル画像は `public/uploads/` に同じ公開パスで保持し、Acecore公式サイトの配信には依存しません。

日本語ページのサイト内検索は、ブラウザ内で動くPagefindを主検索とし、OpenAI Embeddings / Cloudflare Vectorizeによる「関連する内容」を補助表示します。

PagefindとVectorizeのcorpusは公開後の日本語HTMLから生成します。通常のPages PreviewはVectorize bindingを持たずPagefindだけを使い、VectorizeはProduction indexだけを自動同期します。Vectorizeが未設定または利用できない場合も、Pagefindのキーワード検索は継続します。運用手順は [Vectorize検索運用](docs/04_運用設計/02_Vectorize検索運用.md) を参照してください。

OpenAI用1536次元Production indexは256 vectorsを同期し、`ja` namespaceの既知queryを確認済みです。関連検索はProductionで有効、通常のPages Previewでは無効です。

サービス詳細は `development`、`it-advisor`、`site-functions`、`site-quality`、`operations` の5ルートを固定で公開しています。追加時はページルート、詳細データ、一覧導線、CMS schema、`scripts/validate-content.mjs` のroute定義を同時に更新します。

## CMS

Sveltia CMS は `/admin/` から利用します。CMS では日本語の固定ページ文言、実績、サイト設定、画像アップロードを管理します。翻訳と技術解説の記事はCMSの管理対象に含めず、Pull Requestで更新します。

保存するとPages Functionsがuser tokenで編集者とrepository権限を再確認し、変更path、件数、容量、`main`のHEADを同期検証します。検証後は対象repositoryとContents writeだけに絞った専用GitHub Appの短期installation tokenで、内容を1 commitとして`main`へ直接反映します。その後はCloudflare PagesのGitHub連携deployで本番公開されます。コード、設定、schemaの変更は従来どおりPull RequestとCIを通します。認証境界、管理対象path、検証手順は [CMS保存・自動公開運用](docs/04_運用設計/01_CMS保存・自動公開運用.md) を参照してください。

設計文書の入口は [docs/README.md](docs/README.md) です。

日本語sourceが変わると翻訳source hashの検証が失敗し、古い翻訳のまま新しいdeployが進まない設計です。`Create Translation PR` workflowが8言語の更新タスクを作り、翻訳完了後に `npm run update:i18n-state`、`npm run validate:i18n`、`npm run build` を実行します。
