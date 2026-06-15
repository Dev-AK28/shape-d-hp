/**
 * Mobile parity regression tests (issue #118).
 * Verifies that key content is visible and no horizontal overflow occurs at mobile viewports.
 */
import { expect, test, type Page } from '@playwright/test';

async function expectNoHorizontalOverflow(page: Page) {
  const hasOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth,
  );
  expect(hasOverflow, 'horizontal overflow detected').toBe(false);
}

// ── 390px (iPhone 14 Pro / Pixel 7) ─────────────────────────────────────────

test.describe('390px — /services', () => {
  test.use({ viewport: { width: 390, height: 844 } });

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
    await expect(page.locator('main').getByRole('link', { name: 'お問い合わせ' })).toBeVisible();
  });
});

test.describe('390px — /works', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('shows project sections without horizontal overflow', async ({ page }) => {
    await page.goto('/works');
    await expect(page.locator('main h1').first()).toContainText('WORKS');

    await expectNoHorizontalOverflow(page);

    await expect(page.getByRole('heading', { name: 'PROJECTS' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'CONCEPT WORKS' })).toBeVisible();
  });
});

test.describe('390px — /process', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('shows both process cards without horizontal overflow', async ({ page }) => {
    await page.goto('/process');
    await expect(page.locator('main h1').first()).toContainText('PROCESS');

    await expectNoHorizontalOverflow(page);

    await expect(page.getByRole('heading', { name: 'Development Process' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Consulting Process' })).toBeVisible();
  });
});

test.describe('390px — /process/development', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('shows development steps without horizontal overflow', async ({ page }) => {
    await page.goto('/process/development');
    await expect(page.locator('main h1').first()).toContainText('DEVELOPMENT');

    await expectNoHorizontalOverflow(page);

    await expect(page.getByRole('heading', { name: '要件定義' })).toBeVisible();
  });
});

test.describe('390px — /process/consulting', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('shows consulting steps without horizontal overflow', async ({ page }) => {
    await page.goto('/process/consulting');
    await expect(page.locator('main h1').first()).toContainText('CONSULTING');

    await expectNoHorizontalOverflow(page);

    await expect(page.getByRole('heading', { name: '3 Steps Process' })).toBeVisible();
    await expect(page.getByRole('heading', { name: '自覚' })).toBeVisible();
  });
});

test.describe('390px — /philosophy', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('shows philosophy panels without horizontal overflow', async ({ page }) => {
    await page.goto('/philosophy');
    await expect(page).toHaveURL(/\/philosophy$/);
    // Philosophy page uses sr-only h1 in Japanese; verify exactly one h1 exists
    await expect(page.locator('main h1')).toHaveCount(1);

    await expectNoHorizontalOverflow(page);

    // SELF-CONGRUENCE is in the first full-screen panel and animates in via
    // framer-motion whileInView. Nudge scroll to ensure IntersectionObserver fires,
    // then allow time for the animation to complete.
    await page.evaluate(() => window.scrollBy(0, 1));
    await expect(page.getByRole('heading', { name: 'SELF-CONGRUENCE' })).toBeVisible({
      timeout: 10000,
    });
  });
});

test.describe('390px — /contact', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('shows contact form without horizontal overflow', async ({ page }) => {
    await page.goto('/contact');
    await expect(page.locator('main h1').first()).toContainText('CONTACT');

    await expectNoHorizontalOverflow(page);

    // Contact page exposes the email address in the page header and a form
    await expect(page.getByTestId('page-header-email')).toBeVisible();
    await expect(page.getByRole('button', { name: '送信する' })).toBeVisible();
  });
});

// ── 375px (iPhone SE / older flagship) ──────────────────────────────────────

test.describe('375px — /services', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test('shows service headings without horizontal overflow', async ({ page }) => {
    await page.goto('/services');
    await expect(page.locator('main h1').first()).toContainText('SERVICES');

    await expectNoHorizontalOverflow(page);

    await expect(page.getByRole('heading', { name: 'Digital Solution' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Human Solution' })).toBeVisible();
  });
});

test.describe('375px — /works', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test('shows project sections without horizontal overflow', async ({ page }) => {
    await page.goto('/works');
    await expect(page.locator('main h1').first()).toContainText('WORKS');

    await expectNoHorizontalOverflow(page);

    await expect(page.getByRole('heading', { name: 'PROJECTS' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'CONCEPT WORKS' })).toBeVisible();
  });
});

test.describe('375px — /process/development', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test('shows development steps without horizontal overflow', async ({ page }) => {
    await page.goto('/process/development');
    await expect(page.locator('main h1').first()).toContainText('DEVELOPMENT');

    await expectNoHorizontalOverflow(page);

    await expect(page.getByRole('heading', { name: '要件定義' })).toBeVisible();
  });
});

test.describe('375px — /process/consulting', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test('shows consulting steps without horizontal overflow', async ({ page }) => {
    await page.goto('/process/consulting');
    await expect(page.locator('main h1').first()).toContainText('CONSULTING');

    await expectNoHorizontalOverflow(page);

    await expect(page.getByRole('heading', { name: '3 Steps Process' })).toBeVisible();
  });
});
