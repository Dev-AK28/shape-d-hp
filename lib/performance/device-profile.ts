import { detectWebGLSupport } from '@/lib/webgl/support';

export const MOBILE_BREAKPOINT_PX = 768;

export type DeviceProfile = {
  isMobile: boolean;
  prefersReducedMotion: boolean;
  prefersCoarsePointer: boolean;
  prefersHoverNone: boolean;
  /** WebGL 2 or WebGL 1 is available in this browser. False during SSR. */
  hasWebGL: boolean;
};

export const DEFAULT_DEVICE_PROFILE: DeviceProfile = {
  isMobile: false,
  prefersReducedMotion: false,
  prefersCoarsePointer: false,
  prefersHoverNone: false,
  hasWebGL: false,
};

export function mobileMaxWidthMediaQuery(): string {
  return `(max-width: ${MOBILE_BREAKPOINT_PX - 1}px)`;
}

export function desktopMinWidthMediaQuery(): string {
  return `(min-width: ${MOBILE_BREAKPOINT_PX}px)`;
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
    prefersHoverNone: window.matchMedia('(hover: none)').matches,
    hasWebGL: detectWebGLSupport(),
  };

  if (
    cachedDeviceProfile &&
    cachedDeviceProfile.isMobile === next.isMobile &&
    cachedDeviceProfile.prefersReducedMotion === next.prefersReducedMotion &&
    cachedDeviceProfile.prefersCoarsePointer === next.prefersCoarsePointer &&
    cachedDeviceProfile.prefersHoverNone === next.prefersHoverNone &&
    cachedDeviceProfile.hasWebGL === next.hasWebGL
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
  return profile.prefersReducedMotion;
}

export function shouldAnimateStars(profile: DeviceProfile): boolean {
  return !profile.prefersReducedMotion;
}

/**
 * Returns true when WebGL should be disabled.
 * Disabled when prefers-reduced-motion is active or the browser lacks WebGL support.
 * The existing static CosmicScene background serves as the fallback in all cases.
 */
export function shouldDisableWebGL(profile: DeviceProfile): boolean {
  return profile.prefersReducedMotion || !profile.hasWebGL;
}
