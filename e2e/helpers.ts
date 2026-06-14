import { expect, type Page } from '@playwright/test';

export const LOGO_ALT = 'SHAPE∞D Logo';

const HERO_HEADING = /AIで効率化し、.*本来の創造に集中する環境を作る。/;

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
  await expect(servicesLink).toBeVisible();
  await expect(footer.getByText(/©\s*\d{4}/)).toBeVisible();

  const isFooterOnTop = await footer.evaluate((el) => {
    const probe = el.querySelector('a[href="/services"]');
    if (!probe) {
      return false;
    }
    const rect = probe.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const hit = document.elementFromPoint(x, y);
    return hit?.closest('footer') != null;
  });
  expect(isFooterOnTop).toBe(true);
}
