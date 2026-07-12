import type { Metadata } from 'next';
import ConsultingContent from '@/components/ConsultingContent';

const TITLE = 'コンサルティングプロセス — 自覚・言語化・表現で自己一致へ | SHAPE∞D';
const DESCRIPTION =
  '自覚、言語化、表現という3つのステップで自己表現力を育み、自己一致した生き方と経営を実現するSHAPE∞Dのコンサルティングプロセスをご紹介します。';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: {
    canonical: '/process/consulting',
  },
  openGraph: {
    type: 'website',
    locale: 'ja_JP',
    url: '/process/consulting',
    siteName: 'SHAPE∞D',
    title: TITLE,
    description: DESCRIPTION,
  },
};

export default function ConsultingProcessPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[var(--background)] to-black">
      <ConsultingContent />
    </main>
  );
}
