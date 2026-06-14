import type { DeviceProfile } from '@/lib/performance/device-profile';
import { shouldDisableGsapAnimation } from '@/lib/scroll/gsap-config';

/** Whether scroll-driven reveals should render immediately (no hidden initial state). */
export function shouldUseStaticReveal(
  profile: DeviceProfile,
  reduceMotion: boolean | null,
): boolean {
  return shouldDisableGsapAnimation(profile) || reduceMotion === true;
}
