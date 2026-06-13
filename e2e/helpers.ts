import { expect, type Page } from '@playwright/test';

/** Matches Hero brand h1 whether the a11y name is `SHAPE∞D` or `SHAPE ∞ D`. */
export const HERO_HEADING = /^SHAPE\s*∞\s*D$/;

export async function waitForHomePageReady(page: Page): Promise<void> {
  await expect(page.getByRole('heading', { name: HERO_HEADING })).toBeVisible();
  await expect(page.getByTestId('page-loader')).toHaveCount(0, { timeout: 5000 });
}
