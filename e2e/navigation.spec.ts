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
    // #151: SPA client nav must not remount content at opacity 0 (mobile Lenis)
    await expectPainted(page.getByRole('heading', { name: 'Human Solution' }));
  });

  test('SPA hamburger nav to /works paints below-fold content (#151)', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('page-loader')).toHaveCount(0, { timeout: 5000 });

    const nav = page.getByRole('navigation');
    await nav.getByRole('button', { name: /メニューを開く/ }).click();
    await nav.getByRole('link', { name: '実績' }).click();

    await expect(page).toHaveURL(/\/works$/);
    await expect(page.locator('main h1').first()).toContainText('WORKS');
    await expectPainted(page.getByRole('heading', { name: 'CONCEPT WORKS' }));
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

test.describe('375px SPA client nav — expectPainted (#151)', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test('hamburger → /services paints below-fold content', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('page-loader')).toHaveCount(0, { timeout: 5000 });

    const nav = page.getByRole('navigation');
    await nav.getByRole('button', { name: /メニューを開く/ }).click();
    await nav.getByRole('link', { name: '商品・サービス' }).click();

    await expect(page).toHaveURL(/\/services$/);
    await expect(page.locator('main h1').first()).toContainText('SERVICES');
    await expectPainted(page.getByRole('heading', { name: 'Human Solution' }));
  });

  test('hamburger → /works paints below-fold content', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('page-loader')).toHaveCount(0, { timeout: 5000 });

    const nav = page.getByRole('navigation');
    await nav.getByRole('button', { name: /メニューを開く/ }).click();
    await nav.getByRole('link', { name: '実績' }).click();

    await expect(page).toHaveURL(/\/works$/);
    await expect(page.locator('main h1').first()).toContainText('WORKS');
    await expectPainted(page.getByRole('heading', { name: 'CONCEPT WORKS' }));
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
