import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  HERO_DEPTH_PASSAGE,
  HERO_PIN_SCROLL,
  HERO_PIN_SELECTOR,
  HERO_PIN_TEST_ID,
  REVEAL_DELAY,
} from '@/lib/scroll/animation-tokens';

describe('hero depth passage tokens', () => {
  it('defines hero pin scroll trigger aligned with Hero.tsx', () => {
    expect(HERO_PIN_SCROLL.end).toBe('+=120%');
    expect(HERO_PIN_SCROLL.scrub).toBe(1.6);
    expect(HERO_PIN_SCROLL.anticipatePin).toBe(1);
  });

  it('defines layered depth scales for passage effect', () => {
    expect(HERO_DEPTH_PASSAGE.particleBand.approachScale).toBeGreaterThan(1);
    expect(HERO_DEPTH_PASSAGE.particleBand.passScale).toBeGreaterThan(
      HERO_DEPTH_PASSAGE.particleBand.approachScale,
    );
    expect(HERO_DEPTH_PASSAGE.logo.approachScale).toBeGreaterThan(1);
    expect(HERO_DEPTH_PASSAGE.cosmic.perspectiveScale).toBeGreaterThan(1);
  });

  it('partitions timeline duration into non-overlapping approach and pass phases', () => {
    const { timelineDuration, approachPhaseEnd } = HERO_DEPTH_PASSAGE;
    const approachDuration = timelineDuration * approachPhaseEnd;
    const passDuration = timelineDuration - approachDuration;

    expect(approachDuration).toBeCloseTo(0.55);
    expect(passDuration).toBeCloseTo(0.45);
    expect(approachDuration + passDuration).toBe(timelineDuration);
  });

  it('starts copy reveal during depth approach before pass-through completes', () => {
    expect(HERO_DEPTH_PASSAGE.revealTimelineStart).toBeLessThan(
      HERO_DEPTH_PASSAGE.approachPhaseEnd,
    );
  });

  it('hides hero logo at copy reveal start for cosmic typography blend (#101)', () => {
    expect(HERO_DEPTH_PASSAGE.logoOpacityHideAt).toBe(
      HERO_DEPTH_PASSAGE.revealTimelineStart,
    );
  });

  it('documents instant logo opacity hide via timeline.set in Hero.tsx', () => {
    const heroSource = readFileSync(
      join(process.cwd(), 'components/Hero.tsx'),
      'utf8',
    );
    expect(heroSource).toContain('timeline.set');
    expect(heroSource).toContain('logoOpacityHideAt * timelineDuration');
  });

  it('exposes hero pin selector for HomePageShell coupling', () => {
    expect(HERO_PIN_TEST_ID).toBe('hero-pin-section');
    expect(HERO_PIN_SELECTOR).toBe('[data-testid="hero-pin-section"]');
  });

  it('defines cosmic transform origin in SSOT', () => {
    expect(HERO_DEPTH_PASSAGE.cosmic.transformOrigin).toBe('50% 45%');
  });

  it('defines hero scroll indicator reveal delay as 1.2s SSOT', () => {
    expect(REVEAL_DELAY.heroScrollIndicator).toBe(1.2);
  });
});
