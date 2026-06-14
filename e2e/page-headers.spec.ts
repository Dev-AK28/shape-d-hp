import { expect, test } from '@playwright/test';

type PageHeaderCase = {
  path: string;
  title: string;
  subtitle: string;
  showDivider?: boolean;
  hasEmail?: boolean;
  hasStarBackground?: boolean;
};

const PAGE_HEADERS: PageHeaderCase[] = [
  {
    path: '/services',
    title: 'SERVICES',
    subtitle:
      '商品・サービス — AIプロダクト開発から自己表現コーチングまで、デジタルとヒューマンの両軸で支援します',
    showDivider: true,
  },
  {
    path: '/works',
    title: 'WORKS',
    subtitle: '実績 — プロダクト開発とコンセプトデザインのポートフォリオをご紹介します',
    showDivider: true,
  },
  {
    path: '/process',
    title: 'PROCESS',
    subtitle: '開発とコンサルティング、それぞれのプロフェッショナルなプロセス',
    showDivider: true,
    hasStarBackground: true,
  },
  {
    path: '/process/development',
    title: 'DEVELOPMENT',
    subtitle: '技術者としての高い視座から、AIスタックを指揮したプロフェッショナルな開発プロセス',
    showDivider: true,
    hasStarBackground: true,
  },
  {
    path: '/process/consulting',
    title: 'CONSULTING',
    subtitle: '自己表現力を習得し、自己一致した生き方を実現する',
    showDivider: true,
    hasStarBackground: true,
  },
  {
    path: '/contact',
    title: 'CONTACT',
    subtitle: 'お気軽にご相談ください',
    showDivider: false,
    hasEmail: true,
  },
];

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

      if (pageHeader.showDivider) {
        await expect(header.getByTestId('page-header-divider')).toBeVisible();
      } else {
        await expect(header.getByTestId('page-header-divider')).toHaveCount(0);
      }

      if (pageHeader.hasEmail) {
        await expect(header.getByTestId('page-header-email')).toBeVisible();
        await expect(header.getByTestId('page-header-email')).toContainText('@');
      }

      if (pageHeader.hasStarBackground) {
        await expect(header.getByTestId('star-background')).toBeVisible();
        await expect(header.locator('h1 span').first()).toHaveCSS('mix-blend-mode', 'screen');
      }

      await expect(async () => {
        const textAlign = await header.locator('h1').evaluate(
          (element) => getComputedStyle(element).textAlign,
        );
        expect(textAlign).toBe('center');
      }).toPass();
    });
  }

  test('/services and /works do not render StarBackground in PageHeader', async ({ page }) => {
    for (const path of ['/services', '/works'] as const) {
      await page.goto(path);
      await expect(page.getByTestId('page-loader')).toHaveCount(0, { timeout: 5000 });
      await expect(page.getByTestId('page-header').getByTestId('star-background')).toHaveCount(0);
    }
  });

  test('/services and /works use solid typography blend on page headers', async ({ page }) => {
    for (const path of ['/services', '/works'] as const) {
      await page.goto(path);
      await expect(page.getByTestId('page-loader')).toHaveCount(0, { timeout: 5000 });
      await expect(
        page.getByTestId('page-header').locator('h1 span').first(),
      ).toHaveCSS('mix-blend-mode', 'normal');
    }
  });
});
