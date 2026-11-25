# Vectorize検索運用

種類: 仕様
状態: 有効
確認日: 未確認

公開サイトの検索（Vectorize、Pagefind）と関連サイト表示の仕組み、現在の設定、同期の安全境界を定める。

## 対象

Acecore Systems の検索は、利用者が明示的に実行した場合に Voyage 4 Lite と Cloudflare Vectorize で当サイトの公開情報を検索します。結果が取得できない場合だけ、ブラウザ内の Pagefind をキーワード検索のフォールバックとして使います。ローカル結果を表示した後は、Acecore共通検索APIの検証済み結果だけを「Acecore関連サイト」として下部へ追加表示します。

## 定義

### 現在の状態

- 通常の Pages Preview は Vectorize と D1 の binding を持たず、`SEARCH_ENABLED=false` のまま、サイト内検索はPagefindのフォールバックだけを使います。
- Production のサイト内検索は `SEARCH_ENABLED=true` で有効です。Pagefind はAPI障害、レート制限、無効化、または有効なVectorize結果がない場合だけ使います。
- Production 用 Vectorize index は `acecore-systems-search-voyage-4-lite-1024-production-v1`、モデルは `voyage-4-lite`、`dimensions: 1024`、metric は cosine です。query は共有Workerの `VoyageEmbedding` binding、文書同期はAtlasモデルAPIを使用します。
- 旧OpenAI index `acecore-systems-search-openai-1536-production` は即時rollback用に保持し、この移行では削除しません。過去の [GitHub Actions run 30599301122](https://github.com/acecore-systems/acecore-systems/actions/runs/30599301122) と [run 30600076505](https://github.com/acecore-systems/acecore-systems/actions/runs/30600076505) は旧indexの証跡であり、新indexの同期完了判定には使いません。
- Production 用 D1 database `acecore-systems-search-production`（database ID `ac8a06c2-deb4-4b27-9fbc-0fa2eef3c76d`）は APAC に作成済みで、検索レート制限の migration を適用済みです。
- GitHub Environment `cloudflare-search-production` は、`main` branch だけを許可し、required reviewer と管理者 bypass 無効を設定済みです。
- Production 同期専用の Cloudflare account token は、Acecore account の Workers AI Read と Vectorize Read / Write だけを許可し、GitHub Environment secret に保存します。検索同期にOpenAI keyは使用しません。
- 既存のPreview index、D1、GitHub Environment、secretはこの変更では削除しませんが、Pages runtimeとworkflowからは参照しません。

本番の検索クエリとVoyage索引への文書同期は、`config/ai-models.generated.json` の `search.embedding` を参照します。既存索引はVoyage 4 Lite・1,024次元です。配布設定が索引と互換性を満たさない場合は、埋め込みの送信前に停止します。モデルを変更する場合は、新しいモデルで文書を再埋め込みした索引を準備し、共有Workerと呼び出し元を合わせて切り替えます。公開コーパスの形式・IDとBGE-M3索引向けの同期には既存の契約を使います。

旧OpenAI用1536次元indexはrollback用に保持し、この移行では削除しません。

サイト本文の raw query は corpus や Vectorize metadata に保存しません。同期 corpus は build output から公開対象の日本語ページだけを抽出し、`/admin`、`/api`、noindex、外部 canonical などを除外します。

### Acecore関連サイトの補助表示

ローカルのVectorize検索（または必要時のPagefindフォールバック）を完了してから、ブラウザは
`https://acecore.net/api/network-search` へ同一の検索語と`locale: "ja"`だけをJSON POSTします。`site`や任意の取得元は送らず、呼び出し元は中央APIが`Origin`から確定します。

この補助表示はローカル検索を待たせず、中央APIの応答失敗、レート制限、timeout、空結果、または不正な応答では非表示のままです。クライアントは既存のsame-origin URL検証を変更せず、横断用の別検証で次だけを受け入れます。

- `ok: true`、UUID形式の`requestId`、有限の`rank`、title、section、excerpt、source、sourceLabel。sourceは`acecore`、`schools`、`wiki`、`portal`、`world-foundation`だけを受け入れ、sourceLabelも各sourceの固定表示名と一致する必要がある
- HTTPSかつsourceに対応する公式origin、query/hash、認証情報、private pathを持たないURL
- Systems自身を除いたAcecore、Schools、Aceserver WIKI、Aceserver Portal、World Foundationのallowlist

外部リンクには`noopener noreferrer`と`no-referrer`を付け、文字列はHTMLとして解釈せずtext nodeとして表示します。関連サイトのindexは中央APIがquery-onlyで読むだけであり、Systemsの同期workflowやVectorize削除権限を広げません。

## 制約

### 同期の安全境界

`.github/workflows/sync-vectorize.yml` はProduction専用です。保護された `main` のtoolingと、GitHub連携のPagesで公開中のcommitを照合し、その公開commitと同じsourceからcorpusを生成します。repository variable `SYSTEMS_VECTORIZE_PRODUCTION_ENABLED=true` と `main` branchの両方を満たさない場合は同期しません。

同期スクリプトは次を fail closed で確認します。

- 同期先がBGEまたはVoyageの許可済みProduction index名と完全一致する
- index のdimensionsとmetricが1024 / cosineである
- corpus が日本語 1 locale で、公開 root-relative URL と必須 metadata を持つ
- 管理対象外の vector ID が index に混在していない
- source page と vector の上限を超えていない
- 既存 vector の 20% を超える削除を行わない
- Production 同期では index 名を含む `--confirm-production` が明示されている
- Production index が事前作成済みであり、同期処理から自動作成しない

各 vector は、検索時の分離に使う top-level `namespace` と監査用 metadata の `namespace` の両方へ `ja` を保存します。同じ ID の格納形式を修復する場合だけ `--refresh-existing` を明示すると、検証済み corpus の全件を再 embedding して upsert します。修復時に削除対象が1件でもあれば mutation 前に停止し、通常同期と分離します。

GitHub Actionsから20%超削除のoverrideは指定できません。大規模なcorpus変更は通常同期と分離して
レビューし、専用の移行手順を用意するまでProduction mutationを停止します。

## 実装と検証の参照先

該当なし

## 参照

移行と継続運用の手順は [Vectorize検索の移行と継続運用手順](06_Vectorize検索の移行と継続運用手順.md) を参照する。
