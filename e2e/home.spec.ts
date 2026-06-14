import { expect, test } from '@playwright/test';
import { expectFooterVisibleAboveCosmicBackground, LOGO_ALT, waitForHomePageReady } from './helpers';

test.describe('Home page', () => {
  test('shows hero heading after load', async ({ page }) => {
    await page.goto('/');
    await waitForHomePageReady(page);
  });
});

test.describe('Home page desktop', () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test('shows brand logo after particle formation', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('page-loader')).toHaveCount(0, { timeout: 5000 });

    const heroLogo = page.locator('main section').first().getByRole('img', { name: LOGO_ALT });
    await expect(heroLogo).toBeVisible({ timeout: 5000 });
  });

  test('shows footer above fixed cosmic background when scrolled to bottom', async ({ page }) => {
    await page.goto('/');
    await waitForHomePageReady(page);
    await expectFooterVisibleAboveCosmicBackground(page);
  });

  test('reveals hero CTA after scroll on desktop', async ({ page }) => {
    await page.goto('/');
    await waitForHomePageReady(page);

    const heroLogo = page.locator('main section').first().getByRole('img', { name: LOGO_ALT });
    await expect(heroLogo).toBeVisible({ timeout: 5000 });

    await page.mouse.wheel(0, 900);

    await expect(page.locator('a.hero-cta')).toBeVisible({ timeout: 10_000 });
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

  test('shows footer above fixed cosmic background when scrolled to bottom', async ({ page }) => {
    await page.goto('/');
    await waitForHomePageReady(page);
    await expectFooterVisibleAboveCosmicBackground(page);
  });
});

