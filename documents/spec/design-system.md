# デザインシステム仕様

## 概要

dark/minimal なビジュアル言語を Design Token として SSOT 化する。

## Hero バリアント

| Variant | 用途 | 挙動 |
|---------|------|------|
| `TopHero`（#hero） | トップ `/`（`TopShell` 内）— **現行** | 参照HTML #hero。マーク「SHAPE∞D」→コピー2行→サブ→スクロールキューのフェードイン + 雨 Canvas。Issue #304 |
| `immersive`（`components/Hero.tsx`） | 旧トップヒーロー（**#304 でトップから撤去、コンポーネントは未使用のまま残置**） | 100svh、GSAP pin、粒子ロゴ→コピー出現、CTA 1 ボタン。撤去した資産（Hero.tsx / 粒子・ビッグバン / 関連 E2E・CLS 対策 CSS）の整理は別 issue で追跡 |
| `brand` | （非推奨・未使用） | サブページ Hero は廃止し philosophy 系レイアウトに統一 |

### TopHero（#hero）— Issue #304

参照HTML `lib/design/shape-d-prototype-v4.html`（L125-L200, L629-L644, L816-L857, L898-L903）を SSOT とする。定数は `lib/design/tokens.ts` の `topHero`。

| 要素 | 仕様 |
|------|------|
| マーク | `<h1 class="hero-mark">SHAPE<span class="inf">∞</span>D`。`--latin`（Cormorant）、∞ は `--rain` 色。イントロ前 `opacity:0` |
| コピー | `.hero-copy .line` × 2（`--serif` = Shippori Mincho）。イントロ前 `opacity:0` + `translateY(18px)` |
| サブ | `.hero-sub`（`--mono` = JetBrains Mono） |
| 雨 Canvas | `components/top/RainCanvas.tsx`。幅 26px あたり 1 本の細線（`rgb(125,156,196)`）が個別速度で降下。`#rain-canvas { opacity: 0.5 }`。reduced-motion 時は rAF を回さず静止描画を 1 度のみ |
| スクロールキュー | `.scroll-cue`（SCROLL + 雨だれ `hero-drop-fall` 2.6s ループ） |
| イントロ | GSAP timeline（`power3.out`）: マーク 2.4s(@0.4) → コピー stagger 0.9 / 1.8s(@1.2) → サブ 1.6s(@-0.6) → キュー 1.4s(@-0.8)。参照HTML同様 reduced-motion のときのみスキップ（低性能端末でも実行） |
| reduced-motion | `globals.css` の `.top-scope` フォールバックで全ヒーロー要素を `opacity:1 !important` 即時表示・雨だれアニメ無効（参照HTML L611-L617 相当） |
| 背景 | `.top-hero { background: var(--ink) }` で自前の ink 背景を敷き、cosmic 背景（#312 で無効化予定）がヒーロー内で透けないようにする |
| テスト | `data-testid="hero-rain-canvas"` / `hero-scroll-cue`。E2E: `e2e/top-hero.spec.ts` |

### TopPhilosophy（#vision）— Issue #305

参照HTML L202-L222 / L646-L657 / L905-L911。定数は `topHero.taglineScrub`。

| 要素 | 仕様 |
|------|------|
| eyebrow | 共通 `.eyebrow`（`PHILOSOPHY` / 私たちの考え） |
| タグライン | 「商品・サービスは、自己表現のツールである。」を1文字ずつ `.vision-tagline .w`（`display:inline-block`, 初期 `opacity:0.08`）に分割。`--serif`（Shippori）。分割 span は `aria-hidden`、読み上げは `<h2 aria-label>` に集約 |
| 文字送り | ScrollTrigger scrub（trigger `#vision` / start `top 70%` / end `center center` / scrub 0.8 / stagger 0.05）で opacity 0.08→1。`useGsapContext` 経由（reduced-motion のみスキップ） |
| ノート | `.vision-note`（`--mist`, max-width 580px） |
| reduced-motion | `.top-scope .vision-tagline .w { opacity:1 !important }` フォールバックで全文字即時表示 |
| テスト | E2E: `e2e/top-philosophy.spec.ts` |

