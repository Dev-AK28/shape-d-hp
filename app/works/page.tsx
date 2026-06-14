import Hero from '@/components/Hero';
import WorksContent from '@/components/WorksContent';
import Navigation from '@/components/Navigation';

export default function WorksPage() {
  return (
    <main className="min-h-screen" style={{ background: 'var(--background)' }}>
      <Navigation />
      <Hero variant="brand" />
      <WorksContent />
    </main>
  );
}
