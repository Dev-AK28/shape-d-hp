import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { colors, cosmicGrade, cursor, layout, motion, pageHeaderDividers, pageHeaderDividerColors, sectionAccentCssVars, spacing, typography, typographyBlend, typographySizeClasses, typographySizeCssVars, typographySizeTokenKeys } from '@/lib/design/tokens';
import {
  MOBILE_BREAKPOINT_PX,
  desktopMinWidthMediaQuery,
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
    expect(globalsCss).toContain(`--section-blue: ${colors.blue}`);
    expect(globalsCss).toContain(`--section-blue-light: ${colors.blueLight}`);
    expect(globalsCss).toContain(`--section-purple: ${colors.purple}`);
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

  it('mirrors cosmic grade tokens in CSS variables', () => {
    expect(globalsCss).toContain(`--cosmic-grade-overlay-start: ${cosmicGrade.overlayStart}`);
    expect(globalsCss).toContain(`--cosmic-grade-overlay-mid: ${cosmicGrade.overlayMid}`);
    expect(globalsCss).toContain(`--cosmic-grade-overlay-end: ${cosmicGrade.overlayEnd}`);
    expect(globalsCss).toContain(`--cosmic-grade-nebula-filter: ${cosmicGrade.nebulaFilter}`);
    expect(globalsCss).toContain(`--cosmic-grade-nebula-screen-opacity: ${cosmicGrade.nebulaScreenOpacity}`);
  });

  it('uses CSS variable for .cosmic-nebula-layer opacity (#201)', () => {
    expect(globalsCss).toMatch(/\.cosmic-nebula-layer\s*\{[^}]*opacity:\s*var\(--cosmic-grade-nebula-screen-opacity\)/);
    expect(globalsCss).not.toMatch(/\.cosmic-nebula-layer\s*\{[^}]*opacity:\s*[\d.]+[^}]*\}/);
  });

  it('mirrors cosmic grade overlay gradient structure in CSS', () => {
    expect(globalsCss).toContain('--cosmic-grade-overlay: linear-gradient');
    expect(globalsCss).toContain(`var(--cosmic-grade-overlay-start) 0%`);
    expect(globalsCss).toContain(`var(--cosmic-grade-overlay-mid) ${cosmicGrade.overlayMidStop}`);
    expect(globalsCss).toContain('var(--cosmic-grade-overlay-end) 100%');
    expect(cosmicGrade.overlayGradient).toContain(cosmicGrade.overlayMidStop);
  });

  it('mirrors typography blend tokens in CSS variables', () => {
    expect(globalsCss).toContain(`--type-blend-cosmic: ${typographyBlend.cosmic}`);
    expect(globalsCss).toContain(`--type-blend-solid: ${typographyBlend.solid}`);
  });

  it('mirrors typography size tokens and utility classes', () => {
    expect(globalsCss).toContain(`--type-size-heading: ${typography.sizeHeading}`);
    expect(globalsCss).toContain(`--type-size-subheading: ${typography.sizeSubheading}`);
    expect(globalsCss).toContain(`--type-size-quote: ${typography.sizeQuote}`);
    expect(globalsCss).toContain(`--type-size-body: ${typography.sizeBody}`);
    expect(globalsCss).toContain(`--type-size-caption: ${typography.sizeCaption}`);
    expect(globalsCss).toContain(`--type-size-visual-word: ${typography.sizeVisualWord}`);

    for (const [key, className] of Object.entries(typographySizeClasses) as Array<
      [keyof typeof typographySizeClasses, string]
    >) {
      const cssVar = typographySizeCssVars[key];
      expect(globalsCss).toContain(`.${className}`);
      expect(globalsCss).toContain(`font-size: var(${cssVar})`);
      expect(globalsCss).toContain(`${cssVar}: ${typography[typographySizeTokenKeys[key]]}`);
    }

    expect(globalsCss).toMatch(
      /\.type-font-serif\s*\{[^}]*font-family:\s*var\(--font-serif\)/,
    );
    expect(globalsCss).toMatch(
      /\.type-font-serif-jp\s*\{[^}]*font-family:\s*var\(--font-serif-jp\)/,
    );
    expect(globalsCss).toContain('--font-serif: var(--font-display)');
  });

  it('mirrors page header divider classes and section accent CSS variables', () => {
    for (const variant of Object.keys(pageHeaderDividers) as Array<
      keyof typeof pageHeaderDividers
    >) {
      const className = pageHeaderDividers[variant];
      const accentVar = sectionAccentCssVars[variant];
      expect(globalsCss).toContain(`.${className}`);
      expect(globalsCss).toContain(`var(${accentVar})`);
      expect(globalsCss).toContain(pageHeaderDividerColors[variant]);
      expect(globalsCss).toContain(`${accentVar}: ${pageHeaderDividerColors[variant]}`);
    }
  });

  it('mirrors desktop breakpoint in cosmic grade nebula filter media query', () => {
    expect(desktopMinWidthMediaQuery()).toBe(`(min-width: ${MOBILE_BREAKPOINT_PX}px)`);
    expect(globalsCss).toContain(
      `@media (min-width: ${MOBILE_BREAKPOINT_PX}px) and (prefers-reduced-motion: no-preference)`,
    );
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
