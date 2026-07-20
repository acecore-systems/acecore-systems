# Acecore Systems 公式ホームページ

このリポジトリは、Acecore Systems 公式ホームページのソースコードです。

- 本番サイト: https://systems.acecore.net
- 公開方式: Cloudflare Pages
- 対象言語: 日本語

## 技術スタック

- Astro
- Cloudflare Pages
- Sveltia CMS

## 開発

```bash
npm install
npm run dev
```

## ビルド

```bash
npm run build
npm run preview
```

## サイト構成

| ページ       | パス         | CMS                      |
| ------------ | ------------ | ------------------------ |
| ホーム       | `/`          | `src/data/home.json`     |
| サービス     | `/services/` | `src/data/services.json` |
| 料金         | `/pricing/`  | `src/data/pricing.json`  |
| 実績         | `/works/`    | `src/data/works.json`    |
| お問い合わせ | `/contact/`  | `src/data/contact.json`  |
| プライバシー | `/privacy/`  | `src/data/privacy.json`  |

ブログ、RSS、サイト内検索、多言語ページは含めません。

## CMS

Sveltia CMS は `/admin/` から利用します。CMS では固定ページ文言、実績、サイト設定、画像アップロードを管理します。
