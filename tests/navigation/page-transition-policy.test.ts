import { describe, expect, it } from 'vitest';
import { shouldPageTransitionFade } from '@/lib/navigation/page-transition-policy';

describe('shouldPageTransitionFade', () => {
  it('skips fade on first visit', () => {
    expect(shouldPageTransitionFade(false, false)).toBe(false);
  });

  it('skips fade when reduced motion is enabled', () => {
    expect(shouldPageTransitionFade(true, true)).toBe(false);
  });

  it('skips fade when reduced motion preference is undecided (null)', () => {
    expect(shouldPageTransitionFade(true, null)).toBe(false);
  });

  it('skips fade on mobile (SPA client nav — #151)', () => {
    expect(shouldPageTransitionFade(true, false, true)).toBe(false);
  });

  it('fades on desktop subsequent visit when motion is allowed', () => {
    expect(shouldPageTransitionFade(true, false, false)).toBe(true);
  });
});
