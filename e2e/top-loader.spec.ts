import { test, expect } from '@playwright/test';
import {
  LOADER_E2E_TIMEOUT_MS,
  LOADER_TIMELINE_MS,
  LOADER_TOTAL_MS,
} from '../lib/loader/particle-logo';

/**
 * トップページ パーティクルローダーの実時間検証 — Issue #412 / #414
 *
 * このスペックだけは fixtures の高速化フラグを使わず（'@playwright/test' を直接
 * import）、等倍タイムライン（約 10 秒・5 フェーズ）で検証する。
 * 他のスペックは e2e/fixtures.ts 経由で短縮版が適用される。
 */
test.describe('Top particle loader (#412 / #414)', () => {
  test('等倍タイムラインで表示され、drift 中は残り、予算内に消える', async ({ page }) => {
    await page.goto('/', { waitUntil: 'commit' });
    const loader = page.getByTestId('page-loader');
    await loader.waitFor({ state: 'attached', timeout: 5000 });

    // マウント起点で約 5 秒後もまだ表示されている（約 10 秒演出の担保）。
    // 粒子タイムラインは画像 decode 起点だが、消滅は framer のマウント起点
    // ディレイ（10s）に対するものなのでマージン約 5 秒があり安定
    await page.waitForTimeout(LOADER_TIMELINE_MS.drift + LOADER_TIMELINE_MS.converge - 1500);
    await expect(loader).toHaveCount(1);

    // 全演出 + フォールバックの予算内に必ず消える
    await expect(loader).toHaveCount(0, { timeout: LOADER_E2E_TIMEOUT_MS });
  });

  test('演出中も pointer-events を奪わず背後の操作をブロックしない', async ({ page }) => {
    await page.goto('/', { waitUntil: 'commit' });
    const loader = page.getByTestId('page-loader');
    await loader.waitFor({ state: 'attached', timeout: 5000 });
    await expect(loader).toHaveCSS('pointer-events', 'none');
  });

  test('reduced-motion ではローダーを描画しない', async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: 'reduce' });
    const page = await context.newPage();
    await page.goto('/', { waitUntil: 'load' });
    // 出現猶予を与えても現れないこと
    await page.waitForTimeout(1500);
    await expect(page.getByTestId('page-loader')).toHaveCount(0);
    await context.close();
  });

  test('タイムライン定数が約 10 秒の尺で e2e 予算内にある（配線確認）', () => {
    expect(LOADER_TOTAL_MS).toBe(10_000);
    expect(LOADER_TOTAL_MS).toBeLessThan(LOADER_E2E_TIMEOUT_MS);
  });
});
