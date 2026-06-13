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

export function mobileMaxWidthMediaQuery(): string {
  return `(max-width: ${MOBILE_BREAKPOINT_PX - 1}px)`;
}

export function isMobileViewport(width: number): boolean {
  return width < MOBILE_BREAKPOINT_PX;
}

let cachedDeviceProfile: DeviceProfile | null = null;

export function readDeviceProfile(): DeviceProfile {
  if (typeof window === 'undefined') {
    return DEFAULT_DEVICE_PROFILE;
  }

  const next: DeviceProfile = {
    isMobile: isMobileViewport(window.innerWidth),
    prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    prefersCoarsePointer: window.matchMedia('(pointer: coarse)').matches,
  };

  if (
    cachedDeviceProfile &&
    cachedDeviceProfile.isMobile === next.isMobile &&
    cachedDeviceProfile.prefersReducedMotion === next.prefersReducedMotion &&
    cachedDeviceProfile.prefersCoarsePointer === next.prefersCoarsePointer
  ) {
    return cachedDeviceProfile;
  }

  cachedDeviceProfile = next;
  return next;
}

export function resetDeviceProfileCache(): void {
  cachedDeviceProfile = null;
}

export function shouldDisableSmoothScroll(profile: DeviceProfile): boolean {
  return profile.prefersReducedMotion || profile.isMobile || profile.prefersCoarsePointer;
}

export function shouldAnimateStars(profile: DeviceProfile): boolean {
  return !profile.prefersReducedMotion;
}
