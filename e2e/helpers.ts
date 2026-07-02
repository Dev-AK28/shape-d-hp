import { expect, type Locator, type Page } from '@playwright/test';
import { LOGO_PARTICLE_FORMATION_MS } from '../lib/hero/sample-logo-target-points';
import { HERO_BIGBANG } from '../lib/scroll/animation-tokens';

export const LOGO_ALT = 'SHAPE∞D Logo';

/** Re-export SSOT from `lib/hero/sample-logo-target-points`. */
export const HERO_PARTICLE_FORMATION_MS = LOGO_PARTICLE_FORMATION_MS;

const HERO_HEADING = /AIで効率化し、.*本来の創造に集中する環境を作る。/;

export async function expectHeroBrandLogoAfterFormation(page: Page): Promise<void> {
  const heroSection = page.locator('main section').first();
  const logoStage = heroSection.getByTestId('hero-logo-stage');
  // Big-bang canvas is a full-section overlay sibling of the logo stage (Issue #211).
  const canvas = heroSection.getByTestId('hero-bigbang-canvas');
  const heroBrandLogo = heroSection.getByRole('img', { name: LOGO_ALT });

  await expect(logoStage).toBeVisible({ timeout: 15_000 });
  await expect(canvas).toBeVisible({ timeout: 5000 });

  await expect(async () => {
    const hasParticlePixels = await page.evaluate(() => {
      const target = document.querySelector('[data-testid="hero-bigbang-canvas"]');
      if (!(target instanceof HTMLCanvasElement)) {
        return false;
      }
      const ctx = target.getContext('2d');
      if (!ctx || target.width === 0 || target.height === 0) {
        return false;
      }
      const { data } = ctx.getImageData(0, 0, target.width, target.height);
      const stride = 4 * 47;
      for (let i = 3; i < data.length; i += stride) {
        if (data[i] > 0) {
          return true;
        }
      }
      return false;
    });
    expect(hasParticlePixels).toBe(true);
  }).toPass({ timeout: HERO_PARTICLE_FORMATION_MS });

  await expect(heroBrandLogo).toBeVisible({
    timeout: HERO_PARTICLE_FORMATION_MS + 4000,
  });

  await expect(async () => {
    const stageBox = await logoStage.boundingBox();
    const logoBox = await heroBrandLogo.boundingBox();
    expect(stageBox).not.toBeNull();
    expect(logoBox).not.toBeNull();
    if (!stageBox || !logoBox) {
      return;
    }

    const stageCenterX = stageBox.x + stageBox.width / 2;
    const stageCenterY = stageBox.y + stageBox.height / 2;
    const logoCenterX = logoBox.x + logoBox.width / 2;
    const logoCenterY = logoBox.y + logoBox.height / 2;

    expect(Math.abs(logoCenterX - stageCenterX)).toBeLessThan(stageBox.width * 0.05);
    expect(Math.abs(logoCenterY - stageCenterY)).toBeLessThan(stageBox.height * 0.05);
    expect(logoBox.width).toBeGreaterThan(100);
    expect(logoBox.width).toBeGreaterThan(stageBox.width * 0.5);
  }).toPass({ timeout: 5000 });
}

/**
 * Verifies the big-bang Canvas unmounts after formation and BrandLogo stays visible.
 *
 * Timeline from formationComplete:
 *   revealMs (700ms) + 500ms retire delay → canvasRetired=true → canvas unmounts.
 * Call after page-loader is gone. Assumes reduced-motion is NOT active (canvas must render).
 */
export async function expectBigbangCanvasRetiredWithLogoVisible(page: Page): Promise<void> {
  const heroSection = page.locator('main section').first();
  const canvas = heroSection.getByTestId('hero-bigbang-canvas');
  const heroBrandLogo = heroSection.getByRole('img', { name: LOGO_ALT });

  // Wait for canvas to appear first — guards against reduced-motion environments
  // where the canvas is never created (test will fail here rather than with a
  // misleading "canvas already gone" pass).
  await expect(canvas).toBeVisible({ timeout: 15_000 });

  // Wait for formationComplete sentinel, then for canvas retire.
  // retire timeout = revealMs + 500ms (Hero.tsx) + 1500ms CI buffer.
  const retireTimeoutMs = HERO_BIGBANG.revealMs + 500 + 1500;
  await page.getByTestId('hero-formation-complete').waitFor({
    state: 'attached',
    timeout: LOGO_PARTICLE_FORMATION_MS + 5000,
  });
  await expect(canvas).not.toBeAttached({ timeout: retireTimeoutMs });

  // BrandLogo must remain visible after the canvas exits — no pop or blank flash.
  await expect(heroBrandLogo).toBeVisible();
}

export async function waitForHomePageReady(page: Page): Promise<void> {
  await expect(page.getByTestId('page-loader')).toHaveCount(0, { timeout: 5000 });

  const heroSection = page.locator('main section').first();
  const heroBrandLogo = heroSection.getByRole('img', { name: LOGO_ALT });
  const heroHeading = heroSection.getByRole('heading', {
    level: 1,
    name: HERO_HEADING,
  });

  await expect(async () => {
    const headingVisible = await heroHeading.isVisible();
    const logoVisible =
      (await heroBrandLogo.count()) > 0 && (await heroBrandLogo.isVisible());
    expect(headingVisible || logoVisible).toBe(true);
  }).toPass({ timeout: 15_000 });
}

/** Issue #97: Footer must render above fixed CosmicScene on home page scroll. */
export async function expectFooterVisibleAboveCosmicBackground(page: Page): Promise<void> {
  const footer = page.getByRole('contentinfo');
  await footer.scrollIntoViewIfNeeded();

  const servicesLink = footer.getByRole('link', { name: /サービス/ });
  const copyright = footer.getByText(/©\s*\d{4}/);
  await expect(servicesLink).toBeVisible();
  await expect(copyright).toBeVisible();

  await expect(async () => {
    const copyrightBox = await copyright.boundingBox();
    expect(copyrightBox).not.toBeNull();
    if (!copyrightBox) {
      return;
    }

    const isFooterOnTop = await page.evaluate(
      ({ x, y }) => {
        const hit = document.elementFromPoint(x, y);
        return hit?.closest('footer') != null;
      },
      {
        x: copyrightBox.x + copyrightBox.width / 2,
        y: copyrightBox.y + copyrightBox.height / 2,
      },
    );
    expect(isFooterOnTop).toBe(true);
  }).toPass({ timeout: 5_000 });
}

/**
 * Asserts cumulative ancestor CSS opacity ≈ 1 (Playwright toBeVisible ignores opacity).
 * Regression guard for issue #151.
 *
 * Uses toPass() to absorb the ~1 rAF gap between framer duration:0 commit and
 * getComputedStyle resolution on slow CI frames. 200ms covers CI jitter (~50ms);
 * any element that has not reached opacity 1 within 200ms is reported as a failure.
 *
 * For desktop scroll reveal animations (framer duration ~1.4s), pass a higher timeout
 * (e.g. `expectPainted(el, 2500)`) to wait for the full animation to complete (#153).
 *
 * Limitation: does not detect visibility:hidden, display:none, or off-viewport placement.
 */
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
