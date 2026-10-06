---
title: "ユーザーCSSと公開テーマを安全に扱う：検証・版固定・停止の設計"
description: "CSS正本をGUIと直接編集で共有するプロフィール編集を一般化。Grid・Flex・レスポンシブ指定の描画境界、下書きと公開版、不変のテーマ版、掲載終了と運営停止を整理します。"
date: "2026-10-06T01:10:00+09:00"
lastUpdated: "2026-10-06T08:52:00+09:00"
author: gui
image: /images/insights/covers/user-css-versioned-theme-safety-cover-v1.webp
tags: ["CSS", "Security", "Web"]
callout:
  type: note
  title: "実装確認と利用者の通し検証を区別"
  text: "固定版テーマ配布のDB変更・本番配信・検証用データの表示は確認済みです。CSS正本とGUI共通編集の拡張はmain統合とCIまで確認し、この監査範囲では本番反映とログイン受入は未確認です。実利用者の投稿・適用や有料販売も実証していません。"
---

プロフィールの配色や余白をGUIで変え、CSSでレイアウト全体も編集できる仕組みには、画面の操作性と公開するコードの安全性の両方が必要です。匿名化した実装事例から、編集と配布の境界を整理します。

## CSS正本をGUIと直接編集で共有する

その後の拡張では、CSS全体をテーマの正本にし、GUIも同じCSSの対象宣言を書き換える構成にしました。手書きのコメント、GUIが扱わない宣言、レスポンシブ指定を保持します。従来のGUI設定と追加CSSを持つ形式も、編集可能なCSS全体へ引き継ぎます。補助的な一覧表示用の設定だけを変えて、描画CSSまで変わったことにはしません。

backendとfrontendの拡張は、それぞれのmainへ統合され、CIと実装テストを確認しました。これを、この監査範囲での本番反映やログイン利用者による通し検証の証明にはしません。

## 豊富なCSS構文を描画領域に閉じる

小さなプロパティ許可表による初期の制限を広げ、Grid・Flex、変数、グラデーション、疑似要素、変形、アニメーション、`@media`・`@supports`・`@container`などを扱います。一方、任意のCSSを検査せず挿入する構成にはしません。構文木を解析し、各セレクターの枝を決められたプロフィール領域の子孫へ閉じます。条件付きルールの中にも同じ境界を適用し、領域の外側の運営導線やライセンス表示はテーマの対象にしません。[W3C Selectors](https://www.w3.org/TR/selectors-4/)はセレクターの仕様を確認する入口です。

変数とkeyframes名は公開CSSで固有の名前へ変換し、外側UIの変数や別テーマのアニメーションとの干渉を避けます。原文の名前は編集用に保持します。外側の描画wrapperによるcontainmentとisolationも併用し、広いレイアウト指定の影響をプロフィール領域へ閉じます。

外部リソースの取得、`@import`・`@font-face`などのglobalなルール、解析不能な記述、CSS nesting、HTMLのstyle終端、名前を安全に確定できないアニメーション指定は拒否します。入力と生成後の容量も検査します。公開時とsnapshotの読込み時には、スコープ・固有名・検証済みcanonical文字列の一致を再確認します。広い構文への対応は、すべてのブラウザーで同じ表示になる保証ではありません。

## 試着・下書き・公開を分ける

テーマの試着や適用は下書きを変えます。公開ページは本人の公開操作まで変えません。手書きCSSを編集し直せることと、訪問者へその原文を渡すことも別です。保存の競合を検出し、同じ操作の再送で版や下書きを重複更新しない契約を使います。

## 他人の更新で利用中の見た目を変えない

配布テーマは変更できる一覧情報と、不変の版を分けます。利用者は版IDを指定して取り込み、作者が新版を出しても既存の下書きや公開版を勝手に変更しません。適用元と版、利用条件の出典は編集後も保持します。公開プロフィールが私的な状態に戻っても、作者の下書きの名前や画像がテーマ配布物へ漏れないようにします。

## 掲載終了と運営停止を分ける

作者による掲載終了は、新しい発見・適用を止めても、既存の固定版利用を直ちに失効させる操作とは限りません。一方、危険なテーマの運営停止では公開取得や既存snapshotのCSSを止め、標準の見た目へ戻す境界が必要です。古いsnapshotへ切り戻しても現在の停止状態を確認し、停止前のCSSを復活させない設計にします。

<figure class="article-diagram" data-layout="flow" data-tone="violet" data-count="3" aria-labelledby="diagram-user-css-versioned-theme-safety">
  <figcaption>
    <strong id="diagram-user-css-versioned-theme-safety">CSS編集から固定版公開まで</strong>
    <span>コード統合とCI、旧版Storeの本番配信は確認済み。新CSSの本番/ログイン受入、実利用者の適用、有料販売は未確認。</span>
  </figcaption>
  <ol class="article-diagram__nodes">
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">1</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="m8 6-5 6 5 6M16 6l5 6-5 6M14 4l-4 16"/></svg></span>
      <strong>共有CSS正本</strong>
      <span>GUIと直接編集が同じCSSを使い、手書きルールを保持。</span>
    </li>
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">2</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M8 8h8M8 12h5M8 16h8"/></svg></span>
      <strong>解析して領域を限定</strong>
      <span>Grid/Flex・変数・疑似要素・responsive/animationに対応。外部・global・解析不能な入力は拒否。</span>
    </li>
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">3</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/></svg></span>
      <strong>版を明示公開</strong>
      <span>preview/draft後にimmutable版を公開。掲載終了と運営停止を分ける。</span>
    </li>
  </ol>
</figure>

## 公開前に確かめること

範囲外セレクター、外部通信、入力容量、保存競合、再送、作者の非公開化、掲載終了、運営停止、切戻しを確認します。固定版配布の本番配信と検証用データの表示は確認済みですが、CSS編集拡張の本番反映・ログイン受入はこの監査範囲では未確認です。以前の確認時点の公開テーマは0件で、実際のテーマ投稿と他利用者による適用を一連で試したことや、現在の公開数を示すものではありません。利用条件を設けても、ブラウザーへ届いたCSSの完全なコピー防止を保証するものではありません。

編集の入力側は[プロフィール情報の下書き取込](/insights/profile-import-draft-boundaries/)、CMS運用は[Sveltia CMS導入ガイド](/insights/cms-selection-and-turnstile/)と合わせて読めます。
