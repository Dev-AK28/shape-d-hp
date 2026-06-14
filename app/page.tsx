import Hero from '@/components/Hero';
import About from '@/components/About';
import MissionVision from '@/components/MissionVision';
import HomePageShell from '@/components/home/HomePageShell';
import { layout, typography } from '@/lib/design/tokens';

const heroHeadingStyle = {
  fontSize: typography.sizePageHeading,
  fontFamily: typography.fontSerifJp,
  color: 'var(--foreground)',
  marginBottom: 'var(--space-2)',
  lineHeight: 1.55,
  fontWeight: 300,
  letterSpacing: '0.04em',
  textAlign: 'center' as const,
  textWrap: 'balance' as const,
  maxWidth: layout.contentProse,
  marginInline: 'auto',
};

export default function Home() {
  return (
    <HomePageShell>
      <Hero>
        <h1 style={heroHeadingStyle}>
          AIで効率化し、
          <br />
          本来の創造に集中する環境を作る。
        </h1>
      </Hero>
      <About />
      <MissionVision />
    </HomePageShell>
  );
}
