import { expect, type Page } from '@playwright/test';

/** Matches Hero brand h1 whether the a11y name is `SHAPE∞D` or `SHAPE ∞ D`. */
export const HERO_HEADING = /SHAPE\s*∞\s*D/;

export async function waitForHomePageReady(page: Page): Promise<void> {
  await expect(page.getByRole('heading', { name: HERO_HEADING })).toBeVisible();
  await expect(page.getByText('読み込み中')).toBeHidden({ timeout: 5000 });
}
