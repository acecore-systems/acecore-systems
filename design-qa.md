**Findings**

- P0/P1/P2 の未解決事項はありません。
- P3: 以前の `1001px+` ヒーローは、ナビ・見出し・CTAまで含む全体ラスタを表示していました。今回、`621px+` は紺色背景をCSS、ルートマップだけを透過PNG、ナビ・見出し・CTA・駅ラベルをHTMLへ戻しました。
- P3: ルート画像は既存の `systems-hero-route-map.png` から背景をアルファ化し、desktop `863x405 / 1726x810` と wide `1240x500 / 2480x1000` を生成しています。これによりAI生成文字の崩れと、全体画像化によるクリック面のズレを解消しました。

**Comparison Target**

- Source visual truth: `C:\Users\gnish\.codex\attachments\ad5a08f7-6501-4cff-855a-e212532d099c\image-1.png`
- Latest user request: 紺色を背景色とし、ルートマップのみを透過画像にする。ナビバー、文字、ボタンはHTMLで実装する。
- Implementation URL: `http://127.0.0.1:4322/`
- Viewports checked with in-app browser: `1240x900`, `863x900`, `700x900`

**Hero Evidence**

- `1240px`: `systems-hero-route-map-transparent-wide*.png` を選択。`.hero` の背景は `rgb(4, 20, 31)`、`.hero-title-lines` / `.site-header .nav` / `.hero-copy .btn.primary` は `opacity: 1` かつ `pointer-events: auto`。
- `863px`: `systems-hero-route-map-transparent-desktop*.png` を選択。ナビ・見出し・CTAはHTML表示。旧透明クリック面は削除済み。
- `700px`: `systems-hero-route-map-transparent-desktop*.png` を選択。モバイル寄りのHTMLヒーローと駅カード表示に戻し、画像焼き込みはなし。
- 旧 `systems-hero-route-map-ai-wide-*.png` は参照から外し、削除しました。

**Section Metrics**

- `863px` page height: reference `1822px`, current `1822px`
- Mean RGB differences: hero `27.77`, routes `13.35`, planner `18.31`, beforeAfter `17.17`, pricing `13.41`, process `17.99`, cases `18.02`, contact `19.31`, footer `16.33`

**Validation**

- in-app browser: `1240x900` と `863x900` でスクリーンショット確認。
- `node .playwright-cli\capture-route-map-fix.cjs`
- `node .playwright-cli\capture-hero-breakpoints.cjs`
- `node .playwright-cli\capture-fidelity-audit.cjs`
- `node .playwright-cli\measure-section-diffs.cjs`
- `node .playwright-cli\interaction-check.cjs`
- in-app browser: ヒーロー内HTML CTAの `料金を見る` は `/pricing/`、`開発を相談する` は `/contact/` へ遷移。

**Evidence Files**

- `.playwright-cli/wide-1240-full-route-map-fix.png`
- `.playwright-cli/desktop-863-route-map-fix.png`
- `.playwright-cli/hero-bp-640.png`
- `.playwright-cli/hero-bp-700.png`
- `.playwright-cli/hero-bp-760.png`
- `.playwright-cli/hero-bp-1026.png`
- `.playwright-cli/hero-bp-1240.png`
- `.playwright-cli/mobile-390-route-map-fix.png`

final result: passed
