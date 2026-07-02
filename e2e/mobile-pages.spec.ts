/**
 * Mobile parity regression tests (issue #118).
 * Verifies that key content is visible and no horizontal overflow occurs at mobile viewports.
 */
import { expect, test, type Page } from '@playwright/test';
import { expectPainted } from './helpers';

async function expectNoHorizontalOverflow(page: Page) {
  const hasOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth,
  );
  expect(hasOverflow, 'horizontal overflow detected').toBe(false);
}

// ── 390px (iPhone 14 Pro / Pixel 7) ─────────────────────────────────────────

test.describe('390px — /services', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('shows service headings without horizontal overflow', async ({ page }) => {
    await page.goto('/services');
    await expect(page.locator('main h1').first()).toContainText('SERVICES');

    await expectNoHorizontalOverflow(page);

    await expect(page.getByRole('heading', { name: 'Digital Solution' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Human Solution' })).toBeVisible();

    // #180: h1 は above-fold（viewport 内確定）のため scroll 不要。
    // ハイドレーション後の isReady=true 遷移 → ScrollReveal key remount → IO 即発火。
    // framer duration 1.4s + CI IO 発火遅延を吸収するため 5000ms を使用。
    await expectPainted(page.locator('main h1').first(), 5000);
    // #180: fold 下の見出しはスクロール後に reveal。
    // block:'center' で要素をビューポート中央に配置し headless CI でも IO を確実に発火させる。
    await page.getByRole('heading', { name: 'Digital Solution' }).evaluate((el) => el.scrollIntoView({ behavior: 'instant', block: 'center' }));
    await expectPainted(page.getByRole('heading', { name: 'Digital Solution' }), 5000);
    await page.getByRole('heading', { name: 'Human Solution' }).evaluate((el) => el.scrollIntoView({ behavior: 'instant', block: 'center' }));
    await expectPainted(page.getByRole('heading', { name: 'Human Solution' }), 5000);
  });

  test('shows CTA link', async ({ page }) => {
    await page.goto('/services');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await expect(page.locator('main').getByRole('link', { name: 'お問い合わせ' })).toBeVisible();
  });
});

test.describe('390px — /works', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('shows project sections without horizontal overflow', async ({ page }) => {
    await page.goto('/works');
    await expect(page.locator('main h1').first()).toContainText('WORKS');

    await expectNoHorizontalOverflow(page);

    await expect(page.getByRole('heading', { name: 'PROJECTS' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'CONCEPT WORKS' })).toBeVisible();

    // #180: below-fold section headings reveal on scroll
    await page.getByRole('heading', { name: 'PROJECTS' }).evaluate((el) => el.scrollIntoView({ behavior: 'instant', block: 'center' }));
    await expectPainted(page.getByRole('heading', { name: 'PROJECTS' }), 5000);
    await page.getByRole('heading', { name: 'CONCEPT WORKS' }).evaluate((el) => el.scrollIntoView({ behavior: 'instant', block: 'center' }));
    await expectPainted(page.getByRole('heading', { name: 'CONCEPT WORKS' }), 5000);
  });
});

test.describe('390px — /process', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('shows both process cards without horizontal overflow', async ({ page }) => {
    await page.goto('/process');
    await expect(page.locator('main h1').first()).toContainText('PROCESS');

    await expectNoHorizontalOverflow(page);

    await expect(page.getByRole('heading', { name: 'Development Process' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Consulting Process' })).toBeVisible();

    // #180: below-fold cards reveal on scroll
    await page.getByRole('heading', { name: 'Development Process' }).evaluate((el) => el.scrollIntoView({ behavior: 'instant', block: 'center' }));
    await expectPainted(page.getByRole('heading', { name: 'Development Process' }), 5000);
    await page.getByRole('heading', { name: 'Consulting Process' }).evaluate((el) => el.scrollIntoView({ behavior: 'instant', block: 'center' }));
    await expectPainted(page.getByRole('heading', { name: 'Consulting Process' }), 5000);
  });
});

test.describe('390px — /process/development', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('shows development steps without horizontal overflow', async ({ page }) => {
    await page.goto('/process/development');
    await expect(page.locator('main h1').first()).toContainText('DEVELOPMENT');

    await expectNoHorizontalOverflow(page);

    await expect(page.getByRole('heading', { name: '要件定義' })).toBeVisible();

    // #180: below-fold step reveals on scroll
    await page.getByRole('heading', { name: '要件定義' }).evaluate((el) => el.scrollIntoView({ behavior: 'instant', block: 'center' }));
    await expectPainted(page.getByRole('heading', { name: '要件定義' }), 5000);
  });
});

test.describe('390px — /process/consulting', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('shows consulting steps without horizontal overflow', async ({ page }) => {
    await page.goto('/process/consulting');
    await expect(page.locator('main h1').first()).toContainText('CONSULTING');

    await expectNoHorizontalOverflow(page);

    await expect(page.getByRole('heading', { name: '3 Steps Process' })).toBeVisible();
    await expect(page.getByRole('heading', { name: '自覚' })).toBeVisible();

    // #180: below-fold step reveals on scroll
    await page.getByRole('heading', { name: '3 Steps Process' }).evaluate((el) => el.scrollIntoView({ behavior: 'instant', block: 'center' }));
    await expectPainted(page.getByRole('heading', { name: '3 Steps Process' }), 5000);
    await page.getByRole('heading', { name: '自覚' }).evaluate((el) => el.scrollIntoView({ behavior: 'instant', block: 'center' }));
    await expectPainted(page.getByRole('heading', { name: '自覚' }), 5000);
  });
});

test.describe('390px — /philosophy', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('shows philosophy panels without horizontal overflow', async ({ page }) => {
    await page.goto('/philosophy');
    await expect(page).toHaveURL(/\/philosophy$/);
    // Philosophy page uses sr-only h1 in Japanese; verify exactly one h1 exists
    await expect(page.locator('main h1')).toHaveCount(1);

    await expectNoHorizontalOverflow(page);

    // #180: elements reveal when scrolled into view
    const ctaHeading = page.locator('h2').filter({ hasText: '自己一致への道を照らす' }).first();
    await ctaHeading.evaluate((el) => el.scrollIntoView({ behavior: 'instant', block: 'center' }));
    await expect(ctaHeading).toBeVisible({ timeout: 5000 });
    await expectPainted(ctaHeading, 5000);

    const panelHeading = page.locator('h2').filter({ hasText: 'SELF-CONGRUENCE' }).first();
    await panelHeading.evaluate((el) => el.scrollIntoView({ behavior: 'instant', block: 'center' }));
    await expect(panelHeading).toBeVisible({ timeout: 5000 });
    await expectPainted(panelHeading, 5000);
  });
});

