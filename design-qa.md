**Findings**

- P0/P1/P2 の未解決事項はありません。
- P3: ページ全体高さは参照 `1822px` に対して実装も `1822px` です。
- P3: デスクトップのヒーローはコンセプトヒーローをラスタとして表示し、リンク要素を透明オーバーレイとして残しています。見た目の再現度を優先したため、今後の編集性を高めるならテキスト・ナビを再びHTMLで精密配置する余地があります。
- P3: デスクトップのヒーローは今回のパスで wide 専用の合成画像をやめ、`761px` 以上すべてで同じ concept-derived ラスタを `object-fit: fill` で表示するようにしました。さらに参照ヒーローから `systems-hero-route-map-concept-4x.png` を再生成し、広幅・高DPIでルート線が荒れて見える余地を減らしています。
- P3: 1026px/DPR2 の中幅デスクトップでは wide 合成画像ではなく `systems-hero-route-map-concept-4x.png` を使うようにしました。報告スクショで見えていた4行タイトル化とガタついたルート線は、最新の `current-1026-dpr2-hero-latest.png` で 4x source 選択を確認済みです。
- P3: Before/Afterの右イラストは `object-fit: contain` で人物と画面を含む全体構図を表示し、今回のパスで線画の薄さも `opacity` と `contrast()` で参照に近づけました。
- P3: 問い合わせ帯は入力欄・送信ボタン・相談方法ボタンのサイズと文字ウェイトを落とし、今回のパスで参照と同じ見出し・プレースホルダー・送信ボタン文言に揃えました。左説明・中央フォーム・右連絡枠の3カラム比率も参照へ寄せ、さらにフォーム幅を `280px` に絞って参照の入力欄幅に近づけました。帯の高さは `138px` に固定して参照の縦リズムを維持しています。
- P3: ルート表はセル文字を落ち着いた濃紺に戻し、今回のパスで本文ウェイトも落として、矢印だけをルート色にする参照の情報密度へさらに近づけました。
- P3: プランナー、料金表、開発ステップ、事例カードは今回のパスで文字ウェイトをさらに落とし、参照より黒く重く見えていた中盤下部のトーンを軽くしました。
- P3: 導入事例カードは今回のパスで参照にないカテゴリ行を外し、カード先頭がタイトルになるように戻しました。事例セクションの下余白で参照と同じページ高を維持しています。
- P3: セクション見出しは今回のパスで `font-weight: 820` まで落とし、通常セクションと料金セクションの余白で参照と同じページ高を維持しながら、黒く強すぎる見出しトーンを抑えました。
- P3: ルート表と導入ステップの接続線は今回のパスで小さな矢印頭を追加し、参照にある方向性のある細線表現へ寄せました。モバイルでは表が縦積みになるため追加矢印頭を非表示にしています。
- P3: プランナー右側のおすすめルートカードは今回のパスで丸番号とステップ文字を少しだけ大きくし、参照より細かく詰まって見えていた状態を緩和しました。リスト行高は維持し、最終ページ高 `1822px` は変えていません。
- P3: Before/After の After カードは今回のパスで teal の境界線と背景を少し薄くし、参照の淡いカード処理に近づけました。カード寸法とセクション位置は変えていません。
- P3: Before/After カードは今回のパスで参照と同じ5項目構成に戻し、Before は灰色の×入り丸、After は青緑のチェック入り丸を参照から切り出したPNGマーカーで寄せました。カード内容を増やした分、desktop の `change-section` 余白を調整して最終ページ高 `1822px` を維持しています。
- P3: 料金表は今回のパスで行ラベルと価格のウェイトを少し落とし、参照より硬く見えていた表内の太さを抑えました。表の高さとページ高 `1822px` は維持しています。
- P3: Before/After右側の線画は今回のパスでデスクトップのみ少し拡大し、横に薄く伸びて見えていた状態を参照の人物・画面の存在感へ近づけました。モバイルでは拡大を解除しています。
- P3: フッター左のブランド表示は今回のパスでAマークを追加し、参照と同じ「マーク + Acecore Systems」の形に戻しました。フッターpaddingを調整して最終ページ高 `1822px` は維持しています。

