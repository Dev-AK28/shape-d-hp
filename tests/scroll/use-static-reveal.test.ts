import { describe, expect, it } from 'vitest';
import { DEFAULT_DEVICE_PROFILE } from '@/lib/performance/device-profile';
import { shouldUseStaticReveal } from '@/lib/scroll/static-reveal';

/**
 * Contract tests for `useStaticReveal()` wiring.
 * The hook delegates to `shouldUseStaticReveal(profile, reduceMotion, isReady)` —
 * keep matrices in sync with lib/hooks/useStaticReveal.ts.
 * 基本行列の重複ケースは static-reveal.test.ts、animate contract は reveal-props.test.ts。
 * Hook-level `renderHook` coverage: #154 (@testing-library/react).
 */
describe('useStaticReveal contract (shouldUseStaticReveal matrix)', () => {
  it('returns true on mobile SPA after isReady (profile.isMobile — #151)', () => {
    expect(
      shouldUseStaticReveal(
        { ...DEFAULT_DEVICE_PROFILE, isMobile: true },
        false,
        true,
      ),
    ).toBe(true);
  });

  it('returns false on desktop SPA client nav (isReady=true, isMobile=false — #153 scope)', () => {
    expect(
      shouldUseStaticReveal(DEFAULT_DEVICE_PROFILE, false, true),
    ).toBe(false);
  });

  it('returns true on desktop first full load (!isReady SSR snapshot)', () => {
    expect(
      shouldUseStaticReveal(DEFAULT_DEVICE_PROFILE, false, false),
    ).toBe(true);
  });

  it('returns false for large tablet (coarse pointer, width >=768) when isReady — #153 follow-up', () => {
    expect(
      shouldUseStaticReveal(
        {
          ...DEFAULT_DEVICE_PROFILE,
          isMobile: false,
          prefersCoarsePointer: true,
          prefersHoverNone: true,
        },
        false,
        true,
      ),
    ).toBe(false);
  });

  // #153: Desktop full-load recovery — staticReveal transitions true→false after hydration.
  // ScrollReveal key='static'→'reveal' remount and TextReveal showImmediately=false
  // are both driven by this value change.
  // Note: the isReady=false case (→true) is already covered by
  // "returns true on desktop first full load" above.
  //
  // reduceMotion=null here mirrors useReducedMotion()'s unresolved state (framer returns
  // boolean|null). shouldUseStaticReveal treats null identically to false (only === true
  // triggers static). Both null and false yield the same result; null is used below to
  // represent the realistic hook output before the OS preference is known.
  it('returns false after isReady on desktop — enables whileInView scroll reveal (#153)', () => {
    // This state change (true→false) triggers ScrollReveal remount and TextReveal IO mode.
    expect(
      shouldUseStaticReveal(DEFAULT_DEVICE_PROFILE, null, true),
    ).toBe(false);
  });

  it('returns true after isReady on mobile — no regression from #151', () => {
    expect(
      shouldUseStaticReveal(
        { ...DEFAULT_DEVICE_PROFILE, isMobile: true },
        null,
        true,
      ),
    ).toBe(true);
  });
});
