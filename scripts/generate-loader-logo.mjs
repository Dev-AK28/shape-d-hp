/**
 * トップページ パーティクルローダーのサンプリング用ロゴ生成 — Issue #412
 *
 * public/image_2.png（1408x768・不透過ダーク地・右下に装飾✦あり）から、
 * ロゴ+ワードマーク部分だけを切り出して幅 360px に縮小した PNG を
 * public/loader/logo-particle-source.png へ出力する。
 *
 * 手順:
 * 1. 中央領域（右下の✦を除外できる範囲）に限定して輝度の高いピクセルの
 *    バウンディングボックスを求める
 * 2. パディングを付けて切り出し、幅 360px に縮小して出力する
 *
 * 実行: node scripts/generate-loader-logo.mjs
 */
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const SOURCE = 'public/image_2.png';
const OUTPUT = 'public/loader/logo-particle-source.png';
const OUTPUT_WIDTH = 360;
const LUMINANCE_THRESHOLD = 60;
// ✦（右下 x≈95% / y≈92%）を除外しつつロゴ全体が収まる走査範囲。
const SCAN_REGION = { left: 0.15, top: 0.08, right: 0.85, bottom: 0.9 };
const PADDING_PX = 24;

const { data, info } = await sharp(SOURCE)
  .raw()
  .toBuffer({ resolveWithObject: true });

const { width, height, channels } = info;
const x0 = Math.floor(width * SCAN_REGION.left);
const x1 = Math.ceil(width * SCAN_REGION.right);
const y0 = Math.floor(height * SCAN_REGION.top);
const y1 = Math.ceil(height * SCAN_REGION.bottom);

let minX = Infinity;
let minY = Infinity;
let maxX = -Infinity;
let maxY = -Infinity;
for (let y = y0; y < y1; y += 1) {
  for (let x = x0; x < x1; x += 1) {
    const i = (y * width + x) * channels;
    const luminance = 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
    if (luminance < LUMINANCE_THRESHOLD) {
      continue;
    }
    minX = Math.min(minX, x);
    maxX = Math.max(maxX, x);
    minY = Math.min(minY, y);
    maxY = Math.max(maxY, y);
  }
}

if (!Number.isFinite(minX)) {
  throw new Error(`no bright pixels found in ${SOURCE} scan region`);
}

const left = Math.max(0, minX - PADDING_PX);
const top = Math.max(0, minY - PADDING_PX);
const cropWidth = Math.min(width, maxX + PADDING_PX) - left;
const cropHeight = Math.min(height, maxY + PADDING_PX) - top;

await mkdir(path.dirname(OUTPUT), { recursive: true });
await sharp(SOURCE)
  .extract({ left, top, width: cropWidth, height: cropHeight })
  .resize({ width: OUTPUT_WIDTH })
  .png({ compressionLevel: 9, palette: true, quality: 80 })
  .toFile(OUTPUT);

console.log(
  `wrote ${OUTPUT} (crop ${cropWidth}x${cropHeight} @ ${left},${top} -> width ${OUTPUT_WIDTH})`,
);
