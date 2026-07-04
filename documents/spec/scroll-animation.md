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

- `ANIMATION_DURATION.base`: `1.4` / `display`: `2` / `section`: `1.8` / `pageTransition`: `0.6` / `interaction`: `0.25`（旧イマーシブ Hero 専用の `hero` / `heroChild` / `heroScrollIndicator` は #316 で撤去）
- `ANIMATION_EASE.base`: `expo.out` / `section`: `power3.inOut` / `reveal`: `power3.out`
- `REVEAL_OFFSET.y`: `20` / `stagger`: `0.15` / `maxStaggerItems`: `6`

`lib/scroll/gsap-config.ts`:

- `gsap.registerPlugin(ScrollTrigger)` — client のみ
- Lenis 統合: `gsap.ticker.add((time) => lenis.raf(time * 1000))` + `lenis.on('scroll', ...)` で `ScrollTrigger.update` + velocity skewY を同時処理
- `shouldDisableGsapAnimation(profile)` — Lenis と同条件（`prefers-reduced-motion` のみ）で GSAP pin 無効。モバイル・coarse pointer でも GSAP は有効

**Velocity skewY（`VELOCITY_SKEW` トークン）**:

- `SmoothScrollProvider` が Lenis `scroll` イベントから `lenis.velocity` を読み取り、`gsap.quickTo` で `[data-velocity-content]` に `skewY` を適用（最大 `±1.8deg`、`quickTo` duration `0.85s`）
- `[data-velocity-content]` は `app/template.tsx` の `PageTransition` 内 div に付与（Navigation / Footer は対象外）
- SPA ルート変更対応: `MutationObserver` が `document.body` の子孫変化を監視し、`[data-velocity-content]` の追加/削除を検出したときのみ `skewTarget` と `quickTo` インスタンスを再生成（#185）。scroll イベントハンドラ内で `document.querySelector` は実行しない
- `overflow-x: clip` で skewY による横溢れを防止（スクロールコンテナを作らない）

`lib/scroll/easing.ts`（framer-motion）:

- `scrollEase`: `[0.22, 1, 0.36, 1]`
- `scrollViewport`: `{ desktop: { once:true, margin:'-80px', amount: 0.2 }, mobile: { once:true, margin:'-80px', amount:'some' } }` — デスクトップは 20% 閾値、モバイルは大セクション（~1785px）で物理的に達成不可のため `'some'` を使用（#190）
- `scrollTransition.duration`: `1.4`
- `scrollVariants`: `fadeUp`, `fadeUpLarge`, `fadeLeft`, `scale`（y offset: 20px）
- `scrollStagger`: `item: 0.15`, `card: 0.15`

`lib/scroll/reveal-props.ts` の `getScrollRevealProps()` が各コンテンツコンポーネントから参照される。

### staticReveal ガード（MUST・Issue #151 / #156）

`getScrollRevealProps()` / `ScrollReveal` を使う **すべての** framer-motion リビール消費コンポーネントは、共有フック `useStaticReveal()` から `staticReveal` と `profile` を取得し、各呼び出しに渡さなければならない。

`ScrollRevealOptions.staticReveal` は **型レベルで必須（`required`）** である（#156）。`getScrollRevealProps(reduceMotion, { ... })` の第2引数オブジェクトに `staticReveal` を省略すると TypeScript コンパイルエラーとなる。将来の consumer 追加時に `useStaticReveal()` 経由であることを強制する。

```tsx
// lib/hooks/useStaticReveal.ts に集約（shouldUseStaticReveal の 3 行重複を解消）
const { reduceMotion, staticReveal, profile } = useStaticReveal();
// isTouchDevice は isTouchInputDevice で判定（#190）
const isTouchDevice = isTouchInputDevice(profile);
// 各呼び出しに { staticReveal, isMobile: isTouchDevice, ... } を渡す
```

