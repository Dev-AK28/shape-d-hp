import { expect, test } from '@playwright/test';
import { expectFooterVisibleAboveCosmicBackground, expectNoHorizontalOverflow, expectPainted, waitForHomePageReady } from './helpers';

// #304: トップページのヒーローは参照HTMLの #hero（TopHero）へ置換された。
// 旧イマーシブヒーロー（粒子形成 / ビッグバン Canvas / cosmic blend 見出し / hero-cta /
// スクロールインジケーター / [data-hero="immersive"] CLS 対策）の E2E はトップページから撤去。
// ヒーロー固有の受け入れ条件は e2e/top-hero.spec.ts が担う。
// cosmic 背景（CosmicScene）と下層セクション（About / MissionVision）は #312 まで維持されるため、
// ここではそれらの回帰テストを温存する。撤去した旧ヒーロー資産の整理は別 issue で追跡。

test.describe('Home page', () => {
  test('applies cosmic grade overlay on cosmic background', async ({ page }) => {
    await page.goto('/');
    await waitForHomePageReady(page);
    await expect(page.getByTestId('cosmic-grade-overlay')).toBeAttached();
  });
});

test.describe('Home page desktop', () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test('shows footer above fixed cosmic background when scrolled to bottom', async ({ page }) => {
    await page.goto('/');
    await waitForHomePageReady(page);
    await expectFooterVisibleAboveCosmicBackground(page);
  });
});

test.describe('Home page mobile', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('shows About and MissionVision content below the hero', async ({ page }) => {
    await page.goto('/');
    await waitForHomePageReady(page);

    // ヒーローは 100vh。下層の About / MissionVision まではスクロールで到達する。
    await page.evaluate(() => window.scrollBy(0, window.innerHeight));

    const psyText = page.getByText('心理学', { exact: true });
    const careerText = page.getByText('経歴', { exact: true });
    const congruenceText = page.getByText('自己一致（SELF-CONGRUENCE）への道');

    // #159: confirm painted (opacity=1) — guards against framer-motion holding opacity:0
    await psyText.evaluate((el) => el.scrollIntoView({ behavior: 'instant', block: 'center' }));
    await expect(psyText).toBeVisible();
    await expectPainted(psyText, 5000);
    await careerText.evaluate((el) => el.scrollIntoView({ behavior: 'instant', block: 'center' }));
    await expect(careerText).toBeVisible();
    await expectPainted(careerText, 5000);
    await congruenceText.evaluate((el) => el.scrollIntoView({ behavior: 'instant', block: 'center' }));
    await expect(congruenceText).toBeVisible();
    await expectPainted(congruenceText, 5000);

    // #159: bounding box — all three texts must be within viewport (not pushed off-screen).
    for (const [locator, label] of [
      [psyText, '心理学'],
      [careerText, '経歴'],
      [congruenceText, '自己一致'],
    ] as const) {
      await locator.evaluate((el) => el.scrollIntoView({ behavior: 'instant', block: 'center' }));
      await expect(async () => {
        const box = await locator.boundingBox();
        expect(box, `${label} boundingBox must not be null`).not.toBeNull();
        if (!box) return;
        expect(box.x, `${label} text left edge must be within section padding`).toBeGreaterThanOrEqual(24);
      }).toPass({ timeout: 3_000 });
    }

    // #159: no horizontal overflow at 390px viewport
    await expectNoHorizontalOverflow(page);
  });

  test('shows footer above fixed cosmic background when scrolled to bottom', async ({ page }) => {
    await page.goto('/');
    await waitForHomePageReady(page);
    await expectFooterVisibleAboveCosmicBackground(page);
  });
});

// ── 375px (iPhone SE) — Home page ABOUT / VISION headings (#150 / #159) ─────────────────────
// Regression guard: ABOUT and VISION h2 headings must be visible, fully painted, and must not
// overflow horizontally at 375px (the narrowest supported mobile viewport).

test.describe('375px Home page mobile', () => {
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

    const aboutHeading = page.locator('h2').filter({ hasText: /^ABOUT$/ }).first();
    const visionHeading = page.locator('h2').filter({ hasText: /^VISION$/ }).first();

    await expect(aboutHeading).toBeVisible({ timeout: 10_000 });
    await expect(visionHeading).toBeVisible({ timeout: 10_000 });

    // #150 / #180: headings are below Hero (below fold); scroll into view then check painted.
    // 5000ms covers the full framer-motion scroll reveal animation (duration 1.4s) plus CI jitter.
    await aboutHeading.evaluate((el) => el.scrollIntoView({ behavior: 'instant', block: 'center' }));
    await expectPainted(aboutHeading, 5000);
    await visionHeading.evaluate((el) => el.scrollIntoView({ behavior: 'instant', block: 'center' }));
    await expectPainted(visionHeading, 5000);

    // #150: no horizontal overflow — heading text must not extend beyond viewport
    await expectNoHorizontalOverflow(page);

    // Verify the headings are not clipped: bounding box must start at or after section left edge.
    // The section has px-[var(--space-3)] = 24px padding, so text x ≥ 24px within the section.
    await aboutHeading.evaluate((el) => el.scrollIntoView({ behavior: 'instant', block: 'center' }));
    await expect(async () => {
      const aboutBox = await aboutHeading.boundingBox();
      expect(aboutBox).not.toBeNull();
      if (!aboutBox) return;
      expect(aboutBox.x, 'ABOUT heading left edge must be within section padding').toBeGreaterThanOrEqual(24);
    }).toPass({ timeout: 3_000 });

    await visionHeading.evaluate((el) => el.scrollIntoView({ behavior: 'instant', block: 'center' }));
    await expect(async () => {
      const visionBox = await visionHeading.boundingBox();
      expect(visionBox).not.toBeNull();
      if (!visionBox) return;
      expect(visionBox.x, 'VISION heading left edge must be within section padding').toBeGreaterThanOrEqual(24);
    }).toPass({ timeout: 3_000 });
  });
});
