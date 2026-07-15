/**
 * ページ別 Lenis スクロール設定 — Issue #312
 *
 * トップページ（`/`）は参照HTML（shape-d-prototype-v4.html L882-L886）の遅めの慣性
 * （duration 1.8 + カスタム easing）を用い、velocity-skew は適用しない。
 * 下層ページは現行の duration 1.4 + velocity-skew を維持する（2026-07-03 確定）。
 *
 * `syncTouch: true`（両プロファイル共通・Issue #444）: #426（100vh→100svh統一）後も
 * モバイル実機でスクロール時の縦ブレ（jitter）が解消していなかった問題への対応。
 * Lenis はデフォルト（`syncTouch: false`）だとタッチ入力を wheel と同じ
 * duration/easing ベースの仮想慣性で駆動するため、iOS Safari 自身のネイティブ
 * タッチスクロール（ラバーバンド/慣性）と Lenis の仮想スクロールが二重に駆動し合い、
 * 縦ブレとして体感される。`syncTouch: true` はタッチ入力を指の動きに1:1追従させる
 * モードに切り替え、ネイティブスクロールとの競合を解消する。マウス/トラックパッド
 * 由来の wheel 入力には影響しない（タッチイベントが発火しない環境では無効なオプション）
 * ため、デスクトップの既存挙動（duration/easing ベースの慣性）は変化しない。
 * `tests/scroll/mobile-reduced-motion-policy.test.ts` の方針（`shouldDisableSmoothScroll`
 * は `prefers-reduced-motion` のみで判定し、モバイルでは Lenis 自体を無効化しない）
 * と矛盾しないよう、Lenis 自体は有効のまま維持し、タッチ挙動のみを調整する。
 */

export type LenisPageOptions = {
  duration: number;
  smoothWheel: boolean;
  /** 参照HTMLの easing: t => 1 - Math.pow(1 - t, 4)（トップのみ） */
  easing?: (t: number) => number;
  /** タッチ入力をwheelと同じ慣性ではなく指に1:1追従させる（#444: モバイル縦ブレ対策） */
  syncTouch: boolean;
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
      lenis: { duration: 1.8, smoothWheel: true, easing: topPageEasing, syncTouch: true },
      velocitySkew: false,
    };
  }
  return {
    lenis: { duration: 1.4, smoothWheel: true, syncTouch: true },
    velocitySkew: true,
  };
}

/** pathname に応じたスクロールプロファイルを返す */
export function getPageScrollProfile(pathname: string | null | undefined): PageScrollProfile {
  return getScrollProfile(isTopPagePath(pathname));
}
