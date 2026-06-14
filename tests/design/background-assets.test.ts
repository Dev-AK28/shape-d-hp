import { describe, expect, it } from 'vitest';
import { backgroundAssets } from '@/lib/design/background-assets';

describe('background assets', () => {
  it('defines public hero background paths', () => {
    expect(backgroundAssets.heroCosmicDesktop).toBe('/hero-cosmic-bg.webp');
    expect(backgroundAssets.heroCosmicMobile).toBe('/hero-cosmic-bg-mobile.webp');
    expect(backgroundAssets.heroNebulaLayer).toBe('/hero-nebula-layer.png');
    expect(backgroundAssets.heroParticleBand).toBe('/hero-particle-band.webp');
    expect(backgroundAssets.brandLogoTransparent).toBe('/shape-d-logo-transparent.png');
  });
});
