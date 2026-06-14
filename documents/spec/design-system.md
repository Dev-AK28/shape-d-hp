# デザインシステム仕様

## 概要

dark/minimal なビジュアル言語を Design Token として SSOT 化する。

## Hero バリアント

| Variant | 用途 | 挙動 |
|---------|------|------|
| `immersive` | トップ `/`（`HomePageShell` 内） | 100svh、GSAP pin、粒子ロゴ→コピー出現、CTA 1 ボタン。背景は Shell 側 |
| `brand` | （非推奨・未使用） | サブページ Hero は廃止し philosophy 系レイアウトに統一 |

## カラーパレット

| Token | 値 | 用途 |
|-------|-----|------|
| `--background` | `#0a0a0a` | ページ背景 |
| `backgroundElevated` | `#111111` | Hero グラデーションオーバーレイ |
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

| Token | 用途 |
|-------|------|
| `sizeHero` | ブランドロゴ SHAPE∞D |
| `sizePageHeading` | トップ Hero h1 |
| `sizeHeading` | セクション見出し |
| `sizeSubheading` | リード文 |
| `sizeQuote` | VISION 引用 |
| `sizeBody` / `sizeCaption` | 本文 / ラベル |

## Layout

| Token | 値 | 用途 |
|-------|-----|------|
| `contentProse` | `680px` | 長文・Hero h1 |
| `contentStandard` | `880px` | Hero コピー・VISION |
| `contentWide` | `1040px` | ABOUT 2 カラム |

CSS 変数: `--content-prose` / `--content-standard` / `--content-wide`（`app/globals.css`）。

## Hero 背景アセット

`lib/design/background-assets.ts` / `public/`:

| ファイル | 用途 |
|---------|------|
| `hero-cosmic-bg.webp` | デスクトップ宇宙背景 |
| `hero-cosmic-bg-mobile.webp` | モバイル宇宙背景 |
| `hero-nebula-layer.png` | パララックス前景（`mix-blend-mode: screen`） |
| `hero-particle-band.webp` | ロゴ背後の粒子帯（immersive のみ） |
| `shape-d-logo-transparent.png` | 正規タイトルロゴ（透過 PNG、Nav / Hero / Footer 共通） |

レンダリング: `components/background/CosmicScene.tsx` + `components/BrandLogo.tsx`。

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

- リンク hover: `.nav-link` の opacity 変化のみ（`--duration-interaction` = 0.25s）。`ServicesContent` 等の `whileHover` カードは対象外
- ボタン hover: `button:not(.nav-menu-button)` の opacity 変化のみ
- ページ遷移: `app/template.tsx` → `PageTransition` で本文 fade-in（0.6s）。初回訪問は即時表示。`Footer` は `layout.tsx` 配置のためフェード対象外
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
