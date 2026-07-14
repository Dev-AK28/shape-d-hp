import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  CONVERGE_PROGRESS_SHARE,
  getLoaderTimeScale,
  LOADER_E2E_TIMEOUT_MS,
  LOADER_FADE_START_MS,
  LOADER_FALLBACK_MS,
  LOADER_FAST_TIME_SCALE,
  LOADER_HANDOFF_END_MS,
  LOADER_SNAP_END_MS,
  LOADER_TIMELINE_MS,
  LOADER_TOTAL_MS,
  LOGO_DISPLAY_WIDTH_CSS,
  LOGO_DISPLAY_WIDTH_MAX_PX,
  LOGO_DISPLAY_WIDTH_RATIO,
  LOGO_GHOST_OPACITY,
  PARTICLE_STAGGER_MS,
  sampleLogoParticles,
  type ImageDataLike,
} from '@/lib/loader/particle-logo';

/** 全ピクセル黒の画像に、指定座標だけ RGB(A) を置いた ImageData 互換オブジェクトを作る。 */
function makeImage(
  width: number,
  height: number,
  pixels: Array<{ x: number; y: number; rgb: [number, number, number]; alpha?: number }>,
): ImageDataLike {
  const data = new Uint8ClampedArray(width * height * 4);
  for (const { x, y, rgb, alpha = 255 } of pixels) {
    const i = (y * width + x) * 4;
    [data[i], data[i + 1], data[i + 2], data[i + 3]] = [...rgb, alpha];
  }
  return { data, width, height };
}

describe('sampleLogoParticles', () => {
  it('輝度閾値を超えるピクセルだけを粒子にする', () => {
    const image = makeImage(8, 8, [
      { x: 0, y: 0, rgb: [200, 200, 200] }, // シルバー → 採用
      { x: 2, y: 0, rgb: [30, 30, 30] }, // 暗部（背景）→ 除外
      { x: 4, y: 2, rgb: [255, 255, 255] }, // 白 → 採用
    ]);
    const { count } = sampleLogoParticles(image, { step: 2 });
    expect(count).toBe(2);
  });

  it('目標座標は画像中心を原点とし y は上向きに変換される', () => {
    // 8x8 の左上 (0,0) → 中心原点では (-4, +4)
    const image = makeImage(8, 8, [{ x: 0, y: 0, rgb: [255, 255, 255] }]);
    const { targets } = sampleLogoParticles(image, { step: 2 });
    expect(targets[0]).toBe(-4);
    expect(targets[1]).toBe(4);
    expect(targets[2]).toBe(0);
  });

  it('粒子色はピクセルの RGB を 0-1 に正規化してそのまま写す（シルバー再現）', () => {
    const image = makeImage(4, 4, [{ x: 0, y: 0, rgb: [204, 208, 216] }]);
    const { colors } = sampleLogoParticles(image, { step: 2 });
    expect(colors[0]).toBeCloseTo(204 / 255);
    expect(colors[1]).toBeCloseTo(208 / 255);
    expect(colors[2]).toBeCloseTo(216 / 255);
  });

  it('step 間隔で走査する（間の行・列は見ない）', () => {
    // (1,1) は step=2 の格子に乗らないので拾われない
    const image = makeImage(4, 4, [{ x: 1, y: 1, rgb: [255, 255, 255] }]);
    const { count } = sampleLogoParticles(image, { step: 2 });
    expect(count).toBe(0);
  });

  it('maxCount を超える場合は等間隔に間引かれる', () => {
    const pixels = [];
    for (let y = 0; y < 20; y += 1) {
      for (let x = 0; x < 20; x += 1) {
        pixels.push({ x, y, rgb: [255, 255, 255] as [number, number, number] });
      }
    }
    const image = makeImage(20, 20, pixels);
    const { count, targets } = sampleLogoParticles(image, { step: 1, maxCount: 100 });
    expect(count).toBeLessThanOrEqual(100);
    expect(count).toBeGreaterThan(90); // 間引き後も maxCount 近くまで使う
    expect(targets).toHaveLength(count * 3);
  });

  it('透過ピクセル（alpha < 128）は高輝度でも除外する', () => {
    const image = makeImage(4, 4, [
      { x: 0, y: 0, rgb: [255, 255, 255], alpha: 0 }, // 透過 → 除外
      { x: 2, y: 0, rgb: [255, 255, 255], alpha: 127 }, // 半透過 → 除外
      { x: 0, y: 2, rgb: [255, 255, 255], alpha: 128 }, // 閾値ちょうど → 採用
    ]);
    const { count } = sampleLogoParticles(image, { step: 2 });
    expect(count).toBe(1);
  });

  it('高輝度ピクセルがなければ count 0 を返す', () => {
    const image = makeImage(4, 4, []);
    const result = sampleLogoParticles(image, { step: 1 });
    expect(result.count).toBe(0);
    expect(result.targets).toHaveLength(0);
  });
});

