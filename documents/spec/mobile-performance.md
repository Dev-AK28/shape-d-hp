# モバイルパフォーマンス最適化

Issue: #51 / 全幕統一方針: #214

## 全幕モバイル簡略版・reduced-motion 統一方針（Issue #214）

#210 シリーズ（第1〜第4幕）の演出追加に伴い、端末別の出し分け方針を全幕で統一した。

### 判定関数

| 関数 | 定義ファイル | 条件 | 用途 |
|------|------------|------|------|
| `shouldDisableGsapAnimation(profile)` | `lib/scroll/gsap-config.ts` | `prefersReducedMotion` のみ | GSAP 全体を無効化（ピン・スクラブ・stagger） |
| `isTouchInputDevice(profile)` | `lib/performance/device-profile.ts` | `isMobile \|\| prefersCoarsePointer` | ピン廃止・パララックス縮小など演出の軽量化 |
| `shouldDisableSmoothScroll(profile)` | `lib/performance/device-profile.ts` | `prefersReducedMotion` のみ | Lenis を無効化 |

> **重要**: GSAP は `prefers-reduced-motion` 時のみ無効。モバイル（タッチ端末）では GSAP 有効のまま、演出の重さを `isTouchInputDevice` で段階調整する。

### 幕ごとの実装パターン

| 対象 | コンポーネント | モバイル対応 | reduced-motion 対応 |
|----|--------------|------------|-------------------|
| トップページ | `components/top/`（TopHero ほか） | Lenis 1.8・velocity-skew / CustomCursor / PageLoader 無効（#312）。ヒーローイントロは CSS アニメーション（#326）、`RainCanvas` は画面外・タブ非アクティブで rAF 停止 | `.top-scope` フォールバックで全要素即時表示・`RainCanvas` は静止描画のみ |
| Philosophy | `PhilosophyContent.tsx`（水平スクロール） | `!isMobile && !prefersCoarsePointer` でのみ水平ピン有効 | `useGsapContext` が auto-skip |
| 下層ページ | `ServicesContent` / `WorksContent` 等 | `useStaticReveal()` → `staticReveal` で即時表示 | `getScrollRevealProps` + `staticReveal=true` |

> 旧イマーシブ Hero（ビッグバン `Hero.tsx` / 深度通過）と旧セクション（`About.tsx` ピン+スクラブ / `MissionVision.tsx` 多層パララックス）は #302 で置換・#316 で撤去済み。

### `useGsapContext` による reduced-motion 自動スキップ

```ts
// lib/hooks/useGsapContext.ts
const disableAnimation = shouldDisableGsapAnimation(profile) || reduceMotion === true;
useLayoutEffect(() => {
  if (!isReady || disableAnimation) return; // ← 全 GSAP セットアップをスキップ
  ...
}, [isReady, disableAnimation, ...deps]);
```

GSAP を使う全コンポーネントが `useGsapContext` を通じているため、`prefers-reduced-motion` 時の静的フォールバックは一箇所で保証される。

### パフォーマンス予算

詳細は [`performance-budget.md`](./performance-budget.md) を参照。
- 追加画像アセット: トップは追加画像なし（旧イマーシブ Hero の bigbang / cosmic アセットは #316 で撤去。雨演出は画像を持たない `RainCanvas`）
- アニメーション系 JS ≤ 80 KB（gzip）
- LCP モバイル ≤ 3.5 s / CLS ≤ 0.1

---

## 目的

スマートフォンでの読み込み・スクロール体感を改善しつつ、宇宙感・星・グラデーション・滑らかなアニメーションのビジュアルクオリティをデスクトップで維持する。

## 対象

