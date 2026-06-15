import { expect, test } from '@playwright/test';
import { expectFooterVisibleAboveCosmicBackground, expectHeroBrandLogoAfterFormation, LOGO_ALT, waitForHomePageReady } from './helpers';

test.describe('Home page', () => {
  test('shows hero heading after load', async ({ page }) => {
    await page.goto('/');
    await waitForHomePageReady(page);
  });

  test('applies warm gold grade overlay on cosmic background', async ({ page }) => {
    await page.goto('/');
    await waitForHomePageReady(page);
    await expect(page.getByTestId('cosmic-warm-grade-overlay')).toBeAttached();
  });

  test('applies cosmic typography blend to hero heading', async ({ page }) => {
    await page.goto('/');
    await waitForHomePageReady(page);
    const heading = page.getByTestId('type-blend-cosmic');
    await expect(heading).toHaveClass(/type-blend-cosmic/);
    await expect(heading).toHaveCSS('mix-blend-mode', 'screen');
  });
});

test.describe('Home page desktop', () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test('shows brand logo after particle formation', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('page-loader')).toHaveCount(0, { timeout: 5000 });
    await expectHeroBrandLogoAfterFormation(page);
  });

  test('shows footer above fixed cosmic background when scrolled to bottom', async ({ page }) => {
    await page.goto('/');
    await waitForHomePageReady(page);
    await expectFooterVisibleAboveCosmicBackground(page);
  });

  test('exposes hero pin section for cosmic depth ScrollTrigger coupling', async ({ page }) => {
    await page.goto('/');
    await waitForHomePageReady(page);
    await expect(page.getByTestId('hero-pin-section')).toBeVisible();
  });

  test('reveals hero CTA after scroll on desktop', async ({ page }) => {
    await page.goto('/');
    await waitForHomePageReady(page);

    const heroLogo = page.locator('main section').first().getByRole('img', { name: LOGO_ALT });
    await expect(heroLogo).toBeVisible({ timeout: 5000 });

    await page.mouse.wheel(0, 900);

    await expect(page.locator('a.hero-cta')).toBeVisible({ timeout: 10_000 });
  });

  test('shows scroll indicator after particle formation and hides after scroll', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('page-loader')).toHaveCount(0, { timeout: 5000 });
    await expectHeroBrandLogoAfterFormation(page);

    // Playwright considers opacity:0 elements as "visible" — use toHaveCSS to check GSAP opacity.
    // Indicator animates 0→1 after REVEAL_DELAY.heroScrollIndicator (delay 1.2s + duration 0.6s).
    // 4 000ms gives ~2 200ms of CI buffer after formation completes.
    const indicator = page.getByTestId('hero-scroll-indicator');
    await expect(indicator).toHaveCSS('opacity', '1', { timeout: 4000 });

    // Scroll to trigger copy/CTA reveal via GSAP scrub. Wait for CTA opacity=1 (confirms
    // scrollRevealed is true), then verify indicator fades out (opacity 1→0, duration 0.4s).
    await page.mouse.wheel(0, 900);
    await expect(page.locator('a.hero-cta')).toHaveCSS('opacity', '1', { timeout: 10_000 });
    await expect(indicator).toHaveCSS('opacity', '0', { timeout: 5000 });
  });

  test('keeps cosmic typography blend after hero scroll reveal on desktop', async ({ page }) => {
    await page.goto('/');
    await waitForHomePageReady(page);
    await expectHeroBrandLogoAfterFormation(page);

    await page.mouse.wheel(0, 900);
    await expect(page.locator('a.hero-cta')).toBeVisible({ timeout: 10_000 });

    const heading = page.getByTestId('type-blend-cosmic');
    await expect(heading).toBeVisible();
    await expect(heading).toHaveCSS('mix-blend-mode', 'screen');

    await expect(async () => {
      const logoLayerOpacity = await page.getByTestId('hero-logo-stage').evaluate((stage) => {
        const layer = stage.parentElement;
        if (!layer) {
          return 1;
        }
        return Number.parseFloat(getComputedStyle(layer).opacity);
      });
      expect(logoLayerOpacity).toBeLessThan(0.05);
    }).toPass({ timeout: 10_000 });
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

