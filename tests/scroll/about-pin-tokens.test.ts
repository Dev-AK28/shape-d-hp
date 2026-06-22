import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { ABOUT_PIN_SCROLL, REVEAL_OFFSET } from '@/lib/scroll/animation-tokens';

describe('ABOUT_PIN_SCROLL tokens', () => {
  it('defines pin scroll trigger parameters', () => {
    expect(ABOUT_PIN_SCROLL.start).toBe('top top');
    expect(ABOUT_PIN_SCROLL.end).toBe('+=160%');
    expect(ABOUT_PIN_SCROLL.scrub).toBeGreaterThan(0);
    expect(ABOUT_PIN_SCROLL.anticipatePin).toBe(1);
  });

  it('has timeline positions in ascending order', () => {
    const { headingRevealAt, pillar1RevealAt, pillar2RevealAt, historyRevealAt } = ABOUT_PIN_SCROLL;
    expect(headingRevealAt).toBeLessThan(pillar1RevealAt);
    expect(pillar1RevealAt).toBeLessThan(pillar2RevealAt);
    expect(pillar2RevealAt).toBeLessThan(historyRevealAt);
  });

  it('fills the timeline: last history item lands before timelineDuration', () => {
    const {
      historyRevealAt,
      historyItemDuration,
      historyStagger,
      timelineDuration,
    } = ABOUT_PIN_SCROLL;
    const maxItems = REVEAL_OFFSET.maxStaggerItems;
    const lastItemEnd =
      historyRevealAt + (maxItems - 1) * historyStagger + historyItemDuration;
    expect(lastItemEnd).toBeLessThanOrEqual(timelineDuration);
  });

  it('has positive durations for each reveal phase', () => {
    expect(ABOUT_PIN_SCROLL.headingRevealDuration).toBeGreaterThan(0);
    expect(ABOUT_PIN_SCROLL.pillarRevealDuration).toBeGreaterThan(0);
    expect(ABOUT_PIN_SCROLL.historyItemDuration).toBeGreaterThan(0);
    expect(ABOUT_PIN_SCROLL.historyStagger).toBeGreaterThan(0);
  });

  it('pillar phases do not overlap (pillar2 starts after pillar1 ends)', () => {
    const { pillar1RevealAt, pillarRevealDuration, pillar2RevealAt } = ABOUT_PIN_SCROLL;
    expect(pillar2RevealAt).toBeGreaterThanOrEqual(pillar1RevealAt + pillarRevealDuration);
  });

  it('About.tsx references ABOUT_PIN_SCROLL from animation-tokens', () => {
    const source = readFileSync(join(process.cwd(), 'components/About.tsx'), 'utf8');
    expect(source).toContain('ABOUT_PIN_SCROLL');
    expect(source).toContain('pin: true');
    expect(source).toContain('scrub: ABOUT_PIN_SCROLL.scrub');
  });

  it('About.tsx has mobile fallback without pin', () => {
    const source = readFileSync(join(process.cwd(), 'components/About.tsx'), 'utf8');
    expect(source).toContain('isTouchDevice');
    expect(source).toContain('toggleActions');
  });

  it('About.tsx has data-testid for the section', () => {
    const source = readFileSync(join(process.cwd(), 'components/About.tsx'), 'utf8');
    expect(source).toContain('data-testid="about-section"');
  });
});
