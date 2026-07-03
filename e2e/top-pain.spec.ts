import { expect, test } from '@playwright/test';

/**
 * 課題提起セクション #pain（TopPain）— Issue #306
 * 参照HTML: lib/design/shape-d-prototype-v4.html L224-L251, L659-L670, L913-L923
 */

test.describe('Top pain (#306)', () => {
  test('renders eyebrow, three pain lines with emphasis and the close', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('page-loader')).toHaveCount(0, { timeout: 5000 });

    const pain = page.locator('#pain');
    await expect(pain.locator('.eyebrow')).toContainText('REALITY');
    await expect(pain.locator('.pain-line')).toHaveCount(3);
    await expect(pain.locator('.pain-line strong')).toHaveCount(3);
    await expect(pain.locator('.pain-close')).toContainText('翻訳する相手');
    // 背景は ink→ink-2 グラデーション
    await expect(pain).toHaveCSS('background-image', /linear-gradient/);
  });

  test('each pain line fades in as it enters the viewport', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('page-loader')).toHaveCount(0, { timeout: 5000 });

    const lastLine = page.locator('#pain .pain-line').last();
    const close = page.locator('#pain .pain-close');

    await page.locator('#pain').evaluate((el) => el.scrollIntoView({ block: 'center' }));
    await expect.poll(async () => lastLine.evaluate((el) => parseFloat(getComputedStyle(el).opacity)), {
      timeout: 8000,
    }).toBeGreaterThan(0.9);

    await close.evaluate((el) => el.scrollIntoView({ block: 'center' }));
    await expect.poll(async () => close.evaluate((el) => parseFloat(getComputedStyle(el).opacity)), {
      timeout: 8000,
    }).toBeGreaterThan(0.9);
  });

  test('reduced-motion: all lines and close are shown at opacity 1', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await expect(page.getByTestId('page-loader')).toHaveCount(0, { timeout: 5000 });

    for (const sel of ['#pain .pain-line', '#pain .pain-close']) {
      await expect(page.locator(sel).first()).toHaveCSS('opacity', '1');
    }
    await expect(page.locator('#pain .pain-line').last()).toHaveCSS('opacity', '1');
  });

  test('375px: pain section fits without horizontal overflow', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    await expect(page.getByTestId('page-loader')).toHaveCount(0, { timeout: 5000 });

    await page.locator('#pain').evaluate((el) => el.scrollIntoView({ block: 'center' }));
    await expect(page.locator('#pain .pain-close')).toBeVisible();
    const hasOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth,
    );
    expect(hasOverflow, 'horizontal overflow at 375px').toBe(false);
  });
});
