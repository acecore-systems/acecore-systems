**Findings**

- P0/P1/P2 の未解決事項はありません。
- P3: 参照コンセプトのヒーロールートは、駅アイコンと一部ラベルが一枚絵として統合された高密度ビジュアルです。実装は高解像度ルート画像にHTMLラベルを重ねているため、ピクセル完全一致ではありません。
- P3: 参照の全体高 `1822px` に対して、実装の最終 `863px` フルページは `1885px` です。下層セクションの実テキスト量とレスポンシブ可読性を優先しています。

**Comparison Target**

- Source visual truth: `C:\Users\gnish\.codex\attachments\ad5a08f7-6501-4cff-855a-e212532d099c\image-1.png`
- Latest user report: `C:\Users\gnish\AppData\Local\Temp\codex-clipboard-dbd79a35-3b1c-4ad6-bd57-34256032a652.png`
- Implementation URL: `http://127.0.0.1:4327/`
- Implementation screenshots:
  - `C:\Users\gnish\.codex\worktrees\d241\acecore-systems\.playwright-cli\route-final-863.png`
  - `C:\Users\gnish\.codex\worktrees\d241\acecore-systems\.playwright-cli\route-final-863-full.png`
  - `C:\Users\gnish\.codex\worktrees\d241\acecore-systems\.playwright-cli\route-final-wide.png`
  - `C:\Users\gnish\.codex\worktrees\d241\acecore-systems\.playwright-cli\route-final-mobile.png`
- Side-by-side comparison evidence: `C:\Users\gnish\.codex\worktrees\d241\acecore-systems\.playwright-cli\route-final-side-by-side.png`
- Viewports: reference-width desktop `863x900`, user-reported wide `2052x1200`, mobile `390x844`.
- State: top page initial state, planner default selections.

**Focused Region Evidence**

- Hero route map: low-resolution concept crop was removed. `systems-hero-route-map.png` is used again as the high-resolution base asset.
- Route stability: desktop and wide map sizing now use `--route-map-left`, `--route-map-top`, and `--route-map-width` tuned to keep the route inside the hero without clipping.
- Station labels: 01〜06 labels are image-relative and have zero bounding-box overlap at `863px`, `2052px`, and `390px`.
- Wide viewport: `2052px` capture no longer clips station 01 or the lower route line.
- Mobile viewport: station labels use the card grid treatment and do not overlap the route background.

**Required Fidelity Surfaces**

- Fonts and typography: desktop hero remains two lines; mobile wraps naturally. Route labels are intentionally compact like the reference and no longer collide.
- Spacing and layout rhythm: hero height remains `402px`; map bottom is contained at desktop and wide sizes. Full-page density is within `63px` of the source visual at `863px`.
- Colors and tokens: navy / teal / gold / white palette remains aligned with the source. Active route, CTA, Web route, and header CTA all keep gold emphasis.
- Image quality and asset fidelity: high-resolution route raster is used instead of the processed 590px crop, removing the visible jagged/rectangular artifacts.
- Copy and content: hero, route table, planner, pricing rows, case cards, and contact copy match the selected concept direction.

**Rendered QA**

- Page identity: `http://127.0.0.1:4327/`, title `業務システム・アプリ開発 | Acecore Systems`.
- Blank-page check: desktop, wide, and mobile all render first meaningful content.
- Framework overlay: Astro dev toolbar is disabled in local dev and `astro-dev-toolbar=false` in captured DOM checks.
- Console health: final screenshots captured no `warning` or `error` logs.
- Overflow: desktop `scrollWidth=863`, wide `scrollWidth=2052`, mobile `scrollWidth=390`.
- Route label overlap: desktop `[]`, wide `[]`, mobile `[]`.
- Interaction proof: planner checkbox count `9`; first checkbox changed from `false` to `true`; no warning/error logs after interaction.
- Browser path: in-app Browser was used for live visual checks. Screenshot file saving through Browser failed with `EPERM`, so saved evidence was captured with Playwright Chromium after the Browser pass.

**Patches Made Since Previous QA**

- Reverted hero map from the low-resolution concept crop to the high-resolution route raster.
- Removed the generated temporary concept crop asset from the working tree.
- Re-enabled desktop station labels and retuned their coordinates against the image, not the route container.
- Reduced station label width and type size enough to prevent overlap while retaining readability.
- Adjusted route max width and top offset so wide desktop no longer clips station 01 or the route line.
- Disabled the Astro dev toolbar in `astro.config.mjs` so local design QA screenshots are clean.
- Kept mobile route labels in the existing grid treatment to avoid cramped overlay text.

**Validation**

- Browser visual checks passed at `863x900`, `2052x1200`, and `390x844`.
- Saved Playwright screenshots passed at `863x900`, full-page `863px`, `2052x1200`, and `390x844`.
- Playwright metrics: no console errors/warnings, no horizontal overflow, no route-label overlap, no Astro dev toolbar.

**Follow-up Polish**

- For stricter pixel fidelity, produce a dedicated hero-route bitmap that bakes station icons and labels at high resolution. That would match the concept more closely, but would reduce live text accessibility and responsive control.
- Service-route row icons remain simplified compared with the concept and can be polished in a separate asset/icon pass.

final result: passed
