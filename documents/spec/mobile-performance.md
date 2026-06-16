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
| `Navigation`（モバイル） | `px-4 py-3`、ロゴ `height=36`、ハンバーガー `44×44px` タップ領域。デスクトップは `px-6 py-5`・ロゴ `height=48` を維持（Issue #74） |
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
- **And** これは framer-motion リビール消費コンポーネントが `useStaticReveal()` 経由で `staticReveal` を取得し渡すことで保証される（`profile.isMobile` により SPA クライアント遷移時も即時表示。`TextReveal` は初回 `staticReveal` をラッチ）。詳細: [`scroll-animation.md`](./scroll-animation.md) の staticReveal ガード節

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
- **Then** ヘッダーがコンパクト（ロゴ 36px・`py-3`）であり、本文の初期表示領域が確保されている
- **And** ハンバーガーボタンのタップ領域は 44px 以上である
- **And** モバイルヘッダー高さは compact 化前（約 88px）より低い

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

## 検証

```bash
npm run optimize:images
npm test
npm run build
npm run test:e2e -- e2e/home.spec.ts e2e/navigation.spec.ts e2e/mobile-pages.spec.ts
```

Lighthouse（Mobile）で Performance / LCP / TBT を計測し、Issue コメントに改善前後を記録する。
