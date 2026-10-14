---
title: "プロフィール情報を下書きに取り込む：手編集と公開操作を守る設計"
description: "公開URL・テキスト・CSV・HTML・JSONからプロフィールを下書きへ取り込む設計。限定した画像・音声の取得、リンクの順序、再読失敗時の候補保持、本人の保存・公開を整理します。"
date: "2026-10-06T01:10:00+09:00"
lastUpdated: "2026-10-15T00:00:00+09:00"
author: gui
image: /images/insights/covers/profile-import-draft-boundaries-cover-v1.webp
tags: ["Web", "Import", "Security"]
callout:
  type: note
  title: "実装と実アカウントの受入を分ける"
  text: "入力ファイルに加え、限定した公開URLと画像・音声の取込を実装・統合・本番配信しています。合成データの操作と一部公開メディアの取得を確認しました。実本人の権利確認・保存・公開、公式ログイン連携、取得元の429解消は別の未完事項です。"
---

すでに書いたプロフィールを別の編集画面へ移すとき、現在の値と取込候補を見比べてから置き換える必要があります。匿名化した取込実装をもとに、取込と公開の境界を紹介します。

## 手編集を残せるか、自己紹介の一項目で試す

既存の自己紹介に手編集を加え、異なる文を含む入力から候補を作ります。項目を選ばなければ現値が残ること、選択時は置換を確認できること、取消後に元へ戻ることを順に試してください。適用後は下書きと公開ページを比べ、取込だけで公開が変わらないか確認します。

[OWASP：入力形式・値・長さの検証](https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html)

## 対応する入力形式を先に決める

テキスト、CSV、静的HTML、共通JSONの読込みとひな形に加え、対応した公開プロフィールURLから候補を取得します。HTMLは入力データとして解析し、scriptや元のHTMLを公開画面で実行しません。文字数・件数・形式・HTTPSリンクを検査します。

リンクは出現順に読み、URL内部の対応する括弧を保持します。Markdown内のURLを二重に拾わず、別の位置に再掲された同じURLは独立した候補として残します。取り込んだ順序や重複を、本人の判断なしに整理しません。

## 候補のプレビューと本人の編集を分ける

解析した結果をすぐ公開せず、現在の値と候補を比較します。本人が項目ごとに選び、必要なら候補の値を編集してから編集画面へ反映します。選んだ項目は現在の値を置き換えるため、再取込時も差分を確認する必要があります。適用の取消もできます。既存値の比較と取消は、別の画面や利用者による編集を含むすべての競合を自動解決する保証ではありません。

同じURLやファイルの再読込みに失敗した場合は、前回の候補、本人の編集、選択、CSV列の対応、取得済みメディアを保持します。取得エラーと「前回の候補」であることを表示し、新しい取得成功と混同させません。入力元・方式・本文・ファイルを変えたとき、または再読込みに成功したときに候補を入れ替えます。保持だけで反映・保存・公開はしません。

## URL自動取得と公式連携を区別する

公開URLの取得はプロフカード、lit.link、POTOFU、html名刺、foriioの既知の公開構造に限定します。元ページの本人情報、検索除外指定、取得候補の一致を確認し、認証が必要なページや不許可の取得先へ広げません。これは各サービスとの公式ログイン・API連携や、プロフィール全体の完全移行を意味しません。

共通JSONのひな形とサービス別の対応表示は引き続き使えます。未対応URLや動的な内容は貼り付け・ファイル取込へ案内します。取得元の401・403・429などでは停止し、別のブラウザーやAPIで制限を回避しません。

[OWASP：URL取得先と転送を制限するSSRF対策](https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html)

## 画像・音声は取得した実体を確認して選ぶ

プロフィール画像のGIFに加え、既知のリンクカードや公開投稿にある作品画像・タイトルを候補へできます。本人リンク欄の許可したGitHub画像・WAV・MP3、公開Dropbox単一ファイルにも限定対応します。POTOFUの初期HTMLにある投稿カードは対象ですが、説明文・追加ページ・埋込みプレイヤー・foriioの作品一覧取得は完成範囲に含めません。

