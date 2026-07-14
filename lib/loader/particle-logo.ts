/**
 * トップページ パーティクルローダーの定数とサンプリングロジック — Issue #412 / #414
 *
 * ロゴ画像（public/loader/logo-particle-source.png）の高輝度ピクセルを
 * 粒子の目標座標としてサンプリングする。描画側（TopParticleLoader）から
 * 分離した純粋ロジックで、vitest で単体テストする。
 */

/** 粒子サンプリング元（不透過・ダーク地）。 */
export const LOADER_LOGO_SRC = '/loader/logo-particle-source.png';

/**
 * handoff で立ち上げる表示用ロゴ（背景透過・Issue #418）。
 * サンプリング元と同一クロップ・同一寸法なので、粒子と位置がズレない。
 * 元画像はダークなテクスチャ背景を持つため、そのまま重ねると矩形の枠として見えてしまう
 * — `scripts/generate-loader-logo.mjs` が輝度からアルファを起こして透過版を生成する。
 */
export const LOADER_LOGO_REVEAL_SRC = '/loader/logo-reveal.png';

/**
 * 演出タイムライン（6 フェーズ・合計約 10 秒 — Issue #414 / #418）。
 * drift: 粒子が散開位置で浮遊 / converge: 波状スタッガーで緩やかに収束 /
 * snap: 一気に加速してロゴへ吸着 / handoff: 粒子が薄れ実ロゴが立ち上がる（#418）/
 * hold: 実ロゴを見せる / fade: フェードアウト。
 */
export const LOADER_TIMELINE_MS = {
  drift: 2500,
  converge: 4000,
  snap: 1500,
  handoff: 1000,
  hold: 300,
  fade: 700,
} as const;

export const LOADER_TOTAL_MS =
  LOADER_TIMELINE_MS.drift +
  LOADER_TIMELINE_MS.converge +
  LOADER_TIMELINE_MS.snap +
  LOADER_TIMELINE_MS.handoff +
  LOADER_TIMELINE_MS.hold +
  LOADER_TIMELINE_MS.fade;

/** 粒子が吸着し終わる時刻（= handoff の開始時刻）。 */
export const LOADER_SNAP_END_MS =
  LOADER_TIMELINE_MS.drift + LOADER_TIMELINE_MS.converge + LOADER_TIMELINE_MS.snap;

/** 実ロゴが完全表示になる時刻（= hold の開始時刻）。 */
export const LOADER_HANDOFF_END_MS = LOADER_SNAP_END_MS + LOADER_TIMELINE_MS.handoff;

/** オーバーレイのフェードが始まる時刻。 */
export const LOADER_FADE_START_MS = LOADER_HANDOFF_END_MS + LOADER_TIMELINE_MS.hold;

/**
 * 実ロゴ画像の初期不透明度（#418 → #420 で 0 に変更）。
 *
 * **0 = 演出開始時はロゴを一切見せない**。粒子が集まって handoff に入ったとき初めて
 * ロゴが浮かび上がる（2026-07-14 のオーナー判断: 視覚的に理想な演出を優先）。
 *
 * ⚠️ トレードオフ: 不透明オーバーレイ + 不可視ロゴでは、Lighthouse が計上できる
 * contentful paint が演出終了まで存在しない（WebGL キャンバスは FCP/LCP の候補要素に
 * ならない）。そのためトップページの FCP/LCP は演出の尺そのもの（約 10 秒）になり、
 * Performance は 55 前後に落ちる。**これはユーザーが実際に体験する時間と一致する正しい
 * 計測値**であり、小手先の対策で誤魔化さない。CI の Performance ゲートは
 * `.github/workflows/ci.yml` でトップを対象外とし、下層ページで担保する。
 */
export const LOGO_GHOST_OPACITY = 0;

/** 画像ロード遅延等で演出が始まらなくても必ず消えるための保険。 */
export const LOADER_FALLBACK_MS = LOADER_TOTAL_MS + 1000;

/**
 * e2e が page-loader の消滅を待つ上限（e2e/helpers.ts の SSOT）。
 * LOADER_FALLBACK_MS はこの値を必ず下回ること（tests/loader が検証）。
 */
export const LOADER_E2E_TIMEOUT_MS = 12_000;

/**
 * e2e がローダーの「出現」を待つ上限（e2e/helpers.ts の SSOT）。
 * #418 以降オーバーレイは SSR されるため初期 HTML に存在するが、下層ページの
 * PageLoader は依然 ssr:false であり、そちらのマウント待ちに余裕を持たせる。
 */
export const LOADER_E2E_ATTACH_TIMEOUT_MS = 3_000;

/**
 * e2e 一括実行用のタイムスケール（e2e/fixtures.ts が initScript で注入）。
 * 実時間の 10 秒演出は e2e/top-loader.spec.ts のみが等倍で検証する。
 */
export const LOADER_FAST_TIME_SCALE = 0.15;

declare global {
  interface Window {
    /** e2e 専用: 演出全体の時間倍率（0 < scale ≤ 1）。未設定なら等倍。 */
    __SHAPE_D_LOADER_TIME_SCALE__?: number;
  }
}

