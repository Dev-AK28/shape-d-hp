import { describe, expect, it } from 'vitest';
import { getPageScrollProfile, isTopPagePath, topPageEasing, TOP_PAGE_PATH } from '@/lib/scroll/lenis-config';

/**
 * ページ別 Lenis スクロール設定 — Issue #312
 * トップ: duration 1.8 + カスタム easing + velocity-skew なし / 下層: 1.4 + skew あり
 */
describe('page scroll profile (#312)', () => {
  it('identifies the top page path', () => {
    expect(TOP_PAGE_PATH).toBe('/');
    expect(isTopPagePath('/')).toBe(true);
    expect(isTopPagePath('/services')).toBe(false);
    expect(isTopPagePath('/contact')).toBe(false);
    expect(isTopPagePath(null)).toBe(false);
  });

  it('uses slow inertia (1.8) + custom easing and no velocity-skew on the top page', () => {
    const profile = getPageScrollProfile('/');
    expect(profile.lenis.duration).toBe(1.8);
    expect(profile.lenis.smoothWheel).toBe(true);
    expect(profile.lenis.easing).toBe(topPageEasing);
    expect(profile.velocitySkew).toBe(false);
  });

  it('keeps 1.4 + velocity-skew on sub pages', () => {
    for (const path of ['/services', '/works', '/process', '/philosophy', '/contact']) {
      const profile = getPageScrollProfile(path);
      expect(profile.lenis.duration).toBe(1.4);
      expect(profile.lenis.easing).toBeUndefined();
      expect(profile.velocitySkew).toBe(true);
    }
  });

  it('reproduces the reference HTML easing (out-quart): t => 1 - (1-t)^4', () => {
    expect(topPageEasing(0)).toBe(0);
    expect(topPageEasing(1)).toBe(1);
    expect(topPageEasing(0.5)).toBeCloseTo(1 - Math.pow(0.5, 4));
  });
});
