import { describe, expect, it } from 'vitest';
import { DEFAULT_DEVICE_PROFILE } from '@/lib/performance/device-profile';
import { getScrollRevealProps } from '@/lib/scroll/reveal-props';
import { shouldUseStaticReveal } from '@/lib/scroll/static-reveal';

describe('shouldUseStaticReveal', () => {
  it('returns true for mobile profile', () => {
    expect(
      shouldUseStaticReveal(
        { ...DEFAULT_DEVICE_PROFILE, isMobile: true },
        false,
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

describe('getScrollRevealProps staticReveal', () => {
  it('returns static visible state when staticReveal is enabled', () => {
    const props = getScrollRevealProps(false, { staticReveal: true });

    expect(props.initial).toBe(false);
    expect(props.transition.duration).toBe(0);
    expect(props.transition.delay).toBe(0);
  });
});
