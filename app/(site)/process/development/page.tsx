import type { Metadata } from 'next';
import DevelopmentContent from '@/components/DevelopmentContent';

const TITLE = '開発プロセス — AIスタックを指揮した爆速開発 | SHAPE∞D';
const DESCRIPTION =
  '要件定義からAI指揮による爆速試作、品質担保、実装・公開まで。技術者としての高い視座で進めるSHAPE∞Dのシステム開発プロセスを解説します。';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: {
    canonical: '/process/development',
  },
  openGraph: {
    type: 'website',
    locale: 'ja_JP',
    url: '/process/development',
    siteName: 'SHAPE∞D',
    title: TITLE,
    description: DESCRIPTION,
  },
};

export default function DevelopmentProcessPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[var(--background)] to-black">
      <DevelopmentContent />
    </main>
  );
}
