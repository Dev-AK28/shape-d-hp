import { expect, test } from '@playwright/test';
import { expectPainted, waitForHomePageReady } from './helpers';

// #303: トップページは TopNav（参照HTMLビジュアル + 下層導線維持 — #314 暫定方針）。
// 旧 Navigation は下層ページ（app/(site)/）でのみ表示される。
// 「お問い合わせ」はトップのデスクトップナビでは「ご相談」CTA に置き換え。
const NAV_ITEMS = [
  { name: '商品・サービス', href: '/services', urlPattern: /\/services$/ },
  { name: '実績', href: '/works', urlPattern: /\/works$/ },
  { name: '制作の流れ', href: '/process', urlPattern: /\/process$/ },
  { name: '哲学', href: '/philosophy', urlPattern: /\/philosophy$/ },
  { name: 'ご相談', href: '/contact', urlPattern: /\/contact$/ },
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
    // #304: トップのヒーローマーク（h1「SHAPE∞D」）表示で準備完了を確認
    await expect(page.locator('#hero .hero-mark')).toBeVisible();

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
   * Regression test for Issue #166 — safe-area-inset-top compensation (TopNav 版 — #303).
   *
   * TopNav は Tailwind クラスではなく globals.css の .top-nav ルールで
   * `padding-top: max(28px, env(safe-area-inset-top, 0px))` を適用する。
   * env() 式の除去検知（静的ガード）は tests/design/css-token-sync.test.ts が担う。
   * ここでは no-notch baseline（max(28px, 0) = 28px）を検証する。
   */
  test('TopNav padding-top keeps safe-area baseline of 28px (#166 / #303)', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('page-loader')).toHaveCount(0, { timeout: 5000 });

    const nav = page.getByRole('navigation');
    const paddingTop = await nav.evaluate(
      (el) => parseFloat(getComputedStyle(el).paddingTop),
    );
    expect(paddingTop).toBeGreaterThanOrEqual(28);
  });

  /**
   * CSS-injection simulation for Issue #166 — notch scenario (TopNav 版 — #303).
   *
   * env(safe-area-inset-top) is always 0 in standard Playwright viewports, so we inject
   * an explicit padding-top (88px — max(28px, 88px) 相当) via page.addStyleTag with
   * !important to simulate a notch device, then verify the nav grows accordingly.
   *
   * NOTE: Production CSS does NOT use !important. This test cannot detect regressions
   * where a higher-specificity rule silently overrides the safe-area formula on real devices.
   * See Issue #166 for tracking.
   */
  test('TopNav height grows with simulated safe-area-inset-top (#166 / #303)', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('page-loader')).toHaveCount(0, { timeout: 5000 });

    const nav = page.getByRole('navigation');
    const baselineBox = await nav.boundingBox();
    expect(baselineBox, 'baseline nav must be rendered').not.toBeNull();

    // Simulate env(safe-area-inset-top) = 88px (> 28px baseline).
    // transition: none — .top-nav は padding を 0.6s で transition するため、
    // 遷移中の中間値を計測しないよう無効化する。
    await page.addStyleTag({
      content: '.top-nav { padding-top: 88px !important; transition: none !important; }',
    });

    const injectedPaddingTop = await nav.evaluate(
      (el) => parseFloat(getComputedStyle(el).paddingTop),
    );
    expect(injectedPaddingTop).toBe(88);

    const simulatedBox = await nav.boundingBox();

    expect(simulatedBox?.height).toBeGreaterThan(80);
    // Growth must be at least the injected delta (88 - 28 = 60px).
    expect((simulatedBox?.height ?? 0) - (baselineBox?.height ?? 0)).toBeGreaterThanOrEqual(60);
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
