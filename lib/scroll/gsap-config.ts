import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { DeviceProfile } from '@/lib/performance/device-profile';
import { shouldDisableSmoothScroll } from '@/lib/performance/device-profile';
import { ANIMATION_DURATION, ANIMATION_EASE } from './animation-tokens';

let registered = false;

export function registerGsapPlugins(): void {
  if (registered || typeof window === 'undefined') {
    return;
  }

  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });

  registered = true;
}

export function configureGsapDefaults(): void {
  gsap.defaults({
    duration: ANIMATION_DURATION.base,
    ease: ANIMATION_EASE.base,
  });
}

/** Align GSAP scroll-driven effects with Lenis disable policy (mobile / coarse / reduced motion). */
export function shouldDisableGsapAnimation(profile: DeviceProfile): boolean {
  return shouldDisableSmoothScroll(profile);
}

export function refreshScrollTrigger(): void {
  if (typeof window === 'undefined') {
    return;
  }
  ScrollTrigger.refresh();
}

export { gsap, ScrollTrigger, ANIMATION_DURATION, ANIMATION_EASE };
