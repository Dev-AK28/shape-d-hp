import { expect, test } from '@playwright/test';

const PAGE_HEADERS = [
  {
    path: '/services',
    title: 'SERVICES',
    subtitle: '商品・サービス',
  },
  {
    path: '/works',
    title: 'WORKS',
    subtitle: '実績',
  },
  {
    path: '/process',
    title: 'PROCESS',
    subtitle: '開発とコンサルティング',
  },
  {
    path: '/contact',
    title: 'CONTACT',
    subtitle: 'お気軽にご相談ください',
  },
] as const;

test.describe('Subpage headers', () => {
  for (const pageHeader of PAGE_HEADERS) {
    test(`${pageHeader.path} uses the shared centered PageHeader pattern`, async ({ page }) => {
      await page.goto(pageHeader.path);
      await expect(page.getByTestId('page-loader')).toHaveCount(0, { timeout: 5000 });

      const header = page.getByTestId('page-header');
      await expect(header).toBeVisible();
      await expect(header.getByRole('heading', { level: 1, name: pageHeader.title })).toBeVisible();
      await expect(header.getByTestId('page-header-subtitle')).toContainText(
        pageHeader.subtitle,
      );

      await expect(async () => {
        const textAlign = await header.locator('h1').evaluate(
          (element) => getComputedStyle(element).textAlign,
        );
        expect(textAlign).toBe('center');
      }).toPass();
    });
  }
});
