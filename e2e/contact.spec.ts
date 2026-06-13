import { expect, test } from '@playwright/test';

test.describe('Contact page', () => {
  test('shows success message after valid submission', async ({ page }) => {
    await page.route('**/api/contact', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true }),
      });
    });

    await page.goto('/contact');

    await page.getByLabel('お名前').fill('山田 太郎');
    await page.getByLabel('メールアドレス').fill('test@example.com');
    await page.getByLabel('会社名').fill('株式会社テスト');
    await page.getByLabel('メッセージ').fill('E2E テストからのお問い合わせです。');

    await page.getByRole('button', { name: '送信する' }).click();

    await expect(page.getByRole('status')).toContainText('送信しました');
  });

  test('shows rate limit error message', async ({ page }) => {
    await page.route('**/api/contact', async (route) => {
      await route.fulfill({
        status: 429,
        contentType: 'application/json',
        body: JSON.stringify({ success: false, error: 'Too many requests' }),
      });
    });

    await page.goto('/contact');

    await page.getByLabel('お名前').fill('山田 太郎');
    await page.getByLabel('メールアドレス').fill('test@example.com');
    await page.getByLabel('メッセージ').fill('テスト');

    await page.getByRole('button', { name: '送信する' }).click();

    await expect(page.getByText('送信回数の上限に達しました')).toBeVisible();
  });
});

test.describe('Navigation', () => {
  test('navigates to contact page from home', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('navigation').getByRole('link', { name: 'お問い合わせ' }).click();

    await expect(page).toHaveURL(/\/contact$/);
    await expect(page.getByRole('heading', { name: 'CONTACT' })).toBeVisible();
  });
});
