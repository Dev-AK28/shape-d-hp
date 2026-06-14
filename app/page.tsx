import Hero from '@/components/Hero';
import About from '@/components/About';
import MissionVision from '@/components/MissionVision';

const heroHeadingStyle = {
  fontSize: 'clamp(28px, 5vw, 48px)',
  fontFamily: 'var(--font-serif-jp)',
  color: 'var(--foreground)',
  marginBottom: 'var(--space-2)',
  lineHeight: 1.4,
  fontWeight: 300,
  letterSpacing: '0.04em',
  textAlign: 'center' as const,
};

export default function Home() {
  return (
    <main className="min-h-screen" style={{ background: 'var(--background)' }}>
      <Hero>
        <h1 style={heroHeadingStyle}>
          AIで効率化し、本来の創造に集中する環境を作る。
        </h1>
      </Hero>
      <About />
      <MissionVision />
    </main>
  );
}
