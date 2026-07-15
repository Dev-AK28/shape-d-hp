import type { NextConfig } from "next";

// Baseline security response headers applied to every route.
// Content-Security-Policy is intentionally NOT included here: this site
// loads three.js (WebGL), inline styles, and web fonts, so a CSP needs a
// careful allow-list audit before it can be added safely. Track that as a
// separate follow-up rather than blocking these low-risk, broadly-safe
// headers (see documents/spec/security-headers.md).
const SECURITY_HEADERS = [
  // Prevent the site from being framed by another origin (clickjacking).
  { key: "X-Frame-Options", value: "DENY" },
  // Stop browsers from MIME-sniffing responses away from the declared
  // Content-Type.
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Send the full URL only to same-origin requests; send just the origin
  // cross-origin, and nothing when downgrading to a less secure protocol.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Deny access to sensor/media APIs the site never uses.
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
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
