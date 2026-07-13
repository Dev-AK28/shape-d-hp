/**
 * トップページ パーティクルローダーの定数とサンプリングロジック — Issue #412 / #414
 *
 * ロゴ画像（public/loader/logo-particle-source.png）の高輝度ピクセルを
 * 粒子の目標座標としてサンプリングする。描画側（TopParticleLoader）から
 * 分離した純粋ロジックで、vitest で単体テストする。
 */

export const LOADER_LOGO_SRC = '/loader/logo-particle-source.png';

/**
 * 演出タイムライン（5 フェーズ・合計約 10 秒 — Issue #414）。
 * drift: 粒子が散開位置で浮遊 / converge: 波状スタッガーで緩やかに収束 /
 * snap: 一気に加速してロゴへ吸着 / hold: 静止・マウス反発・視差 / fade: フェードアウト。
 */
export const LOADER_TIMELINE_MS = {
  drift: 2500,
  converge: 4000,
  snap: 1500,
  hold: 1200,
  fade: 800,
} as const;

export const LOADER_TOTAL_MS =
  LOADER_TIMELINE_MS.drift +
  LOADER_TIMELINE_MS.converge +
  LOADER_TIMELINE_MS.snap +
  LOADER_TIMELINE_MS.hold +
  LOADER_TIMELINE_MS.fade;

/** 画像ロード遅延等で演出が始まらなくても必ず消えるための保険。 */
export const LOADER_FALLBACK_MS = LOADER_TOTAL_MS + 1000;

/**
 * e2e が page-loader の消滅を待つ上限（e2e/helpers.ts の SSOT）。
 * LOADER_FALLBACK_MS はこの値を必ず下回ること（tests/loader が検証）。
 */
export const LOADER_E2E_TIMEOUT_MS = 12_000;

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

export const SAMPLE_STEP_PX = 2;
export const SAMPLE_LUMINANCE_THRESHOLD = 60;
export const PARTICLE_MAX_COUNT = 6000;

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
      if (luminance >= luminanceThreshold) {
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
