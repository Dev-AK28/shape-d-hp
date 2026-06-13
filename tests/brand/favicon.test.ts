import { describe, expect, it } from 'vitest';
import sharp from 'sharp';
import {
  FAVICON_OUTPUTS,
  FAVICON_SOURCE_PATH,
  extractLogoMark,
  renderFavicon,
} from '@/lib/brand/favicon';

describe('extractLogoMark', () => {
  it('produces transparent pixels outside the logo lines', async () => {
    const mark = await extractLogoMark(FAVICON_SOURCE_PATH);
    const { data, info } = await sharp(mark).ensureAlpha().raw().toBuffer({
      resolveWithObject: true,
    });

    let transparentPixels = 0;

    for (let i = 3; i < data.length; i += 4) {
      if (data[i] === 0) {
        transparentPixels += 1;
      }
    }

    const totalPixels = info.width * info.height;
    expect(transparentPixels / totalPixels).toBeGreaterThan(0.5);
  });
});

describe('renderFavicon', () => {
  it.each(FAVICON_OUTPUTS)('renders $filename within the size budget', async ({ size, maxBytes }) => {
    const buffer = await renderFavicon(size);
    const metadata = await sharp(buffer).metadata();

    expect(metadata.width).toBe(size);
    expect(metadata.height).toBe(size);
    expect(buffer.length).toBeLessThanOrEqual(maxBytes);
  });
});
