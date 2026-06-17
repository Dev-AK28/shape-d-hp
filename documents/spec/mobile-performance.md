# モバイルパフォーマンス最適化

Issue: #51

## 目的

スマートフォンでの読み込み・スクロール体感を改善しつつ、宇宙感・星・グラデーション・滑らかなアニメーションのビジュアルクオリティをデスクトップで維持する。

## 対象

| 領域 | 対策 |
|------|------|
| `StarBackground` | 共通化・lint 解消は [`star-background.md`](./star-background.md)（Issue #1）を参照。モバイルで星数・グロー縮小、更新間隔 150ms、非表示時は rAF ループを停止し `box-shadow` グローを解除（IO 初回判定前はスキップ）、`prefers-reduced-motion` 時は静止しスクロールイン後にグローを復元。IO は `threshold: 0.15` + `rootMargin` で複数インスタンスの同時稼働を抑制。`isReady` 後に IO を有効化 |
| `SmoothScrollProvider` | `prefers-reduced-motion` 時のみ Lenis 無効（モバイル・タッチ端末も Lenis 有効）。プロファイル変更時に Lenis を create/destroy。Lenis 初期化後に `ScrollTrigger.refresh()` |
| Hero `immersive` | トップのみ。GSAP pin はデスクトップ・モバイル共通で有効。`prefers-reduced-motion` 時のみ静的フォールバック（コピー即時表示） |
| `NebulaBackground` | Philosophy 等で継続利用。モバイルで blur 半径を 45% に縮小、reduced-motion 時はアニメーション停止、非表示時は blur/animation を停止（`fixed` は常時・IO 無効）。`@keyframes` は `app/globals.css` の `nebula-philosophy-*` |
| `PageLoader` | fade-out（delay 0.45s + duration 0.5s）完了時に `onAnimationComplete` で非表示。未発火時のフォールバック `setTimeout`（1450ms = 950ms + 500ms buffer）。`pointer-events-none` でフェード中のクリックブロックを回避。`prefers-reduced-motion` 時は表示しない |
| `PageTransition` | `app/template.tsx` 経由でページ本文 fade-in（0.6s）。初回訪問は LCP 保護のため即時表示。**モバイル（`profile.isMobile`）は SPA クライアント遷移でも即時表示**（#151）。デスクトップのみ 2 回目以降のルート遷移で fade。`Navigation` は `layout.tsx` 配置でフェード対象外 |
| Micro-interactions | ナビ `.nav-link` とボタン hover は opacity 変化のみ（magnetic effect なし）。タッチ端末・`prefers-reduced-motion` では hover opacity 無効。`:focus-visible` でキーボードフォーカスリング |
| `Navigation`（モバイル） | `px-4 pt-[max(0.75rem,env(safe-area-inset-top,0px))] pb-3`、ロゴ `height=36`、ハンバーガー `44×44px` タップ領域。デスクトップは `px-6 pt-[max(1.25rem,env(safe-area-inset-top,0px))] pb-5`・ロゴ `height=48` を維持（Issue #74）。`viewport-fit=cover` 有効時にノッチ/Dynamic Island と重複しないよう上部パディングを `safe-area-inset-top` に応じて伸長（Issue #162） |
| フォント | `next/font` で Cormorant Garamond + Noto Serif JP を preload（`app/layout.tsx`） |
| GSAP | tree-shaking: `gsap` + `gsap/ScrollTrigger` のみ import。bundle 目安 ~38KB（Lenis ~8KB + GSAP ~30KB） |
| 画像 | 参照中の PNG のみ `npm run optimize:images` で WebP 化し、表示参照を `.webp` に切替 |

## デバイスプロファイル

`lib/performance/device-profile.ts` の `readDeviceProfile()` が判定の SSOT。`lib/hooks/useDeviceProfile.ts` は `useSyncExternalStore` で client プロファイルを購読し、`isReady` で hydration 前の描画を遅延する。

- `isMobile`: ビューポート幅 `< 768px`（`MOBILE_BREAKPOINT_PX`）
- `prefersReducedMotion`: OS の reduced motion 設定
- `prefersCoarsePointer`: タッチ主体デバイス（`(pointer: coarse)`）
- `prefersHoverNone`: ホバー非対応デバイス（`(hover: none)`）。カスタムカーソル無効化に使用

## 画像アセット

