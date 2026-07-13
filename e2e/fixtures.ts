import { test as base, expect } from '@playwright/test';
import { LOADER_FAST_TIME_SCALE } from '../lib/loader/particle-logo';

/**
 * e2e 共通フィクスチャ — Issue #414
 *
 * トップページのパーティクルローダーは実時間で約 10 秒あるため、一括実行では
 * initScript で __SHAPE_D_LOADER_TIME_SCALE__ を注入して演出を短縮する
 * （10s → 約 1.5s。CI 時間の爆発を防ぐ）。
 *
 * 等倍（実時間 10 秒）の検証は e2e/top-loader.spec.ts だけが
 * '@playwright/test' を直接 import して行う。それ以外のスペックは
 * このファイルの test / expect を import すること。
 */
export const test = base.extend({
  // 第2引数は Playwright の use コールバック。use という名前は react-hooks の
  // 誤検知（rules-of-hooks）を踏むため provide にリネームしている。
  context: async ({ context }, provide) => {
    await context.addInitScript((scale: number) => {
      window.__SHAPE_D_LOADER_TIME_SCALE__ = scale;
    }, LOADER_FAST_TIME_SCALE);
    await provide(context);
  },
});

export { expect };
