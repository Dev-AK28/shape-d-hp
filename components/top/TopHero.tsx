'use client';

import { useLayoutEffect, useRef } from 'react';
import { useReducedMotion } from 'framer-motion';
import RainCanvas from '@/components/top/RainCanvas';
import { useDeviceProfile } from '@/lib/hooks/useDeviceProfile';
import { gsap, registerGsapPlugins } from '@/lib/scroll/gsap-config';
import { topHero } from '@/lib/design/tokens';

/**
 * ヒーローセクション #hero — Issue #304（参照HTML L125-L200, L629-L644, L898-L903）
 *
 * マーク→コピー2行→サブ→スクロールキューの順に、参照HTMLと同じ尺でフェードイン。
 * 参照HTML同様、イントロは reduced-motion のときのみスキップする（低性能端末でも実行）。
 * reduced-motion 時は globals.css の `.top-scope` フォールバックで全要素が即時表示される。
 */
export default function TopHero() {
  const rootRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  // isReady はハイドレーション完了の同期に使用（SSR→CSR で二重初期化しない）
  const { isReady } = useDeviceProfile();

  useLayoutEffect(() => {
    if (!isReady || reduceMotion || !rootRef.current) {
      return;
    }

    registerGsapPlugins();
    const { intro } = topHero;
    const ctx = gsap.context(() => {
      gsap
        .timeline({ defaults: { ease: intro.ease } })
        .to('.hero-mark', { opacity: 1, duration: intro.mark.duration }, intro.mark.at)
        .to(
          '.hero-copy .line',
          { opacity: 1, y: 0, duration: intro.copy.duration, stagger: intro.copy.stagger },
          intro.copy.at,
        )
        .to('.hero-sub', { opacity: 1, duration: intro.sub.duration }, intro.sub.at)
        .to('.scroll-cue', { opacity: 1, duration: intro.cue.duration }, intro.cue.at);
    }, rootRef);

    return () => ctx.revert();
  }, [isReady, reduceMotion]);

  return (
    <section id="hero" ref={rootRef} className="top-hero">
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
