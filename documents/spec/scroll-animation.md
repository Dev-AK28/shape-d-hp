# スクロールアニメーション仕様

## 概要

Octaboot 風のスクロール連動体験を、既存の framer-motion + Lenis 基盤の上で全主要ページに統一適用する。

## 基盤コンポーネント

| コンポーネント | 用途 |
|--------------|------|
| `SmoothScrollProvider` | Lenis スムーズスクロール（`prefers-reduced-motion` 時無効） |
| `PageLoader` | 初回訪問時の軽量ローディング体験 |
| `ScrollReveal` | セクション単位のフェードリビール |
| `TextReveal` | 見出しのグラフェム/ワード単位リビール |
| `ParallaxSection` | スクロール連動パララックス（`prefers-reduced-motion` 時無効） |

## 共通設定（SSOT）

`lib/scroll/easing.ts`:

- `scrollEase`: `[0.22, 1, 0.36, 1]`
- `scrollViewport`: `{ once: true, margin: '-80px', amount: 0.2 }`
- `scrollTransition.duration`: `0.9`
- `scrollVariants`: `fadeUp`, `fadeUpLarge`, `fadeLeft`, `scale`
- `scrollStagger`: `item: 0.1`, `card: 0.15`

`lib/scroll/reveal-props.ts` の `getScrollRevealProps()` が各コンテンツコンポーネントから参照される。

## 適用ページ

| パス | 適用内容 |
|------|---------|
| `/` | Hero 入場 + About / MissionVision リビール + TextReveal 見出し |
| `/services` | ServicesContent セクション/カード スタガー + TextReveal |
| `/works` | WorksContent 同上 |
| `/process` | ProcessNavigation / ProcessContent |
| `/process/development` | DevelopmentContent |
| `/process/consulting` | ConsultingContent |
| `/philosophy` | PhilosophyContent |
| `/contact` | ScrollReveal + TextReveal（既存） |

## アクセシビリティ

- `useReducedMotion()` / `prefers-reduced-motion` 有効時:
  - Lenis 無効
  - PageLoader 非表示
  - リビールアニメーション duration 0 / initial false
  - ParallaxSection は通常 div にフォールバック

## 受け入れ基準

`documents/spec/acceptance-criteria.md` の「スクロールアニメーション」セクションを参照。

## 関連 Issue

- #16 feat: Octaboot 風スクロールアニメーションの導入
- #1 星アニメーション共通化（将来: StarBackground パフォーマンス層統合）
