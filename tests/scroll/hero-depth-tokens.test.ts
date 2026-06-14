import { describe, expect, it } from 'vitest';
import {
  HERO_DEPTH_PASSAGE,
  HERO_PIN_SCROLL,
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

  it('starts copy reveal during depth approach before pass-through completes', () => {
    expect(HERO_DEPTH_PASSAGE.revealTimelineStart).toBeLessThan(
      HERO_DEPTH_PASSAGE.approachPhaseEnd,
    );
  });
});
