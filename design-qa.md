**Findings**

- P0/P1/P2 の未解決事項はありません。
- P3: 参照のヒーロールートはさらに一枚絵として密に整っています。実装もデスクトップでは駅アイコン・ラベル込みの高解像度ラスタに寄せましたが、完全なピクセル一致ではありません。
- P3: 参照の全体高 `1822px` に対して、実装の最終 `863px` フルページは `1832px` です。差分は `10px` まで縮小しました。

**Comparison Target**

- Source visual truth: `C:\Users\gnish\.codex\attachments\ad5a08f7-6501-4cff-855a-e212532d099c\image-1.png`
- Latest user report: `C:\Users\gnish\AppData\Local\Temp\codex-clipboard-dbd79a35-3b1c-4ad6-bd57-34256032a652.png`
- Implementation URL: `http://127.0.0.1:4327/`
- Implementation screenshots:
  - `C:\Users\gnish\.codex\worktrees\d241\acecore-systems\.playwright-cli\route-final-863-hero-latest.png`
  - `C:\Users\gnish\.codex\worktrees\d241\acecore-systems\.playwright-cli\route-final-1240-hero-latest.png`
  - `C:\Users\gnish\.codex\worktrees\d241\acecore-systems\.playwright-cli\route-final-863-full-latest.png`
  - `C:\Users\gnish\.codex\worktrees\d241\acecore-systems\.playwright-cli\rhythm-top900.png`
  - `C:\Users\gnish\.codex\worktrees\d241\acecore-systems\.playwright-cli\rhythm-mid.png`
  - `C:\Users\gnish\.codex\worktrees\d241\acecore-systems\.playwright-cli\contact-bottom.png`
  - `C:\Users\gnish\.codex\worktrees\d241\acecore-systems\.playwright-cli\final-page-stitched.png`
- Side-by-side comparison evidence: `C:\Users\gnish\.codex\worktrees\d241\acecore-systems\.playwright-cli\final-page-side-by-side.png`
- Viewports: reference-width desktop `863x900`, user-reported wide `2052x1200`, mobile `390x844`.
- State: top page initial state, planner default selections.

**Focused Region Evidence**

- Hero route map: desktop now uses `systems-hero-route-map-labeled.png`, a `3740x1682` raster composed from the original route image with station rings, icons, numbers, and labels baked in.
- Hero route placement: after the latest user report, the desktop route raster was rebalanced to `x=105 / width=760 / bottom=389.8` at the `863px` reference viewport, so 01〜06 and the flag fit without the right side being cut off.
- Hero route edge quality: the foreground route image now fades at both the left and right edges (`18%` and `96%`) so the dark map rectangle does not create a hard seam against the hero background.
- Header mark: the brand mark now uses a transparent PNG mask extracted from the concept, so it matches the source mark more closely while still inheriting white/navy color by page context.
- Hero route background: the separate low-opacity route-map background was removed from `.hero::before`, eliminating the visibly offset duplicate route that made the road line look jagged.
- Mobile hero route: `picture` source switches mobile back to `systems-hero-route-map.png`, while the station cards remain readable and non-overlapping.
- Route table labels: left-side route labels now include real transparent PNG icons for business, data, web, and operations routes.
- Route table density: route rows now measure about `52.6px`, matching the compact table rhythm of the reference.
- Before/After flow: a transparent PNG arrow was added between Before and After, bringing the section closer to the source's visual flow.
- Before/After heading: the side heading is now an intentional two-line heading, matching the reference instead of wrapping into three broken lines.
- Contact band: the form, right-side contact methods, icon treatment, and one-line footer were tightened to match the source's lower section.
- Mobile contact band: the desktop three-column contact grid is explicitly reset to one column, keeping the LINE/mail card inside the viewport.
- Page height: final desktop full-page height is `1832px`, down from the previous `1859px` and within `10px` of the `1822px` source.

**Required Fidelity Surfaces**

- Fonts and typography: desktop hero remains two lines; station labels are now rendered inside the hero raster at a density closer to the source. Mobile keeps live text cards for readability.
- Spacing and layout rhythm: hero height remains `402px`; route table rows are about `52.6px`; page height is within `10px` of the source visual at `863px`.
- Colors and tokens: navy / teal / gold / white palette remains aligned with the source. The active 05 route, CTA, Web route, and header CTA keep the gold emphasis.
- Image quality and asset fidelity: generated desktop hero raster, header mark mask, route label icons, contact icons, and flow arrow are real PNG assets, not CSS/div/SVG placeholders. The desktop hero route raster is now 2x resolution, and the offset duplicate background route is no longer layered behind it.
- Copy and content: hero, route table, planner, pricing rows, case cards, and contact copy match the selected concept direction.

