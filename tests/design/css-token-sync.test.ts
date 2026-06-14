import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { colors, cursor, layout, motion, spacing, warmGrade } from '@/lib/design/tokens';
import {
  MOBILE_BREAKPOINT_PX,
  mobileMaxWidthMediaQuery,
} from '@/lib/performance/device-profile';

const globalsCss = readFileSync(join(process.cwd(), 'app/globals.css'), 'utf8');

describe('design tokens ↔ globals.css sync', () => {
  it('mirrors color tokens in CSS variables', () => {
    expect(globalsCss).toContain(`--background: ${colors.background}`);
    expect(globalsCss).toContain(`--foreground: ${colors.foreground}`);
    expect(globalsCss).toContain(`--muted: ${colors.muted}`);
    expect(globalsCss).toContain(`--accent: ${colors.accent}`);
    expect(globalsCss).toContain(`--accent-subtle: ${colors.accentSubtle}`);
    expect(globalsCss).toContain(`--border: ${colors.border}`);
  });

  it('mirrors spacing tokens in CSS variables', () => {
    expect(globalsCss).toContain(`--space-1: ${spacing.xs}px`);
    expect(globalsCss).toContain(`--space-2: ${spacing.sm}px`);
    expect(globalsCss).toContain(`--space-3: ${spacing.md}px`);
    expect(globalsCss).toContain(`--space-4: ${spacing.lg}px`);
    expect(globalsCss).toContain(`--space-6: ${spacing.xl}px`);
    expect(globalsCss).toContain(`--space-8: ${spacing.xxl}px`);
    expect(globalsCss).toContain(`--space-section: ${spacing.section}px`);
  });

  it('mirrors layout width tokens in CSS variables', () => {
    expect(globalsCss).toContain(`--content-prose: ${layout.contentProse}`);
    expect(globalsCss).toContain(`--content-standard: ${layout.contentStandard}`);
    expect(globalsCss).toContain(`--content-wide: ${layout.contentWide}`);
  });

  it('mirrors motion tokens in CSS variables', () => {
    expect(globalsCss).toContain(`--duration-base: ${motion.durationBase}`);
    expect(globalsCss).toContain(`--duration-interaction: ${motion.durationInteraction}`);
    expect(globalsCss).toContain(`--ease-base: ${motion.easeBase}`);
  });

  it('mirrors warm grade tokens in CSS variables', () => {
    expect(globalsCss).toContain(`--warm-grade-overlay-start: ${warmGrade.overlayStart}`);
    expect(globalsCss).toContain(`--warm-grade-overlay-mid: ${warmGrade.overlayMid}`);
    expect(globalsCss).toContain(`--warm-grade-overlay-end: ${warmGrade.overlayEnd}`);
    expect(globalsCss).toContain(`--warm-grade-nebula-filter: ${warmGrade.nebulaFilter}`);
  });

  it('defines custom cursor CSS hooks', () => {
    expect(globalsCss).toContain("html[data-custom-cursor='active']");
    expect(globalsCss).toContain('cursor: text');
  });

  it('mirrors mobile breakpoint in cursor fallback media query', () => {
    expect(mobileMaxWidthMediaQuery()).toBe(`(max-width: ${MOBILE_BREAKPOINT_PX - 1}px)`);
    expect(globalsCss).toContain(`(max-width: ${MOBILE_BREAKPOINT_PX - 1}px)`);
  });
});

describe('design token cross-layer sync', () => {
  it('keeps cursor token values stable', () => {
    expect(cursor.size).toBe(8);
    expect(cursor.followerSize).toBe(32);
    expect(cursor.followerOpacity).toBe(0.4);
    expect(cursor.followerLerp).toBe(0.12);
  });
});
