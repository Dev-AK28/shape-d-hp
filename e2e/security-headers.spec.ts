import { expect, test } from './fixtures';

test.describe('Security response headers', () => {
  test('applies baseline security headers to a page response', async ({ request }) => {
    const response = await request.get('/');
    const headers = response.headers();

    expect(headers['x-frame-options']).toBe('DENY');
    expect(headers['x-content-type-options']).toBe('nosniff');
    expect(headers['referrer-policy']).toBe('strict-origin-when-cross-origin');
    expect(headers['permissions-policy']).toBe('camera=(), microphone=(), geolocation=()');
    expect(headers['strict-transport-security']).toBe('max-age=63072000; includeSubDomains; preload');
  });

  test('applies the same baseline security headers to the contact API route', async ({ request }) => {
    const response = await request.get('/api/contact');
    const headers = response.headers();

    expect(headers['x-frame-options']).toBe('DENY');
    expect(headers['x-content-type-options']).toBe('nosniff');
  });
});