- **理由**: `staticReveal` を渡さない場合、`getScrollRevealProps` は `initial: opacity 0`（hidden）でマウントし、表示は IntersectionObserver（framer-motion `whileInView`）の発火に完全依存する。`!isReady`（SSR / ハイドレーション初回）でも `opacity: 0` で描画されるため、モバイルで Lenis スムーズスクロール有効化（#138）後、ビューポート上部で `whileInView` が発火せずコンテンツがフッター手前まで非表示になる不具合が発生した（#151：`/services`・`/works` ほか）。
- `shouldUseStaticReveal` は `!isReady`（SSR / ハイドレーション初回）または `prefers-reduced-motion` 時に `true` を返す。`profile.isMobile` はデスクトップ・モバイル双方でスクロールリビールを有効にするため条件から除外（#180）。
- **`isMobile` 定義変更時の影響範囲（#183 / #181 follow-up）**: 上記の #180 除去により、`shouldUseStaticReveal` の結果は `isMobile` に依存しない。したがって大型タブレット（`isMobile=false, prefersCoarsePointer=true`、iPad Pro 等）も `!isReady` / `prefers-reduced-motion` 以外では `shouldUseStaticReveal=false` が確定する（`tests/scroll/use-static-reveal.test.ts` の「large tablet ... returns false」ケースが暗黙にこの前提を検証）。**将来 `DeviceProfile.isMobile` の定義を変更する場合（例: 大型タブレットを `isMobile=true` に分類する等）は、この不変条件が崩れるため `tests/scroll/static-reveal.test.ts` / `tests/scroll/use-static-reveal.test.ts` のテスト行列と、`TextReveal` / `ScrollReveal` の `staticReveal`-aware key 前提（下記）を必ず再検証すること。** `PageTransition` は別途 `profile.isMobile` に依存する（#151・下記）ため、`isMobile` 定義変更は `PageTransition` の即時表示条件にも影響する。
- **設計判断（#151 / #153 / #180）**:
  - **初回フルロード（SSR / 直接 URL / リロード）**: クライアント初回レンダリングは `isReady=false` → `staticReveal=true` → `initial: false` で確定し plain text / `animate:{opacity:1}` でマウント。**ハイドレーション完了後（isReady=true）に `staticReveal` が `false` へ変化すると、`ScrollReveal` の key 変化（`'static'→'reveal'`）で remount が発生し framer `initial` が再評価される（#153）。デスクトップ・モバイル双方でスクロールリビールが復活（#180）。**
  - **SPA クライアント遷移**（`isReady=true`）: コンポーネントが `staticReveal=false` で初回マウントされるため `whileInView`（IO）が即座に有効。デスクトップ・モバイル共通。
  - **`PageTransition`**: モバイルでは 0.6s fade をスキップ（`profile.isMobile` による制御を維持）。
  - 意図: デスクトップ・モバイルともに framer scroll reveal 演出（opacity 0→1 fadeUp）を有効とし、GSAP（pin / snap / About タイムライン）と framer-motion が協調する。`!isReady` ガードが SSR hydration 安全性を保証。
- 適用済みコンポーネント（下層ページ）: `ServicesContent` / `WorksContent` / `ConsultingContent` / `DevelopmentContent` / `ProcessNavigation` / `PhilosophyContent` / `TextReveal` / `ScrollReveal`（→ `PageHeader`・`/contact` フォーム）。いずれも `useStaticReveal()` 経由に統一。トップページ（`components/top/`）は staticReveal ではなく `.top-scope` の reduced-motion フォールバックを使う（#312）。
- **`TextReveal` の hydration 安全性（#151 / #153）**: `staticReveal` は `!isReady` 中は常に `true`（`shouldUseStaticReveal` による保証）であるため、サーバー HTML と初回クライアントレンダリングは必ず一致し hydration ミスマッチは発生しない。ハイドレーション完了後（`isReady=true`）は live `staticReveal` を参照するため、デスクトップ・モバイル双方で `whileInView` reveal へ切替わる（#153 / #180）。`ServicesContent` 等のトップレベル section `motion.div` にも `key={staticReveal ? 'static-*' : 'reveal-*'}` を付与。
- **`staticReveal` 時の IO 省略**: `getScrollRevealProps({ staticReveal: true })` は `animate`（即時 visible）のみ返し、`whileInView` / `viewport` を付与しない。contract テスト: `tests/scroll/reveal-props.test.ts`（animate / whileInView 排他）、`tests/scroll/static-reveal.test.ts` + `tests/scroll/use-static-reveal.test.ts`（`shouldUseStaticReveal` 行列のみ — animate contract は reveal-props に集約）。
- **`ScrollReveal` の `key={staticReveal ? 'static' : 'reveal'}`（#151 / #153）**: `staticReveal` 変化（`isReady=true` への遷移）で framer `initial` を再評価するため remount。フォーカス喪失等の副作用は `useFocusRestore`（#175）で対応済み。
- 回帰防止: `e2e/mobile-pages.spec.ts` の `expectPainted()` が **375px / 390px の両方** で対象 7 ルートについて、スクロールリビールが正常に動作することを検証する。#180 以降は `scrollIntoViewIfNeeded()` 後に `expectPainted(el, 2500)` パターンを使用（Playwright `toBeVisible()` は opacity を無視するため別途検証が必須）。デスクトップ → モバイルリサイズ後の `opacity:1` 維持は `desktop → mobile resize` describe ブロックで検証（スクロール reveal: #155 / above-fold h1 維持: #182 / `TextReveal` per-char `motion.span`（子孫）維持: #266 — `expectPainted` は祖先方向のみ評価するため per-char span を明示ターゲットに追加）。

