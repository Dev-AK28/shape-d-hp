import { describe, expect, it } from 'vitest';
import {
  ANIMATION_DURATION,
  ANIMATION_EASE,
} from '@/lib/scroll/animation-tokens';
import {
  MICRO_INTERACTION,
  isMicroInteractionVariant,
} from '@/lib/scroll/micro-interaction';

describe('micro-interaction', () => {
  it('exports interaction duration aligned with CSS --duration-interaction', () => {
    expect(ANIMATION_DURATION.interaction).toBe(0.25);
  });

  it('uses power2.out for hover quickTo without bounce', () => {
    expect(ANIMATION_EASE.interaction).toBe('power2.out');
  });

  it('defines nav, cta, and footer presets with rest and hover states', () => {
    expect(MICRO_INTERACTION.nav.hover.opacity).toBe(0.75);
    expect(MICRO_INTERACTION.nav.hover.letterSpacing).toBe('0.14em');
    expect(MICRO_INTERACTION.cta.hover.scale).toBe(1.03);
    expect(MICRO_INTERACTION.footer.hover.opacity).toBe(0.75);
  });

  it('validates micro-interaction variant names', () => {
    expect(isMicroInteractionVariant('nav')).toBe(true);
    expect(isMicroInteractionVariant('cta')).toBe(true);
    expect(isMicroInteractionVariant('footer')).toBe(true);
    expect(isMicroInteractionVariant('card')).toBe(false);
    expect(isMicroInteractionVariant(undefined)).toBe(false);
  });
});
