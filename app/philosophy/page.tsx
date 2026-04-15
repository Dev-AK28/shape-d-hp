import Hero from '@/components/Hero';
import PhilosophyContent from '@/components/PhilosophyContent';
import Navigation from '@/components/Navigation';

export default function PhilosophyPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0A192F] to-black">
      <Navigation />
      <Hero />
      <PhilosophyContent />
    </main>
  );
}
