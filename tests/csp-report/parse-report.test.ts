import { describe, expect, it } from 'vitest';
import { parseCspReportBody } from '@/lib/csp-report/parse-report';
import { MAX_CSP_REPORTS_PER_REQUEST, MAX_LOGGED_FIELD_LENGTH } from '@/lib/csp-report/constants';

describe('parseCspReportBody', () => {
  it('returns no violations for an empty body', () => {
    expect(parseCspReportBody('')).toEqual({ ok: true, violations: [] });
    expect(parseCspReportBody('   ')).toEqual({ ok: true, violations: [] });
  });

  it('returns invalid_json for malformed JSON', () => {
    expect(parseCspReportBody('not-json')).toEqual({ ok: false, reason: 'invalid_json' });
  });

  it('returns unrecognized_shape for JSON that is neither an array nor a csp-report object', () => {
    expect(parseCspReportBody('{"foo":"bar"}')).toEqual({
      ok: false,
      reason: 'unrecognized_shape',
    });
    expect(parseCspReportBody('42')).toEqual({ ok: false, reason: 'unrecognized_shape' });
  });

  it('normalizes a Reporting API v1 (application/reports+json) batch', () => {
    const body = JSON.stringify([
      {
        type: 'csp-violation',
        age: 10,
        url: 'https://example.com/page',
        body: {
          documentURL: 'https://example.com/page',
          effectiveDirective: 'script-src-elem',
          disposition: 'enforce',
          blockedURL: 'https://evil.example/x.js',
          sourceFile: 'https://example.com/page',
          lineNumber: 12,
          columnNumber: 3,
          statusCode: 200,
          sample: '',
        },
      },
      // Non-csp-violation reports (e.g. deprecation) must be ignored.
      { type: 'deprecation', body: { id: 'something' } },
    ]);

    expect(parseCspReportBody(body)).toEqual({
      ok: true,
      violations: [
        {
          documentUri: 'https://example.com/page',
          violatedDirective: 'script-src-elem',
          effectiveDirective: 'script-src-elem',
          blockedUri: 'https://evil.example/x.js',
          disposition: 'enforce',
          sourceFile: 'https://example.com/page',
          lineNumber: 12,
          columnNumber: 3,
          statusCode: 200,
          sample: undefined,
        },
      ],
    });
  });

  it('falls back to effectiveDirective when violatedDirective is an explicit empty string', () => {
    const body = JSON.stringify([
      {
        type: 'csp-violation',
        body: { violatedDirective: '', effectiveDirective: 'script-src-elem' },
      },
    ]);

    const result = parseCspReportBody(body);
    expect(result.ok).toBe(true);
    expect(result.ok && result.violations[0]?.violatedDirective).toBe('script-src-elem');
  });

  it('normalizes a legacy report-uri (application/csp-report) object', () => {
    const body = JSON.stringify({
      'csp-report': {
        'document-uri': 'https://example.com/page',
        'violated-directive': 'style-src-attr',
        'effective-directive': 'style-src-attr',
        disposition: 'enforce',
        'blocked-uri': 'inline',
        'source-file': 'https://example.com/page',
        'line-number': 5,
        'column-number': 1,
        'status-code': 200,
        'script-sample': '',
      },
    });

    expect(parseCspReportBody(body)).toEqual({
      ok: true,
      violations: [
        {
          documentUri: 'https://example.com/page',
          violatedDirective: 'style-src-attr',
          effectiveDirective: 'style-src-attr',
          blockedUri: 'inline',
          disposition: 'enforce',
          sourceFile: 'https://example.com/page',
          lineNumber: 5,
          columnNumber: 1,
          statusCode: 200,
          sample: undefined,
        },
      ],
    });
  });

  it('falls back to effective-directive when the legacy violated-directive is an explicit empty string', () => {
    const body = JSON.stringify({
      'csp-report': {
        'violated-directive': '',
        'effective-directive': 'style-src-attr',
      },
    });

    const result = parseCspReportBody(body);
    expect(result.ok).toBe(true);
    expect(result.ok && result.violations[0]?.violatedDirective).toBe('style-src-attr');
  });

  it('caps the number of violations parsed from an oversized batch', () => {
    const entries = Array.from({ length: MAX_CSP_REPORTS_PER_REQUEST + 5 }, (_, i) => ({
      type: 'csp-violation',
      body: { blockedURL: `https://evil.example/${i}.js` },
    }));

    const result = parseCspReportBody(JSON.stringify(entries));
    expect(result.ok).toBe(true);
    expect(result.ok && result.violations).toHaveLength(MAX_CSP_REPORTS_PER_REQUEST);
  });

  it('truncates overly long string fields', () => {
    const longUri = `https://evil.example/${'a'.repeat(MAX_LOGGED_FIELD_LENGTH + 50)}`;
    const body = JSON.stringify([
      { type: 'csp-violation', body: { blockedURL: longUri } },
    ]);

    const result = parseCspReportBody(body);
    expect(result.ok).toBe(true);
    const blockedUri = result.ok ? result.violations[0]?.blockedUri : undefined;
    expect(blockedUri).toBeDefined();
    expect(blockedUri?.length).toBeLessThanOrEqual(MAX_LOGGED_FIELD_LENGTH + 1);
    expect(blockedUri?.endsWith('…')).toBe(true);
  });

  it('does not split a surrogate pair (e.g. an emoji) when truncating', () => {
    // Places a 2-code-unit emoji so its high surrogate lands exactly at
    // index MAX_LOGGED_FIELD_LENGTH - 1 (the last code unit kept by a naive
    // slice), which would otherwise leave an unpaired trailing surrogate.
    const sample = `${'a'.repeat(MAX_LOGGED_FIELD_LENGTH - 1)}😀${'b'.repeat(10)}`;
    const body = JSON.stringify([{ type: 'csp-violation', body: { sample } }]);

    const result = parseCspReportBody(body);
    expect(result.ok).toBe(true);
    const truncated = result.ok ? result.violations[0]?.sample : undefined;
    expect(truncated).toBeDefined();
    // Valid UTF-16: no lone surrogate anywhere in the truncated string.
    expect(truncated).not.toMatch(/[\uD800-\uDBFF](?![\uDC00-\uDFFF])/);
    expect(truncated).not.toMatch(/(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/);
    expect(truncated?.endsWith('…')).toBe(true);
  });

  it('handles a report-to entry with a missing/malformed body gracefully', () => {
    const body = JSON.stringify([{ type: 'csp-violation' }, { type: 'csp-violation', body: null }]);
    expect(parseCspReportBody(body)).toEqual({
      ok: true,
      violations: [
        {
          documentUri: undefined,
          violatedDirective: undefined,
          effectiveDirective: undefined,
          blockedUri: undefined,
          disposition: undefined,
          sourceFile: undefined,
          lineNumber: undefined,
          columnNumber: undefined,
          statusCode: undefined,
          sample: undefined,
        },
        {
          documentUri: undefined,
          violatedDirective: undefined,
          effectiveDirective: undefined,
          blockedUri: undefined,
          disposition: undefined,
          sourceFile: undefined,
          lineNumber: undefined,
          columnNumber: undefined,
          statusCode: undefined,
          sample: undefined,
        },
      ],
    });
  });
});