**Rendered QA**

- Page identity: `http://127.0.0.1:4327/`, title `業務システム・アプリ開発 | Acecore Systems`.
- Blank-page check: desktop, wide, and mobile all render first meaningful content.
- Framework overlay: Astro dev toolbar is disabled in local dev and `astro-dev-toolbar=false` in captured DOM checks.
- Console health: final screenshots captured no `warning` or `error` logs.
- Overflow: desktop `scrollWidth=848` at `863px` viewport, mobile `scrollWidth=375` at `390px` viewport; no horizontal overflow.
- Final stitched page size: implementation `863x1832` versus source `863x1822`.
- Header mark: `acecore-mark-mask.png` is applied through CSS mask, measuring `22x24px` on desktop and rendering white on the home hero / navy on normal pages.
- Hero map source: desktop and wide use `systems-hero-route-map-labeled.png`; mobile uses `systems-hero-route-map.png`.
- Hero route raster size: desktop image reports `naturalWidth=3740`, `naturalHeight=1682`; rendered size is `760x341.79` at `863px` and `793.59x356.90` at `1240px`.
- Hero route position: `863px` capture has `x=105.08`, `right=865.08`, `bottom=389.79`, `scrollWidth=863`; `1240px` capture has `x=208.01`, `right=1001.60`, `bottom=392.74`, `scrollWidth=1240`.
- Hero route seam control: computed mask is `transparent 0 / solid 18%〜96% / transparent 100%`, preventing a hard right edge on the map raster.
- Hero background route: `.hero::before` reports a gradient only, no route-map URL, so the foreground route is not doubled.
- Route label icons: 4 PNG icons loaded, one for each route label.
- Contact icons: 2 PNG icons loaded for LINE and mail contact methods.
- Flow arrow: desktop arrow is horizontal between Before and After; mobile arrow is centered and rotated downward.
- Mobile station layout: `.route-stations` display is `grid`; desktop display is `none` because the labels are baked into the raster.
- Mobile contact layout: contact grid, form, and contact methods render in one column with `scrollWidth=375`.

**Patches Made Since Previous QA**

- Added `systems-hero-route-map-labeled.png`, a high-resolution desktop hero route raster with station icons and labels.
- Added `acecore-mark-mask.png` and changed the header brand mark from a plain text glyph to a PNG-backed mask.
- Rebalanced desktop hero route placement after the latest "ガタガタ" report: width now scales from `760px` at the reference viewport, the image starts farther left, and the route is vertically contained in the `402px` hero.
- Added a right-edge fade to `.hero-route-map` so the raster blends into the navy background instead of ending in a visible rectangle.
- Regenerated `systems-hero-route-map-labeled.png` at 2x output resolution (`3740x1682`) so browser downscaling stays smooth.
- Removed the route-map URL from the hero pseudo-background to stop the foreground and background roads from appearing offset.
- Switched the hero image to a `picture` element so mobile keeps the unlabeled route map and card-based station labels.
- Added route table PNG icons: `route-icon-business.png`, `route-icon-data.png`, `route-icon-web.png`, `route-icon-ops.png`.
- Updated route label markup and CSS so icon labels remain compact at about `52.6px` row height.
- Raised the hero copy and tuned the route-section spacing so the first viewport aligns more closely to the reference.
- Tuned Before/After heading wrapping to match the reference's two-line treatment.
- Added `flow-arrow.png` and placed it between Before and After; mobile rotates it downward for the stacked layout.
- Added `contact-icon-line.png` and `contact-icon-mail.png`, then rebuilt the contact methods as a compact icon card.
- Simplified the homepage footer to a single-line brand / nav / copyright layout.
- Added a mobile override for the homepage contact grid so desktop columns do not push the contact card off screen.
- Kept Astro dev toolbar disabled for clean local design QA captures.

**Validation**

- Browser visual checks passed at `863x900`, `1240x900`, and mobile `390x900`.
- Saved in-app browser screenshots passed at `863x900` hero, `1240x900` hero, stitched full-page desktop, middle-section crop, bottom-section crop, mobile bottom crop, normal-page header crop, and `390x900`.
- Browser metrics: no horizontal overflow, no Astro dev toolbar, correct desktop/mobile hero image source, no duplicate route-map URL in hero background.

**Follow-up Polish**

- The desktop hero map is now much closer to the concept, but exact placement of every station ring, map texture, and label is still not pixel-identical.
- Remaining visual polish would be a final pixel pass on hero station coordinates and text sizing after any user preference check.

final result: passed
