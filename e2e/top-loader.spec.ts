import { test, expect } from '@playwright/test';
import {
  LOADER_E2E_TIMEOUT_MS,
  LOADER_SNAP_END_MS,
  LOADER_TIMELINE_MS,
  LOADER_TOTAL_MS,
} from '../lib/loader/particle-logo';

/**
 * トップページ パーティクルローダーの実時間検証 — Issue #412 / #414 / #418
 *
 * このスペックだけは fixtures の高速化フラグを使わず（'@playwright/test' を直接
 * import）、等倍タイムライン（約 10 秒・6 フェーズ）で検証する。
 * 他のスペックは e2e/fixtures.ts 経由で短縮版が適用される。
 */
test.describe('Top particle loader (#412 / #414 / #418)', () => {
  test('オーバーレイは SSR され、初期 HTML の時点でヒーローを完全に覆う（#418 / #416）', async ({
    page,
  }) => {
    // JS を無効化しても SSR された DOM は届く（= 初期 HTML に存在する）
    const response = await page.goto('/', { waitUntil: 'commit' });
    const html = (await response?.text()) ?? '';
    expect(html).toContain('data-top-loader');
    expect(html).toContain('data-testid="loader-logo"');

    // 背景は半透明スクリムではなくトップページ背景色そのもの（透けない）
    const loader = page.getByTestId('page-loader');
    const background = await loader.evaluate(
      (el) => getComputedStyle(el).backgroundColor,
    );
    expect(background).toBe('rgb(7, 9, 13)');
  });

  test('粒子が集まったあと実ロゴが立ち上がる（handoff・#418）', async ({ page }) => {
    await page.goto('/', { waitUntil: 'commit' });
    const logo = page.getByTestId('loader-logo');
    await logo.waitFor({ state: 'attached', timeout: 5000 });

    // handoff 前はゴースト（薄表示）。framer のアニメーションはハイドレーション後に
    // 始まるため、ナビゲーション起点の絶対時刻ではなく「まだ薄い」ことだけを見る
    const ghost = await logo.evaluate((el) => Number(getComputedStyle(el).opacity));
    expect(ghost).toBeLessThan(0.5);

    // handoff で実ロゴが立ち上がる。unmount 後は null を返して「表示済み」とみなす
    // （消滅の検証は別テストが担当）
    await expect
      .poll(
        () =>
          page.evaluate(() => {
            const el = document.querySelector('[data-testid="loader-logo"]');
            return el ? Number(getComputedStyle(el).opacity) : 1;
          }),
        { timeout: LOADER_SNAP_END_MS + LOADER_TIMELINE_MS.handoff + 4000 },
      )
      .toBeGreaterThan(0.9);
  });

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

  test('reduced-motion ではローダーを見せない（SSR されるが CSS で即非表示）', async ({
    browser,
  }) => {
    const context = await browser.newContext({ reducedMotion: 'reduce' });
    const page = await context.newPage();
    await page.goto('/', { waitUntil: 'load' });
    // SSR されるためハイドレーション前は DOM にあるが、CSS（globals.css）で不可視。
    // ハイドレーション後は JS が unmount する
    await expect(page.locator('[data-top-loader]')).toBeHidden();
    await page.waitForTimeout(1500);
    await expect(page.getByTestId('page-loader')).toHaveCount(0);
    await context.close();
  });

  test('タイムライン定数が約 10 秒の尺で e2e 予算内にある（配線確認）', () => {
    expect(LOADER_TOTAL_MS).toBe(10_000);
    expect(LOADER_TOTAL_MS).toBeLessThan(LOADER_E2E_TIMEOUT_MS);
  });
});
