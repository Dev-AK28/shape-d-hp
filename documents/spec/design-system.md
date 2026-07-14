# デザインシステム仕様

## 概要

dark/minimal なビジュアル言語を Design Token として SSOT 化する。

## トップページの仕上げ（#313）

- **meta / OGP**（`app/layout.tsx`）: タイトルを参照HTMLの「SHAPE∞D — 想いを、動くかたちに。自己一致 × AIエンジニアリング」へ更新。`metadataBase` = `https://www.shape-d.com`、`openGraph`（type/locale/siteName/url）+ `twitter`（`summary_large_image`）を整備。
- **OGP 画像**（`app/opengraph-image.tsx`）: `next/og` の `ImageResponse` で 1200×630 を動的生成（ink 背景 / moon 文字 / rain 色の ∞）。Satori のフォント読込回避のため英字・記号のみ。
- **レスポンシブ**: 375 / 640 / 768 / 1280px で全セクション（円の重なり・pinned パネル含む）に横あふれが無いことを E2E（`e2e/top-responsive.spec.ts`）で担保。
- **キーボードフォーカス**: ナビ下層リンク / ご相談 CTA / CTA ボタンに `:focus-visible` の `--rain` アウトライン。Tab 順で主要導線に到達することを E2E で確認。
- **雨 Canvas の省電力**（#313）: `IntersectionObserver` + `visibilitychange` でヒーローが画面外・タブ非アクティブのとき rAF を停止。
- **文字送りの尺**（#313）: PHILOSOPHY タグライン scrub の tween に `duration: 0.5` を明示し、`configureGsapDefaults()` の 1.4 の影響を打ち消して参照HTMLの尺比を再現。
- **Lighthouse**（#326 完了）: CI（mobile / 閾値 **0.9**）で Performance **90 以上**を強制。主な最適化は (1) 日本語フォント（Shippori Mincho / Zen Kaku Gothic New）の `preload: false` 化 — subset 分割できない日本語フォントに `preload: true` を指定すると next/font が全 unicode-range スライス（約480ファイル / 11MB）へ preload を張るため、(2) Noto Serif JP のロードを `app/(site)/layout.tsx`（下層限定）へ移設、(3) ヒーローイントロの CSS アニメーション化（ハイドレーション待ちで LCP が遅延しない）。Accessibility は focus-visible / aria 実装で担保（96）。

## 下層ページごとの metadata（#395）

- 各下層ページ（`/philosophy` `/process` `/process/development` `/process/consulting` `/services` `/works` `/contact`）は `app/layout.tsx` の `metadata`（トップページ用コピー・`openGraph.url: '/'`）を継承するだけだったため、検索結果 / SNS シェアで全ページがトップの title/description/OGP url になっていた不具合を修正。
- 各 `page.tsx`（Server Component）に固有の `metadata`（`title` / `description` / `alternates.canonical` / `openGraph`）を export する。`openGraph` は子セグメントが `openGraph` を設定すると親の値を丸ごと上書きする（浅いマージ）ため、`type` / `locale` / `siteName` を含む完全なオブジェクトを毎ページで再指定する。
- `/contact` は `page.tsx` が `'use client'`（フォーム状態管理のため）で `metadata` を export できないため、同階層に `app/(site)/contact/layout.tsx`（Server Component）を新設し、そこに `metadata` を配置して `page.tsx` をラップする。
- `metadataBase`（`https://www.shape-d.com`）はルートで設定済みのため、各ページの `openGraph.url` / `alternates.canonical` は相対パス（例: `/works`）で指定する。
- 回帰テスト: `tests/design/page-metadata.test.ts`（各ページの `title` / `description` / `openGraph.url` がユニークであることを検証）。

## トップページのアニメーション制御（#312）

参照HTML（L611-L617, L878-L896）に合わせ、トップページ（`/`）と下層ページで演出インフラを分岐する（2026-07-03 確定）。SSOT は `lib/scroll/lenis-config.ts`（`getPageScrollProfile`）。