### TopPain（#pain）— Issue #306

参照HTML L224-L251 / L659-L670 / L913-L923。定数は `topHero.pain`。

| 要素 | 仕様 |
|------|------|
| eyebrow | `REALITY` / こんな課題はありませんか |
| pain-line × 3 | `<p class="pain-line">` lead + `<strong>`（強調は `--moon`、地は `--mist`）。初期 `opacity:0` + `translateY(24px)`。各行が**自身をトリガー**（top 78%）に独立フェードイン（y+24→0 / duration 1.6 / power2.out） |
| pain-close | `--rain` 色。top 82% で opacity フェードイン（duration 2 / power2.out） |
| 背景 | `linear-gradient(to bottom, var(--ink), var(--ink-2))` |
| reduced-motion | `.top-scope .pain-line` / `.pain-close { opacity:1 !important }` フォールバックで即時表示 |
| テスト | E2E: `e2e/top-pain.spec.ts` |

### TopTheory（#theory・円の重なり pinned scrub）— Issue #307

参照HTML L253-L324 / L672-L692 / L925-L936。定数は `topHero.theory`。**トップページ初の pin 演出**。

| 要素 | 仕様 |
|------|------|
| eyebrow / title | `APPROACH` / 差別化の核 + `自己一致 × AIエンジニアリング`（`--serif`） |
| 円 × 2 | `.circle.ideal`（左 `translate(-118%,-50%)`）/ `.circle.real`（右 `translate(18%,-50%)`）。pin 中の scrub で xPercent ±84 まで移動し中央で重なる |
| congruence-label | `一致` / `SYSTEM AS SELF-EXPRESSION`。初期 `opacity:0`、進行 0.72 でフェードイン。`aria-hidden`（図の説明は `.circles` の `role="img"` + `aria-label`） |
| pin | ScrollTrigger `trigger #theory` / `start top top` / `end +=120%` / `scrub 1` / `pin: true`。**`pinType: 'transform'` を明示**（velocity-skew の transform 祖先下で `position:fixed` pin が破綻するため。周囲コンテンツと一貫して動く） |
| 強調演出 | 進行 0.5 で円ボーダー `rgba(125,156,196,0.7)`、0.6 で円ラベル減光 `rgba(139,147,161,0.25)` |
| 375px 等 | `@media (max-width:640px)` で円を 160px に縮小。`#theory { overflow: hidden }` で初期スプレッド円の横あふれを閉じ込め |
| reduced-motion | pin なし。CSS フォールバックで両円を中央（`translate(-50%,-50%)`）へ寄せた収束状態 + ラベル表示 |
| テスト | E2E: `e2e/top-theory.spec.ts` |

> velocity-skew と pin/fixed の相互作用は #312（velocity-skew 無効化・pin 設計）で追跡。#307 は `pinType:'transform'` で先行して安全に実装している。

### TopServices（#services・pinned パネル切替）— Issue #308

参照HTML L326-L389 / L694-L725 / L938-L960。定数は `topHero.services`。2 つ目の pin 演出。

| 要素 | 仕様 |
|------|------|
| 4 パネル | 01 基幹システム開発 / 02 HP・Webサイト制作 / 03 AI活用・業務効率化 / 04 継続開発・伴走。各 `.svc-num`（アウトライン数字 `-webkit-text-stroke`, `aria-hidden`）/ `.svc-title`（和文）/ `.svc-en`（英字）/ `.svc-desc`。絶対配置で重ね、初期は先頭のみ表示 |
| pin + 切替 | `trigger #services` / `start top top` / `end +=(パネル数×90)%` / `scrub 0.8` / `pin: true` / `pinType:'transform'`。前パネルを `y-30` フェードアウト → 次を `y+30→0` フェードイン（各 duration 0.35、次は +0.15 オフセット、全て duration 明示） |
| プログレスドット | `.svc-dot` × 4。ScrollTrigger `onUpdate` で `floor(progress × 4)` に応じて `.on`（`--rain`）を移動。`aria-hidden` |
| reduced-motion | pin なし。`.svc-stage { height:auto; overflow:visible }` + `.svc-panel { position:relative; min-height:100vh; visibility:visible }` で 4 パネルを縦積み表示、プログレスドットは非表示 |
| テスト | E2E: `e2e/top-services.spec.ts` |

