import Hero from '@/components/Hero';
import ServicesContent from '@/components/ServicesContent';
import Navigation from '@/components/Navigation';

export default function ServicesPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[var(--background)] to-black">
      <Navigation />
      <Hero />
      <ServicesContent />
    </main>
  );
}
