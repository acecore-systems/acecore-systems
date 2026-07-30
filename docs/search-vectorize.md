# Vectorize 検索の運用

Acecore Systems の検索は、ブラウザ内の Pagefind を通常検索として使い、利用者が明示的に実行した場合だけ Cloudflare Workers AI と Vectorize による関連検索を呼び出します。

## 現在の状態

- Production の関連検索は無効です。Production 用の Vectorize index、D1、GitHub Environment、API token はまだ作成していません。
- Preview 用 Vectorize index `acecore-systems-search-preview` は、BGE-M3 用の 1024 dimensions / cosine として作成済みです。
- Preview 用 D1 database `acecore-systems-search-preview`（database ID `9346ee59-7cb7-4da1-9a00-7f75eee19f91`）は作成済みで、検索レート制限の migration を適用済みです。
- GitHub Environment `cloudflare-search-preview` は作成済みです。`main` branch だけを許可しています。
- GitHub Actions 用の scoped Cloudflare API token は未作成です。既存の広権限 token は同期には使いません。

サイト本文の raw query は corpus や Vectorize metadata に保存しません。同期 corpus は build output から公開対象の日本語ページだけを抽出し、`/admin`、`/api`、noindex、外部 canonical などを除外します。

## 同期の安全境界

`.github/workflows/sync-vectorize.yml` は、保護された `main` の tooling と site source だけを checkout して corpus を生成します。Preview 同期は `workflow_dispatch` から `target=preview` を選んだ場合だけ実行され、branch は `main` に限定されます。

同期スクリプトは次を fail closed で確認します。

- index 名、dimensions、metric が許可値と一致する
- corpus が日本語 1 locale で、公開 root-relative URL と必須 metadata を持つ
- 管理対象外の vector ID が index に混在していない
- source page と vector の上限を超えていない
- 既存 vector の 20% を超える削除を行わない

20% を超える削除が意図した変更である場合だけ、手動 workflow の `allow_large_delete=true` を指定します。通常の push / schedule では大規模削除を許可しません。

## Preview 同期を有効にする

1. Cloudflare account token を、対象 account に限定して作成します。必要権限は Workers AI Read と Vectorize Write です。
2. token を GitHub Environment `cloudflare-search-preview` の secret `CLOUDFLARE_SEARCH_PREVIEW_API_TOKEN` に保存します。
3. 変更を `main` に取り込み、GitHub Actions の `Sync Vectorize search index` を `target=preview` で手動実行します。
4. workflow の corpus 件数、upsert / delete 件数、mutation 完了を確認します。
5. Cloudflare Pages の Preview deployment で Pagefind、関連検索 API、レート制限、空結果、エラー時フォールバックを確認します。

## Production を有効にする

Production は Preview QA 完了後に、次をすべて満たしてから段階的に有効化します。

1. Production 用 Vectorize index `acecore-systems-search-production` を BGE-M3 / 1024 dimensions / cosine で作成します。
2. Production 用 D1 を作成し、検索レート制限 migration を適用します。
3. `wrangler.jsonc` の Production binding と `SEARCH_ENABLED=true` を設定し、GitHub 連携の Cloudflare Pages deployment が成功することを確認します。
4. GitHub Environment `cloudflare-search-production` を `main` 限定で作成し、最小権限 token を secret `CLOUDFLARE_SEARCH_PRODUCTION_API_TOKEN` に保存します。
5. repository variable `SYSTEMS_VECTORIZE_PRODUCTION_ENABLED=true` を設定します。この variable がない、または `true` 以外の場合、Production job は push / schedule / manual のすべてで skip します。
6. 手動同期と本番ブラウザ QAを完了してから、定期同期を運用します。

Production 同期は公開 build marker の commit が `main` の祖先であることを確認し、公開中の commit と同じ source から corpus を再生成します。GitHub repository 連携の Pages deployment を完了条件とし、Direct Upload や手動 deploy は使いません。
