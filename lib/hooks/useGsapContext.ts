'use client';

import { useLayoutEffect, useRef } from 'react';
import {
  gsap,
  refreshScrollTrigger,
  registerGsapPlugins,
  shouldDisableGsapAnimation,
} from '@/lib/scroll/gsap-config';
import { useDeviceProfile } from '@/lib/hooks/useDeviceProfile';

type GsapSetupFn = () => void;

export function useGsapContext(
  setup: GsapSetupFn,
  deps: ReadonlyArray<unknown> = [],
): void {
  const { profile, isReady } = useDeviceProfile();
  const setupRef = useRef(setup);
  setupRef.current = setup;

  useLayoutEffect(() => {
    if (!isReady || shouldDisableGsapAnimation(profile)) {
      return;
    }

    registerGsapPlugins();

    const ctx = gsap.context(() => {
      setupRef.current();
    });
    refreshScrollTrigger();

    return () => {
      ctx.revert();
      refreshScrollTrigger();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- caller controls deps
  }, [isReady, profile.isMobile, profile.prefersCoarsePointer, profile.prefersReducedMotion, ...deps]);
}
