import type { Metadata } from 'next';
import WorksContent from '@/components/WorksContent';
import PageHeader from '@/components/ui/PageHeader';

const TITLE = '実績 — プロダクト開発とコンセプトデザインの事例紹介 | SHAPE∞D';
const DESCRIPTION =
  'SHAPE∞Dが手がけたAIプロダクト開発とコンセプトデザインの実績・ポートフォリオをご紹介します。';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: {
    canonical: '/works',
  },
  openGraph: {
    type: 'website',
    locale: 'ja_JP',
    url: '/works',
    siteName: 'SHAPE∞D',
    title: TITLE,
    description: DESCRIPTION,
  },
};

export default function WorksPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[var(--background)] to-black">
      <PageHeader
        title="WORKS"
        subtitle="実績 — プロダクト開発とコンセプトデザインのポートフォリオをご紹介します"
        dividerVariant="sky"
      />
      <WorksContent />
    </main>
  );
}
