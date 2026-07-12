'use client';

import { useSyncExternalStore } from 'react';
import {
  DEFAULT_DEVICE_PROFILE,
  mobileMaxWidthMediaQuery,
  readDeviceProfile,
  type DeviceProfile,
} from '@/lib/performance/device-profile';
import { useIsMounted } from '@/lib/hooks/useIsMounted';

/**
 * Debounce delay (ms) applied to the window resize listener in
 * subscribeToDeviceProfile. matchMedia change events fire only at exact
 * breakpoint boundaries (browser-side debounced) so they remain immediate.
 * The resize listener is the only source of sub-breakpoint noise (#251).
 *
 * @client Exported from a `'use client'` module. Importing this constant in a
 * Server Component will cause a Next.js module-boundary error at runtime.
 */
export const RESIZE_DEBOUNCE_MS = 150;

/**
 * @internal Exported for behavioral testing of the resize debounce (#258).
 * Production code must use {@link useDeviceProfile} — this is passed directly to
 * `useSyncExternalStore` and is not part of the public API.
 */
export function subscribeToDeviceProfile(onStoreChange: () => void) {
  let resizeTimer: ReturnType<typeof setTimeout> | null = null;

  const debouncedStoreChange = () => {
    if (resizeTimer !== null) clearTimeout(resizeTimer);
    resizeTimer = setTimeout(onStoreChange, RESIZE_DEBOUNCE_MS);
  };

  const mobileQuery = window.matchMedia(mobileMaxWidthMediaQuery());
  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const pointerQuery = window.matchMedia('(pointer: coarse)');
  const hoverQuery = window.matchMedia('(hover: none)');

  mobileQuery.addEventListener('change', onStoreChange);
  motionQuery.addEventListener('change', onStoreChange);
  pointerQuery.addEventListener('change', onStoreChange);
  hoverQuery.addEventListener('change', onStoreChange);
  window.addEventListener('resize', debouncedStoreChange);

  return () => {
    if (resizeTimer !== null) {
      clearTimeout(resizeTimer);
      resizeTimer = null;
    }
    mobileQuery.removeEventListener('change', onStoreChange);
    motionQuery.removeEventListener('change', onStoreChange);
    pointerQuery.removeEventListener('change', onStoreChange);
    hoverQuery.removeEventListener('change', onStoreChange);
    window.removeEventListener('resize', debouncedStoreChange);
  };
}

export function useDeviceProfile(): { profile: DeviceProfile; isReady: boolean } {
  const profile = useSyncExternalStore(
    subscribeToDeviceProfile,
    readDeviceProfile,
    () => DEFAULT_DEVICE_PROFILE,
  );
  const isReady = useIsMounted();

  return { profile, isReady };
}
