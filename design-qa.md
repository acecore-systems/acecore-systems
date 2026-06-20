**Findings**

- P0/P1/P2 の未解決事項はありません。
- P3: ページ全体高さは参照 `1822px` に対して実装も `1822px` です。
- P3: デスクトップのヒーローはコンセプトヒーローをラスタとして表示し、リンク要素を透明オーバーレイとして残しています。見た目の再現度を優先したため、今後の編集性を高めるならテキスト・ナビを再びHTMLで精密配置する余地があります。
- P3: デスクトップ/ワイド用のヒーローは今回のパスで3xラスタへ切り替えました。`863x405` と `1240x405` の表示サイズは変えず、より大きいPNGを縮小表示してルート線の段差感を抑えています。
- P3: Before/Afterの右イラストは `object-fit: contain` で人物と画面を含む全体構図を表示し、今回のパスで線画の薄さも `opacity` と `contrast()` で参照に近づけました。
- P3: 問い合わせ帯は入力欄・送信ボタン・相談方法ボタンのサイズと文字ウェイトを落とし、今回のパスで左説明・中央フォーム・右連絡枠の3カラム比率も参照へ寄せました。帯の高さは `138px` に固定して参照の縦リズムを維持しています。
- P3: ルート表はセル文字を落ち着いた濃紺に戻し、今回のパスで本文ウェイトも落として、矢印だけをルート色にする参照の情報密度へさらに近づけました。
- P3: プランナー、料金表、開発ステップ、事例カードは今回のパスで文字ウェイトをさらに落とし、参照より黒く重く見えていた中盤下部のトーンを軽くしました。
- P3: セクション見出しは今回のパスで `font-weight: 840` まで落とし、通常セクションの余白を1px戻して、参照と同じページ高のまま黒く強すぎる見出しトーンを抑えました。

**Comparison Target**

- Source visual truth: `C:\Users\gnish\.codex\attachments\ad5a08f7-6501-4cff-855a-e212532d099c\image-1.png`
- Latest user report: `C:\Users\gnish\AppData\Local\Temp\codex-clipboard-dbd79a35-3b1c-4ad6-bd57-34256032a652.png`
- Implementation URL: `http://127.0.0.1:4321/`
- Implementation screenshots:
  - `C:\Users\gnish\.codex\worktrees\d241\acecore-systems\.playwright-cli\hero-compare-concept-route.png`
  - `C:\Users\gnish\.codex\worktrees\d241\acecore-systems\.playwright-cli\full-compare-concept-route-current.png`
  - `C:\Users\gnish\.codex\worktrees\d241\acecore-systems\.playwright-cli\desktop-863-concept-route.png`
  - `C:\Users\gnish\.codex\worktrees\d241\acecore-systems\.playwright-cli\focus-planner-compare.png`
  - `C:\Users\gnish\.codex\worktrees\d241\acecore-systems\.playwright-cli\wide-1240-route-map-fix.png`
  - `C:\Users\gnish\.codex\worktrees\d241\acecore-systems\.playwright-cli\route-map-fix-compare.png`
  - `C:\Users\gnish\.codex\worktrees\d241\acecore-systems\.playwright-cli\mobile-390-route-map-fix.png`
  - `C:\Users\gnish\.codex\worktrees\d241\acecore-systems\.playwright-cli\audit-full-compare-863.png`
  - `C:\Users\gnish\.codex\worktrees\d241\acecore-systems\.playwright-cli\audit-focus-sections-863.png`
  - `C:\Users\gnish\.codex\worktrees\d241\acecore-systems\.playwright-cli\mobile-390-concept-route.png`
- Viewports: reference-width desktop `863x900`, wide desktop `1240x900`, mobile `390x844`.
- State: top page initial state, planner default selections.
- Browser availability: in-app Browser setup failed with `sandboxPolicy` metadata error; Playwright-managed Chromium fallback was used for rendered QA.

**Focused Region Evidence**

