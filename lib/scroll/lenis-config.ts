/**
 * ページ別 Lenis スクロール設定 — Issue #312
 *
 * トップページ（`/`）は参照HTML（shape-d-prototype-v4.html L882-L886）の遅めの慣性
 * （duration 1.8 + カスタム easing）を用い、velocity-skew は適用しない。
 * 下層ページは現行の duration 1.4 + velocity-skew を維持する（2026-07-03 確定）。
 */

export type LenisPageOptions = {
  duration: number;
  smoothWheel: boolean;
  /** 参照HTMLの easing: t => 1 - Math.pow(1 - t, 4)（トップのみ） */
  easing?: (t: number) => number;
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
      lenis: { duration: 1.8, smoothWheel: true, easing: topPageEasing },
      velocitySkew: false,
    };
  }
  return {
    lenis: { duration: 1.4, smoothWheel: true },
    velocitySkew: true,
  };
}

/** pathname に応じたスクロールプロファイルを返す */
export function getPageScrollProfile(pathname: string | null | undefined): PageScrollProfile {
  return getScrollProfile(isTopPagePath(pathname));
}
