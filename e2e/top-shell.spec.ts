import { expect, test } from '@playwright/test';
import { waitForHomePageReady } from './helpers';

/**
 * トップページ共通シェル（#303）の受け入れ条件検証
 *
 * - フォント: Shippori Mincho / Zen Kaku Gothic New / JetBrains Mono がトップ限定で有効
 * - カラートークン: --ink / --moon / --rain が参照HTML（shape-d-prototype-v4.html）と一致
 * - ナビ: スクロール 60px 超で縮小 + ブラー背景 + ヘアラインボーダー
 * - 縦糸 #thread: スクロール進捗に scaleY が追従
 */

test.describe('Top shell foundation (#303)', () => {
  test('applies renewal color tokens (--ink background / --moon text)', async ({ page }) => {
    await page.goto('/');
    await waitForHomePageReady(page);

    const scope = page.locator('.top-scope');
    await expect(scope).toHaveCount(1);

    const styles = await scope.evaluate((el) => {
      const computed = getComputedStyle(el);
      return {
        ink: computed.getPropertyValue('--ink').trim(),
        moon: computed.getPropertyValue('--moon').trim(),
        rain: computed.getPropertyValue('--rain').trim(),
        backgroundColor: computed.backgroundColor,
        color: computed.color,
      };
    });

    expect(styles.ink).toBe('#07090d');
    expect(styles.moon).toBe('#dfe3ea');
    expect(styles.rain).toBe('#7d9cc4');
    expect(styles.backgroundColor).toBe('rgb(7, 9, 13)');
    expect(styles.color).toBe('rgb(223, 227, 234)');
  });

  test('loads renewal fonts scoped to the top page (next/font variables)', async ({ page }) => {
    await page.goto('/');
    await waitForHomePageReady(page);

    const fonts = await page.locator('.top-scope').evaluate((el) => {
      const computed = getComputedStyle(el);
      const copy = el.querySelector('#hero .hero-copy');
      const mark = el.querySelector('#hero .hero-mark');
      return {
        shippori: computed.getPropertyValue('--font-shippori-mincho').trim(),
        zenKaku: computed.getPropertyValue('--font-zen-kaku-gothic-new').trim(),
        mono: computed.getPropertyValue('--font-jetbrains-mono').trim(),
        latin: computed.getPropertyValue('--latin').trim(),
        bodyFamily: computed.fontFamily,
        // #304: ヒーローのコピーは --serif（Shippori）、マークは --latin（Cormorant）
        copyFamily: copy ? getComputedStyle(copy).fontFamily : '',
        markFamily: mark ? getComputedStyle(mark).fontFamily : '',
      };
    });

    // next/font が生成したファミリー名が変数へ解決されている
    expect(fonts.shippori).toContain('Shippori Mincho');
    expect(fonts.zenKaku).toContain('Zen Kaku Gothic New');
    expect(fonts.mono).toContain('JetBrains Mono');
    // --latin は既存 Cormorant（--font-display）を流用
    expect(fonts.latin).toContain('Cormorant');
    // 本文 = Zen Kaku Gothic New（--gothic）
    expect(fonts.bodyFamily).toContain('Zen Kaku Gothic New');
    // ヒーローコピー = Shippori Mincho（--serif）/ ヒーローマーク = Cormorant（--latin）
    expect(fonts.copyFamily).toContain('Shippori Mincho');
    expect(fonts.markFamily).toContain('Cormorant');
  });

  test('renewal tokens do NOT leak to sub pages (top-page scope only)', async ({ page }) => {
    await page.goto('/philosophy');

    await expect(page.locator('.top-scope')).toHaveCount(0);
    const bodyInk = await page.evaluate(
      () => getComputedStyle(document.body).getPropertyValue('--ink').trim(),
    );
    expect(bodyInk).toBe('');
  });

  test('nav shrinks with blur background + hairline border past 60px scroll', async ({ page }) => {
    await page.goto('/');
    await waitForHomePageReady(page);

    const nav = page.getByRole('navigation');
    await expect(nav).not.toHaveClass(/scrolled/);
    const baselinePadding = await nav.evaluate(
      (el) => parseFloat(getComputedStyle(el).paddingTop),
    );

    await page.mouse.wheel(0, 400);
    await expect(nav).toHaveClass(/scrolled/, { timeout: 5000 });

    // 縮小（padding 28px → 16px）+ ブラー背景 + ヘアラインボーダー。
    // backdrop-filter の none → blur は離散補間のため、0.6s の transition 完了を poll で待つ。
    await expect
      .poll(async () => nav.evaluate((el) => parseFloat(getComputedStyle(el).paddingTop)))
      .toBeLessThan(baselinePadding);
    // 標準 + -webkit- を連結して判定（'none' が truthy のため || フォールバックは不可）
    await expect
      .poll(async () =>
        nav.evaluate((el) => {
          const computed = getComputedStyle(el);
          return `${computed.getPropertyValue('backdrop-filter')} ${computed.getPropertyValue('-webkit-backdrop-filter')}`;
        }),
      )
      .toContain('blur');
    await expect
      .poll(async () => nav.evaluate((el) => getComputedStyle(el).borderBottomWidth))
      .toBe('1px');

    // 先頭へ戻ると解除される
    await page.mouse.wheel(0, -1000);
    await expect(nav).not.toHaveClass(/scrolled/, { timeout: 5000 });
  });

  test('#thread scaleY follows scroll progress', async ({ page }) => {
    await page.goto('/');
    await waitForHomePageReady(page);

    const thread = page.getByTestId('top-thread');
    await expect(thread).toBeAttached();

    const readScaleY = () =>
      thread.evaluate((el) => {
        const transform = getComputedStyle(el).transform;
        if (transform === 'none') {
          return 1;
        }
        // matrix(a, b, c, d, tx, ty) — d が scaleY
        const match = transform.match(/matrix\(([^)]+)\)/);
        return match ? parseFloat(match[1].split(',')[3]) : Number.NaN;
      });

    // 初期状態: scaleY(0)
    expect(await readScaleY()).toBeLessThanOrEqual(0.01);

    // スクロールすると進捗に応じて伸びる（scrub 1.2 の追従を poll で待つ）
    await page.mouse.wheel(0, 2000);
    await expect.poll(readScaleY, { timeout: 10_000 }).toBeGreaterThan(0.05);
    const midScale = await readScaleY();

    await page.mouse.wheel(0, 4000);
    await expect.poll(readScaleY, { timeout: 10_000 }).toBeGreaterThan(midScale);
  });

  test('footer keeps lower-page links (#314 暫定方針)', async ({ page }) => {
    await page.goto('/');
    await waitForHomePageReady(page);

    const footer = page.getByRole('contentinfo');
    for (const href of ['/services', '/works', '/process', '/philosophy', '/contact']) {
      await expect(footer.locator(`a[href="${href}"]`)).toHaveCount(1);
    }
  });
});
