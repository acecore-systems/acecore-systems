**Findings**

- P0/P1/P2 の未解決事項はありません。
- P3 として、参照コンセプトのヒーロールートは駅アイコンや一部テキストが画像内に統合された高密度ビジュアルです。実装では高解像度ラスター画像の上にアクセシブルなHTMLラベルを重ねているため、完全なピクセル一致ではありません。
- P3 として、ページ全体の縦密度は参照モックよりやや長めです。現状はレスポンシブ可読性と実テキストの収まりを優先しています。

**Comparison Target**

- Source visual truth: `C:\Users\gnish\AppData\Local\Temp\codex-clipboard-6aa7a799-02be-4e66-b2c3-9cda2c16a3df.png`
- Jagged route report: `C:\Users\gnish\AppData\Local\Temp\codex-clipboard-dbd79a35-3b1c-4ad6-bd57-34256032a652.png`
- Implementation URL: `http://127.0.0.1:4327/`
- Final implementation screenshots:
  - `C:\Users\gnish\.codex\worktrees\d241\acecore-systems\.playwright-cli\route-polish2-863.png`
  - `C:\Users\gnish\.codex\worktrees\d241\acecore-systems\.playwright-cli\route-polish2-wide.png`
  - `C:\Users\gnish\.codex\worktrees\d241\acecore-systems\.playwright-cli\route-polish2-mobile.png`
  - `C:\Users\gnish\.codex\worktrees\d241\acecore-systems\.playwright-cli\route-polish2-863-full.png`
- Side-by-side comparison evidence: `C:\Users\gnish\.codex\worktrees\d241\acecore-systems\.playwright-cli\route-polish2-side-by-side.png`
- Viewports: reference-width desktop `863x900`, user-reported wide `2052x900`, mobile `390x844`
- State: top page initial state, planner default selections.

**Focused Region Evidence**

- Hero route map: `systems-hero-route-map.png` is used directly as a high-resolution raster asset. The previously jagged small/processed route image is no longer used.
- Hero title: desktop and wide viewports now render as two lines: `業務を動かす仕組みを、` / `現場に合わせて設計する。`
- Route positioning: route image and station labels now share the same CSS coordinate variables, so the line and label positions stay aligned across `863px` and `2052px`.
- Station labels: 03〜06 are staggered to reduce central overlap, while mobile keeps the card grid treatment.
- Responsiveness: final screenshots show no horizontal overflow at `863px`, `2052px`, or `390px`.

**Required Fidelity Surfaces**

- Fonts and typography: desktop hero line-break fidelity is restored; mobile still allows natural wrapping. Station labels remain small like the reference and are no longer forced into the route container's old coordinate system.
- Spacing and layout rhythm: hero height remains `402px`, matching the section break timing of the reference-width capture. Route table and lower sections retain the existing readable implementation density.
- Colors and tokens: navy / teal / gold / white palette remains aligned with the reference. Web route, active station, CTAs, and header outline use the same gold emphasis.
- Image quality and asset fidelity: route map is the original high-resolution PNG, avoiding the anti-aliasing loss that caused the visible jagged route.
- Copy and content: hero CTA, route labels, planner text, pricing rows, and contact copy remain aligned with the selected concept.

**Rendered QA**

- Page identity: `http://127.0.0.1:4327/`, title `業務システム・アプリ開発 | Acecore Systems`
- Blank-page check: desktop, wide, and mobile all render first meaningful content.
- Framework overlay: no Astro/Vite error overlay visible.
- Console health: Playwright captured no `warning` or `error` logs for final screenshots.
- Overflow: desktop `scrollWidth=863`, wide `scrollWidth=2052`, mobile `scrollWidth=390`.
- Browser path: in-app Browser was available and used for live visual checks. Browser screenshot saving to the worktree failed with `EPERM`, so saved evidence was captured with Playwright Chromium.

**Patches Made Since Previous QA**

- Desktop hero grid widened so the heading no longer breaks into four lines on wide screens.
- Desktop `wbr` breaks are suppressed while mobile wrapping remains enabled.
- Route image placement now uses shared `--route-map-left`, `--route-map-top`, and `--route-map-width` variables.
- Station label overlay was moved from route-container-relative coordinates to image-relative coordinates.
- Route image width and left offset were tuned so the flag, 05 highlight, and 06 label fit inside the hero at reference width.
- Station 03〜06 label positions were staggered to reduce overlap and keep the center route readable.

**Validation**

- `npm run build` passed when run outside the sandbox. The sandboxed run failed first with Vite `spawn EPERM`.
- `npx prettier --check --plugin=prettier-plugin-astro src/pages/index.astro src/styles/global.css design-qa.md` passed.
- Playwright screenshot capture passed at `863x900`, `2052x900`, `390x844`, and full-page `863px`.

**Follow-up Polish**

- For stricter pixel fidelity, generate or compose a dedicated hero-route image that bakes the station icons and all label text into one bitmap. That would more closely match the concept art, but reduces live text accessibility and responsive control.
- Service route label icons are still not image/icon-library matched to the concept. They remain a lower-priority polish item.

final result: passed
