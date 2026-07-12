import type { NextConfig } from "next";

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
};

export default nextConfig;
