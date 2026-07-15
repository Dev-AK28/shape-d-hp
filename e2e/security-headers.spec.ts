import { expect, test } from './fixtures';

function expectBaselineSecurityHeaders(headers: Record<string, string>): void {
  expect(headers['x-frame-options']).toBe('DENY');
  expect(headers['x-content-type-options']).toBe('nosniff');
}

// Directives that must hold in every environment (dev adds 'unsafe-eval' /
// ws: and omits upgrade-insecure-requests; see next.config.ts).
function expectBaselineCsp(headers: Record<string, string>): void {
  const csp = headers['content-security-policy'];
  expect(csp).toBeTruthy();
  expect(csp).toContain("default-src 'self'");
  expect(csp).toContain("script-src 'self' 'unsafe-inline'");
  expect(csp).toContain("style-src 'self' 'unsafe-inline'");
  expect(csp).toContain("img-src 'self' data:");
  expect(csp).toContain("font-src 'self'");
  expect(csp).toContain("connect-src 'self'");
  expect(csp).toContain("object-src 'none'");
  expect(csp).toContain("base-uri 'self'");
  expect(csp).toContain("form-action 'self'");
  expect(csp).toContain("frame-ancestors 'none'");
}

test.describe('Security response headers', () => {
  test('applies baseline security headers to a page response', async ({ request }) => {
    const response = await request.get('/');
    const headers = response.headers();

    expectBaselineSecurityHeaders(headers);
    expectBaselineCsp(headers);
    expect(headers['referrer-policy']).toBe('strict-origin-when-cross-origin');
    expect(headers['permissions-policy']).toBe(
      'camera=(), microphone=(), geolocation=(), browsing-topics=()',
    );
    expect(headers['strict-transport-security']).toBe('max-age=63072000; includeSubDomains; preload');
  });

  test('applies the same baseline security headers to the contact API route', async ({ request }) => {
    const response = await request.get('/api/contact');
    const headers = response.headers();
    expectBaselineSecurityHeaders(headers);
    expectBaselineCsp(headers);
  });

  test('applies the same baseline security headers to static assets under /public', async ({ request }) => {
    const response = await request.get('/icon.png');
    const headers = response.headers();
    expectBaselineSecurityHeaders(headers);
    expectBaselineCsp(headers);
  });

  test('does not block WebGL rendering or contact form submission under CSP', async ({ page }) => {
    const consoleViolations: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error' && /Content Security Policy/i.test(msg.text())) {
        consoleViolations.push(msg.text());
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');
    expect(consoleViolations).toEqual([]);

    await page.goto('/contact');
    await page.waitForLoadState('networkidle');
    expect(consoleViolations).toEqual([]);
  });
});
