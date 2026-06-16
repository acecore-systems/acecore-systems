**Findings**

- P0/P1/P2 の未解決事項はありません。
- P3 として、生成済みルートマップ画像そのものの道路線・旗・円形マーカーの造形は参照画像と完全なピクセル一致ではありません。ただし、今回指摘された「ロードマップと文字のずれ」は解消済みです。

**Comparison Target**

- 参照画像: `C:\Users\gnish\AppData\Local\Temp\codex-clipboard-c0391f95-147b-4a76-9076-33698b67547d.png`
- ずれ指摘のスクリーンショット: `C:\Users\gnish\AppData\Local\Temp\codex-clipboard-3b564c92-1f2c-41df-acd0-d2ef3d3af3c2.png`
- 検証 URL: `http://127.0.0.1:4327/`
- 検証ブラウザ: Browser plugin
- 検証ビューポート: desktop `1026x900`, mobile `390x844`
- 状態: トップページ初期表示、プランナー初期選択、プランナーの「選択をクリア」操作

**Focused Comparison Evidence**

- Hero: ルートマップ画像を右カラム内の `cover` クロップから、実画像比率を保った座標配置に変更し、駅ラベルを画像内マーカーの直下へ寄せました。
- Hero: 右側画像が見出しを覆っていたため、見出しを前面、ルート画像を背面、駅ラベルをルート画像より前面に整理しました。
- Hero: 画像の左端・上端が矩形に見えていたため、マスクフェードで暗いヒーロー背景になじませました。
- Hero: 右端の `06 運用改善` ラベルを内側に戻し、ラベルの右端切れを避けました。
- Mobile: 見出しが任意位置で割れないよう、`wbr` による意味単位の改行候補を追加しました。

**Rendered QA**

- Desktop first viewport: Browser screenshot で、見出し全文が表示され、駅ラベルがルートマーカー下へ揃っていることを確認しました。
- Mobile first viewport: Browser screenshot で、見出しの右端切れがなく、駅カードが 2 カラムで崩れないことを確認しました。
- Overflow: desktop は `clientWidth=1011`, `scrollWidth=1011`、mobile は `clientWidth=375`, `scrollWidth=375` で横スクロールなし。
- Console: desktop/mobile ともに Browser console の warning/error は 0 件。
- Interaction: プランナーの「選択をクリア」クリックで、選択数が `2` から `0` に更新されることを確認しました。

**Build / Implementation Checks**

- `npm run build` passed.
- Astro 6.4.6 / Vite の `astro/entrypoints/prerender` 解決に失敗していたため、既存 Acecore 系リポジトリと同じ Vite alias を `astro.config.mjs` に追加しました。
- Browser runtime からワークスペースへのスクリーンショット保存は `EPERM` で拒否されたため、スクリーンショットは Browser から会話上へ直接表示して目視比較しました。

final result: passed
