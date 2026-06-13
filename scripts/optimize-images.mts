import { readdir, stat } from 'node:fs/promises';
import { join } from 'node:path';
import sharp from 'sharp';
import { OPTIMIZED_PUBLIC_IMAGES } from '../lib/performance/image-assets';

const PUBLIC_DIR = join(process.cwd(), 'public');
const MAX_WIDTH = 1200;
const WEBP_QUALITY = 82;

const USED_PNG_FILES = new Set(
  [...Object.values(OPTIMIZED_PUBLIC_IMAGES.works), OPTIMIZED_PUBLIC_IMAGES.consultingBackground].map(
    (webpPath) => webpPath.replace(/^\//, '').replace('.webp', '.png'),
  ),
);

async function optimizePng(filename: string): Promise<void> {
  if (!filename.endsWith('.png') || !USED_PNG_FILES.has(filename)) {
    return;
  }

  const inputPath = join(PUBLIC_DIR, filename);
  const outputPath = join(PUBLIC_DIR, filename.replace(/\.png$/, '.webp'));
  const metadata = await sharp(inputPath).metadata();
  const width = metadata.width ?? MAX_WIDTH;
  const targetWidth = Math.min(width, MAX_WIDTH);

  await sharp(inputPath)
    .resize({ width: targetWidth, withoutEnlargement: true })
    .webp({ quality: WEBP_QUALITY })
    .toFile(outputPath);

  const [inputStat, outputStat] = await Promise.all([stat(inputPath), stat(outputPath)]);
  console.log(
    `${filename}: ${(inputStat.size / 1024).toFixed(1)}KB -> ${outputPath.split('/').pop()} ${(outputStat.size / 1024).toFixed(1)}KB`,
  );
}

const files = await readdir(PUBLIC_DIR);
await Promise.all(files.map((file) => optimizePng(file)));