/** e2e の高速化フラグを読む。実ユーザーでは常に 1（等倍）。 */
export function getLoaderTimeScale(): number {
  if (typeof window === 'undefined') {
    return 1;
  }
  const scale = window.__SHAPE_D_LOADER_TIME_SCALE__;
  return typeof scale === 'number' && scale > 0 && scale <= 1 ? scale : 1;
}

/** converge フェーズ内で粒子の出発が出揃うまでのばらつき幅。 */
export const PARTICLE_STAGGER_MS = 1200;

/** 収束進捗のうち converge フェーズが受け持つ割合（残りを snap が一気に詰める）。 */
export const CONVERGE_PROGRESS_SHARE = 0.55;

/** ロゴの板厚（z 方向、CSS px）— Issue #414 立体感。目標座標は ±この半分に散らす。 */
export const LOGO_DEPTH_PX = 44;

/** drift 中に粒子が漂う振幅（CSS px）。収束が進むほど減衰する。 */
export const DRIFT_AMPLITUDE_PX = 26;

/** ロゴの表示幅（CSS px）。ビューポート幅の 78% と 520px の小さい方。 */
export const LOGO_DISPLAY_WIDTH_RATIO = 0.78;
export const LOGO_DISPLAY_WIDTH_MAX_PX = 520;
/**
 * ロゴの表示高さの上限（ビューポート高さ比）。幅だけでスケールすると
 * スマホ横持ち（844x390 等）でロゴが上下クリップするため高さ側でもクランプする。
 */
export const LOGO_DISPLAY_HEIGHT_RATIO = 0.7;

/** サンプリング元 = 実ロゴ画像の原寸（public/loader/logo-particle-source.png）。 */
export const LOGO_SOURCE_WIDTH_PX = 360;
export const LOGO_SOURCE_HEIGHT_PX = 286;

/**
 * 実ロゴ <img> の CSS 幅。粒子側のスケール計算（TopParticleLoader）と同じ式を
 * CSS で表現したもの — 一致していないと粒子から実ロゴへの切り替えで位置がズレる。
 */
export const LOGO_DISPLAY_WIDTH_CSS = `min(${LOGO_DISPLAY_WIDTH_RATIO * 100}vw, ${LOGO_DISPLAY_WIDTH_MAX_PX}px, ${(
  LOGO_DISPLAY_HEIGHT_RATIO *
  100 *
  (LOGO_SOURCE_WIDTH_PX / LOGO_SOURCE_HEIGHT_PX)
).toFixed(2)}vh)`;

/**
 * サンプリングの走査間隔。#420 で 2px → 1px。
 * 2px では拾える候補が 3,106 個しかなく上限（6,000）に届いていなかった（実測）。
 * 1px にすると 12,555 個の候補が得られ、上限 12,000 まで使い切れる。
 */
export const SAMPLE_STEP_PX = 1;
export const SAMPLE_LUMINANCE_THRESHOLD = 60;
/** 粒子数の上限。#420 で 6,000 → 12,000（密度を上げてロゴの線をはっきり出す）。 */
export const PARTICLE_MAX_COUNT = 12_000;

/** getImageData 互換の入力（テストでは素の配列で偽装できる）。 */
export type ImageDataLike = {
  data: Uint8ClampedArray | number[];
  width: number;
  height: number;
};

export type LogoParticles = {
  /** 画像中心を原点・y 上向きのピクセル座標 [x, y, z=0] × count */
  targets: Float32Array;
  /** 0-1 正規化 RGB × count（ロゴのシルバーをそのまま写す） */
  colors: Float32Array;
  count: number;
};

/**
 * 高輝度ピクセルを粒子の目標座標と色に変換する。
 * step 間隔で走査し、maxCount を超える場合は等間隔に間引く。
 * 透過ピクセル（alpha < 128）は輝度が高くても除外する — 透過 PNG を
 * 誤って与えたときに不可視ピクセルを粒子化しないための保険。
 */
export function sampleLogoParticles(
  image: ImageDataLike,
  {
    step = SAMPLE_STEP_PX,
    luminanceThreshold = SAMPLE_LUMINANCE_THRESHOLD,
    maxCount = PARTICLE_MAX_COUNT,
  } = {},
): LogoParticles {
  const { data, width, height } = image;
  const picked: number[] = [];
  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      const i = (y * width + x) * 4;
      const luminance = 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
      if (luminance >= luminanceThreshold && data[i + 3] >= 128) {
        picked.push(i);
      }
    }
  }

  const stride = Math.max(1, Math.ceil(picked.length / maxCount));
  const count = Math.ceil(picked.length / stride);
  const targets = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  for (let n = 0; n < count; n += 1) {
    const i = picked[n * stride];
    const pixel = i / 4;
    const x = pixel % width;
    const y = (pixel - x) / width;
    targets[n * 3] = x - width / 2;
    targets[n * 3 + 1] = height / 2 - y;
    targets[n * 3 + 2] = 0;
    colors[n * 3] = data[i] / 255;
    colors[n * 3 + 1] = data[i + 1] / 255;
    colors[n * 3 + 2] = data[i + 2] / 255;
  }
  return { targets, colors, count };
}
