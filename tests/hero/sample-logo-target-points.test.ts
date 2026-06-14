import path from 'node:path';
import sharp from 'sharp';
import { describe, expect, it } from 'vitest';
import {
  BRAND_LOGO_HEIGHT,
  BRAND_LOGO_WIDTH,
} from '@/lib/design/brand-logo-constants';
import {
  LOGO_MAX_PARTICLES,
  sampleLogoTargetPointsFromImageData,
} from '@/lib/hero/sample-logo-target-points';

describe('sampleLogoTargetPointsFromImageData', () => {
  it('samples alpha points from the brand logo PNG silhouette', async () => {
    const pngPath = path.join(process.cwd(), 'public/shape-d-logo-transparent.png');
    const { data, info } = await sharp(pngPath)
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    expect(info.width).toBe(BRAND_LOGO_WIDTH);
    expect(info.height).toBe(BRAND_LOGO_HEIGHT);

    const points = sampleLogoTargetPointsFromImageData(info.width, info.height, data);

    expect(points.length).toBeGreaterThan(100);
    expect(points.length).toBeLessThanOrEqual(LOGO_MAX_PARTICLES);
    expect(points.every((point) => Math.abs(point.x) <= info.width / 2)).toBe(true);
    expect(points.every((point) => Math.abs(point.y) <= info.height / 2)).toBe(true);
  });
});

describe('brand logo constants', () => {
  it('matches the transparent PNG asset dimensions', async () => {
    const pngPath = path.join(process.cwd(), 'public/shape-d-logo-transparent.png');
    const metadata = await sharp(pngPath).metadata();

    expect(metadata.width).toBe(BRAND_LOGO_WIDTH);
    expect(metadata.height).toBe(BRAND_LOGO_HEIGHT);
  });
});
