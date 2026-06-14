import { describe, expect, it } from 'vitest';
import { DEFAULT_DEVICE_PROFILE } from '@/lib/performance/device-profile';
import {
  CUSTOM_CURSOR_ATTR,
  shouldEnableCustomCursor,
} from '@/lib/design/custom-cursor';

describe('custom-cursor helpers', () => {
  it('requires ready profile without reduced motion, mobile, or coarse pointer', () => {
    expect(shouldEnableCustomCursor(DEFAULT_DEVICE_PROFILE, false)).toBe(false);
    expect(shouldEnableCustomCursor(DEFAULT_DEVICE_PROFILE, true)).toBe(true);
    expect(
      shouldEnableCustomCursor(
        { ...DEFAULT_DEVICE_PROFILE, prefersReducedMotion: true },
        true,
      ),
    ).toBe(false);
    expect(
      shouldEnableCustomCursor({ ...DEFAULT_DEVICE_PROFILE, isMobile: true }, true),
    ).toBe(false);
    expect(
      shouldEnableCustomCursor(
        { ...DEFAULT_DEVICE_PROFILE, prefersCoarsePointer: true },
        true,
      ),
    ).toBe(false);
  });

  it('exports the html data attribute name used by globals.css', () => {
    expect(CUSTOM_CURSOR_ATTR).toBe('data-custom-cursor');
  });
});
