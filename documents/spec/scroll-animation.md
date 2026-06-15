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
| `/process` | ProcessNavigation — PageHeader + ナビカード |
| `/process/development` | PageHeader（`DEVELOPMENT`）+ DevelopmentContent スタガー |
| `/process/consulting` | PageHeader（`CONSULTING`）+ ConsultingContent スタガー |
| `/contact` | PageHeader（静的タイトル・divider なし・email 行）+ フォーム ScrollReveal |

### トップ Hero 背景・ロゴ（補足）

- 背景: `HomePageShell` + `CosmicScene`（fixed `z-0`、`public/hero-cosmic-bg*.webp` + `hero-nebula-layer.png`）。`isReady` 後に `CosmicScene` をマウントしモバイル初回ハイドレーションの背景誤読込を防止。ページスクロール全体で `scale` / ネビュラ `y`+`opacity` を GSAP scrub。**Warm gold grade（#102）**: nebula 上に `.cosmic-warm-grade-overlay`（常時）+ デスクトップのみ nebula filter — 詳細は [`design-system.md`](./design-system.md) の Warm Gold Grade 節
- **Hero 深度通過（#100）**: Hero pin 中に `CosmicScene` の `perspectiveDepthRef` を `HERO_DEPTH_PASSAGE.cosmic.perspectiveScale` まで scale（`transformOrigin` は Shell から prop 注入、SSOT は tokens）。`Hero.tsx` では粒子バンド → ロゴの 2 フェーズ（approach / pass-through）で `scale` / `y` / `opacity` を scrub — 各 tween は `timelineDuration`（1s）の分数から明示 `duration` を算出しフェーズ重複を防止。**Typography blend（#101）**: copy reveal 開始（`revealTimelineStart` = `logoOpacityHideAt` = 0.35）で `timeline.set` によりロゴ opacity を即時 0 にし、`type-blend-cosmic` が nebula のみを backdrop に合成。Shell 連携: `data-testid="hero-pin-section"`（`HERO_PIN_SELECTOR`）
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

- `prefers-reduced-motion` 時: `useGsapContext` が GSAP をスキップ（`shouldDisableGsapAnimation(profile)` + framer-motion `useReducedMotion`）。`shouldUseStaticReveal(profile, reduceMotion, isReady)` により `!isReady` 時も含め `getScrollRevealProps({ staticReveal: true })` と `TextReveal` の即時表示を適用。`globals.css` の `[data-timeline-item]` / `[data-vision-quote]` メディアクエリ（`prefers-reduced-motion: reduce`）で `opacity: 1` を保証

## アクセシビリティ

- `useReducedMotion()` / `prefers-reduced-motion` 有効時:
  - Lenis 無効
  - PageLoader 非表示
  - PageTransition 即時表示（duration 0）
  - リビールアニメーション duration 0 / initial false
  - ParallaxSection は通常 div にフォールバック
  - Hero `immersive`: GSAP pin 無効、ロゴ非表示・コピー/CTA を即時表示（`pointer-events: auto`）
- Hero `immersive`（GSAP pin 有効 — デスクトップ・モバイル共通）:
  - コピー/CTA・ロゴ層（`logoRef` / `particleBandRef`）の `opacity` / `pointer-events` は GSAP が制御（React インラインスタイルと競合しない）
- ポインター hover マイクロインタ（#103）: ナビ / Hero CTA / Footer は `MicroInteractionBinder` + GSAP `quickTo`（`lib/scroll/micro-interaction.ts`）。reduced-motion / coarse pointer 時はバインドしない — 詳細は [`design-system.md`](./design-system.md) Micro-interactions 節
  - `scrollRevealed` / `logoScrollHidden` はタイムライン `onUpdate` で copy / logo の `opacity` から同期し、スクロール位置復元時も `tabIndex` / `aria-hidden` がずれない
  - スクロールリビール前の CTA は `tabIndex={-1}` でキーボードフォーカスを防止。リビール後は `tabIndex={0}`
  - 粒子形成中の `BrandLogo` は `aria-hidden` で a11y ツリーから除外

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

---

## Hero UX 監査記録（Issue #99）

**監査日**: 2026-06-16
**対象 PR**: #95（宇宙背景パララックス・粒子ロゴ形成・GSAP pin 実装）
**監査方式**: コードレビュー + 仕様整合確認（静的解析）

### 世界観・トーン