**Comparison Target**

- Source visual truth: `C:\Users\gnish\.codex\attachments\ad5a08f7-6501-4cff-855a-e212532d099c\image-1.png`
- Latest user report: `C:\Users\gnish\AppData\Local\Temp\codex-clipboard-dbd79a35-3b1c-4ad6-bd57-34256032a652.png`
- Implementation URL: `http://127.0.0.1:4322/`
- Implementation screenshots:
  - `C:\Users\gnish\.codex\worktrees\d241\acecore-systems\.playwright-cli\hero-compare-concept-route.png`
  - `C:\Users\gnish\.codex\worktrees\d241\acecore-systems\.playwright-cli\full-compare-concept-route-current.png`
  - `C:\Users\gnish\.codex\worktrees\d241\acecore-systems\.playwright-cli\desktop-863-concept-route.png`
  - `C:\Users\gnish\.codex\worktrees\d241\acecore-systems\.playwright-cli\focus-planner-compare.png`
  - `C:\Users\gnish\.codex\worktrees\d241\acecore-systems\.playwright-cli\wide-1240-route-map-fix.png`
  - `C:\Users\gnish\.codex\worktrees\d241\acecore-systems\.playwright-cli\wide-1026-dpr2-hero.png`
  - `C:\Users\gnish\.codex\worktrees\d241\acecore-systems\.playwright-cli\user-vs-current-1026-dpr2-hero.png`
  - `C:\Users\gnish\.codex\worktrees\d241\acecore-systems\.playwright-cli\current-1026-dpr2-hero-latest.png`
  - `C:\Users\gnish\.codex\worktrees\d241\acecore-systems\.playwright-cli\user-vs-fixed-1026-dpr2-hero.png`
  - `C:\Users\gnish\.codex\worktrees\d241\acecore-systems\.playwright-cli\user-normalized-wide-compare.png`
  - `C:\Users\gnish\.codex\worktrees\d241\acecore-systems\.playwright-cli\route-table-final-compare-2x.png`
  - `C:\Users\gnish\.codex\worktrees\d241\acecore-systems\.playwright-cli\route-labels-after-icon-tune-4x.png`
  - `C:\Users\gnish\.codex\worktrees\d241\acecore-systems\.playwright-cli\route-labels-final-tone-4x.png`
  - `C:\Users\gnish\.codex\worktrees\d241\acecore-systems\.playwright-cli\arrows-route-process-compare-2x.png`
  - `C:\Users\gnish\.codex\worktrees\d241\acecore-systems\.playwright-cli\mid-before-pricing-compare-2x.png`
  - `C:\Users\gnish\.codex\worktrees\d241\acecore-systems\.playwright-cli\bottom-contact-footer-compare-2x.png`
  - `C:\Users\gnish\.codex\worktrees\d241\acecore-systems\.playwright-cli\route-map-fix-compare.png`
  - `C:\Users\gnish\.codex\worktrees\d241\acecore-systems\.playwright-cli\mobile-390-route-map-fix.png`
  - `C:\Users\gnish\.codex\worktrees\d241\acecore-systems\.playwright-cli\audit-full-compare-863.png`
  - `C:\Users\gnish\.codex\worktrees\d241\acecore-systems\.playwright-cli\audit-focus-sections-863.png`
  - `C:\Users\gnish\.codex\worktrees\d241\acecore-systems\.playwright-cli\mobile-390-concept-route.png`
- Viewports: reference-width desktop `863x900`, wide desktop `1240x900`, mobile `390x844`.
- State: top page initial state, planner default selections.
- Browser availability: in-app Browser setup failed with `sandboxPolicy` metadata error; Playwright-managed Chromium fallback was used for rendered QA.

**Focused Region Evidence**

