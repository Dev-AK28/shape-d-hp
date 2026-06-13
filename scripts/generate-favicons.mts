import { writeFaviconAssets } from '../lib/brand/favicon.ts';

const results = await writeFaviconAssets();

for (const result of results) {
  console.log(`Generated app/${result.filename} (${result.size}x${result.size}, ${result.bytes} bytes)`);
}
