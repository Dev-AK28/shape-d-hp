import PhilosophyContent from '@/components/PhilosophyContent';

export default function PhilosophyPage() {
  return (
    <main className="min-h-screen" style={{ background: 'var(--background)' }}>
      <h1 className="sr-only">哲学 — SHAPE∞D</h1>
      <PhilosophyContent />
    </main>
  );
}
