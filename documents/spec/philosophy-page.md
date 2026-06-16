# Philosophy ページ（alphabet-driven ビジュアル）

Issue: #81

## 概要

`/philosophy` を SHAPE∞D の各文字（S/H/A/P/E/D）を軸にした full-screen スクロール体験へ再構築する。追加画像・動画・WebGL は使用しない。

## ページ構成

| 要素 | 実装 |
|------|------|
| ページタイトル | `app/philosophy/page.tsx` の `h1.sr-only`（「哲学 — SHAPE∞D」） |
| セクション | `components/PhilosophyContent.tsx` — 6 枚の `100svh` パネル |
| CTA | パネル群の外側（snap 対象外）に配置 |
| 進捗ドット | `components/PhilosophyProgressDots.tsx` — 装飾用（`aria-hidden`） |
| 背景 | `StarBackground` は使用しない（Issue #81 パフォーマンス方針） |

## ビジュアル仕様

- **オーバーレイ文字**: 各セクション中央に `S`〜`D` を巨大表示。opacity `0.04`〜`0.08`（移動アニメーションなし）
- **前景テキスト**: 見出し（`h2`）+ サブタイトル + 説明 + 詳細
- **背景温度**: セクションごとに `bgTint` でグラデーション差分のみ変更

## アニメーション（GSAP + framer-motion）

| 挙動 | 設定 | reduced-motion 時 |
|------|------|-------------------|
| セクション snap | `ScrollTrigger.snap` — duration `1.8` / ease `power3.inOut` | 無効（`useGsapContext` スキップ） |
| モバイル snap | `isMobile` または `prefersCoarsePointer` 時は snap 無効 | 同上 |
| 文字 opacity scrub | `0.04` → `0.08` | 静的 `0.04` |
| テキストリビール | `getScrollRevealProps` + `TextReveal`（`useStaticReveal` / hydration ラッチ — #151） | `staticReveal` 経由で即時表示 |
| 進捗ドット | `usePanelActiveIndex`（IntersectionObserver） | **有効**（GSAP 非依存） |

`snap` は `panelsRef`（6 パネルのみ）に適用。CTA ブロックは snap 計算から除外する。

## 受け入れ基準（Given-When-Then）

```gherkin
Given ユーザーが /philosophy を開く
When ページが読み込まれる
Then S セクションの full-screen パネルとオーバーレイ文字「S」が表示される
```

```gherkin
Given ユーザーが Philosophy ページをスクロールする
When 各 SHAPE-D パネルがビューポートに入る
Then 右端の進捗ドットが対応する文字位置に追従する
```

```gherkin
Given ユーザーが prefers-reduced-motion を有効にしている
When Philosophy ページを閲覧する
Then GSAP snap/文字 scrub は無効だが、全セクションとドット追従は利用可能である
```

## 検証

```bash
npm test
npm run test:e2e -- e2e/philosophy.spec.ts
```

- 単体: `tests/philosophy/content.test.ts`
- E2E: `e2e/philosophy.spec.ts`
