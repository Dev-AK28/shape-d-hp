'use client';

import { useEffect, type ReactNode } from 'react';
import { useDeviceProfile } from '@/lib/hooks/useDeviceProfile';
import { shouldDisableSmoothScroll } from '@/lib/performance/device-profile';
import {
  configureGsapDefaults,
  gsap,
  registerGsapPlugins,
  ScrollTrigger,
} from '@/lib/scroll/gsap-config';

type SmoothScrollProviderProps = {
  children: ReactNode;
};

export default function SmoothScrollProvider({ children }: SmoothScrollProviderProps) {
  const { profile, isReady } = useDeviceProfile();

  useEffect(() => {
    if (!isReady) {
      return;
    }

    registerGsapPlugins();
    configureGsapDefaults();

    if (shouldDisableSmoothScroll(profile)) {
      return;
    }

    let lenis: InstanceType<Awaited<typeof import('lenis')>['default']> | undefined;
    let cancelled = false;
    let tickerCallback: ((time: number) => void) | undefined;

    void (async () => {
      const { default: Lenis } = await import('lenis');
      await import('lenis/dist/lenis.css');

      if (cancelled) {
        return;
      }

      lenis = new Lenis({
        duration: 1.4,
        smoothWheel: true,
      });

      lenis.on('scroll', ScrollTrigger.update);

      tickerCallback = (time: number) => {
        lenis?.raf(time * 1000);
      };

      gsap.ticker.add(tickerCallback);
      gsap.ticker.lagSmoothing(0);
    })();

    return () => {
      cancelled = true;
      if (tickerCallback) {
        gsap.ticker.remove(tickerCallback);
      }
      lenis?.destroy();
    };
  }, [isReady, profile]);

  return <>{children}</>;
}
