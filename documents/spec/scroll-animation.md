# スクロールアニメーション仕様

## 概要

Octaboot 風のスクロール連動体験を、Lenis + GSAP ScrollTrigger + framer-motion の3層基盤の上で全主要ページに統一適用する。

## 基盤コンポーネント

| コンポーネント | 用途 |
|--------------|------|
| `SmoothScrollProvider` | Lenis スムーズスクロール + GSAP ticker 統合（`prefers-reduced-motion` 時無効） |
| `useGsapContext` | client component 内 GSAP ScrollTrigger セットアップ（reduced-motion 時スキップ） |
| `PageLoader` | 初回訪問時の軽量ローディング体験（背景透明・LCP 非ブロック） |
| `PageTransition` | `app/template.tsx` 経由のページ本文 fade-in（0.6s）。初回訪問・reduced-motion・**モバイル（`profile.isMobile`）** は即時表示。デスクトップ 2 回目以降のルート遷移のみ fade（#151 SPA 回帰） |
| `ScrollReveal` | セクション単位のフェードリビール |
| `TextReveal` | 見出しのグラフェム/ワード単位リビール |
| `ParallaxSection` | スクロール連動パララックス（`prefers-reduced-motion` 時無効） |
| `useFocusRestore` | `staticReveal` 変化によるリマウント後のキーボードフォーカス復元（#175）。`href` / `data-focus-id` を持つ要素のみ対象。`ServicesContent` / `WorksContent` / `PhilosophyContent` / `ProcessNavigation` / `DevelopmentContent` / `ConsultingContent` の各セクション最上位要素に `ref` として適用 |

## 共通設定（SSOT）

`lib/scroll/animation-tokens.ts`（GSAP）:

- `ANIMATION_DURATION.base`: `1.4` / `hero`: `1.6` / `section`: `1.8` / `pageTransition`: `0.6`
- `ANIMATION_EASE.base`: `expo.out` / `section`: `power3.inOut` / `reveal`: `power3.out`
- `REVEAL_OFFSET.y`: `20` / `stagger`: `0.15` / `maxStaggerItems`: `6`

`lib/scroll/gsap-config.ts`:

- `gsap.registerPlugin(ScrollTrigger)` — client のみ
- Lenis 統合: `gsap.ticker.add((time) => lenis.raf(time * 1000))` + `lenis.on('scroll', ...)` で `ScrollTrigger.update` + velocity skewY を同時処理
- `shouldDisableGsapAnimation(profile)` — Lenis と同条件（`prefers-reduced-motion` のみ）で GSAP pin 無効。モバイル・coarse pointer でも GSAP は有効

**Velocity skewY（`VELOCITY_SKEW` トークン）**:

- `SmoothScrollProvider` が Lenis `scroll` イベントから `lenis.velocity` を読み取り、`gsap.quickTo` で `[data-velocity-content]` に `skewY` を適用（最大 `±1.8deg`、`quickTo` duration `0.85s`）
- `[data-velocity-content]` は `app/template.tsx` の `PageTransition` 内 div に付与（Navigation / Footer は対象外）
- SPA ルート変更に対応するため DOM 再クエリ方式（`quickTo` インスタンスをターゲット変化時に再生成）
- `overflow-x: clip` で skewY による横溢れを防止（スクロールコンテナを作らない）

`lib/scroll/easing.ts`（framer-motion）:

- `scrollEase`: `[0.22, 1, 0.36, 1]`
- `scrollViewport`: `{ once: true, margin: '-80px', amount: 0.2 }`
- `scrollTransition.duration`: `1.4`
- `scrollVariants`: `fadeUp`, `fadeUpLarge`, `fadeLeft`, `scale`（y offset: 20px）
- `scrollStagger`: `item: 0.15`, `card: 0.15`

`lib/scroll/reveal-props.ts` の `getScrollRevealProps()` が各コンテンツコンポーネントから参照される。

### staticReveal ガード（MUST・Issue #151）

`getScrollRevealProps()` / `ScrollReveal` を使う **すべての** framer-motion リビール消費コンポーネントは、共有フック `useStaticReveal()` から `staticReveal` を取得し、各呼び出しに渡さなければならない。

```tsx
// lib/hooks/useStaticReveal.ts に集約（shouldUseStaticReveal の 3 行重複を解消）
const { reduceMotion, staticReveal } = useStaticReveal();
// profile が別途必要な場合（例: PhilosophyContent の snap 判定）:
const { profile, reduceMotion, staticReveal } = useStaticReveal();
// 各呼び出しに { staticReveal, ... } を渡す
```

