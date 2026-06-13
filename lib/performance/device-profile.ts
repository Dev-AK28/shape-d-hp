export const MOBILE_BREAKPOINT_PX = 768;

export type DeviceProfile = {
  isMobile: boolean;
  prefersReducedMotion: boolean;
  prefersCoarsePointer: boolean;
};

export const DEFAULT_DEVICE_PROFILE: DeviceProfile = {
  isMobile: false,
  prefersReducedMotion: false,
  prefersCoarsePointer: false,
};

export function isMobileViewport(width: number): boolean {
  return width < MOBILE_BREAKPOINT_PX;
}

export function shouldDisableSmoothScroll(profile: DeviceProfile): boolean {
  return profile.prefersReducedMotion || profile.isMobile || profile.prefersCoarsePointer;
}

export function shouldAnimateStars(profile: DeviceProfile): boolean {
  return !profile.prefersReducedMotion;
}
