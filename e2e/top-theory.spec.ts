import { expect, test } from '@playwright/test';

/**
 * 自己一致セクション #theory（TopTheory）— Issue #307
 * 参照HTML: lib/design/shape-d-prototype-v4.html L253-L324, L672-L692, L925-L936
 */

test.describe('Top theory (#307)', () => {
  test('renders eyebrow, title, circles with aria-label and desc', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('page-loader')).toHaveCount(0, { timeout: 5000 });

    const theory = page.locator('#theory');
    await expect(theory.locator('.eyebrow')).toContainText('APPROACH');
    await expect(theory.locator('.theory-title')).toContainText('自己一致');
    await expect(theory.locator('#c-ideal')).toContainText('こうありたい姿');
    await expect(theory.locator('#c-real')).toContainText('いまの姿');
    // 図の代替テキスト（role=img + aria-label）
    await expect(theory.locator('.circles')).toHaveAttribute('role', 'img');
    await expect(theory.locator('.circles')).toHaveAttribute('aria-label', /重なっていく図/);
  });

  test('pins the section and converges circles + reveals the label on scroll', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');
    await expect(page.getByTestId('page-loader')).toHaveCount(0, { timeout: 5000 });

    const ideal = page.locator('#c-ideal');
    const real = page.locator('#c-real');
    const label = page.locator('#c-label');

    const centerX = (loc: typeof ideal) =>
      loc.evaluate((el) => {
        const r = el.getBoundingClientRect();
        return r.left + r.width / 2;
      });

    // #theory を pin 開始位置へ送る
    await page.locator('#theory').evaluate((el) => el.scrollIntoView({ block: 'start' }));
    const idealStart = await centerX(ideal);
    const realStart = await centerX(real);
    // 初期は ideal が left 寄り、real が right 寄り
    expect(idealStart).toBeLessThan(realStart);

    // pin 区間を進める（end +=120% ぶんスクロール）。scrub 追従を poll で待つ。
    await expect
      .poll(
        async () => {
          await page.mouse.wheel(0, 500);
          const gap = Math.abs((await centerX(ideal)) - (await centerX(real)));
          return gap;
        },
        { timeout: 12_000 },
      )
      .toBeLessThan(Math.abs(idealStart - realStart) - 40);

    // 収束が進むとラベルがフェードイン
    await expect
      .poll(
        async () => {
          await page.mouse.wheel(0, 500);
          return label.evaluate((el) => parseFloat(getComputedStyle(el).opacity));
        },
        { timeout: 12_000 },
      )
      .toBeGreaterThan(0.5);
  });

  test('reduced-motion: circles are centered/converged and label is visible (no pin)', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await expect(page.getByTestId('page-loader')).toHaveCount(0, { timeout: 5000 });

    await page.locator('#theory').evaluate((el) => el.scrollIntoView({ block: 'center' }));
    await expect(page.locator('#c-label')).toHaveCSS('opacity', '1');
    // 収束状態（両円が中央）: 中心 X がほぼ一致
    const centers = await page.locator('#theory').evaluate(() => {
      const i = document.getElementById('c-ideal')!.getBoundingClientRect();
      const r = document.getElementById('c-real')!.getBoundingClientRect();
      return { ic: i.left + i.width / 2, rc: r.left + r.width / 2 };
    });
    expect(Math.abs(centers.ic - centers.rc)).toBeLessThan(4);
  });

  test('375px: circles shrink to 160px without horizontal overflow', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    await expect(page.getByTestId('page-loader')).toHaveCount(0, { timeout: 5000 });

    await page.locator('#theory').evaluate((el) => el.scrollIntoView({ block: 'center' }));
    const w = await page.locator('#c-ideal').evaluate((el) => el.getBoundingClientRect().width);
    expect(Math.round(w)).toBe(160);
    const hasOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth,
    );
    expect(hasOverflow, 'horizontal overflow at 375px').toBe(false);
  });
});