### TopProcess（#process・縦タイムライン）— Issue #309

参照HTML L391-L433 / L727-L754 / L962-L968。定数は `topHero.process.step`。

| 要素 | 仕様 |
|------|------|
| eyebrow | `PROCESS` / つくり方 |
| 4 ステップ | 01 LISTEN 聴く / 02 TRANSLATE 翻訳する / 03 BUILD かたちにする / 04 GROW 育てる。`.step`（左 `border-left` + `::before` の `--rain` ドット）に `.step-num`（`--mono`）/ `.step-title`（`--serif`）/ `.step-desc` |
| リビール | 各 step が**自身をトリガー**（top 82%）に、時差（`delay: i×0.12`）で `y+20→0` フェードイン（duration 1.4 / power2.out、`useGsapContext` 経由） |
| 背景 | `linear-gradient(to bottom, var(--ink-2), var(--ink))` |
| reduced-motion | `.top-scope .step { opacity:1 !important }` フォールバックで全ステップ即時表示 |
| テスト | E2E: `e2e/top-process.spec.ts` |

### TopProfile（#profile・二つの思想と収束SVG）— Issue #310

参照HTML L435-L535 / L756-L789 / L970-L999。定数は `topHero.profile`。

| 要素 | 仕様 |
|------|------|
| profile-head | 明石 康汰 / SHAPE∞D 代表・エンジニア / AutoDevJapan BRM兼CBO。`y+16→0` フェード（top 84% / duration 1.6） |
| 二つの思想 | `.thoughts`（2 カラムグリッド）: 01 PSYCHOLOGY / 02 AI ENGINEERING（引用 + 説明）。各 `.thought` が `.thoughts` トリガー（top 80%）で `delay: i×0.3` の時差フェード（y+20→0） |
| 収束 SVG | `.converge`（viewBox 0 0 880 150）: `#cv-l` / `#cv-r` の 2 パスを `getTotalLength()` で全長 dashoffset 初期化し、scrub（top 88%→top 42% / 0.8）で `strokeDashoffset:0` 描画。`#cv-dot` は top 44% で点灯。`aria-hidden` |
| 理念（creed） | 「二つの思想は、一つの理念へ / 商品・サービスは、自己表現のツールである。」top 40% でフェード（duration 2） |
| 640px 以下 | `.thoughts` 1 カラム化、`.converge` は `display:none`、creed マージン調整 |
| reduced-motion | `.profile-head` / `.thought` / `.creed { opacity:1 !important }` + `.converge circle { opacity:1 }`（パスは dasharray 未設定のため全描画）で即時表示 |
| テスト | E2E: `e2e/top-profile.spec.ts` |

## 下層ページ見出し（PageHeader）

`/services`・`/works`・`/process`・`/process/development`・`/process/consulting`・`/contact` で共通の `components/ui/PageHeader.tsx` を使用する。

| 要素 | 仕様 |
|------|------|
| ラッパー | `SectionShell`（radial gradient）+ `pt-[calc(var(--space-section)+env(safe-area-inset-top,0px))]`（ナビ clearance + ノッチ補正 Issue #167） |
| タイトル | 中央 `h1`、欧文 `clamp(36px,5vw,48px)`、`TextReveal`（`animateTitle={true}` 時 — `useStaticReveal()` を参照し hydration 安全な即時表示。contact は `animateTitle={false}` で plain span） |
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

