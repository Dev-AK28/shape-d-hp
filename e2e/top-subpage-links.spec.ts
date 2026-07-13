import { expect, test } from './fixtures';
import { waitForHomePageReady } from './helpers';

/**
 * 下層ページ導線の維持（暫定方針）— Issue #314
 *
 * 参照HTML のナビ/フッターは「ロゴ + ご相談」「マーク + コピーライト」のみだが、
 * 暫定方針（2026-07-03 確認）として、ヘッダー（デスクトップ / モバイルメニュー）と
 * フッターで下層ページ（/philosophy, /process, /services, /works, /contact）への導線を
 * 維持する。この spec はその導線が消えないための回帰ガード。最終方針決定後に調整する。
 */

const SUB_PAGES = ['/services', '/works', '/process', '/philosophy', '/contact'] as const;

test.describe('Sub-page links kept on the new top page (#314)', () => {
  test('desktop header exposes links to every sub page + the ご相談 CTA', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');
    await waitForHomePageReady(page);

    const nav = page.getByRole('navigation');
    for (const href of ['/services', '/works', '/process', '/philosophy']) {
      await expect(nav.locator(`a[href="${href}"]`)).toHaveCount(1);
    }
    // ご相談 CTA は /contact へ
    await expect(nav.getByRole('link', { name: 'ご相談' })).toHaveAttribute('href', '/contact');
  });

  test('footer exposes links to every sub page', async ({ page }) => {
    await page.goto('/');
    await waitForHomePageReady(page);

    const footer = page.getByRole('contentinfo');
    for (const href of SUB_PAGES) {
      await expect(footer.locator(`a[href="${href}"]`)).toHaveCount(1);
    }
  });

  test('375px mobile menu navigates to a sub page', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    await waitForHomePageReady(page);

    const nav = page.getByRole('navigation');
    await nav.getByRole('button', { name: 'メニューを開く' }).click();

    const menu = page.locator('#mobile-nav-menu');
    await expect(menu).toBeVisible();
    for (const href of SUB_PAGES) {
      await expect(menu.locator(`a[href="${href}"]`)).toHaveCount(1);
    }

    // モバイルメニューから下層ページへ実際に遷移できる
    await menu.getByRole('link', { name: '哲学' }).click();
    await expect(page).toHaveURL(/\/philosophy$/);
  });

  test('visual: nav keeps the reference ご相談 CTA and shrink-on-scroll behavior', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');
    await waitForHomePageReady(page);

    const nav = page.getByRole('navigation');
    // リンク追加以外の視覚要素（ご相談 CTA・スクロール縮小）は参照HTMLと一致
    await expect(nav.getByRole('link', { name: 'ご相談' })).toBeVisible();
    await expect(nav).not.toHaveClass(/scrolled/);
    await page.mouse.wheel(0, 400);
    await expect(nav).toHaveClass(/scrolled/, { timeout: 5000 });
  });
});