| 項目 | トップページ（`/`） | 下層ページ |
|------|------|------|
| Lenis スクロール | duration **1.8** + カスタム easing（`t => 1 - (1-t)^4`） | duration 1.4 |
| velocity-skew（skewY） | **無効** | 有効（`[data-velocity-content]` を追跡） |
| CustomCursor | **無効** | 有効（`SubPageEffects`、デスクトップ fine-pointer） |
| PageLoader | **無効** | 有効 |
| MicroInteractionBinder | **無効** | 有効 |
| cosmic 背景（CosmicScene） | **撤去**（各参照セクションが不透明 `--ink` 系背景を持つ） | 使用しない |

- 実装: `SmoothScrollProvider`（`usePathname()` で Lenis 速度・velocity-skew を分岐）/ `SubPageEffects`（トップで cursor/loader/micro を非マウント）/ `app/page.tsx`（HomePageShell を使わず plain `<main>`）。
- reduced-motion: 各参照セクションが `.top-scope` の CSS フォールバックで即時表示（`useGsapContext` / RainCanvas が GSAP/rAF をスキップ）。
- pin（`#theory` / `#services`）: `pinType:'transform'` で velocity-skew の transform 祖先問題を回避（#307/#308）。velocity-skew 自体もトップで無効化したため二重に安全。ScrollTrigger は `useGsapContext` の `gsap.context().revert()` で route 遷移・アンマウント時にクリーンアップ。
- 下層ページの pin（`components/PhilosophyContent.tsx` の水平スクロール pin）も同じ理由で `pinType:'transform'` を明示する（`lib/scroll/animation-tokens.ts` の `PHILOSOPHY_HORIZONTAL.pinType`）。下層ページは velocity-skew が無効化されておらず `[data-velocity-content]` に常時適用されるため、トップの pin より対策が必須（#351。詳細は philosophy-page.md）。
- テスト: `tests/scroll/lenis-config.test.ts`（プロファイル選択）/ `e2e/home.spec.ts`（トップ無効化）/ `e2e/sub-page-effects.spec.ts`（下層維持）。
- 旧トップ資産（`components/Hero.tsx` / `About.tsx` / `MissionVision.tsx` / `home/ShowcaseSection.tsx` / `home/HomePageShell.tsx` / cosmic 関連）はトップから撤去済み。コンポーネント本体は #304 / #329 で、残存トークン・アセットは #316 で物理削除済み。

## Hero（トップ）

トップページのヒーローは `components/top/TopHero`（`#hero`）のみ。参照HTML の #hero を SSOT とし、マーク「SHAPE∞D」→コピー2行→サブ→スクロールキューのフェードイン（CSS アニメーション・#326）+ 雨 Canvas で構成する（Issue #304）。旧イマーシブ Hero（`components/Hero.tsx` の `immersive` / `brand` バリアント）と粒子・ビッグバン演出は #304 で置換され、資産は #316 で撤去済み。

### TopHero（#hero）— Issue #304

参照HTML `lib/design/shape-d-prototype-v4.html`（L125-L200, L629-L644, L816-L857, L898-L903）を SSOT とする。定数は `lib/design/tokens.ts` の `topHero`。

| 要素 | 仕様 |
|------|------|
| マーク | `<h1 class="hero-mark">SHAPE<span class="inf">∞</span>D`。`--latin`（Cormorant）、∞ は `--rain` 色。イントロ前 `opacity:0` |
| コピー | `.hero-copy .line` × 2（`--serif` = Shippori Mincho）。イントロ前 `opacity:0` + `translateY(18px)` |
| サブ | `.hero-sub`（`--mono` = JetBrains Mono） |
| 雨 Canvas | `components/top/RainCanvas.tsx`。幅 26px あたり 1 本の細線（`rgb(125,156,196)`）が個別速度で降下。`#rain-canvas { opacity: 0.5 }`。reduced-motion 時は rAF を回さず静止描画を 1 度のみ |
| スクロールキュー | `.scroll-cue`（SCROLL + 雨だれ `hero-drop-fall` 2.6s ループ） |
| イントロ | **CSS アニメーション**（`globals.css` の `top-hero-intro-*`、#326 で GSAP から移行）: マーク 2.4s(@0.4) → コピー stagger 0.9 / 1.8s(@1.2) → サブ 1.6s(@3.3) → キュー 1.4s(@4.1)。ease は power3.out ≒ `cubic-bezier(0.165,0.84,0.44,1)`。ハイドレーションを待たず開始されるため FCP/LCP を遅らせず、JS 無効環境でも表示される。尺の SSOT は `topHero.intro`（css-token-sync テストで同期）。reduced-motion のときのみスキップ |
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
| reduced-motion | pin なし。`.svc-stage { height:auto; overflow:visible }` + `.svc-panel { position:relative; min-height:100svh; visibility:visible }`（#425: iOS URL バー伸縮対策で `100svh` に統一）で 4 パネルを縦積み表示、プログレスドットは非表示 |
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

