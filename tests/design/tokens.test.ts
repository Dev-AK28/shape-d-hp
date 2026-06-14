import { describe, expect, it } from 'vitest';
import {
  pillarTextClass,
  sectionAccentDividerClass,
  sectionCaptionClass,
  sectionHeadingClass,
  sectionHistoryCaptionClass,
  timelineBodyClass,
  timelineIndexClass,
  visualWordClass,
  visionLeadClass,
  visionQuoteClass,
} from '@/lib/design/section-typography-classes';
import { colors, layout, motion, spacing, typography, typographyFontClasses, typographySizeClasses, typographySizeCssVars, typographySizeTokenKeys } from '@/lib/design/tokens';

describe('design tokens', () => {
  it('defines dark minimal color palette', () => {
    expect(colors.background).toBe('#0a0a0a');
    expect(colors.backgroundElevated).toBe('#111111');
    expect(colors.foreground).toBe('#f0f0f0');
    expect(colors.accent).toBeTruthy();
  });

  it('uses 8px grid spacing', () => {
    expect(spacing.unit).toBe(8);
    expect(spacing.sm).toBe(16);
  });

  it('defines motion tokens aligned with animation policy', () => {
    expect(motion.durationBase).toBe('1.4s');
    expect(motion.durationInteraction).toBe('0.25s');
    expect(motion.easeBase).toContain('cubic-bezier');
  });

  it('uses CSS variable references for fonts', () => {
    expect(typography.fontSerifJp).toBe('var(--font-serif-jp)');
    expect(typography.fontDisplay).toBe('var(--font-display)');
  });

  it('defines layout width tokens for content columns', () => {
    expect(layout.contentProse).toBe('680px');
    expect(layout.contentStandard).toBe('880px');
    expect(layout.contentWide).toBe('1040px');
  });

  it('maps typography utility class names to type-size-* pattern', () => {
    expect(typographySizeClasses.heading).toBe('type-size-heading');
    expect(typographySizeClasses.visualWord).toBe('type-size-visual-word');
    expect(typography.sizeVisualWord).toBe('clamp(40px, 10vw, 140px)');
  });

  it('maps typography font classes for serif stacks', () => {
    expect(typographyFontClasses.serif).toBe('type-font-serif');
    expect(typographyFontClasses.serifJp).toBe('type-font-serif-jp');
  });

  it('maps typography size CSS vars to type-size-* utilities', () => {
    expect(typographySizeCssVars.heading).toBe('--type-size-heading');
    expect(typographySizeCssVars.visualWord).toBe('--type-size-visual-word');
    expect(Object.keys(typographySizeCssVars).length).toBe(Object.keys(typographySizeClasses).length);
    expect(typographySizeTokenKeys.heading).toBe('sizeHeading');
    expect(typography[typographySizeTokenKeys.visualWord]).toBe(typography.sizeVisualWord);
  });

  it('embeds typography utilities in shared home section classes', () => {
    expect(sectionHeadingClass).toContain(typographyFontClasses.serif);
    expect(sectionHeadingClass).toContain(typographySizeClasses.heading);
    expect(sectionCaptionClass).toContain(typographySizeClasses.caption);
    expect(sectionCaptionClass).toContain('mb-[var(--space-2)]');
    expect(sectionCaptionClass).toContain('tracking-[0.15em]');
    expect(sectionHistoryCaptionClass).toContain(typographySizeClasses.caption);
    expect(sectionHistoryCaptionClass).toContain('mb-[var(--space-4)]');
    expect(sectionHistoryCaptionClass).toContain('tracking-[0.12em]');
    expect(pillarTextClass).toContain(typographyFontClasses.serifJp);
    expect(pillarTextClass).toContain(typographySizeClasses.subheading);
    expect(sectionAccentDividerClass).toContain('bg-[var(--accent)]');
    expect(visualWordClass).toContain(typographySizeClasses.visualWord);
    expect(visionLeadClass).toContain(typographySizeClasses.subheading);
    expect(visionQuoteClass).toContain(typographySizeClasses.quote);
    expect(timelineIndexClass).toContain(typographySizeClasses.caption);
    expect(timelineBodyClass).toContain(typographySizeClasses.body);
  });
});
