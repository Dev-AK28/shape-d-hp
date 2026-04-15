import Hero from '@/components/Hero';
import ProcessContent from '@/components/ProcessContent';
import Navigation from '@/components/Navigation';

export default function ProcessPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0A192F] to-black">
      <Navigation />
      <Hero />
      <ProcessContent />
    </main>
  );
}
