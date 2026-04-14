import Hero from '@/components/Hero';
import About from '@/components/About';
import MissionVision from '@/components/MissionVision';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0A192F] to-black">
      <Hero />
      <About />
      <MissionVision />
    </main>
  );
}
