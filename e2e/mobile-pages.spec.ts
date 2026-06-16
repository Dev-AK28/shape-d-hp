/**
 * Mobile parity regression tests (issue #118).
 * Verifies that key content is visible and no horizontal overflow occurs at mobile viewports.
 */
import { expect, test, type Locator, type Page } from '@playwright/test';

async function expectNoHorizontalOverflow(page: Page) {
  const hasOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth,
  );
  expect(hasOverflow, 'horizontal overflow detected').toBe(false);
}

/**
 * Asserts the element is actually painted (cumulative ancestor opacity ≈ 1),
 * not merely "visible" per Playwright (which ignores opacity).
 *
 * Regression guard for issue #151: framer-motion scroll-reveal wrappers without
 * the `staticReveal` guard mounted at `opacity: 0` and depended on
 * IntersectionObserver firing. On mobile (Lenis smooth scroll, #138) the trigger
 * did not fire near the top, leaving below-the-fold content invisible until the
 * footer. The fix mounts content visible during initial render, so cumulative
 * opacity must be 1 on load without any scrolling.
 */
async function expectPainted(locator: Locator) {
  const opacity = await locator.evaluate((el) => {
    let node: HTMLElement | null = el as HTMLElement;
    let cumulative = 1;
    while (node) {
      const value = Number.parseFloat(getComputedStyle(node).opacity || '1');
      if (!Number.isNaN(value)) {
        cumulative *= value;
      }
      node = node.parentElement;
    }
    return cumulative;
  });
  expect(opacity, 'content is hidden (cumulative opacity ~0)').toBeGreaterThan(0.99);
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

    // #151: below-the-fold card must be painted on load, not stuck at opacity 0
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

    // #151: the below-the-fold CTA (framer-motion reveal wrapper) must be painted on
    // load. Targets a motion.* wrapper (not TextReveal, which re-renders post-hydration).
    await expectPainted(
      page.locator('h2').filter({ hasText: '自己一致への道を照らす' }).first(),
    );

    // TextReveal splits animated text into inline-block spans (breaking getByRole);
    // with staticReveal latch (#151) panel titles mount immediately visible on load.
    await expectPainted(
      page.locator('h2').filter({ hasText: 'SELF-CONGRUENCE' }).first(),
    );
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

test.describe('375px — /process', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test('shows both process cards without horizontal overflow', async ({ page }) => {
    await page.goto('/process');
    await expect(page.locator('main h1').first()).toContainText('PROCESS');

    await expectNoHorizontalOverflow(page);

    await expect(page.getByRole('heading', { name: 'Development Process' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Consulting Process' })).toBeVisible();

    // #151: iPhone SE repro — below-the-fold card must be painted on load
    await expectPainted(page.getByRole('heading', { name: 'Consulting Process' }));
  });
});

test.describe('375px — /philosophy', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test('shows philosophy panels without horizontal overflow', async ({ page }) => {
    await page.goto('/philosophy');
    await expect(page).toHaveURL(/\/philosophy$/);
    await expect(page.locator('main h1')).toHaveCount(1);

    await expectNoHorizontalOverflow(page);

    await expectPainted(
      page.locator('h2').filter({ hasText: '自己一致への道を照らす' }).first(),
    );
    await expectPainted(
      page.locator('h2').filter({ hasText: 'SELF-CONGRUENCE' }).first(),
    );
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
