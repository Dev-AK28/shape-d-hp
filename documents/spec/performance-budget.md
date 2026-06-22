# パフォーマンス予算

Issue: #214 / Part of #210

## 目的

#210 シリーズ（スクロール演出強化）の追加アセット・JS増分・Web Vitals への影響を定量化し、
回帰の早期検出と意思決定の基準とする。

---

## アセット予算

### 追加アニメーションアセット（#210 シリーズ新規追加分）

| ファイル | 用途 | サイズ | Issue |
|---------|------|--------|-------|
| `bigbang-core.webp` | ビッグバン爆発中心光 | 76 KB | #211 |
| `bigbang-rays.webp` | ビッグバン放射光 | 36 KB | #211 |
| `bigbang-nebula.webp` | ビッグバン星雲テクスチャ | 36 KB | #211 |
| **新規追加合計** | | **148 KB** | |

**予算: 追加アセット合計 ≤ 1 MB** → 現在 148 KB ✅（余裕 852 KB）

### Hero 背景アセット（#210 以前から存在・参考値）

| ファイル | サイズ |
|---------|--------|
| `hero-cosmic-bg.webp` | 108 KB |
| `hero-cosmic-bg-mobile.webp` | 76 KB |
| `hero-nebula-layer.webp` | 376 KB |
| `hero-particle-band.webp` | 500 KB |
| **Hero WebP 小計** | **1,060 KB** |

Hero 背景アセット予算: ≤ 1,200 KB → 現在 1,060 KB ✅

### Works / Services 画像（参考値）

| ファイル | WebP 変換後 |
|---------|-------------|
| `image_2.png`（元） | — KB |
| `image_4.webp` | 52 KB |
| `image_6.webp` | 24 KB |
| `image_8.webp` | 28 KB |
| `image_10.webp` | 68 KB |

> 画像最適化スクリプト: `npm run optimize:images`（`lib/performance/image-assets.ts` 参照リストを対象）

---

## JavaScript 予算

| ライブラリ | 概算サイズ（gzip） |
|-----------|------------------|
| GSAP（ScrollTrigger 含む） | ~30 KB |
| Lenis | ~8 KB |
| framer-motion | ~20 KB（tree-shaking 後） |
| **アニメーション系小計** | **~58 KB** |

**予算: アニメーション系 JS 追加 ≤ 80 KB（gzip）**

> tree-shaking: `gsap` + `gsap/ScrollTrigger` のみ import（直接 `gsap/all` 不使用）

---

## Web Vitals 目標値

| 指標 | モバイル目標 | デスクトップ目標 | 備考 |
|------|------------|----------------|------|
| **LCP** | ≤ 3.5 s | ≤ 2.5 s | Hero h1 は Server Component で LCP ブロックなし |
| **CLS** | ≤ 0.1 | ≤ 0.1 | SSR 初期 staticReveal=true で layout shift を防止 |
| **INP** | ≤ 200 ms | ≤ 200 ms | GSAP ピン・スクラブは pointer イベントを消費しない |
| **FCP** | ≤ 2.5 s | ≤ 1.8 s | PageLoader は LCP 非ブロック設計 |

> Lighthouse モバイル計測: `npm run build && npx lighthouse http://localhost:3000 --preset=perf`

---

## 計測コマンド

```bash
# ビルド後に Next.js Bundle Analyzer でサイズ確認
ANALYZE=true npm run build

# Vitest によるポリシー監査（ソース読み取りベース）
npx vitest run tests/scroll/mobile-reduced-motion-policy.test.ts

# E2E（モバイル・フォールバック検証）
npm run test:e2e -- e2e/mobile-pages.spec.ts e2e/home.spec.ts
```

---

## 監視ポリシー

- **追加アセット**: WebP 新規追加時は本ドキュメントを更新し合計値を再計算する
- **JS 増分**: 新規ライブラリ追加時は gzip サイズを計測し予算内か確認する
- **Web Vitals 回帰**: PR ごとに Vercel Preview の Core Web Vitals を確認し、LCP/CLS が目標値を超えた場合は merge 前に修正する
