**Findings**

- P0/P1/P2 の未解決事項はありません。
- P3: ページ全体高さは参照 `1822px` に対して実装 `1821px` で、差分は `1px` です。
- P3: デスクトップのヒーローはコンセプトヒーローをラスタとして表示し、リンク要素を透明オーバーレイとして残しています。見た目の再現度を優先したため、今後の編集性を高めるならテキスト・ナビを再びHTMLで精密配置する余地があります。
- P3: 広いデスクトップ用のヒーローは `1240x405` の専用ラスタで横伸びを止めました。右端は暗い余白として延長しており、参照幅のルート形状を優先しています。
- P3: Before/Afterの右イラストはコンセプトよりまだ少し強く見えますが、人物が切れて見える状態は改善しました。
- P3: 問い合わせ帯のフォーム外枠は参照に近づけましたが、入力欄のフォントウェイトはまだやや強めです。
- P3: プランナー内の文字ウェイトは参照よりやや強いものの、選択肢の内容・順序・初期チェックはコンセプトに合わせました。

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
  - `C:\Users\gnish\.codex\worktrees\d241\acecore-systems\.playwright-cli\mobile-390-concept-route.png`
- Viewports: reference-width desktop `863x900`, wide desktop `1240x900`, mobile `390x844`.
- State: top page initial state, planner default selections.

**Focused Region Evidence**

- Hero route map: desktop now uses concept-derived rasters. `863px` uses the exact `863x405` concept crop; `1240px` uses a dedicated `1240x405` non-distorted wide crop.
- Hero route placement: at the `863px` comparison width, the hero image renders at `x=0 / y=0 / width=863 / height=405`, matching the concept canvas.
- Wide route guard: at `1240px`, the image renders at `x=0 / y=0 / width=1240 / height=405` and selects `systems-hero-route-map-wide.png`, so the route is no longer horizontally distorted by `object-fit: fill`.
- Route stability: desktop route layer has `transform: none`, `mask: none`, and `object-fit: cover`; no generated SVG/CSS route overlay is used. The previous masking and rectangle cleanup that caused jagged-looking gaps has been removed.
- Desktop live controls: header links and hero CTA links remain in the DOM and clickable, but are transparent above the raster hero to avoid double-rendered text.
- Mobile guard: the mobile `picture` source still switches to `systems-hero-route-map.png`; mobile does not inherit the desktop raster hero overlay.
- Planner ratio: the planner grid remains close to the concept, with the wider right recommendation card preserved from the previous pass.
- Before/After flow: the card and illustration columns remain rebalanced from the previous pass, matching the concept's wider line-art presence.
- Surface tone: route/white sections now use `#fbfcfd` instead of pure white, reducing the hard white contrast against the concept's slightly gray section surfaces.
- Process line: the process section now uses the concept's heading, lead copy, step titles, and visible number sequence instead of reusing the hero route steps.
- Contact band: the home quick form no longer renders as a translucent card; inputs sit directly on the dark route-map band like the concept.
- Planner options: the checklist now uses the concept's 8 visible options in row-major order, with the same checked items as the reference.
- Planner route brief: the recommendation list body copy and number colors now follow the concept more closely.

**Rendered QA**

- Page identity: `http://127.0.0.1:4321/`, title `業務システム・アプリ開発 | Acecore Systems`.
- Blank-page check: desktop and mobile render first meaningful content.
- Overflow: desktop `scrollWidth=863` at `863px`; mobile `scrollWidth=390` at `390px`; no horizontal overflow.
- Final desktop page height: implementation `1821px` versus source `1822px`.
- Hero map source: desktop `863px` uses `systems-hero-route-map-concept.png`; wide `1240px` uses `systems-hero-route-map-wide.png`; mobile uses `systems-hero-route-map.png`.
- Hero route metrics: desktop `863px` image reports `naturalWidth=863`, `naturalHeight=405`; rendered size is `863x405`.
- Wide route metrics: desktop `1240px` image reports `naturalWidth=1240`, `naturalHeight=405`; rendered size is `1240x405`.
- Header metric: brand hitbox remains at `x=26`, `y=15`, `width=162.52`, `height=24`.
- Mobile guard: final `390px` capture uses the mobile route source, with `transform: none`, `mask: none`, and `scrollWidth=390`.
- Focused Before/After evidence: `focus-before-after-compare.png` was rebuilt after widening the illustration slot; the right line-art no longer clips both side figures as aggressively.
- Focused process evidence: `focus-process-cases-compare.png` was rebuilt after aligning the process heading and step content to the concept.
- Focused contact evidence: `focus-bottom-compare.png` was rebuilt after removing the quick-form panel background.
- Focused planner evidence: `focus-planner-compare.png` was rebuilt after aligning checklist copy, order, and default checked state.

**Patches Made Since Previous QA**

- Regenerated the desktop hero route asset from the concept hero crop instead of trying to mask out individual route/text regions.
- Added `systems-hero-route-map-wide.png` and `systems-hero-route-map-wide-2x.png` so `1240px` desktop viewports use a non-distorted full-hero raster.
- Changed the desktop hero image from `object-fit: fill` to `object-fit: cover`, preventing horizontal route-map distortion.
- Hid desktop header/copy visual layers over the hero while keeping their links in place, preventing duplicate text and restoring the concept route map appearance.
- Updated hero lead copy to match the concept wording; mobile still renders it as live text.
- Tuned the Before/After illustration slot to `220px` wide with a small left offset, while resetting mobile to full-width behavior.
- Changed route/white section surfaces from pure white to `#fbfcfd` to better match the concept's softer page tone.
- Replaced the process section copy/data with `developmentSteps` so it matches the concept's "開発の進め方" section.
- Removed the homepage contact quick-form panel background and restored contact-band padding to keep the final page height aligned.
- Reworked planner options to match the concept checklist and default checked state.
- Updated route step body copy and route-brief number colors for the recommendation card.
- Rebuilt `hero-compare-concept-route.png`, `full-compare-concept-route-current.png`, `desktop-863-concept-route.png`, `wide-1240-route-map-fix.png`, `route-map-fix-compare.png`, and `mobile-390-concept-route.png`.

**Validation**

- Browser visual checks passed at desktop `863x900`, wide desktop `1240x900`, and mobile `390x844`.
- Saved comparison evidence: `hero-compare-concept-route.png`, `full-compare-concept-route-current.png`, `focus-planner-compare.png`, `focus-before-after-compare.png`, `focus-process-cases-compare.png`, `focus-bottom-compare.png`, `wide-1240-route-map-fix.png`, `mobile-390-route-map-fix.png`, and `route-map-fix-compare.png`.
- Browser metrics: no horizontal overflow, correct desktop/wide/mobile hero image source, no desktop transform/mask on the route image, and no `object-fit: fill` distortion.

final result: passed
