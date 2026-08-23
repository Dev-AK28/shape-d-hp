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
  expect(csp).toContain('report-to csp-endpoint');
  expect(csp).toContain('report-uri /api/csp-report');
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
    expect(headers['reporting-endpoints']).toBe('csp-endpoint="/api/csp-report"');
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

    // The top page's WebGL canvas (see e2e/top-hero.spec.ts) must still attach
    // and receive a non-zero backing store under the CSP.
    const canvas = page.getByTestId('hero-rain-canvas');
    await expect(canvas).toBeAttached();
    const pixelCount = await canvas.evaluate(
      (el) => (el as HTMLCanvasElement).width * (el as HTMLCanvasElement).height,
    );
    expect(pixelCount).toBeGreaterThan(0);

    expect(cspViolations).toEqual([]);
  });
});

test.describe('CSP violation reporting endpoint (#457)', () => {
  test('accepts a Reporting API v1 (report-to) batch and responds 204', async ({ request }) => {
    const response = await request.post('/api/csp-report', {
      headers: { 'content-type': 'application/reports+json' },
      data: [
        {
          type: 'csp-violation',
          body: {
            documentURL: 'https://example.com/',
            effectiveDirective: 'script-src-elem',
            disposition: 'enforce',
            blockedURL: 'https://evil.example/x.js',
          },
        },
      ],
    });

    expect(response.status()).toBe(204);
  });

  test('accepts a legacy report-uri payload and responds 204', async ({ request }) => {
    const response = await request.post('/api/csp-report', {
      headers: { 'content-type': 'application/csp-report' },
      data: {
        'csp-report': {
          'document-uri': 'https://example.com/',
          'violated-directive': 'style-src-attr',
          'blocked-uri': 'inline',
        },
      },
    });

    expect(response.status()).toBe(204);
  });

  test('rejects a malformed report body with 400', async ({ request }) => {
    const response = await request.post('/api/csp-report', {
      headers: { 'content-type': 'application/json' },
      data: 'not-a-report',
    });

    expect(response.status()).toBe(400);
  });
});