取得時に元ページと候補を再確認し、host・path・転送先、MIME・実体・容量・期限を検査します。取得した同じ画像や音声を本人が表示・試聴し、権利とタイトル・説明を確認して選びます。選択した添付だけを未保存の掲載項目へ加え、既存アップロード経路で準備した後に通常の保存へ進みます。保存時も所有者・プロフィール・メディア種別・ready状態を確認し、手入力と公開snapshotを保持します。

<figure class="article-diagram" data-layout="flow" data-tone="violet" data-count="4" aria-labelledby="diagram-profile-import-draft-boundaries">
  <figcaption>
    <strong id="diagram-profile-import-draft-boundaries">取得・選択・保存・公開の境界</strong>
    <span>再読失敗では前回候補を保持。取込だけで公開snapshotは変わりません。</span>
  </figcaption>
  <ol class="article-diagram__nodes">
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">1</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M5 3h10l4 4v14H5z"/><path d="M15 3v5h5M8 12h8M8 16h6"/></svg></span>
      <strong>限定した入力を読む</strong>
      <span>対応URL・形式と取得制約を検査。</span>
    </li>
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">2</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5M8 10l2 2 3-4"/></svg></span>
      <strong>候補を比較・選択</strong>
      <span>画像・音声を確認し、手編集を保持。</span>
    </li>
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">3</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/></svg></span>
      <strong>下書きを保存</strong>
      <span>選択項目と準備済み添付を通常保存。</span>
    </li>
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">4</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M6 4v6a3 3 0 0 0 3 3h6a3 3 0 0 1 3 3v4"/><path d="M18 4v3a3 3 0 0 1-3 3H9a3 3 0 0 0-3 3v7"/></svg></span>
      <strong>本人が公開</strong>
      <span>公開snapshotを別の操作で更新。</span>
    </li>
  </ol>
</figure>

## 入力から資格や権利を推定しない

自己紹介文や外部のページに含まれる表現だけで、資格、所属、カテゴリ、ライセンスを自動確定しません。候補として取り込める説明文と、本人確認や申請が必要な情報を分けます。外部の情報が新しくなっても、本人が確定したプロフィールを自動で公開更新しない設計にします。

## 保存と公開に別の判断を残す

取込候補の適用、下書きの保存、公開snapshotの更新は別の操作です。入力や保存の競合も受入で確認すべき項目で、保存に成功しただけで公開済みとはしません。関連リンクや公開カレンダーのURLも、公開される値を本人が確認し、本人用のメモを公開用データへ混ぜないようにします。

## 関連する更新：公開予定からHTTPSリンクを開く

取込とは別の編集機能として、公開カレンダーの予定にHTTPSリンクを設定する改修も反映しました。公開側では予定から指定先を新しいタブで直接開き、リンクが無い予定は操作できるリンクを作らず表示します。URLの形式、認証情報を含まないこと、入力長を検証し、リンクには `noopener noreferrer` を付け、新しいタブが開くことを読み上げ名にも含めます。

関連する入力画面では、コラボ可能枠の不要なタイトル欄と自分用メモ欄を整理しました。DB変更・CI・本番配信・検証用データの画面を確認していますが、本人がログインして実際の予定を保存・公開する受入は未確認です。

## 確認できたことと次の受入

限定URL・GIF・作品画像・音声の実装、CI、本番配信、合成データの編集・取消と一部公開ファイルの取得を確認しています。POTOFUの元プロフィールが429を返す問題は残り、公開CDNファイルの取得成功だけでプロフィール取得成功とはしません。実本人の権利確認から保存・公開までの通し受入は未実施です。確認日：2026年10月14日。

公開するCSSの境界は[ユーザーCSSと公開テーマの安全設計](/insights/user-css-versioned-theme-safety/)、ログインの境界は[複数サービスのセッション設計](/insights/multi-service-session-lifecycle/)も参照してください。
