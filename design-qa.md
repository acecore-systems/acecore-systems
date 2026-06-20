**Findings**

- P0/P1/P2 の未解決事項はありません。
- P3: ヒーロー以外の全体高さは参照 `1822px` に対して実装 `1850px` で、まだ完全なピクセル一致ではありません。
- P3: ルートマップはコンセプト由来のラスタへ切り替え、道路形状・駅リング・旗・ラベルのガタつきは解消しました。

**Comparison Target**

- Source visual truth: `C:\Users\gnish\.codex\attachments\ad5a08f7-6501-4cff-855a-e212532d099c\image-1.png`
- Latest user report: `C:\Users\gnish\AppData\Local\Temp\codex-clipboard-dbd79a35-3b1c-4ad6-bd57-34256032a652.png`
- Implementation URL: `http://127.0.0.1:4327/`
- Implementation screenshots:
  - `C:\Users\gnish\.codex\worktrees\d241\acecore-systems\.playwright-cli\hero-compare-concept-route.png`
  - `C:\Users\gnish\.codex\worktrees\d241\acecore-systems\.playwright-cli\current-863-hero-concept-route.png`
  - `C:\Users\gnish\.codex\worktrees\d241\acecore-systems\.playwright-cli\desktop-863-concept-route.png`
  - `C:\Users\gnish\.codex\worktrees\d241\acecore-systems\.playwright-cli\wide-1240-concept-route.png`
  - `C:\Users\gnish\.codex\worktrees\d241\acecore-systems\.playwright-cli\mobile-390-concept-route.png`
- Viewports: reference-width desktop `863x900`, wide desktop `1240x900`, mobile `390x844`.
- State: top page initial state, planner default selections.

**Focused Region Evidence**

- Hero route map: desktop now uses `systems-hero-route-map-concept.png`, a `1726x810` 2x raster derived from the concept hero top area.
- Hero route placement: desktop renders the route layer at `x=0 / y=0 / width=863 / height=405` in the `863px` comparison capture, so the route geometry uses the same canvas as the concept.
- Wide route guard: `1240px` capture keeps the desktop route at `x=0 / width=863 / bottom=405`, so the route is not vertically enlarged or clipped on wider screens.
- Hero route stability: desktop route layer now has `transform: none` and `mask: none`; the earlier stretched/compressed generated line is no longer used.
- Text overlap handling: the concept raster removes the bright header/copy/button pixels in the areas covered by live DOM text and controls, while preserving the map and route artwork behind them.
- Header mark: the brand mark still uses `acecore-mark-mask.png`; the final desktop capture places the brand at `x=26`, matching the concept margin.
- Mobile hero route: the `picture` source still switches mobile to `systems-hero-route-map.png`; mobile does not inherit the desktop full-width concept overlay.
- Route table labels: left-side route labels use transparent PNG icons for business, data, web, and operations routes.
- Contact band: the form, right-side contact methods, icon treatment, and footer remain tightened from the earlier comparison pass.

**Rendered QA**

- Page identity: `http://127.0.0.1:4327/`, title `業務システム・アプリ開発 | Acecore Systems`.
- Blank-page check: desktop and mobile render first meaningful content.
- Overflow: desktop `scrollWidth=863` at `863px`; mobile `scrollWidth=390` at `390px`; no horizontal overflow.
- Final desktop page height: implementation `1850px` versus source `1822px`.
- Hero map source: desktop uses `systems-hero-route-map-concept.png`; mobile uses `systems-hero-route-map.png`.
- Hero route metrics: desktop image reports `naturalWidth=1726`, `naturalHeight=810`; rendered size is `863x405`.
- Hero route position: desktop capture has `x=0`, `right=863`, `bottom=405`, `transform=none`, `mask=none`.
- Header metric: brand `x=26`, `y=15`, `width=162.52`, `height=24`.
- Mobile guard: final `390px` capture uses the mobile route source, with `transform: none`, `mask: none`, and `scrollWidth=390`.

**Patches Made Since Previous QA**

- Replaced the desktop generated route raster with `systems-hero-route-map-concept.png`, based on the concept hero artwork.
- Deleted the stale generated desktop asset `systems-hero-route-map-labeled.png`.
- Changed desktop route positioning from a right-column stretched image to a full-width absolute overlay aligned to the viewport.
- Removed desktop route mask and transform to avoid jagged/stretched route geometry.
- Kept the mobile route source and mobile card layout unchanged.
- Adjusted the home header container so the logo starts at the concept-like `26px` margin.

**Validation**

- Browser visual checks passed at desktop `863x900`, wide desktop `1240x900`, and mobile `390x844`.
- Saved comparison evidence: `hero-compare-concept-route.png`.
- Browser metrics: no horizontal overflow, correct desktop/mobile hero image source, no desktop transform/mask on the route image.

final result: passed
