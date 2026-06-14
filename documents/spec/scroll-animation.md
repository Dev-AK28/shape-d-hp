# スクロールアニメーション仕様

## 概要

Octaboot 風のスクロール連動体験を、Lenis + GSAP ScrollTrigger + framer-motion の3層基盤の上で全主要ページに統一適用する。

## 基盤コンポーネント

| コンポーネント | 用途 |
|--------------|------|
| `SmoothScrollProvider` | Lenis スムーズスクロール + GSAP ticker 統合（`shouldDisableSmoothScroll`: reduced-motion / mobile / coarse pointer 時無効） |
| `useGsapContext` | client component 内 GSAP ScrollTrigger セットアップ（`shouldDisableGsapAnimation(profile)` — smooth scroll 無効条件と同じ。setup/revert 後に `refreshScrollTrigger()`） |
| `PageLoader` | 初回訪問時の軽量ローディング体験（背景透明・LCP 非ブロック） |
| `ScrollReveal` | セクション単位のフェードリビール |
| `TextReveal` | 見出しのグラフェム/ワード単位リビール |
| `ParallaxSection` | スクロール連動パララックス（`prefers-reduced-motion` 時無効） |

## 共通設定（SSOT）

`lib/scroll/animation-tokens.ts`（GSAP）:

- `ANIMATION_DURATION.base`: `1.4` / `hero`: `1.6`（Hero ロゴ入場・Philosophy 本文リビール） / `heroChild`: `1.2`（Hero 子要素スタガー） / `display`: `2`（Philosophy 巨大文字ブロック） / `section`: `1.8`（#79 以降） / `pageTransition`: `0.6`（#79 以降）
- `ANIMATION_EASE.base`: `expo.out` / `section`: `power3.inOut` / `reveal`: `power3.out`
- `REVEAL_OFFSET.x`: `-20` / `y`: `20` / `heroChildY`: `40`（Hero 子要素） / `stagger`: `0.15` / `textRevealStagger`: `0.06` / `textRevealDurationScale`: `0.65` / `maxStaggerItems`: `6`（#79 以降）
- `REVEAL_DELAY.heroChild`: `wrapper: 0.2` / `values: 0.35` / `copy: 0.5` / `cta: 0.65`（Hero 子要素スタガー）
- `REVEAL_DELAY.heroScrollIndicator`: `1.2`（Hero スクロールインジケータ）
- `REVEAL_DELAY.philosophy`: `title: 0.3` / `body: 0.6` / `closing: 0.9` / `mission: 0.5` / `cta: 1.0`
- `GSAP_TICKER.lagSmoothingActive`: `0` / `lagSmoothingRestoreMs`: `500` / `lagSmoothingRestoreThreshold`: `33`（Lenis teardown 時の ticker 復元）

`lib/scroll/gsap-config.ts`:

- `gsap.registerPlugin(ScrollTrigger)` — client のみ
- `shouldDisableGsapAnimation(profile)` — smooth scroll 無効条件と同じ（reduced-motion / mobile / coarse pointer）
- `refreshScrollTrigger()` — ScrollTrigger 計測の再計算（内部で `registerGsapPlugins()` を呼び出し）

`components/scroll/SmoothScrollProvider.tsx`（Lenis 統合）:

- `gsap.ticker.add((time) => lenis.raf(time * 1000))` + `lenis.on('scroll', ScrollTrigger.update)`
- Lenis 初期化後および destroy 後に `refreshScrollTrigger()`
- destroy 前に `lenis.off('scroll', ScrollTrigger.update)` で scroll リスナーを明示解除
- Lenis 初期化失敗時も `refreshScrollTrigger()` を呼び出し ScrollTrigger 計測を同期
- `shouldDisableSmoothScroll` 時も mount/unmount で `refreshScrollTrigger()` を呼び出し ScrollTrigger 計測を同期
- Lenis `duration` は `ANIMATION_DURATION.base` を参照

`lib/scroll/easing.ts`（framer-motion、`animation-tokens.ts` を参照）:

- `scrollEase`: `[0.22, 1, 0.36, 1]`（Hero 入場・ScrollReveal 共通）
- `loopEase`: `easeInOut`（Hero 装飾ループ — 入場 `scrollEase` とは別用途）
- `scrollViewport`: `{ once: true, margin: '-80px', amount: 0.2 }`
- `scrollTransition.duration`: `1.4`（`ANIMATION_DURATION.base`）
- `scrollVariants`: `fadeUp`, `fadeUpLarge`（デフォルト offset は同一、`ScrollReveal` の `y` prop で上書き可）, `fadeLeft`, `scale`（opacity + scale: 0.8 → 1）
- `scrollStagger`: `item: 0.15`, `card: 0.15`
- `textRevealStagger`: `0.06`（`TextReveal` グラフェム単位）
- `textRevealDurationScale`: `0.65`（`TextReveal` duration = `scrollTransition.duration × 0.65`）

`lib/scroll/reveal-props.ts` の `getScrollRevealProps()` が各コンテンツコンポーネントから参照される。

## 適用ページ

| パス | 適用内容 |
|------|---------|
| `/` | Hero 入場 + Server `h1`（LCP）+ About / MissionVision リビール + TextReveal 見出し |
| `/services` | ServicesContent セクション/カード スタガー + TextReveal |
| `/works` | WorksContent 同上 |
| `/process` | ProcessNavigation / ProcessContent |
| `/process/development` | DevelopmentContent |
| `/process/consulting` | ConsultingContent |
| `/philosophy` | PhilosophyContent |
| `/contact` | ScrollReveal + TextReveal（既存） |

## アクセシビリティ

- `shouldDisableSmoothScroll(profile)` が true のとき（`prefers-reduced-motion` / mobile / `pointer: coarse`）:
  - Lenis 無効（ネイティブスクロール）
  - `useGsapContext` は GSAP アニメーションをスキップ
- `useReducedMotion()` / `prefers-reduced-motion` 有効時:
  - PageLoader 非表示
  - リビールアニメーション duration 0 / initial false
  - ParallaxSection は通常 div にフォールバック

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