- Hero route map: desktop now uses concept-derived 3x rasters. `863px` uses a `2589x1215` concept crop scaled to `863x405`; `1240px` uses a dedicated `3720x1215` non-distorted wide crop scaled to `1240x405`.
- Hero route placement: at the `863px` comparison width, the hero image renders at `x=0 / y=0 / width=863 / height=405`, matching the concept canvas.
- Wide route guard: at `1240px`, the image renders at `x=0 / y=0 / width=1240 / height=405` and selects `systems-hero-route-map-wide-3x.png`, so the route is no longer horizontally distorted by `object-fit: fill` or roughened by lower-resolution raster sampling.
- Route stability: desktop route layer has `transform: none`, `mask: none`, and `object-fit: cover`; no generated SVG/CSS route overlay is used. The previous masking and rectangle cleanup that caused jagged-looking gaps has been removed.
- Route table tone: route table body text now stays on the dark text token while the connector lines carry the route accent color, matching the concept more closely than the previous all-colored cell text.
- Mid/lower typography tone: route table cells, planner tabs/options, route-brief numbers, pricing values, process labels, and case-card headings now use lighter weights without changing their grid dimensions.
- Desktop live controls: header links and hero CTA links remain in the DOM and clickable, but are transparent above the raster hero to avoid double-rendered text.
- Mobile guard: the mobile `picture` source still switches to `systems-hero-route-map.png`; mobile does not inherit the desktop raster hero overlay.
- Planner ratio: the planner grid remains close to the concept, with the wider right recommendation card preserved from the previous pass.
- Before/After flow: the section now has a dedicated `change-section` desktop rhythm; Before/After cards are narrower, the right illustration uses `object-fit: contain` so both people and the dashboard remain visible, and the section is taller so the pricing block no longer rides up as aggressively.
- Before/After illustration tone: the workflow illustration now uses higher opacity and slight contrast to avoid the washed-out look from the previous pass while preserving the full-image framing.
- Mid/lower density: pricing table, process line, and case cards use lighter weights and slightly smaller supporting text, reducing the heavier implementation tone visible in the previous comparison.
- Section heading tone: top-level section headings now use a smaller size and lighter `840` weight; the homepage section padding was adjusted to keep the final `1822px` page height aligned with the reference.
- Surface tone: route/white sections now use `#fbfcfd` instead of pure white, reducing the hard white contrast against the concept's slightly gray section surfaces.
- Process line: the process section now uses the concept's heading, lead copy, step titles, and visible number sequence instead of reusing the hero route steps.
- Contact band: the home quick form no longer renders as a translucent card; inputs sit directly on the dark route-map band like the concept. The latest pass narrowed the desktop form column and widened the left copy column so the three-column proportions align more closely with the reference, while keeping the band at `138px`.
- Planner options: the checklist now uses the concept's 8 visible options in row-major order, with the same checked items as the reference.
- Planner route brief: the recommendation list body copy and number colors now follow the concept more closely.

**Rendered QA**

- Page identity: `http://127.0.0.1:4321/`, title `業務システム・アプリ開発 | Acecore Systems`.
- Blank-page check: desktop and mobile render first meaningful content.
- Overflow: desktop `scrollWidth=863` at `863px`; mobile `scrollWidth=390` at `390px`; no horizontal overflow.
- Final desktop page height: implementation `1822px` versus source `1822px`.
- Hero map source: desktop `863px` uses `systems-hero-route-map-concept-3x.png`; wide `1240px` uses `systems-hero-route-map-wide-3x.png`; mobile uses `systems-hero-route-map.png`.
- Hero route metrics: desktop `863px` image reports `naturalWidth=2589`, `naturalHeight=1215`; rendered size is `863x405`.
- Wide route metrics: desktop `1240px` image reports `naturalWidth=3720`, `naturalHeight=1215`; rendered size is `1240x405`.
- Contact metric: desktop contact band reports `height=138px` after the form controls were visually reduced.
- Header metric: brand hitbox remains at `x=26`, `y=15`, `width=162.52`, `height=24`.
- Mobile guard: final `390px` capture uses the mobile route source, with `transform: none`, `mask: none`, and `scrollWidth=390`.
- Focused Before/After evidence: `audit-focus-sections-863.png` was rebuilt after rebalancing card widths, right illustration size/position, and the section's desktop vertical rhythm.
- Focused workflow illustration evidence: `audit-focus-sections-863.png` was rebuilt after increasing illustration opacity/contrast.
- Focused route-table evidence: `audit-focus-sections-863.png` was rebuilt after separating route-cell text color from route connector accent color.
- Focused heading evidence: `audit-full-compare-863.png` and `audit-focus-sections-863.png` were rebuilt after reducing section heading weight.
- Focused process evidence: `focus-process-cases-compare.png` was rebuilt after aligning the process heading and step content to the concept.
- Focused lower-page evidence: `audit-focus-sections-863.png` was rebuilt again after lowering route table, planner, pricing, process, and case-card font weights without changing section heights.
- Focused contact evidence: `audit-focus-sections-863.png` was rebuilt after narrowing the desktop quick-form column and preserving the band height at `138px`.
- Focused planner evidence: `focus-planner-compare.png` was rebuilt after aligning checklist copy, order, and default checked state.

