import Hero from '@/components/Hero';
import ServicesContent from '@/components/ServicesContent';

export default function ServicesPage() {
  return (
    <main className="min-h-screen" style={{ background: 'var(--background)' }}>
      <Hero variant="brand" />
      <ServicesContent />
    </main>
  );
}
