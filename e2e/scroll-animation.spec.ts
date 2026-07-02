import { test, expect } from '@playwright/test';
import { expectPainted, waitForHomePageReady } from './helpers';
import { SHOWCASE_HORIZONTAL } from '../lib/scroll/animation-tokens';
import { SERVICE_LIST } from '../lib/data/services';

test.describe('Scroll animations', () => {
  test('reveals about section when scrolled into view', async ({ page }) => {
    await page.goto('/');
    await waitForHomePageReady(page);

    const aboutHeading = page.locator('h2').filter({ hasText: 'ABOUT' });
    await aboutHeading.scrollIntoViewIfNeeded();

    await expect(aboutHeading).toBeVisible({ timeout: 5000 });
  });

  test('reveals vision quotes when scrolled into view', async ({ page }) => {
    await page.goto('/');
    await waitForHomePageReady(page);

    const visionHeading = page.locator('h2').filter({ hasText: 'VISION' });
    await visionHeading.scrollIntoViewIfNeeded();

    await expect(visionHeading).toBeVisible({ timeout: 5000 });
    await expect(page.locator('[data-vision-quote]').first()).toBeVisible();
  });

  test('shows about timeline immediately under reduced motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await expect(page.getByTestId('page-loader')).toHaveCount(0);

    const firstTimelineItem = page.locator('[data-timeline-item]').first();
    await firstTimelineItem.scrollIntoViewIfNeeded();

    await expect(firstTimelineItem).toBeVisible();
    await expect(firstTimelineItem).toHaveCSS('opacity', '1');
  });

  test('disables page loader under reduced motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await expect(page.getByTestId('page-loader')).toHaveCount(0);
  });
});

/**
 * ShowcaseSection smoke tests — Issue #215.
 *
 * Verifies section presence and card visibility via reduced-motion (static) path,
 * avoiding the need to simulate GSAP pin+scrub in E2E.
 */
test.describe('ShowcaseSection — smoke (#215)', () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test('section と最初のカードが reduced-motion で表示される', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const section = page.locator('[aria-label="サービス紹介"]');
    await section.scrollIntoViewIfNeeded();
    await expect(section).toBeVisible({ timeout: 5000 });

    const firstCard = page.locator('[data-showcase-card]').first();
    await firstCard.scrollIntoViewIfNeeded();
    await expect(firstCard).toBeVisible({ timeout: 5000 });
    // staticReveal must render at opacity:1 — guards against cards stuck at opacity:0.
    await expect(firstCard).toHaveCSS('opacity', '1', { timeout: 5000 });
  });

  test('モバイル (375px) で全カードが縦積みで存在する', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('[data-showcase-card]')).toHaveCount(4, { timeout: 8000 });

    // On mobile the vertical stack must reveal each card at opacity:1 (no horizontal pin).
    const firstCard = page.locator('[data-showcase-card]').first();
    await firstCard.scrollIntoViewIfNeeded();
    await expect(firstCard).toHaveCSS('opacity', '1', { timeout: 5000 });
  });
});

/**
 * Desktop scroll reveal regression tests — Issue #153.
 *
 * Verifies that `ScrollReveal`-wrapped elements on sub-pages animate in
 * after a direct URL load on desktop. Before the fix, `ScrollReveal` mounted
 * with `initial=false` (staticReveal=true during SSR) and never re-evaluated
 * `initial` after hydration, so whileInView reveals were silently disabled.
 *
 * The key={staticReveal ? 'static' : 'reveal'} remount in ScrollReveal.tsx
 * forces framer-motion to re-evaluate `initial` once `isReady=true` on desktop.
 * Content components (ServicesContent, WorksContent, etc.) received the same
 * key pattern on their top-level motion.div elements in this PR (#153).
 * E2E coverage for content components is also added in this suite below.
 */
/**
 * velocity skew ターゲット更新の回帰テスト — Issue #185
 *
 * SPA ルート遷移後も [data-velocity-content] が DOM に存在することを確認する。
 * この属性の存在は、SmoothScrollProvider の MutationObserver がターゲットを
 * 再検出できる前提条件である（属性が存在しなければ MutationObserver が
 * skewSetter を再生成できず velocity skew が停止する）。
 * MutationObserver の内部動作そのものは E2E では検証せず、ユニットテストの対象とする。
 */
test.describe('velocity skew target — SPA route transition (#185)', () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test('[data-velocity-content] が初期ロード後に存在する', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('[data-velocity-content]')).toHaveCount(1);
  });

  test('[data-velocity-content] がルート遷移後も存在する', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await page.goto('/services');
    await page.waitForLoadState('networkidle');

    // Explicit timeout guards against slow CI where template.tsx remount
    // may lag behind networkidle (React Suspense async boundary).
    await expect(page.locator('[data-velocity-content]')).toHaveCount(1, { timeout: 8000 });
  });
});

