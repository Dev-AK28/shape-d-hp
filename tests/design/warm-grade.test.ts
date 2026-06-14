import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { warmGrade } from '@/lib/design/tokens';
import { desktopMinWidthMediaQuery } from '@/lib/performance/device-profile';

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

  it('derives overlayGradient from overlay stops', () => {
    expect(warmGrade.overlayGradient).toBe(
      `linear-gradient(180deg, ${warmGrade.overlayStart} 0%, ${warmGrade.overlayMid} 45%, ${warmGrade.overlayEnd} 100%)`,
    );
  });

  it('defines a lightweight desktop nebula filter', () => {
    expect(warmGrade.nebulaFilter).toMatch(/sepia\(/);
    expect(warmGrade.nebulaFilter).toMatch(/saturate\(/);
    expect(warmGrade.nebulaFilter).toMatch(/hue-rotate\(/);
  });

  it('declares warm grade CSS hooks in globals.css', () => {
    expect(globalsCss).toContain('.cosmic-warm-grade-overlay');
    expect(globalsCss).toContain('.cosmic-nebula-layer--warm-grade');
  });

  it('applies desktop-only nebula filter via MOBILE_BREAKPOINT_PX media query', () => {
    expect(globalsCss).toContain(
      `@media ${desktopMinWidthMediaQuery()} and (prefers-reduced-motion: no-preference)`,
    );
    expect(globalsCss).toMatch(
      /\.cosmic-nebula-layer--warm-grade[\s\S]*filter: var\(--warm-grade-nebula-filter\)/,
    );
  });

  it('wires warm overlay into CosmicScene with test id', () => {
    expect(cosmicSceneSource).toContain('cosmic-warm-grade-overlay');
    expect(cosmicSceneSource).toContain('warmGrade.testId');
    expect(cosmicSceneSource).toContain('cosmic-nebula-layer--warm-grade');
  });
});
