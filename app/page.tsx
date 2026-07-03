import About from '@/components/About';
import MissionVision from '@/components/MissionVision';
import HomePageShell from '@/components/home/HomePageShell';
import ShowcaseSection from '@/components/home/ShowcaseSection';
import TopShell from '@/components/top/TopShell';
import TopHero from '@/components/top/TopHero';

export default function Home() {
  return (
    // #304 でヒーローを参照HTMLの #hero へ置換。残りの既存セクションは #305〜#311 で順次差し替える。
    <TopShell>
      <HomePageShell>
        <TopHero />
        <About />
        <MissionVision />
        <ShowcaseSection />
      </HomePageShell>
    </TopShell>
  );
}
