---
title: "複数リポジトリへのCloudflare Vectorize導入で得た実践ノウハウ"
description: "Cloudflare Vectorizeを複数のAstro／Cloudflare Pagesサイトへ導入・試行した記録から、Pagefindとの役割分担、公開HTMLからのcorpus生成、安全な差分同期、Preview／Production分離、API防御、検証ゲートまでを整理します。"
date: 2026-07-31T12:00
author: gui
tags: ["技術", "Cloudflare", "Vectorize", "OpenAI", "サイト内検索"]
image: /uploads/acecore-generated/blog-cloudflare-pages-security.webp
callout:
  type: tip
  title: 検索はfail-soft、同期と公開はfail-closed
  text: "利用者向け検索ではVectorizeが失敗してもPagefindを残します。一方、index同期と本番公開は、対象環境、corpus、削除率、公開commit、mutation完了を確認できなければ停止します。この非対称な設計が、複数サイトへ横展開したときに最も効きました。"
processFigure:
  eyebrow: Vectorize rollout
  title: 公開HTMLから本番indexまでの流れ
  description: "編集sourceを直接投入せず、実際に公開されるHTMLとデプロイ済みcommitを同期の基準にします。"
  variant: inline
  steps:
    - title: 公開HTMLをbuildする
      description: "canonical、locale、noindexを反映した静的HTMLを生成する。"
      icon: i-lucide-file-code-2
      accent: slate
    - title: corpusを決定論的に作る
      description: "本文をchunk化し、content hash由来のIDと監査用metadataを付ける。"
      icon: i-lucide-boxes
      accent: brand
    - title: Previewで同期する
      description: "専用indexとtokenでupsertし、API、空結果、fallback、rate limitを確認する。"
      icon: i-lucide-flask-conical
      accent: amber
    - title: 公開commitを本番へ同期する
      description: "build markerとcorpus versionを照合し、mutationの収束後にだけ有効化する。"
      icon: i-lucide-shield-check
      accent: emerald
compareTable:
  title: 検索機能と同期処理は、失敗時の方針を分ける
  before:
    label: すべてをVectorizeへ依存
    items:
      - "AI、Vectorize、D1のどれかが止まると、サイト内検索全体が使えなくなる"
      - "CMS原稿と公開ページの差が、そのまま検索結果の差になる"
      - "同期スクリプトの誤設定で、別環境や大量のvectorを変更できてしまう"
      - "コードがmergeされた時点で導入完了と判断しやすい"
  after:
    label: fail-soft検索＋fail-closed同期
    items:
      - "通常検索はPagefind、意味検索は明示操作で呼ぶ補助機能にする"
      - "corpusは公開HTMLから作り、canonical、noindex、localeを反映する"
      - "環境allowlist、削除率、公開commit、mutation完了を同期前後で検証する"
      - "実装、ローカル検証、Preview、本番稼働を別の状態として記録する"
statBar:
  items:
    - value: "4 repos"
      label: 導入・試行記録を横断
      description: "本番、ローカル検証、Preview、事前調査を同じ扱いにせず比較しました。"
      icon: i-lucide-git-branch
    - value: "36 → 250"
      label: Systems本番初回同期
      description: "36件の日本語公開ページから250 vectorsを生成し、削除0件で同期しました。"
      icon: i-lucide-database
    - value: "72 → 134"
      label: World Foundationローカル検証
      description: "72 sourcesから134 vectorsを生成しましたが、本番公開前の状態として記録しました。"
      icon: i-lucide-test-tube-2
    - value: "37 tests"
      label: 検索契約の検証
      description: "World Foundationでは検索、corpus、同期の契約テスト37件を通しました。"
      icon: i-lucide-badge-check
checklist:
  title: 次のリポジトリへ導入する前の確認
  items:
    - text: "既存のキーワード検索を残し、Vectorizeの停止時にも検索導線を保つ"
      checked: true
    - text: "embedding modelの実出力とindexのdimensions／metricを照合する"
      checked: true
    - text: "公開HTMLからcorpusを生成し、noindex、外部canonical、管理画面を除外する"
      checked: true
    - text: "content hash由来のIDで変更のないchunkを再embeddingしない"
      checked: true
    - text: "PreviewとProductionのindex、binding、token、承認境界を分離する"
      checked: true
    - text: "upsert完了を確認してからdeleteし、大量削除には明示承認を要求する"
      checked: true
    - text: "検索APIにbody、query、locale、origin、rate limit、kill switchを設ける"
      checked: true
    - text: "公開commitとcorpus versionが一致するデプロイだけを本番同期する"
      checked: true
    - text: "実装済み、検証済み、Preview確認済み、本番稼働中を分けて記録する"
      checked: true
