import { test, expect } from '@playwright/test';
import {
  LOADER_CSS_FAILSAFE_MS,
  LOADER_E2E_TIMEOUT_MS,
  LOADER_SNAP_END_MS,
  LOADER_TIMELINE_MS,
  LOADER_TOTAL_MS,
} from '../lib/loader/particle-logo';

/**
 * トップページ パーティクルローダーの実時間検証 — Issue #412 / #414 / #418 / #420
 *
 * このスペックだけは fixtures の高速化フラグを使わず（'@playwright/test' を直接
 * import）、等倍タイムライン（約 10 秒・6 フェーズ）で検証する。
 * 他のスペックは e2e/fixtures.ts 経由で短縮版が適用される。
 */
test.describe('Top particle loader (#412 / #414 / #418)', () => {
  test('JS チャンクが落ちても不透明オーバーレイは CSS だけで必ず消える（#419 レビュー対応）', async ({
    page,
  }) => {
    // 消滅経路（framer / フォールバックタイマー / スキップ）はすべて JS 前提。<noscript> は
    // 「JS 無効」しか救えないため、JS 有効なのにチャンクが 404（デプロイ直後の古い HTML 等）
    // だと、SSR された不透明オーバーレイが恒久的にページを覆ってしまう。
    // ⚠️ Next.js は CSS も /_next/static/chunks/ 配下に置くため、JS だけを落とすこと
    // （まとめて落とすとフェイルセーフの CSS 自体が届かず、テストの意味がなくなる）
    await page.route('**/_next/static/chunks/**.js', (route) => route.abort());
    await page.goto('/', { waitUntil: 'commit' });

    const loader = page.getByTestId('page-loader');
    await loader.waitFor({ state: 'attached', timeout: 5000 });
    // 発火前は必ず「見えている」こと。CSS 側の delay 既定値が安全側（実質無限）でないと
    // 初回フレームから hidden になり演出が丸ごと消えるが、toBeHidden だけではその回帰を
    // 検知できない（PR #419 2 巡目レビュー対応）
    await expect(loader).toBeVisible();

    // JS が死んでいるので DOM には残り続けるが、CSS アニメーションで不可視になること。
    // ⚠️ toBeHidden は「要素が DOM から消えた」場合もパスする。abort が将来効かなくなると
    // JS が正常に動いて 10 秒で unmount し、何も検証しないまま緑になるため、
    // 「attached のまま hidden」であることを明示的に確かめる
    await expect(loader).toBeHidden({ timeout: LOADER_CSS_FAILSAFE_MS + 4000 });
    await expect(loader).toHaveCount(1);
  });

  test('soft nav（下層 → トップ）でも演出が最初から走る（黒フラッシュ回帰ガード・#419）', async ({
    page,
  }) => {
    // 待ち時間の合計が既定のテストタイムアウト（30 秒）に迫るため余裕を持たせる
    test.slow();
    // performance.now() はドキュメントの timeOrigin 起点で soft nav ではリセットされない。
    // 下層を演出の全予算より長く見てからトップへ戻ると、ナビ起点のままでは残り時間が
    // すべて 0 になり「オーバーレイが 1 フレームだけ描かれて即消える」黒フラッシュになる。
    // 「マウント時の performance.now() が LOADER_TOTAL_MS を超えている」状況を作れば十分
    await page.goto('/services');
    await page.waitForTimeout(LOADER_TOTAL_MS + 500);

    await page.locator('nav a[href="/"]').first().click();
    const loader = page.getByTestId('page-loader');

    // 即消えではなく、演出の尺だけ表示され続けること
    await expect(loader).toHaveCount(1);
    await page.waitForTimeout(LOADER_SNAP_END_MS - 1500);
    await expect(loader).toHaveCount(1);

    // 最終的にはきちんと消える
    await expect(loader).toHaveCount(0, { timeout: LOADER_E2E_TIMEOUT_MS });
  });

  test('オーバーレイは SSR され、初期 HTML の時点でヒーローを完全に覆う（#418 / #416）', async ({
    page,
  }) => {
    // JS を無効化しても SSR された DOM は届く（= 初期 HTML に存在する）
    const response = await page.goto('/', { waitUntil: 'commit' });
    const html = (await response?.text()) ?? '';
    expect(html).toContain('data-top-loader');
    expect(html).toContain('data-testid="loader-logo"');

    // 背景は半透明スクリムではなくトップページ背景色そのもの（透けない）。
    // #431: `waitUntil: 'commit'` はナビゲーション確定の最速タイミングで、外部
    // スタイルシート（`--ink` を定義する globals.css）がまだ適用されていない可能性がある。
    // localhost / CI ではほぼ 0ms レイテンシで commit と CSS 適用がほぼ同時に起こるため
    // 顕在化しないが、実ネットワーク越し（本番ドメイン等）では CSS 到着が commit 後に
    // ずれ込みやすく、`getComputedStyle` が一時的に初期値（透明）を返すことがある。
    // マークアップ自体は正しい（SSR 済み）前提のもと、スタイル適用を expect.poll で待つ
    const loader = page.getByTestId('page-loader');
    await expect
      .poll(
        () => loader.evaluate((el) => getComputedStyle(el).backgroundColor),
        { timeout: 5000 },
      )
      .toBe('rgb(7, 9, 13)');
  });

  test('粒子が集まったあと実ロゴが立ち上がる（handoff・#418 / #420）', async ({ page }) => {
    await page.goto('/', { waitUntil: 'commit' });
    const logo = page.getByTestId('loader-logo');
    await logo.waitFor({ state: 'attached', timeout: 5000 });

    // handoff 前は完全に不可視（#420: 粒子が集まって初めて浮かび上がる）。framer の
    // アニメーションはハイドレーション後に始まるため、ナビゲーション起点の絶対時刻では
    // なく「まだ見えていない」ことだけを見る
    const initial = await logo.evaluate((el) => Number(getComputedStyle(el).opacity));
    expect(initial).toBeLessThan(0.5);

    // handoff で実ロゴが立ち上がること。**DOM に載ったまま** opacity が上がるのを見る
    // — unmount を「表示済み」とみなすと、演出中盤でローダーが早期消滅する回帰でも
    // 緑になってしまう（PR #419 レビュー対応）
    await expect
      .poll(
        () =>
          page.evaluate(() => {
            const el = document.querySelector('[data-testid="loader-logo"]');
            return el ? Number(getComputedStyle(el).opacity) : -1;
          }),
        { timeout: LOADER_SNAP_END_MS + LOADER_TIMELINE_MS.handoff + 4000 },
      )
      .toBeGreaterThan(0.9);

    // 立ち上がりが snap 完了より前に起きていないこと（＝粒子が集まる前にロゴが出ない）
    expect(
      Number(await page.evaluate(() => performance.now())),
    ).toBeGreaterThanOrEqual(LOADER_SNAP_END_MS);
  });

  test('等倍タイムラインで表示され、drift 中は残り、予算内に消える', async ({ page }) => {
    await page.goto('/', { waitUntil: 'commit' });
    const loader = page.getByTestId('page-loader');
    await loader.waitFor({ state: 'attached', timeout: 5000 });

    // 等倍では全クロックがナビゲーション起点（#419）。ナビゲーションから約 5 秒後は
    // まだ drift/converge の途中なので表示が残っている（約 10 秒演出の担保）
    await page.waitForTimeout(LOADER_TIMELINE_MS.drift + LOADER_TIMELINE_MS.converge - 1500);
    await expect(loader).toHaveCount(1);

    // 全演出 + フォールバックの予算内に必ず消える
    await expect(loader).toHaveCount(0, { timeout: LOADER_E2E_TIMEOUT_MS });
  });

  test('キーボード操作で演出を即スキップする（WCAG 2.4.7 の緩和・#419）', async ({ page }) => {
    await page.goto('/', { waitUntil: 'commit' });
    const loader = page.getByTestId('page-loader');
    await loader.waitFor({ state: 'attached', timeout: 5000 });

    // ローダーが keydown を購読するのは effect 内（＝ハイドレーション後）。ヒーローは SSR で
    // 即描画されるため「見えたら押す」ではリスナー登録前に押してしまう競合がある。
    // Tab を押しながら消滅をポーリングして、押下タイミングに依存しないようにする
    await expect
      .poll(
        async () => {
          await page.keyboard.press('Tab');
          return loader.count();
        },
        { timeout: 8000, intervals: [200, 300, 500] },
      )
      .toBe(0);

    // 演出の尺（10 秒）を待たずに消えていること
    expect(Number(await page.evaluate(() => performance.now()))).toBeLessThan(
      LOADER_TOTAL_MS,
    );
  });

  test('演出中も pointer-events を奪わず背後の操作をブロックしない', async ({ page }) => {
    await page.goto('/', { waitUntil: 'commit' });
    const loader = page.getByTestId('page-loader');
    await loader.waitFor({ state: 'attached', timeout: 5000 });
    await expect(loader).toHaveCSS('pointer-events', 'none');
  });

  test('reduced-motion ではローダーを見せない（SSR されるが CSS で即非表示）', async ({
    browser,
  }) => {
    const context = await browser.newContext({ reducedMotion: 'reduce' });
    const page = await context.newPage();
    await page.goto('/', { waitUntil: 'load' });
    // SSR されるためハイドレーション前は DOM にあるが、CSS（globals.css）で不可視。
    // ハイドレーション後は JS が unmount する
    await expect(page.locator('[data-top-loader]')).toBeHidden();
    await page.waitForTimeout(1500);
    await expect(page.getByTestId('page-loader')).toHaveCount(0);
    await context.close();
  });

  test('タイムライン定数が約 10 秒の尺で e2e 予算内にある（配線確認）', () => {
    expect(LOADER_TOTAL_MS).toBe(10_000);
    expect(LOADER_TOTAL_MS).toBeLessThan(LOADER_E2E_TIMEOUT_MS);
  });
});
