import RainCanvas from '@/components/top/RainCanvas';

/**
 * ヒーローセクション #hero — Issue #304（参照HTML L125-L200, L629-L644, L898-L903）
 *
 * マーク→コピー2行→サブ→スクロールキューの順に、参照HTMLと同じ尺でフェードイン。
 * #326: イントロは globals.css の CSS アニメーションで実装（GSAP から移行）。
 * CSS アニメーションはハイドレーションを待たずに開始されるため FCP/LCP を遅らせず、
 * JS 無効環境でも表示される。尺は lib/design/tokens.ts topHero.intro と
 * css-token-sync テストで同期。
 * reduced-motion 時は globals.css の `.top-scope` フォールバックで全要素が即時表示される。
 */
export default function TopHero() {
  return (
    <section id="hero" className="top-hero">
      <RainCanvas />
      <div className="hero-inner">
        {/* aria-label で「SHAPE インフィニティ D」等の読み上げブレを防ぎ、ブランド名として読ませる */}
        <h1 className="hero-mark" aria-label="SHAPE∞D">
          <span aria-hidden="true">
            SHAPE<span className="inf">∞</span>D
          </span>
        </h1>
        <p className="hero-copy">
          <span className="line">機能だけなら、誰でもつくれる。</span>
          <span className="line">私たちは、想いまで実装する。</span>
        </p>
        <p className="hero-sub">
          SYSTEM / WEB / AI — SELF-CONGRUENCE &times; AI ENGINEERING
        </p>
        <div className="scroll-cue" data-testid="hero-scroll-cue" aria-hidden="true">
          <small>SCROLL</small>
          <div className="drop" />
        </div>
      </div>
    </section>
  );
}
