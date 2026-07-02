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
| 進捗ドット | `usePanelActiveIndex`（IntersectionObserver、`enabled: !enableHorizontal` でデスクトップは IO 自体を生成しない — #187）。`gsapActiveIndex` は `enableHorizontal` の `false→true` 遷移時にレンダー中同期リセット（#254） | **有効**（GSAP 非依存） |

モバイル `snap` は `panelsRef`（6 パネルのみ）に適用。CTA ブロックは snap 計算から除外する。

### 進捗ドットの IO コスト削減（#187）

デスクトップ（`enableHorizontal = true`）では進捗ドットの `activeIndex` は GSAP の `onUpdate` から得られる `gsapActiveIndex` のみを使用し、`usePanelActiveIndex` が返す IO ベースの値は使用されない。従来は `usePanelActiveIndex` が常に全パネルへ `IntersectionObserver` を設定していたため、デスクトップでも不要な監視コストが発生していた。

`usePanelActiveIndex(containerRef, { enabled?: boolean })` に `enabled` オプション（デフォルト `true`）を追加し、`PhilosophyContent` からは `usePanelActiveIndex(panelsRef, { enabled: !enableHorizontal })` として呼び出す。`enabled` が `false` の場合、`useEffect` は `IntersectionObserver` を生成せずに即座に return する（フック自体は React のルール上、条件分岐せず常に呼び出す）。

`enableHorizontal`（≒ `enabled` の否定）は `useDeviceProfile` が `resize`/`matchMedia` の変化を監視しているため実行中にも変わり得る。フックの戻り値は `return enabled ? activeIndex : 0` としてゲートしており、`enabled` が `true→false` に変わった直後でも、以前観測された非ゼロ値が漏れ出さず常に `0` を返すことを保証する（PR #250 レビュー対応）。

さらに逆方向（`false→true`）にも同様の保証がある。`enabled` を直前レンダーの値と `useState` で比較し、`false→true` に変わったレンダー中に同期的に `setActiveIndex(0)` する（React の「前回レンダーの情報を保持する」パターン。`useRef` での比較・更新は `react-hooks/refs` に抵触するため `useState` を用いる）。これにより、新しい `IntersectionObserver` の初回コールバックが発火するまでの間、`enabled` が有効化される前に観測された古い非ゼロ値が 1 フレームも露出しない（PR #250 レビュー Round 2 対応）。

### 検証範囲の補足（PR #250 レビュー対応）

- E2E: `e2e/philosophy.spec.ts` の「Philosophy mobile vertical snap」に、モバイルの進捗ドットが `IntersectionObserver` 経由でスクロール位置に追従することを検証するケースを追加。デスクトップ側の `gsapActiveIndex` 連動テストのみでは `usePanelActiveIndex` の `enabled` 経路（モバイル）が検証されていなかったための補完。Round 2 で中間パネル（3枚目）へのスクロールも追加し、`bestRatio` の先勝ちロジックを先頭/末尾以外でも検証
- リサイズ時のブレークポイント境界（768px 付近）で `enabled` が細かくトグルし `IntersectionObserver` の生成/破棄が連続し得る懸念は、`useDeviceProfile` の `resize` リスナー自体の debounce/hysteresis 導入が必要な、より広い影響範囲の課題のため本 PR の対象外とし、[#251](https://github.com/Dev-AK28/shape-d-hp/issues/251) で追跡する
- Round 2 レビューで指摘された `false→true` 遷移時の stale 値ギャップは上記の `useState` ベースのレンダー中リセットで解消。ユニットテストは `tests/philosophy/content.test.ts` の文字列マッチング方式のまま維持しつつ、`indexOf` が `-1`（未検出）を返した場合に `slice` が黙って広い範囲を返してしまう脆弱性を解消するため、境界マーカーの発見を明示的に assert するよう修正した
- Round 3 で指摘された `gsapActiveIndex` 側の stale 値保護の非対称性は [#254](https://github.com/Dev-AK28/shape-d-hp/issues/254) で解消。`enableHorizontal` が `false→true`（モバイル→デスクトップ）に遷移するレンダー中に、`usePanelActiveIndex` の `prevEnabled` パターンと同等の `prevEnableHorizontal` useState ガードが `setGsapActiveIndex(0)` を同期的に発火させる。これにより、新しい ScrollTrigger の `onUpdate` が最初に呼ばれるより前の 1 フレームも stale 値が UI に露出しなくなった
- Round 3 で追加した E2E テスト: desktop(1400px)から mobile(375px)へのリサイズを `page.setViewportSize()` でシミュレートし、IO の `enabled false→true` 遷移後にドットが 0 から正しく追従することを確認。タイムアウトをマジックナンバー `5000` から `Math.ceil(ANIMATION_DURATION.section * 1000) + 2500`（= 4300ms、デスクトップ系テストと同じ導出方式）に統一
- Round 5 (Nit): `PhilosophyContent.tsx` の IO 呼び出しコメントで `(enabled=false)` という括弧書きがデスクトップに限定した説明にもかかわらず対象が明示されていなかった点を修正。デスクトップ（enabled=false）では `usePanelActiveIndex` のゲートにより常に 0 を返し、モバイル（enabled=true）では IO が有効だがページ先頭でパネル 0 が視野に入るため同じく 0 を返す、という両経路を明示した

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

### E2E テスト補足（Issue #239）

`can navigate through all 6 panels` テストに中間パネルの個別検証を追加。

**変更前の構造:** スクロールを 5 回先行実行してから最後に 1 回だけ CSS transform をチェック → 途中パネルで GSAP がフリーズしても検出不可能。

**変更後の構造:** ループ内で 1 スクロールごとに `dots.nth(i).data-active='true'` を `toPass` で確認（案B 採用）。GSAP 進捗のプロキシとして進捗ドットの `data-active` 属性を使用する（`PhilosophyProgressDots active index tracks` テストと同一メカニズム）。最後に CSS transform の回帰ガードも維持。`test.setTimeout(60_000)` を明示設定（最悪ケース 6 × 4300ms = 25.8s が Playwright 30s デフォルトを超えるため）。スクロール前に `toHaveCount(6)` と初期ドット状態を検証するベースラインアサートも追加。最終 transform チェックは `[tx, iw]` 同時取得パターンに統一（ `scrollBy` のライブ読み取りとスナップショットの乖離を防止）。

```gherkin
Given Philosophy ページ（1280×800 デスクトップ）が読み込まれている
When viewport 幅ずつスクロールを i=1〜5 ステップ実行する
Then 各ステップ後に dots.nth(i) が data-active='true' になる（GSAP 中間フリーズを検出）
And dots.nth(i-1) が data-active='false' になる（複数ドット同時活性化を防止）
And 全スクロール後の CSS translateX が -(panelCount-2)×innerWidth を下回る
```
