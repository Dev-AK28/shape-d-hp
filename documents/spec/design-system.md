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
| `--border` | `rgba(240,240,240,0.12)` | ボーダー |

グラデーション・光沢は最小限。「静けさ」を優先。

## タイポグラフィ

| Token | フォント | 用途 |
|-------|---------|------|
| `--font-display` | Cormorant Garamond | 欧文見出し・ブランド |
| `--font-serif-jp` | Noto Serif JP | 日本語本文 |
| `--font-serif` | Cormorant Garamond | 欧文本文 |

`next/font` で preload。サイズは `clamp()` による fluid typography（`lib/design/tokens.ts`）。

## Spacing

8px grid system。CSS 変数 `--space-1` 〜 `--space-section`。

## Motion Tokens

| Token | 値 |
|-------|-----|
| `--duration-base` | `1.4s` |
| `--ease-base` | `cubic-bezier(0.16, 1, 0.3, 1)` |

## カスタムカーソル

`components/ui/CustomCursor.tsx`:

- 小円（8px）+ 追従リング（32px）
- magnetic effect は控えめ（リング追従係数 0.12）
- モバイル / coarse pointer / reduced-motion 時は非表示、`cursor: auto` にフォールバック

## アクセシビリティ

- `:focus-visible` のみフォーカスリング表示
- reduced-motion 時カーソル無効

## 参照

- `lib/design/tokens.ts` — TypeScript SSOT
- `app/globals.css` — CSS 変数定義
