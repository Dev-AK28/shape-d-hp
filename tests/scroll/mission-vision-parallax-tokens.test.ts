import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { MISSION_VISION_PARALLAX } from '@/lib/scroll/animation-tokens';

describe('MISSION_VISION_PARALLAX tokens', () => {
  it('has positive desktop offsets in descending depth order (bg > mid > text)', () => {
    const { bgOffsetDesktop, midOffsetDesktop, textOffsetDesktop } = MISSION_VISION_PARALLAX;
    expect(bgOffsetDesktop).toBeGreaterThan(0);
    expect(midOffsetDesktop).toBeGreaterThan(0);
    expect(textOffsetDesktop).toBeGreaterThanOrEqual(0);
    expect(bgOffsetDesktop).toBeGreaterThan(midOffsetDesktop);
    expect(midOffsetDesktop).toBeGreaterThan(textOffsetDesktop);
  });

  it('mobileScale is in (0, 1) — weaker than desktop but still present', () => {
    const { mobileScale } = MISSION_VISION_PARALLAX;
    expect(mobileScale).toBeGreaterThan(0);
    expect(mobileScale).toBeLessThan(1);
  });

  it('mobile offsets are strictly less than desktop offsets', () => {
    const { bgOffsetDesktop, midOffsetDesktop, textOffsetDesktop, mobileScale } =
      MISSION_VISION_PARALLAX;
    expect(bgOffsetDesktop * mobileScale).toBeLessThan(bgOffsetDesktop);
    expect(midOffsetDesktop * mobileScale).toBeLessThan(midOffsetDesktop);
    expect(textOffsetDesktop * mobileScale).toBeLessThan(textOffsetDesktop);
  });

  it('has positive quote animation parameters', () => {
    expect(MISSION_VISION_PARALLAX.quoteDuration).toBeGreaterThan(0);
    expect(MISSION_VISION_PARALLAX.quoteStart).toBeTruthy();
  });

  it('MissionVision.tsx uses MISSION_VISION_PARALLAX token', () => {
    const source = readFileSync(
      join(process.cwd(), 'components/MissionVision.tsx'),
      'utf8',
    );
    expect(source).toContain('MISSION_VISION_PARALLAX');
    expect(source).toContain('ParallaxSection');
    expect(source).toContain('bgOffset');
    expect(source).toContain('midOffset');
    expect(source).toContain('textOffset');
  });

  it('MissionVision.tsx has mobile offset scaling via isTouchInputDevice', () => {
    const source = readFileSync(
      join(process.cwd(), 'components/MissionVision.tsx'),
      'utf8',
    );
    expect(source).toContain('isTouchInputDevice');
    expect(source).toContain('mobileScale');
    expect(source).toContain('offsetScale');
  });

  it('MissionVision.tsx has data-testid for section', () => {
    const source = readFileSync(
      join(process.cwd(), 'components/MissionVision.tsx'),
      'utf8',
    );
    expect(source).toContain('data-testid="mission-vision-section"');
  });

  it('MissionVision.tsx has three distinct parallax layers (bg/mid/text)', () => {
    const source = readFileSync(
      join(process.cwd(), 'components/MissionVision.tsx'),
      'utf8',
    );
    // Three ParallaxSection usages
    const parallaxCount = (source.match(/ParallaxSection/g) ?? []).length;
    // 1 import + 3 JSX usages = 4 occurrences minimum (or 3 if counted only by offset prop usage)
    expect(parallaxCount).toBeGreaterThanOrEqual(4);
    expect(source).toContain('bgOffset');
    expect(source).toContain('midOffset');
    expect(source).toContain('textOffset');
  });
});
