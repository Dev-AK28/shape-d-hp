import { test, expect } from '@playwright/test';

test.describe('Philosophy page', () => {
  test('renders full-screen SHAPE-D panels with overlay letters', async ({ page }) => {
    await page.goto('/philosophy');
    await page.waitForLoadState('networkidle');

    await expect(page.getByRole('heading', { level: 1, name: /哲学/ })).toBeAttached();

    const panels = page.locator('[data-philosophy-panel]');
    await expect(panels).toHaveCount(6);

    for (const letter of ['S', 'H', 'A', 'P', 'E', 'D']) {
      await expect(page.locator('[data-overlay-letter]').filter({ hasText: letter })).toHaveCount(1);
    }
  });

  test('shows S section content on initial load', async ({ page }) => {
    await page.goto('/philosophy');
    await page.waitForLoadState('networkidle');

    const firstPanel = page.locator('[data-philosophy-panel]').first();
    await expect(firstPanel.locator('h2').filter({ hasText: 'SELF-CONGRUENCE' })).toBeVisible();
    await expect(firstPanel.getByText('自己一致', { exact: true })).toBeVisible();
  });

  test('works under reduced motion without GSAP-only regressions', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/philosophy');
    await page.waitForLoadState('networkidle');

    const panels = page.locator('[data-philosophy-panel]');
    await expect(panels).toHaveCount(6);

    const lastPanel = panels.nth(5);
    await lastPanel.scrollIntoViewIfNeeded();
    await expect(page.getByText('多様なDの意味')).toBeVisible();
  });
});
