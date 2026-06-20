**Findings**

- P0/P1/P2 の未解決事項はありません。
- P3: ページ全体高さは参照 `1822px` に対して実装 `1821px` で、差分は `1px` です。
- P3: デスクトップのヒーローはコンセプトヒーローをラスタとして表示し、リンク要素を透明オーバーレイとして残しています。見た目の再現度を優先したため、今後の編集性を高めるならテキスト・ナビを再びHTMLで精密配置する余地があります。

**Comparison Target**

- Source visual truth: `C:\Users\gnish\.codex\attachments\ad5a08f7-6501-4cff-855a-e212532d099c\image-1.png`
- Latest user report: `C:\Users\gnish\AppData\Local\Temp\codex-clipboard-dbd79a35-3b1c-4ad6-bd57-34256032a652.png`
- Implementation URL: `http://127.0.0.1:4327/`
- Implementation screenshots:
  - `C:\Users\gnish\.codex\worktrees\d241\acecore-systems\.playwright-cli\hero-compare-concept-route.png`
  - `C:\Users\gnish\.codex\worktrees\d241\acecore-systems\.playwright-cli\full-compare-concept-route-current.png`
  - `C:\Users\gnish\.codex\worktrees\d241\acecore-systems\.playwright-cli\desktop-863-concept-route.png`
  - `C:\Users\gnish\.codex\worktrees\d241\acecore-systems\.playwright-cli\wide-1240-concept-route.png`
  - `C:\Users\gnish\.codex\worktrees\d241\acecore-systems\.playwright-cli\mobile-390-concept-route.png`
- Viewports: reference-width desktop `863x900`, wide desktop `1240x900`, mobile `390x844`.
- State: top page initial state, planner default selections.

**Focused Region Evidence**

- Hero route map: desktop now uses the concept hero crop as a raster. `systems-hero-route-map-concept.png` is the exact `863x405` crop; `systems-hero-route-map-concept-2x.png` is available via `srcset` for wider desktop captures.
- Hero route placement: at the `863px` comparison width, the hero image renders at `x=0 / y=0 / width=863 / height=405`, matching the concept canvas.
- Wide route guard: at `1240px`, the image renders at `x=0 / width=1240 / height=405` and selects `systems-hero-route-map-concept-2x.png`, so the route no longer stops at `863px` or leaves a blank right side.
- Route stability: desktop route layer has `transform: none`, `mask: none`, and no generated SVG/CSS route overlay. The previous masking and rectangle cleanup that caused jagged-looking gaps has been removed.
- Desktop live controls: header links and hero CTA links remain in the DOM and clickable, but are transparent above the raster hero to avoid double-rendered text.
- Mobile guard: the mobile `picture` source still switches to `systems-hero-route-map.png`; mobile does not inherit the desktop raster hero overlay.
- Planner ratio: the planner grid remains close to the concept, with the wider right recommendation card preserved from the previous pass.
- Before/After flow: the card and illustration columns remain rebalanced from the previous pass, matching the concept's wider line-art presence.

**Rendered QA**

- Page identity: `http://127.0.0.1:4327/`, title `業務システム・アプリ開発 | Acecore Systems`.
- Blank-page check: desktop and mobile render first meaningful content.
- Overflow: desktop `scrollWidth=863` at `863px`; mobile `scrollWidth=390` at `390px`; no horizontal overflow.
- Final desktop page height: implementation `1821px` versus source `1822px`.
- Hero map source: desktop `863px` uses `systems-hero-route-map-concept.png`; wide `1240px` uses `systems-hero-route-map-concept-2x.png`; mobile uses `systems-hero-route-map.png`.
- Hero route metrics: desktop `863px` image reports `naturalWidth=863`, `naturalHeight=405`; rendered size is `863x405`.
- Wide route metrics: desktop `1240px` image renders `1240x405`; source selected is the `2x` asset.
- Header metric: brand hitbox remains at `x=26`, `y=15`, `width=162.52`, `height=24`.
- Mobile guard: final `390px` capture uses the mobile route source, with `transform: none`, `mask: none`, and `scrollWidth=390`.

**Patches Made Since Previous QA**

- Regenerated the desktop hero route asset from the concept hero crop instead of trying to mask out individual route/text regions.
- Added `systems-hero-route-map-concept-2x.png` and `srcset` so wide desktop viewports can select a higher-resolution route raster.
- Changed the desktop hero image from `min(100vw, 863px)` to full viewport width at fixed `405px` height, removing the blank right side on wide screens.
- Hid desktop header/copy visual layers over the hero while keeping their links in place, preventing duplicate text and restoring the concept route map appearance.
- Updated hero lead copy to match the concept wording; mobile still renders it as live text.
- Rebuilt `hero-compare-concept-route.png`, `full-compare-concept-route-current.png`, `desktop-863-concept-route.png`, `wide-1240-concept-route.png`, and `mobile-390-concept-route.png`.

**Validation**

- Browser visual checks passed at desktop `863x900`, wide desktop `1240x900`, and mobile `390x844`.
- Saved comparison evidence: `hero-compare-concept-route.png`, `full-compare-concept-route-current.png`, and `wide-1240-concept-route.png`.
- Browser metrics: no horizontal overflow, correct desktop/wide/mobile hero image source, no desktop transform/mask on the route image.

final result: passed
