import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

// Content-Security-Policy allow-list, audited against this codebase
// (see documents/spec/security-headers.md for the full writeup):
// - script-src/style-src need 'unsafe-inline': this site has no
//   third-party scripts or CSS-in-JS runtime, but Next.js itself injects
//   inline <script> tags for RSC payload streaming
//   (`self.__next_f.push(...)`) on every page, confirmed via
//   `next build && next start` output inspection. Every page route is
//   statically prerendered; adopting nonces instead would require Proxy
//   (this Next.js version's renamed middleware) plus forcing every page
//   into dynamic rendering, which throws away that static optimization -
//   not worth it for a site with no third-party script/style sources to
//   defend against in the first place.
// - img-src needs 'data:' for the inline SVG background in
//   app/globals.css (`background-image: url("data:image/svg+xml...")`).
// - font-src/connect-src only need 'self': next/font/google
//   (app/layout.tsx, components/top/top-fonts.ts) self-hosts font files
//   at build time (no fonts.gstatic.com requests), and the only
//   browser-side fetch() is same-origin (app/(site)/contact/page.tsx ->
//   /api/contact). The Resend API call and Upstash Redis client run
//   server-side only (lib/contact/send-email.ts,
//   lib/contact/rate-limit-redis.ts), so they never touch the browser's
//   connect-src.
// - the hand-written WebGL2 renderer (lib/webgl/starfield-renderer.ts)
//   compiles inline GLSL via gl.shaderSource/gl.compileShader, which is a
//   JS API call, not a network fetch, so it needs no extra directive.
// - frame-ancestors 'none' complements the existing X-Frame-Options below
//   (kept for browsers that don't yet honor frame-ancestors).
// - 'unsafe-eval' is only needed in dev, for React's dev-mode eval-based
//   stack trace reconstruction; production React/Next.js never use eval.
const CSP_DIRECTIVES = [
  `default-src 'self'`,
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  `style-src 'self' 'unsafe-inline'`,
  `img-src 'self' data:`,
  `font-src 'self'`,
  `connect-src 'self'${isDev ? " ws:" : ""}`,
  `object-src 'none'`,
  `base-uri 'self'`,
  `form-action 'self'`,
  `frame-ancestors 'none'`,
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

// Baseline security response headers applied to every route.
const SECURITY_HEADERS = [
  // Restrict script/style/font/image sources and inline-script/style
  // injection surface site-wide (see CSP_DIRECTIVES above for rationale).
  { key: "Content-Security-Policy", value: CSP_DIRECTIVES },
  // Prevent the site from being framed by another origin (clickjacking).
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
