import { test, expect } from '@playwright/test';
import { expectPainted } from './helpers';
import { ANIMATION_DURATION, PHILOSOPHY_HORIZONTAL } from '../lib/scroll/animation-tokens';

// String values are no longer used in test assertions — TextReveal's Intl.Segmenter path
// inserts U+00A0 (non-breaking space) between per-character spans, breaking Playwright
// hasText filters in headless Chromium. Only .length is referenced; panels are targeted
// by nth(i) instead of hasText matching.
const PANEL_TITLES = [
  'SELF-CONGRUENCE',
  'HUMAN EXPRESSION',
  'AUTHENTIC',
  'PROMOTION',
  'EXPRESSION DEVELOPMENT',
  'Development / Depth / Discovery',
] as const;

test.describe('Philosophy page', () => {
  test('renders full-screen SHAPE-D panels with overlay letters', async ({ page }) => {
    await page.goto('/philosophy');
    await page.waitForLoadState('networkidle');

    await expect(page.getByRole('heading', { level: 1, name: /哲学/ })).toBeAttached();

    const panels = page.locator('[data-philosophy-panel]');
    await expect(panels).toHaveCount(6);

    for (const letter of ['S', 'H', 'A', 'P', 'E', 'D']) {
      await expect(page.locator('[data-overlay-letter]').filter({ hasText: letter })).toHaveCount(1);
    }
  });

  test('shows S section content on initial load', async ({ page }) => {
    await page.goto('/philosophy');
    await page.waitForLoadState('networkidle');

    const firstPanel = page.locator('[data-philosophy-panel]').first();
    await expect(firstPanel.locator('h2').filter({ hasText: 'SELF-CONGRUENCE' })).toBeVisible();
    await expect(firstPanel.getByText('自己一致', { exact: true })).toBeVisible();
  });

  test('works under reduced motion without GSAP-only regressions', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/philosophy');
    await page.waitForLoadState('networkidle');

    const panels = page.locator('[data-philosophy-panel]');
    await expect(panels).toHaveCount(6);

    const lastPanel = panels.nth(5);
    await lastPanel.scrollIntoViewIfNeeded();
    await expect(page.getByText('多様なDの意味')).toBeVisible();
  });
});

// ── Desktop horizontal scroll (#184) ────────────────────────────────────────
// Regression guard for PR #181's GSAP pin+scrub horizontal layout.
// timeout = Math.ceil(scrub * 1000) + 2500ms CI headroom per assertion.

