'use client';

import { useGsapContext } from '@/lib/hooks/useGsapContext';
import { gsap } from '@/lib/scroll/gsap-config';
import { topHero } from '@/lib/design/tokens';

const TAGLINE = '商品・サービスは、自己表現のツールである。';

/**
 * PHILOSOPHY セクション #vision — Issue #305（参照HTML L202-L222, L646-L657, L905-L911）
 *
 * タグラインを1文字ずつ span 分割し、ScrollTrigger の scrub でスクロール量に連動して
 * opacity 0.08 → 1 に文字送りする。reduced-motion 時は useGsapContext が setup を実行せず、
 * globals.css の `.top-scope` フォールバックで全文字が即時表示される。
 */
export default function TopPhilosophy() {
  // #vision はページ内で一意のため、useGsapContext 内でグローバルセレクタを用いる（scope ref は不要）。
  useGsapContext(() => {
    const { taglineScrub } = topHero;
    gsap.to('#vision .vision-tagline .w', {
      opacity: 1,
      stagger: taglineScrub.stagger,
      ease: 'none',
      scrollTrigger: {
        trigger: '#vision',
        start: taglineScrub.start,
        end: taglineScrub.end,
        scrub: taglineScrub.scrub,
      },
    });
  });

  return (
    <section id="vision">
      <div className="stage">
        <p className="eyebrow">
          <em>PHILOSOPHY</em>私たちの考え
        </p>
        <h2 className="vision-tagline" aria-label={TAGLINE}>
          {[...TAGLINE].map((ch, i) => (
            // 文字送り演出のための分割。順序固定の静的テキストなので index キーで問題ない。
            <span key={i} className="w" aria-hidden="true">
              {ch}
            </span>
          ))}
        </h2>
        <p className="vision-note">
          人と会社は、同じだと考えています。
          <br />
          想いが伝わる会社は、価格ではなく「らしさ」で選ばれる。
          <br />
          SHAPE∞Dは、その「らしさ」を最大限反映したシステムをつくるエンジニアリングスタジオです。
        </p>
      </div>
    </section>
  );
}
