/**
 * トップページ パーティクルローダーの定数とサンプリングロジック — Issue #412
 *
 * ロゴ画像（public/loader/logo-particle-source.png）の高輝度ピクセルを
 * 粒子の目標座標としてサンプリングする。描画側（TopParticleLoader）から
 * 分離した純粋ロジックで、vitest で単体テストする。
 */

export const LOADER_LOGO_SRC = '/loader/logo-particle-source.png';

/** 演出タイムライン。e2e が page-loader の消滅を 5000ms 以内で待つため合計をその半分強に抑える。 */
export const LOADER_TIMELINE_MS = {
  /** 粒子が散開位置からロゴへ収束するまで（スタッガー込み） */
  gather: 1250,
  /** ロゴ完成後の静止時間。この間だけマウス反発が有効（2026-07-13 確定） */
  hold: 1000,
  /** オーバーレイ全体のフェードアウト */
  fade: 450,
} as const;

export const LOADER_TOTAL_MS =
  LOADER_TIMELINE_MS.gather + LOADER_TIMELINE_MS.hold + LOADER_TIMELINE_MS.fade;

/** 画像ロード遅延等で演出が始まらなくても必ず消えるための保険。 */
export const LOADER_FALLBACK_MS = LOADER_TOTAL_MS + 900;

/** 粒子の出発が出揃うまでのばらつき幅。gather からこれを引いた分が個々の移動時間。 */
export const PARTICLE_STAGGER_MS = 350;
export const PARTICLE_TRAVEL_MS = LOADER_TIMELINE_MS.gather - PARTICLE_STAGGER_MS;

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
