**Findings**

- P0/P1/P2 の未解決事項はありません。
- P3: 参照幅 `863px` のページ全体高さは、参照 `1822px` に対して実装も `1822px` です。
- P3: ユーザー指摘のあった `1001px+` のルートマップは、別構図の `systems-hero-route-map.png` とHTMLラベルを合成する方式をやめ、Image Gen で描き直した高画質wideラスタ `systems-hero-route-map-ai-wide-*.png` へ切り替えました。元のリサイズ由来の甘さを避け、ルート線、丸、文字の解像感を上げています。
- P3: wideラスタ内のナビ/CTAは画像として表示されるため、同じ位置に透明クリック面を追加しました。`1240px` で「開発を相談する」は `x=55 / y=320 / 195x45`、「料金を見る」は `x=260 / y=320 / 134x45` で、どちらも正しく遷移します。

**Comparison Target**

- Source visual truth: `C:\Users\gnish\.codex\attachments\ad5a08f7-6501-4cff-855a-e212532d099c\image-1.png`
- Latest user report: route map was visibly unstable in `C:\Users\gnish\AppData\Local\Temp\codex-clipboard-dbd79a35-3b1c-4ad6-bd57-34256032a652.png` (Temp file is no longer available, but the screenshot evidence in the prompt was used as the reported condition).
- Implementation URL: `http://127.0.0.1:4322/`
- Viewports checked: reference desktop `863x900`, wide desktop `1240x900`, high-DPI `1026px @ DPR 2`, breakpoint checks `640/700/760/761/820/1026/1240px @ DPR 2`, mobile `390x844`.

**Hero Evidence**

- Reference-width desktop: `863px` selects `systems-hero-route-map-concept.png`, renders at `x=0 / y=0 / width=863 / height=405`, `object-fit=contain`, and keeps final page height `1822px`.
- Image Gen output: the generated source was `1975x796`; project variants were generated at `1240x500` and `2480x1000`.
- Wide desktop: `1240px` selects `systems-hero-route-map-ai-wide-1240.png`, renders at `x=0 / y=0 / width=1240 / height=500`, `object-fit=contain`, no horizontal overflow.
- High-DPI wide: `1026px @ DPR 2` selects `systems-hero-route-map-ai-wide-2480.png`, renders at `x=0 / y=0 / width=1026 / height=413.7`, no horizontal overflow.
- Middle widths: `640/700/760/761/820px @ DPR 2` continue using the concept-derived desktop raster with live hero copy hidden, preventing fallback to the rough mobile station-card treatment.
- Mobile: `390px` still uses `systems-hero-route-map.png` for the mobile stacked layout.

**Section Metrics**

- Latest `863px` mean differences are unchanged by the wide fix: hero `3.53`, routes `13.35`, planner `18.31`, beforeAfter `17.17`, pricing `13.41`, process `17.99`, cases `18.02`, contact `19.31`, footer `16.33`.
- Latest layout metrics: pricing `top=1161.94 / height=173.52`, process `top=1335.45 / height=134.97`, cases `top=1470.42 / height=172.88`, contact `top=1643.30 / height=142`.

**Validation**

- `node .playwright-cli\capture-route-map-fix.cjs`
- `node .playwright-cli\capture-hero-breakpoints.cjs`
- `node .playwright-cli\capture-fidelity-audit.cjs`
- `node .playwright-cli\measure-section-diffs.cjs`
- `node .playwright-cli\interaction-check.cjs`
- Additional hitbox check: wide CTA hitboxes navigated to `/contact/` and `/pricing/`.

**Evidence Files**

- `.playwright-cli/wide-1240-full-route-map-fix.png`
- `.playwright-cli/wide-1240-route-map-fix.png`
- `.playwright-cli/hero-bp-1026.png`
- `.playwright-cli/hero-bp-1240.png`
- `.playwright-cli/audit-full-compare-863.png`
- `.playwright-cli/audit-focus-sections-863.png`
- `.playwright-cli/mobile-390-route-map-fix.png`
- `.playwright-cli/route-map-fix-compare.png`

final result: passed