describe('LOADER_TIMELINE', () => {
  it('6 フェーズの合計が約 10 秒（#414 の尺 / #418 で handoff 追加）になる', () => {
    expect(LOADER_TOTAL_MS).toBe(
      LOADER_TIMELINE_MS.drift +
        LOADER_TIMELINE_MS.converge +
        LOADER_TIMELINE_MS.snap +
        LOADER_TIMELINE_MS.handoff +
        LOADER_TIMELINE_MS.hold +
        LOADER_TIMELINE_MS.fade,
    );
    expect(LOADER_TOTAL_MS).toBe(10_000);
  });

  it('フェーズの節目（snap 終了 → handoff 終了 → fade 開始）が順に並ぶ', () => {
    // 粒子（uHandoff）と実ロゴ <img>（framer）は同じ節目を共有する必要がある
    expect(LOADER_SNAP_END_MS).toBeLessThan(LOADER_HANDOFF_END_MS);
    expect(LOADER_HANDOFF_END_MS).toBeLessThanOrEqual(LOADER_FADE_START_MS);
    expect(LOADER_FADE_START_MS + LOADER_TIMELINE_MS.fade).toBe(LOADER_TOTAL_MS);
  });

  it('実ロゴのゴースト不透明度は 0 より大きい（早期 contentful paint の担保・#418）', () => {
    // 0 にすると Chromium が paint 対象外にし、FCP/LCP が演出終了まで遅れる
    expect(LOGO_GHOST_OPACITY).toBeGreaterThan(0);
    expect(LOGO_GHOST_OPACITY).toBeLessThan(1);
  });

  it('実ロゴ <img> の CSS 幅が粒子スケールと同じ 3 条件のクランプになっている', () => {
    // ズレると handoff で粒子と実ロゴの位置が食い違う
    expect(LOGO_DISPLAY_WIDTH_CSS).toContain(`${LOGO_DISPLAY_WIDTH_RATIO * 100}vw`);
    expect(LOGO_DISPLAY_WIDTH_CSS).toContain(`${LOGO_DISPLAY_WIDTH_MAX_PX}px`);
    expect(LOGO_DISPLAY_WIDTH_CSS).toContain('vh');
  });

  it('フォールバックが e2e の待機上限（SSOT）に収まる', () => {
    // e2e/helpers.ts が LOADER_E2E_TIMEOUT_MS を import して page-loader の消滅を待つ
    expect(LOADER_FALLBACK_MS).toBeGreaterThan(LOADER_TOTAL_MS);
    expect(LOADER_FALLBACK_MS).toBeLessThan(LOADER_E2E_TIMEOUT_MS);
  });

  it('スタッガーは converge フェーズ内に収まり、進捗配分は 0-1 の間にある', () => {
    expect(PARTICLE_STAGGER_MS).toBeLessThan(LOADER_TIMELINE_MS.converge);
    expect(CONVERGE_PROGRESS_SHARE).toBeGreaterThan(0);
    expect(CONVERGE_PROGRESS_SHARE).toBeLessThan(1);
  });

  it('進捗配分はシェーダへの埋め込み（toFixed(4)）で情報が落ちない', () => {
    // シェーダは share のみ埋め込み補数を GLSL 側で計算するが、埋め込み時の
    // 丸めで share 自体が変わると converge/snap の配分が仕様とずれるため固定する
    expect(Number(CONVERGE_PROGRESS_SHARE.toFixed(4))).toBe(CONVERGE_PROGRESS_SHARE);
  });
});

describe('getLoaderTimeScale', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('window がない（SSR）とき等倍を返す', () => {
    expect(getLoaderTimeScale()).toBe(1);
  });

  it('e2e フラグが設定されていればその倍率を返す', () => {
    vi.stubGlobal('window', { __SHAPE_D_LOADER_TIME_SCALE__: LOADER_FAST_TIME_SCALE });
    expect(getLoaderTimeScale()).toBe(LOADER_FAST_TIME_SCALE);
  });

  it('不正値（0 以下・1 超・非数）は等倍にフォールバックする', () => {
    for (const bad of [0, -1, 1.5, Number.NaN, 'fast']) {
      vi.stubGlobal('window', { __SHAPE_D_LOADER_TIME_SCALE__: bad });
      expect(getLoaderTimeScale()).toBe(1);
    }
  });
});
