import Hero from '@/components/Hero';
import ServicesContent from '@/components/ServicesContent';
import Navigation from '@/components/Navigation';

export default function ServicesPage() {
  return (
    <main className="min-h-screen" style={{ background: 'var(--background)' }}>
      <Navigation />
      <Hero variant="brand" />
      <ServicesContent />
    </main>
  );
}
