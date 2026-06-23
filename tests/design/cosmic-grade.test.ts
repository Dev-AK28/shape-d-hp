import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { cosmicGrade } from '@/lib/design/tokens';

const globalsCss = readFileSync(join(process.cwd(), 'app/globals.css'), 'utf8');
const cosmicSceneSource = readFileSync(
  join(process.cwd(), 'components/background/CosmicScene.tsx'),
  'utf8',
);

describe('cosmicGrade tokens (Issue #102 / #224 / #227 — cosmic cool grade)', () => {
  it('uses cool deep-space rgba stops within 0.08–0.15 range', () => {
    expect(cosmicGrade.overlayStart).toBe('rgba(150, 170, 210, 0.08)');
    expect(cosmicGrade.overlayMid).toBe('rgba(150, 170, 210, 0.12)');
    expect(cosmicGrade.overlayEnd).toBe('rgba(150, 170, 210, 0.15)');
  });

  it('derives overlayGradient from overlay stops and mid-stop', () => {
    expect(cosmicGrade.overlayGradient).toBe(
      `linear-gradient(180deg, ${cosmicGrade.overlayStart} 0%, ${cosmicGrade.overlayMid} ${cosmicGrade.overlayMidStop}, ${cosmicGrade.overlayEnd} 100%)`,
    );
  });

  it('defines a lightweight desktop nebula filter without warm tint', () => {
    expect(cosmicGrade.nebulaFilter).not.toMatch(/sepia\(/);
    expect(cosmicGrade.nebulaFilter).toMatch(/saturate\(/);
    expect(cosmicGrade.nebulaFilter).toMatch(/brightness\(/);
  });

  it('declares cosmic grade CSS hooks in globals.css', () => {
    expect(globalsCss).toContain('.cosmic-grade-overlay');
    expect(globalsCss).toContain('.cosmic-nebula-layer--cosmic-grade');
  });

  it('applies desktop-only nebula filter on cosmic-grade layer', () => {
    expect(globalsCss).toMatch(
      /\.cosmic-nebula-layer--cosmic-grade[\s\S]*filter: var\(--cosmic-grade-nebula-filter\)/,
    );
  });

  it('wires cosmic overlay into CosmicScene with test id', () => {
    expect(cosmicSceneSource).toContain('cosmic-grade-overlay');
    expect(cosmicSceneSource).toContain('cosmicGrade.testId');
    expect(cosmicSceneSource).toContain('cosmic-nebula-layer--cosmic-grade');
  });
});
