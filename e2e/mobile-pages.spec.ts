/**
 * Mobile parity regression tests (issue #118).
 * Verifies that key content is visible and no horizontal overflow occurs at 390px viewport.
 */
import { expect, test } from '@playwright/test';

test.use({ viewport: { width: 390, height: 844 } });

async function expectNoHorizontalOverflow(page: import('@playwright/test').Page) {
  const hasOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth,
  );
  expect(hasOverflow, 'horizontal overflow detected').toBe(false);
}

test.describe('Mobile pages — /services', () => {
  test('shows service headings without horizontal overflow', async ({ page }) => {
    await page.goto('/services');
    await expect(page.locator('main h1').first()).toContainText('SERVICES');

    await expectNoHorizontalOverflow(page);

    await expect(page.getByRole('heading', { name: 'Digital Solution' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Human Solution' })).toBeVisible();
  });

  test('shows CTA link', async ({ page }) => {
    await page.goto('/services');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await expect(page.getByRole('link', { name: 'お問い合わせ' }).last()).toBeVisible();
  });
});

test.describe('Mobile pages — /works', () => {
  test('shows project sections without horizontal overflow', async ({ page }) => {
    await page.goto('/works');
    await expect(page.locator('main h1').first()).toContainText('WORKS');

    await expectNoHorizontalOverflow(page);

    await expect(page.getByRole('heading', { name: 'PROJECTS' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'CONCEPT WORKS' })).toBeVisible();
  });
});

test.describe('Mobile pages — /process', () => {
  test('shows both process cards without horizontal overflow', async ({ page }) => {
    await page.goto('/process');
    await expect(page.locator('main h1').first()).toContainText('PROCESS');

    await expectNoHorizontalOverflow(page);

    await expect(page.getByRole('heading', { name: 'Development Process' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Consulting Process' })).toBeVisible();
  });
});

test.describe('Mobile pages — /process/development', () => {
  test('shows development steps without horizontal overflow', async ({ page }) => {
    await page.goto('/process/development');
    await expect(page.locator('main h1').first()).toContainText('DEVELOPMENT');

    await expectNoHorizontalOverflow(page);

    await expect(page.getByRole('heading', { name: '要件定義' })).toBeVisible();
  });
});

test.describe('Mobile pages — /process/consulting', () => {
  test('shows consulting steps without horizontal overflow', async ({ page }) => {
    await page.goto('/process/consulting');
    await expect(page.locator('main h1').first()).toContainText('CONSULTING');

    await expectNoHorizontalOverflow(page);

    await expect(page.getByRole('heading', { name: '3 Steps Process' })).toBeVisible();
    await expect(page.getByRole('heading', { name: '自覚' })).toBeVisible();
  });
});

test.describe('Mobile pages — /philosophy', () => {
  test('shows philosophy panels without horizontal overflow', async ({ page }) => {
    await page.goto('/philosophy');
    // Philosophy page uses sr-only h1 in Japanese; verify by page title or first panel heading
    await expect(page.locator('main h1')).toHaveCount(1);

    await expectNoHorizontalOverflow(page);

    await expect(page.getByRole('heading', { name: 'SELF-CONGRUENCE' })).toBeVisible();
  });
});

test.describe('Mobile pages — /contact', () => {
  test('shows contact form without horizontal overflow', async ({ page }) => {
    await page.goto('/contact');
    await expect(page.locator('main h1').first()).toContainText('CONTACT');

    await expectNoHorizontalOverflow(page);

    // Contact page exposes the email address in the page header and a form
    await expect(page.getByTestId('page-header-email')).toBeVisible();
    await expect(page.getByRole('button', { name: '送信する' })).toBeVisible();
  });
});
