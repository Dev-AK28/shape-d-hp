# トップページ パーティクルローダー

Issue: #412 / #414

## 概要

トップページ（`/`）表示時に毎回、散らばった粒子が 5 フェーズ・**合計約 10 秒**（Issue #414 で 2.7 秒から延長）でブランドロゴ（SHAPE∞D）を**板厚付きの立体**として形成し、静止（マウス反発 + 視差）を経てフェードアウトするローディング演出。参照実装は [Interactive particles text create with three.js（CodePen / sanprieto）](https://codepen.io/sanprieto/pen/XWNjBdb)。

**#312「トップはローダーなし」の決定を本 Issue で変更**（2026-07-13 確定）。下層ページの `PageLoader` / `SubPageEffects` は従来どおりで、本演出はトップ専用コンポーネントとして分離する。

## 決定事項（2026-07-13）

| 項目 | 決定 |
|------|------|
| 描画技術 | three.js + カスタム GLSL シェーダ（`THREE.Points` + `BufferGeometry` 属性） |
| 表示対象 | トップページで毎回（下層は現行テキストローダー維持） |
| マウス反発 | ロゴ完成後のみ有効（hold 中） |
| 粒子色 | ロゴのシルバーを再現（元画像のピクセル RGB をそのまま粒子色に写す）+ 深度シェーディング |
| 立体感（#414） | ロゴに z 方向の板厚（±22px）を持たせ、PerspectiveCamera + 深度陰影 + hold 中のマウス視差で立体を見せる |
| 尺（#414） | 5 フェーズ合成の抑揚付きで合計 10 秒（下表） |

## 実装

- **コンポーネント**: `components/top/TopParticleLoader.tsx`（three.js 描画本体）
- **遅延ロード**: `components/top/DeferredTopParticleLoader.tsx` — `next/dynamic` + `ssr: false`。three.js を含むチャンクはトップページ表示時のみロードされる（#402 バンドル配慮）
- **組み込み**: `app/page.tsx`（`TopShell` 直下）
- **サンプリングロジック**: `lib/loader/particle-logo.ts` — タイムライン定数と `sampleLogoParticles()`（純粋関数・vitest 対象）
- **粒子の目標座標**: サンプリング用ロゴ画像の輝度 60 以上のピクセルを step 2px で走査し、最大 6,000 粒子に等間隔で間引く。座標は画像中心原点・y 上向きに変換し、表示幅 `min(vw × 0.78, 520px)` にスケール
- **ロゴアセット**: `public/loader/logo-particle-source.png`（360×286・約 29KB）。`public/image_2.png` から `node scripts/generate-loader-logo.mjs` で生成（中央領域の輝度バウンディングボックスを切り出し。右下の装飾✦は走査範囲外として除外）
- **シェーダ**: 収束進捗は converge（easeInOutSine・粒子ごと 0〜1200ms のスタッガー）が 55% まで、snap（easeOutQuart）が残り 45% を受け持つ 2 段合成。drift 中は出発位置の周囲を漂い（振幅 26px、収束に応じ減衰）、完成後は微小ゆらぎになる。目標座標は z=±22px の板厚を持ち、手前ほど明るい深度シェーディング（0.72〜1.0）。マウス反発は `uInteract`（snap 完了後 300ms で 0→1）× `1 - smoothstep(0, 110, dist)` で最大 46px の変位（GLSL の smoothstep は edge0 < edge1 のみ定義 — PR #413 レビュー対応）。フラグメントは `gl_PointCoord` による円形ソフトドット + 加算ブレンド
- **カメラ / 視差**: PerspectiveCamera（fov 35°）を z=0 平面で 1 world unit = 1 CSS px となる距離に配置。hold 中はマウス NDC に応じて点群を最大 ±0.12rad 傾け、板厚を視差で見せる
- **WebGL 判定**: `lib/webgl/support.ts` の `detectWebGLSupport()` を再利用。非対応時は描画しない

## タイムライン（`lib/loader/particle-logo.ts` が SSOT）

