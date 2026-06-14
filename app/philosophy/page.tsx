import PhilosophyContent from '@/components/PhilosophyContent';
import Navigation from '@/components/Navigation';

export default function PhilosophyPage() {
  return (
    <main className="min-h-screen" style={{ background: 'var(--background)' }}>
      <Navigation />
      <h1 className="sr-only">哲学 — SHAPE∞D</h1>
      <PhilosophyContent />
    </main>
  );
}
