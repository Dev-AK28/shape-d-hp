#!/usr/bin/env node
/**
 * Runs Lighthouse mobile audit against a running Next.js server.
 * Usage: node scripts/lighthouse-check.mjs [url]
 * Default URL: http://127.0.0.1:3000/
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const targetUrl = process.argv[2] ?? 'http://127.0.0.1:3000/';
const minPerformance = Number(process.env.LIGHTHOUSE_MIN_PERFORMANCE ?? '0.7');
const warmupPasses = Number(process.env.LIGHTHOUSE_WARMUP_PASSES ?? '2');
const outputDir = path.join(__dirname, '../.lighthouse');
const reportPath = path.join(outputDir, 'report.json');

function findPlaywrightChromium() {
  const cacheRoots = [
    path.join(os.homedir(), 'Library/Caches/ms-playwright'),
    path.join(os.homedir(), '.cache/ms-playwright'),
  ];

  for (const cacheRoot of cacheRoots) {
    if (!fs.existsSync(cacheRoot)) {
      continue;
    }

    for (const entry of fs.readdirSync(cacheRoot)) {
      if (!entry.startsWith('chromium-')) {
        continue;
      }

      const candidates = [
        path.join(cacheRoot, entry, 'chrome-mac', 'Chromium.app', 'Contents', 'MacOS', 'Chromium'),
        path.join(cacheRoot, entry, 'chrome-linux64', 'chrome'),
        path.join(cacheRoot, entry, 'chrome-win64', 'chrome.exe'),
      ];

      for (const candidate of candidates) {
        if (fs.existsSync(candidate)) {
          return candidate;
        }
      }
    }
  }

  return undefined;
}

function resolveChromePath() {
  const candidates = [
    process.env.CHROME_PATH,
    process.env.PUPPETEER_EXECUTABLE_PATH,
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/chromium-browser',
    '/usr/bin/chromium',
    findPlaywrightChromium(),
  ].filter(Boolean);

  for (const candidate of candidates) {
    if (candidate && fs.existsSync(candidate)) {
      return candidate;
    }
  }

  return undefined;
}

fs.mkdirSync(outputDir, { recursive: true });

for (let pass = 0; pass < warmupPasses; pass += 1) {
  try {
    await fetch(targetUrl, { signal: AbortSignal.timeout(30_000) });
  } catch {
    console.warn(`Warmup pass ${pass + 1} failed for ${targetUrl}; continuing.`);
  }
}

const chromePath = resolveChromePath();
const args = [
  'lighthouse',
  targetUrl,
  '--quiet',
  '--chrome-flags=--headless --no-sandbox --disable-gpu --disable-dev-shm-usage',
  '--only-categories=performance',
  '--form-factor=mobile',
  '--screenEmulation.mobile=true',
  '--output=json',
  `--output-path=${reportPath}`,
];

if (chromePath) {
  args.push(`--chrome-path=${chromePath}`);
}

const result = spawnSync('npx', args, {
  stdio: 'inherit',
  env: process.env,
});

if (result.status !== 0) {
  console.error('Lighthouse failed to run. Ensure the app server is running on the target URL.');
  process.exit(result.status ?? 1);
}

const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
const performanceScore = report.categories?.performance?.score ?? 0;

console.log(
  `Lighthouse mobile performance score: ${(performanceScore * 100).toFixed(0)} (min ${minPerformance * 100})`,
);

if (performanceScore < minPerformance) {
  console.error(`Performance score ${performanceScore} is below threshold ${minPerformance}`);
  process.exit(1);
}

console.log('Lighthouse performance check passed.');
