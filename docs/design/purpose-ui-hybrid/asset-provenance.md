# ハイブリッドUIの素材記録

ユーザー指定: 内容は案3、デザインは案1。

デザイン参照: exec-2a687cb1-4917-4c14-aebe-fd6fc6eedc78.png (1536×1024)。内容・独立7サービス・料金条件はPR143の案3実装を維持する。

機器画像はbuilt-in image_genで作成した。生成するのは機器外観だけであり、実績ページの日本語と写真は生成しない。デスクトップ画面には既存cherry-homepage.webp、スマートフォン画面には2026-10-15 UTCにhttps://cherry.acecore.net/を390×844 CSS pxで撮影した実画像を使用する。生成画像の矩形画面部分へのimg配置と前景cropで構成する。

## 最終生成prompt

Generate one production web hero asset: a photorealistic slim open silver laptop and a black slim modern smartphone standing vertically slightly in front of its right edge. Camera exactly front-on to both display surfaces, no perspective or rotation at all, both screens form perfect upright rectangles, so actual screenshot image elements can later be placed over the screens. Laptop screen 16:10 landscape. Smartphone screen tall approximately 9:19.5. Laptop screen large and dominant; phone about 65% laptop total height. Refined soft studio lighting, realistic black bezels, delicate silver laptop base visible below screen, subtle realistic grounding shadow, generous transparent space surrounding all objects. Both screens solid neutral white, no text, no imagery, no symbols, no logos, no branding, no desktop UI, no decorative background. Outside device surfaces use true alpha transparency. Layout fills canvas horizontally: laptop centered left taking 85% width, phone front right, visibly overlaps only far right part of laptop. Canvas wide 3:2. Purpose: overlay real existing website screenshots on exact rectangular white screens in HTML, retaining this raster asset as device body. Deliver ONE image only.

生成原本: exec-e6fd7263-48ad-4da2-901d-9af1dd2542b9.png (1536×1024 RGBA)。参照ボードの周囲の見出し・装飾文章や人物写真は新規生成しない。
