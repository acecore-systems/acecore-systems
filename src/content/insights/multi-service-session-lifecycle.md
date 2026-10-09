---
title: "複数サービスのログイン期限を揃える：セッション更新と再認証の境界"
description: "複数のWebサービスでログイン期限を揃える設計。明示ログイン、サーバー側の期限、Cookie、認証基盤の設定を区別し、反映確認の範囲を整理します。"
date: "2026-09-30T13:37:47+00:00"
lastUpdated: "2026-10-09T15:00:00+09:00"
author: gui
image: /images/insights/covers/multi-service-session-lifecycle-cover-v1.webp
tags: ["Authentication", "Session", "Web"]
callout:
  type: note
  title: "社内事例を一般化"
  text: "複数サービスの期限ルールを統一した変更・本番反映の記録を題材にしています。具体的な期限や内部設定は掲載せず、全利用者の長期間の動作や安全性を保証するものではありません。"
---

同じアカウントを使うWebサービスでも、認証基盤と各サービスがログイン状態を保持する方法は同じとは限りません。複数サービスの期限ルールを揃えた社内作業を、個別の設定値を使わず設計原則として紹介します。

## 期限の直前と直後を同じ要求で比べる

検証環境で短い期限を用意し、明示ログイン、通常閲覧、背景更新を一つずつ実行して、サーバーが保持する期限の変化を比べます。期限切れ後は画面とAPIへ同じ操作を送り、再認証への案内とデータの拒否を確かめます。時刻を短縮した試験と長期間の実運用は分けて記録します。

[OWASP：セッション期限の設計と検証](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html)

## 何の期限かを先に決める

認証基盤のログイン状態、アプリのセッション、ブラウザーのCookieを別々に棚卸しします。絶対期限、無操作による期限、識別子の更新も異なるものです。識別子を新しくしただけで、有効期限まで延ばしてよいとは限りません。

## 明示ログインと通常アクセスを分ける

この事例では、明示的なログインの成功を更新の境界にし、通常の閲覧、背景通信、トークンの自動更新、識別子のローテーションだけで元の期限を延ばさない方針へ揃えました。ボタンを押したことやコールバックに到達したことだけを成功とせず、認証結果を検証して扱います。新しい認証を要求する場面では、既存の認証基盤のログイン状態を再利用するだけで要件を満たすかも別に確認します。

## 期限はサーバー側でも判定する

Cookieの保存期限を長くするだけでは、サーバーが受け付ける期間は決まりません。サーバー側の期限、失効状態、Cookie、認証基盤の制約が一致するかを確認します。ルールの統一は、Cookieを全サービスで共有することや、どこかでログアウトすれば全サービスから即時にログアウトできることを意味しません。

認証元の認証時刻・失効時刻を検証し、アプリ側の期限をその範囲内に制限します。共通化するのはセッション検証の契約であり、各サービスの業務権限はサービス側で判定します。独自のCookieを持つアクセスゲートウェイも、別の期限境界として棚卸しと監査の対象にします。

<figure class="article-diagram" data-layout="layers" data-tone="violet" data-count="3" aria-labelledby="diagram-multi-service-session-lifecycle">
  <figcaption>
    <strong id="diagram-multi-service-session-lifecycle">認証・セッション・業務権限を別の層として扱う</strong>
    <span>共通の期限ルールを使っても、各層は別の状態です。</span>
  </figcaption>
  <ol class="article-diagram__nodes">
    <li>
      <span class="article-diagram__symbol">
        <span aria-hidden="true">1</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z M4 21c.6-4 3.3-6 8-6s7.4 2 8 6"/></svg>
      </span>
      <strong>認証基盤とcallback</strong>
      <span>認証結果とcallbackのcontext/stateを検証します。ログインだけでアプリ権限は付きません。</span>
    </li>
    <li>
      <span class="article-diagram__symbol">
        <span aria-hidden="true">2</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M4 6h16v12H4z M8 10h8 M8 14h5"/></svg>
      </span>
      <strong>アプリ・Cookie・Gateway</strong>
      <span>サーバー側session、browser cookie、gateway sessionの期限と失効を個別に確認します。</span>
    </li>
    <li>
      <span class="article-diagram__symbol">
        <span aria-hidden="true">3</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M12 3 19 6v5c0 4.5-2.8 7.8-7 10-4.2-2.2-7-5.5-7-10V6l7-3Z M9 12l2 2 4-4"/></svg>
      </span>
      <strong>サービスごとの権限</strong>
      <span>権限は各アプリで判定します。通常アクセスや背景更新で期限は延びず、一括logoutも意味しません。</span>
    </li>
  </ol>
</figure>

## 設定の統一と動作の検証を分ける

設定・コードの監査と、ログイン成功、期限前後、期限切れからの再ログイン、ログアウトの動作確認を分けます。既存セッションへ新しいルールがいつ適用されるか、画面とAPIの両方で期限切れを扱えるかも確認項目です。監査ログには判定と時刻を残し、セッション値や認証情報を記録しない設計にします。

## 確認できた事例と次の確認

今回の履歴では、複数サービスの期限ルールの変更、本番反映、設定差分を監査する仕組みを確認しました。実ユーザーのログインや、有効期間満了まで待つ動作確認は、今回の検証記録にはありません。実利用者全員の端末で期限の経過を試したことや、すべての失効・再認証条件の安全性を実証したこととは分けて考えます。適切な期間と追加の再認証条件は、扱うデータと操作の重要度に合わせて決める必要があります。

一般的な設計確認には、[OWASPのセッション管理](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html)と[認証](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)の資料も参照してください。別のセッションを持つ層の例には、[Cloudflareのセッション管理資料](https://developers.cloudflare.com/cloudflare-one/access-controls/access-settings/session-management/)もあります。上の事例で挙げた確認項目のすべてを実施済みという意味ではありません。

## 2026年10月6日追記：認証の継続とアプリ権限

匿名化した認証改修の記録では、OIDCのcallback到着、tokenの検証、元の認証要求の継続、アプリの利用権限を分けました。継続に必要なcontextが失われた場合をログイン成功へ置き換えず、安全に再開できるエラーとして扱います。戻り先も検証し、共通アカウントへのログインだけで各アプリの業務権限を付与しません。

ログインと登録、認証providerの追加・削除、回復経路でも同じ契約を確認します。変更や配信の記録は、全provider・全利用者による実ログインや、最後の回復手段を失わないことの通し検証とは別です。

追加認証要素の有効化、認証基盤へのログイン、アクセスゲート通過、アプリの保護された書込も個別に確認します。限定した書込試験の成功で、正式OIDCの全経路や停止アカウントの拒否を代替しません。登録・初期設定・変更画面・APIで共通の入力規則を参照し、境界値の拒否と許可を同じ試験で確かめます。特定の文字数を一般標準として提示するものではありません。

ログインと登録は画面とcallbackの案内も分けます。表示やhealth確認だけで、実際の外部アカウント作成・同意完了の受入とはしません。providerを撤去するときはボタン、callback、設定、案内、テストを一括で棚卸しし、残存経路を確認します。
