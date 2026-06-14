import PhilosophyContent from '@/components/PhilosophyContent';
import Navigation from '@/components/Navigation';

export default function PhilosophyPage() {
  return (
    <main className="min-h-screen" style={{ background: 'var(--background)' }}>
      <Navigation />
      <PhilosophyContent />
    </main>
  );
}