| 領域 | 対策 |
|------|------|
| `StarBackground` | 共通化・lint 解消は [`star-background.md`](./star-background.md)（Issue #1）を参照。モバイルで星数・グロー縮小、更新間隔 150ms、非表示時は rAF ループを停止し `box-shadow` グローを解除（IO 初回判定前はスキップ）、`prefers-reduced-motion` 時は静止しスクロールイン後にグローを復元。IO は `threshold: 0.15` + `rootMargin` で複数インスタンスの同時稼働を抑制。`isReady` 後に IO を有効化 |
| `SmoothScrollProvider` | `prefers-reduced-motion` 時のみ Lenis 無効（モバイル・タッチ端末も Lenis 有効）。プロファイル変更時に Lenis を create/destroy。Lenis 初期化後に `ScrollTrigger.refresh()` |
| トップページ演出 | `components/top/`（#302）。Lenis 1.8・velocity-skew / CustomCursor / PageLoader 無効（#312）。ヒーローイントロは CSS アニメーション（#326）。`RainCanvas` は IntersectionObserver + visibilitychange で rAF 停止。`prefers-reduced-motion` は `.top-scope` フォールバックで全要素即時表示（旧 Hero `immersive` は #302 / #316 で撤去） |
| `NebulaBackground` | Philosophy 等で継続利用。モバイルで blur 半径を 45% に縮小、reduced-motion 時はアニメーション停止、非表示時は blur/animation を停止（`fixed` は常時・IO 無効）。`@keyframes` は `app/globals.css` の `nebula-philosophy-*` |
| `PageLoader` | fade-out（delay 0.45s + duration 0.5s）完了時に `onAnimationComplete` で非表示。未発火時のフォールバック `setTimeout`（1450ms = 950ms + 500ms buffer）。`pointer-events-none` でフェード中のクリックブロックを回避。`prefers-reduced-motion` 時は表示しない |
| `PageTransition` | `app/template.tsx` 経由でページ本文 fade-in（0.6s）。初回訪問は LCP 保護のため即時表示。**モバイル（`profile.isMobile`）は SPA クライアント遷移でも即時表示**（#151）。デスクトップのみ 2 回目以降のルート遷移で fade。`Navigation` は `layout.tsx` 配置でフェード対象外 |
| Micro-interactions | ナビ `.nav-link` とボタン hover は opacity 変化のみ（magnetic effect なし）。タッチ端末・`prefers-reduced-motion` では hover opacity 無効。`:focus-visible` でキーボードフォーカスリング |
| `Navigation`（モバイル） | `px-4 pt-[max(0.75rem,env(safe-area-inset-top,0px))] pb-3`、ロゴ `height=36`、ハンバーガー `44×44px` タップ領域。デスクトップは `px-6 pt-[max(1.25rem,env(safe-area-inset-top,0px))] pb-5`・ロゴ `height=48` を維持（Issue #74）。`viewport-fit=cover` 有効時にノッチ/Dynamic Island と重複しないよう上部パディングを `safe-area-inset-top` に応じて伸長（Issue #162） |
| フォント | `next/font` — Cormorant Garamond（`app/layout.tsx`、latin preload）+ Noto Serif JP（`app/(site)/layout.tsx`、下層限定 — #326 でルートから移設しトップでは非ロード）。トップ限定フォントは `components/top/top-fonts.ts`（日本語フォントは `preload: false` 必須 — 全 unicode-range スライス preload 化を防ぐ） |
| GSAP | tree-shaking: `gsap` + `gsap/ScrollTrigger` のみ import。bundle 目安 ~38KB（Lenis ~8KB + GSAP ~30KB） |
| 画像 | 参照中の PNG のみ `npm run optimize:images` で WebP 化し、表示参照を `.webp` に切替 |

## デバイスプロファイル

`lib/performance/device-profile.ts` の `readDeviceProfile()` が判定の SSOT。`lib/hooks/useDeviceProfile.ts` は `useSyncExternalStore` で client プロファイルを購読し、`isReady` で hydration 前の描画を遅延する。

- `isMobile`: ビューポート幅 `< 768px`（`MOBILE_BREAKPOINT_PX`）
- `prefersReducedMotion`: OS の reduced motion 設定
- `prefersCoarsePointer`: タッチ主体デバイス（`(pointer: coarse)`）
- `prefersHoverNone`: ホバー非対応デバイス（`(hover: none)`）。カスタムカーソル無効化に使用

### resize リスナーの debounce（Issue #251）

`subscribeToDeviceProfile` 内の `window` resize リスナーには `RESIZE_DEBOUNCE_MS`（150ms）の debounce を適用する。

**理由**: ウィンドウ幅が 768px ブレークポイント付近で連続変化すると `isMobile` が細かく反転し、`usePanelActiveIndex` の `IntersectionObserver` が生成/破棄を繰り返すスラッシングが発生する（#187 の修正が逆効果になる境界条件）。

**設計**:
- `matchMedia` の `change` イベントはブラウザ側でブレークポイント境界にのみ発火するため即時のまま維持する
- resize のみ debounce し、ブレークポイント通過後 150ms 静止した時点でストア更新を通知する
- クリーンアップ（コンポーネントアンマウント）時に未発火タイマーを `clearTimeout` でキャンセルし、stale コールバックを防ぐ
- 定数 `RESIZE_DEBOUNCE_MS` を named export することで、テストが値を参照できる

