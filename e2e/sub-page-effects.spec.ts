import { expect, test } from './fixtures';

/**
 * 演出インフラのページ別維持 — Issue #312
 *
 * CustomCursor / velocity-skew ターゲットは**下層ページでは維持**される（トップでは無効）。
 * トップ側の無効化は e2e/home.spec.ts で検証。ここでは下層ページで維持されることを確認する。
 */
test.describe('Sub-page effects are kept (#312)', () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test('custom cursor is active on a desktop sub-page', async ({ page }) => {
    await page.goto('/services');
    await page.waitForLoadState('networkidle');
    // CustomCursor（下層で有効）はデスクトップ fine-pointer で .custom-cursor-dot を描画する
    await expect(page.locator('.custom-cursor-dot')).toHaveCount(1, { timeout: 8000 });
  });

  test('velocity-skew target exists on a sub-page', async ({ page }) => {
    await page.goto('/services');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('[data-velocity-content]')).toHaveCount(1);
  });

  test('custom cursor is NOT mounted on the top page (contrast)', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('load');
    await expect(page.locator('#hero .hero-mark')).toBeVisible();
    await expect(page.locator('.custom-cursor-dot')).toHaveCount(0);
  });
});
