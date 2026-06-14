# デザインシステム仕様

## 概要

dark/minimal なビジュアル言語を Design Token として SSOT 化する。

## Hero バリアント

| Variant | 用途 | 挙動 |
|---------|------|------|
| `immersive` | トップ `/` | 100svh、GSAP pin、ロゴ縮小→コピー出現、CTA 1 ボタン |
| `brand` | サブページ | 100svh、ブランドロゴのみ（pin・CTA・固定コピーなし） |

## カラーパレット

| Token | 値 | 用途 |
|-------|-----|------|
| `--background` | `#0a0a0a` | ページ背景 |
| `backgroundElevated` | `#111111` | Hero グラデーション終端 |
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
| `--duration-base` | `1.4s`（スクロールリビール等） |
| `--duration-interaction` | `0.25s`（リンク・ボタン hover） |
| `--ease-base` | `cubic-bezier(0.16, 1, 0.3, 1)` |

## Micro-interactions

グローバル CSS とナビゲーション向けの控えめな opacity 変化。スクロールリビール用 `whileHover`（`ServicesContent` 等）は別レイヤー。

- リンク・ボタン hover: opacity 変化のみ（`--duration-interaction` = 0.25s）
- ページ遷移: `app/template.tsx` → `PageTransition` で本文 fade-in（0.6s）。初回訪問は即時表示
- グローバルナビ: `app/layout.tsx` に配置（遷移フェード対象外）。レスポンシブ切替は Tailwind `md:`（768px = `MOBILE_BREAKPOINT_PX`）
- magnetic effect は採用しない

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
