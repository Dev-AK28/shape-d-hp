/**
 * トップページ パーティクルローダーのサンプリング用ロゴ生成 — Issue #412 / #424
 *
 * public/image.png（1024x1024・真の透過 PNG）から、ロゴ+ワードマーク部分だけを
 * 切り出して幅 360px に縮小した PNG を public/loader/logo-particle-source.png へ
 * 出力する。
 *
 * #424 で元画像を public/image_2.png（1408x768・不透過ダーク地・右下に装飾✦あり）
 * から public/image.png（1024x1024・透過・ワードマーク付き・✦なし）へ差し替えた。
 * 新画像は alpha=0 の完全透明領域が全体の約89%を占める**真の透過 PNG**で、
 * 残りの不透明〜半透明領域がロゴ本体（頭部シルエット + ∞マーク + 下部の
 * 「SHAPE∞D」ワードマーク）。透明領域にも背景っぽいグレーの RGB 値が
 * 残留しているため、旧スクリプトのように輝度だけでロゴ範囲を判定すると
 * 背景ごと拾ってしまう（実測: 輝度 60 以上のピクセルは全体の 96.8%）。
 * alpha チャンネルは既に正確なロゴ形状マスクなので、alpha を主軸に据える。
 *
 * 手順:
 * 1. alpha >= ALPHA_BBOX_THRESHOLD のピクセルのバウンディングボックスを求める
 *    （新画像に✦のような除外すべき装飾はないため、旧来の SCAN_REGION は不要）
 * 2. パディングを付けて切り出し、幅 360px に縮小して出力する（alpha はそのまま保持）
 *
 * 実行: node scripts/generate-loader-logo.mjs
 */
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const SOURCE = 'public/image.png';
const OUTPUT = 'public/loader/logo-particle-source.png';
/** handoff で立ち上げる表示用ロゴ（背景透過・Issue #418）。粒子と同じクロップ・寸法。 */
const REVEAL_OUTPUT = 'public/loader/logo-reveal.png';
const OUTPUT_WIDTH = 360;
/** ロゴ本体（alpha が乗った領域）のバウンディングボックスを求めるための alpha 閾値。 */
const ALPHA_BBOX_THRESHOLD = 128;
const PADDING_PX = 24;

const { data, info } = await sharp(SOURCE)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

const { width, height, channels } = info;

let minX = Infinity;
let minY = Infinity;
let maxX = -Infinity;
let maxY = -Infinity;
for (let y = 0; y < height; y += 1) {
  for (let x = 0; x < width; x += 1) {
    const i = (y * width + x) * channels;
    if (data[i + 3] < ALPHA_BBOX_THRESHOLD) {
      continue;
    }
    minX = Math.min(minX, x);
    maxX = Math.max(maxX, x);
    minY = Math.min(minY, y);
    maxY = Math.max(maxY, y);
  }
}

if (!Number.isFinite(minX)) {
  throw new Error(`no opaque pixels found in ${SOURCE} (alpha >= ${ALPHA_BBOX_THRESHOLD})`);
}

const left = Math.max(0, minX - PADDING_PX);
const top = Math.max(0, minY - PADDING_PX);
const cropWidth = Math.min(width, maxX + PADDING_PX) - left;
const cropHeight = Math.min(height, maxY + PADDING_PX) - top;

await mkdir(path.dirname(OUTPUT), { recursive: true });

// サンプリング元。alpha は加工せずそのまま保持する — sampleLogoParticles()
// (lib/loader/particle-logo.ts) が実行時に alpha >= 128 を安全フィルタとして
// 適用するため、透明な背景ピクセルはここで潰さなくても自動的に除外される。
// SAMPLE_LUMINANCE_THRESHOLD と組み合わせることで、ロゴのうち明るい銀色の
// ハイライト部分だけが粒子候補になる（暗い縁取り部分をそのまま粒子色にすると
// --ink 背景上でほぼ見えなくなるため除外する）。
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
// 新画像は既に正しい透過マスクを持っているため、旧スクリプトのような
// 「輝度からアルファを起こす」変換（un-premultiply 含む）は不要。
// crop + resize のみでネイティブの alpha をそのまま活かす。
await sharp(SOURCE)
  .extract({ left, top, width: cropWidth, height: cropHeight })
  .resize({ width: OUTPUT_WIDTH })
  .png({ compressionLevel: 9, palette: true, quality: 90, dither: 1.0 })
  .toFile(REVEAL_OUTPUT);

console.log(`wrote ${REVEAL_OUTPUT} (transparent reveal logo)`);

// 生成結果の寸法は lib/loader/particle-logo.ts の LOGO_SOURCE_*_PX と一致していなければ
// ならない（実ロゴ <img> の CSS 幅がこの定数からアスペクト比を導くため）。
// クロップ条件を変えて寸法が変わったら、定数も更新すること
// 幅は OUTPUT_WIDTH で決まる。高さはクロップ比から決まるため、変わったら定数側の更新が必要。
// 逆向き（定数を変えたら落ちる）は tests/loader/particle-logo.test.ts が PNG ヘッダを読んで担保する
const revealMeta = await sharp(REVEAL_OUTPUT).metadata();
if (revealMeta.width !== OUTPUT_WIDTH) {
  throw new Error(
    `幅が OUTPUT_WIDTH と一致しません: ${revealMeta.width} (期待 ${OUTPUT_WIDTH})`,
  );
}
console.log(
  `reveal size: ${revealMeta.width}x${revealMeta.height} ` +
    '(lib/loader/particle-logo.ts の LOGO_SOURCE_*_PX と一致していること)',
);
