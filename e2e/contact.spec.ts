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

    const nameField = page.locator('#name');
    await nameField.scrollIntoViewIfNeeded();
    await expect(nameField).toBeVisible();
    await expect(nameField).toBeEditable();

    await nameField.fill('山田 太郎');
    await page.locator('#email').fill('test@example.com');
    await page.locator('#company').fill('株式会社テスト');
    await page.locator('#message').fill('E2E テストからのお問い合わせです。');

    await page.getByRole('button', { name: '送信する' }).click();

    await expect(page.getByRole('status')).toContainText('送信しました', {
      timeout: 10_000,
    });
  });

  test('shows browser validation for empty required fields', async ({ page }) => {
    await page.goto('/contact');

    const nameField = page.locator('#name');
    await nameField.scrollIntoViewIfNeeded();
    await expect(nameField).toBeVisible();

    // 必須項目を空のまま送信ボタンをクリック
    await page.getByRole('button', { name: '送信する' }).click();

    // HTML5 constraint validation: name フィールドは空のため invalid になる
    const nameValid = await nameField.evaluate(
      (el: HTMLInputElement) => el.validity.valid,
    );
    expect(nameValid).toBe(false);

    // フォームは送信されないため成功メッセージは表示されない
    await expect(page.getByRole('status')).toHaveCount(0);
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

    const nameField = page.locator('#name');
    await nameField.scrollIntoViewIfNeeded();
    await expect(nameField).toBeVisible();
    await expect(nameField).toBeEditable();

    await nameField.fill('山田 太郎');
    await page.locator('#email').fill('test@example.com');
    await page.locator('#message').fill('テスト');

    await page.getByRole('button', { name: '送信する' }).click();

    await expect(page.getByText('送信回数の上限に達しました')).toBeVisible({
      timeout: 10_000,
    });
  });
});
