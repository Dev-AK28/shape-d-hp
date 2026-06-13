import { test, expect } from '@playwright/test';

const MAX_FAVICON_BYTES = 50 * 1024;

test.describe('Favicon assets', () => {
  test('serves a lightweight PNG icon', async ({ request }) => {
    const response = await request.get('/icon');
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('image/png');

    const body = await response.body();
    expect(body.byteLength).toBeGreaterThan(0);
    expect(body.byteLength).toBeLessThan(MAX_FAVICON_BYTES);
  });

  test('serves a lightweight apple-touch-icon', async ({ request }) => {
    const response = await request.get('/apple-icon');
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('image/png');

    const body = await response.body();
    expect(body.byteLength).toBeGreaterThan(0);
    expect(body.byteLength).toBeLessThan(MAX_FAVICON_BYTES);
  });

  test('does not use the full-size logo PNG as favicon metadata', async ({ page }) => {
    await page.goto('/');

    const iconLinks = page.locator('link[rel="icon"], link[rel="apple-touch-icon"]');
    const count = await iconLinks.count();

    if (count === 0) {
      const iconResponse = await page.request.get('/icon');
      expect(iconResponse.status()).toBe(200);
      return;
    }

    for (let index = 0; index < count; index += 1) {
      const href = await iconLinks.nth(index).getAttribute('href');
      expect(href ?? '').not.toContain('image_13.png');
    }
  });
});