- **理由**: `staticReveal` を渡さない場合、`getScrollRevealProps` は `initial: opacity 0`（hidden）でマウントし、表示は IntersectionObserver（framer-motion `whileInView`）の発火に完全依存する。`!isReady`（SSR / ハイドレーション初回）でも `opacity: 0` で描画されるため、モバイルで Lenis スムーズスクロール有効化（#138）後、ビューポート上部で `whileInView` が発火せずコンテンツがフッター手前まで非表示になる不具合が発生した（#151：`/services`・`/works` ほか）。
- `shouldUseStaticReveal` は `!isReady`（SSR / ハイドレーション初回）または `prefers-reduced-motion` 時に `true` を返す。`profile.isMobile` はデスクトップ・モバイル双方でスクロールリビールを有効にするため条件から除外（#180）。
- **設計判断（#151 / #153 / #180）**:
  - **初回フルロード（SSR / 直接 URL / リロード）**: クライアント初回レンダリングは `isReady=false` → `staticReveal=true` → `initial: false` で確定し plain text / `animate:{opacity:1}` でマウント。**ハイドレーション完了後（isReady=true）に `staticReveal` が `false` へ変化すると、`ScrollReveal` の key 変化（`'static'→'reveal'`）で remount が発生し framer `initial` が再評価される（#153）。デスクトップ・モバイル双方でスクロールリビールが復活（#180）。**
  - **SPA クライアント遷移**（`isReady=true`）: コンポーネントが `staticReveal=false` で初回マウントされるため `whileInView`（IO）が即座に有効。デスクトップ・モバイル共通。
  - **`PageTransition`**: モバイルでは 0.6s fade をスキップ（`profile.isMobile` による制御を維持）。
  - 意図: デスクトップ・モバイルともに framer scroll reveal 演出（opacity 0→1 fadeUp）を有効とし、GSAP（pin / snap / About タイムライン）と framer-motion が協調する。`!isReady` ガードが SSR hydration 安全性を保証。
- 適用済みコンポーネント: `About` / `MissionVision` / `ServicesContent` / `WorksContent` / `ConsultingContent` / `DevelopmentContent` / `ProcessNavigation` / `PhilosophyContent` / `TextReveal` / `ScrollReveal`（→ `PageHeader`・`/contact` フォーム）。いずれも `useStaticReveal()` 経由に統一。
- **`TextReveal` の hydration 安全性（#151 / #153）**: `staticReveal` は `!isReady` 中は常に `true`（`shouldUseStaticReveal` による保証）であるため、サーバー HTML と初回クライアントレンダリングは必ず一致し hydration ミスマッチは発生しない。ハイドレーション完了後（`isReady=true`）は live `staticReveal` を参照するため、デスクトップ・モバイル双方で `whileInView` reveal へ切替わる（#153 / #180）。`ServicesContent` 等のトップレベル section `motion.div` にも `key={staticReveal ? 'static-*' : 'reveal-*'}` を付与。
- **`staticReveal` 時の IO 省略**: `getScrollRevealProps({ staticReveal: true })` は `animate`（即時 visible）のみ返し、`whileInView` / `viewport` を付与しない。contract テスト: `tests/scroll/reveal-props.test.ts`（animate / whileInView 排他）、`tests/scroll/static-reveal.test.ts` + `tests/scroll/use-static-reveal.test.ts`（`shouldUseStaticReveal` 行列のみ — animate contract は reveal-props に集約）。
- **`ScrollReveal` の `key={staticReveal ? 'static' : 'reveal'}`（#151 / #153）**: `staticReveal` 変化（`isReady=true` への遷移）で framer `initial` を再評価するため remount。フォーカス喪失等の副作用は `useFocusRestore`（#175）で対応済み。
- 回帰防止: `e2e/mobile-pages.spec.ts` の `expectPainted()` が **375px / 390px の両方** で対象 7 ルートについて、スクロールリビールが正常に動作することを検証する。#180 以降は `scrollIntoViewIfNeeded()` 後に `expectPainted(el, 2500)` パターンを使用（Playwright `toBeVisible()` は opacity を無視するため別途検証が必須）。

## 適用ページ