- 最適化スクリプト: `npm run optimize:images`（`image-assets.ts` で参照される PNG のみ対象）
- 参照マップ: `lib/performance/image-assets.ts`
- PNG 原画像はビルド用ソースとして `public/` に残し、ランタイム参照は WebP のみ
- `image_13.png` は未参照のためスクリプト対象外

## 受け入れ基準（Given-When-Then）

- **Given** スマートフォンでトップページを開く
- **When** 初回表示が完了する
- **Then** 改善前よりスクロール中のカクつきが軽減されている

- **Given** Lighthouse モバイル計測を行う
- **When** 改善前後を比較する
- **Then** Performance スコアまたは LCP / TBT が改善している

- **Given** デスクトップまたはモバイルでトップ Hero を確認する
- **When** スクロールで pin アニメーションを実行する
- **Then** ロゴが縮小・消失しキャッチコピーが現れる（`CosmicScene` 宇宙背景は `HomePageShell` によりフッター手前まで継続）

- **Given** `prefers-reduced-motion: reduce` が有効
- **When** トップ Hero を操作する
- **Then** GSAP pin は無効化され、静的フォールバックが表示される

- **Given** モバイル幅（390px / 375px）でトップページを閲覧している
- **When** Hero のお問い合わせボタンから下方向へスクロールする
- **Then** About および MissionVision のコンテンツが表示される
- **And** フッター直前に意図しない大きな空白領域がない

- **Given** モバイル幅（375px / 390px）で `/services`・`/works`・`/process`・`/process/development`・`/process/consulting`・`/philosophy`・`/contact` を開く（Issue #151）
- **When** ページ読み込みが完了し、まだスクロールしていない
- **Then** メインコンテンツ（各セクション見出し・カード）が `opacity: 1` で描画されており、フッター付近までスクロールしないと表示されない状態にならない
- **And** これは framer-motion リビール消費コンポーネントが `useStaticReveal()` 経由で `staticReveal` を取得し渡すことで保証される（`profile.isMobile` により SPA クライアント遷移時も即時表示。`TextReveal` は `shouldUseStaticReveal` の `!isReady` ガードにより hydration 安全性が確保されており、初回ラッチは不要）。詳細: [`scroll-animation.md`](./scroll-animation.md) の staticReveal ガード節

- **Given** トップページを最下部までスクロールする
- **When** フッター領域がビューポートに入る
- **Then** 著作権表示（`© 2026`）およびナビリンクが `CosmicScene` 固定背景の下に隠れず読める

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

## トップページ大見出しクリップ修正（Issue #150）

iPhone SE（375px）実機確認にて、トップページの `ABOUT`・`VISION` 大見出しの先頭文字が画面外に切れる問題を修正。

**根本原因**:
1. `getScrollRevealProps` の staticReveal モードが `animate: { opacity: 1, y: 0 }` を返し、Framer Motion が不要な `transform: translateY(0px)` を付与していた。これが `backdrop-filter: blur()` と組み合わさると iOS Chrome/Safari で GPU コンポジット層が誤クリッピングを起こす。
2. `MissionVision.tsx` の `section` に `overflow-hidden` が設定されており、上記コンポジット層の誤動作時に見出しが左端でクリップされていた。

**修正内容**:
- `lib/scroll/reveal-props.ts`: staticReveal モードの `animate` を `{ opacity: 1 }` のみに変更（transform プロパティを除外）
- `components/MissionVision.tsx`: `overflow-hidden` を section 全体でなく装飾テキスト（SELF-CONGRUENCE）専用ラッパー `div.absolute.inset-0.overflow-hidden` のみに移動

**受け入れ基準**:
- Given 375px viewport でトップページを開く
- When ABOUT / VISION セクションが画面内に入る
- Then `h2.ABOUT` および `h2.VISION` の左端がセクション左 padding 内（x ≥ 24px）に収まっている
- And 水平スクロールが発生しない（`scrollWidth ≤ innerWidth`）

## iOS Safe Area 対応（Issue #162）

### 概要

`app/layout.tsx` に `export const viewport: Viewport = { viewportFit: 'cover' }` を追加することで
`viewport-fit=cover` を有効化。これにより iOS ノッチ/Dynamic Island 環境で
`env(safe-area-inset-top, 0px)` が正しく非ゼロ値を返すようになる。

### safe-area 対応コンポーネント一覧

