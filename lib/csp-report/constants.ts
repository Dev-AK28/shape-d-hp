/**
 * The Reporting API endpoint group name referenced by the `report-to`
 * CSP directive and declared in the `Reporting-Endpoints` response header
 * (see next.config.ts).
 */
export const CSP_REPORT_ENDPOINT_GROUP = 'csp-endpoint';

/** Path the browser POSTs CSP violation reports to (both report-to and report-uri). */
export const CSP_REPORT_PATH = '/api/csp-report';

/**
 * JSON body upper bound for a single reports+json / csp-report POST.
 * A single CSP violation report is a few hundred bytes; this generously
 * covers a batched Reporting API delivery (multiple violations coalesced
 * into one request) while still bounding worst-case memory/log usage.
 */
export const MAX_CSP_REPORT_BODY_BYTES = 65_536;

/** Reports processed per request; extra entries in an oversized batch are dropped, not logged. */
export const MAX_CSP_REPORTS_PER_REQUEST = 20;

/** Upper bound on any single logged string field, to keep log lines bounded. */
export const MAX_LOGGED_FIELD_LENGTH = 500;
