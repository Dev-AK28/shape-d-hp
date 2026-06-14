import { describe, expect, it } from 'vitest';
import { ANIMATION_DURATION } from '@/lib/scroll/animation-tokens';
import { colors, cursor, motion, spacing, typography } from '@/lib/design/tokens';

describe('design tokens', () => {
  it('defines dark minimal color palette', () => {
    expect(colors.background).toBe('#0a0a0a');
    expect(colors.foreground).toBe('#f0f0f0');
    expect(colors.accent).toBeTruthy();
    expect(colors.accentSubtle).toContain('rgba');
  });

  it('uses 8px grid spacing', () => {
    expect(spacing.unit).toBe(8);
    expect(spacing.sm).toBe(16);
    expect(spacing.section).toBe(120);
  });

  it('defines motion tokens aligned with animation policy', () => {
    expect(motion.durationBase).toBe('1.4s');
    expect(motion.easeBase).toContain('cubic-bezier');
    expect(parseFloat(motion.durationBase)).toBe(ANIMATION_DURATION.base);
  });

  it('uses CSS variable references for fonts', () => {
    expect(typography.fontSerifJp).toBe('var(--font-serif-jp)');
    expect(typography.fontDisplay).toBe('var(--font-display)');
    expect(typography.fontSerif).toBe('var(--font-serif)');
  });

  it('defines cursor tokens used by CustomCursor', () => {
    expect(cursor.followerLerp).toBeGreaterThan(0);
    expect(cursor.followerLerp).toBeLessThan(1);
  });
});
