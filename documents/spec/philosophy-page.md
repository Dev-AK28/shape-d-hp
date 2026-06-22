# Philosophy ページ（alphabet-driven ビジュアル）

Issue: #81

## 概要

`/philosophy` を SHAPE∞D の各文字（S/H/A/P/E/D）を軸にした full-screen スクロール体験へ再構築する。動画・WebGL は使用しない。追加の背景画像は使用せず、各パネルは `bgTint` のグラデーション差分のみで温度感を表現する（Issue #202 でダストテクスチャを撤去）。モバイルは Issue #81 / #51 のパフォーマンス方針に従い画像なしを維持する。

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
- **背景温度**: セクションごとに `bgTint` でグラデーション差分のみ変更（追加の背景画像は使用しない）

## アニメーション（GSAP + framer-motion）

| 挙動 | 設定 | reduced-motion 時 |
|------|------|-------------------|
| デスクトップ水平スクロール | `gsap.timeline` + `ScrollTrigger` pin — scrub `1.8`、`end` は関数形式（`#186` リサイズ対応） | 無効（`useGsapContext` スキップ） |
| モバイル垂直 snap | `isMobile` または `prefersCoarsePointer` 時は縦スクロール + `ScrollTrigger.snap` | 同上 |
| 文字 opacity scrub | `0.04` → `0.08`（デスクトップ: per-panel fade-in / モバイル: scrub） | 静的 `0.04` |
| テキストリビール | `getScrollRevealProps` + `TextReveal`（`useStaticReveal` / hydration ラッチ — #151） | `staticReveal` 経由で即時表示 |
| 進捗ドット | `usePanelActiveIndex`（IntersectionObserver） | **有効**（GSAP 非依存） |

モバイル `snap` は `panelsRef`（6 パネルのみ）に適用。CTA ブロックは snap 計算から除外する。

### リサイズ対応（#186）

デスクトップ水平スクロールの `scrollDistance`（= `(sections.length - 1) × window.innerWidth`）は以下で常に最新の `innerWidth` を参照する:

- `end: () => \`+=${getScrollDistance()}\`` — `ScrollTrigger.refresh()` 時に自動再計算
- `x: () => -getScrollDistance()` — 関数形式で `tl.invalidate()` 後に再評価
- `ScrollTrigger.addEventListener('refreshInit', () => tlRef.current?.invalidate())` — リサイズ起因の refresh 前に timeline を invalidate してから `x` を再評価させる

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
