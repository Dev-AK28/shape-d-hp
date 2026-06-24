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

    // Declared outside the IIFE so the cleanup function can release them and disconnect observer on unmount.
    let skewSetter: ((v: number) => void) | null = null;
    let skewTarget: Element | null = null;
    let skewObserver: MutationObserver | undefined;

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

      // Initial query for the velocity-skew target.
      skewTarget = document.querySelector('[data-velocity-content]');
      skewSetter = skewTarget
        ? gsap.quickTo(skewTarget, 'skewY', {
            duration: VELOCITY_SKEW.quickToDuration,
            ease: VELOCITY_SKEW.quickToEase,
          })
        : null;

      // SPA route changes swap the [data-velocity-content] element (template.tsx remounts).
      // MutationObserver updates the cached target outside the 60fps scroll handler.
      // Skip mutations that don't involve [data-velocity-content] to avoid redundant querySelector calls.
      skewObserver = new MutationObserver((records) => {
        const touched = records.some((r) =>
          [...r.addedNodes, ...r.removedNodes].some(
            (n) =>
              n instanceof Element &&
              (n.hasAttribute('data-velocity-content') || n.querySelector('[data-velocity-content]')),
          ),
        );
        if (!touched) return;
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
      });
      skewObserver.observe(document.body, { childList: true, subtree: true });

      lenis.on('scroll', (lenisInstance) => {
        ScrollTrigger.update();
        if (skewSetter) {
          const { maxDegrees, velocityFactor } = VELOCITY_SKEW;
          skewSetter(Math.max(-maxDegrees, Math.min(maxDegrees, lenisInstance.velocity * velocityFactor)));
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
      skewObserver?.disconnect();
      // Release quickTo instance and DOM reference to allow GC.
      skewSetter = null;
      skewTarget = null;
    };
  }, [isReady, profile]);

  return <>{children}</>;
}
