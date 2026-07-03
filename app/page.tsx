import About from '@/components/About';
import MissionVision from '@/components/MissionVision';
import HomePageShell from '@/components/home/HomePageShell';
import ShowcaseSection from '@/components/home/ShowcaseSection';
import TopShell from '@/components/top/TopShell';
import TopHero from '@/components/top/TopHero';
import TopPhilosophy from '@/components/top/TopPhilosophy';
import TopPain from '@/components/top/TopPain';

export default function Home() {
  return (
    // 参照HTMLの各セクションを順次追加中（#304 hero / #305 philosophy / #306 pain）。
    // 残りの既存セクション（About / MissionVision / Showcase）は後続 issue で差し替え・撤去する。
    <TopShell>
      <HomePageShell>
        <TopHero />
        <TopPhilosophy />
        <TopPain />
        <About />
        <MissionVision />
        <ShowcaseSection />
      </HomePageShell>
    </TopShell>
  );
}
