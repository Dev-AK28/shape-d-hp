import { expect, test } from './fixtures';
import { expectPageLoaderGone } from './helpers';

/**
 * プロセスセクション #process（TopProcess）— Issue #309
 * 参照HTML: lib/design/shape-d-prototype-v4.html L391-L433, L727-L754, L962-L968
 */

test.describe('Top process (#309)', () => {
  test('renders eyebrow and four timeline steps', async ({ page }) => {
    await page.goto('/');
    await expectPageLoaderGone(page);

    const process = page.locator('#process');
    await expect(process.locator('.eyebrow')).toContainText('PROCESS');
    await expect(process.locator('.step')).toHaveCount(4);
    await expect(process.locator('.step').first().locator('.step-num')).toHaveText('01 — LISTEN');
    await expect(process.locator('.step').first().locator('.step-title')).toHaveText('聴く');
    await expect(process.locator('.step').last().locator('.step-title')).toHaveText('育てる');
  });

  test('each step fades in as it enters the viewport', async ({ page }) => {
    await page.goto('/');
    await expectPageLoaderGone(page);

    const lastStep = page.locator('#process .step').last();
    await lastStep.evaluate((el) => el.scrollIntoView({ block: 'center' }));
    await expect
      .poll(async () => lastStep.evaluate((el) => parseFloat(getComputedStyle(el).opacity)), { timeout: 8000 })
      .toBeGreaterThan(0.9);
  });

  test('reduced-motion: all steps are shown at opacity 1', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await expectPageLoaderGone(page);

    await page.locator('#process').evaluate((el) => el.scrollIntoView({ block: 'center' }));
    await expect(page.locator('#process .step').first()).toHaveCSS('opacity', '1');
    await expect(page.locator('#process .step').last()).toHaveCSS('opacity', '1');
  });

  test('375px: process timeline fits without horizontal overflow', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    await expectPageLoaderGone(page);

    await page.locator('#process').evaluate((el) => el.scrollIntoView({ block: 'center' }));
    await expect(page.locator('#process .step').first().locator('.step-title')).toBeVisible();
    const hasOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth,
    );
    expect(hasOverflow, 'horizontal overflow at 375px').toBe(false);
  });
});
