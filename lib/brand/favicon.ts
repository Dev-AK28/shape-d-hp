import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import sharp from 'sharp';

export const FAVICON_SOURCE_PATH = join(process.cwd(), 'public/image_13.png');

export const FAVICON_COLORS = {
  gradientInner: '#4338ca',
  gradientMid: '#1e1b4b',
  gradientBase: '#0a0a1a',
  gradientOuter: '#000000',
  glowInner: '#818cf8',
  glowMid: '#6366f1',
} as const;

export const FAVICON_OUTPUTS = [
  { filename: 'icon.png', size: 32, maxBytes: 10_000 },
  { filename: 'apple-icon.png', size: 180, maxBytes: 60_000 },
] as const;

function luminance(r: number, g: number, b: number): number {
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

export async function extractLogoMark(
  sourcePath: string = FAVICON_SOURCE_PATH,
  threshold = 35,
  softness = 2.8,
): Promise<Buffer> {
  const source = await readFile(sourcePath);
  const trimmed = await sharp(source).trim({ threshold: 20 }).png().toBuffer();
  const { data, info } = await sharp(trimmed)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  for (let i = 0; i < data.length; i += 4) {
    const lum = luminance(data[i], data[i + 1], data[i + 2]);

    if (lum < threshold) {
      data[i + 3] = 0;
      continue;
    }

    const alpha = Math.min(255, Math.round((lum - threshold) * softness));
    const boost = 1 + (lum / 255) * 0.15;

    data[i] = Math.min(255, Math.round(data[i] * boost));
    data[i + 1] = Math.min(255, Math.round(data[i + 1] * boost));
    data[i + 2] = Math.min(255, Math.round(data[i + 2] * boost));
    data[i + 3] = alpha;
  }

  return sharp(data, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .png()
    .toBuffer();
}

function createGradientSvg(size: number): Buffer {
  const { gradientInner, gradientMid, gradientBase, gradientOuter, glowInner, glowMid } =
    FAVICON_COLORS;

  return Buffer.from(`<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="bg" cx="50%" cy="30%" r="75%">
        <stop offset="0%" stop-color="${gradientInner}" stop-opacity="0.55"/>
        <stop offset="40%" stop-color="${gradientMid}" stop-opacity="0.85"/>
        <stop offset="70%" stop-color="${gradientBase}"/>
        <stop offset="100%" stop-color="${gradientOuter}"/>
      </radialGradient>
      <radialGradient id="glow" cx="50%" cy="45%" r="42%">
        <stop offset="0%" stop-color="${glowInner}" stop-opacity="0.4"/>
        <stop offset="55%" stop-color="${glowMid}" stop-opacity="0.15"/>
        <stop offset="100%" stop-color="${glowMid}" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#bg)"/>
    <rect width="100%" height="100%" fill="url(#glow)"/>
  </svg>`);
}

export async function renderFavicon(
  size: number,
  sourcePath: string = FAVICON_SOURCE_PATH,
): Promise<Buffer> {
  const background = await sharp(createGradientSvg(size))
    .resize(size, size)
    .png()
    .toBuffer();

  const mark = await extractLogoMark(sourcePath);
  const logoWidth = Math.round(size * 0.78);
  const logo = await sharp(mark).resize(logoWidth, null, { fit: 'inside' }).png().toBuffer();
  const { width: logoImageWidth, height: logoImageHeight } = await sharp(logo).metadata();

  if (!logoImageWidth || !logoImageHeight) {
    throw new Error('Failed to read resized logo dimensions');
  }

  const glow = await sharp(logo)
    .blur(Math.max(1.5, size * 0.05))
    .png()
    .toBuffer();

  const left = Math.round((size - logoImageWidth) / 2);
  const top = Math.round((size - logoImageHeight) / 2);
  const shadowOffset = Math.max(1, Math.round(size * 0.035));

  return sharp(background)
    .composite([
      { input: glow, top: top + shadowOffset, left, blend: 'screen' },
      { input: logo, top, left, blend: 'over' },
    ])
    .png({
      compressionLevel: 9,
      palette: size <= 32,
    })
    .toBuffer();
}

export async function writeFaviconAssets(appDir = join(process.cwd(), 'app')): Promise<
  Array<{ filename: string; size: number; bytes: number }>
> {
  const results: Array<{ filename: string; size: number; bytes: number }> = [];

  for (const output of FAVICON_OUTPUTS) {
    const buffer = await renderFavicon(output.size);
    const destination = join(appDir, output.filename);

    if (buffer.length > output.maxBytes) {
      throw new Error(
        `${output.filename} exceeds size budget (${buffer.length} > ${output.maxBytes})`,
      );
    }

    await writeFile(destination, buffer);
    results.push({ filename: output.filename, size: output.size, bytes: buffer.length });
  }

  return results;
}
