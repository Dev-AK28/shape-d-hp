# StarBackground 共通コンポーネント

Issue: #1

## 概要

14 コンポーネントに重複していた星アニメーションロジックを `components/StarBackground.tsx` に集約し、`react-hooks/set-state-in-effect` ESLint エラーを解消する。

## 実装

- **コンポーネント**: `components/StarBackground.tsx`
- **設定 SSOT**: `lib/performance/star-config.ts`
- **描画方式**: `useRef` + `requestAnimationFrame` + imperative DOM（effect 内の同期的 `setState` を回避）
- **利用コンポーネント**: Hero, About, Contact, MissionVision, PhilosophyContent, ProcessContent, ProcessNavigation, ServicesContent, Vision, WhatIDo, WhoIAm, ConsultingContent, DevelopmentContent, WorksContent

## 受け入れ基準（Given-When-Then）

- **Given** 開発環境で `npm run lint` を実行する
- **When** ESLint が全ファイルを検査する
- **Then** `react-hooks/set-state-in-effect` エラーが 0 件である

- **Given** 星背景を表示する各ページを開く
- **When** ページが読み込まれる
- **Then** 従来と同等の星アニメーションが表示される
