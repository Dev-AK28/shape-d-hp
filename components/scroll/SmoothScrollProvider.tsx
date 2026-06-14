'use client';

import { useEffect, type ReactNode } from 'react';
import { useDeviceProfile } from '@/lib/hooks/useDeviceProfile';
import { shouldDisableSmoothScroll } from '@/lib/performance/device-profile';
import {
  ANIMATION_DURATION,
  configureGsapDefaults,
  gsap,
  GSAP_TICKER,
  refreshScrollTrigger,
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
      refreshScrollTrigger();
      return () => {
        refreshScrollTrigger();
      };
    }

    type LenisInstance = InstanceType<Awaited<typeof import('lenis')>['default']>;
    let lenis: LenisInstance | undefined;
    let cancelled = false;
    let tickerCallback: ((time: number) => void) | undefined;

    void (async () => {
      try {
        const { default: Lenis } = await import('lenis');
        await import('lenis/dist/lenis.css');

        if (cancelled) {
          return;
        }

        const instance = new Lenis({
          duration: ANIMATION_DURATION.base,
          smoothWheel: true,
        });
        lenis = instance;

        instance.on('scroll', ScrollTrigger.update);

        tickerCallback = (time: number) => {
          lenis?.raf(time * 1000);
        };

        gsap.ticker.add(tickerCallback);
        gsap.ticker.lagSmoothing(GSAP_TICKER.lagSmoothingActive);
        refreshScrollTrigger();
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('[SmoothScrollProvider] Lenis failed to load; using native scroll.', error);
        }
        refreshScrollTrigger();
      }
    })();

    return () => {
      cancelled = true;
      if (tickerCallback) {
        gsap.ticker.remove(tickerCallback);
        gsap.ticker.lagSmoothing(
          GSAP_TICKER.lagSmoothingRestoreMs,
          GSAP_TICKER.lagSmoothingRestoreThreshold,
        );
      }
      lenis?.destroy();
      refreshScrollTrigger();
    };
  }, [isReady, profile]);

  return <>{children}</>;
}