| コンポーネント/ファイル | 対応内容 |
|------------------------|---------|
| `app/layout.tsx` | `viewport-fit=cover` を `viewport` export で設定 |
| `components/Navigation.tsx` | `fixed top-0` に `pt-[max(base,env(safe-area-inset-top,0px))]` を適用 |
| `components/Hero.tsx` | mobileStaticHero パスで `pt-[calc(var(--space-8)_+_env(safe-area-inset-top,_0px))]` |
| `app/globals.css` | `@media (pointer:coarse) and (prefers-reduced-motion:reduce)` ブロックで同等の `padding-top` |
| `components/PhilosophyProgressDots.tsx` | 右端の `safe-area-inset-right` を適用済み |

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

### 未対応項目（別 Issue 管理）

- GSAP Hero スクロールインジケータの `safe-area-inset-bottom`（装飾要素、重大度: 低）
- E2E テストでの safe-area 値シミュレーション（Playwright 通常 viewport では inset = 0）

## Hero CLS 修正：coarse pointer + reduced-motion（Issue #149）

iPad Pro 等の大画面タッチ端末で `prefers-reduced-motion` が有効な場合、SSR/ハイドレーション中に
`useDeviceProfile` が `DEFAULT_DEVICE_PROFILE`（`prefersCoarsePointer: false`）を返す間は
`mobileStaticHero=false`（`h-svh` + absolute 下部 CTA）でレンダリングされる。
`isReady=true` 後に `mobileStaticHero=true`（`flex-col h-auto` + フロー内 CTA）へ切り替わり CLS が発生する。

**根本原因**:
`useSyncExternalStore` の設計上、SSR snapshot は常に `DEFAULT_DEVICE_PROFILE` を使用するため、
`prefersCoarsePointer` の実値は hydration 完了まで不明。

**修正内容**:
- `app/globals.css`: `@media (pointer: coarse) and (prefers-reduced-motion: reduce)` ブロックを追加し、
  `[data-hero="immersive"]`（section）と `[data-hero-cta]`（CTA ラッパー）を CSS レベルで
  mobile flow layout に切り替える。ブラウザは CSS を初回ペイント前に適用するため CLS が発生しない
- `components/Hero.tsx`: 上記 CSS セレクタ用に `data-hero="immersive"` と `data-hero-cta=""` を追加

**設計根拠**:
- Tailwind ユーティリティは `@import "tailwindcss"` 位置に展開される。それより後の CSS は
  cascade 上の後方に位置するため `!important` 不要。特異度は `[data-hero="immersive"]` が
  Tailwind と同じ（0-1-0）で document order で勝ち、`[data-hero="immersive"] [data-hero-cta]`
  は Tailwind より高い（0-2-0）ため特異度でも確実に勝つ
- JS `mobileStaticHero` フラグと CSS ブロックは `pointer: coarse` デバイスの steady state で
  ほぼ同一レイアウトに収束する（CSS は追加で `min-height: 100svh` を設定するが、JS className path
  はこれを省略する。いずれも正しい表示結果を生む）。ただし `isMobile=true + pointer:fine`
  の組み合わせ（例: 幅 < 768px のスマートフォンに Bluetooth マウスを接続した場合。
  iPad mini ポートレートは 768px のため `isMobile = width < 768 = false` であり該当しない）は
  CSS override の発火条件（`pointer: coarse`）を満たさないため `min-height: 100svh` は付与されず、
  JS の `h-auto` のみが適用される。この端末では Hero の高さはコンテンツ量に依存するが、
  意図した表示結果となる
- `data-*` 属性は className を変更しないため React hydration mismatch は発生しない

**受け入れ基準**:
- Given 1024px viewport（iPad Pro）で `pointer: coarse` かつ `prefers-reduced-motion: reduce` の端末
- When トップページを開く
- Then Hero セクションが初回ペイントから `flex-col` レイアウト（CLS なし）で表示される
- And CTA（お問い合わせ）がビューポート内に表示される（virtual keyboard で隠れない）
- And `data-hero="immersive"` と `data-hero-cta` 属性が DOM に存在する

## 検証

```bash
npm run optimize:images
npm test
npm run build
npm run test:e2e -- e2e/home.spec.ts e2e/navigation.spec.ts e2e/mobile-pages.spec.ts
```

Lighthouse（Mobile）で Performance / LCP / TBT を計測し、Issue コメントに改善前後を記録する。
