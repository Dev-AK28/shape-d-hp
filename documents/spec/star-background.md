# StarBackground 共通コンポーネント

Issue: #1

## 概要

14 コンポーネントに重複していた星アニメーションロジックを `components/StarBackground.tsx` に集約し、`react-hooks/set-state-in-effect` ESLint エラーを解消する。

パフォーマンス最適化（モバイル縮小・Intersection Observer・reduced-motion）は [`mobile-performance.md`](./mobile-performance.md)（Issue #51）を参照。本 spec は**共通化と lint 解消**がスコープ。

## 実装

- **コンポーネント**: `components/StarBackground.tsx`
- **デフォルト値**: `StarBackground.tsx` 内 `DEFAULT_CONFIG`（`StarConfig` 型: `count`, `maxSize`/`minSize`, `maxOpacity`/`minOpacity`, `maxSpeed`/`minSpeed`, `drift`, `glowMultiplier`）
- **スケーリング / 更新間隔**: `lib/performance/star-config.ts`（`scaleStarConfig`, `getStarUpdateIntervalMs`）
- **描画方式**: `useRef` + 間引き `setInterval` + imperative DOM 位置更新（effect 内の同期的 `setState` を回避）
- **SSR / hydration 安全性**（Issue #352）: 星の座標・サイズ等は `Math.random()` で決定するため、SSR とクライアント初回レンダーで同時に呼ぶと値が食い違い hydration mismatch になる。`useDeviceProfile` の `isReady`（SSR / hydration 中は `false`、mount 後に `true` へ反転）で `createStars()` の呼び出しをゲートし、`isReady === false` の間は星を 0 件で描画してサーバー出力とクライアント初回レンダーを一致させ、mount 後にのみランダムな星を生成する
- **パフォーマンス層**: `useDeviceProfile` + `useIntersectionVisible` + `scaleStarConfig` / `getStarUpdateIntervalMs` を配線済み（[`mobile-performance.md`](./mobile-performance.md)）
- **ページ別上書き**: 各利用コンポーネントは `config={{ count: ... }}` 等で上書き可能
- **利用コンポーネント**: Contact, ProcessContent, ProcessNavigation, Vision, WhatIDo, WhoIAm, ConsultingContent, DevelopmentContent
- **非利用（トップページ・#302 刷新）**: `components/top/` の各セクションが不透明な `--ink` 系背景 + `RainCanvas` を使用（旧 `CosmicScene` 画像背景は #312 / #316 で撤去。`design-system.md` 参照）
- **非利用（Issue #93）**: ServicesContent / WorksContent — StarBackground Hero を廃止し単色背景 + ページ見出しに統一
- **非利用（Issue #80 / #302）**: 旧 About / MissionVision — scroll storytelling 化で StarBackground を外し、#302 でトップ刷新に伴い撤去済み
- **非利用（Issue #81）**: `/philosophy` — CSS/GSAP ベースの alphabet-driven ビジュアル。追加の背景画像は使用せず、各パネルは `bgTint` グラデーション差分のみで温度感を表現する（Issue #202 でダストテクスチャ撤去済み）。詳細は [`philosophy-page.md`](./philosophy-page.md)

## 受け入れ基準（Given-When-Then）

- **Given** 開発環境で `npm run lint` を実行する
- **When** ESLint が全ファイルを検査する
- **Then** `react-hooks/set-state-in-effect` エラーが 0 件である

- **Given** 星背景を表示する各ページを開く
- **When** ページが読み込まれる
- **Then** 従来と同等の星アニメーションが表示される
