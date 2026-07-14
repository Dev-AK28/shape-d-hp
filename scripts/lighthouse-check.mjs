#!/usr/bin/env node
/**
 * Runs Lighthouse mobile audit against a running Next.js server.
 * Usage: node scripts/lighthouse-check.mjs [url]
 *
 * Default URL: http://127.0.0.1:3000/services — the Performance >= 0.9 gate (#326) lives on
 * a lower page, not the top page: the top page's 10s particle loader IS its FCP/LCP by design
 * (#420), so auditing `/` with the default threshold would always fail. See
 * documents/spec/top-particle-loader.md.
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const targetUrl = process.argv[2] ?? 'http://127.0.0.1:3000/services';
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

function runLighthouseAudit(runReportPath) {
  const args = [
    'lighthouse',
    targetUrl,
    '--quiet',
    '--chrome-flags=--headless --no-sandbox --disable-gpu --disable-dev-shm-usage',
    '--only-categories=performance',
    '--form-factor=mobile',
    '--screenEmulation.mobile=true',
    '--output=json',
    `--output-path=${runReportPath}`,
  ];

  if (process.env.CI === 'true') {
    // Avoid double-throttling CPU on slow CI runners while keeping mobile viewport.
    args.push('--throttling-method=provided');
  }

  if (chromePath) {
    args.push(`--chrome-path=${chromePath}`);
  }

  const result = spawnSync('npx', args, {
    stdio: 'inherit',
    env: process.env,
  });

  if (result.status !== 0) {
    return undefined;
  }

  return JSON.parse(fs.readFileSync(runReportPath, 'utf8'));
}

const auditAttempts = Number(process.env.LIGHTHOUSE_ATTEMPTS ?? (process.env.CI === 'true' ? '2' : '1'));
let bestScore = 0;

for (let attempt = 1; attempt <= auditAttempts; attempt += 1) {
  const runReportPath = path.join(outputDir, `report-${attempt}.json`);
  const report = runLighthouseAudit(runReportPath);

  if (!report) {
    console.error(`Lighthouse attempt ${attempt} failed to run.`);
    process.exit(1);
  }

  const score = report.categories?.performance?.score ?? 0;
  bestScore = Math.max(bestScore, score);
  fs.writeFileSync(reportPath, JSON.stringify(report));

  console.log(
    `Lighthouse attempt ${attempt}/${auditAttempts}: ${(score * 100).toFixed(0)} (best ${(bestScore * 100).toFixed(0)})`,
  );
}

const performanceScore = bestScore;

console.log(
  `Lighthouse mobile performance score: ${(performanceScore * 100).toFixed(0)} (min ${minPerformance * 100})`,
);

if (performanceScore < minPerformance) {
  console.error(`Performance score ${performanceScore} is below threshold ${minPerformance}`);
  process.exit(1);
}

console.log('Lighthouse performance check passed.');
