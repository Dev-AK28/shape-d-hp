import TopShell from '@/components/top/TopShell';
import TopParticleLoader from '@/components/top/TopParticleLoader';
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
    // #418/#416: ローダーは SSR する（three.js のみ実行時に import）。初期 HTML に
    // オーバーレイが載るため逆順フラッシュが起きず、不透明背景でもヒーローが透けない。
    <TopShell>
      {/* JS 無効環境では framer-motion のフェードが動かず、SSR された不透明オーバーレイが
          ページを覆ったままになる。noscript の style で確実に消す（#418）。 */}
      <noscript>
        <style>{`[data-top-loader]{display:none !important}`}</style>
      </noscript>
      <TopParticleLoader />
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
