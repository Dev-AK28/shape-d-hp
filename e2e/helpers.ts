import { expect, type Page } from '@playwright/test';

/** Matches Hero brand text whether rendered as heading or paragraph. */
export const HERO_BRAND = /^SHAPE\s*∞\s*D$/;

export async function waitForHomePageReady(page: Page): Promise<void> {
  await expect(page.getByText(HERO_BRAND)).toBeVisible();
  await expect(page.getByTestId('page-loader')).toHaveCount(0, { timeout: 5000 });
}
