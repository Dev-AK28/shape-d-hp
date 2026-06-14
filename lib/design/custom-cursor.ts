import type { DeviceProfile } from '@/lib/performance/device-profile';

export const CUSTOM_CURSOR_ATTR = 'data-custom-cursor';

export function shouldEnableCustomCursor(
  profile: DeviceProfile,
  isReady: boolean,
): boolean {
  return (
    isReady &&
    !profile.prefersReducedMotion &&
    !profile.isMobile &&
    !profile.prefersCoarsePointer &&
    !profile.prefersHoverNone
  );
}

export function setCustomCursorActive(active: boolean): void {
  if (typeof document === 'undefined') {
    return;
  }

  if (active) {
    document.documentElement.setAttribute(CUSTOM_CURSOR_ATTR, 'active');
    return;
  }

  document.documentElement.removeAttribute(CUSTOM_CURSOR_ATTR);
}
