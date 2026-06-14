'use client';

import { useReducedMotion } from 'framer-motion';
import { useLayoutEffect, useRef } from 'react';
import { gsap, registerGsapPlugins, shouldDisableGsapAnimation } from '@/lib/scroll/gsap-config';
import { useDeviceProfile } from '@/lib/hooks/useDeviceProfile';

type GsapSetupFn = () => void;

export function useGsapContext(
  setup: GsapSetupFn,
  deps: ReadonlyArray<unknown> = [],
): void {
  const reduceMotion = useReducedMotion();
  const { profile, isReady } = useDeviceProfile();
  const setupRef = useRef(setup);
  setupRef.current = setup;

  const disableAnimation =
    shouldDisableGsapAnimation(profile) || reduceMotion === true;

  useLayoutEffect(() => {
    if (!isReady || disableAnimation) {
      return;
    }

    registerGsapPlugins();

    const ctx = gsap.context(() => {
      setupRef.current();
    });

    return () => {
      ctx.revert();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- caller controls deps
  }, [isReady, disableAnimation, ...deps]);
}
