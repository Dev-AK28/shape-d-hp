import { isTouchInputDevice } from '@/lib/performance/device-profile';
import type { DeviceProfile } from '@/lib/performance/device-profile';

export const CUSTOM_CURSOR_ATTR = 'data-custom-cursor';

const TEXT_INPUT_TAGS = new Set(['INPUT', 'TEXTAREA', 'SELECT']);

export function isTextInputElement(element: HTMLElement): boolean {
  return TEXT_INPUT_TAGS.has(element.tagName);
}

export function shouldEnableCustomCursor(
  profile: DeviceProfile,
  isReady: boolean,
): boolean {
  return (
    isReady &&
    !profile.prefersReducedMotion &&
    !isTouchInputDevice(profile) &&
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
