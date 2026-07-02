/**
 * @vitest-environment jsdom
 *
 * renderHook integration tests for `useStaticReveal()`.
 * Verifies the hook correctly wires `useDeviceProfile` + `useReducedMotion`
 * into `shouldUseStaticReveal` and returns a consistent `StaticRevealState`.
 *
 * Pure-function contract matrix: tests/scroll/use-static-reveal.test.ts
 * Issue: #154 (@testing-library/react renderHook integration)
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { DEFAULT_DEVICE_PROFILE } from '@/lib/performance/device-profile';
import type { DeviceProfile } from '@/lib/performance/device-profile';
import { shouldUseStaticReveal } from '@/lib/scroll/static-reveal';
import { useStaticReveal } from '@/lib/hooks/useStaticReveal';

const { mockUseDeviceProfile, mockUseReducedMotion } = vi.hoisted(() => ({
  mockUseDeviceProfile: vi.fn<() => { profile: DeviceProfile; isReady: boolean }>(),
  mockUseReducedMotion: vi.fn<() => boolean | null>(),
}));

vi.mock('@/lib/hooks/useDeviceProfile', () => ({
  useDeviceProfile: mockUseDeviceProfile,
}));

vi.mock('framer-motion', () => ({
  useReducedMotion: mockUseReducedMotion,
}));

const MOBILE: DeviceProfile = { ...DEFAULT_DEVICE_PROFILE, isMobile: true };

const REDUCED_MOTION_PROFILE: DeviceProfile = {
  ...DEFAULT_DEVICE_PROFILE,
  prefersReducedMotion: true,
};

const COARSE_TABLET: DeviceProfile = {
  ...DEFAULT_DEVICE_PROFILE,
  prefersCoarsePointer: true,
  prefersHoverNone: true,
};

type Case = {
  label: string;
  profile: DeviceProfile;
  reduceMotion: boolean | null;
  isReady: boolean;
};

const MATRIX: Case[] = [
  {
    label: 'desktop / reduceMotion=false / isReady=true → false (whileInView enabled)',
    profile: DEFAULT_DEVICE_PROFILE,
    reduceMotion: false,
    isReady: true,
  },
  {
    label: 'desktop / reduceMotion=false / isReady=false → true (SSR first-load)',
    profile: DEFAULT_DEVICE_PROFILE,
    reduceMotion: false,
    isReady: false,
  },
  {
    label: 'mobile / reduceMotion=false / isReady=true → false (mobile scroll reveal #180)',
    profile: MOBILE,
    reduceMotion: false,
    isReady: true,
  },
  {
    label: 'mobile / reduceMotion=false / isReady=false → true (mobile SSR first-load)',
    profile: MOBILE,
    reduceMotion: false,
    isReady: false,
  },
  {
    label: 'desktop / reduceMotion=true / isReady=true → true (a11y: prefers-reduced-motion)',
    profile: DEFAULT_DEVICE_PROFILE,
    reduceMotion: true,
    isReady: true,
  },
  {
    label: 'desktop / reduceMotion=null (unresolved) / isReady=true → false',
    profile: DEFAULT_DEVICE_PROFILE,
    reduceMotion: null,
    isReady: true,
  },
  {
    label: 'prefersReducedMotion profile / reduceMotion=false / isReady=true → true (GSAP disabled)',
    profile: REDUCED_MOTION_PROFILE,
    reduceMotion: false,
    isReady: true,
  },
  {
    label: 'large tablet (coarse+hoverNone) / reduceMotion=false / isReady=true → false',
    profile: COARSE_TABLET,
    reduceMotion: false,
    isReady: true,
  },
  {
    label: 'mobile / reduceMotion=null (unresolved) / isReady=true → false (#280)',
    profile: MOBILE,
    reduceMotion: null,
    isReady: true,
  },
];

describe('useStaticReveal renderHook — wiring: useDeviceProfile + useReducedMotion', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  for (const { label, profile, reduceMotion, isReady } of MATRIX) {
    it(label, () => {
      mockUseDeviceProfile.mockReturnValue({ profile, isReady });
      mockUseReducedMotion.mockReturnValue(reduceMotion);

      const { result } = renderHook(() => useStaticReveal());

      const expected = shouldUseStaticReveal(profile, reduceMotion, isReady);

      expect(result.current.staticReveal).toBe(expected);
      expect(result.current.profile).toBe(profile);
      expect(result.current.isReady).toBe(isReady);
      expect(result.current.reduceMotion).toBe(reduceMotion);
      expect(mockUseDeviceProfile).toHaveBeenCalledTimes(1);
      expect(mockUseReducedMotion).toHaveBeenCalledTimes(1);
    });
  }

  // #153 / #180: isReady 遷移テスト — true→false の staticReveal 変化を rerender で検証
  it('desktop: isReady false→true で staticReveal が true→false に遷移する (#153 full-load recovery)', () => {
    mockUseDeviceProfile.mockReturnValue({ profile: DEFAULT_DEVICE_PROFILE, isReady: false });
    mockUseReducedMotion.mockReturnValue(false);

    const { result, rerender } = renderHook(() => useStaticReveal());

    expect(result.current.staticReveal).toBe(true);
    expect(result.current.isReady).toBe(false);

    mockUseDeviceProfile.mockReturnValue({ profile: DEFAULT_DEVICE_PROFILE, isReady: true });
    rerender();

    expect(result.current.staticReveal).toBe(false);
    expect(result.current.isReady).toBe(true);
    expect(mockUseDeviceProfile).toHaveBeenCalledTimes(2);
    expect(mockUseReducedMotion).toHaveBeenCalledTimes(2);
  });

  it('mobile: isReady false→true で staticReveal が true→false に遷移する (#180 full-load recovery)', () => {
    mockUseDeviceProfile.mockReturnValue({ profile: MOBILE, isReady: false });
    mockUseReducedMotion.mockReturnValue(false);

    const { result, rerender } = renderHook(() => useStaticReveal());

    expect(result.current.staticReveal).toBe(true);
    expect(result.current.isReady).toBe(false);

    mockUseDeviceProfile.mockReturnValue({ profile: MOBILE, isReady: true });
    rerender();

    expect(result.current.staticReveal).toBe(false);
    expect(result.current.isReady).toBe(true);
    expect(mockUseDeviceProfile).toHaveBeenCalledTimes(2);
    expect(mockUseReducedMotion).toHaveBeenCalledTimes(2);
  });
});
