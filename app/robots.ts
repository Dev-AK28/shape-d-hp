import type { MetadataRoute } from 'next';

// #396: SEO discoverability のため robots.txt を追加。
// app/layout.tsx の metadataBase と同じ本番ドメインを基準にする。
const BASE_URL = 'https://www.shape-d.com';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
