import { readFileSync } from 'node:fs';
import sharp from 'sharp';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  CONVERGE_PROGRESS_SHARE,
  getLoaderTimeScale,
  LOADER_CSS_FAILSAFE_MS,
  LOADER_E2E_TIMEOUT_MS,
  LOADER_FADE_START_MS,
  LOADER_FALLBACK_MS,
  LOADER_FAST_TIME_SCALE,
  LOADER_HANDOFF_END_MS,
  LOADER_SNAP_END_MS,
  LOADER_TIMELINE_MS,
  LOADER_TOTAL_MS,
  LOGO_DISPLAY_HEIGHT_RATIO,
  LOGO_DISPLAY_WIDTH_CSS,
  LOGO_DISPLAY_WIDTH_MAX_PX,
  LOGO_DISPLAY_WIDTH_RATIO,
  LOGO_GHOST_OPACITY,
  LOGO_SOURCE_HEIGHT_PX,
  LOGO_SOURCE_WIDTH_PX,
  PARTICLE_MAX_COUNT,
  PARTICLE_STAGGER_MS,
  SAMPLE_STEP_PX,
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

  it('候補が maxCount をわずかに超えても maxCount 個ちょうど使う（間引きの崖ガード・#419）', () => {
    // 整数 stride（Math.ceil）だと候補が上限を 1 個超えた瞬間に stride=2 へ切り上がり、
    // 粒子数が半減する崖ができていた（実ロゴで 12,555 候補 → 6,278 個しか出ていなかった）。
    // 分数間隔の間引きなら常に上限を使い切る
    const pixels = [];
    for (let i = 0; i < 101; i += 1) {
      pixels.push({ x: i % 101, y: 0, rgb: [255, 255, 255] as [number, number, number] });
    }
    const image = makeImage(101, 1, pixels);
    const { count } = sampleLogoParticles(image, { step: 1, maxCount: 100 });
    expect(count).toBe(100);
  });

  it('実アセットを実際にデコードして粒子数の上限（PARTICLE_MAX_COUNT）を満たす（#420 の密度）', async () => {
    // 合成フィクスチャではなく **本物の PNG** をデコードして通す（PR #419 2 巡目レビュー対応）。
    // 合成フィクスチャだと、ロゴを再生成して明ピクセルが減っても実密度が静かに落ちるだけで
    // テストは緑のままになる。実アセットを読めば「クロップや閾値を変えたら落ちる」形で閉じる
    const { data, info } = await sharp('public/loader/logo-particle-source.png')
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    const { count } = sampleLogoParticles({
      data: new Uint8ClampedArray(data),
      width: info.width,
      height: info.height,
    });
    expect(count).toBe(PARTICLE_MAX_COUNT);
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

  it('2 枚のロゴアセットの寸法が LOGO_SOURCE_*_PX と一致する（CSS 幅がこの比から決まる）', () => {
    // 生成スクリプト側の assert と逆向きに閉じる — 定数だけ変えたときもここで落ちる
    // （PR #419 レビュー対応）。PNG の IHDR は 16-23 バイト目に width/height を持つ。
    // 粒子は particle-source の naturalWidth でスケールし、実ロゴの CSS 幅は定数から
    // アスペクト比を導くため、片方だけ再生成されると handoff で位置がズレる。両方を閉じる
    for (const asset of ['logo-particle-source.png', 'logo-reveal.png']) {
      const png = readFileSync(`public/loader/${asset}`);
      expect(png.readUInt32BE(16), `${asset} の幅`).toBe(LOGO_SOURCE_WIDTH_PX);
      expect(png.readUInt32BE(20), `${asset} の高さ`).toBe(LOGO_SOURCE_HEIGHT_PX);
    }
  });

  it('CSS の最終防衛線はフォールバックの後・e2e 待機上限の前に発火する（#419）', () => {
    // JS が死んだとき（チャンク 404 等）にだけ効く保険。正常系（JS のフォールバックタイマー）
    // より後に置かないと演出を途中で殺してしまい、e2e の待機上限より後だと e2e が落ちる
    expect(LOADER_CSS_FAILSAFE_MS).toBeGreaterThan(LOADER_FALLBACK_MS);
    expect(LOADER_CSS_FAILSAFE_MS).toBeLessThan(LOADER_E2E_TIMEOUT_MS);
  });

  it('演出開始時にロゴは一切見えない（#420: 粒子が集まって初めて浮かび上がる）', () => {
    // 0 より大きくすると開始時点でロゴが透けて見えてしまう。
    // Lighthouse の FCP/LCP は演出の尺そのものになるが、それが実体験と一致する値であり、
    // CI の Performance ゲートは下層ページで担保する（.github/workflows/ci.yml）
    expect(LOGO_GHOST_OPACITY).toBe(0);
  });

  it('粒子数の上限とサンプリング間隔が #420 の密度になっている', () => {
    // step 2px では候補が 3,106 個しか拾えず上限に届かなかった（実測）
    expect(SAMPLE_STEP_PX).toBe(1);
    expect(PARTICLE_MAX_COUNT).toBe(12_000);
  });

  it('実ロゴ <img> の CSS 幅は JS 側のクランプ式と同じ値を返す（同一ビューポート前提）', () => {
    // 粒子スケールは実際にレイアウトされた <img> の実測値から導くのが正だが、
    // <img> を測れない場合のフォールバック式は CSS と同値でなければならない。
    // ※ 実機のモバイルでは vh（large viewport）と innerHeight（visual viewport）が
    //    一致しないため、この同値性は「同じ w/h を入れたとき」に限る（PR #419 レビュー）
    const evalCss = (vw: number, vh: number) => {
      const terms = LOGO_DISPLAY_WIDTH_CSS.replace(/^min\(|\)$/g, '')
        .split(',')
        .map((raw) => {
          const t = raw.trim();
          const value = Number.parseFloat(t);
          if (t.endsWith('vw')) return (value / 100) * vw;
          if (t.endsWith('vh')) return (value / 100) * vh;
          return value; // px
        });
      return Math.min(...terms);
    };
    const evalJs = (w: number, h: number) =>
      Math.min(
        w * LOGO_DISPLAY_WIDTH_RATIO,
        LOGO_DISPLAY_WIDTH_MAX_PX,
        (h * LOGO_DISPLAY_HEIGHT_RATIO * LOGO_SOURCE_WIDTH_PX) / LOGO_SOURCE_HEIGHT_PX,
      );

    // 幅クランプが効く縦長 / 上限 520px が効く大画面 / 高さクランプが効く横持ち
    for (const [w, h] of [
      [390, 844],
      [1280, 800],
      [844, 390],
    ]) {
      expect(evalCss(w, h)).toBeCloseTo(evalJs(w, h), 1);
    }
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
