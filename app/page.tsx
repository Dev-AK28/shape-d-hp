import TopShell from '@/components/top/TopShell';
import DeferredTopParticleLoader from '@/components/top/DeferredTopParticleLoader';
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
    // #312/#316: 参照デザイン（hero〜CTA）のみで構成。旧セクション（About / MissionVision /
    // ShowcaseSection）と HomePageShell（cosmic 背景）を撤去し、cosmic / velocity-skew /
    // CustomCursor / PageLoader をトップページで無効化した。
    // #412: パーティクルローダーのみトップで有効化（#312 の「トップはローダーなし」を変更。
    // 下層の PageLoader / SubPageEffects は従来どおり）。
    <TopShell>
      <DeferredTopParticleLoader />
      <main className="relative min-h-screen">
        <TopHero />
        <TopPhilosophy />
        <TopPain />
        <TopTheory />
        <TopServices />
        <TopProcess />
        <TopProfile />
        <TopCta />
      </main>
    </TopShell>
  );
}
