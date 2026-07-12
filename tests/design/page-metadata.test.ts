/**
 * 下層ページごとの metadata — Issue #395
 *
 * 以前は全下層ページが app/layout.tsx のトップページ用 metadata
 * （title/description/openGraph.url: '/'）をそのまま継承しており、
 * 検索結果・SNS シェアが全ページ同一になっていた。
 * 各ページが固有の title / description / openGraph.url を持つことを回帰テストで担保する。
 */
import { describe, expect, it, vi } from 'vitest';
import type { Metadata } from 'next';

// next/font/google は Next.js ビルド外では実行できないためモック（tests/components/TopShell.test.tsx と同様）
vi.mock('next/font/google', () => ({
  Cormorant_Garamond: () => ({ variable: 'font-cormorant-mock' }),
}));

const { metadata: rootMetadata } = await import('@/app/layout');
import { metadata as philosophyMetadata } from '@/app/(site)/philosophy/page';
import { metadata as processMetadata } from '@/app/(site)/process/page';
import { metadata as developmentMetadata } from '@/app/(site)/process/development/page';
import { metadata as consultingMetadata } from '@/app/(site)/process/consulting/page';
import { metadata as servicesMetadata } from '@/app/(site)/services/page';
import { metadata as worksMetadata } from '@/app/(site)/works/page';
import { metadata as contactMetadata } from '@/app/(site)/contact/layout';

const pages: Array<{ name: string; path: string; metadata: Metadata }> = [
  { name: 'philosophy', path: '/philosophy', metadata: philosophyMetadata },
  { name: 'process', path: '/process', metadata: processMetadata },
  { name: 'process/development', path: '/process/development', metadata: developmentMetadata },
  { name: 'process/consulting', path: '/process/consulting', metadata: consultingMetadata },
  { name: 'services', path: '/services', metadata: servicesMetadata },
  { name: 'works', path: '/works', metadata: worksMetadata },
  { name: 'contact', path: '/contact', metadata: contactMetadata },
];

describe('per-page metadata (#395)', () => {
  it.each(pages)('$name has its own title/description distinct from the homepage', ({ metadata }) => {
    expect(metadata.title).toBeTruthy();
    expect(metadata.description).toBeTruthy();
    expect(metadata.title).not.toBe(rootMetadata.title);
    expect(metadata.description).not.toBe(rootMetadata.description);
  });

  it.each(pages)('$name sets openGraph.url and alternates.canonical to its own path ($path)', ({
    path,
    metadata,
  }) => {
    expect(metadata.openGraph?.url).toBe(path);
    expect(metadata.alternates?.canonical).toBe(path);
    // the homepage's openGraph.url must not leak onto sub-pages
    expect(metadata.openGraph?.url).not.toBe(rootMetadata.openGraph?.url);
  });

  it('every page title is unique across the site', () => {
    const titles = [rootMetadata.title, ...pages.map((p) => p.metadata.title)];
    expect(new Set(titles).size).toBe(titles.length);
  });

  it('every page openGraph.url is unique across the site', () => {
    const urls = [rootMetadata.openGraph?.url, ...pages.map((p) => p.metadata.openGraph?.url)];
    expect(new Set(urls).size).toBe(urls.length);
  });
});
