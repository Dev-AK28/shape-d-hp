import type { Metadata } from 'next';
import ProcessNavigation from '@/components/ProcessNavigation';

const TITLE = 'プロセス — 開発とコンサルティング、二つの専門プロセス | SHAPE∞D';
const DESCRIPTION =
  'AIエンジニアリングによる開発プロセスと、自己一致を軸にしたコンサルティングプロセス。SHAPE∞Dが提供する二つのプロフェッショナルな進め方をご紹介します。';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: {
    canonical: '/process',
  },
  openGraph: {
    type: 'website',
    locale: 'ja_JP',
    url: '/process',
    siteName: 'SHAPE∞D',
    title: TITLE,
    description: DESCRIPTION,
  },
};

export default function ProcessPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[var(--background)] to-black">
      <ProcessNavigation />
    </main>
  );
}
