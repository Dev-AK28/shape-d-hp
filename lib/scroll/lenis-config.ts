/**
 * ページ別 Lenis スクロール設定 — Issue #312
 *
 * トップページ（`/`）は参照HTML（shape-d-prototype-v4.html L882-L886）の遅めの慣性
 * （duration 1.8 + カスタム easing）を用い、velocity-skew は適用しない。
 * 下層ページは現行の duration 1.4 + velocity-skew を維持する（2026-07-03 確定）。
 *
 * #444: `syncTouch: true` を全ページ共通で明示指定する。Lenis のデフォルト
 * （`syncTouch: false`）ではタッチジェスチャーをブラウザのネイティブスクロールに委ね、
 * Lenis 自身は `scroll` イベントを購読して値を読み取るだけになる。この構成では
 * ネイティブスクロールと `gsap.ticker` 経由の Lenis raf ループ（`SmoothScrollProvider`
 * 参照）が同一フレーム内でそれぞれスクロール位置に関与しうるため、モバイル実機で
 * 縦方向のブレ（がたつき）が観測された（#425 の `100vh→100svh` 対応 #426 だけでは
 * 解消せず、オーナーが本番で再現を確認）。`syncTouch: true` にすると Lenis が
 * タッチジェスチャーの唯一のドライバーとなり、ネイティブスクロールとの二重駆動が
 * 起きなくなる。デスクトップ（マウス/トラックパッド）は wheel イベント経由のため
 * この変更による影響はない。
 */

export type LenisPageOptions = {
  duration: number;
  smoothWheel: boolean;
  /** 参照HTMLの easing: t => 1 - Math.pow(1 - t, 4)（トップのみ） */
  easing?: (t: number) => number;
  /**
   * #444: タッチスクロールを Lenis 自身にドライブさせ、ネイティブスクロールとの
   * 二重駆動（モバイル縦ブレの原因仮説）を防ぐ。
   */
  syncTouch: boolean;
  /** #444: syncTouch 時のタッチ追従感度。Lenis デフォルト値（1）を明示指定する。 */
  touchMultiplier: number;
};

export type PageScrollProfile = {
  lenis: LenisPageOptions;
  /** velocity 連動 skewY を適用するか（トップページは無効） */
  velocitySkew: boolean;
};

/** 参照HTMLの easing（out-quart 相当） */
export const topPageEasing = (t: number): number => 1 - Math.pow(1 - t, 4);

export const TOP_PAGE_PATH = '/';

export function isTopPagePath(pathname: string | null | undefined): boolean {
  return pathname === TOP_PAGE_PATH;
}

/** トップページか否かでスクロールプロファイルを返す（トップ: 1.8/skewなし、下層: 1.4/skewあり） */
export function getScrollProfile(isTop: boolean): PageScrollProfile {
  if (isTop) {
    return {
      lenis: { duration: 1.8, smoothWheel: true, easing: topPageEasing, syncTouch: true, touchMultiplier: 1 },
      velocitySkew: false,
    };
  }
  return {
    lenis: { duration: 1.4, smoothWheel: true, syncTouch: true, touchMultiplier: 1 },
    velocitySkew: true,
  };
}

/** pathname に応じたスクロールプロファイルを返す */
export function getPageScrollProfile(pathname: string | null | undefined): PageScrollProfile {
  return getScrollProfile(isTopPagePath(pathname));
}