**テスト**:
- 構造的不変条件（`setTimeout` ラッパー・`clearTimeout`・listener 参照一致）の静的解析: `tests/performance/use-device-profile-debounce.test.ts`（#251 / #257）
- 振る舞い的不変条件（`vi.useFakeTimers()` + `matchMedia` スタブで `subscribeToDeviceProfile` を直接検証）: `tests/performance/use-device-profile-subscribe.test.ts`（#258）— (1) 150ms 以内の連続 resize は 150ms 後に `onStoreChange` を 1 回のみ呼ぶ、(2) タイマー発火前の cleanup で未発火コールバックがキャンセルされる、(3) cleanup 後の resize は無視される。検証のため `subscribeToDeviceProfile` を `@internal` として named export（本番コードは `useDeviceProfile` を使う）

```ts
// lib/hooks/useDeviceProfile.ts（抜粋）
export const RESIZE_DEBOUNCE_MS = 150;

const debouncedStoreChange = () => {
  if (resizeTimer !== null) clearTimeout(resizeTimer);
  resizeTimer = setTimeout(onStoreChange, RESIZE_DEBOUNCE_MS);
};
window.addEventListener('resize', debouncedStoreChange);
```

## 画像アセット

- 最適化スクリプト: `npm run optimize:images`（`image-assets.ts` で参照される PNG のみ対象）
- 参照マップ: `lib/performance/image-assets.ts`
- PNG 原画像はビルド用ソースとして `public/` に残し、ランタイム参照は WebP のみ
- `image_13.png` はどこからも参照されていない未使用アセットだったため削除済み（#436）

## 受け入れ基準（Given-When-Then）

- **Given** スマートフォンでトップページを開く
- **When** 初回表示が完了する
- **Then** 改善前よりスクロール中のカクつきが軽減されている

- **Given** Lighthouse モバイル計測を行う
- **When** 改善前後を比較する
- **Then** Performance スコアまたは LCP / TBT が改善している

- **Given** デスクトップまたはモバイルでトップ `TopHero` を確認する
- **When** 初回表示する
- **Then** マーク → コピー → サブ → スクロールキューが CSS アニメーションでフェードインし、`RainCanvas` の雨が背後に描画される（#302 / #304 / #326）

- **Given** `prefers-reduced-motion: reduce` が有効
- **When** トップページを開く
- **Then** `.top-scope` フォールバックで全要素が即時表示され、`RainCanvas` は静止描画のみになる

- **Given** モバイル幅（390px / 375px）でトップページを閲覧している
- **When** ヒーローから下方向へスクロールする
- **Then** 各セクション（PHILOSOPHY / 課題提起 / 自己一致 / サービス / プロセス / Profile / CTA）が表示される
- **And** フッター直前に意図しない大きな空白領域がない

- **Given** モバイル幅（375px / 390px）で `/services`・`/works`・`/process`・`/process/development`・`/process/consulting`・`/philosophy`・`/contact` を開く（Issue #151）
- **When** ページ読み込みが完了し、まだスクロールしていない
- **Then** メインコンテンツ（各セクション見出し・カード）が `opacity: 1` で描画されており、フッター付近までスクロールしないと表示されない状態にならない
- **And** これは framer-motion リビール消費コンポーネントが `useStaticReveal()` 経由で `staticReveal` を取得し渡すことで保証される（`profile.isMobile` により SPA クライアント遷移時も即時表示。`TextReveal` は `shouldUseStaticReveal` の `!isReady` ガードにより hydration 安全性が確保されており、初回ラッチは不要）。詳細: [`scroll-animation.md`](./scroll-animation.md) の staticReveal ガード節

- **Given** トップページを最下部までスクロールする
- **When** フッター領域がビューポートに入る
- **Then** 著作権表示（`© 2026`）およびフッターリンクが読める（`TopFooter`）

- **Given** モバイル幅（375px / 390px）でトップからハンバーガーメニュー経由で `/services` へ SPA 遷移する（#151）
- **When** 遷移直後（スクロールなし）
- **Then** ページ本文が `PageTransition` により opacity 0 のまま残らず、下層の framer リビール見出し（例: Human Solution）が累積 opacity ≈ 1 で描画される

- **Given** モバイル幅（375px / 390px）でトップからハンバーガーメニュー経由で `/works` へ SPA 遷移する（#151）
- **When** 遷移直後（スクロールなし）
- **Then** 下層の framer リビール見出し（例: CONCEPT WORKS）が累積 opacity ≈ 1 で描画される

