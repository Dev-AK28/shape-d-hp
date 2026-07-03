import { test, expect } from '@playwright/test';
import { expectPainted } from './helpers';

// #312/#316: トップページの旧セクション（About / MissionVision / ShowcaseSection）と cosmic 背景を
// 撤去したため、それらに紐づく scroll-animation テスト（about/vision reveal・showcase pin/scrub 等）は
// 撤去。トップページの各参照セクションの演出検証は e2e/top-*.spec.ts が担う。
// ここでは (a) トップの PageLoader 無効化、(b) velocity-skew ターゲット（下層）、
// (c) 下層ページの ScrollReveal を検証する。

test.describe('Scroll animations — top page loader disabled (#312)', () => {
  test('does not show the page loader on the top page under reduced motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await page.waitForLoadState('load');

    // #312: PageLoader はトップページで無効（SubPageEffects）。reduced-motion でも同様。
    await expect(page.getByTestId('page-loader')).toHaveCount(0);
  });
});

/**
 * velocity skew ターゲット更新の回帰テスト — Issue #185 / #312
 *
 * velocity-skew はトップページでは無効化（#312）され、下層ページでのみ動作する。
 * SmoothScrollProvider の MutationObserver がターゲット（[data-velocity-content]、template.tsx が
 * 全ルートに付与）を再検出できる前提として、SPA ルート遷移後も要素が存在することを確認する。
 */
test.describe('velocity skew target — SPA route transition (#185)', () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test('[data-velocity-content] が下層ページで存在する', async ({ page }) => {
    await page.goto('/services');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('[data-velocity-content]')).toHaveCount(1);
  });

  test('[data-velocity-content] がトップ→下層のルート遷移後も存在する', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('load');

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