test.describe('390px — /contact', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('shows contact form without horizontal overflow', async ({ page }) => {
    await page.goto('/contact');
    await expect(page.locator('main h1').first()).toContainText('CONTACT');

    await expectNoHorizontalOverflow(page);

    await expect(page.getByTestId('page-header-email')).toBeVisible();
    await expect(page.getByRole('button', { name: '送信する' })).toBeVisible();

    // #180: form is wrapped in ScrollReveal; scroll into view then check painted
    await page.getByRole('button', { name: '送信する' }).evaluate((el) => el.scrollIntoView({ behavior: 'instant', block: 'center' }));
    await expectPainted(page.getByRole('button', { name: '送信する' }), 5000);
  });
});

// ── 375px (iPhone SE / older flagship) ──────────────────────────────────────

test.describe('375px — /services', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test('shows service headings without horizontal overflow', async ({ page }) => {
    await page.goto('/services');
    await expect(page.locator('main h1').first()).toContainText('SERVICES');

    await expectNoHorizontalOverflow(page);

    await expect(page.getByRole('heading', { name: 'Digital Solution' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Human Solution' })).toBeVisible();

    // #180: h1 は above-fold（viewport 内確定）のため scroll 不要。
    // ハイドレーション後の isReady=true 遷移 → ScrollReveal key remount → IO 即発火。
    // framer duration 1.4s + CI IO 発火遅延を吸収するため 5000ms を使用。
    await expectPainted(page.locator('main h1').first(), 5000);
    // #180: fold 下の見出しはスクロール後に reveal。
    // block:'center' で要素をビューポート中央に配置し headless CI でも IO を確実に発火させる。
    await page.getByRole('heading', { name: 'Digital Solution' }).evaluate((el) => el.scrollIntoView({ behavior: 'instant', block: 'center' }));
    await expectPainted(page.getByRole('heading', { name: 'Digital Solution' }), 5000);
    await page.getByRole('heading', { name: 'Human Solution' }).evaluate((el) => el.scrollIntoView({ behavior: 'instant', block: 'center' }));
    await expectPainted(page.getByRole('heading', { name: 'Human Solution' }), 5000);
  });
});

test.describe('375px — /works', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test('shows project sections without horizontal overflow', async ({ page }) => {
    await page.goto('/works');
    await expect(page.locator('main h1').first()).toContainText('WORKS');

    await expectNoHorizontalOverflow(page);

    await expect(page.getByRole('heading', { name: 'PROJECTS' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'CONCEPT WORKS' })).toBeVisible();

    // #180: below-fold section headings reveal on scroll
    await page.getByRole('heading', { name: 'PROJECTS' }).evaluate((el) => el.scrollIntoView({ behavior: 'instant', block: 'center' }));
    await expectPainted(page.getByRole('heading', { name: 'PROJECTS' }), 5000);
    await page.getByRole('heading', { name: 'CONCEPT WORKS' }).evaluate((el) => el.scrollIntoView({ behavior: 'instant', block: 'center' }));
    await expectPainted(page.getByRole('heading', { name: 'CONCEPT WORKS' }), 5000);
  });
});

test.describe('375px — /process', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test('shows both process cards without horizontal overflow', async ({ page }) => {
    await page.goto('/process');
    await expect(page.locator('main h1').first()).toContainText('PROCESS');

    await expectNoHorizontalOverflow(page);

    await expect(page.getByRole('heading', { name: 'Development Process' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Consulting Process' })).toBeVisible();

    // #180: below-fold cards reveal on scroll
    await page.getByRole('heading', { name: 'Development Process' }).evaluate((el) => el.scrollIntoView({ behavior: 'instant', block: 'center' }));
    await expectPainted(page.getByRole('heading', { name: 'Development Process' }), 5000);
    await page.getByRole('heading', { name: 'Consulting Process' }).evaluate((el) => el.scrollIntoView({ behavior: 'instant', block: 'center' }));
    await expectPainted(page.getByRole('heading', { name: 'Consulting Process' }), 5000);
  });
});

test.describe('375px — /process/development', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test('shows development steps without horizontal overflow', async ({ page }) => {
    await page.goto('/process/development');
    await expect(page.locator('main h1').first()).toContainText('DEVELOPMENT');

    await expectNoHorizontalOverflow(page);

    await expect(page.getByRole('heading', { name: '要件定義' })).toBeVisible();

    // #180: below-fold step reveals on scroll
    await page.getByRole('heading', { name: '要件定義' }).evaluate((el) => el.scrollIntoView({ behavior: 'instant', block: 'center' }));
    await expectPainted(page.getByRole('heading', { name: '要件定義' }), 5000);
  });
});

test.describe('375px — /process/consulting', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test('shows consulting steps without horizontal overflow', async ({ page }) => {
    await page.goto('/process/consulting');
    await expect(page.locator('main h1').first()).toContainText('CONSULTING');

    await expectNoHorizontalOverflow(page);

    await expect(page.getByRole('heading', { name: '3 Steps Process' })).toBeVisible();
    await expect(page.getByRole('heading', { name: '自覚' })).toBeVisible();

    // #180: below-fold steps reveal on scroll
    await page.getByRole('heading', { name: '3 Steps Process' }).evaluate((el) => el.scrollIntoView({ behavior: 'instant', block: 'center' }));
    await expectPainted(page.getByRole('heading', { name: '3 Steps Process' }), 5000);
    await page.getByRole('heading', { name: '自覚' }).evaluate((el) => el.scrollIntoView({ behavior: 'instant', block: 'center' }));
    await expectPainted(page.getByRole('heading', { name: '自覚' }), 5000);
  });
});

test.describe('375px — /philosophy', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test('shows philosophy panels without horizontal overflow', async ({ page }) => {
    await page.goto('/philosophy');
    await expect(page).toHaveURL(/\/philosophy$/);
    await expect(page.locator('main h1')).toHaveCount(1);

    await expectNoHorizontalOverflow(page);

    // #180: elements reveal when scrolled into view
    const ctaHeading = page.locator('h2').filter({ hasText: '自己一致への道を照らす' }).first();
    await ctaHeading.evaluate((el) => el.scrollIntoView({ behavior: 'instant', block: 'center' }));
    await expect(ctaHeading).toBeVisible({ timeout: 5000 });
    await expectPainted(ctaHeading, 5000);

    const panelHeading = page.locator('h2').filter({ hasText: 'SELF-CONGRUENCE' }).first();
    await panelHeading.evaluate((el) => el.scrollIntoView({ behavior: 'instant', block: 'center' }));
    await expect(panelHeading).toBeVisible({ timeout: 5000 });
    await expectPainted(panelHeading, 5000);
  });
});