- Hero route map: desktop now uses the same concept-derived 4x raster across desktop widths. `863px` and `1240px` both select `systems-hero-route-map-concept-4x.png` and render it into the fixed hero canvas with `object-fit: fill`.
- Hero route placement: at the `863px` comparison width, the hero image renders at `x=0 / y=0 / width=863 / height=405`, matching the concept canvas.
- Wide route guard: at `1240px`, the image renders at `x=0 / y=0 / width=1240 / height=405`, selects `systems-hero-route-map-concept-4x.png`, reports `naturalWidth=3452`, `naturalHeight=1620`, and uses `object-fit: fill`. This removes the separate wide composite that was visually reading as a jagged route map.
- Wide high-DPI guard: at `1026px` with `deviceScaleFactor=2`, the desktop source now switches to `systems-hero-route-map-concept-4x.png` and renders at `1026x405` with `object-fit: fill`; this avoids the wide composite crop that created the jagged route treatment in the latest user screenshot.
- Latest user screenshot comparison: `user-vs-fixed-1026-dpr2-hero.png` compares the reported `2052px`-wide screenshot against a fresh `1026px @ DPR 2` capture. The fixed capture returns to the concept-style 2-line title and a continuous route map instead of the broken/stepped treatment visible in the report.
- Route stability: desktop route layer has `transform: none` and `mask: none`; no generated SVG/CSS route overlay is used. The previous masking and wide-composite cleanup that caused jagged-looking gaps is bypassed for both middle and wide desktop widths.
- Route table tone: route table body text now stays on the dark text token while the connector lines carry the route accent color, matching the concept more closely than the previous all-colored cell text.
- Route table density: `route-table-final-compare-2x.png` was rebuilt after reducing route-cell font size/weight and shortening connector arrows so the Web row no longer feels as heavy or crowded against the directional lines.
- Route label fidelity: `route-labels-after-icon-tune-4x.png` was rebuilt after enlarging the left route-label icons and returning the Web route label to white text, matching the reference's stronger icon/title treatment on the colored chevrons.
- Route label tone: `route-labels-final-tone-4x.png` was rebuilt after splitting the business/data label tones. The sampled label averages moved close to the source (`business` source `#398E9D` / implementation `#398C99`, `data` source `#44A09E` / implementation `#4AA09E`).
- Mid/lower typography tone: route table cells, planner tabs/options, route-brief numbers, pricing values, process labels, and case-card headings now use lighter weights without changing their grid dimensions.
- Desktop live controls: header links and hero CTA links remain in the DOM and clickable, but are transparent above the raster hero to avoid double-rendered text.
- Mobile guard: the mobile `picture` source still switches to `systems-hero-route-map.png`; mobile does not inherit the desktop raster hero overlay.
- Planner ratio: the planner grid remains close to the concept, with the wider right recommendation card preserved from the previous pass.
- Planner route brief density: `audit-focus-sections-863.png` was rebuilt after increasing the route-brief number dots from `12px` to `13px` and slightly increasing route-step title/body text while preserving `30px` item rows and the final `1822px` page height.
- Before/After flow: the section now has a dedicated `change-section` desktop rhythm; Before/After cards are narrower, the right illustration uses `object-fit: contain` so both people and the dashboard remain visible, and the section is taller so the pricing block no longer rides up as aggressively.
- Before/After card tone: `before-after-after-tone-2x.png` was rebuilt after reducing the After card border alpha from `0.35` to `0.24` and lightening the card background to reduce the overly strong teal frame.
- Before/After list fidelity: `audit-focus-sections-863.png` was rebuilt after returning both cards to the concept's 5-item structure and replacing simple red/teal bullets with source-extracted gray circled-x and teal circled-check PNG markers.
- Before/After illustration tone: the workflow illustration now uses higher opacity and slight contrast to avoid the washed-out look from the previous pass while preserving the full-image framing.
- Before/After illustration scale: the desktop workflow illustration is slightly enlarged with a transform-only adjustment so it reads closer to the source without changing the section geometry.
- Mid/lower density: pricing table labels, prices, process line, and case cards use lighter weights and smaller supporting text, reducing the heavier implementation tone visible in the previous comparison.
- Pricing table weight: `pricing-weight-tune-2x.png` was rebuilt after lowering homepage pricing row labels and price values from `720` to `680`, keeping the same table geometry.
- Case card structure: homepage case cards now start with the case title, matching the concept. The extra green category line that only existed in the implementation was removed.
- Section heading tone: top-level section headings now use a smaller size and lighter `820` weight; the homepage and pricing section padding were adjusted to keep the final `1822px` page height aligned with the reference.
- Surface tone: route/white sections now use `#fbfcfd` instead of pure white, reducing the hard white contrast against the concept's slightly gray section surfaces.
- Process line: the process section now uses the concept's heading, lead copy, step titles, and visible number sequence instead of reusing the hero route steps.
- Connector arrows: route-table connectors and the process-line connectors now include small arrowheads in desktop layouts, matching the source's directional line treatment more closely than the previous plain horizontal strokes.
- Contact band: the home quick form no longer renders as a translucent card; inputs sit directly on the dark route-map band like the concept. The latest pass restored the reference copy, field placeholders, submit label, and desktop column balance, then narrowed the center form to `280px` so the input and submit widths sit closer to the source while keeping the band at `138px`.
- Footer brand: the footer now includes the same A mark used by the header, matching the reference footer's brand lockup rather than rendering text alone.
- Planner options: the checklist now uses the concept's 8 visible options in row-major order, with the same checked items as the reference.
- Planner route brief: the recommendation list body copy and number colors now follow the concept more closely.

