# Tailwind CSS v4

Acecore Systems の Astro UI は Tailwind CSS v4.3.1 を Vite プラグイン経由でビルドします。`npm ci` と `npm run build` がローカルと CI の再現手順です。

## スタイルの入口

- `src/styles/global.css` が Tailwind の入口です。公式の `theme`、`preflight`、`utilities` レイヤーを明示的な順序で読み込みます。
- Preflight は採用しています。移行前にも box sizing、余白、画像、フォーム書体のリセットがあったため、視覚的な回帰を避けつつ Tailwind 側で同じ基盤を再現します。
- 既存の意味的なクラスは `@layer components` に置き、Tailwind のレイヤー順に従います。別のユーティリティ基盤を併用しません。
- `public/admin/cms-notice.css` は Astro ビルド外の Sveltia CMS 向け静的通知であり、サイト UI の Tailwind バンドルには含めません。

## Acecore トークンと規約

`@theme` では `paper`、`surface`、`ink`、`blue`、罫線、フォーム境界、フォーカス色、余白、書体を定義しています。新しい局所レイアウトには Tailwind ユーティリティを使い、複数画面で共有する意味的な部品は `@layer components` に置きます。

フォーカスは `--color-focus` を使用し、`:focus-visible` の輪郭を維持します。キーボード操作可能な要素で outline を消す場合は、同等以上に見えるフォーカス表示を必ず追加してください。