### TopCta（#cta）+ フッター確定 — Issue #311

参照HTML L537-L598 / L791-L808。**参照デザインの最終セクション**（これで hero〜CTA が揃う）。

| 要素 | 仕様 |
|------|------|
| eyebrow / copy / note | `CONTACT` / 最初の一歩、`構想の段階から、話せます。`（`--serif`）、売り込みしない旨のノート |
| CTA ボタン | `.cta-button`（`無料相談を申し込む`）→ **既存の `/contact`（フォーム → /api/contact → Resend）へ接続**（2026-07-03 確定・新規実装なし）。ナビ「ご相談」も `/contact`（#303 TopNav） |
| ホバー演出 | 純 CSS。`.cta-button::after`（`--rain` 背景 / `transform-origin:left`）が `scaleX(0)→(1)` で左から満ち、文字色が `--ink` に反転（GSAP なし） |
| フォーカス | `:focus-visible` で `--rain` アウトライン |
| 背景 | `linear-gradient(to bottom, var(--ink), var(--ink-3))` |
| フッター | `TopFooter`（#303）。コピーライトを参照HTMLの `© 2026 SHAPE∞D — self-congruence × ai engineering` へ確定。下層ページリンクは #314 暫定方針で維持 |
| テスト | E2E: `e2e/top-cta.spec.ts` |

> 旧セクション（`About` / `MissionVision` / `ShowcaseSection`）と `HomePageShell`（cosmic 背景）は参照側（#305〜#310）で置換のうえ、#312（cosmic / velocity-skew 無効化）と #316（トークン・アセットの物理削除）で撤去完了済み。

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
| `--serif` | Shippori Mincho（400/500 — 600 は未使用のため #326 で削減） | `--font-shippori-mincho` |
| `--gothic` | Zen Kaku Gothic New（300/400/500） | `--font-zen-kaku-gothic-new` |
| `--mono` | JetBrains Mono（300/400） | `--font-jetbrains-mono` |
| `--latin` | Cormorant Garamond | 既存 `--font-display` を流用 |

`top-fonts.ts` は TopShell 以外から import しない（next/font はフォント CSS を使用ページにのみ含めるため、これがトップ限定適用の仕組み）。

日本語フォント（Shippori Mincho / Zen Kaku Gothic New）は **`preload: false` 必須**（#326）:
subset 分割できない日本語フォントに `preload: true` を指定すると、next/font が全 unicode-range
スライス（約480ファイル / 11MB）へ `<link rel="preload">` を張り Lighthouse Performance を大きく落とす。
preload なしなら実際に使う文字のスライスのみオンデマンドでロードされる。

### 共通シェル

| 要素 | 仕様 |
|------|------|
| `TopNav`（`.top-nav`） | `window.scrollY > 60`（`topShell.navScrollThresholdPx`）で `.scrolled` — 縮小 + `backdrop-filter: blur(14px)` + ヘアラインボーダー。下層ページ導線を維持（#314 暫定方針・モバイルメニュー含む）。「ご相談」CTA は既存 `/contact` へ接続 |
| `TopThread`（`#thread`） | 縦糸ライン。ページ全体のスクロール進捗で `scaleY(0→1)`（GSAP scrub `topShell.threadScrub` = 1.2）。reduced-motion / 低性能端末では `useGsapContext` が setup を実行せず非表示のまま |
| `TopFooter`（`.top-footer`） | マーク + 下層リンク（#311 で最終化） + コピーライト |
| 共通スタイル | `.top-scope .stage` / `.top-scope .eyebrow`（参照HTML L96-L123 相当） |

注意: `.top-scope` に `transform` / `filter` を追加しない（配下 fixed 要素の基準が viewport でなくなる）。`backdrop-filter` は標準プロパティのみ記述する（`-webkit-` を手書きすると Lightning CSS が標準プロパティを除去する）。

