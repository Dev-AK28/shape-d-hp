import { describe, expect, it } from 'vitest';
import {
  ANIMATION_DURATION,
  ANIMATION_EASE,
  shouldDisableGsapAnimation,
} from '@/lib/scroll/gsap-config';

describe('gsap-config', () => {
  it('disables GSAP animations when prefers-reduced-motion is active', () => {
    expect(shouldDisableGsapAnimation(true)).toBe(true);
    expect(shouldDisableGsapAnimation(false)).toBe(false);
  });

  it('exports animation duration tokens within spec range', () => {
    expect(ANIMATION_DURATION.base).toBeGreaterThanOrEqual(1.2);
    expect(ANIMATION_DURATION.base).toBeLessThanOrEqual(2.0);
    expect(ANIMATION_DURATION.hero).toBe(1.6);
  });

  it('exports expo.out and power3 easing tokens', () => {
    expect(ANIMATION_EASE.base).toBe('expo.out');
    expect(ANIMATION_EASE.section).toBe('power3.inOut');
    expect(ANIMATION_EASE.reveal).toBe('power3.out');
  });
});
