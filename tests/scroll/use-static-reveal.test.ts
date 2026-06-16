import { describe, expect, it } from 'vitest';
import { DEFAULT_DEVICE_PROFILE } from '@/lib/performance/device-profile';
import { shouldUseStaticReveal } from '@/lib/scroll/static-reveal';

/**
 * Contract tests for `useStaticReveal()` wiring.
 * The hook delegates to `shouldUseStaticReveal(profile, reduceMotion, isReady)` —
 * keep matrices in sync with lib/hooks/useStaticReveal.ts.
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
});