test.describe('Philosophy desktop horizontal scroll (#184)', () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test('scrolling advances to second panel (H: HUMAN EXPRESSION)', async ({ page }) => {
    await page.goto('/philosophy');
    await page.waitForLoadState('networkidle');

    // Scroll by one viewport width — GSAP pin translates panels horizontally.
    await page.evaluate(() => window.scrollBy(0, window.innerWidth));

    // GSAP scrub lag = PHILOSOPHY_HORIZONTAL.scrub (1.8s); timeout = scrub*1000 + 2500ms CI headroom.
    // toBeInViewport() returns ratio 0 for overflow:hidden + position:fixed pin containers in CI
    // (IntersectionObserver clips at the overflow boundary before the transform is considered).
    // Instead, read the CSS translateX of panelsRef directly — GSAP applies it; >80% of
    // one viewport width means the second panel is in view.
    await expect(async () => {
      const [tx, iw] = await page.evaluate(() => {
        const panel = document.querySelector('[data-philosophy-panel]');
        const panelsRef = panel?.parentElement;
        const m = new DOMMatrix(getComputedStyle(panelsRef ?? document.body).transform);
        return [m.m41, window.innerWidth] as [number, number];
      });
      expect(tx).toBeLessThan(-(iw * 0.8));
    }).toPass({ timeout: Math.ceil(PHILOSOPHY_HORIZONTAL.scrub * 1000) + 2500 });
  });

  test('can navigate through all 6 panels (scrollDistance = 5 × viewport width)', async ({ page }) => {
    // Worst-case: 6 × scrubTimeout (25.8s) + networkidle + Next.js render headroom.
    // Exceeds the 30s Playwright default; set explicitly to avoid false CI timeouts.
    test.setTimeout(60_000);

    await page.goto('/philosophy');
    await page.waitForLoadState('networkidle');

    const panelCount = PANEL_TITLES.length;
    const dots = page.locator('[data-testid="philosophy-progress-dots"] > span');
    // timeout = Math.ceil(scrub * 1000) + 2500ms CI headroom (mirrors single-panel test pattern).
    const scrubTimeout = Math.ceil(PHILOSOPHY_HORIZONTAL.scrub * 1000) + 2500;

    // Baseline: verify dot count and initial active state before scrolling.
    await expect(dots).toHaveCount(panelCount);
    await expect(dots.first()).toHaveAttribute('data-active', 'true');

    // Scroll one panel at a time and verify GSAP advanced to each intermediate panel (#239).
    // Uses dots data-active as a lightweight proxy for GSAP progress — identical mechanism to
    // the 'PhilosophyProgressDots active index tracks' test. Also verifies the previous dot
    // deactivates, guarding against a stuck multi-active state across panels 1→2 ... 4→5.
    for (let i = 1; i < panelCount; i++) {
      await page.evaluate(() => window.scrollBy(0, window.innerWidth));
      await expect(async () => {
        await expect(dots.nth(i)).toHaveAttribute('data-active', 'true');
        await expect(dots.nth(i - 1)).toHaveAttribute('data-active', 'false');
      }).toPass({ timeout: scrubTimeout });
    }

    // Final CSS transform guard: re-fetch innerWidth inside toPass to avoid stale snapshot
    // diverging from the live value used by scrollBy (e.g. if a scrollbar appears mid-test).
    // Mirrors the [tx, iw] co-fetch pattern in 'scrolling advances to second panel'.
    await expect(async () => {
      const [tx, iw] = await page.evaluate(() => {
        const panel = document.querySelector('[data-philosophy-panel]');
        const panelsRef = panel?.parentElement;
        const m = new DOMMatrix(getComputedStyle(panelsRef ?? document.body).transform);
        return [m.m41, window.innerWidth] as [number, number];
      });
      expect(tx).toBeLessThan(-(iw * (panelCount - 2)));
    }).toPass({ timeout: scrubTimeout });
  });

  test('PhilosophyProgressDots active index tracks horizontal scroll progress', async ({ page }) => {
    await page.goto('/philosophy');
    await page.waitForLoadState('networkidle');

    const dots = page.locator('[data-testid="philosophy-progress-dots"] > span');
    await expect(dots).toHaveCount(6);

    // Initially first dot is active.
    await expect(dots.first()).toHaveAttribute('data-active', 'true');
    await expect(dots.nth(1)).toHaveAttribute('data-active', 'false');

    // Scroll to second panel.
    await page.evaluate(() => window.scrollBy(0, window.innerWidth));

    // After GSAP scrub settles, second dot becomes active.
    await expect(async () => {
      await expect(dots.nth(1)).toHaveAttribute('data-active', 'true');
      await expect(dots.first()).toHaveAttribute('data-active', 'false');
    }).toPass({ timeout: Math.ceil(PHILOSOPHY_HORIZONTAL.scrub * 1000) + 2500 });
  });

  test('closing CTA section appears after scrolling through all panels', async ({ page }) => {
    await page.goto('/philosophy');
    await page.waitForLoadState('networkidle');

    // Scroll past the pinned section to reveal the closing CTA below.
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    await expect(page.getByText('心理学とエンジニアリングの融合が')).toBeVisible({ timeout: 5000 });
    // Scope to main — the nav and footer also contain links named 'お問い合わせ'.
    await expect(page.getByRole('main').getByRole('link', { name: 'お問い合わせ' })).toBeVisible({ timeout: 5000 });
  });

  // Issue #254: gsapActiveIndex stale-value guard (symmetric to usePanelActiveIndex #250 round 2).
  // After advancing to a non-zero panel on desktop, resize to mobile then back to desktop.
  // The prevEnableHorizontal useState guard must fire setGsapActiveIndex(0) synchronously so
  // that dot 0 is active immediately on re-entry to desktop mode — before the new
  // ScrollTrigger's onUpdate has a chance to fire with the scroll position at the top.
  test('progress dots reset to index 0 after desktop→mobile→desktop resize (#254)', async ({ page }) => {
    await page.goto('/philosophy');
    await page.waitForLoadState('networkidle');

    const dots = page.locator('[data-testid="philosophy-progress-dots"] > span');
    await expect(dots).toHaveCount(6);

    // Scroll to advance gsapActiveIndex to at least panel 2 (2 × innerWidth).
    await page.evaluate(() => window.scrollBy(0, window.innerWidth * 2));

    // Wait for GSAP scrub to settle so gsapActiveIndex is truly non-zero.
    await expect(async () => {
      await expect(dots.nth(2)).toHaveAttribute('data-active', 'true');
    }).toPass({ timeout: Math.ceil(PHILOSOPHY_HORIZONTAL.scrub * 1000) + 2500 });

    // Scroll back to top so the page position is 0 on resize.
    await page.evaluate(() => window.scrollTo(0, 0));

    // Resize to mobile — enableHorizontal becomes false; gsapActiveIndex state is
    // now "abandoned" (ioActiveIndex drives the UI). Its internal value is still 2.
    await page.setViewportSize({ width: 375, height: 812 });

    // Resize back to desktop — enableHorizontal becomes true again.
    // The prevEnableHorizontal guard fires setGsapActiveIndex(0) synchronously so
    // dot 0 must be active immediately without waiting for onUpdate.
    await page.setViewportSize({ width: 1280, height: 800 });

    // timeout = scrub*1000 + 2500ms CI headroom (mirrors desktop test pattern).
    await expect(async () => {
      await expect(dots.first()).toHaveAttribute('data-active', 'true');
      await expect(dots.nth(2)).toHaveAttribute('data-active', 'false');
    }).toPass({ timeout: Math.ceil(PHILOSOPHY_HORIZONTAL.scrub * 1000) + 2500 });
  });
});

