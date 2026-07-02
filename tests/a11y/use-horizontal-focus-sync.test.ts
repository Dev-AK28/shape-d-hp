import { describe, expect, it } from 'vitest';
import { computePanelScrollTarget } from '@/lib/hooks/useHorizontalFocusSync';

/**
 * Unit tests for `computePanelScrollTarget`.
 *
 * This pure helper is the scroll-target formula used by `useHorizontalFocusSync`
 * to map a panel index to a window Y scroll position inside a GSAP horizontal-
 * pin ScrollTrigger (Issue #247).
 *
 * Formula: stStart + panelIndex * innerWidth
 *   - stStart    = Y offset where the ScrollTrigger pin locks (px from top)
 *   - panelIndex = 0-based index of the target panel
 *   - innerWidth = one viewport width per panel
 */
describe('computePanelScrollTarget', () => {
  it('returns stStart for the first panel (index 0)', () => {
    expect(computePanelScrollTarget(0, 500, 1024)).toBe(500);
  });

  it('returns stStart + innerWidth for the second panel (index 1)', () => {
    expect(computePanelScrollTarget(1, 500, 1024)).toBe(1524);
  });

  it('returns stStart + 2*innerWidth for the third panel (index 2)', () => {
    expect(computePanelScrollTarget(2, 500, 1024)).toBe(2548);
  });

  it('returns stStart + (N-1)*innerWidth for the last panel in a 5-panel layout', () => {
    // ShowcaseSection has 4 service cards; last index = 3
    expect(computePanelScrollTarget(3, 500, 1024)).toBe(500 + 3 * 1024);
  });

  it('handles stStart = 0 (pin starts at the very top of the page)', () => {
    expect(computePanelScrollTarget(2, 0, 1440)).toBe(2880);
  });

  it('handles a 1440px viewport (common desktop width)', () => {
    expect(computePanelScrollTarget(1, 800, 1440)).toBe(2240);
  });

  it('handles a 6-panel PhilosophyContent layout, last panel (index 5)', () => {
    expect(computePanelScrollTarget(5, 300, 1280)).toBe(300 + 5 * 1280);
  });

  it('returns integer results when inputs are integers', () => {
    const result = computePanelScrollTarget(2, 1000, 1920);
    expect(Number.isInteger(result)).toBe(true);
    expect(result).toBe(4840);
  });
});
