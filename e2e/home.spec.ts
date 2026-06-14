import { expect, test } from '@playwright/test';
import { waitForHomePageReady } from './helpers';

test.describe('Home page', () => {
  test('shows hero heading after load', async ({ page }) => {
    await page.goto('/');
    await waitForHomePageReady(page);
  });
});

test.describe('Home page mobile', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('shows About and MissionVision content below hero CTA', async ({ page }) => {
    await page.goto('/');
    await expect(
      page.getByRole('heading', {
        level: 1,
        name: /AIで効率化し、.*本来の創造に集中する環境を作る。/,
      }),
    ).toBeVisible();
    await expect(page.getByTestId('page-loader')).toHaveCount(0, { timeout: 5000 });

    await page.locator('a.hero-cta').scrollIntoViewIfNeeded();
    await page.evaluate(() => window.scrollBy(0, window.innerHeight * 0.5));

    await expect(page.getByText('心理学', { exact: true })).toBeVisible();
    await expect(page.getByText('経歴', { exact: true })).toBeVisible();
    await expect(page.getByText('自己一致（SELF-CONGRUENCE）への道')).toBeVisible();
  });
});