// ── Mobile vertical snap (#184) ──────────────────────────────────────────────
// Verifies that each of the 6 panels is painted (opacity ≈ 1) on 375px mobile
// after scrollIntoView, and that no horizontal overflow is introduced.

test.describe('Philosophy mobile vertical snap (#184)', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test('each panel is painted after scrollIntoView on mobile (375px)', async ({ page }) => {
    await page.goto('/philosophy');
    await page.waitForLoadState('networkidle');

    // Iterate by index — hasText filtering on h2 is unreliable when TextReveal renders
    // per-character motion.span elements with U+00A0 between words (Intl.Segmenter path).
    for (let i = 0; i < PANEL_TITLES.length; i++) {
      const panel = page.locator('[data-philosophy-panel]').nth(i);
      const heading = panel.locator('h2');
      await heading.evaluate((el) => el.scrollIntoView({ behavior: 'instant', block: 'center' }));
      await expect(heading).toBeVisible({ timeout: 5000 });
      await expectPainted(heading, 5000);
    }
  });

  test('no horizontal overflow on mobile (375px)', async ({ page }) => {
    await page.goto('/philosophy');
    await page.waitForLoadState('networkidle');

    const hasOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth,
    );
    expect(hasOverflow, 'horizontal scroll must not be introduced on mobile').toBe(false);
  });

  // #250 review: this is the only e2e coverage of the usePanelActiveIndex IO path —
  // desktop's progress-dots test above exercises gsapActiveIndex only. Guards against
  // a future regression in the `enabled: !enableHorizontal` wiring (#187) silently
  // breaking mobile dot tracking, which the source-string unit tests cannot detect.
  test('progress dots track scroll position via IntersectionObserver on mobile', async ({ page }) => {
    await page.goto('/philosophy');
    await page.waitForLoadState('networkidle');

    const dots = page.locator('[data-testid="philosophy-progress-dots"] > span');
    await expect(dots).toHaveCount(6);
    await expect(dots.first()).toHaveAttribute('data-active', 'true');

    // Middle panel (#250 review round 2 nit): first/last alone can't catch an
    // off-by-one in bestRatio's "first-wins-ties" logic for a non-edge panel.
    const middleHeading = page.locator('[data-philosophy-panel]').nth(2).locator('h2');
    await middleHeading.evaluate((el) => el.scrollIntoView({ behavior: 'instant', block: 'center' }));

    // timeout = Math.ceil(section * 1000) + 2500ms CI headroom (mirrors desktop test pattern).
    await expect(async () => {
      await expect(dots.nth(2)).toHaveAttribute('data-active', 'true');
      await expect(dots.first()).toHaveAttribute('data-active', 'false');
      await expect(dots.nth(5)).toHaveAttribute('data-active', 'false');
    }).toPass({ timeout: Math.ceil(ANIMATION_DURATION.section * 1000) + 2500 });

    const lastHeading = page.locator('[data-philosophy-panel]').nth(5).locator('h2');
    await lastHeading.evaluate((el) => el.scrollIntoView({ behavior: 'instant', block: 'center' }));

    await expect(async () => {
      await expect(dots.nth(5)).toHaveAttribute('data-active', 'true');
      // dot 2 (previously active) must also deactivate (#250 review round 3 nit).
      await expect(dots.nth(2)).toHaveAttribute('data-active', 'false');
      await expect(dots.first()).toHaveAttribute('data-active', 'false');
    }).toPass({ timeout: Math.ceil(ANIMATION_DURATION.section * 1000) + 2500 });
  });

  // #250 review round 3 suggestion: exercise the enabled false→true transition path
  // in usePanelActiveIndex by resizing from desktop (IO disabled) to mobile (IO enabled).
  // Validates that the prevEnabled-based synchronous reset (useState pattern) correctly
  // initialises the hook to 0 before the first IO callback fires, and that IO then
  // actively tracks the visible panel.
  test('progress dots initialise to 0 and track IO after desktop→mobile resize', async ({ page }) => {
    // Override the describe-level 375px viewport: start at desktop (IO disabled).
    await page.setViewportSize({ width: 1400, height: 900 });
    await page.goto('/philosophy');
    await page.waitForLoadState('networkidle');

    const dots = page.locator('[data-testid="philosophy-progress-dots"] > span');
    await expect(dots).toHaveCount(6);

    // Resize to mobile: enableHorizontal flips true→false, IO becomes enabled (false→true).
    // The prevEnabled useState guard fires setActiveIndex(0) synchronously during render
    // so no stale desktop value leaks into the UI before the first IO callback.
    await page.setViewportSize({ width: 375, height: 812 });

    // After resize the page is at the top — panel 0 is visible — dot 0 must be active.
    await expect(async () => {
      await expect(dots.first()).toHaveAttribute('data-active', 'true');
    }).toPass({ timeout: Math.ceil(ANIMATION_DURATION.section * 1000) + 2500 });

    // Confirm IO is actively tracking by scrolling to middle panel.
    const middleHeading = page.locator('[data-philosophy-panel]').nth(2).locator('h2');
    await middleHeading.evaluate((el) => el.scrollIntoView({ behavior: 'instant', block: 'center' }));

    await expect(async () => {
      await expect(dots.nth(2)).toHaveAttribute('data-active', 'true');
      await expect(dots.first()).toHaveAttribute('data-active', 'false');
    }).toPass({ timeout: Math.ceil(ANIMATION_DURATION.section * 1000) + 2500 });
  });
});
