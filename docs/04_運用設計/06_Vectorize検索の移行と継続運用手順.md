# Vectorize検索の移行と継続運用手順

種類: 手順書
状態: 有効
確認日: 未確認

Voyageへの移行の手順と、Productionの継続運用の手順、問題時の切り戻しを示す。

## 目的

該当なし

## 前提

該当なし

## 手順

### Voyageへの移行

`cloudflare-search-production` Environmentへ専用 `VOYAGE_API_KEY` を登録し、
`SYSTEMS_VOYAGE_SYNC_ENABLED=true` で候補索引の継続同期を有効にします。
既存の起動条件 `SYSTEMS_VECTORIZE_PRODUCTION_ENABLED=true` も必要です。
BGE同期は移行中は既定で維持し、共有検索などからの依存がなくなった後に
`SYSTEMS_BGE_SYNC_ENABLED=false` で停止できます。候補索引は事前に作成し、
公開corpusの同期・ID一致・代表検索を確認してからサイト検索を切り替えます。

### Production の継続運用

Production の自動同期は、次の条件と確認を維持します。

1. repository variable `SYSTEMS_VECTORIZE_PRODUCTION_ENABLED=true` と `main` branch の両方を満たす場合だけworkflowを実行します。
2. GitHub連携のPagesで公開中のcommitを照合し、そのcommitと同じsourceからcorpusを生成します。
3. source数・vector数・upsert/delete数・mutation完了を確認し、同じcorpusの再実行がupsert/delete 0件へ収束することを確認します。
4. `ja` namespace、1024 dimensions / cosine、既知の日本語queryを定期的に確認します。
5. 本番で異常があればProductionの `SEARCH_ENABLED=false` を反映して関連検索を停止し、Pagefindだけへ戻します。

Production 同期は公開 build marker の commit が `main` の祖先であることを確認し、公開中の commit と同じ source から corpus を再生成します。GitHub repository 連携の Pages deployment を完了条件とし、Direct Upload や手動 deploy は使いません。

PreviewではPagefind、関連検索APIが無効時のフォールバック、表示崩れがないことだけを確認します。Preview用Vectorize indexの同期やbindingは完了条件に含めません。

## 検証

該当なし

## 切り戻し

### Voyageへの移行の切り戻し

問題時はPagesのモデル・service binding・indexの変更をrevertしてBGEへ戻し、
Git連携deploymentと検索結果を確認します。旧索引は削除しません。

## 参照

- [Vectorize検索運用](02_Vectorize検索運用.md)
