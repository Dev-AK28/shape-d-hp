import { test, expect } from '@playwright/test';
import { waitForHomePageReady } from './helpers';

test.describe('Scroll animations', () => {
  test('reveals about section when scrolled into view', async ({ page }) => {
    await page.goto('/');
    await waitForHomePageReady(page);

    const aboutHeading = page.locator('h2').filter({ hasText: 'ABOUT' });
    await aboutHeading.scrollIntoViewIfNeeded();

    await expect(aboutHeading).toBeVisible({ timeout: 5000 });
  });

  test('reveals vision quotes when scrolled into view', async ({ page }) => {
    await page.goto('/');
    await waitForHomePageReady(page);

    const visionHeading = page.locator('h2').filter({ hasText: 'VISION' });
    await visionHeading.scrollIntoViewIfNeeded();

    await expect(visionHeading).toBeVisible({ timeout: 5000 });
    await expect(page.locator('[data-vision-quote]').first()).toBeVisible();
  });

  test('shows about timeline immediately under reduced motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await waitForHomePageReady(page);

    const firstTimelineItem = page.locator('[data-timeline-item]').first();
    await firstTimelineItem.scrollIntoViewIfNeeded();

    await expect(firstTimelineItem).toBeVisible();
    await expect(firstTimelineItem).toHaveCSS('opacity', '1');
  });

  test('disables page loader under reduced motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await expect(page.getByTestId('page-loader')).toHaveCount(0);
  });
});
