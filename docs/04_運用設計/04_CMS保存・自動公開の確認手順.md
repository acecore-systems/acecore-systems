# CMS保存・自動公開の確認手順

種類: 手順書
状態: 有効
確認日: 2026-07-29

CMS保存・自動公開運用の変更を検証する手順と、本番有効化の前提、有効化後の確認と後片付けの手順を示す。

## 目的

該当なし

## 前提

### 本番有効化の前提

コードのmerge後、CMSを有効化する前にGitHub Appのprivate keyを発行して`CMS_GITHUB_APP_PRIVATE_KEY`へProduction encrypted secretとして登録します。GitHubやCloudflareの外部設定は、このコード変更とは別に本番作業として実施します。また、`Build and Format`とCloudflare Pagesの2件が通常変更のstrict required checkであり、Pull Request保護が維持され、Systems専用GitHub Appだけがrulesetを迂回できることを再取得して確認します。

## 手順

### 本番有効化の後の確認と後片付け

設定後に次の本番確認と後片付けを行います。

1. 本番の`/admin/`からGitHub App認証を開始できることを確認する。
2. 本番CMSで表示に影響しない確認用変更を保存し、`main`へ1 commitで直接反映されたことを確認する。
3. GitHub連携による`main`のproduction deployと表示反映を確認する。
4. HEAD競合では409となり、既存の本番表示が維持されることを確認する。
5. 確認用変更をCMSから元に戻し、復元commitも直接公開されることを確認する。

## 検証

### コード変更の検証

```powershell
npm run test:cms
npm run typecheck:functions
npm run format:check
npm run validate:content
npm run build
git diff --check
```

## 切り戻し

該当なし

## 参照

- [CMS保存・自動公開運用](01_CMS保存・自動公開運用.md)
- [CMS本番有効化の確認記録](05_CMS本番有効化の確認記録.md)