## 適用ページ

| パス | 適用内容 |
|------|---------|
| `/` | 参照デザイン（shape-d-prototype-v4）へ刷新済み（#302）。`components/top/` の各セクション（TopHero / TopPhilosophy / TopPain / TopTheory / TopServices / TopProcess / TopProfile / TopCta）で構成（下記「トップページ（#302 刷新）」参照）。旧イマーシブ Hero / About / MissionVision / ShowcaseSection と `CosmicScene` 背景は #304 / #312 / #316 で撤去済み |
| `/services` | PageHeader + ServicesContent スタガー + TextReveal（Hero なし・StarBackground なし） |
| `/works` | PageHeader + WorksContent 同上 |
| `/philosophy` | PhilosophyContent — **デスクトップ: 水平スクロール（6パネルを横並び pin、GSAP scrub 1.8。`end` / `x` を関数形式にし `refreshInit` で `tl.invalidate()` — #186 リサイズ対応）/ モバイル: 垂直 snap** + オーバーレイ文字（Hero なし。詳細: [`philosophy-page.md`](./philosophy-page.md)） |
| `/process` | ProcessNavigation — PageHeader + ナビカード |
| `/process/development` | PageHeader（`DEVELOPMENT`）+ DevelopmentContent スタガー |
| `/process/consulting` | PageHeader（`CONSULTING`）+ ConsultingContent スタガー |
| `/contact` | PageHeader（静的タイトル・divider なし・email 行）+ フォーム ScrollReveal |

### トップページ（#302 刷新）

トップページ（`/`）は参照デザイン `lib/design/shape-d-prototype-v4.html` を SSOT として `components/top/` で再構築済み（#302〜#313）。旧イマーシブ Hero（`Hero.tsx` / 粒子ロゴ / ビッグバン / `CosmicScene` 深度通過）と旧セクション（`About.tsx` / `MissionVision.tsx` / `home/ShowcaseSection.tsx`）は #304 / #312 で置換され、残存トークン・アセットは #316 で撤去済み。各セクションの視覚仕様（要素・色・余白・尺）の SSOT は [`design-system.md`](./design-system.md) の各節（TopHero / TopPhilosophy / TopPain / TopTheory / TopServices / TopProcess / TopProfile / TopCta）。本節はスクロール演出の観点をまとめる。

- **演出制御の分岐（#312）**: SSOT は `lib/scroll/lenis-config.ts`（`getPageScrollProfile`）。トップは Lenis duration **1.8** + カスタム easing（`t => 1 - (1-t)^4`）、velocity-skew **無効**、CustomCursor / PageLoader / MicroInteractionBinder **無効**、cosmic 背景 **撤去**。下層ページは Lenis 1.4 / velocity-skew 有効 / 各エフェクト有効を維持。実装は `SmoothScrollProvider`（`usePathname()` で分岐）/ `SubPageEffects`（トップで各エフェクトを非マウント）/ `app/page.tsx`（`HomePageShell` を使わず plain `<main>`）。
- **ヒーローイントロ（#304 / #326）**: `TopHero` の mark → copy 2 行 → sub → scroll-cue は **CSS アニメーション**（`globals.css` の `top-hero-intro-*`、#326 で GSAP から移行）。ハイドレーションを待たず first paint 直後に開始し FCP/LCP を遅らせない。尺の SSOT は `lib/design/tokens.ts` の `topHero.intro`（`css-token-sync` テストで同期）。
- **雨 Canvas（#304 / #313）**: `components/top/RainCanvas.tsx`。幅 26px あたり 1 本の細線が個別速度で降下。`IntersectionObserver` + `visibilitychange` で画面外・タブ非アクティブ時に rAF 停止（省電力）。reduced-motion 時は rAF を回さず静止描画を 1 度のみ。
- **スクラブ / pin 演出**: 各セクション（TopPhilosophy 文字送り / TopPain 行フェード / TopTheory 円収束 pin / TopServices パネル切替 pin / TopProcess ステップ / TopProfile 収束 SVG）は client component 内の `useLayoutEffect` + GSAP ScrollTrigger で構築。尺・トリガーの SSOT は `lib/design/tokens.ts` の `topHero`（`taglineScrub` / `pain` / `theory` / `services` / `process` / `profile`）。pin（`#theory` / `#services`）は `pinType: 'transform'` を明示し、velocity-skew の transform 祖先問題を回避（#307 / #308。トップでは velocity-skew 自体も無効のため二重に安全）。
- **reduced-motion**: 各セクションは `globals.css` の `.top-scope` フォールバックで全要素を `opacity:1 !important` 即時表示（イントロ・scrub・reveal を走らせない）。`useReducedMotion()` / RainCanvas が GSAP・rAF をスキップ。
- **テスト**: `e2e/top-hero.spec.ts` / `top-shell.spec.ts` / `top-theory.spec.ts` ほか `e2e/top-*.spec.ts`、`tests/components/TopHero.test.tsx`、`tests/scroll/lenis-config.test.ts`、`tests/design/css-token-sync.test.ts`。
- StarBackground はトップでは使用しない。

