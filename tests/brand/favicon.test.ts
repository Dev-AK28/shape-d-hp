import { mkdtemp, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import sharp from 'sharp';
import {
  FAVICON_OUTPUTS,
  FAVICON_SOURCE_PATH,
  extractLogoMark,
  renderFavicon,
  writeFaviconAssets,
} from '@/lib/brand/favicon';

async function countOpaquePixels(buffer: Buffer, minAlpha = 128): Promise<number> {
  const { data } = await sharp(buffer).ensureAlpha().raw().toBuffer({ resolveWithObject: true });

  let opaquePixels = 0;

  for (let i = 3; i < data.length; i += 4) {
    if (data[i] >= minAlpha) {
      opaquePixels += 1;
    }
  }

  return opaquePixels;
}

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

  it('retains opaque logo pixels', async () => {
    const mark = await extractLogoMark(FAVICON_SOURCE_PATH);
    const opaquePixels = await countOpaquePixels(mark);

    expect(opaquePixels).toBeGreaterThan(100);
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

  it.each(FAVICON_OUTPUTS)('renders $filename with visible logo pixels', async ({ size }) => {
    const buffer = await renderFavicon(size);
    const opaquePixels = await countOpaquePixels(buffer);

    expect(opaquePixels).toBeGreaterThan(0);
  });
});

describe('writeFaviconAssets', () => {
  it('writes both favicon files to the target directory', async () => {
    const appDir = await mkdtemp(join(tmpdir(), 'favicon-test-'));
    const results = await writeFaviconAssets(appDir);

    expect(results).toHaveLength(FAVICON_OUTPUTS.length);

    for (const output of FAVICON_OUTPUTS) {
      const file = await readFile(join(appDir, output.filename));
      const metadata = await sharp(file).metadata();

      expect(metadata.width).toBe(output.size);
      expect(metadata.height).toBe(output.size);
      expect(file.length).toBeLessThanOrEqual(output.maxBytes);
    }
  });
});
