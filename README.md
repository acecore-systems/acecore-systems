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
| 技術解説     | `/insights/`                    | `src/content/insights/*.md`                                    |
| お問い合わせ | `/contact/`                     | `src/data/contact.json`                                        |
| プライバシー | `/privacy/`                     | `src/data/privacy.json`                                        |

技術解説は、サービスや実績の背景にある実装・運用判断だけを扱います。日々のニュース、RSS、サイト内検索、多言語ページは含めず、日本語の少数記事を `src/content/insights/` で管理します。

記事の frontmatter と著者情報は原典を保持し、旧 `/blog/` 形式の本文リンクは表示時に解決します。Systemsへ移管済みの記事は `/insights/`、未移管の記事はAcecore公式サイトの絶対URLへ向けます。記事が参照するローカル画像は `public/uploads/` に同じ公開パスで保持し、Acecore公式サイトの配信には依存しません。

サービス詳細は `development`、`it-advisor`、`site-functions`、`site-quality`、`operations` の5ルートを固定で公開しています。追加時はページルート、詳細データ、一覧導線、CMS schema、`scripts/validate-content.mjs` のroute定義を同時に更新します。

## CMS

Sveltia CMS は `/admin/` から利用します。CMS では固定ページ文言、実績、サイト設定、画像アップロードを管理します。

保存するとPages Functionsがuser tokenで編集者とrepository権限を再確認し、変更path、件数、容量、`main`のHEADを同期検証します。検証後は対象repositoryとContents writeだけに絞った専用GitHub Appの短期installation tokenで、内容を1 commitとして`main`へ直接反映します。その後はCloudflare PagesのGitHub連携deployで本番公開されます。コード、設定、schemaの変更は従来どおりPull RequestとCIを通します。認証境界、管理対象path、検証手順は [CMS の安全な書き込み運用](docs/cms-write-workflow.md) を参照してください。