## トップページ刷新基盤（#302 / #303）

トップページを参照デザイン `lib/design/shape-d-prototype-v4.html`（SSOT）へ刷新するための基盤。
新フォント・新カラートークンは**トップページ限定**（`.top-scope` 配下）で、既存トークン・既存フォントと並存する（#302 基本方針 2026-07-03 確定）。下層ページはスコープ外。

### スコープ構造（route group）

| パス | シェル |
|------|--------|
| `app/page.tsx`（トップ） | `components/top/TopShell`（TopNav / `#thread` / TopFooter + `.top-scope`） |
| `app/(site)/*`（下層: contact / philosophy / process / services / works） | `app/(site)/layout.tsx`（既存 `Navigation` / `Footer`） |

SmoothScrollProvider / CustomCursor / MicroInteractionBinder / PageLoader / `template.tsx` は当面ルートレイアウトに残す（トップでの無効化は #312 で制御方針を確定）。

### カラートークン（`.top-scope` 限定）

TS SSOT: `lib/design/tokens.ts` の `topColors` / `topColorCssVars`（css-token-sync テストで `globals.css` と同期検証）。

| Token | 値 | 用途 |
|-------|-----|------|
| `--ink` / `--ink-2` / `--ink-3` | `#07090d` / `#0b0e15` / `#10141d` | 背景（基調 / 浮き / フッター） |
| `--moon` | `#dfe3ea` | 本文テキスト |
| `--mist` / `--mist-dim` | `#8b93a1` / `#545c6a` | 補助テキスト / eyebrow |
| `--rain` / `--rain-dim` | `#7d9cc4` / `rgba(125,156,196,0.35)` | アクセント（縦糸・選択・CTA hover） |
| `--hairline` | `rgba(139,147,161,0.16)` | ボーダー |

### フォント（トップ限定 — `components/top/top-fonts.ts`）

| CSS var | フォント | next/font 変数 |
|---------|---------|----------------|
| `--serif` | Shippori Mincho（400/500/600） | `--font-shippori-mincho` |
| `--gothic` | Zen Kaku Gothic New（300/400/500） | `--font-zen-kaku-gothic-new` |
| `--mono` | JetBrains Mono（300/400） | `--font-jetbrains-mono` |
| `--latin` | Cormorant Garamond | 既存 `--font-display` を流用 |

`top-fonts.ts` は TopShell 以外から import しない（next/font はフォント CSS を使用ページにのみ含めるため、これがトップ限定適用の仕組み）。

### 共通シェル

| 要素 | 仕様 |
|------|------|
| `TopNav`（`.top-nav`） | `window.scrollY > 60`（`topShell.navScrollThresholdPx`）で `.scrolled` — 縮小 + `backdrop-filter: blur(14px)` + ヘアラインボーダー。下層ページ導線を維持（#314 暫定方針・モバイルメニュー含む）。「ご相談」CTA は既存 `/contact` へ接続 |
| `TopThread`（`#thread`） | 縦糸ライン。ページ全体のスクロール進捗で `scaleY(0→1)`（GSAP scrub `topShell.threadScrub` = 1.2）。reduced-motion / 低性能端末では `useGsapContext` が setup を実行せず非表示のまま |
| `TopFooter`（`.top-footer`） | マーク + 下層リンク（#311 で最終化） + コピーライト |
| 共通スタイル | `.top-scope .stage` / `.top-scope .eyebrow`（参照HTML L96-L123 相当） |

注意: `.top-scope` に `transform` / `filter` を追加しない（配下 fixed 要素の基準が viewport でなくなる）。`backdrop-filter` は標準プロパティのみ記述する（`-webkit-` を手書きすると Lightning CSS が標準プロパティを除去する）。

