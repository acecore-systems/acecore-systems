# Vectorize 検索の運用

Acecore Systems の検索は、ブラウザ内の Pagefind を通常検索として使い、利用者が明示的に実行した場合だけ OpenAI Embeddings API と Cloudflare Vectorize による関連検索を呼び出します。

## 現在の状態

- 通常の Pages Preview は Vectorize と D1 の binding を持たず、`SEARCH_ENABLED=false` のまま Pagefind だけを使います。
- Production の関連検索も `SEARCH_ENABLED=false` です。新しい1536次元indexの同期と検証が完了するまで有効化しません。
- Production 用 Vectorize index `acecore-systems-search-openai-1536-production` は、モデル `text-embedding-3-large`、`dimensions: 1536`、metric cosine用として作成済みですが、corpusはまだ同期していません。
- GitHub Actions run [30539728752](https://github.com/acecore-systems/acecore-systems/actions/runs/30539728752) の36ページ・250 vectorsという同期実績は、旧BGE-M3用1024次元index `acecore-systems-search-production` の証跡です。新しい1536次元indexの同期完了判定には使いません。
- Production 用 D1 database `acecore-systems-search-production`（database ID `ac8a06c2-deb4-4b27-9fbc-0fa2eef3c76d`）は APAC に作成済みで、検索レート制限の migration を適用済みです。
- GitHub Environment `cloudflare-search-production` は `main` branch だけを許可します。同期tokenとOpenAI keyはこのEnvironmentのsecretからだけ渡します。
- Production 同期専用のCloudflare account tokenは対象accountの `Vectorize Write` に限定し、OpenAI keyとは共有しません。
- 既存のPreview index、D1、GitHub Environment、secretはこの変更では削除しませんが、Pages runtimeとworkflowからは参照しません。

旧BGE-M3用1024次元indexはrollback用に保持し、新しい1536次元Production indexの同期と本番確認が完了するまで削除しません。

サイト本文の raw query は corpus や Vectorize metadata に保存しません。同期 corpus は build output から公開対象の日本語ページだけを抽出し、`/admin`、`/api`、noindex、外部 canonical などを除外します。

## 同期の安全境界

`.github/workflows/sync-vectorize.yml` はProduction専用です。保護された `main` のtoolingと、GitHub連携のPagesで公開中のcommitを照合し、その公開commitと同じsourceからcorpusを生成します。repository variable `SYSTEMS_VECTORIZE_PRODUCTION_ENABLED=true` と `main` branchの両方を満たさない場合は同期しません。

同期スクリプトは次を fail closed で確認します。

- 同期先が `acecore-systems-search-openai-1536-production` と完全一致する
- index のdimensionsとmetricが1536 / cosineである
- corpus が日本語 1 locale で、公開 root-relative URL と必須 metadata を持つ
- 管理対象外の vector ID が index に混在していない
- source page と vector の上限を超えていない
- 既存 vector の 20% を超える削除を行わない
- Production 同期では index 名を含む `--confirm-production` が明示されている
- Production index が事前作成済みであり、同期処理から自動作成しない

各 vector は、検索時の分離に使う top-level `namespace` と監査用 metadata の `namespace` の両方へ `ja` を保存します。同じ ID の格納形式を修復する場合だけ `--refresh-existing` を明示すると、検証済み corpus の全件を再 embedding して upsert します。修復時に削除対象が1件でもあれば mutation 前に停止し、通常同期と分離します。

20% を超える削除が意図した変更である場合だけ、手動 workflow の `allow_large_delete=true` を指定します。通常の push / schedule では大規模削除を許可しません。

## Production を二段階で有効にする

空のindexを本番検索へ接続しないため、同期と検索有効化を分離します。

1. Production 用 Vectorize index `acecore-systems-search-openai-1536-production` を 1536 dimensions / cosine で作成します。
2. Production 用 D1 を作成し、検索レート制限 migration を適用します。
3. GitHub Environment `cloudflare-search-production` を `main` 限定で作成し、最小権限tokenを `CLOUDFLARE_SEARCH_PRODUCTION_API_TOKEN`、Systems専用OpenAI keyを `OPENAI_API_KEY` に保存します。
4. `wrangler.jsonc` に Production binding を追加し、`SEARCH_ENABLED=false` のまま GitHub 連携の Cloudflare Pages deployment を成功させます。
5. repository variable `SYSTEMS_VECTORIZE_PRODUCTION_ENABLED=true` を設定します。この variable がない、または `true` 以外の場合、Production job は push / schedule / manual のすべてで skip します。
6. Production workflowを実行し、初回同期のsource数・vector数・upsert/delete数・mutation完了を確認します。
7. 同じ公開commitでもう一度実行し、upsert/deleteが0件へ収束すること、`ja` namespace、embedding設定、既知の日本語queryを確認します。
8. `SEARCH_ENABLED=true` を別の変更として反映し、本番 API、Pagefind フォールバック、rate limit、停止手順を確認します。

Production 同期は公開 build marker の commit が `main` の祖先であることを確認し、公開中の commit と同じ source から corpus を再生成します。GitHub repository 連携の Pages deployment を完了条件とし、Direct Upload や手動 deploy は使いません。

PreviewではPagefind、関連検索APIが無効時のフォールバック、表示崩れがないことだけを確認します。Preview用Vectorize indexの同期やbindingは完了条件に含めません。
