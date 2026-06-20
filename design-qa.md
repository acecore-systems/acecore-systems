**Findings**

- P0/P1/P2 の未解決事項はありません。
- P3: 参照のヒーロールートはさらに一枚絵として密に整っています。実装もデスクトップでは駅アイコン・ラベル込みの高解像度ラスタに寄せましたが、完全なピクセル一致ではありません。
- P3: 参照の全体高 `1822px` に対して、実装の最終 `863px` フルページは `1859px` です。差分は `37px` まで縮小しました。

**Comparison Target**

- Source visual truth: `C:\Users\gnish\.codex\attachments\ad5a08f7-6501-4cff-855a-e212532d099c\image-1.png`
- Latest user report: `C:\Users\gnish\AppData\Local\Temp\codex-clipboard-dbd79a35-3b1c-4ad6-bd57-34256032a652.png`
- Implementation URL: `http://127.0.0.1:4327/`
- Implementation screenshots:
  - `C:\Users\gnish\.codex\worktrees\d241\acecore-systems\.playwright-cli\route-map-fix-hero.png`
  - `C:\Users\gnish\.codex\worktrees\d241\acecore-systems\.playwright-cli\route-map-fix-full.png`
  - `C:\Users\gnish\.codex\worktrees\d241\acecore-systems\.playwright-cli\route-map-fix-mobile.png`
- Side-by-side comparison evidence: `C:\Users\gnish\.codex\worktrees\d241\acecore-systems\.playwright-cli\route-map-fix-side-by-side.png`
- Viewports: reference-width desktop `863x900`, user-reported wide `2052x1200`, mobile `390x844`.
- State: top page initial state, planner default selections.

**Focused Region Evidence**

- Hero route map: desktop now uses `systems-hero-route-map-labeled.png`, a `3740x1682` raster composed from the original route image with station rings, icons, numbers, and labels baked in.
- Hero route background: the separate low-opacity route-map background was removed from `.hero::before`, eliminating the visibly offset duplicate route that made the road line look jagged.
- Mobile hero route: `picture` source switches mobile back to `systems-hero-route-map.png`, while the station cards remain readable and non-overlapping.
- Route table labels: left-side route labels now include real transparent PNG icons for business, data, web, and operations routes.
- Route table density: route rows measure `58px`, matching the compact table rhythm of the reference.
- Before/After flow: a transparent PNG arrow was added between Before and After, bringing the section closer to the source's visual flow.
- Page height: final desktop full-page height is `1859px`, down from the previous `1870px` and closer to the `1822px` source.

**Required Fidelity Surfaces**

- Fonts and typography: desktop hero remains two lines; station labels are now rendered inside the hero raster at a density closer to the source. Mobile keeps live text cards for readability.
- Spacing and layout rhythm: hero height remains `402px`; route table rows are `58px`; page height is within `37px` of the source visual at `863px`.
- Colors and tokens: navy / teal / gold / white palette remains aligned with the source. The active 05 route, CTA, Web route, and header CTA keep the gold emphasis.
- Image quality and asset fidelity: generated desktop hero raster, route label icons, and flow arrow are real PNG assets, not CSS/div/SVG placeholders. The desktop hero route raster is now 2x resolution, and the offset duplicate background route is no longer layered behind it.
- Copy and content: hero, route table, planner, pricing rows, case cards, and contact copy match the selected concept direction.

**Rendered QA**

- Page identity: `http://127.0.0.1:4327/`, title `業務システム・アプリ開発 | Acecore Systems`.
- Blank-page check: desktop, wide, and mobile all render first meaningful content.
- Framework overlay: Astro dev toolbar is disabled in local dev and `astro-dev-toolbar=false` in captured DOM checks.
- Console health: final screenshots captured no `warning` or `error` logs.
- Overflow: desktop `scrollWidth=848` at `863px` viewport, mobile `scrollWidth=375` at `390px` viewport; no horizontal overflow.
- Hero map source: desktop and wide use `systems-hero-route-map-labeled.png`; mobile uses `systems-hero-route-map.png`.
- Hero route raster size: desktop image reports `naturalWidth=3740`, `naturalHeight=1682`; rendered size is `760x341.79`.
- Hero background route: `.hero::before` reports a gradient only, no route-map URL, so the foreground route is not doubled.
- Route label icons: 4 PNG icons loaded, one for each route label.
- Flow arrow: desktop arrow is horizontal between Before and After; mobile arrow is centered and rotated downward.
- Mobile station layout: `.route-stations` display is `grid`; desktop display is `none` because the labels are baked into the raster.

**Patches Made Since Previous QA**

- Added `systems-hero-route-map-labeled.png`, a high-resolution desktop hero route raster with station icons and labels.
- Regenerated `systems-hero-route-map-labeled.png` at 2x output resolution (`3740x1682`) so browser downscaling stays smooth.
- Removed the route-map URL from the hero pseudo-background to stop the foreground and background roads from appearing offset.
- Switched the hero image to a `picture` element so mobile keeps the unlabeled route map and card-based station labels.
- Added route table PNG icons: `route-icon-business.png`, `route-icon-data.png`, `route-icon-web.png`, `route-icon-ops.png`.
- Updated route label markup and CSS so icon labels remain compact at `58px` row height.
- Added `flow-arrow.png` and placed it between Before and After; mobile rotates it downward for the stacked layout.
- Kept Astro dev toolbar disabled for clean local design QA captures.

**Validation**

- Browser visual checks passed at `863x900` and mobile `390x900`.
- Saved in-app browser screenshots passed at `863x900`, full-page desktop, and `390x900`.
- Browser metrics: no horizontal overflow, no Astro dev toolbar, correct desktop/mobile hero image source, no duplicate route-map URL in hero background.

**Follow-up Polish**

- The desktop hero map is now much closer to the concept, but exact placement of every station ring, map texture, and label is still not pixel-identical.
- Remaining visual polish would be a final pixel pass on hero station coordinates and text sizing after any user preference check.

final result: passed
