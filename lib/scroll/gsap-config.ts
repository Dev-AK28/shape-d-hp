import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ANIMATION_DURATION, ANIMATION_EASE, GSAP_TICKER } from './animation-tokens';
import {
  shouldDisableSmoothScroll,
  type DeviceProfile,
} from '@/lib/performance/device-profile';

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

export function shouldDisableGsapAnimation(profile: DeviceProfile): boolean {
  return shouldDisableSmoothScroll(profile);
}

export function refreshScrollTrigger(): void {
  if (typeof window === 'undefined') {
    return;
  }
  registerGsapPlugins();
  ScrollTrigger.refresh();
}

export { gsap, ScrollTrigger, ANIMATION_DURATION, ANIMATION_EASE, GSAP_TICKER };
