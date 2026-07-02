import { describe, expect, it } from 'vitest';
import { DEFAULT_DEVICE_PROFILE } from '@/lib/performance/device-profile';
import { shouldUseStaticReveal } from '@/lib/scroll/static-reveal';

/**
 * Contract tests for `useStaticReveal()` wiring.
 * The hook delegates to `shouldUseStaticReveal(profile, reduceMotion, isReady)` —
 * keep matrices in sync with lib/hooks/useStaticReveal.ts.
 * 基本行列の重複ケースは static-reveal.test.ts、animate contract は reveal-props.test.ts。
 * Hook-level `renderHook` coverage: #154 — see use-static-reveal.renderHook.test.ts.
 */
describe('useStaticReveal contract (shouldUseStaticReveal matrix)', () => {
  it('returns false on mobile SPA after isReady — scroll reveal enabled on mobile (#180)', () => {
    expect(
      shouldUseStaticReveal(
        { ...DEFAULT_DEVICE_PROFILE, isMobile: true },
        false,
        true,
      ),
    ).toBe(false);
  });

  it('returns false on desktop SPA client nav (isReady=true, isMobile=false)', () => {
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

  // #153 / #180: Full-load recovery — staticReveal transitions true→false after hydration
  // on both desktop and mobile. ScrollReveal key='static'→'reveal' remount and TextReveal
  // showImmediately=false are both driven by this value change.
  // Note: the isReady=false case (→true) is covered by "returns true on desktop first full load".
  //
  // reduceMotion=null mirrors useReducedMotion()'s unresolved state (framer returns boolean|null).
  // shouldUseStaticReveal treats null identically to false (only === true triggers static).
  it('returns false after isReady on desktop — enables whileInView scroll reveal (#153)', () => {
    expect(
      shouldUseStaticReveal(DEFAULT_DEVICE_PROFILE, null, true),
    ).toBe(false);
  });

  it('returns false after isReady on mobile — whileInView scroll reveal enabled (#180)', () => {
    expect(
      shouldUseStaticReveal(
        { ...DEFAULT_DEVICE_PROFILE, isMobile: true },
        null,
        true,
      ),
    ).toBe(false);
  });
});