既存セクション（Hero / About / MissionVision / Showcase）は #304〜#311 で参照HTMLの各セクションへ差し替え完了済み。旧 `CosmicScene`（`fixed z-0` + 自前背景）は #312 でトップから撤去され、各セクションが不透明な `--ink` 系背景を持つ。

## Cosmic Grade（#102 / #224 / #227）— 撤去済み（#347）

> **撤去済み（#312 / #347）**: 旧イマーシブ Hero のキービジュアル（`CosmicScene`）に premium な depth を加えていた CSS グレーディング（`cosmicGrade` トークン・`--cosmic-grade-*` CSS 変数・`.cosmic-grade-overlay` / `.cosmic-nebula-layer` / `.cosmic-nebula-layer--cosmic-grade` クラス）です。`CosmicScene` はトップページ刷新（#302 / #312）で撤去され、消費者がいなくなったため、トークンと CSS を #347 で物理削除しました（`lib/design/tokens.ts` / `app/globals.css` / `tests/design/css-token-sync.test.ts`）。現行トップは不透明な `--ink` 系背景を使います。仕様の詳細（暖色→クール宇宙トーンの経緯等）は GitHub Issue #102 / #224 / #227 を参照してください。撤去の回帰ガードとして `e2e/home.spec.ts` が `data-testid="cosmic-grade-overlay"` の非存在（`toHaveCount(0)`）を検証します。

## Typography Blend（#101）

nebula / 宇宙背景の上では `mix-blend-mode: screen` でタイポグラフィを背景に溶け込ませ、単色・半透明パネル背景のセクションでは blend を無効化する。

| Token / Class | 値 / 挙動 | 備考 |
|---------------|-----------|------|
| `typographyBlend.cosmic` | `screen` | TS SSOT（`lib/design/tokens.ts`） |
| `typographyBlend.solid` | `normal` | 単色 / パネル背景向け |
| `.type-blend-cosmic` | `mix-blend-mode: screen` + subtle `text-shadow` | `starBackground` PageHeader（下層）。旧トップ Hero h1 での使用は #302 で撤去 |
| `.type-blend-solid` | `mix-blend-mode: normal` | 明示的 normal（必要時） |
| `TextReveal` `blend` prop | `'cosmic' \| 'solid'`（default: `solid`） | 下層ページの `PageHeader` / `TextReveal` で使用（`components/ui/PageHeader.tsx` / `components/scroll/TextReveal.tsx`） |

`data-testid="type-blend-cosmic"` — `starBackground` を持つ下層 PageHeader の E2E 検証用。E2E では computed `mix-blend-mode: screen` も検証する。

## タイポグラフィ

| Token | フォント | 用途 |
|-------|---------|------|
| `--font-display` | Cormorant Garamond | 欧文見出し・ブランド（`app/layout.tsx` で宣言） |
| `--font-serif-jp` | Noto Serif JP | 日本語本文（**下層ページ限定** — `app/(site)/layout.tsx` で宣言。#326 でルートレイアウトから移設し、トップではロードされない） |
| `--font-serif` | Cormorant Garamond | 欧文本文 |

`next/font` で preload（latin subset のみ）。サイズは `clamp()` による fluid typography（`lib/design/tokens.ts`）。

| Token | 用途 |
|-------|------|
| `sizeHero` | （レガシー token）欧文ディスプレイ見出し用 clamp。Hero ロゴは `BrandLogo` 画像 |
| `sizePageHeading` | トップ Hero h1 |
| `sizeHeading` | セクション見出し |
| `sizeSubheading` | リード文 |
| `sizeQuote` | VISION 引用 |
| `sizeBody` / `sizeCaption` | 本文 / ラベル |
| `sizeVisualWord` | 大型ビジュアルワード（`SELF-CONGRUENCE` 等）向け clamp。旧 MissionVision 背景ワードで使用していた（現在は `PhilosophyContent` 等が利用） |

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

トップページ（`/`）は `TopShell` 内の各セクションが不透明背景を持ち、fixed の `#thread`（縦糸）/ `.top-nav` を重ねる（旧 `CosmicScene` / `HomePageShell` は #312 で撤去）。下層ページ（`app/(site)/`）は以下のスタックを使う。

