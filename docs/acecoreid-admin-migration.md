# AcecoreID管理ログイン移行

## 状態

サイト側の実装PR。**本番未切替**。既存編集者の本人GitHub連携、全員の権限照合、本番設定と実ログイン確認が完了するまでマージしない。

## 認証と認可

2026-09-14追補: Portalの復旧結果を横展開。連携数値IDから現在のGitHubユーザーを解決し、個別のrepository permission応答のID・login一致とwrite/adminを検証する。古いAccess情報は同一サイト限定の「ログイン情報を更新」で再取得でき、未連携時は本人のAcecoreID設定への導線を示す。欠落claimのfull identity補完は同一Access主体・account・IdPを検証し、不正値や不一致を救済しない。GitHub新形式tokenのdotを許容するが、個人token・改行・過大値は拒否する。

- ログインはAcecoreIDのみ。Access JWTのRS256署名・issuer・audience・期限・app種別・AcecoreID subject・GitHub数値IDを検証する。
- メール、表示名、Hatt entitlement、共通CMS AI membershipで編集権限を追加しない。
- GitHubの連携済み不変IDから現在のloginを解決し、対象repositoryの個別permissionで現在push権限があるか毎回確認する。保存直前も再確認し、障害・連携なし・権限剥奪は拒否する。
- ブラウザへGitHub tokenを渡さず、旧Authorization bearerだけではアクセス不可。旧auth/callbackは410でOAuth codeを交換しない。
- 同一origin POSTのみ許可。CMS対象path・容量・削除制限・expected main HEAD・曖昧応答の復旧検証は従来のまま。
- `CMS_ACCESS_AUD`、`CMS_ACCESS_TEAM_DOMAIN`（HTTPSのチームorigin）、`CMS_ACCESS_HOSTNAMES`（本番host）は本番設定が必要。未設定では503。本番以外のhostは設定によらず拒否する。
- Access IdPをAcecoreIDのみに限定し、既存policyを維持したうえで `https://acecore.net/claims/subject` と `https://acecore.net/claims/github-id` をJWTのcustomにマッピングする。共通IdPへのclaim追加は対象サイトの準備状況も確認して行う。

## 保存actor

既存Systems専用GitHub Appのinstallation tokenを使用。対象repositoryとContents write（Metadata readを除き他の権限なし）を検証する。既存の `CMS_GITHUB_APP_CLIENT_ID`、`CMS_GITHUB_APP_INSTALLATION_ID`、`CMS_GITHUB_APP_PRIVATE_KEY` が必要。

## 本番切替とロールバック

1. 既存Access policy、全既存編集者、対象repositoryの現在権限を読み取り照合する。本人がAcecoreIDのGitHub連携を行い、同等の利用条件を確認する。秘密allowlist/tokenはログやPRへ記載しない。
2. 保存actorとAccessの本番設定を準備する。許可/拒否・権限剥奪・連携なし・preview・別originを検証する。
3. PR/CI成功、レビュー、merge後のGitHub連携Pages production deployとcustom domainを確認する。Previewや手動Uploadを本番完了にしない。
4. AcecoreIDで実ログインし、読取と承認済みの保存確認を行う。保存の試験は既存コンテンツを無断変更しない。
5. 問題時は旧ソースのGit revert PRと切替前に記録したAccess設定へ戻す。旧OAuth secretsは、全員の利用確認が完了するまで実環境から削除しない。コード上の廃止とsecretの実削除は別作業。

GitHub認可の根拠: [List repository collaborators](https://docs.github.com/en/rest/collaborators/collaborators#list-repository-collaborators)。
