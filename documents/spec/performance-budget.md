# パフォーマンス予算

Issue: #214 / Part of #210

## 目的

#210 シリーズ（スクロール演出強化）の追加アセット・JS増分・Web Vitals への影響を定量化し、
回帰の早期検出と意思決定の基準とする。

---

## アセット予算

### 旧イマーシブ Hero アセット（撤去済み）

> **撤去済み（#302 / #312 / #316）**: #210 シリーズで追加したビッグバン光テクスチャ（`bigbang-core/rays/nebula.webp`、計 148 KB）と旧 Hero 背景アセット（`hero-cosmic-bg*.webp` / `hero-nebula-layer.webp` / `hero-particle-band.webp`、計約 1,010 KB）は、トップページ刷新（#302）と `CosmicScene` / `LogoParticleFormation` の撤去に伴い削除しました（合計約 1.2MB 減）。現行トップは追加画像アセットを持たず、雨演出は `RainCanvas`（Canvas2D・画像なし）で描画します。

### Works / Services 画像（参考値）

| ファイル | WebP 変換後 | 備考 |
|---------|-------------|------|
| `image_4.webp` | 52 KB | ✅ 変換済 |
| `image_6.webp` | 24 KB | ✅ 変換済 |
| `image_8.webp` | 28 KB | ✅ 変換済 |
| `image_10.webp` | 68 KB | ✅ 変換済 |
| `image_2.png` | 1,500 KB（PNG のまま） | ⚠️ 未変換 |
| `image_13.png` | 1,500 KB（PNG のまま） | ⚠️ 未変換 |

> 未変換 PNG 2ファイルは `npm run optimize:images` で WebP 化すること（`lib/performance/image-assets.ts` 参照リストを更新してから実行）。

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

**⚠️ 目標値の対象は下層ページ（`/services` 等）です。トップ（`/`）は対象外**（#420）— 10 秒のパーティクルローダーが不透明オーバーレイでページを覆うため、**FCP/LCP は演出の尺そのもの（約 10 秒）になります**。これはユーザーが実際に体験する時間と一致する正しい計測値であり、意図的なトレードオフです（根拠と禁止事項: [top-particle-loader.md](./top-particle-loader.md)）。

| 指標 | モバイル目標 | デスクトップ目標 | 備考 |
|------|------------|----------------|------|
| **LCP** | ≤ 3.5 s | ≤ 2.5 s | Hero h1 は Server Component で LCP ブロックなし |
| **CLS** | ≤ 0.1 | ≤ 0.1 | SSR 初期 staticReveal=true で layout shift を防止 |
| **INP** | ≤ 200 ms | ≤ 200 ms | GSAP ピン・スクラブは pointer イベントを消費しない |
| **FCP** | ≤ 2.5 s | ≤ 1.8 s | PageLoader は LCP 非ブロック設計 |

> Lighthouse モバイル計測（**計測先は下層ページ**）: `npm run build && npm run lighthouse:check`
> （`scripts/lighthouse-check.mjs` の既定 URL が `/services`。トップを測ると演出の尺のせいで必ず閾値を割ります）

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