**Patches Made Since Previous QA**

- Regenerated the desktop hero route asset from the concept hero crop instead of trying to mask out individual route/text regions.
- Added `systems-hero-route-map-wide.png` and `systems-hero-route-map-wide-2x.png` so `1240px` desktop viewports use a non-distorted full-hero raster.
- Replaced the forced 2x desktop/wide hero route sources with `systems-hero-route-map-concept-3x.png` and `systems-hero-route-map-wide-3x.png`, so the route line and small labels are downsampled from larger rasters without changing layout.
- Changed the desktop hero image from `object-fit: fill` to `object-fit: cover`, preventing horizontal route-map distortion.
- Hid desktop header/copy visual layers over the hero while keeping their links in place, preventing duplicate text and restoring the concept route map appearance.
- Updated hero lead copy to match the concept wording; mobile still renders it as live text.
- Changed route table body cells to dark text with colored connector lines only, reducing the overly saturated route-table body from the previous pass.
- Reduced section heading weight/size further to `font-weight: 840`, then restored normal homepage section padding from `9px` to `10px` so the final desktop page height matches the reference `1822px`.
- Tuned the Before/After section with a dedicated `change-section` class, narrower card columns, a smaller right illustration, and desktop-only extra vertical rhythm.
- Changed the Before/After right illustration from a cropped cover frame to `object-fit: contain`, restoring the concept's full people-plus-dashboard line-art composition.
- Increased Before/After workflow illustration opacity and contrast so the line-art density sits closer to the concept.
- Reduced pricing table, process line, and case-card typography weight/size to better match the concept's lighter lower-page density.
- Further reduced route-table, planner, pricing, process, and case-card font weights so the mid/lower page reads less heavy without changing layout dimensions.
- Changed route/white section surfaces from pure white to `#fbfcfd` to better match the concept's softer page tone.
- Replaced the process section copy/data with `developmentSteps` so it matches the concept's "開発の進め方" section.
- Removed the homepage contact quick-form panel background and tightened desktop contact-band padding to keep the final page height aligned after the Before/After section was expanded.
- Reduced the homepage contact-band form fields, submit button, tags, and contact-method buttons, then set the band's desktop minimum height to preserve the reference vertical rhythm.
- Adjusted the homepage contact-grid desktop columns from an even form-heavy ratio to a wider left-copy column, narrower center form, and stable right contact-method column.
- Reworked planner options to match the concept checklist and default checked state.
- Updated route step body copy and route-brief number colors for the recommendation card.
- Rebuilt `audit-full-compare-863.png`, `audit-focus-sections-863.png`, `wide-1240-route-map-fix.png`, `route-map-fix-compare.png`, and `mobile-390-route-map-fix.png` after switching the hero route rasters to 3x sources and preserving the latest typography/contact-band pass.

**Validation**

- Browser visual checks passed at desktop `863x900`, wide desktop `1240x900`, and mobile `390x844`.
- Saved comparison evidence: `audit-full-compare-863.png`, `audit-focus-sections-863.png`, `focus-planner-compare.png`, `focus-before-after-compare.png`, `focus-process-cases-compare.png`, `focus-bottom-compare.png`, `wide-1240-route-map-fix.png`, `mobile-390-route-map-fix.png`, and `route-map-fix-compare.png`.
- Browser metrics: no horizontal overflow, correct desktop/wide/mobile hero image source, no desktop transform/mask on the route image, no `object-fit: fill` distortion, 3x desktop/wide rasters selected, and desktop page height is `1822px`.

final result: passed