## 全幕モバイル簡略版・reduced-motion 統一方針（Issue #214）

全 #210 シリーズを通じた端末別出し分けは以下の2 SSOT で統一されている。
詳細は [`mobile-performance.md`](./mobile-performance.md) の「全幕統一方針」節と [`performance-budget.md`](./performance-budget.md) を参照。

| 関数 | 定義ファイル | 条件 | 効果 |
|------|------------|------|------|
| `shouldDisableGsapAnimation(profile)` | `lib/scroll/gsap-config.ts` | `prefersReducedMotion` のみ | 全幕の GSAP を無効化 |
| `isTouchInputDevice(profile)` | `lib/performance/device-profile.ts` | `isMobile \|\| prefersCoarsePointer` | ピン廃止 / パララックス縮小 |

`useGsapContext` を経由している全コンポーネントは `shouldDisableGsapAnimation` により reduced-motion 時に GSAP セットアップ全体がスキップされる（一点保証）。
framer-motion リビールは `useStaticReveal()` → `staticReveal` フラグにより SSR・reduced-motion 時に即時表示される。

ポリシー遵守は `tests/scroll/mobile-reduced-motion-policy.test.ts` が全幕横断で監査する（20 assertions）。

## アクセシビリティ

- `useReducedMotion()` / `prefers-reduced-motion` 有効時:
  - Lenis 無効
  - PageLoader 非表示
  - PageTransition 即時表示（duration 0）
  - リビールアニメーション duration 0 / initial false
  - ParallaxSection は通常 div にフォールバック
  - トップページ: 各セクションが `.top-scope` フォールバックで全要素即時表示（上記「トップページ（#302 刷新）」参照）
- ポインター hover マイクロインタ（#103）: 下層ページのナビ / CTA / Footer は `MicroInteractionBinder` + GSAP `quickTo`（`lib/scroll/micro-interaction.ts`）。reduced-motion / coarse pointer 時はバインドしない。トップページでは `MicroInteractionBinder` は無効（#312） — 詳細は [`design-system.md`](./design-system.md) Micro-interactions 節

## 受け入れ基準

`documents/spec/acceptance-criteria.md` の「スクロールアニメーション」セクションを参照。

## 検証

```bash
npm test
npm run build
npm run test:e2e
npm run lighthouse:check   # サーバー起動後。Performance >= 70（モバイル）
```

- E2E: 下層ページのセクションリビール / reduced-motion は `e2e/scroll-animation.spec.ts`、トップページの演出は `e2e/top-*.spec.ts`
- Lighthouse: `scripts/lighthouse-check.mjs` + CI `lighthouse` job（閾値 0.9 — #326 で 0.7 から引き上げ）
  - CI ではモバイル viewport を維持しつつ `--throttling-method=provided` で CPU 二重スロットリングを回避

---

## 旧イマーシブ Hero / ShowcaseSection 記録（撤去済み）

- **Hero UX 監査記録（#99）**: 旧イマーシブ Hero（宇宙背景パララックス・粒子ロゴ形成・GSAP pin、PR #95）に対する 2026-06-16 の UX 監査記録が本節にありましたが、対象実装はトップページ刷新（#302）で撤去されました（#304 で TopHero へ置換、資産は #316 で削除）。監査内容は履歴として GitHub Issue #99 / PR #95 を参照してください。
- **ShowcaseSection E2E 補足（#249）**: 旧 `components/home/ShowcaseSection.tsx` のデスクトップ横スクロール（`SHOWCASE_HORIZONTAL`）検証手順が本節にありましたが、コンポーネント・トークンとも #316 で撤去済みです。現行トップの横/pin 演出は `e2e/top-theory.spec.ts` / `e2e/top-services`（`components/top/`）で検証します。
