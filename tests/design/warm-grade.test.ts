import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { warmGrade } from '@/lib/design/tokens';

const globalsCss = readFileSync(join(process.cwd(), 'app/globals.css'), 'utf8');
const cosmicSceneSource = readFileSync(
  join(process.cwd(), 'components/background/CosmicScene.tsx'),
  'utf8',
);

describe('warmGrade tokens (Issue #102)', () => {
  it('uses accent-aligned rgba stops within 0.08–0.15 range', () => {
    expect(warmGrade.overlayStart).toBe('rgba(196, 181, 160, 0.08)');
    expect(warmGrade.overlayMid).toBe('rgba(196, 181, 160, 0.12)');
    expect(warmGrade.overlayEnd).toBe('rgba(196, 181, 160, 0.15)');
  });

  it('builds gradient from overlay stops', () => {
    expect(warmGrade.overlayGradient).toContain(warmGrade.overlayStart);
    expect(warmGrade.overlayGradient).toContain(warmGrade.overlayMid);
    expect(warmGrade.overlayGradient).toContain(warmGrade.overlayEnd);
  });

  it('defines a lightweight desktop nebula filter', () => {
    expect(warmGrade.nebulaFilter).toMatch(/sepia\(/);
    expect(warmGrade.nebulaFilter).toMatch(/saturate\(/);
    expect(warmGrade.nebulaFilter).toMatch(/hue-rotate\(/);
  });

  it('mirrors warm grade tokens in globals.css', () => {
    expect(globalsCss).toContain(`--warm-grade-overlay-start: ${warmGrade.overlayStart}`);
    expect(globalsCss).toContain(`--warm-grade-overlay-mid: ${warmGrade.overlayMid}`);
    expect(globalsCss).toContain(`--warm-grade-overlay-end: ${warmGrade.overlayEnd}`);
    expect(globalsCss).toContain(`--warm-grade-nebula-filter: ${warmGrade.nebulaFilter}`);
    expect(globalsCss).toContain('.cosmic-warm-grade-overlay');
    expect(globalsCss).toContain('.cosmic-nebula-layer--warm-grade');
  });

  it('applies desktop-only nebula filter via media query fallback', () => {
    expect(globalsCss).toMatch(
      /@media \(min-width: 768px\) and \(prefers-reduced-motion: no-preference\)[\s\S]*\.cosmic-nebula-layer--warm-grade[\s\S]*filter: var\(--warm-grade-nebula-filter\)/,
    );
  });

  it('wires warm overlay into CosmicScene with test id', () => {
    expect(cosmicSceneSource).toContain('cosmic-warm-grade-overlay');
    expect(cosmicSceneSource).toContain('warmGrade.testId');
    expect(cosmicSceneSource).toContain('cosmic-nebula-layer--warm-grade');
  });
});
