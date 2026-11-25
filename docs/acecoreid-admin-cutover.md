# AcecoreID管理ログイン移行の本番切替とロールバック

種類: 手順書
状態: 下書き
確認日: 未確認

AcecoreID管理ログインへの本番切替の手順と、問題時に戻すための手順を定める。

## 目的

該当なし

## 前提

該当なし

## 手順

### 本番切替とロールバック

1. 既存Access policy、全既存編集者、対象repositoryの現在権限を読み取り照合する。本人がAcecoreIDのGitHub連携を行い、同等の利用条件を確認する。秘密allowlist/tokenはログやPRへ記載しない。
2. 保存actorとAccessの本番設定を準備する。許可/拒否・権限剥奪・連携なし・preview・別originを検証する。
3. PR/CI成功、レビュー、merge後のGitHub連携Pages production deployとcustom domainを確認する。Previewや手動Uploadを本番完了にしない。
4. AcecoreIDで実ログインし、読取と承認済みの保存確認を行う。保存の試験は既存コンテンツを無断変更しない。
5. 問題時は旧ソースのGit revert PRと切替前に記録したAccess設定へ戻す。旧OAuth secretsは、全員の利用確認が完了するまで実環境から削除しない。コード上の廃止とsecretの実削除は別作業。

## 検証

該当なし

## 切り戻し

問題時の切り戻しは、上記の手順5に記載している。

## 参照

- [AcecoreID管理ログイン移行](acecoreid-admin-migration.md)
