import { expect, test } from '@playwright/test';
import { expectPainted, waitForHomePageReady } from './helpers';

const NAV_ITEMS = [
  { name: 'ホーム', href: '/', urlPattern: /\/$/ },
  { name: '商品・サービス', href: '/services', urlPattern: /\/services$/ },
  { name: '実績', href: '/works', urlPattern: /\/works$/ },
  { name: '制作の流れ', href: '/process', urlPattern: /\/process$/ },
  { name: '哲学', href: '/philosophy', urlPattern: /\/philosophy$/ },
  { name: 'お問い合わせ', href: '/contact', urlPattern: /\/contact$/ },
] as const;

test.describe('Navigation', () => {
  for (const item of NAV_ITEMS) {
    test(`navigates to ${item.name} (${item.href})`, async ({ page }) => {
      await page.goto('/');
      await waitForHomePageReady(page);

      await page.getByRole('navigation').getByRole('link', { name: item.name }).click();

      await expect(page).toHaveURL(item.urlPattern);

      if (item.href === '/services') {
        await expect(page.locator('main h1').first()).toContainText('SERVICES');
        await expect(page.getByTestId('page-header-subtitle')).toContainText('商品・サービス');
        await expect(page.locator('main section').first().getByRole('img', { name: 'SHAPE∞D Logo' })).toHaveCount(0);
      }

      if (item.href === '/works') {
        await expect(page.locator('main h1').first()).toContainText('WORKS');
        await expect(page.getByTestId('page-header-subtitle')).toContainText('実績');
        await expect(page.locator('main section').first().getByRole('img', { name: 'SHAPE∞D Logo' })).toHaveCount(0);
      }
    });
  }
});

test.describe('Navigation mobile layout', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('uses a compact header with 44px menu tap target', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('page-loader')).toHaveCount(0, { timeout: 5000 });
    await expect(
      page.getByRole('heading', {
        level: 1,
        name: /AIで効率化し、.*本来の創造に集中する環境を作る。/,
      }),
    ).toBeVisible();

    const nav = page.getByRole('navigation');
    const navBox = await nav.boundingBox();

    // Pre-compact mobile bar was ~88px (py-5 + 48px logo)
    expect(navBox?.height).toBeLessThan(80);

    const menuButton = nav.getByRole('button', { name: /メニューを/ });
    const buttonBox = await menuButton.boundingBox();

    expect(buttonBox?.width).toBeGreaterThanOrEqual(44);
    expect(buttonBox?.height).toBeGreaterThanOrEqual(44);
  });

  test('opens hamburger menu and closes on link tap', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('page-loader')).toHaveCount(0, { timeout: 5000 });

    const nav = page.getByRole('navigation');
    const menuButton = nav.getByRole('button', { name: /メニューを開く/ });

    await menuButton.click();

    await expect(nav.getByRole('button', { name: /メニューを閉じる/ })).toBeVisible();
    await expect(nav.getByRole('link', { name: '商品・サービス' })).toBeVisible();

    // spec: 開いている間 document.body.style.overflow = 'hidden'
    await expect.poll(() => page.evaluate(() => document.body.style.overflow)).toBe('hidden');

    await nav.getByRole('link', { name: '商品・サービス' }).click();
    await expect(page).toHaveURL(/\/services$/);
    await expect(page.locator('main h1').first()).toContainText('SERVICES');
    // #180: SPA nav uses scroll reveal on mobile; scroll to below-fold content then check
    const humanSolution390 = page.getByRole('heading', { name: 'Human Solution' });
    await humanSolution390.evaluate((el) => el.scrollIntoView({ behavior: 'instant', block: 'center' }));
    await expectPainted(humanSolution390, 5000);
  });

  test('SPA hamburger nav to /works: below-fold content reveals on scroll (#151 / #180)', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('page-loader')).toHaveCount(0, { timeout: 5000 });

    const nav = page.getByRole('navigation');
    await nav.getByRole('button', { name: /メニューを開く/ }).click();
    await nav.getByRole('link', { name: '実績' }).click();

    await expect(page).toHaveURL(/\/works$/);
    await expect(page.locator('main h1').first()).toContainText('WORKS');
    const conceptWorks390 = page.getByRole('heading', { name: 'CONCEPT WORKS' });
    await conceptWorks390.evaluate((el) => el.scrollIntoView({ behavior: 'instant', block: 'center' }));
    await expectPainted(conceptWorks390, 5000);
  });

  test('closes hamburger menu with Escape key', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('page-loader')).toHaveCount(0, { timeout: 5000 });

    const nav = page.getByRole('navigation');
    await nav.getByRole('button', { name: /メニューを開く/ }).click();
    await expect(nav.getByRole('link', { name: '哲学' })).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(nav.getByRole('link', { name: '哲学' })).toHaveCount(0);
  });

  /**
   * Regression test for Issue #166 — Navigation safe-area-inset-top compensation.
   *
   * Two assertions:
   * 1. The inner div class attribute contains `safe-area-inset-top` — detects accidental
   *    removal of the env() formula even when safe-area resolves to 0 in Playwright viewports.
   * 2. Computed padding-top >= 12px — verifies no-notch baseline (max(0.75rem, 0) = 12px).
   *
   * Actual notch-device behaviour (safe-area > 0) is simulated via CSS injection in the
   * companion test below. Playwright cannot control env() variables natively (#166).
   */
  test('Navigation padding-top includes safe-area-inset-top formula (#166)', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('page-loader')).toHaveCount(0, { timeout: 5000 });

    const nav = page.getByRole('navigation');
    // The inner div carries the pt-[max(0.75rem,env(safe-area-inset-top,0px))] class.
    // Use `> div` (direct child only) to avoid matching nested divs if the nav structure changes.
    const innerDiv = nav.locator('> div').first();

    const className = (await innerDiv.getAttribute('class')) ?? '';
    expect(className).toContain('safe-area-inset-top');

    // On standard Playwright viewport (safe-area = 0), padding-top == 0.75rem == 12px.
    const paddingTop = await innerDiv.evaluate(
      (el) => parseFloat(getComputedStyle(el).paddingTop),
    );
    expect(paddingTop).toBeGreaterThanOrEqual(12);
  });

  /**
   * CSS-injection simulation for Issue #166 — notch scenario.
   *
   * env(safe-area-inset-top) is always 0 in standard Playwright viewports, so we inject
   * an explicit padding-top (44px — typical iPhone notch/Dynamic Island clearance) via
   * page.addStyleTag with !important to simulate a notch device. We then verify that the
   * Navigation height grows beyond the no-notch baseline (<80px), confirming the layout
   * correctly accommodates safe-area padding when it is non-zero.
   *
   * NOTE: Production CSS does NOT use !important. This test cannot detect regressions
   * where a higher-specificity rule silently overrides the safe-area formula on real devices.
   * See Issue #166 for tracking.
   */
  test('Navigation height grows with simulated safe-area-inset-top of 44px (#166)', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('page-loader')).toHaveCount(0, { timeout: 5000 });

    const nav = page.getByRole('navigation');
    const baselineBox = await nav.boundingBox();
    expect(baselineBox, 'baseline nav must be rendered').not.toBeNull();

    // Simulate env(safe-area-inset-top) = 44px (iPhone notch / Dynamic Island clearance).
    // Override the inner div padding to max(0.75rem, 44px) = 44px.
    // NOTE: <nav> carries role="navigation" implicitly; it does NOT have an explicit role attribute,
    // so the selector must be `nav > div:first-child`, not `nav[role="navigation"] > div`.
    await page.addStyleTag({
      content: 'nav > div:first-child { padding-top: 44px !important; }',
    });

    const simulatedBox = await nav.boundingBox();

    // With 44px padding (vs 12px baseline), the nav must be taller than the no-notch threshold.
    expect(simulatedBox?.height).toBeGreaterThan(80);
    // Growth must be at least the injected delta (44 - 12 = 32px).
    expect((simulatedBox?.height ?? 0) - (baselineBox?.height ?? 0)).toBeGreaterThanOrEqual(32);
  });

  test('closes hamburger menu when viewport expands to 768px', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('page-loader')).toHaveCount(0, { timeout: 5000 });

    const nav = page.getByRole('navigation');
    await nav.getByRole('button', { name: /メニューを開く/ }).click();
    await expect(nav.getByRole('link', { name: '哲学' })).toBeVisible();

    // spec: 開いている間 document.body.style.overflow = 'hidden'
    await expect.poll(() => page.evaluate(() => document.body.style.overflow)).toBe('hidden');

    // viewport を 768px 以上に拡大 — matchMedia change event を発火させメニューを閉じる
    await page.setViewportSize({ width: 768, height: 844 });

    // 768px では desktop nav が表示されるためリンクロールでは判定できない。
    // Framer Motion が #mobile-nav-menu を DOM から除去するまで待機。
    await expect(page.locator('#mobile-nav-menu')).toHaveCount(0);

    // spec: スクロールロックが解除されること
    await expect.poll(() => page.evaluate(() => document.body.style.overflow)).not.toBe('hidden');
  });
});