| Layer | z-index | コンポーネント | 備考 |
|-------|---------|---------------|------|
| main | `z-10` | 下層各ページ | 本文 |
| Footer | `z-20` | `Footer.tsx`（`app/(site)/layout.tsx` 配置） | 下層ページ共通 |
| Navigation | `z-[1000]` | `Navigation.tsx` | fixed グローバルナビ（下層） |
| PageLoader | `z-[2000]` | `PageLoader.tsx` | 初回ロードオーバーレイ（トップは #312 で無効） |
| CustomCursor | `9999` | `CustomCursor.tsx` | 下層デスクトップのみ（トップは #312 で無効） |

## 画像アセット

`lib/design/background-assets.ts` / `public/`:

| ファイル | 用途 | サイズ |
|---------|------|-----------------|
| `shape-d-logo-transparent.png` | 正規タイトルロゴ（透過 PNG、Nav / Footer 共通、`components/BrandLogo.tsx`） | — |

> **撤去済み（#316）**: 旧イマーシブ Hero 用の宇宙背景・ネビュラ・粒子帯（`hero-cosmic-bg*.webp` / `hero-nebula-layer.webp` / `hero-particle-band.webp`）とビッグバン光テクスチャ（`bigbang-core/rays/nebula.webp`）は、`CosmicScene` / `LogoParticleFormation` の撤去に伴い削除しました（計約 1.2MB）。

寸法 SSOT: `lib/design/brand-logo-constants.ts`。レンダリング: `components/BrandLogo.tsx`。

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
| CTA | `cta` | scale 1.03 + opacity 0.88 | 下層ページ CTA（旧 `Hero.tsx` の CTA 向けだったが #316 で撤去、preset は残置） |
| Footer リンク | `footer` | opacity 0.75 + letter-spacing 微妙に拡大 | `Footer.tsx`（`tracking-*` は付与しない。preset SSOT） |

> `MicroInteractionBinder` はトップページでは無効（#312）。上表は下層ページ（`app/(site)/`）の hover 演出。

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
| `Navigation.tsx` | 移行済み（nav リンク色・ハンバーガーボタン・アイコン div を Tailwind に移行） |
| `PhilosophyContent.tsx` | 移行済み（overlay letter `opacity-[0.04]` に移行。item.bgTint は動的値のため style 維持） |
| `PhilosophyProgressDots.tsx` | 移行済み（CSS 変数 `--accent` / `--muted`） |
| `PageHeader.tsx` 区切り線 | 移行済み（`dividerVariant` + `page-header-divider-*` クラス） |
| `DevelopmentContent.tsx` | 未移行（23 箇所・次優先） |
| `WorksContent.tsx` / `ServicesContent.tsx` / `ConsultingContent.tsx` | 未移行（各 48–52 箇所・順次対応） |
| その他（`BrandLogo` / `StarBackground` / `NebulaBackground`） | 動的値のため style 維持が妥当（Tailwind 移行対象外） |

セクションアクセント色（`blue` / `purple` / `sky`）は `lib/design/tokens.ts` の `colors.blue` 等と `:root` の `--section-*` CSS 変数、Tailwind の `blue-400` / `violet-400` / `blue-300` を対応付ける。`css-token-sync.test.ts` で TS ↔ CSS の同期を検証する。

### 移行時のフォント・タイポグラフィ（Issue #15）

Tailwind に未生成の `font-display` / `font-serif-jp` は使わない。次のパターンを使用する。

| 用途 | Tailwind / CSS クラス | 備考 |
|------|----------------------|------|
| 欧文見出し（Cormorant） | `type-font-serif`（`typographyFontClasses.serif`） | `var(--font-serif)` = `var(--font-display)` |
| 日本語本文 | `type-font-serif-jp`（`typographyFontClasses.serifJp`） | `globals.css` で font stack 定義 |
| fluid サイズ | `type-size-*`（`typographySizeClasses`） | `--type-size-*` CSS 変数と同期（`typographySizeCssVars`） |

色は `text-[color:var(--foreground)]` 形式を推奨（`ProcessNavigation` と統一）。`text-[clamp(...)]` の直書きは `type-size-*` へ寄せる。

## 参照

- `lib/design/tokens.ts` — TypeScript SSOT（`colors` / `pageHeaderDividers` / `pageHeaderDividerColors` / `sectionAccentCssVars` / `typographySizeClasses` / `typographySizeCssVars` / `typographySizeTokenKeys` / `typographyFontClasses`）
- `app/globals.css` — CSS 変数定義
