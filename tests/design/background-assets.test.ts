import { describe, expect, it } from 'vitest';
import { backgroundAssets } from '@/lib/design/background-assets';

describe('background assets', () => {
  it('defines the brand logo asset path', () => {
    expect(backgroundAssets.brandLogoTransparent).toBe('/shape-d-logo-transparent.png');
  });
});
