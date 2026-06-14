# スクロールアニメーション仕様

## 概要

Octaboot 風のスクロール連動体験を、Lenis + GSAP ScrollTrigger + framer-motion の3層基盤の上で全主要ページに統一適用する。

## 基盤コンポーネント

| コンポーネント | 用途 |
|--------------|------|
| `SmoothScrollProvider` | Lenis スムーズスクロール + GSAP ticker 統合（`shouldDisableSmoothScroll`: reduced-motion / mobile / coarse pointer 時無効） |
| `useGsapContext` | client component 内 GSAP ScrollTrigger セットアップ（reduced-motion 時スキップ） |
| `PageLoader` | 初回訪問時の軽量ローディング体験（背景透明・LCP 非ブロック） |
| `ScrollReveal` | セクション単位のフェードリビール |
| `TextReveal` | 見出しのグラフェム/ワード単位リビール |
| `ParallaxSection` | スクロール連動パララックス（`prefers-reduced-motion` 時無効） |

## 共通設定（SSOT）

`lib/scroll/animation-tokens.ts`（GSAP）:

- `ANIMATION_DURATION.base`: `1.4` / `hero`: `1.6`（#79 以降） / `section`: `1.8`（#79 以降） / `pageTransition`: `0.6`（#79 以降）
- `ANIMATION_EASE.base`: `expo.out` / `section`: `power3.inOut` / `reveal`: `power3.out`
- `REVEAL_OFFSET.x`: `-20` / `y`: `20` / `stagger`: `0.15` / `textRevealStagger`: `0.06` / `maxStaggerItems`: `6`（#79 以降）

`lib/scroll/gsap-config.ts`:

- `gsap.registerPlugin(ScrollTrigger)` — client のみ
- `shouldDisableGsapAnimation(prefersReducedMotion)` — reduced-motion 時 GSAP アニメーション無効
- `refreshScrollTrigger()` — ScrollTrigger 計測の再計算

`components/scroll/SmoothScrollProvider.tsx`（Lenis 統合）:

- `gsap.ticker.add((time) => lenis.raf(time * 1000))` + `lenis.on('scroll', ScrollTrigger.update)`
- Lenis 初期化後および destroy 後に `refreshScrollTrigger()`
- Lenis `duration` は `ANIMATION_DURATION.base` を参照

`lib/scroll/easing.ts`（framer-motion、`animation-tokens.ts` を参照）:

- `scrollEase`: `[0.22, 1, 0.36, 1]`
- `scrollViewport`: `{ once: true, margin: '-80px', amount: 0.2 }`
- `scrollTransition.duration`: `1.4`
- `scrollVariants`: `fadeUp`, `fadeUpLarge`（デフォルト offset は同一、`ScrollReveal` の `y` prop で上書き可）, `fadeLeft`, `scale`（y offset: 20px）
- `scrollStagger`: `item: 0.15`, `card: 0.15`
- `textRevealStagger`: `0.06`（`TextReveal` グラフェム単位）

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
- `useReducedMotion()` / `prefers-reduced-motion` 有効時:
  - PageLoader 非表示
  - リビールアニメーション duration 0 / initial false
  - ParallaxSection は通常 div にフォールバック
  - `useGsapContext` は GSAP アニメーションをスキップ

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
