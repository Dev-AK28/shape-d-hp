import type { DeviceProfile } from '@/lib/performance/device-profile';
export type StarConfig = {
  count?: number;
  maxSize?: number;
  minSize?: number;
  maxOpacity?: number;
  minOpacity?: number;
  maxSpeed?: number;
  minSpeed?: number;
  drift?: number;
  glowMultiplier?: number;
};

export const STAR_UPDATE_INTERVAL_MS = {
  desktop: 50,
  mobile: 150,
} as const;

const MOBILE_COUNT_RATIO = 0.45;
const MOBILE_GLOW_MULTIPLIER = 1;

export function scaleStarConfig(
  config: Required<StarConfig>,
  profile: DeviceProfile,
): Required<StarConfig> {
  if (!profile.isMobile) {
    return config;
  }

  return {
    ...config,
    count: Math.max(20, Math.round(config.count * MOBILE_COUNT_RATIO)),
    glowMultiplier: Math.min(config.glowMultiplier, MOBILE_GLOW_MULTIPLIER),
  };
}

export function getStarUpdateIntervalMs(profile: DeviceProfile): number {
  return profile.isMobile ? STAR_UPDATE_INTERVAL_MS.mobile : STAR_UPDATE_INTERVAL_MS.desktop;
}
