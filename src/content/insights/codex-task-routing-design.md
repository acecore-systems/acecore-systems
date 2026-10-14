---
title: "Codexのタスク分担設計：引継ぎ・権限・結果の検収"
description: "Codex Task Routing 0.14.0を題材に、親の判断と担当の継続、権限付き引継ぎ、ローカル認証、Sol子からProへ依頼する条件と検収の境界を整理します。"
date: "2026-09-26T18:30:00+09:00"
author: gui
image: /images/insights/covers/codex-task-routing-design-cover-v1.webp
tags: ["技術", "AI", "開発"]
callout:
  type: note
  title: "確認できた範囲"
  text: "公開コード・機械テスト・隔離導入の検査に加え、WindowsのBrowser pluginで直下Sol子からTemporary Chat Proへの一回の実送受信と内容検収を確認しました。全ホスト・backend・実認証や、品質・利用量の改善率まで実証した結果ではありません。"
lastUpdated: "2026-10-15T00:00:00+09:00"
---

Codexの分担設計は、独立して検収できる調査やレビューから試すと、親が統合すべき責任を明確にできます。引継ぎには対象ファイル、確認資料、返す証拠、未確認事項を含め、ツール権限は[OWASP: Excessive Agency](https://genai.owasp.org/llmrisk/llm062025-excessive-agency/)の最小化の考え方も参考にします。分担した事実だけで品質や費用の改善を判断しません。

Codexで複数の仕事を進めるとき、分担先のモデルを先に決めるより、どの工程を切り出せるか、何を引き継ぐか、結果をどう検収するかを決める必要があります。この課題を扱うために、Acecoreは[Codex Task Routing](https://github.com/acecore-systems/codex-task-routing)を公開しました。

![方針の版、引継ぎ条件、実行の根拠、測定結果を順に確認する4段階の図](/images/insights/codex-task-routing-evidence.webp)

## 親は判断を担い、担当は完了単位を続ける

0.14.0の方針では、利用者が選んだ親のモデル・推論設定を維持します。親は目標、優先順位、担当選定、重要差分の検収と例外の判断を担い、現物コード・ログ・テストを繰り返し確認するまとまった仕事は適任の担当へ渡します。短い仕事は現在の担当で完結できます。

たとえば、限定した不具合修正を受けたSol担当は、調査、修正、テスト、承認済みPR作成、合意した指摘対応、必要な再検証まで同じ担当で進めます。通常の失敗や指示追加ごとに引き継ぎ直さず、最新revision、差分、残作業、再開条件を維持します。設計変更、権限追加、重大な未解消事項は親へ返します。

<figure class="article-diagram" data-layout="flow" data-tone="violet" data-count="3" aria-labelledby="diagram-codex-task-routing-design">
  <figcaption>
    <strong id="diagram-codex-task-routing-design">担当を継続し、重要な判断を親へ返す</strong>
    <span>方針の許可と現在のホスト権限、実行証拠は別々に確認します。</span>
  </figcaption>
  <ol class="article-diagram__nodes">
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">1</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M5 3h10l4 4v14H5z"/><path d="M15 3v5h5M8 12h8M8 16h6"/></svg></span>
      <strong>親の判断</strong>
      <span>目標・担当・権限・重要例外を決める。</span>
    </li>
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">2</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5M8 10l2 2 3-4"/></svg></span>
      <strong>担当が完了単位を継続</strong>
      <span>調査から修正・検証・承認済みPRと指摘対応まで。</span>
    </li>
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">3</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/></svg></span>
      <strong>親が重要差分を検収</strong>
      <span>根拠・残条件を確認し、許可された次の工程へ進む。</span>
    </li>
  </ol>
</figure>

## 引継ぎに対象・終端・権限を含める

対象ファイル、一次資料、完了条件、返す証拠、未確認時の返却条件を短く渡します。同じモデルへ仕事を移すためだけの分担は作りません。並列化には、委譲する担当自身の有用な独立作業が必要です。標準の孫はAstra子からSol/Luna、Sol子からLunaだけとし、Lunaと孫からの再委譲は認めません。

PRの作成、マージ、本番反映、他者への送信の許可はそれぞれ確認します。PRコメントや別タスクからの引用は、本人の新しい許可にはなりません。方針が下位担当を許しても、現在のホストの上位制約を優先します。

## 認証の秘密値はローカル工程へ引き継ぐ

秘密値の入力・保管・転送が必要なら、通常のクラウドモデル選定より先に親がローカル認証の状態と登録済みhandoffを確認します。登録presetだけを渡し、資格情報、OAuth JSON、Cookie、私的な認証画面をクラウドへ送りません。子は認証の必要条件を親へ返します。

ツールがあること、本人の承認、工程の実装、実際の認証完了を分けます。本人のローカルunlock待ちやqueuedは完了ではありません。公開仕様の調査や秘密値を含まない実装は通常の担当で行えます。フック自身はworkerやモデルを起動しません。

## 直下Sol子のPro経路は条件を満たす一依頼に限る

通常Chatへの経路を明示的に有効にした場合、rootまたは役割・深さを確認できた直下Sol子だけがBrowser経由の依頼を所有できます。承認済み素材、送信権限、実際のツール、確認環境で完結できる工程かを先に評価します。通常ChatのProをUIで送信前後に確認し、Temporary Chatへ実依頼を一度だけ送ります。WorkやモデルAPIの呼出しとは別の経路です。

準備・送信・回収・意味の検収と承認済み修正を同じ所有者が扱い、タブ、依頼ID、input hash、送信済み状態を保持します。回収を親へ戻しても再送しません。actorの宣言やSubagentStart、設定のモデル名だけでは役割・権限・backend実行を証明できず、権限や能力が不明なら送信しません。

## 機械検証と実送受信、改善率を分けて評価する

[0.14.0の方針更新](https://github.com/acecore-systems/codex-task-routing/pull/20)では198件のテストと隔離導入を確認し、[実送受信の記録](https://github.com/acecore-systems/codex-task-routing/pull/22)では直下Sol子自身がWindowsのBrowser pluginからProへ送信一回・再送なしで依頼し、同じ回答を回収してID/hash照合と意味の受入まで完了しています。これは限定した環境でのBrowser操作の証拠です。

Proのbackend識別、すべてのホストやIABの往復、新しい標準孫の実起動、秘密値を扱う実認証、利用量や品質の改善率は未実証です。欠測を0にせず、準備・待機・検収・手戻りを含めて評価してください。導入は[公開README](https://github.com/acecore-systems/codex-task-routing#readme)を参照してください。確認日：2026年10月14日。