test.describe('375px — /contact', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test('shows contact form without horizontal overflow', async ({ page }) => {
    await page.goto('/contact');
    await expect(page.locator('main h1').first()).toContainText('CONTACT');

    await expectNoHorizontalOverflow(page);

    await expect(page.getByTestId('page-header-email')).toBeVisible();
    await expect(page.getByRole('button', { name: '送信する' })).toBeVisible();

    // #180: form is wrapped in ScrollReveal; scroll into view then check painted
    await page.getByRole('button', { name: '送信する' }).evaluate((el) => el.scrollIntoView({ behavior: 'instant', block: 'center' }));
    await expectPainted(page.getByRole('button', { name: '送信する' }), 5000);
  });
});

// ── 375px (iPhone SE) — Home page (#150) ────────────────────────────────────
// Note: A 390px home page mobile test exists in e2e/home.spec.ts ("Home page mobile").
// This 375px suite is intentionally placed here to keep #150 regression guards
// co-located with other mobile-specific painting tests. See issue #159 for
// consolidating home-page mobile coverage into a single file.

test.describe('375px — / (home: ABOUT / VISION headings)', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test('ABOUT and VISION headings are fully visible without horizontal overflow', async ({ page }) => {
    await page.goto('/');
    // Wait for the page-loader to disappear before checking opacity: while the loader
    // is on screen, framer-motion may hold ancestor elements at opacity:0 and the
    // 200ms expectPainted window would fire too early and report a false failure.
    await expect(page.getByTestId('page-loader')).toHaveCount(0, { timeout: 10_000 });
    // networkidle ensures React hydration and framer-motion's initial animate
    // commit have settled before we sample opacity.
    await page.waitForLoadState('networkidle');

    // Wait for hydration – heading must be visible without scrolling
    const aboutHeading = page.locator('h2').filter({ hasText: /^ABOUT$/ }).first();
    const visionHeading = page.locator('h2').filter({ hasText: /^VISION$/ }).first();

    await expect(aboutHeading).toBeVisible({ timeout: 10_000 });
    await expect(visionHeading).toBeVisible({ timeout: 10_000 });

    // #150 / #180: headings are below Hero (below fold); scroll into view then check painted.
    // Use 2500ms to cover the full framer-motion scroll reveal animation (duration 1.4s).
    await aboutHeading.evaluate((el) => el.scrollIntoView({ behavior: 'instant', block: 'center' }));
    await expectPainted(aboutHeading, 5000);
    await visionHeading.evaluate((el) => el.scrollIntoView({ behavior: 'instant', block: 'center' }));
    await expectPainted(visionHeading, 5000);

    // #150: no horizontal overflow — heading text must not extend beyond viewport
    await expectNoHorizontalOverflow(page);

    // Verify the headings are not clipped: bounding box must start at or after section left edge
    // (the section has px-[var(--space-3)] = 24px padding, so text x ≥ 24px within the section)
    await aboutHeading.evaluate((el) => el.scrollIntoView({ behavior: 'instant', block: 'center' }));
    await expect(async () => {
      const aboutBox = await aboutHeading.boundingBox();
      expect(aboutBox).not.toBeNull();
      if (!aboutBox) return;
      // heading x must be ≥ 24 (section left padding — not scrolled off-screen)
      expect(aboutBox.x, 'ABOUT heading left edge must be within section padding').toBeGreaterThanOrEqual(24);
    }).toPass({ timeout: 3_000 });

    await visionHeading.evaluate((el) => el.scrollIntoView({ behavior: 'instant', block: 'center' }));
    await expect(async () => {
      const visionBox = await visionHeading.boundingBox();
      expect(visionBox).not.toBeNull();
      if (!visionBox) return;
      // heading x must be ≥ 24 (section left padding — not scrolled off-screen)
      expect(visionBox.x, 'VISION heading left edge must be within section padding').toBeGreaterThanOrEqual(24);
    }).toPass({ timeout: 3_000 });
  });
});

