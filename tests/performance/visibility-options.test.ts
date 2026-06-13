import { describe, expect, it } from 'vitest';
import {
  NEBULA_INTERSECTION_OPTIONS,
  STAR_INTERSECTION_OPTIONS,
} from '@/lib/performance/visibility-options';

describe('visibility-options', () => {
  it('requires a meaningful viewport overlap before animating stars', () => {
    expect(STAR_INTERSECTION_OPTIONS.threshold).toBeGreaterThan(0);
    expect(STAR_INTERSECTION_OPTIONS.rootMargin).toContain('-10%');
  });

  it('uses a stricter margin for nebula layers', () => {
    expect(NEBULA_INTERSECTION_OPTIONS.threshold).toBeGreaterThan(0);
    expect(NEBULA_INTERSECTION_OPTIONS.rootMargin).toContain('-15%');
  });
});
