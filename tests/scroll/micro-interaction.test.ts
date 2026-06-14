import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  ANIMATION_DURATION,
  ANIMATION_EASE,
} from '@/lib/scroll/animation-tokens';
import {
  MICRO_INTERACTION,
  isMicroInteractionVariant,
  shouldEnableMicroInteraction,
} from '@/lib/scroll/micro-interaction';

function mockWindowMatchMedia(matchesByQuery: Record<string, boolean>) {
  vi.stubGlobal('window', {
    matchMedia: (query: string) => ({
      matches: matchesByQuery[query] ?? false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }),
  });
}

describe('micro-interaction', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

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

  it('disables micro-interaction when window is unavailable', () => {
    expect(shouldEnableMicroInteraction()).toBe(false);
  });

  it('enables micro-interaction on desktop fine-pointer without reduced motion', () => {
    mockWindowMatchMedia({
      '(prefers-reduced-motion: reduce)': false,
      '(pointer: coarse)': false,
      '(hover: none)': false,
    });

    expect(shouldEnableMicroInteraction()).toBe(true);
  });

  it('disables micro-interaction when prefers-reduced-motion is active', () => {
    mockWindowMatchMedia({
      '(prefers-reduced-motion: reduce)': true,
      '(pointer: coarse)': false,
      '(hover: none)': false,
    });

    expect(shouldEnableMicroInteraction()).toBe(false);
  });

  it('disables micro-interaction on coarse pointer or hover:none', () => {
    mockWindowMatchMedia({
      '(prefers-reduced-motion: reduce)': false,
      '(pointer: coarse)': true,
      '(hover: none)': false,
    });
    expect(shouldEnableMicroInteraction()).toBe(false);

    mockWindowMatchMedia({
      '(prefers-reduced-motion: reduce)': false,
      '(pointer: coarse)': false,
      '(hover: none)': true,
    });
    expect(shouldEnableMicroInteraction()).toBe(false);
  });
});