- **Given** デスクトップでページ間を遷移する
- **When** 初回訪問後に別ルートへ移動する
- **Then** ページ本文が `PageTransition` により 0.6s の fade-in される（ナビは常時表示、reduced-motion 時は即時表示）

- **Given** サイトへ初回訪問する
- **When** トップページが表示される
- **Then** LCP 候補が `PageTransition` により隠されず即時表示される

- **Given** キーボードでナビゲーションを操作する
- **When** Tab キーでリンク・ボタンにフォーカスする
- **Then** `:focus-visible` のアクセント色リングが表示される

- **Given** デスクトップまたはモバイルでナビリンクにホバーする
- **When** マウスをリンク上に置く
- **Then** opacity のみが変化し、位置・スケールの magnetic 効果は発生しない

- **Given** モバイルでハンバーガーメニューを開く
- **When** メニューが表示される
- **Then** 背景スクロールがロックされ、Escape キーまたはリンク選択でメニューが閉じる

- **Given** モバイルメニューが開いている
- **When** 別ルートへ遷移する、またはビューポートが 768px 以上になる
- **Then** メニューが自動的に閉じ、スクロールロックが解除される

- **Given** モバイル幅（390px）でトップページを表示する
- **When** 固定ヘッダーの高さを確認する
- **Then** ヘッダーがコンパクト（ロゴ 36px・上部は `max(12px, safe-area-inset-top)`）であり、本文の初期表示領域が確保されている
- **And** ハンバーガーボタンのタップ領域は 44px 以上である
- **And** モバイルヘッダー高さは compact 化前（約 88px）より低い

- **Given** iOS ノッチ/Dynamic Island デバイスでトップページを表示する
- **When** ページ読み込みが完了する
- **Then** `<meta name="viewport">` に `viewport-fit=cover` が含まれる
- **And** Navigation バー（`fixed top-0`）のロゴ・リンクがノッチ/Dynamic Island の背後に隠れない
- **And** Hero 静的フォールバック（mobileStaticHero パス）の本文開始位置が Navigation 下端より下にある（`padding-top: calc(64px + safe-area-inset-top) > nav-height`）

## グリッドレイアウト（モバイル水平オーバーフロー防止）

Issue: #118

`repeat(auto-fit, minmax(350px, 1fr))` は 390px viewport（padding 24px × 2 = 48px 差し引き後 342px）で水平オーバーフローを引き起こす。`ProcessNavigation.tsx` のパターンに倣い、全コンテンツコンポーネントで以下を使用する:

```
repeat(auto-fit, minmax(min(350px, 100%), 1fr))
```

`min(350px, 100%)` により、コンテナ幅が 350px 未満のとき最小値が `100%` になりオーバーフローを防ぐ。

対象コンポーネント: `ServicesContent`, `WorksContent`, `ConsultingContent`, `DevelopmentContent`

### DevelopmentContent の例外（300px 閾値）

`DevelopmentContent.tsx` のステップカードグリッドは `minmax(min(300px, 100%), 1fr)` を使用しており、他コンポーネントの `350px` とは異なる。これはカード内に円形ステップ番号（120px）とテキストブロックが横並びになる 2 カラムレイアウトのため、より狭い幅で折り返す設計意図による。320px viewport 以下での水平オーバーフロー防止は同様に保証される。

## モバイルナビゲーション（ハンバーガーメニュー）

- 開く: ハンバーガーボタンタップ → `aria-label="メニューを開く"` → メニュー表示
- 閉じる: リンクタップ / Escape キー / viewport 768px 以上
- スクロールロック: 開いている間 `document.body.style.overflow = 'hidden'`

## トップページ大見出しクリップ修正（Issue #150）— 撤去済み

> **撤去済み（#302 / #316）**: 旧トップの `ABOUT`・`VISION` 大見出し（`MissionVision.tsx`）の iOS クリップ修正記録でした。対象セクションはトップページ刷新（#302）で撤去されたため本項は無効です。`lib/scroll/reveal-props.ts` の staticReveal モードが `animate: { opacity: 1 }` のみを返す（transform を付与しない）仕様は下層ページで現存します。現行トップの 375px レイアウト崩れ防止は各 `e2e/top-*.spec.ts` の横あふれ検証で担保します。

## iOS Safe Area 対応（Issue #162）

### 概要

`app/layout.tsx` に `export const viewport: Viewport = { viewportFit: 'cover' }` を追加することで
`viewport-fit=cover` を有効化。これにより iOS ノッチ/Dynamic Island 環境で
`env(safe-area-inset-top, 0px)` が正しく非ゼロ値を返すようになる。

### safe-area 対応コンポーネント一覧

