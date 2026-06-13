'use client';

import { useEffect, useState } from 'react';
import {
  DEFAULT_DEVICE_PROFILE,
  isMobileViewport,
  type DeviceProfile,
} from '@/lib/performance/device-profile';

function readDeviceProfile(): DeviceProfile {
  if (typeof window === 'undefined') {
    return DEFAULT_DEVICE_PROFILE;
  }

  return {
    isMobile: isMobileViewport(window.innerWidth),
    prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    prefersCoarsePointer: window.matchMedia('(pointer: coarse)').matches,
  };
}

export function useDeviceProfile(): DeviceProfile {
  const [profile, setProfile] = useState<DeviceProfile>(DEFAULT_DEVICE_PROFILE);

  useEffect(() => {
    const mobileQuery = window.matchMedia(`(max-width: ${768 - 1}px)`);
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const pointerQuery = window.matchMedia('(pointer: coarse)');

    const sync = () => {
      setProfile(readDeviceProfile());
    };

    sync();
    mobileQuery.addEventListener('change', sync);
    motionQuery.addEventListener('change', sync);
    pointerQuery.addEventListener('change', sync);
    window.addEventListener('resize', sync);

    return () => {
      mobileQuery.removeEventListener('change', sync);
      motionQuery.removeEventListener('change', sync);
      pointerQuery.removeEventListener('change', sync);
      window.removeEventListener('resize', sync);
    };
  }, []);

  return profile;
}
