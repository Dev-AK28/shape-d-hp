import { expect, test } from './fixtures';
import { expectPageLoaderGone } from './helpers';

/**
 * サービスセクション #services（TopServices）— Issue #308
 * 参照HTML: lib/design/shape-d-prototype-v4.html L326-L389, L694-L725, L938-L960
 */

test.describe('Top services (#308)', () => {
  test('renders four panels and four progress dots', async ({ page }) => {
    await page.goto('/');
    await expectPageLoaderGone(page);

    const services = page.locator('#services');
    await expect(services.locator('.svc-panel')).toHaveCount(4);
    await expect(services.locator('.svc-dot')).toHaveCount(4);
    await expect(services.locator('.svc-panel').first().locator('.svc-num')).toHaveText('01');
    await expect(services.locator('.svc-panel').first().locator('.svc-title')).toHaveText('基幹システム開発');
    await expect(services.locator('.svc-panel').last().locator('.svc-title')).toHaveText('継続開発・伴走');
  });

  test('pins the section and switches panels 01→…→04 with progress dots on scroll', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');
    await expectPageLoaderGone(page);

    const panels = page.locator('#services .svc-panel');
    const dots = page.locator('#services .svc-dot');

    const panelOpacity = (i: number) =>
      panels.nth(i).evaluate((el) => parseFloat(getComputedStyle(el).opacity));
    const activeDot = () =>
      dots.evaluateAll((els) => els.findIndex((el) => el.classList.contains('on')));

    // pin 開始位置へ
    await page.locator('#services').evaluate((el) => el.scrollIntoView({ block: 'start' }));
    // 初期は 01 が表示・ドット 0 が on
    await expect.poll(() => panelOpacity(0)).toBeGreaterThan(0.9);
    expect(await activeDot()).toBe(0);

    // pin 区間を進めると後続パネルが表示され、ドットの点灯位置が進む
    await expect
      .poll(
        async () => {
          await page.mouse.wheel(0, 700);
          return activeDot();
        },
        { timeout: 15_000 },
      )
      .toBeGreaterThan(0);

    // さらに進めて最終パネル（04）まで到達
    await expect
      .poll(
        async () => {
          await page.mouse.wheel(0, 700);
          return panelOpacity(3);
        },
        { timeout: 15_000 },
      )
      .toBeGreaterThan(0.5);
  });

  test('reduced-motion: four panels are stacked vertically and all visible (no pin)', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await expectPageLoaderGone(page);

    const panels = page.locator('#services .svc-panel');
    for (let i = 0; i < 4; i++) {
      await expect(panels.nth(i)).toHaveCSS('visibility', 'visible');
      await expect(panels.nth(i)).toHaveCSS('position', 'relative');
    }
    // 縦積み: 2枚目は1枚目より下（y が大きい）
    const boxes = await panels.evaluateAll((els) => els.map((el) => el.getBoundingClientRect().top + window.scrollY));
    expect(boxes[1]).toBeGreaterThan(boxes[0]);
    expect(boxes[3]).toBeGreaterThan(boxes[2]);
  });

  test('375px: panel content fits without horizontal overflow', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    await expectPageLoaderGone(page);

    await page.locator('#services').evaluate((el) => el.scrollIntoView({ block: 'start' }));
    await expect(page.locator('#services .svc-panel').first().locator('.svc-title')).toBeVisible();
    const hasOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth,
    );
    expect(hasOverflow, 'horizontal overflow at 375px').toBe(false);
  });
});
