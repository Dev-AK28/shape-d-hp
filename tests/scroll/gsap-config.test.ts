import { describe, expect, it } from 'vitest';
import {
  ANIMATION_DURATION,
  ANIMATION_EASE,
  shouldDisableGsapAnimation,
} from '@/lib/scroll/gsap-config';
import { REVEAL_OFFSET } from '@/lib/scroll/animation-tokens';

describe('gsap-config', () => {
  it('disables GSAP animations when prefers-reduced-motion is active', () => {
    expect(shouldDisableGsapAnimation(true)).toBe(true);
    expect(shouldDisableGsapAnimation(false)).toBe(false);
  });

  it('exports animation duration tokens within spec range', () => {
    expect(ANIMATION_DURATION.base).toBeGreaterThanOrEqual(1.2);
    expect(ANIMATION_DURATION.base).toBeLessThanOrEqual(2.0);
    expect(ANIMATION_DURATION.hero).toBe(1.6);
    expect(ANIMATION_DURATION.heroChild).toBe(1.2);
    expect(ANIMATION_DURATION.display).toBe(2);
  });

  it('exports expo.out and power3 easing tokens', () => {
    expect(ANIMATION_EASE.base).toBe('expo.out');
    expect(ANIMATION_EASE.section).toBe('power3.inOut');
    expect(ANIMATION_EASE.reveal).toBe('power3.out');
  });

  it('exports reveal offset tokens aligned with easing SSOT', () => {
    expect(REVEAL_OFFSET.y).toBe(20);
    expect(REVEAL_OFFSET.heroChildY).toBe(40);
    expect(REVEAL_OFFSET.x).toBe(-20);
    expect(REVEAL_OFFSET.textRevealStagger).toBe(0.06);
    expect(REVEAL_OFFSET.textRevealDurationScale).toBe(0.65);
    expect(REVEAL_OFFSET.stagger).toBe(0.15);
  });
});
