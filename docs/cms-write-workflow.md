# CMS の安全な書き込み運用

最終確認日: 2026-07-28

## 構成

- Repository: `acecore-systems/acecore-systems`
- CMS: Sveltia CMS
- 本番origin: `https://systems.acecore.net`
- 保存API: 同一originのPages Functions（`/admin/api/github/*`、`/admin/api/graphql`）
- 認証: Acecore Systems専用GitHub App
- 保存branch: 固定の`cms/systems/publish`（公開処理の原子的lockを兼ね、終了時に専用workflowが削除）
- 公開branch: `main`
- 本番deploy: Cloudflare PagesのGitHub連携による`main` push deploy

共有GitHub OAuth Workerは使用しません。Pages previewなど本番以外のoriginではログインとCMS APIの両方をfail-closedで拒否します。Direct Uploadや手動deployは本番経路に含めません。

`publish_mode: editorial_workflow` は設定しません。Sveltia CMSではEditorial Workflowが未実装であり、設定だけではCMS作業branchやPull Requestが作られないためです。

## 認証

GitHub Appはこのrepositoryだけにinstallし、次のrepository権限だけを付与します。

- Contents: Read and write
- Pull requests: Read and write
- Metadata: Read-only

認証開始時にPKCE S256のverifier / challengeを生成します。stateはHMACで署名し、有効期限を10分に限定します。stateとverifierは`HttpOnly`、`Secure`、`SameSite=Lax` cookieでcallbackまで保持します。

callbackは次を満たす場合だけtokenをCMSへ返します。

- openerとcallbackのoriginが`https://systems.acecore.net`で一致する
- state、cookie、PKCE verifierが一致する
- token exchangeをrepository ID `1268097850`に限定する
- `CMS_GITHUB_APP_INSTALLATION_ID`のinstallationが対象repositoryのものと一致する
- access tokenがGitHub App user tokenの`ghu_`形式である
- tokenの有効期限が8時間以下である
- OAuth scopeが空である
- 対象repositoryへのpush権限が確認できる

refresh tokenはブラウザへ返さず、保存もしません。access tokenの有効期限（最大8時間）が切れた後は、GitHub Appへ再ログインします。

Pages Functionsでは次の環境変数を使います。

| 名前                             | 種別              | 用途                                  |
| -------------------------------- | ----------------- | ------------------------------------- |
| `CMS_GITHUB_APP_CLIENT_ID`       | Production secret | 専用GitHub Appのclient ID             |
| `CMS_GITHUB_APP_CLIENT_SECRET`   | Production secret | 専用GitHub Appのclient secret         |
| `CMS_GITHUB_APP_INSTALLATION_ID` | Production secret | Systems repository限定installation ID |
| `CMS_OAUTH_STATE_SECRET`         | Production secret | state署名用の十分に長い乱数           |

識別子を含む4項目すべてをCloudflare PagesのProduction secretとして設定します。Preview環境には設定せず、preview URLからproductionの認証endpointを呼ばれてもログインを拒否します。

## CMS管理対象

更新可能なJSONは次の13ファイルに完全列挙します。

- `src/data/site.json`
- `src/data/home.json`
- `src/data/services.json`
- `src/data/it-advisor.json`
- `src/data/pricing.json`
- `src/data/guide.json`
- `src/data/works.json`
- `src/data/contact.json`
- `src/data/privacy.json`
- `src/data/service-details/site-functions.json`
- `src/data/service-details/site-quality.json`
- `src/data/service-details/operations.json`
- `src/data/work-details/acecore-site-platform.json`

画像は`public/uploads/**`配下の`.avif`、`.gif`、`.jpeg`、`.jpg`、`.png`、`.webp`だけを扱います。固定JSONは削除できず、削除できるのは許可済み画像だけです。source code、workflow、設定、列挙外のデータはproxyが拒否します。1回の保存は最大100ファイル、追加データ合計25 MiBです。

## 保存から公開まで

1. 編集者が本番の`/admin/`から専用GitHub Appでログインする。
2. Pages Functionsがrepositoryのsquash merge設定、変更path、ファイル数、合計サイズを検証する。
3. 先行するCMS公開用Pull Requestがないことを確認する。
4. `main`の最新HEADがCMSの取得時点と一致することを確認してから、固定の`cms/systems/publish` branchを原子的に作成する。同時保存はbranch作成の競合として409で拒否する。
5. JSONと画像を1つのcommitへ保存し、`main`向けPull Requestを作成する。
6. `CMS Publish Guard` workflowが、topic commit上の`Build and Format`とCloudflare Pages previewをGitHub App IDまで含めて確認する。
7. 両方が成功し、branchが最新の`main`を含む場合だけ、Guardがtopic commitのOIDを固定してPull Requestを`squash` mergeする。
8. 検証失敗、timeout、検証中の`main`更新、merge conflictではGuardがPull Requestを閉じ、`cms/systems/publish`だけを削除する。repository全体のbranch自動削除には依存しない。
9. merge成功を確認した同じGuard実行内でCMS branchを削除する。外部から閉じられた場合は`closed` eventでも同じSHAのCMS branchだけを補助的に削除する。
10. `main` pushを受けたCloudflare PagesのGitHub連携deployが本番へ公開する。

CMSの「保存」は公開処理の開始を意味し、人によるPull Requestのmerge操作は不要です。通常は数分で公開されます。先行する公開処理が完了するまでは次の保存を受け付けません。検証失敗時は自動終了するため、修正後に再保存できます。恒久的な`cms-content` branchは使いません。

Guardは`pull_request_target`で信頼済みの`main`だけをcheckoutし、Pull Request側のcodeを実行しません。同一repositoryの固定CMS branchだけを対象に、`checks: read`、`contents: write`、`pull-requests: write`へ限定した`GITHUB_TOKEN`を使います。

## コード変更の検証

```powershell
npm run test:cms
npm run typecheck:functions
npm run format:check
npm run validate:content
npm run build
git diff --check
```

## 本番有効化と確認状況

2026-07-28に次の外部設定を確認しました。

- 組織所有のSystems専用GitHub Appを作成し、callback URLを`https://systems.acecore.net/admin/api/callback`に設定
- Appを`acecore-systems/acecore-systems`の1件だけにinstall
- Contents / Pull requestsをRead and write、MetadataをRead-onlyに限定
- expiring user tokenを有効化し、Webhookとイベント購読を無効化
- Cloudflare PagesのProduction環境へ上記4項目をsecretとして設定し、Preview環境は未設定のまま維持
- `Build and Format`とCloudflare Pagesを`main`のrequired checkとして設定

コードのmerge後、CMSを有効化する前に`Build and Format`とCloudflare Pagesの2件が`main`のstrict required checkであり、既存のPull Request保護が維持されていることを再取得して確認します。`CMS Publish Guard`は両checkのGitHub App IDと結果を独立に検証してから通常のPull Request merge APIを呼ぶため、repositoryのAllow auto-merge設定には依存しません。

設定後に次の本番確認と後片付けを行います。

1. 本番の`/admin/`からGitHub App認証を開始できることを確認する。
2. 本番CMSで表示に影響しない確認用変更を保存し、固定CMS branch、1 commit、1 Pull Requestを確認する。
3. required checksの成功後に自動でsquash mergeされ、CMS branchだけが削除されることを確認する。
4. GitHub連携による`main`のproduction deployと表示反映を確認する。
5. 検証失敗または競合ではPull Requestが自動終了し、既存の本番表示と次回保存が維持されることを確認する。
