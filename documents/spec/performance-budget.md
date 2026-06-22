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

| ファイル | サイズ | 解像度 |
|---------|--------|--------|
| `hero-cosmic-bg.webp` | 206 KB | 3344×1882 |
| `hero-cosmic-bg-mobile.webp` | 199 KB | 1536×2304 |
| `hero-nebula-layer.webp` | 134 KB | 1024×1536 |
| `hero-particle-band.webp` | 471 KB | 1672×941 |
| **Hero WebP 小計** | **1,010 KB** | |

Hero 背景アセット予算: ≤ 1,200 KB → 現在 1,010 KB ✅

> `hero-cosmic-bg` / `hero-cosmic-bg-mobile` / `hero-particle-band` / `hero-nebula-layer` はビッグバン演出に合わせた白銀（モノクロ）トーンへ再生成（#224）。粒子帯は純黒背景で生成し輝度→アルファ変換で透過 WebP 化（`object-contain` でブレンド指定がないため透過必須）。ネビュラ層は `mix-blend-mode: screen` のため暗部を純黒に締めて（linear black-point）軽量な不透明 WebP 化。あわせて CSS グレードを暖色→クール宇宙トーンへ変更（`cosmicGrade`、#227 でリネーム済み）。
>
> **Hi-DPI シャープネス（#224）**: `CosmicScene` は `next/image fill` + `sizes="100vw"` + GSAP 深度スケールでフルブリード描画されるため、旧 1672×941 では 1440 ビューポート@2x（約 2880px 必要）に対し解像度不足で甘くなっていた。`next/image` は intrinsic 幅を超えてアップスケールしないため、ソースを Lanczos3 + 軽量シャープで desktop 3344×1882（2×）・mobile 1536×2304（1.5×）へ引き上げ、最大 deviceSize（3840）要求時にも近接ピクセルで配信できるようにした（白銀トーンは維持）。

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
