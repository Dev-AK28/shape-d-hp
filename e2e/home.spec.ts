import { expect, test } from '@playwright/test';
import { HERO_HEADING, waitForHomePageReady } from './helpers';

test.describe('Home page', () => {
  test('shows hero heading after load', async ({ page }) => {
    await page.goto('/');
    await waitForHomePageReady(page);
    await expect(page.getByRole('heading', { name: HERO_HEADING })).toBeVisible();
  });
});