linkCards:
  - href: https://developers.cloudflare.com/vectorize/
    title: Cloudflare Vectorize公式ドキュメント
    description: "index、binding、query、metadata filteringの現行仕様を確認できます。"
    icon: i-lucide-book-open
  - href: https://developers.cloudflare.com/vectorize/platform/limits/
    title: Vectorizeの現行limits
    description: "batch、topK、metadata、vector数の上限は変更されるため、実装時に再確認します。"
    icon: i-lucide-gauge
  - href: /insights/astro-cloudflare-site-architecture/
    title: Astro＋Cloudflareサイトの全体設計
    description: "静的HTML、Pages Functions、D1、検索をどのレイヤーへ置くか整理した記事です。"
    icon: i-lucide-layers-3
faq:
  title: よくある質問
  items:
    - question: Vectorizeを入れたらPagefindは不要ですか？
      answer: "不要にはしませんでした。Pagefindは静的HTMLから作れる低依存の通常検索、Vectorizeは言い換えや関連概念を探す補助検索として役割を分けています。AIやVectorizeが失敗しても通常検索を残せます。"
    - question: Vectorize導入にはD1やR2が必須ですか？
      answer: "必須ではありません。SystemsではD1を検索APIのrate limitに使いましたが、Vectorize自体の必須保存先ではありません。原文の置き場所も、公開HTML、JSON、D1、R2など要件に応じて決めます。"
    - question: 現行実装のembedding modelとdimensionsはどう管理しますか？
      answer: "現行のAcecore SystemsはOpenAIのtext-embedding-3-largeを1,536 dimensions／cosineで使います。旧BGE-M3の1,024 dimensions indexはrollback用に保持し、異なるdimensionsのvectorを同じindexへ混在させません。index設定は作成後に変更できないため、導入時の公式仕様と実際の出力shapeを確認してから作成します。"
    - question: どの時点で導入完了と判断しますか？
      answer: "mergeやローカルtestだけでは完了にしません。Previewの実問い合わせ、公開commitとcorpusの一致、本番index同期、mutation収束、Pagefind fallback、rate limit、停止手順まで確認して本番稼働と記録します。"
---

Cloudflare Vectorizeを複数のリポジトリへ導入・試行すると、単に「embeddingを作って `query()` する」だけでは足りないことが分かります。

検索対象をどう作るか、既存検索をどう残すか、PreviewとProductionをどう分離するか、誤った同期で大量削除しないか、公開中のページとindexが本当に一致しているか。実運用では、VectorizeのAPI呼び出しよりも、その前後の設計が重要でした。

この記事では、Acecore Systems、World Foundation、Acecore Schools、Aceserver Portalで記録した導入・調査結果を横断し、別のAstro／Cloudflare Pagesサイトにも再利用できる形へ整理します。

## 結論：検索はfail-soft、同期と公開はfail-closed

最も再利用しやすかった原則は、利用者向け検索と運用者向け同期で、失敗時の方針を分けることです。

| 対象               | 失敗時の方針 | 理由                                                           |
| ------------------ | ------------ | -------------------------------------------------------------- |
| 通常のサイト内検索 | fail-soft    | Vectorizeが止まってもPagefindで検索を続ける                    |
| 関連検索API        | fail-soft    | エラーを短時間で閉じ、通常検索の結果を壊さない                 |
| corpus生成         | fail-closed  | 対象ページ、locale、件数、metadataが不正なら作らない           |
| index同期          | fail-closed  | 対象環境、既存ID、削除率、mutationを確認できなければ変更しない |
| 本番有効化         | fail-closed  | Preview QAと公開commitの一致を確認してから有効にする           |

「AI検索が落ちてもサイト検索は使える」ことと、「同期処理は疑わしければ1件も変更しない」ことを同時に満たします。

## 4つのリポジトリで確認した状態

導入記録を記事にするときは、すべてを「導入済み」とまとめないことも重要です。今回の記録には、本番稼働、ローカル検証、Preview資源の準備、事前調査が混在していました。

