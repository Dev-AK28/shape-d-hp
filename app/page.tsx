import Hero from '@/components/Hero';
import About from '@/components/About';
import MissionVision from '@/components/MissionVision';
import HomePageShell from '@/components/home/HomePageShell';
import { typographyBlend } from '@/lib/design/tokens';

export default function Home() {
  return (
    <HomePageShell>
      <Hero>
        <h1
          className={`${typographyBlend.classCosmic} text-[clamp(24px,4vw,40px)] type-font-serif-jp font-light leading-[1.55] tracking-[0.04em] text-center text-balance max-w-[var(--content-prose)] mx-auto mb-[var(--space-2)] text-[color:var(--foreground)]`}
          data-testid={typographyBlend.testIdCosmic}
        >
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