// ── desktop → mobile resize regression (#155 / #180) ────────────────────────
// #180 以降、isMobile は staticReveal に影響しない（デスクトップ・モバイル双方が whileInView）。
// リサイズ後も staticReveal=false のまま変化しないため remount は発生せず、
// スクロールした要素が reveal されることを検証する。
// After #180, isMobile no longer affects staticReveal — both desktop and mobile
// use scroll-driven reveal (whileInView). staticReveal stays false after resize.

test.describe('desktop → mobile resize — /services scroll reveal (#155)', () => {
  test('service cards reveal on scroll after resizing from desktop to mobile', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/services');
    await expect(page.getByTestId('page-loader')).toHaveCount(0, { timeout: 5000 });

    await page.setViewportSize({ width: 390, height: 844 });

    // リサイズ後、スクロールしてカードが reveal されることを確認（remount は発生しない）
    const cardTitle = page.locator('h3').filter({ hasText: 'AIプロダクト開発' }).first();
    // resize 後の React re-render が完了するまで DOM 安定を待つ
    await expect(cardTitle).toBeVisible({ timeout: 5000 });
    await cardTitle.evaluate((el) => el.scrollIntoView({ behavior: 'instant', block: 'center' }));
    await expectPainted(cardTitle, 5000);
  });

  test('works project cards reveal on scroll after resizing from desktop to mobile', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/works');
    await expect(page.getByTestId('page-loader')).toHaveCount(0, { timeout: 5000 });

    await page.setViewportSize({ width: 390, height: 844 });

    // リサイズ後、スクロールしてプロジェクトカードが reveal されることを確認
    const projectTitle = page.locator('h3').filter({ hasText: 'AIアドバイザーツール' }).first();
    // resize 後の React re-render が完了するまで DOM 安定を待つ
    await expect(projectTitle).toBeVisible({ timeout: 5000 });
    await projectTitle.evaluate((el) => el.scrollIntoView({ behavior: 'instant', block: 'center' }));
    await expectPainted(projectTitle, 5000);
  });

  // #182: viewport 内要素がリサイズ後も opacity:1 を維持することを確認。
  // #180 以降 staticReveal は isMobile に依存しないため、リサイズで remount は発生せず
  // IO 発火済み要素の framer アニメーション状態がリセットされないことを保証する。
  test('above-fold content retains opacity after resize to mobile (#182)', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/services');
    await expect(page.getByTestId('page-loader')).toHaveCount(0, { timeout: 5000 });

    // fold 上の h1 がデスクトップ幅で paint 済みであることを確認。
    // framer-motion duration 1.4s + CI IO 発火遅延を吸収するため 5000ms を使用（他の above-fold テストと統一）。
    const h1 = page.locator('main h1').first();
    await expectPainted(h1, 5000);

    // モバイルにリサイズ — resize 後の React re-render が完了するまで DOM 安定を待つ (#155 パターン)
    await page.setViewportSize({ width: 390, height: 844 });
    await expect(h1).toBeVisible({ timeout: 5000 });
    // viewport 内要素は opacity:1 を維持するべき
    await expectPainted(h1, 1000);
  });
});
