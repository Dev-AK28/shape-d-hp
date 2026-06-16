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
| タイトル | 中央 `h1`、欧文 `clamp(36px,5vw,48px)`、`TextReveal`（`animateTitle={true}` 時 — `useStaticReveal()` + 初回 `staticReveal` ラッチ。contact は `animateTitle={false}` で plain span） |
| タイトルサイズ方針 | **全下層ページで同一サイズ**（旧 contact 専用 `clamp(48px,6vw,64px)` は廃止）。process との完全統一を意図する |
| 区切り線 | 96px グラデーション（`dividerVariant`: `blue` / `purple` / `sky` — SSOT: `pageHeaderDividers` + `globals.css`）。`showDivider={false}` で contact は非表示 |
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
| `--section-blue` | `#60a5fa` | 開発系セクションアクセント（Tailwind `blue-400`） |
| `--section-blue-light` | `#93c5fd` | Works 等（Tailwind `blue-300`） |
| `--section-purple` | `#a78bfa` | コンサル系（Tailwind `violet-400`） |

グラデーション・光沢は最小限。「静けさ」を優先。

## Warm Gold Grade（#102）

Hero / キービジュアル（`CosmicScene`）に subtle な温かみを加える CSS レイヤー。全面 WebGL は採用せず、`#c4b5a0` アクセントに合わせたオーバーレイで premium warmth を抽象化する。

| Token / Class | 値 / 挙動 | 備考 |
|---------------|-----------|------|
| `warmGrade.overlayStart/Mid/End` | `rgba(196,181,160,0.08–0.15)` | TS SSOT（`lib/design/tokens.ts`）。`overlayGradient` は stops + `overlayMidStop`（45%）から導出 |
| `--warm-grade-overlay` | 上記 stops の linear-gradient（CSS は var 参照で同等構造） | `app/globals.css`。mid stop は `overlayMidStop` と sync テストで検証 |
| `.cosmic-warm-grade-overlay` | `mix-blend-mode: soft-light` | 常時適用（モバイル含む） |
| `--warm-grade-nebula-filter` | `sepia(0.08) saturate(1.05) hue-rotate(-5deg)` | デスクトップ nebula のみ |
| `.cosmic-nebula-layer--warm-grade` | `@media (min-width:768px) and (prefers-reduced-motion: no-preference)` で filter 適用 | モバイル / reduced-motion は overlay のみ |

`data-testid="cosmic-warm-grade-overlay"` で E2E 検証可能。背景 `#0a0a0a` の暗さ・ミニマルさは維持する。

## Typography Blend（#101）

nebula / 宇宙背景の上では `mix-blend-mode: screen` でタイポグラフィを背景に溶け込ませ、単色・半透明パネル背景のセクションでは blend を無効化する。

| Token / Class | 値 / 挙動 | 備考 |
|---------------|-----------|------|
| `typographyBlend.cosmic` | `screen` | TS SSOT（`lib/design/tokens.ts`） |
| `typographyBlend.solid` | `normal` | 単色 / パネル背景向け |
| `.type-blend-cosmic` | `mix-blend-mode: screen` + subtle `text-shadow` | Hero h1 / Hero リード / `starBackground` PageHeader |
| `.type-blend-solid` | `mix-blend-mode: normal` | 明示的 normal（必要時） |
| `TextReveal` `blend` prop | `'cosmic' \| 'solid'`（default: `solid`） | About / MissionVision 等は default のまま |

Hero デスクトップ GSAP では cosmic blend 適用前（`logoOpacityHideAt` = `revealTimelineStart`）に `timeline.set` でロゴ opacity を即時 0 にし、`mix-blend-mode` の backdrop が nebula のみになる。GSAP `onUpdate` で `logoScrollHidden` を同期し `aria-hidden` を更新。

`data-testid="type-blend-cosmic"` — Hero h1 E2E 検証用。E2E では computed `mix-blend-mode: screen` も検証する。

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
| `sizeVisualWord` | MissionVision 背景ワード（`SELF-CONGRUENCE`） |

CSS utility: `type-size-*`（`typographySizeClasses`）— `globals.css` の `--type-size-*` と同期。

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

## Micro-interactions（Issue #103）

ナビ・Hero CTA・Footer リンク向けの GSAP `quickTo` hover。スクロールリビール用 `whileHover`（`ServicesContent` 等）は Framer Motion の別レイヤー。

| 要素 | `data-micro-interaction` | hover 変化 | 備考 |
|------|--------------------------|-----------|------|
| グローバルナビリンク | `nav` | opacity 0.75 + letter-spacing 0.1em→0.14em | `Navigation.tsx`（letter-spacing は Link の GSAP preset が制御。子要素に inline / Tailwind で上書きしない） |
| Hero CTA | `cta` | scale 1.03 + opacity 0.88 | `Hero.tsx` |
| Footer リンク | `footer` | opacity 0.75 + letter-spacing 微妙に拡大 | `Footer.tsx`（`tracking-*` は付与しない。preset SSOT） |

