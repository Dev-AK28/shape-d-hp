import type { Metadata } from 'next';
import ServicesContent from '@/components/ServicesContent';
import PageHeader from '@/components/ui/PageHeader';

const TITLE = 'サービス — AIプロダクト開発から自己表現コーチングまで | SHAPE∞D';
const DESCRIPTION =
  'AIプロダクト開発から自己表現コーチングまで、デジタルとヒューマンの両軸でご支援するSHAPE∞Dのサービス・商品ラインナップをご紹介します。';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: {
    canonical: '/services',
  },
  openGraph: {
    type: 'website',
    locale: 'ja_JP',
    url: '/services',
    siteName: 'SHAPE∞D',
    title: TITLE,
    description: DESCRIPTION,
  },
};

export default function ServicesPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[var(--background)] to-black">
      <PageHeader
        title="SERVICES"
        subtitle="商品・サービス — AIプロダクト開発から自己表現コーチングまで、デジタルとヒューマンの両軸で支援します"
        dividerVariant="blue"
      />
      <ServicesContent />
    </main>
  );
}
