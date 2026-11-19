# CMS本番有効化の確認記録

種類: 記録
実施日: 2026-07-29
対象: Systems（acecore-systems）のCMS保存経路（Systems専用GitHub App、Cloudflare Pages Production、main のrulesets）

2026年7月28日から29日に確認した、CMS保存経路の本番有効化に関する外部設定と診断結果を記録する。

## 目的

該当なし

## 対象と方法

### 本番有効化と確認状況

2026-07-28から29日に次の外部設定と診断結果を確認しました。

## 経過

該当なし

## 結果

- 組織所有のSystems専用GitHub Appを作成し、callback URLを`https://systems.acecore.net/admin/api/callback`に設定
- Appを`acecore-systems/acecore-systems`の1件だけにinstall
- ContentsをRead and write、MetadataをRead-onlyに限定
- expiring user tokenを有効化し、Webhookとイベント購読を無効化
- Cloudflare PagesのProduction環境へprivate key以外の4項目をsecretとして設定し、Preview環境は未設定のまま維持
- `main`の履歴保護をbypassなし、Pull Request / `Build and Format` / Cloudflare PagesをSystems専用GitHub Appだけbypassできる2つのactive rulesetとして設定
- rule suite `3483603616`で、GitHub App user tokenのactorが編集者`gui-ace`となり、Pull Request必須とrequired checksに拒否されたことを確認

## 判断

該当なし

## 残件

該当なし

## 参照

該当なし
