**Findings**

- P0/P1/P2 の未解決事項はありません。
- P3 として、コンセプト画像は生成モック由来の圧縮された縦密度のため、実装側は完全なピクセル一致ではありません。現状はレイアウト構造、色、主要CTA、ロードマップ配置、表・カード密度を合わせたうえで、可読性とレスポンシブ崩れを優先しています。
- P3 として、サービス全体像の左ラベル内アイコンは未実装です。参照の小アイコンは別途アイコンセットまたは画像アセット化すればさらに近づけられます。

**Comparison Target**

- Source visual truth: `C:\Users\gnish\AppData\Local\Temp\codex-clipboard-6aa7a799-02be-4e66-b2c3-9cda2c16a3df.png`
- Earlier rendered mismatch: `C:\Users\gnish\AppData\Local\Temp\codex-clipboard-e6afe253-9904-4363-ba44-914acc4f73a7.png`
- Jagged route report: `C:\Users\gnish\AppData\Local\Temp\codex-clipboard-dbd79a35-3b1c-4ad6-bd57-34256032a652.png`
- Implementation URL: `http://127.0.0.1:4327/`
- Implementation screenshot: `C:\Users\gnish\.codex\worktrees\d241\acecore-systems\.playwright-cli\route-smooth2-wide.png`
- Desktop smoke screenshot: `C:\Users\gnish\.codex\worktrees\d241\acecore-systems\.playwright-cli\route-smooth2-desktop.png`
- Mobile smoke screenshot: `C:\Users\gnish\.codex\worktrees\d241\acecore-systems\.playwright-cli\route-smooth2-mobile.png`
- Side-by-side comparison evidence: `C:\Users\gnish\.codex\worktrees\d241\acecore-systems\.playwright-cli\concept-pass2-side-by-side.png`
- Viewport: desktop `1026x820`, wide `2052x1400`, mobile `390x844`
- State: top page initial state, planner default selections, one planner checkbox interaction.

**Focused Region Evidence**

- Hero: ガタつきの原因だった透過処理済みの小さいロードマップ画像を廃止し、高解像度の `systems-hero-route-map.png` に戻しました。
- Hero: 画像の線は透過加工せず、CSSのマスクと透明度だけでヒーロー背景になじませています。
- Hero: 再表示した駅ラベルは幅、文字サイズ、位置を再調整し、ロードマップ上で文字が重なりすぎない状態にしました。
- Hero: 見出しをコンセプト同様に2行構成へ戻し、コピーを上げ、ロードマップと文字のずれ・重なりを解消しました。
- CTA: ヘッダーCTAをアウトライン表示にし、ヒーロー・相談カード・フォームの主要ボタンに参照と同じ矢印付き文言を入れました。
- Route table: 行高、ラベル幅、セル文字、リンク位置を圧縮し、参照の薄い表レイアウトに寄せました。
- Planner: 右カードを「おすすめルートの縦リスト + ボタン」主体へ戻し、余計な説明表を削って参照の構成に合わせました。
- Pricing / Process / Cases / Contact: 料金表に期間列を追加し、導入プロセスをカード型からライン型へ寄せ、下部CTAを2列フォームに戻して全体の密度を上げました。

**Required Fidelity Surfaces**

- Fonts and typography: 日本語ゴシックの太い見出し、太めのUIラベル、小さな表テキストへ調整。ヒーロー見出しは2行、各表・カードは参照に合わせて小さめのサイズへ圧縮済み。
- Spacing and layout rhythm: hero `402px`、route `343px`、planner `340px`、contact `241px` まで圧縮。初期実装の縦長さから大幅に改善済み。
- Colors and tokens: navy / teal / gold / white の参照パレットに統一。ヘッダーCTA、Webルート、アクティブステップ、フォームCTAのgold表現を調整済み。
- Image quality and asset fidelity: ヒーローロードマップは高解像度ラスター画像を直接配置。透過加工によるアンチエイリアス欠けを避け、線のガタつきが出ない状態に戻しました。
- Copy and content: ヒーローCTAを「料金を見る」へ短縮し、CTA矢印、料金表の期間列、会社名入力、相談タグを参照に合わせて追加しました。

**Rendered QA**

- Page identity: `http://127.0.0.1:4327/`, title `業務システム・アプリ開発 | Acecore Systems`
- Blank-page check: desktop/mobile ともに first meaningful screen が表示されました。
- Framework overlay: Astro/Vite error overlay なし。
- Console health: desktop/mobile とも warning/error なし。
- Screenshot evidence: `route-smooth2-wide.png`, `route-smooth2-desktop.png`, `route-smooth2-mobile.png`
- Interaction proof: `input[data-area="data"]` をチェック後、`.route-brief-list li.active` が `01`, `04`, `05` になり、相談リンクの `scope` が更新されることを確認しました。
- Overflow: desktop `scrollWidth=1026`, wide `scrollWidth=2052`, mobile `scrollWidth=390` で横スクロールなし。

**Patches Made Since Previous QA**

- Header CTA label and outline behavior adjusted.
- Jagged route asset `public/assets/systems-hero-concept-route.png` removed.
- Hero route image path restored to `public/assets/systems-hero-route-map.png`.
- Desktop station labels restored and resized to sit on the smooth route map without heavy overlap.
- Hero copy, route map sizing, and desktop route station behavior adjusted.
- Planner right card simplified and density reduced.
- Pricing table rebuilt with four columns.
- Process line, case cards, and contact CTA compressed to match the concept.
- Primary CTA copy and arrows aligned to the reference.

**Follow-up Polish**

- If exact pixel fidelity is required, create separate icon/image assets for the service route labels and rebuild the whole page against a fixed desktop artboard height. That would trade off some live responsive readability.

final result: passed
