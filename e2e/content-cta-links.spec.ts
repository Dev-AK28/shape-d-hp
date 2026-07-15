import { expect, test } from '@playwright/test';

/**
 * Issue #440 回帰ガード（E2E）
 *
 * /services, /process/development, /process/consulting, /philosophy の
 * ページ内 CTA（「お問い合わせ」「Process Details」）は next/link によるクライアント
 * サイドナビゲーションで /contact 等へ遷移する（フルページリロードではない）ことを検証する。
 *
 * 検証方法: 遷移前に window に marker を仕込み、クリック後もその marker が残っている
 * ことを確認する。フルページリロードが起きれば window は再生成され marker は消える。
 */
const cases: Array<{ page: string; linkName: string; expectedPath: string }> = [
  { page: '/services', linkName: 'お問い合わせ', expectedPath: '/contact' },
  { page: '/services', linkName: 'Process Details', expectedPath: '/process/development' },
  { page: '/process/development', linkName: '爆速でプロトタイプを試す', expectedPath: '/contact' },
  { page: '/process/consulting', linkName: '『自分の言葉』を取り戻す対話を始める', expectedPath: '/contact' },
  { page: '/philosophy', linkName: 'お問い合わせ', expectedPath: '/contact' },
];

for (const { page: path, linkName, expectedPath } of cases) {
  test(`${path} の "${linkName}" リンクはクライアントサイド遷移で ${expectedPath} へ遷移する (#440)`, async ({
    page,
  }) => {
    await page.goto(path);
    await page.evaluate(() => {
      (window as unknown as { __e2eNavMarker?: boolean }).__e2eNavMarker = true;
    });

    const link = page.getByRole('link', { name: linkName }).first();
    await link.scrollIntoViewIfNeeded();
    await link.click();

    await expect(page).toHaveURL(new RegExp(`${expectedPath.replace('/', '\\/')}$`));

    const markerSurvived = await page.evaluate(
      () => (window as unknown as { __e2eNavMarker?: boolean }).__e2eNavMarker === true,
    );
    expect(markerSurvived, 'expected client-side navigation (no full page reload)').toBe(true);
  });
}
