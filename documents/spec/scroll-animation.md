# スクロールアニメーション仕様

## 概要

Octaboot 風のスクロール連動体験を、Lenis + GSAP ScrollTrigger + framer-motion の3層基盤の上で全主要ページに統一適用する。

## 基盤コンポーネント

| コンポーネント | 用途 |
|--------------|------|
| `SmoothScrollProvider` | Lenis スムーズスクロール + GSAP ticker 統合（`prefers-reduced-motion` 時無効） |
| `useGsapContext` | client component 内 GSAP ScrollTrigger セットアップ（reduced-motion 時スキップ） |
| `PageLoader` | 初回訪問時の軽量ローディング体験（背景透明・LCP 非ブロック） |
| `PageTransition` | `app/template.tsx` 経由のページ本文 fade-in（0.6s、初回訪問は即時、reduced-motion 時即時） |
| `ScrollReveal` | セクション単位のフェードリビール |
| `TextReveal` | 見出しのグラフェム/ワード単位リビール |
| `ParallaxSection` | スクロール連動パララックス（`prefers-reduced-motion` 時無効） |

## 共通設定（SSOT）

`lib/scroll/animation-tokens.ts`（GSAP）:

- `ANIMATION_DURATION.base`: `1.4` / `hero`: `1.6` / `section`: `1.8` / `pageTransition`: `0.6`
- `ANIMATION_EASE.base`: `expo.out` / `section`: `power3.inOut` / `reveal`: `power3.out`
- `REVEAL_OFFSET.y`: `20` / `stagger`: `0.15` / `maxStaggerItems`: `6`

`lib/scroll/gsap-config.ts`:

- `gsap.registerPlugin(ScrollTrigger)` — client のみ
- Lenis 統合: `gsap.ticker.add((time) => lenis.raf(time * 1000))` + `lenis.on('scroll', ScrollTrigger.update)`
- `shouldDisableGsapAnimation(profile)` — Lenis と同条件（reduced-motion / mobile / coarse pointer）で GSAP pin 無効

`lib/scroll/easing.ts`（framer-motion）:

- `scrollEase`: `[0.22, 1, 0.36, 1]`
- `scrollViewport`: `{ once: true, margin: '-80px', amount: 0.2 }`
- `scrollTransition.duration`: `1.4`
- `scrollVariants`: `fadeUp`, `fadeUpLarge`, `fadeLeft`, `scale`（y offset: 20px）
- `scrollStagger`: `item: 0.15`, `card: 0.15`

`lib/scroll/reveal-props.ts` の `getScrollRevealProps()` が各コンテンツコンポーネントから参照される。

## 適用ページ

| パス | 適用内容 |
|------|---------|
| `/` | Hero `immersive` variant: scroll-driven pin（GSAP）+ Server `h1`（LCP）+ About / MissionVision scroll storytelling（下記）。**スクロール領域全体で fixed `CosmicScene` のビジュアル背景が継続**（スタック順は Footer が前面、下記「スタック順」参照） |
| `/services` | PageHeader + ServicesContent スタガー + TextReveal（Hero なし・StarBackground なし） |
| `/works` | PageHeader + WorksContent 同上 |
| `/philosophy` | PhilosophyContent — full-screen SHAPE-D パネル + GSAP snap + オーバーレイ文字（Hero なし。詳細: [`philosophy-page.md`](./philosophy-page.md)） |
| `/process` | ProcessNavigation / ProcessContent |
| `/process/development` | DevelopmentContent |
| `/process/consulting` | ConsultingContent |
| `/contact` | ScrollReveal + TextReveal（既存） |

### トップ Hero 背景・ロゴ（補足）

