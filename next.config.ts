import type { NextConfig } from "next";

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
//   nonce plumbing (no proxy/middleware) and this site relies on static
//   rendering for performance (see components/top/top-fonts.ts), so
//   per-request nonces are out of scope for this pass — `'unsafe-inline'`
//   is required for style-src, matching the Next.js-documented "without
//   nonces" CSP recipe (node_modules/next/dist/docs/01-app/02-guides/
//   content-security-policy.md).
// - Next.js App Router's inline bootstrap/hydration scripts are also
//   un-nonced for the same static-rendering reason, so `'unsafe-inline'` is
//   required for script-src too. This does not protect against inline-script
//   injection, but it still blocks loading any *external* script and
//   restricts framing/forms/fetches to same-origin — a strict improvement
//   over having no CSP at all.
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
