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

    // #151: below-the-fold content must be painted on load, not stuck at opacity 0
    // 375px と同型（Digital Solution + Human Solution）— fold 下の代表見出しを両方検証
    await expectPainted(page.locator('main h1').first());
    await expectPainted(page.getByRole('heading', { name: 'Digital Solution' }));
    await expectPainted(page.getByRole('heading', { name: 'Human Solution' }));
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

    // #151: below-the-fold content must be painted on load, not stuck at opacity 0
    // 375px と同型（PROJECTS + CONCEPT WORKS）
    await expectPainted(page.getByRole('heading', { name: 'PROJECTS' }));
    await expectPainted(page.getByRole('heading', { name: 'CONCEPT WORKS' }));
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

    // #151: both cards must be painted on load, not stuck at opacity 0
    await expectPainted(page.getByRole('heading', { name: 'Development Process' }));
    await expectPainted(page.getByRole('heading', { name: 'Consulting Process' }));
  });
});

test.describe('390px — /process/development', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('shows development steps without horizontal overflow', async ({ page }) => {
    await page.goto('/process/development');
    await expect(page.locator('main h1').first()).toContainText('DEVELOPMENT');

    await expectNoHorizontalOverflow(page);

    await expect(page.getByRole('heading', { name: '要件定義' })).toBeVisible();

    // #151: below-the-fold step content must be painted on load, not stuck at opacity 0
    await expectPainted(page.getByRole('heading', { name: '要件定義' }));
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

    // #151: below-the-fold step content must be painted on load, not stuck at opacity 0
    await expectPainted(page.getByRole('heading', { name: '3 Steps Process' }));
    await expectPainted(page.getByRole('heading', { name: '自覚' }));
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

    // #151: below-the-fold CTA (staticReveal → animate-only on mobile) must be painted on load
    const ctaHeading = page.locator('h2').filter({ hasText: '自己一致への道を照らす' }).first();
    await expect(ctaHeading).toBeVisible({ timeout: 5000 });
    await expectPainted(ctaHeading);

    // Panel titles: TextReveal latch + live staticReveal on mobile
    const panelHeading = page.locator('h2').filter({ hasText: 'SELF-CONGRUENCE' }).first();
    await expect(panelHeading).toBeVisible({ timeout: 5000 });
    await expectPainted(panelHeading);
  });
});

test.describe('390px — /contact', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('shows contact form without horizontal overflow', async ({ page }) => {
    await page.goto('/contact');
    await expect(page.locator('main h1').first()).toContainText('CONTACT');

    await expectNoHorizontalOverflow(page);

    // Contact page exposes the email address in the page header and a form
    await expect(page.getByTestId('page-header-email')).toBeVisible();
    await expect(page.getByRole('button', { name: '送信する' })).toBeVisible();

    // #151: the form is wrapped in <ScrollReveal>; its content must be painted on load
    await expectPainted(page.getByRole('button', { name: '送信する' }));
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

    // #151: iPhone SE repro — content must be painted on load without scrolling
    await expectPainted(page.locator('main h1').first());
    await expectPainted(page.getByRole('heading', { name: 'Digital Solution' }));
    await expectPainted(page.getByRole('heading', { name: 'Human Solution' }));
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

    // #151: iPhone SE repro — content must be painted on load without scrolling
    await expectPainted(page.getByRole('heading', { name: 'PROJECTS' }));
    await expectPainted(page.getByRole('heading', { name: 'CONCEPT WORKS' }));
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

    // #151: iPhone SE repro — both cards must be painted on load
    await expectPainted(page.getByRole('heading', { name: 'Development Process' }));
    await expectPainted(page.getByRole('heading', { name: 'Consulting Process' }));
  });
});

test.describe('375px — /process/development', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test('shows development steps without horizontal overflow', async ({ page }) => {
    await page.goto('/process/development');
    await expect(page.locator('main h1').first()).toContainText('DEVELOPMENT');

    await expectNoHorizontalOverflow(page);

    await expect(page.getByRole('heading', { name: '要件定義' })).toBeVisible();

    // #151: iPhone SE repro — step content must be painted on load without scrolling
    await expectPainted(page.getByRole('heading', { name: '要件定義' }));
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

    // #151: iPhone SE repro — step content must be painted on load without scrolling
    await expectPainted(page.getByRole('heading', { name: '3 Steps Process' }));
    await expectPainted(page.getByRole('heading', { name: '自覚' }));
  });
});

test.describe('375px — /philosophy', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test('shows philosophy panels without horizontal overflow', async ({ page }) => {
    await page.goto('/philosophy');
    await expect(page).toHaveURL(/\/philosophy$/);
    await expect(page.locator('main h1')).toHaveCount(1);

    await expectNoHorizontalOverflow(page);

    // #151: CTA + panel titles must be painted on load (staticReveal / animate-only)
    const ctaHeading = page.locator('h2').filter({ hasText: '自己一致への道を照らす' }).first();
    await expect(ctaHeading).toBeVisible({ timeout: 5000 });
    await expectPainted(ctaHeading);

    const panelHeading = page.locator('h2').filter({ hasText: 'SELF-CONGRUENCE' }).first();
    await expect(panelHeading).toBeVisible({ timeout: 5000 });
    await expectPainted(panelHeading);
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

    // #151: iPhone SE repro — ScrollReveal-wrapped form must be painted on load
    await expectPainted(page.getByRole('button', { name: '送信する' }));
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

    // Wait for hydration – heading must be visible without scrolling
    const aboutHeading = page.locator('h2').filter({ hasText: /^ABOUT$/ }).first();
    const visionHeading = page.locator('h2').filter({ hasText: /^VISION$/ }).first();

    await expect(aboutHeading).toBeVisible({ timeout: 10_000 });
    await expect(visionHeading).toBeVisible({ timeout: 10_000 });

    // #150: headings must be painted (opacity ≈ 1) — not hidden by any ancestor
    await expectPainted(aboutHeading);
    await expectPainted(visionHeading);

    // #150: no horizontal overflow — heading text must not extend beyond viewport
    await expectNoHorizontalOverflow(page);

    // Verify the headings are not clipped: bounding box must start at or after section left edge
    // (the section has px-[var(--space-3)] = 24px padding, so text x ≥ 24px within the section)
    await aboutHeading.scrollIntoViewIfNeeded();
    await expect(async () => {
      const aboutBox = await aboutHeading.boundingBox();
      expect(aboutBox).not.toBeNull();
      if (!aboutBox) return;
      // heading x must be ≥ 24 (section left padding — not scrolled off-screen)
      expect(aboutBox.x, 'ABOUT heading left edge must be within section padding').toBeGreaterThanOrEqual(24);
    }).toPass({ timeout: 3_000 });

    await visionHeading.scrollIntoViewIfNeeded();
    await expect(async () => {
      const visionBox = await visionHeading.boundingBox();
      expect(visionBox).not.toBeNull();
      if (!visionBox) return;
      // heading x must be ≥ 24 (section left padding — not scrolled off-screen)
      expect(visionBox.x, 'VISION heading left edge must be within section padding').toBeGreaterThanOrEqual(24);
    }).toPass({ timeout: 3_000 });
  });
});
