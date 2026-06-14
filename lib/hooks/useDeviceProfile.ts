'use client';

import { useSyncExternalStore } from 'react';
import {
  DEFAULT_DEVICE_PROFILE,
  mobileMaxWidthMediaQuery,
  readDeviceProfile,
  type DeviceProfile,
} from '@/lib/performance/device-profile';

function subscribeToDeviceProfile(onStoreChange: () => void) {
  const mobileQuery = window.matchMedia(mobileMaxWidthMediaQuery());
  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const pointerQuery = window.matchMedia('(pointer: coarse)');
  const hoverQuery = window.matchMedia('(hover: none)');

  mobileQuery.addEventListener('change', onStoreChange);
  motionQuery.addEventListener('change', onStoreChange);
  pointerQuery.addEventListener('change', onStoreChange);
  hoverQuery.addEventListener('change', onStoreChange);
  window.addEventListener('resize', onStoreChange);

  return () => {
    mobileQuery.removeEventListener('change', onStoreChange);
    motionQuery.removeEventListener('change', onStoreChange);
    pointerQuery.removeEventListener('change', onStoreChange);
    hoverQuery.removeEventListener('change', onStoreChange);
    window.removeEventListener('resize', onStoreChange);
  };
}

export function useDeviceProfile(): { profile: DeviceProfile; isReady: boolean } {
  const profile = useSyncExternalStore(
    subscribeToDeviceProfile,
    readDeviceProfile,
    () => DEFAULT_DEVICE_PROFILE,
  );
  const isReady = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  return { profile, isReady };
}
