import { describe, expect, it } from 'vitest';
import { ANIMATION_DURATION, REVEAL_OFFSET } from '@/lib/scroll/animation-tokens';
import {
  loopEase,
  pageTransitionEase,
  scrollStagger,
  scrollTransition,
  scrollVariants,
  textRevealDurationScale,
  textRevealStagger,
} from '@/lib/scroll/easing';

describe('easing ↔ animation-tokens chain', () => {
  it('scrollTransition.duration mirrors ANIMATION_DURATION.base', () => {
    expect(scrollTransition.duration).toBe(ANIMATION_DURATION.base);
  });

  it('scrollStagger mirrors REVEAL_OFFSET.stagger', () => {
    expect(scrollStagger.item).toBe(REVEAL_OFFSET.stagger);
    expect(scrollStagger.card).toBe(REVEAL_OFFSET.stagger);
  });

  it('textReveal exports mirror REVEAL_OFFSET', () => {
    expect(textRevealStagger).toBe(REVEAL_OFFSET.textRevealStagger);
    expect(textRevealDurationScale).toBe(REVEAL_OFFSET.textRevealDurationScale);
  });

  it('scrollVariants fade offsets mirror REVEAL_OFFSET', () => {
    expect(scrollVariants.fadeUp.hidden.y).toBe(REVEAL_OFFSET.y);
    expect(scrollVariants.fadeUpLarge.hidden.y).toBe(REVEAL_OFFSET.y);
    expect(scrollVariants.fadeLeft.hidden.x).toBe(REVEAL_OFFSET.x);
  });

  it('loopEase is easeInOut for decorative loops', () => {
    expect(loopEase).toBe('easeInOut');
  });

  it('pageTransitionEase matches motion.easeBase curve', () => {
    expect(pageTransitionEase).toEqual([0.16, 1, 0.3, 1]);
  });
});
