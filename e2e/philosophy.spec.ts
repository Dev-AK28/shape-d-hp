import { test, expect } from '@playwright/test';
import { expectPainted } from './helpers';
import { PHILOSOPHY_HORIZONTAL } from '../lib/scroll/animation-tokens';

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
    await page.goto('/philosophy');
    await page.waitForLoadState('networkidle');

    const panelCount = PANEL_TITLES.length;
    const innerWidth = await page.evaluate(() => window.innerWidth);

    // Scroll through all remaining panels (panelCount - 1 steps of innerWidth each).
    for (let i = 1; i < panelCount; i++) {
      await page.evaluate(() => window.scrollBy(0, window.innerWidth));
    }

    // After (panelCount - 1) × innerWidth total scroll, GSAP should have translated panelsRef
    // by at least (panelCount - 2) × innerWidth (allowing one panel of scrub lag at the end).
    await expect(async () => {
      const tx = await page.evaluate(() => {
        const panel = document.querySelector('[data-philosophy-panel]');
        const panelsRef = panel?.parentElement;
        const m = new DOMMatrix(getComputedStyle(panelsRef ?? document.body).transform);
        return m.m41;
      });
      expect(tx).toBeLessThan(-(innerWidth * (panelCount - 2)));
    }).toPass({ timeout: Math.ceil(PHILOSOPHY_HORIZONTAL.scrub * 1000) + 2500 });
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

    const lastHeading = page.locator('[data-philosophy-panel]').nth(5).locator('h2');
    await lastHeading.evaluate((el) => el.scrollIntoView({ behavior: 'instant', block: 'center' }));

    await expect(async () => {
      await expect(dots.nth(5)).toHaveAttribute('data-active', 'true');
      await expect(dots.first()).toHaveAttribute('data-active', 'false');
    }).toPass({ timeout: 5000 });
  });
});
