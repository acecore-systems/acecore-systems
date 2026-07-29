# CMS の安全な書き込み運用

最終確認日: 2026-07-29

## 構成

- Repository: `acecore-systems/acecore-systems`
- CMS: Sveltia CMS
- 本番origin: `https://systems.acecore.net`
- 保存API: 同一originのPages Functions（`/admin/api/github/*`、`/admin/api/graphql`）
- 認証: Acecore Systems専用GitHub App
- 保存先: `main`（`expectedHeadOid`を使った単一commitの原子的更新）
- 公開branch: `main`
- 本番deploy: Cloudflare PagesのGitHub連携による`main` push deploy

共有GitHub OAuth Workerは使用しません。Pages previewなど本番以外のoriginではログインとCMS APIの両方をfail-closedで拒否します。Direct Uploadや手動deployは本番経路に含めません。

`publish_mode: editorial_workflow` は設定しません。Sveltia CMSではEditorial Workflowが未実装であり、設定だけではCMS作業branchやPull Requestが作られないためです。

## 認証

GitHub Appはこのrepositoryだけにinstallし、次のrepository権限だけを付与します。

- Contents: Read and write
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

refresh tokenはブラウザへ返さず、保存もしません。access tokenの有効期限（最大8時間）が切れた後は、GitHub Appへ再ログインします。保存直前にもuser tokenで編集者、installation、対象repository、push権限、Appのwrite権限がContentsだけであることを再確認します。

GitHub App user tokenによるAPI操作は編集者本人がactorになるため、GitHub rulesetでAppに付与したbypassは適用されません。そこで、user tokenは編集者の認証・認可と通常のCMS読み取りに限定し、`main`へのcommitと応答喪失時の照合には専用Appの短期installation tokenを使います。installation tokenは毎回repositoryを`acecore-systems`の1件、要求権限をContents writeだけに絞って発行し、GitHub応答がContents write、対象repository 1件だけ、Metadataが返る場合はreadであり、有効期限が約1時間以内である場合に限り使用します。

Pages Functionsでは次の環境変数を使います。

| 名前                             | 種別              | 用途                                    |
| -------------------------------- | ----------------- | --------------------------------------- |
| `CMS_GITHUB_APP_CLIENT_ID`       | Production secret | 専用GitHub Appのclient ID               |
| `CMS_GITHUB_APP_CLIENT_SECRET`   | Production secret | 専用GitHub Appのclient secret           |
| `CMS_GITHUB_APP_INSTALLATION_ID` | Production secret | Systems repository限定installation ID   |
| `CMS_GITHUB_APP_PRIVATE_KEY`     | Production secret | installation token署名用RSA private key |
| `CMS_OAUTH_STATE_SECRET`         | Production secret | state署名用の十分に長い乱数             |

識別子を含む5項目すべてをCloudflare PagesのProduction encrypted secretとして設定します。Preview環境には設定せず、preview URLからproductionの認証endpointを呼ばれてもログインを拒否します。

private keyはGitHubから取得したPKCS#1またはPKCS#8 PEMをProduction encrypted secretだけへ登録し、repository、ログ、Preview環境、ブラウザへは配布しません。CMS設定とAPIも `systems.acecore.net` 以外では配信・通信前に拒否します。

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

画像は`public/uploads/**`配下の`.avif`、`.gif`、`.jpeg`、`.jpg`、`.png`、`.webp`だけを扱います。参照中画像を誤って消さないよう、CMSからの削除はJSON・画像とも拒否します。不要画像の削除は参照確認を含む通常のPull Requestで行います。source code、workflow、設定、列挙外のデータもproxyが拒否します。JSONはGitHub GraphQLの完全なtextとして再読込できる448 KiB以下、1回の保存は最大100ファイル、追加データ合計25 MiBです。

## 保存から公開まで

1. 編集者が本番の`/admin/`から専用GitHub Appでログインする。
2. Pages Functionsがuser tokenで編集者、installation、対象repository、push権限を再確認し、変更path、ファイル数、合計サイズ、削除可否を同期検証する。
3. `main`の最新HEADがCMSの取得時点と一致することを確認する。別の保存やコード変更が先に反映されていた場合は409で拒否し、再読み込みを求める。
4. repositoryと権限を限定した短期installation tokenを発行し、応答scopeを再確認する。
5. JSONと画像をGitHub GraphQLの`createCommitOnBranch`で1つのcommitにまとめ、`expectedHeadOid`を指定して`main`へ原子的に反映する。
6. GitHubの応答が失われた場合は同じinstallation tokenで、保存ごとの固有marker、親SHA、変更path、追加blob SHA、削除pathをcommit履歴と照合する。全て一致した場合だけ成功応答を再構成し、第三者commitを成功扱いにしない。
7. `main` pushを受けたCloudflare PagesのGitHub連携deployが本番へ公開する。
8. 通常のCIはpush後にも実行されるが、CMS公開の事前待機条件にはしない。失敗は運用上の監視対象とする。

CMSの「保存」は`main`への反映を意味し、人によるPull Requestのmerge操作は不要です。表示への反映にはCloudflare Pagesのbuild時間が必要です。同時更新でHEADが変わった場合は、CMSを再読み込みしてから保存し直します。恒久的な`cms-content` branchや一時的な公開Pull Requestは使いません。

CMS proxyは列挙済みのJSONと画像以外を拒否します。GitHub rulesetは2つに分け、branch削除、force push、非linear履歴の禁止はbypassなしで全actorに適用します。Pull Requestとrequired checksだけを別rulesetにし、Systems専用GitHub Appだけを`always` bypassにします。これによりCMSは通常のfast-forward commitだけを直接反映でき、コード、設定、schema変更には従来の保護を引き続き要求します。

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

2026-07-28から29日に次の外部設定と診断結果を確認しました。

- 組織所有のSystems専用GitHub Appを作成し、callback URLを`https://systems.acecore.net/admin/api/callback`に設定
- Appを`acecore-systems/acecore-systems`の1件だけにinstall
- ContentsをRead and write、MetadataをRead-onlyに限定
- expiring user tokenを有効化し、Webhookとイベント購読を無効化
- Cloudflare PagesのProduction環境へprivate key以外の4項目をsecretとして設定し、Preview環境は未設定のまま維持
- `main`の履歴保護をbypassなし、Pull Request / `Build and Format` / Cloudflare PagesをSystems専用GitHub Appだけbypassできる2つのactive rulesetとして設定
- rule suite `3483603616`で、GitHub App user tokenのactorが編集者`gui-ace`となり、Pull Request必須とrequired checksに拒否されたことを確認

コードのmerge後、CMSを有効化する前にGitHub Appのprivate keyを発行して`CMS_GITHUB_APP_PRIVATE_KEY`へProduction encrypted secretとして登録します。GitHubやCloudflareの外部設定は、このコード変更とは別に本番作業として実施します。また、`Build and Format`とCloudflare Pagesの2件が通常変更のstrict required checkであり、Pull Request保護が維持され、Systems専用GitHub Appだけがrulesetを迂回できることを再取得して確認します。

設定後に次の本番確認と後片付けを行います。

1. 本番の`/admin/`からGitHub App認証を開始できることを確認する。
2. 本番CMSで表示に影響しない確認用変更を保存し、`main`へ1 commitで直接反映されたことを確認する。
3. GitHub連携による`main`のproduction deployと表示反映を確認する。
4. HEAD競合では409となり、既存の本番表示が維持されることを確認する。
5. 確認用変更をCMSから元に戻し、復元commitも直接公開されることを確認する。