| リポジトリ       | 記録・確認できた状態                                                                         | 得られた知見                                                                     |
| ---------------- | -------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| Acecore Systems  | OpenAI 1,536 dimensions indexをPreview／Productionで稼働。各256 vectors同期・既知queryを確認 | Pagefindとの併用、公開HTML corpus、D1 rate limit、安全なProduction同期と次元移行 |
| Aceserver Portal | Acecore情報のVectorize検索を本番確認                                                         | 企業情報とWIKIルール検索の検索先を混ぜない                                       |
| World Foundation | 72 sources／134 vectorsをローカル生成し、37 tests成功。未公開                                | content hash、fail-closed同期、公開前ゲートの分離                                |
| Acecore Schools  | 既存構成の調査まで。index作成・実装は未着手                                                  | bindingを足す前にAPI、corpus、権限、環境構成を決める                             |

Acecore Systemsでは、[導入PR #40](https://github.com/acecore-systems/acecore-systems/pull/40)、[本番準備PR #41](https://github.com/acecore-systems/acecore-systems/pull/41)、[本番有効化PR #42](https://github.com/acecore-systems/acecore-systems/pull/42) の3段階に分けました。その後の[OpenAI直接接続への移行PR #43](https://github.com/acecore-systems/acecore-systems/pull/43)では、異なるdimensionsのvectorを混在させず、1,536 dimensions用indexを別名で準備しています。[有効化PR #44](https://github.com/acecore-systems/acecore-systems/pull/44)ではPreview／Productionへ各256 vectorsを同期し、既知queryとPagefind fallbackを確認した後に関連検索を有効化しました。

旧BGE-M3 indexへの初回Production同期の[GitHub Actions run](https://github.com/acecore-systems/acecore-systems/actions/runs/30539728752)では、公開commitとcorpus versionを照合し、36件の日本語公開ページから250 vectorsを生成しました。同期結果はupsert 250件、delete 0件です。コードのmerge、indexの準備、初回同期、検索有効化を別の変更にしたことで、各段階の停止条件を明確にできました。

## Pagefindを置き換えず、役割を分ける

Vectorizeを入れる目的は、既存の検索を捨てることではありませんでした。

Pagefindはbuild済みHTMLから静的indexを作り、ブラウザ内で検索できます。商品名、サービス名、固有名詞のような明示的な語句を探す通常検索として扱いやすく、embedding providerやVectorizeの状態に依存しません。

Vectorizeは、検索語が本文と完全一致しない場合や、関連する概念からページを見つけたい場合に向いています。ただし、embedding生成とVectorize queryが必要になり、外部サービスの遅延、エラー、利用量も考慮する必要があります。

そこでUIも分けました。

1. 入力中はPagefindの候補を表示する
2. 利用者が明示的に関連検索を実行した場合だけAPIを呼ぶ
3. APIには短いtimeoutを設ける
4. APIが失敗してもPagefindの結果を消さない
5. kill switchで関連検索だけを停止できるようにする

この構成なら、Vectorizeは検索体験を広げますが、検索全体の単一障害点にはなりません。

## corpusはCMS原稿ではなく公開HTMLから作る

複数サイトで特に差が出たのは、何を検索対象の正とするかです。

CMS原稿やMarkdownを直接corpusにすると、実際の公開ページとの差が生まれます。

- `draft` や `noindex` の内容が混ざる
- 外部canonicalへ向けたページが残る
- layout由来の重複文言や管理UIが混ざる
- 変換後にだけ現れるtitle、description、URLを反映できない
- 多言語サイトでlocaleの境界が曖昧になる

そこで、Astroのbuild後に生成されたHTMLを読み、公開条件を反映してからcorpusを作りました。

Acecore Systemsでは、次の条件を満たす日本語ページだけを対象にしています。

- same-originのcanonicalを持つ
- `lang` が日本語である
- `noindex` ではない
- `/admin`、`/api`、404、送信完了ページではない
- `data-vectorize-ignore` やナビゲーションなどの非本文要素を除外できる
- 公開root-relative URLとtitleを持つ

本文は目標850文字、最大1,200文字、overlap 120文字でchunk化しました。この値は万能な正解ではなく、今回のページ長と日本語本文で採用した運用値です。別サイトでは、実際の文書構造と検索評価を見て調整します。

## content hashで差分同期を決定論的にする

vector IDを連番や実行時UUIDにすると、同じcorpusを再生成しても全件が別IDになります。これでは変更のない本文まで再embeddingし、古いIDの大量削除も必要になります。

そこで、locale、公開URL、chunk番号、本文からSHA-256を作り、IDとcorpus versionを決定論的に生成しました。

```js
const identity = [locale, url, String(chunkIndex), text].join("\u001f");
const digest = sha256(identity);

const vector = {
  id: `v1-${digest.slice(0, 48)}`,
  text,
  metadata: {
    locale,
    url,
    chunkIndex,
    contentHash: digest,
  },
};
```

同期時は、期待するIDと現在のindex IDを比較します。

- 期待側にだけあるIDをembeddingしてupsertする
- 両方にあるIDは変更なしとしてskipする
- index側にだけあるIDを削除候補にする
- `v1-` 管理外のIDが混ざっていればmutation前に停止する

これにより、同じ公開内容からは同じcorpusができ、差分の理由を説明しやすくなります。

## embedding modelとindex設定を契約として固定する

導入初期の記録では、Workers AIの [`@cf/baai/bge-m3`](https://developers.cloudflare.com/workers-ai/models/bge-m3/) を使い、実際の出力shapeを確認したうえで、1,024 dimensions／cosineへ統一しました。その後のAcecore Systemsの現行実装では、[OpenAI Embeddings](https://platform.openai.com/docs/guides/embeddings) の `text-embedding-3-large` を1,536 dimensions／cosineで使い、移行先indexを別名で作成しました。Preview／Productionとも256 vectorsを同期して稼働させ、旧BGE-M3 indexはrollback用に保持しています。異なるdimensionsのvectorを同じindexに混在させません。

重要なのはモデル名そのものより、次の4か所を同じ契約にすることです。

| 場所            | 固定する値                    |
| --------------- | ----------------------------- |
| corpus metadata | model、dimensions、metric     |
| Vectorize index | dimensions、metric            |
| 検索API         | model、embedding length       |
| 同期スクリプト  | 許可model、dimensions、metric |

Cloudflareの[Create indexes](https://developers.cloudflare.com/vectorize/best-practices/create-indexes/)にもある通り、indexのdimensionsとmetricは作成後に変更できません。モデルの資料が曖昧な場合は推測でindexを作らず、現行ドキュメントと実出力を確認します。

metadata filteringを使う場合は、vector投入前にmetadata indexを作ります。先に投入したvectorは、後からmetadata indexを追加しただけでは対象にならず、再upsertが必要です。

また、製品limitsは変わります。2026年7月30日時点のVectorize V2では、Workers APIのupsert batch上限は1,000、HTTP APIは5,000です。通常の `topK` 上限は100で、`returnValues: true` または `returnMetadata: "all"` の場合は50です。実装時は必ず[現行limits](https://developers.cloudflare.com/vectorize/platform/limits/)と[client API](https://developers.cloudflare.com/vectorize/reference/client-api/)を再確認します。

Acecore Systemsの同期はHTTP APIで200件ずつ、検索は `topK: 15` としており、製品上限をそのまま処理件数にはしていません。上限値と、自分たちが安全に再試行・監視できるbatch値は分けて決めます。

## 同期はupsertして収束を待ち、それからdeleteする

Vectorizeのinsert、upsert、deleteは非同期です。APIが成功しただけでは、その変更がqueryへ反映されたとは限りません。

安全な同期は次の順にしました。

1. corpusとindex設定を検証する
2. 現在の全vector IDをpaginationで取得する
3. upsert対象とdelete候補を計算する
4. upsertをbatch実行する
5. 返された `mutationId` が `processedUpToMutation` へ到達するまで待つ
6. upsertが収束した後にdeleteを実行する
7. deleteのmutationも同様に収束確認する

Cloudflareの[Vectorize API](https://developers.cloudflare.com/vectorize/reference/client-api/)でもmutationが非同期であることが明記されています。固定秒数のsleepだけで済ませず、mutation IDを使って完了を確認します。

さらに、同期スクリプトには次の停止条件を入れました。

- 同期先index名がPreview／Productionのallowlist外
- Production indexを同期処理から自動作成しようとした
- `--confirm-production` の値が対象index名と一致しない
- dimensions／metricが契約と異なる
- corpusのlocale、URL、metadata、content hashが不正
- source page数またはvector数が想定上限を超える
- 管理対象外IDが既存indexに混在する
- 既存vectorの20%を超える削除になる
- retry上限またはmutation待機時間を超える

大量削除が意図した変更の場合だけ、手動実行で明示的にoverrideします。通常のpushやscheduleでは許可しません。

## PreviewとProductionは名前だけでなく権限も分ける

環境分離では、bindingのindex名だけを変えるのでは不十分でした。

分ける対象は次の通りです。

- Vectorize index
- D1などの補助リソース
- Wrangler environment
- API token
- GitHub Environment
- 同期workflowのconcurrency
- 有効化用のrepository variable
- kill switch

同期tokenは、対象Cloudflare accountのVectorize Read / Writeに絞り、OpenAI API keyとは分離しました。Productionは保護された `main` からだけ実行し、GitHub Environmentのreviewerを通します。

ここには運用上のtrade-offもあります。Production Environmentにrequired reviewerを付けると、scheduleから起動した同期も承認待ちになる場合があります。初回公開だけ承認するのか、定期同期も毎回承認するのか、別jobへ分けるのかを、cronを追加する前に決める必要があります。

## 「公開中のcommit」と同じcorpusだけを本番同期する

GitHubの `main` と、現在Cloudflare Pagesで公開されているcommitは常に同じとは限りません。push直後はbuild中かもしれず、deploymentが失敗して前のcommitが公開されたままかもしれません。

そのため、Production同期では公開サイトにbuild markerを置き、次を確認しました。

- markerのcommitが40文字のGit SHAである
- そのcommitがrepositoryに存在する
- 保護された `main` の祖先である
- そのcommitをcheckoutしてcorpusを再生成できる
- markerのcorpus versionと再生成結果が一致する
- mutation直前にも同じcommitが公開中である

完了条件は、GitHub repository連携のCloudflare Pages deploymentです。手元やDirect Uploadで一時的に公開した成果物を、本番同期の基準にはしません。

これにより、「新しいcorpusを古いサイトへ同期する」「deploymentに失敗したcommitの内容だけ検索結果へ出す」といったズレを防げます。

## 公開検索APIにはコストとプライバシーの境界を置く

検索APIは、入力された文字列をembedding providerへ送る公開endpointです。検索精度だけでなく、乱用、課金、ログ、返却URLを設計対象にします。

Acecore Systemsでは、次の境界を実装しました。

| 項目         | 実装例                                                  |
| ------------ | ------------------------------------------------------- |
| method／形式 | same-originのJSON POSTだけを受理                        |
| body         | 2KiBまで。`Content-Length` がなくてもstream読取中に停止 |
| query        | NFKC正規化後2〜160文字                                  |
| locale       | `ja` のみ                                               |
| rate limit   | D1固定窓でclient 20回／分、global 300回／分             |
| 停止         | `SEARCH_ENABLED` で関連検索だけを停止                   |
| query        | raw queryをログ、corpus、Vectorize metadataへ保存しない |
| 結果URL      | same-originの公開root-relative URLだけを許可            |
| エラー       | 段階別の構造化codeを返し、本文をログへ出さない          |

client側のUUIDだけでは、利用者が変更できるため強い課金境界にはなりません。Cloudflare接続情報から作るclient key、global limit、利用量監視を組み合わせます。規模や脅威に応じてTurnstile、WAF、Durable Objectsなども検討します。

D1はこの構成でrate limitに使っていますが、Vectorize導入の必須要件ではありません。R2も同様です。原文をどこから取得するか、rate limitをどこで持つかに応じて選びます。

## 検索先の責務を混ぜない

Aceserver Portalでは、Acecoreのサービス情報と、Minecraftサーバーのルール・手順で検索先を分けました。

- Acecoreに関する質問はVectorizeで検索する
- サーバールールは公式WIKIを検索する
- Vectorizeが失敗しても、無関係なWIKI回答へfallbackしない
- 根拠として選ばれたWIKI記事だけをリンクする
- WIKIで確認できない規則は推測しない

これはRAGや案内チャットでも重要です。検索できる場所を増やすほど、どの質問をどの情報源へ送るか、情報がなかったときに何を答えないかを先に決めます。

## 実際に起きた失敗と、次に変えたこと

複数repoの記録から、再発しやすい問題を整理します。

| 症状                                     | 原因                                     | 次に行うこと                                                |
| ---------------------------------------- | ---------------------------------------- | ----------------------------------------------------------- |
| bindingを追加したが検索機能にならない    | API、corpus、再index、権限、UIが未設計   | index作成前に検索契約と運用フローを決める                   |
| index作成時にdimensionsを推測する        | モデル名だけを見て実出力を確認していない | 実際のembedding lengthを検査してから作る                    |
| metadata filterで既存vectorが出ない      | metadata indexより先に投入している       | metadata indexを先に作り、既存vectorを再upsertする          |
| 同期直後のqueryが不安定                  | mutationが非同期                         | `mutationId` とindex infoで収束を待つ                       |
| 大量の再embeddingとdeleteが出る          | vector IDが実行ごとに変わる              | content hash由来の決定論的IDにする                          |
| scheduleが進まずwaitingになる            | Production Environmentが承認を要求       | 定期同期と承認ポリシーを一緒に設計する                      |
| WindowsでtestやGitが失敗する             | `spawn EPERM`、lock、cacheなど環境要因   | baseline比較、Node version固定、fresh `npm ci` で切り分ける |
| APIがtimeoutしたのでコード不良と判断する | 一時障害、payload違い、provider遅延      | 正しいcontractで再試験し、単発結果と再現性を分ける          |

依存関係や実行環境の問題をVectorize変更へ誤帰属しないことも大切です。変更前のbaselineでも同じエラーが出るかを確認し、コード不良と環境不良を分けます。

## 「導入済み」を4段階に分けて記録する

記事や完了報告では、次の状態を分けると誤解が減ります。

| 状態             | 完了条件の例                                              |
| ---------------- | --------------------------------------------------------- |
| 実装済み         | API、corpus、同期スクリプト、UIがbranchにある             |
| ローカル検証済み | build、型検査、契約test、dry-runが成功した                |
| Preview確認済み  | Preview資源へ同期し、実問い合わせとfallbackを確認した     |
| 本番稼働中       | 公開commitを同期し、mutation収束、API、停止手順を確認した |

World Foundationはローカル検証まで成功しましたが、index、secret、deployment、browser QAが未完了だったため、本番済みとは記録しませんでした。Schoolsは調査段階です。

一方、Acecore Systemsは段階的なPR、Production初回同期、本番有効化、公開marker、実際の検索APIまで確認しました。

成功したtest数だけでなく、何がまだ未確認かを書くことが、次の担当者にとって最も有用な運用情報になります。

## 横展開するときの最小構成

別のAstro／Cloudflare Pagesサイトへ展開する場合、最小構成は次のようになります。

```txt
Astro build
  -> 公開HTML
  -> Pagefind index
  -> Vectorize corpus（locale / canonical / noindexを反映）

Cloudflare Pages Function
  -> input validation
  -> OpenAI Embeddings API
  -> Vectorize query
  -> 公開URLだけを返す

GitHub Actions
  -> 公開commitを解決
  -> corpusを再生成
  -> Preview / Productionを分離
  -> upsert収束後にdelete
  -> corpus versionを記録
```

最初からLLM回答生成まで入れる必要はありません。まず「関連するページを安全に返す」検索を作り、評価できる状態にします。回答生成を加える場合も、取得した原文、引用可能なURL、回答できない条件を別の契約として設計します。

## まとめ

Cloudflare Vectorizeの導入で難しいのは、nearest-neighbor queryそのものではありません。

何を公開情報としてindexするか、変更のないchunkをどう見分けるか、誤った同期をどう止めるか、公開中のcommitとどう一致させるか、障害時に通常検索をどう残すか。この運用設計が、複数repoへ横展開したときの品質を決めます。

今回の結論はシンプルです。

- Pagefindを主検索として残す
- Vectorizeは意味検索の補助にする
- corpusは公開HTMLから作る
- IDとversionをcontent hashで決定論的にする
- PreviewとProductionを資源・権限ごと分ける
- 検索はfail-soft、同期と公開はfail-closedにする
- 「実装」「検証」「Preview」「本番」を別の状態として記録する

この境界を先に作っておけば、Vectorizeを単発のAI機能ではなく、継続的に更新できる検索基盤として運用しやすくなります。
