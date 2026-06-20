'use client';

import { useEffect, type ReactNode } from 'react';
import { useDeviceProfile } from '@/lib/hooks/useDeviceProfile';
import { shouldDisableSmoothScroll } from '@/lib/performance/device-profile';
import {
  configureGsapDefaults,
  gsap,
  registerGsapPlugins,
  refreshScrollTrigger,
  ScrollTrigger,
} from '@/lib/scroll/gsap-config';
import { VELOCITY_SKEW } from '@/lib/scroll/animation-tokens';

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
    const defaultLagSmoothing = 500;

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

      // Velocity-driven skewY: queries DOM fresh on each call to handle SPA route changes.
      let skewSetter: ((v: number) => void) | null = null;
      let skewTarget: Element | null = null;

      const getSkewSetter = () => {
        const el = document.querySelector('[data-velocity-content]');
        if (el !== skewTarget) {
          skewTarget = el;
          skewSetter = el
            ? gsap.quickTo(el, 'skewY', {
                duration: VELOCITY_SKEW.quickToDuration,
                ease: VELOCITY_SKEW.quickToEase,
              })
            : null;
        }
        return skewSetter;
      };

      lenis.on('scroll', (lenisInstance) => {
        ScrollTrigger.update();
        const setter = getSkewSetter();
        if (setter) {
          const { maxDegrees, velocityFactor } = VELOCITY_SKEW;
          setter(Math.max(-maxDegrees, Math.min(maxDegrees, lenisInstance.velocity * velocityFactor)));
        }
      });

      tickerCallback = (time: number) => {
        lenis?.raf(time * 1000);
      };

      gsap.ticker.add(tickerCallback);
      gsap.ticker.lagSmoothing(0);
      refreshScrollTrigger();
    })();

    return () => {
      cancelled = true;
      if (tickerCallback) {
        gsap.ticker.remove(tickerCallback);
      }
      gsap.ticker.lagSmoothing(defaultLagSmoothing);
      lenis?.destroy();
    };
  }, [isReady, profile]);

  return <>{children}</>;
}
