import { expect, test } from '@playwright/test';
import { expectBigbangCanvasRetiredWithLogoVisible, expectFooterVisibleAboveCosmicBackground, expectHeroBrandLogoAfterFormation, expectNoHorizontalOverflow, expectPainted, LOGO_ALT, waitForHomePageReady } from './helpers';
import { ANIMATION_DURATION, REVEAL_DELAY } from '../lib/scroll/animation-tokens';

test.describe('Home page', () => {
  test('shows hero heading after load', async ({ page }) => {
    await page.goto('/');
    await waitForHomePageReady(page);
  });

  test('applies cosmic grade overlay on cosmic background', async ({ page }) => {
    await page.goto('/');
    await waitForHomePageReady(page);
    await expect(page.getByTestId('cosmic-grade-overlay')).toBeAttached();
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
    // expectHeroBrandLogoAfterFormation already consumes the full big-bang formation window,
    // so 4 000ms here leaves ample CI buffer for the indicator fade-in.
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

  test('scroll indicator bottom class includes safe-area-inset-bottom formula (#165)', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('page-loader')).toHaveCount(0, { timeout: 5000 });

    const indicator = page.getByTestId('hero-scroll-indicator');
    // Wait for the indicator to be mounted (only rendered in isImmersive && gsapControlled path).
    await expect(indicator).toBeAttached();
    // Verify env(safe-area-inset-bottom) formula is present in class attribute.
    const className = await indicator.getAttribute('class') ?? '';
    expect(className).toContain('safe-area-inset-bottom');

    // On standard Playwright viewport safe-area-inset-bottom = 0 (#166), so bottom = var(--space-3) = 24px.
    const bottomPx = await indicator.evaluate(
      (el) => parseFloat(getComputedStyle(el).bottom),
    );
    expect(bottomPx).toBeGreaterThanOrEqual(24);
  });

  test('does not show scroll indicator when user scrolls before particle formation completes', async ({ page }) => {
    // Regression test for the early-scroll race condition fixed in PR #139.
    // scrollRevealed guard prevents the fade-in tween from starting when the user
    // scrolls before formationComplete=true.
    await page.goto('/');
    await expect(page.getByTestId('page-loader')).toHaveCount(0, { timeout: 5000 });

    // Scroll immediately after page load. Formation takes HERO_PARTICLE_FORMATION_MS (big-bang
    // bigBang+drift+gather) after image-load completion; the GSAP scrub (scrub: 1.6 = ANIMATION_DURATION.hero) sets
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

  test('retires bigbang canvas and keeps BrandLogo visible after formation (#218)', async ({ page }) => {
    // Explicitly opt-out of reduced-motion so the big-bang canvas is rendered.
    // In reduced-motion mode skipFormation=true and the canvas is never created,
    // which would cause expectBigbangCanvasRetiredWithLogoVisible to fail early
    // at the "canvas must appear" guard — the intended failure signal.
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.goto('/');
    await expect(page.getByTestId('page-loader')).toHaveCount(0, { timeout: 5000 });
    await expectBigbangCanvasRetiredWithLogoVisible(page);
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

    const psyText = page.getByText('心理学', { exact: true });
    const careerText = page.getByText('経歴', { exact: true });
    const congruenceText = page.getByText('自己一致（SELF-CONGRUENCE）への道');

    await expect(psyText).toBeVisible();
    await expect(careerText).toBeVisible();
    await expect(congruenceText).toBeVisible();

    // #159: confirm painted (opacity=1) — guards against framer-motion holding opacity:0
    await psyText.evaluate((el) => el.scrollIntoView({ behavior: 'instant', block: 'center' }));
    await expectPainted(psyText, 5000);
    await careerText.evaluate((el) => el.scrollIntoView({ behavior: 'instant', block: 'center' }));
    await expectPainted(careerText, 5000);
    await congruenceText.evaluate((el) => el.scrollIntoView({ behavior: 'instant', block: 'center' }));
    await expectPainted(congruenceText, 5000);

    // #159: bounding box — text must be within viewport (not pushed off-screen)
    // Checks the same section-padding constraint as the 375px test (x >= 24).
    await psyText.evaluate((el) => el.scrollIntoView({ behavior: 'instant', block: 'center' }));
    await expect(async () => {
      const psyBox = await psyText.boundingBox();
      expect(psyBox).not.toBeNull();
      if (!psyBox) return;
      expect(psyBox.x, '心理学 text left edge must be within section padding').toBeGreaterThanOrEqual(24);
    }).toPass({ timeout: 3_000 });

    // #159: no horizontal overflow at 390px viewport
    await expectNoHorizontalOverflow(page);
  });

  test('shows footer above fixed cosmic background when scrolled to bottom', async ({ page }) => {
    await page.goto('/');
    await waitForHomePageReady(page);
    await expectFooterVisibleAboveCosmicBackground(page);
  });
});

// ── 375px (iPhone SE) — Home page ABOUT / VISION headings (#150 / #159) ─────────────────────
// Consolidated from e2e/mobile-pages.spec.ts in Issue #159.
// Regression guard: ABOUT and VISION h2 headings must be visible, fully painted, and must not
// overflow horizontally at 375px (the narrowest supported mobile viewport).

test.describe('375px Home page mobile', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test('ABOUT and VISION headings are fully visible without horizontal overflow', async ({ page }) => {
    await page.goto('/');
    // Wait for the page-loader to disappear before checking opacity: while the loader
    // is on screen, framer-motion may hold ancestor elements at opacity:0 and the
    // 200ms expectPainted window would fire too early and report a false failure.
    await expect(page.getByTestId('page-loader')).toHaveCount(0, { timeout: 10_000 });
    // networkidle ensures React hydration and framer-motion's initial animate
    // commit have settled before we sample opacity.
    await page.waitForLoadState('networkidle');

    const aboutHeading = page.locator('h2').filter({ hasText: /^ABOUT$/ }).first();
    const visionHeading = page.locator('h2').filter({ hasText: /^VISION$/ }).first();

    await expect(aboutHeading).toBeVisible({ timeout: 10_000 });
    await expect(visionHeading).toBeVisible({ timeout: 10_000 });

    // #150 / #180: headings are below Hero (below fold); scroll into view then check painted.
    // 5000ms covers the full framer-motion scroll reveal animation (duration 1.4s) plus CI jitter.
    await aboutHeading.evaluate((el) => el.scrollIntoView({ behavior: 'instant', block: 'center' }));
    await expectPainted(aboutHeading, 5000);
    await visionHeading.evaluate((el) => el.scrollIntoView({ behavior: 'instant', block: 'center' }));
    await expectPainted(visionHeading, 5000);

    // #150: no horizontal overflow — heading text must not extend beyond viewport
    await expectNoHorizontalOverflow(page);

    // Verify the headings are not clipped: bounding box must start at or after section left edge.
    // The section has px-[var(--space-3)] = 24px padding, so text x ≥ 24px within the section.
    await aboutHeading.evaluate((el) => el.scrollIntoView({ behavior: 'instant', block: 'center' }));
    await expect(async () => {
      const aboutBox = await aboutHeading.boundingBox();
      expect(aboutBox).not.toBeNull();
      if (!aboutBox) return;
      expect(aboutBox.x, 'ABOUT heading left edge must be within section padding').toBeGreaterThanOrEqual(24);
    }).toPass({ timeout: 3_000 });

    await visionHeading.evaluate((el) => el.scrollIntoView({ behavior: 'instant', block: 'center' }));
    await expect(async () => {
      const visionBox = await visionHeading.boundingBox();
      expect(visionBox).not.toBeNull();
      if (!visionBox) return;
      expect(visionBox.x, 'VISION heading left edge must be within section padding').toBeGreaterThanOrEqual(24);
    }).toPass({ timeout: 3_000 });
  });
});

// ── 1024px (iPad Pro) — coarse pointer + reduced-motion CLS prevention (#149) ──────────────
// Regression guard: Hero must render in mobile flow layout (flex-col) from the first browser
// paint on touch-primary large screens with prefers-reduced-motion, eliminating the layout
// shift that occurred during the isReady=false→true transition in useDeviceProfile.

test.describe('1024px iPad Pro — coarse+reduced-motion CLS prevention', () => {
  test.use({ viewport: { width: 1024, height: 1366 } });

  test('CTA position override: addStyleTag simulation of pointer:coarse + reduced-motion (#149)', async ({ page }) => {
    // NOTE: Playwright 1.x cannot reliably emulate `pointer: coarse` via CDP.
    // page.emulateMedia() and page.goto() both internally call Emulation.setEmulatedMedia
    // with a features array that excludes 'pointer', resetting any prior CDP state set via
    // page.context().newCDPSession(). True pointer:coarse emulation requires a physical device
    // or browser-level flag injection outside Playwright's managed API.
    // This test instead: (1) verifies the data attributes are present in the DOM as regression
    // guard, and (2) injects the equivalent CSS via addStyleTag to verify that when the
    // @media rule fires on a real coarse-pointer device, the CTA remains accessible.
    //
    // SCENARIO NOTE: This test runs in a pointer:fine environment (Playwright default).
    // profile.prefersCoarsePointer=false → React applies `absolute bottom-[...] left-1/2 -translate-x-1/2`.
    // addStyleTag overrides position to `relative`, simulating what the CSS @media rule does on a
    // real pointer:coarse+reduced-motion device. On such devices the CSS @media block fires at first
    // paint (before React hydration completes), and React's mobileStaticHero subsequently converges
    // to the same layout — closing that convergence gap was the CLS fix in Issue #149.
    // The intent is to verify CSS cascade values directly — not the production SSR convergence scenario.
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');

    // data-hero="immersive" must be on the section — required for CSS @media selector (#149)
    await expect(page.locator('[data-hero="immersive"]')).toBeVisible({ timeout: 10_000 });

    // data-hero-cta must be present on the CTA wrapper — required for CSS position override
    await expect(page.locator('[data-hero="immersive"] [data-hero-cta]')).toBeVisible();

    // Inject CSS equivalent to the @media (pointer: coarse) and (prefers-reduced-motion: reduce)
    // block in globals.css to verify the CSS property values and CTA accessibility.
    // --space-8=64px, --space-6=48px (globals.css :root に対応; see Issue #276 for token-drift tracking)
    //
    // NOTE: This CSS uses !important to guarantee style application in the pointer:fine E2E environment
    // where the production @media rule would not fire. Production globals.css does NOT use !important
    // in the @media block. Therefore, this test cannot detect regressions where a GSAP inline style
    // or React prop overrides the cascade without !important — see Issue #275 for the broader tracking.
    await page.addStyleTag({
      content: [
        '[data-hero="immersive"]{flex-direction:column!important;height:auto!important;min-height:100svh!important;overflow:visible!important;padding-top:calc(64px + env(safe-area-inset-top,0px))!important;padding-bottom:64px!important;}',
        '[data-hero="immersive"] [data-hero-cta]{position:relative!important;bottom:auto!important;left:auto!important;transform:none!important;margin-top:48px!important;text-align:center!important;}',
      ].join('\n'),
    });

    const ctaWrapper = page.locator('[data-hero="immersive"] [data-hero-cta]');
    const ctaLink = ctaWrapper.locator('.hero-cta');
    await expect(ctaLink).toBeVisible();

    // Verify computed styles directly via getComputedStyle — independent of !important cascade boost.
    // Confirms CSS override values are actually applied, guarding against future regressions where
    // a style prop or GSAP setup change could silently bypass the intended cascade.
    // Also verifies left/transform resets: pointer:fine React applies `left-1/2 -translate-x-1/2`,
    // and both must be overridden alongside `position` (see Issue #149 fix intent).
    const ctaStyles = await ctaWrapper.evaluate((el) => {
      const cs = getComputedStyle(el);
      return {
        position: cs.position,
        textAlign: cs.textAlign,
        left: cs.left,
        transform: cs.transform,
      };
    });
    expect(ctaStyles.position, 'CTA wrapper position must be relative after CSS override').toBe('relative');
    expect(ctaStyles.textAlign, 'CTA wrapper text-align must be center after CSS override').toBe('center');
    // left: auto resolves to 0px for position:relative in Chromium — confirms Tailwind left-1/2 is overridden.
    // NOTE: This is Chromium-specific behavior. Firefox/WebKit may return 'auto' instead.
    // If a non-Chromium Playwright project is added, convert this to a range check (see Issue #273).
    expect(ctaStyles.left, 'CTA wrapper left must be reset (Tailwind left-1/2 overridden)').toBe('0px');
    // transform: none confirms Tailwind -translate-x-1/2 CSS variable chain is disabled.
    expect(ctaStyles.transform, 'CTA wrapper transform must be none (Tailwind -translate-x-1/2 overridden)').toBe('none');

    // Bi-directional off-screen guard: CTA must remain within the viewport on all four edges.
    // Uses page.viewportSize() instead of hardcoded constants so the check stays in sync with
    // test.use({ viewport }) above.
    //
    // Tolerance is intentionally asymmetric:
    //   - left/top:  >= 0 (no tolerance) — a value below 0 means the element is off-screen; no slack needed.
    //   - right/bottom: +0.5px tolerance — getBoundingClientRect() floating-point arithmetic can make
    //     box.x + box.width slightly exceed vpW (e.g. 1024.0002) for elements flush with the edge.
    //
    // addStyleTag injects static styles; browser style recalculation is synchronous, so
    // toPass retry-polling is unnecessary — a single boundingBox snapshot is sufficient.
    const vp = page.viewportSize();
    const vpW = vp?.width ?? 1024;
    const vpH = vp?.height ?? 1366;
    const box = await ctaLink.boundingBox();
    expect(box, 'CTA bounding box must be available').not.toBeNull();
    if (box) {
      expect(box.y, 'CTA must not be above the viewport top').toBeGreaterThanOrEqual(0);
      expect(box.y + box.height, 'CTA must not exceed the viewport bottom').toBeLessThanOrEqual(vpH + 0.5);
      expect(box.x, 'CTA must not be pushed off the left edge').toBeGreaterThanOrEqual(0);
      expect(box.x + box.width, 'CTA must not be pushed off the right edge').toBeLessThanOrEqual(vpW + 0.5);
    }
  });
});

