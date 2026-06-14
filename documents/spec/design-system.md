# デザインシステム仕様

## 概要

dark/minimal なビジュアル言語を Design Token として SSOT 化する。

## Hero バリアント

| Variant | 用途 | 挙動 |
|---------|------|------|
| `immersive` | トップ `/`（`HomePageShell` 内） | 100svh、GSAP pin、粒子ロゴ→コピー出現、CTA 1 ボタン。背景は Shell 側 |
| `brand` | （非推奨・未使用） | サブページ Hero は廃止し philosophy 系レイアウトに統一 |

## 下層ページ見出し（PageHeader）

`/services`・`/works`・`/process`・`/process/development`・`/process/consulting`・`/contact` で共通の `components/ui/PageHeader.tsx` を使用する。

| 要素 | 仕様 |
|------|------|
| ラッパー | `SectionShell`（radial gradient）+ `pt-[120px]`（ナビ clearance） |
| タイトル | 中央 `h1`、欧文 `clamp(36px,5vw,48px)`、`TextReveal`（contact のみ静的） |
| タイトルサイズ方針 | **全下層ページで同一サイズ**（旧 contact 専用 `clamp(48px,6vw,64px)` は廃止）。process との完全統一を意図する |
| 区切り線 | 96px グラデーション（`showDivider={false}` で contact は非表示） |
| リード | 日本語プレーン `p`（`page-header-subtitle`）— ページ和名 + 説明 |
| 背景 | 通常は gradient のみ。`/process` 系（`/process`・`/process/development`・`/process/consulting`）は `starBackground` で `StarBackground` を重ねる |
| テスト | `data-testid="page-header"` / `page-header-divider` / `page-header-email` / `star-background` |

StarBackground Hero は Issue #93 により `/services`・`/works` では使用しない。

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

## Warm Gold Grade（#102）

Hero / キービジュアル（`CosmicScene`）に subtle な温かみを加える CSS レイヤー。全面 WebGL は採用せず、`#c4b5a0` アクセントに合わせたオーバーレイで premium warmth を抽象化する。

| Token / Class | 値 / 挙動 | 備考 |
|---------------|-----------|------|
| `warmGrade.overlayStart/Mid/End` | `rgba(196,181,160,0.08–0.15)` | TS SSOT（`lib/design/tokens.ts`）。`overlayGradient` は stops から導出 |
| `--warm-grade-overlay` | 上記 stops の linear-gradient | `app/globals.css` |
| `.cosmic-warm-grade-overlay` | `mix-blend-mode: soft-light` | 常時適用（モバイル含む） |
| `--warm-grade-nebula-filter` | `sepia(0.08) saturate(1.05) hue-rotate(-5deg)` | デスクトップ nebula のみ |
| `.cosmic-nebula-layer--warm-grade` | `@media (min-width:768px) and (prefers-reduced-motion: no-preference)` で filter 適用 | モバイル / reduced-motion は overlay のみ |

`data-testid="cosmic-warm-grade-overlay"` で E2E 検証可能。背景 `#0a0a0a` の暗さ・ミニマルさは維持する。

## タイポグラフィ

| Token | フォント | 用途 |
|-------|---------|------|
| `--font-display` | Cormorant Garamond | 欧文見出し・ブランド |
| `--font-serif-jp` | Noto Serif JP | 日本語本文 |
| `--font-serif` | Cormorant Garamond | 欧文本文 |

`next/font` で preload。サイズは `clamp()` による fluid typography（`lib/design/tokens.ts`）。

| Token | 用途 |
|-------|------|
| `sizeHero` | （レガシー token）欧文ディスプレイ見出し用 clamp。Hero ロゴは `BrandLogo` 画像 |
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
| `contentWide` | `1040px` | ABOUT 2 カラム、`/services`・`/works` コンテンツ幅 |

CSS 変数: `--content-prose` / `--content-standard` / `--content-wide`（`app/globals.css`）。

## Z-index スタック

トップページ（`/`）の fixed 背景とフロー内コンテンツの重なり順 SSOT。詳細は [`scroll-animation.md`](./scroll-animation.md) も参照。

| Layer | z-index | コンポーネント | 備考 |
|-------|---------|---------------|------|
| CosmicScene（fixed） | `z-0` | `HomePageShell` | `pointer-events-none` |
| main | `z-10` | `HomePageShell` | 本文 |
| Footer | `z-20` | `Footer.tsx`（`layout.tsx` 配置） | 全ページ共通 |
| Navigation | `z-[1000]` | `Navigation.tsx` | fixed グローバルナビ |
| PageLoader | `z-[2000]` | `PageLoader.tsx` | 初回ロードオーバーレイ |
| CustomCursor | `9999` | `CustomCursor.tsx` | デスクトップのみ |

## Hero 背景アセット

`lib/design/background-assets.ts` / `public/`:

| ファイル | 用途 |
|---------|------|
| `hero-cosmic-bg.webp` | デスクトップ宇宙背景 |
| `hero-cosmic-bg-mobile.webp` | モバイル宇宙背景 |
| `hero-nebula-layer.png` | パララックス前景（`mix-blend-mode: screen`） |
| `hero-particle-band.webp` | ロゴ背後の粒子帯（immersive のみ） |
| `shape-d-logo-transparent.png` | 正規タイトルロゴ（透過 PNG、Nav / Hero / Footer 共通）。Hero 粒子形成（`LogoParticleFormation`）も同一 PNG のアルファからターゲット点をサンプリング |

寸法 SSOT: `lib/design/brand-logo-constants.ts`（1536×1024、hero 最大幅 `min(88vw, 560px)`）

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