| 観点 | 判定 | 理由 |
|------|------|------|
| 宇宙ネビュラ背景と「技術の余白に創造性を」の整合 | **OK** | `#0a0a0a` ダーク背景の静けさを維持しながら **Warm Gold Grade オーバーレイ**（`warmGrade.overlayStart`=`rgba(196,181,160,0.08)` 〜 `overlayEnd`=`rgba(196,181,160,0.15)`、`lib/design/tokens.ts`）で premium warmth を上乗せ。"余白" の広がりをコスミックビジュアルで体現しており整合している。Warm Gold Grade 輝度は過剰でなく、nebula のスクロール連動 opacity（`HomePageShell` で別途 scrub）とは独立して制御されている |
| 粒子→ロゴ形成演出は「形づくる（SHAPE）」のメタファーとして自然か | **OK** | `LogoParticleFormation` が Canvas 粒子でロゴシルエットを形成する演出は「SHAPE∞D = 形づくる」の名前のメタファーと強く整合。2400ms（`LOGO_PARTICLE_FORMATION_MS`）の形成時間は体験として適切。粒子形状と PNG の乖離は #96 で修正済み |
| GSAP pin による Hero 固定スクロールは没入感を高めるか | **要確認** | `end: '+=120%'` のスクロール量は十分な没入感を生む一方、コンテンツ（About セクション）への到達が遅れる可能性がある。モバイル・coarse pointer・reduced-motion は静的フォールバックで対処済み。**確認推奨環境**: Chrome/Safari デスクトップ + iPhone Safari |

### UI/UX

| 観点 | 判定 | 理由 |
|------|------|------|
| デスクトップ: 粒子形成→スクロールでコピー/CTA 出現フローの直感性 | **要調整 🔴** | `REVEAL_DELAY.heroScrollIndicator: 1.2` トークンが `lib/scroll/animation-tokens.ts` に存在するが、**スクロールインジケーター UI が未実装**。ユーザーが「スクロールすると何かが起きる」と気づけない状態。粒子形成完了後（`formationComplete === true`）1.2s 遅延でフェードインするインジケーターが必須 |
| ロゴ縮小・フェードアウトとコピー出現のタイミング | **OK** | `logoOpacityHideAt: 0.35` と `revealTimelineStart: 0.35` が同期しており、ロゴ消去とコピーリビールが同タイミングで発動。Typography Blend（`type-blend-cosmic`）がネビュラのみを backdrop に合成する設計も適切 |
| モバイル静的フォールバック（粒子スキップ・CTA フロー内配置） | **OK** | `mobileStaticHero` 時の `flex-col h-auto` + `mt-[var(--space-6)]` CTA フロー内配置、セーフエリア対応（`env(safe-area-inset-top)`）が適切に実装済み |
| `prefers-reduced-motion` 時の体験 | **OK** | Lenis 無効・GSAP pin 無効・Hero コピー/CTA 即時表示（`showCopyImmediately` React 分岐）・About/MissionVision の CSS `opacity: 1` 保証（`globals.css` の `[data-timeline-item]`/`[data-vision-quote]` メディアクエリ）が全て実装済み。a11y 要件を満たしている |
| デスクトップ: Hero h1 の視認性（LCP トレードオフ） | **要確認** | `app/page.tsx` の h1 は Server Component として配置され LCP 計測対象だが、`copyRef` 内で GSAP `opacity: 0` から開始するためスクロール前はユーザーに不可視。意図的な設計トレードオフだが、SEO / a11y 観点での実機確認を推奨。**確認推奨環境**: Chrome DevTools Coverage + スクリーンリーダー |
| 粒子形成中のスクロール可能（フロー競合） | **要確認** | 粒子形成（2400ms）と GSAP pin は並行動作。`formationComplete` はタイムライン進行をブロックしないため、形成完了前でもスクロールでコピー/CTA が出現しうる。[#135](https://github.com/Dev-AK28/shape-d-hp/issues/135) で設計確認。**確認推奨環境**: Chrome デスクトップ（低速スクロール） |

### 調整項目リスト

| 優先度 | 内容 | 推奨アクション |
|--------|------|----------------|
| **Must** | スクロールインジケーター未実装（`heroScrollIndicator: 1.2` トークンが定義済みだが UI なし） | [#133](https://github.com/Dev-AK28/shape-d-hp/issues/133) で実装予定（`formationComplete === true` 後 1.2s 遅延フェードイン → 最初のスクロールで消える chevron / "SCROLL" テキスト） |
| **Should** | Hero pin スクロール量（`end: '+=120%'`）の没入感 vs. コンテンツ到達バランス | 実機確認後、`+=100%` への短縮や CTA の視認性向上と合わせて検討 |
| **Should** | 粒子形成中（2400ms 以内）スクロール時のコピー早期出現 | [#135](https://github.com/Dev-AK28/shape-d-hp/issues/135) で設計確認。形成完了前スクロールをブロックするか、インジケーターで誘導するかを決定 |
| **Should** | coarse pointer かつ非モバイル端末（大画面タッチ）の Hero レイアウト | [#136](https://github.com/Dev-AK28/shape-d-hp/issues/136) で確認。`staticFallback=true` / `mobileStaticHero=false` の組み合わせによる `h-svh` + 即時コピー表示が適切か実機確認 |
| **Could** | 粒子バンド画像（`hero-particle-band.webp`）とネビュラ背景の視覚的整合性 | 実機・モニタキャリブレーション確認後に判断。過剰な場合は `initialOpacity: 0.65` を下げる |

### 結論

Hero スクロール体験全体の世界観・トーンは SHAPE∞D のブランドメッセージと整合している。
**スクロールインジケーター未実装**（[#133](https://github.com/Dev-AK28/shape-d-hp/issues/133)）のみ Must 対応が必要。その他は実機確認・別 Issue での対応が可能。
