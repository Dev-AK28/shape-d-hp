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