既存セクション（Hero / About / MissionVision / Showcase）は #304〜#311 で参照HTMLの各セクションへ順次差し替える。それまでは `CosmicScene`（`fixed z-0` + 自前背景）が `.top-scope` の `--ink` 背景を覆うため、最終ビジュアルはセクション差し替え完了時に現れる。

## Cosmic Grade（#102 / #224）

Hero / キービジュアル（`CosmicScene`）に subtle な質感を加える CSS レイヤー。全面 WebGL は採用せず、オーバーレイで premium な depth を抽象化する。当初は warm-gold グレードだったが、ビッグバン導入の白銀トーンに合わせて**クールな深宇宙（シルバー/ブルー）**へ再調整した（#224）。識別子は #227 で `warmGrade` → `cosmicGrade` へリネーム済み。

| Token / Class | 値 / 挙動 | 備考 |
|---------------|-----------|------|
| `cosmicGrade.overlayStart/Mid/End` | `rgba(150,170,210,0.08–0.15)` | TS SSOT（`lib/design/tokens.ts`）。`overlayGradient` は stops + `overlayMidStop`（45%）から導出 |
| `--cosmic-grade-overlay` | 上記 stops の linear-gradient（CSS は var 参照で同等構造） | `app/globals.css`。mid stop は `overlayMidStop` と sync テストで検証 |
| `.cosmic-grade-overlay` | `mix-blend-mode: soft-light` | 常時適用（モバイル含む） |
| `--cosmic-grade-nebula-filter` | `saturate(1.05) brightness(1.04)`（暖色なし） | デスクトップ nebula のみ |
| `.cosmic-nebula-layer--cosmic-grade` | `@media (min-width:768px) and (prefers-reduced-motion: no-preference)` で filter 適用 | モバイル / reduced-motion は overlay のみ |
| `.cosmic-nebula-layer` | `mix-blend-mode: screen` / `opacity: var(--cosmic-grade-nebula-screen-opacity)` | グレードは CSS overlay で一元管理。素材画像は色味を焼き込まない素直な版を使用する（Issue #202 で AI 焼き込み版から復元） |

`data-testid="cosmic-grade-overlay"` で E2E 検証可能。背景 `#0a0a0a` の暗さ・ミニマルさは維持する。色温度は素材画像ではなく CSS グレード overlay（`.cosmic-grade-overlay` / `--cosmic-grade-nebula-filter`）で付与する設計とし、色味調整を1箇所に集約してテイストのブレを防ぐ。

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

| ファイル | 用途 | サイズ（WebP q85） |
|---------|------|-----------------|
| `hero-cosmic-bg.webp` | デスクトップ宇宙背景（3344×1882・白銀トーン／#224） | 206 KB |
| `hero-cosmic-bg-mobile.webp` | モバイル宇宙背景（1536×2304・白銀トーン／#224） | 199 KB |
| `hero-nebula-layer.webp` | パララックス前景（`mix-blend-mode: screen`、純黒締め WebP・シルバー宇宙ガス／#224） | 134 KB |
| `hero-particle-band.webp` | ロゴ背後の粒子帯（immersive のみ） | 471 KB |
| `bigbang-core.webp` | ビッグバン導入：中心プラズマ核（加算合成・黒背景） | 74 KB |
| `bigbang-rays.webp` | ビッグバン導入：神の光条（god-rays・加算合成） | 36 KB |
| `bigbang-nebula.webp` | ビッグバン導入：星雲ガス層（3層パララックス・加算合成） | 34 KB |
| `shape-d-logo-transparent.png` | 正規タイトルロゴ（透過 PNG、Nav / Hero / Footer 共通）。Hero 粒子形成（`LogoParticleFormation`）も同一 PNG のアルファからターゲット点をサンプリング | — |

ビッグバン光テクスチャ（`bigbang-*.webp`、計 144 KB）は `prefers-reduced-motion` 時は読み込まれず、低性能端末（`isTouchInputDevice`）では `core` / `rays` のみ使用（星雲層を省略）。
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
