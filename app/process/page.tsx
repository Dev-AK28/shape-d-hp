import Navigation from '@/components/Navigation';
import ProcessNavigation from '@/components/ProcessNavigation';

export default function ProcessPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[var(--background)] to-black">
      <Navigation />
      <ProcessNavigation />
    </main>
  );
}