**Rendered QA**

- Page identity: `http://127.0.0.1:4322/`, title `業務システム・アプリ開発 | Acecore Systems`.
- Blank-page check: desktop and mobile render first meaningful content.
- Overflow: desktop `scrollWidth=863` at `863px`; mobile `scrollWidth=390` at `390px`; no horizontal overflow.
- Final desktop page height: implementation `1822px` versus source `1822px`.
- Hero map source: desktop `863px` and wide `1240px` both use `systems-hero-route-map-concept-4x.png`; mobile uses `systems-hero-route-map.png`.
- Hero route metrics: desktop `863px` image reports `naturalWidth=3452`, `naturalHeight=1620`; rendered size is `863x405`.
- Wide route metrics: desktop `1240px` image reports `naturalWidth=3452`, `naturalHeight=1620`, `objectFit=fill`; rendered size is `1240x405`.
- Wide high-DPI metric: desktop `1026px` at DPR 2 uses `systems-hero-route-map-concept-4x.png`, reports `naturalWidth=3452`, `naturalHeight=1620`, `objectFit=fill`, and renders at `1026x405`.
- Pricing metric: desktop pricing section reports `top=1161.28px`, `height=173.52px`, and the final desktop page height remains `1822px`.
- Case metric: desktop case section reports `top=1469.67px`, `height=172.88px`; the case cards no longer include the category `span` row.
- Contact metric: desktop contact band reports `top=1642.55px`, `height=138px`; the center form now renders at `x=382.16px`, `width=280px` at the `863px` comparison viewport.
- Header metric: brand hitbox remains at `x=26`, `y=15`, `width=162.52`, `height=24`.
- Mobile guard: final `390px` capture uses the mobile route source, with `transform: none`, `mask: none`, and `scrollWidth=390`.
- Focused Before/After evidence: `audit-focus-sections-863.png` was rebuilt after rebalancing card widths, right illustration size/position, section desktop rhythm, 5-item card content, and source-extracted circled list marker assets.
- Focused workflow illustration evidence: `audit-focus-sections-863.png` was rebuilt after increasing illustration opacity/contrast.
- Focused mid-page evidence: `mid-before-pricing-compare-2x.png` was rebuilt after the workflow illustration scale pass to confirm it does not collide with the Before/After cards or pricing section.
- Focused route-table evidence: `audit-focus-sections-863.png` was rebuilt after separating route-cell text color from route connector accent color.
- Focused route-table final evidence: `route-table-final-compare-2x.png` was rebuilt after tuning route-cell text size/weight and connector length.
- Focused route-label evidence: `route-labels-after-icon-tune-4x.png` was rebuilt after increasing route-label icon size and changing the gold Web label text back to white.
- Focused route-label tone evidence: `route-labels-final-tone-4x.png` was rebuilt after separating the business and data label colors and lowering the Web-route yellow slightly.
- Focused planner route evidence: `audit-focus-sections-863.png` was rebuilt after tuning the recommendation card's route-brief number and text density; the page stayed at `scrollHeight=1822`.
- Focused Before/After card evidence: `before-after-after-tone-2x.png` was rebuilt after softening the After card frame/background; layout metrics stayed unchanged.
- Focused pricing evidence: `pricing-weight-tune-2x.png` was rebuilt after lightening the pricing table row labels and prices; pricing metrics stayed `top=1161.23px`, `height=173.52px`.
- Focused heading evidence: `audit-full-compare-863.png` and `audit-focus-sections-863.png` were rebuilt after reducing section heading weight.
- Focused process evidence: `focus-process-cases-compare.png` was rebuilt after aligning the process heading and step content to the concept.
- Focused connector evidence: `arrows-route-process-compare-2x.png` was rebuilt after adding desktop arrowheads to the route-table and process-line connectors.
- Focused lower-page evidence: `audit-focus-sections-863.png` was rebuilt again after lowering route table, planner, pricing, process, and case-card font weights without changing section heights.
- Focused contact evidence: `audit-focus-sections-863.png` and `latest-bottom-compare.png` were rebuilt after matching the contact copy, placeholders, submit label, desktop form column position, and final `280px` form width while preserving the band height at `138px`.
- Focused footer evidence: `bottom-contact-footer-compare-2x.png` was rebuilt after adding the footer A mark and restoring the final page height.
- Focused planner evidence: `focus-planner-compare.png` was rebuilt after aligning checklist copy, order, and default checked state.

