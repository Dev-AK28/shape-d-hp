import { describe, expect, it } from 'vitest';
import { ANIMATION_DURATION } from '@/lib/scroll/animation-tokens';

describe('page transition tokens', () => {
  it('uses 0.6s fade duration per spec', () => {
    expect(ANIMATION_DURATION.pageTransition).toBe(0.6);
  });

  it('uses shorter duration than scroll reveal animations', () => {
    expect(ANIMATION_DURATION.pageTransition).toBeLessThan(ANIMATION_DURATION.base);
  });
});
