import { describe, expect, it } from 'vitest';
import { getScrollRevealProps } from '@/lib/scroll/reveal-props';

describe('getScrollRevealProps', () => {
  it.each([
    { label: 'reduced motion', reduceMotion: true as const, options: {} },
    { label: 'staticReveal option (#151)', reduceMotion: false as const, options: { staticReveal: true } },
  ])('returns animate-only props when $label is enabled', ({ reduceMotion, options }) => {
    const props = getScrollRevealProps(reduceMotion, options);

    expect(props.initial).toBe(false);
    // #150: staticReveal animate must be opacity-only (no transform) to avoid GPU compositing
    // layer conflicts with backdrop-filter that clip heading content on iOS at 375px.
    expect(props.animate).toEqual({ opacity: 1 });
    expect(props.whileInView).toBeUndefined();
    expect(props.viewport).toBeUndefined();
    expect(props.transition.duration).toBe(0);
    expect(props.transition.delay).toBe(0);
  });

  it('uses whileInView (not animate) for scroll-driven reveal', () => {
    const props = getScrollRevealProps(false);

    expect(props.animate).toBeUndefined();
    expect(props.initial).toEqual({ opacity: 0, y: 20 });
    expect(props.whileInView).toEqual({ opacity: 1, y: 0 });
  });

  it('supports fadeLeft variant with stagger delay', () => {
    const props = getScrollRevealProps(false, {
      variant: 'fadeLeft',
      delay: 0.5,
      staggerIndex: 2,
      staggerStep: 0.1,
    });

    expect(props.animate).toBeUndefined();
    expect(props.initial).toEqual({ opacity: 0, x: -20 });
    expect(props.transition.delay).toBeCloseTo(0.7);
  });

  it('uses shared viewport settings for scroll-driven reveal', () => {
    const props = getScrollRevealProps(false);

    expect(props.animate).toBeUndefined();
    expect(props.viewport).toEqual({
      once: true,
      margin: '-80px',
      amount: 0.2,
    });
  });
});
