# Acecore Systems 公式ホームページ

このリポジトリは、Acecore Systems 公式ホームページのソースコードです。

- 本番サイト: https://systems.acecore.net
- 公開方式: Cloudflare Pages
- 対象言語: 日本語

## 技術スタック

- Astro v7
- Cloudflare Pages
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
| お問い合わせ | `/contact/`                     | `src/data/contact.json`                                        |
| プライバシー | `/privacy/`                     | `src/data/privacy.json`                                        |

ブログ、RSS、サイト内検索、多言語ページは含めません。実装判断を詳しく説明する技術記事は、Acecore公式サイトの記事を参照します。

サービス詳細は `it-advisor`、`site-functions`、`site-quality`、`operations` の4ルートを固定で公開しています。追加時はページルート、詳細データ、一覧導線、CMS schema、`scripts/validate-content.mjs` のroute定義を同時に更新します。

## CMS

Sveltia CMS は `/admin/` から利用します。CMS では固定ページ文言、実績、サイト設定、画像アップロードを管理します。

保存するとPages Functionsが固定の `cms/systems/publish` branchとPull Requestを作成します。`CMS Publish Guard`がCIとCloudflare Pages previewを確認し、成功時だけsquash mergeして、GitHub連携deployから本番公開します。検証失敗や競合時はPull RequestとCMS branchを自動終了し、本番を変更せず次の保存を受け付けます。認証境界、管理対象path、検証手順は [CMS の安全な書き込み運用](docs/cms-write-workflow.md) を参照してください。
