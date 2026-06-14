import { describe, expect, it } from 'vitest';
import { colors, motion, spacing, typography } from '@/lib/design/tokens';

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
});
