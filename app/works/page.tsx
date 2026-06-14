import WorksContent from '@/components/WorksContent';
import PageHeader from '@/components/ui/PageHeader';

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
