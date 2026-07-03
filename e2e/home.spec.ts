import { expect, test } from '@playwright/test';
import { waitForHomePageReady } from './helpers';

// #312/#316: トップページは参照デザイン（hero〜CTA）のみで構成。
// 旧セクション（About / MissionVision / Showcase）と HomePageShell（cosmic 背景）を撤去し、
// CustomCursor / velocity-skew / PageLoader / cosmic をトップページで無効化した。
// 各参照セクションの個別検証は e2e/top-*.spec.ts が担う。ここではトップページ全体の
// インフラ無効化・フッター・横あふれを検証する。

test.describe('Home page — effects disabled on top (#312)', () => {
  test('does not mount the page loader on the top page', async ({ page }) => {
    await page.goto('/');
    await waitForHomePageReady(page);
    await expect(page.getByTestId('page-loader')).toHaveCount(0);
  });

  test('does not activate the custom cursor on the top page', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');
    await waitForHomePageReady(page);
    // CustomCursor は html[data-custom-cursor="active"] を付与する。トップでは無効。
    await expect(page.locator('html')).not.toHaveAttribute('data-custom-cursor', 'active');
    await expect(page.locator('.custom-cursor-dot')).toHaveCount(0);
  });

  test('does not render the cosmic background on the top page', async ({ page }) => {
    await page.goto('/');
    await waitForHomePageReady(page);
    await expect(page.getByTestId('cosmic-grade-overlay')).toHaveCount(0);
  });
});

test.describe('Home page footer', () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test('shows the top footer with lower-page links and copyright at the bottom', async ({ page }) => {
    await page.goto('/');
    await waitForHomePageReady(page);

    const footer = page.getByRole('contentinfo');
    await footer.scrollIntoViewIfNeeded();
    await expect(footer).toBeVisible();
    for (const href of ['/services', '/works', '/process', '/philosophy', '/contact']) {
      await expect(footer.locator(`a[href="${href}"]`)).toHaveCount(1);
    }
    await expect(footer).toContainText('© 2026 SHAPE∞D');
  });
});

test.describe('Home page mobile — full-page layout', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test('all reference sections are present without horizontal overflow', async ({ page }) => {
    await page.goto('/');
    await waitForHomePageReady(page);

    for (const id of ['#hero', '#vision', '#pain', '#theory', '#services', '#process', '#profile', '#cta']) {
      await expect(page.locator(id)).toHaveCount(1);
    }

    const hasOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth,
    );
    expect(hasOverflow, 'horizontal overflow at 375px').toBe(false);
  });
});
