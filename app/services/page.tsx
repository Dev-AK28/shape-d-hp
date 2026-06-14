import ServicesContent from '@/components/ServicesContent';
import PageHeader from '@/components/ui/PageHeader';

export default function ServicesPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[var(--background)] to-black">
      <PageHeader
        title="SERVICES"
        subtitle="商品・サービス — AIプロダクト開発から自己表現コーチングまで、デジタルとヒューマンの両軸で支援します"
        dividerColor="#60a5fa"
      />
      <ServicesContent />
    </main>
  );
}