**Patches Made Since Previous QA**

- Regenerated the desktop hero route asset from the concept hero crop instead of trying to mask out individual route/text regions.
- Removed the desktop wide `<source>` so `1240px` no longer switches to `systems-hero-route-map-wide-2x.png`.
- Regenerated the desktop hero from the reference crop as `systems-hero-route-map-concept-4x.png` (`3452x1620`) and switched the desktop `<img>` to that asset.
- Replaced the breakpoint-limited desktop fill guard with a `761px+` rule so all desktop hero captures use the concept-derived hero at `object-fit: fill`.
- Hid desktop header/copy visual layers over the hero while keeping their links in place, preventing duplicate text and restoring the concept route map appearance.
- Updated hero lead copy to match the concept wording; mobile still renders it as live text.
- Changed route table body cells to dark text with colored connector lines only, reducing the overly saturated route-table body from the previous pass.
- Reduced section heading weight/size further to `font-weight: 820`, then adjusted normal homepage section padding and pricing-section bottom padding so the final desktop page height matches the reference `1822px`.
- Tuned the Before/After section with a dedicated `change-section` class, narrower card columns, a smaller right illustration, and desktop-only extra vertical rhythm.
- Changed the Before/After right illustration from a cropped cover frame to `object-fit: contain`, restoring the concept's full people-plus-dashboard line-art composition.
- Increased Before/After workflow illustration opacity and contrast so the line-art density sits closer to the concept.
- Reduced pricing table, process line, and case-card typography weight/size to better match the concept's lighter lower-page density.
- Reduced the pricing table's row labels, price values, and section-heading weight again after a 2x focused comparison showed the implementation still reading heavier than the reference.
- Removed the homepage case-card category line and added case-section bottom padding so the cards match the concept structure without shortening the final desktop page height.
- Further reduced route-table, planner, pricing, process, and case-card font weights so the mid/lower page reads less heavy without changing layout dimensions.
- Changed route/white section surfaces from pure white to `#fbfcfd` to better match the concept's softer page tone.
- Replaced the process section copy/data with `developmentSteps` so it matches the concept's "開発の進め方" section.
- Removed the homepage contact quick-form panel background and tightened desktop contact-band padding to keep the final page height aligned after the Before/After section was expanded.
- Reduced the homepage contact-band form fields, submit button, tags, and contact-method buttons, then set the band's desktop minimum height to preserve the reference vertical rhythm.
- Adjusted the homepage contact-grid desktop columns from an even form-heavy ratio to a wider left-copy column, narrower center form, and stable right contact-method column.
- Matched the homepage contact heading, input placeholders, submit button label, and desktop contact-grid columns to the reference contact band.
- Narrowed the homepage contact quick form to `280px` so the desktop input columns and submit button no longer read wider than the reference.
- Reworked planner options to match the concept checklist and default checked state.
- Updated route step body copy and route-brief number colors for the recommendation card.
- Rebuilt `audit-full-compare-863.png`, `audit-focus-sections-863.png`, `wide-1240-route-map-fix.png`, `route-map-fix-compare.png`, `current-1026-dpr2-hero-latest.png`, and `mobile-390-route-map-fix.png` after unifying desktop hero rendering on the concept 4x source and preserving the latest typography/contact-band pass.
- Added desktop arrowheads to route-table and process-line connectors, with a responsive guard that hides the added arrowheads once the route table or process line stacks on narrower viewports.
- Slightly scaled the desktop workflow illustration in the Before/After section, then reset that transform for mobile to preserve the stacked layout.
- Added the footer brand mark and adjusted the homepage footer padding so the bottom brand lockup matches the source while keeping the final desktop page height at `1822px`.
- Reduced route-table cell text from `0.66rem/730` to `0.6rem/690`, tightened line-height, and shortened connector arrows so dense Web-route labels do not collide with the route direction lines.
- Increased route-label icon size from `18px` to `23px` and changed the Web-route chevron label from dark text back to white text to match the reference route-label treatment.
- Split the route-table lane tones so business/data labels no longer share the same teal fill, and tuned the Web label yellow closer to the source.
- Updated the desktop guard to `761px+` so the concept hero renders with `object-fit: fill` at both middle and wide desktop widths, preserving the full route map without vertical cropping.
- Used local `capture-hero-1026.cjs` and rebuilt `current-1026-dpr2-hero-latest.png` plus `user-vs-fixed-1026-dpr2-hero.png` to lock the reported screenshot condition into QA evidence.
- Increased planner recommendation route dots from `12px` to `13px`, with route-brief titles at `0.5rem` and body text at `0.39rem`; kept each route item at `30px` so the section and page heights remain aligned to the concept.
- Softened the Before/After `After` card by lowering the teal border alpha and lightening the gradient background while keeping dimensions fixed.
- Matched Before/After card copy to the concept's 5-item Before and 5-item After lists, replaced simple dot bullets with source-extracted `flow-marker-before.png` and `flow-marker-after.png`, and reduced desktop `change-section` bottom padding so the final desktop page height stayed `1822px`.
- Lowered homepage pricing row label and price weights to `680` so the table reads closer to the source without altering row height.

**Validation**

- Browser visual checks passed at desktop `863x900`, wide desktop `1240x900`, high-DPI wide `1026px @ DPR 2`, and mobile `390x844`.
- Saved comparison evidence: `audit-full-compare-863.png`, `audit-focus-sections-863.png`, `latest-bottom-compare.png`, `focus-planner-compare.png`, `focus-before-after-compare.png`, `focus-process-cases-compare.png`, `focus-bottom-compare.png`, `arrows-route-process-compare-2x.png`, `route-table-final-compare-2x.png`, `route-labels-after-icon-tune-4x.png`, `route-labels-final-tone-4x.png`, `mid-before-pricing-compare-2x.png`, `bottom-contact-footer-compare-2x.png`, `wide-1240-route-map-fix.png`, `current-1026-dpr2-hero-latest.png`, `user-vs-fixed-1026-dpr2-hero.png`, `mobile-390-route-map-fix.png`, and `route-map-fix-compare.png`.
- Browser metrics: no horizontal overflow, correct desktop/wide/mobile hero image source, no desktop transform/mask on the route image, middle and wide desktop both use concept 4x with `object-fit: fill`, and desktop page height is `1822px`.

final result: passed
