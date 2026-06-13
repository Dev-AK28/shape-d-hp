import { test } from '@playwright/test';
import { waitForHomePageReady } from './helpers';

test.describe('Home page', () => {
  test('shows hero heading after load', async ({ page }) => {
    await page.goto('/');
    await waitForHomePageReady(page);
  });
});
