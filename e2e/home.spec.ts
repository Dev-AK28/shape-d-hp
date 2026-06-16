import { expect, test } from '@playwright/test';
import { expectFooterVisibleAboveCosmicBackground, expectHeroBrandLogoAfterFormation, LOGO_ALT, waitForHomePageReady } from './helpers';
import { ANIMATION_DURATION, REVEAL_DELAY } from '../lib/scroll/animation-tokens';

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

    // Scroll to trigger copy/CTA reveal via GSAP scrub. GSAP animates [data-testid="hero-cta-wrapper"]
    // (CSS opacity is not inherited by child elements, so querying the wrapper directly is required).
    // GSAP scrub (exponential smoothing) may settle at 0.999x rather than exactly 1.0; use
    // waitForFunction with >= 0.99 threshold to confirm scrollRevealed=true, then verify indicator
    // fades out (opacity 1→0, duration 0.4s). page.getByTestId() cannot be used inside
    // waitForFunction because it runs in browser context where Playwright API is unavailable.
    await page.mouse.wheel(0, 900);
    await page.waitForFunction(
      () => {
        const el = document.querySelector('[data-testid="hero-cta-wrapper"]');
        return !!el && parseFloat(getComputedStyle(el).opacity) >= 0.99;
      },
      { timeout: 10_000 },
    );
    await expect(indicator).toHaveCSS('opacity', '0', { timeout: 5000 });
  });

  test('does not show scroll indicator when user scrolls before particle formation completes', async ({ page }) => {
    // Regression test for the early-scroll race condition fixed in PR #139.
    // scrollRevealed guard prevents the fade-in tween from starting when the user
    // scrolls before formationComplete=true.
    await page.goto('/');
    await expect(page.getByTestId('page-loader')).toHaveCount(0, { timeout: 5000 });

    // Scroll immediately after page load. Formation takes HERO_PARTICLE_FORMATION_MS (2400ms)
    // after image-load completion; the GSAP scrub (scrub: 1.6 = ANIMATION_DURATION.hero) sets
    // scrollRevealed within ~1s (exponential catch-up to 93% of trigger range), leaving
    // significant margin before formation finishes.
    await page.mouse.wheel(0, 900);

    // Confirm the scroll was processed by GSAP and scrollRevealed=true fired before formation
    // completes. GSAP animates [data-testid="hero-cta-wrapper"] (CSS opacity is not inherited by
    // child elements). GSAP scrub may settle at 0.999x; use waitForFunction with >= 0.99 threshold.
    // page.getByTestId() cannot be used inside waitForFunction (browser context, no Playwright API).
    await page.waitForFunction(
      () => {
        const el = document.querySelector('[data-testid="hero-cta-wrapper"]');
        return !!el && parseFloat(getComputedStyle(el).opacity) >= 0.99;
      },
      { timeout: 5000 },
    );

    // Wait for formation to complete. After scrolling, the depth passage hides the logo
    // (opacity→0), so expectHeroBrandLogoAfterFormation cannot be used. Instead, wait for
    // the hero-formation-complete sentinel element that Hero mounts when formationComplete=true.
    await page.getByTestId('hero-formation-complete').waitFor({ state: 'attached', timeout: 10000 });
    const postFormationWaitMs = Math.ceil(
      (REVEAL_DELAY.heroScrollIndicator + ANIMATION_DURATION.heroScrollIndicator) * 1000 + 500, // +500ms CI buffer
    );
    await page.waitForTimeout(postFormationWaitMs);

    // With scrollRevealed=true when formationComplete fires, the fade-in guard prevents
    // the tween from starting. Indicator must remain at opacity:0.
    // waitForTimeout above already consumed the full reveal window; 1000ms is enough here.
    const indicator = page.getByTestId('hero-scroll-indicator');
    await expect(indicator).toHaveCSS('opacity', '0', { timeout: 1000 });
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

// ── 1024px (iPad Pro) — coarse pointer + reduced-motion CLS prevention (#149) ──────────────
// Regression guard: Hero must render in mobile flow layout (flex-col) from the first browser
// paint on touch-primary large screens with prefers-reduced-motion, eliminating the layout
// shift that occurred during the isReady=false→true transition in useDeviceProfile.

test.describe('1024px iPad Pro — coarse+reduced-motion CLS prevention', () => {
  test.use({ viewport: { width: 1024, height: 1366 } });

  test('real CSS @media rule fires and CTA is accessible in flow layout', async ({ page }) => {
    // page.emulateMedia() does not support 'pointer' — use CDP to activate the
    // @media (pointer: coarse) and (prefers-reduced-motion: reduce) block in globals.css.
    // This tests the actual CSS rule, not a simulated addStyleTag override.
    const cdpSession = await page.context().newCDPSession(page);
    await cdpSession.send('Emulation.setEmulatedMedia', {
      features: [{ name: 'pointer', value: 'coarse' }],
    });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');

    // data-hero="immersive" must be on the section — required for CSS @media selector (#149)
    await expect(page.locator('[data-hero="immersive"]')).toBeVisible({ timeout: 10_000 });

    // data-hero-cta must be present on the CTA wrapper — required for CSS position override
    await expect(page.locator('[data-hero="immersive"] [data-hero-cta]')).toBeVisible();

    const ctaLink = page.locator('[data-hero="immersive"] [data-hero-cta] .hero-cta');
    await expect(ctaLink).toBeVisible();

    // Off-screen guard: CTA must not be pushed outside the viewport by absolute positioning.
    // With the CSS override active, the CTA is flow-positioned (relative) and centered.
    await expect(async () => {
      const box = await ctaLink.boundingBox();
      expect(box).not.toBeNull();
      if (!box) return;
      expect(box.y, 'CTA must be within the viewport height').toBeLessThan(1366);
      // x > 0: ensures CTA is not hidden off the left edge of the viewport
      expect(box.x, 'CTA must not be pushed off the left edge').toBeGreaterThan(0);
    }).toPass({ timeout: 3_000 });
  });
});

