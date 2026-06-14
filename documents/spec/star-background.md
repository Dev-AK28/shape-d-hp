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
- **パフォーマンス層**: `useDeviceProfile` + `useIntersectionVisible` + `scaleStarConfig` / `getStarUpdateIntervalMs` を配線済み（[`mobile-performance.md`](./mobile-performance.md)）
- **ページ別上書き**: 各利用コンポーネントは `config={{ count: ... }}` 等で上書き可能
- **利用コンポーネント**: Contact, ProcessContent, ProcessNavigation, Vision, WhatIDo, WhoIAm, ConsultingContent, DevelopmentContent
- **非利用（トップ Hero）**: `CosmicScene` 画像背景を使用（`design-system.md` 参照）
- **非利用（Issue #93）**: ServicesContent / WorksContent — StarBackground Hero を廃止し単色背景 + ページ見出しに統一
- **非利用（Issue #80）**: About / MissionVision — scroll storytelling 化に伴い StarBackground を外し、デザイントークン背景に統一
- **非利用（Issue #81）**: `/philosophy` — CSS/GSAP のみの alphabet-driven ビジュアル（詳細は [`philosophy-page.md`](./philosophy-page.md)）

## 受け入れ基準（Given-When-Then）

- **Given** 開発環境で `npm run lint` を実行する
- **When** ESLint が全ファイルを検査する
- **Then** `react-hooks/set-state-in-effect` エラーが 0 件である

- **Given** 星背景を表示する各ページを開く
- **When** ページが読み込まれる
- **Then** 従来と同等の星アニメーションが表示される
