---
title: "Cloudflare Vectorize実装ガイド：公開HTMLを安全に同期する"
description: "公開HTMLからcorpusを作り、Pagefindと併用しながらVectorizeを安全に同期・運用するための実装ガイドです。"
date: 2026-07-31T12:00
author: gui
tags: ["技術", "Cloudflare", "Vectorize", "OpenAI", "サイト内検索"]
image: /uploads/acecore-generated/blog-cloudflare-pages-security.webp
callout:
  type: tip
  title: Vectorizeは「意味で探す」ための検索基盤
  text: "キーワードが完全に一致しなくても、質問と近い意味を持つ公開ページを候補として返せるCloudflareのベクトルデータベースです。既存のキーワード検索を置き換えるのではなく、言い換えや関連情報の発見を補う用途で価値が出ます。"
processFigure:
  eyebrow: Vectorize rollout
  title: 公開HTMLから安全な関連検索までの流れ
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
    - title: PreviewのUIを確認する
      description: "意味検索は無効のまま、Pagefind候補、fallback、表示上の送信案内を確認する。"
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
      - "Production allowlist、削除率、公開commit、mutation完了を同期前後で検証する"
      - "実装、ローカル検証、PreviewのUI確認、本番稼働を別の状態として記録する"
statBar:
  items:
    - value: "意味で探す"
      label: キーワードの外も見つける
      description: "質問文や言い換えから、意図に近い公開ページを候補にできます。"
      icon: i-lucide-git-branch
    - value: "2つの検索"
      label: Pagefind＋Vectorize
      description: "通常検索を残したまま、必要なときだけ関連検索を加えられます。"
      icon: i-lucide-database
    - value: "公開HTML"
      label: 実際に見える内容を検索する
      description: "下書きではなく、利用者へ公開するページだけをcorpusにできます。"
      icon: i-lucide-test-tube-2
    - value: "段階導入"
      label: 小さく確認してから公開する
      description: "Previewで画面を確認し、Productionだけを同期対象にできます。"
      icon: i-lucide-badge-check
checklist:
  title: 次のサイトへ導入する前の確認
  items:
    - text: "既存のキーワード検索を残し、Vectorizeの停止時にも検索導線を保つ"
      checked: true
    - text: "embedding modelの実出力とindexのdimensions／metricを照合する"
      checked: true
    - text: "公開HTMLからcorpusを生成し、noindex、外部canonical、管理画面を除外する"
      checked: true
    - text: "content hash由来のIDで変更のないchunkを再embeddingしない"
      checked: true
    - text: "PreviewはPagefindだけにし、Vectorize／D1と同期権限はProductionへ限定する"
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
      answer: "必須ではありません。D1は検索APIのrate limit、R2は原文や生成物の保存に使えますが、Vectorize自体の必須保存先ではありません。公開HTML、JSON、D1、R2などから、要件に合う原文の置き場所を選びます。"
    - question: 現行実装のembedding modelとdimensionsはどう管理しますか？
      answer: "embedding model、dimensions、metricを一つの契約として管理します。モデルを変えるときは、実際の出力shapeを確認して別indexへ移行し、異なるdimensionsのvectorを同じindexへ混在させません。index設定は作成後に変更できないため、導入時に公式仕様と実出力を確認します。"
    - question: どの時点で導入完了と判断しますか？
      answer: "mergeやローカルtestだけでは完了にしません。PreviewではPagefindとUIのfallbackを確認し、Productionでは公開commitとcorpusの一致、本番index同期、mutation収束、関連検索、rate limit、停止手順まで確認して本番稼働と記録します。"
---

## まず理解したい：Cloudflare Vectorizeとは

