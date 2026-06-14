# モバイルパフォーマンス最適化

Issue: #51

## 目的

スマートフォンでの読み込み・スクロール体感を改善しつつ、宇宙感・星・グラデーション・滑らかなアニメーションのビジュアルクオリティをデスクトップで維持する。

## 対象

| 領域 | 対策 |
|------|------|
| `StarBackground` | 共通化・lint 解消は [`star-background.md`](./star-background.md)（Issue #1）を参照。モバイルで星数・グロー縮小、更新間隔 150ms、非表示時は rAF ループを停止し `box-shadow` グローを解除（IO 初回判定前はスキップ）、`prefers-reduced-motion` 時は静止しスクロールイン後にグローを復元。IO は `threshold: 0.15` + `rootMargin` で複数インスタンスの同時稼働を抑制。`isReady` 後に IO を有効化 |
| `SmoothScrollProvider` | モバイル・タッチ（`pointer: coarse`）・`prefers-reduced-motion` 時は Lenis 無効。プロファイル変更時に Lenis を create/destroy。Lenis 初期化後に `ScrollTrigger.refresh()` |
| Hero `immersive` | トップのみ。GSAP pin はデスクトップ精密ポインタのみ。モバイル/reduced-motion 時は静的フォールバック（コピー即時表示） |
| `NebulaBackground` | Philosophy 等で継続利用。モバイルで blur 半径を 45% に縮小、reduced-motion 時はアニメーション停止、非表示時は blur/animation を停止（`fixed` は常時・IO 無効）。`@keyframes` は `app/globals.css` の `nebula-philosophy-*` |
| `PageLoader` | fade-out（delay 0.45s + duration 0.5s）完了時に `onAnimationComplete` で非表示。未発火時のフォールバック `setTimeout`（1450ms = 950ms + 500ms buffer）。`pointer-events-none` でフェード中のクリックブロックを回避。`prefers-reduced-motion` 時は表示しない |
| 画像 | 参照中の PNG のみ `npm run optimize:images` で WebP 化し、表示参照を `.webp` に切替 |

## デバイスプロファイル

`lib/performance/device-profile.ts` の `readDeviceProfile()` が判定の SSOT。`lib/hooks/useDeviceProfile.ts` は `useSyncExternalStore` で client プロファイルを購読し、`isReady` で hydration 前の描画を遅延する。

- `isMobile`: ビューポート幅 `< 768px`（`MOBILE_BREAKPOINT_PX`）
- `prefersReducedMotion`: OS の reduced motion 設定
- `prefersCoarsePointer`: タッチ主体デバイス

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

- **Given** デスクトップでトップ Hero を確認する
- **When** スクロールで pin アニメーションを実行する
- **Then** ロゴが縮小・消失しキャッチコピーが現れる（星・ネビュラなし）

- **Given** モバイルまたは `prefers-reduced-motion: reduce` が有効
- **When** トップ Hero を操作する
- **Then** GSAP pin は無効化され、静的フォールバックが表示される

## 検証

```bash
npm run optimize:images
npm test
npm run build
```

Lighthouse（Mobile）で Performance / LCP / TBT を計測し、Issue コメントに改善前後を記録する。
