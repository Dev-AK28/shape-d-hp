import About from '@/components/About';
import MissionVision from '@/components/MissionVision';
import HomePageShell from '@/components/home/HomePageShell';
import ShowcaseSection from '@/components/home/ShowcaseSection';
import TopShell from '@/components/top/TopShell';
import TopHero from '@/components/top/TopHero';
import TopPhilosophy from '@/components/top/TopPhilosophy';
import TopPain from '@/components/top/TopPain';
import TopTheory from '@/components/top/TopTheory';
import TopServices from '@/components/top/TopServices';
import TopProcess from '@/components/top/TopProcess';

export default function Home() {
  return (
    // 参照HTMLの各セクションを順次追加中（#304 hero / #305 philosophy / #306 pain / #307 theory / #308 services / #309 process）。
    // 残りの既存セクション（About / MissionVision / Showcase）は後続 issue で差し替え・撤去する。
    <TopShell>
      <HomePageShell>
        <TopHero />
        <TopPhilosophy />
        <TopPain />
        <TopTheory />
        <TopServices />
        <TopProcess />
        <About />
        <MissionVision />
        <ShowcaseSection />
      </HomePageShell>
    </TopShell>
  );
}
