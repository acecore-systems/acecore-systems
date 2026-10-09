---
title: "AI返信で果たせない約束を防ぐ：会話の文脈と送信前検査"
description: "案内用AIが担当者の参加・予定調整・連絡を勝手に約束しない設計。会話状態、参照取得失敗、古い下書きの再検査、終了時の扱いを整理します。"
date: "2026-10-06T01:10:00+09:00"
lastUpdated: "2026-10-09T15:00:00+09:00"
author: gui
image: /images/insights/covers/ai-reply-capability-guardrails-cover-v1.webp
tags: ["AI", "Security", "Web"]
callout:
  type: note
  title: "特定の会話を公開しない一般化した事例"
  text: "方針・分類・送信前検査の変更、テスト、配信と限定的な運用確認を題材にしています。相手の投稿やアカウントは掲載せず、すべての表現で誤約束を防げると保証するものではありません。"
---

問い合わせ案内やサポート返信に応用するなら、公開情報の説明、担当者への引継ぎ、実際の予約を別の能力として定義してください。許可する操作と承認の設計は[OWASP: Excessive Agency](https://genai.owasp.org/llmrisk/llm062025-excessive-agency/)が参考になります。以下は返信内容の境界に絞った説明で、個別媒体の自動送信手順ではありません。

案内用AIの返信が自然でも、『担当者があとで連絡する』『その時間に参加する』という行動を、実行できる根拠なしに約束してはいけません。社内の返信処理の見直しを、特定の媒体や会話を示さず一般化します。

## 案内できることと実行できることを定義する

公開情報の案内、相手の希望の確認、連絡や参加の実行は別の能力です。生成指示へ役割を明記し、同じ役割を初回・継続返信・送信前検査で使います。推論量を増やす設定だけでは、行動の権限や担当者の予定は得られません。

## 単語だけでなく会話状態を見る

元の投稿、確認できた直近のやり取り、案内済みか、質問に回答が必要か、会話が終わっているかを受け渡します。別の希望を述べている相手を、単語の一致だけで参加希望と分類しません。以前のAIが書いた誤った約束も、実行予定の証拠にはしません。

## 話者と意味を送信前に検査する

『スタッフが後で連絡します』と実行主体が約束する文、相手の発言の引用、一般的な参加先の案内は意味が違います。文字列だけを一律に禁止するのではなく、役割・会話状態・実行根拠を照合します。曖昧な場合は送信を保留し、必要なら人へ戻します。参照資料の取得失敗や不正な検索応答を、参照済みとして扱って生成を続行しない境界も必要です。この取得側の停止条件は修正コードとPRレビューで確認した範囲で、当該経路の本番稼働までは確認できていません。

## 似た言葉や募集の意味を取り違えない

募集する側の投稿と、参加を希望する側の発言を分けます。似た語句でも、対象の製品・エディション・利用条件を確認し、別の環境の案内を混ぜません。根拠のない謝意や参加扱いの返信も送信前のチェック対象です。返信を優先する処理でも、レート制限時の有限の待機と重複防止を設け、待機や見送りを送信成功として記録しません。

## 古い下書きも最新の条件で再検査する

生成時に通った下書きでも、その後に会話や方針が変わることがあります。実際の送信直前にも最新の状態で検査し、終了した会話の下書きを送信しないようにします。見送りや会話終了も監査状態へ反映し、送信成功の記録と区別します。不要な質問を足して会話を引き延ばすより、返信を省略することも扱います。

<figure class="article-diagram" data-layout="branches" data-tone="violet" data-count="3" aria-labelledby="diagram-ai-reply-capability-guardrails">
  <figcaption>
    <strong id="diagram-ai-reply-capability-guardrails">返信前に根拠と能力を確認</strong>
    <span>会話の文脈で回答と保留を分岐。取得停止の本番稼働は未確認です。</span>
  </figcaption>
  <ol class="article-diagram__nodes">
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">1</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M5 5h14v11H9l-4 4V5Z"/><path d="M8 9h8M8 12h5"/></svg></span>
      <strong>話者・要求を読む</strong>
      <span>募集か希望か、対象の版と会話状態を確認する。</span>
    </li>
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">2</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/></svg></span>
      <strong>根拠ある範囲で回答</strong>
      <span>実行できる内容だけ伝え、送信直前に再確認する。</span>
    </li>
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">3</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg></span>
      <strong>曖昧なら保留</strong>
      <span>取得失敗や不正応答は参照済みにせず人へ戻す。有限待機と重複抑止を適用する。</span>
    </li>
  </ol>
</figure>

## 確認した範囲と残る評価

この事例では分類と検査を修正し、回帰テスト、生成した下書きの確認、配信後の限定的な運用確認を行いました。すべての会話・言い換え・モデル変更に対する安全性の実証ではありません。外部への送信には、内容検査に加えて運用上の権限と承認も必要です。

検索入力の境界は[公開HTMLとVectorizeの安全な同期](/insights/cloudflare-vectorize-safe-implementation/)、表示の境界は[AI回答のMarkdownリンク安全描画](/insights/ai-chat-markdown-link-safety/)も参照してください。
