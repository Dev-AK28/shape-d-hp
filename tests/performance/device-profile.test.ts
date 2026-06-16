import { afterEach, describe, expect, it } from 'vitest';
import {
  DEFAULT_DEVICE_PROFILE,
  isMobileViewport,
  isTouchInputDevice,
  mobileMaxWidthMediaQuery,
  desktopMinWidthMediaQuery,
  readDeviceProfile,
  resetDeviceProfileCache,
  shouldAnimateStars,
  shouldDisableSmoothScroll,
  shouldDisableWebGL,
} from '@/lib/performance/device-profile';

describe('device-profile', () => {
  afterEach(() => {
    resetDeviceProfileCache();
  });
  it('detects mobile viewport below 768px', () => {
    expect(isMobileViewport(767)).toBe(true);
    expect(isMobileViewport(768)).toBe(false);
  });

  it('disables smooth scroll only when prefers-reduced-motion is active', () => {
    expect(shouldDisableSmoothScroll(DEFAULT_DEVICE_PROFILE)).toBe(false);
    expect(
      shouldDisableSmoothScroll({
        ...DEFAULT_DEVICE_PROFILE,
        isMobile: true,
      }),
    ).toBe(false);
    expect(
      shouldDisableSmoothScroll({
        ...DEFAULT_DEVICE_PROFILE,
        prefersCoarsePointer: true,
      }),
    ).toBe(false);
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

  it('exposes a shared mobile media query from the breakpoint constant', () => {
    expect(mobileMaxWidthMediaQuery()).toBe('(max-width: 767px)');
  });

  it('exposes a shared desktop min-width media query from the breakpoint constant', () => {
    expect(desktopMinWidthMediaQuery()).toBe('(min-width: 768px)');
  });

  it('returns the default profile when window is unavailable', () => {
    expect(readDeviceProfile()).toEqual(DEFAULT_DEVICE_PROFILE);
  });

  it('includes prefersHoverNone in the default profile', () => {
    expect(DEFAULT_DEVICE_PROFILE.prefersHoverNone).toBe(false);
  });

  it('includes hasWebGL as false in the default profile (SSR safe)', () => {
    expect(DEFAULT_DEVICE_PROFILE.hasWebGL).toBe(false);
  });

  it('enables WebGL on mobile when WebGL is supported and no reduced-motion preference', () => {
    expect(
      shouldDisableWebGL({ ...DEFAULT_DEVICE_PROFILE, isMobile: true, hasWebGL: true }),
    ).toBe(false);
  });

  it('disables WebGL when prefers-reduced-motion is set', () => {
    expect(
      shouldDisableWebGL({ ...DEFAULT_DEVICE_PROFILE, prefersReducedMotion: true, hasWebGL: true }),
    ).toBe(true);
  });

  it('disables WebGL when the browser has no WebGL support', () => {
    expect(
      shouldDisableWebGL({ ...DEFAULT_DEVICE_PROFILE, hasWebGL: false }),
    ).toBe(true);
  });

  it('enables WebGL on desktop with WebGL support and no reduced-motion preference', () => {
    expect(
      shouldDisableWebGL({ ...DEFAULT_DEVICE_PROFILE, hasWebGL: true }),
    ).toBe(false);
  });

  describe('isTouchInputDevice', () => {
    it('returns false for desktop with mouse pointer', () => {
      expect(isTouchInputDevice(DEFAULT_DEVICE_PROFILE)).toBe(false);
    });

    it('returns true for mobile viewport (< 768px)', () => {
      expect(isTouchInputDevice({ ...DEFAULT_DEVICE_PROFILE, isMobile: true })).toBe(true);
    });

    it('returns true for coarse pointer device (large tablet, e.g. iPad Pro)', () => {
      expect(
        isTouchInputDevice({ ...DEFAULT_DEVICE_PROFILE, prefersCoarsePointer: true }),
      ).toBe(true);
    });

    it('returns true when both isMobile and prefersCoarsePointer are true', () => {
      expect(
        isTouchInputDevice({ ...DEFAULT_DEVICE_PROFILE, isMobile: true, prefersCoarsePointer: true }),
      ).toBe(true);
    });

    it('is independent of prefers-reduced-motion', () => {
      expect(
        isTouchInputDevice({ ...DEFAULT_DEVICE_PROFILE, prefersReducedMotion: true }),
      ).toBe(false);
    });
  });
});
