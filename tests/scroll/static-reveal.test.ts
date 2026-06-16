import { describe, expect, it } from 'vitest';
import { DEFAULT_DEVICE_PROFILE } from '@/lib/performance/device-profile';
import { shouldUseStaticReveal } from '@/lib/scroll/static-reveal';

describe('shouldUseStaticReveal', () => {
  it('returns true for mobile profile (IO-unreliable on Lenis — #151, incl. SPA client nav)', () => {
    expect(
      shouldUseStaticReveal(
        { ...DEFAULT_DEVICE_PROFILE, isMobile: true },
        false,
        true,
      ),
    ).toBe(true);
  });

  it('returns true when reduced motion is enabled', () => {
    expect(shouldUseStaticReveal(DEFAULT_DEVICE_PROFILE, true)).toBe(true);
  });

  it('returns true before device profile is ready', () => {
    expect(shouldUseStaticReveal(DEFAULT_DEVICE_PROFILE, false, false)).toBe(
      true,
    );
  });

  it('returns false for desktop without reduced motion', () => {
    expect(shouldUseStaticReveal(DEFAULT_DEVICE_PROFILE, false)).toBe(false);
  });
});