| コンポーネント/ファイル | 対応内容 |
|------------------------|---------|
| `app/layout.tsx` | `viewport-fit=cover` を `viewport` export で設定 |
| `components/Navigation.tsx`（下層）/ `components/top/TopNav.tsx`（トップ） | `fixed top-0` に `pt-[max(base,env(safe-area-inset-top,0px))]` 相当を適用 |
| `app/globals.css` | `.top-nav` の safe-area-inset-top 補償ほか |
| `components/PhilosophyProgressDots.tsx` | 右端の `safe-area-inset-right` を適用済み |
| `components/ui/PageHeader.tsx` | `pt-[calc(var(--space-section)+env(safe-area-inset-top,0px))]` でノッチ端末でもナビ直下余白を維持（Issue #167） |

> 旧 `components/Hero.tsx` の safe-area 対応（mobileStaticHero の `padding-top` / スクロールインジケータ `bottom`、#165）は #302 / #316 で撤去済み。

### 設計根拠：Navigation と Hero の padding 計算

Navigation の高さ（safe-area = S px の端末）:
```
pt = max(12px, S)  ≈ S  (ノッチデバイスでは S > 12 が確実)
logo height = 36px
pb = 12px
total nav height ≈ S + 48px
```

Hero mobileStaticHero の上部 padding:
```
pt = var(--space-8) + S = 64px + S
```

差分:
```
(64 + S) − (S + 48) = 16px  ≥ 0  （safe-area 値によらず一定の余白を確保）
```

Hero と globals.css の `env(safe-area-inset-top)` は Navigation の safe-area 吸収分と
二重計上しているように見えるが、両者を加算した差が常に正になるため意図的な対称設計である。
Navigation fix 適用後も Hero 側の変更は不要。

### 設計根拠：PageHeader の padding 計算（Issue #167）

`PageHeader` は全サブページ（`/services`, `/works`, `/contact`, `/process/*`）で使用される。
`pt-[120px]` 固定では、ノッチ端末で Navigation 高さが増加した分だけナビ直下余白が縮小する。

```
PageHeader pt (修正前) = 120px (固定) ← --space-section と同値だが直書き
Navigation height (S=59px) ≈ S + 48px = 107px
ナビ直下余白 = 120 - 107 = 13px  ← 視覚的に狭い

PageHeader pt (修正後) = var(--space-section) + S = 120px + 59px = 179px
ナビ直下余白 = 179 - 107 = 72px  ← ノッチなし端末と同等以上
```

ノッチなし端末（S=0）では `120px + 0 = 120px` で変化なし。`--space-section` トークンを参照するため、将来の spacing 変更に自動追従する。

### safe-area 値シミュレーション（E2E）

Playwright の通常 viewport では `env(safe-area-inset-top)` が常に 0 のため、CSS injection（`padding-top: <notch>px !important`）でノッチ端末を再現して補償挙動を検証する。

- モバイル `Navigation`（390px baseline）/ TopNav（88px 注入）: `e2e/navigation.spec.ts`（#166 / #303）
- **デスクトップ 下層 `Navigation`（1280px・`md:pt` 式の class 存在 + 59px 注入で高さ増加）: `e2e/navigation.spec.ts`（#288）**
- `PageHeader`（`safe-area-inset-top` 式の存在確認 + 164px 注入で padding 伸長・横あふれなし）: `e2e/page-headers.spec.ts`（#167 / #289）

## Hero CLS 修正：coarse pointer + reduced-motion（Issue #149 / #269）— 撤去済み

> **撤去済み（#302 / #316）**: iPad Pro 等の大画面タッチ端末で旧イマーシブ Hero（`components/Hero.tsx`、`[data-hero="immersive"]`）の静的フォールバック切替時に CLS が出る問題への対策（`app/globals.css` の `@media (pointer: coarse) and (prefers-reduced-motion: reduce)` ブロック、#269 の cascade 特異度検証、`tests/components/Hero.staticFallback.test.tsx`）でした。対象 Hero・DOM フック・CSS ブロック・テストはトップページ刷新（#302）と #316 で撤去済みです。現行 `TopHero` はイントロ前から要素が定位置にあり（CSS アニメーションは opacity のみ変化）レイアウトシフトを生みません。

## 検証

```bash
npm run optimize:images
npm test
npm run build
npm run test:e2e -- e2e/home.spec.ts e2e/navigation.spec.ts e2e/mobile-pages.spec.ts
```

Lighthouse（Mobile）で Performance / LCP / TBT を計測し、Issue コメントに改善前後を記録する。
