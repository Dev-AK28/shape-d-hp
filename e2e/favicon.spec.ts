import { test, expect } from '@playwright/test';

const MAX_FAVICON_BYTES = 50 * 1024;

function readPngDimensions(buffer: Buffer): { width: number; height: number } {
  const width = buffer.readUInt32BE(16);
  const height = buffer.readUInt32BE(20);
  return { width, height };
}

test.describe('Favicon assets', () => {
  test('serves a lightweight 32x32 PNG icon', async ({ request }) => {
    const response = await request.get('/icon');
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('image/png');

    const body = await response.body();
    expect(body.byteLength).toBeGreaterThan(0);
    expect(body.byteLength).toBeLessThan(MAX_FAVICON_BYTES);

    const { width, height } = readPngDimensions(Buffer.from(body));
    expect(width).toBe(32);
    expect(height).toBe(32);
  });

  test('serves a lightweight 180x180 apple-touch-icon', async ({ request }) => {
    const response = await request.get('/apple-icon');
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('image/png');

    const body = await response.body();
    expect(body.byteLength).toBeGreaterThan(0);
    expect(body.byteLength).toBeLessThan(MAX_FAVICON_BYTES);

    const { width, height } = readPngDimensions(Buffer.from(body));
    expect(width).toBe(180);
    expect(height).toBe(180);
  });

  test('does not serve the legacy static favicon.ico asset', async ({ request }) => {
    const response = await request.get('/favicon.ico');
    expect(response.status()).not.toBe(200);
  });

  test('exposes generated icon metadata without image_13.png', async ({ page }) => {
    await page.goto('/');

    const iconLinks = page.locator('link[rel="icon"], link[rel="apple-touch-icon"]');
    await expect(iconLinks).not.toHaveCount(0);

    for (let index = 0; index < (await iconLinks.count()); index += 1) {
      const href = await iconLinks.nth(index).getAttribute('href');
      expect(href ?? '').not.toContain('image_13.png');
      expect(href ?? '').not.toMatch(/favicon\.ico(?:\?|$)/);
    }
  });
});
