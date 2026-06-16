'use client';

import { useReducedMotion } from 'framer-motion';
import { useDeviceProfile } from '@/lib/hooks/useDeviceProfile';
import type { DeviceProfile } from '@/lib/performance/device-profile';
import { shouldUseStaticReveal } from '@/lib/scroll/static-reveal';

export type StaticRevealState = {
  profile: DeviceProfile;
  reduceMotion: boolean | null;
  isReady: boolean;
  /** Render scroll-reveal targets immediately (no hidden initial state). See Issue #151. */
  staticReveal: boolean;
};

/**
 * Shared scroll-reveal state for framer-motion `whileInView` consumers.
 *
 * Centralizes the `shouldUseStaticReveal(profile, reduceMotion, isReady)` pattern so
 * every reveal consumer mounts content visible during SSR / initial render (`!isReady`)
 * or on mobile (`profile.isMobile`, incl. SPA client navigation after #151),
 * instead of depending on IntersectionObserver firing (which broke on mobile Lenis — #151).
 */
export function useStaticReveal(): StaticRevealState {
  const reduceMotion = useReducedMotion();
  const { profile, isReady } = useDeviceProfile();
  const staticReveal = shouldUseStaticReveal(profile, reduceMotion, isReady);

  return { profile, reduceMotion, isReady, staticReveal };
}
