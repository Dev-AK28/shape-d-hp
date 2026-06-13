import { expect, test } from '@playwright/test';

test.describe('Home page', () => {
  test('shows hero heading after load', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('heading', { name: 'SHAPE ∞ D' })).toBeVisible();
  });
});
