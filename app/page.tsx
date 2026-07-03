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
import TopProfile from '@/components/top/TopProfile';
import TopCta from '@/components/top/TopCta';

export default function Home() {
  return (
    // 参照HTMLの各セクション（hero〜CTA）を実装済み（#304〜#311）。
    // 旧セクション（About / MissionVision / Showcase）は参照側で置換済みだが、既存の回帰テストが
    // 結びついているため据え置き、HomePageShell（cosmic 背景）ごとの撤去は #316 / #312 で行う。
    <TopShell>
      <HomePageShell>
        <TopHero />
        <TopPhilosophy />
        <TopPain />
        <TopTheory />
        <TopServices />
        <TopProcess />
        <TopProfile />
        <About />
        <MissionVision />
        <ShowcaseSection />
        <TopCta />
      </HomePageShell>
    </TopShell>
  );
}
