import { expect, test } from '@playwright/test';

/**
 * CTA セクション #cta（TopCta）+ フッター導線 — Issue #311
 * 参照HTML: lib/design/shape-d-prototype-v4.html L537-L598, L791-L808
 */

test.describe('Top CTA (#311)', () => {
  test('renders eyebrow, copy, note and CTA button', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('page-loader')).toHaveCount(0, { timeout: 5000 });

    const cta = page.locator('#cta');
    await expect(cta.locator('.eyebrow')).toContainText('CONTACT');
    await expect(cta.locator('.cta-copy')).toContainText('構想の段階から');
    await expect(cta.locator('.cta-note')).toContainText('売り込みはしません');
    await expect(cta.getByRole('link', { name: '無料相談を申し込む' })).toHaveAttribute('href', '/contact');
  });

  test('CTA button hover fills the rain background and inverts text color', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');
    await expect(page.getByTestId('page-loader')).toHaveCount(0, { timeout: 5000 });

    const button = page.locator('#cta .cta-button');
    await button.scrollIntoViewIfNeeded();

    // ::after は transform-origin: left の scaleX(0)→(1)。ホバー前は scaleX(0)。
    const afterScaleBefore = await button.evaluate((el) => {
      const t = getComputedStyle(el, '::after').transform;
      return t;
    });
    // matrix(0,0,0,1,0,0) 相当（scaleX 0）または 'none'
    expect(afterScaleBefore === 'none' || afterScaleBefore.includes('matrix(0')).toBeTruthy();

    await button.hover();
    // ホバーで文字色が --ink(#07090d = rgb(7,9,13)) に反転
    await expect(button).toHaveCSS('color', 'rgb(7, 9, 13)');
    // ::after が満ちる（scaleX が 0 より大きくなる）
    await expect
      .poll(async () =>
        button.evaluate((el) => {
          const t = getComputedStyle(el, '::after').transform;
          if (t === 'none') return 0;
          const m = t.match(/matrix\(([^)]+)\)/);
          return m ? parseFloat(m[1].split(',')[0]) : 0;
        }),
      )
      .toBeGreaterThan(0.5);
  });

  test('CTA button navigates to /contact', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('page-loader')).toHaveCount(0, { timeout: 5000 });

    await page.locator('#cta .cta-button').scrollIntoViewIfNeeded();
    await page.locator('#cta .cta-button').click();
    await expect(page).toHaveURL(/\/contact$/);
  });

  test('CTA button shows a focus-visible outline on keyboard focus', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('page-loader')).toHaveCount(0, { timeout: 5000 });

    const outline = await page.locator('#cta .cta-button').evaluate((el) => {
      el.focus();
      return getComputedStyle(el).outlineColor;
    });
    // --rain = rgb(125,156,196)
    expect(outline).toBe('rgb(125, 156, 196)');
  });

  test('footer keeps lower-page links and reference copyright', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('page-loader')).toHaveCount(0, { timeout: 5000 });

    const footer = page.getByRole('contentinfo');
    for (const href of ['/services', '/works', '/process', '/philosophy', '/contact']) {
      await expect(footer.locator(`a[href="${href}"]`)).toHaveCount(1);
    }
    await expect(footer).toContainText('© 2026 SHAPE∞D');
  });

  test('desktop: CTA heading never sits under the fixed nav blur zone at max scroll (#379)', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    await expect(page.getByTestId('page-loader')).toHaveCount(0, { timeout: 5000 });

    const maxScroll = await page.evaluate(
      () => document.body.scrollHeight - window.innerHeight,
    );
    await page.evaluate((y) => window.scrollTo(0, y), maxScroll);
    // .top-nav.scrolled のトランジション（padding/background/backdrop-filter 0.6s）が
    // 落ち着くのを待つ。
    await page.waitForTimeout(700);

    const overlap = await page.evaluate(() => {
      const nav = document.querySelector('.top-nav');
      if (!nav) throw new Error('.top-nav not found');
      const navRect = nav.getBoundingClientRect();
      const heading = document.querySelector('.cta-copy');
      if (!heading) throw new Error('.cta-copy not found');
      const headingRect = heading.getBoundingClientRect();
      // 区間 [navRect.top, navRect.bottom] と [headingRect.top, headingRect.bottom] の
      // 交差量（px）。0 以下 = 重なりなし。見出しが可視領域より上に完全にスクロール
      // し終えている（headingRect.bottom < 0）場合も正しく「重なりなし」になる。
      return (
        Math.min(navRect.bottom, headingRect.bottom) - Math.max(navRect.top, headingRect.top)
      );
    });

    // #379: 最大スクロール位置で見出し（.cta-copy）が固定ヘッダーの
    // backdrop-filter: blur(14px) 帯と重なってはならない。
    expect(overlap).toBeLessThanOrEqual(0);
  });

  test('375px: CTA copy and button fit without horizontal overflow', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    await expect(page.getByTestId('page-loader')).toHaveCount(0, { timeout: 5000 });

    await page.locator('#cta').evaluate((el) => el.scrollIntoView({ block: 'center' }));
    await expect(page.locator('#cta .cta-button')).toBeVisible();
    const hasOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth,
    );
    expect(hasOverflow, 'horizontal overflow at 375px').toBe(false);
  });
});
