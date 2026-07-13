# トップページ パーティクルローダー

Issue: #412

## 概要

トップページ（`/`）表示時に毎回、散らばった粒子が集まってブランドロゴ（SHAPE∞D）を形成し、約 1 秒の静止を経てフェードアウトするローディング演出。参照実装は [Interactive particles text create with three.js（CodePen / sanprieto）](https://codepen.io/sanprieto/pen/XWNjBdb)。

**#312「トップはローダーなし」の決定を本 Issue で変更**（2026-07-13 確定）。下層ページの `PageLoader` / `SubPageEffects` は従来どおりで、本演出はトップ専用コンポーネントとして分離する。

## 決定事項（2026-07-13）

| 項目 | 決定 |
|------|------|
| 描画技術 | three.js + カスタム GLSL シェーダ（`THREE.Points` + `BufferGeometry` 属性） |
| 表示対象 | トップページで毎回（下層は現行テキストローダー維持） |
| マウス反発 | ロゴ完成後のみ有効（静止 約 1 秒の間） |
| 粒子色 | ロゴのシルバーを再現（元画像のピクセル RGB をそのまま粒子色に写す） |

## 実装

- **コンポーネント**: `components/top/TopParticleLoader.tsx`（three.js 描画本体）
- **遅延ロード**: `components/top/DeferredTopParticleLoader.tsx` — `next/dynamic` + `ssr: false`。three.js を含むチャンクはトップページ表示時のみロードされる（#402 バンドル配慮）
- **組み込み**: `app/page.tsx`（`TopShell` 直下）
- **サンプリングロジック**: `lib/loader/particle-logo.ts` — タイムライン定数と `sampleLogoParticles()`（純粋関数・vitest 対象）
- **粒子の目標座標**: サンプリング用ロゴ画像の輝度 60 以上のピクセルを step 2px で走査し、最大 6,000 粒子に等間隔で間引く。座標は画像中心原点・y 上向きに変換し、表示幅 `min(vw × 0.78, 520px)` にスケール
- **ロゴアセット**: `public/loader/logo-particle-source.png`（360×286・約 29KB）。`public/image_2.png` から `node scripts/generate-loader-logo.mjs` で生成（中央領域の輝度バウンディングボックスを切り出し。右下の装飾✦は走査範囲外として除外）
- **シェーダ**: 頂点シェーダで散開位置→目標位置を easeOutCubic 補間（粒子ごとに 0〜350ms のスタッガー）。収束後は微小なゆらぎを継続。マウス反発は `uInteract`（gather 完了後 250ms で 0→1）× 距離 smoothstep で半径 110px / 最大 46px の変位。フラグメントは `gl_PointCoord` による円形ソフトドット + 加算ブレンド
- **WebGL 判定**: `lib/webgl/support.ts` の `detectWebGLSupport()` を再利用。非対応時は描画しない

## タイムライン（`lib/loader/particle-logo.ts` が SSOT）

| フェーズ | 長さ | 内容 |
|---------|------|------|
| gather | 1250ms | 粒子収束（スタッガー 350ms + 移動 900ms） |
| hold | 1000ms | ロゴ静止・微小ゆらぎ・マウス反発有効 |
| fade | 450ms | オーバーレイ全体をフェードアウトし unmount |

- 合計 2700ms + フォールバックタイマー 900ms = 3600ms < **5000ms**（e2e が `data-testid="page-loader"` の消滅を待つ上限。`e2e/helpers.ts` ほか）
- タイムライン変更時はこの予算を超えないこと（`tests/loader/particle-logo.test.ts` が検証）

## アクセシビリティ / フォールバック

- `prefers-reduced-motion` 有効時はローダー自体を描画しない（下層 PageLoader と同方針）
- WebGL 非対応・画像ロード失敗・粒子 0 件時は即座に非表示
- オーバーレイは `pointer-events-none` + `aria-hidden`。表示中も背後の操作をブロックしない

## 受け入れ基準（Given-When-Then）

- **Given** 通常のブラウザ（reduced-motion なし・WebGL あり）でトップページを開く
- **When** ページがロードされる
- **Then** 粒子が集まってロゴを形成し、約 2.7 秒以内にローダーが消えてページが操作可能になる

- **Given** `prefers-reduced-motion: reduce` の環境でトップページを開く
- **When** ページがロードされる
- **Then** ローダーは描画されない

- **Given** トップページでローダー表示中
- **When** 5000ms 経過する
- **Then** いかなる場合も `data-testid="page-loader"` は存在しない（e2e 予算）

- **Given** 下層ページ（/services 等）を開く
- **When** ページがロードされる
- **Then** 従来の `PageLoader`（読み込み中テキスト）が表示され、パーティクル演出は出ない
