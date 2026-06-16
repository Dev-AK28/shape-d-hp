import type { DeviceProfile } from '@/lib/performance/device-profile';
import { shouldDisableGsapAnimation } from '@/lib/scroll/gsap-config';

/** Whether scroll-driven reveals should render immediately (no hidden initial state). */
export function shouldUseStaticReveal(
  profile: DeviceProfile,
  reduceMotion: boolean | null,
  isReady = true,
): boolean {
  return (
    !isReady ||
    profile.isMobile ||
    shouldDisableGsapAnimation(profile) ||
    reduceMotion === true
  );
}
