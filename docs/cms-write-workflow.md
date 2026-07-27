# CMS の安全な書き込み運用

最終確認日: 2026-07-27

## 構成

- Repository: `acecore-systems/acecore-systems`
- CMS: Sveltia CMS
- 本番origin: `https://systems.acecore.net`
- 保存API: 同一originのPages Functions（`/admin/api/github/*`、`/admin/api/graphql`）
- 認証: Acecore Systems専用GitHub App
- 保存branch: `cms/systems/*` の作業branch（merge後に削除）
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

| 名前                             | 種別                | 用途                                  |
| -------------------------------- | ------------------- | ------------------------------------- |
| `CMS_GITHUB_APP_CLIENT_ID`       | Production variable | 専用GitHub Appのclient ID             |
| `CMS_GITHUB_APP_CLIENT_SECRET`   | Production secret   | 専用GitHub Appのclient secret         |
| `CMS_GITHUB_APP_INSTALLATION_ID` | Production variable | Systems repository限定installation ID |
| `CMS_OAUTH_STATE_SECRET`         | Production secret   | state署名用の十分に長い乱数           |

これらはCloudflare PagesのProduction環境だけに設定します。Preview環境には設定せず、preview URLからproductionの認証endpointを呼ばれてもログインを拒否します。

## CMS管理対象

更新可能なJSONは次の12ファイルに完全列挙します。

- `src/data/site.json`
- `src/data/home.json`
- `src/data/services.json`
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
2. Pages Functionsがrepository、`main`の最新HEAD、変更path、ファイル数、合計サイズを検証する。
3. `cms/systems/*` branchを`main`から作成する。
4. JSONと画像を1つのcommitへ保存し、`main`向けPull Requestを作成する。
5. `Build and Format`とCloudflare Pages previewを通過したPull Requestをレビューしてmergeする。
6. merge後に`cms/systems/*` branchを削除する。repositoryのbranch自動削除は現在無効なので、merge操作時または直後に手動で削除する。
7. `main` pushを受けたCloudflare PagesのGitHub連携deployが本番へ公開する。

CMSの「保存」はPull Requestの作成までであり、その時点では公開されません。恒久的な`cms-content` branchは使いません。

## コード変更の検証

```powershell
npm run test:cms
npm run typecheck:functions
npm run format:check
npm run validate:content
npm run build
git diff --check
```

## merge後に必要な外部設定

この文書の更新時点では、次の外部設定と本番確認は完了扱いにしません。
`Build and Format`はCloudflare Pagesとともに`main`のrequired checkへ追加済みです。

1. Systems専用GitHub Appを作成し、callback URLを`https://systems.acecore.net/admin/api/callback`にする。
2. Appを`acecore-systems/acecore-systems`の1件だけにinstallし、上記3権限と8時間以下のuser token有効期限を確認する。
3. Cloudflare PagesのProduction環境へ4つの環境変数・secretを設定する。
4. 本番CMSでJSONと画像を同時に保存し、CMS作業branch、1 commit、1 Pull Request、preview成功を確認する。
5. Pull Requestをmergeし、GitHub連携による`main`のproduction deployと表示反映を確認する。
6. repositoryのbranch自動削除を有効化するか運用判断し、有効化しない場合はmerge後にCMS作業branchを削除する。
7. 確認用データと不要になったCMS作業branchを整理する。
