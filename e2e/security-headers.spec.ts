import { expect, test } from './fixtures';

function expectBaselineSecurityHeaders(headers: Record<string, string>): void {
  expect(headers['x-frame-options']).toBe('DENY');
  expect(headers['x-content-type-options']).toBe('nosniff');
}

test.describe('Security response headers', () => {
  test('applies baseline security headers to a page response', async ({ request }) => {
    const response = await request.get('/');
    const headers = response.headers();

    expectBaselineSecurityHeaders(headers);
    expect(headers['referrer-policy']).toBe('strict-origin-when-cross-origin');
    expect(headers['permissions-policy']).toBe(
      'camera=(), microphone=(), geolocation=(), browsing-topics=()',
    );
    expect(headers['strict-transport-security']).toBe('max-age=63072000; includeSubDomains; preload');
  });

  test('applies the same baseline security headers to the contact API route', async ({ request }) => {
    const response = await request.get('/api/contact');
    expectBaselineSecurityHeaders(response.headers());
  });

  test('applies the same baseline security headers to static assets under /public', async ({ request }) => {
    const response = await request.get('/icon.png');
    expectBaselineSecurityHeaders(response.headers());
  });
});
