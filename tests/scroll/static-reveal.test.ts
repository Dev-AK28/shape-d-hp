import { describe, expect, it } from 'vitest';
import { DEFAULT_DEVICE_PROFILE } from '@/lib/performance/device-profile';
import { shouldUseStaticReveal } from '@/lib/scroll/static-reveal';

/**
 * shouldUseStaticReveal 基本行列（mobile / reduced-motion / !isReady / desktop）。
 * 拡張行列（large tablet 等）は use-static-reveal.test.ts。animate contract は reveal-props.test.ts。
 */
describe('shouldUseStaticReveal', () => {
  it('returns false for mobile profile after isReady (scroll reveal enabled on mobile — #180)', () => {
    expect(
      shouldUseStaticReveal(
        { ...DEFAULT_DEVICE_PROFILE, isMobile: true },
        false,
        true,
      ),
    ).toBe(false);
  });

  it('returns true when reduced motion is enabled', () => {
    expect(shouldUseStaticReveal(DEFAULT_DEVICE_PROFILE, true)).toBe(true);
  });

  it('returns true when profile.prefersReducedMotion is set even if reduceMotion hook is false', () => {
    // shouldDisableGsapAnimation(profile) reads profile.prefersReducedMotion independently of
    // framer-motion useReducedMotion(). Covers DeviceProfile / framer desync edge case.
    expect(
      shouldUseStaticReveal(
        { ...DEFAULT_DEVICE_PROFILE, prefersReducedMotion: true },
        false,
        true,
      ),
    ).toBe(true);
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