SSOT: `lib/scroll/micro-interaction.ts`（`MICRO_INTERACTION` presets）+ `lib/scroll/animation-tokens.ts`（`ANIMATION_DURATION.interaction` = 0.25s、`ANIMATION_EASE.interaction` = `power2.out`）。

- バインダ: `components/ui/MicroInteractionBinder.tsx`（`app/layout.tsx` で 1 回マウント。初回スキャン + `MutationObserver` で動的追加ノードもバインド。`data-micro-interaction-bound` で二重バインド防止）
- 無効条件: `prefers-reduced-motion` / coarse pointer / `hover: none`（`shouldEnableMicroInteraction()`）
- magnetic effect は採用しない
- 一般ボタン（`.nav-menu-button` 除く）の CSS opacity hover は従来どおり `globals.css`

## カスタムカーソル

`components/ui/CustomCursor.tsx`:

- 小円（8px）+ 追従リング（32px）
- magnetic effect は控えめ（リング追従係数 0.12）
- モバイル / coarse pointer / reduced-motion 時は非表示、`cursor: auto` にフォールバック

## アクセシビリティ

- `:focus-visible` のみフォーカスリング表示
- reduced-motion 時カーソル無効

## インライン style → Tailwind 移行（Issue #15）

段階的にインライン `style` を Tailwind ユーティリティへ置換する。

| コンポーネント | 状態 |
|----------------|------|
| `ProcessNavigation.tsx` | 移行済み（`--section-blue` / `--section-purple` CSS 変数 + `color-mix`） |
| `About.tsx` | 移行済み（Tailwind + `var(--space-*)` / `var(--content-wide)` 等。opacity を `opacity-100/opacity-0` に移行） |
| `MissionVision.tsx` | 移行済み（同上 + `var(--content-standard)`。blockquote opacity を `opacity-100/opacity-0` に移行） |
| `Hero.tsx` | 移行済み（section / logoRef / particleBandRef / copyRef / ctaRef を Tailwind に移行。GSAP 制御の動的 opacity/visibility は style 維持） |
| `Navigation.tsx` | 移行済み（nav リンク色・ハンバーガーボタン・アイコン div を Tailwind に移行） |
| `CosmicScene.tsx` | 移行済み（外側 div `bg-[#0a0a0a]`、グラデーション `bg-[linear-gradient(...)]`。`perspectiveTransformOrigin` は動的 prop のため style 維持） |
| `PhilosophyContent.tsx` | 移行済み（overlay letter `opacity-[0.04]` に移行。item.bgTint は動的値のため style 維持） |
| `PhilosophyProgressDots.tsx` | 移行済み（CSS 変数 `--accent` / `--muted`） |
| `PageHeader.tsx` 区切り線 | 移行済み（`dividerVariant` + `page-header-divider-*` クラス） |
| `DevelopmentContent.tsx` | 未移行（23 箇所・次優先） |
| `WorksContent.tsx` / `ServicesContent.tsx` / `ConsultingContent.tsx` | 未移行（各 48–52 箇所・順次対応） |
| その他（`BrandLogo` / `StarBackground` / `NebulaBackground` / `ParallaxSection`） | 動的値のため style 維持が妥当（Tailwind 移行対象外） |

セクションアクセント色（`blue` / `purple` / `sky`）は `lib/design/tokens.ts` の `colors.blue` 等と `:root` の `--section-*` CSS 変数、Tailwind の `blue-400` / `violet-400` / `blue-300` を対応付ける。`css-token-sync.test.ts` で TS ↔ CSS の同期を検証する。

### 移行時のフォント・タイポグラフィ（Issue #15）

Tailwind に未生成の `font-display` / `font-serif-jp` は使わない。次のパターンを使用する。

| 用途 | Tailwind / CSS クラス | 備考 |
|------|----------------------|------|
| 欧文見出し（Cormorant） | `type-font-serif`（`typographyFontClasses.serif`） | `var(--font-serif)` = `var(--font-display)` |
| 日本語本文 | `type-font-serif-jp`（`typographyFontClasses.serifJp`） | `globals.css` で font stack 定義 |
| fluid サイズ | `type-size-*`（`typographySizeClasses`） | `--type-size-*` CSS 変数と同期（`typographySizeCssVars`） |
| ホームセクション共有 | `lib/design/section-typography-classes.ts` | About / MissionVision の見出し・caption 等 |

色は `text-[color:var(--foreground)]` 形式を推奨（`ProcessNavigation` と統一）。`text-[clamp(...)]` の直書きは `type-size-*` へ寄せる。

## 参照

- `lib/design/tokens.ts` — TypeScript SSOT（`colors` / `pageHeaderDividers` / `pageHeaderDividerColors` / `sectionAccentCssVars` / `typographySizeClasses` / `typographySizeCssVars` / `typographySizeTokenKeys` / `typographyFontClasses`）
- `lib/design/section-typography-classes.ts` — ホーム About / MissionVision 共有 class 文字列
- `app/globals.css` — CSS 変数定義
