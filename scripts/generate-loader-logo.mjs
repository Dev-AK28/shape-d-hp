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
/** handoff で立ち上げる表示用ロゴ（背景透過・Issue #418）。粒子と同じクロップ・寸法。 */
const REVEAL_OUTPUT = 'public/loader/logo-reveal.png';
/** 輝度 → アルファの変換域。この下は完全透過、上は完全不透過。 */
const ALPHA_FLOOR = 28;
const ALPHA_CEIL = 150;
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

// 表示用（handoff で立ち上げる実ロゴ・Issue #418）。
// サンプリング元と同じクロップ・同じ寸法にすることで、粒子と実ロゴの位置が一致する。
// 元画像はダークなテクスチャ背景を持つため、そのまま重ねると矩形の枠として見えてしまう。
// 輝度からアルファを起こして背景を透過させ、--ink のオーバーレイに溶け込ませる。
const reveal = await sharp(SOURCE)
  .extract({ left, top, width: cropWidth, height: cropHeight })
  .resize({ width: OUTPUT_WIDTH })
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

const px = reveal.data;
for (let i = 0; i < px.length; i += 4) {
  const lum = 0.2126 * px[i] + 0.7152 * px[i + 1] + 0.0722 * px[i + 2];
  const alpha = Math.min(Math.max((lum - ALPHA_FLOOR) / (ALPHA_CEIL - ALPHA_FLOOR), 0), 1);
  px[i + 3] = Math.round(alpha * 255);
  // アルファを起こした分だけ RGB を持ち上げる（un-premultiply 相当）。
  // 据え置きにすると「暗い RGB × 低アルファ」で二重に沈み、ダーク地に合成したとき
  // 元より暗くなる（粒子は加算ブレンドで明るいため handoff で明度が跳ねる）
  if (alpha > 0) {
    for (let c = 0; c < 3; c += 1) {
      px[i + c] = Math.round(Math.min(px[i + c] / alpha, 255));
    }
  }
}

// palette（8-bit colormap）は輝度由来のアルファ勾配を量子化するため、バンディングを
// 実測して採用可否を判断した（PR #419 レビュー対応）。true color 版との差は
// アルファ最大 11/255・平均 0.24/255、可視領域の RGB も平均 1.9/255 で目視不可能な一方、
// サイズは 180KB → 21KB と大きく効く。実ロゴは LCP 候補要素なので軽さを優先する
await sharp(px, {
  raw: { width: reveal.info.width, height: reveal.info.height, channels: 4 },
})
  .png({ compressionLevel: 9, palette: true, quality: 90, dither: 1.0 })
  .toFile(REVEAL_OUTPUT);

console.log(`wrote ${REVEAL_OUTPUT} (transparent reveal logo)`);

// 生成結果の寸法は lib/loader/particle-logo.ts の LOGO_SOURCE_*_PX と一致していなければ
// ならない（実ロゴ <img> の CSS 幅がこの定数からアスペクト比を導くため）。
// クロップ条件を変えて寸法が変わったら、定数も更新すること
const revealMeta = await sharp(REVEAL_OUTPUT).metadata();
const expected = { width: 360, height: 286 }; // = LOGO_SOURCE_WIDTH_PX / LOGO_SOURCE_HEIGHT_PX
if (revealMeta.width !== expected.width || revealMeta.height !== expected.height) {
  throw new Error(
    `寸法が LOGO_SOURCE_*_PX と一致しません: ${revealMeta.width}x${revealMeta.height} ` +
      `(期待 ${expected.width}x${expected.height})。lib/loader/particle-logo.ts の定数を更新してください`,
  );
}
