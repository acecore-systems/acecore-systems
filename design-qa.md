**Findings**

- P0/P1/P2 の未解決事項はありません。
- P3: wide用の透過ルート画像は、前回の背景抜き生成ではなく、ユーザー提示のコンセプト画像 `1975x796` からルートマップ領域を抽出して作り直しました。ナビ・見出し・CTAは透明化し、HTML側で表示しています。
- P3: wide画像は `1975w` / `3950w` の実寸 `srcset` に変更しました。コンセプト幅での余計な拡大縮小を避け、ルートマップのにじみを抑えています。
- P3: `1200px+` はコンセプト比率 `1975:796` でヒーローを伸縮させ、ヘッダー左48px、本文左76px、問い合わせCTA右80px前後の構図へ合わせました。`1001-1199px` は詰まりを避けるためdesktop構成を維持します。

**Comparison Target**

- Source visual truth: `C:\Users\gnish\AppData\Local\Temp\codex-clipboard-106d05fc-b6de-4627-89ab-6d9000faf0a9.png`
- Latest user request: 生成された画像が微妙なので、コンセプトと一致させる。
- Implementation URL: `http://127.0.0.1:4322/`
- Viewports checked: `1975x900`, `1763x900`, breakpoint `640/700/760/761/820/1026/1240px @ DPR 2`, mobile `390x844`

**Hero Evidence**

- `1975px`: `systems-hero-route-map-transparent-wide.png` を選択。rendered route `1975x796`、hero `1975x796`、brand `x=48 / y=22`、title `x=76 / y=176`、primary CTA `x=76 / y=515`。
- `1763px`: 同じwide透過画像を選択。hero `1763x711`、HTML見出し・CTA・ナビとコンセプト由来ルートアートの重なりなし。
- `1240px`: wide透過画像を選択。横スクロールなし、HTML copy `x=76 / y=110`。
- `1026px`: desktop透過画像を選択。中間幅はルートを右へ逃がし、CTAとの重なりを回避。
- `863px`: desktop透過画像を選択。ページ高 `1822px` を維持。

**Validation**

- `node .playwright-cli\capture-wide-concept-compare.cjs`
- `node .playwright-cli\capture-route-map-fix.cjs`
- `node .playwright-cli\capture-hero-breakpoints.cjs`
- `node .playwright-cli\interaction-check.cjs`
- in-app browser: `1975px` / `1763px` のfirst viewport確認。

**Evidence Files**

- `.playwright-cli/concept-wide-current-1975.png`
- `.playwright-cli/concept-wide-compare-1975.png`
- `.playwright-cli/wide-1240-full-route-map-fix.png`
- `.playwright-cli/hero-bp-1026.png`
- `.playwright-cli/hero-bp-1240.png`
- `.playwright-cli/mobile-390-route-map-fix.png`

final result: passed
