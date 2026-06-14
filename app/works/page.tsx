import Hero from '@/components/Hero';
import WorksContent from '@/components/WorksContent';
import Navigation from '@/components/Navigation';

export default function WorksPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[var(--background)] to-black">
      <Navigation />
      <Hero />
      <WorksContent />
    </main>
  );
}
