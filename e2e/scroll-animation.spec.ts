import { test, expect } from '@playwright/test';
import { expectPainted, waitForHomePageReady } from './helpers';

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

    await expect(page.locator('[data-velocity-content]')).toHaveCount(1);
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
