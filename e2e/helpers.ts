import { expect, type Locator, type Page } from '@playwright/test';

// #316: 旧イマーシブ Hero（粒子形成 / ビッグバン Canvas / cosmic 背景）撤去に伴い、
// expectHeroBrandLogoAfterFormation / expectBigbangCanvasRetiredWithLogoVisible /
// expectFooterVisibleAboveCosmicBackground / LOGO_ALT などの旧ヘルパーを削除した。

export async function waitForHomePageReady(page: Page): Promise<void> {
  await expect(page.getByTestId('page-loader')).toHaveCount(0, { timeout: 5000 });

  // #304: トップページのヒーローは参照HTMLの #hero（TopHero）。
  // マーク h1「SHAPE∞D」がレンダリングされていれば準備完了とみなす
  // （イントロは opacity をフェードするが、Playwright は opacity:0 も visible と判定するため即座に通る）。
  const heroMark = page.locator('#hero .hero-mark');
  await expect(heroMark).toBeVisible({ timeout: 15_000 });
}

/**
 * Assert that no horizontal scrollbar has appeared on the page.
 * Checks document.documentElement.scrollWidth > window.innerWidth — the same
 * metric browsers use to show/hide the horizontal scrollbar.
 */
export async function expectNoHorizontalOverflow(page: Page): Promise<void> {
  const hasOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth,
  );
  expect(hasOverflow, 'horizontal overflow detected').toBe(false);
}

/**
 * Asserts cumulative ancestor CSS opacity ≈ 1 (Playwright toBeVisible ignores opacity).
 * Regression guard for issue #151.
 *
 * Uses toPass() to absorb the ~1 rAF gap between framer duration:0 commit and
 * getComputedStyle resolution on slow CI frames. For desktop scroll reveal
 * animations (framer duration ~1.4s), pass a higher timeout (e.g. 2500).
 *
 * Limitation: does not detect visibility:hidden, display:none, or off-viewport placement.
 */
export async function expectPainted(locator: Locator, timeout = 200) {
  await expect(async () => {
    const opacity = await locator.evaluate((el) => {
      let node: HTMLElement | null = el as HTMLElement;
      let cumulative = 1;
      while (node) {
        const value = Number.parseFloat(getComputedStyle(node).opacity || '1');
        if (!Number.isNaN(value)) {
          cumulative *= value;
        }
        node = node.parentElement;
      }
      return cumulative;
    });
    expect(opacity, 'content is hidden (cumulative opacity ~0)').toBeGreaterThan(0.99);
  }).toPass({ timeout });
}