// #180: SPA nav on mobile uses scroll reveal (staticReveal=false after isReady).
// Below-fold content reveals when scrolled; verify scroll-driven reveal works after SPA nav.
test.describe('375px SPA client nav — scroll reveal (#151 / #180)', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test('hamburger → /services: below-fold content reveals on scroll', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('page-loader')).toHaveCount(0, { timeout: 5000 });

    const nav = page.getByRole('navigation');
    await nav.getByRole('button', { name: /メニューを開く/ }).click();
    await nav.getByRole('link', { name: '商品・サービス' }).click();

    await expect(page).toHaveURL(/\/services$/);
    await expect(page.locator('main h1').first()).toContainText('SERVICES');
    const humanSolution = page.getByRole('heading', { name: 'Human Solution' });
    await humanSolution.evaluate((el) => el.scrollIntoView({ behavior: 'instant', block: 'center' }));
    await expectPainted(humanSolution, 5000);
  });

  test('hamburger → /works: below-fold content reveals on scroll', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('page-loader')).toHaveCount(0, { timeout: 5000 });

    const nav = page.getByRole('navigation');
    await nav.getByRole('button', { name: /メニューを開く/ }).click();
    await nav.getByRole('link', { name: '実績' }).click();

    await expect(page).toHaveURL(/\/works$/);
    await expect(page.locator('main h1').first()).toContainText('WORKS');
    const conceptWorks = page.getByRole('heading', { name: 'CONCEPT WORKS' });
    await conceptWorks.evaluate((el) => el.scrollIntoView({ behavior: 'instant', block: 'center' }));
    await expectPainted(conceptWorks, 5000);
  });
});

test.describe('Navigation desktop layout', () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test('preserves desktop header sizing', async ({ page }) => {
    await page.goto('/');
    await waitForHomePageReady(page);

    const nav = page.getByRole('navigation');
    const navBox = await nav.boundingBox();

    expect(navBox?.height).toBeGreaterThanOrEqual(80);
  });
});
