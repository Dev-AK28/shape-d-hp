/**
 * public/ 直下の元PNGを .webp に変換するスクリプト（Issue #438）。
 *
 * 運用ルール: 変換後、アプリからは `.webp` 版のみが参照される（`OPTIMIZED_PUBLIC_IMAGES`
 * 参照）ため、元PNG（`image_4.png` 等）は変換完了を確認したら `public/` から削除する。
 * 元PNGを残したまま git commit すると、Vercel のデプロイ成果物にも git リポジトリにも
 * 実行時に使われない静的アセットが残ってしまう。新しい元画像を追加する場合は、変換 →
 * 確認 → 元PNG削除 → コミット、の順で行うこと。
 *
 * 実行: npx tsx scripts/optimize-images.mts
 */
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
