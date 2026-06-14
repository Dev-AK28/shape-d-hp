import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const src = path.join(root, 'public', 'shape-d-logo-transparent.png');
const bg = { r: 10, g: 10, b: 10, alpha: 1 };

async function renderIcon(size: number, outPath: string): Promise<void> {
  const logoMax = Math.round(size * 0.82);
  const logo = await sharp(src)
    .resize(logoMax, logoMax, { fit: 'inside' })
    .png()
    .toBuffer();

  await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: bg,
    },
  })
    .composite([{ input: logo, gravity: 'center' }])
    .png({ compressionLevel: 9 })
    .toFile(outPath);
}

await renderIcon(32, path.join(root, 'app', 'icon.png'));
await renderIcon(180, path.join(root, 'app', 'apple-icon.png'));

console.log('Generated app/icon.png and app/apple-icon.png');
