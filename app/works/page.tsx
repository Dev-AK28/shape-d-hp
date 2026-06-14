import Hero from '@/components/Hero';
import WorksContent from '@/components/WorksContent';

export default function WorksPage() {
  return (
    <main className="min-h-screen" style={{ background: 'var(--background)' }}>
      <Hero variant="brand" />
      <WorksContent />
    </main>
  );
}
