'use client';

import { useEffect, type ReactNode } from 'react';
import Lenis from 'lenis';
import { shouldDisableSmoothScroll } from '@/lib/performance/device-profile';

type SmoothScrollProviderProps = {
  children: ReactNode;
};

function readScrollProfile() {
  return {
    isMobile: window.innerWidth < 768,
    prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    prefersCoarsePointer: window.matchMedia('(pointer: coarse)').matches,
  };
}

export default function SmoothScrollProvider({ children }: SmoothScrollProviderProps) {
  useEffect(() => {
    if (shouldDisableSmoothScroll(readScrollProfile())) {
      return;
    }

    const lenis = new Lenis({
      duration: 1.1,
      smoothWheel: true,
    });

    let frame = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    };

    frame = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
