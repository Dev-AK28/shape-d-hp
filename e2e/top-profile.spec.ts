import { expect, test } from './fixtures';
import { expectPageLoaderGone } from './helpers';

/**
 * Profile セクション #profile（TopProfile）— Issue #310
 * 参照HTML: lib/design/shape-d-prototype-v4.html L435-L535, L756-L789, L970-L999
 */

test.describe('Top profile (#310)', () => {
  test('renders profile head, two thought cards, converge SVG and creed', async ({ page }) => {
    await page.goto('/');
    await expectPageLoaderGone(page);

    const profile = page.locator('#profile');
    await expect(profile.locator('.eyebrow')).toContainText('PROFILE');
    await expect(profile.locator('.profile-head b')).toHaveText('明石 康汰');
    await expect(profile.locator('.profile-head')).toContainText('AutoDevJapan');
    await expect(profile.locator('.thought')).toHaveCount(2);
    await expect(profile.locator('#th-psy .thought-tag')).toHaveText('01 — PSYCHOLOGY');
    await expect(profile.locator('#th-eng .thought-tag')).toHaveText('02 — AI ENGINEERING');
    await expect(profile.locator('svg.converge')).toHaveAttribute('aria-hidden', 'true');
    await expect(profile.locator('.creed b')).toContainText('自己表現のツール');
  });

  test('thoughts fade in and converge paths draw + dot/creed appear on scroll', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');
    await expectPageLoaderGone(page);

    const thought = page.locator('#profile .thought').first();
    const dot = page.locator('#profile #cv-dot');
    const creed = page.locator('#profile .creed');
    const leftPath = page.locator('#profile #cv-l');

    // カードのフェードイン
    await page.locator('#profile .thoughts').evaluate((el) => el.scrollIntoView({ block: 'center' }));
    await expect
      .poll(async () => thought.evaluate((el) => parseFloat(getComputedStyle(el).opacity)), { timeout: 8000 })
      .toBeGreaterThan(0.9);

    // 収束 SVG まで送るとパスの strokeDashoffset が減少（描画が進む）し、ドット・理念が表示
    const dashoffset = () =>
      leftPath.evaluate((el) => parseFloat(getComputedStyle(el).strokeDashoffset || '0'));
    await expect
      .poll(
        async () => {
          await page.mouse.wheel(0, 400);
          return dashoffset();
        },
        { timeout: 12_000 },
      )
      .toBeLessThan(200);

    await expect
      .poll(async () => dot.evaluate((el) => parseFloat(getComputedStyle(el).opacity)), { timeout: 8000 })
      .toBeGreaterThan(0.5);
    await expect
      .poll(async () => creed.evaluate((el) => parseFloat(getComputedStyle(el).opacity)), { timeout: 8000 })
      .toBeGreaterThan(0.5);
  });

  test('reduced-motion: cards, dot and creed are shown; converge dot visible', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');
    await expectPageLoaderGone(page);

    await page.locator('#profile').evaluate((el) => el.scrollIntoView({ block: 'center' }));
    await expect(page.locator('#profile .thought').first()).toHaveCSS('opacity', '1');
    await expect(page.locator('#profile .thought').last()).toHaveCSS('opacity', '1');
    await expect(page.locator('#profile .creed')).toHaveCSS('opacity', '1');
    await expect(page.locator('#profile #cv-dot')).toHaveCSS('opacity', '1');
  });

  test('640px: thoughts collapse to one column, converge SVG hidden, no overflow', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    await expectPageLoaderGone(page);

    await page.locator('#profile').evaluate((el) => el.scrollIntoView({ block: 'center' }));
    await expect(page.locator('#profile svg.converge')).toBeHidden();
    // 1 カラム: 2枚目が1枚目より下
    const tops = await page.locator('#profile .thought').evaluateAll((els) =>
      els.map((el) => el.getBoundingClientRect().top + window.scrollY),
    );
    expect(tops[1]).toBeGreaterThan(tops[0]);
    const hasOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth,
    );
    expect(hasOverflow, 'horizontal overflow at 375px').toBe(false);
  });
});
