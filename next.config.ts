import type { NextConfig } from "next";
import {
  CSP_REPORT_ENDPOINT_GROUP,
  CSP_REPORT_PATH,
} from "./lib/csp-report/constants";

const isDev = process.env.NODE_ENV === "development";

// Content-Security-Policy — staged introduction (#450, follow-up to #437).
//
// Allow-list audit performed for this codebase (full write-up in
// documents/spec/security-headers.md):
// - three.js (lib/webgl/): renders to a same-origin <canvas> and compiles
//   GLSL shaders on the GPU driver (not JS eval); it never loads external
//   textures or scripts. No extra allow-list entries needed.
// - Inline styles: several components use the React `style={{ ... }}` prop,
//   which renders as a `style="..."` attribute. There is no per-request
//   nonce plumbing (no proxy) and this site is pure static generation (SSG,
//   no `revalidate` usage anywhere under app/), so per-request nonces are
//   out of scope for this pass — `'unsafe-inline'` is required for
//   style-src, matching the Next.js-documented "without nonces" CSP recipe
//   (node_modules/next/dist/docs/01-app/02-guides/
//   content-security-policy.md).
// - Next.js App Router's inline bootstrap/hydration scripts are also
//   un-nonced for the same static-rendering reason, so `'unsafe-inline'` is
//   required for script-src too. This does not protect against inline-script
//   injection, but it still blocks loading any *external* script and
//   restricts framing/forms/fetches to same-origin — a strict improvement
//   over having no CSP at all.
//   Removing `'unsafe-inline'` (nonce-based `script-src` via `proxy.ts`, or
//   the `experimental.sri` build flag) was investigated in #455 and closed
//   as infeasible: swapping in a per-request nonce (via `proxy.ts`, the
//   Next.js 16 file convention that replaced `middleware.ts`) leaves
//   statically prerendered pages with zero `nonce="..."` attributes on
//   their RSC hydration `<script>` tags (verified against a real
//   `next start` response), so every static page's hydration breaks;
//   `experimental.sri` only adds `integrity="..."` to externally-loaded
//   chunk `<script src>` tags and doesn't touch inline scripts at all. See
//   "`unsafe-inline` 除去の実現可能性調査" in
//   documents/spec/security-headers.md.
// - Web fonts (next/font/google in components/top/top-fonts.ts) are
//   downloaded at build time and self-hosted under /_next/static, so no
//   external font-src origin is needed.
// - /api/contact calls the Resend API server-side only
//   (lib/contact/send-email.ts); CSP only governs browser-issued requests,
//   so no connect-src allowance is needed for it.
// - No analytics/CDN scripts, no images.remotePatterns, no web workers, and
//   no external blob:/data: URL producers were found anywhere else in the
//   app.
const CSP_HEADER_VALUE = [
  `default-src 'self'`,
  `script-src 'self' 'unsafe-inline'${isDev ? ` 'unsafe-eval'` : ""}`,
  `style-src 'self' 'unsafe-inline'`,
  `img-src 'self' data: blob:`,
  `font-src 'self'`,
  `connect-src 'self'`,
  `object-src 'none'`,
  `base-uri 'self'`,
  `form-action 'self'`,
  `frame-ancestors 'none'`,
  `upgrade-insecure-requests`,
  // CSP violation reporting (#457, follow-up to #450). `report-to` targets
  // the modern Reporting API group declared via the Reporting-Endpoints
  // header below; `report-uri` is kept alongside it as a fallback for
  // browsers that only support the older report-uri mechanism (notably
  // Safari, which has no Reporting API support at all). Both point at the
  // same same-origin endpoint (app/api/csp-report/route.ts), which only
  // logs violations server-side — no external log aggregation service is
  // wired up, to avoid a new billing dependency.
  `report-to ${CSP_REPORT_ENDPOINT_GROUP}`,
  `report-uri ${CSP_REPORT_PATH}`,
].join("; ");

// Baseline security response headers applied to every route.
const SECURITY_HEADERS = [
  // Prevent the site from being framed by another origin (clickjacking).
  // Kept alongside the CSP's frame-ancestors 'none' below for defense in
  // depth on browsers that don't support the CSP directive.
  { key: "X-Frame-Options", value: "DENY" },
  // Stop browsers from MIME-sniffing responses away from the declared
  // Content-Type.
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Send the full URL only to same-origin requests; send just the origin
  // cross-origin, and nothing when downgrading to a less secure protocol.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Deny access to sensor/media APIs the site never uses, and opt out of
  // the Topics API (FLoC's successor ad-tracking mechanism).
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
  // Force HTTPS for two years, including subdomains, and allow preload
  // list submission. Safe here because production is already HTTPS-only
  // (Vercel).
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  // Declares the `csp-endpoint` Reporting API group used by the CSP's
  // `report-to` directive above. The endpoint URL is relative to this
  // response's URL, per the Reporting API spec (#457).
  {
    key: "Reporting-Endpoints",
    value: `${CSP_REPORT_ENDPOINT_GROUP}="${CSP_REPORT_PATH}"`,
  },
  // See the allow-list audit above CSP_HEADER_VALUE for what each directive
  // permits and why.
  { key: "Content-Security-Policy", value: CSP_HEADER_VALUE },
] as const;

const nextConfig: NextConfig = {
  experimental: {
    // framer-motion has many named exports (motion, hooks, types, ...) and is
    // imported that way across the app (13 files), so it benefits from
    // Next.js's per-symbol import optimization here.
    // `lucide-react` is already optimized by Next.js by default, and is not
    // currently imported anywhere in this codebase, so it is intentionally
    // omitted from this list.
    optimizePackageImports: ["framer-motion"],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [...SECURITY_HEADERS],
      },
    ];
  },
};

export default nextConfig;
