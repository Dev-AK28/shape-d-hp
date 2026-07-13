import { expect, test } from './fixtures';
import { expectPageLoaderGone } from './helpers';

/**
 * PHILOSOPHY セクション #vision（TopPhilosophy）— Issue #305
 * 参照HTML: lib/design/shape-d-prototype-v4.html L202-L222, L646-L657, L905-L911
 */

const TAGLINE = '商品・サービスは、自己表現のツールである。';

test.describe('Top philosophy (#305)', () => {
  test('renders eyebrow, per-character tagline and note', async ({ page }) => {
    await page.goto('/');
    await expectPageLoaderGone(page);

    const vision = page.locator('#vision');
    await expect(vision.locator('.eyebrow')).toContainText('PHILOSOPHY');

    const chars = vision.locator('.vision-tagline .w');
    await expect(chars).toHaveCount([...TAGLINE].length);
    await expect(vision.locator('.vision-tagline')).toHaveAttribute('aria-label', TAGLINE);
    await expect(vision.locator('.vision-note')).toContainText('らしさ');
  });

  test('scrubs tagline opacity from ~0.08 toward 1 as the section scrolls in', async ({ page }) => {
    await page.goto('/');
    await expectPageLoaderGone(page);

    const firstChar = page.locator('#vision .vision-tagline .w').first();

    // セクション進入前: 初期 opacity 0.08 付近（scrub 前）
    await page.evaluate(() => window.scrollTo(0, 0));
    const initial = await firstChar.evaluate((el) => parseFloat(getComputedStyle(el).opacity));
    expect(initial).toBeLessThan(0.3);

    // #vision を画面中央まで送ると scrub が進み opacity が上がる
    await page.locator('#vision').evaluate((el) => el.scrollIntoView({ block: 'center' }));
    await expect
      .poll(async () => firstChar.evaluate((el) => parseFloat(getComputedStyle(el).opacity)), {
        timeout: 8000,
      })
      .toBeGreaterThan(initial + 0.1);
  });

  test('reduced-motion: all tagline chars are shown at opacity 1 immediately', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await expectPageLoaderGone(page);

    const chars = page.locator('#vision .vision-tagline .w');
    await expect(chars.first()).toHaveCSS('opacity', '1');
    await expect(chars.last()).toHaveCSS('opacity', '1');
  });

  test('375px: tagline wraps without horizontal overflow', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    await expectPageLoaderGone(page);

    await page.locator('#vision').evaluate((el) => el.scrollIntoView({ block: 'center' }));
    await expect(page.locator('#vision .vision-tagline')).toBeVisible();
    const hasOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth,
    );
    expect(hasOverflow, 'horizontal overflow at 375px').toBe(false);
  });
});
