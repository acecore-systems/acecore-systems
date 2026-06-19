**Findings**

- P0/P1/P2 の未解決事項はありません。
- P3: 参照のヒーロールートはさらに一枚絵として密に整っています。実装もデスクトップでは駅アイコン・ラベル込みの高解像度ラスタに寄せましたが、完全なピクセル一致ではありません。
- P3: 参照の全体高 `1822px` に対して、実装の最終 `863px` フルページは `1870px` です。差分は `48px` まで縮小しました。

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

- Hero route map: desktop now uses `systems-hero-route-map-labeled.png`, a high-resolution raster composed from the original route image with station rings, icons, numbers, and labels baked in.
- Mobile hero route: `picture` source switches mobile back to `systems-hero-route-map.png`, while the station cards remain readable and non-overlapping.
- Route table labels: left-side route labels now include real transparent PNG icons for business, data, web, and operations routes.
- Route table density: route rows measure `58px`, matching the compact table rhythm of the reference.
- Page height: final desktop full-page height is `1870px`, down from the previous `1885px` and much closer to the `1822px` source.

**Required Fidelity Surfaces**

- Fonts and typography: desktop hero remains two lines; station labels are now rendered inside the hero raster at a density closer to the source. Mobile keeps live text cards for readability.
- Spacing and layout rhythm: hero height remains `402px`; route table rows are `58px`; page height is within `48px` of the source visual at `863px`.
- Colors and tokens: navy / teal / gold / white palette remains aligned with the source. The active 05 route, CTA, Web route, and header CTA keep the gold emphasis.
- Image quality and asset fidelity: generated desktop hero raster and route label icons are real PNG assets, not CSS/div/SVG placeholders. The previous jagged low-resolution crop is not used.
- Copy and content: hero, route table, planner, pricing rows, case cards, and contact copy match the selected concept direction.

**Rendered QA**

- Page identity: `http://127.0.0.1:4327/`, title `業務システム・アプリ開発 | Acecore Systems`.
- Blank-page check: desktop, wide, and mobile all render first meaningful content.
- Framework overlay: Astro dev toolbar is disabled in local dev and `astro-dev-toolbar=false` in captured DOM checks.
- Console health: final screenshots captured no `warning` or `error` logs.
- Overflow: desktop `scrollWidth=863`, wide `scrollWidth=2052`, mobile `scrollWidth=390`.
- Hero map source: desktop and wide use `systems-hero-route-map-labeled.png`; mobile uses `systems-hero-route-map.png`.
- Route label icons: 4 PNG icons loaded, one for each route label.
- Mobile station layout: `.route-stations` display is `grid`; desktop display is `none` because the labels are baked into the raster.

**Patches Made Since Previous QA**

- Added `systems-hero-route-map-labeled.png`, a high-resolution desktop hero route raster with station icons and labels.
- Switched the hero image to a `picture` element so mobile keeps the unlabeled route map and card-based station labels.
- Added route table PNG icons: `route-icon-business.png`, `route-icon-data.png`, `route-icon-web.png`, `route-icon-ops.png`.
- Updated route label markup and CSS so icon labels remain compact at `58px` row height.
- Kept Astro dev toolbar disabled for clean local design QA captures.

**Validation**

- Browser visual checks passed at `863x900` and mobile `390x844`.
- Saved Playwright screenshots passed at `863x900`, full-page `863px`, `2052x1200`, and `390x844`.
- Playwright metrics: no console errors/warnings, no horizontal overflow, no Astro dev toolbar, correct desktop/mobile hero image source.

**Follow-up Polish**

- The desktop hero map is now much closer to the concept, but exact placement of every station ring, map texture, and label is still not pixel-identical.
- Remaining visual polish would be a final pixel pass on hero station coordinates and text sizing after any user preference check.

final result: passed
