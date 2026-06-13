import Hero from '@/components/Hero';
import About from '@/components/About';
import MissionVision from '@/components/MissionVision';
import Navigation from '@/components/Navigation';

const heroTaglineStyle = {
  fontSize: 'clamp(36px, 6vw, 64px)',
  fontFamily: 'serif',
  color: 'white',
  marginBottom: '48px',
  lineHeight: 1.3,
  fontWeight: 300,
  letterSpacing: '0.05em',
  textAlign: 'center' as const,
  maxWidth: '900px',
  marginInline: 'auto',
};

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0A192F] to-black">
      <Navigation />
      <Hero>
        <h1 style={heroTaglineStyle}>
          AIで効率化し、本来の創造に集中する環境を作る。
        </h1>
      </Hero>
      <About />
      <MissionVision />
    </main>
  );
}
