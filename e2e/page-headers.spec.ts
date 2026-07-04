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

  /**
   * Regression test for Issue #167 — PageHeader safe-area-inset-top compensation.
   *
   * Two assertions:
   * 1. The class attribute contains `safe-area-inset-top` — detects accidental removal
   *    of the env() formula even when safe-area resolves to 0 in Playwright viewports.
   * 2. Computed padding-top >= 120px — verifies no-notch baseline is unaffected.
   *
   * env(safe-area-inset-top) > 0 のノッチ端末実挙動は、下の #289 テストで CSS injection により
   * シミュレートする（Navigation の nav > div:first-child override（#166 / #288）と同パターン）。
   */
  test('PageHeader padding-top includes safe-area-inset-top formula (#167)', async ({ page }) => {
    await page.goto('/services');
    await expect(page.getByTestId('page-loader')).toHaveCount(0, { timeout: 5000 });
    const header = page.getByTestId('page-header');

    // Verify env(safe-area-inset-top) formula is present in class attribute.
    const className = await header.getAttribute('class') ?? '';
    expect(className).toContain('safe-area-inset-top');

    // On standard Playwright viewport (safe-area = 0), padding-top == --space-section (120px).
    const paddingTop = await header.evaluate(
      (el) => parseFloat(getComputedStyle(el).paddingTop),
    );
    expect(paddingTop).toBeGreaterThanOrEqual(120);
  });

  /**
   * CSS-injection simulation for Issue #289 — notch scenario for PageHeader.
   *
   * env(safe-area-inset-top) は Playwright の通常 viewport で常に 0 のため、#167 の formula 存在確認
   * だけではノッチ端末での実挙動（padding が safe-area 分だけ伸びる）を検証できない。Navigation の
   * injection テスト（#166 / #288）と同パターンで、`[data-testid="page-header"]` の padding-top を
   * 164px（--space-section 120px + safe-area 44px 相当）へ !important で上書きし、
   *   1. injection が正しい要素に当たり computed padding-top == 164px になること
   *   2. ヘッダー本文（h1）が表示され、横あふれが発生しないこと（レイアウト崩れなし）
   * を検証する。
   *
   * NOTE: 本番 CSS は !important を使わない。特異度による上書き回帰は検出できない（#166 と同じ制約）。
   */
  test('PageHeader grows with simulated safe-area-inset-top (#289)', async ({ page }) => {
    await page.goto('/services');
    await expect(page.getByTestId('page-loader')).toHaveCount(0, { timeout: 5000 });

    const header = page.getByTestId('page-header');
    const baselinePaddingTop = await header.evaluate(
      (el) => parseFloat(getComputedStyle(el).paddingTop),
    );
    expect(baselinePaddingTop).toBeGreaterThanOrEqual(120);

    // Simulate env(safe-area-inset-top) = 44px → --space-section(120px) + 44px = 164px 相当。
    await page.addStyleTag({
      content: '[data-testid="page-header"] { padding-top: 164px !important; }',
    });

    const injectedPaddingTop = await header.evaluate(
      (el) => parseFloat(getComputedStyle(el).paddingTop),
    );
    expect(injectedPaddingTop).toBe(164);

    // レイアウト崩れがないこと: h1 が表示され、横スクロールが発生しない。
    await expect(header.locator('h1')).toBeVisible();
    const hasHorizontalOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth,
    );
    expect(hasHorizontalOverflow, 'no horizontal overflow after injection').toBe(false);
  });

  test('page headers apply dividerVariant gradient classes', async ({ page }) => {
    const dividerCases = [
      { path: '/services', className: 'page-header-divider-blue' },
      { path: '/works', className: 'page-header-divider-sky' },
      { path: '/process', className: 'page-header-divider-blue' },
      { path: '/process/development', className: 'page-header-divider-blue' },
      { path: '/process/consulting', className: 'page-header-divider-purple' },
    ] as const;

    for (const { path, className } of dividerCases) {
      await page.goto(path);
      await expect(page.getByTestId('page-loader')).toHaveCount(0, { timeout: 5000 });
      await expect(page.getByTestId('page-header-divider')).toHaveClass(
        new RegExp(`\\b${className}\\b`),
      );
    }
  });
});
