# デザインシステム仕様

## 概要

dark/minimal なビジュアル言語を Design Token として SSOT 化する。

## カラーパレット

| Token | 値 | 用途 |
|-------|-----|------|
| `--background` | `#0a0a0a` | ページ背景 |
| `--foreground` | `#f0f0f0` | 本文テキスト |
| `--muted` | `#9ca3af` | 補助テキスト |
| `--accent` | `#c4b5a0` | アクセント（リンク・CTA・カーソル） |
| `--accent-subtle` | `rgba(196,181,160,0.6)` | 控えめアクセント（カーソルリング等） |
| `--border` | `rgba(240,240,240,0.12)` | ボーダー |

グラデーション・光沢は最小限。「静けさ」を優先。

## タイポグラフィ

| Token | フォント | 用途 |
|-------|---------|------|
| `--font-display` | Cormorant Garamond | 欧文見出し・ブランド |
| `--font-serif-jp` | Noto Serif JP | 欧文混在テキスト（latin subset） |
| `--font-serif` | Cormorant Garamond（`--font-display` エイリアス） | 欧文本文 |

`next/font` で preload。サイズは `clamp()` による fluid typography（`lib/design/tokens.ts`）。

**日本語本文について**: `next/font` の Noto Serif JP は Google Fonts 上 CJK subset が提供されないため、日本語グリフは system serif fallback が primary となる。

```css
font-family: var(--font-serif-jp), var(--font-serif), 'Hiragino Mincho ProN', 'Yu Mincho', serif;
```

## Spacing

8px grid system。CSS 変数 `--space-1` 〜 `--space-section` と `lib/design/tokens.ts` の `spacing.*` は手動同期（`tests/design/css-token-sync.test.ts` で検証）。

| CSS 変数 | TS token | 値 |
|---------|----------|-----|
| `--space-1` | `spacing.xs` | 8px |
| `--space-2` | `spacing.sm` | 16px |
| `--space-3` | `spacing.md` | 24px |
| `--space-4` | `spacing.lg` | 32px |
| `--space-6` | `spacing.xl` | 48px |
| `--space-8` | `spacing.xxl` | 64px |
| `--space-section` | `spacing.section` | 120px |

## Motion Tokens

### CSS / Design レイヤー（`lib/design/tokens.ts` + `globals.css`）

| Token | 値 | 用途 |
|-------|-----|------|
| `--duration-base` / `motion.durationBase` | `1.4s` | 将来の CSS/Tailwind 用 |
| `--ease-base` / `motion.easeBase` | `cubic-bezier(0.16, 1, 0.3, 1)` | 将来の CSS/Tailwind 用 |

### ランタイム レイヤー（意図的分離）

| レイヤー | SSOT | 用途 |
|---------|------|------|
| GSAP / Lenis | `lib/scroll/animation-tokens.ts` | ScrollTrigger・スムーススクロール duration/ease |
| framer-motion | `lib/scroll/easing.ts` | ScrollReveal / TextReveal（duration は `ANIMATION_DURATION.base` を参照） |

3系統の easing 値はレイヤーごとに最適化されており、数値の完全一致は求めない。duration `1.4s` / `1.4` は各 SSOT 間で同期する。

## カスタムカーソル

`components/ui/CustomCursor.tsx`（`DeferredCustomCursor` 経由、`ssr: false`）:

- 小円（8px）+ 追従リング（32px）
- magnetic effect は控えめ（リング追従係数 `cursor.followerLerp`: 0.12）
- 初回 `mousemove` または **キーボード操作後の** `focusin` で `data-custom-cursor="active"` を付与し、システムカーソルを非表示
- システムカーソル非表示は `html[data-custom-cursor='active'] * { cursor: none !important }` でインライン `cursor: pointer` より優先
- `input` / `textarea` / `select` は `cursor: text !important` を維持
- 非表示時は rAF ループを停止、`willChange: transform` も解除
- タブ切替・ウィンドウ blur・`visibilitychange` で `data-custom-cursor` を解除
- キーボード `focusin` 表示中は `scroll` / `resize` で `document.activeElement` に追従
- モバイル / coarse pointer / `(hover: none)` / reduced-motion 時は非表示、システムカーソルは常に `auto`
- 印刷時（`@media print`）はカスタムカーソル DOM を非表示

`lib/design/custom-cursor.ts` に有効条件と DOM 属性操作を集約。

## ページ背景

各 `page.tsx` の `<main>` グラデーションは `from-[var(--background)] to-black` を使用し、カラーパレット SSOT と整合させる。

## ユーティリティ

| クラス | 用途 |
|--------|------|
| `.noise-bg` | 最小限のノイズテクスチャ背景（任意セクションに適用） |

## アクセシビリティ

- `html { color-scheme: dark; }` でネイティブ form コントロールをダーク UI に整合
- `:focus-visible` のみフォーカスリング表示
- reduced-motion / mobile / coarse pointer / `(hover: none)` 時カーソル無効
- キーボード操作時のみ `focusin` でカスタムカーソルを表示（Tab 操作でもカーソルが見える。マウスクリック由来の focus は無視）。`:focus-visible` 一致時は SR 等の非 keydown フォーカスも許可
- キーボード表示中は `scroll` / `resize` で `document.activeElement` に追従

## 参照

- `lib/design/tokens.ts` — TypeScript SSOT
- `lib/design/custom-cursor.ts` — カスタムカーソル制御
- `app/globals.css` — CSS 変数定義
