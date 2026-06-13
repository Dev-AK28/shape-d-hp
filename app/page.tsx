import Hero from '@/components/Hero';
import About from '@/components/About';
import MissionVision from '@/components/MissionVision';
import Navigation from '@/components/Navigation';
import ScrollReveal from '@/components/scroll/ScrollReveal';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0A192F] to-black">
      <Navigation />
      <Hero />
      <ScrollReveal>
        <About />
      </ScrollReveal>
      <ScrollReveal delay={0.1}>
        <MissionVision />
      </ScrollReveal>
    </main>
  );
}
