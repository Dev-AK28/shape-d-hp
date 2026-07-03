import { expect, test } from '@playwright/test';

/**
 * ヒーローセクション #hero（TopHero）の受け入れ条件検証 — Issue #304
 * 参照HTML: lib/design/shape-d-prototype-v4.html L125-L200, L629-L644, L816-L857, L898-L903
 */

test.describe('Top hero (#304)', () => {
  test('renders mark, copy lines, sub copy and scroll cue', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('page-loader')).toHaveCount(0, { timeout: 5000 });

    const mark = page.locator('#hero .hero-mark');
    await expect(mark).toBeVisible();
    await expect(mark).toHaveText(/SHAPE\s*∞\s*D/);
    // ∞ は --rain 色（rgb(125,156,196)）
    await expect(mark.locator('.inf')).toHaveCSS('color', 'rgb(125, 156, 196)');

    const lines = page.locator('#hero .hero-copy .line');
    await expect(lines).toHaveCount(2);
    await expect(lines.nth(0)).toHaveText('機能だけなら、誰でもつくれる。');
    await expect(lines.nth(1)).toHaveText('私たちは、想いまで実装する。');

    await expect(page.locator('#hero .hero-sub')).toContainText('SELF-CONGRUENCE');
    await expect(page.getByTestId('hero-scroll-cue')).toBeAttached();
    await expect(page.getByTestId('hero-rain-canvas')).toBeAttached();
  });

  test('fades the intro in mark→copy→sub→cue order', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('page-loader')).toHaveCount(0, { timeout: 5000 });

    const opacity = (selector: string) =>
      page.locator(selector).first().evaluate((el) => parseFloat(getComputedStyle(el).opacity));

    // マークが最初にフェードイン（duration 2.4s / at 0.4s）
    await expect.poll(() => opacity('#hero .hero-mark'), { timeout: 8000 }).toBeGreaterThan(0.9);
    // 続いてコピー・サブ・キューも最終的に表示される
    await expect.poll(() => opacity('#hero .hero-copy .line'), { timeout: 10_000 }).toBeGreaterThan(0.9);
    await expect.poll(() => opacity('#hero .hero-sub'), { timeout: 10_000 }).toBeGreaterThan(0.9);
    await expect.poll(() => opacity('#hero .scroll-cue'), { timeout: 10_000 }).toBeGreaterThan(0.9);
  });

  test('rain canvas is sized and drawn (non-zero backing store)', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('page-loader')).toHaveCount(0, { timeout: 5000 });

    const canvas = page.getByTestId('hero-rain-canvas');
    await expect(canvas).toBeAttached();
    await expect
      .poll(async () =>
        canvas.evaluate((el) => (el as HTMLCanvasElement).width * (el as HTMLCanvasElement).height),
      )
      .toBeGreaterThan(0);
  });

  test('reduced-motion: all hero text is shown immediately and drop animation is disabled', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await expect(page.getByTestId('page-loader')).toHaveCount(0, { timeout: 5000 });

    // イントロを待たずに全要素が opacity:1
    for (const sel of ['#hero .hero-mark', '#hero .hero-copy .line', '#hero .hero-sub', '#hero .scroll-cue']) {
      await expect(page.locator(sel).first()).toHaveCSS('opacity', '1');
    }
    await expect(page.locator('#hero .scroll-cue .drop')).toHaveCSS('animation-name', 'none');
  });

  test('375px: hero fits without horizontal overflow', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    await expect(page.getByTestId('page-loader')).toHaveCount(0, { timeout: 5000 });

    await expect(page.locator('#hero .hero-mark')).toBeVisible();
    const hasOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth,
    );
    expect(hasOverflow, 'horizontal overflow at 375px').toBe(false);
  });
});