- 背景: `HomePageShell` + `CosmicScene`（fixed `z-0`、`public/hero-cosmic-bg*.webp` + `hero-nebula-layer.png`）。`isReady` 後に `CosmicScene` をマウントしモバイル初回ハイドレーションの背景誤読込を防止。ページスクロール全体で `scale` / ネビュラ `y`+`opacity` を GSAP scrub
- スタック順: `CosmicScene`（`z-0`）< `main`（`z-10`）< `Footer`（`relative z-20`、`app/layout.tsx`）。fixed 背景がフッター上に重ならない
- ロゴ: `LogoParticleFormation`（Canvas 粒子 → `shape-d-logo-transparent.png` のアルファシルエット形成）→ 完了後 `BrandLogo`（同一 PNG・同一 hero ステージ寸法で crossfade）。`prefers-reduced-motion` / モバイル静的フォールバック時は粒子スキップ
- 粒子サンプリング: PNG を最長辺 `768px`（`LOGO_SAMPLE_MAX_DIMENSION`）にダウンサンプルして `getImageData` メモリを抑制。画像ロード失敗時は粒子をスキップし `BrandLogo` を表示（`onComplete` フォールバック）
- 粒子描画 scale: `LOGO_PARTICLE_RENDER_SCALE`（`0.98`）— hero ステージ内 `object-contain` の余白に合わせた inset
- 粒子形成時間: `LOGO_PARTICLE_FORMATION_MS`（`2400`）— `LogoParticleFormation` と E2E 待機の SSOT
- E2E 連続性: 形成中 Canvas に非透明ピクセルが描画され、完了後 `BrandLogo` が同一 `hero-logo-stage` 内でセンター整合することを `expectHeroBrandLogoAfterFormation` で検証
- StarBackground はトップでは使用しない

### トップ About / MissionVision（Issue #80）

| セクション | コンポーネント | アニメーション | 備考 |
|-----------|--------------|--------------|------|
| ABOUT | `About.tsx` | 経歴 `[data-timeline-item]` を GSAP stagger（最大 `REVEAL_OFFSET.maxStaggerItems`） | 心理学 / エンジニアリングは左右分割グリッド + framer-motion リビール |
| VISION | `MissionVision.tsx` | `[data-vision-quote]` を GSAP stagger | 背景に `SELF-CONGRUENCE` visual word（`aria-hidden`） |

共通 GSAP 設定: `y: REVEAL_OFFSET.y` → `0` / `opacity: 0` → `1` / `duration: 1.4` / `stagger: 0.15` / `ease: ANIMATION_EASE.base`

- `prefers-reduced-motion` / モバイル / coarse pointer 時: `useGsapContext` が GSAP をスキップ（`shouldDisableGsapAnimation(profile)` + framer-motion `useReducedMotion`）。`shouldUseStaticReveal(profile, reduceMotion, isReady)` により `!isReady` 時も含め `getScrollRevealProps({ staticReveal: true })` と `TextReveal` の即時表示を適用。`globals.css` の `[data-timeline-item]` / `[data-vision-quote]` メディアクエリ（`prefers-reduced-motion: reduce` および `max-width: 767px`）で `opacity: 1` を保証

## アクセシビリティ

- `useReducedMotion()` / `prefers-reduced-motion` 有効時:
  - Lenis 無効
  - PageLoader 非表示
  - PageTransition 即時表示（duration 0）
  - リビールアニメーション duration 0 / initial false
  - ParallaxSection は通常 div にフォールバック
  - Hero `immersive`: GSAP pin 無効、ロゴ非表示・コピー/CTA を即時表示（`pointer-events: auto`）
- デスクトップ Hero `immersive`（GSAP pin 有効）:
  - コピー/CTA・ロゴ層（`logoRef` / `particleBandRef`）の `opacity` / `pointer-events` は GSAP が制御（React インラインスタイルと競合しない）
  - `scrollRevealed` はタイムライン `onUpdate` でコピー `opacity` から同期し、スクロール位置復元時も `tabIndex` がずれない
  - スクロールリビール前の CTA は `tabIndex={-1}` でキーボードフォーカスを防止。リビール後は `tabIndex={0}`
  - 粒子形成中の `BrandLogo` は `aria-hidden` で a11y ツリーから除外
- モバイル / coarse pointer 時:
  - Lenis 無効
  - Hero `immersive`: GSAP pin 無効（静的フォールバック）。`height: auto`・CTA をフロー内配置し About へスクロールしやすくする
  - About / MissionVision: `shouldUseStaticReveal` により framer-motion / TextReveal を即時表示

## 受け入れ基準

`documents/spec/acceptance-criteria.md` の「スクロールアニメーション」セクションを参照。

## 検証

```bash
npm test
npm run build
npm run test:e2e
npm run lighthouse:check   # サーバー起動後。Performance >= 70（モバイル）
```

- E2E: `e2e/scroll-animation.spec.ts`（セクションリビール / reduced-motion）
- Lighthouse: `scripts/lighthouse-check.mjs` + CI `lighthouse` job（閾値 0.7）
  - CI ではモバイル viewport を維持しつつ `--throttling-method=provided` で CPU 二重スロットリングを回避