| パス | 適用内容 |
|------|---------|
| `/` | Hero `immersive` variant: scroll-driven pin（GSAP）+ Server `h1`（LCP）+ About / MissionVision scroll storytelling（下記）。**スクロール領域全体で fixed `CosmicScene` のビジュアル背景が継続**（スタック順は Footer が前面、下記「スタック順」参照） |
| `/services` | PageHeader + ServicesContent スタガー + TextReveal（Hero なし・StarBackground なし） |
| `/works` | PageHeader + WorksContent 同上 |
| `/philosophy` | PhilosophyContent — **デスクトップ: 水平スクロール（6パネルを横並び pin、GSAP scrub 1.8）/ モバイル: 垂直 snap** + オーバーレイ文字（Hero なし。詳細: [`philosophy-page.md`](./philosophy-page.md)） |
| `/process` | ProcessNavigation — PageHeader + ナビカード |
| `/process/development` | PageHeader（`DEVELOPMENT`）+ DevelopmentContent スタガー |
| `/process/consulting` | PageHeader（`CONSULTING`）+ ConsultingContent スタガー |
| `/contact` | PageHeader（静的タイトル・divider なし・email 行）+ フォーム ScrollReveal |

### トップ Hero 背景・ロゴ（補足）

- 背景: `HomePageShell` + `CosmicScene`（fixed `z-0`、`public/hero-cosmic-bg*.webp` + `hero-nebula-layer.png`）。`isReady` 後に `CosmicScene` をマウントしモバイル初回ハイドレーションの背景誤読込を防止。ページスクロール全体で `scale` / ネビュラ `y`+`opacity` を GSAP scrub。**Warm gold grade（#102）**: nebula 上に `.cosmic-warm-grade-overlay`（常時）+ デスクトップのみ nebula filter — 詳細は [`design-system.md`](./design-system.md) の Warm Gold Grade 節
- **Hero 深度通過（#100）**: Hero pin 中に `CosmicScene` の `perspectiveDepthRef` を `HERO_DEPTH_PASSAGE.cosmic.perspectiveScale` まで scale（`transformOrigin` は Shell から prop 注入、SSOT は tokens）。`Hero.tsx` では粒子バンド → ロゴの 2 フェーズ（approach / pass-through）で `scale` / `y` / `opacity` / `rotation` / `filter: blur()` を scrub — 各 tween は `timelineDuration`（1s）の分数から明示 `duration` を算出しフェーズ重複を防止。**被写界深度効果**: pass-through フェーズで `particleBand` に `blur(36px)`、`logo` に `blur(18px)` を付与しカメラフライスルーを演出（`HERO_DEPTH_PASSAGE.particleBand.passBlurPx` / `logo.passBlurPx`）。コピー/CTA はそれぞれ `scale: 0.97→1` + `0.07s` stagger で個別に出現し、イージングは `power3.out` に精密化。**Typography blend（#101）**: copy reveal 開始（`revealTimelineStart` = `logoOpacityHideAt` = 0.35）で `timeline.set` によりロゴ opacity を即時 0 にし、`type-blend-cosmic` が nebula のみを backdrop に合成。Shell 連携: `data-testid="hero-pin-section"`（`HERO_PIN_SELECTOR`）
- スタック順: `CosmicScene`（`z-0`）< `main`（`z-10`）< `Footer`（`relative z-20`、`app/layout.tsx`）。fixed 背景がフッター上に重ならない
- ロゴ: `LogoParticleFormation`（Canvas 粒子 → `shape-d-logo-transparent.png` のアルファシルエット形成）→ 完了後 `BrandLogo`（同一 PNG・同一 hero ステージ寸法で crossfade）。`prefers-reduced-motion` 時は粒子スキップ（モバイルでは粒子形成を実行）
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
- モバイル（`prefers-reduced-motion` なし）時: GSAP・Lenis は有効。**GSAP** の `[data-timeline-item]` / `[data-vision-quote]`（About / MissionVision）は初期 `opacity: 0` から ScrollTrigger で reveal される。**framer-motion** リビール（下層ページ）は `useStaticReveal()` により `profile.isMobile` または `!isReady` で即時表示（IO 非依存）。`TextReveal` は live `staticReveal` を直接参照し（ラッチなし・#153）、`profile.isMobile=true` の間は常に即時表示を維持（#151 回帰なし）。`profile.isMobile` 変化（viewport リサイズ）も正しく追従する。直接 `motion.div` spread の remount は #155 で対応済み（`ServicesContent` / `WorksContent` / `PhilosophyContent` の map 内カードと CTA へ `staticReveal`-aware key を追加）。

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
| タッチデバイス Hero レイアウト（`prefers-reduced-motion` 時 静的フォールバック） | **OK** | `prefers-reduced-motion` 時の静的フォールバック（`flex-col h-auto` + `mt-[var(--space-6)]` CTA フロー内配置、セーフエリア対応）が適切に実装済み。対象は `isTouchInputDevice` = `isMobile \|\| prefersCoarsePointer`（[#136](https://github.com/Dev-AK28/shape-d-hp/issues/136)）。通常モバイルおよび大画面タッチ端末（iPad Pro 等）でも GSAP 無効時は同フロー適用。通常スクロール有効端末では GSAP pin が有効（#137 対応）。 |
| `prefers-reduced-motion` 時の体験 | **OK** | Lenis 無効・GSAP pin 無効・Hero コピー/CTA 即時表示（`showCopyImmediately` React 分岐）・About/MissionVision の CSS `opacity: 1` 保証（`globals.css` の `[data-timeline-item]`/`[data-vision-quote]` メディアクエリ）が全て実装済み。a11y 要件を満たしている |
| デスクトップ: Hero h1 の視認性（LCP トレードオフ） | **要確認** | `app/page.tsx` の h1 は Server Component として配置され LCP 計測対象だが、`copyRef` 内で GSAP `opacity: 0` から開始するためスクロール前はユーザーに不可視。意図的な設計トレードオフだが、SEO / a11y 観点での実機確認を推奨。**確認推奨環境**: Chrome DevTools Coverage + スクリーンリーダー |
| 粒子形成中のスクロール可能（フロー競合） | **OK** | B案採用（[#135](https://github.com/Dev-AK28/shape-d-hp/issues/135)）。形成中スクロールはブロックせず受け入れる。`scrollRevealed` ガードにより `formationComplete` 到達時点で既にスクロール済みの場合はインジケーター表示を抑制し、二重状態を防ぐ。E2E テスト「does not show scroll indicator when user scrolls before particle formation completes」（`home.spec.ts`）で回帰テスト済み。 |

### 調整項目リスト

| 優先度 | 内容 | 推奨アクション |
|--------|------|----------------|
| **Must** ✅ | スクロールインジケーター（`heroScrollIndicator: 1.2`） | [#133](https://github.com/Dev-AK28/shape-d-hp/issues/133) で実装済み。`formationComplete === true` 後 1.2s 遅延フェードイン、`scrollRevealed` で即時フェードアウト。`SCROLL` テキスト + chevron-down（`motion-safe:animate-bounce`、`data-testid="hero-scroll-indicator"`）。`formationComplete=true` 時に `data-testid="hero-formation-complete"` センチネル要素をマウント（E2E テスト用）。早期スクロール競合条件（形成中スクロール → インジケーター非表示）の E2E テストを [#140](https://github.com/Dev-AK28/shape-d-hp/issues/140) で追加済み。 |
| **Should** | Hero pin スクロール量（`end: '+=120%'`）の没入感 vs. コンテンツ到達バランス | 実機確認後、`+=100%` への短縮や CTA の視認性向上と合わせて検討 |
| **Should** ✅ | 粒子形成中（2400ms 以内）スクロール時のコピー早期出現 | B案採用（[#135](https://github.com/Dev-AK28/shape-d-hp/issues/135)）。形成中スクロールは許容し、`scrollRevealed` ガードでインジケーターの二重表示を防止。追加実装不要。 |
| **Should** ✅ | coarse pointer かつ非モバイル端末（大画面タッチ）の Hero レイアウト | [#136](https://github.com/Dev-AK28/shape-d-hp/issues/136) で対応済み。`isTouchInputDevice(profile)` = `isMobile \|\| prefersCoarsePointer` を導入し、`mobileStaticHero` の条件を拡張。大画面タッチ端末でも GSAP 無効時（reduced-motion）は `flex-col h-auto` + CTA フロー内配置を適用し、仮想キーボード/ブラウザ chrome による CTA 隠れを防止 |
| **Could** | 粒子バンド画像（`hero-particle-band.webp`）とネビュラ背景の視覚的整合性 | 実機・モニタキャリブレーション確認後に判断。過剰な場合は `initialOpacity: 0.65` を下げる |

### 結論

Hero スクロール体験全体の世界観・トーンは SHAPE∞D のブランドメッセージと整合している。
**スクロールインジケーター**（[#133](https://github.com/Dev-AK28/shape-d-hp/issues/133)）は実装済み。**粒子形成中スクロール設計**（[#135](https://github.com/Dev-AK28/shape-d-hp/issues/135)）は B案として確定済み。その他は実機確認・別 Issue での対応が可能。
