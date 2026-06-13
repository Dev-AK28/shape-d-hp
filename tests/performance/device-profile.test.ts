import { describe, expect, it } from 'vitest';
import {
  DEFAULT_DEVICE_PROFILE,
  isMobileViewport,
  shouldAnimateStars,
  shouldDisableSmoothScroll,
} from '@/lib/performance/device-profile';

describe('device-profile', () => {
  it('detects mobile viewport below 768px', () => {
    expect(isMobileViewport(767)).toBe(true);
    expect(isMobileViewport(768)).toBe(false);
  });

  it('disables smooth scroll on mobile, coarse pointer, or reduced motion', () => {
    expect(shouldDisableSmoothScroll(DEFAULT_DEVICE_PROFILE)).toBe(false);
    expect(
      shouldDisableSmoothScroll({
        ...DEFAULT_DEVICE_PROFILE,
        isMobile: true,
      }),
    ).toBe(true);
    expect(
      shouldDisableSmoothScroll({
        ...DEFAULT_DEVICE_PROFILE,
        prefersCoarsePointer: true,
      }),
    ).toBe(true);
    expect(
      shouldDisableSmoothScroll({
        ...DEFAULT_DEVICE_PROFILE,
        prefersReducedMotion: true,
      }),
    ).toBe(true);
  });

  it('stops star animation when reduced motion is enabled', () => {
    expect(shouldAnimateStars(DEFAULT_DEVICE_PROFILE)).toBe(true);
    expect(
      shouldAnimateStars({
        ...DEFAULT_DEVICE_PROFILE,
        prefersReducedMotion: true,
      }),
    ).toBe(false);
  });
});