Cloudflare Vectorizeは、文章・画像などから作った **embedding**（意味の特徴を数値列にしたもの）を保存し、入力と近い意味を持つ情報を探すCloudflareのベクトルデータベースです。[Cloudflareの公式概要](https://developers.cloudflare.com/vectorize/)が説明するように、意味検索、推薦、分類、将来のRAGの検索層に使えます。

通常のキーワード検索は、商品名、固有名詞、エラーコードのように「その語を含むページ」を素早く見つけるのが得意です。一方Vectorizeは、使われた単語が完全に同じでなくても、質問の意図に近い文章を候補にできます。たとえば「サイトを改善したい」という問いに対して、「継続的なWeb運用支援」や「技術顧問」のページを見つける、といった使い方です。

> Vectorizeは、単体で回答文を生成するチャットボットではありません。まず関連する公開ページとURLを選び出す検索基盤です。生成AIを後から組み合わせる場合も、この検索結果を根拠として扱えます。

## 導入すると何がよくなるか

- **言い換えや質問文から探せる**：利用者がサイト内の正式な用語を知らなくても、近い意図のページを見つけやすくなります。
- **関連する知識を横断できる**：カテゴリや表現が異なる記事・FAQ・サービス案内でも、内容の近さを手掛かりに候補を出せます。
- **既存の検索体験を補強できる**：キーワード検索を残したまま「関連情報を探す」操作だけに使えば、検索UIを大きく作り替えずに発見性を上げられます。
- **RAGや推薦へつなげられる**：元ページとURLを返す設計にしておけば、将来のAI回答、関連記事、コンテンツ推薦にも同じ検索層を再利用できます。

ただし、意味検索は魔法ではありません。検索品質は、公開対象を正しく選んだcorpus、embedding model、検索結果の評価に左右されます。完全一致が重要な商品名やコードを探す通常検索まで置き換えるものではありません。

## まずは既存検索に重ねる

最初の導入では、既存のキーワード検索を残し、利用者が明示的に「関連する情報を探す」ときだけVectorizeを呼ぶ構成が扱いやすくなります。

1. 商品名・固有名詞・短い語句はPagefindなどの通常検索で探す
2. 質問文・言い換え・関連テーマはVectorizeの関連検索で補う
3. embedding providerやVectorizeが失敗したときは通常検索をそのまま残す

ここまでが、導入を検討するときに先に判断したい価値と適用範囲です。以下では、Astro／Cloudflare Pagesをはじめとする静的サイトへ再利用しやすい、実装と運用の設計へ進みます。

> **最初に採用しやすい構成**：通常Pages Previewは `SEARCH_ENABLED=false` としてPagefindだけを使い、Vectorize／D1 bindingと自動同期はProductionだけに限定します。Previewでは検索画面とfallbackを確認し、本番では公開済みcommitから作ったcorpusだけを同期します。これにより、試験中の変更や権限を本番検索へ持ち込まずに済みます。

導入を計画すると、単に「embeddingを作って `query()` する」だけでは足りないことが分かります。検索対象をどう作るか、PreviewをPagefindだけに保ちつつProductionをどう守るか、誤った同期で大量削除しないか、公開中のページとindexが本当に一致しているか。実運用では、VectorizeのAPI呼び出しよりも、その前後の設計が重要です。

## 結論：検索はfail-soft、同期と公開はfail-closed

最も再利用しやすかった原則は、利用者向け検索と運用者向け同期で、失敗時の方針を分けることです。

| 対象               | 失敗時の方針 | 理由                                                                           |
| ------------------ | ------------ | ------------------------------------------------------------------------------ |
| 通常のサイト内検索 | fail-soft    | Vectorizeが止まってもPagefindで検索を続ける                                    |
| 関連検索API        | fail-soft    | エラーを短時間で閉じ、通常検索の結果を壊さない                                 |
| corpus生成         | fail-closed  | 対象ページ、locale、件数、metadataが不正なら作らない                           |
| index同期          | fail-closed  | 対象環境、既存ID、削除率、mutationを確認できなければ変更しない                 |
| 本番有効化         | fail-closed  | 公開commitとcorpusの一致、Production同期とmutation収束を確認してから有効にする |

「AI検索が落ちてもサイト検索は使える」ことと、「同期処理は疑わしければ1件も変更しない」ことを同時に満たします。

## 最初に決める4つのこと

Vectorizeを入れる前に、providerやindex名より先に次の4つを決めると、構成を選びやすくなります。

| 決めること   | はじめやすい選択                      | 理由                                             |
| ------------ | ------------------------------------- | ------------------------------------------------ |
| 利用者の目的 | 「関連するページを探す」              | いきなり回答生成まで作らず、検索品質を評価できる |
| 検索の入口   | 入力中はPagefind、明示操作でVectorize | 速度、費用、送信範囲を分かりやすく保てる         |
| corpusの正   | 公開済みHTML                          | 下書きや管理画面を検索結果へ混ぜない             |
| 公開の流れ   | PreviewでUI確認、Productionだけ同期   | 試験中の権限やデータを本番検索へ持ち込まない     |

この4つに答えられれば、embedding provider、D1、R2、回答生成の採用は、後から要件に合わせて選べます。

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

現行の検索モーダルでは、入力中の候補表示はブラウザ内のPagefindだけで行います。「検索する」を実行したときだけ、表示で明記したうえで検索語をOpenAI Embeddings APIへ送り、数値表現をVectorizeの公開情報と照合します。個人情報や機密情報を検索語に入れないよう案内し、この送信は通常のキーワード候補と混同しません。

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

日本語サイトで始めるなら、次の条件を満たすページだけを対象にすると扱いやすくなります。

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

embedding providerやmodelは、対象言語、検索品質、レイテンシ、費用で選びます。たとえば[OpenAI Embeddings](https://platform.openai.com/docs/guides/embeddings) の `text-embedding-3-large` を使うなら、実際の出力を確認し、1,536 dimensions／cosine用のindexを別名で作ります。modelを変えるときは新しい契約用のindexへ移行し、異なるdimensionsのvectorを同じindexに混在させません。

重要なのはモデル名そのものより、次の4か所を同じ契約にすることです。

| 場所            | 固定する値                    |
| --------------- | ----------------------------- |
| corpus metadata | model、dimensions、metric     |
| Vectorize index | dimensions、metric            |
| 検索API         | model、embedding length       |
| 同期スクリプト  | 許可model、dimensions、metric |

Cloudflareの[Create indexes](https://developers.cloudflare.com/vectorize/best-practices/create-indexes/)にもある通り、indexのdimensionsとmetricは作成後に変更できません。モデルの資料が曖昧な場合は推測でindexを作らず、現行ドキュメントと実出力を確認します。

metadata filteringを使う場合は、vector投入前にmetadata indexを作ります。先に投入したvectorは、後からmetadata indexを追加しただけでは対象にならず、再upsertが必要です。

また、製品limitsは変わります。2026年7月31日再確認時のVectorize V2では、Workers APIのupsert batch上限は1,000、HTTP APIは5,000です。通常の `topK` 上限は100で、`returnValues: true` または `returnMetadata: "all"` の場合は50です。実装時は必ず[現行limits](https://developers.cloudflare.com/vectorize/platform/limits/)と[client API](https://developers.cloudflare.com/vectorize/reference/client-api/)を再確認します。

同期のbatch数や検索の `topK` は、製品上限をそのまま使わず、再試行・監視できる小さな値から始めます。上限値と、自分たちが安全に運用できる処理件数は分けて決めます。

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

- 同期先index名がProduction indexの完全一致allowlist外
- Production indexを同期処理から自動作成しようとした
- `--confirm-production` の値が対象index名と一致しない
- dimensions／metricが契約と異なる
- corpusのlocale、URL、metadata、content hashが不正
- source page数またはvector数が想定上限を超える
- 管理対象外IDが既存indexに混在する
- 既存vectorの20%を超える削除になる
- retry上限またはmutation待機時間を超える

大量削除が意図した変更の場合も、通常workflowでoverrideせず、別途reviewした移行手順に切り分けます。通常のpushやscheduleでは許可しません。

## PreviewはPagefindだけにし、Productionだけを高権限の同期対象にする

導入初期にPreviewとProductionを分離して検証したことは、権限と停止条件を洗い出す助けになりました。一方、通常Pages PreviewにVectorize／D1 bindingを持たせる必要はありません。現行では `SEARCH_ENABLED=false` とし、PreviewはPagefindの候補表示、fallback、レイアウトを確認する場所です。Vectorize／D1 binding、同期token、Production Environmentは本番だけへ限定します。

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

たとえば、公開検索APIには次の境界を設けます。

| 項目         | 実装例                                                   |
| ------------ | -------------------------------------------------------- |
| method／形式 | same-originのJSON POSTだけを受理                         |
| body         | 2KiBまで。`Content-Length` がなくてもstream読取中に停止  |
| query        | NFKC正規化後2〜160文字                                   |
| locale       | `ja` のみ                                                |
| rate limit   | clientとglobalを分け、想定利用量と費用に合わせて制限する |
| 停止         | `SEARCH_ENABLED` で関連検索だけを停止                    |
| query        | raw queryをログ、corpus、Vectorize metadataへ保存しない  |
| 結果URL      | same-originの公開root-relative URLだけを許可             |
| エラー       | 段階別の構造化codeを返し、本文をログへ出さない           |

client側のUUIDだけでは、利用者が変更できるため強い課金境界にはなりません。Cloudflare接続情報から作るclient key、global limit、利用量監視を組み合わせます。規模や脅威に応じてTurnstile、WAF、Durable Objectsなども検討します。

D1はこの構成でrate limitに使っていますが、Vectorize導入の必須要件ではありません。R2も同様です。原文をどこから取得するか、rate limitをどこで持つかに応じて選びます。

## 関連検索と生成AIチャットを別の契約にする

関連検索は、利用者が明示操作した検索語をembeddingへ変換し、公開ページを近さで探す機能です。生成AIチャットは、質問や会話履歴をもとに回答を作る別の機能です。

両者を同じ「AI検索」として曖昧にしないことが重要です。送信するデータ、情報源、失敗時の表示、利用量、プライバシー説明を個別に設計し、関連検索のfallbackとして生成AIチャットへ勝手に送らないようにします。

## 検索先の責務を混ぜない

会社情報、サポート手順、規約、社内ナレッジのように、更新頻度や正確さが異なる情報源は検索先を分けます。

- 公開サイトの説明は、そのサイトの公開corpusだけを検索する
- 変更されやすい規約や手順は、公式の一次情報を検索する
- 関連検索が失敗しても、無関係な情報源へfallbackしない
- 根拠として選ばれたページだけをリンクする
- 情報源で確認できない内容は推測しない

これはRAGや案内チャットでも重要です。検索できる場所を増やすほど、どの質問をどの情報源へ送るか、情報がなかったときに何を答えないかを先に決めます。

## 実際に起きた失敗と、次に変えたこと

実装で再発しやすい問題を整理します。

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

| 状態             | 完了条件の例                                               |
| ---------------- | ---------------------------------------------------------- |
| 実装済み         | API、corpus、同期スクリプト、UIがbranchにある              |
| ローカル検証済み | build、型検査、契約test、dry-runが成功した                 |
| Preview確認済み  | Pagefindの候補、関連検索が使えない場合の表示、UIを確認した |
| 本番稼働中       | 公開commitを同期し、mutation収束、API、停止手順を確認した  |

この段階を完了報告やリリースノートでも分けて書けば、コードがあるだけの状態と、実際に安全に公開された状態を混同しません。

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
  -> Production indexだけをallowlistで同期
  -> upsert収束後にdelete
  -> corpus versionを記録

Pages Preview
  -> SEARCH_ENABLED=false
  -> Pagefindの候補とUI fallbackを確認
```

最初からLLM回答生成まで入れる必要はありません。まず「関連するページを安全に返す」検索を作り、評価できる状態にします。回答生成を加える場合も、取得した原文、引用可能なURL、回答できない条件を別の契約として設計します。

## まとめ

Cloudflare Vectorizeの導入で難しいのは、nearest-neighbor queryそのものではありません。

何を公開情報としてindexするか、変更のないchunkをどう見分けるか、誤った同期をどう止めるか、公開中のcommitとどう一致させるか、障害時に通常検索をどう残すか。この運用設計が、別のサイトへ展開したときの品質を決めます。

今回の結論はシンプルです。

- Pagefindを主検索として残す
- Vectorizeは意味検索の補助にする
- corpusは公開HTMLから作る
- IDとversionをcontent hashで決定論的にする
- PreviewはPagefindだけにし、Vectorize／D1と同期権限はProductionへ限定する
- 検索はfail-soft、同期と公開はfail-closedにする
- 「実装」「ローカル検証」「PreviewのUI確認」「本番」を別の状態として記録する

この境界を先に作っておけば、Vectorizeを単発のAI機能ではなく、継続的に更新できる検索基盤として運用しやすくなります。
