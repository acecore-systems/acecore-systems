**Findings**

- P0/P1/P2 の未解決事項はありません。
- P3 として、コンセプト画像は生成モック由来の圧縮された縦密度のため、実装側は完全なピクセル一致ではありません。現状はレイアウト構造、色、主要CTA、ロードマップ配置、表・カード密度を合わせたうえで、可読性とレスポンシブ崩れを優先しています。
- P3 として、サービス全体像の左ラベル内アイコンは未実装です。参照の小アイコンは別途アイコンセットまたは画像アセット化すればさらに近づけられます。

**Comparison Target**

- Source visual truth: `C:\Users\gnish\AppData\Local\Temp\codex-clipboard-6aa7a799-02be-4e66-b2c3-9cda2c16a3df.png`
- Earlier rendered mismatch: `C:\Users\gnish\AppData\Local\Temp\codex-clipboard-e6afe253-9904-4363-ba44-914acc4f73a7.png`
- Implementation URL: `http://127.0.0.1:4327/`
- Implementation screenshot: `C:\Users\gnish\.codex\worktrees\d241\acecore-systems\.playwright-cli\concept-pass6-full.png`
- Mobile smoke screenshot: `C:\Users\gnish\.codex\worktrees\d241\acecore-systems\.playwright-cli\concept-pass6-mobile.png`
- Side-by-side comparison evidence: `C:\Users\gnish\.codex\worktrees\d241\acecore-systems\.playwright-cli\concept-pass2-side-by-side.png`
- Viewport: desktop `863x1822`, mobile `390x844`
- State: top page initial state, planner default selections, one planner checkbox interaction.

**Focused Region Evidence**

- Hero: `systems-hero-route-map.png` のSVG的な近似表示から、コンセプト由来のラスター画像 `systems-hero-concept-route.png` に差し替え、暗背景部分を透過処理して四角い画像境界を抑えました。
- Hero: 見出しをコンセプト同様に2行構成へ戻し、コピーを上げ、ロードマップと文字のずれ・重なりを解消しました。
- CTA: ヘッダーCTAをアウトライン表示にし、ヒーロー・相談カード・フォームの主要ボタンに参照と同じ矢印付き文言を入れました。
- Route table: 行高、ラベル幅、セル文字、リンク位置を圧縮し、参照の薄い表レイアウトに寄せました。
- Planner: 右カードを「おすすめルートの縦リスト + ボタン」主体へ戻し、余計な説明表を削って参照の構成に合わせました。
- Pricing / Process / Cases / Contact: 料金表に期間列を追加し、導入プロセスをカード型からライン型へ寄せ、下部CTAを2列フォームに戻して全体の密度を上げました。

**Required Fidelity Surfaces**

- Fonts and typography: 日本語ゴシックの太い見出し、太めのUIラベル、小さな表テキストへ調整。ヒーロー見出しは2行、各表・カードは参照に合わせて小さめのサイズへ圧縮済み。
- Spacing and layout rhythm: hero `402px`、route `343px`、planner `340px`、contact `241px` まで圧縮。初期実装の縦長さから大幅に改善済み。
- Colors and tokens: navy / teal / gold / white の参照パレットに統一。ヘッダーCTA、Webルート、アクティブステップ、フォームCTAのgold表現を調整済み。
- Image quality and asset fidelity: ヒーローロードマップは近似SVGではなくラスター画像として配置。透明化により背景となじませ、参照の道路・旗・円形マーカーに寄せました。
- Copy and content: ヒーローCTAを「料金を見る」へ短縮し、CTA矢印、料金表の期間列、会社名入力、相談タグを参照に合わせて追加しました。

**Rendered QA**

- Page identity: `http://127.0.0.1:4327/`, title `業務システム・アプリ開発 | Acecore Systems`
- Blank-page check: desktop/mobile ともに first meaningful screen が表示されました。
- Framework overlay: Astro/Vite error overlay なし。
- Console health: desktop/mobile とも warning/error なし。
- Screenshot evidence: `concept-pass6-full.png`, `concept-pass6-mobile.png`, `concept-pass2-side-by-side.png`
- Interaction proof: `input[data-area="data"]` をチェック後、`.route-brief-list li.active` が `01`, `04`, `05` になり、相談リンクの `scope` が更新されることを確認しました。
- Overflow: desktop `scrollWidth=863`, mobile `scrollWidth=390` で横スクロールなし。

**Patches Made Since Previous QA**

- Header CTA label and outline behavior adjusted.
- Hero route asset replaced with `public/assets/systems-hero-concept-route.png`.
- Hero copy, route map sizing, and desktop route station behavior adjusted.
- Planner right card simplified and density reduced.
- Pricing table rebuilt with four columns.
- Process line, case cards, and contact CTA compressed to match the concept.
- Primary CTA copy and arrows aligned to the reference.

**Follow-up Polish**

- If exact pixel fidelity is required, create separate icon/image assets for the service route labels and rebuild the whole page against a fixed desktop artboard height. That would trade off some live responsive readability.

final result: passed
