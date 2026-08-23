import { MAX_CSP_REPORTS_PER_REQUEST, MAX_LOGGED_FIELD_LENGTH } from './constants';

/** A single CSP violation, normalized from either report format for logging. */
export type NormalizedCspViolation = {
  documentUri?: string;
  violatedDirective?: string;
  effectiveDirective?: string;
  blockedUri?: string;
  disposition?: string;
  sourceFile?: string;
  lineNumber?: number;
  columnNumber?: number;
  statusCode?: number;
  sample?: string;
};

export type ParseCspReportResult =
  | { ok: true; violations: NormalizedCspViolation[] }
  | { ok: false; reason: 'invalid_json' | 'unrecognized_shape' };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function asString(value: unknown): string | undefined {
  if (typeof value !== 'string' || value.length === 0) {
    return undefined;
  }
  return value.length > MAX_LOGGED_FIELD_LENGTH
    ? `${value.slice(0, MAX_LOGGED_FIELD_LENGTH)}…`
    : value;
}

function asNumber(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

/** Normalizes a Reporting API v1 `body` object (camelCase field names). */
function normalizeReportingApiViolation(body: unknown): NormalizedCspViolation {
  const record = isRecord(body) ? body : {};
  return {
    documentUri: asString(record.documentURL),
    violatedDirective: asString(record.violatedDirective) ?? asString(record.effectiveDirective),
    effectiveDirective: asString(record.effectiveDirective),
    blockedUri: asString(record.blockedURL),
    disposition: asString(record.disposition),
    sourceFile: asString(record.sourceFile),
    lineNumber: asNumber(record.lineNumber),
    columnNumber: asNumber(record.columnNumber),
    statusCode: asNumber(record.statusCode),
    sample: asString(record.sample),
  };
}

/** Normalizes a legacy `report-uri` `csp-report` object (kebab-case field names). */
function normalizeLegacyViolation(report: unknown): NormalizedCspViolation {
  const record = isRecord(report) ? report : {};
  return {
    documentUri: asString(record['document-uri']),
    violatedDirective: asString(record['violated-directive']),
    effectiveDirective: asString(record['effective-directive']),
    blockedUri: asString(record['blocked-uri']),
    disposition: asString(record.disposition),
    sourceFile: asString(record['source-file']),
    lineNumber: asNumber(record['line-number']),
    columnNumber: asNumber(record['column-number']),
    statusCode: asNumber(record['status-code']),
    sample: asString(record['script-sample']),
  };
}

/**
 * Parses a CSP violation report body sent by the browser, accepting both:
 * - the Reporting API v1 format (`Content-Type: application/reports+json`,
 *   a JSON array of `Report` objects, driven by the `report-to` directive)
 * - the legacy `report-uri` format (`Content-Type: application/csp-report`,
 *   a single `{ "csp-report": {...} }` object)
 *
 * Content-Type is informational only — some browsers/environments omit or
 * misreport it, so the body shape (array vs. `csp-report` key) is the
 * source of truth for which format was sent.
 */
export function parseCspReportBody(rawBody: string): ParseCspReportResult {
  const trimmed = rawBody.trim();
  if (trimmed.length === 0) {
    return { ok: true, violations: [] };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(trimmed);
  } catch {
    return { ok: false, reason: 'invalid_json' };
  }

  if (Array.isArray(parsed)) {
    const violations = parsed
      .filter((entry): entry is Record<string, unknown> => isRecord(entry) && entry.type === 'csp-violation')
      .slice(0, MAX_CSP_REPORTS_PER_REQUEST)
      .map((entry) => normalizeReportingApiViolation(entry.body));
    return { ok: true, violations };
  }

  if (isRecord(parsed) && 'csp-report' in parsed) {
    return { ok: true, violations: [normalizeLegacyViolation(parsed['csp-report'])] };
  }

  return { ok: false, reason: 'unrecognized_shape' };
}
