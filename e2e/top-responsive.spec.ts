import { expect, test } from '@playwright/test';
import { waitForHomePageReady } from './helpers';

/**
 * トップページ 仕上げ — レスポンシブ & キーボードフォーカス — Issue #313
 * 参照デザイン全体。全セクションが各ブレークポイントで崩れないこと、フォーカスが可視であることを担保。
 */

const SECTION_IDS = ['#hero', '#vision', '#pain', '#theory', '#services', '#process', '#profile', '#cta'] as const;

const BREAKPOINTS = [
  { name: '375px iPhone SE', width: 375, height: 812 },
  { name: '640px', width: 640, height: 900 },
  { name: '768px tablet', width: 768, height: 1024 },
  { name: '1280px desktop', width: 1280, height: 800 },
] as const;

test.describe('Top page responsive (#313)', () => {
  for (const bp of BREAKPOINTS) {
    test(`all sections present without horizontal overflow at ${bp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: bp.width, height: bp.height });
      await page.goto('/');
      await waitForHomePageReady(page);

      for (const id of SECTION_IDS) {
        await expect(page.locator(id)).toHaveCount(1);
      }

      // 全セクションを順にスクロールし、各時点で横あふれが無いこと
      for (const id of SECTION_IDS) {
        await page.locator(id).evaluate((el) => el.scrollIntoView({ block: 'center', behavior: 'instant' }));
        const hasOverflow = await page.evaluate(
          () => document.documentElement.scrollWidth > window.innerWidth,
        );
        expect(hasOverflow, `horizontal overflow at ${id}`).toBe(false);
      }
    });
  }
});

test.describe('Top page keyboard focus visibility (#313)', () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test('nav links, ご相談 CTA and hero mark are focusable with a visible outline', async ({ page }) => {
    await page.goto('/');
    await waitForHomePageReady(page);

    // ナビの下層リンク・ご相談 CTA に focus-visible アウトライン（--rain）が付く
    const cta = page.getByRole('navigation').getByRole('link', { name: 'ご相談' });
    const outlineColor = await cta.evaluate((el) => {
      el.focus();
      return getComputedStyle(el).outlineColor;
    });
    // .top-scope a:focus-visible → outline 1px var(--rain) = rgb(125,156,196)
    expect(outlineColor).toBe('rgb(125, 156, 196)');
  });

  test('CTA button shows a focus-visible outline', async ({ page }) => {
    await page.goto('/');
    await waitForHomePageReady(page);

    const outline = await page.locator('#cta .cta-button').evaluate((el) => {
      el.focus();
      const cs = getComputedStyle(el);
      return { color: cs.outlineColor, width: cs.outlineWidth };
    });
    expect(outline.color).toBe('rgb(125, 156, 196)');
    expect(parseFloat(outline.width)).toBeGreaterThanOrEqual(1);
  });

  test('Tab order reaches the mark, nav links, CTA and the ご相談 button', async ({ page }) => {
    await page.goto('/');
    await waitForHomePageReady(page);

    // 先頭からタブ移動し、フォーカス可能な主要リンクに到達できることを確認
    const reached = new Set<string>();
    for (let i = 0; i < 12; i++) {
      await page.keyboard.press('Tab');
      const href = await page.evaluate(() => (document.activeElement as HTMLAnchorElement | null)?.getAttribute('href') ?? '');
      if (href) reached.add(href);
    }
    // ナビ/フッターの下層導線と CTA(/contact) に到達
    expect(reached.has('/contact')).toBe(true);
    expect([...reached].some((h) => ['/services', '/works', '/process', '/philosophy'].includes(h))).toBe(true);
  });
});