| フェーズ | 長さ | 内容 |
|---------|------|------|
| drift | 2500ms | 粒子が散開位置で浮遊（まだ収束しない） |
| converge | 4000ms | 波状スタッガーで緩やかに収束（進捗 55% まで） |
| snap | 1500ms | 一気に加速してロゴへ吸着（残り 45%） |
| hold | 1200ms | ロゴ静止・微小ゆらぎ・マウス反発 + 視差 |
| fade | 800ms | オーバーレイ全体をフェードアウトし unmount |

- 合計 10000ms + フォールバックタイマー 1000ms = 11000ms < **`LOADER_E2E_TIMEOUT_MS`（12000ms・SSOT）**（e2e が `data-testid="page-loader"` の消滅を待つ上限。`e2e/helpers.ts` の `expectPageLoaderGone()` が参照）
- タイムライン変更時はこの予算を超えないこと（`tests/loader/particle-logo.test.ts` が検証）

## e2e の時間予算対策（Issue #414）

- 一括実行では `e2e/fixtures.ts` が initScript で `window.__SHAPE_D_LOADER_TIME_SCALE__ = 0.15` を注入し、演出を約 1.5 秒に短縮する（CI 時間の爆発を防ぐ）。**各スペックは `'@playwright/test'` ではなく `./fixtures` から test / expect を import すること**
- 等倍（実時間 10 秒）の検証は `e2e/top-loader.spec.ts` のみが `'@playwright/test'` を直接 import して行う
- このフラグは e2e 専用で、実ユーザーでは常に等倍（`getLoaderTimeScale()` が不正値を弾く）

## Lighthouse Performance 予算との両立（Issue #414 実測）

CI は Performance ≥ 0.9 を強制する（#326）。10 秒演出との両立のため以下の構成に確定:

- **オーバーレイ背景は半透明スクリム `rgba(7, 9, 13, 0.6)` 固定**。不透明にするとページ本体のペイントが演出終了まで計上されず FCP 9.4s / LCP 12.5s / Performance 55 まで低下する（実測）
- 「snap 以降だけ背景を濃くする」二段構成も試したが、Lighthouse のシミュレーション（lantern）が FCP/SI を演出終了側へ倒し 54 点に低下したため**禁止**
- 粒子のフェードインは **250ms** に保つ。長くすると初回描画が「ほぼ透明」になり FCP 計上が約 +0.9s 遅れる（900ms で実測）
- ローカル計測の目安: `node scripts/lighthouse-check.mjs http://127.0.0.1:<port>/` — 本構成で 84（親 #413 と同点。CI 環境はローカルより約 6 点高く出る）
- 副作用: スクリムのためロゴ形成時に背後のヒーロー文字が薄く透ける（演出とヒーローの重なりは既知のトレードオフ — 質問リスト参照）

## アクセシビリティ / フォールバック

- `prefers-reduced-motion` 有効時はローダー自体を描画しない（下層 PageLoader と同方針）
- WebGL 非対応・画像ロード失敗・粒子 0 件時は即座に非表示
- オーバーレイは `pointer-events-none` + `aria-hidden`。表示中も背後の操作をブロックしない

## 受け入れ基準（Given-When-Then）

- **Given** 通常のブラウザ（reduced-motion なし・WebGL あり）でトップページを開く
- **When** ページがロードされる
- **Then** 粒子が drift → converge → snap の抑揚で集まり板厚付きのロゴを形成し、約 10 秒でローダーが消える。演出中も背後の操作はブロックされない

- **Given** ロゴ完成後（hold 中）にマウスを動かす
- **When** カーソルがロゴ付近を通る
- **Then** 近傍の粒子が押しのけられ、点群がマウス方向へわずかに傾いて板厚が見える

- **Given** `prefers-reduced-motion: reduce` の環境でトップページを開く
- **When** ページがロードされる
- **Then** ローダーは描画されない

- **Given** トップページでローダー表示中
- **When** `LOADER_E2E_TIMEOUT_MS`（12000ms）経過する
- **Then** いかなる場合も `data-testid="page-loader"` は存在しない（e2e 予算）

- **Given** 下層ページ（/services 等）を開く
- **When** ページがロードされる
- **Then** 従来の `PageLoader`（読み込み中テキスト）が表示され、パーティクル演出は出ない
