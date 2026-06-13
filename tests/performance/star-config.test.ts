import { describe, expect, it } from 'vitest';
import { DEFAULT_DEVICE_PROFILE } from '@/lib/performance/device-profile';
import {
  getStarUpdateIntervalMs,
  scaleStarConfig,
  STAR_UPDATE_INTERVAL_MS,
} from '@/lib/performance/star-config';

const BASE_CONFIG = {
  count: 300,
  maxSize: 3.5,
  minSize: 0.5,
  maxOpacity: 1,
  minOpacity: 0.2,
  maxSpeed: 0.6,
  minSpeed: 0.1,
  drift: 0.2,
  glowMultiplier: 2,
};

describe('star-config', () => {
  it('keeps desktop config unchanged', () => {
    expect(scaleStarConfig(BASE_CONFIG, DEFAULT_DEVICE_PROFILE)).toEqual(BASE_CONFIG);
    expect(getStarUpdateIntervalMs(DEFAULT_DEVICE_PROFILE)).toBe(STAR_UPDATE_INTERVAL_MS.desktop);
  });

  it('reduces mobile star count and glow while slowing updates', () => {
    const mobileProfile = {
      ...DEFAULT_DEVICE_PROFILE,
      isMobile: true,
    };
    const scaled = scaleStarConfig(BASE_CONFIG, mobileProfile);

    expect(scaled.count).toBe(105);
    expect(scaled.glowMultiplier).toBe(0);
    expect(getStarUpdateIntervalMs(mobileProfile)).toBe(STAR_UPDATE_INTERVAL_MS.mobile);
  });

  it('never scales mobile count below 20', () => {
    const mobileProfile = {
      ...DEFAULT_DEVICE_PROFILE,
      isMobile: true,
    };

    expect(
      scaleStarConfig(
        {
          ...BASE_CONFIG,
          count: 30,
        },
        mobileProfile,
      ).count,
    ).toBe(20);
  });
});
