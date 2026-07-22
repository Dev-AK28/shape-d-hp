import { expect, test } from './fixtures';

test.describe('404 / not-found page', () => {
  test('returns HTTP 404 with the site-branded page instead of the Next.js default', async ({
    request,
  }) => {
    const response = await request.get('/this-page-does-not-exist');
    expect(response.status()).toBe(404);

    const body = await response.text();
    expect(body).not.toContain('This page could not be found.');
    expect(body).toContain('ページが見つかりません');
  });

  test('shows branded chrome, a link back home, and sets the page title', async ({ page }) => {
    const response = await page.goto('/this-page-does-not-exist');
    expect(response?.status()).toBe(404);

    await expect(page).toHaveTitle(/ページが見つかりません/);
    await expect(page.getByRole('heading', { name: 'ページが見つかりません' })).toBeVisible();

    const homeLink = page.getByRole('link', { name: 'トップページへ戻る' });
    await expect(homeLink).toBeVisible();
    await expect(homeLink).toHaveAttribute('href', '/');

    // Navigation/Footer are rendered directly in app/not-found.tsx (it sits
    // outside app/(site)/layout.tsx), so confirm they are actually present
    // rather than only the bare content.
    await expect(page.locator('footer')).toBeVisible();
  });

  test('navigates home when the back-home link is clicked', async ({ page }) => {
    await page.goto('/this-page-does-not-exist');
    await page.getByRole('link', { name: 'トップページへ戻る' }).click();
    await expect(page).toHaveURL(/\/$/);
  });
});
