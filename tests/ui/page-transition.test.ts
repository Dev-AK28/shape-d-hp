import { describe, expect, it } from 'vitest';
import { ANIMATION_DURATION } from '@/lib/scroll/animation-tokens';

describe('page transition tokens', () => {
  it('uses 0.6s fade duration per spec', () => {
    expect(ANIMATION_DURATION.pageTransition).toBe(0.6);
  });
});
