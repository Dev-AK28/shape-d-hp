import { test, expect } from '@playwright/test';

const MAX_FAVICON_BYTES = 50 * 1024;
const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

function assertPngBuffer(buffer: Buffer): { width: number; height: number } {
  expect(buffer.subarray(0, 8)).toEqual(PNG_SIGNATURE);

  const width = buffer.readUInt32BE(16);
  const height = buffer.readUInt32BE(20);
  return { width, height };
}

test.describe('Favicon assets', () => {
  test('serves a lightweight 32x32 PNG icon', async ({ request }) => {
    const response = await request.get('/icon');
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('image/png');

    const body = Buffer.from(await response.body());
    expect(body.byteLength).toBeGreaterThan(0);
    expect(body.byteLength).toBeLessThan(MAX_FAVICON_BYTES);

    const { width, height } = assertPngBuffer(body);
    expect(width).toBe(32);
    expect(height).toBe(32);
  });

  test('serves a lightweight 180x180 apple-touch-icon', async ({ request }) => {
    const response = await request.get('/apple-icon');
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('image/png');

    const body = Buffer.from(await response.body());
    expect(body.byteLength).toBeGreaterThan(0);
    expect(body.byteLength).toBeLessThan(MAX_FAVICON_BYTES);

    const { width, height } = assertPngBuffer(body);
    expect(width).toBe(180);
    expect(height).toBe(180);
  });

  test('does not serve the legacy static favicon.ico asset', async ({ request }) => {
    const response = await request.get('/favicon.ico');
    expect(response.status()).toBe(404);
  });

  test('exposes generated icon metadata linked to live routes', async ({ page, request }) => {
    await page.goto('/');

    const iconLink = page.locator('link[rel="icon"]').first();
    const appleIconLink = page.locator('link[rel="apple-touch-icon"]').first();

    await expect(iconLink).toHaveCount(1);
    await expect(appleIconLink).toHaveCount(1);

    const iconHref = await iconLink.getAttribute('href');
    const appleIconHref = await appleIconLink.getAttribute('href');

    expect(iconHref ?? '').toMatch(/\/icon(?:\?|$)/);
    expect(iconHref ?? '').not.toContain('image_13.png');
    expect(iconHref ?? '').not.toMatch(/favicon\.ico(?:\?|$)/);

    expect(appleIconHref ?? '').toMatch(/\/apple-icon(?:\?|$)/);
    expect(appleIconHref ?? '').not.toContain('image_13.png');

    const iconResponse = await request.get(iconHref!);
    expect(iconResponse.status()).toBe(200);
    expect(iconResponse.headers()['content-type']).toContain('image/png');

    const appleIconResponse = await request.get(appleIconHref!);
    expect(appleIconResponse.status()).toBe(200);
    expect(appleIconResponse.headers()['content-type']).toContain('image/png');
  });
});
