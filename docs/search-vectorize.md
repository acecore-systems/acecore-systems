# Vectorize 検索の運用

Acecore Systems の検索は、ブラウザ内の Pagefind を通常検索として使い、利用者が明示的に実行した場合だけ OpenAI Embeddings API と Cloudflare Vectorize による関連検索を呼び出します。

## 現在の状態

- Production の関連検索は `SEARCH_ENABLED=true` で有効です。障害時は `wrangler.jsonc` の Production だけを `false` に戻して、GitHub 連携の Pages deployment で停止します。
- Production 用 Vectorize index は `acecore-systems-search-openai-1536-production`、モデルは `text-embedding-3-large`、`dimensions: 1536`、metric は cosine です。
- Production 初回同期は GitHub Actions run [30539728752](https://github.com/acecore-systems/acecore-systems/actions/runs/30539728752) で完了済みです。公開 commit `b03d4b145c6f21983806c629e9f555267f3eb355` と corpus version `2b36c3896e085be1dfbf` を照合し、36ページから250 vectorsを upsert、削除0件で完了しました。
- Production 用 D1 database `acecore-systems-search-production`（database ID `ac8a06c2-deb4-4b27-9fbc-0fa2eef3c76d`）は APAC に作成済みで、検索レート制限の migration を適用済みです。
- GitHub Environment `cloudflare-search-production` は、`main` branch だけを許可し、required reviewer と管理者 bypass 無効を設定済みです。
- Production 同期専用の Cloudflare account token は、Acecore account の Vectorize Read / Write だけを許可し、GitHub Environment secret に保存します。OpenAI keyとは共有しません。
- Preview 用 Vectorize index は `acecore-systems-search-openai-1536-preview`、モデルは `text-embedding-3-large`、`dimensions: 1536`、metric は cosine です。
- Preview 用 D1 database `acecore-systems-search-preview`（database ID `9346ee59-7cb7-4da1-9a00-7f75eee19f91`）は作成済みで、検索レート制限の migration を適用済みです。
- GitHub Environment `cloudflare-search-preview` は作成済みです。`main` branch だけを許可しています。
- Preview 同期専用の Cloudflare account token は、対象 account の Vectorize Read / Write だけを許可します。OpenAI project service-account keyはGitHub Environment secret `OPENAI_API_KEY`とPagesの暗号化secretへ保存します。

旧BGE-M3用1024次元indexはrollback用に保持し、新しい1536次元indexの同期とPreview QAが完了するまで削除しません。

サイト本文の raw query は corpus や Vectorize metadata に保存しません。同期 corpus は build output から公開対象の日本語ページだけを抽出し、`/admin`、`/api`、noindex、外部 canonical などを除外します。

## 同期の安全境界

`.github/workflows/sync-vectorize.yml` は、保護された `main` の tooling と site source だけを checkout して corpus を生成します。Preview 同期は `workflow_dispatch` から `target=preview` を選んだ場合だけ実行され、branch は `main` に限定されます。

同期スクリプトは次を fail closed で確認します。

- index 名、dimensions、metric が許可値と一致する
- corpus が日本語 1 locale で、公開 root-relative URL と必須 metadata を持つ
- 管理対象外の vector ID が index に混在していない
- source page と vector の上限を超えていない
- 既存 vector の 20% を超える削除を行わない
- Production 同期では index 名を含む `--confirm-production` が明示されている
- Production index が事前作成済みであり、同期処理から自動作成しない

各 vector は、検索時の分離に使う top-level `namespace` と監査用 metadata の `namespace` の両方へ `ja` を保存します。同じ ID の格納形式を修復する場合だけ `--refresh-existing` を明示すると、検証済み corpus の全件を再 embedding して upsert します。修復時に削除対象が1件でもあれば mutation 前に停止し、通常同期と分離します。

20% を超える削除が意図した変更である場合だけ、手動 workflow の `allow_large_delete=true` を指定します。通常の push / schedule では大規模削除を許可しません。

## Preview 同期を有効にする

1. 変更を `main` に取り込み、GitHub Actions の `Sync Vectorize search index` を `target=preview` で手動実行します。
2. workflow の corpus 件数、upsert / delete 件数、mutation 完了を確認します。
3. Cloudflare Pages の Preview deployment で Pagefind、関連検索 API、レート制限、空結果、エラー時フォールバックを確認します。

## Production を有効にする

Production は Preview QA 完了後に、次をすべて満たしてから段階的に有効化します。

1. Production 用 Vectorize index `acecore-systems-search-openai-1536-production` を 1536 dimensions / cosine で作成します。
2. Production 用 D1 を作成し、検索レート制限 migration を適用します。
3. GitHub Environment `cloudflare-search-production` を `main` 限定・required reviewer・管理者 bypass 無効で作成し、最小権限 token を secret `CLOUDFLARE_SEARCH_PRODUCTION_API_TOKEN`、Systems専用OpenAI keyを`OPENAI_API_KEY`に保存します。
4. `wrangler.jsonc` に Production binding を追加し、`SEARCH_ENABLED=false` のまま GitHub 連携の Cloudflare Pages deployment を成功させます。
5. repository variable `SYSTEMS_VECTORIZE_PRODUCTION_ENABLED=true` を設定します。この variable がない、または `true` 以外の場合、Production job は push / schedule / manual のすべてで skip します。
6. `target=production`、`allow_large_delete=false` で初回同期し、vector 件数、namespace、日本語 query を確認します。
7. `SEARCH_ENABLED=true` を別の変更として反映し、本番 API、Pagefind フォールバック、rate limit、停止手順を確認します。

Production 同期は公開 build marker の commit が `main` の祖先であることを確認し、公開中の commit と同じ source から corpus を再生成します。GitHub repository 連携の Pages deployment を完了条件とし、Direct Upload や手動 deploy は使いません。
