import { expect, test } from './fixtures';

function expectBaselineSecurityHeaders(headers: Record<string, string>): void {
  expect(headers['x-frame-options']).toBe('DENY');
  expect(headers['x-content-type-options']).toBe('nosniff');
}

function expectCspDirectives(headers: Record<string, string>): void {
  const csp = headers['content-security-policy'];
  expect(csp).toBeTruthy();
  expect(csp).toContain(`default-src 'self'`);
  expect(csp).toContain(`script-src 'self' 'unsafe-inline'`);
  expect(csp).toContain(`style-src 'self' 'unsafe-inline'`);
  expect(csp).toContain(`img-src 'self' data: blob:`);
  expect(csp).toContain(`font-src 'self'`);
  expect(csp).toContain(`connect-src 'self'`);
  expect(csp).toContain(`object-src 'none'`);
  expect(csp).toContain(`base-uri 'self'`);
  expect(csp).toContain(`form-action 'self'`);
  expect(csp).toContain(`frame-ancestors 'none'`);
  expect(csp).toContain('upgrade-insecure-requests');
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
    expectCspDirectives(headers);
  });

  test('applies the same baseline security headers to the contact API route', async ({ request }) => {
    const response = await request.get('/api/contact');
    expectBaselineSecurityHeaders(response.headers());
    expectCspDirectives(response.headers());
  });

  test('applies the same baseline security headers to static assets under /public', async ({ request }) => {
    const response = await request.get('/icon.png');
    expectBaselineSecurityHeaders(response.headers());
    expectCspDirectives(response.headers());
  });

  test('does not block WebGL rendering or the contact form under the CSP', async ({ page }) => {
    const cspViolations: string[] = [];
    page.on('console', (message) => {
      if (message.type() === 'error' && /Content Security Policy/i.test(message.text())) {
        cspViolations.push(message.text());
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    expect(cspViolations).toEqual([]);
  });
});
