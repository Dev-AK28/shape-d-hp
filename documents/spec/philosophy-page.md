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
| 進捗ドット | `usePanelActiveIndex`（IntersectionObserver、`enabled: !enableHorizontal` でデスクトップは IO 自体を生成しない — #187） | **有効**（GSAP 非依存） |

モバイル `snap` は `panelsRef`（6 パネルのみ）に適用。CTA ブロックは snap 計算から除外する。

### 進捗ドットの IO コスト削減（#187）

デスクトップ（`enableHorizontal = true`）では進捗ドットの `activeIndex` は GSAP の `onUpdate` から得られる `gsapActiveIndex` のみを使用し、`usePanelActiveIndex` が返す IO ベースの値は使用されない。従来は `usePanelActiveIndex` が常に全パネルへ `IntersectionObserver` を設定していたため、デスクトップでも不要な監視コストが発生していた。

`usePanelActiveIndex(containerRef, { enabled?: boolean })` に `enabled` オプション（デフォルト `true`）を追加し、`PhilosophyContent` からは `usePanelActiveIndex(panelsRef, { enabled: !enableHorizontal })` として呼び出す。`enabled` が `false` の場合、`useEffect` は `IntersectionObserver` を生成せずに即座に return する（フック自体は React のルール上、条件分岐せず常に呼び出す）。

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

```gherkin
Given ユーザーがデスクトップブラウザで Philosophy ページを表示している
When ブラウザウィンドウの幅を変更する
Then スクロール完了時に最終パネル（D: Development）がビューポート中央に正確に収まっている
```

## 検証

```bash
npm test
npm run test:e2e -- e2e/philosophy.spec.ts
```

- 単体: `tests/philosophy/content.test.ts`
- E2E: `e2e/philosophy.spec.ts`