test.describe('desktop 1280px — ScrollReveal after direct URL load (#153)', () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test('/contact: below-fold form is painted after scrolling', async ({ page }) => {
    await page.goto('/contact');
    // networkidle ensures React hydration + isReady=true state propagation
    await page.waitForLoadState('networkidle');

    // The contact form is wrapped in <ScrollReveal delay={0.15}> below the
    // PageHeader section (min-h-[60vh]), so it starts below the fold.
    const nameInput = page.getByLabel('お名前');
    // Use block:'center' so the element lands in the middle of the viewport,
    // ensuring it is ≥80px inside every edge (scrollViewport.margin='-80px')
    // and the IntersectionObserver threshold fires reliably on slow CI machines.
    await nameInput.evaluate((el) => el.scrollIntoView({ block: 'center', behavior: 'instant' }));

    // Allow for framer transition (1.4s) + delay (0.15s) + CI headroom → 5s.
    await expectPainted(nameInput, 5000);
  });

  // Content component regression: ServicesContent top-level section motion.div
  // now has key={staticReveal ? 'static-digital' : 'reveal-digital'}, which
  // triggers remount on isReady→true transition and enables whileInView (#153).
  test('/services: Digital Solution section is painted after scrolling', async ({ page }) => {
    await page.goto('/services');
    await page.waitForLoadState('networkidle');

    // "Digital Solution" is an h3 inside ServicesContent — below the PageHeader fold.
    const heading = page.getByRole('heading', { name: 'Digital Solution' });
    // Use block:'start' so the heading (and its parent motion.div) land at the
    // TOP of the viewport. The parent motion.div spans ~900px; with
    // scrollViewport.margin='-80px' and amount:0.2, we need ≥180px of the div
    // inside the effective viewport (80→720px). block:'start' gives 640px of
    // overlap (≈71%), ensuring IntersectionObserver fires reliably in CI.
    await heading.evaluate((el) => el.scrollIntoView({ block: 'start', behavior: 'instant' }));

    // Allow for framer transition (1.4s) + CI headroom → 8s.
    await expectPainted(heading, 8000);
  });
});

/**
 * ShowcaseSection desktop horizontal scroll (#249).
 *
 * Verifies that the GSAP pin+scrub timeline (`enableHorizontal` path) actually
 * translates the panels container on desktop. Mirrors the
 * 'Philosophy desktop horizontal scroll (#184)' pattern in philosophy.spec.ts.
 *
 * Intermediate per-step transform checks detect GSAP freezes / scrub regressions
 * before the final card is reached, consistent with PR #285 (Issue #239).
 */
test.describe('ShowcaseSection desktop horizontal scroll (#249)', () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  // Shared helper: co-fetch [translateX, innerWidth] from the panels container in a
  // single evaluate call to avoid stale snapshot divergence (mirrors PR #285 co-fetch pattern).
  // Defined as an arrow function so Playwright serializes and executes it in the browser context.
  const readPanelsTx = (): [number, number] => {
    const card = document.querySelector('[data-showcase-card]');
    const panelsRef = card?.parentElement;
    const m = new DOMMatrix(getComputedStyle(panelsRef ?? document.body).transform);
    return [m.m41, window.innerWidth];
  };

  const CARD_COUNT = SERVICE_LIST.length; // 4 (ai-product / dx / web-app / coaching)
  // + 2500 ms CI headroom after scrub settles (mirrors philosophy.spec.ts pattern).
  const scrubTimeout = Math.ceil(SHOWCASE_HORIZONTAL.scrub * 1000) + 2500; // ≈ 4300 ms

  test('1スクロールで第2カードへ進む (GSAP pin+scrub が動作している)', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Baseline: confirm all cards are rendered.
    await expect(page.locator('[data-showcase-card]')).toHaveCount(CARD_COUNT);

    // Scroll section into GSAP pin zone (block:'start'). globals.css sets scroll-padding-top:88px
    // on desktop, so the section top lands 88px below the viewport top — not exactly 'top top'.
    // The 80% threshold absorbs this gap; the pin engages after scrollBy fires.
    const section = page.locator('[aria-label="サービス紹介"]');
    await section.evaluate((el) => el.scrollIntoView({ behavior: 'instant', block: 'start' }));

    await page.evaluate(() => window.scrollBy(0, window.innerWidth));

    // 80%: absorbs scroll-padding-top offset (88px) and one full scrub lag simultaneously.
    await expect(async () => {
      const [tx, iw] = await page.evaluate(readPanelsTx);
      expect(tx).toBeLessThan(-(iw * 0.8));
    }).toPass({ timeout: scrubTimeout });
  });

  test('3スクロールで全4カードを巡回できる (scrollDistance = 3 × viewport width)', async ({ page }) => {
    test.setTimeout(60_000);

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Baseline: confirm card count.
    await expect(page.locator('[data-showcase-card]')).toHaveCount(CARD_COUNT);

    // Same scroll-padding-top reasoning as the single-scroll test above.
    const section = page.locator('[aria-label="サービス紹介"]');
    await section.evaluate((el) => el.scrollIntoView({ behavior: 'instant', block: 'start' }));

    // Scroll one panel at a time and verify cumulative progress after each step.
    // 80% per step: absorbs scroll-padding-top offset (88px) + one full scrub lag,
    // catching GSAP freeze or scrub regression at the earliest possible point.
    for (let i = 1; i < CARD_COUNT; i++) {
      await page.evaluate(() => window.scrollBy(0, window.innerWidth));
      await expect(async () => {
        const [tx, iw] = await page.evaluate(readPanelsTx);
        expect(tx).toBeLessThan(-(iw * i * 0.8));
      }).toPass({ timeout: scrubTimeout });
    }
  });
});
