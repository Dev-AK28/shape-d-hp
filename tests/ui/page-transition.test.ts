import { describe, expect, it, beforeEach } from 'vitest';
import { ANIMATION_DURATION } from '@/lib/scroll/animation-tokens';
import { pageTransitionEase } from '@/lib/scroll/easing';
import { shouldPageTransitionFade } from '@/lib/navigation/page-transition-policy';
import { resetPageTransitionVisitForTests } from '@/components/ui/PageTransition';

describe('page transition tokens', () => {
  it('uses 0.6s fade duration per spec', () => {
    expect(ANIMATION_DURATION.pageTransition).toBe(0.6);
  });

  it('uses shorter duration than scroll reveal animations', () => {
    expect(ANIMATION_DURATION.pageTransition).toBeLessThan(ANIMATION_DURATION.base);
  });

  it('shares ease curve with motion.easeBase', () => {
    expect(pageTransitionEase).toEqual([0.16, 1, 0.3, 1]);
  });
});

describe('PageTransition visit tracking', () => {
  beforeEach(() => {
    resetPageTransitionVisitForTests();
  });

  it('reset clears module visit flag for isolated tests', () => {
    resetPageTransitionVisitForTests();
    expect(shouldPageTransitionFade(false, false)).toBe(false);
  });
});
